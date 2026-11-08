// V159: the look editor drawn by the CEF page (cefui js/look.js) instead of ImGui.
//
// The server still opens and closes the editor with packet 251 (op Open / Close, LookData.h) and still gets
// "save" / "cancel" / "cam" as the CEF event "look". In between the page and the client talk locally:
//   client -> page  CEF event "lookui" (CCEF::GetEvent, never sent to the server):
//       {t:"open", s, female, opts:[{m,k,skin,label}], saved:hex, draft:hex, kinds:{"1":{...catalog...}}}
//       {t:"draft", s, h}           the draft changed here (model switch, random, reset, invalid edit)
//       {t:"wait", s, on}           saving / the server did not answer
//       {t:"close", s, ok}          the server closed the editor (ok 1: saved)
//   page -> client  nativeSendEvent "lookui" (taken here, not forwarded):
//       {a:"ack"|"draft"|"model"|"random"|"reset"|"rot"|"cam"|"save"|"cancel", s, h, i, d}
// The page answers "ack" to "open"; without it (an old page) the ImGui editor is used after kAckTimeoutMs.
// Prices: the server sends them to the page itself (CEF event "lookshop", gamemode look_system.inc).
#include "Look.h"

#include <cstdio>
#include <cstdlib>
#include <mutex>
#include <string>
#include <vector>

#include "LookCatalog.h"
#include "LookData.h"
#include "LookInternal.h"
#include "../main.h"
#include "../vendor/json.hpp"
#include "../java_systems/cef/CEF.h"

namespace look {

namespace {

using nlohmann::json;
using detail::Editor;
using detail::TheEditor;

constexpr uint32_t kAckTimeoutMs = 3000;

struct PageCmd {
    std::string a, h;
    uint32_t session = 0;
    int i = 0;
    float d = 0.0f;
};

std::mutex g_mutex;
std::vector<PageCmd> g_queue;   // page -> client, drained by Process (game thread)

std::string Str(const json& o, const char* key) {
    const auto it = o.find(key);
    if (it == o.end() || it->is_null()) return {};
    if (it->is_string()) return it->get<std::string>();
    if (it->is_number_integer()) return std::to_string(it->get<long long>());
    if (it->is_number_float()) return std::to_string(static_cast<long long>(it->get<double>()));
    return {};
}

uint32_t RGB(uint32_t rgba) { return rgba >> 8; }

json KindJson(int kind) {
    const CatalogKind& k = kCatalog[kind];
    json j;
    j["label"] = k.label;
    j["skin"] = k.skin;
    json tones = json::array();
    for (int t = 0; t < kTones; ++t) tones.push_back(RGB(k.toneColors[t]));
    j["tones"] = tones;
    j["heads"] = kHeads;
    json slots = json::array();
    for (int s = 0; s < kSlots; ++s) {
        const CatalogSlot& cs = k.slots[s];
        json o;
        o["n"] = kSlotNames[s];
        o["req"] = cs.required ? 1 : 0;
        o["def"] = cs.defaultItem == kNoItem ? -1 : static_cast<int>(cs.defaultItem);
        json groups = json::array();
        for (int g = 0; g < cs.groupCount; ++g) groups.push_back(cs.groups[g]);
        o["g"] = groups;
        json items = json::array();
        for (int i = 0; i < cs.count; ++i) {
            const CatalogItem& it = cs.items[i];
            items.push_back(json::array({it.label, static_cast<int>(it.group), RGB(it.color)}));
        }
        o["it"] = items;
        slots.push_back(o);
    }
    j["slots"] = slots;
    return j;
}

void ToPage(const json& j) {
    CCEF::GetEvent("lookui", j.dump());
}

void SendDraft(const Editor& e) {
    if (!e.open || e.cef == 0) return;
    ToPage(json{{"t", "draft"}, {"s", std::to_string(e.session)}, {"h", ToHex(e.draft)}});
}

void Handle(Editor& e, const PageCmd& c, uint32_t now) {
    if (!e.open || c.session != e.session) return;
    if (c.a == "ack") {
        if (e.cef == 1) Log("Penampilan: editor CEF dipakai (sesi %u)", e.session);
        e.cef = 2;
        return;
    }
    if (e.cef != 2 || e.waiting) {
        if (c.a == "cancel") {   // always allowed
            detail::Send(CancelEvent(e.session));
            detail::EditorClosed();
        }
        return;
    }
    if (c.a == "draft" || c.a == "save") {
        Look l;
        if (!FromHex(c.h, l) || l.model != e.draft.model || l.kind != e.draft.kind || l.skin != e.draft.skin) {
            SendDraft(e);   // the page is out of step: it gets the client's draft back
            return;
        }
        if (l != e.draft) {
            e.draft = l;
            detail::DraftChanged();
        }
        if (c.a == "save") {
            detail::Send(SaveEvent(e.session, e.draft));
            e.waiting = true;
            e.waitingSince = now;
            ToPage(json{{"t", "wait"}, {"s", std::to_string(e.session)}, {"on", 1}});
        }
        return;
    }
    if (c.a == "model") {
        if (c.i < 0 || c.i >= static_cast<int>(e.options.size())) return;
        const ModelOption& o = e.options[c.i];
        if (o.model && o.kind != e.draft.kind) e.draft = Convert(e.draft, o.kind);
        e.draft.model = o.model;
        e.draft.skin = o.skin;
        detail::DraftChanged();
        SendDraft(e);
        return;
    }
    if (c.a == "random") {
        detail::RandomizeDraft();
        SendDraft(e);
        return;
    }
    if (c.a == "reset") {
        e.draft = e.saved;
        detail::DraftChanged();
        SendDraft(e);
        return;
    }
    if (c.a == "rot") {
        if (c.d > -361.0f && c.d < 361.0f) detail::Rotate(c.d);
        return;
    }
    if (c.a == "cam") {
        if (c.i >= 0 && c.i <= 2) {
            e.view = c.i;
            detail::Send(CameraEvent(e.session, c.i));
        }
        return;
    }
    if (c.a == "cancel") {
        detail::Send(CancelEvent(e.session));
        detail::EditorClosed();
    }
}

}  // namespace

void OnPageEvent(const std::string& wrapped) {
    const json root = json::parse(wrapped, nullptr, false);
    if (root.is_discarded() || !root.is_object()) return;
    // CefManager.kt wraps every page event: {"event": "...", "data": {...}}.
    const auto it = root.find("data");
    const json& d = (it != root.end() && it->is_object()) ? *it : root;
    PageCmd c;
    c.a = Str(d, "a");
    c.h = Str(d, "h");
    c.session = static_cast<uint32_t>(std::strtoul(Str(d, "s").c_str(), nullptr, 10));
    c.i = std::atoi(Str(d, "i").c_str());
    c.d = static_cast<float>(std::atof(Str(d, "d").c_str()));
    if (c.a.empty() || c.a.size() > 12 || c.h.size() > kLookBytes * 2) return;
    std::lock_guard<std::mutex> lock(g_mutex);
    if (g_queue.size() < 64) g_queue.push_back(std::move(c));
}

namespace detail {

void CefOpen() {
    Editor& e = TheEditor();
    {
        std::lock_guard<std::mutex> lock(g_mutex);
        g_queue.clear();
    }
    e.cef = 1;
    e.cefSince = GetTickCount();
    json j;
    j["t"] = "open";
    j["s"] = std::to_string(e.session);
    j["female"] = e.female ? 1 : 0;
    json opts = json::array();
    json kinds = json::object();
    for (const ModelOption& o : e.options) {
        char label[64];
        if (o.model) std::snprintf(label, sizeof label, "Kustom %s", kCatalog[o.kind].label);
        else std::snprintf(label, sizeof label, "Skin biasa (ID %u)", o.skin);
        opts.push_back(json{{"m", o.model}, {"k", o.kind}, {"skin", o.skin}, {"label", label}});
        if (ModularKind(o.kind) && !kinds.contains(std::to_string(o.kind))) kinds[std::to_string(o.kind)] = KindJson(o.kind);
    }
    if (ModularKind(e.draft.kind) && !kinds.contains(std::to_string(e.draft.kind)))
        kinds[std::to_string(e.draft.kind)] = KindJson(e.draft.kind);
    j["opts"] = opts;
    j["kinds"] = kinds;
    j["saved"] = ToHex(e.saved);
    j["draft"] = ToHex(e.draft);
    j["hmin"] = kMinHeight;
    j["hmax"] = kMaxHeight;
    j["wmin"] = kMinWeight;
    j["wmax"] = kMaxWeight;
    ToPage(j);
}

void CefClosed(uint32_t session, int result) {
    Editor& e = TheEditor();
    if (e.cef == 0) return;
    e.cef = 0;
    ToPage(json{{"t", "close"}, {"s", std::to_string(session)}, {"ok", result ? 1 : 0}});
}

void CefProcess(uint32_t now) {
    std::vector<PageCmd> cmds;
    {
        std::lock_guard<std::mutex> lock(g_mutex);
        cmds.swap(g_queue);
    }
    Editor& e = TheEditor();
    for (const PageCmd& c : cmds) Handle(e, c, now);
    if (!e.open) return;
    if (e.cef == 1 && now - e.cefSince > kAckTimeoutMs) {
        // An old page without look.js: the ImGui editor.
        e.cef = 0;
        Log("Penampilan: halaman CEF tidak menjawab, editor ImGui dipakai");
    }
    if (e.cef == 2 && e.waitNotified != e.waiting) {
        e.waitNotified = e.waiting;
        if (!e.waiting) ToPage(json{{"t", "wait"}, {"s", std::to_string(e.session)}, {"on", 0}});
    }
}

}  // namespace detail

}  // namespace look
