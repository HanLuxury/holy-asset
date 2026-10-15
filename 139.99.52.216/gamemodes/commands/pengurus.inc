#include <YSI/y_hooks>

SSCANF:VotingMenu(string[])
{
	if(!strcmp(string,"create",true)) return 1;
	else if(!strcmp(string,"end",true)) return 2;
	return 0;
}

alias:gmessage("serverann")
CMD:gmessage(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 5) return PermissionError(playerid);

	new text[256];
	if(sscanf(params, "s[256]", text)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/gmessage [pesan]");
	if(strlen(text) < 1 || strlen(text) > 256) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pesan tidak dapat kurang dari 1 atau lebih dari 256 characters!");
	
	ShowGlobalMessage(playerid, text, 7000);
	return 1;
}

CMD:vote(playerid, params[])
{
	static action, nextParams[128];
	
	if(AccountData[playerid][pAdmin] < 3)
		return PermissionError(playerid);
	
	if(sscanf(params, "k<VotingMenu>S()[128]", action, nextParams))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/vote (create, end)");
	
	switch(action)
	{
		case 1: // Create
		{
			new string[128], time;
			if(sscanf(nextParams, "ds[128]", time, string)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/voting [lama waktu voting (menit)] [text]");
			if(strlen(string) > 128) return ShowTDN(playerid, NOTIFICATION_ERROR, "Max Characters 128 only!");
			if(time < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat memasukkan waktu dibawah 1 menit!");
			if(OpenVote || VoteTime != 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Sudah ada voting yang sedang berjalan sekarang!");

			OpenVote = 1;
			VoteTime = gettime() + time*60;
			format(VoteText, sizeof(VoteText), string);
			SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah memulai Voting. Waktu Voting Hanya "YELLOW"%d Menit", AccountData[playerid][pAdminname], time);
			SendClientMessageToAllEx(-1, ""YELLOW"VOTE:"WHITE" %s // YES: %d // NO: %d", VoteText, VoteYes, VoteNo);
			SendClientMessageToAllEx(-1, "~> Gunakan "GREEN"ALT"WHITE" untuk Yes & "RED"N"WHITE" untuk Tidak");
		}
		case 2: //delete
		{
			if(!OpenVote) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada voting yang sedang berlangsung!");

			OpenVote = 0;
			VoteYes = 0;
			VoteNo = 0;
			VoteTime = 0;
			VoteText[0] = EOS;
			foreach(new i : Player) if (IsPlayerConnected(i))
			{
				PlayerVoting[playerid] = false;
			}
			SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah menghentikan Voting Server yang sedang berlangsung!", AccountData[playerid][pAdminname]);
		}
	}
	return 1;
}

CMD:resetweapoff(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6)
		return PermissionError(playerid);
	
	new playerName[32];
	if(sscanf(params, "s[32]", playerName)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/resetweapoff [player name]");
	foreach(new i : Player) if (IsPlayerConnected(i) && AccountData[i][pSpawned])
	{
		if(!strcmp(AccountData[i][pName], playerName, true))
		{
			ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang online!");
			return 1;
		}
	}

	new string[178];
	mysql_format(g_SQL, string, sizeof(string), "SELECT * FROM `player_characters` WHERE `Char_Name`='%e'", playerName);
	mysql_tquery(g_SQL, string, "OffResetWeapon", "ds", playerid, playerName);
	return 1;
}

forward OffResetWeapon(playerid, name[]);
public OffResetWeapon(playerid, name[])
{
	if(!cache_num_rows())
	{
		return ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Tidak ditemukan akun dengan nama %s", name));
	}
	else
	{
		new RegID, string[178];
		cache_get_value_name_int(0, "pID", RegID);

		for(new i = 0; i < 13; i++) {
			mysql_format(g_SQL, string, sizeof(string), "UPDATE `player_characters` SET `Gun%d`=0, `Ammo%d`=0 WHERE `pID`=%d", i+1, i+1, RegID);
			mysql_query(g_SQL, string, false);
		}
		SendStaffMessage(X11_TOMATO, "%s telah mereset (offline) senjata milik player %s", AccountData[playerid][pAdminname], name);
	}
	return 1;
}

CMD:resetplaytime(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/resetplaytime [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

	AccountData[otherid][OnlineTimer] = 0;
	SendStaffMessage(X11_TOMATO, "%s telah mereset playtime %s(%d)", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	return 1;
}

CMD:clearwarn(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 6)
        return PermissionError(playerid);
    
    new otherid;
    if(sscanf(params, "u", otherid)) 
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/clearwarn [name/playerid]");
    
    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
    
    AccountData[otherid][pWarn] = 0;
    SendClientMessageEx(otherid, X11_ORANGERED, "AdmCmd: %s telah menghapus membersihkan seluruh riwayat peringatan anda (%d warning)", AccountData[playerid][pAdminname], AccountData[otherid][pWarn]);
    SendStaffMessage(X11_TOMATO, "%s telah menghapus semua point warning player %s(%d).", AccountData[playerid][pAdminname], ReturnName(otherid), otherid);
    
    new query[178];
    mysql_format(g_SQL, query, sizeof(query), "DELETE FROM `warninglogs` WHERE `pID`='%d'", AccountData[otherid][pID]);
    mysql_query(g_SQL, query, false);
    return 1;
}

alias:setredmoney("srm")
CMD:setredmoney(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 5) return PermissionError(playerid);

	new otherid, value;
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setredmoney [name/playerid] [ammount]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value < 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukkan nominal kurang dari $0!");

	AccountData[otherid][pRedMoney] = value;
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s menetapkan Red Money anda menjadi "RED"%s", AccountData[playerid][pAdminname], FormatMoney(value));
	SendStaffMessage(X11_TOMATO, "%s menetapkan Red Money pemain %s(%d) menjadi %s", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid, FormatMoney(value));
	
	new shstr[255];
	format(shstr, sizeof(shstr), "Menggunakan command /setmoney kepada UCP:[%s] Name:[%s] Dengan Value $%d", AccountData[otherid][pUCP], AccountData[otherid][pName], value);
	AddAdminLog(AccountData[playerid][pUCP], AccountData[playerid][pName], GetStaffRank(playerid), shstr);
	return 1;
}

alias:setfaction("setfact")
CMD:setfaction(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;

	if (AccountData[playerid][pAdmin] < 5) return PermissionError(playerid);

	new otherid, fid, rank, tss[128];
	if(sscanf(params, "udd", otherid, fid, rank)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setfaction [name/playerid], [faction id] [pangkat]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(fid < 0 || fid > 7) return ShowTDN(playerid, NOTIFICATION_ERROR, "Faction ID tidak valid! (0 - 7");
	if(rank < 0 || rank > 15) return ShowTDN(playerid, NOTIFICATION_ERROR, "Rank ID tidak valid! (0 - 15)");

	if(fid == FACTION_NONE)
	{
		AccountData[otherid][pFaction] = FACTION_NONE;
		AccountData[otherid][pFactionRank] = 0;

		RefreshFactionMap(otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menghapus faction anda.", GetAdminName(playerid));
		SendStaffMessage(X11_TOMATO, "%s telah menghapus faction %s(%d).", GetAdminName(playerid), AccountData[otherid][pName], otherid);
		
		mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=0, `Char_FactionRank`=0 WHERE `pID`=%d", AccountData[otherid][pID]);
		mysql_tquery(g_SQL, tss);
	}
	else 
	{
		if(fid == FACTION_BENGKEL && AccountData[playerid][pWorkshop] != -1)
			Error(playerid, "Pemain tersebut telah menjadi anggota workshop");
		
		new factionid = fid;
		if(factionid == 1){
			if(rank < 1 || rank > 15)
				return ShowTDN(playerid, NOTIFICATION_INFO, "Pangkat Kepolisian hanya dari 1-15.");

			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);		
			//UpdateHudUI(otherid);			
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
		else if(factionid == 3){
			if(rank < 1 || rank > 11)
				return ShowTDN(playerid, NOTIFICATION_INFO, "Pangkat EMS hanya dari 1-11.");

			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
		else if(factionid == 2){
			if(rank < 1 || rank > 9)
				return ShowTDN(playerid, NOTIFICATION_INFO, "Pangkat Pemerintah hanya dari 1-9.");

			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
		else if(factionid == 4){
			if(rank < 1 || rank > 6)
				return ShowTDN(playerid, NOTIFICATION_INFO, "Pangkat Transportasi hanya dari 1-6.");

			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
		else if(factionid == 5){
			if(rank < 1 || rank > 6)
				return ShowTDN(playerid, NOTIFICATION_INFO, "Pangkat Bengkel hanya dari 1-6.");

			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
		else if(factionid == 6){
			if(rank < 1 || rank > 6)
				return ShowTDN(playerid, NOTIFICATION_INFO, "Pangkat Restaurant hanya dari 1-6.");

			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
		else if(factionid == 7){
			if(rank < 1 || rank > 5)
				return ShowTDN(playerid, NOTIFICATION_INFO, "Pangkat Tentara hanya dari 1-6.");

			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
		else {
			AccountData[otherid][pFaction] = fid;
			AccountData[otherid][pFactionRank] = rank;

			RefreshFactionMap(otherid);
			SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan anda menjadi Factions %s - %s.", GetAdminName(playerid), GetFactName(otherid), GetFactionRank(otherid));
			SendStaffMessage(X11_TOMATO, "%s telah menetapkan Factions %s(%d) - %s - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetFactName(otherid), GetFactionRank(otherid));
			
			mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d WHERE `pID`=%d", fid, rank, AccountData[otherid][pID]);
			mysql_tquery(g_SQL, tss);
		}
	}
	static tmp[125];
	format(tmp, sizeof(tmp), "Menggunakan cmd /setfaction kepada %s menjadi Faction %s - %s.", AccountData[otherid][pName], GetFactName(otherid), GetFactionRank(otherid));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);
	return 1;
}

CMD:playnearsong(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 5)
		return PermissionError(playerid);

	new songname[128], tmp[512], Float:x, Float:y, Float:z;
	if (sscanf(params, "s[128]", songname))
	{
		ShowTDN(playerid, NOTIFICATION_SYNTAX, "/playnearsong <link>");
		return 1;
	}
	
	GetPlayerPos(playerid, x, y, z);
	format(tmp, sizeof(tmp), "%s", songname);
	foreach(new ii : Player)
	{
		if(IsPlayerInRangeOfPoint(ii, 35.0, x, y, z))
		{
			PlayAudioStreamForPlayer(ii, tmp, x, y, z, 35.0, 1);
			Info(ii, "/stopsong, /togsong");
		}
	}
	return 1;
}

alias:updatedb("saveall", "saveallplayer", "backupdb")
CMD:updatedb(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 5) return PermissionError(playerid);
	foreach(new i : Player) if (IsPlayerConnected(i))
	{
		UpdatePlayerData(i);
	}
	foreach(new i : PvtVehicles) if (PlayerVehicle[i][pVehExists])
	{
		SavePlayerVehicle(i);
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" Telah membackup semua data pemain online ke "PINK1"EAGLE ROLEPLAY Database", AccountData[playerid][pAdminname]);
	return 1;
}

CMD:achangename(playerid, params[])
{
    if(!SQL_IsCharacterLogged(playerid))
        return 0;
    
    if(AccountData[playerid][pAdmin] < 6) 
        return PermissionError(playerid);

    new otherid, frmtname[24];
    if(sscanf(params, "us[24]", otherid, frmtname)) 
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/achangename [name/playerid] [new name]");

    if(!IsPlayerConnected(otherid)) 
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

    if(strlen(frmtname) < 4 || strlen(frmtname) > 24) 
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Nama tidak boleh kurang dari 4 character atau lebih dari 24 characters!");

    if(!IsValidName(frmtname)) 
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Format nama tidak valid!");

    new query[255];
    mysql_format(g_SQL, query, sizeof(query), 
        "SELECT `Char_Name` FROM `player_characters` WHERE `Char_Name`='%e'", 
        frmtname
    );
    mysql_tquery(g_SQL, query, "ChangedName", "dds", otherid, playerid, frmtname);
    return 1;
}

forward ChangedName(otherPlayer, playerid, const name[]);
public ChangedName(otherPlayer, playerid, const name[])
{
    if(!cache_num_rows())
    {
        new oldname[24], newname[24], query[255];
        GetPlayerName(otherPlayer, oldname, sizeof(oldname));

        mysql_format(g_SQL, query, sizeof(query), 
            "UPDATE `player_characters` SET `Char_Name`='%e' WHERE `pID`=%d", 
            name, AccountData[otherPlayer][pID]
        );
        mysql_tquery(g_SQL, query);

        // Update data kepemilikan
        for(new id; id < MAX_RUMAH; id++) if (HouseData[id][hsOwnerID] == AccountData[otherPlayer][pID]) 
        {
            format(HouseData[id][hsOwner], MAX_PLAYER_NAME, name);
            HouseRefresh(id);
            HouseSave(id);
        }

        for(new id; id < MAX_DYNAMIC_RUSUN; id++) if (RusunData[id][rusunOwnerID] == AccountData[otherPlayer][pID])
        {
            format(RusunData[id][rusunOwner], MAX_PLAYER_NAME, name);
            Rusun_Refresh(id);
            Rusun_Save(id);
        }    

        for(new id; id < MAX_FAMILIES; id ++) if(!strcmp(FamData[id][famLeader], oldname, true))
        {
            mysql_format(g_SQL, query, sizeof(query), 
                "UPDATE `families` SET `F_Leader`='%e' WHERE `F_Leader`='%e'", 
                name, oldname
            );
            mysql_tquery(g_SQL, query);
        }

        if(AccountData[playerid][PurchasedToy])
        {
            mysql_format(g_SQL, query, sizeof(query), 
                "UPDATE `toys` SET `Owner`='%e' WHERE `Owner`='%e'", 
                name, oldname
            );
            mysql_tquery(g_SQL, query);
        }

        // INFO ke player & staff
        SendClientMessageEx(otherPlayer, X11_ARWIN, 
            "AdmCmd: %s telah mengubah nama anda. %s ~> %s", 
            AccountData[playerid][pAdminname], oldname, name
        );
        SendStaffMessage(X11_TOMATO, 
            "%s telah mengubah nama pemain %s(%d) menjadi %s", 
            AccountData[playerid][pAdminname], oldname, otherPlayer, name
        );

        // Set nama baru
        SetPlayerName(otherPlayer, name);
        GetPlayerName(otherPlayer, newname, sizeof(newname));
        AccountData[otherPlayer][pName] = newname;

        // LOG ke Discord
        SendChangeNameLog(AccountData[playerid][pAdminname], oldname, newname);
    }
    else 
    {
        return ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Sudah ada akun dengan nama %s di database!", name));
    }
    return 1;
}