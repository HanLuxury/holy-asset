#pragma once
// Shared by LookGame.cpp and LookEditor.cpp (not on the host).
#include <cstdint>
#include <string>
#include <vector>

#include "LookData.h"

class CPedSamp;

namespace look::detail {

struct Editor {
    bool open = false;
    uint32_t session = 0;
    bool female = false;
    std::vector<ModelOption> options;   // what the server offers (an ordinary skin, the modular kinds)
    Look saved;          // as the server has it
    Look draft;          // what the player sees
    uint32_t changedAt = 0;
    int tab = 0;
    int view = 0;        // camera preset sent to the server
    bool waiting = false;
    uint32_t waitingSince = 0;
    float x = 0, y = 0, w = 0, h = 0;   // the window, last frame
    // V159 editor on the CEF page (LookCef.cpp): 0 ImGui, 1 page asked (waiting for its "ack"), 2 page.
    int cef = 0;
    uint32_t cefSince = 0;
    bool waitNotified = false;
};

Editor& TheEditor();
// The local player's ped, nullptr before spawn.
CPedSamp* LocalPed();
// The draft changed: the local ped shows it (its model at once, the clothes in the next frame).
void DraftChanged();
// The editor closed: the local ped goes back to the saved look and model.
void EditorClosed();
// Turns the local ped (done by Process()).
void Rotate(float degrees);
// Sends a CEF event "look" to the server.
void Send(const std::string& text);
// LookEditor.cpp: a random look for the draft (button "Acak").
void RandomizeDraft();
// LookCef.cpp: the editor on the CEF page (op Open / Close, every Process).
void CefOpen();
void CefClosed(uint32_t session, int result);
void CefProcess(uint32_t now);

}  // namespace look::detail
