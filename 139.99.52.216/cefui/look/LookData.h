#pragma once
// The look of a player on the modular characters (the MTA resource "Clothes", LookCatalog.h): which model, skin
// tone, head shape, hair, face, every piece of clothing and every tattoo, and the body (height and weight of the
// character). The gamemode keeps it in its database (SERVER/player/look/) and sends it to every client that has
// the player streamed in; the client draws it on the ped (LookGame.cpp) and the player edits his own in the
// editor (LookEditor.cpp).
//
// Wire format, packet 251 (ID_CUSTOM_RPC) with the uint32 RPC id kRpc, then (all numbers little endian):
//   u8 version (2), u8 op
//   op 1 look:   u16 player, u32 revision, look (kLookBytes)
//   op 2 forget: u16 player
//   op 3 open:   u32 session, u8 flags (bit 0: female), u8 n, n x (u8 model, u8 kind, u16 skin), look  (editor)
//   op 4 close:  u32 session, u8 result (0 closed, 1 saved)
// look: u8 format (2), u16 skin, u8 model (0: an ordinary skin, 1: the modular character), u8 kind (1..4: whose
//       catalog the items are, also kept while an ordinary skin is worn), u8 tone (0..5), u8 head (0..4),
//       u16 item per slot x 24 (0xFFFF: nothing), u8 height (cm), u8 weight (kg).
// Client -> server: the CEF event "look" (CCEF::SendEvent, OnPlayerCEFEvent in the gamemode) with the text
//   "save <session> <look as hex>", "cancel <session>" or "cam <session> <0..2>".
// No game dependencies: tested on the host (look/tests/).
#include <cstddef>
#include <cstdint>
#include <string>
#include <string_view>
#include <vector>

#include "LookCatalog.h"

namespace look {

constexpr uint32_t kRpc = 0x4B4F4F4Cu;   // "LOOK"
constexpr uint8_t kVersion = 2;
constexpr uint8_t kFormat = 2;
// As at character creation (gamemode ui_auth.inc: 151..199 cm, 41..94 kg).
constexpr int kMinHeight = 151, kMaxHeight = 199, kMinWeight = 41, kMaxWeight = 94;
constexpr int kDefaultHeight = 172, kDefaultWeight = 68;
constexpr size_t kLookBytes = 1 + 2 + 1 + 1 + 1 + 1 + 2 * kSlots + 2;
constexpr size_t kMaxOptions = 8;

struct Look {
    uint16_t skin = 0;
    uint8_t model = 0;            // 1: the modular character of `kind` is worn
    uint8_t kind = kKindMale;     // 1..4
    uint8_t tone = 0, head = 0;
    uint16_t items[kSlots];
    uint8_t height = kDefaultHeight, weight = kDefaultWeight;

    Look();                       // a male character in his default clothes, not worn
    static Look Default(int kind);
    void Reset(int kind);         // `kind`'s defaults, not worn, default body
    bool operator==(const Look& o) const;
    bool operator!=(const Look& o) const { return !(*this == o); }
    bool modular() const { return model != 0; }
};

// Items within the kind's catalog, required slots worn, tone/head/body within their ranges.
bool Valid(const Look& l);
void Encode(const Look& l, uint8_t out[kLookBytes]);
bool Decode(const uint8_t* data, size_t size, Look& out);   // exactly kLookBytes, and Valid
std::string ToHex(const Look& l);
bool FromHex(std::string_view hex, Look& out);

// The look moved to another kind of the same gender (police uniform and back): skin tone, head, hair, face and
// tattoos stay (their lists are the same), the clothes are the new kind's defaults. Another gender: its defaults.
Look Convert(const Look& l, int kind);

// How the body is drawn: scales of the ped's frame.
struct Body {
    float height = 1.0f;   // along the ped's up axis
    float width = 1.0f;    // across (right and forward)
};
Body BodyOf(const Look& l);

// A model the editor offers: an ordinary skin (model 0) or a modular kind.
struct ModelOption {
    uint8_t model = 0;
    uint8_t kind = 0;
    uint16_t skin = 0;
};

enum class Op : uint8_t { Look = 1, Forget = 2, Open = 3, Close = 4 };
struct Message {
    Op op = Op::Look;
    uint16_t player = 0;
    uint32_t revision = 0;
    uint32_t session = 0;
    bool female = false;
    uint8_t result = 0;
    std::vector<ModelOption> options;
    Look look;
};
bool Parse(const uint8_t* data, size_t size, Message& out);
// The server's side, for the tests and the documentation of the format.
std::vector<uint8_t> Build(const Message& m);

// Client -> server.
std::string SaveEvent(uint32_t session, const Look& l);
std::string CancelEvent(uint32_t session);
std::string CameraEvent(uint32_t session, int view);

}  // namespace look
