/* =====================================================================
   EAGLE HUD EDITOR v25 (hud_settings.js)
   - 10 tata letak siap pakai (FiveM, NoPixel, Brasil, ...)
   - tiap komponen: geser langsung di layar (snap ke tengah), 9 letak
     cepat, geser halus, ukuran, tampil/sembunyi
   - gaya status/speedometer/lokasi/uang/logo, warna aksen, transparansi
   - disimpan di HP (localStorage) DAN di server per karakter
     (event "hudcfg" masuk, aksi ("hudsettings","save") keluar)
   Posisi disimpan sebagai titik jangkar (x%, y%) + jangkar (tl..br),
   jadi komponen tidak keluar layar walau lebarnya berubah.
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, H = window.EHUD;
  if (!E || !U || !U.h || !H) return;
  var h = U.h;

  /* ------------------------------------------------------------------ */
  /* Komponen & tata letak siap pakai                                   */
  /* ------------------------------------------------------------------ */
  var COMPS = [
    { id: "status", el: "hud", name: "Status", sub: "Darah, armor, lapar, haus, stres, suara", tw: 22, th: 7, twc: 5, thc: 36 },
    { id: "money", el: "hud-info", name: "Uang & Pekerjaan", sub: "Cash, bank, pekerjaan", tw: 13, th: 12 },
    { id: "logo", el: "hud-wm", name: "Logo & ID", sub: "Nama server, ID, pemain online", tw: 13, th: 8 },
    { id: "loc", el: "hud-loc", name: "Lokasi", sub: "Arah, nama jalan, jam", tw: 18, th: 7 },
    { id: "speedo", el: "speedo", name: "Speedometer", sub: "Kecepatan, bensin, mesin (saat di kendaraan)", tw: 11, th: 15 },
    { id: "fps", el: "hud-fps", name: "FPS / Ping", sub: "Performa koneksi", tw: 11, th: 4 },
    { id: "notify", el: "notify", name: "Notifikasi", sub: "Pesan pemberitahuan", tw: 18, th: 14, always: 1 },
    { id: "quickbar", el: "eagle-quickbar", name: "Quickbar", sub: "Slot item 1-6 (saat jalan kaki)", tw: 40, th: 12 }
  ];
  // L: [x%, y%, jangkar, ukuran%, tampil]  jangkar: huruf 1 = t/m/b, huruf 2 = l/c/r
  // S: gaya bawaan tata letak (bisa diubah lagi di tab Gaya)
  var PRESETS = [
    { id: "fivem", name: "FiveM Klasik", sub: "Status & lokasi di kanan radar", radar: "bl", sd: "row",
      S: { st: "circle", sp: "ring", lo: "street", mo: "gta", wm: "logo" }, L: {
      status: [19, 97.5, "bl"], loc: [19, 88.5, "bl"], speedo: [50, 97.5, "bc"], money: [98.5, 10.5, "tr"], logo: [98.5, 2, "tr"],
      fps: [1, 1, "tl"], notify: [98.5, 27, "tr"], quickbar: [70, 98.8, "bc"] } },
    { id: "nopixel", name: "NoPixel", sub: "Kompas di atas, status kecil", radar: "bl", sd: "row",
      S: { st: "mini", sp: "ring", lo: "compass", mo: "gta", wm: "id" }, L: {
      status: [19, 97.5, "bl"], loc: [50, 1.5, "tc"], speedo: [19, 89, "bl", 90], money: [98.5, 2, "tr"], logo: [98.5, 97.5, "br", 90],
      fps: [1, 1, "tl"], notify: [98.5, 17, "tr"], quickbar: [64, 98.8, "bc"] } },
    { id: "brasil", name: "Brasil / Reduto", sub: "Kotak status di kanan bawah", radar: "bl", sd: "row",
      S: { st: "square", sp: "digital", lo: "street", mo: "box", wm: "logo" }, L: {
      status: [98.5, 97.5, "br"], loc: [98.5, 88, "br"], speedo: [50, 97.5, "bc"], money: [98.5, 10.5, "tr"], logo: [98.5, 2, "tr"],
      fps: [1, 1, "tl"], notify: [98.5, 30, "tr"], quickbar: [47, 98.8, "bc"] } },
    { id: "radartl", name: "Radar Kiri Atas", sub: "Untuk radar bawaan SA-MP", radar: "tl", sd: "row",
      S: { st: "circle", sp: "ring", lo: "street", mo: "gta", wm: "logo" }, L: {
      status: [1.5, 97.5, "bl"], loc: [1.5, 88.5, "bl"], speedo: [50, 97.5, "bc"], money: [98.5, 10.5, "tr"], logo: [98.5, 2, "tr"],
      fps: [22, 1, "tl"], notify: [98.5, 27, "tr"], quickbar: [64, 98.8, "bc"] } },
    { id: "tengah", name: "Tengah Bawah", sub: "Segi enam di atas quickbar", radar: "", sd: "row",
      S: { st: "hex", sp: "gauge", lo: "compass", mo: "gta", wm: "logo" }, L: {
      status: [50, 77.5, "bc"], loc: [50, 1.5, "tc"], speedo: [98.5, 97.5, "br"], money: [98.5, 10.5, "tr"], logo: [98.5, 2, "tr"],
      fps: [1, 1, "tl"], notify: [98.5, 27, "tr"], quickbar: [50, 98.8, "bc"] } },
    { id: "kiri", name: "Kiri Tegak", sub: "Bar status di kiri tengah", radar: "", sd: "col",
      S: { st: "bar", sp: "digital", lo: "street", mo: "box", wm: "logo" }, L: {
      status: [1.2, 55, "ml"], loc: [1.5, 97.5, "bl"], speedo: [50, 97.5, "bc"], money: [98.5, 10.5, "tr"], logo: [98.5, 2, "tr"],
      fps: [1, 1, "tl"], notify: [98.5, 27, "tr"], quickbar: [50, 98.8, "bc"] } },
    { id: "kanan", name: "Kanan Tegak", sub: "Angka status di kanan tengah", radar: "", sd: "col",
      S: { st: "text", sp: "ring", lo: "street", mo: "gta", wm: "logo" }, L: {
      status: [98.8, 55, "mr"], loc: [98.5, 97.5, "br"], speedo: [50, 97.5, "bc"], money: [98.5, 10.5, "tr"], logo: [98.5, 2, "tr"],
      fps: [1, 1, "tl"], notify: [50, 12, "tc"], quickbar: [50, 98.8, "bc"] } },
    { id: "atas", name: "Semua di Atas", sub: "Status & lokasi di atas layar", radar: "", sd: "row",
      S: { st: "circle", sp: "gauge", lo: "mini", mo: "mini", wm: "id" }, L: {
      status: [50, 1.5, "tc"], loc: [50, 11, "tc"], speedo: [50, 97.5, "bc"], money: [98.5, 1.5, "tr"], logo: [98.5, 97.5, "br", 90],
      fps: [1.5, 97.5, "bl"], notify: [98.5, 17, "tr"], quickbar: [50, 98.8, "bc"] } },
    { id: "minimal", name: "Minimalis", sub: "Kecil, tanpa logo & FPS", radar: "bl", sd: "row",
      S: { st: "mini", sp: "mini", lo: "mini", mo: "mini", wm: "id" }, L: {
      status: [19, 97.5, "bl"], loc: [50, 1.5, "tc"], speedo: [98.5, 97.5, "br"], money: [98.5, 2, "tr"], logo: [98.5, 2, "tr", 100, 0],
      fps: [1, 1, "tl", 100, 0], notify: [50, 12, "tc"], quickbar: [66, 98.8, "bc"] } },
    { id: "sinema", name: "Sinematik", sub: "Hanya status, speedo & notifikasi", radar: "", sd: "row",
      S: { st: "mini", sp: "mini", lo: "street", mo: "gta", wm: "logo" }, L: {
      status: [1.5, 97.5, "bl", 90], loc: [50, 1.5, "tc", 100, 0], speedo: [98.5, 97.5, "br"], money: [98.5, 2, "tr", 100, 0], logo: [98.5, 2, "tr", 100, 0],
      fps: [1, 1, "tl", 100, 0], notify: [98.5, 2, "tr"], quickbar: [50, 98.8, "bc"] } }
  ];
  var QP = { tl: [1.5, 1.5], tc: [50, 1.5], tr: [98.5, 1.5], ml: [1.5, 50], mc: [50, 50], mr: [98.5, 50], bl: [1.5, 97.5], bc: [50, 97.5], br: [98.5, 97.5] };
  var AX = { l: 0, c: 0.5, r: 1 }, AY = { t: 0, m: 0.5, b: 1 };
  var ANAME = { tl: "kiri atas", tc: "atas tengah", tr: "kanan atas", ml: "kiri tengah", mc: "tengah", mr: "kanan tengah", bl: "kiri bawah", bc: "bawah tengah", br: "kanan bawah" };
  var LS_KEY = "eagle_hud_v25";
  var CFG_KEYS = ["st", "sd", "sp", "lo", "mo", "wm", "ac", "op", "sc", "nums", "hidefull", "hidear", "locfoot", "mveh", "delta", "job", "clock", "qbhide", "qbsc"];
  var NUM_RANGE = { op: [40, 100], sc: [60, 150], qbhide: [0, 60], qbsc: [70, 130] };

  var layout = {}, preset = "fivem";
  function comp(id) { for (var i = 0; i < COMPS.length; i++) if (COMPS[i].id === id) return COMPS[i]; return null; }
  function presetById(id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i]; return null; }
  function entry(pr, id) {
    var e = pr.L[id] || PRESETS[0].L[id];
    return { x: e[0], y: e[1], a: e[2], s: e[3] || 100, on: e[4] == null ? 1 : e[4] };
  }
  function useLayoutOf(pr) { COMPS.forEach(function (c) { layout[c.id] = entry(pr, c.id); }); }
  useLayoutOf(PRESETS[0]);
  function r2(v) { return Math.round(v * 100) / 100; }
  function lim(v, a, b) { v = +v; if (!isFinite(v)) v = a; return v < a ? a : v > b ? b : v; }

  /* ------------------------------------------------------------------ */
  /* Simpan / muat (format ringkas tanpa tanda kutip, aman untuk server) */
  /*   25|preset|st=circle,sd=row,...|status:19:97.5:bl:100:1;money:... */
  /* ------------------------------------------------------------------ */
  function encode() {
    var c = H.cfg;
    var a = CFG_KEYS.map(function (k) { return k + "=" + c[k]; }).join(",");
    var l = COMPS.map(function (cp) { var p = layout[cp.id]; return cp.id + ":" + r2(p.x) + ":" + r2(p.y) + ":" + p.a + ":" + Math.round(p.s) + ":" + (p.on ? 1 : 0); }).join(";");
    return "25|" + preset + "|" + a + "|" + l;
  }
  function decode(str) {
    if (typeof str !== "string" || str.slice(0, 3) !== "25|") return null;
    var parts = str.split("|");
    if (parts.length < 4) return null;
    var out = { preset: /^[a-z0-9]{1,12}$/.test(parts[1]) ? parts[1] : "custom", cfg: {}, layout: {} };
    parts[2].split(",").forEach(function (kv) {
      var i = kv.indexOf("="); if (i < 1) return;
      var k = kv.slice(0, i), v = kv.slice(i + 1);
      if (CFG_KEYS.indexOf(k) < 0) return;
      if (H.enums[k]) { if (H.enums[k].indexOf(v) >= 0) out.cfg[k] = v; }
      else if (k === "ac") { if (H.accents[v]) out.cfg[k] = v; }
      else if (NUM_RANGE[k]) out.cfg[k] = lim(v, NUM_RANGE[k][0], NUM_RANGE[k][1]);
      else out.cfg[k] = v === "1" ? 1 : 0;
    });
    parts[3].split(";").forEach(function (it) {
      var f = it.split(":");
      if (f.length < 6 || !comp(f[0]) || !ANAME[f[3]]) return;
      out.layout[f[0]] = { x: lim(f[1], -5, 105), y: lim(f[2], -5, 105), a: f[3], s: lim(f[4], 50, 170), on: f[5] === "0" ? 0 : 1 };
    });
    return out;
  }
  function useDecoded(o) {
    preset = o.preset;
    var base = presetById(preset) || PRESETS[0];
    COMPS.forEach(function (c) { layout[c.id] = o.layout[c.id] || entry(base, c.id); });
    H.apply(o.cfg);
    placeAll();
  }
  function saveLocal(s) { try { localStorage.setItem(LS_KEY, s); } catch (_) {} }
  function loadLocal() { try { return localStorage.getItem(LS_KEY); } catch (_) { return null; } }
  function persist() {
    var s = encode();
    saveLocal(s);
    E.send("hudsettings", "save", -1, s);
  }

  /* ------------------------------------------------------------------ */
  /* Menempatkan komponen                                                */
  /* ------------------------------------------------------------------ */
  function placeOne(id) {
    var c = comp(id), el = c && document.getElementById(c.el), p = layout[id];
    if (!el || !p) return;
    var off = !p.on && !c.always;
    el.__ehOff = off;
    el.classList.toggle("eh-off", off);
    if (id === "quickbar") {
      // quickbar memakai transform sendiri (animasi sembunyi/peek): atur left & bottom saja
      el.style.left = p.x + "%"; el.style.bottom = r2(100 - p.y) + "%"; el.style.top = "auto"; el.style.right = "auto";
      return;
    }
    var ax = AX[p.a.charAt(1)], ay = AY[p.a.charAt(0)], s = (p.s / 100) * ((+H.cfg.sc || 100) / 100), up = editing ? 0 : (lifts[id] || 0);
    el.setAttribute("data-a", p.a);
    el.style.left = p.x + "%"; el.style.top = p.y + "%"; el.style.right = "auto"; el.style.bottom = "auto"; el.style.margin = "0";
    el.style.transformOrigin = (ax * 100) + "% " + (ay * 100) + "%";
    el.style.transform = "translate(" + (-ax * 100) + "%," + (-ay * 100) + "%)" + (up ? " translateY(" + (-up) + "px)" : "") + " scale(" + s.toFixed(3) + ")";
    if (!off) fit(el, p, id);
  }
  // Kotak komponen di layar TANPA angkatan quickbar, dihitung dari posisi + ukuran asli
  // (offsetWidth tidak terpengaruh transform). Sengaja tidak memakai getBoundingClientRect:
  // saat animasi transform masih berjalan hasilnya posisi lama, sehingga hitungan angkatan
  // bisa menumpuk dan komponen naik terlalu tinggi.
  function geom(id, el) {
    var p = layout[id];
    if (!p || !el) return null;
    var W = el.offsetWidth, Hh = el.offsetHeight;
    if (!W || !Hh) return null;
    var vw = window.innerWidth || 1, vh = window.innerHeight || 1;
    var s = (p.s / 100) * ((+H.cfg.sc || 100) / 100), ax = AX[p.a.charAt(1)], ay = AY[p.a.charAt(0)];
    var lx = parseFloat(el.style.left), ty = parseFloat(el.style.top);
    var X = (isNaN(lx) ? p.x : lx) / 100 * vw, Y = (isNaN(ty) ? p.y : ty) / 100 * vh;
    var w = W * s, hh = Hh * s, l = X - ax * w, t = Y - ay * hh;
    return { l: l, r: l + w, t: t, b: t + hh };
  }
  // jaga agar tetap di dalam layar (tanpa mengubah posisi yang disimpan)
  function fit(el, p, id) {
    var g = geom(id, el);
    if (!g) return;
    var vw = window.innerWidth || 1, vh = window.innerHeight || 1, pad = 2, dx = 0, dy = 0;
    if (g.r > vw - pad) dx = vw - pad - g.r;
    if (g.l + dx < pad) dx = pad - g.l;
    if (g.b > vh - pad) dy = vh - pad - g.b;
    if (g.t + dy < pad) dy = pad - g.t;
    if (dx) el.style.left = r2(p.x + dx / vw * 100) + "%";
    if (dy) el.style.top = r2(p.y + dy / vh * 100) + "%";
  }
  function placeAll() { COMPS.forEach(function (c) { placeOne(c.id); }); if (editing) syncHandles(); else computeLifts(); }

  /* ---------- quickbar terbuka: angkat komponen bawah yang tertimpa ---------- */
  var lifts = {};
  function qbRect() {
    var q = document.getElementById("eagle-quickbar");
    if (editing || !q || !q.classList.contains("on") || q.classList.contains("eh-off")) return null;
    var r = q.getBoundingClientRect(), top = r.top, hd = q.querySelector(".eagle-qb-handle");
    if (hd) { var hr = hd.getBoundingClientRect(); if (hr.height) top = Math.min(top, hr.top); }
    if (!r.width || top >= window.innerHeight - 1) return null;
    return { left: r.left, right: r.right, top: top };
  }
  function computeLifts() {
    var q = qbRect(), base = {}, want = {}, ids = [];
    COMPS.forEach(function (c) {
      if (c.id === "quickbar" || c.id === "notify") return;
      ids.push(c.id);
      var p = layout[c.id], el = document.getElementById(c.el);
      if (!q || !p || !p.on || !el || p.a.charAt(0) !== "b" || !el.classList.contains("on")) return;
      var g = geom(c.id, el);                 // posisi tanpa diangkat
      if (g) base[c.id] = g;
    });
    if (q) {
      Object.keys(base).forEach(function (id) {
        var b = base[id];
        if (b.l < q.right && b.r > q.left && b.b > q.top - 4) want[id] = Math.round(b.b - (q.top - 6));
      });
      // komponen yang bertumpuk di atasnya ikut naik (mis. lokasi di atas status)
      for (var pass = 0; pass < 3; pass++) {
        Object.keys(base).forEach(function (id) {
          var b = base[id];
          Object.keys(want).forEach(function (lid) {
            if (lid === id) return;
            var lb = base[lid], L = want[lid], top = lb.t - L;
            if (b.l < lb.r && b.r > lb.l && b.t < lb.t && b.b > top - 4) {
              var need = Math.round(b.b - (top - 6));
              if (need > (want[id] || 0)) want[id] = need;
            }
          });
        });
      }
    }
    ids.forEach(function (id) {
      var lift = want[id] || 0;
      if ((lifts[id] || 0) !== lift) { lifts[id] = lift; placeOne(id); }
    });
  }
  window.addEventListener("eagle-qb", function () { computeLifts(); setTimeout(computeLifts, 320); });
  var fitT = 0;
  function refit() { if (fitT) return; fitT = requestAnimationFrame(function () { fitT = 0; placeAll(); }); }
  window.addEventListener("resize", refit);
  var ro = window.ResizeObserver ? new ResizeObserver(refit) : null;
  function observeAll() { if (!ro) return; COMPS.forEach(function (c) { var el = document.getElementById(c.el); if (el && !el.__ehRO) { el.__ehRO = 1; try { ro.observe(el); } catch (_) {} } }); }

  /* ------------------------------------------------------------------ */
  /* Ikon kecil editor                                                   */
  /* ------------------------------------------------------------------ */
  var EI = {
    side: '<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>',
    down: '<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>',
    close: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
    up: '<path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>',
    left: '<path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>',
    right: '<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>',
    tune: '<path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>',
    walk: '<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>',
    car: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>'
  };
  function ei(n) { return '<svg class="ehe-i" viewBox="0 0 24 24">' + EI[n] + "</svg>"; }

  /* ------------------------------------------------------------------ */
  /* Editor                                                              */
  /* ------------------------------------------------------------------ */
  var root = h("div", { id: "ehe", class: "ehe" });
  var gridEl = h("div", { class: "ehe-grid" });
  var guideV = h("i", { class: "ehe-gv" }), guideH = h("i", { class: "ehe-gh" });
  var handles = h("div", { class: "ehe-handles" });
  var panel = h("section", { class: "ehe-panel", "data-touch": "" });
  var fab = h("button", { class: "ehe-fab", type: "button", "data-touch": "", html: ei("tune") + "<span>Panel</span>" });
  root.appendChild(gridEl); root.appendChild(guideV); root.appendChild(guideH); root.appendChild(handles); root.appendChild(panel); root.appendChild(fab);
  // di luar #app supaya selalu di atas notifikasi, panel, dan HP
  document.body.appendChild(root);

  var editing = false, snapshot = null, sel = "status", tab = "layout", side = "r", hidden = false;
  // pratinjau: "foot" = jalan kaki (quickbar tampil), "veh" = di kendaraan (speedometer tampil)
  var pv = "foot";
  function shownIn(id, m) {
    if (id === "speedo") return m === "veh";
    if (id === "quickbar") return m === "foot";
    if (id === "loc") return m === "veh" || !!H.cfg.locfoot;
    if (id === "money") return m === "foot" || !!H.cfg.mveh;
    return true;
  }
  function setPv(m) {
    if (m !== "foot" && m !== "veh") m = "foot";
    pv = m;
    if (editing) { H.demo(pv); placeAll(); }
  }
  // pindah pratinjau bila komponen yang dipilih tidak terlihat di pratinjau sekarang
  function ensureShown(id) {
    if (shownIn(id, pv)) return;
    var other = pv === "foot" ? "veh" : "foot";
    if (shownIn(id, other)) setPv(other);
  }

  function open() {
    if (editing) return;
    editing = true;
    snapshot = encode();
    var stt = H.state ? H.state() : null;
    pv = stt && stt.sp && +stt.sp.show ? "veh" : "foot";   // buka sesuai kondisi pemain sekarang
    H.demo(pv);
    root.classList.add("on");
    root.setAttribute("data-touch", "");
    document.documentElement.classList.add("eh-editing");
    hidden = false;
    paintPanel();
    buildHandles();
    placeAll();
    E.touch();
  }
  function close(save) {
    if (!editing) return;
    if (save) persist();
    else if (snapshot) { var o = decode(snapshot); if (o) useDecoded(o); }
    editing = false;
    H.demo(false);
    root.classList.remove("on");
    root.removeAttribute("data-touch");
    document.documentElement.classList.remove("eh-editing");
    handles.innerHTML = "";
    placeAll();
    E.touch();
    if (save) E.send("hudsettings", "close", 1);
  }
  fab.addEventListener("click", function () { hidden = false; paintPanel(); });

  /* ---------- kotak geser di atas komponen ---------- */
  function buildHandles() {
    handles.innerHTML = "";
    COMPS.forEach(function (c) {
      var b = h("div", { class: "ehe-h", "data-id": c.id }, [h("span", { class: "ehe-hl", text: c.name })]);
      dragHandle(b, c.id);
      handles.appendChild(b);
    });
    syncHandles();
  }
  function syncHandles() {
    if (!editing) return;
    COMPS.forEach(function (c) {
      var b = handles.querySelector('[data-id="' + c.id + '"]'), el = document.getElementById(c.el), p = layout[c.id];
      if (!b) return;
      var vis = el && (c.id === "notify" || (c.id === "quickbar" ? pv === "foot" : el.classList.contains("on")));
      if (!el || (!p.on && !c.always) || !vis) { b.style.display = "none"; return; }
      var r = el.getBoundingClientRect();
      var w = Math.max(r.width, 34), hh = Math.max(r.height, 22);
      b.style.display = "block";
      b.style.left = (r.left + r.width / 2 - w / 2 - 3) + "px";
      b.style.top = (r.top + r.height / 2 - hh / 2 - 3) + "px";
      b.style.width = (w + 6) + "px";
      b.style.height = (hh + 6) + "px";
      b.classList.toggle("sel", c.id === sel);
    });
    placeLabels();
  }
  // label nama komponen: di atas kotak, pindah ke bawah bila tertutup kotak lain,
  // disembunyikan bila tidak ada tempat (kecuali komponen yang sedang dipilih)
  function hit(a, b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t; }
  function placeLabels() {
    var items = [];
    COMPS.forEach(function (c) {
      var b = handles.querySelector('[data-id="' + c.id + '"]');
      if (!b || b.style.display === "none") return;
      b.classList.remove("lbl-x");
      var l = parseFloat(b.style.left) || 0, t = parseFloat(b.style.top) || 0;
      items.push({ id: c.id, el: b, l: l, t: t, r: l + (parseFloat(b.style.width) || 0), b: t + (parseFloat(b.style.height) || 0) });
    });
    items.sort(function (a, b) { return (b.id === sel ? 1 : 0) - (a.id === sel ? 1 : 0); });
    var taken = [], vh = window.innerHeight || 1;
    function free(r, self) {
      if (r.t < 0 || r.b > vh) return false;
      for (var i = 0; i < items.length; i++) if (items[i].id !== self && hit(r, items[i])) return false;
      for (var j = 0; j < taken.length; j++) if (hit(r, taken[j])) return false;
      return true;
    }
    items.forEach(function (it) {
      var lb = it.el.querySelector(".ehe-hl"), lw = (lb && lb.offsetWidth) || 60, lh = (lb && lb.offsetHeight) || 12;
      var up = { l: it.l, r: it.l + lw, t: it.t - lh - 2, b: it.t - 2 };
      var dn = { l: it.l, r: it.l + lw, t: it.b + 2, b: it.b + lh + 2 };
      // yang dipilih tetap diberi label: di dalam sudut kotaknya sendiri bila di luar tidak ada tempat
      var pos = free(up, it.id) ? "up" : free(dn, it.id) ? "dn" : it.id === sel ? "in" : "none";
      it.el.classList.toggle("lbl-b", pos === "dn");
      it.el.classList.toggle("lbl-in", pos === "in");
      it.el.classList.toggle("lbl-x", pos === "none");
      if (pos === "up" || pos === "dn") taken.push(pos === "dn" ? dn : up);
    });
  }
  function markCustom() { if (preset !== "custom") { preset = "custom"; } }
  function snapCenter(id) {
    // tempel ke garis tengah layar bila dekat
    var c = comp(id), el = document.getElementById(c.el), p = layout[id];
    var r = el.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, gx = false, gy = false;
    var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    if (Math.abs(cx - vw / 2) < vw * 0.012) { p.x = r2(p.x + (vw / 2 - cx) / vw * 100); gx = true; }
    if (id !== "quickbar" && Math.abs(cy - vh / 2) < vh * 0.015) { p.y = r2(p.y + (vh / 2 - cy) / vh * 100); gy = true; }
    if (gx || gy) placeOne(id);
    guideV.classList.toggle("on", gx); guideH.classList.toggle("on", gy);
  }
  function reanchor(id) {
    if (id === "quickbar") return;
    var c = comp(id), el = document.getElementById(c.el), p = layout[id];
    var r = el.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    if (!r.width) return;
    var cx = (r.left + r.right) / 2 / vw, cy = (r.top + r.bottom) / 2 / vh;
    var ha = cx < 0.34 ? "l" : cx > 0.66 ? "r" : "c", va = cy < 0.34 ? "t" : cy > 0.66 ? "b" : "m";
    var x = ha === "l" ? r.left : ha === "r" ? r.right : (r.left + r.right) / 2;
    var y = va === "t" ? r.top : va === "b" ? r.bottom : (r.top + r.bottom) / 2;
    p.a = va + ha; p.x = r2(x / vw * 100); p.y = r2(y / vh * 100);
  }
  function dragHandle(b, id) {
    var st = null;
    b.addEventListener("pointerdown", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (sel !== id) { sel = id; if (tab === "pos") paintPanel(); }
      var p = layout[id];
      st = { sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, moved: false };
      try { b.setPointerCapture(e.pointerId); } catch (_) {}
      syncHandles();
    });
    b.addEventListener("pointermove", function (e) {
      if (!st) return;
      var dx = e.clientX - st.sx, dy = e.clientY - st.sy;
      if (!st.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      st.moved = true;
      var p = layout[id];
      p.x = r2(lim(st.ox + dx / window.innerWidth * 100, -5, 105));
      p.y = r2(lim(st.oy + dy / window.innerHeight * 100, -5, 105));
      placeOne(id); snapCenter(id); syncHandles();
    });
    function end() {
      if (!st) return;
      var moved = st.moved; st = null;
      guideV.classList.remove("on"); guideH.classList.remove("on");
      if (moved) { reanchor(id); placeOne(id); markCustom(); syncHandles(); paintPanel(); }
    }
    b.addEventListener("pointerup", end);
    b.addEventListener("pointercancel", end);
  }

  /* ---------- panel ---------- */
  function btn(cls, html, fn, attrs) {
    var o = { type: "button", class: cls, html: html };
    if (attrs) for (var k in attrs) o[k] = attrs[k];
    var b = h("button", o);
    b.addEventListener("click", function (e) { e.stopPropagation(); fn(e); });
    return b;
  }
  function holdBtn(cls, html, fn) {
    var b = h("button", { type: "button", class: cls, html: html }), t1 = 0, t2 = 0;
    function stop() { clearTimeout(t1); clearInterval(t2); t1 = t2 = 0; }
    b.addEventListener("pointerdown", function (e) { e.preventDefault(); fn(); stop(); t1 = setTimeout(function () { t2 = setInterval(fn, 70); }, 350); });
    b.addEventListener("pointerup", stop); b.addEventListener("pointerleave", stop); b.addEventListener("pointercancel", stop);
    return b;
  }
  function chips(list, cur, fn) {
    var w = h("div", { class: "ehe-chips" });
    list.forEach(function (it) {
      w.appendChild(btn("ehe-chip" + (String(it[0]) === String(cur) ? " on" : ""), U.esc(it[1]), function () { fn(it[0]); }));
    });
    return w;
  }
  function toggle(on, fn) {
    return btn("ehe-tg" + (on ? " on" : ""), "<i></i>", function () { fn(!on); });
  }
  function row(label, sub, ctrl) {
    return h("div", { class: "ehe-row" }, [h("div", { class: "ehe-rt" }, [h("b", { text: label }), sub ? h("small", { text: sub }) : null]), ctrl]);
  }
  function lbl(t) { return h("div", { class: "ehe-lbl", text: t }); }
  function setCfg(k, v) {
    var o = {}; o[k] = v; H.apply(o);
    placeAll(); paintPanel();
  }

  function thumb(pr) {
    var t = h("div", { class: "ehe-thumb" + (pr.radar ? " r-" + pr.radar : "") });
    if (pr.radar) t.appendChild(h("i", { class: "ehe-radar" }));
    COMPS.forEach(function (c) {
      var e = entry(pr, c.id);
      if (!e.on) return;
      var col = c.id === "status" && pr.sd === "col";
      var w = col ? c.twc : c.tw, hh = col ? c.thc : c.th;
      if (c.id === "quickbar") { w = 40; hh = 10; }
      var ax = AX[e.a.charAt(1)], ay = AY[e.a.charAt(0)];
      var x = lim(e.x - w * ax, 1, 99 - w), y = lim(e.y - hh * ay, 1, 99 - hh);
      t.appendChild(h("i", { class: "ehe-tb c-" + c.id, style: "left:" + x + "%;top:" + y + "%;width:" + w + "%;height:" + hh + "%" }));
    });
    return t;
  }

  function paintPanel() {
    panel.innerHTML = "";
    root.classList.toggle("left", side === "l");
    root.classList.toggle("hide", hidden);
    var head = h("header", { class: "ehe-head" }, [
      h("div", { class: "ehe-title" }, [h("b", { text: "Pengaturan HUD" }), h("small", { text: "Geser kotak di layar untuk memindahkan" })]),
      btn("ehe-hb", ei("side"), function () { side = side === "r" ? "l" : "r"; paintPanel(); E.touch(); }, { title: "Pindah sisi" }),
      btn("ehe-hb", ei("down"), function () { hidden = true; paintPanel(); E.touch(); }, { title: "Sembunyikan panel" }),
      btn("ehe-hb", ei("close"), function () { close(false); }, { title: "Tutup tanpa simpan" })
    ]);
    var pvRow = h("div", { class: "ehe-pv" }, [
      btn("ehe-pvb" + (pv === "foot" ? " on" : ""), ei("walk") + "<span>Jalan kaki</span>", function () { setPv("foot"); paintPanel(); }, { title: "Pratinjau saat jalan kaki" }),
      btn("ehe-pvb" + (pv === "veh" ? " on" : ""), ei("car") + "<span>Di kendaraan</span>", function () { setPv("veh"); paintPanel(); }, { title: "Pratinjau saat di kendaraan" })
    ]);
    var tabs = h("nav", { class: "ehe-tabs" });
    [["layout", "Tata Letak"], ["pos", "Posisi"], ["style", "Gaya"], ["opt", "Opsi"]].forEach(function (t) {
      tabs.appendChild(btn("ehe-tab" + (tab === t[0] ? " on" : ""), t[1], function () { tab = t[0]; paintPanel(); }));
    });
    var body = h("div", { class: "ehe-body" });
    if (tab === "layout") paintLayout(body);
    else if (tab === "pos") paintPos(body);
    else if (tab === "style") paintStyle(body);
    else paintOpt(body);
    var foot = h("footer", { class: "ehe-foot" }, [
      btn("ehe-btn ghost", "Batal", function () { close(false); }),
      btn("ehe-btn ghost", "Reset", function () {
        var pr = PRESETS[0]; preset = pr.id; useLayoutOf(pr);
        var d = {}; for (var k in H.def) d[k] = H.def[k];
        for (var j in pr.S) d[j] = pr.S[j];
        d.sd = pr.sd;
        H.apply(d); placeAll(); paintPanel();
      }),
      btn("ehe-btn primary", "Simpan", function () { close(true); })
    ]);
    panel.appendChild(head); panel.appendChild(pvRow); panel.appendChild(tabs); panel.appendChild(body); panel.appendChild(foot);
    if (editing) setTimeout(syncHandles, 0);
  }

  function paintLayout(body) {
    var grid = h("div", { class: "ehe-presets" });
    PRESETS.forEach(function (pr) {
      var b = btn("ehe-pre" + (preset === pr.id ? " on" : ""), "", function () {
        preset = pr.id; useLayoutOf(pr);
        var st = {}; for (var k in pr.S) st[k] = pr.S[k];
        if (pr.sd) st.sd = pr.sd;
        H.apply(st);
        placeAll(); paintPanel();
      });
      b.appendChild(thumb(pr));
      b.appendChild(h("b", { text: pr.name }));
      b.appendChild(h("small", { text: pr.sub }));
      grid.appendChild(b);
    });
    body.appendChild(grid);
    body.appendChild(h("p", { class: "ehe-note", text: (preset === "custom" ? "Tata letak kustom. Pilih salah satu di atas untuk mulai ulang. " : "") +
      "Tiap tata letak memakai gaya bawaannya; ganti gaya di tab Gaya. Lingkaran abu-abu = perkiraan letak radar." }));
  }

  function paintPos(body) {
    var list = h("div", { class: "ehe-comps" });
    COMPS.forEach(function (c) {
      var p = layout[c.id];
      list.appendChild(btn("ehe-comp" + (sel === c.id ? " on" : "") + (!p.on && !c.always ? " off" : ""), '<i></i>' + U.esc(c.name), function () { sel = c.id; ensureShown(sel); paintPanel(); }));
    });
    body.appendChild(list);
    var c = comp(sel), p = layout[sel], isQ = sel === "quickbar";
    var sec = h("div", { class: "ehe-sec" });
    sec.appendChild(h("div", { class: "ehe-selt" }, [h("b", { text: c.name }), h("small", { text: c.sub })]));
    if (!shownIn(sel, pv)) sec.appendChild(h("p", { class: "ehe-note", text: "Tidak tampil di pratinjau " + (pv === "veh" ? "di kendaraan" : "jalan kaki") + ". Ganti pratinjau di atas untuk melihatnya." }));
    if (!c.always) sec.appendChild(row("Tampilkan", null, toggle(!!p.on, function (v) { p.on = v ? 1 : 0; markCustom(); placeAll(); paintPanel(); })));
    sec.appendChild(lbl("Letak cepat"));
    var g9 = h("div", { class: "ehe-9" });
    ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"].forEach(function (a) {
      var dis = isQ && a.charAt(0) !== "b";
      g9.appendChild(btn("ehe-9b" + (p.a === a && !isQ ? " on" : "") + (dis ? " dis" : ""), "<i></i>", function () {
        if (dis) return;
        if (isQ) { p.x = { l: 27, c: 50, r: 73 }[a.charAt(1)]; p.y = 98.8; }
        else { p.a = a; p.x = QP[a][0]; p.y = QP[a][1]; }
        markCustom(); placeOne(sel); syncHandles(); paintPanel();
      }, { title: ANAME[a] }));
    });
    sec.appendChild(g9);
    sec.appendChild(lbl("Geser halus"));
    function nudge(dx, dy) { return function () { p.x = r2(lim(p.x + dx, -5, 105)); p.y = r2(lim(p.y + dy, -5, 105)); markCustom(); placeOne(sel); syncHandles(); var pe = sec.querySelector(".ehe-xy"); if (pe) pe.textContent = xyText(); }; }
    sec.appendChild(h("div", { class: "ehe-nudge" }, [
      holdBtn("ehe-nb", ei("left"), nudge(-0.5, 0)), holdBtn("ehe-nb", ei("up"), nudge(0, -0.5)),
      holdBtn("ehe-nb", ei("down"), nudge(0, 0.5)), holdBtn("ehe-nb", ei("right"), nudge(0.5, 0))
    ]));
    function xyText() { return "X " + p.x.toFixed(1) + "% · Y " + p.y.toFixed(1) + "%" + (isQ ? "" : " · jangkar " + ANAME[p.a]); }
    sec.appendChild(h("div", { class: "ehe-xy", text: xyText() }));
    sec.appendChild(lbl("Ukuran"));
    var val = isQ ? (+H.cfg.qbsc || 100) : p.s;
    function size(d) {
      return function () {
        if (isQ) { H.apply({ qbsc: lim((+H.cfg.qbsc || 100) + d, 70, 130) }); }
        else { p.s = lim(p.s + d, 60, 160); markCustom(); placeOne(sel); }
        syncHandles(); paintPanel();
      };
    }
    sec.appendChild(h("div", { class: "ehe-step" }, [btn("ehe-nb", "−", size(-10)), h("b", { text: Math.round(val) + "%" }), btn("ehe-nb", "+", size(10))]));
    var acts = h("div", { class: "ehe-acts" });
    acts.appendChild(btn("ehe-btn ghost sm", "Kembalikan posisi", function () {
      var pr = presetById(preset) || PRESETS[0];
      layout[sel] = entry(pr, sel); placeOne(sel); syncHandles(); paintPanel();
    }));
    if (sel === "notify") acts.appendChild(btn("ehe-btn ghost sm", "Tes notifikasi", function () { H.testNotify(); setTimeout(syncHandles, 60); }));
    sec.appendChild(acts);
    body.appendChild(sec);
  }

  function paintStyle(body) {
    var c = H.cfg;
    body.appendChild(lbl("Status"));
    body.appendChild(chips([["circle", "Lingkaran"], ["square", "Kotak"], ["hex", "Segi enam"], ["bar", "Bar"], ["text", "Angka"], ["mini", "Mini"]], c.st, function (v) { setCfg("st", v); }));
    if (c.st !== "bar") {
      body.appendChild(lbl("Arah status"));
      body.appendChild(chips([["row", "Mendatar"], ["col", "Tegak"]], c.sd, function (v) { setCfg("sd", v); }));
    }
    body.appendChild(lbl("Speedometer"));
    body.appendChild(chips([["ring", "Lingkaran"], ["gauge", "Jarum"], ["digital", "Kotak"], ["mini", "Ringkas"]], c.sp, function (v) { ensureShown("speedo"); setCfg("sp", v); }));
    body.appendChild(lbl("Lokasi"));
    body.appendChild(chips([["street", "Label jalan"], ["compass", "Kompas"], ["mini", "Ringkas"]], c.lo, function (v) { ensureShown("loc"); setCfg("lo", v); }));
    body.appendChild(lbl("Uang"));
    body.appendChild(chips([["gta", "Gaya GTA"], ["box", "Kotak"], ["mini", "Ringkas"]], c.mo, function (v) { ensureShown("money"); setCfg("mo", v); }));
    body.appendChild(lbl("Logo"));
    body.appendChild(chips([["logo", "Logo + ID"], ["id", "ID saja"]], c.wm, function (v) { setCfg("wm", v); }));
    body.appendChild(lbl("Warna aksen"));
    var sw = h("div", { class: "ehe-sw" });
    Object.keys(H.accents).forEach(function (k) {
      var b = btn("ehe-swb" + (c.ac === k ? " on" : ""), "", function () { setCfg("ac", k); }, { title: k });
      b.style.background = H.accents[k][0];
      sw.appendChild(b);
    });
    body.appendChild(sw);
    body.appendChild(lbl("Transparansi"));
    body.appendChild(chips([[60, "60%"], [70, "70%"], [80, "80%"], [90, "90%"], [95, "95%"], [100, "100%"]], c.op, function (v) { setCfg("op", v); }));
    body.appendChild(lbl("Ukuran semua komponen"));
    body.appendChild(chips([[80, "80%"], [90, "90%"], [100, "100%"], [110, "110%"], [120, "120%"], [130, "130%"]], c.sc, function (v) { setCfg("sc", v); }));
  }

  function paintOpt(body) {
    var c = H.cfg;
    function opt(k, t, s) { body.appendChild(row(t, s, toggle(!!c[k], function (v) { setCfg(k, v ? 1 : 0); }))); }
    opt("nums", "Angka di status", "Tampilkan nilai 0-100");
    opt("hidefull", "Sembunyikan status penuh", "Darah/lapar/haus 100, stres 0");
    opt("hidear", "Sembunyikan armor kosong", null);
    opt("locfoot", "Lokasi saat jalan kaki", "Mati = hanya di kendaraan");
    opt("clock", "Jam di lokasi", null);
    opt("mveh", "Uang saat berkendara", null);
    opt("delta", "Perubahan uang (+/-)", "Muncul 3 detik saat uang berubah");
    opt("job", "Tampilkan pekerjaan", null);
    body.appendChild(lbl("Quickbar sembunyi otomatis"));
    body.appendChild(chips([[0, "Tidak"], [3, "3 detik"], [5, "5 detik"], [10, "10 detik"]], c.qbhide, function (v) { setCfg("qbhide", v); }));
    body.appendChild(lbl("Ukuran quickbar"));
    body.appendChild(chips([[80, "80%"], [90, "90%"], [100, "100%"], [110, "110%"], [120, "120%"]], c.qbsc, function (v) { setCfg("qbsc", v); }));
  }

  /* ------------------------------------------------------------------ */
  /* Event                                                               */
  /* ------------------------------------------------------------------ */
  // /hud, /hudeditor, /hudsettings
  E.on("hudsettings", function (d) { if (d && +d.show === 0) close(false); else open(); });
  // pengaturan tersimpan di server untuk karakter ini
  E.on("hudcfg", function (d) {
    var s = d && typeof d.d === "string" ? d.d : "";
    var o = s ? decode(s) : null;
    if (o) {
      if (editing) { snapshot = s; return; }
      useDecoded(o); saveLocal(s);
    } else {
      // server belum punya: kirim pengaturan HP ini supaya tersimpan di akun
      var l = loadLocal();
      if (l && decode(l)) E.send("hudsettings", "save", -1, l);
    }
  });

  // muat pengaturan HP ini dulu (server akan menimpa bila punya)
  (function boot() {
    var o = decode(loadLocal() || "");
    if (o) useDecoded(o);
    else { var st = {}; for (var k in PRESETS[0].S) st[k] = PRESETS[0].S[k]; st.sd = PRESETS[0].sd; H.apply(st); placeAll(); }
    observeAll();
    // komponen yang dibuat file lain (quickbar/notifikasi) mungkin belum ada saat ini
    setTimeout(function () { observeAll(); placeAll(); }, 0);
    window.addEventListener("load", function () { observeAll(); placeAll(); });
  })();

  window.EAGLEHUDLayout = {
    apply: placeAll, open: open, close: close,
    encode: encode, decode: decode,
    presets: PRESETS, layout: function () { return layout; }
  };
})();
