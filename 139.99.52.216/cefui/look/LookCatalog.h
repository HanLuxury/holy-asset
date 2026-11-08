#pragma once
// The catalog of the modular characters: the four models of the MTA resource "Clothes" (male, female, male police,
// female police) and every item they can wear. Generated (look/tools/look_catalog.py, from the resource's
// config.lua and shops) into LookCatalog.gen.cpp; the gamemode's look_catalog.inc indexes the same lists.
//
// A model is one skinned mesh with one material per part; a material's texture name names the part
// ("body.torso1", "fantasy_m_torso4", "fantasy_tatto_arm_l", ...). Names in the rules are those texture names.
#include <cstdint>

namespace look {

enum Slot : uint8_t {
    kHair, kBeard, kMakeup, kEyebrow,
    kShirt, kPants, kShoes, kHat, kGlasses, kMask, kNecklace, kWatch, kEarring, kBag, kVest, kBelt,
    kTatArmL, kTatArmR, kTatShoulderL, kTatShoulderR, kTatChest, kTatBack, kTatLegL, kTatLegR,
    kSlots
};
constexpr int kFirstClothes = kShirt, kLastClothes = kBelt;
constexpr int kFirstTattoo = kTatArmL, kLastTattoo = kTatLegR;

// Kind of model. 0: an ordinary skin (no catalog).
enum Kind : uint8_t { kKindNone = 0, kKindMale, kKindFemale, kKindMalePolice, kKindFemalePolice, kKinds };

constexpr uint16_t kNoItem = 0xFFFF;
constexpr int kTones = 6;   // skin tones
constexpr int kHeads = 5;   // head shapes: body.head1..5, with their own eyebrows, beards and make-up

// Material names separated by spaces.
struct CatalogRule {
    const char* show;     // drawn with the item's texture
    const char* remove;   // not drawn (body parts under the clothes, hair under a hat, covered tattoos)
    const char* apply;    // body parts drawn with this item even if hidden otherwise (feet of high heels)
    const char* covers;   // tattoos: clothes (their show) that cover the tattoo
};

struct CatalogTexture {
    const char* part;      // material
    const char* texture;   // under TESTLIT/clothes/
};

struct CatalogItem {
    const char* label;
    const char* texture;   // under TESTLIT/clothes/
    uint16_t rule;         // index into the kind's rules, kNoItem: the slot's rule (tattoos) or none (hair, face)
    uint8_t group;         // index into the slot's groups (the type: "Kaos", "Kaos LV", "Gaya 2", ...)
    uint8_t style;         // hair: the hair model, 1 = fantasy_?_hair1
    uint32_t color;        // RGBA: average colour of the texture, drawn while it loads
};

struct CatalogSlot {
    const CatalogItem* items;
    uint16_t count;
    const char* const* groups;
    uint8_t groupCount;
    bool required;          // never empty
    uint16_t defaultItem;   // kNoItem: empty
    uint16_t rule;          // tattoos: the rule of every item
};

struct CatalogKind {
    const char* name;
    const char* label;
    uint16_t skin;          // the skin the model replaces (modloader file), as the gamemode uses it
    bool female;
    const char* marker;     // a material only this model has
    const char* hair;       // hair materials: <hair><style>
    const char* hidden;     // body parts not drawn unless an item applies them
    const CatalogRule* rules;
    uint16_t ruleCount;
    CatalogSlot slots[kSlots];
    const CatalogTexture* tones[kTones];   // per tone: the texture of every body part
    uint8_t toneCount[kTones];
    const char* heads[kTones];    // head texture per tone
    uint32_t toneColors[kTones];  // RGBA, drawn while the tone's textures load
};

extern const CatalogKind kCatalog[kKinds];
extern const char* const kSlotNames[kSlots];

inline bool ModularKind(int kind) {
    return kind > kKindNone && kind < kKinds;
}
inline bool SameGender(int a, int b) {
    return ModularKind(a) && ModularKind(b) && kCatalog[a].female == kCatalog[b].female;
}

}  // namespace look
