/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : bridge.js
   Jembatan ke client Android (CefManager.kt / JsBridge.kt):
     server -> JS : Kotlin memanggil  window.Cef._trigger('event', 'json')
     JS -> server : window.CefBridge.sendClientEvent(event, jsonString)
     siap         : window.CefBridge.cefReady()  (mengirim antrian event)
     sentuhan     : window.CefBridge.updateInteractiveAreas('[[x,y,w,h],..]')
                    -> hanya area ini yang menangkap sentuhan, sisanya ke game.
   ===================================================================== */
(function () {
  "use strict";

  var handlers = {};
  var pendingEvents = {};
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
    var msg = String(m == null ? "" : m).replace(/[\u0000-\u001f"\\%]+/g, " ").slice(0, 240);
    try { sendRaw("ui", { v: "jslog", a: String(kind), i: "-1", s: msg }); } catch (e) {}
  }

  /* ------------------------ server -> JS ------------------------ */
  var Cef = window.Cef = window.Cef || {};
  Cef._events = handlers;
  Cef._trigger = function (ev, data) {
    var p = data;
    if (typeof data === "string") {
      if (!data.length) p = {};
      else {
        try { p = JSON.parse(data); }
        catch (e) { report("json", ev + " " + e.message); return; }
      }
    }
    var list = handlers[ev];
    if (!list || !list.length) {
      var q = pendingEvents[ev] || (pendingEvents[ev] = []);
      q.push(p || {});
      if (q.length > 8) q.shift();
      return;
    }
    for (var i = 0; i < list.length; i++) {
      try { list[i](p || {}); }
      catch (e) { report("handler", ev + " " + (e && e.stack || e)); }
    }
    Touch.schedule();
  };
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

  /* ------------------------ runtime diagnostics ------------------------ */
  window.addEventListener("error", function (e) {
    try {
      var f = String(e.filename || "").replace(/^.*\//, "");
      report("error", String(e.message || e.error || "unknown") + " @ " + f + ":" + String(e.lineno || 0));
    } catch (_) {}
  });
  window.addEventListener("unhandledrejection", function (e) {
    try { report("promise", String(e.reason && (e.reason.stack || e.reason.message) || e.reason || "unknown")); } catch (_) {}
  });

  /* ------------------------ siap ------------------------ */
  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    try { if (window.CefBridge && window.CefBridge.cefReady) window.CefBridge.cefReady(); } catch (e) {}
    sendRaw("ready", { w: window.innerWidth, h: window.innerHeight });
    Touch.schedule();
    log("EAGLE UI siap (" + window.innerWidth + "x" + window.innerHeight + ")");
  }

  window.EAGLE = {
    on: Cef.on,
    send: send,
    sendRaw: sendRaw,
    log: log,
    report: report,
    touch: function () { Touch.schedule(); },
    boot: boot
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 0); });
  else setTimeout(boot, 0);
})();
