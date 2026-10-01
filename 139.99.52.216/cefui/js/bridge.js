/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : bridge.js   (UI build v34)
   Jembatan ke client Android (CefManager.kt / JsBridge.kt):
     server -> JS : Kotlin memanggil  window.Cef._trigger('event', 'json')
     JS -> server : window.CefBridge.sendClientEvent(event, jsonString)
     siap         : window.CefBridge.cefReady()  (mengirim antrian event)
     sentuhan     : window.CefBridge.updateInteractiveAreas('[[x,y,w,h],..]')
                    -> hanya area ini yang menangkap sentuhan, sisanya ke game.

   Pemeriksaan pemuatan (v28):
     - index.html mencatat file CSS/JS yang gagal dimuat (window.__eagleBoot.fail).
     - setiap modul memanggil EAGLE.done("nama") di baris terakhirnya.
     - saat siap: bila ada file gagal -> halaman dimuat ulang dengan token cache
       baru (maks. 2x). Event "ready" membawa versi UI, modul yang tidak aktif,
       file yang gagal, dan error pertama -> server menulis baris [CEF].
   ===================================================================== */
(function () {
  "use strict";

  var BUILD = "v34";
  var BOOT = window.__eagleBoot || (window.__eagleBoot = { build: BUILD, q: "", fail: [], t0: Date.now() });

  function resName(u) { return String(u || "").replace(/[?#].*$/, "").replace(/^.*\/(css|js)\//, "$1/"); }
  function fileName(u) { return String(u || "").replace(/[?#].*$/, "").replace(/^.*\//, ""); }
  function clip(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) : s; }
  function uniq(a) { var o = [], seen = {}; for (var i = 0; i < a.length; i++) if (!seen[a[i]]) { seen[a[i]] = 1; o.push(a[i]); } return o; }

  // halaman pratinjau tanpa pemuat index.html: pasang sendiri pencatat file gagal
  if (!BOOT.capture) {
    BOOT.capture = true;
    window.addEventListener("error", function (e) {
      var el = e && e.target;
      if (!el || el === window || !el.tagName) return;
      var tag = String(el.tagName).toUpperCase();
      if (tag !== "SCRIPT" && tag !== "LINK") return;
      var u = String(el.src || el.href || "");
      if (u.indexOf("fonts.g") >= 0) return;
      BOOT.fail.push(resName(u));
    }, true);
  }

  var handlers = {};
  var pendingEvents = {};
  var done = { bridge: 1 };       // modul yang selesai dimuat (EAGLE.done)
  var jsErrors = [];              // ringkasan error JS (maks. 6)
  var hasBridge = function () { return !!(window.CefBridge && window.CefBridge.sendClientEvent); };

  function log(m) {
    try { if (window.CefBridge && window.CefBridge.log) window.CefBridge.log(String(m)); } catch (e) {}
    if (!hasBridge()) console.log("[EAGLE] " + m);
  }
  // error JS dikirim juga ke server -> server_log.txt baris [CEF-JS] (maks 8 per menit)
  var errWin = 0, errCount = 0;
  function report(kind, m) {
    log(kind + ": " + m);
    var now = Date.now();
    if (now - errWin > 60000) { errWin = now; errCount = 0; }
    if (++errCount > 8) return;
    var msg = clip(String(m == null ? "" : m).replace(/[\u0000-\u001f"\\%]+/g, " "), 240);
    try { sendRaw("ui", { v: "jslog", a: String(kind), i: "-1", s: msg }); } catch (e) {}
  }
  // ringkasan status pemuatan untuk laporan
  function loadStatus() {
    var exp = window.__eagleJs || [], miss = [];
    for (var i = 0; i < exp.length; i++) if (!done[exp[i]]) miss.push(exp[i]);
    return {
      miss: miss,
      fail: uniq(BOOT.fail),
      err: jsErrors[0] || ""
    };
  }

  /* ------------------------ catatan event (untuk tes /cefcek) ------------------------ */
  var recv = {}, recvOrder = [], parseFail = {}, t0 = Date.now();
  var rawCount = 0;     // paket dari server (termasuk potongan "_ck")
  var lastQ = 0;        // nomor "hbq" terakhir dari server (dikirim balik di detak)
  function diagClean(s, n) { return clip(String(s == null ? "" : s).replace(/[\u0000-\u001f"\\%]+/g, " "), n); }
  function diagStatus() {
    var parts = [], pf = [], k;
    for (k in recv) if (recv.hasOwnProperty(k)) parts.push(k + ":" + recv[k]);
    for (k in parseFail) if (parseFail.hasOwnProperty(k)) pf.push(k + ":" + parseFail[k]);
    var st = loadStatus(), ph = "-";
    try { if (window.EAGLE && window.EAGLE.phoneState) ph = window.EAGLE.phoneState(); } catch (e) { ph = "error"; }
    var body = document.body;
    // urutan penting dulu (server menyimpan ±360 karakter pertama)
    return BUILD + " hp=" + ph + " dlg=" + (body && body.classList.contains("dlg-open") ? 1 : 0) + " pk=" + rawCount + " q=" + lastQ +
      " terima=" + (parts.join(",") || "-") +
      (pf.length ? " jsonrusak=" + pf.join(",") : "") +
      (st.miss.length ? " modulmati=" + st.miss.join(",") : "") + (jsErrors.length ? " error=" + jsErrors[jsErrors.length - 1] : "") +
      " vis=" + (document.visibilityState || "?") + " up=" + Math.round((Date.now() - t0) / 1000) + "s" +
      " wh=" + window.innerWidth + "x" + window.innerHeight + " urutan=" + (recvOrder.join(">") || "-");
  }

  /* ------------------------ event besar yang dipotong server ------------------------
     Event > ±260 byte dikirim server sebagai beberapa event "_ck" berisi teks mentah
     "id|urutan|jumlah|namaEvent|potongan". Setelah semua potongan tiba, isinya digabung
     lalu diproses seperti event biasa. Paket yang lebih besar dari MTU SA-MP dipecah RakNet
     dan tidak pernah sampai di client Android ini (lalu menahan semua event sesudahnya),
     jadi server tidak lagi mengirim paket besar utuh. */
  var chunks = {};
  function onChunk(raw) {
    raw = String(raw == null ? "" : raw);
    var p1 = raw.indexOf("|"), p2 = raw.indexOf("|", p1 + 1), p3 = raw.indexOf("|", p2 + 1), p4 = raw.indexOf("|", p3 + 1);
    if (p1 < 1 || p2 < 0 || p3 < 0 || p4 < 0) { report("chunk", "format potongan rusak: " + raw.slice(0, 60)); return; }
    var id = raw.slice(0, p1), k = parseInt(raw.slice(p1 + 1, p2), 10), n = parseInt(raw.slice(p2 + 1, p3), 10);
    var ev = raw.slice(p3 + 1, p4), part = raw.slice(p4 + 1), now = Date.now();
    if (!(n > 0) || !(k >= 0) || k >= n || !ev) { report("chunk", "header potongan rusak: " + raw.slice(0, 60)); return; }
    for (var old in chunks) if (chunks.hasOwnProperty(old) && now - chunks[old].t > 30000) {
      report("chunk", "potongan " + chunks[old].ev + " tidak lengkap (" + chunks[old].got + "/" + chunks[old].n + ")");
      delete chunks[old];
    }
    var c = chunks[id] || (chunks[id] = { n: n, ev: ev, parts: [], got: 0, t: now });
    if (c.parts[k] == null) { c.parts[k] = part; c.got++; }
    if (c.got >= c.n) {
      delete chunks[id];
      dispatch(ev, c.parts.join(""));
    }
  }

  /* ------------------------ server -> JS ------------------------ */
  var Cef = window.Cef = window.Cef || {};
  Cef._events = handlers;
  // dipanggil Kotlin (CefManager.evaluateJs) untuk setiap paket dari server
  Cef._trigger = function (ev, data) {
    rawCount++;
    if (ev === "_ck") {
      recv._ck = (recv._ck || 0) + 1;
      onChunk(data);
      return;
    }
    dispatch(ev, data);
  };
  var zeroFix = 0;
  // Hapus nol di depan angka di luar string JSON. "0", "0.5" dan "-0.5" tetap.
  function fixZeros(t) {
    var out = "", i = 0, n = t.length, inStr = false, c;
    while (i < n) {
      c = t.charAt(i);
      if (inStr) {
        out += c;
        if (c === "\\" && i + 1 < n) { out += t.charAt(i + 1); i += 2; continue; }
        if (c === '"') inStr = false;
        i++; continue;
      }
      if (c === '"') { inStr = true; out += c; i++; continue; }
      if ((c >= "0" && c <= "9") || (c === "-" && i + 1 < n && t.charAt(i + 1) >= "0" && t.charAt(i + 1) <= "9")) {
        var j = i, num = "";
        if (c === "-") { num = "-"; j++; }
        var k = j;
        while (k < n && t.charAt(k) === "0") k++;
        if (k > j && !(k < n && t.charAt(k) >= "1" && t.charAt(k) <= "9")) k--; // sisakan satu nol ("0", "0.5")
        while (k < n && /[0-9.eE+\-]/.test(t.charAt(k))) num += t.charAt(k++);
        out += num; i = k; continue;
      }
      out += c; i++;
    }
    return out;
  }
  function dispatch(ev, data) {
    recv[ev] = (recv[ev] || 0) + 1;
    recvOrder.push(ev);
    if (recvOrder.length > 10) recvOrder.shift();
    var p = data;
    if (typeof data === "string") {
      if (!data.length) p = {};
      else {
        try { p = JSON.parse(data); }
        catch (e) {
          // v31: server lama bisa mengirim angka ber-nol-depan ("now":000001790800) -> perbaiki lalu coba lagi
          var fixed = null;
          try { fixed = JSON.parse(fixZeros(data)); } catch (e2) { fixed = null; }
          if (fixed === null) {
            parseFail[ev] = (parseFail[ev] || 0) + 1;
            report("json", ev + " (" + data.length + " B) " + e.message + " | awal: " + data.slice(0, 80));
            return;
          }
          zeroFix++;
          if (zeroFix === 1) report("json0", ev + ": angka ber-nol-depan diperbaiki di UI (update server)");
          p = fixed;
        }
      }
    }
    var list = handlers[ev];
    if (!list || !list.length) {
      var q = pendingEvents[ev] || (pendingEvents[ev] = []);
      q.push(p || {});
      if (q.length > 8) q.shift();
      noReceiver(ev);
      return;
    }
    for (var i = 0; i < list.length; i++) {
      try { list[i](p || {}); }
      catch (e) { report("handler", ev + " " + (e && e.stack || e)); }
    }
    Touch.schedule();
  }
  Cef.on = function (ev, cb) {
    if (typeof cb !== "function") return;
    (handlers[ev] = handlers[ev] || []).push(cb);
    var q = pendingEvents[ev];
    if (q && q.length) {
      var copy = q.splice(0, q.length);
      for (var j = 0; j < copy.length; j++) {
        try { cb(copy[j] || {}); }
        catch (e) { report("handler", ev + " " + (e && e.stack || e)); }
      }
      Touch.schedule();
    }
  };
  // event penting tanpa penerima = modulnya tidak termuat -> laporkan (maks. 1x / 30 dtk)
  var WATCH = { phone: "phone_core", eph: "phone_core" };
  var noRecvAt = {};
  function noReceiver(ev) {
    var mod = WATCH[ev];
    if (!mod || !booted) return;
    var now = Date.now();
    if (noRecvAt[ev] && now - noRecvAt[ev] < 30000) return;
    noRecvAt[ev] = now;
    var st = loadStatus();
    report("nohandler", "event " + ev + " tanpa penerima: modul " + mod + ".js " + (done[mod] ? "aktif" : "TIDAK aktif") +
      (st.fail.length ? " | gagal dimuat: " + st.fail.join(",") : "") + (st.err ? " | error: " + st.err : ""));
  }

  /* ------------------------ JS -> server ------------------------ */
  function sendRaw(event, obj) {
    var json = JSON.stringify(obj || {});
    if (hasBridge()) {
      try { window.CefBridge.sendClientEvent(event, json); return; } catch (e) { log("send gagal: " + e); }
    }
    console.log("[CEF -> server] " + event + " " + json);
    if (window.__eagleSent) window.__eagleSent.push([event, obj]);
  }
  // Semua aksi UI: {v: view, a: aksi, i: index, s: teks}. Nilai dikirim sbg string
  // (Gson mengubah angka jadi double; string tetap utuh).
  var lastSend = {};
  function send(v, a, i, s) {
    // tap ganda = aksi + index + isi yang sama dalam 180 ms
    var key = v + "|" + a + "|" + i + "|" + (s == null ? "" : String(s));
    var now = Date.now();
    if (lastSend[key] && now - lastSend[key] < 180) return; // cegah tap ganda
    lastSend[key] = now;
    sendRaw("ui", {
      v: String(v),
      a: String(a == null ? "" : a),
      i: String(i == null ? -1 : i),
      s: String(s == null ? "" : s)
    });
  }

  /* ------------------------ area sentuh ------------------------ */
  var Touch = {
    last: "",
    pending: false,
    visible: function (el) {
      if (!el.isConnected) return false;
      var st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) < 0.05) return false;
      var p = el.parentElement;
      while (p && p !== document.body) {
        var ps = window.getComputedStyle(p);
        if (ps.display === "none" || ps.visibility === "hidden") return false;
        p = p.parentElement;
      }
      return true;
    },
    compute: function () {
      var rects = [];
      var els = document.querySelectorAll("[data-touch]");
      for (var i = 0; i < els.length && rects.length < 64; i++) {
        var el = els[i];
        if (!Touch.visible(el)) continue;
        var r = el.getBoundingClientRect();
        if (r.width < 3 || r.height < 3) continue;
        rects.push([Math.max(0, Math.floor(r.left)), Math.max(0, Math.floor(r.top)),
                    Math.ceil(r.width), Math.ceil(r.height)]);
      }
      // Tanpa panel aktif: kirim 1 kotak mungil di pojok agar SEMUA sentuhan
      // lain diteruskan ke game (daftar kosong = WebView menangkap semuanya).
      if (!rects.length) rects.push([0, 0, 3, 3]);
      var s = JSON.stringify(rects);
      if (s === Touch.last) return;
      Touch.last = s;
      try {
        if (window.CefBridge && window.CefBridge.updateInteractiveAreas)
          window.CefBridge.updateInteractiveAreas(s);
      } catch (e) {}
    },
    schedule: function () {
      if (Touch.pending) return;
      Touch.pending = true;
      requestAnimationFrame(function () {
        Touch.pending = false;
        Touch.compute();
        // ulangi setelah animasi buka/tutup selesai
        clearTimeout(Touch._t);
        Touch._t = setTimeout(Touch.compute, 340);
      });
    }
  };
  window.addEventListener("resize", function () { Touch.schedule(); });
  // /cursor di server -> paksa kirim ulang area sentuh
  Cef.on("touchfix", function () { Touch.last = ""; Touch.compute(); });
  setInterval(function () { Touch.compute(); }, 1500);

  /* ------------------------ tes jalur server <-> UI (/cefcek) ------------------------
     Server mengirim event "diag" {n, pad?} dengan beberapa ukuran (+ "ping" ke modul HP lewat
     event "phone" dan "eph"). UI membalas lewat DUA jalur: event "ui" (jalur semua tombol)
     dan event "diag" (jalur terpisah), berisi jumlah event yang diterima per nama, status
     modul HP, dan error terakhir. */
  function diagReply(n, head) {
    n = String(n == null ? 0 : n);
    var info = diagClean((head ? head + " " : "") + diagStatus(), 700);
    try { sendRaw("ui", { v: "diag", a: "pong", i: n, s: info }); } catch (e) {}
    try { sendRaw("diag", { n: n, s: info }); } catch (e) {}
  }
  Cef.on("diag", function (d) {
    diagReply(d && d.n, "len=" + (d && d.pad ? String(d.pad).length : 0) + (d && d.t ? " t=" + d.t : ""));
  });
  // detak antrean (v30): server mengirim "hbq" {q} lewat antrean event; q dikirim balik di detak.
  // Bila q tidak maju, server tahu antrean itu macet lalu pindah ke antrean baru.
  Cef.on("hbq", function (d) { lastQ = +(d && d.q) || 0; });

  /* ------------------------ runtime diagnostics ------------------------ */
  window.addEventListener("error", function (e) {
    try {
      if (e && e.target && e.target !== window) return;       // file gagal dimuat: dicatat di BOOT.fail
      var f = fileName(e && e.filename);
      var line = String(e && e.message || e && e.error || "unknown") + " @ " + f + ":" + String(e && e.lineno || 0);
      if (jsErrors.length < 6) jsErrors.push(clip(line, 200));
      report("error", line);
    } catch (_) {}
  });
  window.addEventListener("unhandledrejection", function (e) {
    try { report("promise", String(e.reason && (e.reason.stack || e.reason.message) || e.reason || "unknown")); } catch (_) {}
  });

  /* ------------------------ siap ------------------------ */
  function qp(k) {
    var m = new RegExp("[?&]" + k + "=([^&#]*)").exec(location.search || "");
    try { return m ? decodeURIComponent(m[1]) : ""; } catch (e) { return ""; }
  }
  function withParams(u, o) {
    var hash = "", hi = u.indexOf("#");
    if (hi >= 0) { hash = u.slice(hi); u = u.slice(0, hi); }
    for (var k in o) {
      if (!o.hasOwnProperty(k)) continue;
      var re = new RegExp("([?&])" + k + "=[^&]*");
      var val = encodeURIComponent(o[k]);
      if (re.test(u)) u = u.replace(re, "$1" + k + "=" + val);
      else u += (u.indexOf("?") >= 0 ? "&" : "?") + k + "=" + val;
    }
    return u + hash;
  }

  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    var st = loadStatus();
    var rl = parseInt(qp("rl"), 10) || 0;
    // Ada file yang gagal dimuat (hosting sedang deploy / jaringan putus / 404 lama di cache):
    // muat ulang halaman dengan token cache baru. Maksimal 2x, lalu lanjut & laporkan.
    if (st.fail.length && rl < 2 && hasBridge() && /^https?:/.test(location.protocol)) {
      var list = st.fail.join(",");
      log("gagal memuat " + list + " - muat ulang halaman (" + (rl + 1) + "/2)");
      sendRaw("ui", { v: "cef", a: "reload", i: String(rl + 1), s: clip(list, 200) });
      setTimeout(function () {
        location.replace(withParams(location.href, { rl: String(rl + 1), r: Date.now().toString(36) }));
      }, 250);
      return;
    }
    try { if (window.CefBridge && window.CefBridge.cefReady) window.CefBridge.cefReady(); } catch (e) {}
    sendRaw("ready", {
      w: String(window.innerWidth), h: String(window.innerHeight), ver: BUILD,
      miss: clip(st.miss.join(","), 160), fail: clip(st.fail.join(","), 160),
      err: clip(String(st.err).replace(/[\u0000-\u001f"\\%]+/g, " "), 160), rl: String(rl)
    });
    Touch.schedule();
    log("EAGLE UI " + BUILD + " siap (" + window.innerWidth + "x" + window.innerHeight + ")" +
      (st.miss.length ? " modul tidak aktif: " + st.miss.join(",") : ""));
    // detak (5 dtk setelah siap, lalu tiap 15 dtk): server tahu UI masih hidup, event apa saja
    // yang sampai ke UI (ditampilkan /hpcek), dan apakah antrean event masih jalan (q)
    var beat = function () { try { sendRaw("diag", { n: "hb", q: String(lastQ), s: diagClean(diagStatus(), 700) }); } catch (e) {} };
    setTimeout(beat, 5000);
    setInterval(beat, 15000);
  }

  window.EAGLE = {
    build: BUILD,
    on: Cef.on,
    send: send,
    sendRaw: sendRaw,
    log: log,
    report: report,
    // modul memanggil EAGLE.done("nama") di baris terakhirnya (tanda dimuat sampai selesai)
    done: function (name) { done[String(name)] = 1; },
    isDone: function (name) { return !!done[String(name)]; },
    lastError: function () { return jsErrors.length ? jsErrors[jsErrors.length - 1] : ""; },
    status: loadStatus,
    diagStatus: diagStatus,
    diagReply: diagReply,
    touch: function () { Touch.schedule(); },
    boot: boot
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 0); });
  else setTimeout(boot, 0);
})();
