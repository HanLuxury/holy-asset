/* =====================================================================
    SERVER/core/cef/cef_ui.inc
    EAGLE ROLEPLAY - Komponen UI CEF Mobile (pengganti SEMUA textdraw)
    ---------------------------------------------------------------
    Notifikasi, item box, progress, banner, overlay, dan PANEL GENERIK.

    PANEL (event "panel" -> ui.js):
        P_Begin("garasi", "Garasi Kota", "Pilih kendaraan", "car");
          P_ListBegin("veh");
            P_Item("Infernus", "B 1234 XY", "", "", "veh:411");
          P_ListEnd();
        P_Footer();
          P_Btn("take", "Keluarkan", "p");
        P_Send(playerid);
    Klik -> OnPlayerCEFEvent("ui") -> CEFUI_Route(playerid, "garasi", aksi, index, teks)
   ===================================================================== */
#if defined _eagle_cef_ui
    #endinput
#endif
#define _eagle_cef_ui

/* ------------------------------ NOTIFIKASI ------------------------------
   type: 0=ERROR 1=SUKSES 2=WARNING 3=INFO 4=SYNTAX (sama dgn enum NOTIFICATION_*) */
stock CEF_Notify(playerid, type, const text[], duration = 4500, const title[] = "")
{
    J_Begin();
    J_Int("t", type);
    J_Str("m", text);
    J_Int("d", duration);
    if (title[0]) J_Str("title", title);
    return J_Send(playerid, "notify");
}

/* ------------------------------ ITEM BOX ------------------------------
   amount: "Received 1x" / "Removed 2x" / "+1", name: nama item, model: id objek (ikon dipilih UI) */
stock CEF_ItemBox(playerid, const amount[], const name[], model = 0, bool:negative = false, duration = 3500)
{
    J_Begin();
    J_Str("a", amount);
    J_Str("n", name);
    if (model) J_Int("m", model);
    if (negative) J_Int("neg", 1);
    J_Int("d", duration);
    return J_Send(playerid, "itembox");
}

/* ------------------------------ PROGRESS BAR ------------------------------ */
new gCEFProgLabel[MAX_PLAYERS][48];

stock CEF_Progress(playerid, bool:show, const label[] = "", pct = -1)
{
    J_Begin();
    J_Int("show", show ? 1 : 0);
    if (label[0]) J_Str("label", label);
    if (pct >= 0) J_Int("pct", pct);
    return J_Send(playerid, "progress");
}
// Kompatibel dengan kode lama: label disimpan, nilai 0..81 (lebar bar lama)
stock CEF_ProgressLabel(playerid, const label[])
{
    if (0 <= playerid < MAX_PLAYERS) format(gCEFProgLabel[playerid], 48, "%s", label);
    return 1;
}
stock CEF_ProgressShow(playerid)
{
    return CEF_Progress(playerid, true, gCEFProgLabel[playerid], 0);
}
stock CEF_ProgressHide(playerid)
{
    return CEF_Progress(playerid, false);
}
stock CEF_ProgressSet(playerid, Float:value)
{
    new pct = floatround((value / 81.0) * 100.0);
    if (pct < 0) pct = 0; else if (pct > 100) pct = 100;
    return CEF_Progress(playerid, true, gCEFProgLabel[playerid], pct);
}

/* ------------------------------ BANNER ------------------------------
   id unik per jenis (warning, global, storm, insurance, footer, segel, ...)
   color: info|warn|err|ok|gold, pos: top|top2|mid|bottom, duration ms (0 = tetap) */
stock CEF_Banner(playerid, const id[], bool:show, const title[] = "", const msg[] = "", const color[] = "info",
                 const icon[] = "info", duration = 0, const pos[] = "top", const foot[] = "", bool:small = false)
{
    J_Begin();
    J_Str("id", id);
    J_Int("show", show ? 1 : 0);
    if (show)
    {
        if (title[0]) J_Str("t", title);
        if (msg[0]) J_Str("m", msg);
        if (foot[0]) J_Str("f", foot);
        J_Str("c", color);
        if (icon[0]) J_Str("icon", icon);
        J_Str("pos", pos);
        if (duration > 0) J_Int("d", duration);
        if (small) J_Int("sm", 1);
    }
    return J_Send(playerid, "banner");
}
stock CEF_BannerAll(const id[], bool:show, const title[] = "", const msg[] = "", const color[] = "info",
                    const icon[] = "info", duration = 0, const pos[] = "top", const foot[] = "")
{
    foreach (new p : Player) CEF_Banner(p, id, show, title, msg, color, icon, duration, pos, foot);
    return 1;
}

/* ------------------------------ OVERLAY LAYAR ------------------------------ */
stock CEF_Overlay(playerid, const id[], bool:show, const color[] = "", duration = 0)
{
    J_Begin();
    J_Str("id", id);
    J_Int("show", show ? 1 : 0);
    if (color[0]) J_Str("c", color);
    if (duration > 0) J_Int("d", duration);
    return J_Send(playerid, "overlay");
}

/* =====================================================================
   PANEL GENERIK
   ===================================================================== */
stock P_Begin(const id[], const title[], const sub[] = "", const icon[] = "", const pos[] = "c", width = 26, bool:modal = false, bool:closeBtn = true)
{
    J_Begin();
    J_Str("id", id);
    J_Int("show", 1);
    J_Str("title", title);
    if (sub[0]) J_Str("sub", sub);
    if (icon[0]) J_Str("icon", icon);
    J_Str("pos", pos);
    J_Int("w", width);
    if (modal) J_Int("modal", 1);
    if (!closeBtn) J_Int("close", 0);
    J_Arr("body");
}
stock P_Text(const text[], const cls[] = "")
{
    J_Obj(); J_Str("k", "txt"); J_Str("t", text); if (cls[0]) J_Str("c", cls); J_End();
}
stock P_KVBegin()
{
    J_Obj(); J_Str("k", "kv"); J_Arr("r");
}
stock P_Row(const key[], const value[])
{
    J_Arr(); J_AStr(key); J_AStr(value); J_End();
}
stock P_RowInt(const key[], value)
{
    new b[16]; valstr(b, value);
    P_Row(key, b);
}
stock P_KVEnd()
{
    J_End(); J_End();
}
// kind: "list" | "grid" ; action: nama aksi saat item ditekan (default "sel")
stock P_ListBegin(const blockId[] = "", sel = -1, const kind[] = "list", cols = 0, const action[] = "", maxHeight = 0, const empty[] = "")
{
    J_Obj();
    J_Str("k", kind);
    if (blockId[0]) J_Str("id", blockId);
    if (sel >= 0) J_Int("sel", sel);
    if (cols > 0) J_Int("cols", cols);
    if (action[0]) J_Str("a", action);
    if (maxHeight > 0) J_Int("hmax", maxHeight);
    if (empty[0]) J_Str("empty", empty);
    J_Arr("it");
}
stock P_Item(const t[], const s[] = "", const r[] = "", const icon[] = "", const img[] = "", const badge[] = "", bool:disabled = false, const qty[] = "", const color[] = "")
{
    J_Obj();
    J_Str("t", t);
    if (s[0]) J_Str("s", s);
    if (r[0]) J_Str("r", r);
    if (icon[0]) J_Str("icon", icon);
    if (img[0]) J_Str("img", img);
    if (badge[0]) J_Str("b", badge);
    if (disabled) J_Int("dis", 1);
    if (qty[0]) J_Str("q", qty);
    if (color[0]) J_Str("c", color);
    J_End();
}
stock P_ListEnd()
{
    J_End(); J_End();
}
stock P_TilesBegin()
{
    J_Obj(); J_Str("k", "tiles"); J_Arr("it");
}
stock P_Tile(const title[], const value[], const icon[] = "", const color[] = "")
{
    J_Obj(); J_Str("t", title); J_Str("v", value); if (icon[0]) J_Str("icon", icon); if (color[0]) J_Str("c", color); J_End();
}
stock P_TilesEnd()
{
    J_End(); J_End();
}
stock P_Bar(const title[], pct, const color[] = "", const valueText[] = "")
{
    J_Obj(); J_Str("k", "bar"); J_Str("t", title); J_Int("v", pct);
    if (color[0]) J_Str("c", color);
    if (valueText[0]) J_Str("vt", valueText);
    J_End();
}
// baris pemilih: [<]  judul  nilai  [>]  -> aksi "prev"/"next" dengan index baris
stock P_StepBegin()
{
    J_Obj(); J_Str("k", "step"); J_Arr("it");
}
stock P_Step(const title[], const value[], const icon[] = "")
{
    J_Obj(); J_Str("t", title); J_Str("v", value); if (icon[0]) J_Str("icon", icon); J_End();
}
stock P_StepEnd()
{
    J_End(); J_End();
}
stock P_Nav(const text[])
{
    J_Obj(); J_Str("k", "nav"); J_Str("t", text); J_End();
}
stock P_Image(const src[], heightRem = 0)
{
    J_Obj(); J_Str("k", "img"); J_Str("src", src); if (heightRem > 0) J_Int("hgt", heightRem); J_End();
}
stock P_Sep()
{
    J_Obj(); J_Str("k", "sep"); J_End();
}
stock P_CardBegin(const title[], const sub[] = "", const img[] = "", const cls[] = "")
{
    J_Obj(); J_Str("k", "card"); J_Str("t", title);
    if (sub[0]) J_Str("s", sub);
    if (img[0]) J_Str("img", img);
    if (cls[0]) J_Str("c", cls);
    J_Arr("r");
}
stock P_CardEnd()
{
    J_End(); J_End();
}
stock P_BtnRowBegin(bool:column = false)
{
    J_Obj(); J_Str("k", "btns"); if (column) J_Int("col", 1); J_Arr("b");
}
stock P_BtnRowEnd()
{
    J_End(); J_End();
}
// tombol (di baris tombol body atau footer panel)
stock P_Btn(const id[], const text[], const color[] = "", const icon[] = "", index = -1, bool:disabled = false)
{
    J_Obj();
    J_Str("id", id);
    J_Str("t", text);
    if (color[0]) J_Str("c", color);
    if (icon[0]) J_Str("icon", icon);
    if (index != -1) J_Int("i", index);
    if (disabled) J_Int("dis", 1);
    J_End();
}
// tutup body, buka daftar tombol footer
stock P_Footer()
{
    J_CloseTo(1);
    J_Arr("btns");
}
stock P_Send(playerid, const note[] = "")
{
    J_CloseTo(1);
    if (note[0]) J_Str("foot", note);
    return J_Send(playerid, "panel");
}
stock P_Close(playerid, const id[])
{
    J_Begin();
    J_Str("id", id);
    J_Int("show", 0);
    return J_Send(playerid, "panel");
}
stock P_CloseAll(playerid)
{
    J_Begin();
    return J_Send(playerid, "panel_close_all");
}

/* Konfirmasi Ya/Tidak (hasil: aksi "yes"/"no" pada view id) */
stock CEF_Confirm(playerid, const id[], const title[], const message[], const yes[] = "Ya", const no[] = "Batal", const icon[] = "info")
{
    P_Begin(id, title, "", icon, "c", 22, true, false);
    P_Text(message, "center");
    P_Footer();
    P_Btn("no", no, "g");
    P_Btn("yes", yes, "p");
    return P_Send(playerid);
}

/* =====================================================================
   GAME TEXT -> CEF
   Semua GameTextForPlayer / GameTextForAll di gamemode otomatis tampil
   sebagai teks CEF (gaya FiveM). Client tanpa CEF tetap memakai GameText asli.
   style SA-MP: 3 = besar tengah, 4 = kecil bawah, 6 = tengah, lainnya = judul
   ===================================================================== */
stock CEF_GameText(playerid, const string[], time, style)
{
    if (!CEF_IsReady(playerid)) return GameTextForPlayer(playerid, string, time, style);
    J_Begin();
    J_Str("t", string);
    J_Int("d", time);
    J_Int("s", style);
    return J_Send(playerid, "gametext");
}
stock CEF_GameTextAll(const string[], time, style)
{
    foreach (new p : Player) CEF_GameText(p, string, time, style);
    return 1;
}
#if defined _ALS_GameTextForPlayer
    #undef GameTextForPlayer
#else
    #define _ALS_GameTextForPlayer
#endif
#define GameTextForPlayer CEF_GameText
#if defined _ALS_GameTextForAll
    #undef GameTextForAll
#else
    #define _ALS_GameTextForAll
#endif
#define GameTextForAll CEF_GameTextAll
