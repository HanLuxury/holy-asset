#include <YSI/y_hooks>

new gPlayerUsingLoopingAnim[MAX_PLAYERS];
new gPlayerAnimLibsPreloaded[MAX_PLAYERS];

new aOfferID[MAX_PLAYERS];
new aInterType[MAX_PLAYERS];

bool: IsPlayerPlayingAnimation(playerid, animlib[], animname[])
{
	new animindex = GetPlayerAnimationIndex(playerid);

	new animLib[32], animName[32];
	GetAnimationName(animindex, animLib, sizeof(animLib), animName, sizeof(animName));

	return !strcmp(animLib, animlib, true) && !strcmp(animName, animname, true);
}

StopLoopingAnim(playerid)
{
	gPlayerUsingLoopingAnim[playerid] = 0;
	AccountData[playerid][pLoopAnim] = 0;
    ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);
	return 1;
}

ApplyAnimationEx(playerid, animlib[], animname[], Float:fDelta, loop, lockx, locky, freeze, time, forcesync = 0)
{
	ApplyAnimation(playerid, animlib, animname, fDelta, loop, lockx, locky, freeze, time, forcesync);

	if(loop > 0 || freeze > 0)
	{
		AccountData[playerid][pLoopAnim] = 1;
	}
	return 1;
}

hook OnPlayerConnect(playerid)
{
	aOfferID[playerid] = INVALID_PLAYER_ID;
	aInterType[playerid] = -1;
	return 1;
}

/*hook OnPlayerUpdate(playerid)
{
	if(!IsPlayerMoving(playerid) && !IsPlayerInAnyVehicle(playerid))
	{
		if(AccountData[playerid][pLoopAnim] == 0 && !GetPVarInt(playerid, "DurringGym") && !AccountData[playerid][pInjured] && !AccountData[playerid][ActivityTime] && !AccountData[playerid][pCuffed])
		{
			if(!IdleTimer[playerid] && !PlayerIdleAnim[playerid])
			{
				IdleTimer[playerid] = SetTimerEx("PlayAnimationIdle", 28000, false, "i", playerid);
			}
		}
	}
	else
	{
		KillTimer(IdleTimer[playerid]);
		IdleTimer[playerid] = 0;
	}
	return 1;
}

forward PlayAnimationIdle(playerid);
public PlayAnimationIdle(playerid)
{
	switch(Random(5))
	{
		case 1:
		{
			ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_02", 4.1, 1, 0, 0, 0, 0, 1);
		}
		case 2:
		{
			ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_01", 4.1, 1, 0, 0, 0, 0, 1);
		}
		case 3:
		{
			ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_03", 4.1, 1, 0, 0, 0, 0, 1);			
		}
		case 4:
		{
			ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE", 4.1, 1, 0, 0, 0, 0, 1);
		}
		case 5:
		{
			ApplyAnimationEx(playerid, "CLOTHES", "CLO_Pose_Out", 4.1, 1, 0, 0, 0, 0, 1);	
		}
	}
	PlayerIdleAnim[playerid] = true;
	SetTimerEx("StopAnimIdle", 5000, false, "i", playerid);
	return 1;
}

forward StopAnimIdle(playerid);
public StopAnimIdle(playerid)
{
	if(!PlayerIdleAnim[playerid]) return 0;
	
	KillTimer(IdleTimer[playerid]);
	IdleTimer[playerid] = 0;
	PlayerIdleAnim[playerid] = false;

	StopLoopingAnim(playerid);
	AccountData[playerid][pLoopAnim] = 0;
	return 1;
}*/

PreloadAnimations(playerid)
{
    for (new i = 0; i < sizeof(g_aPreloadLibs); i ++) {
        ApplyAnimation(playerid, g_aPreloadLibs[i], "null", 4.0, 0, 0, 0, 0, 0, 1);
    }
    return 1;
}

//OnPlayerSpawn
/*LoadAnims(playerid)
{
	if(!gPlayerAnimLibsPreloaded[playerid])
	{
	    PreloadAnimLib(playerid,"AIRPORT");
		PreloadAnimLib(playerid,"Attractors");
		PreloadAnimLib(playerid,"BAR");
		PreloadAnimLib(playerid,"BASEBALL");
		PreloadAnimLib(playerid,"BD_FIRE");
		PreloadAnimLib(playerid,"benchpress");
        PreloadAnimLib(playerid,"BF_injection");
        PreloadAnimLib(playerid,"BIKED");
        PreloadAnimLib(playerid,"BIKEH");
        PreloadAnimLib(playerid,"BIKELEAP");
        PreloadAnimLib(playerid,"BIKES");
        PreloadAnimLib(playerid,"BIKEV");
        PreloadAnimLib(playerid,"BIKE_DBZ");
        PreloadAnimLib(playerid,"BMX");
        PreloadAnimLib(playerid,"BOX");
        PreloadAnimLib(playerid,"BSKTBALL");
        PreloadAnimLib(playerid,"BUDDY");
        PreloadAnimLib(playerid,"BUS");
        PreloadAnimLib(playerid,"CAMERA");
        PreloadAnimLib(playerid,"CAR");
        PreloadAnimLib(playerid,"CAR_CHAT");
        PreloadAnimLib(playerid,"CASINO");
        PreloadAnimLib(playerid,"CHAINSAW");
        PreloadAnimLib(playerid,"CHOPPA");
        PreloadAnimLib(playerid,"CLOTHES");
        PreloadAnimLib(playerid,"COACH");
        PreloadAnimLib(playerid,"COLT45");
        PreloadAnimLib(playerid,"COP_DVBYZ");
        PreloadAnimLib(playerid,"CRIB");
        PreloadAnimLib(playerid,"DAM_JUMP");
        PreloadAnimLib(playerid,"DANCING");
        PreloadAnimLib(playerid,"DILDO");
        PreloadAnimLib(playerid,"DODGE");
        PreloadAnimLib(playerid,"DOZER");
        PreloadAnimLib(playerid,"DRIVEBYS");
        PreloadAnimLib(playerid,"FAT");
        PreloadAnimLib(playerid,"FIGHT_B");
        PreloadAnimLib(playerid,"FIGHT_C");
        PreloadAnimLib(playerid,"FIGHT_D");
        PreloadAnimLib(playerid,"FIGHT_E");
        PreloadAnimLib(playerid,"FINALE");
        PreloadAnimLib(playerid,"FINALE2");
        PreloadAnimLib(playerid,"Flowers");
        PreloadAnimLib(playerid,"FOOD");
        PreloadAnimLib(playerid,"Freeweights");
        PreloadAnimLib(playerid,"GANGS");
        PreloadAnimLib(playerid,"GHANDS");
        PreloadAnimLib(playerid,"GHETTO_DB");
        PreloadAnimLib(playerid,"goggles");
        PreloadAnimLib(playerid,"GRAFFITI");
        PreloadAnimLib(playerid,"GRAVEYARD");
        PreloadAnimLib(playerid,"GRENADE");
        PreloadAnimLib(playerid,"GYMNASIUM");
        PreloadAnimLib(playerid,"HAIRCUTS");
        PreloadAnimLib(playerid,"HEIST9");
        PreloadAnimLib(playerid,"INT_HOUSE");
        PreloadAnimLib(playerid,"INT_OFFICE");
        PreloadAnimLib(playerid,"INT_SHOP");
        PreloadAnimLib(playerid,"JST_BUISNESS");
        PreloadAnimLib(playerid,"KART");
        PreloadAnimLib(playerid,"KISSING");
        PreloadAnimLib(playerid,"KNIFE");
        PreloadAnimLib(playerid,"LAPDAN1");
        PreloadAnimLib(playerid,"LAPDAN2");
        PreloadAnimLib(playerid,"LAPDAN3");
        PreloadAnimLib(playerid,"LOWRIDER");
        PreloadAnimLib(playerid,"MD_CHASE");
        PreloadAnimLib(playerid,"MEDIC");
        PreloadAnimLib(playerid,"MD_END");
        PreloadAnimLib(playerid,"MISC");
        PreloadAnimLib(playerid,"MTB");
        PreloadAnimLib(playerid,"MUSCULAR");
        PreloadAnimLib(playerid,"NEVADA");
        PreloadAnimLib(playerid,"ON_LOOKERS");
        PreloadAnimLib(playerid,"OTB");
        PreloadAnimLib(playerid,"PARACHUTE");
        PreloadAnimLib(playerid,"PARK");
        PreloadAnimLib(playerid,"PAULNMAC");
        PreloadAnimLib(playerid,"PED");
        PreloadAnimLib(playerid,"PLAYER_DVBYS");
        PreloadAnimLib(playerid,"PLAYIDLES");
        PreloadAnimLib(playerid,"POLICE");
        PreloadAnimLib(playerid,"POOL");
        PreloadAnimLib(playerid,"POOR");
        PreloadAnimLib(playerid,"PYTHON");
        PreloadAnimLib(playerid,"QUAD");
        PreloadAnimLib(playerid,"QUAD_DBZ");
        PreloadAnimLib(playerid,"RIFLE");
        PreloadAnimLib(playerid,"RIOT");
        PreloadAnimLib(playerid,"ROB_BANK");
        PreloadAnimLib(playerid,"ROCKET");
        PreloadAnimLib(playerid,"RUSTLER");
        PreloadAnimLib(playerid,"RYDER");
        PreloadAnimLib(playerid,"SCRATCHING");
        PreloadAnimLib(playerid,"SHAMAL");
        PreloadAnimLib(playerid,"SHOTGUN");
        PreloadAnimLib(playerid,"SILENCED");
        PreloadAnimLib(playerid,"SKATE");
        PreloadAnimLib(playerid,"SPRAYCAN");
        PreloadAnimLib(playerid,"STRIP");
        PreloadAnimLib(playerid,"SUNBATHE");
        PreloadAnimLib(playerid,"SWAT");
        PreloadAnimLib(playerid,"SWEET");
        PreloadAnimLib(playerid,"SWIM");
        PreloadAnimLib(playerid,"SWORD");
        PreloadAnimLib(playerid,"TANK");
        PreloadAnimLib(playerid,"TATTOOS");
        PreloadAnimLib(playerid,"TEC");
        PreloadAnimLib(playerid,"TRAIN");
        PreloadAnimLib(playerid,"TRUCK");
        PreloadAnimLib(playerid,"UZI");
        PreloadAnimLib(playerid,"VAN");
        PreloadAnimLib(playerid,"VENDING");
        PreloadAnimLib(playerid,"VORTEX");
        PreloadAnimLib(playerid,"WAYFARER");
        PreloadAnimLib(playerid,"WEAPONS");
        PreloadAnimLib(playerid,"WUZI");
        PreloadAnimLib(playerid,"SNM");
        PreloadAnimLib(playerid,"BLOWJOBZ");
        PreloadAnimLib(playerid,"SEX");
   		PreloadAnimLib(playerid,"BOMBER");
   		PreloadAnimLib(playerid,"RAPPING");
    	PreloadAnimLib(playerid,"SHOP");
   		PreloadAnimLib(playerid,"BEACH");
   		PreloadAnimLib(playerid,"SMOKING");
    	PreloadAnimLib(playerid,"FOOD");
    	PreloadAnimLib(playerid,"ON_LOOKERS");
    	PreloadAnimLib(playerid,"DEALER");
		PreloadAnimLib(playerid,"CRACK");
		PreloadAnimLib(playerid,"CARRY");
		PreloadAnimLib(playerid,"COP_AMBIENT");
		PreloadAnimLib(playerid,"PARK");
		PreloadAnimLib(playerid,"INT_HOUSE");
		PreloadAnimLib(playerid,"FOOD");
		gPlayerAnimLibsPreloaded[playerid] = 1;
	}
}*/

stock AnimationCheck(playerid)
{
	return (GetPlayerState(playerid) == PLAYER_STATE_ONFOOT || !GetPVarInt(playerid, "DurringGym") || !AccountData[playerid][pInjured] || !AccountData[playerid][pCuffed] || !AccountData[playerid][pFreeze] || !AccountData[playerid][phoneShown] || !AccountData[playerid][ActivityTime] || !AccountData[playerid][pStunned] || !AccountData[playerid][pLoopAnim]);
}

forward OnPlayerApplyEprop(playerid, prop[]);
public OnPlayerApplyEprop(playerid, prop[])
{
	if(strcmp(prop,"box",true) == 0)
	{
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 2912, 1, 0.181, 0.253, -0.067, -82.3, 1.0, 6.0, 0.51, 0.575, 0.483);
	}
	else if(strcmp(prop,"bunga",true) == 0)
	{
		ApplyAnimation(playerid, "KISSING", "gift_give", 5.33, 0, 0, 0, 0, 0, 1);
		SetPlayerAttachedObject(playerid, 9, 325, 6, _, _, _, _, _, _, 1.0, 1.0, 1.0);
	}
	else if(strcmp(prop,"box2",true) == 0)
	{
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 2654, 6,  -0.018999, 0.143999, -0.186999,  -106.299964, -2.699998, -11.199999,  1.000000, 0.703000, 0.858000);
	}
	else if(strcmp(prop,"box3",true) == 0)
	{
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 19636, 1, 0.0, 0.484, 0.0, 0.0, 94.6, 89.6, 1.0, 1.0, 1.0);
	}
	else if(strcmp(prop,"box4",true) == 0)
	{
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 2814, 1, 0.095, 0.312, 0.0, -89.7, 56.5, 5.4, 1.0, 1.0, 1.0);
	}
	else if(strcmp(prop,"ban",true) == 0)
	{
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 1080, 1, 0.165, 0.436, -0.026, 0.00, 0.00, 86.9, 0.853, 0.478, 0.541);
	}
	else if(strcmp(prop,"mic",true) == 0)
	{
		ApplyAnimation(playerid, "ped", "Jetpack_Idle", 4.1, 0, 0, 0, 1, 0, 1);
		SetPlayerAttachedObject(playerid, 9, 19610, 5, 0.034, 0.05, 0.0, -101.8, 0.0, 0.0, 1.0, 1.0, 1.0);
	}
	else if(strcmp(prop,"bendera",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 11245, 5, 0.211, 0.032, 0.007, 175.8, -68.6, -3.3, 0.304, 0.257, 0.25);
	}
	else if(strcmp(prop,"bendera2",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 19307, 5,  0.067000, 0.046999, 0.021000,  -4.299974, 169.900070, 163.699966,  1.000000, 1.000000, 1.000000); // Bendera2
	}
	else if(strcmp(prop,"bumper",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 1150, 6,  0.057999, 0.100999, 0.934000,  0.000000, -88.199981, 0.000000,  1.000000, 1.000000, 1.000000); // Bumper
	}
	else if(strcmp(prop,"nitro",true) == 0)
	{
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 1010, 1, -0.065, 0.405, 0.003, 0.0, 92.0, 0.0, 1.0, 1.0, 1.0);
	}
	else if(strcmp(prop,"guitar",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 19317, 1, -0.214, 0.383, 0.142, -14.200, 17.900, 158.400, 1.000, 1.000, 1.000);
  		ApplyAnimationEx(playerid, "CRACK", "Bbalbat_Idle_01", 4.0, 1, 0, 0, 0, 0, 1);
	}
	else if(strcmp(prop,"payung",true) == 0)
	{
		ApplyAnimation(playerid, "CAMERA", "camstnd_idleloop", 4.0, 0, 1, 0, 1, 1, 1);
		SetPlayerAttachedObject(playerid, 9, 642, 1, 0.589, 0.256, -0.111, 0.0, 82.9, 0.0, 0.376, 0.379, 0.246);
	}
	else if(strcmp(prop,"kamera",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 19623, 6,  0.126000, 0.057000, 0.000000,  13.599999, -16.299995, 56.399993,  1.000000, 1.000000, 1.000000); // kamera
		ApplyAnimation(playerid, "CAMERA", "camstnd_idleloop", 2.0, 0, 0, 0, 1, 1, 1);
	}
	else if(strcmp(prop,"kamera2",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 19623, 6,  0.126000, 0.057000, 0.000000,  13.599999, -16.299995, 56.399993,  1.000000, 1.000000, 1.000000); // kamera2
		ApplyAnimationEx(playerid, "CAMERA", "piccrch_out", 4.1, 0, 0, 0, 1, 1, 1);
	}
	else if(strcmp(prop,"kamera3",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 19623, 6,  0.126000, 0.057000, 0.000000,  6.099998, -0.400000, 92.599983,  1.000000, 1.000000, 1.000000); // kamera3
		ApplyAnimationEx(playerid, "CAMERA", "picstnd_in", 4.1, 0, 1, 1, 1, 1, 1);
	}
	else if(strcmp(prop,"tv",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 2322, 1, 0.298, 0.405, 0.0, 0.0, 92.2, 178.9, 1.0, 1.0, 1.0);
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
	}
	else if(strcmp(prop,"kursi",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 1369, 1, -0.097, 0.0, 0.0, 174.9, 93.2, 2.2, 1.0, 1.0, 1.0);
		ApplyAnimationEx(playerid, "ped", "SEAT_down", 2.0, 0, 0, 0, 1, 0);
	}
	else if(strcmp(prop,"kursi2",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 2121, 1, -0.214, 0.0, 0.0, 0.0, 91.0, 177.1, 1.0, 1.0, 1.0);
		ApplyAnimationEx(playerid, "ped", "SEAT_down", 2.0, 0, 0, 0, 1, 0);
	}
	else if(strcmp(prop,"besbol",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 336, 6, 0.0, 0.0, -0.014, 0.0, 87.8, -176.8, 1.0, 1.0, 1.0);
		ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_02", 4.1, 1, 0, 0, 0, 0, 1);
	}
	else if(strcmp(prop,"skate",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 19878, 6, 0.388, 0.0, -0.307, 84.8, 0.0, -44.6, 1.0, 1.0, 1.0);
		ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_02", 4.1, 1, 0, 0, 0, 0, 1);
	}
	else if(strcmp(prop,"basket",true) == 0)
	{
		SetPlayerAttachedObject(playerid, 9, 2114, 6,  0.233000, 0.000000, 0.004000,  0.000000, 0.000000, 0.000000,  1.000000, 1.000000, 1.000000);
		ApplyAnimationEx(playerid, "BSKTBALL", "BBALL_idleloop", 4.1, 1, 0, 0, 0, 0, 1);
	}
	else ShowTDN(playerid, NOTIFICATION_ERROR, "Animasi Property tidak ditemukan! cek `/elist`");
	return 1;
}

function OnPlayerApplyAnimation(playerid, aname[])
{
	if(strcmp(aname,"liptang",true) == 0)
	{
		ApplyAnimationEx(playerid, "COP_AMBIENT", "Coplook_loop", 4.0, 1, 0, 0, 0, 0, 1); // Arms crossed

	}
	else if(strcmp(aname, "angkatbox",true) == 0)
	{
		ApplyAnimationEx(playerid, "CARRY", "crry_prtial", 2.0, 0, 0, 0, 1, 1);

	}
	else if(strcmp(aname, "camera", true) == 0)
	{
		ApplyAnimationEx(playerid, "CAMERA", "camstnd_idleloop", 2.0, 0, 0, 0, 0, 100000, 1);

	}
	else if(strcmp(aname, "wuzi", true) == 0)
	{
		ApplyAnimationEx(playerid, "WUZI", "Wuzi_stand_loop", 2.0, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"liptang2",true) == 0)
	{
		ApplyAnimationEx(playerid, "GRAVEYARD", "prst_loopa", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"liptang3",true) == 0)
	{
		ApplyAnimationEx(playerid, "GRAVEYARD", "mrnM_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"liptang4",true) == 0)
	{
		ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE", 4.1, 0, 1, 1, 1, 0, 1);

	}
	else if(strcmp(aname,"rokok",true) == 0)
	{
		ApplyAnimationEx(playerid, "SMOKING", "M_smk_drag", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"rokok2",true) == 0)
	{
		ApplyAnimationEx(playerid, "SMOKING", "M_smklean_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"rokok3",true) == 0)
	{
		ApplyAnimationEx(playerid, "SMOKING", "M_smklean_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"medis",true) == 0)
	{
		ApplyAnimationEx(playerid, "MEDIC", "CPR", 4.1, 1, 0, 0, 0, 0, 1);
	}
	else if(strcmp(aname,"medis2",true) == 0)
	{
		ApplyAnimationEx(playerid, "BOMBER", "BOM_Plant_Loop", 4.1, 1, 0, 0, 0, 0, 1);
	}
	else if(strcmp(aname,"cium",true) == 0)
	{
		ApplyAnimationEx(playerid, "KISSING", "Grlfrd_Kiss_01", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"cium2",true) == 0)
	{
		ApplyAnimationEx(playerid, "KISSING", "Grlfrd_Kiss_02", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"cium3",true) == 0)
	{
		ApplyAnimationEx(playerid, "KISSING", "Grlfrd_Kiss_03", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"cium4",true) == 0)
	{
		ApplyAnimationEx(playerid, "KISSING", "Playa_Kiss_01", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"cium5",true) == 0 )
	{
		ApplyAnimationEx(playerid, "KISSING", "Playa_Kiss_01", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"cium6",true) == 0)
	{
		ApplyAnimationEx(playerid, "KISSING", "Playa_Kiss_03", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "dance_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget2",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "DAN_Left_A", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget3",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "DAN_Right_A", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget4",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "DAN_Loop_A", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget5",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "DAN_Up_A", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget6",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "DAN_Down_A", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget7",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "dnce_M_a", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget8",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "dnce_M_e", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget9",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "dnce_M_b", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"joget10",true) == 0)
	{
		ApplyAnimationEx(playerid, "DANCING", "dnce_M_c", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"onani",true) == 0)
	{
		ApplyAnimationEx(playerid, "PAULNMAC", "wank_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname, "onani2", true) == 0)
	{
		ApplyAnimationEx(playerid, "PAULNMAC", "wank_in", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname, "onani3", true) == 0)
	{
		ApplyAnimationEx(playerid, "PAULNMAC", "wank_out", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"angtang",true) == 0)
	{
		ApplyAnimationEx(playerid, "ROB_BANK", "SHP_HandsUp_Scr", 4.1, 0, 0, 0, 1, 0, 1);
	}
	else if(strcmp(aname,"baseball",true) == 0)
	{
		ApplyAnimationEx(playerid, "BASEBALL", "Bat_1", 4.1, 0, 1, 1, 0, 0, 1);

	}
	else if(strcmp(aname,"baseball2",true) == 0)
	{
		ApplyAnimationEx(playerid, "BASEBALL", "Bat_2", 4.1, 0, 1, 1, 0, 0, 1);

	}
	else if(strcmp(aname,"baseball3",true) == 0)
	{
		ApplyAnimationEx(playerid, "BASEBALL", "Bat_3", 4.1, 0, 1, 1, 0, 0, 1);

	}
	else if(strcmp(aname,"baseball4",true) == 0)
	{
		ApplyAnimationEx(playerid, "BASEBALL", "Bat_4", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"baseball5",true) == 0)
	{
		ApplyAnimationEx(playerid, "BASEBALL", "Bat_IDLE", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"tampar",true) == 0)
	{
		ApplyAnimationEx(playerid, "BASEBALL", "Bat_M", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "Barserve_bottle", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender2",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "Barserve_give", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender3",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "Barserve_glass", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender4",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "Barserve_in", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender5",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "Barserve_order", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender6",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "BARman_idle", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender7",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "dnk_stndM_loop", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bartender8",true) == 0)
	{
		ApplyAnimationEx(playerid, "BAR", "dnk_stndF_loop", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"geledah",true) == 0)
	{
		ApplyAnimationEx(playerid, "BD_FIRE", "wash_up", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"santai",true) == 0)
	{
		ApplyAnimationEx(playerid, "BEACH", "bather", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"santai2",true) == 0)
	{
		ApplyAnimationEx(playerid, "BEACH", "Lay_Bac_Loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"santai3",true) == 0)
	{
		ApplyAnimationEx(playerid, "BEACH", "ParkSit_M_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"santai4",true) == 0)
	{
		ApplyAnimationEx(playerid, "BEACH", "ParkSit_W_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"santai5",true) == 0)
	{
		ApplyAnimationEx(playerid, "BEACH", "SitnWait_loop_W", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang",true) == 0)
	{
		ApplyAnimationEx(playerid, "benchpress", "gym_bp_celebrate", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang2",true) == 0)
	{
		ApplyAnimationEx(playerid, "GANGS", "Invite_Yes", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang3",true) == 0)
	{
		ApplyAnimationEx(playerid, "GANGS", "prtial_gngtlkD", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang4",true) == 0)
	{
		ApplyAnimationEx(playerid, "GANGS", "smkcig_prtl", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang5",true) == 0)
	{
		ApplyAnimationEx(playerid, "GANGS", "Invite_No", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang6",true) == 0)
	{
		ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_01", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang7",true) == 0)
	{
		ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_02", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"gang8",true) == 0)
	{
		ApplyAnimationEx(playerid, "DEALER", "DEALER_IDLE_03", 4.1, 1, 0, 0, 0, 0, 1);
	}
	else if(strcmp(aname,"gang9",true) == 0)
	{
		ApplyAnimationEx(playerid, "GHANDS", "gsign2LH", 4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"bicara",true) == 0)
	{
		ApplyAnimationEx(playerid, "GHANDS", "gsign1", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bicara2",true) == 0)
	{
		ApplyAnimationEx(playerid, "GHANDS", "gsign2", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bicara3",true) == 0)
	{
		ApplyAnimationEx(playerid, "GHANDS", "gsign2LH", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bicara4",true) == 0)
	{
		ApplyAnimationEx(playerid, "GHANDS", "gsign3", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bicara5",true) == 0)
	{
		ApplyAnimationEx(playerid, "GHANDS", "gsign3LH", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"bicara6",true) == 0)
	{
		ApplyAnimationEx(playerid, "GHANDS", "gsign4", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"angkat",true) == 0)
	{
		ApplyAnimationEx(playerid, "CARRY", "liftup", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"angkat2",true) == 0)
	{
		ApplyAnimationEx(playerid, "CARRY", "liftup05", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"angkat3",true) == 0)
	{
		ApplyAnimationEx(playerid, "CARRY", "liftup105", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"angkat4",true) == 0)
	{
		ApplyAnimationEx(playerid, "CARRY", "putdwn", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kesakitan",true) == 0)
	{
		ApplyAnimationEx(playerid, "CRACK", "crckidle1", 4.1, 0, 0, 0, 1, 0, 1);

	}
	else if(strcmp(aname,"turu",true) == 0)
	{
		ApplyAnimationEx(playerid, "CRACK", "crckdeth4", 4.1, 0, 0, 0, 1, 0, 1);

	}
	else if(strcmp(aname,"turu2",true) == 0)
	{
		ApplyAnimationEx(playerid, "CRACK", "crckidle4", 4.1, 0, 0, 0, 1, 0, 1);

	}
	else if(strcmp(aname,"lompat",true) == 0)
	{
		ApplyAnimationEx(playerid, "DODGE", "Crush_Jump", 4.1, 0, 1, 1, 0, 0, 1);

	}
	else if(strcmp(aname,"mutah",true) == 0)
	{
		ApplyAnimationEx(playerid, "FOOD", "EAT_Vomit_P", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak",true) == 0)
	{
		ApplyAnimationEx(playerid, "ON_LOOKERS", "shout_01", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak2",true) == 0)
	{
		ApplyAnimationEx(playerid, "ON_LOOKERS", "shout_02", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak3",true) == 0)
	{
		ApplyAnimationEx(playerid, "ON_LOOKERS", "shout_in", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak4",true) == 0)
	{
		ApplyAnimationEx(playerid, "RIOT", "RIOT_ANGRY_B", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak5",true) == 0)
	{
		ApplyAnimationEx(playerid, "RIOT", "RIOT_CHANT", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak6",true) == 0)
	{
		ApplyAnimationEx(playerid, "RIOT", "RIOT_shout", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak7",true) == 0)
	{
		ApplyAnimationEx(playerid, "STRIP", "PUN_HOLLER", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"sorak8",true) == 0)
	{
		ApplyAnimationEx(playerid, "OTB", "wtchrace_win", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"lambai",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "endchat_03", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"lambai2",true) == 0)
	{
		ApplyAnimationEx(playerid, "KISSING", "gfwave2", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"lambai3",true) == 0)
	{
		ApplyAnimationEx(playerid, "ON_LOOKERS", "wave_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"pilok",true) == 0)
	{
		ApplyAnimationEx(playerid, "GRAFFITI", "spraycan_fire", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"lempar",true) == 0)
	{
		ApplyAnimationEx(playerid, "GRENADE", "WEAPON_throw", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kerja",true) == 0)
	{
		ApplyAnimationEx(playerid, "INT_OFFICE", "OFF_Sit_Bored_Loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kerja2",true) == 0)
	{
		ApplyAnimationEx(playerid, "INT_OFFICE", "OFF_Sit_Crash", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kerja3",true) == 0)
	{
		ApplyAnimationEx(playerid, "INT_OFFICE", "OFF_Sit_Drink", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kerja4",true) == 0)
	{
		ApplyAnimationEx(playerid, "INT_OFFICE", "OFF_Sit_Read", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kerja5",true) == 0)
	{
		ApplyAnimationEx(playerid, "INT_OFFICE", "OFF_Sit_Type_Loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kerja6",true) == 0)
	{
		ApplyAnimationEx(playerid, "INT_OFFICE", "OFF_Sit_Watch", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"tusuk",true) == 0)
	{
		ApplyAnimationEx(playerid, "KNIFE", "KILL_Knife_Player", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"tusuk2",true) == 0)
	{
		ApplyAnimationEx(playerid, "KNIFE", "knife_3", 4.1, 0, 1, 1, 0, 0, 1);

	}
	else if(strcmp(aname,"tertusuk",true) == 0)
	{
		ApplyAnimationEx(playerid, "KNIFE", "KILL_Knife_Ped_Damage", 4.1, 0, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"dj",true) == 0)
	{
		ApplyAnimationEx(playerid, "SCRATCHING", "scdldlp", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"dj2",true) == 0)
	{
		ApplyAnimationEx(playerid, "SCRATCHING", "scdlulp", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"dj3",true) == 0)
	{
		ApplyAnimationEx(playerid, "SCRATCHING", "scdrulp", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"nodong",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "ARRESTgun", 4.1, 0, 0, 0, 1, 0, 1);

	}
	else if(strcmp(aname,"nodong2",true) == 0)
	{
		ApplyAnimationEx(playerid, "SHOP", "ROB_Loop_Threat", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"nodong3",true) == 0)
	{
		ApplyAnimationEx(playerid, "ON_LOOKERS", "point_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"nodong4",true) == 0)
	{
		ApplyAnimationEx(playerid, "ON_LOOKERS", "Pointup_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"kungfu",true) == 0)
	{
		ApplyAnimationEx(playerid, "PARK", "Tai_Chi_Loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"nunduk",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "cower", 4.1, 0, 0, 0, 1, 0, 1);

	}
	else if(strcmp(aname,"nangis",true) == 0)
	{
		ApplyAnimationEx(playerid, "GRAVEYARD", "mrnF_loop", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"lelah",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "IDLE_tired", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"lelah2",true) == 0)
	{
		ApplyAnimationEx(playerid, "FAT", "IDLE_tired", 4.1, 1, 0, 0, 0, 0, 1);

	}
	else if(strcmp(aname,"duduk",true) == 0)
	{
		ApplyAnimationEx(playerid, "CRIB", "PED_Console_Loop", 4.1, 1, 0, 0, 0, 0);

	}
	else if(strcmp(aname,"duduk2",true) == 0)
	{
		ApplyAnimationEx(playerid, "INT_HOUSE", "LOU_In", 4.1, 0, 0, 0, 1, 0);

	}
	else if(strcmp(aname,"duduk3",true) == 0)
	{
		ApplyAnimationEx(playerid, "MISC", "SEAT_LR", 4.1, 1, 0, 0, 0, 0);

	}
	else if(strcmp(aname,"duduk4",true) == 0)
	{
		ApplyAnimationEx(playerid, "MISC", "Seat_talk_01", 4.1, 1, 0, 0, 0, 0);

	}
	else if(strcmp(aname,"duduk5",true) == 0)
	{
		ApplyAnimationEx(playerid, "MISC", "Seat_talk_02", 4.1, 1, 0, 0, 0, 0);

	}
	else if(strcmp(aname,"duduk6",true) == 0)
	{
		ApplyAnimationEx(playerid, "ped", "SEAT_down", 4.1, 0, 0, 0, 1, 0);

	}
	else if(strcmp(aname,"jarteng",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "fucku", 4.1, 0, 0, 0, 0, 0);

	}
	else if(strcmp(aname,"ped",true) == 0)
	{
		ApplyAnimationEx(playerid, "FAT", "FatWalk", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped2",true) == 0)
	{
		ApplyAnimationEx(playerid, "MUSCULAR", "MuscleWalk", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped3",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_armed", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped4",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_civi", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped5",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_fat", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped6",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_fatold", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped7",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_gang1", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped8",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_gang2", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped9",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_player", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped10",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_old", 4.1, 1, 1, 1, 1, 1, 1);

	}
	else if(strcmp(aname,"ped11",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WALK_wuzi", 4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"ped12",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WOMAN_walkbusy", 4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"ped13",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WOMAN_walkfatold", 4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"ped14",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WOMAN_walknorm", 4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"ped15",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WOMAN_walksexy", 4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"ped16",true) == 0)
	{
		ApplyAnimationEx(playerid, "PED", "WOMAN_walkshop", 4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"kencing",true) == 0)
	{
		SetPlayerSpecialAction(playerid, 68);

		SendClientMessageEx(playerid, -1, "Tekan `{00ff00}F{ffffff}` untuk berhenti kencing");
	}
	else if(strcmp(aname,"pusing",true) == 0)
	{
		ApplyAnimationEx(playerid,"MISC","plyr_shkhead",4.1, 1, 1, 1, 1, 1, 1);
	}
	else if(strcmp(aname,"nunjuk",true) == 0)
	{
		ApplyAnimationEx(playerid,"MISC","Hiker_Pose_L",4.1,1,1,1,1,1,1);
	}
	else if(strcmp(aname,"gatal",true) == 0)
	{
		ApplyAnimationEx(playerid,"MISC","Scratchballs_01",4.1,1,1,1,1,1,1);
	}
	else if(strcmp(aname,"x",true) == 0)
	{
		if(GetPVarInt(playerid, "DurringGym"))
			return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang melakukan Aktivitas GYM!");

		if(!AccountData[playerid][pFreeze])
		{
			ClearAnimations(playerid, 1);
			StopLoopingAnim(playerid);
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_NONE);
			TogglePlayerControllable(playerid, 1);
			RemovePlayerAttachedObject(playerid, 9);
			ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);

			AccountData[playerid][pLoopAnim] = false;
		}
	}
	else ShowTDN(playerid, NOTIFICATION_ERROR, "Animasi tersebut tidak ditemukan! cek ~y~'/elist'");
	return 1;
}

/*
CMD:eprop(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(isnull(params)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/erprop [nama animasi property]");
	if(AccountData[playerid][ActivityTime] != 0) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang melakukan sesuatu, harap tunggu!");
	if(AccountData[playerid][pInjured]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang pingsan!");
	if(DurringRefill[playerid]) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang mengisi bensin!");
	if(IsPlayerInAnyVehicle(playerid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus diluar dari kendaraan!");

	OnPlayerApplyEprop(playerid, params);
	return 1;
}

CMD:aindex(playerid, params[])
{
	new animlib[32], animname[32];
	if(sscanf(params, "s[32]s[32]", animlib, animname)) return Syntax(playerid, "/index [animlib] [animname]");

	ApplyAnimationEx(playerid, animlib, animname, 4.1, 1, 0, 0, 0, 0, 1);
	return 1;
}

CMD:e(playerid, aname[])
{
	if(isnull(aname))
	{
		ShowTDN(playerid, NOTIFICATION_SYNTAX, "/e [nama animasi]");
		return 1;
	}
	if(AccountData[playerid][pDraggedBy] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang digendong orang lain!");
	if(AccountData[playerid][pCuffed]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang diborgol!");
	if(AccountData[playerid][ActivityTime] != 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Selama activity progress masih berjalan, anda tidak dapat menggunakan CMD!");
	if(AccountData[playerid][pInjured] > 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak bisa menggunakan ini jika sedang keadaan Pingsan!");
	if(DurringRefill[playerid]) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang mengisi bensin!");
	if(GetPlayerState(playerid) != PLAYER_STATE_ONFOOT) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak bisa menggunakan emote didalam kendaraan!");
	if(GetPVarInt(playerid, "DurringDaur")) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang membawa barang, tidak dapat melakukan ini!");

	if(AccountData[playerid][pSpawned] == 1){
		OnPlayerApplyAnimation(playerid, aname);
	}
	return 1;
}

CMD:einter(playerid, params[])
{
	new otherid, anim[128], str[178];
	if(sscanf(params, "us[128]", otherid, anim)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/einter [name/playerid] [animasi]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(AccountData[playerid][pInjured]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang pingsan!");
	if(AccountData[otherid][pInjured]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang pingsan!");
	if(IsPlayerInAnyVehicle(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang berada di kendaraan!");
	if(IsPlayerInAnyVehicle(playerid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang berada di kendaraan!");
	if(otherid == playerid) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat melakukan ini kepada diri sendiri!");
	if(aOfferID[otherid] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sedang mendapat ajakan interaksi!");

	if(!strcmp(anim, "salam", true))
	{
		aOfferID[otherid] = playerid;
		aInterType[otherid] = 1;
		
		format(str, sizeof(str), ""PINK1"[i]:"WHITE" Orang didekat anda mengajak anda untuk berjabat tangan, "GREEN"Y"WHITE" menerima, "RED"N"WHITE" Menolak");
		SendClientMessageEx(otherid, -1, str);
	}
	else if(!strcmp(anim, "peluk", true))
	{
		aOfferID[otherid] = playerid;
		aInterType[otherid] = 2;
		
		format(str, sizeof(str), ""PINK1"[i]:"WHITE" Orang didekat anda mengajak anda untuk berpelukan, "GREEN"Y"WHITE" menerima, "RED"N"WHITE" Menolak");
		SendClientMessageEx(otherid, -1, str);
	}
	else ShowTDN(playerid, NOTIFICATION_ERROR, "Animasi tidak ditemukan, gunakan /elist untuk melihat daftar animasi!");
	return 1;
}

CMD:eilist(playerid, params[])
{
	if(!IsPlayerConnected(playerid)) return false;
	new xjjs[512];
	format(xjjs, sizeof(xjjs), "salam\npeluk");
	Dialog_Show(playerid, ShowOnly, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Anim Interaksi", xjjs, "Tutup", "");
	return 1;
}*/

hook OnPlayerKeyStateChange(playerid, newkeys, oldkeys)
{
	if(newkeys & KEY_YES && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT)
	{
		if(aOfferID[playerid] != INVALID_PLAYER_ID && IsPlayerConnected(aOfferID[playerid]))
		{
			if(aInterType[playerid] == 1)
			{
				new Float:angle;
				GetPlayerFacingAngle(aOfferID[playerid], angle);
				SetPlayerFacingAngle(playerid, angle + 180.0);
				ApplyAnimation(playerid, "GANGS", "hndshkfa", 4.0, 0, 0, 0, 0, 0, 1);
				ApplyAnimation(aOfferID[playerid], "GANGS", "hndshkfa", 4.0, 0, 0, 0, 0, 0, 1);
				aOfferID[playerid] = INVALID_PLAYER_ID;
				aInterType[playerid] = -1;
			}
			if(aInterType[playerid] == 2)
			{
				new Float:angle;
				GetPlayerFacingAngle(aOfferID[playerid], angle);
				SetPlayerFacingAngle(playerid, angle + 180.0);
				ApplyAnimation(playerid, "KISSING", "Grlfrd_Kiss_01", 4.1, 0, 0, 0, 0, 0, 1);
				ApplyAnimation(aOfferID[playerid], "KISSING", "Grlfrd_Kiss_01", 4.1, 0, 0, 0, 0, 0, 1);
				aOfferID[playerid] = INVALID_PLAYER_ID;
				aInterType[playerid] = -1;
			}
		}
	}

	/*if(newkeys & KEY_SPRINT && PlayerIdleAnim[playerid])
	{
		StopLoopingAnim(playerid);
		KillTimer(IdleTimer[playerid]);
		IdleTimer[playerid] = 0;
		PlayerIdleAnim[playerid] = false;
		AccountData[playerid][pLoopAnim] = 0;
	}*/

	if(newkeys & KEY_NO && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT)
	{
		if(aOfferID[playerid] != INVALID_PLAYER_ID && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT)
		{
			new offer = aOfferID[playerid];
			SendClientMessageEx(aOfferID[playerid], -1, ""PINK1"INTERAKSI:"WHITE" Pemain tersebut menolak untuk berinteraksi dengan anda.");
			aOfferID[playerid] = INVALID_PLAYER_ID;
			aInterType[playerid] = -1;
			aOfferID[offer] = INVALID_PLAYER_ID;
			aInterType[offer] = -1;
		}
	}
	return 1;
}