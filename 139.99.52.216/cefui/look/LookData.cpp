#include "LookData.h"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstring>

namespace look {

namespace {

constexpr float kReferenceHeight = 172.0f;   // cm: the models as they are
constexpr float kReferenceBmi = 22.0f;

uint16_t U16(const uint8_t* p) {
    return static_cast<uint16_t>(p[0] | (p[1] << 8));
}

uint32_t U32(const uint8_t* p) {
    return static_cast<uint32_t>(p[0]) | (static_cast<uint32_t>(p[1]) << 8) | (static_cast<uint32_t>(p[2]) << 16) |
           (static_cast<uint32_t>(p[3]) << 24);
}

void Put16(std::vector<uint8_t>& out, uint32_t v) {
    out.push_back(static_cast<uint8_t>(v));
    out.push_back(static_cast<uint8_t>(v >> 8));
}

void Put32(std::vector<uint8_t>& out, uint32_t v) {
    for (int i = 0; i < 4; ++i) out.push_back(static_cast<uint8_t>(v >> (8 * i)));
}

int HexDigit(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

// Slots a body keeps when it changes kind within its gender: the same lists for the casual and police model.
bool Trait(int slot) {
    return slot == kHair || slot == kBeard || slot == kMakeup || slot == kEyebrow ||
           (slot >= kFirstTattoo && slot <= kLastTattoo);
}

}  // namespace

Look::Look() {
    Reset(kKindMale);
}

void Look::Reset(int to) {
    skin = 0;
    model = 0;
    kind = static_cast<uint8_t>(ModularKind(to) ? to : kKindMale);
    tone = 0;
    head = 0;
    height = kDefaultHeight;
    weight = kDefaultWeight;
    const CatalogKind& k = kCatalog[kind];
    for (int s = 0; s < kSlots; ++s) items[s] = k.slots[s].count ? k.slots[s].defaultItem : kNoItem;
}

Look Look::Default(int kind) {
    Look l;
    l.Reset(kind);
    return l;
}

bool Look::operator==(const Look& o) const {
    return skin == o.skin && model == o.model && kind == o.kind && tone == o.tone && head == o.head &&
           height == o.height && weight == o.weight && std::memcmp(items, o.items, sizeof(items)) == 0;
}

bool Valid(const Look& l) {
    if (l.height < kMinHeight || l.height > kMaxHeight || l.weight < kMinWeight || l.weight > kMaxWeight ||
        l.skin > 20000 || l.model > 1 || !ModularKind(l.kind) || l.tone >= kTones || l.head >= kHeads) {
        return false;
    }
    const CatalogKind& k = kCatalog[l.kind];
    for (int s = 0; s < kSlots; ++s) {
        const CatalogSlot& slot = k.slots[s];
        if (l.items[s] == kNoItem) {
            if (slot.required) return false;
        } else if (l.items[s] >= slot.count) {
            return false;
        }
    }
    return true;
}

void Encode(const Look& l, uint8_t out[kLookBytes]) {
    size_t i = 0;
    out[i++] = kFormat;
    out[i++] = static_cast<uint8_t>(l.skin);
    out[i++] = static_cast<uint8_t>(l.skin >> 8);
    out[i++] = l.model;
    out[i++] = l.kind;
    out[i++] = l.tone;
    out[i++] = l.head;
    for (int s = 0; s < kSlots; ++s) {
        out[i++] = static_cast<uint8_t>(l.items[s]);
        out[i++] = static_cast<uint8_t>(l.items[s] >> 8);
    }
    out[i++] = l.height;
    out[i++] = l.weight;
}

bool Decode(const uint8_t* data, size_t size, Look& out) {
    if (!data || size != kLookBytes || data[0] != kFormat) return false;
    Look l;
    size_t i = 1;
    l.skin = U16(data + i);
    i += 2;
    l.model = data[i++];
    l.kind = data[i++];
    l.tone = data[i++];
    l.head = data[i++];
    for (int s = 0; s < kSlots; ++s, i += 2) l.items[s] = U16(data + i);
    l.height = data[i++];
    l.weight = data[i++];
    if (!Valid(l)) return false;
    out = l;
    return true;
}

std::string ToHex(const Look& l) {
    uint8_t bytes[kLookBytes];
    Encode(l, bytes);
    static const char kDigits[] = "0123456789abcdef";
    std::string out;
    out.reserve(kLookBytes * 2);
    for (const uint8_t b : bytes) {
        out.push_back(kDigits[b >> 4]);
        out.push_back(kDigits[b & 15]);
    }
    return out;
}

bool FromHex(std::string_view hex, Look& out) {
    if (hex.size() != kLookBytes * 2) return false;
    uint8_t bytes[kLookBytes];
    for (size_t i = 0; i < kLookBytes; ++i) {
        const int hi = HexDigit(hex[2 * i]), lo = HexDigit(hex[2 * i + 1]);
        if (hi < 0 || lo < 0) return false;
        bytes[i] = static_cast<uint8_t>(hi * 16 + lo);
    }
    return Decode(bytes, kLookBytes, out);
}

Look Convert(const Look& l, int kind) {
    if (!ModularKind(kind) || kind == l.kind) return l;
    Look out = Look::Default(kind);
    out.skin = l.skin;
    out.model = l.model;
    out.height = l.height;
    out.weight = l.weight;
    if (!SameGender(kind, l.kind)) return out;
    out.tone = l.tone;
    out.head = l.head;
    const CatalogKind& to = kCatalog[kind];
    for (int s = 0; s < kSlots; ++s) {
        if (!Trait(s)) continue;
        const uint16_t item = l.items[s];
        if (item == kNoItem ? !to.slots[s].required : item < to.slots[s].count) out.items[s] = item;
    }
    return out;
}

Body BodyOf(const Look& l) {
    Body b;
    const float cm = static_cast<float>(std::clamp<int>(l.height, kMinHeight, kMaxHeight));
    const float kg = static_cast<float>(std::clamp<int>(l.weight, kMinWeight, kMaxWeight));
    const float metres = cm / 100.0f;
    const float bmi = kg / (metres * metres);
    b.height = cm / kReferenceHeight;
    // A taller body is somewhat broader too.
    const float tall = std::sqrt(b.height);
    b.width = tall * std::clamp(1.0f + (bmi - kReferenceBmi) * 0.012f, 0.88f, 1.16f);
    return b;
}

bool Parse(const uint8_t* data, size_t size, Message& out) {
    if (!data || size < 2 || data[0] != kVersion) return false;
    Message m;
    const uint8_t* p = data + 2;
    const size_t left = size - 2;
    switch (data[1]) {
        case 1:
            if (left != 2 + 4 + kLookBytes) return false;
            m.op = Op::Look;
            m.player = U16(p);
            m.revision = U32(p + 2);
            if (!Decode(p + 6, kLookBytes, m.look)) return false;
            break;
        case 2:
            if (left != 2) return false;
            m.op = Op::Forget;
            m.player = U16(p);
            break;
        case 3: {
            if (left < 4 + 1 + 1 + kLookBytes) return false;
            m.op = Op::Open;
            m.session = U32(p);
            if (!m.session || (p[4] & ~1u)) return false;
            m.female = (p[4] & 1) != 0;
            const size_t n = p[5];
            if (n == 0 || n > kMaxOptions || left != 6 + n * 4 + kLookBytes) return false;
            for (size_t i = 0; i < n; ++i) {
                const uint8_t* o = p + 6 + i * 4;
                ModelOption opt;
                opt.model = o[0];
                opt.kind = o[1];
                opt.skin = U16(o + 2);
                if (opt.model > 1 || opt.skin > 20000) return false;
                if (opt.model == 1 && !ModularKind(opt.kind)) return false;
                m.options.push_back(opt);
            }
            if (!Decode(p + 6 + n * 4, kLookBytes, m.look)) return false;
            break;
        }
        case 4:
            if (left != 5 || p[4] > 1) return false;
            m.op = Op::Close;
            m.session = U32(p);
            m.result = p[4];
            break;
        default:
            return false;
    }
    out = std::move(m);
    return true;
}

std::vector<uint8_t> Build(const Message& m) {
    std::vector<uint8_t> out = {kVersion, static_cast<uint8_t>(m.op)};
    uint8_t look[kLookBytes];
    Encode(m.look, look);
    switch (m.op) {
        case Op::Look:
            Put16(out, m.player);
            Put32(out, m.revision);
            out.insert(out.end(), look, look + kLookBytes);
            break;
        case Op::Forget:
            Put16(out, m.player);
            break;
        case Op::Open:
            Put32(out, m.session);
            out.push_back(m.female ? 1 : 0);
            out.push_back(static_cast<uint8_t>(m.options.size()));
            for (const ModelOption& o : m.options) {
                out.push_back(o.model);
                out.push_back(o.kind);
                Put16(out, o.skin);
            }
            out.insert(out.end(), look, look + kLookBytes);
            break;
        case Op::Close:
            Put32(out, m.session);
            out.push_back(m.result);
            break;
    }
    return out;
}

std::string SaveEvent(uint32_t session, const Look& l) {
    return "save " + std::to_string(session) + " " + ToHex(l);
}

std::string CancelEvent(uint32_t session) {
    return "cancel " + std::to_string(session);
}

std::string CameraEvent(uint32_t session, int view) {
    return "cam " + std::to_string(session) + " " + std::to_string(std::clamp(view, 0, 2));
}

}  // namespace look
