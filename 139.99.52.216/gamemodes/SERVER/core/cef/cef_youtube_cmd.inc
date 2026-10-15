/*
 * EAGLE CEF3D YouTube command
 * /youtube [youtube_video_id]
 *
 * Creates/updates a client-side CEF3D screen in front of the player.
 */
#if defined _EAGLE_CEF3D_YOUTUBE_CMD
    #endinput
#endif
#define _EAGLE_CEF3D_YOUTUBE_CMD

#define EAGLE_YT_OBJECT_BASE (30000)
#define EAGLE_YT_MODEL       (19174)

stock EagleYT_IsValidID(const videoId[])
{
    new len = strlen(videoId);
    if (len < 6 || len > 32) return 0;

    for (new i = 0; i < len; i++)
    {
        new c = videoId[i];
        if (!((c >= 'A' && c <= 'Z') ||
              (c >= 'a' && c <= 'z') ||
              (c >= '0' && c <= '9') ||
              c == '-' || c == '_'))
            return 0;
    }
    return 1;
}


CMD:youtube(playerid, params[])
{
    new videoId[64];
    new Float:x, Float:y, Float:z, Float:a;
    new objectid = EAGLE_YT_OBJECT_BASE + playerid;

    if (strlen(params) == 0)
    {
        SendClientMessage(playerid, -1, "Gunakan: /youtube [youtube_video_id]");
        SendClientMessage(playerid, -1, "Contoh: /youtube M7lc1UVf-VE");
        return 1;
    }

    format(videoId, sizeof(videoId), "%s", params);

    /* Validate locally so this command does not depend on any helper in cef.inc. */
    if (!EagleYT_IsValidID(videoId))
    {
        SendClientMessage(playerid, -1, "Video ID YouTube tidak valid. Gunakan ID seperti M7lc1UVf-VE.");
        return 1;
    }

    GetPlayerPos(playerid, x, y, z);
    GetPlayerFacingAngle(playerid, a);

    /* Put the screen about 3m in front of the player. */
    x += floatsin(a, degrees) * 3.0;
    y += floatcos(a, degrees) * 3.0;
    z += 1.0;

    if (!CEF3D_CreateObject(playerid, objectid, EAGLE_YT_MODEL, x, y, z, 1.0))
    {
        SendClientMessage(playerid, -1, "CEF3D gagal mengirim object ke client.");
        return 1;
    }

    if (!CEF3D_PlayYouTube(playerid, objectid, videoId))
    {
        SendClientMessage(playerid, -1, "CEF3D gagal memuat YouTube. Periksa client CEF3D.");
        return 1;
    }

    SendClientMessage(playerid, -1, "CEF3D YouTube: video sedang dimuat.");
    return 1;
}
