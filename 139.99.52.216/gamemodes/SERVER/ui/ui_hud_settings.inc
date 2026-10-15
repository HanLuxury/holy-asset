/* =====================================================================
   EAGLE ROLEPLAY - HUD Settings (EAGLE HUD v25)
   Editor HUD ada di CEF (cefui/js/hud_settings.js): tata letak, posisi,
   ukuran, gaya status/speedometer/lokasi/uang, warna aksen, opsi.

   Pengaturan disimpan per KARAKTER di tabel `eagle_hud_prefs` supaya
   tidak hilang walau cache aplikasi dihapus / ganti HP:
     - CEF -> server : ("hudsettings", "save", -1, "<teks pengaturan>")
     - server -> CEF : event "hudcfg" {d: "<teks pengaturan>"}
   Teks pengaturan berformat ringkas "25|preset|k=v,...|komponen:x:y:..."
   dan hanya boleh berisi huruf, angka dan | , = : ; . -

   Perintah: /hud, /hudeditor, /hudsettings (membuka editor)
   ===================================================================== */
#if defined _eagle_ui_hud_settings
    #endinput
#endif
#define _eagle_ui_hud_settings

#define HUDPREF_MAX             (1600)

static gHudPrefNext[MAX_PLAYERS];

forward HUDPrefs_OnLoad(playerid, cid);

/* dipanggil sekali di OnGameModeInit (setelah koneksi MySQL) */
stock HUDPrefs_InstallSchema()
{
    mysql_query(g_SQL, "CREATE TABLE IF NOT EXISTS `eagle_hud_prefs` (`cid` INT NOT NULL, `data` VARCHAR(1600) NOT NULL DEFAULT '', `ts` INT NOT NULL DEFAULT 0, PRIMARY KEY (`cid`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;", false);
    return 1;
}

stock bool:HUDPrefs_Valid(const s[])
{
    new len = strlen(s);
    if (len < 10 || len > HUDPREF_MAX) return false;
    if (strcmp(s, "25|", false, 3)) return false;
    for (new i = 0; i < len; i++)
    {
        new c = s[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) continue;
        if (c == '|' || c == ',' || c == '=' || c == ':' || c == ';' || c == '.' || c == '-') continue;
        return false;
    }
    return true;
}

/* kirim pengaturan tersimpan ke CEF (dipanggil saat karakter dimuat & saat CEF siap) */
stock HUDPrefs_Load(playerid)
{
    if (!IsPlayerConnected(playerid) || !CEF_IsReady(playerid)) return 0;
    new cid = AccountData[playerid][pID];
    if (cid <= 0) return 0;
    new q[128];
    mysql_format(g_SQL, q, sizeof(q), "SELECT `data` FROM `eagle_hud_prefs` WHERE `cid`=%d LIMIT 1", cid);
    mysql_tquery(g_SQL, q, "HUDPrefs_OnLoad", "dd", playerid, cid);
    return 1;
}

public HUDPrefs_OnLoad(playerid, cid)
{
    if (!IsPlayerConnected(playerid) || AccountData[playerid][pID] != cid) return 0;
    new data[HUDPREF_MAX + 1];
    if (cache_num_rows()) cache_get_value_name(0, "data", data, sizeof(data));
    if (!HUDPrefs_Valid(data)) data[0] = EOS;
    J_Begin();
    J_Str("d", data);
    return J_Send(playerid, "hudcfg");
}

/* aksi dari editor HUD (cef_router.inc: v = "hudsettings") */
stock HUDPrefs_OnUI(playerid, const a[], i, const s[])
{
    if (!AccountData[playerid][IsLoggedIn]) return 1;
    if (!strcmp(a, "save"))
    {
        new cid = AccountData[playerid][pID];
        if (cid <= 0 || !HUDPrefs_Valid(s)) return 1;
        new now = gettime();
        if (now < gHudPrefNext[playerid]) return 1;         // cegah spam simpan
        gHudPrefNext[playerid] = now + 2;
        new q[HUDPREF_MAX + 220];
        mysql_format(g_SQL, q, sizeof(q), "INSERT INTO `eagle_hud_prefs` (`cid`,`data`,`ts`) VALUES (%d,'%e',%d) ON DUPLICATE KEY UPDATE `data`=VALUES(`data`),`ts`=VALUES(`ts`)", cid, s, now);
        mysql_tquery(g_SQL, q);
        return 1;
    }
    if (!strcmp(a, "close") && i == 1)
        return ShowTDN(playerid, NOTIFICATION_SUKSES, "Pengaturan HUD tersimpan.");
    return 1;
}

stock HUDSettings_Show(playerid)
{
    if(!IsPlayerConnected(playerid)) return 0;
    if(!CEF_IsReady(playerid))
        return ShowTDN(playerid, NOTIFICATION_WARNING, "Tampilan CEF belum siap, coba lagi sebentar.");

    J_Begin();
    J_Int("show", 1);
    J_Int("player", playerid);
    J_Send(playerid, "hudsettings");
    return 1;
}

CMD:hudsettings(playerid, const params[])
{
    #pragma unused params
    return HUDSettings_Show(playerid);
}

CMD:hud(playerid, const params[])
{
    #pragma unused params
    return HUDSettings_Show(playerid);
}

CMD:hudeditor(playerid, const params[])
{
    #pragma unused params
    return HUDSettings_Show(playerid);
}
