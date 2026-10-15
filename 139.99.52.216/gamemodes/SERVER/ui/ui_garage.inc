#include <YSI/y_hooks>

/* =====================================================================
    SERVER/ui/ui_garage.inc
    EAGLE ROLEPLAY - Garasi umum & pribadi (CEF mobile)
    Pengganti textdraw Garage_TD: daftar maks. 4 kendaraan yang diparkir,
    detail (bahan bakar / body) dan tombol ambil kendaraan.
    Panel CEF: "garage"  (aksi: sel <i>, take, close)
   ===================================================================== */

new gGarageTitle[MAX_PLAYERS][64];
new gGarageCount[MAX_PLAYERS];
new gGarageSel[MAX_PLAYERS] = {-1, ...};

hook OnPlayerConnect(playerid)
{
	gGarageTitle[playerid][0] = EOS;
	gGarageCount[playerid] = 0;
	gGarageSel[playerid] = -1;
	return 1;
}

stock Garage_Render(playerid)
{
	new sub[48], s[64];
	P_Begin("garage", gGarageTitle[playerid], "Pilih kendaraan yang ingin diambil", "car", "r", 22);
	P_ListBegin("", gGarageSel[playerid], "list", 0, "sel", 0, "Tidak ada kendaraan di garasi ini.");
	for(new k = 0; k < gGarageCount[playerid]; k++)
	{
		new i = AccountData[playerid][pGarage][k];
		format(s, sizeof(s), "veh:%d", PlayerVehicle[i][pVehModelID]);
		format(sub, sizeof(sub), "Plate: %s", PlayerVehicle[i][pVehPlate]);
		P_Item(GetVehicleModelName(PlayerVehicle[i][pVehModelID]), sub, "", "", s);
	}
	P_ListEnd();
	if(gGarageSel[playerid] != -1)
	{
		new i = AccountData[playerid][pTakeVehicle], v[24];
		format(s, sizeof(s), "veh:%d", PlayerVehicle[i][pVehModelID]);
		format(sub, sizeof(sub), "Plate: %s", PlayerVehicle[i][pVehPlate]);
		P_CardBegin(GetVehicleModelName(PlayerVehicle[i][pVehModelID]), sub, s);
		format(v, sizeof(v), "%d", PlayerVehicle[i][pVehFuel]);
		P_Row("Fuel", v);
		format(v, sizeof(v), "%.1f", PlayerVehicle[i][pVehHealth]);
		P_Row("Body", v);
		P_CardEnd();
	}
	P_Footer();
	P_Btn("close", "Tutup", "g", "x");
	P_Btn("take", "Ambil Kendaraan", "p", "key", -1, gGarageSel[playerid] == -1);
	return P_Send(playerid);
}

stock Garage_Close(playerid)
{
	AccountData[playerid][pUseGarage] = 0;
	gGarageSel[playerid] = -1;
	P_Close(playerid, "garage");
	AllGui_Status(playerid, true);
	return 1;
}

FUNC::GarageString(playerid, vehid)
{
	gGarageSel[playerid] = -1;
	for(new k = 0; k < gGarageCount[playerid]; k++) if(AccountData[playerid][pGarage][k] == vehid) gGarageSel[playerid] = k;
	return Garage_Render(playerid);
}

stock Garage_OnUI(playerid, const a[], idx)
{
	if(!strcmp(a, "close")) return Garage_Close(playerid);
	if(!strcmp(a, "sel"))
	{
		if(idx < 0 || idx >= gGarageCount[playerid]) return 1;
		new vehid = AccountData[playerid][pGarage][idx];
		AccountData[playerid][pTakeVehicle] = vehid;
		return GarageString(playerid, vehid);
	}
	if(!strcmp(a, "take"))
	{
		if(gGarageSel[playerid] == -1) return ShowTDN(playerid, NOTIFICATION_WARNING, "Pilih kendaraan terlebih dahulu!");
		foreach(new gkid : PublicGarage) if(IsPlayerInRangeOfPoint(playerid, 3.5, PublicGarage[gkid][pgPOS][0], PublicGarage[gkid][pgPOS][1], PublicGarage[gkid][pgPOS][2]))
		{
			new i = AccountData[playerid][pTakeVehicle];

			if(PlayerVehicle[i][pVehParked] != -1)
			{
				GetVehicles(i, PublicGarage[gkid][pgSpawnPOS][0], PublicGarage[gkid][pgSpawnPOS][1], PublicGarage[gkid][pgSpawnPOS][2], PublicGarage[gkid][pgSpawnPOS][3]);
				SetTimerEx("ForcedPlayerHopInVehicle", 1500, false, "idd", playerid, PlayerVehicle[i][pVehPhysic], 0);
				Garage_Close(playerid);
			}
		}

		foreach(new gkid : PrivateGarage) if(IsPlayerInRangeOfPoint(playerid, 3.5, PrivateGarage[gkid][pgPOS][0], PrivateGarage[gkid][pgPOS][1], PrivateGarage[gkid][pgPOS][2]))
		{
			new i = AccountData[playerid][pTakeVehicle];

			if(PlayerVehicle[i][pVehPrivateG] != -1)
			{
				GetVehicles(i, PrivateGarage[gkid][pgSpawnPOS][0], PrivateGarage[gkid][pgSpawnPOS][1], PrivateGarage[gkid][pgSpawnPOS][2], PrivateGarage[gkid][pgSpawnPOS][3]);
				SetTimerEx("ForcedPlayerHopInVehicle", 1500, false, "idd", playerid, PlayerVehicle[i][pVehPhysic], 0);
				Garage_Close(playerid);
			}
		}
		return 1;
	}
	return 1;
}

stock GetVehicles(i, Float:pos_x, Float:pos_y, Float:pos_z, Float:pos_a)
{
	//DB
	PlayerVehicle[i][pVehInsuranced] = 0;
	PlayerVehicle[i][pVehBroken] = 0;
	PlayerVehicle[i][pVehParked] = -1, PlayerVehicle[i][pVehPrivateG] = -1;

	PlayerVehicle[i][pVehPos][0] = pos_x;
	PlayerVehicle[i][pVehPos][1] = pos_y;
	PlayerVehicle[i][pVehPos][2] = pos_z;
	PlayerVehicle[i][pVehPos][3] = pos_a;

	OnPlayerVehicleRespawn(i);

	if(PlayerVehicle[i][pVehLocked])
		PlayerVehicle[i][pVehLocked] = false;
    
	SwitchVehicleDoors(PlayerVehicle[i][pVehPhysic], false);
	return 1;
}

TakeVehicleFromGarage(playerid)
{
	if(AccountData[playerid][pUseGarage] == 1)
	{
		Garage_Close(playerid);
	}
	else
	{
		new garkot_id = 0;
		foreach(new gkid : PublicGarage)
		{
			if(IsPlayerInRangeOfPoint(playerid, 3.5, PublicGarage[gkid][pgPOS][0], PublicGarage[gkid][pgPOS][1],PublicGarage[gkid][pgPOS][2]))
			{
				AccountData[playerid][pGetPARKID] = gkid;
				AccountData[playerid][pUseGarage] = 1;
				format(gGarageTitle[playerid], sizeof(gGarageTitle[]), "%s", PublicGarage[gkid][pgName]);
                AllGui_Status(playerid, false);
				foreach(new i : PvtVehicles) if(PlayerVehicle[i][pVehOwnerID] == AccountData[playerid][pID] && PlayerVehicle[i][pVehParked] == gkid)
				{
					AccountData[playerid][pGarage][garkot_id] = i;
					garkot_id++;
					if(garkot_id >= 4) break;
				}
				gGarageCount[playerid] = garkot_id;
				gGarageSel[playerid] = -1;
				return Garage_Render(playerid);
			}
		}
	}
	return 1;
}

TakeVehicleFromPvtGarage(playerid)
{
	if(AccountData[playerid][pUseGarage] == 1)
	{
		Garage_Close(playerid);
	}
	else
	{
		new garkot_id = 0;
		foreach(new gkid : PrivateGarage)
		{
			if(IsPlayerInRangeOfPoint(playerid, 3.5, PrivateGarage[gkid][pgPOS][0], PrivateGarage[gkid][pgPOS][1],PrivateGarage[gkid][pgPOS][2]))
			{
				AccountData[playerid][pGetPARKID] = gkid;
				AccountData[playerid][pUseGarage] = 1;
				format(gGarageTitle[playerid], sizeof(gGarageTitle[]), "Owner: %s", PrivateGarage[gkid][pgName]);
                AllGui_Status(playerid, false);
				foreach(new i : PvtVehicles) if(PlayerVehicle[i][pVehOwnerID] == AccountData[playerid][pID] && PlayerVehicle[i][pVehPrivateG] == gkid)
				{
					AccountData[playerid][pGarage][garkot_id] = i;
					garkot_id++;
					if(garkot_id >= 4) break;
				}
				gGarageCount[playerid] = garkot_id;
				gGarageSel[playerid] = -1;
				return Garage_Render(playerid);
			}
		}
	}
	return 1;
}
