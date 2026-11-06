// The editor of the local player's look (ImGui, drawn by CGUI::Render). The server opens it (op Open) with the
// saved look and the models on offer; every change is shown on the local ped at once; "Simpan" sends the look
// to the server, which checks it, saves it, puts the skin on and sends it to everyone (LookData.h).
#include "Look.h"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <iterator>

#include "LookCatalog.h"
#include "LookData.h"
#include "LookInternal.h"
#include "../main.h"
#include "../gui/gui.h"
#include "../game/game.h"
#include "../net/netgame.h"
#include "../game/Entity/Ped/Ped.h"

namespace look {

namespace {

using detail::Editor;
using detail::TheEditor;

enum Tab { kCharacter = 0, kClothesTab = 1, kAccessories = 2, kTattoos = 3, kBody = 4, kTabs = 5 };
const char* const kTabNames[kTabs] = {"Karakter", "Pakaian", "Aksesoris", "Tato", "Badan"};
const int kClothesSlots[] = {kShirt, kPants, kShoes, kVest, kBelt};
const int kAccessorySlots[] = {kHat, kGlasses, kMask, kNecklace, kWatch, kEarring, kBag};

const ImU32 kPanel = IM_COL32(18, 20, 26, 230);
const ImU32 kValueBox = IM_COL32(40, 44, 56, 255);
const ImU32 kAccent = IM_COL32(255, 196, 64, 255);
const ImU32 kMuted = IM_COL32(170, 176, 190, 255);

float U() {
    return ImGui::GetFontSize();
}

// A button that does not fire when the finger was dragging (scrolling the list).
bool Tap(const char* label, const ImVec2& size) {
    const bool pressed = ImGui::Button(label, size);
    return pressed && !ImGui::IsMouseDragPastThreshold(ImGuiMouseButton_Left, U() * 0.6f);
}

void Caption(const char* text, ImU32 color = kMuted) {
    ImGui::PushStyleColor(ImGuiCol_Text, color);
    ImGui::TextWrapped("%s", text);
    ImGui::PopStyleColor();
}

ImU32 Rgba(uint32_t c) {
    return IM_COL32((c >> 24) & 255, (c >> 16) & 255, (c >> 8) & 255, 255);
}

// "<  value  >": -1, 0 or +1. `swatch`: a colour square before the value (0: none).
int Stepper(const char* id, const char* name, const char* value, uint32_t swatch = 0) {
    int step = 0;
    if (name) Caption(name);
    ImGui::PushID(id);
    const float h = U() * 1.7f, bw = U() * 2.3f;
    const float spacing = ImGui::GetStyle().ItemSpacing.x;
    const float boxW = std::max(U(), ImGui::GetContentRegionAvail().x - 2.0f * bw - 2.0f * spacing);
    if (Tap("<", ImVec2(bw, h))) step = -1;
    ImGui::SameLine();
    const ImVec2 p = ImGui::GetCursorScreenPos();
    ImDrawList* dl = ImGui::GetWindowDrawList();
    dl->AddRectFilled(p, ImVec2(p.x + boxW, p.y + h), kValueBox, U() * 0.25f);
    float left = U() * 0.3f;
    if (swatch) {
        const float sq = h * 0.6f;
        dl->AddRectFilled(ImVec2(p.x + left, p.y + (h - sq) * 0.5f), ImVec2(p.x + left + sq, p.y + (h + sq) * 0.5f),
                          Rgba(swatch), U() * 0.15f);
        left += sq + U() * 0.3f;
    }
    const ImVec2 ts = ImGui::CalcTextSize(value);
    const ImVec2 tp(p.x + std::max(left, (boxW - ts.x) * 0.5f), p.y + (h - ts.y) * 0.5f);
    dl->PushClipRect(ImVec2(p.x + U() * 0.2f, p.y), ImVec2(p.x + boxW - U() * 0.2f, p.y + h), true);
    dl->AddText(tp, IM_COL32_WHITE, value);
    dl->PopClipRect();
    ImGui::Dummy(ImVec2(boxW, h));
    ImGui::SameLine();
    if (Tap(">", ImVec2(bw, h))) step = 1;
    ImGui::PopID();
    ImGui::Dummy(ImVec2(1.0f, U() * 0.25f));
    return step;
}

const CatalogKind& KindOf(const Editor& e) {
    return kCatalog[ModularKind(e.draft.kind) ? e.draft.kind : kKindMale];
}

void Changed() {
    detail::DraftChanged();
}

// The first item of a group.
uint16_t FirstOf(const CatalogSlot& s, int group) {
    for (uint16_t i = 0; i < s.count; ++i) {
        if (s.items[i].group == group) return i;
    }
    return kNoItem;
}

// One slot: with several types (groups) a type row and an item row, else one row over every item. Optional
// slots go through "nothing" (hair: bald).
void SlotRow(Editor& e, int slot) {
    const CatalogSlot& s = KindOf(e).slots[slot];
    if (!s.count) return;
    uint16_t& cur = e.draft.items[slot];
    if (cur != kNoItem && cur >= s.count) cur = s.required ? s.defaultItem : kNoItem;
    const char* none = slot == kHair ? "Botak" : "Tidak ada";
    char id[16], value[96];
    if (s.groupCount <= 1) {
        // [nothing] + items
        const int n = s.count + (s.required ? 0 : 1);
        int pos = s.required ? cur : (cur == kNoItem ? 0 : cur + 1);
        if (cur == kNoItem) std::snprintf(value, sizeof value, "%s", none);
        else std::snprintf(value, sizeof value, "%s  (%d/%d)", s.items[cur].label, cur + 1, s.count);
        std::snprintf(id, sizeof id, "s%d", slot);
        if (const int step = Stepper(id, kSlotNames[slot], value)) {
            pos = (pos + step + n) % n;
            cur = s.required ? static_cast<uint16_t>(pos) : (pos == 0 ? kNoItem : static_cast<uint16_t>(pos - 1));
            Changed();
        }
        return;
    }
    // Type: [nothing] + groups.
    const int types = s.groupCount + (s.required ? 0 : 1);
    const int group = cur == kNoItem ? -1 : s.items[cur].group;
    int tpos = s.required ? group : group + 1;
    if (tpos < 0) tpos = 0;
    std::snprintf(value, sizeof value, "%s", group < 0 ? none : s.groups[group]);
    std::snprintf(id, sizeof id, "t%d", slot);
    if (const int step = Stepper(id, kSlotNames[slot], value)) {
        tpos = (tpos + step + types) % types;
        const int g = s.required ? tpos : tpos - 1;
        cur = g < 0 ? kNoItem : FirstOf(s, g);
        Changed();
    }
    if (cur == kNoItem) return;
    // Item within its type.
    const int g = s.items[cur].group;
    int count = 0, index = 0;
    for (uint16_t i = 0; i < s.count; ++i) {
        if (s.items[i].group != g) continue;
        if (i == cur) index = count;
        ++count;
    }
    const char* label = s.items[cur].label;
    const size_t prefix = std::strlen(s.groups[g]);
    if (std::strncmp(label, s.groups[g], prefix) == 0 && label[prefix] == ' ') label += prefix + 1;
    std::snprintf(value, sizeof value, "%s  (%d/%d)", label, index + 1, count);
    std::snprintf(id, sizeof id, "i%d", slot);
    if (const int step = Stepper(id, nullptr, value)) {
        const int want = (index + step + count) % count;
        int k = 0;
        for (uint16_t i = 0; i < s.count; ++i) {
            if (s.items[i].group != g) continue;
            if (k++ == want) {
                cur = i;
                break;
            }
        }
        Changed();
    }
}

void OptionLabel(const ModelOption& o, char* out, size_t size) {
    if (o.model) std::snprintf(out, size, "Kustom %s", kCatalog[o.kind].label);
    else std::snprintf(out, size, "Skin biasa (ID %u)", o.skin);
}

void ModelRow(Editor& e) {
    if (e.options.empty()) return;
    int pos = 0;
    for (size_t i = 0; i < e.options.size(); ++i) {
        const ModelOption& o = e.options[i];
        if (o.model == e.draft.model && (o.model == 0 || o.kind == e.draft.kind)) pos = static_cast<int>(i);
    }
    char value[64];
    OptionLabel(e.options[pos], value, sizeof value);
    if (const int step = Stepper("model", "Model", value)) {
        const int n = static_cast<int>(e.options.size());
        const ModelOption& o = e.options[(pos + step + n) % n];
        if (o.model && o.kind != e.draft.kind) e.draft = Convert(e.draft, o.kind);
        e.draft.model = o.model;
        e.draft.skin = o.skin;
        Changed();
    }
}

void OnlyCustom() {
    ImGui::Dummy(ImVec2(1.0f, U() * 0.4f));
    Caption("Skin biasa: hanya tinggi dan berat badan yang berubah.", kAccent);
    Caption("Pilih model \"Kustom\" di tab Karakter untuk baju, rambut, wajah dan tato.");
}

void CharacterTab(Editor& e) {
    ModelRow(e);
    if (!e.draft.modular()) {
        OnlyCustom();
        return;
    }
    const CatalogKind& k = KindOf(e);
    char value[48];
    std::snprintf(value, sizeof value, "Warna %d/%d", e.draft.tone + 1, kTones);
    if (const int step = Stepper("tone", "Warna kulit", value, k.toneColors[std::min<int>(e.draft.tone, kTones - 1)])) {
        e.draft.tone = static_cast<uint8_t>((e.draft.tone + step + kTones) % kTones);
        Changed();
    }
    std::snprintf(value, sizeof value, "Wajah %d/%d", e.draft.head + 1, kHeads);
    if (const int step = Stepper("head", "Bentuk wajah", value)) {
        e.draft.head = static_cast<uint8_t>((e.draft.head + step + kHeads) % kHeads);
        Changed();
    }
    for (const int slot : {kHair, kBeard, kMakeup, kEyebrow}) SlotRow(e, slot);
}

void SlotsTab(Editor& e, const int* slots, size_t n) {
    if (!e.draft.modular()) {
        OnlyCustom();
        return;
    }
    for (size_t i = 0; i < n; ++i) SlotRow(e, slots[i]);
}

void TattooTab(Editor& e) {
    if (!e.draft.modular()) {
        OnlyCustom();
        return;
    }
    for (int slot = kFirstTattoo; slot <= kLastTattoo; ++slot) SlotRow(e, slot);
    Caption("Tato yang tertutup baju tidak terlihat.");
}

void BodySlider(const char* id, const char* name, int& value, int lo, int hi, const char* format) {
    Caption(name);
    ImGui::PushID(id);
    const float h = U() * 1.7f, bw = U() * 2.3f;
    const float spacing = ImGui::GetStyle().ItemSpacing.x;
    int v = value;
    if (Tap("-", ImVec2(bw, h))) v = std::max(lo, v - 1);
    ImGui::SameLine();
    ImGui::PushItemWidth(std::max(U(), ImGui::GetContentRegionAvail().x - bw - spacing));
    ImGui::PushStyleVar(ImGuiStyleVar_FramePadding, ImVec2(U() * 0.3f, (h - U()) * 0.5f));
    ImGui::PushStyleVar(ImGuiStyleVar_GrabMinSize, U() * 1.2f);
    ImGui::SliderInt("##v", &v, lo, hi, format, ImGuiSliderFlags_AlwaysClamp);
    ImGui::PopStyleVar(2);
    ImGui::PopItemWidth();
    ImGui::SameLine();
    if (Tap("+", ImVec2(bw, h))) v = std::min(hi, v + 1);
    ImGui::PopID();
    ImGui::Dummy(ImVec2(1.0f, U() * 0.35f));
    if (v != value) {
        value = v;
        Changed();
    }
}

void BodyTab(Editor& e) {
    int height = e.draft.height, weight = e.draft.weight;
    BodySlider("h", "Tinggi badan", height, kMinHeight, kMaxHeight, "%d cm");
    BodySlider("w", "Berat badan", weight, kMinWeight, kMaxWeight, "%d kg");
    e.draft.height = static_cast<uint8_t>(height);
    e.draft.weight = static_cast<uint8_t>(weight);
    const float m = height / 100.0f;
    char line[96];
    std::snprintf(line, sizeof line, "BMI %.1f", weight / (m * m));
    Caption(line);
}

uint16_t Pick(const CatalogSlot& s, int chance) {
    if (!s.count) return kNoItem;
    if (!s.required && std::rand() % 100 >= chance) return kNoItem;
    return static_cast<uint16_t>(std::rand() % s.count);
}

void Randomize(Editor& e) {
    if (!e.draft.modular()) return;
    const CatalogKind& k = KindOf(e);
    e.draft.tone = static_cast<uint8_t>(std::rand() % kTones);
    e.draft.head = static_cast<uint8_t>(std::rand() % kHeads);
    const struct {
        int slot, chance;
    } chances[] = {{kHair, 92}, {kBeard, 45}, {kMakeup, 40}, {kEyebrow, 100}, {kShirt, 90}, {kPants, 100},
                   {kShoes, 90}, {kHat, 30}, {kGlasses, 25}, {kMask, 5}, {kNecklace, 25}, {kWatch, 30},
                   {kEarring, 20}, {kBag, 15}, {kVest, 50}, {kBelt, 50}};
    for (const auto& c : chances) e.draft.items[c.slot] = Pick(k.slots[c.slot], c.chance);
    for (int slot = kFirstTattoo; slot <= kLastTattoo; ++slot) e.draft.items[slot] = Pick(k.slots[slot], 12);
    Changed();
}

void Footer(Editor& e) {
    const float spacing = ImGui::GetStyle().ItemSpacing.x;
    const float w3 = (ImGui::GetContentRegionAvail().x - 2.0f * spacing) / 3.0f;
    const ImVec2 size(w3, U() * 1.8f);
    ImGui::BeginDisabled(e.waiting);
    if (Tap("Acak", size)) Randomize(e);
    ImGui::SameLine();
    if (Tap("Putar", size)) detail::Rotate(45.0f);
    ImGui::SameLine();
    static const char* const kViews[] = {"Kamera: badan", "Kamera: wajah", "Kamera: kaki"};
    if (Tap(kViews[std::clamp(e.view, 0, 2)], size)) {
        e.view = (e.view + 1) % 3;
        detail::Send(CameraEvent(e.session, e.view));
    }
    if (Tap("Reset", size)) {
        e.draft = e.saved;
        Changed();
    }
    ImGui::SameLine();
    if (Tap("Batal", size)) {
        detail::Send(CancelEvent(e.session));
        detail::EditorClosed();
    }
    ImGui::SameLine();
    ImGui::PushStyleColor(ImGuiCol_Button, IM_COL32(46, 160, 90, 255));
    ImGui::PushStyleColor(ImGuiCol_ButtonHovered, IM_COL32(56, 180, 100, 255));
    ImGui::PushStyleColor(ImGuiCol_ButtonActive, IM_COL32(36, 140, 80, 255));
    if (Tap(e.waiting ? "Menyimpan..." : "Simpan", size) && Valid(e.draft)) {
        detail::Send(SaveEvent(e.session, e.draft));
        e.waiting = true;
        e.waitingSince = GetTickCount();
    }
    ImGui::PopStyleColor(3);
    ImGui::EndDisabled();
}

}  // namespace

namespace detail {
void RandomizeDraft() { Randomize(TheEditor()); }
}  // namespace detail

void RenderEditor() {
    Editor& e = TheEditor();
    if (!e.open || e.cef != 0) return;   // V159: drawn by the CEF page (LookCef.cpp)
    const ImGuiIO& io = ImGui::GetIO();
    const float W = io.DisplaySize.x, H = io.DisplaySize.y;
    if (W <= 0.0f || H <= 0.0f) return;
    const float w = std::min(W * 0.44f, U() * 24.0f), h = H * 0.9f;
    e.x = W * 0.02f;
    e.y = H * 0.05f;
    e.w = w;
    e.h = h;
    ImGui::SetNextWindowPos(ImVec2(e.x, e.y), ImGuiCond_Always);
    ImGui::SetNextWindowSize(ImVec2(w, h), ImGuiCond_Always);
    ImGui::PushStyleColor(ImGuiCol_WindowBg, kPanel);
    ImGui::PushStyleVar(ImGuiStyleVar_WindowRounding, U() * 0.4f);
    ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(U() * 0.6f, U() * 0.5f));
    const ImGuiWindowFlags flags = ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoMove |
                                   ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoSavedSettings |
                                   ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoScrollWithMouse;
    if (ImGui::Begin("##look_editor", nullptr, flags)) {
        Caption("PENAMPILAN", kAccent);
        // Tabs: two rows (3 + 2) so the names fit on a phone.
        const float spacing = ImGui::GetStyle().ItemSpacing.x;
        const float full = ImGui::GetContentRegionAvail().x;
        const float tw3 = (full - 2.0f * spacing) / 3.0f, tw2 = (full - spacing) / 2.0f;
        for (int t = 0; t < kTabs; ++t) {
            if (t != 0 && t != 3) ImGui::SameLine();
            const bool active = e.tab == t;
            if (active) ImGui::PushStyleColor(ImGuiCol_Button, IM_COL32(200, 150, 40, 255));
            if (Tap(kTabNames[t], ImVec2(t < 3 ? tw3 : tw2, U() * 1.5f))) e.tab = t;
            if (active) ImGui::PopStyleColor();
        }
        ImGui::Dummy(ImVec2(1.0f, U() * 0.3f));
        // The rows, scrolled by dragging (not on the body tab: its sliders are dragged).
        const float footer = U() * 4.2f;
        ImGui::BeginChild("##rows", ImVec2(0.0f, std::max(U() * 4.0f, ImGui::GetContentRegionAvail().y - footer)),
                          false, ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoScrollWithMouse);
        if (e.tab != kBody && ImGui::IsWindowHovered(ImGuiHoveredFlags_AllowWhenBlockedByActiveItem) &&
            ImGui::IsMouseDragging(ImGuiMouseButton_Left, U() * 0.4f)) {
            ImGui::SetScrollY(ImGui::GetScrollY() - io.MouseDelta.y);
        }
        ImGui::BeginDisabled(e.waiting);
        switch (e.tab) {
            case kCharacter: CharacterTab(e); break;
            case kClothesTab: SlotsTab(e, kClothesSlots, std::size(kClothesSlots)); break;
            case kAccessories: SlotsTab(e, kAccessorySlots, std::size(kAccessorySlots)); break;
            case kTattoos: TattooTab(e); break;
            default: BodyTab(e); break;
        }
        ImGui::EndDisabled();
        ImGui::EndChild();
        Footer(e);
    }
    ImGui::End();
    ImGui::PopStyleVar(2);
    ImGui::PopStyleColor();
}

}  // namespace look
