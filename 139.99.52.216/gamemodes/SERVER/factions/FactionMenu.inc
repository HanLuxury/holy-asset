DisplayFactionMenu(playerid)
{
    if (!AccountData[playerid][IsLoggedIn]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus login!");

    ShowFactionMenu(playerid);
    return 1;
}

ShowFactionMenu(playerid)
{
    if (AccountData[playerid][pFaction] == FACTION_POLISI)
    {
        new sha[600];
        strcat(sha, ""WHITE"Periksa Lisensi\n");
        strcat(sha, ""GRAY"Invoice belum terbayar\n");
        strcat(sha, ""WHITE"Kartu identitas\n");
        strcat(sha, ""GRAY"Geledah\n");
        strcat(sha, ""WHITE"Borgol\n");
        strcat(sha, ""GRAY"Lepas borgol\n");
        strcat(sha, ""WHITE"Seret\n");
        strcat(sha, ""GRAY"Lepas seret\n");
        strcat(sha, ""WHITE"Masukkan ke mobil\n");
        strcat(sha, ""GRAY"Keluarkan paksa\n");
        strcat(sha, ""WHITE"Invoice manual\n");
        strcat(sha, ""GRAY"Penjarakan\n");
        strcat(sha, ""WHITE"Bebaskan dari penjara\n");
        strcat(sha, ""GRAY"Ambil uang kotor\n");
        strcat(sha, ""WHITE"Lepaskan karung\n");
        strcat(sha, ""GRAY"Cek blacklist\n");
        strcat(sha, ""WHITE"Cek Senjata\n");
        strcat(sha, ""GRAY"Riwayat Kriminal\n");
        strcat(sha, ""WHITE"Buat catatan kriminal\n");
        strcat(sha, ""GRAY"Hapus catatan kriminal\n");
        ShowPlayerDialog(playerid, DIALOG_POLICE_PANEL, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Faction Panel (Polisi)", sha, "Pilih", "Batal");
    }
    
    if (AccountData[playerid][pFaction] == FACTION_PEMERINTAH)
    {
        new sha[300];
        strcat(sha, ""WHITE"Kartu identitas\n");
        strcat(sha, ""GRAY"Invoice belum terbayar\n");
        strcat(sha, ""WHITE"Invoice manual\n");
        strcat(sha, ""GRAY"Seret\n");
        strcat(sha, ""WHITE"Lepas seret\n");
        strcat(sha, ""GRAY"Borgol\n");
        strcat(sha, ""WHITE"Lepas borgol\n");
        strcat(sha, ""GRAY"Cek blacklist\n");
        ShowPlayerDialog(playerid, DIALOG_PEMERINTAH_PANEL, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Faction Panel (PEMER)", sha, "Pilih", "Batal");
    }

    if (AccountData[playerid][pFaction] == FACTION_EMS)
    {
        new str[300];
        strcat(str, ""WHITE"Revive\n");
        strcat(str, ""GRAY"Treatment\n");
        strcat(str, ""WHITE"Seret\n");
        strcat(str, ""GRAY"Lepas seret\n");
        strcat(str, ""WHITE"Borgol\n");
        strcat(str, ""GRAY"Lepas borgol\n");
        strcat(str, ""WHITE"Invoice belum terbayar\n");
        strcat(str, ""GRAY"Invoice manual\n");
        strcat(str, ""WHITE"Periksa\n");
        strcat(str, ""GRAY"Masukkan korban ke mobil\n");
        strcat(str, ""WHITE"Drop korban\n");
        strcat(str, ""GRAY"Cek blacklist\n");
        ShowPlayerDialog(playerid, DIALOG_EMS_PANEL, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Faction Panel (EMS)", str, "Pilih", "Batal");
    }

    if (AccountData[playerid][pFaction] == FACTION_BENGKEL)
    {
        new str[300];
        strcat(str, ""WHITE"Kartu identitas\n");
        strcat(str, ""GRAY"Invoice belum terbayar\n");
        strcat(str, ""WHITE"Invoice manual\n");
        strcat(str, ""GRAY"Cek blacklist\n");
        strcat(str, ""WHITE"Ikat\n");
        strcat(str, ""GRAY"Lepas ikatan\n");
        ShowPlayerDialog(playerid, DIALOG_BENGKEL_PANEL, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Faction Panel (Bennys)", str, "Pilih", "Batal");
    }

    if (AccountData[playerid][pFaction] == FACTION_PEDAGANG)
    {
        new str[300];
        strcat(str, ""WHITE"Invoice belum terbayar\n");
        strcat(str, ""GRAY"Kartu identitas\n");
        strcat(str, ""WHITE"Invoice manual\n");
        strcat(str, ""GRAY"Cek blacklist\n");
        Dialog_Show(playerid, DIALOG_PEDAGANG_PANEL, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Faction Panel (Restaurant)", str, "Pilih", "Batal");
    }

    if (AccountData[playerid][pFaction] == FACTION_GOJEK)
    {
        new str[400];
        strcat(str, ""WHITE"Revive\n");
        strcat(str, ""GRAY"Treatment\n");
        strcat(str, ""WHITE"Seret\n");
        strcat(str, ""GRAY"Lepas Seret\n");
        strcat(str, ""WHITE"Borgol\n");
        strcat(str, ""GRAY"Buka Borgol\n");
        strcat(str, ""WHITE"Invoice Belum Terbayar\n");
        strcat(str, ""GRAY"Periksa\n");
        strcat(str, ""WHITE"Cek Blacklist\n");
        Dialog_Show(playerid, DIALOG_TENTARA_PANEL, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Faction Panel (Tentara)", str, "Pilih", "Batal");
    }

    if (AccountData[playerid][pFamily] != -1)
    {
        new str[400];
        strcat(str, ""WHITE"Geledah\n");
        strcat(str, ""GRAY"Ikat\n");
        strcat(str, ""WHITE"Buka Ikatan\n");
        strcat(str, ""GRAY"Seret\n");
        strcat(str, ""WHITE"Lepas Seretan\n");
        strcat(str, ""GRAY"Masukan Mobil\n");
        strcat(str, ""WHITE"Keluarkan Paksa\n");
        strcat(str, ""GRAY"Karung\n");
        strcat(str, ""WHITE"Lepas Karung\n");
        strcat(str, ""GRAY"Ambil uang kotor\n");
        strcat(str, ""WHITE"Ambil Uang Paksa\n");
        strcat(str, ""GRAY"Cek Senjata\n");

        ShowPlayerDialog(playerid, DIALOG_FAMILY_PANEL, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE" - Faction Menu (Gang)", str, "Pilih", "Batal");
    }
    return 1;
}

Dialog:DialogKantongPanel(playerid, response, listitem, inputtext[])
{
    if (!response)
    {
        for (new i = 0; i < MAX_PLAYERS; i ++)
            NearestPlayer[playerid][i] = INVALID_PLAYER_ID;
        return 1;
    }
    
    new targetid = NearestPlayer[playerid][listitem];
    if (!IsPlayerConnected(targetid)) 
    {
        for (new i = 0; i < MAX_PLAYERS; i ++)
            NearestPlayer[playerid][i] = INVALID_PLAYER_ID;
        
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
    }

    if (targetid != INVALID_PLAYER_ID)
    {
        AccountData[playerid][pTarget] = targetid;
        DisplayFactionMenu(playerid);
    }
    return 1;
}

Dialog:PANEL_NONE(playerid, response, listitem, inputtext[])
{
    if (!response)
    {
        ShowTDN(playerid, NOTIFICATION_INFO, "Anda telah membatalkan pilihan");
        return 1;
    }

    new frmtx[255], count = 0;
    foreach(new i : Player) if (i != playerid) if (IsPlayerNearPlayer(playerid, i, 2.5))
    {
        format(frmtx, sizeof(frmtx), "%sPlayer ID: %d\n", frmtx, i);
        NearestPlayer[playerid][count ++] = i;
    }

    if (count != 0) {
        if (GetPVarInt(playerid, "OnCarry") && IsDragging[playerid] != INVALID_PLAYER_ID)
        {
            new CarryID = IsDragging[playerid];
            TogglePlayerControllable(CarryID, true);
            AccountData[CarryID][pDraggedBy] = INVALID_PLAYER_ID;
            
            IsDragging[playerid] = INVALID_PLAYER_ID;
            DeletePVar(playerid, "OnCarry");
            SendRPMeAboveHead(playerid, "Melepaskan gendongan", X11_LIGHTGREEN);
        }
        else
            Dialog_Show(playerid, PANEL_DRAG, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Drag/Undrag Person", frmtx, "Pilih", "Batal");
    } else {
        ShowTDN(playerid, NOTIFICATION_WARNING, "Tidak ada orang disekitar anda!");
        for (new i = 0; i < MAX_PLAYERS; i ++) NearestPlayer[playerid][i] = INVALID_PLAYER_ID;
    } 
    return 1;
}

Dialog:PANEL_DRAG(playerid, response, listitem, inputtext[])
{
    if (!response)
    {
        return ShowTDN(playerid, NOTIFICATION_INFO, "Anda telah membatalkan pilihan");
    }

    if (AccountData[playerid][pInjured])
    {
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat melakukan ini saat sedang pingsan!");
    }

    new targetid = NearestPlayer[playerid][listitem];
    if (!IsPlayerConnected(targetid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
    if (!IsPlayerNearPlayer(playerid, targetid, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak dekat dengan anda!");
    if (AccountData[playerid][pDraggedBy] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang digendong seseorang!");
    
    if (!GetPVarInt(playerid, "OnCarry") && IsDragging[playerid] == INVALID_PLAYER_ID)
    {
        Dialog_Show(targetid, PANEL_DRAGCONF, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE Roleplay "WHITE"- Drag/Undrag Person",
        "Seseorang ingin menggendong anda, apakah anda setuju?\nAnda dapat melepaskan gendongannya dengan '/uncarry'", "Setuju", "Tidak");
        AccountData[targetid][pDragOffer] = playerid;
        // foreach(new i : Player) if (IsPlayerConnected(i))
        // {
        //     if (IsDragging[i] == targetid) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang digendong seseorang!");
        // }

        // IsDragging[playerid] = targetid;
        // AccountData[targetid][pDraggedBy] = playerid;
        // ShowTDN(targetid, NOTIFICATION_WARNING, "Seseorang telah menggendong anda");
        
        // SetPVarInt(playerid, "OnCarry", 1);
    }
    return 1;
}

Dialog:PANEL_DRAGCONF(playerid, response, listitem, inputtext[])
{
    if (!response)
    {
        ShowTDN(AccountData[playerid][pDragOffer], NOTIFICATION_WARNING, "Pemain tersebut menolak untuk digendong!");
        AccountData[playerid][pDragOffer] = INVALID_PLAYER_ID;
        return 1;
    }

    new CarryID = AccountData[playerid][pDragOffer];
    if (!IsPlayerConnected(CarryID) || CarryID == INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
    if (!IsPlayerNearPlayer(playerid, CarryID, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak di dekat anda!");
    if (IsDragging[CarryID] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang menggendong orang lain!"); 

    IsDragging[CarryID] = playerid;
    SetPVarInt(CarryID, "OnCarry", 1);

    AccountData[playerid][pDraggedBy] = CarryID;
    AccountData[playerid][pDragOffer] = INVALID_PLAYER_ID;
    ShowTDN(CarryID, NOTIFICATION_INFO, "Anda menggendong seseorang");
    ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda menyetujui permintaan Dragging");
    return 1;
}