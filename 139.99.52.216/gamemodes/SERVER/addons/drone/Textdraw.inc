/* =====================================================================
    SERVER/addons/drone/Textdraw.inc
    Drone System (Althaf Abraham) - tampilan kamera drone versi CEF Mobile.
    Textdraw Althaf_DroneTD / Althaf_Thermal diganti view "drone":
      {show, op, alt, spd, pos, sig, th}   (dikirim hanya saat berubah, maks 5x/detik)
    Tombol di layar: THERMAL (a:"thermal") dan KELUAR (a:"exit").
   ===================================================================== */
#include <YSI_Coding/y_hooks>

static bool:gDroneUI[MAX_PLAYERS];
static gDroneUITick[MAX_PLAYERS];
static gDroneUILast[MAX_PLAYERS][192];

hook OnPlayerConnect(playerid)
{
    gDroneUI[playerid] = false;
    gDroneUITick[playerid] = 0;
    gDroneUILast[playerid][0] = EOS;
    return 1;
}

stock Drone_ToggleUI(playerid, bool:mode)
{
    gDroneUI[playerid] = mode;
    gDroneUITick[playerid] = 0;
    gDroneUILast[playerid][0] = EOS;
    if(!mode)
    {
        CEF_Overlay(playerid, "thermal", false);
        J_Begin();
        J_Int("show", 0);
        return J_Send(playerid, "drone");
    }
    return 1;
}

/* Perbarui HUD kamera drone (dipanggil dari ptask DroneUpdate) */
stock Drone_SendHUD(playerid, const op[], const alt[], const spd[], const pos[], const sig[], bool:thermal)
{
    if(!gDroneUI[playerid]) return 0;
    new now = GetTickCount();
    if(gDroneUILast[playerid][0] != EOS && now - gDroneUITick[playerid] < 200) return 0;

    J_Begin();
    J_Int("show", 1);
    J_Str("op", op);
    J_Str("alt", alt);
    J_Str("spd", spd);
    J_Str("pos", pos);
    J_Str("sig", sig);
    J_Int("th", thermal ? 1 : 0);
    J_Close();
    if(J_Equals(gDroneUILast[playerid])) return 0;
    J_CopyTo(gDroneUILast[playerid], 192);
    gDroneUITick[playerid] = now;
    return J_Send(playerid, "drone");
}

/* Dipanggil router CEF (v = "drone") */
stock Drone_OnUI(playerid, const a[])
{
    if(!PlayerDroneMode[playerid]) return Drone_ToggleUI(playerid, false);
    new droneID = Drone_GetPlayerDrone(playerid);
    if(droneID == -1) return 1;

    if(!strcmp(a, "thermal")) return Drone_ToggleThermal(playerid, droneID, !Drone[droneID][thermalActive]);
    if(!strcmp(a, "exit")) return Drone_ResetCamera(playerid);
    return 1;
}
