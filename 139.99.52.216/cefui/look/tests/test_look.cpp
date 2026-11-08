// Host tests of the look system's data (no game dependencies): catalog, wire format, body, and what a modular
// character shows (LookDress), with the materials of the resource's four real models. sh look/tests/run.sh
#include <cmath>
#include <cstdio>
#include <cstring>
#include <set>
#include <string>
#include <vector>

#include "../LookCatalog.h"
#include "../LookData.h"
#include "../LookDress.h"

using namespace look;

#include "models.inc"

static int g_failures = 0, g_checks = 0;
#define CHECK(x)                                                         \
    do {                                                                 \
        ++g_checks;                                                      \
        if (!(x)) {                                                      \
            ++g_failures;                                                \
            std::printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #x);     \
        }                                                                \
    } while (0)

static const std::vector<std::string>& MaterialsOf(int kind) {
    switch (kind) {
        case kKindMale: return kMaleMaterials;
        case kKindFemale: return kFemaleMaterials;
        case kKindMalePolice: return kMalePoliceMaterials;
        default: return kFemalePoliceMaterials;
    }
}

static std::vector<std::string> Words(const char* text) {
    std::vector<std::string> out;
    std::string w;
    for (const char* p = text; p && *p; ++p) {
        if (*p == ' ') {
            if (!w.empty()) out.push_back(w);
            w.clear();
        } else {
            w += *p;
        }
    }
    if (!w.empty()) out.push_back(w);
    return out;
}

static int Find(int kind, int slot, const char* label) {
    const CatalogSlot& s = kCatalog[kind].slots[slot];
    for (int i = 0; i < s.count; ++i) {
        if (std::strcmp(s.items[i].label, label) == 0) return i;
    }
    std::printf("no item \"%s\" in kind %d slot %d\n", label, kind, slot);
    return -1;
}

// Names of the materials drawn, and the texture of one of them.
struct Shown {
    std::set<std::string> names;
    std::vector<Model::Draw> draws;
    const std::vector<std::string>* materials = nullptr;
    bool has(const char* n) const { return names.count(n) != 0; }
    const char* texture(const char* n) const {
        for (const Model::Draw& d : draws) {
            if ((*materials)[d.material] == n) return d.texture;
        }
        return nullptr;
    }
};

static Shown Dress(int kind, const Look& l) {
    Model m;
    Shown s;
    s.materials = &MaterialsOf(kind);
    if (!m.Build(MaterialsOf(kind))) return s;
    m.Dress(l, s.draws);
    for (const Model::Draw& d : s.draws) s.names.insert((*s.materials)[d.material]);
    return s;
}

static void TestCatalog() {
    for (int kind = kKindMale; kind < kKinds; ++kind) {
        const CatalogKind& k = kCatalog[kind];
        const std::set<std::string> have(MaterialsOf(kind).begin(), MaterialsOf(kind).end());
        CHECK(Model::Detect(MaterialsOf(kind)) == kind);
        CHECK(have.count(k.marker) == 1);
        CHECK(k.skin == (kind == 1 ? 7 : kind == 2 ? 9 : kind == 3 ? 271 : 272));
        // Every rule names materials of this model (the police rules may name parts only the casual model has:
        // those are left out by the model, but what an item draws must exist).
        // Tattoos: at least one (the police models lack a few tattoo parts of the casual ones).
        std::set<int> tattooRules;
        for (int s = kFirstTattoo; s <= kLastTattoo; ++s) {
            if (k.slots[s].count) tattooRules.insert(k.slots[s].rule);
        }
        for (uint16_t r = 0; r < k.ruleCount; ++r) {
            int found = 0, words = 0;
            for (const std::string& w : Words(k.rules[r].show)) {
                ++words;
                found += have.count(w) ? 1 : 0;
                if (!have.count(w) && !tattooRules.count(r)) std::printf("kind %d rule %u shows missing %s\n", kind, r, w.c_str());
            }
            CHECK(words > 0 && (tattooRules.count(r) ? found > 0 : found == words));
        }
        int items = 0;
        for (int s = 0; s < kSlots; ++s) {
            const CatalogSlot& slot = k.slots[s];
            CHECK(!slot.required || slot.defaultItem < slot.count);
            CHECK(slot.defaultItem == kNoItem || slot.defaultItem < slot.count);
            if (s >= kFirstTattoo && s <= kLastTattoo && slot.count) CHECK(slot.rule < k.ruleCount);
            for (int i = 0; i < slot.count; ++i) {
                const CatalogItem& it = slot.items[i];
                CHECK(it.label && *it.label && it.texture && *it.texture);
                CHECK(it.group < slot.groupCount);
                CHECK((it.color & 0xFF) == 0xFF);
                if (s >= kFirstClothes && s <= kLastClothes) CHECK(it.rule < k.ruleCount);
                if (s == kHair) CHECK(it.style >= 1 && it.style <= 5);
            }
            items += slot.count;
        }
        CHECK(items > 150);
        for (int t = 0; t < kTones; ++t) CHECK(k.heads[t] && *k.heads[t] && k.tones[t] && k.toneCount[t] >= 16);
    }
    // The casual and the police model of a gender share hair, face and tattoos.
    for (const int s : {kHair, kBeard, kMakeup, kEyebrow, kTatArmL, kTatChest, kTatLegR}) {
        CHECK(kCatalog[kKindMale].slots[s].count == kCatalog[kKindMalePolice].slots[s].count);
        CHECK(kCatalog[kKindFemale].slots[s].count == kCatalog[kKindFemalePolice].slots[s].count);
    }
    CHECK(kCatalog[kKindMale].slots[kBeard].count > 0 && kCatalog[kKindFemale].slots[kBeard].count == 0);
    CHECK(kCatalog[kKindFemale].slots[kMakeup].count > 0 && kCatalog[kKindMale].slots[kMakeup].count == 0);
    CHECK(kCatalog[kKindMalePolice].slots[kVest].count > 0 && kCatalog[kKindMale].slots[kVest].count == 0);
    CHECK(Model::Detect({"body.torso1", "fantasy_m_torso1"}) == kKindNone);   // no head
}

static void TestLook() {
    Look l;
    CHECK(Valid(l) && l.kind == kKindMale && !l.modular());
    CHECK(l.items[kPants] == kCatalog[kKindMale].slots[kPants].defaultItem);
    CHECK(std::strstr(kCatalog[kKindMale].slots[kPants].items[l.items[kPants]].label, "Celana dalam"));
    Look f = Look::Default(kKindFemale);
    CHECK(Valid(f) && f.items[kShirt] != kNoItem && f.items[kPants] != kNoItem);
    CHECK(std::strstr(kCatalog[kKindFemale].slots[kShirt].items[f.items[kShirt]].label, "Bra"));
    // Round trip.
    l.model = 1;
    l.skin = 7;
    l.tone = 5;
    l.head = 4;
    l.items[kShirt] = static_cast<uint16_t>(kCatalog[kKindMale].slots[kShirt].count - 1);
    l.items[kTatLegR] = 3;
    l.height = 199;
    l.weight = 41;
    CHECK(Valid(l));
    const std::string hex = ToHex(l);
    CHECK(hex.size() == kLookBytes * 2 && kLookBytes == 57);
    Look back;
    CHECK(FromHex(hex, back) && back == l);
    CHECK(!FromHex(hex.substr(2), back));
    std::string bad = hex;
    bad[5] = 'x';
    CHECK(!FromHex(bad, back));
    // Out of range.
    Look wrong = l;
    wrong.items[kShirt] = kCatalog[kKindMale].slots[kShirt].count;
    CHECK(!Valid(wrong));
    wrong = l;
    wrong.items[kPants] = kNoItem;   // required
    CHECK(!Valid(wrong));
    wrong = l;
    wrong.items[kVest] = 0;          // the casual male has no vests
    CHECK(!Valid(wrong));
    wrong = l;
    wrong.tone = kTones;
    CHECK(!Valid(wrong));
    wrong = l;
    wrong.head = kHeads;
    CHECK(!Valid(wrong));
    wrong = l;
    wrong.kind = kKindNone;
    CHECK(!Valid(wrong));
    wrong = l;
    wrong.height = kMaxHeight + 1;
    CHECK(!Valid(wrong));
    wrong = l;
    wrong.model = 2;
    CHECK(!Valid(wrong));
    // Convert: police and back keep the body traits.
    Look p = Convert(l, kKindMalePolice);
    CHECK(Valid(p) && p.kind == kKindMalePolice && p.tone == 5 && p.head == 4 && p.items[kTatLegR] == 3);
    CHECK(p.items[kShirt] == kCatalog[kKindMalePolice].slots[kShirt].defaultItem);
    CHECK(p.items[kPants] == kCatalog[kKindMalePolice].slots[kPants].defaultItem);
    Look g = Convert(l, kKindFemale);   // another gender: its defaults, the body kept
    CHECK(Valid(g) && g.kind == kKindFemale && g.tone == 0 && g.height == 199 && g.model == 1);
    // Body.
    Look tall = Look::Default(kKindMale);
    tall.height = 190;
    tall.weight = 90;
    const Body b = BodyOf(tall);
    CHECK(b.height > 1.09f && b.height < 1.11f && b.width > 1.05f);
    Look small = Look::Default(kKindMale);
    small.height = 151;
    small.weight = 41;
    CHECK(BodyOf(small).height < 0.9f && BodyOf(small).width < 0.95f);
    CHECK(std::fabs(BodyOf(Look()).height - 1.0f) < 0.001f);
}

static void TestMessages() {
    Message m;
    m.op = Op::Look;
    m.player = 77;
    m.revision = 123456;
    m.look = Look::Default(kKindFemale);
    m.look.model = 1;
    m.look.skin = 9;
    std::vector<uint8_t> bytes = Build(m);
    CHECK(bytes.size() == 2 + 2 + 4 + kLookBytes && bytes[0] == kVersion);
    Message back;
    CHECK(Parse(bytes.data(), bytes.size(), back) && back.op == Op::Look && back.player == 77 &&
          back.revision == 123456 && back.look == m.look);
    CHECK(!Parse(bytes.data(), bytes.size() - 1, back));
    bytes[0] = 1;   // the CJ version's messages are not taken
    CHECK(!Parse(bytes.data(), bytes.size(), back));

    Message open;
    open.op = Op::Open;
    open.session = 99;
    open.female = true;
    open.options = {{0, kKindFemale, 56}, {1, kKindFemale, 9}, {1, kKindFemalePolice, 272}};
    open.look = Look::Default(kKindFemale);
    bytes = Build(open);
    CHECK(Parse(bytes.data(), bytes.size(), back) && back.op == Op::Open && back.session == 99 && back.female &&
          back.options.size() == 3 && back.options[2].kind == kKindFemalePolice && back.options[2].skin == 272 &&
          back.options[0].model == 0 && back.options[0].skin == 56);
    Message noOptions = open;
    noOptions.options.clear();
    bytes = Build(noOptions);
    CHECK(!Parse(bytes.data(), bytes.size(), back));
    Message badOption = open;
    badOption.options[1].kind = kKindNone;
    bytes = Build(badOption);
    CHECK(!Parse(bytes.data(), bytes.size(), back));

    Message close;
    close.op = Op::Close;
    close.session = 5;
    close.result = 1;
    bytes = Build(close);
    CHECK(Parse(bytes.data(), bytes.size(), back) && back.op == Op::Close && back.session == 5 && back.result == 1);
    Message forget;
    forget.op = Op::Forget;
    forget.player = 3;
    bytes = Build(forget);
    CHECK(Parse(bytes.data(), bytes.size(), back) && back.op == Op::Forget && back.player == 3);

    CHECK(SaveEvent(7, Look()).rfind("save 7 ", 0) == 0 && SaveEvent(7, Look()).size() == 7 + kLookBytes * 2);
    CHECK(CancelEvent(4) == "cancel 4");
    CHECK(CameraEvent(4, 9) == "cam 4 2");
}

static void TestDressMale() {
    const int K = kKindMale;
    Look l = Look::Default(K);
    Shown s = Dress(K, l);
    // Default: the whole body, head shape 1 with its eyebrows, hair style 1, underwear.
    for (const char* part : {"body.torso1", "body.torso2", "body.torso3", "body.armleft", "body.hand", "body.legleft1",
                             "body.legleft5", "body.feetleft", "body.feetright", "body.head1", "body.eyebrown1",
                             "fantasy_m_hair1", "fantasy_m_underwear"}) {
        if (!s.has(part)) std::printf("male default lacks %s\n", part);
        CHECK(s.has(part));
    }
    for (const char* part : {"body.head2", "body.beards1", "body.eyebrown2", "fantasy_m_hair2", "fantasy_m_torso1",
                             "fantasy_tatto_arm_l", "fantasy_m_boot1"}) {
        CHECK(!s.has(part));
    }
    CHECK(s.texture("body.torso1") && std::strcmp(s.texture("body.torso1"), "7/torso/1/1.png") == 0);
    CHECK(s.texture("body.head1") && std::strcmp(s.texture("body.head1"), "7/heads/1/1.png") == 0);
    // Tone 3, head 4, beard.
    l.tone = 2;
    l.head = 3;
    l.items[kBeard] = 0;
    s = Dress(K, l);
    CHECK(s.has("body.head4") && !s.has("body.head1") && s.has("body.beards4") && s.has("body.eyebrown4"));
    CHECK(std::strcmp(s.texture("body.legright2"), "7/leg/1/3.png") == 0);
    CHECK(std::strcmp(s.texture("body.head4"), "7/heads/3/1.png") == 0);
    // Cargo trousers and boots: thighs and the shins under the boots hidden, the knees shown.
    l = Look::Default(K);
    l.items[kPants] = static_cast<uint16_t>(Find(K, kPants, "Celana kargo 1"));
    l.items[kShoes] = static_cast<uint16_t>(Find(K, kShoes, "Sepatu bot 1"));
    s = Dress(K, l);
    CHECK(s.has("fantasy_m_pants4") && s.has("fantasy_m_boot4"));
    CHECK(!s.has("body.legleft1") && !s.has("body.legleft3") && s.has("body.legleft4") && !s.has("body.legleft5"));
    CHECK(!s.has("body.feetleft") && !s.has("fantasy_m_underwear"));
    // Sandals keep the feet.
    l.items[kShoes] = static_cast<uint16_t>(Find(K, kShoes, "Sandal jepit 1"));
    s = Dress(K, l);
    CHECK(s.has("fantasy_m_slipper1") && s.has("body.feetleft") && s.has("body.legleft5"));
    // A hat removes the hair; bald without hair.
    l = Look::Default(K);
    l.items[kHat] = 0;
    s = Dress(K, l);
    CHECK(s.has("fantasy_m_hat1") && !s.has("fantasy_m_hair1"));
    l.items[kHat] = kNoItem;
    l.items[kHair] = kNoItem;
    s = Dress(K, l);
    for (int st = 1; st <= 4; ++st) CHECK(!s.has(("fantasy_m_hair" + std::to_string(st)).c_str()));
    // Hair style 3 is its own model.
    const CatalogSlot& hair = kCatalog[K].slots[kHair];
    for (int i = 0; i < hair.count; ++i) {
        if (hair.items[i].style == 3) {
            l.items[kHair] = static_cast<uint16_t>(i);
            break;
        }
    }
    s = Dress(K, l);
    CHECK(s.has("fantasy_m_hair3") && !s.has("fantasy_m_hair1"));
    // Arm tattoo: shown with a tank top, covered by a sweater, chest tattoo removed by any shirt.
    l = Look::Default(K);
    l.items[kTatArmL] = 0;
    l.items[kTatChest] = 0;
    s = Dress(K, l);
    CHECK(s.has("fantasy_tatto_arm_l") && s.has("fantasy_tatto_torso_front"));
    l.items[kShirt] = static_cast<uint16_t>(Find(K, kShirt, "Kaos kutung 1"));
    s = Dress(K, l);
    CHECK(s.has("fantasy_m_torso1") && s.has("fantasy_tatto_arm_l") && !s.has("fantasy_tatto_torso_front"));
    CHECK(!s.has("body.torso1") && s.has("body.torso2") && s.has("body.armleft"));
    l.items[kShirt] = static_cast<uint16_t>(Find(K, kShirt, "Sweater 1"));
    s = Dress(K, l);
    CHECK(s.has("fantasy_m_torso3") && !s.has("fantasy_tatto_arm_l") && !s.has("body.armleft"));
    // Every item of every slot draws its own material.
    for (int slot = kFirstClothes; slot <= kLastClothes; ++slot) {
        const CatalogSlot& cs = kCatalog[K].slots[slot];
        for (int i = 0; i < cs.count; ++i) {
            Look one = Look::Default(K);
            one.items[slot] = static_cast<uint16_t>(i);
            const Shown d = Dress(K, one);
            const std::string model = Words(kCatalog[K].rules[cs.items[i].rule].show)[0];
            CHECK(d.has(model.c_str()));
            CHECK(std::strcmp(d.texture(model.c_str()), cs.items[i].texture) == 0);
        }
    }
}

static void TestDressFemale() {
    const int K = kKindFemale;
    Look l = Look::Default(K);
    Shown s = Dress(K, l);
    CHECK(s.has("body.feets") && !s.has("body.feets2"));   // flat feet, not the high-heel ones
    CHECK(s.has("fantasy_f_bikinitop") && s.has("fantasy_f_bikinibotton") && s.has("fantasy_f_hair1"));
    CHECK(s.has("body.torso1") && s.has("body.torso4") && s.has("body.legleft6") && s.has("body.makeup1") == false);
    // High heels: the heel feet instead of the flat ones.
    l.items[kShoes] = static_cast<uint16_t>(Find(K, kShoes, "Sepatu hak 1"));
    s = Dress(K, l);
    CHECK(s.has("fantasy_f_boot5") && s.has("body.feets2") && !s.has("body.feets") && !s.has("body.legleft5"));
    // Sneakers: no feet at all.
    l.items[kShoes] = static_cast<uint16_t>(Find(K, kShoes, "Sneakers 1"));
    s = Dress(K, l);
    CHECK(!s.has("body.feets") && !s.has("body.feets2") && s.has("body.legleft5"));
    // Make-up of head shape 2.
    l.head = 1;
    l.items[kMakeup] = 0;
    s = Dress(K, l);
    CHECK(s.has("body.makeup2") && s.has("body.head2") && s.has("body.eyebrown2") && !s.has("body.makeup1"));
    // Jeans hide the legs and the leg tattoos.
    l = Look::Default(K);
    l.items[kTatLegL] = 0;
    s = Dress(K, l);
    CHECK(s.has("fantasy_tatto_leg_l_1"));
    l.items[kPants] = static_cast<uint16_t>(Find(K, kPants, "Jeans 1"));
    s = Dress(K, l);
    CHECK(s.has("fantasy_f_pants1") && !s.has("fantasy_tatto_leg_l_1") && !s.has("body.legleft2"));
}

static void TestDressPolice() {
    // A male casual look on the police model: body traits kept, the uniform's defaults.
    Look l = Look::Default(kKindMale);
    l.model = 1;
    l.tone = 4;
    l.head = 2;
    l.items[kTatArmR] = 1;
    l.items[kShirt] = 0;
    Shown s = Dress(kKindMalePolice, l);
    CHECK(s.has("body.head3") && s.has("fantasy_tatto_arm_r") && s.has("fantasy_m_cop_short1"));   // training shorts
    CHECK(!s.has("fantasy_m_torso1"));
    CHECK(std::strcmp(s.texture("body.head3"), "7/heads/5/1.png") == 0);
    // A female look on a male model: the male defaults.
    Look f = Look::Default(kKindFemale);
    f.tone = 3;
    s = Dress(kKindMale, f);
    CHECK(s.has("fantasy_m_underwear") && std::strcmp(s.texture("body.head1"), "7/heads/1/1.png") == 0);
    // Female police: vest over the shirt, hat over the hair (the female hats keep the hair).
    const int K = kKindFemalePolice;
    Look p = Look::Default(K);
    p.items[kVest] = 0;
    p.items[kHat] = 0;
    s = Dress(K, p);
    CHECK(s.has("fantasy_f_hair1") && (s.has("fantasy_f_cop_vest1") || s.has("fantasy_f_cop_vest2") ||
                                       s.has("fantasy_f_cop_vest3")));
}

int main() {
    TestCatalog();
    TestLook();
    TestMessages();
    TestDressMale();
    TestDressFemale();
    TestDressPolice();
    std::printf("%d checks, %d failed\n", g_checks, g_failures);
    return g_failures ? 1 : 0;
}
