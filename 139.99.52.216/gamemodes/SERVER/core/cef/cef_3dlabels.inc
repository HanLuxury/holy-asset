/* =====================================================================
   EAGLE ROLEPLAY - CEF3D dynamic 3D text label compatibility layer
   ---------------------------------------------------------------------
   Replaces Create/Update/DestroyDynamic3DTextLabel visually with CEF3D
   while keeping an invisible streamer label as the compatibility backend.

   Why keep the streamer item?
   - existing code still receives a valid STREAMER_TAG_3D_TEXT_LABEL id
   - Streamer_GetAllVisibleItems still handles draw distance / world / interior
   - existing interaction code can still read the original text and position
   - player / vehicle attached labels continue to be tracked by streamer

   Client extensions used by this include:
     RPC 115 -> CEF3D destroy
     RPC 116 -> CEF3D world-WebView label text
     RPC 117 -> CEF3D world-anchor move
   ===================================================================== */
#if defined _EAGLE_CEF3D_LABELS_INCLUDED
    #endinput
#endif
#define _EAGLE_CEF3D_LABELS_INCLUDED

#include <YSI_Coding/y_hooks>

#define CEF3DL_MAX_LABELS              (1024)
#define CEF3DL_MAX_VISIBLE             (20)
#define CEF3DL_VISIBLE_SCAN            (96)
#define CEF3DL_TEXT_MAX                (384)
#define CEF3DL_OBJECT_BASE             (50000)
#define CEF3DL_STREAM_TICK_MS          (220)
#define CEF3DL_BACKEND_TEXT            " "
#define CEF3DL_BACKEND_COLOR           (0x00000000)
#define CEF3DL_DEDUPE_DIST_SQ          (0.0900) /* 0.30m radius: suppress true duplicates */

static bool:gCEF3DLUsed[CEF3DL_MAX_LABELS];
static STREAMER_TAG_3D_TEXT_LABEL:gCEF3DLStreamerId[CEF3DL_MAX_LABELS];
static gCEF3DLColor[CEF3DL_MAX_LABELS];
static gCEF3DLText[CEF3DL_MAX_LABELS][CEF3DL_TEXT_MAX];
static gCEF3DLVersion[CEF3DL_MAX_LABELS];

static gCEF3DLActiveSlot[MAX_PLAYERS][CEF3DL_MAX_VISIBLE];
static gCEF3DLActiveVersion[MAX_PLAYERS][CEF3DL_MAX_VISIBLE];
static Float:gCEF3DLActiveX[MAX_PLAYERS][CEF3DL_MAX_VISIBLE];
static Float:gCEF3DLActiveY[MAX_PLAYERS][CEF3DL_MAX_VISIBLE];
static Float:gCEF3DLActiveZ[MAX_PLAYERS][CEF3DL_MAX_VISIBLE];

static stock CEF3DL_ObjectId(slot)
{
    return CEF3DL_OBJECT_BASE + slot;
}

static stock CEF3DL_FindByStreamerId(STREAMER_TAG_3D_TEXT_LABEL:id)
{
    for (new i = 0; i < CEF3DL_MAX_LABELS; i++)
    {
        if (gCEF3DLUsed[i] && gCEF3DLStreamerId[i] == id)
            return i;
    }
    return -1;
}

static stock CEF3DL_FindFreeSlot()
{
    for (new i = 0; i < CEF3DL_MAX_LABELS; i++)
    {
        if (!gCEF3DLUsed[i])
            return i;
    }
    return -1;
}

static stock bool:CEF3DL_HasVisibleText(const text[])
{
    new bool:insideColor = false;

    for (new i = 0, c; (c = text[i]) != EOS; i++)
    {
        if (c == '{') { insideColor = true; continue; }
        if (insideColor)
        {
            if (c == '}') insideColor = false;
            continue;
        }

        if (c == ' ' || c == '\n' || c == '\r' || c == '\t')
            continue;

        if (c == '~' && text[i + 1] == 'n' && text[i + 2] == '~')
        {
            i += 2;
            continue;
        }

        return true;
    }
    return false;
}

static stock CEF3DL_ResetPlayer(playerid)
{
    for (new i = 0; i < CEF3DL_MAX_VISIBLE; i++)
    {
        gCEF3DLActiveSlot[playerid][i] = -1;
        gCEF3DLActiveVersion[playerid][i] = -1;
        gCEF3DLActiveX[playerid][i] = 0.0;
        gCEF3DLActiveY[playerid][i] = 0.0;
        gCEF3DLActiveZ[playerid][i] = 0.0;
    }
    return 1;
}

static stock CEF3DL_FindActiveIndex(playerid, slot)
{
    for (new i = 0; i < CEF3DL_MAX_VISIBLE; i++)
    {
        if (gCEF3DLActiveSlot[playerid][i] == slot)
            return i;
    }
    return -1;
}

static stock CEF3DL_FindFreeActiveIndex(playerid)
{
    for (new i = 0; i < CEF3DL_MAX_VISIBLE; i++)
    {
        if (gCEF3DLActiveSlot[playerid][i] == -1)
            return i;
    }
    return -1;
}

static stock bool:CEF3DL_GetPos(slot, &Float:x, &Float:y, &Float:z)
{
    if (!(0 <= slot < CEF3DL_MAX_LABELS) || !gCEF3DLUsed[slot])
        return false;

    return Streamer_GetItemPos(
        STREAMER_TYPE_3D_TEXT_LABEL,
        gCEF3DLStreamerId[slot],
        x, y, z
    ) != 0;
}

static stock Float:CEF3DL_DistanceSq(playerid, Float:x, Float:y, Float:z)
{
    new Float:px, Float:py, Float:pz;
    GetPlayerPos(playerid, px, py, pz);

    px -= x;
    py -= y;
    pz -= z;
    return px * px + py * py + pz * pz;
}

static stock CEF3DL_HideAt(playerid, activeIndex)
{
    if (!(0 <= activeIndex < CEF3DL_MAX_VISIBLE))
        return 0;

    new slot = gCEF3DLActiveSlot[playerid][activeIndex];
    if (slot >= 0)
        CEF3D_DestroyObject(playerid, CEF3DL_ObjectId(slot));

    gCEF3DLActiveSlot[playerid][activeIndex] = -1;
    gCEF3DLActiveVersion[playerid][activeIndex] = -1;
    gCEF3DLActiveX[playerid][activeIndex] = 0.0;
    gCEF3DLActiveY[playerid][activeIndex] = 0.0;
    gCEF3DLActiveZ[playerid][activeIndex] = 0.0;
    return 1;
}

static stock CEF3DL_ShowAt(playerid, slot, activeIndex, Float:x, Float:y, Float:z)
{
    if (!(0 <= slot < CEF3DL_MAX_LABELS) || !gCEF3DLUsed[slot])
        return 0;
    if (!(0 <= activeIndex < CEF3DL_MAX_VISIBLE))
        return 0;

    new objectid = CEF3DL_ObjectId(slot);

    /* Kill a stale object first. This is important when a slot is reused or
       a previous stream-out packet was lost: one label ID must map to exactly
       one CEF3D object at exactly the current streamer coordinates. */
    CEF3D_DestroyObject(playerid, objectid);

    if (!CEF3D_CreateWorld(playerid, objectid, x, y, z, 1.0))
        return 0;

    /* Bridge-only: no GTA object/model exists. RPC 116 only sends the label
       data to the hosted HTML WebView anchored at this world coordinate. */
    CEF3D_SetLabel(playerid, objectid, gCEF3DLText[slot], gCEF3DLColor[slot]);
    CEF3D_Show(playerid, objectid);
    CEF3D_SetFocus(playerid, objectid, true);

    gCEF3DLActiveSlot[playerid][activeIndex] = slot;
    gCEF3DLActiveVersion[playerid][activeIndex] = gCEF3DLVersion[slot];
    gCEF3DLActiveX[playerid][activeIndex] = x;
    gCEF3DLActiveY[playerid][activeIndex] = y;
    gCEF3DLActiveZ[playerid][activeIndex] = z;
    return 1;
}

static stock CEF3DL_UpdateActive(playerid, activeIndex, slot, Float:x, Float:y, Float:z)
{
    if (!(0 <= activeIndex < CEF3DL_MAX_VISIBLE))
        return 0;
    if (!(0 <= slot < CEF3DL_MAX_LABELS) || !gCEF3DLUsed[slot])
        return 0;

    new objectid = CEF3DL_ObjectId(slot);

    if (floatabs(gCEF3DLActiveX[playerid][activeIndex] - x) > 0.025 ||
        floatabs(gCEF3DLActiveY[playerid][activeIndex] - y) > 0.025 ||
        floatabs(gCEF3DLActiveZ[playerid][activeIndex] - z) > 0.025)
    {
        CEF3D_MoveObject(playerid, objectid, x, y, z);
        gCEF3DLActiveX[playerid][activeIndex] = x;
        gCEF3DLActiveY[playerid][activeIndex] = y;
        gCEF3DLActiveZ[playerid][activeIndex] = z;
    }

    if (gCEF3DLActiveVersion[playerid][activeIndex] != gCEF3DLVersion[slot])
    {
        CEF3D_SetLabel(playerid, objectid, gCEF3DLText[slot], gCEF3DLColor[slot]);
        gCEF3DLActiveVersion[playerid][activeIndex] = gCEF3DLVersion[slot];
    }
    return 1;
}

forward CEF3DL_StreamTick();
public CEF3DL_StreamTick()
{
    new raw[CEF3DL_VISIBLE_SCAN];
    new desiredSlot[CEF3DL_MAX_VISIBLE];
    new Float:desiredDist[CEF3DL_MAX_VISIBLE];
    new Float:desiredX[CEF3DL_MAX_VISIBLE];
    new Float:desiredY[CEF3DL_MAX_VISIBLE];
    new Float:desiredZ[CEF3DL_MAX_VISIBLE];

    for (new playerid = 0; playerid < MAX_PLAYERS; playerid++)
    {
        if (!IsPlayerConnected(playerid))
            continue;

        for (new i = 0; i < CEF3DL_MAX_VISIBLE; i++)
        {
            desiredSlot[i] = -1;
            desiredDist[i] = 999999999.0;
            desiredX[i] = desiredY[i] = desiredZ[i] = 0.0;
        }

        new count = Streamer_GetAllVisibleItems(
            playerid,
            STREAMER_TYPE_3D_TEXT_LABEL,
            raw,
            sizeof(raw)
        );

        if (count > sizeof(raw)) count = sizeof(raw);

        /* Keep the nearest N labels only. This prevents dozens of hidden
           WebViews / textures in dense areas. */
        for (new n = 0; n < count; n++)
        {
            new STREAMER_TAG_3D_TEXT_LABEL:tid = STREAMER_TAG_3D_TEXT_LABEL:raw[n];
            new slot = CEF3DL_FindByStreamerId(tid);
            if (slot < 0 || !gCEF3DLUsed[slot])
                continue;
            if (!CEF3DL_HasVisibleText(gCEF3DLText[slot]))
                continue;

            new Float:x, Float:y, Float:z;
            if (!CEF3DL_GetPos(slot, x, y, z))
                continue;

            new Float:dist = CEF3DL_DistanceSq(playerid, x, y, z);

            /* Two different dynamic systems sometimes create labels at the same
               (or almost the same) point. Rendering both as large CEF cards makes
               them overlap. Keep only the nearest representative inside 30 cm. */
            new duplicate = -1;
            for (new q = 0; q < CEF3DL_MAX_VISIBLE; q++)
            {
                if (desiredSlot[q] < 0) continue;
                new Float:dx = x - desiredX[q];
                new Float:dy = y - desiredY[q];
                new Float:dz = z - desiredZ[q];
                if ((dx * dx + dy * dy + dz * dz) <= CEF3DL_DEDUPE_DIST_SQ)
                {
                    duplicate = q;
                    break;
                }
            }

            if (duplicate != -1)
            {
                if (dist < desiredDist[duplicate])
                {
                    desiredSlot[duplicate] = slot;
                    desiredDist[duplicate] = dist;
                    desiredX[duplicate] = x;
                    desiredY[duplicate] = y;
                    desiredZ[duplicate] = z;
                }
                continue;
            }

            new insert = -1;
            for (new d = 0; d < CEF3DL_MAX_VISIBLE; d++)
            {
                if (dist < desiredDist[d])
                {
                    insert = d;
                    break;
                }
            }
            if (insert == -1)
                continue;

            for (new d = CEF3DL_MAX_VISIBLE - 1; d > insert; d--)
            {
                desiredSlot[d] = desiredSlot[d - 1];
                desiredDist[d] = desiredDist[d - 1];
                desiredX[d] = desiredX[d - 1];
                desiredY[d] = desiredY[d - 1];
                desiredZ[d] = desiredZ[d - 1];
            }

            desiredSlot[insert] = slot;
            desiredDist[insert] = dist;
            desiredX[insert] = x;
            desiredY[insert] = y;
            desiredZ[insert] = z;
        }

        /* Remove labels no longer streamed by Incognito streamer. */
        for (new a = 0; a < CEF3DL_MAX_VISIBLE; a++)
        {
            new activeSlot = gCEF3DLActiveSlot[playerid][a];
            if (activeSlot < 0)
                continue;

            new bool:keep = false;
            for (new d = 0; d < CEF3DL_MAX_VISIBLE; d++)
            {
                if (desiredSlot[d] == activeSlot)
                {
                    keep = true;
                    break;
                }
            }

            if (!keep)
                CEF3DL_HideAt(playerid, a);
        }

        /* Create / update desired labels. */
        for (new d = 0; d < CEF3DL_MAX_VISIBLE; d++)
        {
            new slot = desiredSlot[d];
            if (slot < 0)
                break;

            new activeIndex = CEF3DL_FindActiveIndex(playerid, slot);
            if (activeIndex == -1)
            {
                activeIndex = CEF3DL_FindFreeActiveIndex(playerid);
                if (activeIndex != -1)
                    CEF3DL_ShowAt(playerid, slot, activeIndex, desiredX[d], desiredY[d], desiredZ[d]);
            }
            else
            {
                CEF3DL_UpdateActive(playerid, activeIndex, slot, desiredX[d], desiredY[d], desiredZ[d]);
            }
        }
    }
    return 1;
}

hook OnGameModeInit()
{
    for (new p = 0; p < MAX_PLAYERS; p++)
        CEF3DL_ResetPlayer(p);

    SetTimer("CEF3DL_StreamTick", CEF3DL_STREAM_TICK_MS, true);
    return 1;
}

hook OnPlayerConnect(playerid)
{
    CEF3DL_ResetPlayer(playerid);
    return 1;
}

hook OnPlayerDisconnect(playerid, reason)
{
    #pragma unused reason
    CEF3DL_ResetPlayer(playerid);
    return 1;
}


/* Used by the pickup overlay to avoid stacking a pickup card on top of an
   existing dynamic-text CEF3D at the same world point. Streamer visibility
   already accounts for world/interior/player restrictions. */
stock bool:CEF3DL_PlayerHasLabelNear(playerid, Float:x, Float:y, Float:z, Float:radius = 0.65)
{
    if (!IsPlayerConnected(playerid)) return false;

    new raw[CEF3DL_VISIBLE_SCAN];
    new count = Streamer_GetAllVisibleItems(
        playerid,
        STREAMER_TYPE_3D_TEXT_LABEL,
        raw,
        sizeof(raw)
    );
    if (count > sizeof(raw)) count = sizeof(raw);

    new Float:r2 = radius * radius;
    for (new i = 0; i < count; i++)
    {
        new STREAMER_TAG_3D_TEXT_LABEL:tid = STREAMER_TAG_3D_TEXT_LABEL:raw[i];
        new slot = CEF3DL_FindByStreamerId(tid);
        if (slot < 0 || !gCEF3DLUsed[slot]) continue;
        if (!CEF3DL_HasVisibleText(gCEF3DLText[slot])) continue;

        new Float:lx, Float:ly, Float:lz;
        if (!CEF3DL_GetPos(slot, lx, ly, lz)) continue;
        new Float:dx = lx - x;
        new Float:dy = ly - y;
        new Float:dz = lz - z;
        if ((dx * dx + dy * dy + dz * dz) <= r2)
            return true;
    }
    return false;
}

/* =====================================================================
   Compatibility wrappers. These call the ORIGINAL streamer natives here.
   The macro aliases are defined only after these function bodies.
   ===================================================================== */
stock STREAMER_TAG_3D_TEXT_LABEL:CEF3DL_Create(
    const text[],
    color,
    Float:x,
    Float:y,
    Float:z,
    Float:drawdistance,
    attachedplayer = INVALID_PLAYER_ID,
    attachedvehicle = INVALID_VEHICLE_ID,
    testlos = 0,
    worldid = -1,
    interiorid = -1,
    playerid = -1,
    Float:streamdistance = 200.0,
    areaid = -1,
    priority = 0
)
{
    new slot = CEF3DL_FindFreeSlot();
    if (slot < 0)
        return STREAMER_TAG_3D_TEXT_LABEL:INVALID_STREAMER_ID;

    /* The Incognito item is only a compatibility/streaming handle. It must
       never draw a second GTA text label behind the CEF3D representation. */
    new STREAMER_TAG_3D_TEXT_LABEL:id = CreateDynamic3DTextLabel(
        CEF3DL_BACKEND_TEXT,
        CEF3DL_BACKEND_COLOR,
        x, y, z,
        drawdistance,
        attachedplayer,
        attachedvehicle,
        testlos,
        worldid,
        interiorid,
        playerid,
        streamdistance,
        areaid,
        priority
    );

    if (id == STREAMER_TAG_3D_TEXT_LABEL:INVALID_STREAMER_ID)
        return id;

    gCEF3DLUsed[slot] = true;
    gCEF3DLStreamerId[slot] = id;
    gCEF3DLColor[slot] = color;
    format(gCEF3DLText[slot], CEF3DL_TEXT_MAX, "%s", text);
    gCEF3DLVersion[slot] = 1;
    return id;
}

stock CEF3DL_Update(
    STREAMER_TAG_3D_TEXT_LABEL:id,
    color,
    const text[]
)
{
    new slot = CEF3DL_FindByStreamerId(id);

    if (slot < 0)
        return UpdateDynamic3DTextLabelText(id, color, text);

    new result = UpdateDynamic3DTextLabelText(id, CEF3DL_BACKEND_COLOR, CEF3DL_BACKEND_TEXT);
    if (!result)
        return result;

    gCEF3DLColor[slot] = color;
    format(gCEF3DLText[slot], CEF3DL_TEXT_MAX, "%s", text);
    gCEF3DLVersion[slot]++;
    if (gCEF3DLVersion[slot] <= 0) gCEF3DLVersion[slot] = 1;
    return result;
}

stock CEF3DL_GetText(
    STREAMER_TAG_3D_TEXT_LABEL:id,
    output[],
    size = sizeof(output)
)
{
    if (size <= 0) return 0;

    new slot = CEF3DL_FindByStreamerId(id);
    if (slot < 0)
        return GetDynamic3DTextLabelText(id, output, size);

    format(output, size, "%s", gCEF3DLText[slot]);
    return 1;
}

/* Called by cef.inc before the public OnPlayerCEF3DEvent callback. */
forward OnPlayerCEF3DInternalEvent(playerid, objectid, const event[], const data[]);
public OnPlayerCEF3DInternalEvent(playerid, objectid, const event[], const data[])
{
    #pragma unused data

    if (strcmp(event, "label_click", true) != 0)
        return 1;

    new slot = objectid - CEF3DL_OBJECT_BASE;
    if (!(0 <= slot < CEF3DL_MAX_LABELS) || !gCEF3DLUsed[slot])
        return 1;

    new STREAMER_TAG_3D_TEXT_LABEL:labelid = gCEF3DLStreamerId[slot];

    /* cef_interact.inc knows the old F/H/etc interaction routes. When it is
       present, tapping the 3D card triggers the same gameplay action as the
       legacy key, so existing systems do not need to be rewritten. */
    new routed = CallLocalFunction(
        "Eagle_CEF3DLabelActivate",
        "ii",
        playerid,
        _:labelid
    );

    /* Optional custom callback for systems that want a label-specific click. */
    CallLocalFunction(
        "OnPlayerClickDynamic3DTextLabel",
        "ii",
        playerid,
        _:labelid
    );

    #pragma unused routed
    return 1;
}

stock CEF3DL_Destroy(STREAMER_TAG_3D_TEXT_LABEL:id)
{
    new slot = CEF3DL_FindByStreamerId(id);

    if (slot >= 0)
    {
        for (new p = 0; p < MAX_PLAYERS; p++)
        {
            if (!IsPlayerConnected(p))
                continue;

            new activeIndex = CEF3DL_FindActiveIndex(p, slot);
            if (activeIndex != -1)
                CEF3DL_HideAt(p, activeIndex);
        }

        gCEF3DLUsed[slot] = false;
        gCEF3DLStreamerId[slot] = STREAMER_TAG_3D_TEXT_LABEL:INVALID_STREAMER_ID;
        gCEF3DLColor[slot] = 0;
        gCEF3DLText[slot][0] = EOS;
        gCEF3DLVersion[slot] = 0;
    }

    return DestroyDynamic3DTextLabel(id);
}

/* Every Create/Update/Destroy call included after this file automatically
   goes through the CEF3D compatibility layer. */
#define CreateDynamic3DTextLabel       CEF3DL_Create
#define UpdateDynamic3DTextLabelText   CEF3DL_Update
#define GetDynamic3DTextLabelText      CEF3DL_GetText
#define DestroyDynamic3DTextLabel      CEF3DL_Destroy
