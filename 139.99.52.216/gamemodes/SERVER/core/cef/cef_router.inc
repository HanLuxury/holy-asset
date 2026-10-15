/* =====================================================================
    SERVER/core/cef/cef_router.inc
    EAGLE ROLEPLAY - Router event UI CEF -> handler tiap sistem.
    Dipasang PALING AKHIR di Main.pwn (setelah semua modul).
   ===================================================================== */
#if defined _eagle_cef_router
    #endinput
#endif
#define _eagle_cef_router

/* Dipanggil saat halaman UI selesai dimuat (event "ready"), dan saat antrean event UI pemain
   dipindah karena macet (CEFX_ChannelStall) supaya semua tampilan dikirim ulang. */
stock CEFUI_OnReady(playerid, bool:first)
{
    #pragma unused first
    Auth_OnCEFReady(playerid);
    Hud_OnCEFReady(playerid);
    Quickbar_OnCEFReady(playerid);
    Phone_OnCEFReady(playerid);          // EAGLE PHONE v24: pulihkan HP & panggilan
    ClothesCEF_OnCEFReady(playerid);     // FIX6: pakaian (state sebelum UI siap tidak terkirim)
    return 1;
}

/* Reset status tampilan CEF tiap modul saat pemain connect */
stock CEFUI_ResetPlayer(playerid)
{
    gRadialOpen[playerid] = false;
    gRadialPage[playerid] = 0;
    gHelpPage[playerid] = 0;
    gHelpAdmin[playerid] = 0;
    return 1;
}

/* Semua klik UI: v = id tampilan/panel, a = aksi, i = index, s = teks */
stock CEFUI_Route(playerid, const v[], const a[], i, const s[])
{
    if (!strcmp(v, "jslog")) return CEF_JsLog(playerid, a, s);   // error JavaScript -> server_log.txt
    if (!strcmp(v, "cef")) return CEF_OnPageCmd(playerid, a, i, s); // halaman UI: muat ulang otomatis (file gagal dimuat)
    if (!strcmp(v, "diag")) return CEF_DiagReply(playerid, i, 1, s);  // balasan tes /cefcek lewat jalur "ui"
    if (!strcmp(v, "interact")) return Eagle_InteractOnUI(playerid, a, i);
    if (!strcmp(v, "auth")) return Auth_OnUI(playerid, a, i, s);
    if (!strcmp(v, "update") || !strcmp(v, "death")) return Hud_OnUI(playerid, v, a);
    if (!strcmp(v, "radio")) return Radio_OnUI(playerid, a);
    if (!strcmp(v, "inv"))
    {
        if (!strcmp(a, "quickuse")) return Quickbar_Use(playerid, i);
        return Inventory_OnUI(playerid, a, i, s);
    }
    if (!strcmp(v, "radial")) return Radial_OnUI(playerid, a);
    if (!strcmp(v, "help")) return Help_OnUI(playerid, a, i);
    if (!strcmp(v, "hudsettings")) return HUDPrefs_OnUI(playerid, a, i, s);   // EAGLE HUD v25: simpan tata letak
    if (!strcmp(v, "phone")) return Phone_OnUI(playerid, a, i, s);
    if (!strcmp(v, "emote", false, 5)) return Emote_OnUI(playerid, v, a, i);
    if (!strcmp(v, "gacha")) return Gacha_OnUI(playerid, a);
    if (!strcmp(v, "paylog") || !strcmp(v, "paycheck")) return Paycheck_OnUI(playerid, v, a);
    if (!strcmp(v, "clothes", false, 7)) return ClothesCEF_OnUI(playerid, v, a, i, s);
    if (!strcmp(v, "cloth")) return ClothSel_OnUI(playerid, a, i);
    if (!strcmp(v, "garage")) return Garage_OnUI(playerid, a, i);
    if (!strcmp(v, "gov", false, 3)) return Gov_OnUI(playerid, v, a, i);
    if (!strcmp(v, "showroom")) return Showroom_OnUI(playerid, a);
    if (!strcmp(v, "toys")) return Toys_OnUI(playerid, a, i);
    if (!strcmp(v, "shop")) return Menu_OnUI(playerid, a, i);
    if (!strcmp(v, "toll")) return Toll_OnUI(playerid, a);
    if (!strcmp(v, "atm")) return Atm_OnUI(playerid, a, i, s);
    if (!strcmp(v, "hint")) return Hint_OnUI(playerid, a);
    if (!strcmp(v, "target")) return Target_OnUI(playerid, a);
    if (!strcmp(v, "idcard")) return IdCard_OnUI(playerid, a);
    if (!strcmp(v, "abox")) return ABox_OnUI(playerid, a, s);
    if (!strcmp(v, "hack")) return Hack_OnUI(playerid, a, i);
    if (!strcmp(v, "mixer")) return Mixer_OnUI(playerid, a, i);
    if (!strcmp(v, "casino")) return Casino_OnUI(playerid, a);
    if (!strcmp(v, "drone")) return Drone_OnUI(playerid, a);
    if (!strcmp(v, "race")) return Race_OnUI(playerid, a, i);
    if (!strcmp(v, "msel")) return Sel_OnUI(playerid, a, i);
    if (!strcmp(v, "flist")) { if (!strcmp(a, "close")) ShowPlayerFactionList(playerid, false); return 1; }
    return 0;
}
