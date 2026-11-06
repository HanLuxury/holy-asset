#pragma once
// What a modular character shows: from the look and the model's materials, every material that is drawn and its
// texture. The rules (LookCatalog.h, config.lua of the MTA resource):
//   - body parts ("body.*" except the head families) are drawn with the skin tone's texture, except the parts the
//     kind hides by default (the high-heel feet of the female models);
//   - the head shape's body.headN gets the tone's head texture, body.eyebrownN / body.beardsN / body.makeupN of
//     that shape the chosen eyebrows / beard / make-up, the hair style's material the hair texture;
//   - a piece of clothing draws its own materials, hides its `remove` parts and draws its `apply` body parts;
//     what is removed stays hidden even if another piece applies it (boots over the shins of cargo trousers);
//   - a tattoo draws its materials unless a worn piece of clothing covers it or a piece removes them;
//   - every other material is not drawn.
// No game dependencies: tested on the host (look/tests/).
#include <bitset>
#include <cstdint>
#include <string>
#include <vector>

#include "LookData.h"

namespace look {

constexpr size_t kMaxMaterials = 256;
using MaterialSet = std::bitset<kMaxMaterials>;

class Model {
public:
    // The kind of model whose materials these are (texture names in material order), kKindNone if none.
    static int Detect(const std::vector<std::string>& names);
    // false when the names are not a modular model or there are more materials than kMaxMaterials.
    bool Build(const std::vector<std::string>& names);

    int kind() const { return m_kind; }
    size_t size() const { return m_size; }

    struct Draw {
        uint16_t material;
        const char* texture;   // under TESTLIT/clothes/, nullptr: only the colour
        uint32_t color;        // RGBA, drawn while the texture loads
    };
    // The materials drawn for `look` (converted to this model's kind first, see Convert in LookData.h).
    void Dress(const Look& look, std::vector<Draw>& out) const;
    // The look as this model shows it.
    Look Effective(const Look& look) const;

private:
    MaterialSet Named(const std::string& name) const;
    MaterialSet List(const char* names) const;   // names separated by spaces

    int m_kind = kKindNone;
    size_t m_size = 0;
    std::vector<std::string> m_names;
    MaterialSet m_body, m_hidden;
    MaterialSet m_head[kHeads], m_eyebrow[kHeads], m_beard[kHeads], m_makeup[kHeads];
    std::vector<MaterialSet> m_hair;              // [style - 1]
    std::vector<const char*> m_tone[kTones];      // per material: the tone's texture (catalog), nullptr: none
    struct Rule {
        MaterialSet show, remove, apply, covers;
    };
    std::vector<Rule> m_rules;
};

}  // namespace look
