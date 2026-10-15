#include <YSI/y_hooks>

hook OnPlayerKeyStateChange(playerid, newkeys, oldkeys)
{
    if(newkeys & KEY_YES && IsPlayerSmoking[playerid])
    {
        if(!SmokingDelayTime[playerid])
        {
            ApplyAnimationEx(playerid, "GANGS", "smkcig_prtl", 4.5, 0,1,0,1,1,1);
            SetTimerEx("SmokeCigar", 3500, false, "d", playerid);
            SmokingDelayTime[playerid] = 1;
        }
        else
        {
            ShowTDN(playerid, NOTIFICATION_WARNING, "Mohon tunggu sebelum menghisap kembali.");
        }
    }
    if(newkeys & KEY_YES)
	{
		if(GetPlayerState(playerid) == PLAYER_STATE_ONFOOT)
		{
			if(AccountData[playerid][pIsSmoking])
			{
				if(AccountData[playerid][pActivityTime] != 0) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang melakukan sesuatu, mohon tunggu progress bar selesai!");

				if(pIsVaping[playerid]) //jika vape
				{
					if(AccountData[playerid][pIsSmokeBlowing]) return 1;

					AccountData[playerid][pIsSmokeBlowing] = true;
					AccountData[playerid][pSmokedTimes]++;
					SetTimerEx("StartVape", 2100, false, "i", playerid);
					ApplyAnimation(playerid, "SMOKING", "M_smk_drag", 4.1, false, false, false, false, 0, true);
				}
				else
				{
					if(AccountData[playerid][pIsSmokeBlowing]) return 1;

					AccountData[playerid][pIsSmokeBlowing] = true;
					AccountData[playerid][pSmokedTimes]++;
					SetTimerEx("StartVape", 3500, false, "i", playerid);
					ApplyAnimation(playerid, "GANGS", "smkcig_prtl", 4.1, false, true, true, true, 1, true);
				}
			}
		}
	}
    return 1;
}

forward SmokeCigar(playerid);
public SmokeCigar(playerid)
{
    SetPlayerAttachedObject(playerid, 7, 18677, 2, -0.028, 0.160, -1.640, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
    
    CountSmoking[playerid] --;
    AccountData[playerid][pStress] -= 5;
    SmokingDelayTime[playerid] = 0;

    if(CountSmoking[playerid] == 0)
    {
        IsPlayerSmoking[playerid] = false;
        CountSmoking[playerid] = 0;
        SendClientMessage(playerid, -1, "[i] Rokok anda telah habis sebatang. Stress anda menurun "RED"5%%");
    }
    return 1;
}

forward StartVape(playerid);
public StartVape(playerid)
{
	if(!IsPlayerConnected(playerid)) return 0;
	if(!AccountData[playerid][pIsSmoking]) return 0;
	if(!AccountData[playerid][pIsSmokeBlowing]) return 0;

    if(pIsVaping[playerid])
    {
        SetPlayerAttachedObject(playerid, 9, 18716, 2, 0.074000, -1.191000, 0.026997, -97.299995, 7.100001, 73.799980, 1.000000, 1.000000, 1.000000);
        SetTimerEx("EndVape", 4255, false, "i", playerid);
    }
    else
    {
	    SetPlayerAttachedObject(playerid, 8, 18677, 2, 0.000000, 0.165999, -1.623000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000);
	    SetTimerEx("EndVape", 3600, false, "i", playerid);
    }
	return 1;
}
forward EndVape(playerid);
public EndVape(playerid)
{
	if(!IsPlayerConnected(playerid)) return 0;
	if(!AccountData[playerid][pIsSmoking]) return 0;
	if(!AccountData[playerid][pIsSmokeBlowing]) return 0;

    AccountData[playerid][pStress] --;
    
	if(AccountData[playerid][pSmokedTimes] >= 6)
	{
        if(pIsVaping[playerid])
            RemovePlayerAttachedObject(playerid, 8);

		AccountData[playerid][pSmokedTimes] = 0;
		AccountData[playerid][pIsSmoking] = false;
        //AccountData[playerid][pUsingJoint] = false;
		//ShowTDN(playerid, NOTIFICATION_WARNING, "vape anda telah habis sebatang.");
	}
	AccountData[playerid][pIsSmokeBlowing] = false;

    if(pIsVaping[playerid])
    {
        RemovePlayerAttachedObject(playerid, 9);
    }
    else
    {
        RemovePlayerAttachedObject(playerid, 8);
    }
    ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.1, false, false, false, false, 0, true);
	ClearAnimations(playerid, true);
	return 1;
}