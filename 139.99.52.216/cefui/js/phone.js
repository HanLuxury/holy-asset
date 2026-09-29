/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : phone.js
   SMARTPHONE (pengganti textdraw Handphone*). Server mengirim layar,
   CEF hanya menampilkan & mengirim klik tombol ke gamemode.
     server -> "phone" {show, scr, tm, sec, dt, air, ...}
     klik   -> EAGLE.send("phone", aksi, index, teks)
   Layar: lock home settings bank music twitter ads trans airdrop dial
          gps games calc contacts wa garage call slot xo xores
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var send = function (a, i, s) { E.send("phone", a, i == null ? -1 : i, s); };

  var root = h("div", { id: "phone", class: "phone" });
  var frame = h("div", { class: "ph-frame", "data-touch": "" });
  var status = h("div", { class: "ph-status" });
  var screen = h("div", { class: "ph-screen" });
  var bar = h("div", { class: "ph-homebar" }, h("i"));
  frame.appendChild(h("div", { class: "ph-notch" }));
  frame.appendChild(status);
  frame.appendChild(screen);
  frame.appendChild(bar);
  root.appendChild(frame);
  U.layer("screenlayer").appendChild(root);

  var cur = { scr: "" };
  var clock = { base: 0, at: 0 };
  bar.addEventListener("click", function () {
    if (cur.scr === "lock") send("unlock");
    else if (cur.scr === "home") send("close");
    else if (cur.scr === "call" || cur.scr === "xo") return;
    else if (cur.scr === "calc" || cur.scr === "slot" || cur.scr === "xores") send(cur.scr === "slot" ? "slotback" : "xoback");
    else send("home");
  });

  /* ------------------------------ util ------------------------------ */
  function nowText() {
    var m = clock.base + Math.floor((Date.now() - clock.at) / 60000);
    m = ((m % 1440) + 1440) % 1440;
    return U.pad(Math.floor(m / 60)) + ":" + U.pad(m % 60);
  }
  function paintStatus() {
    status.innerHTML = '<span class="ph-time">' + nowText() + "</span>" +
      '<span class="ph-ic">' + (cur.air ? U.icon("plane") : '<b class="ph-net">5G</b>' + U.icon("wifi")) + U.icon("battery") + "</span>";
  }
  setInterval(function () { if (cur.scr) { paintStatus(); var lt = screen.querySelector(".lk-time"); if (lt) lt.textContent = nowText(); } }, 5000);

  function btn(t, a, opt) {
    opt = opt || {};
    var b = h("button", { type: "button", class: "ph-btn " + (opt.c || ""), html: (opt.icon ? U.icon(opt.icon) : "") + "<span>" + U.esc(t) + "</span>" });
    b.addEventListener("click", function () { if (opt.fn) opt.fn(); else send(a, opt.i, opt.s); });
    return b;
  }
  function appHead(title, opt) {
    opt = opt || {};
    var back = h("button", { type: "button", class: "ph-back", html: U.icon("back") });
    back.addEventListener("click", function () { send(opt.back || "home"); });
    var right = null;
    if (opt.action) {
      right = h("button", { type: "button", class: "ph-act", html: U.icon(opt.action.icon) });
      right.addEventListener("click", function () { send(opt.action.a); });
    }
    return h("div", { class: "ph-head " + (opt.c || "") }, [back, h("b", { text: title }), right || h("span", { class: "ph-sp" })]);
  }
  function rowItem(o) {
    var el = h("div", { class: "ph-row" + (o.c ? " " + o.c : "") }, [
      o.ava != null ? h("span", { class: "ph-ava", style: o.col ? "background:" + o.col : "", html: o.ava }) : (o.icon ? h("span", { class: "ph-ric " + (o.ic || ""), html: U.icon(o.icon) }) : null),
      h("div", { class: "ph-rb" }, [h("b", { html: U.fmt(o.t || "") }), o.s ? h("small", { html: U.fmt(o.s) }) : null]),
      o.r != null ? h("span", { class: "ph-rr", html: o.r }) : h("span", { class: "ph-chev", html: U.icon("next") })
    ]);
    if (o.a) el.addEventListener("click", function () { send(o.a, o.i, o.s2); });
    return el;
  }
  function pager(d, prev, next) {
    if (!+d.prev && !+d.more) return null;
    return h("div", { class: "ph-pager" }, [
      btn("Sebelumnya", prev, { icon: "back", c: +d.prev ? "" : "dis" }),
      h("span", { text: "Hal " + ((+d.page || 0) + 1) }),
      btn("Berikutnya", next, { icon: "next", c: +d.more ? "" : "dis" })
    ]);
  }
  function initials(n) {
    var p = U.plain(n || "?").replace(/_/g, " ").trim().split(/\s+/);
    return U.esc(((p[0] || "?")[0] + ((p[1] || "")[0] || "")).toUpperCase());
  }
  var AVC = ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#38d9a9", "#4dabf7", "#748ffc", "#da77f2", "#f783ac"];
  function avColor(n) { var s = 0; n = String(n || ""); for (var i = 0; i < n.length; i++) s = (s * 31 + n.charCodeAt(i)) & 0xffff; return AVC[s % AVC.length]; }

  /* ------------------------------ layar ------------------------------ */
  var APPS = [
    { id: "settings", t: "Setelan", i: "gear", c: "#8e8e93" }, { id: "bank", t: "M-Bank", i: "bank", c: "#1e88e5" },
    { id: "music", t: "Musik", i: "music", c: "#1db954" }, { id: "twitter", t: "X", i: "bird", c: "#111" },
    { id: "ads", t: "Iklan", i: "mega", c: "#f5b400" }, { id: "trans", t: "Trans", i: "car", c: "#00b14f" },
    { id: "airdrop", t: "Airdrop", i: "wifi", c: "#0a84ff" }, { id: "gps", t: "Maps", i: "map", c: "#34c759" },
    { id: "camera", t: "Kamera", i: "cam", c: "#20242d" }, { id: "garage", t: "Kendaraan", i: "key", c: "#ff7a00" },
    { id: "games", t: "Game", i: "game", c: "#bf5af2" }
  ];
  var DOCK = [
    { id: "dial", t: "Telepon", i: "call", c: "#30d158" }, { id: "wa", t: "WhatsApp", i: "chat", c: "#25d366" },
    { id: "contacts", t: "Kontak", i: "users", c: "#64748b" }
  ];
  function appIcon(a) {
    var el = h("div", { class: "ph-app" }, [h("span", { class: "pa-ic", style: "background:" + a.c, html: U.icon(a.i) }), h("small", { text: a.t })]);
    el.addEventListener("click", function () { send("app", -1, a.id); });
    return el;
  }

  var R = {};
  R.lock = function (d) {
    var el = h("div", { class: "ph-lock" }, [
      h("div", { class: "lk-time", text: nowText() }),
      h("div", { class: "lk-date", text: d.dt || "" }),
      h("div", { class: "lk-note" }, [U.iconEl("bell"), h("span", { text: "EAGLE ROLEPLAY" })]),
      h("div", { class: "lk-hint", html: U.icon("up") + "Ketuk untuk membuka" })
    ]);
    el.addEventListener("click", function () { send("unlock"); });
    return el;
  };
  R.home = function () {
    var grid = h("div", { class: "ph-grid" }, APPS.map(appIcon));
    var dock = h("div", { class: "ph-dock" }, DOCK.map(appIcon));
    var close = h("button", { type: "button", class: "ph-power", html: U.icon("power") });
    close.addEventListener("click", function () { send("close"); });
    return h("div", { class: "ph-home" }, [h("div", { class: "ph-wid" }, [h("b", { class: "lk-time", text: nowText() }), h("small", { text: cur.dt || "" })]), grid, dock, close]);
  };
  R.settings = function (d) {
    return h("div", { class: "ph-app-scr" }, [appHead("Setelan"),
      h("div", { class: "ph-body" }, [
        h("div", { class: "ph-profile" }, [h("span", { class: "ph-ava lg", style: "background:" + avColor(d.owner), html: initials(d.owner) }),
          h("div", {}, [h("b", { text: U.plain(d.owner || "").replace(/_/g, " ") }), h("small", { text: "Nomor: " + (d.num || "-") })])]),
        h("div", { class: "ph-list" }, [
          rowItem({ icon: "info", ic: "gray", t: "Tentang Ponsel", a: "about" }),
          rowItem({ icon: "music", ic: "pink", t: "Ubah Nada Dering", s: +d.ring ? "Nada dering kustom aktif" : "Default", a: "ring" }),
          rowItem({ icon: "trash", ic: "red", t: "Hapus Nada Dering", a: "delring" }),
          rowItem({ icon: "plane", ic: "orange", t: "Mode Pesawat", r: '<i class="ph-tog' + (+d.air ? " on" : "") + '"></i>', a: "air" })
        ])
      ])]);
  };
  R.bank = function (d) {
    return h("div", { class: "ph-app-scr" }, [appHead("M-Banking", { c: "blue" }),
      h("div", { class: "ph-body" }, [
        h("div", { class: "ph-card" }, [h("small", { text: "Saldo Rekening" }), h("b", { text: d.bal || "$0" }),
          h("div", { class: "pc-row" }, [h("span", { text: U.plain(d.name || "").replace(/_/g, " ") }), h("span", { text: "No. " + (d.rek || "-") })])]),
        h("div", { class: "ph-tiles" }, [
          btn("Transfer", "transfer", { icon: "send", c: "tile" }), btn("Delay Sidejob", "delay", { icon: "clock", c: "tile" }),
          btn("Tagihan", "invoice", { icon: "receipt", c: "tile" })
        ])
      ])]);
  };
  R.music = function (d) {
    return h("div", { class: "ph-app-scr dark" }, [appHead("Spotify", { c: "green" }),
      h("div", { class: "ph-body center" }, [
        h("div", { class: "ph-album", html: U.icon("music") }),
        h("b", { class: "ph-big", text: "Putar Musik" }), h("small", { class: "ph-mut", text: "Pilih perangkat pemutar" }),
        btn("Boombox" + (+d.vip ? "" : " (VIP)"), "boombox", { icon: "vol", c: "wide green" }),
        btn("Earphone" + (+d.ear ? "" : " (tidak punya)"), "earphone", { icon: "music", c: "wide" })
      ])]);
  };
  R.twitter = function (d) {
    var list = (d.it || []).map(function (t) {
      return h("div", { class: "ph-tweet" }, [
        h("span", { class: "ph-ava", style: "background:" + avColor(t.f), html: initials(t.f) }),
        h("div", { class: "tw-b" }, [h("div", { class: "tw-h", html: "<b>" + U.esc(U.plain(t.f || "")) + "</b><small>" + U.esc(t.d || "") + "</small>" }),
          h("div", { class: "tw-t", html: U.fmt(t.t || "") })])
      ]);
    });
    if (!list.length) list = [h("div", { class: "ph-empty", text: "Belum ada postingan." })];
    return h("div", { class: "ph-app-scr" }, [appHead("X", { action: { icon: "plus", a: "tw_post" } }),
      h("div", { class: "ph-body feed" }, list), pager(d, "tw_prev", "tw_next")]);
  };
  R.ads = function (d) {
    var list = (d.it || []).map(function (t) {
      return h("div", { class: "ph-ad" }, [h("div", { class: "ad-h", html: U.icon("mega") + "<b>" + U.esc(U.plain(t.f || "")) + "</b><small>" + U.esc(t.p || "") + "</small>" }),
        h("div", { class: "ad-t", html: U.fmt(t.t || "") }), h("small", { class: "ad-d", text: t.d || "" })]);
    });
    if (!list.length) list = [h("div", { class: "ph-empty", text: "Belum ada iklan." })];
    return h("div", { class: "ph-app-scr" }, [appHead("Yellow Pages", { c: "yellow", action: { icon: "list", a: "ad_menu" } }),
      h("div", { class: "ph-body feed" }, list), pager(d, "ad_prev", "ad_next")]);
  };
  R.trans = function (d) {
    return h("div", { class: "ph-app-scr" }, [appHead("Trans", { c: "green" }),
      h("div", { class: "ph-body center" }, [
        h("div", { class: "ph-album green", html: U.icon("car") }),
        h("b", { class: "ph-big", text: (+d.n || 0) + " Driver" }), h("small", { class: "ph-mut", text: "sedang bertugas saat ini" }),
        btn("Pesan Trans", "order", { icon: "pin", c: "wide green" })
      ])]);
  };
  R.airdrop = function (d) {
    return h("div", { class: "ph-app-scr" }, [appHead("Airdrop"),
      h("div", { class: "ph-body center" }, [
        h("div", { class: "ph-album blue", html: U.icon("wifi") }),
        h("div", { class: "ph-list" }, [rowItem({ icon: "users", ic: "blue", t: "Izinkan Berbagi Kontak", s: +d.perm ? "Semua orang di dekatmu" : "Nonaktif",
          r: '<i class="ph-tog' + (+d.perm ? " on" : "") + '"></i>', a: "perm" })]),
        btn("Bagikan Kontak Saya", "airdrop", { icon: "send", c: "wide blue" })
      ])]);
  };
  R.dial = function () {
    var num = "";
    var disp = h("div", { class: "dl-num" });
    function paint() { disp.textContent = num || " "; }
    var keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
    var pad = h("div", { class: "dl-pad" }, keys.map(function (k) {
      var b = h("button", { type: "button", class: "dl-key", text: k });
      b.addEventListener("click", function () { if (k !== "*" && num.length < 9) { num += k; paint(); } });
      return b;
    }));
    var del = h("button", { type: "button", class: "dl-del", html: U.icon("back") });
    del.addEventListener("click", function () { num = num.slice(0, -1); paint(); });
    var call = h("button", { type: "button", class: "dl-call", html: U.icon("call") });
    call.addEventListener("click", function () { if (num) send("call", -1, num); });
    paint();
    return h("div", { class: "ph-app-scr" }, [appHead("Telepon"), h("div", { class: "ph-body dial" }, [disp, pad, h("div", { class: "dl-bot" }, [h("span"), call, del])])]);
  };
  var GPS = [["Lokasi Umum", "pin", "blue"], ["Garasi Umum Terdekat", "car", "orange"], ["Tong Sampah Terdekat", "trash", "gray"],
    ["Lokasi Pekerjaan", "wrench", "yellow"], ["Lokasi Hobi", "fish", "green"], ["Warung Terdekat", "store", "orange"],
    ["Pom Bensin Terdekat", "fuel", "red"], ["Lokasi Pertokoan", "cart", "pink"], ["ATM Terdekat", "cash", "green"],
    ["Bengkel Modshop", "wrench", "blue"], ["Hapus Checkpoint", "x", "red"], ["Hapus Shareloc", "x", "red"]];
  R.gps = function () {
    return h("div", { class: "ph-app-scr" }, [appHead("Maps", { c: "green" }),
      h("div", { class: "ph-body" }, h("div", { class: "ph-list" }, GPS.map(function (g, i) {
        return rowItem({ icon: g[1], ic: g[2], t: g[0], a: "gps", i: i });
      })))]);
  };
  R.camera = function (d) {
    var modeNames = ["FOTO", "PORTRAIT", "MALAM", "VIDEO"];
    var mode = Math.max(0, Math.min(3, +d.mode || 0));
    var zoom = Math.max(1, Math.min(8, +d.zoom || 1));
    var preview = h("div", { class: "ph-camera-preview mode-" + mode });
    var shade = h("div", { class: "cam-shade" });
    var grid = h("div", { class: "cam-grid" + (+d.grid ? " on" : "") }, [h("i"),h("i"),h("i"),h("i"),h("i"),h("i")]);
    preview.appendChild(shade);
    preview.appendChild(grid);
    preview.appendChild(h("div", { class: "cam-top" }, [
      h("button", { type: "button", class: "cam-small", text: "×" }),
      h("span", { class: "cam-pill", text: modeNames[mode] }),
      h("span", { class: "cam-zoom-label", text: zoom + "×" })
    ]));
    preview.appendChild(h("div", { class: "cam-focus", "aria-hidden": "true" }));
    preview.querySelector(".cam-small").addEventListener("click", function () { send("camera_close"); });

    var modeRow = h("div", { class: "cam-mode-row" }, [
      h("button", { type: "button", class: "cam-mode-prev", text: "‹" }),
      h("b", { text: modeNames[mode] }),
      h("button", { type: "button", class: "cam-mode-next", text: "›" })
    ]);
    modeRow.querySelector(".cam-mode-prev").addEventListener("click", function () { send("camera_mode", -1); });
    modeRow.querySelector(".cam-mode-next").addEventListener("click", function () { send("camera_mode", 1); });

    var shutter = h("button", { type: "button", class: "cam-shutter", html: "<span></span>" });
    shutter.addEventListener("click", function () { send("camera_capture"); });

    var row = h("div", { class: "cam-controls" });
    function cbtn(label, action, idx, cls) {
      var b = h("button", { type: "button", class: "cam-ctrl " + (cls || ""), text: label });
      b.addEventListener("click", function () { send(action, idx == null ? 0 : idx); });
      row.appendChild(b);
    }
    cbtn(+d.flash ? "⚡ ON" : "⚡", "camera_flash", 0, +d.flash ? "active" : "");
    cbtn("−", "camera_zoom_out", 0, "");
    cbtn("Reset", "camera_reset", 0, "");
    cbtn("+", "camera_zoom_in", 0, "");
    cbtn(+d.grid ? "Grid ON" : "Grid", "camera_grid", 0, +d.grid ? "active" : "");
    cbtn(+d.front ? "Rear" : "Selfie", +d.front ? "camera_rear" : "camera_front", 0, "switch");

    // Geser jari pada viewfinder = rotasi kamera Pawn (tanpa C++).
    var dragging = false, lx = 0, ly = 0;
    preview.addEventListener("pointerdown", function (e) {
      dragging = true; lx = e.clientX; ly = e.clientY;
      try { preview.setPointerCapture(e.pointerId); } catch (_) {}
    });
    preview.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = Math.round((e.clientX - lx) * 0.8);
      var dy = Math.round((e.clientY - ly) * 0.55);
      if (dx) send("camera_yaw", dx);
      if (dy) send("camera_pitch", -dy);
      lx = e.clientX; ly = e.clientY;
    });
    preview.addEventListener("pointerup", function () { dragging = false; });
    preview.addEventListener("pointercancel", function () { dragging = false; });
    preview.addEventListener("wheel", function (e) {
      e.preventDefault();
      send(e.deltaY < 0 ? "camera_zoom_in" : "camera_zoom_out");
    }, { passive: false });

    return h("div", { class: "ph-camera-app" }, [preview, modeRow, h("div", { class: "cam-shutter-wrap" }, [shutter]), row]);
  };

  R.games = function () {
    return h("div", { class: "ph-app-scr" }, [appHead("Game"),
      h("div", { class: "ph-body" }, h("div", { class: "ph-list" }, [
        rowItem({ icon: "grid", ic: "purple", t: "Tic Tac Toe", s: "Main X/O dengan pemain lain", a: "xo" }),
        rowItem({ icon: "dice", ic: "red", t: "Slot Kartu", s: "Taruhan $500 - menang $25.000", a: "slot" }),
        rowItem({ icon: "calc", ic: "orange", t: "Kalkulator", a: "calc" }),
        rowItem({ icon: "plane", ic: "gray", t: "Plane War", s: "Segera hadir", r: "" }),
        rowItem({ icon: "percent", ic: "gray", t: "Trading", s: "Segera hadir", r: "" })
      ]))]);
  };
  R.calc = function () {
    var expr = "", res = "0", done = false;
    var disp = h("div", { class: "cl-disp" }, [h("small"), h("b", { text: "0" })]);
    function paint() { disp.querySelector("small").textContent = expr; disp.querySelector("b").textContent = res; }
    function evaluate(s) {
      var t = s.replace(/x/g, "*").match(/(\d+\.?\d*|\.\d+|[-+*/%])/g) || [];
      var out = [], ops = [], prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2 }, prevNum = false;
      for (var i = 0; i < t.length; i++) {
        var k = t[i];
        if (/[\d.]/.test(k[0])) { out.push(parseFloat(k)); prevNum = true; continue; }
        if (!prevNum && k === "-") { out.push(0); }
        while (ops.length && prec[ops[ops.length - 1]] >= prec[k]) out.push(ops.pop());
        ops.push(k); prevNum = false;
      }
      while (ops.length) out.push(ops.pop());
      var st = [];
      for (var j = 0; j < out.length; j++) {
        var o = out[j];
        if (typeof o === "number") { st.push(o); continue; }
        var b = st.pop(), a = st.pop();
        if (a == null || b == null) return NaN;
        st.push(o === "+" ? a + b : o === "-" ? a - b : o === "*" ? a * b : o === "/" ? a / b : a % b);
      }
      return st.length === 1 ? st[0] : NaN;
    }
    var keys = [["C", "fn"], ["+/-", "fn"], ["%", "op"], ["/", "op"], ["7"], ["8"], ["9"], ["x", "op"], ["4"], ["5"], ["6"], ["-", "op"],
      ["1"], ["2"], ["3"], ["+", "op"], ["0", "wide"], ["."], ["=", "eq"]];
    var pad = h("div", { class: "cl-pad" }, keys.map(function (k) {
      var b = h("button", { type: "button", class: "cl-key " + (k[1] || ""), text: k[0] === "/" ? "÷" : k[0] === "x" ? "×" : k[0] });
      b.addEventListener("click", function () {
        var v = k[0];
        if (v === "C") { expr = ""; res = "0"; }
        else if (v === "=") {
          var r = evaluate(expr);
          res = isFinite(r) ? String(Math.round(r * 1e6) / 1e6) : "Malformed Input"; done = true;
        } else if (v === "+/-") {
          var m = expr.match(/(-?\d+\.?\d*)$/);
          if (m) expr = expr.slice(0, -m[1].length) + (m[1][0] === "-" ? m[1].slice(1) : "-" + m[1]);
        } else {
          if (done && /[\d.]/.test(v)) expr = "";
          if (done && !/[\d.]/.test(v) && res !== "Malformed Input") expr = res;
          done = false;
          if (expr.length < 18) expr += v;
        }
        paint();
      });
      return b;
    }));
    paint();
    return h("div", { class: "ph-app-scr dark" }, [appHead("Kalkulator", { back: "xoback" }), h("div", { class: "ph-body calc" }, [disp, pad])]);
  };
  R.contacts = function (d) {
    var list = (d.it || []).map(function (c) {
      return rowItem({ ava: initials(c.n), col: avColor(c.n), t: U.plain(c.n || "").replace(/_/g, " "),
        s: (c.num ? c.num + " · " : "") + (+c.on ? "{34d17c}Online" : "{8a8f9c}Offline") + (+c.bl ? " · {ff5561}Diblokir" : ""),
        a: "c_sel", i: +c.i });
    });
    if (!list.length) list = [h("div", { class: "ph-empty", text: "Tidak ada kontak tersimpan." })];
    return h("div", { class: "ph-app-scr" }, [appHead("Kontak", { action: { icon: "plus", a: "c_add" } }),
      h("div", { class: "ph-body" }, h("div", { class: "ph-list" }, list)), pager(d, "c_prev", "c_next")]);
  };
  R.wa = function (d) {
    var list = (d.it || []).map(function (c) {
      return rowItem({ ava: initials(c.n), col: avColor(c.n), t: U.plain(c.n || "").replace(/_/g, " "),
        s: +c.on ? "{34d17c}Online" : "{8a8f9c}Offline",
        r: +c.u > 0 ? '<i class="ph-badge">' + (+c.u) + "</i>" : null, a: "w_sel", i: +c.i });
    });
    if (!list.length) list = [h("div", { class: "ph-empty", text: "Belum ada percakapan." })];
    return h("div", { class: "ph-app-scr" }, [appHead("WhatsApp", { c: "wa" }),
      h("div", { class: "ph-body" }, h("div", { class: "ph-list" }, list)), pager(d, "w_prev", "w_next")]);
  };
  R.garage = function (d) {
    var list = (d.it || []).map(function (v) {
      return h("div", { class: "ph-veh" }, [h("div", { class: "pv-img" }, U.img("veh:" + (+v.m || 400))),
        h("div", { class: "pv-b" }, [h("b", { text: v.n || "" }), h("small", { html: U.fmt(v.st || "") }), h("span", { class: "pv-plate", text: v.pl || "-" })])]);
    });
    if (!list.length) list = [h("div", { class: "ph-empty", text: "Anda tidak memiliki kendaraan." })];
    return h("div", { class: "ph-app-scr" }, [appHead("Kendaraan", { c: "orange" }), h("div", { class: "ph-body" }, list)]);
  };
  R.call = function (d) {
    var btns = +d.mode === 1 ? [
      h("div", { class: "cl-b" }, [h("button", { type: "button", class: "call-btn red", html: U.icon("call"), onclick: function () { send("decline"); } }), h("small", { text: "Tolak" })]),
      h("div", { class: "cl-b" }, [h("button", { type: "button", class: "call-btn green pulse", html: U.icon("call"), onclick: function () { send("accept"); } }), h("small", { text: "Angkat" })])
    ] : [h("div", { class: "cl-b" }, [h("button", { type: "button", class: "call-btn red", html: U.icon("call"), onclick: function () { send("hangup"); } }), h("small", { text: "Akhiri" })])];
    return h("div", { class: "ph-call" }, [
      h("span", { class: "ph-ava xl", style: "background:" + avColor(d.name), html: initials(d.name) }),
      h("b", { class: "cl-name", text: U.plain(d.name || "").replace(/_/g, " ") }),
      h("div", { class: "cl-st", text: d.st || "" }),
      h("div", { class: "cl-btns" }, btns)
    ]);
  };
  var SUIT = { c: ["♣", "blk"], s: ["♠", "blk"], h: ["♥", "red"], d: ["♦", "red"] };
  var RANK = { 1: "A", 11: "J", 12: "Q", 13: "K" };
  function card(code) {
    var m = /cd(\d+)([cdhs])/.exec(code || "");
    if (!m) return h("div", { class: "pk-card back" });
    var r = RANK[+m[1]] || m[1], s = SUIT[m[2]];
    return h("div", { class: "pk-card " + s[1] }, [h("b", { text: r }), h("span", { text: s[0] }), h("i", { text: r })]);
  }
  R.slot = function (d) {
    var res = d.res || "";
    return h("div", { class: "ph-app-scr dark" }, [appHead("Slot Kartu", { back: "slotback" }),
      h("div", { class: "ph-body center slot" }, [
        h("div", { class: "pk-row" + (+d.spin ? " spin" : "") }, (d.c || []).slice(0, 3).map(card)),
        h("div", { class: "pk-res " + (/win/i.test(res) ? "win" : res ? "lose" : ""), text: res || (+d.spin ? "Memutar..." : "3 kartu sama = menang $25.000") }),
        btn(+d.spin ? "Memutar..." : "Putar ($500)", "slotspin", { icon: "refresh", c: "wide gold" + (+d.spin ? " dis" : "") })
      ])]);
  };
  R.xo = function (d) {
    var b = String(d.b || "000000000");
    var grid = h("div", { class: "xo-grid" }, b.split("").slice(0, 9).map(function (v, i) {
      var c = h("button", { type: "button", class: "xo-cell v" + v, text: v === "1" ? "X" : v === "2" ? "O" : "" });
      if (v === "0" && +d.turn) c.addEventListener("click", function () { send("cell", i + 1); });
      return c;
    }));
    return h("div", { class: "ph-app-scr dark" }, [h("div", { class: "ph-head" }, [h("span", { class: "ph-sp" }), h("b", { text: "Tic Tac Toe" }), h("span", { class: "ph-sp" })]),
      h("div", { class: "ph-body center xo" }, [
        h("div", { class: "xo-info" }, [h("span", { html: "Kamu: <b>" + U.esc(d.me || "X") + "</b>" }), h("span", { html: "Taruhan: <b>" + U.money(+d.cash || 0) + "</b>" })]),
        h("div", { class: "xo-turn" + (+d.turn ? " me" : ""), text: +d.turn ? "Giliran kamu" : "Menunggu lawan..." }),
        grid
      ])]);
  };
  R.xores = function (d) {
    var m = { win: ["Kamu Menang!", "trophy", "win"], lose: ["Kamu Kalah", "err", "lose"], draw: ["Seri", "refresh", "draw"] }[d.res] || ["Selesai", "info", ""];
    return h("div", { class: "ph-app-scr dark" }, [h("div", { class: "ph-body center xores " + m[2] }, [
      h("div", { class: "xr-ic", html: U.icon(m[1]) }), h("b", { class: "ph-big", text: m[0] }),
      btn("Kembali ke Game", "xoback", { icon: "back", c: "wide" })
    ])]);
  };

  /* ------------------------------ render ------------------------------ */
  var hideT = 0;
  E.on("phone", function (d) {
    clearTimeout(hideT);
    if (!+d.show && d.show !== true) {
      // tunda sedikit: server sering mengirim hide lalu layar baru (mis. panggilan)
      hideT = setTimeout(function () { cur.scr = ""; root.classList.remove("on"); E.touch(); }, 60);
      return;
    }
    if (d.tm) {
      var p = String(d.tm).split(":");
      clock.base = (+p[0] || 0) * 60 + (+p[1] || 0);
      clock.at = Date.now() - (+d.sec || 0) * 1000;
    }
    var changed = cur.scr !== d.scr;
    cur = d;
    var fn = R[d.scr] || R.home;
    var el = fn(d);
    screen.className = "ph-screen scr-" + d.scr + (changed ? " enter" : "");
    screen.innerHTML = "";
    screen.appendChild(el);
    paintStatus();
    frame.classList.toggle("dark-status", /^(lock|home|call|music|slot|xo|xores|calc|camera)$/.test(d.scr));
    root.classList.add("on");
    E.touch();
  });
})();
