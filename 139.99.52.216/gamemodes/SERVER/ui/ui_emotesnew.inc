#include <YSI_Coding/y_hooks>

/* =====================================================================
    SERVER/ui/ui_emotesnew.inc   (AlthafAbraham)
    EAGLE ROLEPLAY - Menu Emote CEF (pengganti textdraw EmoteMenu,
    emoteList, EpropList1-3). Fungsi animasi & properti tetap sama.
    Panel CEF: "emote" (menu), "emote_anim" (daftar animasi), "emote_prop".
   ===================================================================== */

#define EMOTE_PER_PAGE      (30)

static const gEpropNames[][] =
{
	"Bunga",
	"Dildo",
	"Dildo2",
	"Bat",
	"Bat2",
	"Baton",
	"Baton2",
	"Skate",
	"Mic",
	"Bendera",
	"Gitar",
	"Kursi",
	"Kursi2",
	"Camera",
	"Camera2",
	"Payung",
	"Basket",
	"Basket2",
	"Basket3",
	"Medbox",
	"Televisi",
	"Guitar",
	"Nitro",
	"Bumper",
	"Ban",
	"Box",
	"Box2",
	"Box3",
	"Box4",
	"Bendera2"
};

stock Emote_ShowMenu(playerid)
{
    P_Begin("emote", "EMOTE MENU", "Pilih animasi atau properti", "anim", "r", 18);
    P_ListBegin("", -1, "list", 0, "menu");
    P_Item("Emotes", "Semua animasi karakter", "", "anim");
    P_Item("Prop Animation", "Animasi dengan barang (properti)", "", "box");
    P_Item("Hentikan Animasi", "Berhenti dari animasi sekarang", "", "stop");
    P_ListEnd();
    return P_Send(playerid);
}

stock Emote_ShowAnims(playerid)
{
    new total = sizeof(g_AnimDetails);
    new pages = (total + EMOTE_PER_PAGE - 1) / EMOTE_PER_PAGE;
    if (animPage[playerid] < 1) animPage[playerid] = 1;
    if (animPage[playerid] > pages) animPage[playerid] = pages;
    new start = (animPage[playerid] - 1) * EMOTE_PER_PAGE, sub[48];
    format(sub, sizeof(sub), "Halaman %d / %d  -  ketuk untuk memainkan", animPage[playerid], pages);
    P_Begin("emote_anim", "EMOTE LIST", sub, "anim", "r", 22);
    P_ListBegin("", -1, "grid", 2, "play");
    for (new i = start; i < total && i < start + EMOTE_PER_PAGE; i++) P_Item(g_AnimDetails[i][e_AnimationName]);
    P_ListEnd();
    new nav[16];
    format(nav, sizeof(nav), "%d / %d", animPage[playerid], pages);
    P_Nav(nav);
    P_Footer();
    P_Btn("back", "Kembali", "g", "back");
    P_Btn("stop", "Stop Animasi", "d", "stop");
    return P_Send(playerid);
}

stock Emote_ShowProps(playerid)
{
    P_Begin("emote_prop", "PROP ANIMATION", "Ketuk untuk memakai properti", "box", "r", 22);
    P_ListBegin("", -1, "grid", 2, "use");
    for (new i = 0; i < sizeof(gEpropNames); i++) P_Item(gEpropNames[i]);
    P_ListEnd();
    P_Footer();
    P_Btn("back", "Kembali", "g", "back");
    P_Btn("stop", "Lepas", "d", "stop");
    return P_Send(playerid);
}

stock Emote_Stop(playerid)
{
    if (AnimationCheck(playerid))
    {
        ClearAnimations(playerid);
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_NONE);
    }
    RemovePlayerAttachedObject(playerid, 9);
    return 1;
}

stock Emote_ApplyProp(playerid, prop)
{
	switch (prop)
	{
		case 0: // Bunga
		{
			ApplyAnimation(playerid, "KISSING", "gift_give", 5.33, 0, 0, 0, 0, 0, 1);
			SetPlayerAttachedObject(playerid, 9, 325, 6, _, _, _, _, _, _, 1.0, 1.0, 1.0);
		}
		case 1: // Dildo
		{
			ApplyAnimation(playerid, "PAULNMAC", "WANK_LOOP", 4.0, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 321, 5, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 2: // Dildo2
		{
			ApplyAnimation(playerid,"PAULNMAC", "WANK_LOOP", 4.0, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 322, 5, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 3: // Bat
		{
			ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_01", 6.67, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 336, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 4: // Bat2
		{
			ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_02", 10.00, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid,  9, 334, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 5: // Baton
		{
			ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_01", 6.67, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 334, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 6: // Baton2
		{
			ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_02", 10.00, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 336, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 7: // Skate
		{
			ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 19878, 5, 0.016000, 0.028000, 0.456000, 0.400000, 91.400108, -1.100000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 8: // Mic
		{
			ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 19610, 5, 0.051999, 0.028999, -0.020000, -84.299865, -0.799999, 10.899998, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 9: // Bendera
		{
			ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 11245, 5, -0.097999, 0.039000, 0.091999, 1.500000, 103.000022, -2.900001, 0.384999, 0.204000, 0.276000, 0, 0);
		}
		case 10: // Gitar
		{
			ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_01", 6.67, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid,  9, 19317, 1, -0.145000, 0.356999, 0.211999, -9.399999, 25.299961, 154.199905, 1.000000, 1.051999, 1.000000, 0, 0);
		}
		case 11: // Kursi
		{
			ApplyAnimation(playerid, "ped", "SEAT_down", 4.1, false, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 1369, 1, -0.207000, 0.101999, -0.010000, -88.599967, 100.600143, -94.200103, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 12: // Kursi2
		{
			ApplyAnimation(playerid, "ped", "SEAT_down", 4.1, false, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 2121, 1, -0.324999, 0.050000, -0.015000, -128.700027, 94.600151, -55.500225, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 13: // Camera
		{
			ApplyAnimation(playerid, "CAMERA", "piccrch_take", 1.0, true, false, false, false, 0);
			SetPlayerAttachedObject(playerid, 9, 19623, 6, 0.074999, 0.112999, 0.079999, 0.000000, 0.000000, 96.599990, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 14: // Camera2
		{
			ApplyAnimation(playerid, "CAMERA", "picstnd_take", 1.0, true, false, false, false, 0);
			SetPlayerAttachedObject(playerid, 9, 19623, 6, 0.152000, 0.068999, 0.037999, 3.899933, -0.499996, 91.399879, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 15: // Payung
		{
			ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 642, 5, -0.279000, 0.126000, -0.356999, 19.699987, -134.099990, 1.599998, 0.368000, 0.371000, 0.470999, 0xFF3A3B3C, 0xFF3A3B3C);
		}
		case 16: // Basket
		{
			ApplyAnimation(playerid, "BSKTBALL","BBALL_idleloop", 0.67, true, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 2114, 6, 0.300000, 0.000000, 0.039999, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 17: // Basket2
		{
			ApplyAnimation(playerid, "BSKTBALL","BBALL_run", 0.90, true, true, true, true, 0);
			SetPlayerAttachedObject(playerid,  9, 2114, 6, 0.300000, 0.000000, 0.039999, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 18: // Basket3
		{
			ApplyAnimation(playerid, "BSKTBALL","BBALL_walk", 1.07, true, true, true, true, 0);
			SetPlayerAttachedObject(playerid, 9, 2114, 6, 0.300000, 0.000000, 0.039999, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
		}
		case 19: // Medbox
		{
			ApplyAnimation(playerid, "CAMERA", "camcrch_idleloop", 2.0, true, false, false, false, 0);
			SetPlayerAttachedObject(playerid, 9, 11738, 1, -0.522999, 0.668999, 0.550999, 74.799995, 76.100028, -21.699998, 1.473999, 1.431999, 1.212000, 0, 0);
		}
		case 20: // Televisi
		{
			SetPlayerAttachedObject(playerid, 9, 2322, 1, 0.298, 0.405, 0.0, 0.0, 92.2, 178.9, 1.0, 1.0, 1.0);
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		}
		case 21: // Guitar
		{
			ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
			SetPlayerAttachedObject(playerid, 9, 19317, 1, -0.214, 0.383, 0.142, -14.200, 17.900, 158.400, 1.000, 1.000, 1.000);
		}
		case 22: // Nitro
		{
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
			SetPlayerAttachedObject(playerid, 9, 1010, 1, -0.065, 0.405, 0.003, 0.0, 92.0, 0.0, 1.0, 1.0, 1.0);
		}
		case 23: // Bumper
		{
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
			SetPlayerAttachedObject(playerid, 9, 1150, 6,  0.057999, 0.100999, 0.934000,  0.000000, -88.199981, 0.000000,  1.000000, 1.000000, 1.000000); // Bumper
		}
		case 24: // Ban
		{
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
			SetPlayerAttachedObject(playerid, 9, 1080, 1, 0.165, 0.436, -0.026, 0.00, 0.00, 86.9, 0.853, 0.478, 0.541);
		}
		case 25: // Box
		{
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
			SetPlayerAttachedObject(playerid, 9, 2912, 1, 0.181, 0.253, -0.067, -82.3, 1.0, 6.0, 0.51, 0.575, 0.483);
		}
		case 26: // Box2
		{
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
			SetPlayerAttachedObject(playerid, 9, 19636, 1, 0.0, 0.484, 0.0, 0.0, 94.6, 89.6, 1.0, 1.0, 1.0);
		}
		case 27: // Box3
		{
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
			SetPlayerAttachedObject(playerid, 9, 2654, 6,  -0.018999, 0.143999, -0.186999,  -106.299964, -2.699998, -11.199999,  1.000000, 0.703000, 0.858000);
		}
		case 28: // Box4
		{
			SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
			SetPlayerAttachedObject(playerid, 9, 2814, 1, 0.095, 0.312, 0.0, -89.7, 56.5, 5.4, 1.0, 1.0, 1.0);
		}
		case 29: // Bendera2
		{
			ApplyAnimationEx(playerid, "CRACK", "Bbalbat_Idle_01", 4.0, 1, 0, 0, 0, 0, 1);
			SetPlayerAttachedObject(playerid, 9, 19307, 5,  0.067000, 0.046999, 0.021000,  -4.299974, 169.900070, 163.699966,  1.000000, 1.000000, 1.000000); // Bendera2
		}
	}
	return 1;
}

stock Emote_OnUI(playerid, const v[], const a[], i)
{
    if (!strcmp(a, "close"))
    {
        P_Close(playerid, v);
        animPage[playerid] = 1;
        return AllGui_Status(playerid, true);
    }
    if (!strcmp(v, "emote"))
    {
        if (!strcmp(a, "menu"))
        {
            if (i == 0) { P_Close(playerid, "emote"); animPage[playerid] = 1; return Emote_ShowAnims(playerid); }
            if (i == 1) { P_Close(playerid, "emote"); return Emote_ShowProps(playerid); }
            if (i == 2) return Emote_Stop(playerid);
        }
        return 1;
    }
    if (!strcmp(a, "stop")) return Emote_Stop(playerid);
    if (!strcmp(a, "back"))
    {
        P_Close(playerid, v);
        animPage[playerid] = 1;
        return Emote_ShowMenu(playerid);
    }
    if (!strcmp(v, "emote_anim"))
    {
        if (!strcmp(a, "next")) { animPage[playerid]++; PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0); return Emote_ShowAnims(playerid); }
        if (!strcmp(a, "prev")) { if (animPage[playerid] > 1) animPage[playerid]--; PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0); return Emote_ShowAnims(playerid); }
        if (!strcmp(a, "play"))
        {
            new ePage = i + ((animPage[playerid] - 1) * EMOTE_PER_PAGE);
            if (ePage < 0 || ePage >= sizeof(g_AnimDetails)) return 1;
            ApplyAnimation(playerid, g_AnimDetails[ePage][e_AnimLib], g_AnimDetails[ePage][e_AnimName], g_AnimDetails[ePage][e_AnimDelta], g_AnimDetails[ePage][e_AnimLoop], g_AnimDetails[ePage][e_AnimLX], g_AnimDetails[ePage][e_AnimLY], g_AnimDetails[ePage][e_AnimFreeze], g_AnimDetails[ePage][e_AnimTime]);
        }
        return 1;
    }
    if (!strcmp(v, "emote_prop"))
    {
        if (!strcmp(a, "use") && 0 <= i < sizeof(gEpropNames)) Emote_ApplyProp(playerid, i);
        return 1;
    }
    return 1;
}

CMD:emotemenu(playerid, const params[])
{
    if(AccountData[playerid][pDraggedBy] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang digendong orang lain!");
	if(AccountData[playerid][pCuffed]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang diborgol!");
	if(AccountData[playerid][ActivityTime] != 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Selama activity progress masih berjalan, anda tidak dapat menggunakan CMD!");
	if(AccountData[playerid][pInjured] > 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak bisa menggunakan ini jika sedang keadaan Pingsan!");
	if(DurringRefill[playerid]) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang mengisi bensin!");
	if(GetPlayerState(playerid) != PLAYER_STATE_ONFOOT) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak bisa menggunakan emote didalam kendaraan!");
	if(GetPVarInt(playerid, "DurringDaur")) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang membawa barang, tidak dapat melakukan ini!");

    if (isnull(params)) {
        AllGui_Status(playerid, false);
        animPage[playerid] = 1;
        Emote_ShowAnims(playerid);
    }
	else
	{
        if(!strcmp("x", params, true))
        {
            if(AnimationCheck(playerid))
            {
               // if(IsPlayerAttachedObjectSlotUsed(playerid, g_animPropIndex[playerid])) RemovePlayerAttachedObject(playerid, g_animPropIndex[playerid]);
                ClearAnimations(playerid);
                SetPlayerSpecialAction(playerid, SPECIAL_ACTION_NONE);
            }
        }
  		else
		{
            for(new index = 0; index < sizeof(g_AnimDetails); index ++)
            {
                if(!strcmp(g_AnimDetails[index][e_AnimationName], params, true))
                {
                    ApplyAnimationEx(playerid, g_AnimDetails[index][e_AnimLib], g_AnimDetails[index][e_AnimName], g_AnimDetails[index][e_AnimDelta], g_AnimDetails[index][e_AnimLoop], g_AnimDetails[index][e_AnimLX], g_AnimDetails[index][e_AnimLY], g_AnimDetails[index][e_AnimFreeze], g_AnimDetails[index][e_AnimTime]);
                    return 1;
                }
            }
        }
    }
    return 1;
}

/*CMD:e(playerid, const params[])
{
    if(AnimationCheck(playerid))
    {
        // if(IsPlayerAttachedObjectSlotUsed(playerid, g_animPropIndex[playerid])) RemovePlayerAttachedObject(playerid, g_animPropIndex[playerid]);
        ClearAnimations(playerid);
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_NONE);
    }
}*/

CMD:epropmenu(playerid, const params[])
{
    AllGui_Status(playerid, false);
    return Emote_ShowProps(playerid);
}

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

	if(AccountData[playerid][pSpawned] == 1)
	{
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
}

Dialog:A_ACTION_LIST(playerid, response, listitem, inputtext[])
{
	if(response)
	{
		if(listitem == 0)
		{
			AllGui_Status(playerid, false);
			Emote_ShowMenu(playerid);
		}
		if(listitem == 1)
		{
			new frmtx[300], count = 0;

			foreach(new i : Player) if (i != playerid) if (IsPlayerNearPlayer(playerid, i, 2.5))
			{
				format(frmtx, sizeof(frmtx), "%sPlayer ID: %d\n", frmtx, i);
				NearestPlayer[playerid][count++] = i;
			}

			if (AccountData[playerid][pFaction] == FACTION_NONE && AccountData[playerid][pFamily] == -1)
			{
				Dialog_Show(playerid, PANEL_NONE, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Menu Warga", "Drag/Undrag Person", "Pilih", "Batal");
				ShowPlayerRadialNew(playerid, false);
			}
			else if (AccountData[playerid][pFaction] == FACTION_TRANS && AccountData[playerid][pFamily] == -1)
			{
				Dialog_Show(playerid, PANEL_NONE, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Menu Warga", "Drag/Undrag Person", "Pilih", "Batal");
				ShowPlayerRadialNew(playerid, false);
			}
			else
			{
				if (count > 0)
				{
					Dialog_Show(playerid, DialogKantongPanel, DIALOG_STYLE_LIST, ""ALTHF"EAGLE"WHITE" - Faction Panel", frmtx, "Pilih", "Batal");
				}
				else ShowTDN(playerid, NOTIFICATION_WARNING, "Tidak ada orang disekitar anda!");

				return ShowPlayerRadialNew(playerid, false);
			}

			if (AccountData[playerid][pFamily] > -1 && AccountData[playerid][pFamilyRank] > 1)
			{
				if (count > 0)
				{
					Dialog_Show(playerid, FamiliesKantongList, DIALOG_STYLE_LIST, ""ALTHF"EAGLE"WHITE" - Faction Panel (Gang)", frmtx, "Pilih", "Batal");
				}
				else ShowTDN(playerid, NOTIFICATION_WARNING, "Tidak ada orang disekitar anda!");
				return ShowPlayerRadialNew(playerid, false);
			}
		}
	}
	return 1;
}
