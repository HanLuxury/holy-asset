/* Commands Pengurus */

CMD:camerapos2(playerid, params[])
{
    new Float:x, Float:y, Float:z;
    new Float:vx, Float:vy, Float:vz;
    new Float:angle, Float:tx, Float:ty, Float:tz;

    GetPlayerCameraPos(playerid, x, y, z);
    GetPlayerCameraFrontVector(playerid, vx, vy, vz);

    new Float:lookX = x + vx;
    new Float:lookY = y + vy;
    new Float:lookZ = z + vz;

    GetPlayerPos(playerid, x, y, z);
    GetPlayerFacingAngle(playerid, angle);

    tx = x + (1.5 * floatsin(-angle, degrees));
    ty = y + (1.5 * floatcos(-angle, degrees));
    tz = z + 0.7;

    InterpolateCameraPos(playerid, x, y, z + 0.7, x, y, z + 0.7, 3000, CAMERA_MOVE);
    InterpolateCameraLookAt(playerid, lookX, lookY, lookZ, tx, ty, tz, 3000, CAMERA_MOVE);

    return 1;
}

CMD:camerapos(playerid, params[]) {

    new Float:x, Float:y, Float:z;
    new Float:vx, Float:vy, Float:vz;
    GetPlayerCameraPos(playerid, x, y, z);
    GetPlayerCameraFrontVector(playerid, vx, vy, vz);

    vx+=x;
    vy+=y;
    vz+=z;

    printf("SetPlayerCameraPos(playerid, %.2f, %.2f, %.2f);", x, y, z);
    printf("SetPlayerCameraLookAt(playerid, %.2f, %.2f, %.2f);", vx, vy, vz);
    return 1;
}

CMD:entercar(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1)
		return PermissionError(playerid);
	
	new vehicleid, seatid;

	if(sscanf(params, "d", vehicleid))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/entercar [vehicle id]");
	
	if(vehicleid < 1 || vehicleid > GetVehiclePoolSize() || !IsValidVehicle(vehicleid))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda memasukkan invalid vehicle id!");
	
	seatid = GetAvailableSeat(vehicleid, 0);

	if(seatid == -1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada bangku kosong di kendaraan tersebut!");
	
	PutPlayerInVehicle(playerid, vehicleid, seatid);
	ShowTDN(playerid, NOTIFICATION_SUKSES, sprintf("Anda memasukki vehicle id %d", vehicleid));
	return 1;
}

CMD:afactduty(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) 
		return PermissionError(playerid);
	
	if(AccountData[playerid][pFaction] == FACTION_POLISI) {
		if(!AccountData[playerid][pDutyPD]) {
			AccountData[playerid][pDutyPD] = true;
			Info(playerid, "Anda telah "GREEN"On Duty"WHITE" Kepolisian");
		} else {
			AccountData[playerid][pDutyPD] = false;
			Info(playerid, "Anda telah "RED"Off Duty"WHITE" Kepolisian");
		}
	}
	else if(AccountData[playerid][pFaction] == FACTION_PEMERINTAH) {
		if(!AccountData[playerid][pDutyPemerintah]) {
			AccountData[playerid][pDutyPemerintah] = true;
			Info(playerid, "Anda telah "GREEN"On Duty"WHITE" Pemerintah");
		} else {
			AccountData[playerid][pDutyPemerintah] = false;
			Info(playerid, "Anda telah "RED"Off Duty"WHITE" Pemerintah");
		}
	}
	else if(AccountData[playerid][pFaction] == FACTION_EMS) {
		if(!AccountData[playerid][pDutyEms]) {
			AccountData[playerid][pDutyEms] = true;
			Info(playerid, "Anda telah "GREEN"On Duty"WHITE" EMS");
		} else {
			AccountData[playerid][pDutyEms] = false;
			Info(playerid, "Anda telah "RED"Off Duty"WHITE" EMS");
		}
	}
	else if(AccountData[playerid][pFaction] == FACTION_BENGKEL) {
		if(!AccountData[playerid][pDutyBengkel]) {
			AccountData[playerid][pDutyBengkel] = true;
			Info(playerid, "Anda telah "GREEN"On Duty"WHITE" Bengkel");
		} else {
			AccountData[playerid][pDutyBengkel] = false;
			Info(playerid, "Anda telah "RED"Off Duty"WHITE" Bengkel");
		}
	}
	else if(AccountData[playerid][pFaction] == FACTION_PEDAGANG) {
		if(!AccountData[playerid][pDutyPedagang]) {
			AccountData[playerid][pDutyPedagang] = true;
			Info(playerid, "Anda telah "GREEN"On Duty"WHITE" Restaurant EAGLE");
		} else {
			AccountData[playerid][pDutyPedagang] = false;
			Info(playerid, "Anda telah "RED"Off Duty"WHITE" Restaurant EAGLE");
		}
	}
	else if(AccountData[playerid][pFaction] == FACTION_GOJEK) {
		return ShowTDN(playerid, NOTIFICATION_WARNING, "Tentara gausah duty.");
	}
	RefreshFactionMap(playerid);
	return 1;
}

CMD:ahealth(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/ahealth [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(otherid == playerid) return ShowTDN(playerid, NOTIFICATION_ERROR, "Gunakan ~y~'/health'");

	new string[400];
	new hh = AccountData[otherid][pHead];
	new hp = AccountData[otherid][pPerut];
	new htk = AccountData[otherid][pRHand];
	new htka = AccountData[otherid][pLHand];
	new hkk = AccountData[otherid][pRFoot];
	new hkka = AccountData[otherid][pLFoot];
	format(string, sizeof string, "Bagian Tubuh\tKondisi\n");
	format(string, sizeof string, "%s "WHITE"Kepala\t%d.0%\n", string, hh);
	format(string, sizeof string, "%s "GRAY"Perut\t%d.0%\n", string, hp);
	format(string, sizeof string, "%s "WHITE"Lengan Kanan\t%d.0%\n", string, htk);
	format(string, sizeof string, "%s "GRAY"Lengan Kiri\t%d.0%\n", string, htka);
	format(string, sizeof string, "%s "WHITE"Kaki Kanan\t%d.0%\n", string, hkk);
	format(string, sizeof string, "%s "GRAY"Kaki Kiri\t%d.0%\n", string, hkka);
	ShowPlayerDialog(playerid, DIALOG_HEALTH, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE"WHITE" - Kesehatan", string, "Tutup", "");
    return 1;
}

CMD:atoggle(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);
	
	if(!AccountData[playerid][pTogAC]) {
		AccountData[playerid][pTogAC] = true;
	} else AccountData[playerid][pTogAC] = false;

	SendClientMessageEx(playerid, -1, "[i] Anda telah %s"WHITE" Admin Chatlog", AccountData[playerid][pTogAC] ? ""GREEN"Mengaktifkan" : ""RED"Mematikan");
	return 1;
}

alias:checkmypoint("cmp")
CMD:checkmypoint(playerid, params[])
{
	SendClientMessageEx(playerid, -1, "[i] Point Received Admin Anda Adalah "YELLOW"%d Point", AccountData[playerid][aReceivedReports]);
	return 1;
}

alias:checkdiscorducp("cdu")
CMD:checkdiscorducp(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new DCID[24], cQuery[200], Cache:execute;
	if(sscanf(params, "s", DCID)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/checkdiscorducp [discord id]");
	mysql_format(g_SQL, cQuery, sizeof(cQuery), "SELECT `ucp` FROM `playerucp` WHERE `DiscordID`='%e'", DCID);
	execute = mysql_query(g_SQL, cQuery, true);
	if(cache_num_rows())
	{
		new playerUCP[24];
		cache_get_value_name(0, "ucp", playerUCP);

		SendClientMessageEx(playerid, X11_DARKORANGE, "[Discord Checker]: DiscordID: %s // UCP Name: %s // Status: "GREEN"Valid", DCID, playerUCP);
	}
	else
	{
		Error(playerid, "Tidak ditemukan akun user control panel dengan DiscordID: %s", DCID);
	}

	cache_delete(execute);
	return 1;
}

CMD:aweap(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/aweap [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

	new sha[598], weaponid, ammo, bool: found = false;
	for (new x = 1; x < MAX_WEAPON_SLOT; x ++)
	{
		GetPlayerWeaponData(otherid, x, weaponid, ammo);

		if(weaponid)
		{
			format(sha, sizeof(sha), "%s%s\t%d Ammo\n", sha, ReturnWeaponName(weaponid), ammo);
			found = true;
		}
	}
	
	if(!found)
    {
        PlayerPlaySound(playerid, 1085, 0.0, 0.0, 0.0);
        return ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Kepemilikan Senjata",
        "Pemain tersebut tidak memiliki senjata apapun!", "Tutup", "");
    }

	ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST, sprintf(""ALTHF"EAGLE "WHITE"- %s", ReturnName(otherid)),
	sha, "Tutup", "");
	return 1;
}

alias:setexstart("setstars")
CMD:setexstart(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);
	
	new otherid, cQuery[255];
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setexstart [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(AccountData[otherid][pTheStars]) return Error(playerid, "Pemain tersebut memiliki status Ex Start. Gunakan '"YELLOW"/removestarts"WHITE"' untuk mencabut status Stars"); //ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sudah menjadi Ex Start~n~Gunakan ~y~'/removestars'");

	AccountData[otherid][pTheStars] = 1;
	AccountData[otherid][pTheStarsTime] = gettime() + (30 * 86400); // 1 bulan waktu Ex Start
	SendStaffMessage(X11_TOMATO, "%s memberikan status Ex Start kepada %s(%d) selama 30 hari", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	SendCustomMessage(otherid, "Ex Start", "%s telah menjadikan anda Ex Start selama 30 hari!", AccountData[playerid][pAdminname]);

	mysql_format(g_SQL, cQuery, sizeof(cQuery), "UPDATE `player_characters` SET `Char_TheStars`=%d, `Char_TheStarsTime`=%d WHERE `pID`=%d", AccountData[otherid][pTheStars], AccountData[otherid][pTheStarsTime], AccountData[otherid][pID]);
	mysql_tquery(g_SQL, cQuery);
	return 1;
}

CMD:osetstars(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	new playerName[24], onlinePlayerName[24], cQuery[255];
	if(sscanf(params, "s[24]", playerName)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/osetstars [player name]");

	foreach(new i : Player)
	{
		GetPlayerName(i, onlinePlayerName, MAX_PLAYER_NAME);

		if(strfind(playerName, onlinePlayerName, true) != -1)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang online!");
		}
	}
	SendStaffMessage(X11_TOMATO, "%s telah memberikan status Ex Start (offline) selama 30 Hari kepada account %s", AccountData[playerid][pAdminname], playerName);

	new duration = gettime() + (30 * 86400); // 30 Hari
	mysql_format(g_SQL, cQuery, sizeof(cQuery), "UPDATE `player_characters` SET `Char_TheStars`=1, `Char_TheStarsTime`=%d WHERE `Char_Name`='%e'", duration, playerName);
	mysql_tquery(g_SQL, cQuery);
	return 1;
}

CMD:removeexstart(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/removestars [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!AccountData[otherid][pTheStars]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut bukan Ex Start!");

	AccountData[otherid][pTheStars] = 0;
	AccountData[otherid][pTheStarsTime] = 0;
	SendStaffMessage(X11_TOMATO, "%s telah mencabut status Ex Start pemain %s(%d)", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	SendCustomMessage(otherid, "Ex Start", "%s telah mencabut status anda dari Ex Start!", AccountData[playerid][pAdminname]);
	
	static cQuery[255];
	mysql_format(g_SQL, cQuery, sizeof(cQuery), "UPDATE `player_characters` SET `Char_TheStars`=%d, `Char_TheStarsTime`=%d WHERE `pID`=%d", AccountData[otherid][pTheStars], AccountData[otherid][pTheStarsTime], AccountData[otherid][pID]);
	mysql_tquery(g_SQL, cQuery);
	return 1;
}

CMD:makewargaoff(playerid, params[]) 
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new playerName[24], playerOnlineName[24];
	if(sscanf(params, "s[24]", playerName)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makewargaoff [player name]");
	foreach(new i : Player) 
	{
		GetPlayerName(i, playerOnlineName, MAX_PLAYER_NAME);

		if(strfind(playerOnlineName, playerName, true) != -1) 
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang online! gunakan '/makewarga'");
		}
	}
	new query[255];
	mysql_format(g_SQL, query, sizeof(query), "SELECT `pID` FROM `player_characters` WHERE `Char_Name`='%e'", playerName);
	mysql_tquery(g_SQL, query, "MakeWargaOffline", "ds", playerid, playerName);
	return 1;
}

CMD:resetdelay(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 4) return PermissionError(playerid);

	new otherid, type[24], icsr[255];
	if(sscanf(params, "us[24]", otherid, type)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/resetdelay [name/playerid] [type]~n~mower, delivery, sweeper, forklift");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!strcmp(type, "mower", true))
	{
		AccountData[otherid][pMowerTime] = 0;
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: Anda telah mereset delay sidejob mowing "YELLOW"%s(%d).", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah mereset delay sidejob mowing anda.", GetAdminName(playerid));

		mysql_format(g_SQL, icsr, sizeof(icsr), "UPDATE `player_characters` SET `Char_MowerTime`=0 WHERE `pID`=%d", AccountData[otherid][pID]);
		mysql_tquery(g_SQL, icsr);
	}
	else if(!strcmp(type, "delivery", true))
	{
		AccountData[otherid][pDeliveryTime] = 0;
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "RED"%s"ARWIN1" telah mereset delay sidejob delivery "YELLOW"%s(%d).", GetAdminName(playerid), AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah mereset delay sidejob delivery anda.", GetAdminName(playerid));

		mysql_format(g_SQL, icsr, sizeof(icsr), "UPDATE `player_characters` SET `Char_DeliveryDelay`=0 WHERE `pID`=%d", AccountData[otherid][pID]);
		mysql_tquery(g_SQL, icsr);
	}
	else if(!strcmp(type, "sweeper", true))
	{
		AccountData[otherid][pSweeperTime] = 0;
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "RED"%s"ARWIN1" telah mereset delay sidejob sweeper "YELLOW"%s(%d).", GetAdminName(playerid), AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah mereset delay sidejob sweeper anda.", GetAdminName(playerid));

		mysql_format(g_SQL, icsr, sizeof(icsr), "UPDATE `player_characters` SET `Char_SweeperDelay`=0 WHERE `pID`=%d", AccountData[otherid][pID]);
		mysql_tquery(g_SQL, icsr);
	}
	else if(!strcmp(type, "forklift", true))
	{
		AccountData[otherid][pForkliftTime] = 0;
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "RED"%s"ARWIN1" telah mereset delay sidejob forklift "YELLOW"%s(%d).", GetAdminName(playerid), AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah mereset delay sidejob forklift anda.", GetAdminName(playerid));

		mysql_format(g_SQL, icsr, sizeof(icsr), "UPDATE `player_characters` SET `Char_ForkliftDelay`=0 WHERE `pID`=%d", AccountData[otherid][pID]);
		mysql_tquery(g_SQL, icsr);
	}

	new shstr[125];
	format(shstr, sizeof(shstr), "Menggunakan cmd /resetdelay %s kepada %s", type, AccountData[otherid][pName]);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:fightstyle(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	if(!Dialog_Opened(playerid))
	{
		Dialog_Show(playerid, DIALOG_SELECT_FSTYLE, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Fight Style",
		"Fight Normal\
		\n"GRAY"Fight Boxing\
		\nFight Kungfu\
		\n"GRAY"Fight KneeHead\
		\nFight GrabKick\
		\nFight Elbow", "Pilih", "Batal");
	}
	return 1;
}

Dialog:DIALOG_SELECT_FSTYLE(playerid, response, listitem, inputtext[])
{
	if(!response) return ShowTDN(playerid, NOTIFICATION_INFO, "Anda telah membatalkan pilihan");
	switch(listitem)
	{
		case 0:// Normal
		{
			SetPlayerFightingStyle(playerid, FIGHT_STYLE_NORMAL);
			ShowTDN(playerid, NOTIFICATION_INFO, "Fight Style diubah ke normal");
		}
		case 1:// Boxing
		{
			SetPlayerFightingStyle(playerid, FIGHT_STYLE_BOXING);
			ShowTDN(playerid, NOTIFICATION_INFO, "Fight Style diubah ke boxing");
		}
		case 2:// 
		{
			SetPlayerFightingStyle(playerid, FIGHT_STYLE_KUNGFU);
			ShowTDN(playerid, NOTIFICATION_INFO, "Fight Style diubah ke kungfu");
		}
		case 3:// 
		{
			SetPlayerFightingStyle(playerid, FIGHT_STYLE_KNEEHEAD);
			ShowTDN(playerid, NOTIFICATION_INFO, "Fight Style diubah ke kneehead");
		}
		case 4:// 
		{
			SetPlayerFightingStyle(playerid, FIGHT_STYLE_GRABKICK);
			ShowTDN(playerid, NOTIFICATION_INFO, "Fight Style diubah ke grabkick");
		}
		case 5:// 
		{
			SetPlayerFightingStyle(playerid, FIGHT_STYLE_ELBOW);
			ShowTDN(playerid, NOTIFICATION_INFO, "Fight Style diubah ke elbow");
		}
	}
	return 1;
}

CMD:tpm(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1)
		return PermissionError(playerid);
	
	new vehicleid = GetPlayerVehicleID(playerid);
	new Float:X, Float:Y, Float:Z;
	X = GetPVarFloat(playerid, "tpX");
	Y = GetPVarFloat(playerid, "tpY");
	Z = GetPVarFloat(playerid, "tpZ");
	if(X == 0.0 || Y == 0.0 || Z == 0.0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda belum menandai map!");

	if(IsPlayerInAnyVehicle(playerid))
	{
		SetVehiclePos(vehicleid, X, Y, Z);
		SetPVarFloat(playerid, "tpX", 0.0);
		SetPVarFloat(playerid, "tpY", 0.0);
		SetPVarFloat(playerid, "tpZ", 0.0);
	}
	else
	{
		SetPlayerPos(playerid, X, Y, Z);
		SetPVarFloat(playerid, "tpX", 0.0);
		SetPVarFloat(playerid, "tpY", 0.0);
		SetPVarFloat(playerid, "tpZ", 0.0);
	}
	
	ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil teleportasi ke map!");
	return 1;
}

CMD:onlinelist(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);
	
	new string[3050], hours, minutes, seconds;
	format(string, sizeof(string), "Nama Player\tWaktu Online\n");
	for(new i = 0; i < 30; i ++) if (AccountData[i][IsLoggedIn] && IsPlayerConnected(i))
	{
		GetElapsedTime(AccountData[i][OnlineTimer], hours, minutes, seconds);
		format(string, sizeof(string), "%s"PINK"P%d:"WHITE" %s\t%d Jam %d Menit\n", string, i, AccountData[i][pName], hours, minutes);
	}
	ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- List Online", string, "Tutup", "");
	return 1;
}

CMD:listafk(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);
	new string[3050], hours, minutes, seconds, bool: find = false;
	format(string, sizeof(string), "#Pemain\tWaktu Afk\n");
	foreach(new i : Player) if (AccountData[i][IsLoggedIn] && IsPlayerPaused(i))
	{
		GetElapsedTime((GetPlayerPausedTime(i)/1000), hours, minutes, seconds);
		format(string, sizeof(string), "%s"PINK1"P%d:"WHITE" %s\t%02d:%02d:%02d\n", string, i, AccountData[i][pName], hours, minutes, seconds);
		find = true;
	}
	if(!find)
		Dialog_Show(playerid, ShowOnly, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Player AFK", "Tidak ada pemain yang sedang AFK", "Tutup", "");
	else 
		Dialog_Show(playerid, ShowOnly, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Player AFK", string, "Tutup", "");
	return 1;		
}

CMD:customnumber(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);
	
	new otherid, number[64];
	if(sscanf(params, "us[64]", otherid, number)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/customnumber [playerid] [number]");
	if(isnull(number) || !IsNumeric(number)) return	ShowTDN(playerid, NOTIFICATION_ERROR, "Number tidak valid!");
	if(otherid == INVALID_PLAYER_ID || !IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	new query[598];
	mysql_format(g_SQL, query, sizeof(query), "SELECT Char_PhoneNum FROM player_characters WHERE Char_PhoneNum='%e'", number);
	mysql_tquery(g_SQL, query, "PhoneNumberCustom", "iis", playerid, otherid, number);
	return 1;
}

CMD:customrek(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	new otherid, newrek;
	if(sscanf(params, "ud", otherid, newrek)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/customrek [name/playerid] [new rekening]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

	new icsr[255];
	mysql_format(g_SQL, icsr, sizeof(icsr), "SELECT `Char_BankRek` FROM `player_characters` WHERE `Char_BankRek`=%d", newrek);
	mysql_tquery(g_SQL, icsr, "RekeningCustom", "iid", playerid, otherid, newrek);
	return 1;
}

FUNC::RekeningCustom(playerid, otherid, rekening)
{
	if(cache_num_rows())
	{
		return Error(playerid, "Nomor rekening sudah terdaftar di pusat, gunakan nama lain!");
	}
	else
	{
		static oldrek;
		oldrek = AccountData[otherid][pBankRek];
		AccountData[otherid][pBankRek] = rekening;

		SendStaffMessage(X11_TOMATO, "%s telah mengubah nomor rekening %s(%d) [%d] ~> [%d]", AccountData[playerid][pAdminname], ReturnName(otherid), otherid, oldrek, rekening);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah mengubah nomor rekening anda. Sebelum "YELLOW"%d"ARWIN1" Sesudah "YELLOW"%d", AccountData[playerid][pAdminname], oldrek, rekening);
		
		static tmp[125];
		format(tmp, sizeof(tmp), "Menggunakan cmd /customrek untuk mengubah nomor rekening %s menjadi %d.", AccountData[otherid][pName], rekening);
		AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);

		new query[255];
		mysql_format(g_SQL, query, sizeof(query), "UPDATE `player_characters` SET `Char_BankRek`= %d WHERE `pID`=%d", rekening, AccountData[otherid][pID]);
		mysql_tquery(g_SQL, query);
	}
	return 1;
}

forward PhoneNumberCustom(playerid, otherid, const number[]);
public PhoneNumberCustom(playerid, otherid, const number[])
{
	if(cache_num_rows())
	{
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Nomor tersebut sudah ada didatabase, gunakan yang lain!");
	}
	else
	{
		format(AccountData[otherid][pPhone], 64, number);
		SendStaffMessage(X11_TOMATO, "%s telah customisasi nomor HP %s(%d) - %s", GetAdminName(playerid), GetRPName(otherid), otherid, number);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s telah mengganti nomor HP anda menjadi "YELLOW"%s.", GetAdminName(playerid), number);

		static tmp[125];
		format(tmp, sizeof(tmp), "Menggunakan cmd /customnumber untuk mengubah nomor telepon %s menjadi %s.", AccountData[otherid][pName], number);
		AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);

		new query[255];
		mysql_format(g_SQL, query, sizeof(query), "UPDATE `player_characters` SET `Char_PhoneNum`='%e' WHERE `pID`=%d", number, AccountData[otherid][pID]);
		mysql_tquery(g_SQL, query);
	}
	return 1;
}

CMD:changegender(playerid, params[])
{
	if (CheckAdmin(playerid, 3))
		return PermissionError(playerid);
	
	new id, gender;
	if(sscanf(params, "ud", id, gender))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/changegender [playerid/Name] [gender]~n~1.Laki-Laki, 2.Perempuan");
	
	if(gender < 1 || gender > 2) return ShowTDN(playerid, NOTIFICATION_ERROR, "Invalid Gender ID!");

	if(id==INVALID_PLAYER_ID || !IsPlayerConnected(id) || !SetPlayerGender(id,gender-1)) return ShowTDN(playerid,NOTIFICATION_ERROR,"Karakter belum siap atau pilihan tidak cocok.");
	SendStaffMessage(X11_TOMATO, "%s telah mengganti gender %s(%d) - %s", GetAdminName(playerid), AccountData[id][pName], id, (gender == 1) ? "Laki-Laki" : "Perempuan");
	SendClientMessageEx(id, X11_TOMATO, "AdmCmd: Admin %s telah menetapkan gender anda menjadi %s.", GetAdminName(playerid), (gender == 1) ? "Laki-Laki" : "Perempuan");
	
	return 1;
}

CMD:respawnallveh(playerid, params[])
{
	if(CheckAdmin(playerid, 3))
		return PermissionError(playerid);
	
	SetTimer("ReloadPVeh", 5000, false);
	SendClientMessageToAllEx(-1, ""YELLOW"INFORMATION:"WHITE" Semua kendaraan Player yang terspawn akan di Reload selama 5 detik!");
	SendStaffMessage(X11_TOMATO, "%s telah memulai waktu reloading player vehicle!");
	return 1;
}

CMD:torture(playerid, params[])
{
	if(CheckAdmin(playerid, 6))
		return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/torture [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(AccountData[otherid][pAdmin] > AccountData[playerid][pAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak bisa menggunakan ini kepada Admin Lebih tinggi dari anda!");
	
	static Float:x, Float:y, Float:z;
	GetPlayerPos(otherid, x, y, z);
	SetPlayerPos(otherid, x, y, z + 999999999999999999);
	SendClientMessageEx(otherid, X11_DARKORANGE, "[i] Anda telah di torture oleh %s", AccountData[playerid][pAdminname]);
	SendStaffMessage(X11_TOMATO, "%s telah menggunakan /torture kepada pemain %s(%d)", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	return 1;
}

CMD:checkmask(playerid, params[])
{
	if(CheckAdmin(playerid, 1))
		return PermissionError(playerid);
	
	if(isnull(params) || strlen(params) > 64)
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/checkmask [mask number]");
	
	new Cache:execute;

	execute = mysql_query(g_SQL, sprintf("SELECT `Char_Name` FROM `player_characters` WHERE `Char_MaskID` = '%d';", strval(params)));
	if(cache_num_rows()) {
		new name[MAX_PLAYER_NAME];
		cache_get_value_name(0, "Char_Name", name);
		SendClientMessageEx(playerid, -1, "[i] Masker ID: "YELLOW"%d "WHITE"milik akun "YELLOW"%s.", strval(params), name);
	}
	else SendClientMessageEx(playerid, -1, "[i] Tidak ada karakter yang menggunakan masker tersebut!");
	cache_delete(execute);
	return 1;
}

CMD:masked(playerid, params[])
{
	if(CheckAdmin(playerid, 1))
		return PermissionError(playerid);
	
	SendClientMessageEx(playerid, X11_GREY_60, "-----------------------------------------------------------");

	foreach(new i : Player) if(AccountData[i][pMaskOn]) {
		SendClientMessageEx(playerid, Y_YELLOW, "%s (%d)", ReturnNames(i, 0), AccountData[i][pMaskID]);
	}
	SendClientMessageEx(playerid, X11_GREY_60, "-----------------------------------------------------------");
	return 1;
}

CMD:makewarga(playerid, params[])
{
	if(CheckAdmin(playerid, 3))
		return PermissionError(playerid);

	new otherid;
	if(sscanf(params,"u",otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makewarga [playerid/Name]");
	if(otherid == INVALID_PLAYER_ID || !IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi kedalam server!");

	if(AccountData[otherid][pUsingUniform]) {
		AccountData[otherid][pUsingUniform] = false;
		SetPlayerSkin(otherid, AccountData[otherid][pSkin]);
	}
	if(AccountData[otherid][pDutyPD] == 1 || AccountData[otherid][pDutyPemerintah] == 1
		|| AccountData[otherid][pDutyEms] == 1 || AccountData[otherid][pDutyBengkel] == 1
		|| AccountData[otherid][pDutyPedagang] == 1 || AccountData[otherid][pDutyTrans] == 1)
	{
		AccountData[otherid][pDutyPD] = AccountData[otherid][pDutyPemerintah] = AccountData[otherid][pDutyEms] = AccountData[otherid][pDutyBengkel] = 	AccountData[otherid][pDutyPedagang] = AccountData[otherid][pDutyTrans] = 0;
	}
	AccountData[otherid][pFaction] = 0;
	AccountData[otherid][pFactionRank] = 0;
	AccountData[otherid][pFamily] = -1;
	AccountData[otherid][pFamilyRank] = 0;
	RefreshFactionMap(otherid);
	//UpdateHudUI(otherid);

	ShowTDN(playerid, NOTIFICATION_SUKSES, sprintf("Anda menjadikan %s sebagai warga biasa", ReturnName(otherid)));
	SendClientMessageEx(otherid, -1, "[i] Admin %s menjadikan status Faction atau Family anda Menjadi: Warga", GetAdminName(playerid));
	
	new query[200];
	mysql_format(g_SQL, query, sizeof(query), "UPDATE `player_characters` SET `Char_Faction`=%d, `Char_FactionRank`=%d, `Char_Family`=%d, `Char_FamilyRank`=%d WHERE `pID`=%d", AccountData[otherid][pFaction], AccountData[otherid][pFactionRank], AccountData[otherid][pFamily], AccountData[otherid][pFamilyRank], AccountData[otherid][pID]);
	mysql_tquery(g_SQL, query);

	static tmp[125];
	format(tmp, sizeof(tmp), "Menggunakan cmd /makewarga untuk menjadikan %s warga.", AccountData[otherid][pName]);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);
	return 1;
}

alias:giveredmoney("grm")
CMD:giveredmoney(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	new otherid, value;
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/giveredmoney [name/playerid] [ammount]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukkan nominal kurang dari $1!");

	AccountData[otherid][pRedMoney] += value;
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s memberikan anda Red Money sebesar %s", AccountData[playerid][pAdminname], FormatMoney(value));
	SendStaffMessage(X11_TOMATO, "%s memberikan Red Money sebesar %s kepada pemain %s(%d)", AccountData[playerid][pAdminname], FormatMoney(value), AccountData[otherid][pName], otherid);
	
	new shstr[255];
	format(shstr, sizeof(shstr), "Menggunakan command /giveredmoney sejumlah $%d kepada UCP:[%s] Name:[%s]", AccountData[otherid][pUCP], AccountData[otherid][pName], value);
	AddAdminLog(AccountData[playerid][pUCP], AccountData[playerid][pName], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:panel(playerid, params[])
{
	if(CheckAdmin(playerid, 6) && !IsPlayerAdmin(playerid))
		return PermissionError(playerid);

	if(g_ServerLocked)
		Dialog_Show(playerid, ServerPanel, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Server Panel", "Unlock Server\n"GRAY"Set Hostname\nSet Weburl\n"GRAY"Server Info", "Pilih", "Batal");

	else Dialog_Show(playerid, ServerPanel, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Server Panel", "Lock Server\n"GRAY"Set Hostname\nSet Weburl\n"GRAY"Server Info", "Pilih", "Batal");
	return 1;
}
Dialog:ServerPanel(playerid, response, listitem, inputtext[])
{
	if (CheckAdmin(playerid, 6))
		return 0;

	if(response)
	{
		switch(listitem)
		{
			case 0:// Lock/Unlock Server
			{
				if(g_ServerLocked)
				{
					g_ServerLocked = false;

					SendRconCommand("password 0");
					SendStaffMessage(X11_TOMATO, "%s telah membuka kunci Server", GetAdminName(playerid));
				}
				else Dialog_Show(playerid, LockServer, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Lock Server", "Harap masukan password untuk mengunci server\n"YELLOW"(Masukan dikolom bawah ini):", "Lock", "Cancel");
			}
            case 1: Dialog_Show(playerid, SetHostname, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Set Hostname", "Harap masukkan hostname baru server\n"YELLOW"(Masukan dikolom bawah ini):", "Submit", "Back");
            case 2: Dialog_Show(playerid, SetWeburl, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Set Weburl", "Harap masukkan Weburl / MOTD Server yang akan digunakan\nCth: https://discord.com/invite/hopeindo", "Submit", "Batal");
			case 3: Dialog_Show(playerid, ShowOnly, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Server Information", "Category\tValue\nDynamic Object:\t%d\nVehicle's Count:\t%d", "Close", "", Streamer_CountItems(STREAMER_TYPE_OBJECT), GetVehiclePoolSize());
		}
	}
	else ShowTDN(playerid, NOTIFICATION_INFO, "Anda membatalkan pilihan!");
	return 1;
}
Dialog:LockServer(playerid, response, listitem, inputtext[])
{
    if (CheckAdmin(playerid, 6))
        return 0;

    if(response)
    {
        if(isnull(inputtext) || !strcmp(inputtext, "0"))
            return Dialog_Show(playerid, LockServer, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Lock Server", "Harap masukan password untuk mengunci server\n"YELLOW"(Masukan dikolom bawah ini):", "Lock", "Back");

        if(strlen(inputtext) > 32)
            return Dialog_Show(playerid, LockServer, DIALOG_STYLE_INPUT, "Lock Server", "Error: Harap masukan karakter kurang dari 32 characters.\n\nHarap masukan password untuk mengunci server\n"YELLOW"(Masukan dikolom bawah ini):", "Lock", "Back");

        static
            str[48];

        format(str, sizeof(str), "password %s", inputtext);
        g_ServerLocked = true;

        SendRconCommand(str);
        SendStaffMessage(X11_TOMATO, "%s has locked the server (password: %s).", GetAdminName(playerid), inputtext);
    }
    else callcmd::panel(playerid, "\1");
    return 1;
}
Dialog:SetHostname(playerid, response, listitem, inputtext[])
{
    if (CheckAdmin(playerid, 6))
        return 0;

    if(response)
    {
        if(isnull(inputtext))
            return Dialog_Show(playerid, SetHostname, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Set Hostname", "Harap masukkan hostname baru server\n"YELLOW"(Masukan dikolom bawah ini):", "Submit", "Back");

        static
            str[128];

        format(str, sizeof(str), "hostname %s", inputtext);

        SendRconCommand(str);
        SendStaffMessage(X11_TOMATO, "%s has set the hostname to \"%s\".", GetAdminName(playerid), inputtext);
    }
    else callcmd::panel(playerid, "\1");
    return 1;
}

Dialog:SetWeburl(playerid, response, listitem, inputtext[])
{
	if(AccountData[playerid][pAdmin] < 5) return PermissionError(playerid);

	if(!response) return callcmd::panel(playerid, "\1");

	if(isnull(inputtext)) return Dialog_Show(playerid, SetWeburl, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Set Weburl", 
	"Error: Tidak dapat diisi kosong!\nHarap masukkan Weburl / MOTD Server yang akan digunakan\nCth: https://discord.com/invite/hopeindo", "Submit", "Batal");

	static frmxt[225];
	format(frmxt, sizeof(frmxt), "weburl %s", inputtext);
	SendRconCommand(frmxt);
	SendStaffMessage(X11_TOMATO, "%s telah mengubah MOTD Server menjadi \"%s\".", AccountData[playerid][pAdminname], inputtext);
	return 1;
}

CMD:near(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1) return PermissionError(playerid);

	for(new i = 0; i < MAX_DYNAMIC_SPEED; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 4, SpeedData[i][speedPos][0], SpeedData[i][speedPos][1], SpeedData[i][speedPos][2]))
			return Warning(playerid, "Dynamic Speed Cam on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_OBJECT; i ++) 
	{
		if(IsPlayerInRangeOfPoint(playerid, 4.0, ObjectData[i][objectPos][0], ObjectData[i][objectPos][1], ObjectData[i][objectPos][2]))
			return Warning(playerid, "Dynamic Object on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_OBJECTTEXT; i ++) if (ObjectTextData[i][oExists])
	{
		if(IsPlayerInRangeOfPoint(playerid, 4, ObjectTextData[i][oPos][0], ObjectTextData[i][oPos][1], ObjectTextData[i][oPos][2]))
			return Warning(playerid, "Dynamic Object Text on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_RENTAL; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.0, RentalData[i][RentalPos][0], RentalData[i][RentalPos][1], RentalData[i][RentalPos][2]))
			return Warning(playerid, "Dynamic Rental on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_GUDANG; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 1.8, GudangData[i][gudangPOS][0], GudangData[i][gudangPOS][1], GudangData[i][gudangPOS][2]))
			return Warning(playerid, "Dynamic Gudang on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_GATE; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 10.0, GateData[i][gateclosePos][0], GateData[i][gateclosePos][1], GateData[i][gateclosePos][2]))
			return Warning(playerid, "Dynamic Gate on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_BUTTON; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 1.8, ButtonData[i][ButtonPos][0], ButtonData[i][ButtonPos][1], ButtonData[i][ButtonPos][2]))
			return Warning(playerid, "Dynamic Button on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_RUSUN; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.0, RusunData[i][rusunExtPos][0], RusunData[i][rusunExtPos][1], RusunData[i][rusunExtPos][2]) || IsPlayerInRangeOfPoint(playerid, 2.0, RusunData[i][rusunIntPos][0], RusunData[i][rusunIntPos][1], RusunData[i][rusunIntPos][2]))
			return Warning(playerid, "Dynamic Rusun on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_WARUNG; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.5, WarungData[i][warungPOS][0], WarungData[i][warungPOS][1], WarungData[i][warungPOS][2]))
			return Warning(playerid, "Dynamic Warung on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_LABEL; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.5, LabelData[i][labelPos][0], LabelData[i][labelPos][1], LabelData[i][labelPos][2]))
			return Warning(playerid, "Dynamic Label on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_KANABIS; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.5, LadangData[i][kanabisX], LadangData[i][kanabisY], LadangData[i][kanabisZ]))
			return Warning(playerid, "Dyamic Kanabis on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_FAMILIES; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.5, FamData[i][famgaragePos][0], FamData[i][famgaragePos][1], FamData[i][famgaragePos][2]))
			return Warning(playerid, "Dynamic Families Garage on nearest you ID %d", i);	
		
		if(IsPlayerInRangeOfPoint(playerid, 2.5, FamData[i][famExtPos][0], FamData[i][famExtPos][1], FamData[i][famExtPos][2]))
			return Warning(playerid, "Dynamic Families Door on nearest you ID %d", i);	
	}
	
	for(new i = 0; i < MAX_RUMAH; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.0, HouseData[i][hsExtPos][0], HouseData[i][hsExtPos][1], HouseData[i][hsExtPos][2]) || IsPlayerInRangeOfPoint(playerid, 2.0, HouseData[i][hsIntPos][0], HouseData[i][hsIntPos][1], HouseData[i][hsIntPos][2]))
			return Warning(playerid, "Dynamic House on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_ROBBERY; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.0, RobberyData[i][robberyPos][0], RobberyData[i][robberyPos][1], RobberyData[i][robberyPos][2]))
			return Warning(playerid, "Dynamic Robbery on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DYNAMIC_TRASH; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.5, TrashData[i][trashPos][0], TrashData[i][trashPos][1], TrashData[i][trashPos][2]))
			return Warning(playerid, "Dynamic Trash on nearest you ID %d", i);
	}
	
	for(new i = 0; i < MAX_PUBLIC_GARAGE; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 3.0, PublicGarage[i][pgPOS][0], PublicGarage[i][pgPOS][1], PublicGarage[i][pgPOS][2]))
			return Warning(playerid, "Dynamic Garkot on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_ATM; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 3.0, AtmData[i][atmX], AtmData[i][atmY], AtmData[i][atmZ]))
			return Warning(playerid, "Dynamic ATM on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_ACTORSS; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 2.0, aData[i][aPos][0], aData[i][aPos][1], aData[i][aPos][2]))
			return Warning(playerid, "Dynamic Actor on nearest you ID %d", i);
	}

	for(new i = 0; i < MAX_DOOR; i ++)
	{
		if(IsPlayerInRangeOfPoint(playerid, 3.0, DoorData[i][dExtposX], DoorData[i][dExtposY], DoorData[i][dExtposZ]))
			return Warning(playerid, "Dynamic Door on nearest you ID %d", i);
	}
	return 1;
}


CMD:ainv(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1)
		return PermissionError(playerid);

	new userid;
	if(sscanf(params, "u", userid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/ainv [name/playerid]");
	if(!IsPlayerConnected(userid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	Player_Item(playerid, userid);
	return 1;
}

CMD:restart(playerid, params[])
{
	new times;

	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);	
	if(g_RestartServer)
	{
		g_RestartServer = 0;
		g_RestartTime = 0;
		Hud_StormHideAll();
		foreach(new i : Player) if(IsPlayerConnected(i))
		{
			StopAudioStreamForPlayer(i);
		}
		return SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: Waktu restart telah ditunda oleh "RED"%s.", GetAdminName(playerid));
	}
	if(sscanf(params, "d", times))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/restart [seconds]");
	
	if(times < 5 || times > 600)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Waktu tidak bisa kurang dari 5 atau lebih dari 600!");
	
	g_RestartServer = 1;
	g_RestartTime = times;
	{
		new tt[16], tm[3];
		GetElapsedTime(times, tm[0], tm[1], tm[2]);
		format(tt, sizeof(tt), "%02d:%02d", tm[1], tm[2]);
		Hud_StormBannerAll(tt);
	}
	
	foreach(new i : Player) if(IsPlayerConnected(i))
	{
		PlayAudioStreamForPlayer(i, "https://j.top4top.io/m_3711mrquh1.mp3");
	}
	
    SendClientMessageToAllEx(X11_GRAY, "AdmCmd: Admin "RED"%s"ARWIN1" memulai waktu restart server "YELLOW"%d detik.", GetAdminName(playerid), times);

	static icsr[125];
	format(icsr, sizeof(icsr), "Menggunakan cmd /restart selama %d detik.", times);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), icsr);
	return 1;
}

CMD:avehall(playerid, params[])
{
	new times;
	if(CheckAdmin(playerid, 2))
		return PermissionError(playerid);
	if(g_AsuransiAll)
	{
		g_AsuransiAll = 0;
		g_AsuransiTime = 0;
		return SendClientMessageToAllEx(-1, ""YELLOW"[!]"WHITE": Adm %s telah menunda waktu Asuransi Keliling!", GetAdminName(playerid));
	}
	if(sscanf(params, "d", times))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/avehall [seconds]");
	
	if(times < 5 || times > 600)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Waktu tidak bisa kurang dari 5 atau lebih dari 600!");
	
	g_AsuransiAll = 1;
	g_AsuransiTime = times;
	{
		new tt[16], tm[3];
		GetElapsedTime(times, tm[0], tm[1], tm[2]);
		format(tt, sizeof(tt), "%02d:%02d", tm[1], tm[2]);
		Hud_InsuranceBannerAll(tt);
	}
	foreach(new i : Player)
	{
		PlayAudioStreamForPlayer(i, "https://l.top4top.io/m_3711ogdr51.mp3");
	}
	SendClientMessageToAllEx(COLOR_WHITE, ""YELLOW"[Asuransi]"WHITE": %s telah memulai waktu Asuransi Keliling selama %d seconds", GetAdminName(playerid), times);
	return 1;
}

CMD:respawnjobvehicle(playerid, params[])
{
	if(CheckAdmin(playerid, 2))
		return PermissionError(playerid);
	
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" Semua kendaraan job yang tidak dinaiki atau terpakai akan dihancurkan dalam 20 detik!", AccountData[playerid][pAdminname]);
	SetTimerEx("RespawnVehicleJobs", 15000, false, "d", playerid);
	return 1;
}

JavaTR: RespawnVehicleJobs(playerid)
{
	foreach(new i : Player) if (IsPlayerConnected(i))
	{
		if (AccountData[i][pJobVehicle] != 0)
		{
			if (IsValidVehicle(JobVehicle[AccountData[i][pJobVehicle]][Vehicle]))
			{
				if (IsVehicleEmpty(JobVehicle[AccountData[i][pJobVehicle]][Vehicle]))
				{
					DestroyJobVehicle(i);
					AccountData[i][pJobVehicle] = 0;

					if (PlayerKargoVars[i][KargoStarted]) {
						if(IsValidVehicle(PlayerKargoVars[i][KargoTrailer]))
							DestroyVehicle(PlayerKargoVars[i][KargoTrailer]);

						KargoIndex[i] = -1;
						TimerKargo[i] = -1;
						PlayerKargoVars[i][KargoStarted] = false;
						PlayerKargoVars[i][KargoTrailer] = INVALID_VEHICLE_ID;
					}
					
					if (IsBusWorking(i)) {
						SetBusWorking(i, false);
						BusIndex[i] = 0;
						BusWaiting[i] = false;
						BusTime[i] = 0;
						BusExitTimer[i] = 0;
						if(GetPVarInt(i, "BusRute") == 1) CountBusAirport --; //
						if(GetPVarInt(i, "BusRute") == 2) CountBusKanpol --; //
						if(GetPVarInt(i, "BusRute") == 3) CountBusHospital --; //
					}
				}
			}
		}
	}
	SendClientMessageToAllEx(-1, ""ARWIN1"AdmCmd: Semua kendaraan job yang tidak terpakai berhasil dihancurkan.");
	return 1;
}

CMD:exmenu(playerid, params[])
{
	if(AccountData[playerid][pTheStars] != 1)
		return PermissionError(playerid);

	ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE Roleplay "WHITE"- Ex Start", 
	"Perintah\tKeterangan\n\
	/a\tAkses Chat Staff\n\
	"GRAY"/exduty\t"GRAY"On Duty Sebagai Admin / Ex Start\n\
	/ans\tMenjawab pertanyaan yang ada di server\n\
	"GRAY"/ar\t"GRAY"Menjawab report yang ada di server\n\
	/asks\tMelihat list pertanyaan yang ada di server\n\
	"GRAY"/reports\t"GRAY"Melihat list report yang ada di server\n\
	/spec\tMemantau player\n\
	"GRAY"/astats\t"GRAY"Melihat stats player\n\
	/ostats\tMelihat stats player (offline)\n\
	"GRAY"/checkucp\t"GRAY"Melihat UCP player beserta list karakter yang dimiliki\n\
	/avehlist\tMelihat list kendaraan yang dimiliki player\n\
	"GRAY"/ntag\t"GRAY"Lihat nickname dan UCP semua player\n\
	/gotoveh\tTeleportasi ke kendaraan\n\
	"GRAY"/getveh\t"GRAY"Menarik kendaraan\n\
	/gotols\tTeleportasi ke Los Santos\n\
	"GRAY"/goto\t"GRAY"Teleportasi ke player\n\
	/gethere\tMenarik player lain\n\
	"GRAY"/getip\t"GRAY"Mendapatkan IP player\n\
	/sendto\tKirim player ke suatu tempat\n\
	"GRAY"/dveh\t"GRAY"Hancurkan kendaraan (asuransikan)\n\
	/kick\tMenendang player dari server\n\
	"GRAY"/slap\t"GRAY"Slap player\n\
	/ainv\tCek Inventory Player\n\
	"GRAY"/jail\t"GRAY"Penjarakan player\n\
	/unjail\tMenghapus status jail player\n\
	"GRAY"/arevive\t"GRAY"Menghidupkan player pingsan\n\
	/takeoutveh\tMenspawn paksa kendaraan yang Despawned (Bukan untuk TheStars)", "Tutup", "");
	return 1;
}

CMD:ahelpdetail(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);
	ShowPlayerDialog(playerid, DIALOG_ADMIN_HELP, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Admin Help",
	"Ex Start\
	\nHelper\
	\n"GRAY"Admin I\
	\nAdmin II\
	\n"GRAY"Admin III\
	\nPengurus\
	\n"GRAY"Management", "Pilih", "Batal");
	return 1;
}

CMD:dynhelp(playerid, params[])
{
	if (AccountData[playerid][pAdmin] < 2)
		return PermissionError(playerid);
	
	static shstr[1848];
	format(shstr, sizeof(shstr), "Jenis Dynamic\tKeterangan\
	\nDynamic Actor\tBerisi CMD seputar Dynamic Actor\
	\n"GRAY"Dynamic Rental\t"GRAY"Berisi CMD seputar Dynamic Rental\
	\nDynamic Door\tBerisi CMD seputar Dynamic Door\
	\n"GRAY"Dynamic Fivem Label\t"GRAY"Berisi CMD seputar Dynamic Label\
	\nDynamic Public Garage\tBerisi CMD seputar Dynamic Garasi Umum\
	\n"GRAY"Dynamic Garbage\t"GRAY"Berisi CMD seputar Dynamic Tempat Sampah\
	\nDynamic ATM\tBerisi CMD seputar Dynamic ATM\
	\n"GRAY"Dynamic Kanabis\t"GRAY"Berisi CMD seputar Dynamic Ladang\
	\nDynamic Robbery\tBerisi CMD seputar Dynamic Rampok Warung\
	\n"GRAY"Dynamic Warung\t"GRAY"Berisi CMD seputar Dynamic Shop\
	\nDynamic Hunting\tBerisi CMD seputar Dynamic Rusa\
	\n"GRAY"Dynamic Gudang\t"GRAY"Berisi CMD seputar Dynamic Gudang Storage\
	\nDynamic Families Garage\tBerisi CMD seputar Dynamic Garasi Families\
	\n"GRAY"Dynamic Rumah\t"GRAY"Berisi CMD seputar Dynamic Rumah\
	\nDynamic Icom Map\tBerisi CMD seputar Dynamic Map Icon\
	\n"GRAY"Dynamic Button Door\t"GRAY"Berisi CMD seputar Dynamic Button Door\
	\nDynamic Object [Mapping]\tBerisi CMD seputar Dynamic Object\
	\n"GRAY"Dynamic Uranium\tBerisi CMD seputar Dynamic Uranium");
	ShowPlayerDialog(playerid, DIALOG_DYNAMIC_HELP, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Dynamic Help", shstr, "Pilih", "Batal");
	return 1;
}

CMD:sound(playerid, params[])
{
	if(CheckAdmin(playerid, 1))
		return PermissionError(playerid);
	
	extract params -> new soundid; else return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/sound [sound id]");

	PlayerPlaySound(playerid, soundid, 0, 0, 0);
	SendClientMessageEx(playerid, X11_WHITE, sprintf(""YELLOW"[SOUND]"WHITE": Anda memutar Sound ID %d", soundid));
	return 1;
}

CMD:arelease(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 4)
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Kamu harus menjadi Admin level 5.");

	new otherid;
	if(sscanf(params, "u", otherid))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/arelease <ID/Name>");
	    return true;
	}

    if(otherid == INVALID_PLAYER_ID)
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player tersebut belum masuk!");

	if(AccountData[otherid][pArrest] == 0)
	    return ShowTDN(playerid, NOTIFICATION_ERROR, "The player isn't in arrest!");

	AccountData[otherid][pArrest] = 0;
	AccountData[otherid][pArrestTime] = 0;
	SetPlayerInterior(otherid, 0);
	SetPlayerVirtualWorld(otherid, 0);
	SetPlayerPositionEx(otherid, 1526.69, -1678.05, 5.89, 267.76, 2000);
	SetPlayerSpecialAction(otherid, SPECIAL_ACTION_NONE);
	return true;
}
CMD:makequiz(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	new 	
		type[125],
		string[255];
	if(sscanf(params, "s[125]S()[255]", type, string)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makequiz [option]~n~question, answer, prize, end");
	if(!strcmp(type, "question", true))
	{
		new frmxt[255];
		if(sscanf(string, "s[255]", frmxt)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makequiz question [pertanyaan]");
		if(Quiz) return ShowTDN(playerid, NOTIFICATION_ERROR, "Sudah ada Quiz sebelumnya akhiri dengan /makequiz end");
		if(!QuizAnswerMade) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus membuat answer terlebih dahulu!");
		if(!QuizPrice) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus menetapkan hadiah quiz terlebih dahulu!");
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" telah membuat Quiz server.", AccountData[playerid][pAdminname]);
		SendClientMessageToAllEx(X11_ARWIN, "~> %s? - "GREEN"%s.", frmxt, FormatMoney(QuizPrice));
		SendClientMessageToAllEx(X11_ARWIN, "~> Gunakan "RED"'/qa'"ARWIN1" untuk menjawab quiz.");
		Quiz = true;
	}
	else if(!strcmp(type, "answer", true))
	{
		new frmxt[255], ans[255];
		if(sscanf(string, "s[255]", frmxt)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makequiz answer [jawaban]");
		if(Quiz) return ShowTDN(playerid, NOTIFICATION_ERROR, "Sudah ada Quiz sebelumnya akhiri dengan /makequiz end");
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: Anda telah menetapkan jawaban untuk Quiz ~> "YELLOW"%s", frmxt);

		format(ans, sizeof(ans), "%s", frmxt);
		strpack(QuizAnswer, ans, 255);
		QuizAnswerMade = true;
	}
	else if(!strcmp(type, "prize", true))
	{
		new price;
		if(sscanf(string, "d", price)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makequiz prize [hadiah]");
		if(Quiz) return ShowTDN(playerid, NOTIFICATION_ERROR, "Sudah ada Quiz sebelumnya, akhiri terlebih dahulu dengan /endquiz");
		if(!QuizAnswerMade) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus membuat jawaban terlebih dahulu!");
		if(price < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukkan nominal dibawah $1 untuk hadiah quiz!");
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: Anda telah menetapkan hadiah quiz sebesar "GREEN"%s.", FormatMoney(price));
		QuizPrice = price;
	}
	else if(!strcmp(type, "end", true))
	{
		if(!Quiz) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada kuis yang dapat diakhiri!");
		Quiz = false;
		QuizAnswerMade = false;
		QuizPrice = 0;
		QuizAnswer = "";
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: Quiz telah diakhiri oleh "RED"%s.", GetAdminName(playerid));
	}
	return 1;
}

CMD:qa(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	new frmtanswer[255];
	if(!Quiz) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada Quiz yang dilakukan di server!");
	if(sscanf(params, "s[255]", frmtanswer)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/qa [jawaban]");
	if(!strcmp(frmtanswer, QuizAnswer, true)) 
	{
		GiveMoney(playerid, QuizPrice);
		new shstr[596];
		format(shstr, sizeof(shstr), "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah menjawab "YELLOW"'%s'"ARWIN1". dan mendapatkan hadiah sebesar "GREEN"%s.", AccountData[playerid][pName], playerid, frmtanswer, FormatMoney(QuizPrice));
		SendClientMessageToAllEx(X11_ARWIN, shstr);

		Quiz = false;
		QuizAnswerMade = false;
		QuizPrice = 0;
		QuizAnswer = "";
	}
	else return ShowTDN(playerid, NOTIFICATION_ERROR, "Jawaban yang anda masukkan salah!");
	return 1;
}

CMD:stafflist(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	new count = 0, shstr[2048];
	format(shstr, sizeof(shstr), "Staff\tStatus Admin\n");
	foreach(new i : Player) if (AccountData[i][IsLoggedIn]) if ((AccountData[i][pAdmin] > 0) || (AccountData[i][pTheStars] > 0))
	{
		format(shstr, sizeof(shstr), "%s%s - [%d]\t%s\n", shstr, AccountData[i][pAdminname], i, AccountData[i][pAdminHide] ? ""RED"Hide" : ""GREEN"Show");
		count++;
	}
	if(count == 0)
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Staff List", "Tidak ada administrator yang online!", "Tutup", "");
	else
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Staff List", shstr, "Tutup", "");
	return 1;
}

CMD:ahide(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	
	if(!AccountData[playerid][pAdminHide])
	{
		AccountData[playerid][pAdminHide] = 1;
		Info(playerid, "Anda telah "RED"Menyembunyikan"WHITE" nama dari Admin List");
	}
	else
	{
		AccountData[playerid][pAdminHide] = 0;
		Info(playerid, "Anda telah "RED"Memperlihatkan"WHITE" nama dari Admin List");
	}
	return 1;
}

CMD:servertick(playerid, params[])
{
	SendClientMessageEx(playerid, -1, "[i] Server Tick %d Tickrate", GetServerTickRate());
	return 1;
}

CMD:checknetwork(playerid, params[])
{
	if (GetAdminLevel(playerid))
	{
		new 
			stats[ 512 ]
		;

		GetNetworkStats(stats, sizeof(stats));
		Dialog_Show(playerid, ShowOnly, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Network Stats", stats, "Close", "");
	}
	return 1;
}

CMD:admins(playerid, params[])
{
	new list[3600], count;
	if(AccountData[playerid][pAdmin] < 6)
	{
		format(list, sizeof(list), "Rank\tAdmin\t#ID\tStatus\n");
		foreach(new i : Player) if (IsPlayerConnected(i) && AccountData[i][pSpawned])
		{
			if(AccountData[i][pAdmin] >= 1 || AccountData[i][pTheStars] >= 1)
			{
				if(!AccountData[i][pAdminHide])
				{
					format(list, sizeof(list), "%s%s\t"YELLOW"%s\t"RED"%d\t%s\n", list, GetStaffRank(i), AccountData[i][pAdminname], i, AccountData[i][pAdminDuty] ? ""GREEN"On Duty" : ""YELLOW"Roleplaying");
					count ++;
				}
			}
		}
	}
	else
	{
		format(list, sizeof(list), "Username(PID)\tRank\tReport Point\tDuty Time - Status\n");
		foreach(new i : Player) if (IsPlayerConnected(i) && AccountData[i][pSpawned])
		{
			if(AccountData[i][pAdmin] >= 1 || AccountData[i][pTheStars] >= 1)
			{
				if(!AccountData[i][pAdminHide])
				{
					format(list, sizeof(list), "%s"YELLOW"%s(%d)\t%s\t"WHITE"%d Report Point(RP)\t%d Menit - %s\n", list, AccountData[i][pAdminname], i, GetStaffRank(i), AccountData[i][aReceivedReports], AccountData[i][aDutyTimer]/60, AccountData[i][pAdminDuty] ? ""GREEN"On Duty" : ""YELLOW"Roleplaying");
					count ++;
				}
			}
		}
	}
	if(count == 0)
		Error(playerid, "Tidak ada administrator online dikota!"); // ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Online Administrator", "Tidak ada administrator online dikota!", "Tutup", "");
	else
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Online Administrator", list, "Close", "");
	return 1;
}

CMD:ajail(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1) return PermissionError(playerid);

	new count = 0, shstr[1408];
	format(shstr, sizeof(shstr), "Player\tJail By\tReason\tDuration\n");
	foreach(new i : Player) if(AccountData[i][pSpawned])
	{
		if(AccountData[i][pJail] == 1)
		{
			new hours, minutes, seconds;
			GetElapsedTime(AccountData[i][pJailTime], hours, minutes, seconds);
			format(shstr, sizeof(shstr), "%s%s[%d]\t"RED"%s\t"YELLOW"%s\t"WHITE"%02d Jam %02d Menit\n", shstr, AccountData[i][pName], i, AccountData[i][pJailBy], AccountData[i][pJailReason], hours, minutes);
			count ++;
		}
	}
	if(count == 0)
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Player Jail", "Tidak ada pemain dalam masa jail admin!", "Close", "");
	else 
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Player Jail", shstr, "Close", "");
	return 1;
}

CMD:makefire(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	if(!GetPVarInt(playerid, "FireToggle"))
	{
		SetPVarInt(playerid, "FireToggle", 1);
		SetPlayerAttachedObject(playerid, 9, 18688, 2, 0.143, 0.0, -1.868, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0);
		Info(playerid, "Api "GREEN"diaktifkan");
	}
	else
	{
		SetPVarInt(playerid, "FireToggle", 0);
		RemovePlayerAttachedObject(playerid, 9);
		Info(playerid, "Api "RED"Dipadamkan");
	}
	return 1;
}

CMD:exduty(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);
	if(!strcmp(AccountData[playerid][pAdminname], "None")) return ShowTDN(playerid, NOTIFICATION_ERROR, "Nama admin anda belum disetting!");

	static shstr[228];
	format(shstr, sizeof(shstr), "Sedang Bertugas\n%s\n%s", AccountData[playerid][pAdminname], GetStaffRank(playerid));
	if(!AccountData[playerid][pAdminDuty])
	{
		AccountData[playerid][pAdminDuty] = true;
		AccountData[playerid][pLabelDuty] = Eagle_CreateDynamic3DTextLabel(shstr, -1, 0, 0, -10, 10.0, playerid);
		Streamer_SetFloatData(STREAMER_TYPE_3D_TEXT_LABEL, AccountData[playerid][pLabelDuty], E_STREAMER_ATTACH_OFFSET_Z, 0.30);


		SetPlayerName(playerid, GetAdminName(playerid));
		SetPlayerColor(playerid, X11_DARKRED);
		SetPlayerHealth(playerid, 999999.0);	

		if(AccountData[playerid][pTheStars])
		{
			SendAdminMessage(X11_GREEN, "(ExStartDuty)"RED" %s %s "WHITE"telah on duty Ex Start dengan nama %s.", GetStaffRank(playerid), AccountData[playerid][pName], GetAdminName(playerid));
		}
	}
	else 
	{
		AccountData[playerid][pAdminDuty] = false;
		if(IsValidDynamic3DTextLabel(AccountData[playerid][pLabelDuty])) DestroyDynamic3DTextLabel(AccountData[playerid][pLabelDuty]);
		SetPlayerColor(playerid, RemoveAlpha(COLOR_WHITE));
		SetPlayerName(playerid, AccountData[playerid][pName]);
		SetPlayerHealth(playerid, AccountData[playerid][pHealth]);

		if(AccountData[playerid][pTheStars])
		{
			SendAdminMessage(X11_GREEN, "(AdmDuty)"RED" %s %s "WHITE"telah off duty Ex Start dengan nama %s.", GetStaffRank(playerid), AccountData[playerid][pName], GetAdminName(playerid));
		}
	}
	return 1;
}

CMD:aduty(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1) return PermissionError(playerid);
	if(!strcmp(AccountData[playerid][pAdminname], "None")) return ShowTDN(playerid, NOTIFICATION_ERROR, "Nama admin anda belum disetting!");

	static shstr[228];
	format(shstr, sizeof(shstr), "Sedang Bertugas\n%s\n%s", AccountData[playerid][pAdminname], GetStaffRank(playerid));
	if(!AccountData[playerid][pAdminDuty])
	{
		AccountData[playerid][pAdminDuty] = true;
		AccountData[playerid][pLabelDuty] = Eagle_CreateDynamic3DTextLabel(shstr, -1, 0, 0, -10, 10.0, playerid);
		Streamer_SetFloatData(STREAMER_TYPE_3D_TEXT_LABEL, AccountData[playerid][pLabelDuty], E_STREAMER_ATTACH_OFFSET_Z, 0.30);


		SetPlayerName(playerid, GetAdminName(playerid));
		SetPlayerColor(playerid, X11_DARKRED);
		SetPlayerHealth(playerid, 999999.0);	

		if(AccountData[playerid][pTheStars])
		{
			SendAdminMessage(X11_GREEN, "(AdmDuty)"RED" %s %s "WHITE"telah on duty Ex Start dengan nama %s.", GetStaffRank(playerid), AccountData[playerid][pName], GetAdminName(playerid));
		}
		else SendAdminMessage(X11_GREEN, "(AdmDuty)"RED" %s %s "WHITE"telah on duty admin dengan nama %s.", GetStaffRank(playerid), AccountData[playerid][pName], GetAdminName(playerid));
	}
	else 
	{
		AccountData[playerid][pAdminDuty] = false;
		if(IsValidDynamic3DTextLabel(AccountData[playerid][pLabelDuty])) DestroyDynamic3DTextLabel(AccountData[playerid][pLabelDuty]);
		SetPlayerColor(playerid, RemoveAlpha(COLOR_WHITE));
		SetPlayerName(playerid, AccountData[playerid][pName]);
		SetPlayerHealth(playerid, AccountData[playerid][pHealth]);

		if(AccountData[playerid][pTheStars])
		{
			SendAdminMessage(X11_GREEN, "(AdmDuty)"RED" %s %s "WHITE"telah off duty Ex Start dengan nama %s.", GetStaffRank(playerid), AccountData[playerid][pName], GetAdminName(playerid));
		}
		else SendAdminMessage(X11_GREEN, "(AdmDuty)"RED" %s %s "WHITE"telah off duty admin dengan nama %s.", GetStaffRank(playerid), AccountData[playerid][pName], GetAdminName(playerid));
	}
	return 1;
}

CMD:a(playerid, params[]) 
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new frmxt[525];
	if(sscanf(params, "s[525]", frmxt)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/a [pesan]");
	foreach(new i : Player) if (SQL_IsCharacterLogged(i)) if (AccountData[i][pAdmin] > 0 || AccountData[i][pTheStars] > 0) 
	{
		if(strlen(frmxt) > 64)
		{
			SendClientMessageEx(i, X11_GREEN, "* %s %s [%d]:"WHITE" %.64s ...", GetStaffRank(playerid), AccountData[playerid][pAdminname], playerid, frmxt);
			SendClientMessageEx(i, COLOR_WHITE, "... %s", frmxt[64]);
		}
		else 
		{
			SendClientMessageEx(i, X11_GREEN, "* %s %s [%d]:"WHITE" %s", GetStaffRank(playerid), AccountData[playerid][pAdminname], playerid, frmxt);
		}
	}
	return 1;
}

CMD:togooc(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	if(!TogOOC)
	{
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" telah mengaktifkan Global Chat OOC!", AccountData[playerid][pAdminname]);
		TogOOC = true;
	}
	else 
	{
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED"%s"ARWIN1" telah mematikan Global Chat OOC!", AccountData[playerid][pAdminname]);
		TogOOC = false;
	}
	return 1;
}

CMD:o(playerid, params[])
{
	if(!TogOOC && AccountData[playerid][pAdmin] < 1 && !AccountData[playerid][pVip]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Global OOC Server sedang ditutup oleh admin!");
	if(isnull(params)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/o [global chat]");
	foreach(new i : Player) if (AccountData[i][pSpawned])
	{
		if(AccountData[i][pTogGlobal])
		{
			if(strlen(params) < 255)
			{
				if(AccountData[playerid][pAdmin] > 0 && AccountData[playerid][pAdminDuty]) SendClientMessageEx(i, -1, "[G] %s "RED"%s: "WHITE"(( %s ))", GetStaffRank(playerid), AccountData[playerid][pAdminname], params);
				else if(AccountData[playerid][pVip] > 0 && !AccountData[playerid][pAdminDuty]) 
				{
					if(!strcmp(AccountData[playerid][pVipNameCustom], "-"))
					{
						SendClientMessageEx(i, -1, "[G] %s "WHITE"| %s [%d]: (( %s ))", GetPlayerLevelName(playerid), AccountData[playerid][pUCP], playerid, params);
					}
					else 
					{
						SendClientMessageEx(i, -1, "[G] %s "WHITE"| %s [%d]: (( %s ))", AccountData[playerid][pVipNameCustom], AccountData[playerid][pUCP], playerid, params);
					}
				}
				else SendClientMessageEx(i, -1, "[G] %s "WHITE"| %s [%d]: (( %s ))", GetPlayerLevelName(playerid), AccountData[playerid][pUCP], playerid, params);
			}
			else return ShowTDN(playerid, NOTIFICATION_ERROR, "Max Characters 255!");
		}
	}
	return 1;
}

CMD:id(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new otherid, hours, minutes, seconds;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/id [playerid/Name]");
	if(!IsPlayerConnected(otherid))	return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke dalam server!");

	GetElapsedTime(AccountData[otherid][OnlineTimer], hours, minutes, seconds);
	SendClientMessageEx(playerid, -1, "[i] UCP: %s | Nama: %s | LV: %d | Ping: %d ms | Packet Loss: %.2f | Playtime: %02d:%02d:%02d | ID: %d", AccountData[otherid][pUCP], AccountData[otherid][pName], AccountData[otherid][pLevel], GetPlayerPing(otherid), GetPlayerPacketLoss(otherid), hours, minutes, seconds, otherid);
	return 1;
}

CMD:gotosf(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	SetPlayerPos(playerid, 1681.8604, 1451.7572, 10.7726);
	SetPlayerFacingAngle(playerid, 199.7756);
	SetPlayerVirtualWorldEx(playerid, 0);
	SetPlayerInteriorEx(playerid, 0);
	AccountData[playerid][pInDoor] = -1;
    AccountData[playerid][pInHouse] = -1;
    AccountData[playerid][pInBiz] = -1;
    AccountData[playerid][pInFamily] = -1;
    AccountData[playerid][pInRusun] = -1;
	
	SendStaffMessage(X11_TOMATO, "%s teleportasi ke San Fiero", AccountData[playerid][pAdminname]);
	return 1;
}

CMD:gotols(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) 
		return PermissionError(playerid);
	
	ViceCity_CancelPlayerFlight(playerid, true);
	SetPlayerPos(playerid, 1483.3868, -1720.3635, 13.7969);
	SetPlayerFacingAngle(playerid, 183.0591);
	SetPlayerVirtualWorldEx(playerid, 0);
	SetPlayerInteriorEx(playerid, 0);
	SendStaffMessage(X11_TOMATO, "%s Teleportasi ke Los Santos", GetAdminName(playerid));
	AccountData[playerid][pInDoor] = -1;
    AccountData[playerid][pInHouse] = -1;
    AccountData[playerid][pInBiz] = -1;
    AccountData[playerid][pInFamily] = -1;
    AccountData[playerid][pInRusun] = -1;
	ViceCity_SetPlayerCityState(playerid, CITY_LOS_SANTOS, true);
	return 1;
}

CMD:gotoasur(playerid, params[])
{
	if(CheckAdmin(playerid, 3))
		return PermissionError(playerid);
	
	SetPlayerPos(playerid, 421.6674, -1324.8463, 14.9786);
	SetPlayerFacingAngle(playerid, 350.7751);
	SetPlayerVirtualWorldEx(playerid, 0);
	SetPlayerInteriorEx(playerid, 0);
	SendStaffMessage(X11_TOMATO, "%s Teleportasi ke Insuranced", GetAdminName(playerid));
	AccountData[playerid][pInDoor] = -1;
    AccountData[playerid][pInHouse] = -1;
    AccountData[playerid][pInBiz] = -1;
    AccountData[playerid][pInFamily] = -1;
    AccountData[playerid][pInRusun] = -1;
	return 1;
}

CMD:gotocarnaval(playerid, params[])
{
	if(CheckAdmin(playerid, 3)) return PermissionError(playerid);
	
	SetPlayerPositionEx(playerid, 384.6206,-2067.2222,7.8359,177.7058, 3000);
	SetPlayerVirtualWorldEx(playerid, 0);
	SetPlayerInteriorEx(playerid, 0);
	SendStaffMessage(X11_TOMATO, "%s Teleportasi ke Karnaval", GetAdminName(playerid));
	AccountData[playerid][pInDoor] = -1;
    AccountData[playerid][pInHouse] = -1;
    AccountData[playerid][pInBiz] = -1;
    AccountData[playerid][pInFamily] = -1;
    AccountData[playerid][pInRusun] = -1;
	return 1;
}

CMD:goto(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1)
		return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/goto [playerid/PartOfName]");

    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
		
	SendPlayerToPlayer(playerid, otherid);

	SendStaffMessage(X11_TOMATO, "%s teleportasi ke player %s(%d)", AccountData[playerid][pAdminname], ReturnName(otherid), otherid);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd:%s teleportasi ke posisi anda.", AccountData[playerid][pAdminname]);
	return 1;
}

alias:sendtoplayer("stp")
CMD:sendtoplayer(playerid, params[])
{
	new otherid, toother;

	if(CheckAdmin(playerid, 2))
		return PermissionError(playerid);
	
	if(sscanf(params, "uu", otherid, toother)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/sendtoplayer [playerid/Name] to [playerid/name]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain yg ingin dikirim tidak terkoneksi kedalam server!");
	if(!IsPlayerConnected(toother)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain yg ingin dituju tidak terkoneksi kedalam server!");
	static Float:tX, Float:tY, Float:tZ;
	GetPlayerPos(toother, tX, tY, tZ);

	SetPlayerPositionEx(otherid, tX, tY, tZ, 1000);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s mengirimkan anda kepada "YELLOW"%s(%d)", AccountData[playerid][pAdminname], AccountData[toother][pName], toother);
	SendStaffMessage(X11_TOMATO, "%s Mengirimkan "YELLOW"%s(%d)"ARWIN1" kepada "YELLOW"%s(%d)", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid, AccountData[toother][pName], toother);
	return 1;
}

alias:sendto("st")
CMD:sendto(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	static
		otherid,
		option[32];
	
	if(sscanf(params, "us[32]", otherid, option))
	{
		Syntax(playerid, "/sendto [name/playerid] (ls, lv, sf, asuransi, carnaval, bandara, rs, balkot)");
		return 1;
	}

	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!strcmp(option, "ls", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),1482.0356,-1724.5726,13.5469);
        }
        else 
		{
            SetPlayerPosition(otherid,1482.0356,-1724.5726,13.5469,750);
        }
        SetPlayerFacingAngle(otherid,179.4088);
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke Los Santos.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke Los Santos.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else if(!strcmp(option, "lv", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),1686.0118,1448.9471,10.7695);
        }
        else 
		{
            SetPlayerPosition(otherid,1686.0118,1448.9471,10.7695,750);
        }
        SetPlayerFacingAngle(otherid,179.4088);
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke Las Vegas.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke Las Vegas.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else if(!strcmp(option, "sf", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),-1425.8307,-292.4445,14.1484);
        }
        else 
		{
            SetPlayerPosition(otherid,-1425.8307,-292.4445,14.1484,750);
        }
        SetPlayerFacingAngle(otherid,179.4088);
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke San Fiero.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke San Fiero.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else if(!strcmp(option, "asuransi", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),421.6674, -1324.8463, 14.9786);
        }
        else 
		{
            SetPlayerPosition(otherid, 421.6674, -1324.8463, 14.9786, 350);
        }
        SetPlayerFacingAngle(otherid,179.4088);
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke Asuransi.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke Asuransi.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else if(!strcmp(option, "carnaval", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),384.6206,-2067.2222,7.8359);
        }
        else 
		{
            SetPlayerPosition(otherid, 384.6206,-2067.2222,7.8359,177);
        }
        SetPlayerFacingAngle(otherid,179.4088);
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke Carnaval.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke Carnaval.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else if(!strcmp(option, "bandara", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),1685.7037, -2312.1882, 13.6469);
        }
        else 
		{
            SetPlayerPositionEx(otherid, 1685.7037, -2312.1882, 13.6469, 181.1532, 2000);
        }
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke Bandara.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke Bandara.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else if(!strcmp(option, "rs", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),2036.6349, -1409.5667, 17.2641);
        }
        else 
		{
            SetPlayerPositionEx(otherid, 2036.6349, -1409.5667, 17.2641, 184.0463, 2000);
        }
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke Rumah Sakit.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke Rumah Sakit.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else if(!strcmp(option, "balkot", true))
	{
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER) 
		{
            SetVehiclePos(GetPlayerVehicleID(otherid),1246.8817, -2047.2511, 60.1056);
        }
        else 
		{
            SetPlayerPositionEx(otherid, 1246.8817, -2047.2511, 60.1056, 269.0607, 2000);
        }
        SetPlayerInterior(otherid, 0);
        SetPlayerVirtualWorld(otherid, 0);
		SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah berhasil di teleportasikan ke Balai Kota.", AccountData[otherid][pName], otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menteleportasikan anda ke Balai Kota.", AccountData[playerid][pAdminname]);
		AccountData[otherid][pInDoor] = -1;
		AccountData[otherid][pInHouse] = -1;
		AccountData[otherid][pInRusun] = -1;
		AccountData[otherid][pInBiz] = -1;
		AccountData[otherid][pInFamily] = -1;
	}
	else return ShowTDN(playerid, NOTIFICATION_ERROR, "Tempat yang dituju tidak ada!");
	return 1;
}

CMD:gethere(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);
	
	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/gethere [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!SQL_IsCharacterLogged(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut dalam keadaan belum spawn!");
	if(otherid == playerid) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat menarik diri sendiri!");
	if(AccountData[playerid][pJail] || AccountData[otherid][pJail]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda/Pemain tersebut sedang dalam jail admin!");
	if(AccountData[playerid][pArrest] || AccountData[otherid][pArrest]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda/Pemain tersebut sedang dalam penjara!");
	if(AccountData[playerid][pAdmin] < AccountData[otherid][pAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat menarik admin lebih tinggi levelnya dari anda!");

	SendPlayerToPlayer(otherid, playerid);
	SendStaffMessage(X11_TOMATO, "%s telah menarik pemain "YELLOW"%s(%d)"ARWIN1" ke posisinya.", AccountData[playerid][pAdminname], ReturnName(otherid), otherid);
	return 1;
}

CMD:freeze(playerid, params[])
{
	if(CheckAdmin(playerid, 2))
		return PermissionError(playerid);
	
	new userid;
	if(sscanf(params, "u", userid))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/freeze [playerid/Name]");
	
	if(!IsPlayerConnected(userid) || userid == INVALID_PLAYER_ID)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain itu tidak terkoneksi kedalam server!");
	
	AccountData[userid][pFreeze] = true;
	TogglePlayerControllable(userid, 0);
	SendClientMessageEx(playerid, -1, ""YELLOW"[!]:"WHITE" Kamu telah membekukan gerakan %s", ReturnName(userid));
	SendClientMessageEx(playerid, -1, ""YELLOW"[!]:"WHITE" Admin %s Telah membekukan anda", GetAdminName(playerid));
	return 1;
}

CMD:unfreeze(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2)
   		return PermissionError(playerid);
			
	new otherid;
    if(sscanf(params, "u", otherid))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/unfreeze [playerid/PartOfName]");

    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!");

    AccountData[otherid][pFreeze] = 0;

    TogglePlayerControllable(otherid, 1);
    SendClientMessageEx(playerid, -1, "[i] You have unfrozen %s's movements.", ReturnName(otherid));
	SendClientMessageEx(otherid, -1, "[i] You have been unfrozen movements by admin %s.", AccountData[playerid][pAdminname]);
    return 1;
}

CMD:areviveall(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	foreach(new i : Player) if (AccountData[i][pSpawned] && AccountData[i][pInjured])
	{
		AccountData[i][pInjured] = 0;
		AccountData[i][pInjuredTime] = 0;
		
		ClearAnimations(i, 1);
		ApplyAnimation(i, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);
		SetPlayerHealthEx(i, 100.0);
	}
	SendClientMessageToAllEx(X11_GRAY, "AdmCmd:"RED" %s"ARWIN1" telah menghidupkan semua player mati.", GetAdminName(playerid));
	return 1;
}

CMD:togspy(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	if(!AccountData[playerid][pTogSpy])
	{
		AccountData[playerid][pTogSpy] = 1;
		SendClientMessage(playerid, -1, "[i] Anda telah "GREEN"mengaktifkan"WHITE" Spy Mode");
	}
	else
	{
		AccountData[playerid][pTogSpy] = 0;
		SendClientMessage(playerid, -1, "[i] Anda telah "RED"menonaktifkan"WHITE" Spy Mode");
	}
	return 1;
}

CMD:arevive(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1)
		return PermissionError(playerid);
	
	if(!isnull(params) && !strcmp(params, "me", true))
	{
		if(!AccountData[playerid][pInjured]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak sedang pingsan!");

		AccountData[playerid][pInjured] = 0;
		AccountData[playerid][pInjuredTime] = 0;
		SetPlayerHealthEx(playerid, 100.0);
		ClearAnimations(playerid, 1);
		ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);

		return SendStaffMessage(X11_TOMATO, "%s telah menghidupkan "YELLOW"diri sendiri", GetAdminName(playerid));
	}
	new 
		otherid
	;
	if(sscanf(params, "u", otherid)) 
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/arevive [name/playerid] (/arevive me - diri sendiri)");
	
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!AccountData[otherid][pInjured]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak pingsan!");

	AccountData[otherid][pInjured] = 0;
	AccountData[otherid][pInjuredTime] = 0;
	SetPlayerHealthEx(otherid, 100.0);
	ClearAnimations(otherid, 1);
	ApplyAnimation(otherid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);

	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menghidupkan anda", GetAdminName(playerid));
	SendStaffMessage(X11_TOMATO, "%s telah menghidupkan "YELLOW"%s(%d)", GetAdminName(playerid), AccountData[otherid][pName], otherid);
	return 1;
}

CMD:spec(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);
	if(!isnull(params) && !strcmp(params, "off", true))
	{
		if(GetPlayerState(playerid) != PLAYER_STATE_SPECTATING)
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak sedang menonton siapapun!");
		
		AccountData[AccountData[playerid][pSpec]][playerSpectated] --;
		PlayerSpectatePlayer(playerid, INVALID_PLAYER_ID);
		PlayerSpectateVehicle(playerid, INVALID_VEHICLE_ID);
	
		SetSpawnInfo(playerid, 0, AccountData[playerid][pSkin], AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 0, 0, 0, 0, 0, 0);
        TogglePlayerSpectating(playerid, false);
		AccountData[playerid][pSpec] = -1;
		TogglePlayerControllable(playerid, false);
		ShowSpectatorInfo(playerid, false);
		return SendClientMessageEx(playerid, X11_GRAY, "AdmCmd: Kamu tidak lama dalam mode Spectating!");
	}
	new otherid;
	if(sscanf(params, "u", otherid))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/spec [playerid/Name]~n~'/spec off' untuk berhenti spectating!");

	if(!IsPlayerConnected(otherid) || otherid == INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke dalam server!");
	if(otherid == playerid) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat Spectator diri sendiri!");
	if(GetAdminLevel(playerid) < GetAdminLevel(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat Spectator pemain dengan level admin diatas anda!");
	if(!AccountData[otherid][pSpawned])
	{
		ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut belum spawn!");
		return 1;
	}
	
	if(GetPlayerState(playerid) != PLAYER_STATE_SPECTATING)
    {
        GetPlayerPos(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ]);
        GetPlayerFacingAngle(playerid, AccountData[playerid][pPosA]);

        AccountData[playerid][pInt] = GetPlayerInterior(playerid);
        AccountData[playerid][pWorld] = GetPlayerVirtualWorld(playerid);
    }
    SetPlayerInterior(playerid, GetPlayerInterior(otherid));
    SetPlayerVirtualWorld(playerid, GetPlayerVirtualWorld(otherid));

    TogglePlayerSpectating(playerid, true);
    if(IsPlayerInAnyVehicle(otherid))
	{
		new vID = GetPlayerVehicleID(otherid);
        PlayerSpectateVehicle(playerid, GetPlayerVehicleID(otherid));
		if(GetPlayerState(otherid) == PLAYER_STATE_DRIVER)
	    {
			SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: Anda sekarang Spectating"YELLOW" %s(%d)"ARWIN1" yang sedang mengemudikan "YELLOW"%s(%d)", AccountData[otherid][pName], otherid, GetVehicleModelName(GetVehicleModel(vID)), vID);
		}
		else
		{
			SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: Anda sekarang Spectating"YELLOW" %s(%d)"ARWIN1" yang merupakan penumpang di "YELLOW"%s(%d).", AccountData[otherid][pName], otherid, GetVehicleModelName(GetVehicleModel(vID)), vID);
		}
	}
    else
	{
        PlayerSpectatePlayer(playerid, otherid);
	}
	AccountData[otherid][playerSpectated]++;
    AccountData[playerid][pSpec] = otherid;
	ShowSpectatorInfo(playerid, true);
	SendStaffMessage(X11_TOMATO, "%s sedang memantau "YELLOW"%s(%d).", GetAdminName(playerid), GetRPName(otherid), otherid);
	return 1;
}

CMD:slap(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);
	new otherid, Float: POS[3];
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/slap [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(AccountData[otherid][pAdmin] > AccountData[playerid][pAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat slap admin level diatas anda!");

	GetPlayerPos(otherid, POS[0], POS[1], POS[2]);
	SetPlayerPos(otherid, POS[0], POS[1], POS[2] + 9.0);
	if(IsPlayerInAnyVehicle(otherid)) RemovePlayerFromVehicle(otherid);
	
	SendStaffMessage(X11_TOMATO, "%s telah melakukan slaped ke pemain "YELLOW"%s(%d).", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	PlayerPlaySound(otherid, 1130, 0.0, 0.0, 0.0);
	return 1;
}

CMD:peject(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3)
		return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/peject <ID>");
	    return 1;
	}

	if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");

	if(!IsPlayerInAnyVehicle(otherid))
	{
		ShowTDN(playerid, NOTIFICATION_ERROR, "Player tersebut tidak berada dalam kendaraan!");
		return 1;
	}

	new vv = GetVehicleModel(GetPlayerVehicleID(otherid));
	Info(playerid, "You have successfully ejected %s(%i) from their %s.", AccountData[otherid][pName], otherid, GetVehicleModelName(vv - 400));
	Info(otherid, "%s(%i) has ejected you from your %s.", AccountData[playerid][pName], playerid, GetVehicleModelName(vv));
	RemovePlayerFromVehicle(otherid);
	return 1;
}

CMD:astats(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) 
		return PermissionError(playerid);
	
	new otherid;
	if(sscanf(params, "u", otherid))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/check [playerid/PartOfName]");
		
	if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");

	if(!AccountData[otherid][IsLoggedIn])
        return ShowTDN(playerid, NOTIFICATION_ERROR, "That player is not logged in yet.");

	Player_Stats(playerid, otherid);
	return 1;
}

CMD:ostats(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) 
		return PermissionError(playerid);

	new playerName[24], playerOnline[24];
	if(sscanf(params, "s[24]", playerName)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/ostats [player name]");
	foreach(new i : Player)
	{
		GetPlayerName(i, playerOnline, MAX_PLAYER_NAME);
		if(strfind(playerOnline, playerName, true) != -1)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang online, gunakan /astats!");
		}
	}

	new shstr[1046], cQuery[1048];
	strcat(shstr, "pID, Char_UCP, Char_Name, Char_Age, Char_BodyHeight, Char_BodyWeight, Char_Origin, Char_Gender, Char_Job, Char_PhoneNum, Char_Faction, Char_FactionRank, Char_Family, Char_FamilyRank, Char_RedMoney, Char_Money, Char_BankMoney, Char_Health, Char_Armour, Char_Hunger, Char_Thirst, Char_Stress, Char_Warn, Char_Level, Char_LevelUp, Char_Admin, Char_TheStars, Char_TheStarsTime, Char_Vip, Char_VipTime, Char_TogPM, Char_Skin, Char_RegisterDate, Char_LastLogin");
	mysql_format(g_SQL, cQuery, sizeof(cQuery), "SELECT %s FROM player_characters WHERE Char_Name='%e' LIMIT 1;", shstr, playerName);
	mysql_tquery(g_SQL, cQuery, "OfflineStats", "ds", playerid, playerName);
	return 1;
}

CMD:acuff(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3)
   		return PermissionError(playerid);
			
	new otherid;		
    if(sscanf(params, "u", otherid))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/acuff [playerid/PartOfName]");

    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");

    //if(otherid == playerid)
        //return ShowTDN(playerid, NOTIFICATION_ERROR, "You cannot handcuff yourself.");

    if(!NearPlayer(playerid, otherid, 5.0))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "You must be near this player.");

    if(GetPlayerState(otherid) != PLAYER_STATE_ONFOOT)
        return ShowTDN(playerid, NOTIFICATION_ERROR, "The player must be onfoot before you can cuff them.");

    if(AccountData[otherid][pCuffed])
        return ShowTDN(playerid, NOTIFICATION_ERROR, "The player is already cuffed at the moment.");

    AccountData[otherid][pCuffed] = 1;
	SetPlayerSpecialAction(otherid, SPECIAL_ACTION_CUFFED);

    SendClientMessageEx(playerid, -1, ""YELLOW"[!] Player %s telah berhasil di cuffed.", AccountData[otherid][pName]);
    SendClientMessageEx(otherid, -1, ""YELLOW"[!] Admin %s telah mengcuffed anda.", AccountData[playerid][pName]);
    return 1;
}

CMD:auncuff(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3)
   		return PermissionError(playerid);
			
	new otherid;		
    if(sscanf(params, "u", otherid))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/auncuff [playerid/PartOfName]");

    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");

    //if(otherid == playerid)
        //return ShowTDN(playerid, NOTIFICATION_ERROR, "You cannot uncuff yourself.");

    if(!NearPlayer(playerid, otherid, 5.0))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "You must be near this player.");

    if(!AccountData[otherid][pCuffed])
        return ShowTDN(playerid, NOTIFICATION_ERROR, "The player is not cuffed at the moment.");

    AccountData[otherid][pCuffed] = 0;
    SetPlayerSpecialAction(otherid, SPECIAL_ACTION_NONE);

	SendClientMessageEx(playerid, -1, ""YELLOW"Player %s telah berhasil uncuffed.", AccountData[otherid][pName]);
    SendClientMessageEx(otherid, -1, ""YELLOW"Admin %s telah uncuffed tangan anda.", AccountData[playerid][pName]);
    return 1;
}

CMD:jetpack(playerid, params[])
{
	if(!AccountData[playerid][IsLoggedIn]) return 0;
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid))
	{
		AccountData[playerid][pJetpack] = true;
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_USEJETPACK);
		SendStaffMessage(X11_TOMATO, "%s Menggunakan Jetpack", AccountData[playerid][pAdminname]);
	}
	else 
	{
		AccountData[otherid][pJetpack] = true;
		SetPlayerSpecialAction(otherid, SPECIAL_ACTION_USEJETPACK);
		SendStaffMessage(X11_TOMATO, "%s memberikan jetpack kepada "YELLOW"%s(%d).", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	}
	return 1;
}

CMD:getip(playerid, params[]) 
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new otherid, PlayerIP[24], givePlayer[24];
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/getip [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(AccountData[otherid][pAdmin] > 5)
	{
		ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat mengambil ip admin diatas anda!");
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: "RED"%s(%d)"ARWIN1" mencoba mengambil data ip anda.", AccountData[playerid][pAdminname], playerid);
		return 1;
	}
	GetPlayerName(otherid, givePlayer, sizeof(givePlayer));
	GetPlayerIp(otherid, PlayerIP, sizeof(PlayerIP));
	
	SendClientMessageEx(playerid, X11_TOMATO, "AdmCmd: Details IP Pemain "YELLOW"%s(%d) ~> "GREEN"`%s`.", givePlayer, otherid, PlayerIP);
	return 1;
}

CMD:aka(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1)
     	return PermissionError(playerid);
	new otherid, PlayerIP[16], query[128];
	if(sscanf(params, "u", otherid))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/aka <ID/Name>");
	    return true;
	}
	
	if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");
		
	if(AccountData[otherid][pAdmin] == 5)
 	{
  		ShowTDN(playerid, NOTIFICATION_ERROR, "You can't AKA the server owner!");
  		Info(otherid, "%s(%i) tried to AKA you!", AccountData[playerid][pName], playerid);
  		return 1;
    }
	GetPlayerIp(otherid, PlayerIP, sizeof(PlayerIP));
	mysql_format(g_SQL, query, sizeof(query), "SELECT Char_Name FROM player_characters WHERE Char_IP='%e'", PlayerIP);
	mysql_tquery(g_SQL, query, "CheckPlayerIP", "is", playerid, PlayerIP);
	return true;
}

CMD:akaip(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1)
     	return PermissionError(playerid);
	new query[128];
	if(isnull(params))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/akaip <IP>");
		return true;
	}

	mysql_format(g_SQL, query, sizeof(query), "SELECT `Char_Name` FROM `player_characters` WHERE `Char_IP`='%e'", params);
	mysql_tquery(g_SQL, query, "CheckPlayerIP2", "is", playerid, params);
	return true;
}

CMD:vmodels(playerid, params[])
{
    new string[3500];

    if(AccountData[playerid][pAdmin] < 1)
     	return PermissionError(playerid);

    for (new i = 0; i < sizeof(g_arrVehicleNames); i ++)
    {
        format(string,sizeof(string), "%s%d - %s\n", string, i+400, g_arrVehicleNames[i]);
    }
    ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_LIST, "Vehicle Models", string, "Close", "");
    return 1;
}

CMD:vehname(playerid, params[]) {

	if(AccountData[playerid][pAdmin] >= 1) 
	{
		SendClientMessageEx(playerid, COLOR_YELLOW, "--------------------------------------------------------------------------------------------------------------------------------");
		SendClientMessageEx(playerid, COLOR_WHITE, "Vehicle Search:");

		new
			string[128];

		if(isnull(params)) return ShowTDN(playerid, NOTIFICATION_ERROR, "No keyword specified.");
		if(!params[2]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Search keyword too short.");

		for(new v; v < sizeof(g_arrVehicleNames); v++) 
		{
			if(strfind(g_arrVehicleNames[v], params, true) != -1) {

				if(isnull(string)) format(string, sizeof(string), "%s (ID %d)", g_arrVehicleNames[v], v+400);
				else format(string, sizeof(string), "%s | %s (ID %d)", string, g_arrVehicleNames[v], v+400);
			}
		}

		if(!string[0]) ShowTDN(playerid, NOTIFICATION_ERROR, "No results found.");
		else if(string[127]) ShowTDN(playerid, NOTIFICATION_ERROR, "Too many results found.");
		else SendClientMessageEx(playerid, COLOR_WHITE, string);

		SendClientMessageEx(playerid, COLOR_YELLOW, "--------------------------------------------------------------------------------------------------------------------------------");
	}
	else
	{
		PermissionError(playerid);
	}
	return 1;
}

CMD:owarn(playerid, params[]) 
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);
	new player[24], reason[125], playerName[MAX_PLAYER_NAME];
	if(sscanf(params, "s[24]s[125]", player, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/owarn [name player] [reason]");
	if(strlen(reason) > 125) return ShowTDN(playerid, NOTIFICATION_ERROR, "Teks reason maksimal 125 characters!");
	foreach(new i : Player) 
	{
		GetPlayerName(i, playerName, MAX_PLAYER_NAME);

		if(strfind(playerName, player, true) != -1)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang online, gunakan /warn!");
		}
	}
	new query[255];
	mysql_format(g_SQL, query, sizeof(query), "SELECT `pID`, `Char_Warn` FROM `player_characters` WHERE `Char_Name`='%e'", player);
	mysql_tquery(g_SQL, query, "OfflineWarnPlayer", "iss", playerid, player, reason);
	return 1;
}

forward OfflineWarnPlayer(playerid, name[], reason[]);
public OfflineWarnPlayer(playerid, name[], reason[])
{
	if(!cache_num_rows())
	{
		return ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Akun dengan nama %s tidak ditemukan!", name));
	}
	else 
	{
		new RegID, Warn;
		cache_get_value_index_int(0, 0, RegID);
		cache_get_value_index_int(0, 1, Warn);

		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: Akun "YELLOW"%s"ARWIN1" telah diberikan warning(offline) oleh "RED"%s.", name, AccountData[playerid][pAdminname]);
		SendClientMessageToAllEx(X11_ARWIN, "~> Alasan: %s.", reason);

		new query[255];
		mysql_format(g_SQL, query, sizeof(query), "UPDATE `player_characters` SET `Char_Warn`=%d WHERE `pID`=%d", Warn + 1, RegID);
		mysql_tquery(g_SQL, query);

		mysql_format(g_SQL, query, sizeof(query), "INSERT INTO `warninglogs` SET `pID`=%d, `WarnType`=1, `WarnSender`='%e', `WarnTime`=%d, `WarnReason`='%e'", RegID, AccountData[playerid][pAdminname], gettime(), reason);
		mysql_tquery(g_SQL, query);
	}
	return 1;
}

CMD:oreco(playerid, params[])
{
	if(CheckAdmin(playerid, 5))
		return PermissionError(playerid);
	
	new player[24], reason[50];
	if(sscanf(params, "s[24]S()[50]", player, reason))
	{
		ShowTDN(playerid, NOTIFICATION_SYNTAX, "/oreco [player name] [reason]");
		return 1;
	}

	foreach(new ii : Player)
	{
		new PlayerName[24];
		GetPlayerName(ii, PlayerName, MAX_PLAYER_NAME);

		if(strfind(PlayerName, player, true) != -1)
		{
			ShowTDN(playerid, NOTIFICATION_ERROR, "Player ini sedang online, gunakan /reco");
			return 1;
		}
	}
	new query[512];
	mysql_format(g_SQL, query, sizeof(query), "SELECT pID FROM player_characters WHERE Char_Name='%e'", player);
	mysql_tquery(g_SQL, query, "ORecoPlayer", "iss", playerid, player, reason);
	
	static shstr[125];
	format(shstr, sizeof(shstr), "Menggunakan cmd /oreco kepada akun dengan nama %s.", player);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:ojail(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	new player[24], datez, reason[64], playerName[MAX_PLAYER_NAME];
	if(sscanf(params, "s[24]ds[64]", player, datez, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/ojail [name] [minutes] [reason]");
	if(strlen(reason) > 64) return ShowTDN(playerid, NOTIFICATION_ERROR, "Reason harus lebih singkat dibawah 64 characters!");
	if(datez < 1 || datez > 120) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat menjail dibawah 1 atau lebih dari 120 menit!");
	foreach(new ii : Player) 
	{
		GetPlayerName(ii, playerName, MAX_PLAYER_NAME);

		if(strfind(playerName, player, true) != -1)
		{
			ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang online. Gunakan /jail!");
			return 1;
		}
	}
	new query[512];
	mysql_format(g_SQL, query, sizeof(query), "SELECT `pID` FROM `player_characters` WHERE `Char_Name`='%e'", player);
	mysql_tquery(g_SQL, query, "OfflineJailed", "issi", playerid, player, reason, datez);
	return 1;
}
forward OfflineJailed(adminid, const NameJail[], const Reason[], time);
public OfflineJailed(adminid, const NameJail[], const Reason[], time)
{
	if(!cache_num_rows())
	{
		return ShowTDN(adminid, NOTIFICATION_ERROR, sprintf("Account dengan nama %s tidak ditemukan!", NameJail));
	}
	else 
	{
		new RegID, Jailtime = time * 60;
		cache_get_value_index_int(0, 0, RegID);
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: Pemain dengan nama "YELLOW"%s"ARWIN1" telah dijail (offline) selama "RED"%d menit "ARWIN1"oleh"RED" %s", NameJail, time, GetAdminName(adminid));
		SendClientMessageToAllEx(X11_ARWIN, "~> Alasan: %s", Reason);

		new query[522], tmp[200], date;
		date = gettime();
		mysql_format(g_SQL, query, sizeof(query), "UPDATE `player_characters` SET `Char_Jail`=1, `Char_JailTime`=%d, `Char_JailReason`='%e' WHERE `pID`=%d", Jailtime, Reason, RegID);
		mysql_tquery(g_SQL, query);

		mysql_format(g_SQL, query, sizeof(query), "INSERT INTO `warninglogs` SET `pID`=%d, `WarnType`=2, `WarnTime`=%d, `WarnSender`='%e', `WarnReason`='%e'", RegID, date, GetAdminName(adminid), Reason);
		mysql_tquery(g_SQL, query);

		format(tmp, sizeof(tmp), "Menggunakan cmd /ojail kepada pemain dengan nama %s selama %d menit. Alasan: %s", NameJail, time, Reason);
		AddAdminLog(AccountData[adminid][pName], AccountData[adminid][pUCP], GetStaffRank(adminid), tmp);
	}
	return 1;
}
forward ORecoPlayer(adminid, NameToReco[], RecoReason[]);
public ORecoPlayer(adminid, NameToReco[], RecoReason[])
{
	if(!cache_num_rows())
	{
		ShowTDN(adminid, NOTIFICATION_ERROR, sprintf("Account %s tidak ditemukan", NameToReco));
		return 1;
	}
	else 
	{
		new RegID;
		cache_get_value_index_int(0, 0, RegID);

		SendClientMessageToAllEx(X11_YELLOW, "%s telah mereset ekonomi(offline) player %s [Reason: %s]", GetAdminName(adminid), NameToReco, RecoReason);
		mysql_tquery(g_SQL, sprintf("UPDATE player_characters SET Char_BankMoney=0,Char_Money=0 WHERE pID='%d'", RegID));
	}
	return 1;
}

CMD:jail(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new otherid, minutes, denda, reason[125];
	if(sscanf(params, "udds[64]", otherid, minutes, denda, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/jail [name/playerid] [minutes] [denda [0 jika tanpa denda]] [alasan]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(minutes < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat menjail player dibawah 0 menit!");
	if(denda < 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukan nominal dibawah $0 untuk denda!");

	AccountData[otherid][pInjured] = 0;
	AccountData[otherid][pInjuredTime] = 0;
	AccountData[otherid][pJail] = true;
	AccountData[otherid][pJailTime] = minutes * 60;
	format(AccountData[otherid][pJailReason], sizeof(reason), reason);
	format(AccountData[otherid][pJailBy], MAX_PLAYER_NAME, AccountData[playerid][pAdminname]);
	TakeMoney(otherid, denda);
	SpawnPlayerInJail(otherid);
	SendClientMessageToAllEx(X11_DARKORANGE, "AdmCmd: %s(%d) telah dijail selama %d menit terkena denda sebesar %s oleh %s", ReturnName(otherid), otherid, minutes, FormatMoney(denda), AccountData[playerid][pAdminname]);
	SendClientMessageToAllEx(X11_DARKORANGE, "Reason ~> %s", reason);
	new query[255], shstr[255], date;
	date = gettime();
	mysql_format(g_SQL, query, sizeof(query), "INSERT INTO `warninglogs` SET `pID`=%d, `WarnType`=2, `WarnTime`=%d, `WarnSender`='%e', `WarnReason`='%e'", AccountData[otherid][pID], date, GetAdminName(playerid), reason);
	mysql_tquery(g_SQL, query);

	format(shstr, sizeof(shstr), "Menggunakan cmd /jail kepada pemain %s selama %d menit + %s denda", AccountData[otherid][pName], minutes, FormatMoney(denda));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	SendJailLog(playerid, otherid, reason);
	return 1;
}

CMD:aunarrest(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/aunarrest [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!AccountData[otherid][pArrest] || !AccountData[otherid][pArrestTime]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak dalam masa (Arrest)!");

	AccountData[otherid][pArrest] = 0;
	AccountData[otherid][pArrestTime] = 0;
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd %s Membebaskan anda dari Arrest (Penjara Polisi)", AccountData[playerid][pAdminname]);
	SendStaffMessage(X11_TOMATO, "%s Membebaskan player %s(%d) dari Arrest (Penjara Polisi)", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	SetPlayerPositionEx(otherid, 1483.3868, -1720.3635, 13.7969, 183.0591, 5000);
	return 1;
}

CMD:unjail(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/unjail [name/playerid]");
	    return true;
	}

    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");

	if(AccountData[otherid][pJail] == 0)
	    return ShowTDN(playerid, NOTIFICATION_ERROR, "The player isn't in jail!");

	AccountData[otherid][pJail] = 0;
	AccountData[otherid][pJailTime] = 0;
	format(AccountData[otherid][pJailReason], 32, "None");
	format(AccountData[otherid][pJailBy], MAX_PLAYER_NAME, "Server");
	SetPlayerInterior(otherid, 0);
	SetPlayerVirtualWorld(otherid, 0);
	SetPlayerPos(otherid, 1529.6,-1691.2,13.3);
	SetPlayerSpecialAction(otherid, SPECIAL_ACTION_NONE);
	JobInfo_Hide(otherid);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah membebaskan anda dari penjara!", GetAdminName(playerid));
	SendStaffMessage(X11_TOMATO, "%s telah membebaskan %s(%d) dari hukuman jail!", GetAdminName(playerid), GetRPName(otherid), otherid);
	
	new cQuery[178];
	mysql_format(g_SQL, cQuery, sizeof(cQuery), "DELETE FROM `warninglogs` WHERE `WarnType` = 2 AND `pID` = '%d'", AccountData[otherid][pID]);
	mysql_query(g_SQL, cQuery, false);
	return 1;
}

CMD:kick(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new otherid, reason[128];
	if(sscanf(params, "us[128]", otherid, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/kick [name/playerid] [reason]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(AccountData[otherid][pAdmin] > AccountData[playerid][pAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat kick admin level diatas anda!");
	
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"YELLOW" %s(%d)"ARWIN1" telah ditendang dari server oleh "RED"%s.", AccountData[otherid][pName], otherid, AccountData[playerid][pAdminname]);
	SendClientMessageToAllEx(X11_ARWIN, "~> Alasan: %s", reason);
	KickEx(otherid);
	return 1;
}

CMD:blockucp(playerid, params[])
{
	new username[MAX_PLAYER_NAME], banTime, datez, reason[128];
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	if(sscanf(params, "s[24]ds[128]", username, datez, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/blockucp [ucp name] [waktu [hari]] [reason]");
	
	if(!Blacklist_UCPExists("Char_UCP", username))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Nama UCP tidak terdaftar di server!");
	
	if(Blacklist_Exists("name", username))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "UCP telah di banned sebelumnya!");
	
	foreach(new i : Player) if (!strcmp(AccountData[i][pUCP], username))
	{
		if(AccountData[i][pAdmin] > AccountData[playerid][pAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memblokir Akun UCP admin diatas anda!");
	}
	
	if(datez != 0)
	{
		banTime = gettime() + (datez * 86400);
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah memblokir Akun UCP "YELLOW"%s"ARWIN1" dari server selama %d hari.", AccountData[playerid][pAdminname], username, datez);
		SendClientMessageToAllEx(X11_ARWIN, "Reason ~> %s", reason);
	}
	else
	{
		banTime = datez;
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah memblokir "RED"Permanent"ARWIN1" Akun UCP "YELLOW"%s"ARWIN1" dari server.", AccountData[playerid][pAdminname], username, datez);
		SendClientMessageToAllEx(X11_ARWIN, "Reason ~> %s", reason);
	}

	new query[248];
	mysql_format(g_SQL, query, sizeof(query), "INSERT INTO `player_bans` (`name`, `ip`, `admin`, `reason`, `ban_date`, `ban_expire`) VALUES ('%e', ' ', '%e', '%e', '%d', '%d')", username, AccountData[playerid][pAdminname], reason, gettime(), banTime);
	mysql_tquery(g_SQL, query);
	return 1;
}

CMD:ban(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if (AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	new banTime, datez, reason[128], otherid;
	if(sscanf(params, "uds[128]", otherid, datez, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/ban [name/playerid] [hari] [reason]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(datez < 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Jumlah time tidak valid!");
	if(AccountData[playerid][pAdmin] < 3)
	{
		if(datez > 10 || datez <= 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda hanya dapat membanned selama 1 sampai 10 hari!");
	}
	if(AccountData[otherid][pAdmin] > AccountData[playerid][pAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat membanned admin yang lebih tinggi levelnya dari anda!");

	new PlayerIP[16], playerName[32];

	GetPlayerName(otherid, playerName, sizeof(playerName));
	GetPlayerIp(otherid, PlayerIP, sizeof(PlayerIP));

	if(datez != 0)
	{
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" telah membanned akun player"YELLOW" %s(%d)"ARWIN1" selama "YELLOW"%d"ARWIN1" hari", GetAdminName(playerid), playerName, otherid, datez);
		SendClientMessageToAllEx(X11_ARWIN, "~> Alasan: %s", reason);
		
		new shstr[128];
		format(shstr, sizeof(shstr), "Menggunakan cmd /ban kepada %s selama %d hari dengan alasan %s", playerName, datez, reason);
		AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	}
	else
	{
		SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" telah membanned "RED"Permanent"ARWIN1" player"YELLOW" %s(%d)", GetAdminName(playerid), playerName, otherid, datez);
		SendClientMessageToAllEx(X11_ARWIN, "~> Alasan: %s", reason);
		
		new shstr[128];
		format(shstr, sizeof(shstr), "Menggunakan cmd /ban kepada %s selama permanent hari dengan alasan %s", playerName, reason);
		AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	}
	if(datez != 0)
    {
		banTime = gettime() + (datez * 86400);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: "RED"Temporary Banned"ARWIN1" kepada anda selama %d hari.", datez);
	}
	else
	{
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd:"RED" Permanent Banned"ARWIN1" harap kontak admin yang bersangkutan jika anda merasa tidak bersalah!");
		banTime = datez;
	}
	new query[248], date;
	date = gettime();
	mysql_format(g_SQL, query, sizeof(query), "INSERT INTO `player_bans` (`name`, `ip`, `admin`, `reason`, `ban_date`, `ban_expire`) VALUES ('%e', '%e', '%e', '%e', '%d', '%d')", AccountData[otherid][pName], PlayerIP, AccountData[playerid][pAdminname], reason, gettime(), banTime);
	mysql_tquery(g_SQL, query);

	mysql_format(g_SQL, query, sizeof(query), "INSERT INTO `warninglogs` SET `pID`=%d, `WarnTime`=%d, `WarnType`=3, `WarnSender`='%e', `WarnReason`='%e'", AccountData[otherid][pID], date, AccountData[playerid][pAdminname], reason);
	mysql_tquery(g_SQL, query);

	new Status[128];
	if(datez != 0) {
		format(Status, sizeof(Status), "%d Hari", datez);
	} else {
		format(Status, sizeof(Status), "Permanent");
	}

	SendBanLog(playerid, otherid, datez, reason);

	KickEx(otherid);
	return 1;
}

CMD:unban(playerid, params[])
{
   	if(AccountData[playerid][pAdmin] < 2)
			return PermissionError(playerid);
	
	new tmp[32];
	if(sscanf(params, "s[32]", tmp))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/unban [ban name]");
	    return true;
	}
	new query[128];
	mysql_format(g_SQL, query, sizeof(query), "SELECT name,ip FROM player_bans WHERE name = '%e'", tmp);
	mysql_tquery(g_SQL, query, "OnUnbanQueryData", "is", playerid, tmp);
	return 1;
}

forward OnUnbanQueryData(adminid, BannedName[]);
public OnUnbanQueryData(adminid, BannedName[])
{
	if(cache_num_rows() > 0)
	{
		new query[128];
		mysql_format(g_SQL, query, sizeof(query), "DELETE FROM `player_bans` WHERE `name` = '%e'", BannedName);
		mysql_tquery(g_SQL, query);

		SendStaffMessage(X11_TOMATO, "%s telah mencabut status banned dari akun %s", AccountData[adminid][pAdminname], BannedName);
		
		new shstr[125];
		format(shstr, sizeof(shstr), "Menggunakan cmd /unban kepada akun dengan UCP %s", BannedName);
		AddAdminLog(AccountData[adminid][pName], AccountData[adminid][pUCP], GetStaffRank(adminid), shstr);
	}
	else
	{
		ShowTDN(adminid, NOTIFICATION_ERROR, sprintf("Tidak ada player name '%s' terdaftar di ban list.", BannedName));
	}
	return 1;
}

/*CMD:unbanucp(playerid, params[])
{
   	if(AccountData[playerid][pAdmin] < 3)
			return PermissionError(playerid);
	
	new tmp[24];
	if(sscanf(params, "s[24]", tmp))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/unbanucp <ucp name>");
	    return true;
	}
	new query[128];
	mysql_format(g_SQL, query, sizeof(query), "SELECT name FROM player_bans WHERE name = '%e'", tmp);
	mysql_tquery(g_SQL, query, "UnbanUCP", "is", playerid, tmp);
	return 1;
}

function UnbanUCP(adminid, BannedName[])
{
	if(cache_num_rows() > 0)
	{
		new query[128];
		mysql_format(g_SQL, query, sizeof(query), "DELETE FROM player_bans WHERE name = '%e'", BannedName);
		mysql_tquery(g_SQL, query);

		SendStaffMessage(X11_TOMATO, "%s telah melepas hukuman banned "YELLOW"%s"ARWIN1" dari server", GetAdminName(adminid), BannedName);
	}
	else
	{
		Error(adminid, "No player named '%s' found on the ban list.", BannedName);
	}
	return 1;
}*/

CMD:awarn(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	new otherid, dbsr[200];
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/awarn [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	mysql_format(g_SQL, dbsr, sizeof(dbsr), "SELECT * FROM `warninglogs` WHERE `pID`=%d", AccountData[otherid][pID]);
	new Cache:execute = mysql_query(g_SQL, dbsr, true);
	if(cache_num_rows())
	{
		new list[1048], type, typename[125], sender[64], date, reason[128];
		format(list, sizeof(list), "Type\tPenerbit\tTanggal\tAlasan\n");
		for(new x; x < cache_num_rows(); ++x)
		{
			cache_get_value_name_int(x, "WarnType", type);
			cache_get_value_name(x, "WarnSender", sender);
			cache_get_value_name_int(x, "WarnTime", date);
			cache_get_value_name(x, "WarnReason", reason);
			switch(type)
			{
				case 1: format(typename, sizeof(typename), ""ORANGE"[Warn]");
				case 2: format(typename, sizeof(typename), ""YELLOW"[Jail]");
				case 3: format(typename, sizeof(typename), ""RED"[BAN]");
			}

			format(list, sizeof(list), "%s%s\t%s\t%s\t%s\n", list, typename, sender, ReturnDateNoTime(date), reason);
		}
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, sprintf(""ALTHF"EAGLE "WHITE"- %s(%d)", AccountData[otherid][pName], otherid), list, "Tutup", "");
	}
	else
	{
		new list[255];
		format(list, sizeof(list), "Type\tPenerbit\tTanggal\tAlasan\n");
		format(list, sizeof(list), "%sTidak ada peringatan yang dapat ditampilkan kepadamu.", list);
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, sprintf(""ALTHF"EAGLE "WHITE"- %s(%d)", AccountData[otherid][pName], otherid), list, "Tutup", "");
	}
	cache_delete(execute);
	return 1;
}

CMD:warning(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1)
		return PermissionError(playerid);
	
	new otherid, reason[100];
	if(sscanf(params, "ds[100]", otherid, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/awarn [name/playerid] [alasan]");
	if(strlen(reason) > 100) return ShowTDN(playerid, NOTIFICATION_ERROR, "Max Characters 100!");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

	ShowPlayerWarning(otherid, playerid, reason, 6500, 1);
	SendClientMessageEx(playerid, -1, ""BLUEJEGE"Admin Warning:"WHITE" Anda telah memperingati pemain "YELLOW"%s(%d)", ReturnName(otherid), otherid);
	SendClientMessageEx(playerid, -1, ""BLUEJEGE"Reason:"WHITE" %s", reason);
	return 1;
}

CMD:warn(playerid, params[])
{
	if(CheckAdmin(playerid, 2)) return PermissionError(playerid);

	static 
		otherid, 
		reason[64]
	;
	if(sscanf(params, "us[64]", otherid, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/warn [name/playerid] [reason]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(AccountData[otherid][pAdmin] > AccountData[playerid][pAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat warn admin level diatas anda!");

	AccountData[otherid][pWarn] ++;
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "YELLOW"%s(%d)"ARWIN1" telah diberikan warning oleh "RED"%s.", AccountData[otherid][pName], otherid, GetAdminName(playerid));
	SendClientMessageToAllEx(X11_ARWIN, "~> Alasan: %s", reason);

	new query[255], currentTime;
	currentTime = gettime();
	mysql_format(g_SQL, query, sizeof(query), "INSERT INTO `warninglogs` SET `pID`=%d, `WarnType`=1, `WarnSender`='%e', `WarnTime`=%d, `WarnReason`='%e'", AccountData[otherid][pID], GetAdminName(playerid), currentTime, reason);
	mysql_tquery(g_SQL, query);

	#if defined DiscordMode
		new dMsg[256];
		format(dMsg, sizeof(dMsg), 
			"**WARN LOGS ⚠️**\n\
			Name Admin : %s\n\
			Player Warn : %s\n\
			Warn Amount : Total Warn %d\n\
			Reason : %s",
			GetAdminName(playerid),
			AccountData[otherid][pName],
			AccountData[otherid][pWarn],
			reason
		);

		DCC_SendChannelMessage(WarnLog, dMsg);
	#endif
	return 1;
}

CMD:unwarn(playerid, params[])
{
	if(CheckAdmin(playerid, 2)) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/unwarn [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	AccountData[otherid][pWarn] -= 1;
	
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menghapus 1 point warning anda!", GetAdminName(playerid));
	SendStaffMessage(X11_TOMATO, "%s telah menghapus 1 point warning dari %s", GetAdminName(playerid), AccountData[otherid][pName]);
	return 1;
}

RespawnNearbyVehicles(playerid, Float:radi)
{
    new Float:x, Float:y, Float:z;
    GetPlayerPos(playerid, x, y, z);
    for(new i=1; i<MAX_VEHICLES; i++)
    {
        if(GetVehicleModel(i))
        {
            new Float:posx, Float:posy, Float:posz;
            new Float:tempposx, Float:tempposy, Float:tempposz;
            GetVehiclePos(i, posx, posy, posz);
            tempposx = (posx - x);
            tempposy = (posy - y);
            tempposz = (posz - z);
            if (((tempposx < radi) && (tempposx > -radi)) && ((tempposy < radi) && (tempposy > -radi)) && ((tempposz < radi) && (tempposz > -radi)))
            {
				if(IsVehicleEmpty(i))
				{
					//SetVehicleToRespawn(i);
					SetTimerEx("RespawnPV", 3000, false, "d", i);
					SendStaffMessage(X11_TOMATO, "%s telah merespawn kendaraan disekitarnya dengan radius"YELLOW" %.1f", GetAdminName(playerid), radi);
				}
			}
        }
    }
}

CMD:respawnsidejob(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);
	SetTimerEx("RespawnPVSideJob", 10000, false, "d", playerid);
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: %s telah memulai timer selama 10 detik untuk merespawn kendaraan sidejob yang tidak terpakai / dinaiki.", AccountData[playerid][pAdminname]);
	return 1;
}

forward RespawnPVSideJob(playerid);
public RespawnPVSideJob(playerid)
{
	forex(i, sizeof(SweeperVehicles)) if (GetVehicleDriver(SweeperVehicles[i]) == INVALID_PLAYER_ID)
	{
		SetVehicleToRespawn(SweeperVehicles[i]);
		VehicleCore[SweeperVehicles[i]][vCoreFuel] = MAX_FUEL_FULL;
		SetValidVehicleHealth(SweeperVehicles[i], 1000.0);
	}
	forex(i, sizeof(ForkliftVehicles)) if (GetVehicleDriver(ForkliftVehicles[i]) == INVALID_PLAYER_ID)
	{
		SetVehicleToRespawn(ForkliftVehicles[i]);
		VehicleCore[ForkliftVehicles[i]][vCoreFuel] = MAX_FUEL_FULL;
		SetValidVehicleHealth(ForkliftVehicles[i], 1000.0);
	}
	forex(i, sizeof(DeliveryVehicles)) if (GetVehicleDriver(DeliveryVehicles[i]) == INVALID_PLAYER_ID)
	{
		SetVehicleToRespawn(DeliveryVehicles[i]);
		VehicleCore[DeliveryVehicles[i]][vCoreFuel] = MAX_FUEL_FULL;
		SetValidVehicleHealth(DeliveryVehicles[i], 1000.0);
	}
	forex(i, sizeof(TrashmasterVehicles)) if (GetVehicleDriver(TrashmasterVehicles[i]) == INVALID_PLAYER_ID)
	{
		SetVehicleToRespawn(TrashmasterVehicles[i]);
		VehicleCore[TrashmasterVehicles[i]][vCoreFuel] = MAX_FUEL_FULL;
		SetValidVehicleHealth(TrashmasterVehicles[i], 1000.0);
	}
	forex(i, sizeof(MowerVehicles)) if (GetVehicleDriver(MowerVehicles[i]) == INVALID_PLAYER_ID)
	{
		SetVehicleToRespawn(MowerVehicles[i]);
		VehicleCore[MowerVehicles[i]][vCoreFuel] = MAX_FUEL_FULL;
		SetValidVehicleHealth(MowerVehicles[i], 1000.0);
	}
	SendClientMessageToAll(X11_ARWIN, "AdmCmd: Semua kendaraan sidejob yang tidak terpakai/dinaiki telah direspawn kembali");
	return 1;
}

CMD:respawnrad(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2)
		return PermissionError(playerid);
		
	new rad;
	if(sscanf(params, "d", rad)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/respawnrad [radius] | respawn vehicle nearest");
	
	if(rad > 50) return ShowTDN(playerid, NOTIFICATION_ERROR, "Maximal 50 radius");
	RespawnNearbyVehicles(playerid, rad);
	return 1;
}

CMD:sethp(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;

	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	
	new otherid, value;
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/sethp [name/playerid] [health]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value > 100) return ShowTDN(playerid, NOTIFICATION_ERROR, "Health tidak dapat lebih dari 100!");
	
	SetPlayerHealthEx(otherid, value);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan health anda menjadi %d", GetAdminName(playerid), value);
	SendStaffMessage(X11_TOMATO, "%s telah menetapkan health %s(%d) - %d%%", GetAdminName(playerid), GetRPName(otherid), otherid, value);
	return 1;
}

CMD:sethpall(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;

	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new value;
	if(sscanf(params, "d", value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/sethpall [health]");
	foreach(new i : Player) if (IsPlayerConnected(i) && SQL_IsCharacterLogged(i))
	{
		SetPlayerHealthEx(i, value);
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah menetapkan health bagi seluruh pemain menjadi %d", GetAdminName(playerid), value);
	return 1;
}

CMD:setbone(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);
	
	new jumlah, otherid;
	if(sscanf(params, "ud", otherid, jumlah)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setbone [name/playerid] [value]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	AccountData[otherid][pHead] = jumlah;
	AccountData[otherid][pPerut] = jumlah;
	AccountData[otherid][pLFoot] = jumlah;
	AccountData[otherid][pRFoot] = jumlah;
	AccountData[otherid][pLHand] = jumlah;
	AccountData[otherid][pRHand] = jumlah;
	SendStaffMessage(X11_TOMATO, "%s telah men set jumlah Kondisi tulang pemain "YELLOW"%s(%d).", AccountData[playerid][pAdminname], AccountData[otherid][pName], otherid);
	SendClientMessageEx(otherid, -1, ""ARWIN1"Admin "RED"%s"ARWIN1" telah men set Kondisi tulang anda", AccountData[playerid][pAdminname]);
	return 1;
}

CMD:setboneall(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	
	new jumlah;
	if(sscanf(params, "d", jumlah)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setboneall [value]");
	
	foreach(new i : Player) if (AccountData[i][pSpawned])
	{
		AccountData[i][pHead] = jumlah;
		AccountData[i][pPerut] = jumlah;
		AccountData[i][pLFoot] = jumlah;
		AccountData[i][pRFoot] = jumlah;
		AccountData[i][pLHand] = jumlah;
		AccountData[i][pRHand] = jumlah;
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" telah men set jumlah Kondisi tulang seluruh pemain online menjadi %d%%.", AccountData[playerid][pAdminname], jumlah);
	return 1;
}

CMD:setam(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;

	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	
	new jumlah, otherid;
	if(sscanf(params, "ud", otherid, jumlah)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setam [name/playerid] [value]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(jumlah > 99) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat lebih dari 99!");

	SetPlayerArmourEx(otherid, jumlah);
	SendStaffMessage(X11_TOMATO, "%s telah menetapkan armour %s(%d) - %d.00", GetAdminName(playerid), GetRPName(otherid), otherid, jumlah);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan armour anda menjadi %d.00", GetAdminName(playerid), jumlah);
	return 1;
}

CMD:vsethealth(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new vehid, Float:health;
	if(sscanf(params, "df", vehid, health)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/vsethealth [vehicle id] [health]");
	if(vehid == INVALID_VEHICLE_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "VID kendaraan tidak valid!");
	
	foreach(new i : PvtVehicles) if (PlayerVehicle[i][pVehExists])
	{
		if(PlayerVehicle[i][pVehPhysic] == vehid)
		{
			PlayerVehicle[i][pVehHealth] = health;
			SetValidVehicleHealth(PlayerVehicle[i][pVehPhysic], PlayerVehicle[i][pVehHealth]);
		}
	}

	SetValidVehicleHealth(vehid, health);
	SendStaffMessage(X11_TOMATO, "%s menetapkan %.2f Health untuk kendaraan [VID: %d] [%s]", AccountData[playerid][pAdminname], health, vehid, GetVehicleName(vehid));
	return 1;
}

CMD:afix(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

    new vehicleid = GetPlayerVehicleID(playerid);
    new index = Vehicle_ReturnID(vehicleid);

    if(index == RETURN_INVALID_VEHICLE_ID) 
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan tidak ditemukan!");

    if(vehicleid > 0 && isnull(params))
    {
        ValidRepairVehicle(vehicleid);
        if(PlayerVehicle[index][pVehEngineUpgrade] == 1)
        {
            SetValidVehicleHealth(vehicleid, 2000);
        }
        else
        {
            SetValidVehicleHealth(vehicleid, 1000);
        }

        if(PlayerVehicle[index][pVehBodyUpgrade] == 3)
        {
            PlayerVehicle[index][pVehBodyRepair] = 1000.0;
        }
        SendStaffMessage(X11_TOMATO, "%s memperbaiki kendaraan [VID: %d] [%s]", AccountData[playerid][pAdminname], vehicleid, GetVehicleName(vehicleid));
    }
    else
    {
        if(sscanf(params, "d", vehicleid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/afix [vehicle id]");
        if(!IsValidVehicle(vehicleid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "ID Kendaraan tidak valid!");

        ValidRepairVehicle(vehicleid);
        index = Vehicle_ReturnID(vehicleid);
        
        if(index == RETURN_INVALID_VEHICLE_ID) 
            return ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan tidak ditemukan!");

        if(PlayerVehicle[index][pVehEngineUpgrade] == 1)
        {
            SetValidVehicleHealth(vehicleid, 2000);
        }
        else
        {
            SetValidVehicleHealth(vehicleid, 1000);
        }

        if(PlayerVehicle[index][pVehBodyUpgrade] == 3)
        {
            PlayerVehicle[index][pVehBodyRepair] = 1000.0;
        }
        SendStaffMessage(X11_TOMATO, "%s memperbaiki kendaraan [VID: %d] [%s]", AccountData[playerid][pAdminname], vehicleid, GetVehicleName(vehicleid));
    }
    return 1;
}

CMD:setskin(playerid, params[])
{
	if (AccountData[playerid][pAdmin] < 4) return PermissionError(playerid);

	new otherid, skin;
	if(sscanf(params, "ud", otherid, skin)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setskin [name/playerid] [skin]");
	if(skin < 0 || skin > 311) return ShowTDN(playerid, NOTIFICATION_ERROR, "Skin ID tidak valid!");

	SetPlayerSkinEx(otherid, skin);
	SendStaffMessage(X11_TOMATO, "%s menetapkan skin %s(%d) - %d.", GetAdminName(playerid), AccountData[otherid][pName], otherid, skin);
	return 1;
}

CMD:annp(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3)
        return PermissionError(playerid);

	new otherid, message[128];
	if(sscanf(params, "us[128]", otherid, message)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/annp [name/playerid] [message]");
	// Check for special trouble-making input
   	if(!IsPlayerConnected(otherid))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(strfind(message, "~x~", true) != -1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "~x~ is not allowed in announce.");
	if(strfind(message, "#k~", true) != -1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "The constant key is not allowed in announce.");
	if(strfind(message, "/q", true) != -1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "You are not allowed to type /q in announcement!");

	// Count tildes (uneven number = faulty input)
	new iTemp = 0;
	for(new i = (strlen(message)-1); i != -1; i--)
	{
		if(message[i] == '~')
			iTemp ++;
	}
	if(iTemp % 2 == 1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "You either have an extra ~ or one is missing in the announcement!");
	
	new str[512];
	format(str, sizeof(str), "~w~%s", message);
	GameTextForPlayer(otherid, str, 6000, 4);
	return true;
}

CMD:ann(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2)
        return PermissionError(playerid);

 	if(isnull(params))
    {
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/announce <msg>");
	    return 1;
	}
	// Check for special trouble-making input
   	if(strfind(params, "~x~", true) != -1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "~x~ is not allowed in announce.");
	if(strfind(params, "#k~", true) != -1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "The constant key is not allowed in announce.");
	if(strfind(params, "/q", true) != -1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "You are not allowed to type /q in announcement!");

	// Count tildes (uneven number = faulty input)
	new iTemp = 0;
	for(new i = (strlen(params)-1); i != -1; i--)
	{
		if(params[i] == '~')
			iTemp ++;
	}
	if(iTemp % 2 == 1)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "You either have an extra ~ or one is missing in the announcement!");
	
	new str[512];
	format(str, sizeof(str), "~w~%s", params);
	GameTextForAll(str, 6500, 3);
	return true;
}

CMD:settime(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 4)
        return PermissionError(playerid);

	new time;
	if(sscanf(params, "d", time)) ShowTDN(playerid, NOTIFICATION_SYNTAX, "/time [time]"); 
	
	SetWorldTime(time);
	foreach(new ii : Player)
	{
		SetPlayerTime(ii, time, 0);
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah mengubah waktu in-game server", GetAdminName(playerid));
	return 1;
}

CMD:setweather(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 4) return PermissionError(playerid);

	new weather;
	if(sscanf(params, "d", weather)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setweather [weather id]");

	SetWeather(weather);
	WorldWeather = weather;
	foreach(new i : Player) 
	{
		SetPlayerWeather(i, weather);
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd: "RED"%s"ARWIN1" telah mengubah cuaca in-game server.", AccountData[playerid][pAdminname]);
    return 1;
}

CMD:gotoco(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 4)
		return PermissionError(playerid);
		
	new Float: pos[3], int;
	if(sscanf(params, "fffd", pos[0], pos[1], pos[2], int)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/gotoco [x coordinate] [y coordinate] [z coordinate] [interior]");

	SendClientMessageEx(playerid, -1, ""GREEN"[GOTOCO] "WHITE"Anda berhasil teleportasi ke kordinat tersebut");
	SetPlayerPositionEx(playerid, pos[0], pos[1], pos[2], 0.0, 1500);
	SetPlayerInterior(playerid, int);
	return 1;
}
CMD:cd(playerid)
{
	if(CheckAdmin(playerid, 2))
		return PermissionError(playerid);
	
	if(Count != -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Sedang ada Countdown Proses. tunggu sampai selesai!");

	Count = 6;
	countTimer = SetTimer("pCountDown", 1000, 1);

	foreach(new ii : Player)
	{
		showCD[ii] = 1;
	}
	SendClientMessageToAllEx(X11_YELLOW, "Admin %s telah memulai global countdown!", GetAdminName(playerid));
	return 1;
}

CMD:oban(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	
	new player[24], datez, reason[128];
	if(sscanf(params, "s[24]D(0)s[50]", player, datez, reason))
	{
		ShowTDN(playerid, NOTIFICATION_SYNTAX, "/oban [player name] [durasi (0 untuk permanent)] [reason]");
		return 1;
	}

	if(strlen(reason) > 128)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Reason tidak dapat lebih dari 128 character!");
	
	foreach(new pid : Player)
	{
		new playerName[24];
		GetPlayerName(AccountData[pid][pName], playerName, MAX_PLAYER_NAME);

		if(strfind(AccountData[pid][pName], player, true) != -1)
		{
			ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut online, gunakan /ban");
			return 1;
		}
	}

	new query[200];
	mysql_format(g_SQL, query, sizeof(query), "SELECT Char_IP FROM player_characters WHERE Char_Name='%e'", player);
	mysql_tquery(g_SQL, query, "OnOBanQueryData", "dssd", playerid, player, reason, datez);
	return 1;
}

CMD:banip(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 2)
     	return PermissionError(playerid);

	if(isnull(params))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/banip <IP Address>");
		return true;
	}
	if(strfind(params, "*", true) != -1 && AccountData[playerid][pAdmin] != 5)
	{
		ShowTDN(playerid, NOTIFICATION_ERROR, "You are not authorized to ban ranges.");
  		return true;
  	}

	SendClientMessageToAllEx(COLOR_RED, "Server: {ffff00}Admin %s(%d) IP banned address %s.", AccountData[playerid][pAdminname], playerid, params);

	new tstr[128];
	format(tstr, sizeof(tstr), "banip %s", params);
	SendRconCommand(tstr);
	return 1;
}

CMD:unbanip(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 2)
     	return PermissionError(playerid);

	if(isnull(params))
	{
	    ShowTDN(playerid, NOTIFICATION_SYNTAX, "/unbanip <IP Address>");
		return true;
	}
	new mstr[128];
	format(mstr, sizeof(mstr), "unbanip %s", params);
	SendRconCommand(mstr);
	format(mstr, sizeof(mstr), "reloadbans");
	SendRconCommand(mstr);
	SendClientMessageEx(playerid, -1, ""YELLOW"[!] You have unbanned IP address %s.", params);
	return 1;
}

CMD:reloadweap(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 3)
        return PermissionError(playerid);
	new otherid;
    if(sscanf(params, "u", otherid))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/reloadweps [playerid/PartOfName]");

    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");

    SetWeapons(otherid);
    SendClientMessageEx(playerid, -1, ""YELLOW"[!] You have reload %s's weapons.", AccountData[otherid][pName]);
    SendClientMessageEx(otherid, -1, ""YELLOW"[!] Admin %s have reload your weapons.", AccountData[playerid][pAdminname]);
    return 1;
}

CMD:resetweap(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 3)
        return PermissionError(playerid);
	new otherid;
    if(sscanf(params, "u", otherid))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/resetweap [playerid/PartOfName]");

    if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");

    ResetPlayerWeaponsEx(otherid);
    SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s telah mereset senjata anda.", AccountData[playerid][pAdminname]);
    SendStaffMessage(X11_TOMATO, "%s telah mereset senjata %s(%d).", GetAdminName(playerid), AccountData[otherid][pName], otherid);
	return 1;
}

CMD:setlevel(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 4)
        return PermissionError(playerid);
	
	new jumlah, otherid;
	if(sscanf(params, "ud", otherid, jumlah))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setlevel [playerid id/name] <jumlah>");
	
	if(!IsPlayerConnected(otherid))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "Player belum masuk!.");
		
	if(AccountData[otherid][newCitizen]) {
		if(jumlah <= 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Level yang di set harus lebih dari 1.");
		AccountData[otherid][newCitizen] = false;
		AccountData[otherid][newCitizenTimer] = 0;
	}
	AccountData[otherid][pLevel] = jumlah;
	SetPlayerScore(otherid, jumlah);
	SendStaffMessage(X11_TOMATO, "%s telah menetapkan level kepada %s(%d) - %d", GetAdminName(playerid), GetRPName(otherid), otherid, jumlah);
	return 1;
}


CMD:setstress(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);
	
	new userid, jumlah;
	if(sscanf(params, "ud", userid, jumlah)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setstress [name/playerid] [value]");
	if(!IsPlayerConnected(userid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	AccountData[userid][pStress] = jumlah;
	SendClientMessageEx(userid, X11_TOMATO, "AdmCmd: %s telah menetapkan stress anda menjadi %d%%", AccountData[playerid][pAdminname], jumlah);
	SendStaffMessage(X11_TOMATO, "%s telah menetapkan stress %s(%d) menjadi %d%%", AccountData[playerid][pAdminname], AccountData[userid][pName], userid, jumlah);
	return 1;
}

CMD:reco(playerid, params[])
{
	if(CheckAdmin(playerid, 5))
		return PermissionError(playerid);
	
	new userid;
	if(sscanf(params, "u", userid))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/reco [playerid/Name]~n~NOTE: Hati hati ini mereset economy menjadi $0");
	
	if(!IsPlayerConnected(userid))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tidak dikota atau disconnect!");
	
	GiveMoney(userid, -AccountData[playerid][pMoney]);
	AccountData[userid][pBankMoney] = 0;
	SendStaffMessage(X11_TOMATO, "%s telah mereset ekonomi %s(%d)", GetAdminName(playerid), GetRPName(userid), userid);
	SendClientMessageEx(userid, X11_GRAY, "[i] Admin "RED"%s"ARWIN1" telah mereset ekonomi anda", GetAdminName(playerid));
	
	new shstr[256];
	mysql_format(g_SQL, shstr, sizeof(shstr), "UPDATE `player_characters` SET `Char_BankMoney`=0, `Char_Money`=IF(`Char_ClothesEpoch`=%d,0,`Char_Money`) WHERE `pID`=%d", gECEpoch[userid], AccountData[userid][pID]);
	mysql_tquery(g_SQL, shstr);

	format(shstr, sizeof(shstr), "Menggunakan cmd /reco kepada akun dengan nama %s.", AccountData[userid][pName]);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:setstressall(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new value;
	if(sscanf(params, "d", value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setstressall [value]");
	foreach(new i : Player) if (IsPlayerConnected(i) && SQL_IsCharacterLogged(i))
	{
		AccountData[i][pStress] = value;
	}
	SendClientMessageToAllEx(X11_GRAY, "AdmCmd: %s telah menetapkan stress seluruh pemain menjadi %d", GetAdminName(playerid), value);
	return 1;
}

CMD:goodmood(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	if(!AccountData[playerid][pGoodMood])
	{
		AccountData[playerid][pGoodMood] = true;
		SendStaffMessage(X11_ARWIN, "%s menggunakan cmd '/goodmood'", GetAdminName(playerid));
	}
	else
	{
		AccountData[playerid][pGoodMood] = false;
		SendStaffMessage(X11_ARWIN, "%s berhenti dari mode '/goodmood'", GetAdminName(playerid));
	}
	return 1;
}

CMD:sethbe(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))	
		return 0;
	
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new targetid, value;
	if(sscanf(params, "ud", targetid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/sethbe [name/playerid] [value]");
	if(!IsPlayerConnected(targetid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value > 100) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat lebih dari 100!");

	AccountData[targetid][pHunger] = value;
	AccountData[targetid][pThirst] = value;
	SendClientMessageEx(targetid, X11_GRAY, "[i] Admin"RED" %s"ARWIN1" telah menetapkan HBE anda menjadi %d", GetAdminName(playerid), value);
	SendStaffMessage(X11_TOMATO, "%s telah menetapkan HBE kepada %s(%d) - %d", GetAdminName(playerid), GetRPName(targetid), targetid, value);
	return 1;
}

CMD:sethbeall(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))	
		return 0;
	
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new value;
	if(sscanf(params, "d", value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/sethbeall [value]");
	if(value > 100) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat lebih dari 100!");
	foreach(new i : Player) if (IsPlayerConnected(i) && SQL_IsCharacterLogged(i))
	{
		AccountData[i][pHunger] = value;
		AccountData[i][pThirst] = value;
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah menetapkan HBE untuk seluruh player menjadi %d", GetAdminName(playerid), value);
	return 1;
}

CMD:setvip(playerid, params[])
{
	if(CheckAdmin(playerid, 6))
		return PermissionError(playerid);
	
	new vlevel, dayz, otherid;
	if(sscanf(params, "udd", otherid, vlevel, dayz))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setvip [playerid/Name] [level 0 - 3] [time (hari) 0 untuk permanent]");
	
	if(otherid == INVALID_PLAYER_ID || !IsPlayerConnected(otherid))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke dalam server!");
	if(vlevel > 3)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Level tidak bisa lebih dari 3!");
	if(vlevel < 0) 	
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Level tidak bisa kurang dari 0!");
	if(dayz < 0)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Time tidak bisa kurang dari 0!");
	
	if(AccountData[otherid][IsLoggedIn] == false)
	{
		ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Pemain %s(%d) tidak sedang terkoneksi ke dalam server!", AccountData[otherid][pName], otherid));
		return true;
	}
	if(CheckAdmin(playerid, 5) && dayz > 7)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda hanya bisa menset 1 - 7 hari!");
	
	AccountData[otherid][pVip] = vlevel;
	if(dayz == 0)
	{
		AccountData[otherid][pVipTime] = 0;
		SendStaffMessage(X11_TOMATO, "%s telah menetapkan VIP %s kepada %s(%d). Durasi: Permanent.", GetAdminName(playerid), GetPlayerVipName(otherid), GetRPName(otherid), otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s telah menetapkan VIP Kepada anda ke level %s Permanent time!", GetAdminName(playerid), GetPlayerVipName(otherid));
	}
	else
	{
		AccountData[otherid][pVipTime] = gettime() + (dayz * 86400);
		SendStaffMessage(X11_TOMATO, "%s telah menetapkan VIP %s kepada %s(%d). Durasi: %d hari.", GetAdminName(playerid), GetPlayerVipName(otherid), GetRPName(otherid), otherid, dayz);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s telah menetapkan VIP Kepada anda ke level %s selama %d hari!", GetAdminName(playerid), GetPlayerVipName(otherid), dayz);
	}
	
	static shstr[125];
	format(shstr, sizeof(shstr), "Menggunakan cmd /setvip %s %d hari kepada akun %s.", GetPlayerVipName(otherid), dayz, AccountData[otherid][pName]);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:giveweapall(playerid, params[])
{
	static weaponid, ammo;

	new level;
	if(AccountData[playerid][pAdmin] < 7)
		return PermissionError(playerid);
	
	if(sscanf(params, "ddI(50)", level, weaponid, ammo)) 
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/giveweapall [dimulai dari level] [weaponid] [ammo]");
	
	if(level < 1) 
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat memasukkan level dibawah 1!");
	
	if(weaponid <= 0 || weaponid > 46 || (weaponid >= 19 && weaponid <= 21))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "You have specified an invalid weapon.");

    if(ammo < 1 || ammo > 250)
        return ShowTDN(playerid, NOTIFICATION_ERROR, "You have specified an invalid weapon ammo, 1 - 250");
	
	foreach(new i : Player) if (AccountData[i][pSpawned])
	{
		if(AccountData[i][pLevel] >= level)
		{
			GivePlayerWeaponEx(i, weaponid, ammo);
			SavePlayerWeapon(i);
		}
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah memberikan "YELLOW"%s(%d ammo)"ARWIN1" kepada seluruh pemain lebih dari level %d", AccountData[playerid][pAdminname], ReturnWeaponName(weaponid), ammo, level);
	
	static shstr[125];
	format(shstr, sizeof(shstr), "Menggunakan cmd /giveweapall %s(%d ammo) kepada seluruh pemain online lebih dari level %d.", ReturnWeaponName(weaponid), ammo, level);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:giveweap(playerid, params[])
{
    static
        weaponid,
        ammo;
		
	new otherid;
    if(AccountData[playerid][pAdmin] < 4)
        return PermissionError(playerid);

    if(sscanf(params, "udI(250)", otherid, weaponid, ammo))
        return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/givewep [playerid/PartOfName] [weaponid] [ammo]");

    if(otherid == INVALID_PLAYER_ID)
        return ShowTDN(playerid, NOTIFICATION_ERROR, "You cannot give weapons to disconnected players.");


    if(weaponid <= 0 || weaponid > 46 || (weaponid >= 19 && weaponid <= 21))
        return ShowTDN(playerid, NOTIFICATION_ERROR, "You have specified an invalid weapon.");

    if(ammo < 1 || ammo > 500)
        return ShowTDN(playerid, NOTIFICATION_ERROR, "You have specified an invalid weapon ammo, 1 - 500");

    GivePlayerWeaponEx(otherid, weaponid, ammo);
	SavePlayerWeapon(otherid);
	SendStaffMessage(X11_TOMATO, "%s memberikan %s(%d Ammo) kepada %s(%d).", GetAdminName(playerid), ReturnWeaponName(weaponid), ammo, AccountData[otherid][pName], otherid);
    
	static shstr[125];
	format(shstr, sizeof(shstr), "Menggunakan cmd /giveweap %s(%d ammo) kepada akun dengan nama %s.", ReturnWeaponName(weaponid), ammo, AccountData[otherid][pName]);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:takemoney(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
			return 0;

	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new otherid, value, shstr[255];
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/takemoney [name/playerid] [value]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value > AccountData[otherid][pMoney]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang pemain itu tidak sebanyak value!");

	TakeMoney(otherid, value);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s telah menarik uang anda sejumlah "DARKGREEN"%s.", GetAdminName(playerid), FormatMoney(value));
	SendStaffMessage(X11_TOMATO, "%s telah menarik uang milik %s(%d) -> %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, FormatMoney(value));

	format(shstr, sizeof(shstr), "Menarik uang milik %s sejumlah %s.", AccountData[otherid][pName], FormatMoney(value));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:veh(playerid, params[])
{
	new 
		model[32],
		color1,
		color2;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);
	
	if(sscanf(params, "s[32]I(0)I(0)", model, color1, color2))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/veh [model ID/name] [pVehcolor 1] [pVehcolor 2]");
	
	if((model[0] = GetVehicleModelByName(model)) == 0)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Model ID tidak valid!");
	
	static 
		Float:x,
		Float:y,
		Float:z,
		Float:a,
		vehicleid;
	
	GetPlayerPos(playerid, x, y, z);
	GetPlayerFacingAngle(playerid, a);

	vehicleid = CreateVehicle(model[0], x, y, z, a, color1, color2, 60000, false);
	VehicleCore[vehicleid][vehAdminPhysic] = vehicleid;
    VehicleCore[vehicleid][vCoreFuel] = MAX_FUEL_FULL;
	VehicleCore[vehicleid][vehAdmin] = true;
	SetValidVehicleHealth(VehicleCore[vehicleid][vehAdminPhysic], 1000.0);

	if(GetPlayerInterior(playerid) != 0)
		LinkVehicleToInterior(vehicleid, GetPlayerInterior(playerid));
	
	if(GetPlayerVirtualWorld(playerid) != 0)
		SetVehicleVirtualWorld(vehicleid, GetPlayerVirtualWorld(playerid));

	if(IsABoat(vehicleid) || IsAPlane(vehicleid) || IsAHelicopter(vehicleid))
    {
        PutPlayerInVehicle(playerid, vehicleid, 0);
        SetCameraBehindPlayer(playerid);
    }
	SetVehicleParamsEx(vehicleid, 1, 1, 0, 0, 0, 0, 0);
    SetVehicleNumberPlate(vehicleid, ""RED"ADMIN");
	SendStaffMessage(X11_TOMATO, "%s memunculkan kendaraan %s dengan warna (%d, %d).", GetAdminName(playerid), GetVehicleModelName(model[0]), color1, color2);
	return 1;
}

CMD:dveh(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new vehid;
	if(sscanf(params, "d", vehid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/dveh [pVehID]");
	if(vehid == INVALID_VEHICLE_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Vehicle ID tidak valid!");

	foreach(new i : PvtVehicles) if (PlayerVehicle[i][pVehExists])
	{
		if(PlayerVehicle[i][pVehPhysic] == vehid)
		{
			if(IsValidVehicle(PlayerVehicle[i][pVehPhysic]))
			{
				DestroyVehicle(PlayerVehicle[i][pVehPhysic]);
				PlayerVehicle[i][pVehPhysic] = INVALID_VEHICLE_ID;
				PlayerVehicle[i][pVehInsuranced] = true;
				break;
			}
		}
	}

	if(VehicleCore[vehid][vehAdmin])
	{
		DestroyVehicle(VehicleCore[vehid][vehAdminPhysic]);
		VehicleCore[vehid][vehAdminPhysic] = INVALID_VEHICLE_ID;
		VehicleCore[vehid][vehAdmin] = false;
	}

	if(SidejobVehicles(vehid))
	{
		SetVehicleToRespawn(vehid);
	}
	return 1;
}

CMD:customplate(playerid, params[])
{
	new vehid, string[256];
	if(!AccountData[playerid][IsLoggedIn])
		return false;

	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	if(sscanf(params, "ds[256]", vehid, string))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/customplate [VID] [Custom Plate]");
	
	if(vehid == INVALID_VEHICLE_ID || !IsValidVehicle(vehid))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "VID Kendaraan Tidak Valid!");
	
	if(VehicleCore[vehid][vehAdmin]) return ShowTDN(playerid, NOTIFICATION_ERROR, "VID Ini kendaraan Admin!");

	foreach(new i : PvtVehicles)
	{
		if(vehid == PlayerVehicle[i][pVehPhysic])
		{
			foreach(new pid : Player)
			{
				if(PlayerVehicle[i][pVehOwnerID] == AccountData[pid][pID]) {
					PlayerVehicle[i][pVehPlateOwn] = 1;
					format(PlayerVehicle[i][pVehPlate], 256, "%s", string);
					SetVehicleNumberPlate(PlayerVehicle[i][pVehPhysic], PlayerVehicle[i][pVehPlate]);

					SendClientMessageEx(pid, X11_GRAY, "AdmCmd: Admin "RED"%s"ARWIN1" telah mengcustom plate kendaraan anda dengan nomor plate: %s", GetAdminName(playerid), string);
					SendStaffMessage(X11_TOMATO, "%s menggunakan cmd '/customplate' pada kendaraan milik %s(%d) - Plat %s.", GetAdminName(playerid), AccountData[pid][pName], pid, string);
				}
			}
		}
	}

	static shstr[255];
	format(shstr, sizeof(shstr), "Menggunakan cmd /customplate untuk kendaraan VID: %d Database ID: %d", vehid, PlayerVehicle[vehid][pVehID]);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:adveh(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new vehicleid = GetPlayerVehicleID(playerid);

	// cek apakah pemain di kendaraan atau di tanah
	if(GetPlayerState(playerid) == PLAYER_STATE_ONFOOT) //jika player sedang di tanah
	{
		for (new i = 0; i < MAX_VEHICLES; i ++) 
		{
			if(VehicleCore[i][vehAdmin] && IsVehicleEmpty(VehicleCore[i][vehAdminPhysic]))
			{
				DestroyVehicle(VehicleCore[i][vehAdminPhysic]);
				VehicleCore[i][vehAdmin] = false;
				VehicleCore[i][vehAdminPhysic] = INVALID_VEHICLE_ID;
			}
		}
		SendStaffMessage(X11_TOMATO, "%s telah menghancurkan semua kendaraan static tidak terpakai milik Admin.", GetAdminName(playerid));
	}
	else //jika player tidak di tanah atau sedang didalam kendaraan
	{
		if(!VehicleCore[vehicleid][vehAdmin])
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda hanya dapat menghancurkan kendaraan admin!");
		}

		DestroyVehicle(VehicleCore[vehicleid][vehAdminPhysic]);
		VehicleCore[vehicleid][vehAdmin] = false;
		VehicleCore[vehicleid][vehAdminPhysic] = INVALID_VEHICLE_ID;
		SendStaffMessage(X11_TOMATO, "%s menghancurkan kendaraan static admin VID: %d.", GetAdminName(playerid), vehicleid);
	}
	return 1;
}
//-----------------------------[ Admin Level 5 ]------------------
alias:setadminname("setaname")
CMD:setadminname(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);

	new aname[100], otherid;
	if(sscanf(params, "us[100]", otherid, aname)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setadminname [name/playerid] [admin name]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

	new query[125];
	mysql_format(g_SQL, query, sizeof(query), "SELECT `Char_AdminName` FROM `player_characters` WHERE `Char_AdminName`='%e'", aname);
	mysql_tquery(g_SQL, query, "a_ChangeAdminName", "iis", otherid, playerid, aname);
	return 1;
}

CMD:setmoney(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 6) return ShowTDN(playerid, NOTIFICATION_ERROR, "Hanya bisa diakses oleh Management server.");
		
	new otherid, money;
	if(sscanf(params, "ud", otherid, money)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setmoney [name/playerid] [value]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	ResetPlayerMoneyEx(otherid);
	GiveMoney(otherid, money);
	
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd:"RED" %s telah menetapkan uang anda menjadi %s", GetAdminName(playerid), FormatMoney(money));
	SendStaffMessage(X11_TOMATO, "%s telah menetapkan uang %s(%d) - %s", AccountData[playerid][pAdminname], GetRPName(otherid), otherid, FormatMoney(money));
	new string[512], tss[225];
	format(tss, sizeof(tss), "UPDATE player_characters SET Char_Money=IF(Char_ClothesEpoch=%d,%d,Char_Money) WHERE pID='%d'", gECEpoch[otherid], AccountData[otherid][pMoney], AccountData[otherid][pID]);
	mysql_tquery(g_SQL, tss);

	format(string, sizeof(string), "menggunakan cmd /setmoney untuk %s dengan jumlah %s.", AccountData[otherid][pName], FormatMoney(money));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), string);
	return 1;
}

CMD:givemoney(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 6) return ShowTDN(playerid, NOTIFICATION_ERROR, "Hanya bisa diakses oleh Management server.");

	new otherid, value;
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/givemoney [name/playerid] [value]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

	GiveMoney(otherid, value);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s memberikan anda uang sejumlah "DARKGREEN"%s.", GetAdminName(playerid), FormatMoney(value));
	SendStaffMessage(X11_TOMATO, "%s memberikan uang kepada %s(%d) - %s", GetAdminName(playerid), AccountData[otherid][pName], otherid, FormatMoney(value));
	
	static tmp[225];
	format(tmp, sizeof(tmp), "Menggunakan cmd /givemoney untuk %s dengan jumlah %s.", AccountData[otherid][pName], FormatMoney(value));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);
	return 1;
}

CMD:givemoneyall(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 3) return PermissionError(playerid);

	new value;
	if(sscanf(params, "d", value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/givemoneyall [value]");
	if(value < 1 || value > 10000) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat kurang dari $1 atau lebih dari $10,000");
	foreach(new i : Player) if (IsPlayerConnected(i) && SQL_IsCharacterLogged(i))
	{
		GiveMoney(i, value);
	}
	SendClientMessageToAllEx(X11_ARWIN, "AdmCmd:"RED" %s"ARWIN1" telah memberikan uang kepada player online dengan jumlah "DARKGREEN"%s.", GetAdminName(playerid), FormatMoney(value));

	static shstr[255];
	format(shstr, sizeof(shstr), "Menggunakan cmd /givemoneyall dengan jumlah %s.", FormatMoney(value));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

alias:setbankmoney("setbmoney")
CMD:setbankmoney(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 5) return PermissionError(playerid);

	new otherid, value, tss[225], tmp[128];
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setbankmoney [name/playerid] [value]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Jumlah tidak valid!");

	AccountData[otherid][pBankMoney] = value;
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s menetapkan Saldo Rekening anda menjadi "DARKGREEN"%s.", GetAdminName(playerid), FormatMoney(value));
	SendStaffMessage(X11_TOMATO, "%s menetapkan Saldo Rekening %s(%d) - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, FormatMoney(value));

	format(tmp, sizeof(tmp), "Menggunakan cmd /setbankmoney untuk %s dengan jumlah %s.", AccountData[otherid][pName], FormatMoney(value));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);

	mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_BankMoney`=%d WHERE `pID`=%d", value, AccountData[otherid][pID]);
	mysql_tquery(g_SQL, tss);
	return 1;
}

CMD:setvw(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1) return PermissionError(playerid);
	
	new otherid, wwid;
	if(sscanf(params, "ud", otherid, wwid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setvw [name/playerid] [VWID]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	SetPlayerVirtualWorldEx(otherid, wwid);
	SendStaffMessage(X11_TOMATO, "%s menetapkan WWID %s(%d) - %d", GetAdminName(playerid), AccountData[otherid][pName], otherid, wwid);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah men set VWID anda - %d.", AccountData[playerid][pAdminname], wwid);
	return 1;
}

CMD:setint(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1) return PermissionError(playerid);
	
	new otherid, intid;
	if(sscanf(params, "ud", otherid, intid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setvw [name/playerid] [Int ID]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	SetPlayerInteriorEx(otherid, intid);
	SendStaffMessage(X11_TOMATO, "%s menetapkan INT ID %s(%d) - %d", GetAdminName(playerid), AccountData[otherid][pName], otherid, intid);
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah men set Int ID anda - %d.", AccountData[playerid][pAdminname], intid);
	return 1;
}

CMD:explode(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 3)
		return PermissionError(playerid);
	
	new otherid, Float:POS[3], givePlayer[32];
	if(!isnull(params) && !strcmp(params, "me", true))
	{
		GetPlayerPos(playerid, POS[0], POS[1], POS[2]);
		CreateExplosion(POS[0], POS[1], POS[2], 7, 5.0);
		return 1;
	}

	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/explode [name/playerid] (/explode me - meledakkan diri sendiri)");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");

	GetPlayerName(otherid, givePlayer, sizeof(givePlayer));
	GetPlayerPos(otherid, POS[0], POS[1], POS[2]);
	CreateExplosion(POS[0], POS[1], POS[2], 7, 5.0);
	SendStaffMessage(X11_TOMATO, "%s menggunakan explode kepada %s(%d).", GetAdminName(playerid), AccountData[otherid][pName], otherid);
	
	static tmp[125];
	format(tmp, sizeof(tmp), "Menggunakan cmd /explode kepada %s.", givePlayer);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);
	return 1;	
}

alias:setadmin("setalevel")
CMD:setadmin(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6) return PermissionError(playerid);
	
	new otherid, value, tmp[125], tss[125];
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setadmin [name/playerid] [level]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value < 0 || value > 6) return ShowTDN(playerid, NOTIFICATION_ERROR, "Level tidak valid! (0-6)");

	AccountData[otherid][pAdmin] = value;
	AccountData[otherid][pAdminHide] = 0;
	SendClientMessageEx(otherid, X11_ARWIN, "[i] Admin "RED"%s"ARWIN1" telah menetapkan anda sebagai %s", GetAdminName(playerid), GetStaffRank(otherid));
	SendStaffMessage(X11_TOMATO, "%s telah menetapkan admin kepada %s(%d) - %s.", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetStaffRank(otherid));

	format(tmp, sizeof(tmp), "Menggunakan cmd /setadmin kepada %s menjadi admin level %d.", AccountData[otherid][pName], value);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), tmp);

	mysql_format(g_SQL, tss, sizeof(tss), "UPDATE `player_characters` SET `Char_Admin`=%d WHERE `pID`=%d", value, AccountData[otherid][pID]);
	mysql_tquery(g_SQL, tss);
	return 1;
}

CMD:kickall(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 6)
		return PermissionError(playerid);
		
	foreach(new i : Player) if(IsPlayerConnected(i)) {
		UpdateWeapons(i);
		UpdatePlayerData(i);
		SendClientMessageEx(i, -1, ""YELLOW"[BADAI]:"WHITE" Server telah badai, semua database player telah tersimpan kepusat!");
		if(i != playerid) {
			KickEx(i);
		}
	}
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), "Menggunakan cmd /kickall");
	return 1;
}

CMD:kickallplayer(playerid, params[])
{
	if(CheckAdmin(playerid, 7))
		return PermissionError(playerid);
	
	foreach(new pid : Player) {
		if(AccountData[pid][pAdmin] < 1) {
			UpdateWeapons(pid);
			UpdatePlayerData(pid);
			SendClientMessageEx(pid, -1, "[i] Maaf server telah Badai, semua Database Telah tersimpan di pusat "YELLOW"Verona");
			KickEx(pid);
		}
	}
	return 1;
}

CMD:playsong(playerid, params[])
{
	if(CheckAdmin(playerid, 5))
		return PermissionError(playerid);

	new songname[128], tmp[512], Float:x, Float:y, Float:z;
	if (sscanf(params, "s[128]", songname))
	{
		ShowTDN(playerid, NOTIFICATION_SYNTAX, "/playsong <link>");
		return 1;
	}
	
	GetPlayerPos(playerid, x, y, z);
	format(tmp, sizeof(tmp), "%s", songname);
	foreach(new ii : Player)
	{
		if(IsPlayerInRangeOfPoint(ii, 35.0, x, y, z))
		{
			PlayAudioStreamForPlayer(ii, tmp);
			SendClientMessageEx(ii, -1, ""YELLOW"[!]: /stopsong, /togsong");
		}
	}
	return 1;
}

CMD:stopsong(playerid)
{
	StopAudioStreamForPlayer(playerid);
	SendClientMessage(playerid, -1, "Song stop!");
	return 1;
}

CMD:joblist(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1) return PermissionError(playerid);
	ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Job List",
	"0\tPengangguran\
	\n"GRAY"1\tSupir Bus\
	\n2\tPenambang\
	\n"GRAY"3\tTukang Kayu\
	\n4\tTukang Ayam\
	\n"GRAY"5\tTukang Jahit\
	\n6\tTukang Minyak\
	\n"GRAY"7\tNelayan\
	\n8\tPemerah Susu\
	\n"GRAY"9\tPetani\
	\n10\tKargo Driver\
	\n"GRAY"11\tRecycler\
	\n12\tTrashmaster", "Close", "");
	return 1;
}

CMD:setjob(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 2) return PermissionError(playerid);

	new jobid, otherid;
	if(sscanf(params, "ud", otherid, jobid)) 
	{
		ShowTDN(playerid, NOTIFICATION_SYNTAX, "/setjob [name/playerid] [job id]~n~/joblist untuk melihat id job");
		return 1;
	}

	if(!IsPlayerConnected(otherid)) return Error(playerid, "Pemain tersebut tidak terkoneksi ke server!");
	if(jobid < 0 || jobid > 12) return Error(playerid, "Invalid Job ID!");
	
	AccountData[otherid][pJob] = jobid;
	LoadPlayerJobIcon(otherid);

	SendStaffMessage(X11_TOMATO, "%s telah set job "YELLOW"%s(%d) - %s", GetAdminName(playerid), AccountData[otherid][pName], otherid, GetPlayerJobName(otherid));
	SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: %s telah menetapkan pekerjaan %s "ARWIN1"untuk anda", GetAdminName(playerid), GetPlayerJobName(otherid));
	return 1;
}

alias:clearallchat("cca", "cac")
CMD:clearallchat(playerid)
{
    if(AccountData[playerid][pAdmin] < 4)
	    return PermissionError(playerid);

	foreach(new i : Player)
	{
	    ClearAllChat(i);
	}
	SendStaffMessage(X11_TOMATO, "%s menghapus semua chatlog", AccountData[playerid][pAdminname]);
	return 1;
}

CMD:checkucp(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new name[32];
	if(sscanf(params, "s[32]", name)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/checkucp [ucp name]");

	new query[596];
	mysql_format(g_SQL, query, sizeof(query), "SELECT `Char_Name` FROM `player_characters` WHERE `Char_UCP`='%e'", name);
	mysql_tquery(g_SQL, query, "CheckUCP", "ds", playerid, name);
	return 1;
}

CMD:fixes(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 1 && AccountData[playerid][pTheStars] < 1) return PermissionError(playerid);

	new type[125], list[596], count  = 0;
	format(list, sizeof(list), "Player\tIssue\n");
	foreach(new i : Player) if (FixmeExists[i] && SQL_IsCharacterLogged(i))
	{
		switch(FixmeOption[i])
		{
			case 1: format(type, sizeof(type), "Bug Visu (WWID)");
			case 2: format(type, sizeof(type), "Karakter Terjepit (Stuck)");
			case 3: format(type, sizeof(type), "Karakter Freezing");
		}
		ListFixme[playerid][count++] = i;
		format(list, sizeof(list), "%s"YELLOW"P%d:"WHITE" %s\t%s\n", list, i, AccountData[i][pName], type);
	}

	if(count == 0)
	{
		PlayerPlaySound(playerid, 5206, 0.0, 0.0, 0.0);
		return ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Fix Request",
		"Tidak ada player request fix untuk saat ini!", "Tutup", "");
	}

	ShowPlayerDialog(playerid, DIALOG_FIXMEACC, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE"WHITE" - Fix Request", list, "Pilih", "Batal");
	return 1;
}

/* Other Functions */
forward OfflineStats(playerid, const name[]);
public OfflineStats(playerid, const name[])
{
	if(!cache_num_rows())
	{
		return ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Akun dengan nama %s tidak ditemukan!", name));
	}
	else 
	{
		new RegID, UCPName[42], PName[64], Age[64], Height, Weight, Origin[64], Gender, Job, Phone[64],
		Faction, FactRank, Fams, FamsRank, RedMoney, Money, BMoney, Float:Health, Float:Armour,
		Hunger, Thirst, Stress, Warn, Level, LevelUp, Admin, TheStars, TheStarsTime, Vip, VipTime, TogPM, Skin, RegDate[64], 
		LastLogin[64];

		cache_get_value_index_int(0, 0, RegID);
		cache_get_value_index(0, 1, UCPName);
		cache_get_value_index(0, 2, PName);
		cache_get_value_index(0, 3, Age);
		cache_get_value_index_int(0, 4, Height);
		cache_get_value_index_int(0, 5, Weight);
		cache_get_value_index(0, 6, Origin);
		cache_get_value_index_int(0, 7, Gender);
		cache_get_value_index_int(0, 8, Job);
		cache_get_value_index(0, 9, Phone);
		cache_get_value_index_int(0, 10, Faction);
		cache_get_value_index_int(0, 11, FactRank);
		cache_get_value_index_int(0, 12, Fams);
		cache_get_value_index_int(0, 13, FamsRank);
		cache_get_value_index_int(0, 14, RedMoney);
		cache_get_value_index_int(0, 15, Money);
		cache_get_value_index_int(0, 16, BMoney);
		cache_get_value_index_float(0, 17, Health);
		cache_get_value_index_float(0, 18, Armour);
		cache_get_value_index_int(0, 19, Hunger);
		cache_get_value_index_int(0, 20, Thirst);
		cache_get_value_index_int(0, 21, Stress);
		cache_get_value_index_int(0, 22, Warn);
		cache_get_value_index_int(0, 23, Level);
		cache_get_value_index_int(0, 24, LevelUp);
		cache_get_value_index_int(0, 25, Admin);
		cache_get_value_index_int(0, 26, TheStars);
		cache_get_value_index_int(0, 27, TheStarsTime);
		cache_get_value_index_int(0, 28, Vip);
		cache_get_value_index_int(0, 29, VipTime);
		cache_get_value_index_int(0, 30, TogPM);
		cache_get_value_index_int(0, 31, Skin);
		cache_get_value_index(0, 32, RegDate);
		cache_get_value_index(0, 33, LastLogin);

		new query[255], Cache:CheckFamilies;
		mysql_format(g_SQL, query, sizeof(query), "SELECT * FROM `families` WHERE `F_ID`=%d", Fams);
		CheckFamilies = mysql_query(g_SQL, query);

		new rows = cache_num_rows(), FamName[125];
		if(rows)
		{
			cache_get_value_name(0, "F_Name", FamName);
		}
		else 
		{
			format(FamName, sizeof(FamName), "Civilian");
		}

		new scoremath;
		if(Level <= 10)
		{
			scoremath = ((Level * 550) + 1);
		}
		else if(Level <= 30)
		{
			scoremath = ((Level * 700) + 1);
		}
		else if(Level <= 50)
		{
			scoremath = ((Level * 1200) + 1);
		}
		else
		{
			scoremath = ((Level * 1550) + 1);
		}

		new FactionName[200];
		format(FactionName, sizeof(FactionName), "%s", FactName[Faction]);

		new FamsRName[125];
		format(FamsRName, sizeof(FamsRName), "%s", FamsRankName[FamsRank]);

		new AdminLevelName[85];
		format(AdminLevelName, sizeof(AdminLevelName), "%s", AdminName(Admin));

		new VipExpired[258], StarsExpired[258];
		if(Vip != 0 && VipTime == 0)
		{
			VipExpired = ""PINK"Permanent";
		}
		else if(Vip != 0 && VipTime != 0)
		{
			VipExpired = sprintf("%s", RemainingTimelapse(VipTime));
		}
		else
		{
			VipExpired = ""RED"Habis";
		}

		if(TheStars != 0 && TheStarsTime != 0)
		{
			StarsExpired = sprintf("%s", RemainingTimelapse(TheStarsTime));
		}
		else
		{
			StarsExpired = ""RED"Habis";
		}


		new shstr[3015];
		format(shstr, sizeof(shstr), "Kategori\t\t-	Detail\n");
		format(shstr, sizeof(shstr), "%sCharacter UID\t\t:	%d\n", shstr, RegID);
		format(shstr, sizeof(shstr), "%s"GRAY"Nama UCP\t\t:	"GRAY"%s\n", shstr, UCPName);
		format(shstr, sizeof(shstr), "%sNama Lengkap\t\t:	%s\n", shstr, PName);
		format(shstr, sizeof(shstr), "%s"GRAY"Tanggal Lahir\t\t:	"GRAY"%s\n", shstr, Age);
		format(shstr, sizeof(shstr), "%sTinggi Badan\t\t:	%d cm\n", shstr, Height);
		format(shstr, sizeof(shstr), "%s"GRAY"Berat Badan\t\t:	"GRAY"%d kg\n", shstr, Weight);
		format(shstr, sizeof(shstr), "%sAsal Negara\t\t:	%s\n", shstr, Origin);
		format(shstr, sizeof(shstr), "%s"GRAY"Jenis Kelamin\t\t:	"GRAY"%s\n", shstr, (Gender == 2) ? ("Perempuan") : ("Laki - Laki"));
		format(shstr, sizeof(shstr), "%sPekerjaan\t\t:	%s\n", shstr, GetPlayerJobName(Job));
		format(shstr, sizeof(shstr), "%s"GRAY"Nomor Telepon\t\t:	"GRAY"%s\n", shstr, Phone);
		format(shstr, sizeof(shstr), "%sFaction\t\t:	%s\n", shstr, FactionName);
		format(shstr, sizeof(shstr), "%s"GRAY"Faction Rank\t\t:	"GRAY"%s\n", shstr, GetFactRank(Faction, FactRank));
		format(shstr, sizeof(shstr), "%sFamilies\t\t:	%s\n", shstr, FamName);
		format(shstr, sizeof(shstr), "%s"GRAY"Families Rank\t\t:	"GRAY"%s\n", shstr, FamsRName);
		format(shstr, sizeof(shstr), "%sUang Kotor\t\t:	"RED"%s\n", shstr, FormatMoney(RedMoney));
		format(shstr, sizeof(shstr), "%s"GRAY"Uang Saku\t\t:	"DARKGREEN"%s\n", shstr, FormatMoney(Money));
		format(shstr, sizeof(shstr), "%sUang Rekening\t\t:	"DARKGREEN"%s\n", shstr, FormatMoney(BMoney));
		format(shstr, sizeof(shstr), "%s"GRAY"Darah Merah\t\t:	"RED"%.2f\n", shstr, Health);
		format(shstr, sizeof(shstr), "%sDarah Putih\t\t:	%.2f\n", shstr, Armour);
		format(shstr, sizeof(shstr), "%s"GRAY"Lapar\t\t:	"GRAY"%d%%\n", shstr, Hunger);
		format(shstr, sizeof(shstr), "%sHaus\t\t:	%d%%\n", shstr, Thirst);
		format(shstr, sizeof(shstr), "%s"GRAY"Stress\t\t:	"GRAY"%d%%\n", shstr, Stress);
		format(shstr, sizeof(shstr), "%sTotal Warning\t\t:	"YELLOW"%d/20\n", shstr, Warn);
		format(shstr, sizeof(shstr), "%s"GRAY"Level\t\t:	"GRAY"%d - %s\n", shstr, Level, PlayerLevelName[Level]);
		format(shstr, sizeof(shstr), "%sXP\t\t:	%d/%d\n", shstr, LevelUp, scoremath);
		format(shstr, sizeof(shstr), "%s"GRAY"Admin Level\t\t:	"GRAY"%s\n", shstr, AdminLevelName);
		format(shstr, sizeof(shstr), "%sEx Start\t\t:	%s\n", shstr, TheStars ? ""GREEN"Ex Start" : ""RED"Bukan Ex Start");
		format(shstr, sizeof(shstr), "%s"GRAY"Ex Start Expired\t\t:	"GRAY"%s\n", shstr, StarsExpired);
		format(shstr, sizeof(shstr), "%sVIP Level\t\t:	%s\n", shstr, GetPlayerVipName(Vip));
		format(shstr, sizeof(shstr), "%s"GRAY"Masa Berlaku VIP\t\t:	"GRAY"%s\n", shstr, VipExpired);
		format(shstr, sizeof(shstr), "%sPrivate Message\t\t:	%s\n", shstr, TogPM ? ""GREEN"Aktif" : ""RED"Non-Aktif");
		format(shstr, sizeof(shstr), "%s"GRAY"Skin ID\t\t:	"GRAY"%d\n", shstr, Skin);
		format(shstr, sizeof(shstr), "%sTanggal Pembuatan Akun\t\t:	%s\n", shstr, RegDate);
		format(shstr, sizeof(shstr), "%s"GRAY"Riwayat Terakhir Login\t\t:	"GRAY"%s\n", shstr, LastLogin);
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Offline Stats", shstr, "Tutup", "");
		cache_delete(CheckFamilies);
	}
	return 1;
}

CMD:resetinv(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pAdmin] < 5) 
		return PermissionError(playerid);

	new player[MAX_PLAYER_NAME], otherid, query[256];
	if(sscanf(params, "s[24]", player)) 
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/resetinv [name/playerid]");

	otherid = strval(player);
	if(otherid == 0 || !IsNumeric(player)) {
		// Cari berdasarkan nama
		foreach(new i : Player) {
			if(IsPlayerConnected(i)) {
				new pname[MAX_PLAYER_NAME];
				GetPlayerName(i, pname, sizeof(pname));
				if(!strcmp(pname, player, true)) {
					otherid = i;
					break;
				}
			}
		}
	}

	if(IsPlayerConnected(otherid) && otherid != INVALID_PLAYER_ID) 
	{
		Inventory_Clear(otherid);
		SendClientMessageEx(otherid, X11_TOMATO, "AdmCmd: Admin %s telah menghapus semua item di inventory anda.", GetAdminName(playerid));
		SendStaffMessage(X11_TOMATO, "%s telah mereset inventory milik %s(%d).", GetAdminName(playerid), GetRPName(otherid), otherid);
		
		SendClientMessageEx(playerid, X11_CHARTREUSE1, sprintf("[ADMIN] Anda telah menghapus semua item inventory milik %s(%d).", GetRPName(otherid), otherid));
	} else {
		// Player Offline - Query ke database
		mysql_format(g_SQL, query, sizeof(query), "SELECT `pID` FROM `player_characters` WHERE `Char_Name`='%e' LIMIT 1", player);
		mysql_tquery(g_SQL, query, "OnResetInventoryOffline", "ds", playerid, player);
		return 1;
	}

	new logstr[200];
	format(logstr, sizeof(logstr), "Reset inventory milik %s", player);
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), logstr);

	return 1;
}

forward OnResetInventoryOffline(adminid, player[]);
public OnResetInventoryOffline(adminid, player[])
{
	if(!IsPlayerConnected(adminid))
		return 0;

	if(!cache_num_rows()) {
		ShowTDN(adminid, NOTIFICATION_ERROR, sprintf("Pemain dengan nama '%s' tidak ditemukan!", player));
		return 1;
	}
	
	new dbid;
	cache_get_value_index_int(0, 0, dbid);
	
	// Delete inventory dari database
	new query[256];
	mysql_format(g_SQL, query, sizeof(query), "DELETE FROM `inventory` WHERE `ID`=%d", dbid);
	mysql_tquery(g_SQL, query);
	
	SendClientMessageEx(adminid, X11_CHARTREUSE1, sprintf("[ADMIN] Anda telah menghapus semua item inventory offline player '%s' (ID: %d).", player, dbid));
	SendStaffMessage(X11_TOMATO, "%s telah mereset inventory offline player '%s' (ID: %d).", GetAdminName(adminid), player, dbid);

	new logstr[200];
	format(logstr, sizeof(logstr), "Reset inventory offline milik %s (ID: %d)", player, dbid);
	AddAdminLog(AccountData[adminid][pName], AccountData[adminid][pUCP], GetStaffRank(adminid), logstr);

	return 1;
}
