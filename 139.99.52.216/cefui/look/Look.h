#pragma once
// The look system in the game: the modular characters of the MTA resource "Clothes" (male, female and their
// police versions, LookCatalog.h) dressed per player, the body's height and width on every player, and the editor
// of the local player's own look. Data and wire format: LookData.h; what a look shows: LookDress.h.
//
// How a ped is dressed (libGTASA arm64, disassembled):
//  - every ped of a model shares the model's geometry and materials; the models' own textures are 1x1 and
//    transparent. Every material of such a model is made invisible: material alpha 0, which the OpenGL render
//    callbacks (_rxOpenGLDefaultAllInOneRenderCB, the MatFX one) skip without drawing;
//  - CPed::Render is hooked: while one ped is drawn, the materials its look shows get their texture and alpha
//    255, and afterwards their old values (the SetObjectMaterial way of this client). Every way a ped is drawn
//    (the world, passengers of a vehicle, the alpha list, the car reflection pass) goes through CPed::Render;
//  - the textures are PNG/JPEG files under TESTLIT/clothes/, decoded on a thread of their own and made into
//    game textures in the game's update, shared by every ped that wears them; while one loads its average colour
//    is drawn.
// The body: the clump's frame gets the ped's matrix scaled (height along up, width across), the feet kept on
// the ground, right after PreRender and before the ped's attachments and bones are updated
// (CWorld::ProcessPedsAfterPreRender), so the skin, the bones and what is attached to them follow.
#include <cstddef>
#include <cstdint>
#include <string>

class CPedSamp;

namespace look {

// game/hooks.cpp, with the other hooks: CPed::Render.
void InstallHooks();
// net/netgame.cpp, Packet_CustomRPC, RPC kRpc: the bytes after packet id and RPC id.
void Receive(const uint8_t* data, size_t size);
// net/playerpool.cpp: the player left.
void Forget(uint16_t player);
// java_systems/cef/CEF.cpp, the connection closed.
void Reset();
// net/netgame.cpp, every frame while connected: every player's plan, the textures.
void Process();
// game/World.cpp, ProcessPedsAfterPreRender, before the ped's ProcessAttach.
// true = frame clump ditulis ulang frame ini (skala badan), dipakai lean GTA V.
bool ApplyBody(uint16_t player, CPedSamp* ped);
// gui/gui.cpp: the editor, in the ImGui frame.
void RenderEditor();
// gui/gui.cpp, OnTouchEvent: the ImGui editor takes every touch while it is open (not the CEF one).
bool EditorOpen();
// java_systems/cef/CEF.cpp nativeSendEvent: page event "lookui" (any thread; queued for Process).
void OnPageEvent(const std::string& wrappedJson);
std::string Status();

}  // namespace look
