/* =====================================================================
   GAMEMODE EAGLE - CEF UI  (app.js)
   Menerima event "td" dari server (dikirim CEF_SendEvent di cef_bridge.inc)
   lalu merender tiap textdraw SAMA POSISI/UKURAN/WARNA di panggung 640x448.
   Textdraw selectable jadi tombol -> klik dikirim balik sbg event "td_click"
   -> server men-dispatch ke OnPlayerClickTextDraw / ...PlayerTextDraw.
   =====================================================================

   >>> YANG PERLU KAMU SAMBUNGKAN DI CLIENT ANDROID (rpc.zip / Java):
       1. Saat client menerima CEF_RPC_EVENT_TO_JS dari server, panggil:
              EAGLE.onServerEvent(eventName, jsonString)
       2. Sediakan fungsi kirim balik ke server (event -> packet 251/112):
              window.cefEmit(eventName, jsonString)
          (kalau client-mu pakai gaya samp-cef: window.cef.emit juga didukung)
   ===================================================================== */

(function () {
  "use strict";

  // ------- Konstanta skala (SESUAIKAN bila teks kurang pas) -------
  var VW = 640, VH = 448;        // ruang koordinat textdraw SA-MP
  var FONT_SCALE = 20.0;         // px per 1.0 letterSizeY  (tuning utama)

  var stage = document.getElementById("stage");
  var els = { g: {}, p: {} };    // elemen aktif: global & player

  // ---------------- Skala panggung mengikuti layar ----------------
  function fit() {
    var sx = window.innerWidth / VW, sy = window.innerHeight / VH;
    var s = Math.min(sx, sy);
    /* Keep the virtual coordinate system centered, but never paint the
       unused area of the browser. Only actual TD elements are visible. */
    stage.style.transform = "translate(-50%,-50%) scale(" + s + ")";
    stage.style.background = "transparent";
  }
  window.addEventListener("resize", fit);
  fit();

  // ---------------- Util warna SA-MP 0xRRGGBBAA -------------------
  function rgba(v) {
    v = v >>> 0;
    var r = (v >>> 24) & 0xFF, g = (v >>> 16) & 0xFF,
        b = (v >>> 8) & 0xFF, a = (v & 0xFF) / 255;
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  // ---------------- Ambil / buat elemen ----------------
  function el(scope, id) {
    var m = els[scope];
    if (m[id]) return m[id];
    var d = document.createElement("div");
    d.className = "td";               // tersembunyi via CSS sampai ada op "show" (kelas .on)
    d.dataset.scope = scope;
    d.dataset.td = id;
    stage.appendChild(d);
    m[id] = { node: d, st: defaultState() };
    return m[id];
  }
  function defaultState() {
    return { x:0,y:0, lx:0.5, ly:1.0, tx:0, ty:0, al:1, col:0xFFFFFFFF,
             box:0, bcol:0x00000080, sh:1, ol:0, bg:0x00000080, fn:1,
             pr:1, sel:0, mdl:-1, text:"" };
  }

  // deteksi textdraw sprite/box: font 4, atau teks "TXD:sprite" (LD_SPAC:white, HUD:...)
  var RE_SPRITE = /^[A-Za-z0-9_]+:[A-Za-z0-9_]+$/;
  function isSprite(s) {
    var t = (s.text || "").trim();
    return (s.fn === 4) || RE_SPRITE.test(t);
  }
  // Daftar sprite yang PNG-nya tersedia di cefui/sprites/ (di-tint warna textdraw
  // via CSS mask). Tambahkan key baru di sini bila kamu menaruh PNG baru
  // (nama file = key + ".png", huruf kecil, ':' diganti '_').
  var SPRITES = {
    "ld_spac_white":1, "ld_dual_white":1, "ld_bum_blkdot":1, "ld_beat_chit":1,
    "ld_spac_backgnd":1, "ld_bum_bum2":1, "ld_spac_rockshp":1,
    "ld_pool_ball":1, "ld_beat_circle":1, "ld_beat_cring":1, "ld_beat_cross":1,
    "ld_beat_left":1, "ld_beat_right":1, "ld_beat_upl":1,
    "ld_chat_badchat":1, "ld_chat_goodcha":1
  };
  function spriteKey(t) { return (t || "").trim().toLowerCase().replace(/:/g, "_"); }

  // ---------------- Terapkan state ke DOM ----------------
  function apply(scope, id) {
    var o = els[scope][id]; if (!o) return;
    var s = o.st, n = o.node;

    // ====== SPRITE / BOX (font 4 / "TXD:name") -> kotak berwarna ukuran TextSize ======
    if (s.mdl < 0 && isSprite(s)) {
      n.className = "td sprite" + (s.sel ? " sel" : "");
      // alignment: sprite umumnya kiri (1); center(2)/kanan(3) via transform
      var stx = "0";
      if (s.al === 2) stx = "-50%"; else if (s.al === 3) stx = "-100%";
      n.style.left = s.x + "px";
      n.style.top  = s.y + "px";
      n.style.transform = "translateX(" + stx + ")";
      n.style.width  = (s.tx > 0 ? s.tx : 8) + "px";   // TextSize X = lebar sprite
      n.style.height = (s.ty > 0 ? s.ty : 8) + "px";   // TextSize Y = tinggi sprite
      n.style.background = rgba(s.col);                // warna textdraw = tint sprite
      n.style.borderRadius = "0";
      n.style.color = "";
      n.style.textShadow = "none";
      n.innerHTML = "";
      // Bila PNG sprite tersedia -> pakai sebagai MASK (bentuk asli, di-tint warna).
      // Bila tidak -> tetap kotak ter-tint (aman).
      var key = spriteKey(s.text);
      if (SPRITES[key]) {
        var url = "url('sprites/" + key + ".png')";
        n.style.webkitMaskImage = url;  n.style.maskImage = url;
        n.style.webkitMaskSize = "100% 100%"; n.style.maskSize = "100% 100%";
        n.style.webkitMaskRepeat = "no-repeat"; n.style.maskRepeat = "no-repeat";
        n.style.webkitMaskPosition = "center"; n.style.maskPosition = "center";
      } else {
        n.style.webkitMaskImage = "none"; n.style.maskImage = "none";
      }
      return;
    }

    // ====== TEKS BIASA (font 0-3) ======
    n.className = "td font" + (s.fn|0) + " al" + (s.al|0)
                + (s.box ? " box" : "")
                + (s.sel ? " sel" : "");
    n.style.height = "auto";
    n.style.borderRadius = "";

    // posisi + alignment (transform)
    var tx = "0";
    if (s.al === 2) tx = "-50%";
    else if (s.al === 3) tx = "-100%";
    n.style.left = s.x + "px";
    n.style.top  = s.y + "px";
    n.style.transform = "translateX(" + tx + ")";

    // ukuran huruf dari letterSize Y (SA-MP: tinggi ~ ly * FONT_SCALE)
    n.style.fontSize = (s.ly * FONT_SCALE).toFixed(1) + "px";
    if (s.lx > 0) n.style.letterSpacing = ((s.lx - 0.5) * 1.5).toFixed(2) + "px";

    // warna teks & background box
    n.style.color = rgba(s.col);
    if (s.box) {
      n.style.background = rgba(s.bcol);
      if (s.tx > 0) n.style.width = ((s.tx - s.x) > 4 ? (s.tx - s.x) : s.tx) + "px";
    } else {
      n.style.background = "transparent";
      n.style.width = "auto";
    }
    // shadow/outline -> text-shadow
    if (s.ol > 0)      n.style.textShadow = outline(rgba(s.bg));
    else if (s.sh > 0) n.style.textShadow = (s.sh) + "px " + (s.sh) + "px 0 " + rgba(s.bg);
    else               n.style.textShadow = "none";

    if (s.mdl >= 0) { n.className = "td model"; n.textContent = "[model " + s.mdl + "]"; }
    else            n.innerHTML = samp2html(s.text);
  }

  function outline(c) {
    return "-1px 0 "+c+", 1px 0 "+c+", 0 -1px "+c+", 0 1px "+c;
  }

  // ubah warna embed SA-MP {RRGGBB} -> <span style=color>
  function samp2html(t) {
    if (t == null) t = "";
    t = String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    t = t.replace(/\{([0-9A-Fa-f]{6})\}/g, function (_, h) {
      return '</span><span style="color:#' + h + '">';
    });
    t = t.replace(/~n~/g, "<br>");
    t = t.replace(/~[a-z]~/gi, "");     // buang kode warna ikon SA-MP lain
    return '<span>' + t + '</span>';
  }

  // ---------------- Handler op dari server ----------------
  function handleTD(d) {
    var scope = d.s === "p" ? "p" : "g";
    var id = d.td|0;
    var o, s;
    switch (d.op) {
      case "create":
        o = el(scope, id); s = o.st;
        s.x = +d.x; s.y = +d.y; s.text = d.t || "";
        apply(scope, id);
        break;
      case "sync":
        o = el(scope, id); s = o.st;
        s.x=+d.x; s.y=+d.y; s.lx=+d.lx; s.ly=+d.ly; s.tx=+d.tx; s.ty=+d.ty;
        s.al=+d.al; s.col=+d.col; s.box=+d.box; s.bcol=+d.bcol; s.sh=+d.sh;
        s.ol=+d.ol; s.bg=+d.bg; s.fn=+d.fn; s.pr=+d.pr; s.sel=+d.sel;
        s.mdl=+d.mdl; s.text=d.t || "";
        apply(scope, id);
        if (d.vis !== undefined) {
          if (+d.vis) {
            o.node.classList.remove("td-out");
            o.node.classList.add("on");
          } else {
            o.node.classList.remove("on");
            o.node.classList.add("td-out");
          }
        }
        break;
      case "prop":
        o = el(scope, id); s = o.st;
        s[d.k] = +d.v; apply(scope, id);
        break;
      case "propf":
        o = el(scope, id); s = o.st;
        if (d.k === "letter")   { s.lx=+d.a; s.ly=+d.b; }
        else if (d.k === "textsize") { s.tx=+d.a; s.ty=+d.b; }
        apply(scope, id);
        break;
      case "text":
        o = el(scope, id); o.st.text = d.t || ""; apply(scope, id);
        break;
      case "show":
        o = els[scope][id];
        if (o) { o.node.classList.remove("td-out"); o.node.classList.add("on"); }
        break;
      case "hide":
        o = els[scope][id];
        if (o) { o.node.classList.remove("on"); o.node.classList.add("td-out"); }
        break;
      case "del":
        o = els[scope][id];
        if (o) { o.node.remove(); delete els[scope][id]; }
        break;
    }
  }

  // ---------------- Klik tombol -> kirim ke server ----------------
  stage.addEventListener("click", function (ev) {
    var t = ev.target;
    while (t && t !== stage && !(t.classList && t.classList.contains("sel"))) t = t.parentNode;
    if (!t || t === stage) return;
    var scope = t.dataset.scope, id = t.dataset.td;
    emit("td_click", '{"s":"' + scope + '","td":' + id + '}');
  }, true);

  // ---------------- Jembatan event (server <-> js) ----------------
  function emit(event, jsonStr) {
    try {
      if (window.cefEmit) return window.cefEmit(event, jsonStr);
      if (window.cef && typeof window.cef.emit === "function")
        return window.cef.emit(event, jsonStr);
      if (window.external && window.external.emit)
        return window.external.emit(event, jsonStr);
    } catch (e) {}
    // fallback: bisa ditangkap client via console
    console.log("CEF_EMIT:" + event + ":" + jsonStr);
  }

  // registry handler event tambahan (diisi systems.js: notify, itembox, dst)
  var handlers = {};
  function on(event, cb) { handlers[event] = cb; }

  function onServerEvent(event, data) {
    var d = data;
    if (typeof data === "string") {
      try { d = JSON.parse(data); } catch (e) { d = data; }
    }
    if (event === "td") { handleTD(d); return; }
    if (event === "td_batch") {
      if (Array.isArray(d)) d.forEach(function (entry) { handleTD(entry); });
      return;
    }
    if (handlers[event]) handlers[event](d);
  }

  // API publik untuk client Android memanggil saat menerima event server
  window.EAGLE = {
    onServerEvent: onServerEvent,
    on: on,                 // daftarkan handler event (dipakai systems.js)
    emit: emit,             // kirim event ke server
    handleTD: handleTD,     // untuk test manual
    _els: els
  };

  // Dukungan gaya samp-cef: cef.on('td', ...)
  if (window.cef && typeof window.cef.on === "function") {
    window.cef.on("td", function (data) { onServerEvent("td", data); });
  }
  // Dukungan DOM CustomEvent: document.dispatchEvent(new CustomEvent('cef', {detail:{event,data}}))
  document.addEventListener("cef", function (e) {
    if (e.detail) onServerEvent(e.detail.event, e.detail.data);
  });

  // Beritahu server webview siap -> server akan CEF_Show + sync HUD
  function ready() { emit("cef_ready", "{}"); }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
})();
