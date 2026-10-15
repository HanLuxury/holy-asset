#if defined DiscordMode

#define ONLINE_COLOR   0x57F287   // hijau
#define OFFLINE_COLOR  0xED4245   // merah

new 
	DCC_Channel:AdminChangeName,
	DCC_Channel:YellowPageLogs,
	DCC_Channel:BannedLog,
	DCC_Channel:JailLog,
	DCC_Channel:CheatLog,
	DCC_Channel:JoinLeaveLog,
    DCC_Channel:DeathLog,
    DCC_Channel:AnnounceChannel,
    DCC_Channel:PayLog,
    DCC_Channel:TransferLog,
    DCC_Channel:WarnLog,
    DCC_Channel:KomaLog
;

DiscordInit(){
	AdminChangeName = DCC_FindChannelById("1430647645432447068");
	YellowPageLogs = DCC_FindChannelById("1430646779292029009");
	BannedLog = DCC_FindChannelById("1430647413751676999");
	JailLog = DCC_FindChannelById("1430647371968155699");
	CheatLog = DCC_FindChannelById("1430647783181910268");
	JoinLeaveLog = DCC_FindChannelById("1430646329188683896");
    DeathLog = DCC_FindChannelById("1430647699241435277");
    AnnounceChannel = DCC_FindChannelById("1430657847888318736");
    PayLog = DCC_FindChannelById("1430646976537690283");
    TransferLog = DCC_FindChannelById("1430647090513580102");
    WarnLog = DCC_FindChannelById("1430647244578750605");
    KomaLog = DCC_FindChannelById("1430647502234976538");
}
#endif

stock SendChangeNameLog(adminName[], oldname[], newname[])
{
    #if defined DiscordMode
    new DCC_Embed:embed = DCC_CreateEmbed("NONRP LOGS ❗", "", "", "", 0xFF0000);

    new buffer[256];
    format(buffer, sizeof(buffer), "```Name Admin : %s\nOldname    : %s\nNewname    : %s```", adminName, oldname, newname);
    DCC_AddEmbedField(embed, "ChangeName Logs", buffer, false);

    DCC_SendChannelEmbedMessage(AdminChangeName, embed);
    #endif
    return 1;
}

stock SendAdsLog(playerid, const adsText[])
{
    #if defined DiscordMode
    new DCC_Embed:embed = DCC_CreateEmbed();

    // Title & warna
    DCC_SetEmbedTitle(embed, "ADS LOGS ✖️");
    DCC_SetEmbedColor(embed, 0x00FFCC); // hijau kebiruan

    // Format isi logs
    new dContent[256];
    format(dContent, sizeof(dContent),
        "```\n\
        ID : %d\n\
        Name UCP : %s\n\
        Name IC : %s\n\
        ADS : %s\n\
        ```",
        playerid,
        AccountData[playerid][pUCP],   // ubah sesuai variabel UCP di GM lu
        AccountData[playerid][pName],  // ubah sesuai variabel Name IC
        adsText
    );

    // Set deskripsi & kirim
    DCC_SetEmbedDescription(embed, dContent);
    DCC_SendChannelEmbedMessage(YellowPageLogs, embed);
    #endif
    return 1;
}

stock SendBanLog(adminid, targetid, days, const reason[])
{
    #if defined DiscordMode
	new DCC_Embed:embed = DCC_CreateEmbed();

    // Title & warna
    DCC_SetEmbedTitle(embed, "BANNED LOGS ✖️");
    DCC_SetEmbedColor(embed, 0x00FFCC); // hijau kebiruan

    new adminName[MAX_PLAYER_NAME], targetName[MAX_PLAYER_NAME];
    GetPlayerName(adminid, adminName, sizeof(adminName));
    GetPlayerName(targetid, targetName, sizeof(targetName));

    // kalau days = 0 artinya permanent
    new msg[512];
    format(msg, sizeof(msg),
        "**BANNED LOGS ❗**\n\
        Name Admin   : %s\n\
        Banned Name  : %s\n\
        Day          : %d hari [%s]\n\
        Reason       : %s",
        adminName,
        targetName,
        days,
        days == 0 ? "Permanent" : "Temporary",
        reason
    );

    DCC_SetEmbedDescription(embed, msg);
    DCC_SendChannelEmbedMessage(BannedLog, embed);
    #endif
    return 1;
}

stock SendJailLog(adminid, targetid, const reason[])
{
    #if defined DiscordMode
	new DCC_Embed:embed = DCC_CreateEmbed();

    // Title & warna
    DCC_SetEmbedTitle(embed, "JAIL LOGS 📄");
    DCC_SetEmbedColor(embed, 0x00FFCC); // hijau kebiruan

    new adminName[MAX_PLAYER_NAME], targetName[MAX_PLAYER_NAME];
    GetPlayerName(adminid, adminName, sizeof(adminName));
    GetPlayerName(targetid, targetName, sizeof(targetName));

    new content[400];
    format(content, sizeof(content),
        "Name Admin   : %s\n\
        Player Jail  : %s\n\
        Reason       : %s",
        adminName,
        targetName,
        reason
    );

    // Fungsi ini manggil ke sistem Discord Connector
	DCC_SetEmbedDescription(embed, content);
    DCC_SendChannelEmbedMessage(JailLog, embed);
    #endif
    return 1;
}

stock SendCheatLog(playerid, const cheatType[])
{
    #if defined DiscordMode
    
    new DCC_Embed:embed = DCC_CreateEmbed();

    // Title & warna
    DCC_SetEmbedTitle(embed, "CHEAT LOGS ⚠️");
    DCC_SetEmbedColor(embed, 0xFF0000); // merah

    // Format isi logs
    new dContent[256];
    format(dContent, sizeof(dContent),
		"```\n\
        ID : %d\n\
        Name UCP : %s\n\
        Name IC : %s\n\
        Cheat : %s\n\
        ```",
        playerid,
        AccountData[playerid][pUCP],   // ubah sesuai variabel UCP di GM lu
        AccountData[playerid][pName],  // ubah sesuai variabel Name IC
        cheatType
    );

    // Set deskripsi & kirim
    DCC_SetEmbedDescription(embed, dContent);
    DCC_SendChannelEmbedMessage(CheatLog, embed);
    #endif
    return 1;
}

// stock JoinLeaveLogs(playerid, type)
// {
// 	new DCC_Embed:embed = DCC_CreateEmbed();

// 	switch(type)
// 	{
// 		case 1:{
// 			// Title & warna
// 			DCC_SetEmbedTitle(embed, "JOIN LOGS");
// 			DCC_SetEmbedColor(embed, 0xFF0000); // merah

// 			// Format isi logs
// 			new dContent[256];
// 			format(dContent, sizeof(dContent),
// 				"```\n\
// 				ID : %d\n\
// 				Name UCP : %s\n\
// 				```",
// 				playerid,
// 				AccountData[playerid][pUCP],   // ubah sesuai variabel UCP di GM lu
// 			);
// 		}
// 		case 2:{
// 			// Title & warna
// 			DCC_SetEmbedTitle(embed, "LEAVE LOGS");
// 			DCC_SetEmbedColor(embed, 0xFF0000); // merah

// 			// Format isi logs
// 			new dContent[256];
// 			format(dContent, sizeof(dContent),
// 				"```\n\
// 				ID : %d\n\
// 				Name UCP : %s\n\
// 				```",
// 				playerid,
// 				AccountData[playerid][pUCP],   // ubah sesuai variabel UCP di GM lu
// 			);
// 		}
// 	}
	
// 	DCC_SetEmbedDescription(embed, dContent);
//     DCC_SendChannelEmbedMessage(JoinLeaveLog, embed);
// }

stock SendDeathLog(playerid, killerid, reason)
{
    #if defined DiscordMode

    new DCC_Embed:embed = DCC_CreateEmbed();

    // Title & warna
    DCC_SetEmbedTitle(embed, "DEATH LOGS 💀");
    DCC_SetEmbedColor(embed, 0xFF0000); // merah

    new killerName[MAX_PLAYER_NAME], victimName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, victimName, sizeof(victimName));

    if(killerid != INVALID_PLAYER_ID)
    {
        GetPlayerName(killerid, killerName, sizeof(killerName));
    }
    else
    {
        format(killerName, sizeof(killerName), "Suicide");
    }

    new msg[256];
    format(msg, sizeof(msg),
        "**DEATH LOGS 💀**\n\
        Pembunuh : %s [%d]\n\
        Terbunuh : %s [%d]\n\
        Reason   : %s",
        killerid == INVALID_PLAYER_ID ? "N/A" : killerName,
        killerid,
        victimName,
        playerid,
        ReturnWeaponName(reason)
    );

    DCC_SetEmbedDescription(embed, msg);
    DCC_SendChannelEmbedMessage(DeathLog, embed);
    #endif
    return 1;
}
#if defined DiscordMode
DCMD:online(playerid, params[])
{
    if(CheckAdmin(playerid, 7)) return PermissionError(playerid);

    SendServerOnline();
    SendClientMessage(playerid, -1, "✅ Kamu berhasil mengumumkan server ONLINE di Discord.");
    return 1;
}

DCMD:offline(playerid, params[])
{
    if(CheckAdmin(playerid, 7)) return PermissionError(playerid);

    SendServerOffline();
    SendClientMessage(playerid, -1, "⚠️ Kamu berhasil mengumumkan server OFFLINE di Discord.");
    return 1;
}

stock SendServerOnline()
{
    new DCC_Embed:embed = DCC_CreateEmbed(
        "🌟 SERVER TELAH KEMBALI ONLINE 🌟", 
        "Dengan bangga kami umumkan bahwa server telah kembali beroperasi secara normal dan siap digunakan.\nTerima kasih atas kesabaran dan dukungan Anda selama proses pemeliharaan berlangsung.", 
        "", "", ONLINE_COLOR
    );

    DCC_AddEmbedField(embed, "Status", "🟢 Server Online & Stabil", true);
    DCC_AddEmbedField(embed, "Informasi Tambahan", "🔧 Semua sistem telah dipulihkan dan berjalan sebagaimana mestinya.", false);
    DCC_SetEmbedImage(embed, "https://i.ibb.co/8m2KBgd/online.jpg");

    new DCC_Message:msg;
    DCC_SendChannelEmbedMessage(AnnounceChannel, embed);
    return 1;
}

stock SendServerOffline()
{
    new DCC_Embed:embed = DCC_CreateEmbed(
        "⚠️ GANGGUAN SERVER SEMENTARA ⚠️", 
        "Saat ini server mengalami gangguan teknis yang berdampak pada kestabilan layanan. Tim teknis kami sedang bekerja keras untuk segera menormalkan keadaan.", 
        "", "", OFFLINE_COLOR
    );

    DCC_AddEmbedField(embed, "Status", "🔴 Server Mengalami Gangguan (Badai Teknis)", true);
    DCC_AddEmbedField(embed, "Perkiraan Pemulihan", "⏳ Masih dalam penanganan — informasi terbaru akan diumumkan secepatnya.", false);
    DCC_SetEmbedImage(embed, "https://i.ibb.co/sWWh1P3/offline.jpg");

    new DCC_Message:msg;
    DCC_SendChannelEmbedMessage(AnnounceChannel, embed);
    return 1;
}
#endif

stock SendPayLog(giverid, receiverid, amount)
{
    #if defined DiscordMode
    // 1. Cek valid player
    if(!IsPlayerConnected(receiverid) || giverid == receiverid) return 0;
    if(amount <= 0) return 0;

    // 2. Cek uang cukup
    if(GetPlayerMoney(giverid) < amount) return 0;

    // 3. Transfer uang
    GivePlayerMoney(giverid, -amount);
    GivePlayerMoney(receiverid, amount);

    // 4. Ambil nama player
    new giverName[MAX_PLAYER_NAME], receiverName[MAX_PLAYER_NAME];
    GetPlayerName(giverid, giverName, sizeof(giverName));
    GetPlayerName(receiverid, receiverName, sizeof(receiverName));

    // 5. Kirim log ke Discord
    new msg[256];
    format(msg, sizeof(msg),
        "**PAYING LOGS 💰**\n\
        Pemberi   : %s [%d]\n\
        Penerima  : %s [%d]\n\
        Jumlah    : $%d",
        giverName, giverid,
        receiverName, receiverid,
        amount
    );
    DCC_SendChannelMessage(PayLog, msg);
    #endif
    // 6. Return sukses
    return 1;
}

stock SendTransferLog(giverid, const giverName[], targetAcc, amount[])
{
    #if defined DiscordMode
    new playerName[MAX_PLAYER_NAME];
    GetPlayerName(giverid, playerName, sizeof(playerName));

    new content[300];
    format(content, sizeof(content),
        "Pemberi        : %s [%d]\n\
        Norek Penerima : %d\n\
        Jumlah         : %s",
        playerName, giverid,
        targetAcc,
        amount
    );

    DCC_SendChannelMessage(TransferLog, content);
    #endif
    return 1;
}

stock SendPlayerKoma(playerid, reason[]){
    #if defined DiscordMode
    new DCC_Embed:embed = DCC_CreateEmbed("KOMA LOGS", "", "", "", 0xFF0000);
    DCC_SetEmbedTitle(embed, "KOMA/SEKARAT LOGS 💀");
    DCC_SetEmbedColor(embed, 0xFF0000); // merah

    new msg[256];
    format(msg, sizeof(msg),
        "*KOMA LOGS ☠️*\n\nID : %d\nName UCP : %s\nName IC : %s",
        playerid, AccountData[playerid][pUCP], ReturnName(playerid)
    );

    DCC_SetEmbedDescription(embed, msg);
    DCC_SendChannelEmbedMessage(KomaLog, embed);
    #endif
    return 1;
}