/* =====================================================================
    SERVER/core/cef/cef_core.inc
    EAGLE ROLEPLAY - Inti UI CEF Mobile (TANPA TEXTDRAW)
    ---------------------------------------------------------------
    - Membuka WebView client (RPC 107/108/110) saat pemain connect.
    - Penulis JSON (J_*) yang aman untuk CefManager.evaluateJs():
      TIDAK pernah mengeluarkan backslash, tanda kutip ganda di teks
      diganti ', baris baru jadi ~n~, karakter non-ASCII jadi ?.
    - Pembaca JSON (CEF_JStr/CEF_JInt) untuk event dari client
      (format Gson: {"event":"ui","data":{"v":..,"a":..,"i":..,"s":..}}).
    - Semua klik UI masuk ke satu event "ui" lalu dirutekan ke
      CEFUI_Route() (lihat cef_router.inc).
   ===================================================================== */
#if defined _eagle_cef_core
    #endinput
#endif
#define _eagle_cef_core

#include <YSI_Coding/y_hooks>

// Alamat halaman UI (folder cefui/). Ubah sesuai hosting-mu.
// Server menambahkan token unik "&t=..." setiap kali halaman dibuka (lihat CEF_PageUrl),
// jadi WebView tidak memakai salinan lama dari cache (GitHub Pages: max-age=600).
#if !defined CEF_UI_URL
    #define CEF_UI_URL "https://hanluxury.github.io/holy-asset/139.99.52.216/cefui/index.html?eagle=v48"
#endif
// Versi UI yang dibutuhkan gamemode ini (harus sama dengan BUILD di cefui/js/bridge.js).
#if !defined CEF_UI_VERSION
    #define CEF_UI_VERSION "v48"
#endif

// Detik menunggu halaman UI siap sebelum memakai dialog cadangan (login).
#if !defined CEF_READY_TIMEOUT
    #define CEF_READY_TIMEOUT (12)
#endif

#define CEF_JSON_MAX        (32768)

// ID dialog tambahan untuk sistem UI CEF (rentang aman, tidak bentrok enum lama)
#define DIALOG_SPAWN_CEF        (32000)
#define DIALOG_CEF_INPUT        (32001)
#define DIALOG_CEF_INPUT2       (32002)
#define DIALOG_CEF_LIST         (32003)
#define DIALOG_CEF_CONFIRM      (32004)
#define CEF_JSON_DEPTH      (24)

new bool:gCEFReady[MAX_PLAYERS];
new gCEFConnectTick[MAX_PLAYERS];
static gCEFWaitTimer[MAX_PLAYERS] = {-1, ...};

// Info halaman UI dari event "ready" (untuk log [CEF] dan /hpcek)
new gCEFVer[MAX_PLAYERS][12];           // versi UI yang termuat di client ("-" = belum/lama)
new gCEFMiss[MAX_PLAYERS][96];          // modul JS yang tidak aktif
new gCEFFail[MAX_PLAYERS][96];          // file CSS/JS yang gagal dimuat
static gCEFReloadTick[MAX_PLAYERS];
static gCEFUrlSeq;

// Tes jalur server <-> UI (/cefcek) dan detak UI (lihat bagian paling bawah file ini)
#define CEF_DIAG_INFO       (360)
#define CEF_DIAG_PROBES     (8)
new gCEFHbTick[MAX_PLAYERS];            // GetTickCount() detak terakhir dari UI (0 = belum pernah)
new gCEFHbInfo[MAX_PLAYERS][CEF_DIAG_INFO];
static gCEFDiagSeq[MAX_PLAYERS];
static gCEFDiagTick[MAX_PLAYERS];
static gCEFDiagGot[MAX_PLAYERS][CEF_DIAG_PROBES];   // 1 = balasan lewat "ui", 2 = lewat "diag", 3 = keduanya
static gCEFDiagMs[MAX_PLAYERS][CEF_DIAG_PROBES];
static gCEFDiagLen[MAX_PLAYERS][CEF_DIAG_PROBES];
static gCEFDiagWhy[MAX_PLAYERS][40];
static gCEFDiagInfo[MAX_PLAYERS][CEF_DIAG_INFO];
static bool:gCEFDiagRun[MAX_PLAYERS];
// Detak antrean (UI v30+): lihat CEFX_OnHeartbeat
static gCEFQSeq[MAX_PLAYERS], gCEFQWant[MAX_PLAYERS], gCEFQTick[MAX_PLAYERS];

/* =====================================================================
   PENULIS JSON (satu buffer global; bangun lalu langsung kirim)
   Contoh:
       J_Begin();
         J_Str("title", "Garasi");
         J_Arr("it");
           J_Obj(); J_Str("t", "Infernus"); J_Int("id", 411); J_End();
         J_End();
       J_Send(playerid, "panel");
   ===================================================================== */
static gJ[CEF_JSON_MAX];
static gJLen, gJDepth;
static bool:gJFirst[CEF_JSON_DEPTH];
static gJKind[CEF_JSON_DEPTH];

static stock J__Put(c)
{
    if (gJLen < CEF_JSON_MAX - 2) { gJ[gJLen++] = c; gJ[gJLen] = EOS; }
}
static stock J__Raw(const s[])
{
    for (new i = 0; s[i] != EOS; i++) J__Put(s[i]);
}
// isi string yang aman (tanpa backslash / kutip ganda / kontrol / non-ASCII)
static stock J__Esc(const s[])
{
    for (new i = 0, c; (c = s[i]) != EOS; i++)
    {
        if (c < 0) c += 256;
        switch (c)
        {
            case '"': J__Put('\'');
            case '\\': J__Put('/');
            case '\n': { J__Put('~'); J__Put('n'); J__Put('~'); }
            case '\r': {}
            case '\t': J__Put(' ');
            default:
            {
                if (c < 32) continue;
                if (c > 126) J__Put('?');
                else J__Put(c);
            }
        }
    }
}
static stock J__Sep()
{
    if (gJDepth > 0)
    {
        if (!gJFirst[gJDepth]) J__Put(',');
        gJFirst[gJDepth] = false;
    }
}
static stock J__Key(const k[])
{
    J__Sep();
    if (gJDepth > 0 && gJKind[gJDepth] == '{')
    {
        J__Put('"'); J__Raw(k); J__Put('"'); J__Put(':');
    }
}
stock J_Reset()
{
    gJLen = 0; gJ[0] = EOS; gJDepth = 0;
    gJFirst[0] = true; gJKind[0] = 0;
}
stock J_Begin()
{
    J_Reset();
    J__Put('{'); gJDepth = 1; gJFirst[1] = true; gJKind[1] = '{';
}
stock J_Obj(const k[] = "")
{
    J__Key(k); J__Put('{');
    if (gJDepth < CEF_JSON_DEPTH - 1) gJDepth++;
    gJFirst[gJDepth] = true; gJKind[gJDepth] = '{';
}
stock J_Arr(const k[] = "")
{
    J__Key(k); J__Put('[');
    if (gJDepth < CEF_JSON_DEPTH - 1) gJDepth++;
    gJFirst[gJDepth] = true; gJKind[gJDepth] = '[';
}
stock J_End()
{
    if (gJDepth <= 0) return 0;
    J__Put(gJKind[gJDepth] == '{' ? '}' : ']');
    gJDepth--;
    return 1;
}
stock J_Str(const k[], const v[])
{
    J__Key(k); J__Put('"'); J__Esc(v); J__Put('"');
}
stock J_Int(const k[], v)
{
    J__Key(k);
    new b[16]; valstr(b, v); J__Raw(b);
}
stock J_Flt(const k[], Float:v)
{
    J__Key(k);
    new b[24]; format(b, sizeof(b), "%.2f", v); J__Raw(b);
}
stock J_Bool(const k[], bool:v)
{
    J__Key(k); J__Put(v ? '1' : '0');
}
// elemen array tanpa key
stock J_AStr(const v[]) { J__Sep(); J__Put('"'); J__Esc(v); J__Put('"'); }
stock J_AInt(v)         { J__Sep(); new b[16]; valstr(b, v); J__Raw(b); }
// string yang sudah diformat (gunakan format() dulu ke buffer sendiri)
stock J_Close()
{
    while (gJDepth > 0) J_End();
}
stock J_Length() { return gJLen; }
// Bandingkan / salin JSON yang sedang dibangun (untuk "kirim hanya jika berubah")
stock bool:J_Equals(const s[])
{
    return (s[0] != EOS && !strcmp(s, gJ, false));
}
stock J_CopyTo(dest[], size = sizeof(dest))
{
    format(dest, size, "%s", gJ);
    return 1;
}
stock J_Depth() { return gJDepth; }
stock J_CloseTo(depth) { while (gJDepth > depth) J_End(); }

stock J_Send(playerid, const event[])
{
    J_Close();
    if (!IsPlayerConnected(playerid) || !gCEFReady[playerid]) return 0;
    return CEF_SendRaw(playerid, event, gJ, gJLen);
}
stock J_SendAll(const event[])
{
    J_Close();
    foreach (new p : Player)
    {
        if (gCEFReady[p]) CEF_SendRaw(p, event, gJ, gJLen);
    }
    return 1;
}

// Jejak event CEF (server_log.txt [CEF-OUT]/[CEF-IN]) selama tes /cefcek atau HP gagal tampil
static gCEFTraceUntil[MAX_PLAYERS];
stock CEF_TraceOn(playerid, ms)
{
    if (0 <= playerid < MAX_PLAYERS) gCEFTraceUntil[playerid] = GetTickCount() + ms;
    return 1;
}
stock bool:CEF_Tracing(playerid)
{
    return (0 <= playerid < MAX_PLAYERS) && gCEFTraceUntil[playerid] != 0 && GetTickCount() - gCEFTraceUntil[playerid] < 0;
}
// Selama jendela ini, error JavaScript ([CEF-JS]) juga ditampilkan di chat pemain (maks. 4 baris),
// supaya terlihat di screenshot saat HP dibuka / dites.
static gCEFEchoUntil[MAX_PLAYERS], gCEFEchoCount[MAX_PLAYERS];
stock CEF_EchoOn(playerid, ms)
{
    if (!(0 <= playerid < MAX_PLAYERS)) return 0;
    if (gCEFEchoUntil[playerid] == 0 || GetTickCount() - gCEFEchoUntil[playerid] >= 0) gCEFEchoCount[playerid] = 0;
    gCEFEchoUntil[playerid] = GetTickCount() + ms;
    return 1;
}
static stock bool:CEF_Echoing(playerid)
{
    return (0 <= playerid < MAX_PLAYERS) && ((gCEFEchoUntil[playerid] != 0 && GetTickCount() - gCEFEchoUntil[playerid] < 0) || CEF_Tracing(playerid));
}

/* =====================================================================
   PENGIRIMAN EVENT KE UI
   ---------------------------------------------------------------------
   Hasil tes /cefcek dari HP user (FIX5): satu paket 1,4 KB utuh tidak pernah
   sampai, dan SEMUA event sesudahnya (bahkan yang 19 byte) ikut tertahan. Paket
   yang lebih besar dari MTU SA-MP (±540 byte) dipecah RakNet; client Android ini
   tidak pernah menyerahkan paket pecahan itu, dan karena event dikirim
   RELIABLE_ORDERED, antrean urutan di client menunggu selamanya -> semua event UI
   berikutnya macet sampai reconnect (HP tidak muncul, HUD berhenti diperbarui,
   /uireload pun tidak sampai karena lewat antrean yang sama).
   Aturan sekarang:
   - Tidak ada paket berurutan lebih dari CEF_WHOLE_MAX byte. Event di atas
     CEF_CHUNK_OVER byte dipotong jadi event "_ck" berisi CEF_CHUNK_SIZE byte
     (±250 byte per paket, ukuran yang terbukti sampai) lalu digabung bridge.js.
   - UI lama (< v29) tidak bisa menggabung potongan: event besar untuknya tidak
     dikirim sama sekali (lebih baik hilang satu event daripada semua macet).
   - Event UI memakai antrean urutan gCEFChan[playerid]. Bila antrean terbukti macet
     (tes UI / detak UI), server pindah ke antrean baru (CEFX_ChannelStall) dan
     mengirim ulang tampilan (HUD, quickbar, HP, pakaian).
   - UI v29+: event "phone" dikirim dengan nama "eph" (phone_core.js menerima keduanya).
   ===================================================================== */
#define CEF_CHUNK_SIZE      (220)
#define CEF_CHUNK_OVER      (260)
#define CEF_WHOLE_MAX       (500)
#define CEF_CHAN_FIRST      (8)       // antrean cadangan pertama (0..7 dibiarkan untuk SA-MP)
#define CEFX_RPC_INIT       (107)     // RPC client: muat URL WebView (sama dengan CEF_Init milik cef.inc)
#define CEF_CHAN_LAST       (15)
new bool:gCEFChunk[MAX_PLAYERS];      // UI v29+: bisa menggabung potongan "_ck"
new gCEFVerNum[MAX_PLAYERS];          // angka versi UI dari event "ready" (29, 30, ...)
new gCEFChan[MAX_PLAYERS];            // antrean urutan RakNet untuk event UI (0 = bawaan)
static gCEFChanSwitch[MAX_PLAYERS];   // berapa kali antrean dipindah (koneksi ini)
static gCEFChanTick[MAX_PLAYERS];     // GetTickCount() pemindahan terakhir
static gCEFDropTick[MAX_PLAYERS];     // log "event tidak dikirim" (maks. 1x / 30 dtk)
static gCEFChunkId;

stock CEF_SendWhole(playerid, const event[], const payload[], len)
{
    if (!IsPlayerConnected(playerid)) return 0;
    if (len > CEF_WHOLE_MAX)
    {
        // paket sebesar ini akan dipecah RakNet dan menahan semua event berikutnya
        new name[MAX_PLAYER_NAME + 1], ev[24];
        GetPlayerName(playerid, name, sizeof(name));
        format(ev, sizeof(ev), "%s", event);
        printf("[CEF] %s(%d) event %s %d byte TIDAK dikirim utuh (batas %d byte, akan menahan event lain)", name, playerid, ev, len, CEF_WHOLE_MAX);
        return 0;
    }
    new BitStream:bs = BS_New();
    if (bs == BitStream:0) return 0;
    BS_WriteUint8(bs, CEF_PACKET_ID);
    BS_WriteUint32(bs, CEF_RPC_EVENT_TO_JS);
    CEF_WriteStr8(bs, event);
    for (new i = 0; i < len; i++) BS_WriteUint8(bs, payload[i] & 0xFF);
    new result = PR_SendPacket(bs, playerid, PR_HIGH_PRIORITY, PR_RELIABLE_ORDERED, gCEFChan[playerid]);
    BS_Delete(bs);
    if (CEF_Tracing(playerid))
    {
        new name[MAX_PLAYER_NAME + 1];
        GetPlayerName(playerid, name, sizeof(name));
        printf("[CEF-OUT] %s(%d) %s %d byte utuh ch=%d kirim=%d", name, playerid, event, len, gCEFChan[playerid], result);
    }
    return result;
}

static stock CEF_SendChunked(playerid, const event[], const payload[], len)
{
    new parts = (len + CEF_CHUNK_SIZE - 1) / CEF_CHUNK_SIZE, head[48], result = 1;
    gCEFChunkId = (gCEFChunkId % 99999) + 1;
    for (new k = 0; k < parts; k++)
    {
        new BitStream:bs = BS_New();
        if (bs == BitStream:0) return 0;
        BS_WriteUint8(bs, CEF_PACKET_ID);
        BS_WriteUint32(bs, CEF_RPC_EVENT_TO_JS);
        CEF_WriteStr8(bs, "_ck");
        format(head, sizeof(head), "%d|%d|%d|%s|", gCEFChunkId, k, parts, event);
        for (new h = 0; head[h] != EOS; h++) BS_WriteUint8(bs, head[h] & 0xFF);
        new endAt = (k + 1) * CEF_CHUNK_SIZE;
        if (endAt > len) endAt = len;
        for (new i = k * CEF_CHUNK_SIZE; i < endAt; i++) BS_WriteUint8(bs, payload[i] & 0xFF);
        if (!PR_SendPacket(bs, playerid, PR_HIGH_PRIORITY, PR_RELIABLE_ORDERED, gCEFChan[playerid])) result = 0;
        BS_Delete(bs);
    }
    if (CEF_Tracing(playerid))
    {
        new name[MAX_PLAYER_NAME + 1];
        GetPlayerName(playerid, name, sizeof(name));
        printf("[CEF-OUT] %s(%d) %s %d byte dipotong %dx ch=%d kirim=%d", name, playerid, event, len, parts, gCEFChan[playerid], result);
    }
    return result;
}

// Semua event ke UI lewat sini (J_Send, J_SendAll, sistem pakaian, dll.)
stock CEF_SendRaw(playerid, const event[], const payload[], len)
{
    if (!IsPlayerConnected(playerid) || !gCEFReady[playerid]) return 0;
    if (!gCEFChunk[playerid])
    {
        // UI lama (belum v29) tidak bisa menggabung potongan: kirim utuh bila masih di bawah
        // batas pecah RakNet, selebihnya tidak dikirim (paket pecahan menahan semua event lain)
        if (len > CEF_WHOLE_MAX)
        {
            if (gCEFDropTick[playerid] == 0 || GetTickCount() - gCEFDropTick[playerid] > 30000)
            {
                gCEFDropTick[playerid] = GetTickCount();
                new name[MAX_PLAYER_NAME + 1], ev[24];
                GetPlayerName(playerid, name, sizeof(name));
                format(ev, sizeof(ev), "%s", event);
                printf("[CEF] %s(%d) event %s %d byte tidak dikirim: UI di client versi %s belum bisa menerima event besar (upload cefui terbaru)", name, playerid, ev, len, gCEFVer[playerid]);
            }
            return 0;
        }
        return CEF_SendWhole(playerid, event, payload, len);
    }
    // UI v29+: semua event HP lewat nama "eph"
    if (event[0] == 'p' && !strcmp(event, "phone"))
    {
        if (len > CEF_CHUNK_OVER) return CEF_SendChunked(playerid, "eph", payload, len);
        return CEF_SendWhole(playerid, "eph", payload, len);
    }
    if (len > CEF_CHUNK_OVER) return CEF_SendChunked(playerid, event, payload, len);
    return CEF_SendWhole(playerid, event, payload, len);
}

// Info antrean event UI untuk /hpcek
stock CEF_ChanSwitches(playerid)
{
    return (0 <= playerid < MAX_PLAYERS) ? gCEFChanSwitch[playerid] : 0;
}

// J_Send tanpa pemotongan & tanpa ganti nama (hanya untuk event kecil tes /cefcek)
stock J_SendWhole(playerid, const event[])
{
    J_Close();
    if (!IsPlayerConnected(playerid) || !gCEFReady[playerid]) return 0;
    return CEF_SendWhole(playerid, event, gJ, gJLen);
}

/* Paket uji ukuran (tes /cefcek): UNRELIABLE & tanpa antrean urutan, jadi paket yang tidak
   sampai tidak bisa menahan event lain. */
static stock CEFX_SendProbe(playerid, const event[], const payload[], len)
{
    new BitStream:bs = BS_New();
    if (bs == BitStream:0) return 0;
    BS_WriteUint8(bs, CEF_PACKET_ID);
    BS_WriteUint32(bs, CEF_RPC_EVENT_TO_JS);
    CEF_WriteStr8(bs, event);
    for (new i = 0; i < len; i++) BS_WriteUint8(bs, payload[i] & 0xFF);
    new result = PR_SendPacket(bs, playerid, PR_HIGH_PRIORITY, PR_UNRELIABLE, 0);
    BS_Delete(bs);
    return result;
}

/* Muat halaman UI lewat antrean event yang sedang dipakai (sama dengan CEF_Init milik cef.inc:
   [u8 251][u32 107][str8 url], tapi tidak terjebak di antrean yang macet). */
static stock CEFX_SendInit(playerid, const url[])
{
    new BitStream:bs = BS_New();
    if (bs == BitStream:0) return 0;
    BS_WriteUint8(bs, CEF_PACKET_ID);
    BS_WriteUint32(bs, CEFX_RPC_INIT);
    CEF_WriteStr8(bs, url);
    new result = PR_SendPacket(bs, playerid, PR_HIGH_PRIORITY, PR_RELIABLE_ORDERED, gCEFChan[playerid]);
    BS_Delete(bs);
    return result;
}

/* Pindah ke antrean urutan baru (tanpa kirim ulang tampilan). Antrean lama yang macet tidak
   dipakai lagi. Mengembalikan nomor antrean baru, 0 bila antrean cadangan habis. */
static stock CEFX_ChannelNext(playerid)
{
    new next = (gCEFChan[playerid] < CEF_CHAN_FIRST) ? CEF_CHAN_FIRST : gCEFChan[playerid] + 1;
    if (next > CEF_CHAN_LAST) return 0;
    gCEFChan[playerid] = next;
    gCEFChanSwitch[playerid]++;
    return next;
}

/* Antrean event UI pemain ini terbukti macet (tes UI / detak UI): pindah ke antrean baru lalu
   kirim ulang tampilan. Jeda minimal 20 dtk antar pemindahan.
   Hasil: 1 = dipindah, 2 = baru saja dipindah (<20 dtk, tidak diulang), 0 = antrean cadangan habis. */
stock CEFX_ChannelStall(playerid, const why[])
{
    if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return 0;
    new name[MAX_PLAYER_NAME + 1], now = GetTickCount(), old = gCEFChan[playerid];
    GetPlayerName(playerid, name, sizeof(name));
    if (gCEFChanTick[playerid] != 0 && now - gCEFChanTick[playerid] < 20000) return 2;
    gCEFChanTick[playerid] = now;
    if (!CEFX_ChannelNext(playerid))
    {
        printf("[CEF] %s(%d) antrean event UI macet lagi di ch=%d (%s), antrean cadangan habis - pemain perlu reconnect", name, playerid, old, why);
        return 0;
    }
    printf("[CEF] %s(%d) antrean event UI macet di ch=%d (%s) -> pindah ke ch=%d, tampilan dikirim ulang", name, playerid, old, why, gCEFChan[playerid]);
    CEFX_ResetHbQuery(playerid);
    if (gCEFReady[playerid]) CEFUI_OnReady(playerid, false);   // HUD, quickbar, HP, pakaian
    return 1;
}

// Event sederhana tanpa data: {"id":"..","show":0}
stock CEF_Toggle(playerid, const event[], const id[], bool:show)
{
    J_Begin(); J_Str("id", id); J_Bool("show", show);
    return J_Send(playerid, event);
}

/* =====================================================================
   PEMBACA JSON (event dari client)
   ===================================================================== */
static stock CEF_JFind(const json[], const key[])
{
    new pat[48];
    format(pat, sizeof(pat), "\"%s\"", key);
    new plen = strlen(pat), p = strfind(json, pat, false);
    while (p != -1)
    {
        new q = p + plen;
        while (json[q] == ' ') q++;
        if (json[q] == ':')
        {
            q++;
            while (json[q] == ' ') q++;
            return q;
        }
        p = strfind(json, pat, false, p + 1);
    }
    return -1;
}

static stock CEF_HexVal(c)
{
    if ('0' <= c <= '9') return c - '0';
    if ('a' <= c <= 'f') return c - 'a' + 10;
    if ('A' <= c <= 'F') return c - 'A' + 10;
    return 0;
}

// Ambil nilai (string atau angka) sebagai teks. Return panjang, -1 bila tidak ada.
stock CEF_JStr(const json[], const key[], dest[], size = sizeof(dest))
{
    dest[0] = EOS;
    new p = CEF_JFind(json, key);
    if (p == -1) return -1;
    new j = 0;
    if (json[p] == '"')
    {
        p++;
        while (json[p] != EOS && json[p] != '"' && j < size - 1)
        {
            new c = json[p++];
            if (c == '\\')
            {
                c = json[p++];
                switch (c)
                {
                    case 'n': c = '\n';
                    case 't': c = ' ';
                    case 'r': c = ' ';
                    case 'b', 'f': c = ' ';
                    case 'u':
                    {
                        new v = 0;
                        for (new k = 0; k < 4 && json[p] != EOS; k++) v = (v << 4) | CEF_HexVal(json[p++]);
                        c = (v < 256) ? v : '?';
                    }
                    case EOS: break;
                }
            }
            dest[j++] = c;
        }
    }
    else
    {
        while (json[p] != EOS && json[p] != ',' && json[p] != '}' && json[p] != ']' && j < size - 1)
            dest[j++] = json[p++];
        while (j > 0 && dest[j - 1] == ' ') j--;
    }
    dest[j] = EOS;
    return j;
}

// Angka bulat (menerima "12", 12, 12.0, 1.2E7 dari Gson)
stock CEF_JInt(const json[], const key[], def = 0)
{
    new b[32];
    if (CEF_JStr(json, key, b, sizeof(b)) <= 0) return def;
    if (b[0] == 't') return 1;          // true
    if (b[0] == 'f' || b[0] == 'n') return 0; // false / null
    for (new i = 0; b[i] != EOS; i++)
    {
        if (b[i] == 'E' || b[i] == 'e') return floatround(floatstr(b));
        if (b[i] == '.') { b[i] = EOS; break; }
    }
    return strval(b);
}

/* =====================================================================
   SIKLUS HIDUP WEBVIEW
   ===================================================================== */
forward CEF_ReadyTimeout(playerid);
public CEF_ReadyTimeout(playerid)
{
    gCEFWaitTimer[playerid] = -1;
    if (!IsPlayerConnected(playerid) || gCEFReady[playerid]) return 0;
    // Client tanpa CEF / halaman gagal dimuat -> login lewat dialog biasa.
    Auth_OnCEFTimeout(playerid);
    return 1;
}

/* URL halaman UI + token unik per pemuatan ("&t=<waktu>-<urutan>").
   index.html meneruskan token itu ke semua file CSS/JS, sehingga setiap koneksi
   mengambil file terbaru dari hosting, bukan salinan lama/404 dari cache WebView. */
stock CEF_PageUrl(dest[], size = sizeof(dest))
{
    gCEFUrlSeq = (gCEFUrlSeq + 1) & 0xFFFF;
    if (strfind(CEF_UI_URL, "?") == -1)
        format(dest, size, "%s?t=%x-%x", CEF_UI_URL, gettime(), gCEFUrlSeq);
    else
        format(dest, size, "%s&t=%x-%x", CEF_UI_URL, gettime(), gCEFUrlSeq);
    return 1;
}

stock CEF_OpenBrowser(playerid)
{
    new url[256];
    CEF_PageUrl(url);
    CEF_Init(playerid, url);
    CEF_SetSize(playerid, 1.0);
    CEF_Show(playerid);
    return 1;
}

// teks dari client -> aman untuk printf / log (tanpa %, tanpa karakter kontrol / non-ASCII)
stock CEF_SafeText(str[])
{
    for (new i = 0; str[i] != EOS; i++)
    {
        if (str[i] < 32 || str[i] > 126 || str[i] == '%') str[i] = ' ';
    }
    return 1;
}

static stock CEF__Log(playerid, const what[])
{
    new name[MAX_PLAYER_NAME + 1];
    GetPlayerName(playerid, name, sizeof(name));
    printf("[CEF] %s(%d) %s", name, playerid, what);
    return 1;
}

/* Muat ulang halaman UI di client (token cache baru). Event ditahan sampai halaman
   baru mengirim "ready"; setelah itu HUD, quickbar, dan HP dikirim ulang
   (CEFUI_OnReady). Dibatasi 1x per 20 detik per pemain. */
stock CEF_ReloadPage(playerid, const why[])
{
    if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return 0;
    new now = GetTickCount();
    if (gCEFReloadTick[playerid] != 0 && now - gCEFReloadTick[playerid] < 20000) return 0;
    gCEFReloadTick[playerid] = now;
    gCEFReady[playerid] = false;
    new url[256], msg[160];
    CEF_PageUrl(url);
    // perintah muat ulang lewat antrean BARU: bila antrean lama macet, perintah ini tetap sampai
    CEFX_ChannelNext(playerid);
    CEFX_SendInit(playerid, url);
    format(msg, sizeof(msg), "memuat ulang halaman UI (%s), ch=%d", why, gCEFChan[playerid]);
    CEF__Log(playerid, msg);
    return 1;
}

// Ringkasan kondisi UI untuk /hpcek (satu baris, maks. ~128 karakter)
stock CEF_PageInfo(playerid, dest[], size = sizeof(dest))
{
    format(dest, size, "UI %s (butuh %s) | gagal dimuat: %s | modul mati: %s",
        gCEFVer[playerid], CEF_UI_VERSION, gCEFFail[playerid], gCEFMiss[playerid]);
    return 1;
}

/* Event "ready" dari bridge.js v28: {w,h,ver,miss,fail,err,rl}. Halaman lama tidak
   mengirim "ver" -> tercatat "-" (artinya cefui di hosting belum diperbarui). */
static stock CEF_OnReadyInfo(playerid, const data[])
{
    new ver[12], w[12], h[12], miss[96], fail[96], err[164], line[460];
    CEF_JStr(data, "ver", ver, sizeof(ver));
    CEF_JStr(data, "w", w, sizeof(w));
    CEF_JStr(data, "h", h, sizeof(h));
    CEF_JStr(data, "miss", miss, sizeof(miss));
    CEF_JStr(data, "fail", fail, sizeof(fail));
    CEF_JStr(data, "err", err, sizeof(err));
    CEF_SafeText(ver); CEF_SafeText(w); CEF_SafeText(h); CEF_SafeText(miss); CEF_SafeText(fail); CEF_SafeText(err);
    // UI build v29+ bisa menggabungkan event besar yang dipotong ("_ck"); v30+ menjawab detak antrean
    gCEFVerNum[playerid] = (ver[0] == 'v') ? strval(ver[1]) : 0;
    gCEFChunk[playerid] = (gCEFVerNum[playerid] >= 29);
    CEFX_ResetHbQuery(playerid);
    if (ver[0] == EOS) format(ver, sizeof(ver), "-");
    format(gCEFVer[playerid], sizeof(gCEFVer[]), "%s", ver);
    if (miss[0] == EOS) format(gCEFMiss[playerid], sizeof(gCEFMiss[]), "-");
    else format(gCEFMiss[playerid], sizeof(gCEFMiss[]), "%s", miss);
    if (fail[0] == EOS) format(gCEFFail[playerid], sizeof(gCEFFail[]), "-");
    else format(gCEFFail[playerid], sizeof(gCEFFail[]), "%s", fail);

    format(line, sizeof(line), "UI siap: versi %s, layar %sx%s", ver, w, h);
    if (fail[0] != EOS) { strcat(line, ", GAGAL DIMUAT: ", sizeof(line)); strcat(line, fail, sizeof(line)); }
    if (miss[0] != EOS) { strcat(line, ", modul tidak aktif: ", sizeof(line)); strcat(line, miss, sizeof(line)); }
    if (err[0] != EOS)  { strcat(line, ", error: ", sizeof(line)); strcat(line, err, sizeof(line)); }
    CEF__Log(playerid, line);
    if (strcmp(ver, CEF_UI_VERSION) != 0)
    {
        format(line, sizeof(line), "PERINGATAN: UI di hosting versi %s, gamemode butuh %s. Upload folder cefui terbaru, tunggu GitHub Pages selesai, lalu buka ulang game.", ver, CEF_UI_VERSION);
        CEF__Log(playerid, line);
    }
    return 1;
}

/* Perintah dari halaman UI sendiri: {v:"cef", a:..} (lewat CEFUI_Route) */
stock CEF_OnPageCmd(playerid, const a[], i, const s[])
{
    if (!strcmp(a, "reload"))
    {
        // ada file UI yang gagal dimuat -> halaman memuat ulang dirinya (maks. 2x).
        // Tahan event sampai "ready" berikutnya & beri waktu tambahan untuk login CEF.
        gCEFReady[playerid] = false;
        if (gCEFWaitTimer[playerid] != -1)
        {
            KillTimer(gCEFWaitTimer[playerid]);
            gCEFWaitTimer[playerid] = SetTimerEx("CEF_ReadyTimeout", CEF_READY_TIMEOUT * 1000, false, "d", playerid);
        }
        new files[120], msg[200];
        format(files, sizeof(files), "%s", s);
        CEF_SafeText(files);
        format(msg, sizeof(msg), "file UI gagal dimuat (%s) - halaman dimuat ulang otomatis (%d/2)", files, i);
        CEF__Log(playerid, msg);
        return 1;
    }
    return 1;
}

hook OnPlayerConnect(playerid)
{
    gCEFReady[playerid] = false;
    gCEFConnectTick[playerid] = GetTickCount();
    gCEFReloadTick[playerid] = 0;
    gCEFChunk[playerid] = false;
    gCEFVerNum[playerid] = 0;
    gCEFChan[playerid] = 0;
    gCEFChanSwitch[playerid] = 0;
    gCEFChanTick[playerid] = 0;
    gCEFDropTick[playerid] = 0;
    CEFX_ResetHbQuery(playerid);
    gCEFHbTick[playerid] = 0;
    gCEFHbInfo[playerid][0] = EOS;
    gCEFDiagRun[playerid] = false;
    gCEFTraceUntil[playerid] = 0;
    gCEFEchoUntil[playerid] = 0;
    gCEFEchoCount[playerid] = 0;
    format(gCEFVer[playerid], sizeof(gCEFVer[]), "-");
    format(gCEFMiss[playerid], sizeof(gCEFMiss[]), "-");
    format(gCEFFail[playerid], sizeof(gCEFFail[]), "-");
    if (gCEFWaitTimer[playerid] != -1) KillTimer(gCEFWaitTimer[playerid]);
    gCEFWaitTimer[playerid] = SetTimerEx("CEF_ReadyTimeout", CEF_READY_TIMEOUT * 1000, false, "d", playerid);
    CEFUI_ResetPlayer(playerid);
    CEF_DialogReset(playerid);
    CEF_OpenBrowser(playerid);
    return 1;
}

hook OnPlayerDisconnect(playerid, reason)
{
    gCEFReady[playerid] = false;
    if (gCEFWaitTimer[playerid] != -1)
    {
        KillTimer(gCEFWaitTimer[playerid]);
        gCEFWaitTimer[playerid] = -1;
    }
    return 1;
}

stock bool:CEF_IsReady(playerid)
{
    return (0 <= playerid < MAX_PLAYERS) && gCEFReady[playerid];
}

/* =====================================================================
   EVENT DARI CLIENT  (cef.inc -> OnPlayerCEFEvent)
   ===================================================================== */
public OnPlayerCEFEvent(playerid, const event[], const data[])
{
    if (CEF_Tracing(playerid)) CEF_TraceIn(playerid, event, data);
    if (!strcmp(event, "diag", true))
    {
        // balasan tes /cefcek lewat jalur terpisah + detak UI tiap 30 detik
        new n[16], info[CEF_DIAG_INFO];
        CEF_JStr(data, "n", n, sizeof(n));
        CEF_JStr(data, "s", info, sizeof(info));
        CEF_SafeText(info);
        if (n[0] != EOS && !strcmp(n, "hb"))
        {
            gCEFHbTick[playerid] = GetTickCount();
            format(gCEFHbInfo[playerid], sizeof(gCEFHbInfo[]), "%s", info);
            CEFX_OnHeartbeat(playerid, CEF_JInt(data, "q", 0));
            return 1;
        }
        CEF_DiagReply(playerid, strval(n), 2, info);
        return 1;
    }
    if (!strcmp(event, "ready", true))
    {
        new bool:first = !gCEFReady[playerid];
        gCEFReady[playerid] = true;
        if (gCEFWaitTimer[playerid] != -1)
        {
            KillTimer(gCEFWaitTimer[playerid]);
            gCEFWaitTimer[playerid] = -1;
        }
        CEF_OnReadyInfo(playerid, data);     // log [CEF]: versi UI, file gagal, modul tidak aktif
        CEFUI_OnReady(playerid, first);
        return 1;
    }
    if (!strcmp(event, "ui", true))
    {
        // Clothes preview/save state is a full JSON document (~4 KB). The
        // previous 160-byte buffer truncated it, making every outfit action
        // arrive incomplete. Keep the common v/a fields small, but give s the
        // same room as the CEF event payload.
        new v[32], a[32], s[CEF_MAX_EVENT_DATA];
        CEF_JStr(data, "v", v, sizeof(v));
        CEF_JStr(data, "a", a, sizeof(a));
        CEF_JStr(data, "s", s, sizeof(s));
        new i = CEF_JInt(data, "i", -1);
        if (v[0] == EOS) return 1;
        CEFUI_Route(playerid, v, a, i, s);
        return 1;
    }
    return 1;
}

/* =====================================================================
   DIALOG SA-MP  vs  WEBVIEW
   Saat server menampilkan dialog SA-MP (RPC 61 ShowDialog), panel CEF
   disembunyikan sementara & tidak menangkap sentuhan agar dialog bisa
   dipakai. Dipulihkan otomatis saat dialog dijawab / ditutup.
   (Status dikirim tertunda 1 tick agar dialog berantai tidak berkedip.)
   ===================================================================== */
static bool:gCEFDlgOpen[MAX_PLAYERS];
static bool:gCEFDlgWant[MAX_PLAYERS];
static bool:gCEFDlgTimer[MAX_PLAYERS];

stock CEF_DialogReset(playerid)
{
    gCEFDlgOpen[playerid] = false;
    gCEFDlgWant[playerid] = false;
    return 1;
}

stock CEF_DialogMark(playerid, bool:open)
{
    if (!(0 <= playerid < MAX_PLAYERS)) return 0;
    gCEFDlgWant[playerid] = open;
    if (!gCEFDlgTimer[playerid])
    {
        gCEFDlgTimer[playerid] = true;
        SetTimerEx("CEF_DialogApply", 1, false, "d", playerid);
    }
    return 1;
}

forward CEF_DialogApply(playerid);
public CEF_DialogApply(playerid)
{
    gCEFDlgTimer[playerid] = false;
    if (!IsPlayerConnected(playerid)) return 0;
    if (gCEFDlgOpen[playerid] == gCEFDlgWant[playerid]) return 1;
    gCEFDlgOpen[playerid] = gCEFDlgWant[playerid];
    J_Begin();
    J_Int("show", gCEFDlgOpen[playerid] ? 1 : 0);
    return J_Send(playerid, "dlg");
}

ORPC:61(playerid, BitStream:bs) // ShowPlayerDialog / sembunyikan dialog (id -1)
{
    new dialogid;
    BS_ReadInt16(bs, dialogid);
    BS_ResetReadPointer(bs);
    CEF_DialogMark(playerid, dialogid >= 0);
    return 1;
}

hook OnDialogResponse(playerid, dialogid, response, listitem, inputtext[])
{
    CEF_DialogMark(playerid, false);
    return 1;
}

/* Tutup paksa dialog SA-MP & pulihkan layer CEF yang disembunyikan (body.dlg-open).
   Dipakai saat pemain membuka HP: kalau status "dialog terbuka" nyangkut
   (dialog tidak pernah dijawab), layar HP ikut tersembunyi walau sudah dibuka. */
stock CEF_DialogForceClose(playerid)
{
    if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return 0;
    if (gCEFDlgOpen[playerid] || gCEFDlgWant[playerid])
        ShowPlayerDialog(playerid, -1, DIALOG_STYLE_MSGBOX, " ", " ", " ", "");
    gCEFDlgOpen[playerid] = false;
    gCEFDlgWant[playerid] = false;
    J_Begin();
    J_Int("show", 0);
    return J_Send(playerid, "dlg");
}

/* Error JavaScript dari WebView (bridge.js) -> server_log.txt dengan awalan [CEF-JS].
   Dibatasi 20 baris per pemain per menit supaya log tidak banjir. */
static gCEFJsLogWin[MAX_PLAYERS], gCEFJsLogCount[MAX_PLAYERS];

stock CEF_JsLog(playerid, const a[], const s[])
{
    new now = gettime();
    if (now - gCEFJsLogWin[playerid] >= 60) { gCEFJsLogWin[playerid] = now; gCEFJsLogCount[playerid] = 0; }
    if (++gCEFJsLogCount[playerid] > 20) return 1;
    new name[MAX_PLAYER_NAME + 1], msg[260];
    GetPlayerName(playerid, name, sizeof(name));
    // hanya karakter aman (tanpa % supaya tidak dianggap format oleh plugin log)
    new j = 0;
    for (new i = 0; s[i] != EOS && j < sizeof(msg) - 1; i++)
    {
        new c = s[i];
        if (c < 32 || c > 126 || c == '%') c = ' ';
        msg[j++] = c;
    }
    msg[j] = EOS;
    printf("[CEF-JS] %s(%d) %s: %s", name, playerid, a, msg);
    if (CEF_Echoing(playerid) && ++gCEFEchoCount[playerid] <= 4)
    {
        new line[144], kind[24];
        format(kind, sizeof(kind), "%s", a);
        CEF_SafeText(kind);
        format(line, sizeof(line), "[CEF-JS] %s: %s", kind, msg);
        SendClientMessage(playerid, 0xFF8080FF, line);
    }
    return 1;
}

/* =====================================================================
   TES JALUR SERVER <-> UI  (/cefcek, dan otomatis saat layar HP tidak tampil)
   ---------------------------------------------------------------
   Butuh UI build v29+. Semua paket uji aman: tidak ada paket berurutan > CEF_WHOLE_MAX.
   Lewat antrean event aktif (berurutan, seperti event biasa):
     1 kecil         : "diag" ±15 byte
     2 4KB-dipotong  : "diag" 4 KB lewat jalur normal (dipotong CEF_CHUNK_SIZE)
     3 dataHP        : data buka HP lengkap lewat jalur normal
     4 ping-phone    : {t:"ping"} ke modul HP dengan nama event "phone"
     5 ping-eph      : sama dengan nama "eph"
   Tanpa antrean (UNRELIABLE, dikirim 2x) -> tidak bisa menahan event lain:
     6..8 utuh360B / utuh440B / utuh510B : paket utuh ukuran tertentu (cari batas ukuran)
   bridge.js / phone_core.js membalas lewat DUA jalur: event "ui" dan event "diag". Setelah
   3 detik hasil + kesimpulan ditulis ke server_log.txt ([CEF]) dan ke chat pemain.
   Bila paket berurutan tidak sampai padahal UI hidup (paket tanpa antrean sampai / detak UI
   baru), antrean dianggap macet -> CEFX_ChannelStall (pindah antrean + kirim ulang tampilan).
   ===================================================================== */
static gCEFDiagPad[4100];
static const gCEFProbeSize[3] = {360, 440, 510};
forward CEF_DiagReport(playerid, seq);

stock bool:CEF_DiagRunning(playerid)
{
    return (0 <= playerid < MAX_PLAYERS) && gCEFDiagRun[playerid];
}

// isi gCEFDiagPad dengan len karakter (untuk menguji paket besar)
static stock CEF_DiagFill(len)
{
    if (len < 0) len = 0;
    if (len > sizeof(gCEFDiagPad) - 1) len = sizeof(gCEFDiagPad) - 1;
    for (new i = 0; i < len; i++) gCEFDiagPad[i] = 'a' + (i % 26);
    gCEFDiagPad[len] = EOS;
    return 1;
}

stock CEF_DiagStart(playerid, const why[])
{
    if (!(0 <= playerid < MAX_PLAYERS) || !IsPlayerConnected(playerid)) return 0;
    if (gCEFDiagRun[playerid]) return 0;
    if (!gCEFReady[playerid])
    {
        CEF__Log(playerid, "tes jalur UI dibatalkan: halaman UI belum siap (belum ada event ready)");
        SendClientMessage(playerid, 0xFFD24DFF, "[CEF] Tes jalur UI dibatalkan: halaman UI di HP belum siap (belum mengirim ready).");
        return 0;
    }
    if (!gCEFChunk[playerid])
    {
        // UI v28 ke bawah tidak punya penerima "diag": hasil tes pasti GAGAL semua & menyesatkan
        new msg[144];
        format(msg, sizeof(msg), "[CEF] UI di HP masih versi %s (butuh %s): tes jalur belum ada. Upload folder cefui terbaru, lalu buka ulang game.", gCEFVer[playerid], CEF_UI_VERSION);
        SendClientMessage(playerid, 0xFFD24DFF, msg);
        CEF__Log(playerid, "tes jalur UI dibatalkan: UI di client versi lama (belum v29)");
        return 0;
    }
    gCEFDiagRun[playerid] = true;
    gCEFDiagSeq[playerid] = (gCEFDiagSeq[playerid] % 90000) + 1;
    gCEFDiagTick[playerid] = GetTickCount();
    format(gCEFDiagWhy[playerid], sizeof(gCEFDiagWhy[]), "%s", why);
    gCEFDiagInfo[playerid][0] = EOS;
    for (new k = 0; k < CEF_DIAG_PROBES; k++)
    {
        gCEFDiagGot[playerid][k] = 0;
        gCEFDiagMs[playerid][k] = 0;
        gCEFDiagLen[playerid][k] = 0;
    }
    CEF_TraceOn(playerid, 8000);
    new base = gCEFDiagSeq[playerid] * 10;

    // 1: kecil
    J_Begin(); J_Int("n", base + 1);
    J_Send(playerid, "diag");
    gCEFDiagLen[playerid][0] = J_Length();

    // 2: 4 KB lewat jalur normal (dipotong jadi paket kecil)
    CEF_DiagFill(4000);
    J_Begin(); J_Int("n", base + 2); J_Str("pad", gCEFDiagPad);
    J_Send(playerid, "diag");
    gCEFDiagLen[playerid][1] = J_Length();

    // 3: data buka HP lengkap lewat jalur normal
    gCEFDiagLen[playerid][2] = Phone_DiagShow(playerid, base + 3);

    // 4, 5: "ping" ke modul HP dengan nama event "phone" dan "eph" (dijawab phone_core.js)
    J_Begin(); J_Str("t", "ping"); J_Int("n", base + 4);
    J_SendWhole(playerid, "phone");
    gCEFDiagLen[playerid][3] = J_Length();
    J_Begin(); J_Str("t", "ping"); J_Int("n", base + 5);
    J_SendWhole(playerid, "eph");
    gCEFDiagLen[playerid][4] = J_Length();

    // 6..8: paket utuh ukuran tertentu, UNRELIABLE (tanpa antrean) dan dikirim 2x
    for (new p = 0; p < 3; p++)
    {
        new nn = base + 6 + p, digits[12];
        valstr(digits, nn);
        // {"n":<nn>,"pad":"<isi>"} = 15 + digit + isi
        CEF_DiagFill(gCEFProbeSize[p] - 15 - strlen(digits));
        J_Begin(); J_Int("n", nn); J_Str("pad", gCEFDiagPad);
        J_Close();
        CEFX_SendProbe(playerid, "diag", gJ, gJLen);
        CEFX_SendProbe(playerid, "diag", gJ, gJLen);
        gCEFDiagLen[playerid][5 + p] = gJLen;
    }

    new msg[120];
    format(msg, sizeof(msg), "tes jalur UI dimulai (%s), ch=%d", why, gCEFChan[playerid]);
    CEF__Log(playerid, msg);
    SetTimerEx("CEF_DiagReport", 3000, false, "dd", playerid, gCEFDiagSeq[playerid]);
    return 1;
}

// balasan dari UI: channel 1 = lewat event "ui", 2 = lewat event "diag"
stock CEF_DiagReply(playerid, n, channel, const info[])
{
    if (!(0 <= playerid < MAX_PLAYERS)) return 0;
    new seq = n / 10, k = (n % 10) - 1;
    if (seq != gCEFDiagSeq[playerid] || !(0 <= k < CEF_DIAG_PROBES)) return 1;
    if (!gCEFDiagGot[playerid][k]) gCEFDiagMs[playerid][k] = GetTickCount() - gCEFDiagTick[playerid];
    gCEFDiagGot[playerid][k] |= channel;
    format(gCEFDiagInfo[playerid], sizeof(gCEFDiagInfo[]), "%s", info);
    CEF_SafeText(gCEFDiagInfo[playerid]);
    return 1;
}

public CEF_DiagReport(playerid, seq)
{
    if (!IsPlayerConnected(playerid) || seq != gCEFDiagSeq[playerid]) return 0;
    gCEFDiagRun[playerid] = false;
    static const label[CEF_DIAG_PROBES][] = {"kecil", "4KB-dipotong", "dataHP", "ping-phone", "ping-eph", "utuh360B", "utuh440B", "utuh510B"};
    new line[360], chat1[144], chat2[144], part[48];
    format(line, sizeof(line), "Tes UI (%s, ch=%d):", gCEFDiagWhy[playerid], gCEFChan[playerid]);
    chat1 = "[CEF] Tes UI:";
    chat2 = "[CEF]";
    for (new k = 0; k < CEF_DIAG_PROBES; k++)
    {
        switch (gCEFDiagGot[playerid][k])
        {
            case 3: format(part, sizeof(part), " %s=OK(%dms)", label[k], gCEFDiagMs[playerid][k]);
            case 1: format(part, sizeof(part), " %s=hanya-ui", label[k]);
            case 2: format(part, sizeof(part), " %s=hanya-diag", label[k]);
            default: format(part, sizeof(part), " %s=GAGAL(%dB)", label[k], gCEFDiagLen[playerid][k]);
        }
        strcat(line, part, sizeof(line));
        if (k < 4) strcat(chat1, part, sizeof(chat1));
        else strcat(chat2, part, sizeof(chat2));
    }
    CEF__Log(playerid, line);
    SendClientMessage(playerid, 0xFFD24DFF, chat1);
    SendClientMessage(playerid, 0xFFD24DFF, chat2);

    // kesimpulan singkat
    new bool:ok[CEF_DIAG_PROBES];
    for (new k = 0; k < CEF_DIAG_PROBES; k++) ok[k] = (gCEFDiagGot[playerid][k] != 0);
    new bool:ordered = (ok[0] || ok[1] || ok[2] || ok[3] || ok[4]);
    new bool:loose = (ok[5] || ok[6] || ok[7]);
    new hb = CEF_HbAge(playerid);
    new bool:alive = (loose || (0 <= hb < 45));
    new verdict[144];
    if (!ok[0] && alive)
    {
        // UI hidup tapi event berurutan tidak sampai: antrean macet -> pindah antrean
        switch (CEFX_ChannelStall(playerid, "tes UI"))
        {
            case 1: format(verdict, sizeof(verdict), "Kesimpulan: antrean event UI macet -> dipindah ke antrean %d, tampilan dikirim ulang.", gCEFChan[playerid]);
            case 2: format(verdict, sizeof(verdict), "Kesimpulan: antrean event UI macet; baru saja dipindah ke antrean %d, tunggu 20 detik lalu tes lagi.", gCEFChan[playerid]);
            default: verdict = "Kesimpulan: antrean event UI macet dan antrean cadangan habis. Keluar lalu masuk ulang server.";
        }
    }
    else if (!ordered && !alive) verdict = "Kesimpulan: halaman UI tidak merespons sama sekali (tanpa detak). Ketik /uireload.";
    else if (!ok[0]) verdict = "Kesimpulan: event kecil gagal tapi event lain sampai - jalur tidak stabil.";
    else if (!ok[1]) verdict = "Kesimpulan: event besar yang dipotong tidak sampai utuh.";
    else if (!ok[2]) verdict = "Kesimpulan: event kecil & besar sampai, tapi data HP tidak sampai.";
    else if (!ok[3] && ok[4]) verdict = "Kesimpulan: event bernama 'phone' tidak sampai ke modul HP; nama 'eph' sampai (dipakai).";
    else if (!ok[3] && !ok[4]) verdict = "Kesimpulan: jalur UI normal, tapi modul HP tidak menjawab (lihat 'hp=' di status UI).";
    else verdict = "Kesimpulan: jalur server <-> UI normal.";
    CEF__Log(playerid, verdict);
    SendClientMessage(playerid, 0xFFD24DFF, verdict);

    // batas ukuran paket utuh (paket uji tanpa antrean)
    new sizes[144], hbText[24];
    if (hb < 0) hbText = "belum ada";
    else format(hbText, sizeof(hbText), "%d dtk lalu", hb);
    format(sizes, sizeof(sizes), "[CEF] Paket utuh tanpa antrean: 360B=%s 440B=%s 510B=%s | detak UI: %s | antrean: %d",
        ok[5] ? ("OK") : ("GAGAL"), ok[6] ? ("OK") : ("GAGAL"), ok[7] ? ("OK") : ("GAGAL"), hbText, gCEFChan[playerid]);
    CEF__Log(playerid, sizes[6]);
    SendClientMessage(playerid, 0xFFD24DFF, sizes);

    new info[CEF_DIAG_INFO + 40];
    if (gCEFDiagInfo[playerid][0] == EOS)
    {
        CEF__Log(playerid, "status UI: TIDAK ADA BALASAN dari halaman UI");
        SendClientMessage(playerid, 0xFFD24DFF, "[CEF] Halaman UI tidak membalas tes.");
        return 1;
    }
    format(info, sizeof(info), "status UI: %s", gCEFDiagInfo[playerid]);
    CEF__Log(playerid, info);
    // ke chat: dipotong per 120 karakter, maks. 3 baris
    new len = strlen(gCEFDiagInfo[playerid]), chunk[132];
    for (new off = 0, l = 0; off < len && l < 3; off += 120, l++)
    {
        strmid(chunk, gCEFDiagInfo[playerid], off, off + 120, sizeof(chunk));
        SendClientMessage(playerid, 0xC8C8C8FF, chunk);
    }
    return 1;
}

// jejak event masuk: nama event + (untuk "ui") tampilan & aksi saja - teks isian tidak dicatat
stock CEF_TraceIn(playerid, const event[], const data[])
{
    new name[MAX_PLAYER_NAME + 1], v[24], a[24], i[12], ev[24];
    GetPlayerName(playerid, name, sizeof(name));
    format(ev, sizeof(ev), "%s", event);
    CEF_SafeText(ev);
    if (!strcmp(event, "ui", true))
    {
        CEF_JStr(data, "v", v, sizeof(v));
        CEF_JStr(data, "a", a, sizeof(a));
        CEF_JStr(data, "i", i, sizeof(i));
        CEF_SafeText(v); CEF_SafeText(a); CEF_SafeText(i);
        printf("[CEF-IN] %s(%d) ui v=%s a=%s i=%s", name, playerid, v, a, i);
    }
    else printf("[CEF-IN] %s(%d) %s %d byte", name, playerid, ev, strlen(data));
    return 1;
}

// Waktu sejak detak UI terakhir (detik), -1 bila belum pernah
stock CEF_HbAge(playerid)
{
    if (!(0 <= playerid < MAX_PLAYERS) || gCEFHbTick[playerid] == 0) return -1;
    return (GetTickCount() - gCEFHbTick[playerid]) / 1000;
}

/* Detak antrean (UI v30+). Setiap detak UI (5 dtk setelah siap, lalu tiap 15 dtk) server
   mengirim event kecil "hbq" {q} lewat antrean event aktif. Detak berikutnya membawa q terakhir
   yang diterima UI. Bila q tidak maju padahal "hbq" sudah dikirim >= 12 dtk sebelumnya,
   antrean itu macet (UI hidup, tapi event server tidak sampai) -> CEFX_ChannelStall. */
stock CEFX_ResetHbQuery(playerid)
{
    if (!(0 <= playerid < MAX_PLAYERS)) return 0;
    gCEFQWant[playerid] = 0;
    gCEFQTick[playerid] = 0;
    return 1;
}
static stock CEFX_OnHeartbeat(playerid, q)
{
    if (gCEFVerNum[playerid] < 30 || !gCEFReady[playerid]) return 0;
    if (gCEFQWant[playerid] > 0 && q < gCEFQWant[playerid])
    {
        // "hbq" terakhir belum sampai: tunggu detak berikutnya bila masih baru (< 12 dtk)
        if (GetTickCount() - gCEFQTick[playerid] < 12000) return 1;
        CEFX_ChannelStall(playerid, "detak UI: event server tidak sampai");
    }
    gCEFQSeq[playerid] = (gCEFQSeq[playerid] % 1000000) + 1;
    gCEFQWant[playerid] = gCEFQSeq[playerid];
    gCEFQTick[playerid] = GetTickCount();
    J_Begin();
    J_Int("q", gCEFQSeq[playerid]);
    return J_Send(playerid, "hbq");
}
