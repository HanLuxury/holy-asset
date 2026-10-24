/* =====================================================================
    SERVER/ui/ui_auth.inc
    EAGLE ROLEPLAY - Login, pilih karakter, buat karakter & pilih spawn
    (CEF Mobile, tanpa textdraw). Teks diisi lewat dialog SA-MP
    (keyboard HP), tampilan & tombol lewat CEF (event "auth").
    Cadangan: client tanpa CEF -> alur dialog biasa.
   ===================================================================== */
#if defined _eagle_ui_auth
    #endinput
#endif
#define _eagle_ui_auth

#include <YSI_Coding/y_hooks>

enum
{
    AUTH_VIEW_NONE,
    AUTH_VIEW_LOGIN,
    AUTH_VIEW_CHARS,
    AUTH_VIEW_CHARINFO,
    AUTH_VIEW_CREATE,
    AUTH_VIEW_SPAWN
}
new gAuthView[MAX_PLAYERS];
new bool:gAuthLoginPending[MAX_PLAYERS];
new gAuthSelSlot[MAX_PLAYERS];

/* ------------------------------ LOGIN ------------------------------ */
stock Auth_ShowLoginDialog(playerid, const errmsg[] = "")
{
    new frm[600];
    format(frm, sizeof(frm), ""WHITE"Selamat datang di "ALTHF"EAGLE ROLEPLAY\n%s"WHITE"UCP ini telah terdaftar!\nNama UCP: "LIGHTGREEN"%s\
    \n"WHITE"Version: "ALTHF"EAGLE 3.0\n"YELLOW"(Silahkan masukkan kata sandi anda untuk login):", errmsg, AccountData[playerid][pUCP]);
    return ShowPlayerDialog(playerid, DIALOG_LOGIN, DIALOG_STYLE_PASSWORD, "UCP - Login", frm, "Input", "Keluar");
}

stock Auth_ShowLogin(playerid)
{
    if (!CEF_IsReady(playerid))
    {
        // halaman UI belum siap -> tampil saat "ready", atau dialog saat timeout
        gAuthLoginPending[playerid] = true;
        return 1;
    }
    gAuthLoginPending[playerid] = false;
    gAuthView[playerid] = AUTH_VIEW_LOGIN;
    J_Begin();
    J_Str("v", "login");
    J_Str("ucp", AccountData[playerid][pUCP]);
    J_Str("srv", "EAGLE ROLEPLAY");
    J_Str("ver", "EAGLE 3.0");
    J_Int("att", LoginAttemps[playerid]);
    return J_Send(playerid, "auth");
}

stock Auth_OnCEFReady(playerid)
{
    if (gAuthLoginPending[playerid]) Auth_ShowLogin(playerid);
    return 1;
}

stock Auth_OnCEFTimeout(playerid)
{
    if (gAuthLoginPending[playerid])
    {
        gAuthLoginPending[playerid] = false;
        Auth_ShowLoginDialog(playerid);
    }
    return 1;
}

stock Auth_Hide(playerid)
{
    gAuthView[playerid] = AUTH_VIEW_NONE;
    J_Begin();
    J_Str("v", "none");
    return J_Send(playerid, "auth");
}

/* ------------------------------ PILIH KARAKTER ------------------------------ */
stock Auth_ShowChars(playerid)
{
    if (!CEF_IsReady(playerid))
    {
        // cadangan: daftar karakter lewat dialog
        new list[256], line[64], count = 0;
        for (new i = 0; i < MAX_CHARS; i++)
        {
            if (PlayerChar[playerid][i][0] != EOS)
            {
                format(line, sizeof(line), ""WHITE"%s\n", PlayerChar[playerid][i]);
                strcat(list, line);
                count++;
            }
        }
        if (count < MAX_CHARS) strcat(list, ""GREEN"+ Karakter Baru");
        return ShowPlayerDialog(playerid, DIALOG_CHARLIST, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Pilih Karakter", list, "Pilih", "Keluar");
    }
    gAuthView[playerid] = AUTH_VIEW_CHARS;
    J_Begin();
    J_Str("v", "chars");
    J_Str("ucp", AccountData[playerid][pUCP]);
    J_Int("sel", gAuthSelSlot[playerid]);
    J_Arr("slots");
    for (new i = 0; i < MAX_CHARS; i++)
    {
        J_Obj();
        if (PlayerChar[playerid][i][0] != EOS)
        {
            J_Str("name", PlayerChar[playerid][i]);
            J_Int("skin", CharacterSkin[playerid][i]);
        }
        else J_Int("empty", 1);
        J_End();
    }
    J_End();
    return J_Send(playerid, "auth");
}

stock Auth_ShowCharInfo(playerid, slot, const name[], gender, const age[], bank, cash, const job[], const lastlogin[])
{
    gAuthView[playerid] = AUTH_VIEW_CHARINFO;
    new money[24];
    J_Begin();
    J_Str("v", "charinfo");
    J_Int("slot", slot);
    J_Str("name", name);
    J_Int("skin", CharacterSkin[playerid][slot]);
    J_Str("gender", (gender == 1) ? ("Laki-laki") : ((gender == 2) ? ("Perempuan") : ("-")));
    J_Str("age", age);
    format(money, sizeof(money), "$%s", FormatMoney(bank)); J_Str("bank", money);
    format(money, sizeof(money), "$%s", FormatMoney(cash)); J_Str("cash", money);
    J_Str("job", job);
    J_Str("last", lastlogin);
    return J_Send(playerid, "auth");
}

/* ------------------------------ BUAT KARAKTER ------------------------------ */
stock Auth_ShowCreate(playerid)
{
    if (!CEF_IsReady(playerid)) return 0;
    gAuthView[playerid] = AUTH_VIEW_CREATE;
    new buf[32];
    J_Begin();
    J_Str("v", "create");
    if (AccountData[playerid][pBetulNama]) J_Str("name", AccountData[playerid][pTempName]);
    if (AccountData[playerid][pBetulAge]) J_Str("dob", AccountData[playerid][pAge]);
    if (AccountData[playerid][pBetulHeight])
    {
        format(buf, sizeof(buf), "%d cm", AccountData[playerid][pTinggiBadan]);
        J_Str("height", buf);
    }
    if (AccountData[playerid][pBetulWeight])
    {
        format(buf, sizeof(buf), "%d kg", AccountData[playerid][pBeratBadan]);
        J_Str("weight", buf);
    }
    if (AccountData[playerid][pBetulOrigin]) J_Str("origin", AccountData[playerid][pOrigin]);
    J_Int("gender", AccountData[playerid][pBetulGender] ? AccountData[playerid][pGender] : 0);
    return J_Send(playerid, "auth");
}

// Dipanggil setiap isian (nama, tgl lahir, dst) berhasil diisi lewat dialog.
stock Auth_CreateFieldDone(playerid, nextDialog)
{
    if (CEF_IsReady(playerid)) return Auth_ShowCreate(playerid);
    // cadangan tanpa CEF: lanjutkan rantai dialog
    switch (nextDialog)
    {
        case DIALOG_AGE: ShowPlayerDialog(playerid, DIALOG_AGE, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE Roleplay "WHITE"- Tanggal Lahir", "Mohon masukkan tanggal lahir sesuai format hh/bb/tttt cth: (25/09/2001)", "Input", "");
        case DIALOG_ORIGIN: ShowPlayerDialog(playerid, DIALOG_ORIGIN, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE Roleplay "WHITE"- Negara Kelahiran", "Mohon masukkan kembali negara asal kelahiran karakter.\nPerhatian: Masukkan nama negara yang valid (cth: Indonesia).", "Input", "");
        case DIALOG_TINGGIBADAN: ShowPlayerDialog(playerid, DIALOG_TINGGIBADAN, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE Roleplay "WHITE" - Tinggi Badan (cm)", "Mohon masukkan tinggi badan (cm) karakter!\nPerhatian: Format hanya berupa angka satuan cm (cth: 163).", "Input", "");
        case DIALOG_BERATBADAN: ShowPlayerDialog(playerid, DIALOG_BERATBADAN, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE Roleplay "WHITE" - Berat Badan (kg)", "Mohon masukkan berat badan (kg) karakter!\nPerhatian: Format hanya berupa angka satuan kg (cth: 75).", "Input", "");
        case DIALOG_GENDER: ShowPlayerDialog(playerid, DIALOG_GENDER, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Jenis Kelamin", ""WHITE"Laki-Laki\n"GRAY"Perempuan", "Pilih", "");
    }
    return 1;
}

stock Auth_CreateConfirm(playerid)
{
    if(AccountData[playerid][IsLoggedIn] || GetPVarInt(playerid,"EagleRegisterPending")) return 0;
    if (AccountData[playerid][pBetulNama] == 0) return Error(playerid, "Anda belum memasukkan nama karakter");
    if (AccountData[playerid][pBetulAge] == 0) return Error(playerid, "Anda belum memasukkan tanggal lahir");
    if (AccountData[playerid][pBetulHeight] == 0) return Error(playerid, "Anda belum memasukkan tinggi badan");
    if (AccountData[playerid][pBetulWeight] == 0) return Error(playerid, "Anda belum memasukkan berat badan");
    if (AccountData[playerid][pBetulGender] == 0) return Error(playerid, "Anda belum memilih jenis kelamin");
    if (AccountData[playerid][pBetulOrigin] == 0) return Error(playerid, "Anda belum memasukkan negara anda");

    if(!GetPVarInt(playerid,"CreateName") || !GetPVarInt(playerid,"CreateOrigin") || !GetPVarInt(playerid,"CreateAge") || !GetPVarInt(playerid,"CreateHeight") || !GetPVarInt(playerid,"CreateWeight")) return Error(playerid,"Lengkapi identitas karakter dahulu.");
    AccountData[playerid][pSkin]=EC_CarrierForGender(AccountData[playerid][pGender]);
    Auth_Hide(playerid);
    ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembuatan karakter berhasil!");
    CharacterState[playerid] = false;

    SetPlayerCameraPos(playerid, 534.065, -2102.218, 98.480);
    SetPlayerCameraLookAt(playerid, 531.651, -2098.260, 96.606);
    SetSpawnInfo(playerid, NO_TEAM, AccountData[playerid][pSkin], 1694.7468, -2332.3428, 13.5469, 0.0377, 0, 0, 0, 0, 0, 0);

    new characterQuery[178];
    if (GetPVarInt(playerid, "CreateName") && GetPVarInt(playerid, "CreateOrigin") && GetPVarInt(playerid, "CreateAge") && GetPVarInt(playerid, "CreateHeight") && GetPVarInt(playerid, "CreateWeight"))
    {
        mysql_format(g_SQL, characterQuery, sizeof(characterQuery), "INSERT INTO `player_characters` (`Char_Name`, `Char_UCP`, `Char_RegisterDate`) VALUES ('%e', '%e', CURRENT_TIMESTAMP())", AccountData[playerid][pTempName], AccountData[playerid][pUCP]);
        SetPVarInt(playerid,"EagleRegisterPending",1);
        mysql_tquery(g_SQL, characterQuery, "OnPlayerRegister", "dd", playerid,gECGeneration[playerid]);
        SetPlayerName(playerid, AccountData[playerid][pTempName]);
    }
    return 1;
}

/* ------------------------------ PILIH LOKASI SPAWN ------------------------------ */
static stock Auth_SpawnOpt(id, const title[], const sub[], const icon[], bool:disabled)
{
    J_Obj();
    J_Int("id", id);
    J_Str("t", title);
    J_Str("s", sub);
    J_Str("icon", icon);
    if (disabled) J_Int("dis", 1);
    J_End();
}

stock Auth_ShowSpawn(playerid)
{
    if(EC_PrepareSpawn(playerid)) return 1;
    gAuthView[playerid] = AUTH_VIEW_SPAWN;
    J_Begin();
    J_Str("v", "spawn");
    new bool:noHouse = (AccountData[playerid][pOwnedHouse] == -1 && AccountData[playerid][pFriendHouseID] == -1);
    new bool:noFaction = (AccountData[playerid][pFaction] == FACTION_NONE);
    new bool:noMotel = (AccountData[playerid][pOwnedRusun] == -1);
    J_Arr("opt");
    Auth_SpawnOpt(0, "Bandara", "Los Santos International Airport", "plane", false);
    Auth_SpawnOpt(1, "Pelabuhan", "Ocean Docks", "ship", false);
    Auth_SpawnOpt(2, "Rumah", noHouse ? ("Tidak punya rumah") : ("Rumah milik / teman"), "home", noHouse);
    Auth_SpawnOpt(3, "Instansi", noFaction ? ("Tidak ada faction") : ("Markas faction"), "shield", noFaction);
    Auth_SpawnOpt(4, "Motel", noMotel ? ("Tidak punya motel") : ("Rusun / motel milikmu"), "key", noMotel);
    Auth_SpawnOpt(5, "Lokasi Terakhir", "Posisi saat keluar", "pin", false);
    J_End();
    return J_Send(playerid, "auth");
}

stock Auth_SaveSpawnLocation(playerid)
{
    if (!IsPlayerConnected(playerid) || AccountData[playerid][pID] <= 0) return 0;

    new query[720];
    mysql_format(g_SQL, query, sizeof(query),
        "UPDATE `player_characters` SET `Char_PosX`='%f', `Char_PosY`='%f', `Char_PosZ`='%f', `Char_PosA`='%f', `Char_IntID`=%d, `Char_WID`=%d, `Char_InDoor`=%d, `Char_InHouse`=%d, `Char_InRusun`=%d, `Char_InBiz`=%d, `Char_InFamily`=%d, `Char_LastLogin`=CURRENT_TIMESTAMP() WHERE `pID`=%d",
        AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA],
        GetPlayerInterior(playerid), GetPlayerVirtualWorld(playerid),
        AccountData[playerid][pInDoor], AccountData[playerid][pInHouse], AccountData[playerid][pInRusun],
        AccountData[playerid][pInBiz], AccountData[playerid][pInFamily], AccountData[playerid][pID]);
    mysql_tquery(g_SQL, query);
    return 1;
}

static stock Auth_SpawnAt(playerid, Float:x, Float:y, Float:z, Float:a, bool:clearInside)
{
    // Cancel any login cinematic left by older versions before finalizing spawn.
    AccountData[playerid][pDiPesawat] = false;
    DisablePlayerCheckpoint(playerid);

    AccountData[playerid][pPosX] = x;
    AccountData[playerid][pPosY] = y;
    AccountData[playerid][pPosZ] = z;
    AccountData[playerid][pPosA] = a;
    SetPlayerInteriorEx(playerid, 0);
    SetPlayerVirtualWorldEx(playerid, 0);
    if (clearInside)
    {
        AccountData[playerid][pInDoor] = -1;
        AccountData[playerid][pInRusun] = -1;
        AccountData[playerid][pInFamily] = -1;
        AccountData[playerid][pInBiz] = -1;
    }
    SetPlayerPositionEx(playerid, x, y, z, a, 6000);
    SpawnMenu(playerid, false);
    ShowAlthafUpdate(playerid);
    AllGui_Status(playerid, false);
    ResetDynIdVars(playerid);
    AccountData[playerid][pSpawned] = 1;
    AccountData[playerid][playerClickSpawn] = 1;
    Auth_SaveSpawnLocation(playerid);
    return 1;
}

stock Auth_SpawnChoose(playerid, loc)
{
    switch (loc)
    {
        case 0: // bandara
        {
            new rand = random(sizeof(SpawnBandara));
            Auth_SpawnAt(playerid, SpawnBandara[rand][0], SpawnBandara[rand][1], SpawnBandara[rand][2], SpawnBandara[rand][3], false);
        }
        case 1: // pelabuhan
        {
            new rand = random(sizeof(SpawnPelabuhan));
            Auth_SpawnAt(playerid, SpawnPelabuhan[rand][0], SpawnPelabuhan[rand][1], SpawnPelabuhan[rand][2], SpawnPelabuhan[rand][3], false);
        }
        case 2: // rumah milik / teman
        {
            if (AccountData[playerid][pOwnedHouse] == -1 && AccountData[playerid][pFriendHouseID] == -1)
                return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki rumah!");
            foreach (new hid : House)
            {
                if (HouseData[hid][hsOwnerID] == AccountData[playerid][pID] || AccountData[playerid][pFriendHouseID] == hid)
                {
                    Auth_SpawnAt(playerid, HouseData[hid][hsExtPos][0], HouseData[hid][hsExtPos][1], HouseData[hid][hsExtPos][2], HouseData[hid][hsExtPos][3], true);
                    break;
                }
            }
        }
        case 3: // faction
        {
            if (AccountData[playerid][pFaction] == FACTION_NONE)
                return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak bergabung dengan faction apapun!");
            switch (AccountData[playerid][pFaction])
            {
                case FACTION_POLISI: Auth_SpawnAt(playerid, PoliceStuff[PoldaSpawnPOS][0], PoliceStuff[PoldaSpawnPOS][1], PoliceStuff[PoldaSpawnPOS][2], PoliceStuff[PoldaSpawnPOS][3], false);
                case FACTION_EMS: Auth_SpawnAt(playerid, EMSStuff[EMSSpawnPOS][0], EMSStuff[EMSSpawnPOS][1], EMSStuff[EMSSpawnPOS][2], EMSStuff[EMSSpawnPOS][3], false);
                case FACTION_PEMERINTAH: Auth_SpawnAt(playerid, PemerStuff[PemerSpawnPOS][0], PemerStuff[PemerSpawnPOS][1], PemerStuff[PemerSpawnPOS][2], PemerStuff[PemerSpawnPOS][3], false);
                default: return ShowTDN(playerid, NOTIFICATION_ERROR, "Faction Anda tidak memiliki spawn point!");
            }
        }
        case 4: // rusun / motel
        {
            if (AccountData[playerid][pOwnedRusun] == -1)
                return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki rusun/motel!");
            foreach (new rsid : Rusun)
            {
                if (RusunData[rsid][rusunOwnerID] == AccountData[playerid][pID])
                {
                    Auth_SpawnAt(playerid, RusunData[rsid][rusunExtPos][0], RusunData[rsid][rusunExtPos][1], RusunData[rsid][rusunExtPos][2], RusunData[rsid][rusunExtPos][3], true);
                    break;
                }
            }
        }
        case 5: // lokasi terakhir
        {
            ResetDynIdVars(playerid);
            SpawnMenu(playerid, false);
            SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
        }
    }
    return 1;
}

// Pengganti SpawnMenu versi textdraw (dipanggil dari LoadPlayerData dsb.)
stock SpawnMenu(playerid, bool:show = true)
{
    if (show)
    {
        if(EC_PrepareSpawn(playerid)) return 1;
        if (!CEF_IsReady(playerid))
        {
            ShowPlayerDialog(playerid, DIALOG_SPAWN_CEF, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Pilih Lokasi Spawn",
                "Bandara\nPelabuhan\nRumah\nInstansi / Faction\nMotel\nLokasi Terakhir", "Pilih", "");
            return 1;
        }
        Auth_ShowSpawn(playerid);
    }
    else
    {
        if (gAuthView[playerid] == AUTH_VIEW_SPAWN) Auth_Hide(playerid);
        AccountData[playerid][playerClickSpawn] = 1;
    }
    return 1;
}

/* ------------------------------ EVENT DARI UI ------------------------------ */
stock Auth_OnUI(playerid, const a[], i, const s[])
{
    if(EC_BlocksSpawn(playerid) && strcmp(a,"quit")) return 1;
    if (!strcmp(a, "pass"))            // tombol "Masukkan Password"
    {
        if (gAuthView[playerid] != AUTH_VIEW_LOGIN) return 1;
        return Auth_ShowLoginDialog(playerid);
    }
    if (!strcmp(a, "quit"))
    {
        SendClientMessage(playerid, X11_DARKORANGE, "[i] Anda keluar dari server.");
        return KickEx(playerid);
    }
    if (!strcmp(a, "slot"))            // pratinjau karakter
    {
        if (gAuthView[playerid] != AUTH_VIEW_CHARS || i < 0 || i >= MAX_CHARS) return 1;
        gAuthSelSlot[playerid] = i;
        if (PlayerChar[playerid][i][0] != EOS) SetPlayerSkin(playerid, CharacterSkin[playerid][i]);
        else SetPlayerSkin(playerid, EC_MALE_PED);
        ApplyAnimation(playerid, "PED", "fucku", 4.0, 0, 0, 0, 1, 0, 1);
        return 1;
    }
    if (!strcmp(a, "play"))            // pilih slot -> konfirmasi / buat baru
    {
        if (gAuthView[playerid] != AUTH_VIEW_CHARS || i < 0 || i >= MAX_CHARS) return 1;
        return ShowCharSpawnConfirmation(playerid, i);
    }
    if (!strcmp(a, "spawn"))           // konfirmasi main
    {
        if (gAuthView[playerid] != AUTH_VIEW_CHARINFO) return 1;
        if (PendingCharSpawn[playerid] != -1)
        {
            new slot = PendingCharSpawn[playerid];
            PendingCharSpawn[playerid] = -1;
            SpawnChar(playerid, slot);
        }
        return 1;
    }
    if (!strcmp(a, "cancel"))          // batal konfirmasi
    {
        PendingCharSpawn[playerid] = -1;
        return ShowCharacterList(playerid);
    }
    if (!strcmp(a, "field"))           // isi data karakter lewat dialog
    {
        if (gAuthView[playerid] != AUTH_VIEW_CREATE) return 1;
        if (!strcmp(s, "name"))
            ShowPlayerDialog(playerid, DIALOG_MAKE_CHAR, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE"WHITE" - Pembuatan Karakter",
            ""WHITE"Selamat Datang di "ALTHF"EAGLE\n"WHITE"Sebelum bermain anda harus membuat karakter terlebih dahulu\
            \nMasukkan nama karakter hanya dengan nama orang Indonesia\nCth: Althaf_Abraham, Jajang_Kejangkejang", "Input", "Batal");
        else if (!strcmp(s, "dob"))
            ShowPlayerDialog(playerid, DIALOG_AGE, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Tanggal Lahir", "Mohon masukkan tanggal lahir sesuai format hh/bb/tttt cth: (25/09/2001)", "Input", "Batal");
        else if (!strcmp(s, "height"))
            ShowPlayerDialog(playerid, DIALOG_TINGGIBADAN, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Tinggi Badan (cm)", "Mohon masukkan tinggi badan (cm) karakter!\nPerhatian: Format hanya berupa angka satuan cm (cth: 163).", "Input", "Batal");
        else if (!strcmp(s, "weight"))
            ShowPlayerDialog(playerid, DIALOG_BERATBADAN, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Berat Badan (kg)", "Mohon masukkan berat badan (kg) karakter!\nPerhatian: Format hanya berupa angka satuan kg (cth: 75).", "Input", "Batal");
        else if (!strcmp(s, "origin"))
            ShowPlayerDialog(playerid, DIALOG_ORIGIN, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Negara Kelahiran", "Mohon masukkan kembali negara asal kelahiran karakter.\nPerhatian: Masukkan nama negara yang valid (cth: Indonesia).", "Input", "Batal");
        return 1;
    }
    if (!strcmp(a, "gender"))
    {
        if (gAuthView[playerid] != AUTH_VIEW_CREATE || (i != 1 && i != 2)) return 1;
        AccountData[playerid][pGender] = i;
        AccountData[playerid][pSkin] = EC_CarrierForGender(i);
        AccountData[playerid][pBetulGender] = 1;
        SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
        return Auth_ShowCreate(playerid);
    }
    if (!strcmp(a, "create"))
    {
        if (gAuthView[playerid] != AUTH_VIEW_CREATE) return 1;
        return Auth_CreateConfirm(playerid);
    }
    if (!strcmp(a, "back"))
    {
        return ShowCharacterList(playerid);
    }
    if (!strcmp(a, "loc"))             // pilih lokasi spawn
    {
        if (gAuthView[playerid] != AUTH_VIEW_SPAWN) return 1;
        return Auth_SpawnChoose(playerid, i);
    }
    return 1;
}

hook OnPlayerConnect(playerid)
{
    gAuthView[playerid] = AUTH_VIEW_NONE;
    gAuthLoginPending[playerid] = false;
    gAuthSelSlot[playerid] = 0;
    return 1;
}

hook OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])
{
    if (dialogid == DIALOG_SPAWN_CEF)
    {
        if (!response) return SpawnMenu(playerid, true);
        Auth_SpawnChoose(playerid, listitem);
        return 1;
    }
    return 0;
}
