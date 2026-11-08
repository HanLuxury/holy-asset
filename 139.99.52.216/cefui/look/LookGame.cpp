// The look system in the game (Look.h): looks received from the server, the modular characters drawn per ped,
// and the body of every player.
#include "Look.h"

#include <sys/stat.h>

#include <algorithm>
#include <cmath>
#include <condition_variable>
#include <cstdio>
#include <cstring>
#include <deque>
#include <mutex>
#include <thread>
#include <unordered_map>
#include <vector>

#include "LookCatalog.h"
#include "LookData.h"
#include "LookDress.h"
#include "LookInternal.h"
#include "../main.h"
#include "../game/game.h"
#include "../game/RW/rwcore.h"
#include "../game/RW/rpworld.h"
#include "../game/RW/rphanim.h"
#include "../game/RwHelper.h"
#include "../net/netgame.h"
#include "../game/Entity/Ped/Ped.h"
#include "../java_systems/cef/CEF.h"
#include "../util/patch.h"
#include "../modloader/HookScope.h"
#include "../vendor/imgui/stb_image.h"   // the implementation is in main.cpp

namespace look {

namespace detail {

Editor& TheEditor() {
    static Editor editor;
    return editor;
}

CPedSamp* LocalPed() {
    CPedSamp* ped = CLocalPlayer::GetPlayerPed();
    return ped && ped->m_pPed ? ped : nullptr;
}

void Send(const std::string& text) {
    CCEF::SendEvent("look", text);
}

}  // namespace detail

#if VER_x32

void InstallHooks() {}
void Receive(const uint8_t*, size_t) {}
void Forget(uint16_t) {}
void Reset() {}
void Process() {}
bool ApplyBody(uint16_t, CPedSamp*) { return false; }
std::string Status() { return "penampilan: tidak dipakai (32-bit)"; }
namespace detail {
void DraftChanged() {}
void EditorClosed() {}
void Rotate(float) {}
}  // namespace detail

#else

namespace {

using detail::Editor;
using detail::TheEditor;

constexpr uint32_t kSaveTimeoutMs = 8000;      // no answer to "save": the editor works again
constexpr float kRootAboveFeet = 1.0f;         // a ped's position is about this far above its feet
constexpr int kUploadsPerFrame = 2;            // decoded textures made into game textures per frame
constexpr uint32_t kTextureIdleMs = 90000;     // a texture no ped has used this long is freed
constexpr uint32_t kQueueWantedMs = 1500;      // a queued texture no ped asked for this long is not loaded
constexpr size_t kTextureBudget = 200;         // more loaded textures: the longest unused (10 s+) go first
constexpr uint32_t kModelForgetMs = 60000;     // a model no ped had this long is forgotten

// ---------------------------------------------------------------------------------------------------------
// Textures: TESTLIT/clothes/<path> (PNG or JPEG), decoded on a thread of their own, made into game textures in
// the game's update. Shared by every ped that wears them. While a texture loads its average colour is drawn.

const std::string& Root() {
    static std::string root;
    static bool tried = false;
    if (tried) return root;
    tried = true;
    std::vector<std::string> candidates;
    if (g_pszStorage && *g_pszStorage) candidates.push_back(std::string(g_pszStorage) + "clothes/");
    candidates.push_back("/storage/emulated/0/TESTLIT/clothes/");
    candidates.push_back("/sdcard/TESTLIT/clothes/");
    for (const std::string& c : candidates) {
        struct stat st {};
        if (stat((c + "7").c_str(), &st) == 0 && S_ISDIR(st.st_mode)) {
            root = c;
            break;
        }
    }
    if (root.empty()) Log("Penampilan: folder tekstur TESTLIT/clothes/ tidak ada, pakaian digambar warna saja");
    else Log("Penampilan: tekstur dari %s", root.c_str());
    return root;
}

struct Decoded {
    std::string path;
    std::vector<uint8_t> rgba;
    int width = 0, height = 0;
};

struct Worker {
    std::mutex mutex;
    std::condition_variable wake;
    std::deque<std::string> todo;
    std::deque<Decoded> done;
};
Worker* g_worker = nullptr;   // never freed: its thread runs until the game ends

void WorkerLoop(Worker* w, std::string root) {
    for (;;) {
        std::string path;
        {
            std::unique_lock<std::mutex> lock(w->mutex);
            w->wake.wait(lock, [w] { return !w->todo.empty(); });
            path = std::move(w->todo.front());
            w->todo.pop_front();
        }
        Decoded d;
        d.path = path;
        int channels = 0;
        uint8_t* pixels = stbi_load((root + path).c_str(), &d.width, &d.height, &channels, 4);
        if (pixels && d.width > 0 && d.height > 0 && d.width <= 4096 && d.height <= 4096) {
            try {
                d.rgba.assign(pixels, pixels + static_cast<size_t>(d.width) * static_cast<size_t>(d.height) * 4);
            } catch (...) {
                d.rgba.clear();
            }
        }
        if (pixels) stbi_image_free(pixels);
        std::lock_guard<std::mutex> lock(w->mutex);
        w->done.push_back(std::move(d));
    }
}

enum class TexState : uint8_t { Idle, Queued, Ready, Failed };
struct Texture {
    RwTexture* texture = nullptr;
    TexState state = TexState::Idle;
    uint32_t lastUse = 0;
};
std::unordered_map<std::string, Texture> g_textures;   // the game's thread only
std::unordered_map<uint32_t, RwTexture*> g_colors;
uint32_t g_generation = 1;   // +1 whenever a texture is ready
uint32_t g_loaded = 0, g_failed = 0, g_freed = 0;

RwTexture* MakeTexture(const uint8_t* rgba, int width, int height, const char* name) {
    if (!rgba || width <= 0 || height <= 0 || !RwRasterCreate || !RwRasterLock || !RwRasterUnlock ||
        !RwRasterDestroy) {
        return nullptr;
    }
    RwRaster* raster = RwRasterCreate(width, height, 32, static_cast<int>(rwRASTERTYPETEXTURE) | static_cast<int>(rwRASTERFORMAT8888));
    if (!raster) return nullptr;
    bool copied = false;
    const size_t row = static_cast<size_t>(width) * 4;
    if (raster->depth == 32 && raster->width == width && raster->height == height && raster->stride > 0 &&
        static_cast<size_t>(raster->stride) >= row) {
        if (uint8_t* pixels = RwRasterLock(raster, 0, rwRASTERLOCKWRITE)) {
            for (int y = 0; y < height; ++y) {
                std::memcpy(pixels + static_cast<size_t>(y) * raster->stride, rgba + static_cast<size_t>(y) * row, row);
            }
            copied = true;
            RwRasterUnlock(raster);
        }
    }
    RwTexture* texture = copied ? RwTextureCreate(raster) : nullptr;
    if (!texture) {
        RwRasterDestroy(raster);
        return nullptr;
    }
    std::snprintf(texture->name, sizeof texture->name, "%s", name);
    texture->filterAddressing = (rwTEXTUREADDRESSWRAP << 12) | (rwTEXTUREADDRESSWRAP << 8) | rwFILTERLINEAR;
    return texture;
}

RwTexture* ColorTexture(uint32_t rgba) {
    rgba |= 0xFF;   // opaque
    const auto it = g_colors.find(rgba);
    if (it != g_colors.end()) return it->second;
    const uint8_t px[4] = {static_cast<uint8_t>(rgba >> 24), static_cast<uint8_t>(rgba >> 16),
                           static_cast<uint8_t>(rgba >> 8), 0xFF};
    RwTexture* t = MakeTexture(px, 1, 1, "lookcolor");
    g_colors[rgba] = t;   // a failure is kept too: not tried every frame
    return t;
}

// The texture of `path` when it is loaded, else nullptr; asks for it. `pending`: it may come later.
Texture* Want(const char* path, uint32_t now, bool& pending) {
    if (!path || !*path || Root().empty()) return nullptr;
    Texture& t = g_textures[path];
    t.lastUse = now;
    switch (t.state) {
        case TexState::Ready:
            return &t;
        case TexState::Failed:
            return nullptr;
        case TexState::Queued:
            pending = true;
            return nullptr;
        case TexState::Idle:
            break;
    }
    if (!g_worker) {
        g_worker = new (std::nothrow) Worker();
        if (!g_worker) return nullptr;
        try {
            std::thread(WorkerLoop, g_worker, Root()).detach();
        } catch (...) {
            delete g_worker;
            g_worker = nullptr;
            return nullptr;
        }
    }
    {
        std::lock_guard<std::mutex> lock(g_worker->mutex);
        g_worker->todo.emplace_back(path);
    }
    g_worker->wake.notify_one();
    t.state = TexState::Queued;
    pending = true;
    return nullptr;
}

void PumpTextures(uint32_t now) {
    if (!g_worker) return;
    std::deque<Decoded> ready;
    {
        std::lock_guard<std::mutex> lock(g_worker->mutex);
        for (int i = 0; i < kUploadsPerFrame && !g_worker->done.empty(); ++i) {
            ready.push_back(std::move(g_worker->done.front()));
            g_worker->done.pop_front();
        }
        // Not wanted any more (the editor went past it): back to idle, not loaded.
        for (auto it = g_worker->todo.begin(); it != g_worker->todo.end();) {
            auto t = g_textures.find(*it);
            if (t != g_textures.end() && now - t->second.lastUse > kQueueWantedMs) {
                t->second.state = TexState::Idle;
                it = g_worker->todo.erase(it);
            } else {
                ++it;
            }
        }
    }
    for (Decoded& d : ready) {
        auto it = g_textures.find(d.path);
        if (it == g_textures.end() || it->second.state != TexState::Queued) continue;
        Texture& t = it->second;
        t.texture = d.rgba.empty() ? nullptr : MakeTexture(d.rgba.data(), d.width, d.height, "look");
        t.state = t.texture ? TexState::Ready : TexState::Failed;
        if (t.texture) ++g_loaded;
        else {
            ++g_failed;
            if (g_failed <= 8) Log("Penampilan: tekstur %s%s tidak bisa dibaca", Root().c_str(), d.path.c_str());
        }
        ++g_generation;
    }
}

// Textures no ped has used for a while are freed (never one a plan still holds: those are used every frame).
void FreeTextures(uint32_t now) {
    size_t loaded = 0;
    for (const auto& [path, t] : g_textures) loaded += t.state == TexState::Ready ? 1 : 0;
    const uint32_t idle = loaded > kTextureBudget ? 10000 : kTextureIdleMs;
    for (auto it = g_textures.begin(); it != g_textures.end();) {
        Texture& t = it->second;
        if (t.state == TexState::Ready && now - t.lastUse > idle) {
            if (t.texture && RwTextureDestroy) RwTextureDestroy(t.texture);
            ++g_freed;
            it = g_textures.erase(it);
        } else if (t.state != TexState::Queued && t.state != TexState::Ready && now - t.lastUse > kTextureIdleMs) {
            it = g_textures.erase(it);   // failed or idle: tried again when wanted again
        } else {
            ++it;
        }
    }
}

// ---------------------------------------------------------------------------------------------------------
// Models: a ped model's geometry, its materials and what each is (LookDress.h). The models' own textures are
// 1x1 and transparent; every material is made invisible (alpha 0: the render callback skips it) and a ped of the
// model shows the materials its plan draws, only while it is drawn.

struct Plan {
    RpGeometry* geometry = nullptr;
    uint32_t serial = 0;    // the Geo it was made for (its material pointers)
    uint64_t key = 0;
    bool pending = false;   // a texture is still loading: built again when one is ready
    std::vector<std::pair<RpMaterial*, RwTexture*>> draws;
    std::vector<Texture*> uses;
};

struct Geo {
    RpMaterial** materials = nullptr;
    int count = 0;
    uintptr_t sum = 0;
    bool modular = false;
    Model model;
    uint32_t serial = 0;   // new for every (re)built model: plans of an older one are not used
    uint32_t seen = 0;
    Plan defaults;   // a ped of this model without a look: the kind's defaults
};
std::unordered_map<RpGeometry*, Geo> g_geos;
uint32_t g_now = 0;
uint32_t g_geoSerial = 0;

RpGeometry* GeometryOf(CPed* ped) {
    if (!ped || !ped->m_pRwClump) return nullptr;
    RpAtomic* atomic = GetFirstAtomic(ped->m_pRwClump);
    return atomic ? atomic->geometry : nullptr;
}

uintptr_t MaterialSum(const RpGeometry* g) {
    uintptr_t sum = 0;
    for (int i = 0; i < g->matList.numMaterials; ++i) sum = sum * 31 + reinterpret_cast<uintptr_t>(g->matList.materials[i]);
    return sum;
}

Geo* GeoOf(RpGeometry* g) {
    if (!g || !g->matList.materials || g->matList.numMaterials <= 0) return nullptr;
    Geo& geo = g_geos[g];
    geo.seen = g_now;
    const uintptr_t sum = MaterialSum(g);
    if (geo.materials == g->matList.materials && geo.count == g->matList.numMaterials && geo.sum == sum) return &geo;
    // New, or the memory of a freed geometry used again: what its materials are.
    geo = Geo();
    geo.serial = ++g_geoSerial;
    geo.seen = g_now;
    geo.materials = g->matList.materials;
    geo.count = g->matList.numMaterials;
    geo.sum = sum;
    std::vector<std::string> names;
    names.reserve(geo.count);
    for (int i = 0; i < geo.count; ++i) {
        const RpMaterial* m = geo.materials[i];
        names.emplace_back(m && m->texture ? m->texture->name : "");
    }
    geo.modular = Model::Detect(names) != kKindNone && geo.model.Build(names);
    if (geo.modular) {
        for (int i = 0; i < geo.count; ++i) {
            if (geo.materials[i]) geo.materials[i]->color.alpha = 0;
        }
        static int reported = 0;
        if (reported++ < 8) {
            Log("Penampilan: model %s (%d material)", kCatalog[geo.model.kind()].label, geo.count);
        }
    }
    return &geo;
}

uint64_t KeyOf(const Look& l, const RpGeometry* g, bool pending) {
    uint8_t bytes[kLookBytes];
    Encode(l, bytes);
    uint64_t h = 1469598103934665603ull;
    for (const uint8_t b : bytes) h = (h ^ b) * 1099511628211ull;
    h = (h ^ reinterpret_cast<uintptr_t>(g)) * 1099511628211ull;
    h = (h ^ (pending ? g_generation : 0u)) * 1099511628211ull;
    return h | 1;   // never 0: 0 is "no plan"
}

void Refresh(Plan& plan, RpGeometry* g, Geo& geo, const Look& l) {
    if (plan.geometry == g && plan.serial == geo.serial && plan.key == KeyOf(l, g, plan.pending)) {
        for (Texture* t : plan.uses) t->lastUse = g_now;
        return;
    }
    std::vector<Model::Draw> draws;
    geo.model.Dress(l, draws);
    bool pending = false;
    plan.draws.clear();
    plan.uses.clear();
    for (const Model::Draw& d : draws) {
        if (d.material >= geo.count || !geo.materials[d.material]) continue;
        Texture* t = Want(d.texture, g_now, pending);
        RwTexture* tex = t ? t->texture : ColorTexture(d.color);
        if (t) plan.uses.push_back(t);
        plan.draws.emplace_back(geo.materials[d.material], tex);
    }
    plan.geometry = g;
    plan.serial = geo.serial;
    plan.pending = pending;
    plan.key = KeyOf(l, g, pending);
}

// ---------------------------------------------------------------------------------------------------------
// Players.

struct Entry {
    Look look;
    uint32_t revision = 0;
    bool have = false;
};

struct Applied {
    bool scaled = false;
};

Entry g_entries[MAX_PLAYERS];
Applied g_applied[MAX_PLAYERS];
Plan g_plans[MAX_PLAYERS];
uint32_t g_planFrame[MAX_PLAYERS];
uint32_t g_frame = 0;
std::vector<std::pair<const CPed*, Plan*>> g_pedPlans;   // this frame's player peds and their plans
uint32_t g_received = 0, g_rejected = 0;
int g_wantLocalModel = -1;   // the local ped's model the editor wants, -1: none
float g_rotate = 0.0f;       // degrees the editor turns the local ped

bool ValidPlayer(uint16_t player) {
    return player < MAX_PLAYERS;
}

uint16_t LocalId() {
    return CPlayerPool::GetLocalPlayerID();
}

// The look shown on a player: the editor's draft on the local player while it is open.
const Look* LookOf(uint16_t player) {
    if (!ValidPlayer(player)) return nullptr;
    const Editor& e = TheEditor();
    if (e.open && player == LocalId()) return &e.draft;
    return g_entries[player].have ? &g_entries[player].look : nullptr;
}

void Dress(uint16_t player, CPedSamp* samp) {
    CPed* ped = samp ? samp->m_pPed : nullptr;
    RpGeometry* g = GeometryOf(ped);
    Geo* geo = GeoOf(g);
    if (!geo || !geo->modular) return;
    const Look* l = LookOf(player);
    const Look use = l ? *l : Look::Default(geo->model.kind());
    Plan& plan = g_plans[player];
    Refresh(plan, g, *geo, use);
    g_planFrame[player] = g_frame;
    g_pedPlans.emplace_back(ped, &plan);
}

// ---------------------------------------------------------------------------------------------------------
// CPed::Render: the ped's plan on its model's materials while it is drawn, then the materials as they were.

using PedRenderFn = void (*)(CPed*);
PedRenderFn g_pedRender = nullptr;
uint32_t g_dressed = 0;

// Pengaman glitch naik/turun kendaraan (semua ped, bukan hanya model kustom): kulit ped
// digambar dengan matriks tulang RpHAnim (posisi dunia). Kalau satu matriks rusak (NaN, skala
// besar, jauh dari ped) titik-titik badan ditarik jauh dan menjadi segitiga raksasa yang menembus
// layar, penuh warna kabut/langit. Ped seperti itu tidak digambar untuk frame itu saja.
constexpr float kPedBoneMaxDistance = 50.0f;   // m dari posisi ped
constexpr float kPedBoneMaxAxis = 20.0f;       // panjang sumbu matriks tulang

bool PedBonesSane(CPed* ped) {
    if (!ped || !ped->m_pRwClump || !ped->m_matrix) return true;
    const RpHAnimHierarchy* h = GetAnimHierarchyFromSkinClump(ped->m_pRwClump);
    if (!h || !h->pMatrixArray || h->numNodes <= 0 || h->numNodes > 256) return true;
    const CVector origin = (h->flags & rpHANIMHIERARCHYLOCALSPACEMATRICES) ? CVector(0.0f, 0.0f, 0.0f)
                                                                           : ped->m_matrix->m_pos;
    const auto finite = [](const RwV3d& v) {
        return std::isfinite(v.x) && std::isfinite(v.y) && std::isfinite(v.z);
    };
    const auto lengthSq = [](const RwV3d& v) { return v.x * v.x + v.y * v.y + v.z * v.z; };
    constexpr float maxAxisSq = kPedBoneMaxAxis * kPedBoneMaxAxis;
    constexpr float maxDistSq = kPedBoneMaxDistance * kPedBoneMaxDistance;
    for (int i = 0; i < h->numNodes; ++i) {
        const RwMatrix& m = h->pMatrixArray[i];
        if (!finite(m.right) || !finite(m.up) || !finite(m.at) || !finite(m.pos)) return false;
        if (lengthSq(m.right) > maxAxisSq || lengthSq(m.up) > maxAxisSq || lengthSq(m.at) > maxAxisSq) return false;
        const RwV3d d = {m.pos.x - origin.x, m.pos.y - origin.y, m.pos.z - origin.z};
        if (lengthSq(d) > maxDistSq) return false;
    }
    return true;
}

void PedRenderHook(CPed* ped) {
    ML_HOOK_SCOPE();
    if (!PedBonesSane(ped)) {
        static unsigned reports = 0;
        if (reports++ < 16) {
            Log("[AlynFlow] ped model %d tidak digambar 1 frame: matriks tulang rusak (kendaraan=%d)",
                ped ? static_cast<int>(ped->m_nModelIndex) : -1, ped && ped->IsInVehicle() ? 1 : 0);
        }
        return;
    }
    const Plan* plan = nullptr;
    RpGeometry* g = GeometryOf(ped);
    Geo* geo = g ? GeoOf(g) : nullptr;
    if (geo && geo->modular) {
        for (const auto& [p, pl] : g_pedPlans) {
            if (p == ped) {
                plan = pl->geometry == g && pl->serial == geo->serial ? pl : nullptr;
                break;
            }
        }
        if (!plan) {
            // Not a player (an actor), or its model changed since Process: the model's defaults.
            Refresh(geo->defaults, g, *geo, Look::Default(geo->model.kind()));
            plan = &geo->defaults;
        }
    }
    if (!plan || plan->draws.empty()) {
        if (g_pedRender) g_pedRender(ped);
        return;
    }
    struct Saved {
        RpMaterial* material;
        RwTexture* texture;
        uint8_t alpha;
    };
    Saved saved[kMaxMaterials];
    size_t n = 0;
    for (const auto& [material, texture] : plan->draws) {
        if (n == kMaxMaterials) break;
        saved[n++] = {material, material->texture, material->color.alpha};
        material->texture = texture;
        material->color.alpha = 255;
    }
    ++g_dressed;
    if (g_pedRender) g_pedRender(ped);
    while (n > 0) {
        --n;
        saved[n].material->texture = saved[n].texture;
        saved[n].material->color.alpha = saved[n].alpha;
    }
}

void ResetPlayer(uint16_t player) {
    g_entries[player] = Entry();
    g_applied[player] = Applied();
    g_plans[player] = Plan();
}

}  // namespace

namespace detail {

void DraftChanged() {
    Editor& e = TheEditor();
    e.changedAt = GetTickCount();
    g_wantLocalModel = e.draft.skin;   // Process() puts it on, in the game's update (not while drawing)
}

void EditorClosed() {
    Editor& e = TheEditor();
    e.open = false;
    e.waiting = false;
    const uint16_t me = LocalId();
    g_wantLocalModel = ValidPlayer(me) && g_entries[me].have ? g_entries[me].look.skin : e.saved.skin;
}

void Rotate(float degrees) {
    g_rotate += degrees;
}

}  // namespace detail

void InstallHooks() {
    CHook::InlineHook("_ZN4CPed6RenderEv", &PedRenderHook, &g_pedRender);
    if (!g_pedRender) Log("Penampilan: hook CPed::Render gagal, pakaian tidak digambar");
}

void Receive(const uint8_t* data, size_t size) {
    Message m;
    if (!Parse(data, size, m)) {
        ++g_rejected;
        return;
    }
    ++g_received;
    Editor& e = TheEditor();
    switch (m.op) {
        case Op::Look: {
            if (!ValidPlayer(m.player)) return;
            Entry& entry = g_entries[m.player];
            if (entry.have && m.revision < entry.revision) return;
            entry.look = m.look;
            entry.revision = m.revision;
            entry.have = true;
            break;
        }
        case Op::Forget:
            if (ValidPlayer(m.player)) g_entries[m.player] = Entry();
            break;
        case Op::Open:
            e.open = true;
            e.session = m.session;
            e.female = m.female;
            e.options = m.options;
            e.saved = m.look;
            e.draft = m.look;
            e.tab = 0;
            e.view = 0;
            e.waiting = false;
            e.waitNotified = false;
            detail::DraftChanged();
            detail::CefOpen();   // V159: the CEF page draws the editor (ImGui if it does not answer)
            break;
        case Op::Close:
            if (e.open && m.session == e.session) {
                detail::CefClosed(m.session, m.result);
                detail::EditorClosed();
            }
            break;
    }
}

void Forget(uint16_t player) {
    if (ValidPlayer(player)) ResetPlayer(player);
}

void Reset() {
    for (uint16_t i = 0; i < MAX_PLAYERS; ++i) ResetPlayer(i);
    TheEditor() = Editor();
    g_wantLocalModel = -1;
    g_rotate = 0.0f;
    g_pedPlans.clear();
}

void Process() {
    const uint32_t now = GetTickCount();
    g_now = now;
    ++g_frame;
    Editor& e = TheEditor();
    if (e.waiting && now - e.waitingSince > kSaveTimeoutMs) e.waiting = false;
    detail::CefProcess(now);
    // The editor's wishes for the local ped, done here in the game's update and not while the editor is drawn:
    // its model, its heading.
    if (CPedSamp* local = detail::LocalPed()) {
        if (g_wantLocalModel > 0 && !local->m_pPed->IsInVehicle()) {
            if (local->m_pPed->m_nModelIndex != g_wantLocalModel) local->SetModelIndex(static_cast<uint32>(g_wantLocalModel));
            g_wantLocalModel = -1;
        }
        if (g_rotate != 0.0f) {
            float degrees = local->m_pPed->m_fCurrentRotation * 57.29578f + g_rotate;
            degrees = std::fmod(degrees, 360.0f);
            if (degrees < 0.0f) degrees += 360.0f;
            local->ForceTargetRotation(degrees);
            g_rotate = 0.0f;
        }
    }
    PumpTextures(now);
    // Every player's plan for this frame.
    g_pedPlans.clear();
    const uint16_t me = LocalId();
    if (CPedSamp* local = detail::LocalPed(); local && ValidPlayer(me)) Dress(me, local);
    for (auto& [id, remote] : CPlayerPool::spawnedPlayers) {
        if (!remote || !ValidPlayer(id) || id == me) continue;
        Dress(id, remote->GetPlayerPed());
    }
    // Plans of players not dressed this frame are dropped: they may hold textures about to be freed.
    for (uint16_t i = 0; i < MAX_PLAYERS; ++i) {
        if (g_plans[i].key && g_planFrame[i] != g_frame) g_plans[i] = Plan();
    }
    // Models no ped has drawn for a while: their default plan dropped (only a drawn ped's live geometry is ever
    // read: these may be freed already), long forgotten models removed.
    for (auto it = g_geos.begin(); it != g_geos.end();) {
        Geo& geo = it->second;
        if (now - geo.seen > kModelForgetMs) {
            it = g_geos.erase(it);
            continue;
        }
        if (geo.defaults.key && now - geo.seen > 2000) geo.defaults = Plan();
        ++it;
    }
    if ((g_frame & 63) == 0) FreeTextures(now);
}

bool ApplyBody(uint16_t player, CPedSamp* samp) {
    if (!ValidPlayer(player) || !samp) return false;
    CPed* ped = samp->m_pPed;
    if (!ped || !ped->m_pRwClump || !ped->m_matrix) return false;
    Applied& a = g_applied[player];
    const Look* l = LookOf(player);
    Body body;
    if (l && !ped->IsInVehicle()) body = BodyOf(*l);
    const bool scale = std::fabs(body.height - 1.0f) > 0.003f || std::fabs(body.width - 1.0f) > 0.003f;
    if (!scale && !a.scaled) return false;
    RwFrame* frame = RpClumpGetFrame(ped->m_pRwClump);
    if (!frame) return false;
    // From the ped's own matrix every frame: never a scale on top of a scale.
    const CMatrix& m = *ped->m_matrix;
    RwMatrix* rw = RwFrameGetMatrix(frame);
    const float w = body.width, h = body.height;
    rw->right = {m.m_right.x * w, m.m_right.y * w, m.m_right.z * w};
    rw->up = {m.m_forward.x * w, m.m_forward.y * w, m.m_forward.z * w};
    rw->at = {m.m_up.x * h, m.m_up.y * h, m.m_up.z * h};
    const float lift = (h - 1.0f) * kRootAboveFeet;
    rw->pos = {m.m_pos.x + m.m_up.x * lift, m.m_pos.y + m.m_up.y * lift, m.m_pos.z + m.m_up.z * lift};
    // RwMatrixUpdate: no longer orthonormal.
    rw->flags &= ~(static_cast<RwUInt32>(rwMATRIXTYPEMASK) | static_cast<RwUInt32>(rwMATRIXINTERNALIDENTITY));
    RwFrameUpdateObjects(frame);
    a.scaled = scale;
    return true;
}

std::string Status() {
    int with = 0, modular = 0;
    for (const Entry& entry : g_entries) with += entry.have ? 1 : 0;
    for (const auto& [g, geo] : g_geos) modular += geo.modular ? 1 : 0;
    size_t ready = 0, queued = 0;
    for (const auto& [path, t] : g_textures) {
        ready += t.state == TexState::Ready ? 1 : 0;
        queued += t.state == TexState::Queued ? 1 : 0;
    }
    char text[256];
    std::snprintf(text, sizeof text,
                  "penampilan: %d pemain, %d model kustom, tekstur %zu siap / %zu antre / %u gagal (%s), "
                  "%u pesan (%u ditolak)%s",
                  with, modular, ready, queued, g_failed, Root().empty() ? "folder clothes tidak ada" : Root().c_str(),
                  g_received, g_rejected, g_pedRender ? "" : ", hook CPed::Render tidak terpasang");
    return text;
}

#endif   // !VER_x32

bool EditorOpen() {
    const detail::Editor& e = detail::TheEditor();
    return e.open && e.cef == 0;
}

}  // namespace look
