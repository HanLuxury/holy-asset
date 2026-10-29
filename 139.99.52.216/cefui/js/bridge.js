/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : bridge.js   (UI build v55)
   Jembatan ke client Android (CefManager.kt / JsBridge.kt):
     server -> JS : Kotlin memanggil  window.Cef._trigger('event', 'json')
     JS -> server : window.CefBridge.sendClientEvent(event, jsonString)
     siap         : window.CefBridge.cefReady()  (mengirim antrian event)
     sentuhan     : window.CefBridge.updateInteractiveAreas('{n:1,rects:[[nx,ny,nw,nh],..]}')
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

  var BUILD = (window.__eagleBoot && window.__eagleBoot.build) || "v157-dialog-response-fix";
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

  var handlers = Object.create(null);
  var pendingEvents = Object.create(null);
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
    // A failed stylesheet can be reported as HTTP 200 with invalid MIME by a
    // hosting fallback. Detect these, too, instead of showing unstyled nodes.
    var links = document.querySelectorAll('link[rel="stylesheet"][href*="/css/"]');
    for (var c = 0; c < links.length; c++) {
      if (!links[c].sheet) {
        var missingCss = resName(links[c].href);
        if (BOOT.fail.indexOf(missingCss) === -1) BOOT.fail.push(missingCss);
      }
    }
    return {
      miss: miss,
      fail: uniq(BOOT.fail),
      err: jsErrors[0] || ""
    };
  }

  /* ------------------------ catatan event (untuk tes /cefcek) ------------------------ */
  var recv = Object.create(null), recvOrder = [], parseFail = Object.create(null), t0 = Date.now();
  var rawCount = 0;     // paket dari server (termasuk potongan "_ck")
  var lastQ = 0;        // nomor "hbq" terakhir dari server (dikirim balik di detak)
  function diagClean(s, n) { return clip(String(s == null ? "" : s).replace(/[\u0000-\u001f"\\%]+/g, " "), n); }
  function diagStatus() {
    var parts = [], pf = [], k;
    for (k in recv) if (Object.prototype.hasOwnProperty.call(recv, k)) parts.push(k + ":" + recv[k]);
    for (k in parseFail) if (Object.prototype.hasOwnProperty.call(parseFail, k)) pf.push(k + ":" + parseFail[k]);
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
  var chunks = Object.create(null);
  function onChunk(raw) {
    raw = String(raw == null ? "" : raw);
    var p1 = raw.indexOf("|"), p2 = raw.indexOf("|", p1 + 1), p3 = raw.indexOf("|", p2 + 1), p4 = raw.indexOf("|", p3 + 1);
    if (p1 < 1 || p2 < 0 || p3 < 0 || p4 < 0) { report("chunk", "format potongan rusak: " + raw.slice(0, 60)); return; }
    var id = raw.slice(0, p1), k = parseInt(raw.slice(p1 + 1, p2), 10), n = parseInt(raw.slice(p2 + 1, p3), 10);
    var ev = raw.slice(p3 + 1, p4), part = raw.slice(p4 + 1), now = Date.now();
    if (!/^[0-9]{1,12}$/.test(id) || !/^[0-9]+$/.test(raw.slice(p1 + 1, p2)) || !/^[0-9]+$/.test(raw.slice(p2 + 1, p3)) || !(n > 0 && n <= 512) || !(k >= 0) || k >= n || !/^[A-Za-z0-9_.-]{1,127}$/.test(ev) || part.length > 1024) { report("chunk", "header potongan rusak: " + raw.slice(0, 60)); return; }
    for (var old in chunks) if (Object.prototype.hasOwnProperty.call(chunks, old) && now - chunks[old].t > 30000) {
      report("chunk", "potongan " + chunks[old].ev + " tidak lengkap (" + chunks[old].got + "/" + chunks[old].n + ")");
      delete chunks[old];
    }
    var c = chunks[id];
    if (c && (c.n !== n || c.ev !== ev)) { delete chunks[id]; report("chunk", "metadata potongan berubah"); return; }
    if (!c) {
      var keys = Object.keys(chunks);
      if (keys.length >= 32) delete chunks[keys[0]];
      c = chunks[id] = { n: n, ev: ev, parts: [], got: 0, bytes: 0, t: now };
    }
    if (c.parts[k] == null) { c.parts[k] = part; c.got++; c.bytes += part.length; c.t = now; }
    if (c.bytes > 32768) { delete chunks[id]; report("chunk", "event melebihi buffer server"); return; }
    if (c.got >= c.n) {
      delete chunks[id];
      dispatch(c.ev, c.parts.join(""));
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
    // Never use unchecked native event names as object keys or allocate
    // indefinitely for server events which have no registered listener.
    if (typeof ev !== "string" || !/^[A-Za-z0-9_.-]{1,127}$/.test(ev)) return;
    recv[ev] = (recv[ev] || 0) + 1;
    if (ev === "auth") authSeen = true;
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
      var q = pendingEvents[ev];
      if (!q) {
        // Bound the number of never-handled event names during reconnect.
        var names = Object.keys(pendingEvents);
        if (names.length >= 64) delete pendingEvents[names[0]];
        q = pendingEvents[ev] = [];
      }
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
    if (typeof ev !== "string" || !/^[A-Za-z0-9_.-]{1,127}$/.test(ev) || typeof cb !== "function") return;
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
  // SA-MP RakNet messages must not be sent as unbounded packets. The local
  // character/clothes events are intercepted natively and use a separate cap.
  // Outbound packet splitting requires matching C++/Pawn support; silently
  // splitting on the JS side would corrupt server actions.
  function utf8Bytes(s) {
    var n = 0;
    for (var j = 0; j < s.length; j++) {
      var c = s.charCodeAt(j);
      if (c < 128) n++;
      else if (c < 2048) n += 2;
      else if (c >= 0xd800 && c <= 0xdbff && j + 1 < s.length && s.charCodeAt(j + 1) >= 0xdc00 && s.charCodeAt(j + 1) <= 0xdfff) { n += 4; j++; }
      else n += 3;
    }
    return n;
  }
  var localNative = { clothes_native_state: 1, clothes_native_catalog: 1, eagle_character_local: 1 };
  function sendRaw(event, obj) {
    if (typeof event !== "string" || !/^[A-Za-z0-9_.-]{1,127}$/.test(event)) return false;
    var json;
    try { json = JSON.stringify(obj == null ? {} : obj); }
    catch (e) { log("payload JSON gagal " + event + ": " + e); return false; }
    if (typeof json !== "string") return false;
    var bytes = utf8Bytes(json), cap = localNative[event] ? 16384 : 1000;
    if (bytes > cap) {
      log("[CEF] blok payload terlalu besar " + event + " " + bytes + "/" + cap + " byte; perbaiki chunking native+Pawn");
      if (event !== "ui" || !(obj && obj.v === "jslog")) {
        report("oversize", event + " " + bytes + " B, tidak dikirim untuk mencegah split RakNet");
      }
      return false;
    }
    if (hasBridge()) {
      try { window.CefBridge.sendClientEvent(event, json); return true; }
      catch (e) { log("send gagal: " + e); return false; }
    }
    console.log("[CEF -> server] " + event + " bytes=" + bytes);
    if (window.__eagleSent) window.__eagleSent.push([event, obj]);
    return false;
  }
  // Semua aksi UI: {v: view, a: aksi, i: index, s: teks}. Nilai dikirim sbg string
  // (Gson mengubah angka jadi double; string tetap utuh).
  var lastSend = {};
  function send(v, a, i, s) {
    // tap ganda = aksi + index + isi yang sama dalam 180 ms
    // Never retain passwords as object keys in the duplicate-tap cache.
    var sensitive = (v === "auth" && (a === "loginpass" || a === "regpass"));
    var key = v + "|" + a + "|" + i + "|" + (sensitive ? "<secret>" : (s == null ? "" : String(s)));
    var now = Date.now();
    if (lastSend[key] && now - lastSend[key] < 180) return false; // cegah tap ganda
    if (Object.keys(lastSend).length > 128) lastSend = {};
    var sent = sendRaw("ui", {
      v: String(v),
      a: String(a == null ? "" : a),
      i: String(i == null ? -1 : i),
      s: String(s == null ? "" : s)
    });
    if (sent) lastSend[key] = now;
    return sent;
  }

  // V146: one owner for rendering, keyboard input and Android touch rectangles.
  // Do not derive ownership from computed visibility: a covered panel can still
  // be logically open and must return when the panel above it closes.
  var Surface = {
    owner: null,
    name: "game",
    covered: [],
    closed: function (el) {
      var c = el.classList;
      if (!c) return false;
      if (el.id === "auth") return !c.contains("on") || c.contains("au-under-editor");
      if (/^(inv|radial|eagle-dialog|eagle-vehicle-mods|vice-flight)$/.test(el.id)) return !c.contains("on");
      if (c.contains("panel-wrap")) return !c.contains("on");
      if (c.contains("eph")) return !c.contains("on") && !c.contains("peek");
      return c.contains("erp-transition-out");
    },
    choose: function () {
      var body = document.body, el;
      if (body.classList.contains("dlg-open")) return { name: "native", owner: null };
      var ids = ["vice-flight", "eagle-dialog"];
      var names = ["flight", "dialog"];
      for (var i = 0; i < ids.length; i++) {
        el = document.getElementById(ids[i]);
        if (el && !el.hidden && el.classList.contains("on")) return { name: names[i], owner: el };
      }
      el = document.querySelector(".erp-transition:not(.erp-transition-out)");
      if (el && !el.hidden) return { name: "arrival", owner: el };
      el = document.getElementById("eagle-character");
      if (el && !el.hidden) return { name: "character", owner: el };
      ids = ["eagle-vehicle-mods", "auth", "radial", "inv"];
      names = ["vehicle", "auth", "radial", "inventory"];
      for (var j = 0; j < ids.length; j++) {
        el = document.getElementById(ids[j]);
        if (el && !el.hidden && !Surface.closed(el)) return { name: names[j], owner: el };
      }
      return { name: "game", owner: null };
    },
    sync: function () {
      if (!document.body) return false;
      var next = Surface.choose(), covered = [], app = document.getElementById("app");
      var branch = null, exclusive = next.owner || next.name === "native";
      var aux = /^(dialog|character|vehicle|auth|radial|inventory)$/.test(next.name);
      if (exclusive && app) {
        for (var i = 0; i < app.children.length; i++) {
          var child = app.children[i];
          if (next.owner && (child === next.owner || child.contains(next.owner))) { branch = child; continue; }
          if (aux && (child.id === "toastlayer" || child.id === "fadelayer")) continue;
          covered.push(child);
        }
        // Auth, inventory and radial share screenlayer. Cover its other roots,
        // rather than hiding the layer containing the winning panel itself.
        if (branch && branch !== next.owner) {
          for (var j = 0; j < branch.children.length; j++) {
            var sibling = branch.children[j];
            if (sibling !== next.owner && !sibling.contains(next.owner)) covered.push(sibling);
          }
        }
      }
      var curtains = document.querySelectorAll(".erp-transition");
      for (var k = 0; k < curtains.length; k++) {
        if (exclusive && curtains[k] !== next.owner) covered.push(curtains[k]);
      }
      var changed = next.owner !== Surface.owner || next.name !== Surface.name;
      Surface.covered.forEach(function (el) {
        if (covered.indexOf(el) < 0) { el.removeAttribute("data-eagle-covered"); changed = true; }
      });
      covered.forEach(function (el) {
        if (!el.hasAttribute("data-eagle-covered")) { el.setAttribute("data-eagle-covered", ""); changed = true; }
      });
      Surface.owner = next.owner; Surface.name = next.name; Surface.covered = covered;
      if (document.body.getAttribute("data-eagle-surface") !== next.name) document.body.setAttribute("data-eagle-surface", next.name);
      var focus = document.activeElement;
      if (focus && covered.some(function (el) { return el === focus || el.contains(focus); })) {
        try { focus.blur(); } catch (_) {}
      }
      return changed;
    }
  };
  function canInteract(el, synced) {
    if (!synced) Surface.sync();
    if (!el || !el.isConnected || document.hidden || document.body.classList.contains("dlg-open")) return false;
    var p = el;
    while (p && p !== document.documentElement) {
      var st = window.getComputedStyle(p);
      if (p.hidden || p.inert || p.hasAttribute("data-eagle-covered") || Surface.closed(p) || st.display === "none" || st.visibility === "hidden" ||
          st.visibility === "collapse" || parseFloat(st.opacity) < .05) return false;
      p = p.parentElement;
    }
    var owner = Surface.owner;
    return !owner || owner === el || owner.contains(el);
  }

  /* ------------------------ area sentuh ------------------------ */
  var Touch = {
    last: "",
    pending: false,
    visible: function (el) {
      if (!canInteract(el, true)) return false;
      var st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility !== "visible" ||
          parseFloat(st.opacity) < 0.05 || st.pointerEvents === "none" || el.hidden || el.disabled) return false;
      var p = el.parentElement;
      while (p && p !== document.body) {
        var ps = window.getComputedStyle(p);
        // A hidden dialog/inventory/panel can keep pointer-events:auto on
        // children. Exclude those rects so Android does not steal GTA taps.
        if (ps.display === "none" || ps.visibility === "hidden" ||
            ps.visibility === "collapse" || parseFloat(ps.opacity) < 0.05 || p.hidden) return false;
        p = p.parentElement;
      }
      return true;
    },
    compute: function () {
      Surface.sync();
      var rects = [];
      var vw = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
      var vh = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
      var els = document.querySelectorAll("[data-touch]");
      for (var i = 0; i < els.length && rects.length < 64; i++) {
        var el = els[i];
        if (!Touch.visible(el)) continue;
        // A marked container already covers its scroll area and all child controls.
        var owner = el.parentElement && el.parentElement.closest("[data-touch]");
        if (owner && Touch.visible(owner)) continue;
        var r = el.getBoundingClientRect();
        if (r.width < 3 || r.height < 3) continue;
        // v38: kirim koordinat normalized. Android tidak lagi menebak skala
        // CSS menggunakan display density, yang sebelumnya bisa membesarkan
        // area sentuh HP sampai menutupi joystick GTA pada device tertentu.
        var left = Math.max(0, r.left), top = Math.max(0, r.top);
        var right = Math.min(vw, r.right), bottom = Math.min(vh, r.bottom);
        if (right - left < 3 || bottom - top < 3) continue;
        rects.push([left / vw, top / vh, (right - left) / vw, (bottom - top) / vh]);
      }
      // Tanpa panel aktif: kotak 3 CSS px di pojok. Area lain lewat ke game.
      if (!rects.length) rects.push([0, 0, Math.min(1, 3 / vw), Math.min(1, 3 / vh)]);
      var s = JSON.stringify({ n: 1, rects: rects });
      if (s === Touch.last) return;
      try {
        if (window.CefBridge && typeof window.CefBridge.updateInteractiveAreas === "function") {
          window.CefBridge.updateInteractiveAreas(s);
          // Cache only after successfully delivering to native. The bridge
          // can be injected after page load (or rebound on reconnect).
          Touch.last = s;
        }
      } catch (e) { Touch.last = ""; }
    },
    schedule: function () {
      // Closing or replacing an owner must release native input immediately.
      if (Surface.sync()) Touch.compute();
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
  window.addEventListener("resize", function () { Touch.last = ""; Touch.schedule(); });
  document.addEventListener("visibilitychange", function () {
    Touch.last = ""; Touch.compute();
  });
  // Also handle class/hidden changes made directly by the native WebView host.
  // Ignore text, item cells and animation updates inside the panels.
  if (window.MutationObserver && document.body) new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var el = records[i].target;
      if (el === document.body || el.id === "app" || el.parentElement && el.parentElement.id === "app" ||
          /^(auth|inv|radial|eagle-dialog|eagle-vehicle-mods|vice-flight)$/.test(el.id) ||
          el.classList && el.classList.contains("erp-transition")) { Touch.schedule(); break; }
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "hidden", "aria-hidden"] });
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
      if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
      var re = new RegExp("([?&])" + k + "=[^&]*");
      var val = encodeURIComponent(o[k]);
      if (re.test(u)) u = u.replace(re, "$1" + k + "=" + val);
      else u += (u.indexOf("?") >= 0 ? "&" : "?") + k + "=" + val;
    }
    return u + hash;
  }

  // Android may inject CefBridge after DOMContentLoaded. Sending ready to the
  // console before that bridge exists silently loses it, leaving all panels hidden.
  // Retry locally (no HTTP reload) until the native JS interface is available.
  var booted = false, bootWaitStarted = 0, bootWaitTimer = null;
  var authSeen = false, readyRetryCount = 0;
  function boot() {
    if (booted) return;
    if (!hasBridge()) {
      if (!bootWaitStarted) bootWaitStarted = Date.now();
      // Browser previews (without CefBridge) remain inspectable, but do not
      // claim native readiness or send fake UI events to the server.
      var elapsed = Date.now() - bootWaitStarted;
      // After 15s, keep checking at lower frequency. A very late bridge can
      // then recover login after server has switched to its fallback dialog.
      if (!bootWaitTimer) bootWaitTimer = setTimeout(function () { bootWaitTimer = null; boot(); }, elapsed < 15000 ? 250 : 1000);
      if (elapsed >= 15000 && !window.__eagleBootNoBridgeLogged) {
        window.__eagleBootNoBridgeLogged = true;
        log("CefBridge Android tidak tersedia; periksa injeksi JNI/WebView dan RPC Init");
      }
      return;
    }
    if (bootWaitTimer) { clearTimeout(bootWaitTimer); bootWaitTimer = null; }
    booted = true;
    Touch.last = ""; // force initial touch map even if pre-bridge geometry was cached
    var st = loadStatus();
    var rl = parseInt(qp("rl"), 10) || 0;
    // Missing CSS alone must NOT reload the whole WebView: a reload during a
    // city transfer can retrigger CEF ready/auth and be mistaken for reconnect.
    // A failed critical JS asset still gets up to two guarded cache-bust retries.
    var jsFail = st.fail.filter(function (name) { return /^js\/.*\.js$/i.test(name); });
    if (jsFail.length && rl < 2 && hasBridge() && /^https?:/.test(location.protocol)) {
      var list = jsFail.join(",");
      log("gagal memuat " + list + " - muat ulang halaman (" + (rl + 1) + "/2)");
      sendRaw("ui", { v: "cef", a: "reload", i: String(rl + 1), s: clip(list, 200) });
      setTimeout(function () {
        location.replace(withParams(location.href, { rl: String(rl + 1), r: Date.now().toString(36) }));
      }, 250);
      return;
    }
    if (st.fail.length && !jsFail.length) log("CSS gagal dimuat; WebView tidak di-reload, fallback UI tetap aktif: " + st.fail.join(","));
    try { if (window.CefBridge && window.CefBridge.cefReady) window.CefBridge.cefReady(); } catch (e) {}
    function sendReady() {
      sendRaw("ready", {
        w: String(window.innerWidth), h: String(window.innerHeight), ver: BUILD,
        miss: clip(st.miss.join(","), 160), fail: clip(st.fail.join(","), 160),
        err: clip(String(st.err).replace(/[\u0000-\u001f"\\%]+/g, " "), 160), rl: String(rl)
      });
    }
    sendReady();
    // If the first JNI -> Pawn handshake vanished, retry only while auth is
    // missing and no native password/register dialog owns the screen.
    var tryReadyAgain = function () {
      if (authSeen || readyRetryCount >= 2) return;
      if (!document.body.classList.contains("dlg-open")) {
        readyRetryCount++;
        log("CEF auth not received; resending ready " + readyRetryCount + "/2");
        sendReady();
      }
      if (!authSeen && readyRetryCount < 2) setTimeout(tryReadyAgain, 8000);
    };
    setTimeout(tryReadyAgain, 8000);
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
    touchNow: function () { Touch.last = ""; Touch.compute(); },
    canInteract: canInteract,
    boot: boot
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 0); });
  else setTimeout(boot, 0);
})();
