/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : hud.js  (EAGLE HUD v25)
   HUD gaya FiveM: status (6 gaya), suara, uang & pekerjaan, logo/ID,
   lokasi (label jalan / kompas / ringkas), speedometer (4 gaya), FPS,
   notifikasi, kotak item, progress, banner, overlay, prompt tombol,
   spectate.
   Posisi komponen diatur editor HUD (hud_settings.js). Gaya & opsi
   disimpan di window.EHUD.cfg (juga diatur editor).
   Data dari server tetap sama: event hud / speedo / location / fps /
   watermark (lihat SERVER/ui/ui_hud.inc).
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;

  /* ------------------------------------------------------------------ */
  /* Ikon terisi 24x24. Sebagian dari Material Icons (Apache 2.0),       */
  /* sisanya (burger, tetes, otak, lampu) digambar sendiri.              */
  /* ------------------------------------------------------------------ */
  var IC = {
    hp: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    ar: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>',
    hg: '<path d="M3.5 10.6C3.5 6.95 7.3 4 12 4s8.5 2.95 8.5 6.6z"/><rect x="2.5" y="12.1" width="19" height="2.6" rx="1.3"/><path d="M3.5 16.4h17v1.1c0 1.66-1.34 3-3 3h-11c-1.66 0-3-1.34-3-3z"/>',
    th: '<path d="M12 2.5C9.2 6.2 5.5 10.6 5.5 14.5a6.5 6.5 0 0 0 13 0c0-3.9-3.7-8.3-6.5-12z"/>',
    st: '<path d="M9 3.5a3 3 0 0 0-2.9 2.3A3.2 3.2 0 0 0 3.5 9c0 .9.3 1.7.9 2.3a3.3 3.3 0 0 0 .8 5.2A3 3 0 0 0 9 20.5c1.2 0 2.3-.7 2.7-1.8h.6c.4 1.1 1.5 1.8 2.7 1.8a3 3 0 0 0 3.8-4 3.3 3.3 0 0 0 .8-5.2c.6-.6.9-1.4.9-2.3a3.2 3.2 0 0 0-2.6-3.2A3 3 0 0 0 15 3.5c-1.2 0-2.3.6-3 1.6-.7-1-1.8-1.6-3-1.6z"/><path d="M12 6v12.5M8.2 8.8c1 .3 1.8 1 2.1 2M15.8 8.8c-1 .3-1.8 1-2.1 2M7.8 14.2c.9-.6 2-.7 3-.3M16.2 14.2c-.9-.6-2-.7-3-.3" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.2" stroke-linecap="round"/>',
    vo: '<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>',
    fuel: '<path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
    eng: '<path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>',
    light: '<path d="M10.5 5.5C6.4 5.5 3.5 8.4 3.5 12s2.9 6.5 7 6.5H12V5.5z"/><rect x="14" y="6.2" width="7" height="2" rx="1"/><rect x="14" y="11" width="7" height="2" rx="1"/><rect x="14" y="15.8" width="7" height="2" rx="1"/>',
    lock: '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>',
    unlock: '<path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>',
    wrench: '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>',
    cash: '<path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/>',
    bank: '<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>',
    job: '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
    id: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
    group: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
    sig: '<path d="M17 4h3v16h-3zM5 14h3v6H5zm6-5h3v11h-3z"/>',
    ok: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
    err: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
    warn: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
    info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
    cmd: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm10 2h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V7h6v2z"/>',
    speed: '<path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/>',
    pin: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
    car: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>'
  };
  function si(name, cls) {
    return '<svg class="eh-i' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[name] || IC.info) + "</svg>";
  }

  /* ------------------------------------------------------------------ */
  /* Konfigurasi gaya (diubah editor HUD)                               */
  /* ------------------------------------------------------------------ */
  var DEF = {
    st: "circle",   // gaya status: circle | square | hex | bar | text | mini
    sd: "row",      // arah status: row | col
    sp: "ring",     // speedometer: ring | gauge | digital | mini
    lo: "street",   // lokasi: street | compass | mini
    mo: "gta",      // uang: gta | box | mini
    wm: "logo",     // logo: logo | id
    ac: "kuning",   // warna aksen
    op: 95,         // transparansi (%)
    sc: 100,        // ukuran semua komponen (%)
    nums: 0,        // angka di status
    hidefull: 0,    // sembunyikan status yang penuh
    hidear: 1,      // sembunyikan armor 0
    locfoot: 1,     // lokasi saat jalan kaki
    mveh: 0,        // uang tetap tampil di kendaraan
    delta: 1,       // perubahan uang (+/-)
    job: 1,         // baris pekerjaan
    clock: 1,       // jam di lokasi
    qbhide: 5,      // quickbar sembunyi otomatis (detik, 0 = tidak)
    qbsc: 100       // ukuran quickbar (%)
  };
  var ENUM = { st: ["circle", "square", "hex", "bar", "text", "mini"], sd: ["row", "col"], sp: ["ring", "gauge", "digital", "mini"],
    lo: ["street", "compass", "mini"], mo: ["gta", "box", "mini"], wm: ["logo", "id"] };
  var ACC = {
    kuning: ["#f5c518", "#d4a90a", "245,197,24", "#141100"],
    putih: ["#f1f1f1", "#bdbdbd", "241,241,241", "#111111"],
    merah: ["#ef4444", "#c62828", "239,68,68", "#ffffff"],
    oranye: ["#f97316", "#c2410c", "249,115,22", "#1a0a00"],
    hijau: ["#22c55e", "#15803d", "34,197,94", "#04140a"],
    biru: ["#3b82f6", "#1d4ed8", "59,130,246", "#ffffff"],
    ungu: ["#a855f7", "#7e22ce", "168,85,247", "#ffffff"],
    tosca: ["#14b8a6", "#0f766e", "20,184,166", "#03211d"]
  };
  var CFG = {};
  for (var k0 in DEF) CFG[k0] = DEF[k0];

  function applyCfg(c) {
    if (c) for (var k in DEF) if (c[k] != null) CFG[k] = c[k];
    for (var e in ENUM) if (ENUM[e].indexOf(CFG[e]) < 0) CFG[e] = DEF[e];
    if (!ACC[CFG.ac]) CFG.ac = DEF.ac;
    var a = ACC[CFG.ac], st = document.documentElement.style;
    st.setProperty("--eh-ac", a[0]); st.setProperty("--eh-actx", a[3]);
    // warna aksen juga dipakai panel lain (ATM, garasi, toko, ...)
    st.setProperty("--ac", a[0]); st.setProperty("--ac2", a[1]); st.setProperty("--acr", a[2]); st.setProperty("--actx", a[3]);
    st.setProperty("--eh-o", String(Math.max(.4, Math.min(1, (+CFG.op || 95) / 100))));
    if (window.EAGLEQuickbar) { window.EAGLEQuickbar.setAutoHide((+CFG.qbhide || 0) * 1000); window.EAGLEQuickbar.setScale((+CFG.qbsc || 100) / 100); }
    renderAll();
  }

  /* ------------------------------------------------------------------ */
  /* Elemen                                                              */
  /* ------------------------------------------------------------------ */
  var hudEl = h("div", { id: "hud", class: "eh-status" });
  var infoEl = h("div", { id: "hud-info", class: "eh-money" });
  var wmEl = h("div", { id: "hud-wm", class: "eh-logo" });
  var locEl = h("div", { id: "hud-loc", class: "eh-loc" });
  var spEl = h("div", { id: "speedo", class: "eh-spd" });
  var fpsEl = h("div", { id: "hud-fps", class: "eh-fps" });
  [hudEl, infoEl, wmEl, locEl, spEl, fpsEl].forEach(function (el) { U.layer("hudlayer").appendChild(el); });
  // className tanpa menghapus penanda editor (eh-off)
  function setCls(el, c) { el.className = c + (el.__ehOff ? " eh-off" : ""); }

  /* data dari server */
  var hud = { show: 0, mode: 1, hp: 100, ar: 0, hg: 100, th: 100, st: 0, vm: 2, info: 0 };
  var sp = { show: 0 };
  var loc = { show: 0 };
  var fps = { show: 0 };
  var wm = { show: 0 };
  var footInfo = 1;       // pemain menyalakan info (diketahui saat jalan kaki)
  var lastCash = null;

  /* mode pratinjau editor: tampilkan komponen dengan data contoh.
     false = mati, "foot" = jalan kaki (tanpa speedometer),
     "veh" = di kendaraan (speedometer tampil, quickbar disembunyikan), "all" = semua */
  var demo = false;
  var DEMO = {
    hud: { show: 1, hp: 82, ar: 45, hg: 64, th: 36, st: 18, vm: 2, info: 1, id: 12, cash: 15250, bank: 250000, job: "Kepolisian - Polisi", on: 57 },
    sp: { show: 1, kmh: 88, fuel: 64, hp: 92, gear: "3", eng: 1, lig: 1, lock: 0 },
    loc: { show: 1, dir: "NE", hd: 45, z: "Pershing Square", c: "Los Santos", time: "20:45", veh: 0 },
    fps: { show: 1, fps: 60, ping: 42, pl: "0.00%" },
    wm: { show: 1, t: "EAGLE", s: "ROLEPLAY" }
  };
  function pick(real, dm) {
    if (!demo) return real;
    var o = {};
    for (var k in dm) o[k] = dm[k];
    for (var j in real) if (real[j] != null && real[j] !== "" && j !== "show") o[j] = real[j];
    o.show = 1;
    return o;
  }
  function clamp(v) { v = Math.round(+v || 0); return v < 0 ? 0 : v > 100 ? 100 : v; }
  function num(n) { n = Math.round(+n || 0); var neg = n < 0; n = Math.abs(n); return (neg ? "-" : "") + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function esc(s) { return U.esc(U.plain(s == null ? "" : String(s))); }

  /* ------------------------------------------------------------------ */
  /* STATUS                                                              */
  /* ------------------------------------------------------------------ */
  var RING_C = 2 * Math.PI * 17;
  function ring(v) {
    return '<svg class="eh-ring" viewBox="0 0 40 40"><circle class="t" cx="20" cy="20" r="17"/><circle class="f" cx="20" cy="20" r="17" stroke-dasharray="' +
      RING_C.toFixed(2) + '" stroke-dashoffset="' + (RING_C * (1 - v / 100)).toFixed(2) + '"/></svg>';
  }
  var VNAME = ["", "Bisik", "Normal", "Teriak"];
  function statItem(k, v, low) {
    var st = CFG.st, cls = "eh-s k-" + k + (low ? " lo" : ""), n = '<b class="eh-n">' + v + "</b>";
    if (st === "circle" || st === "mini") return '<div class="' + cls + '">' + ring(v) + si(k) + (CFG.nums && st === "circle" ? n : "") + "</div>";
    if (st === "square" || st === "hex") return '<div class="' + cls + '"><span class="eh-clip"><i class="eh-fill" style="height:' + v + '%"></i></span>' + si(k) + (CFG.nums ? n : "") + "</div>";
    if (st === "bar") return '<div class="' + cls + '">' + si(k) + '<div class="eh-bar"><i style="width:' + v + '%"></i></div>' + (CFG.nums ? n : "") + "</div>";
    return '<div class="' + cls + '">' + si(k) + n + "</div>";
  }
  function voiceItem(d) {
    var vm = Math.max(1, Math.min(3, +d.vm || 2)), pct = Math.round(vm / 3 * 100), st = CFG.st, cls = "eh-s k-vo v" + vm;
    if (st === "circle" || st === "mini") return '<div class="' + cls + '">' + ring(pct) + si("vo") + (CFG.nums && st === "circle" ? '<b class="eh-n">' + VNAME[vm] + "</b>" : "") + "</div>";
    if (st === "square" || st === "hex") return '<div class="' + cls + '"><span class="eh-clip"><i class="eh-fill" style="height:' + pct + '%"></i></span>' + si("vo") + (CFG.nums ? '<b class="eh-n">' + VNAME[vm] + "</b>" : "") + "</div>";
    if (st === "bar") return '<div class="' + cls + '">' + si("vo") + '<div class="eh-vr"><i class="on"></i><i' + (vm >= 2 ? ' class="on"' : "") + "></i><i" + (vm >= 3 ? ' class="on"' : "") + '></i></div><b class="eh-vt">' + VNAME[vm] + "</b></div>";
    return '<div class="' + cls + '">' + si("vo") + '<b class="eh-n">' + VNAME[vm] + "</b></div>";
  }
  var ORDER = ["hp", "ar", "hg", "th", "st"];
  function renderStatus() {
    var d = pick(hud, DEMO.hud), html = voiceItem(d);
    ORDER.forEach(function (k) {
      var v = clamp(d[k]);
      if (!demo && k === "ar" && v <= 0 && CFG.hidear) return;
      if (!demo && CFG.hidefull && ((k === "st" && v <= 0) || (k !== "st" && k !== "ar" && v >= 100))) return;
      html += statItem(k, v, k === "st" ? v >= 75 : v <= 20);
    });
    var dir = CFG.st === "bar" ? "col" : CFG.sd;
    setCls(hudEl, "eh-status s-" + CFG.st + " d-" + dir + (CFG.nums ? " nums" : "") + (d.show ? " on" : ""));
    hudEl.innerHTML = html;
  }

  /* ------------------------------------------------------------------ */
  /* UANG & PEKERJAAN                                                    */
  /* ------------------------------------------------------------------ */
  function renderMoney() {
    var d = pick(hud, DEMO.hud);
    var inVeh = +loc.veh === 1 || !!sp.show;
    var show = demo ? (demo !== "veh" || !!CFG.mveh) : (d.show && (+d.info === 1 || (CFG.mveh && footInfo && inVeh && d.cash != null)));
    var job = CFG.job && d.job ? '<div class="eh-job">' + si("job") + esc(String(d.job).replace(/^\s*-\s*/, "")) + "</div>" : "";
    var html;
    if (CFG.mo === "box") html = '<div class="eh-cash">' + si("cash") + "$" + num(d.cash) + '</div><div class="eh-bank">' + si("bank") + "$" + num(d.bank) + "</div>" + job;
    else if (CFG.mo === "mini") html = '<div class="eh-row">$' + num(d.cash) + "<span>$" + num(d.bank) + "</span></div>" + job;
    else html = '<div class="eh-cash"><span class="cur">$</span>' + num(d.cash) + '</div><div class="eh-bank">' + si("bank") + "$" + num(d.bank) + "</div>" + job;
    var old = infoEl.querySelector(".eh-delta");
    setCls(infoEl, "eh-money m-" + CFG.mo + (show ? " on" : ""));
    infoEl.innerHTML = html;
    if (old && !demo) infoEl.appendChild(old);
  }
  function moneyDelta(prev, cur) {
    if (!CFG.delta || prev == null || prev === cur) return;
    var d = cur - prev, el = h("div", { class: "eh-delta " + (d > 0 ? "up" : "dn"), text: (d > 0 ? "+$" : "-$") + num(Math.abs(d)) });
    var old = infoEl.querySelector(".eh-delta");
    if (old) old.remove();
    infoEl.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 3000);
  }

  /* ------------------------------------------------------------------ */
  /* LOGO & ID                                                           */
  /* ------------------------------------------------------------------ */
  function renderLogo() {
    var d = pick(wm, DEMO.wm), hd = pick(hud, DEMO.hud);
    var meta = '<div class="eh-meta"><span>' + si("id") + "ID " + (hd.id != null ? esc(hd.id) : "-") + "</span><span>" + si("group") + (+hd.on || 0) + "</span></div>";
    var brand = CFG.wm === "logo" ? '<div class="eh-brand"><b>' + esc(d.t || "EAGLE") + "</b>" + (d.s ? "<i>" + esc(d.s) + "</i>" : "") + "</div>" : "";
    setCls(wmEl, "eh-logo w-" + CFG.wm + (d.show ? " on" : ""));
    wmEl.innerHTML = brand + meta;
  }

  /* ------------------------------------------------------------------ */
  /* LOKASI                                                              */
  /* ------------------------------------------------------------------ */
  var DIRDEG = { N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5, S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5 };
  var CARD = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
  var DPD = 17 / 180;            // rem per derajat (lebar kompas 17rem = 180 derajat)
  var cmp = { tape: null, cur: null };
  function buildTape() {
    var t = h("div", { class: "eh-tape" }), html = "";
    for (var dg = -360; dg < 720; dg += 15) {
      var x = ((dg + 360) * DPD).toFixed(3) + "rem", n = ((dg % 360) + 360) % 360;
      if (n % 45 === 0) html += '<i class="eh-tk mj" style="left:' + x + '"></i><span class="eh-tl' + (n === 0 ? " n" : "") + '" style="left:' + x + '">' + CARD[n] + "</span>";
      else html += '<i class="eh-tk" style="left:' + x + '"></i><span class="eh-tl d" style="left:' + x + '">' + n + "</span>";
    }
    t.innerHTML = html;
    return t;
  }
  function tapeTo(deg) {
    if (!cmp.tape) return;
    if (cmp.cur == null) cmp.cur = deg;
    else { var dlt = ((deg - cmp.cur) % 360 + 540) % 360 - 180; cmp.cur += dlt; }
    var snap = false;
    if (cmp.cur < -170 || cmp.cur > 530) { cmp.cur = ((cmp.cur % 360) + 360) % 360; snap = true; }
    cmp.tape.classList.toggle("snap", snap);
    cmp.tape.style.transform = "translateX(calc(8.5rem - " + ((cmp.cur + 360) * DPD).toFixed(3) + "rem))";
    if (snap) requestAnimationFrame(function () { if (cmp.tape) cmp.tape.classList.remove("snap"); });
  }
  function renderLoc() {
    var d = pick(loc, DEMO.loc);
    if (demo === "veh") d.veh = 1; else if (demo === "foot") d.veh = 0;
    var show = d.show && (demo === "all" || CFG.locfoot || d.veh == null || +d.veh === 1);
    var zone = String(d.zone || ""), street = d.z || zone.split(",")[0], area = d.c || (zone.indexOf(",") >= 0 ? zone.slice(zone.indexOf(",") + 1).trim() : "");
    var time = CFG.clock && d.time ? d.time : "";
    var dir = esc(d.dir || "");
    if (CFG.lo === "compass") {
      if (!locEl.querySelector(".eh-cmp")) {
        locEl.innerHTML = "";
        var box = h("div", { class: "eh-cmp" });
        cmp.tape = buildTape(); cmp.cur = null;
        box.appendChild(cmp.tape); box.appendChild(h("i", { class: "eh-mark" }));
        locEl.appendChild(box); locEl.appendChild(h("div", { class: "eh-cst" }));
      }
      locEl.querySelector(".eh-cst").innerHTML = esc(street) + (area ? " <span>| " + esc(area) + "</span>" : "") + (time ? " <span>· " + esc(time) + "</span>" : "");
      var deg = d.hd != null && d.hd !== "" ? +d.hd : (DIRDEG[String(d.dir || "").toUpperCase()] || 0);
      tapeTo(deg);
    } else {
      cmp.tape = null; cmp.cur = null;
      if (CFG.lo === "mini") locEl.innerHTML = '<div class="eh-dir">' + dir + '</div><i class="eh-sep2"></i><div>' + esc(street) + (area ? "<span>, " + esc(area) + "</span>" : "") + "</div>" + (time ? '<i class="eh-sep2"></i><span>' + esc(time) + "</span>" : "");
      else locEl.innerHTML = '<div class="eh-dir">' + dir + '</div><i class="eh-lsep"></i><div class="eh-lt"><b>' + esc(street) + "</b><span>" + esc(area) + (area && time ? " · " : "") + esc(time) + "</span></div>";
    }
    setCls(locEl, "eh-loc l-" + CFG.lo + (show ? " on" : ""));
  }

  /* ------------------------------------------------------------------ */
  /* SPEEDOMETER                                                         */
  /* ------------------------------------------------------------------ */
  var SARC = 2 * Math.PI * 42 * 0.75, GARC = 2 * Math.PI * 50 * 0.75, GMAX = 240;
  function flags(d) {
    return '<div class="eh-flags">' + si("eng", d.eng ? "on" : "") + si("light", d.lig ? "on" : "") + si(d.lock ? "lock" : "unlock", d.lock ? "on red" : "") + "</div>";
  }
  var gaugeBase = null;
  function gaugeSvg() {
    if (gaugeBase) return gaugeBase;
    var s = '<circle class="bg" cx="60" cy="60" r="57"/><circle class="arc" cx="60" cy="60" r="50" stroke-dasharray="' + GARC.toFixed(2) + ' 999" transform="rotate(135 60 60)"/>';
    for (var v = 0; v <= GMAX; v += 10) {
      var a = (135 + 270 * v / GMAX) * Math.PI / 180, mj = v % 20 === 0, r1 = 50, r2 = mj ? 43.5 : 46.5;
      s += '<line class="tk' + (mj ? " mj" : "") + '" x1="' + (60 + r1 * Math.cos(a)).toFixed(2) + '" y1="' + (60 + r1 * Math.sin(a)).toFixed(2) + '" x2="' + (60 + r2 * Math.cos(a)).toFixed(2) + '" y2="' + (60 + r2 * Math.sin(a)).toFixed(2) + '"/>';
      if (v % 40 === 0) s += '<text class="tl" x="' + (60 + 36 * Math.cos(a)).toFixed(2) + '" y="' + (62.5 + 36 * Math.sin(a)).toFixed(2) + '">' + v + "</text>";
    }
    gaugeBase = s;
    return s;
  }
  function renderSpeedo() {
    var d = pick(sp, DEMO.sp);
    if (demo === "foot") d.show = 0;
    var kmh = Math.max(0, Math.round(+d.kmh || 0)), fuel = clamp(d.fuel), vh = clamp(d.hp != null ? d.hp : 100), gear = esc(d.gear || "N");
    var lowF = fuel <= 15, html;
    if (CFG.sp === "gauge") {
      var pct = Math.min(1, kmh / GMAX);
      html = '<div class="eh-gauge"><svg viewBox="0 0 120 120">' + gaugeSvg() +
        '<circle class="val" cx="60" cy="60" r="50" stroke-dasharray="' + GARC.toFixed(2) + ' 999" stroke-dashoffset="' + (GARC * (1 - pct)).toFixed(2) + '" transform="rotate(135 60 60)"/>' +
        '<line class="ndl" x1="60" y1="60" x2="31.7" y2="88.3" style="transform:rotate(' + (270 * pct).toFixed(1) + 'deg)"/><circle class="hub" cx="60" cy="60" r="3.2"/></svg>' +
        '<div class="eh-sv"><b>' + kmh + "</b><span>km/h · " + gear + "</span></div></div>" +
        '<div class="eh-under"><span class="eh-fuel' + (lowF ? " lo" : "") + '">' + si("fuel") + fuel + "%</span>" + flags(d) + "</div>";
    } else if (CFG.sp === "digital") {
      html = '<div class="eh-dg-top"><b>' + kmh + "</b><span>KM/H</span><em>" + gear + "</em></div>" +
        '<div class="eh-dg-row f' + (lowF ? " lo" : "") + '">' + si("fuel") + '<div class="eh-bar"><i style="width:' + fuel + '%"></i></div><small>' + fuel + "%</small></div>" +
        '<div class="eh-dg-row e' + (vh <= 25 ? " lo" : "") + '">' + si("wrench") + '<div class="eh-bar"><i style="width:' + vh + '%"></i></div><small>' + vh + "%</small></div>" + flags(d);
    } else if (CFG.sp === "mini") {
      html = "<b>" + kmh + "</b><span>km/h</span>" + '<span class="eh-fuel' + (lowF ? " lo" : "") + '">' + si("fuel") + fuel + "%</span>";
    } else {
      var p2 = Math.min(1, kmh / 260);
      html = '<div class="eh-sring"><svg viewBox="0 0 100 100"><circle class="t" cx="50" cy="50" r="42" stroke-dasharray="' + SARC.toFixed(1) + ' 999"/>' +
        '<circle class="f" cx="50" cy="50" r="42" stroke-dasharray="' + SARC.toFixed(1) + ' 999" stroke-dashoffset="' + (SARC * (1 - p2)).toFixed(1) + '"/></svg>' +
        '<div class="eh-sv"><b>' + kmh + '</b><span>KM/H</span></div><div class="eh-gear">' + gear + "</div></div>" +
        '<div class="eh-side"><div class="eh-fring' + (lowF ? " lo" : "") + '">' + ring(fuel).replace('class="eh-ring"', "") + si("fuel") + "</div>" + flags(d) + "</div>";
    }
    setCls(spEl, "eh-spd v-" + CFG.sp + (d.show ? " on" : ""));
    spEl.innerHTML = html;
    if (window.EAGLEQuickbar && window.EAGLEQuickbar.setDriving) window.EAGLEQuickbar.setDriving(!!sp.show);
  }

  /* ------------------------------------------------------------------ */
  /* FPS                                                                 */
  /* ------------------------------------------------------------------ */
  function renderFps() {
    var d = pick(fps, DEMO.fps);
    setCls(fpsEl, "eh-fps" + (d.show ? " on" : ""));
    fpsEl.innerHTML = si("sig") + "<b>" + (+d.fps || 0) + "</b> FPS · <b>" + (+d.ping || 0) + "</b> ms" + (d.pl != null ? " · PL " + esc(d.pl) : "");
  }

  function renderAll() { renderStatus(); renderMoney(); renderLogo(); renderLoc(); renderSpeedo(); renderFps(); }

  /* ------------------------------------------------------------------ */
  /* Event server                                                        */
  /* ------------------------------------------------------------------ */
  E.on("hud", function (d) {
    for (var k in d) hud[k] = d[k];
    if (d.info != null) {
      if (+d.info === 1) footInfo = 1;
      else if (+loc.veh === 0 && !sp.show) footInfo = 0;
    }
    if (d.cash != null) { var c = +d.cash; if (lastCash != null && c !== lastCash) moneyDelta(lastCash, c); lastCash = c; }
    renderStatus(); renderMoney(); renderLogo();
  });
  E.on("speedo", function (d) { for (var k in d) sp[k] = d[k]; renderSpeedo(); if (!d.show) renderMoney(); });
  E.on("location", function (d) {
    if (!d.show) loc.show = 0;
    else { loc = {}; for (var k in d) loc[k] = d[k]; }
    renderLoc();
  });
  E.on("fps", function (d) { for (var k in d) fps[k] = d[k]; renderFps(); });
  E.on("watermark", function (d) { for (var k in d) wm[k] = d[k]; renderLogo(); });

  /* ============================ NOTIFIKASI ============================ */
  var NT = {
    0: { c: "err", t: "Gagal", i: "err" }, 1: { c: "ok", t: "Berhasil", i: "ok" },
    2: { c: "warn", t: "Peringatan", i: "warn" }, 3: { c: "info", t: "Info", i: "info" },
    4: { c: "syn", t: "Perintah", i: "cmd" }
  };
  var notifBox = h("div", { id: "notify", class: "notify-stack" });
  U.layer("toastlayer").appendChild(notifBox);
  function pushToast(box, el, ms, max) {
    el.style.setProperty("--dur", ms + "ms");
    box.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("on"); });
    while (box.children.length > max) box.removeChild(box.firstChild);
    setTimeout(function () {
      el.classList.remove("on");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, ms);
  }
  function notify(d) {
    var m = NT[+d.t] || NT[3];
    var el = h("div", { class: "toast t-" + m.c }, [
      h("span", { class: "t-ic", html: si(m.i) }),
      h("div", { class: "t-body" }, [h("b", { html: U.fmt(d.title || m.t) }), h("div", { html: U.fmt(d.m) })])
    ]);
    pushToast(notifBox, el, +d.d || 4500, 4);
    // tumpukan tidak boleh lebih tinggi dari 45% layar
    var lim = window.innerHeight * 0.45;
    while (notifBox.children.length > 1 && notifBox.getBoundingClientRect().height > lim) notifBox.removeChild(notifBox.firstChild);
  }
  E.on("notify", notify);

  /* ============================ ITEM BOX ============================ */
  var itemBox = h("div", { id: "itembox", class: "item-stack" });
  U.layer("toastlayer").appendChild(itemBox);
  E.on("itembox", function (d) {
    var el = h("div", { class: "ibox" + (d.neg ? " neg" : "") }, [
      h("div", { class: "ib-ic" }, h("span", { class: "emo", text: d.ic || U.itemIcon(d.n, d.m) })),
      h("div", { class: "ib-body" }, [h("b", { html: U.fmt(d.a || "") }), h("span", { html: U.fmt(d.n || "") })])
    ]);
    pushToast(itemBox, el, +d.d || 3500, 5);
  });

  /* ============================ PROGRESS ============================ */
  var prog = h("div", { id: "progress", class: "progress" }, [
    h("div", { class: "pr-top" }, [h("span", { class: "pr-label" }), h("b", { class: "pr-pct" })]),
    h("div", { class: "bar" }, h("i"))
  ]);
  U.layer("toastlayer").appendChild(prog);
  E.on("progress", function (d) {
    if (!d.show) { prog.classList.remove("on"); return; }
    if (typeof d.label === "string") prog.querySelector(".pr-label").innerHTML = U.fmt(d.label);
    if (d.pct != null) {
      var p = Math.max(0, Math.min(100, +d.pct));
      prog.querySelector(".bar i").style.width = p + "%";
      prog.querySelector(".pr-pct").textContent = Math.round(p) + "%";
    }
    prog.classList.add("on");
  });

  /* ============================ BANNER ============================ */
  // id: warning | global | storm | insurance | footer | segel | gym | robbery | ...
  var banners = {};
  var BNI = { warn: "warn", err: "err", ok: "ok", info: "info" };
  E.on("banner", function (d) {
    var id = d.id || "b";
    var el = banners[id];
    if (!d.show) {
      if (el) { el.classList.remove("on"); clearTimeout(el._t); }
      return;
    }
    if (!el) {
      el = banners[id] = h("div", { class: "banner" });
      U.layer("bannerlayer").appendChild(el);
    }
    el.className = "banner b-" + (d.c || "info") + " pos-" + (d.pos || "top") + (d.sm ? " sm" : "");
    el.innerHTML = (d.icon ? '<span class="bn-ic">' + (BNI[d.icon] ? si(BNI[d.icon]) : U.icon(d.icon)) + "</span>" : "") +
      '<div class="bn-body">' + (d.t ? '<div class="bn-t">' + U.fmt(d.t) + "</div>" : "") +
      (d.m ? '<div class="bn-m">' + U.fmt(d.m) + "</div>" : "") + (d.f ? '<div class="bn-f">' + U.fmt(d.f) + "</div>" : "") + "</div>";
    requestAnimationFrame(function () { el.classList.add("on"); });
    clearTimeout(el._t);
    if (+d.d > 0) el._t = setTimeout(function () { el.classList.remove("on"); }, +d.d);
  });

  /* ============================ OVERLAY LAYAR ============================ */
  // {id, show, c: warna css} mis. stres ungu, thermal drone, efek tembakan
  var overlays = {};
  E.on("overlay", function (d) {
    var id = d.id || "o";
    var el = overlays[id];
    if (!el) { el = overlays[id] = h("div", { class: "overlay ov-" + id }); U.layer("overlaylayer").appendChild(el); }
    if (d.c) el.style.background = d.c;
    el.classList.toggle("on", !!d.show);
    if (d.show && +d.d > 0) { clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove("on"); }, +d.d); }
  });

  /* ============================ TOMBOL INTERAKSI ============================ */
  var act = h("div", { id: "interact", class: "interact", "data-touch": "" }, [
    h("button", { class: "ia-btn", type: "button" }, [h("span", { class: "ia-key", text: "F" }), h("span", { class: "ia-label" })])
  ]);
  U.layer("toastlayer").appendChild(act);
  act.querySelector("button").addEventListener("click", function () { E.send("interact", "press", -1); });
  E.on("interact", function (d) {
    if (!d.show) { act.classList.remove("on"); E.touch(); return; }
    act.querySelector(".ia-label").textContent = d.label || "Interaksi";
    act.querySelector(".ia-key").textContent = d.key || "F";
    act.classList.add("on");
    E.touch();
  });

  /* ============================ SPECTATE ============================ */
  var specEl = h("div", { id: "spectate", class: "spectate glass" });
  U.layer("hudlayer").appendChild(specEl);
  E.on("spectate", function (d) {
    specEl.classList.toggle("on", !!d.show);
    if (!d.show) return;
    specEl.innerHTML = '<div class="sp-name">' + U.icon("cam") + U.esc(d.name || "") + " <small>(" + (+d.id || 0) + ")</small></div>" +
      '<div class="b-kv">' + [["Cash", U.money(d.cash)], ["HP / Armor", (+d.hp || 0) + " / " + (+d.ar || 0)],
        ["Int / VW", (+d.int || 0) + " / " + (+d.vw || 0)], ["Lapar / Haus", (+d.hg || 0) + "% / " + (+d.th || 0) + "%"],
        ["FPS / Ping", (+d.fps || 0) + " / " + (+d.ping || 0) + "ms"]].map(function (r) {
          return '<div class="kv-row"><span class="kv-k">' + r[0] + '</span><span class="kv-v">' + r[1] + "</span></div>";
        }).join("") + "</div>";
  });

  /* ------------------------------------------------------------------ */
  /* API untuk editor HUD                                                */
  /* ------------------------------------------------------------------ */
  window.EHUD = {
    cfg: CFG, def: DEF, enums: ENUM, accents: ACC, icon: si,
    apply: applyCfg,
    render: renderAll,
    // on: false | true ("all") | "foot" | "veh"
    demo: function (on) {
      demo = on === true ? "all" : (on === "foot" || on === "veh" || on === "all") ? on : false;
      notifBox.classList.toggle("eh-demo-on", !!demo);
      document.documentElement.classList.toggle("eh-pv-veh", demo === "veh");
      renderAll();
    },
    isDemo: function () { return demo; },
    testNotify: function () { notify({ t: 1, title: "Contoh notifikasi", m: "Posisi notifikasi seperti ini.", d: 3500 }); },
    state: function () { return { hud: hud, sp: sp, loc: loc }; }
  };
  applyCfg();
})();
