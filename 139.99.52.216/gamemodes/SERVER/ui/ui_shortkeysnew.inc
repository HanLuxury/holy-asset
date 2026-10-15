/* =====================================================================
    SERVER/ui/ui_shortkeysnew.inc
    EAGLE ROLEPLAY - Petunjuk tombol (text UI) CEF Mobile.
    ShowNotifBox(playerid, "Garasi Umum")  ->  kotak [F] Garasi Umum
    di bawah layar (gaya FiveM). Di Android kotak ini BISA DITEKAN:
    server mensimulasikan tombol ALT (KEY_WALK) sehingga semua handler
    OnPlayerKeyStateChange yang lama tetap berjalan seperti biasa.
   ===================================================================== */
#include <YSI_Coding/y_hooks>

static bool:gHintShown[MAX_PLAYERS];

ShowNotifBox(playerid, const text[])
{
    gHintShown[playerid] = true;
    J_Begin();
    J_Int("show", 1);
    J_Str("t", text);
    J_Str("k", "ALT");
    J_Send(playerid, "hint");
    PlayerPlaySound(playerid, 1058, 0, 0, 0);
    return 1;
}

HideNotifBox(playerid)
{
    if (!gHintShown[playerid]) return 1;
    gHintShown[playerid] = false;
    J_Begin();
    J_Int("show", 0);
    J_Send(playerid, "hint");
    return 1;
}

/* Dipanggil router CEF (v = "hint") saat kotak petunjuk ditekan */
stock Hint_OnUI(playerid, const a[])
{
    if (!strcmp(a, "press") && gHintShown[playerid])
        CallLocalFunction("OnPlayerKeyStateChange", "iii", playerid, KEY_WALK, 0);
    return 1;
}

hook OnPlayerConnect(playerid)
{
    gHintShown[playerid] = false;
    return 1;
}
