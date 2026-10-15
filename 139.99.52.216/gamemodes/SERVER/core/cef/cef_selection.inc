/* =====================================================================
    SERVER/core/cef/cef_selection.inc
    EAGLE ROLEPLAY - Pengganti include <selection> (eSelection, textdraw).
    ShowPlayerSelectionMenu(playerid, extraid, name[], items[], size)
      -> panel CEF "msel": grid model (skin & kendaraan bergambar,
         komponen modifikasi dengan nama), 24 per halaman seperti aslinya.
    Respon tetap lewat OnPlayerSelectionMenuResponse(playerid, extraid,
    response, listitem, modelid) sehingga kode lama tidak perlu diubah.
   ===================================================================== */
#if defined _eagle_cef_selection
    #endinput
#endif
#define _eagle_cef_selection

#include <YSI_Coding/y_hooks>

#if !defined MAX_SELECTION_MENU_ITEMS
    #define MAX_SELECTION_MENU_ITEMS    (312)
#endif
#define SELECTION_PER_PAGE              (24)

forward OnPlayerSelectionMenuResponse(playerid, extraid, response, listitem, modelid);

static bool:gSelOpen[MAX_PLAYERS];
static gSelExtra[MAX_PLAYERS];
static gSelPage[MAX_PLAYERS];
static gSelItems[MAX_PLAYERS];
static gSelList[MAX_PLAYERS][MAX_SELECTION_MENU_ITEMS];
static gSelTitle[MAX_PLAYERS][48];

static stock Sel_Render(playerid)
{
    new pages = (gSelItems[playerid] + SELECTION_PER_PAGE - 1) / SELECTION_PER_PAGE;
    if (pages < 1) pages = 1;
    if (gSelPage[playerid] >= pages) gSelPage[playerid] = pages - 1;
    if (gSelPage[playerid] < 0) gSelPage[playerid] = 0;

    new nav[32], label[48], img[16], sub[16], model;
    format(nav, sizeof(nav), "Halaman %d / %d", gSelPage[playerid] + 1, pages);

    P_Begin("msel", gSelTitle[playerid], "Pilih salah satu model", "grid", "c", 34);
    P_ListBegin("m", -1, "grid", 4, "pick");
    new start = gSelPage[playerid] * SELECTION_PER_PAGE;
    for (new i = start; i < gSelItems[playerid] && i < start + SELECTION_PER_PAGE; i++)
    {
        model = gSelList[playerid][i];
        img[0] = EOS;
        label[0] = EOS;
        if (0 <= model <= 311)
        {
            format(img, sizeof(img), "skin:%d", model);
            format(label, sizeof(label), "Skin %d", model);
        }
        else if (400 <= model <= 611)
        {
            format(img, sizeof(img), "veh:%d", model);
            format(label, sizeof(label), "Kendaraan %d", model);
        }
        else if (1000 <= model <= 1193)
        {
            GetComponentName(model, label, sizeof(label));
            if (!label[0]) format(label, sizeof(label), "Komponen %d", model);
        }
        else format(label, sizeof(label), "Model %d", model);

        format(sub, sizeof(sub), "ID %d", model);
        P_Item(label, sub, "", img[0] ? ("") : ("box"), img);
    }
    P_ListEnd();
    if (pages > 1) P_Nav(nav);
    return P_Send(playerid);
}

stock ShowPlayerSelectionMenu(playerid, extraid, const name[], const items[] = {-1}, size = sizeof(items))
{
    if (!IsPlayerConnected(playerid)) return false;
    if (size > MAX_SELECTION_MENU_ITEMS) return false;

    gSelOpen[playerid] = true;
    gSelExtra[playerid] = extraid;
    gSelPage[playerid] = 0;
    gSelItems[playerid] = 0;
    format(gSelTitle[playerid], 48, "%s", name);
    for (new i = 0; i < size; i++)
    {
        if (items[i] == -1) continue;
        gSelList[playerid][gSelItems[playerid]++] = items[i];
    }
    Sel_Render(playerid);
    return true;
}

stock HidePlayerSelectionMenu(playerid)
{
    if (!IsPlayerConnected(playerid) || !gSelOpen[playerid]) return false;
    gSelOpen[playerid] = false;
    gSelExtra[playerid] = -1;
    gSelPage[playerid] = 0;
    P_Close(playerid, "msel");
    return true;
}

/* Dipanggil router CEF (v = "msel") */
stock Sel_OnUI(playerid, const a[], index)
{
    if (!gSelOpen[playerid]) return P_Close(playerid, "msel");

    if (!strcmp(a, "close"))
    {
        if (funcidx("OnPlayerSelectionMenuResponse") == -1 || CallLocalFunction("OnPlayerSelectionMenuResponse", "iiiii", playerid, gSelExtra[playerid], 0, -1, -1))
            HidePlayerSelectionMenu(playerid);
        return 1;
    }
    if (!strcmp(a, "prev"))
    {
        if (gSelPage[playerid] > 0)
        {
            gSelPage[playerid]--;
            Sel_Render(playerid);
        }
        return 1;
    }
    if (!strcmp(a, "next"))
    {
        if ((gSelPage[playerid] + 1) * SELECTION_PER_PAGE < gSelItems[playerid])
        {
            gSelPage[playerid]++;
            Sel_Render(playerid);
        }
        return 1;
    }
    if (!strcmp(a, "pick"))
    {
        new listitem = gSelPage[playerid] * SELECTION_PER_PAGE + index;
        if (index < 0 || listitem >= gSelItems[playerid]) return 1;
        new extraid = gSelExtra[playerid], modelid = gSelList[playerid][listitem];
        HidePlayerSelectionMenu(playerid);
        CallLocalFunction("OnPlayerSelectionMenuResponse", "iiiii", playerid, extraid, 1, listitem, modelid);
    }
    return 1;
}

hook OnPlayerConnect(playerid)
{
    gSelOpen[playerid] = false;
    gSelExtra[playerid] = -1;
    gSelItems[playerid] = 0;
    return 1;
}
