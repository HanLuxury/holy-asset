#include <YSI/y_hooks>

CMD:jailall(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7)
		return PermissionError(playerid);
	
	new minutes, denda, reason[125];
	if(sscanf(params, "dds[125]", minutes, denda, reason))
		return Syntax(playerid, "/jailall [menit] [denda] [alasan]");
	
	if(minutes < 1)
		return Error(playerid, "Anda tidak dapat menjail dibawah 1 menit!");
	
	if(denda < 0)
		return Error(playerid, "Anda tidak dapat memasukkan denda dibawah $0");
	
	foreach(new i : Player) if (IsPlayerConnected(i) && AccountData[i][pSpawned])
	{
		if(AccountData[i][pInjured]) {
			AccountData[i][pInjured] = 0;
			AccountData[i][pInjuredTime] = 0;
		}
		AccountData[i][pJail] = true;
		AccountData[i][pJailTime] = minutes * 60;
		format(AccountData[i][pJailReason], sizeof(reason), reason);
		format(AccountData[i][pJailBy], MAX_PLAYER_NAME, AccountData[playerid][pAdminname]);
		
		TakeMoney(i, denda);
		SpawnPlayerInJail(i);

		SendClientMessageToAllEx(X11_DARKORANGE, "AdmCmd: Semua pemain online telah dijail selama %d menit terkena denda sebesar %s oleh %s", minutes, FormatMoney(denda), AccountData[playerid][pAdminname]);
		SendClientMessageToAllEx(X11_DARKORANGE, "Reason ~> %s", reason);
	}

	static shstr[128];
	format(shstr, sizeof(shstr), "Menggunakan cmd /jailall kepada semua pemain online selama %d menit + %s denda", minutes, FormatMoney(denda));
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:rall(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7)
		return PermissionError(playerid);

	foreach(new i : Player) if (IsPlayerConnected(i)) if (AccountData[i][pAdmin] > 0 || AccountData[i][pTheStars] > 0)
	{
		AccountData[i][aReceivedReports] = 0;
	}
	mysql_tquery(g_SQL, "UPDATE `player_characters` SET `Char_AdminPoint`=0");
	SendStaffMessage(X11_TOMATO, "%s telah mereset semua point admin", AccountData[playerid][pAdminname]);
	
	static shstr[128];
	format(shstr, sizeof(shstr), "Menggunakan cmd /rall kepada semua administrator");
	AddAdminLog(AccountData[playerid][pName], AccountData[playerid][pUCP], GetStaffRank(playerid), shstr);
	return 1;
}

CMD:oresetharta(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7)	
		return PermissionError(playerid);

	new playerName[24], onlinePlayerName[24];
	if(sscanf(params, "s[24]", playerName)) 
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/oresetharta [player name]");
	
	foreach(new i : Player) if (IsPlayerConnected(i))
	{
		GetPlayerName(i, onlinePlayerName, MAX_PLAYER_NAME);

		if(strfind(onlinePlayerName, playerName, true) != -1)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang online! gunakan '/resetharta'");
		}
	}

	new cQuery[200];
	mysql_format(g_SQL, cQuery, sizeof(cQuery), "SELECT `pID` FROM `player_characters` WHERE `Char_Name`='%e'", playerName);
	mysql_tquery(g_SQL, cQuery, "ResetHartaOffline", "ds", playerid, playerName);
	return 1;
}

forward ResetHartaOffline(playerid, name[]);
public ResetHartaOffline(playerid, name[])
{
	if(!cache_num_rows())
	{
		return Error(playerid, "Tidak ditemukan akun dengan nama "YELLOW"%s", name);
	}
	else
	{
		new dbid;
		cache_get_value_index_int(0, 0, dbid);

		mysql_tquery(g_SQL, sprintf("DELETE FROM `inventory` WHERE `ID`=%d", dbid));
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_gudang` WHERE `ID`=%d", dbid));
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_housestorage` WHERE `ID`=%d", dbid));
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_rusunstorage` WHERE `ID`=%d", dbid));
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_vehicles` WHERE `PVeh_OwnerID`=%d", dbid));
		mysql_tquery(g_SQL, sprintf("UPDATE `player_characters` SET `Char_Money`=0, `Char_BankMoney`=0, `Char_RedMoney`=0 WHERE `pID`=%d", dbid));

		SendStaffMessage(X11_TOMATO, "%s telah mereset semua harta(offline) akun %s.", AccountData[playerid][pAdminname], name);
	}
	return 1;
}

CMD:resetharta(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7) 
		return PermissionError(playerid);
	
	new otherid;
	if(sscanf(params, "u", otherid)) 
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/resetharta [name/playerid]");
	
	if(!IsPlayerConnected(otherid))
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	SetPVarInt(playerid, "ResetPlayerID", otherid);
	Dialog_Show(playerid, ResetHarta_Conf, DIALOG_STYLE_MSGBOX, sprintf("%s | %s (%d)", AccountData[otherid][pUCP], ReturnName(otherid), otherid),
	""WHITE"Apakah anda yakin ingin mereset harta pemain"YELLOW" %s(%d)?\n\n"RED"NOTE:"WHITE"Tindakan ini akan menghapus semua barang player seperti:\
	\n- Inventory\
	\n- Brankas Gudang\
	\n- Brankas Rumah\
	\n- Brankas Rusun", "Reset", "Batal", ReturnName(otherid), otherid);
	return 1;
}

Dialog:ResetHarta_Conf(playerid, response, listitem, inputtext[])
{
	if(response)
	{
		new otherid = GetPVarInt(playerid, "ResetPlayerID");
		if(!IsPlayerConnected(otherid))
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
		
		Inventory_Clear(otherid);
		TakeMoney(otherid, AccountData[otherid][pMoney]);
		AccountData[otherid][pBankMoney] -= AccountData[otherid][pBankMoney];
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_gudang` WHERE `ID`=%d", AccountData[otherid][pID]));
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_housestorage` WHERE `ID`=%d", AccountData[otherid][pID]));
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_rusunstorage` WHERE `ID`=%d", AccountData[otherid][pID]));
		mysql_tquery(g_SQL, sprintf("DELETE FROM `player_vehicles` WHERE `PVeh_OwnerID`=%d", AccountData[otherid][pID]));

		SendStaffMessage(X11_TOMATO, "%s telah mereset semua harta pemain milik %s(%d).", AccountData[playerid][pAdminname], ReturnName(otherid), otherid);
		DeletePVar(playerid, "ResetPlayerID");
	}
	else
	{
		Info(playerid, "Anda membatalkan untuk mereset harta player");
		DeletePVar(playerid, "ResetPlayerID");
	}
	return 1;
}

alias:schedulemt("smt")
CMD:schedulemt(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 4) return PermissionError(playerid);

	new 
		option[24],
		nextParams[128];
	
	if(g_Schedule) {
		g_Schedule = 0;
		g_ScheduleTime = 0;
		return SendClientMessageToAllEx(X11_RED, "AdmCmd: %s"ARWIN1" telah membatalkan jadwal maintance.", AccountData[playerid][pAdminname]);
	}

	if(sscanf(params, "s[24]S()[128]", option, nextParams)) return Syntax(playerid, "/schedulemt [option] (jam, menit)");
	if(!strcmp(option, "jam", true))
	{
		new time;
		if(sscanf(nextParams, "d", time)) return Syntax(playerid, "/schedulemt [jam] [berapa jam lagi akan mt [jam]]");
		if(time < 1) return Error(playerid, "Tidak dapat dibawah 1 jam!");
		
		g_Schedule = 1;
		g_ScheduleTime = gettime() + time*3600; // Waktu Input Dikalikan 1 Jam dalam Detik
		SendClientMessageToAllEx(X11_RED, "AdmCmd: "ARWIN1"Server telah dijadwalkan maintance pada %s", ReturnDate(g_ScheduleTime));
	}
	else if(!strcmp(option, "menit", true))
	{
		new time;
		if(sscanf(nextParams, "d", time)) return Syntax(playerid, "/schedulemt [jam] [berapa menit lagi akan mt [menit]]");
		if(time < 1) return Error(playerid, "Tidak dapat dibawah 1 menit!");
		
		g_Schedule = 1;
		g_ScheduleTime = gettime() + time*60; // Waktu Input Dikalikan 1 menit dalam Detik
		SendClientMessageToAllEx(X11_RED, "AdmCmd: "ARWIN1"Server telah dijadwalkan maintance pada %s", ReturnDate(g_ScheduleTime));
	}
	else Syntax(playerid, "/schedulemt [option] (jam, menit)");
	return 1;
}

CMD:aresetpoint(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/aresetpoint [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!AccountData[otherid][pAdmin] || !AccountData[otherid][pTheStars]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut bukan admin ataupun Ex Start!");

	AccountData[otherid][aReceivedReports] = 0;
	SendStaffMessage(X11_TOMATO, "%s telah mereset administrator point %s", AccountData[playerid][pAdminname], AccountData[otherid][pAdminname]);
	return 1;
}

CMD:aresign(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7) return PermissionError(playerid);

	new ucpname[24], cQuery[200];
	if(sscanf(params, "s[24]", ucpname)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/aresign [ucp name]");
	mysql_format(g_SQL, cQuery, sizeof(cQuery), "SELECT * FROM `player_characters` WHERE `Char_UCP`='%e'", ucpname);
	mysql_tquery(g_SQL, cQuery, "ResignedStaff", "ds", playerid, ucpname);
	return 1;
}

forward ResignedStaff(playerid, ucp[]);
public ResignedStaff(playerid, ucp[])
{
	if(!cache_num_rows())
	{
		return Error(playerid, "Tidak ditemukan akun dengan UCP %s", ucp);
	}
	else
	{
		SendStaffMessage(X11_TOMATO, "%s telah menetapkan status Resign pada akun UCP %s", AccountData[playerid][pAdminname], ucp);

		new cQuery[200];
		mysql_format(g_SQL, cQuery, sizeof(cQuery), "UPDATE `player_characters` SET `Char_Admin`=0, `Char_AdminName`='%e' WHERE `Char_UCP`='%e'", ucp, ucp);
		mysql_tquery(g_SQL, cQuery);
	}
	return 1;
}

CMD:forceahide(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7) return PermissionError(playerid);

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/forceahide [name/playerid]");
	if(otherid == INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	
	if(!AccountData[otherid][pAdminHide])
	{
		AccountData[otherid][pAdminHide] = 1;
		ShowTDN(playerid, NOTIFICATION_INFO, sprintf("Anda telah menghide status admin %s", AccountData[otherid][pAdminname]));
	}
	else
	{
		AccountData[otherid][pAdminHide] = 0;
		ShowTDN(playerid, NOTIFICATION_INFO, sprintf("Anda telah men-show status admin %s", AccountData[otherid][pAdminname]));
	}
	return 1;
}

task InfoScheduleMT[60000]()
{
	if(g_Schedule)
	{
		SendClientMessageToAllEx(X11_RED, "AdmCmd:"ARWIN1" Server telah dijadwalkan maintance pada %s", ReturnDate(g_ScheduleTime));
	}
	return 1;
}

task ScheduleMTExecute[1000]()
{
    if(g_Schedule)
	{
		if(g_ScheduleTime != 0 && g_ScheduleTime <= gettime())
		{
			/*for(new i = 0, j = GetPlayerPoolSize(); i <= j; i ++) if (IsPlayerConnected(i) && AccountData[i][pSpawned])
			{
				UpdatePlayerData(i);
                SavePlayerVehicle(i);
			}*/
			SaveAll();
			SendClientMessageToAllEx(X11_RED, "AdmCmd:"ARWIN1" Server Telah membackup semua data pemain dan kendaraan ke "ALTHF"EAGLE ROLEPLAY Database");
			SendRconCommand("exit");
		}
	}
    return 1;
}

CMD:addapoint(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7)
		return PermissionError(playerid);
	
	new otherid, value;
	if(sscanf(params, "ud", otherid, value)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/addapoint [name/playerid] [amount (1 - 5)]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(value < 1 || value > 5) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat kurang dari 1 atau lebih dari 5!");

	AccountData[otherid][aReceivedReports] += value;
	SendStaffMessage(X11_TOMATO, "%s telah menambah point Admin %s sejumlah %d point", AccountData[playerid][pAdminname], AccountData[otherid][pAdminname], value);
	return 1;
}

CMD:deletechar(playerid, params[])
{
	if(AccountData[playerid][pAdmin] < 7)
		return PermissionError(playerid);
	
	new ucpname[24];
	if(sscanf(params, "s[24]", ucpname)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/deletechar [ucp name]");
	
	new query[200];
	mysql_format(g_SQL, query, sizeof(query), "SELECT `Char_Name` FROM `player_characters` WHERE `Char_UCP`='%e'", ucpname);
	mysql_tquery(g_SQL, query, "DeleteCharQuery", "ds", playerid, ucpname);
	SetPVarString(playerid, "DCharUCP", ucpname);
	return 1;
}

forward DeleteCharQuery(playerid, UCP[]);
public DeleteCharQuery(playerid, UCP[])
{
	if(!cache_num_rows())
	{
		Error(playerid, "Tidak ditemukan akun dengan UCP "RED"%s", UCP);
		return 1;
	}
	else
	{
		new sha[258], charname[MAX_PLAYER_NAME];
		for(new i; i < cache_num_rows(); i ++)
		{
			cache_get_value_name(i, "Char_Name", charname);
			
			format(sha, sizeof(sha), "%s%s\n", sha, charname);
		}
		Dialog_Show(playerid, DeleteCharList, DIALOG_STYLE_LIST, sprintf(""ALTHF"EAGLE Roleplay "WHITE"- Char %s", UCP), sha, "Delete", "Cancel");
	}
	return 1;
}

Dialog:DeleteCharList(playerid, response, listitem, inputtext[])
{
	if(!response) return ShowTDN(playerid, NOTIFICATION_INFO, "Anda telah membatalkan pilihan");
	if(AccountData[playerid][pAdmin] < 7) return PermissionError(playerid);

	new frmtdel[159], ucpname[24], Cache:execute;
	GetPVarString(playerid, "DCharUCP", ucpname, sizeof(ucpname));
	mysql_format(g_SQL, frmtdel, sizeof(frmtdel), "SELECT * FROM `player_characters` WHERE `Char_UCP`='%e'", ucpname);
	execute = mysql_query(g_SQL, frmtdel, true);
	if(cache_num_rows())
	{
		new charname[MAX_PLAYER_NAME], kckstr[178], playerID;

		if(listitem >= 0 && listitem < cache_num_rows())
		{
			cache_get_value_name_int(listitem, "pID", playerID);
			cache_get_value_name(listitem, "Char_Name", charname);

			format(kckstr, sizeof(kckstr), "Anda berhasil menghapus char:\
			\nChar Name: %s\
			\nUCP Name: %s\
			\nDatabase ID: %d", charname, ucpname, playerID);
			ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE Roleplay "WHITE"- Delete Char", kckstr, "Tutup", "");

			mysql_tquery(g_SQL, sprintf("DELETE FROM `player_characters` WHERE `pID`=%d", playerID));
			mysql_tquery(g_SQL, sprintf("DELETE FROM `player_vehicles` WHERE `PVeh_OwnerID`=%d", playerID));
			mysql_tquery(g_SQL, sprintf("DELETE FROM `inventory` WHERE `ID`=%d", playerID));
			mysql_tquery(g_SQL, sprintf("DELETE FROM `contacts` WHERE `ID`=%d", playerID));
			mysql_tquery(g_SQL, sprintf("DELETE FROM `player_gudang` WHERE `ID`=%d", playerID));
			mysql_tquery(g_SQL, sprintf("DELETE FROM `player_housestorage` WHERE `ID`=%d", playerID));
			mysql_tquery(g_SQL, sprintf("DELETE FROM `player_rusunstorage` WHERE `ID`=%d", playerID));

			DeletePVar(playerid, "DCharUCP");
		}
	}
	cache_delete(execute);
	return 1;
}