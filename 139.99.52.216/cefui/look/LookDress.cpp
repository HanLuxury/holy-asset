#include "LookDress.h"

#include <cstring>
#include <set>

namespace look {

namespace {

bool StartsWith(const std::string& s, const char* prefix) {
    return s.compare(0, std::strlen(prefix), prefix) == 0;
}

// "body.head3" with the family "body.head": 3. 0: not this family.
int FamilyIndex(const std::string& name, const char* family) {
    const size_t n = std::strlen(family);
    if (name.size() != n + 1 || name.compare(0, n, family) != 0) return 0;
    const char c = name[n];
    return c >= '1' && c <= '0' + kHeads ? c - '0' : 0;
}

// The words of a space separated list.
std::vector<std::string> Words(const char* text) {
    std::vector<std::string> out;
    if (!text) return out;
    const char* p = text;
    while (*p) {
        while (*p == ' ') ++p;
        const char* start = p;
        while (*p && *p != ' ') ++p;
        if (p > start) out.emplace_back(start, p);
    }
    return out;
}

}  // namespace

int Model::Detect(const std::vector<std::string>& names) {
    const std::set<std::string> have(names.begin(), names.end());
    if (!have.count("body.head1")) return kKindNone;
    // The police models have the casual model's markers too: they first.
    for (const int kind : {kKindMalePolice, kKindFemalePolice, kKindMale, kKindFemale}) {
        if (have.count(kCatalog[kind].marker)) return kind;
    }
    return kKindNone;
}

MaterialSet Model::Named(const std::string& name) const {
    MaterialSet set;
    for (size_t i = 0; i < m_size; ++i) {
        if (m_names[i] == name) set.set(i);
    }
    return set;
}

MaterialSet Model::List(const char* names) const {
    MaterialSet set;
    for (const std::string& w : Words(names)) set |= Named(w);
    return set;
}

bool Model::Build(const std::vector<std::string>& names) {
    *this = Model();
    const int kind = Detect(names);
    if (kind == kKindNone || names.size() > kMaxMaterials) return false;
    m_kind = kind;
    m_size = names.size();
    m_names = names;
    const CatalogKind& k = kCatalog[kind];
    for (size_t i = 0; i < m_size; ++i) {
        const std::string& n = m_names[i];
        if (!StartsWith(n, "body.")) continue;
        if (int h = FamilyIndex(n, "body.head")) m_head[h - 1].set(i);
        else if (int e = FamilyIndex(n, "body.eyebrown")) m_eyebrow[e - 1].set(i);
        else if (int b = FamilyIndex(n, "body.beards")) m_beard[b - 1].set(i);
        else if (int m = FamilyIndex(n, "body.makeup")) m_makeup[m - 1].set(i);
        else m_body.set(i);
    }
    m_hidden = List(k.hidden) & m_body;
    for (int style = 1; style <= 9; ++style) {
        const MaterialSet hair = Named(std::string(k.hair) + std::to_string(style));
        if (hair.none()) break;
        m_hair.push_back(hair);
    }
    for (int t = 0; t < kTones; ++t) {
        m_tone[t].assign(m_size, nullptr);
        for (int p = 0; p < k.toneCount[t]; ++p) {
            const MaterialSet set = Named(k.tones[t][p].part) & m_body;
            for (size_t i = 0; i < m_size; ++i) {
                if (set.test(i)) m_tone[t][i] = k.tones[t][p].texture;
            }
        }
        for (int h = 0; h < kHeads; ++h) {
            for (size_t i = 0; i < m_size; ++i) {
                if (m_head[h].test(i) && k.heads[t] && *k.heads[t]) m_tone[t][i] = k.heads[t];
            }
        }
    }
    m_rules.resize(k.ruleCount);
    for (uint16_t r = 0; r < k.ruleCount; ++r) {
        m_rules[r].show = List(k.rules[r].show);
        m_rules[r].remove = List(k.rules[r].remove);
        m_rules[r].apply = List(k.rules[r].apply) & m_body;
        m_rules[r].covers = List(k.rules[r].covers);
    }
    return true;
}

Look Model::Effective(const Look& look) const {
    if (m_kind == kKindNone || look.kind == m_kind) return look;
    return Convert(look, m_kind);
}

void Model::Dress(const Look& look, std::vector<Draw>& out) const {
    out.clear();
    if (m_kind == kKindNone) return;
    const Look l = Effective(look);
    const CatalogKind& k = kCatalog[m_kind];
    const int tone = l.tone < kTones ? l.tone : 0;
    const int head = l.head < kHeads ? l.head : 0;
    const uint32_t toneColor = k.toneColors[tone];

    MaterialSet shown;
    std::vector<const char*> texture(m_size, nullptr);
    std::vector<uint32_t> color(m_size, toneColor);
    const auto show = [&](const MaterialSet& set, const char* tex, uint32_t col) {
        for (size_t i = 0; i < m_size; ++i) {
            if (!set.test(i)) continue;
            shown.set(i);
            texture[i] = tex && *tex ? tex : nullptr;
            color[i] = col;
        }
    };
    const auto item = [&](int slot) -> const CatalogItem* {
        const CatalogSlot& s = k.slots[slot];
        const uint16_t index = l.items[slot];
        return index < s.count ? &s.items[index] : nullptr;
    };

    // Clothes: what they remove and apply, before the body.
    MaterialSet removes, applies, worn;
    for (int s = kFirstClothes; s <= kLastClothes; ++s) {
        const CatalogItem* it = item(s);
        if (!it || it->rule >= m_rules.size()) continue;
        const Rule& r = m_rules[it->rule];
        worn |= r.show;
        removes |= r.remove;
        applies |= r.apply;
    }

    // Body and head with the tone.
    MaterialSet body = ((m_body & ~m_hidden) | applies) & ~removes;
    for (size_t i = 0; i < m_size; ++i) {
        if (body.test(i) || m_head[head].test(i)) {
            shown.set(i);
            texture[i] = m_tone[tone][i];
            color[i] = toneColor;
        }
    }
    // Face.
    if (const CatalogItem* it = item(kEyebrow)) show(m_eyebrow[head], it->texture, it->color);
    if (const CatalogItem* it = item(kBeard)) show(m_beard[head], it->texture, it->color);
    if (const CatalogItem* it = item(kMakeup)) show(m_makeup[head], it->texture, it->color);
    // Hair, unless a hat removes it.
    if (const CatalogItem* it = item(kHair)) {
        if (it->style >= 1 && it->style <= m_hair.size()) show(m_hair[it->style - 1] & ~removes, it->texture, it->color);
    }
    // Clothes.
    for (int s = kFirstClothes; s <= kLastClothes; ++s) {
        const CatalogItem* it = item(s);
        if (it && it->rule < m_rules.size()) show(m_rules[it->rule].show, it->texture, it->color);
    }
    // Tattoos, unless covered.
    for (int s = kFirstTattoo; s <= kLastTattoo; ++s) {
        const CatalogItem* it = item(s);
        const uint16_t rule = k.slots[s].rule;
        if (!it || rule >= m_rules.size()) continue;
        const Rule& r = m_rules[rule];
        if ((r.covers & worn).any()) continue;
        show(r.show & ~removes, it->texture, it->color);
    }

    for (size_t i = 0; i < m_size; ++i) {
        if (shown.test(i)) out.push_back({static_cast<uint16_t>(i), texture[i], color[i]});
    }
}

}  // namespace look
