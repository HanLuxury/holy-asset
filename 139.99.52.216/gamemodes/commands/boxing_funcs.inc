#include <YSI/y_hooks>

new AreaIsFull = 0,
    BoxingInvite[MAX_PLAYERS] = { INVALID_PLAYER_ID, ... },
    BoxingOffer[MAX_PLAYERS] = { INVALID_PLAYER_ID, ... },
    BoxingPrice[MAX_PLAYERS] = { 0, ...},
    BoxingOfferTime[MAX_PLAYERS] = { 0, ... },
    bool: DurringBoxing[MAX_PLAYERS] = { false, ... };

hook OnGameModeInit()
{
    AreaIsFull = 0;
    return 1;
}

hook OnPlayerConnect(playerid)
{
    BoxingInvite[playerid] = INVALID_PLAYER_ID;
    BoxingOffer[playerid] = INVALID_PLAYER_ID;
    BoxingPrice[playerid] = 0;
    BoxingOfferTime[playerid] = 0;
    DurringBoxing[playerid] = false;
    return 1;
}

hook OnPlayerDisconnect(playerid, reason)
{
    if(DurringBoxing[playerid] && BoxingInvite[playerid] != INVALID_PLAYER_ID)
    {
        new targetid = BoxingInvite[playerid];
        SetPlayerSkin(targetid, AccountData[targetid][pSkin]);
        GiveMoney(targetid, BoxingPrice[playerid]);
        SetPlayerFightingStyle(targetid, FIGHT_STYLE_NORMAL);
        SetPlayerHealth(targetid, AccountData[targetid][pHealth]);
        SetPlayerArmour(targetid, AccountData[targetid][pArmour]);
        TogglePlayerControllable(targetid, 1);
        SetWeapons(targetid);
        foreach(new i : Player) if (IsPlayerConnected(i) && IsPlayerInRangeOfPoint(i, 100.0, 771.8782, -68.1927, 1000.6563))
        {
            GameTextForPlayer(i, sprintf("~r~%s Winner", ReturnName(targetid)), 3000, 6);
        }
        Info(targetid, "Lawan Boxing anda telah terputus dari server. anda mendapatkan uang kemenangannya "GREEN"%s", FormatMoney(BoxingPrice[playerid]));

        DurringBoxing[targetid] = false;
        BoxingPrice[targetid] = 0;
        BoxingOffer[targetid] = INVALID_PLAYER_ID;
        AreaIsFull = 0;
    }
    return 1;
}

CMD:inviteboxing(playerid, params[])
{
    if(!IsPlayerInRangeOfPoint(playerid, 100.0, 771.8782, -68.1927, 1000.6563)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus berada di area boxing!");
    if(AreaIsFull) return ShowTDN(playerid, NOTIFICATION_ERROR, "Sedang ada yang menggunakan arena, harap tunggu hingga selesai!");

    new otherid, price;
    if(sscanf(params, "ud", otherid, price)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/inviteboxing [name/playerid] [jumlah taruhan]");
    if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tesebut tidak terkoneksi ke server!");
    if(price < 1 || price > AccountData[playerid][pMoney]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Jumlah tidak valid atau lebih dari uang yang anda miliki!");
    if(BoxingOffer[otherid] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut telah mendapat ajakan dari pemain lain!");
    if(BoxingInvite[playerid] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sudah mengajak orang lain sebelumnya!");
    if(!IsPlayerNearPlayer(playerid, otherid, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus bearada didekat pemain tersebut!");

    BoxingInvite[playerid] = otherid;
    BoxingOffer[otherid] = playerid;
    BoxingPrice[playerid] = price;
    BoxingOfferTime[otherid] = gettime() + 120;
    SendCustomMessage(playerid, "BOXING", "Anda berhasil menginvite boxing pemain lain");
    SendCustomMessage(otherid, "BOXING", "Seseorang mengajak anda bertarung dengan taruhan sebesar "GREEN"%s"WHITE". Gunakan "YELLOW"'/accept boxing #%d'"WHITE" untuk menerima tawaran", FormatMoney(BoxingPrice[playerid]), playerid);
    return 1;
}

hook OnPlayerDeath(playerid, killerid, reason)
{
    if(BoxingInvite[playerid] == killerid && DurringBoxing[playerid])
    {
        new targetid = BoxingInvite[playerid];
        foreach(new i : Player) if (IsPlayerConnected(i) && IsPlayerInRangeOfPoint(i, 100.0, 771.8782, -68.1927, 1000.6563))
        {
            GameTextForPlayer(i, sprintf("~r~%s Winner", ReturnName(targetid)), 3000, 6);
        }

        SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
        SetPlayerSkin(targetid, AccountData[targetid][pSkin]);
        GiveMoney(targetid, BoxingPrice[playerid]);
        TakeMoney(playerid, BoxingPrice[playerid]);
        SetPlayerPositionEx(playerid, 767.5090, -77.7895, 1000.6563, 0.0, 2000);
        SetPlayerPositionEx(targetid, 763.0502, -77.4224, 1000.6563, 0.0, 2000);
        SetPlayerFightingStyle(playerid, FIGHT_STYLE_NORMAL);
        SetPlayerFightingStyle(targetid, FIGHT_STYLE_NORMAL);
        SetPlayerHealth(targetid, AccountData[targetid][pHealth]);
        SetPlayerArmour(targetid, AccountData[targetid][pArmour]);
        SetWeapons(playerid);
        SetWeapons(targetid);

        AccountData[playerid][pInjured] = false;
        AccountData[playerid][pInjuredTime] = 0;
        SetPlayerHealth(playerid, AccountData[playerid][pHealth]);
        SetPlayerArmour(playerid, AccountData[playerid][pArmour]);
        BoxingOffer[targetid] = INVALID_PLAYER_ID;
        BoxingInvite[targetid] = INVALID_PLAYER_ID;
        BoxingPrice[targetid] = 0;
        DurringBoxing[targetid] = false;
        BoxingOfferTime[targetid] = 0;

        BoxingInvite[playerid] = INVALID_PLAYER_ID;
        BoxingOffer[playerid] = INVALID_PLAYER_ID;
        BoxingPrice[playerid] = 0;
        DurringBoxing[playerid] = false;
        BoxingOfferTime[playerid] = 0;
        AreaIsFull = 0;
    }
    return 1;
}

ptask BoxingOfferUpdate[1000](playerid)
{
    if(BoxingOffer[playerid] != INVALID_PLAYER_ID && BoxingOfferTime[playerid] != 0)
    {
        if(BoxingOfferTime[playerid] <= gettime())
        {
            new offer = BoxingOffer[playerid];
            BoxingInvite[offer] = INVALID_PLAYER_ID;
            BoxingPrice[offer] = 0;
            Info(offer, "Pemain yang anda ajak untuk bertarung mengabaikan ajakan anda!");

            BoxingOffer[playerid] = INVALID_PLAYER_ID;
            BoxingOfferTime[playerid] = 0;
        }
    }
    return 1;
}