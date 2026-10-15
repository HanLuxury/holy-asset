// All Callbacks
JavaTR: DisplayFactionMemberList(playerid, pageindex)
{
    new onlineCount = 0, totalMembers = 0, string[2000];

    totalMembers = cache_num_rows();

    if (totalMembers == 0)
    {
        ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada member yang ditemukan!");
        return 1;
    }

    new FactName[MAX_PLAYER_NAME], FactRank, FactOnline, FactLastLogged[64], col[24];

    strcat(string, "Nama\tRank\tStatus\tLast Login\n");
    for (new i, x = cache_num_rows(); i < x; i ++)
    {
        cache_get_value_name(i, "Char_Name", FactName);
        cache_get_value_name_int(i, "Char_FactionRank", FactRank);
        cache_get_value_name_int(i, "Char_Online", FactOnline);
        cache_get_value_name(i, "Char_LastLogin", FactLastLogged);

        if (FactOnline == 1) 
        {
            format(col, sizeof(col), ""GREEN"(Online)");
            onlineCount ++;
        }
        else format(col, sizeof(col), ""RED"(Offline)");

        new sub[200];
        format(sub, sizeof(sub), "%s\t"WHITE"%s\t%s"WHITE"\t"YELLOW"%s\n", FactName, GetFactRank(MemberBrowsing[playerid], FactRank), col, FactLastLogged);
        strcat(string, sub);
    }

    if (MemberListIndex[playerid] > 0) strcat(string, ""RED"< Halaman Sebelumnya");
    if (totalMembers >= 20) strcat(string, "\n"GREEN"> Halaman Selanjutnya");

    mysql_tquery(g_SQL, sprintf("SELECT `pID` FROM `player_characters` WHERE `Char_Faction` = %i", MemberBrowsing[playerid]), "GetTotalFactionMemberCount", "isi", playerid, string, onlineCount);
    return 1;
}

JavaTR: GetTotalFactionMemberCount(playerid, string[], onlineCount)
{
    new sha[300];
    format(sha, sizeof(sha), "Anggota di %s "WHITE"(%i/%i Online)", FactName[MemberBrowsing[playerid]], onlineCount, cache_num_rows());
    Dialog_Show(playerid, FactionMemberList, DIALOG_STYLE_TABLIST_HEADERS, sha, string, "Kelola", "Tutup");
    return 1;
}

Dialog:FactionMemberList(playerid, response, listitem, inputtext[])
{
    if (!response) return 1;

    if(strcmp(inputtext, "> Halaman Selanjutnya", inputtext, true) == 0)
    {
        MemberListIndex[playerid] ++;
        new string[150];

        mysql_format(string, sizeof(string), "SELECT Char_Online, Char_Name, Char_FactionRank, Char_LastLogin FROM player_characters WHERE Char_Faction = %i ORDER BY Char_FactionRank DESC LIMIT 20 OFFSET %i", MemberBrowsing[playerid], MemberListIndex[playerid] * 20);
        mysql_tquery(g_SQL, string, "DisplayFactionMemberList", "dd", playerid, MemberListIndex[playerid]);
    }
    if(strcmp(inputtext, "< Halaman Sebelumnya", inputtext, true) == 0)
    {
        MemberListIndex[playerid] --;
        new string[150];

        mysql_format(string, sizeof(string), "SELECT Char_Online, Char_Name, Char_FactionRank, Char_LastLogin FROM player_characters WHERE Char_Faction = %i ORDER BY Char_FactionRank DESC LIMIT 20 OFFSET %i", MemberBrowsing[playerid], MemberListIndex[playerid] * 20);
        mysql_tquery(g_SQL, string, "DisplayFactionMemberList", "dd", playerid, MemberListIndex[playerid]);
    }
    else
    {
        new playerName[MAX_PLAYER_NAME], sha[400];

        format(playerName, MAX_PLAYER_NAME, inputtext);
        MemberNameForAction[playerid] = playerName;
        format(sha, sizeof(sha), ""ALTHF"EAGLE Roleplay "WHITE"- Kelola "YELLOW"%s", playerName);
        Dialog_Show(playerid, FactionMemberListAction, DIALOG_STYLE_LIST, sha, 
        "Promote\
        \n"GRAY"Demote\
        \nKick", "Pilih", "Batal");
    }
    return 1;
}

stock Promote(playerid, params[])
{
    if (!AccountData[playerid][IsLoggedIn]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda belum login!");
    if (AccountData[playerid][pFaction] == FACTION_NONE) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tiak bergabung di Faction manapun!");
}