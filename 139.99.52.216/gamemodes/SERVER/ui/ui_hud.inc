/* =====================================================================
    SERVER/ui/ui_hud.inc
    EAGLE ROLEPLAY - HUD CEF Mobile (pengganti semua textdraw HUD):
    status (3 gaya), info pemain, speedometer, lokasi/kompas, FPS,
    watermark, footer, warning, pengumuman, badai/restart, asuransi,
    spectate, layar pingsan, alert tembakan, segel pemain baru,
    overlay stres/karung, info job, dan layar update server.
   ===================================================================== */
#if defined _eagle_ui_hud
    #endinput
#endif
#define _eagle_ui_hud

#include <YSI_Coding/y_hooks>

static gHudLast[MAX_PLAYERS][200];
static gSpeedoLast[MAX_PLAYERS][120];
static gLocLast[MAX_PLAYERS][160];
static bool:gLocOn[MAX_PLAYERS];
static bool:gHudVisible[MAX_PLAYERS];
static bool:gSpeedoOn[MAX_PLAYERS];
static bool:gDeathOn[MAX_PLAYERS];
new gHudVoice[MAX_PLAYERS] = {2, ...};

/* ------------------------------ HUD STATUS ------------------------------ */
stock Hud_Update(playerid, bool:force = false)
{
    if (!CEF_IsReady(playerid)) return 0;
    new bool:show = gHudVisible[playerid] && AccountData[playerid][pSpawned] && !GetPVarInt(playerid, "AllGuiStatus_Hide");
    new mode = AccountData[playerid][pHUDMode];
    if (mode < 1 || mode > 3) mode = 1;

    J_Begin();
    J_Int("show", show ? 1 : 0);
    J_Int("mode", mode);
    J_Int("hp", GetHealth(playerid));
    J_Int("ar", GetArmor(playerid));
    J_Int("hg", AccountData[playerid][pHunger]);
    J_Int("th", AccountData[playerid][pThirst]);
    J_Int("st", AccountData[playerid][pStress]);
    J_Int("vm", gHudVoice[playerid]);
    new bool:info = AccountData[playerid][pInfoPlayerShown] && GetPlayerState(playerid) != PLAYER_STATE_DRIVER && GetPlayerState(playerid) != PLAYER_STATE_PASSENGER;
    J_Int("info", info ? 1 : 0);
    if (info)
    {
        new buf[96], fname[64], fid = AccountData[playerid][pFamily];
        J_Int("id", playerid);
        J_Int("cash", AccountData[playerid][pMoney]);
        J_Int("bank", AccountData[playerid][pBankMoney]);
        format(buf, sizeof(buf), "%s - %s", GetFactName(playerid), GetPlayerJobName(playerid));
        J_Str("job", buf);
        if (fid != -1) format(fname, sizeof(fname), "%s", FamData[fid][famName]); else fname = "Civilian";
        format(buf, sizeof(buf), "%s - %s", fname, GetFamilyRank(playerid));
        J_Str("fac", buf);
        J_Int("on", Player_Count);
    }
    J_Close();
    // kirim hanya jika berubah (hemat paket)
    if (!force && J_Equals(gHudLast[playerid])) return 1;
    J_CopyTo(gHudLast[playerid], sizeof(gHudLast[]));
    return J_Send(playerid, "hud");
}

stock Hud_SetVisible(playerid, bool:show)
{
    gHudVisible[playerid] = show;
    return Hud_Update(playerid, true);
}

stock Hud_SetVoiceMode(playerid, level)
{
    gHudVoice[playerid] = level;
    return Hud_Update(playerid, true);
}

/* ------------------------------ SPEEDOMETER ------------------------------ */
stock Speedo_Show(playerid, bool:show)
{
    gSpeedoOn[playerid] = show;
    gSpeedoLast[playerid][0] = EOS;
    if (!show)
    {
        // lokasi tetap tampil saat jalan kaki (EAGLE HUD v25); disembunyikan oleh Location_Update
        // bila semua GUI disembunyikan (AllGuiStatus_Hide)
        CEF_Toggle(playerid, "speedo", "speedo", false);
        return 1;
    }
    new vehid = GetPlayerVehicleID(playerid);
    if (IsValidVehicle(vehid)) Speedo_Update(playerid, vehid);
    return 1;
}

stock Speedo_Update(playerid, vehid)
{
    if (!gSpeedoOn[playerid] || !CEF_IsReady(playerid)) return 0;
    new speed = GetVehicleSpeedKMH(vehid);
    new Float:vh; GetVehicleHealth(vehid, vh);
    new hp = floatround((vh - 250.0) / 7.5);
    if (hp < 0) hp = 0; else if (hp > 100) hp = 100;
    new engine, lights, alarm, doors, bonnet, boot, objective;
    GetVehicleParamsEx(vehid, engine, lights, alarm, doors, bonnet, boot, objective);
    new gear[4];
    if (speed == 0) gear = "N";
    else { new level = speed / 10; if (level > 5) level = 5; if (level < 1) level = 1; valstr(gear, level); }

    J_Begin();
    J_Int("show", 1);
    J_Int("kmh", speed);
    J_Str("gear", gear);
    J_Int("fuel", floatround(GetFuel(vehid)));
    J_Int("hp", hp);
    J_Int("eng", (engine == 1) ? 1 : 0);
    J_Int("lig", (lights == 1) ? 1 : 0);
    J_Int("lock", (doors == 1) ? 1 : 0);
    J_Close();
    if (J_Equals(gSpeedoLast[playerid])) return 1;
    J_CopyTo(gSpeedoLast[playerid], sizeof(gSpeedoLast[]));
    return J_Send(playerid, "speedo");
}

/* ------------------------------ LOKASI / KOMPAS ------------------------------ */
stock Location_Show(playerid, bool:show)
{
    gLocLast[playerid][0] = EOS;
    if (!show)
    {
        gLocOn[playerid] = false;
        return CEF_Toggle(playerid, "location", "location", false);
    }
    return Location_Update(playerid);
}

/* Dikirim tiap detik (hanya bila isinya berubah), saat jalan kaki maupun
   di kendaraan. Editor HUD di CEF yang memutuskan tampil saat jalan kaki.
     dir  : arah (N, NE, ...)      hd : arah kompas 0-355 (0 = utara, 90 = timur)
     z / c: nama daerah / kota     zone: "daerah, kota" (format lama)
     veh  : 1 bila di dalam kendaraan */
stock Location_Update(playerid)
{
    if (!CEF_IsReady(playerid)) return 0;
    if (!AccountData[playerid][pSpawned] || GetPVarInt(playerid, "AllGuiStatus_Hide"))
    {
        if (!gLocOn[playerid]) return 1;
        gLocOn[playerid] = false;
        gLocLast[playerid][0] = EOS;
        return CEF_Toggle(playerid, "location", "location", false);
    }
    new zone[32], dir[24], city[32], Float:ang, bool:inveh = (IsPlayerInAnyVehicle(playerid) != 0);
    GetPlayer2DZone(playerid, zone, sizeof(zone));
    format(dir, sizeof(dir), "%s", GetPlayerDirection(playerid));
    format(city, sizeof(city), "%s", GetPlayerCity(playerid));
    if (inveh) GetVehicleZAngle(GetPlayerVehicleID(playerid), ang);
    else GetPlayerFacingAngle(playerid, ang);
    new hd = floatround(360.0 - ang) % 360;
    if (hd < 0) hd += 360;
    hd = (hd / 5) * 5;          // dibulatkan 5 derajat supaya paket tidak terlalu sering
    new h, m, s; gettime(h, m, s);
    new tm[8]; format(tm, sizeof(tm), "%02d:%02d", h, m);
    new zc[72]; format(zc, sizeof(zc), "%s, %s", zone, city);
    J_Begin();
    J_Int("show", 1);
    J_Str("dir", dir);
    J_Int("hd", hd);
    J_Str("zone", zc);
    J_Str("z", zone);
    J_Str("c", city);
    J_Str("time", tm);
    J_Int("veh", inveh ? 1 : 0);
    J_Close();
    if (gLocOn[playerid] && J_Equals(gLocLast[playerid])) return 1;
    J_CopyTo(gLocLast[playerid], sizeof(gLocLast[]));
    gLocOn[playerid] = true;
    return J_Send(playerid, "location");
}

/* ------------------------------ FPS ------------------------------ */
static bool:gFpsShown[MAX_PLAYERS];
stock Fps_Update(playerid)
{
    if (!CEF_IsReady(playerid)) return 0;
    if (!AccountData[playerid][pFPSDisplay] || GetPVarInt(playerid, "AllGuiStatus_Hide"))
    {
        if (!gFpsShown[playerid]) return 1;
        gFpsShown[playerid] = false;
        return CEF_Toggle(playerid, "fps", "fps", false);
    }
    gFpsShown[playerid] = true;
    J_Begin();
    J_Int("show", 1);
    J_Int("fps", GetPlayerFPS(playerid));
    J_Int("ping", GetPlayerPing(playerid));
    new pl[16]; format(pl, sizeof(pl), "%.2f%%", GetPlayerPacketLoss(playerid));
    J_Str("pl", pl);
    // sama seperti textdraw lama: CPU/GPU adalah angka acak (hiasan)
    J_Int("cpu", random(101));
    J_Int("gpu", random(101));
    return J_Send(playerid, "fps");
}

/* ------------------------------ WATERMARK (ui_names) ------------------------------ */
stock Watermark_Show(playerid, bool:show)
{
    J_Begin();
    J_Int("show", show ? 1 : 0);
    J_Str("t", "EAGLE");
    J_Str("s", "ROLEPLAY");
    return J_Send(playerid, "watermark");
}

/* ------------------------------ FOOTER / WARNING / PENGUMUMAN ------------------------------ */
stock Hud_Footer(playerid, const text[], duration = 3000)
{
    return CEF_Banner(playerid, "footer", true, "", text, "info", "", duration, "bottom", "", true);
}
stock Hud_FooterHide(playerid)
{
    return CEF_Banner(playerid, "footer", false);
}
stock Hud_Warning(playerid, const text[], const by[], duration = 6000)
{
    return CEF_Banner(playerid, "warning", true, "WARNING!", text, "err", "warn", duration, "mid", by);
}
stock Hud_WarningHide(playerid)
{
    return CEF_Banner(playerid, "warning", false);
}
stock Hud_Announce(const text[], const by[], duration = 6000)
{
    return CEF_BannerAll("global", true, "ANNOUNCEMENT", text, "gold", "chat", duration, "top", by);
}
stock Hud_AnnounceHide()
{
    return CEF_BannerAll("global", false);
}

/* ------------------------------ RESTART (BADAI) & ASURANSI ------------------------------ */
stock Hud_StormBanner(playerid, const timeText[])
{
    new msg[96];
    format(msg, sizeof(msg), "Server akan memulai pembersihan dalam ~r~%s", timeText);
    return CEF_Banner(playerid, "storm", true, "PERINGATAN!!", msg, "err", "warn", 0, "top2");
}
stock Hud_StormBannerAll(const timeText[])
{
    foreach (new p : Player) Hud_StormBanner(p, timeText);
    return 1;
}
stock Hud_StormHideAll()
{
    return CEF_BannerAll("storm", false);
}
stock Hud_InsuranceBanner(playerid, const timeText[])
{
    return CEF_Banner(playerid, "insurance", true, "VEHICLE INSURANCE", timeText, "gold", "car", 0, "top");
}
stock Hud_InsuranceBannerAll(const timeText[])
{
    foreach (new p : Player) Hud_InsuranceBanner(p, timeText);
    return 1;
}
stock Hud_InsuranceHideAll()
{
    return CEF_BannerAll("insurance", false);
}

/* ------------------------------ SPECTATE ------------------------------ */
stock Spec_Show(playerid, bool:show)
{
    if (!show) return CEF_Toggle(playerid, "spectate", "spectate", false);
    return 1;
}
stock Spec_Update(playerid, targetid)
{
    J_Begin();
    J_Int("show", 1);
    J_Str("name", ReturnName(targetid));
    J_Int("id", targetid);
    J_Int("cash", AccountData[targetid][pMoney]);
    J_Int("hp", GetHealth(targetid));
    J_Int("ar", GetArmor(targetid));
    J_Int("int", GetPlayerInterior(targetid));
    J_Int("vw", GetPlayerVirtualWorld(targetid));
    J_Int("hg", AccountData[targetid][pHunger]);
    J_Int("th", AccountData[targetid][pThirst]);
    J_Int("fps", GetPlayerFPS(targetid));
    J_Int("ping", GetPlayerPing(targetid));
    return J_Send(playerid, "spectate");
}

/* ------------------------------ LAYAR PINGSAN ------------------------------ */
stock Death_Show(playerid, bool:show)
{
    if (!show)
    {
        if (!gDeathOn[playerid]) return 1;
        gDeathOn[playerid] = false;
        J_Begin(); J_Int("show", 0);
        return J_Send(playerid, "death");
    }
    gDeathOn[playerid] = true;
    return 1;
}
stock Death_Update(playerid, minutes, seconds, ems, bool:canRespawn)
{
    gDeathOn[playerid] = true;
    J_Begin();
    J_Int("show", 1);
    J_Int("m", minutes);
    J_Int("s", seconds);
    J_Int("ems", ems);
    J_Int("rs", canRespawn ? 1 : 0);
    return J_Send(playerid, "death");
}
// tombol layar pingsan (dulu tombol Y = sinyal EMS, ALT = konfirmasi koma)
stock Death_OnUI(playerid, const a[])
{
    if (!AccountData[playerid][pInjured]) return 1;
    if (!strcmp(a, "signal"))
    {
        if(SignalExists[playerid]) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sudah mengirim signal, tunggu hingga EMS merespon!");

        GetPlayerPos(playerid, SignalPos[playerid][0], SignalPos[playerid][1], SignalPos[playerid][2]);
        SignalExists[playerid] = true;
        SignalTimer[playerid] = 120;
        ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil mengirim sinyal kepada EMS!");
        foreach(new i : Player) if (AccountData[i][pSpawned] && AccountData[i][pFaction] == FACTION_EMS) if (AccountData[i][pDutyEms])
        {
            SendClientMessageEx(i, -1, ""RED"[Emergency Signal]"WHITE" Signal terlah diterima dari daerah "YELLOW"%s", GetLocation(SignalPos[playerid][0], SignalPos[playerid][1], SignalPos[playerid][2]));
            Info(i, "Buka Smartphone ~> GPS ~> Signal Emergency (EMS) jika ingin merespon signal");
        }
        return 1;
    }
    if (!strcmp(a, "respawn"))
    {
        if(AccountData[playerid][pInjuredTime] <= 300)
        {
            Dialog_Show(playerid, DeathRespawnConf, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE Roleplay "WHITE"- Konfirmasi Koma",
            "Apakah anda benar benar yakin ingin melakukan tindakan ini?\n"RED"NOTE: Tindakan ini dapat menghilangkan semua barang di tas termasuk uang cash", "Iya", "Tidak");
        }
        else Info(playerid, "Kamu harus menunggu setidaknya hingga waktu tersisa 5 menit untuk mengonfirmasi koma.");
        return 1;
    }
    return 1;
}

/* ------------------------------ ALERT TEMBAKAN (polisi) ------------------------------ */
stock Hud_ShotAlert(playerid, const gender[], const weapon[], const location[])
{
    new msg[96], foot[96];
    format(msg, sizeof(msg), "Gender: %s  |  Senjata: %s", gender, weapon);
    format(foot, sizeof(foot), "Lokasi: %s  -  Baru saja", location);
    return CEF_Banner(playerid, "shots", true, "10-11 PENEMBAKAN", msg, "err", "warn", 5000, "top2", foot);
}

/* ------------------------------ SEGEL PEMAIN BARU ------------------------------ */
stock Hud_Segel(playerid, bool:show, const timeText[] = "")
{
    if (!show) return CEF_Banner(playerid, "segel", false);
    return CEF_Banner(playerid, "segel", true, "KAMU PLAYER BARU", "Tunggu sampai waktu habis untuk bisa menembak, memegang senjata & aktivitas kriminal.",
        "gold", "info", 0, "bottom", timeText, true);
}

/* ------------------------------ INFO JOB (dulu BusWait) ------------------------------ */
stock JobInfo_Show(playerid, const text[], duration = 0)
{
    return CEF_Banner(playerid, "jobinfo", true, "", text, "info", "info", duration, "bottom", "", true);
}
stock JobInfo_Hide(playerid)
{
    return CEF_Banner(playerid, "jobinfo", false);
}

/* ------------------------------ UPDATE SERVER (changelog) ------------------------------ */
stock UpdatePanel_Show(playerid, const dateText[])
{
    P_Begin("update", "EAGLE ROLEPLAY", "Berita pemberitahuan terkini KOTA EAGLE ROLEPLAY.", "star", "c", 28, true, true);
    P_TilesBegin();
    P_Tile("Server Update", dateText, "gift");
    P_TilesEnd();
    P_ListBegin("", -1, "list", 0, "none");
    for (new i = 0; i < AlthafUpdateCount; i++)
    {
        if (AlthafUpdateList[i][AlthafUpdateText][0] == EOS) continue;
        P_Item(AlthafUpdateList[i][AlthafUpdateText], "", "", "check");
    }
    P_ListEnd();
    P_Footer();
    P_Btn("close", "Tutup", "p", "check");
    return P_Send(playerid);
}

/* ------------------------------ KOTAK AKSI (text UI + tombol) ------------------------------
   Kotak petunjuk di sisi kiri layar (gaya FiveM) untuk aktivitas: gym, job, minigame, dll.
   Setiap tombol bisa DITEKAN di Android -> server mensimulasikan tombol keyboard
   sehingga handler OnPlayerKeyStateChange yang lama tetap berjalan apa adanya.
   Kode tombol: ALT, H, Y, N, F, C, LMB, RMB, SPACE, SHIFT, 2
   Pemakaian:
       ABox_Begin("gym", "GYM", 45, "Latihan untuk mengurangi stress");
       ABox_Key("ALT", "Untuk Latihan");
       ABox_Key("H", "Untuk Berhenti");
       ABox_Send(playerid);
       ...  ABox_Hide(playerid, "gym");
   ----------------------------------------------------------------------------------------- */
stock ABox_KeyCode(const k[])
{
    if (!strcmp(k, "ALT", true)) return KEY_WALK;
    if (!strcmp(k, "H", true)) return KEY_CTRL_BACK;
    if (!strcmp(k, "Y", true)) return KEY_YES;
    if (!strcmp(k, "N", true)) return KEY_NO;
    if (!strcmp(k, "F", true) || !strcmp(k, "ENTER", true)) return KEY_SECONDARY_ATTACK;
    if (!strcmp(k, "C", true)) return KEY_CROUCH;
    if (!strcmp(k, "LMB", true)) return KEY_FIRE;
    if (!strcmp(k, "RMB", true)) return KEY_HANDBRAKE;
    if (!strcmp(k, "SPACE", true)) return KEY_SPRINT;
    if (!strcmp(k, "SHIFT", true)) return KEY_JUMP;
    if (!strcmp(k, "2", true)) return KEY_SUBMISSION;
    return 0;
}
stock ABox_Begin(const id[], const title[], pct = -1, const msg[] = "")
{
    J_Begin();
    J_Int("show", 1);
    J_Str("id", id);
    J_Str("t", title);
    if (pct >= 0) J_Int("pct", pct);
    if (msg[0]) J_Str("m", msg);
    J_Arr("keys");
}
stock ABox_Key(const k[], const text[])
{
    J_Obj(); J_Str("k", k); J_Str("t", text); J_End();
}
stock ABox_Send(playerid)
{
    return J_Send(playerid, "abox");
}
stock ABox_Hide(playerid, const id[])
{
    return CEF_Toggle(playerid, "abox", id, false);
}
stock ABox_OnUI(playerid, const a[], const s[])
{
    if (strcmp(a, "key")) return 1;
    new key = ABox_KeyCode(s);
    if (key) CallLocalFunction("OnPlayerKeyStateChange", "iii", playerid, key, 0);
    return 1;
}

/* ------------------------------ SIAP ------------------------------ */
stock Hud_OnCEFReady(playerid)
{
    gHudLast[playerid][0] = EOS;
    gSpeedoLast[playerid][0] = EOS;
    gLocLast[playerid][0] = EOS;
    gLocOn[playerid] = false;
    gFpsShown[playerid] = false;
    if (AccountData[playerid][IsLoggedIn]) HUDPrefs_Load(playerid);     // EAGLE HUD v25: tata letak tersimpan
    if (AccountData[playerid][IsLoggedIn] && AccountData[playerid][pSpawned])
    {
        Hud_Update(playerid, true);
        Location_Update(playerid);
        Fps_Update(playerid);
        if (GetPlayerState(playerid) == PLAYER_STATE_DRIVER) Speedo_Show(playerid, true);
        if (!GetPVarInt(playerid, "AllGuiStatus_Hide")) Watermark_Show(playerid, true);
    }
    new times[3], txt[16];
    if (g_RestartServer)
    {
        GetElapsedTime(g_RestartTime, times[0], times[1], times[2]);
        format(txt, sizeof(txt), "%02d:%02d", times[1], times[2]);
        Hud_StormBanner(playerid, txt);
    }
    if (g_AsuransiTime)
    {
        GetElapsedTime(g_AsuransiTime, times[0], times[1], times[2]);
        format(txt, sizeof(txt), "%02d:%02d", times[1], times[2]);
        Hud_InsuranceBanner(playerid, txt);
    }
    return 1;
}

stock Hud_OnUI(playerid, const v[], const a[])
{
    if (!strcmp(v, "update"))
    {
        HideAlthafUpdate(playerid);
        AllGui_Status(playerid, true);
        return 1;
    }
    if (!strcmp(v, "death")) return Death_OnUI(playerid, a);
    return 0;
}

hook OnPlayerConnect(playerid)
{
    gHudLast[playerid][0] = EOS;
    gSpeedoLast[playerid][0] = EOS;
    gLocLast[playerid][0] = EOS;
    gLocOn[playerid] = false;
    gHudVisible[playerid] = true;
    gSpeedoOn[playerid] = false;
    gDeathOn[playerid] = false;
    gFpsShown[playerid] = false;
    gHudVoice[playerid] = 2;
    return 1;
}
