/* =====================================================================
   EAGLE PHONE v24 — phone_core.js
   ---------------------------------------------------------------------
   HP gaya iOS / sd-phone untuk EAGLE ROLEPLAY (SA-MP Android + CEF).
   File ini berisi "sistem operasi" HP: bingkai, lock screen, home,
   dock, Dynamic Island, notifikasi, control center, panggilan, dan
   kerangka aplikasi. Isi tiap aplikasi ada di phone_apps_*.js.

   PROTOKOL (lihat juga SERVER/player/phone/phone_core.inc)
     JS  -> Pawn : EAGLE.send("phone", aksi, index, payload)
                   -> CEFUI_Route -> Phone_OnUI(playerid, a[], i, s[])
     Pawn -> JS  : event "phone" {t:"show"|"hide"|"data"|"notif"|"badge"|
                                   "call"|"toast"|"sync"|"cam"|"unlocked"}
     Balasan buka HP (v28): "got" (perintah diterima modul, i=1 siap / i=0 gagal)
                            lalu "shown" (layar HP benar-benar terlihat).
   Teks buatan pemain dikirim dengan enc() (kutip, %, backslash, emoji
   di-%XX) sehingga aman melewati JSON Pawn & MySQL, lalu dec() saat
   ditampilkan. Tidak ada karakter yang hilang/berubah lagi.
   Hanya ES5 (kompatibel WebView Android lama).
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE;
  if (!E) return;

  /* Penerima event "phone" dipasang PALING AWAL (v28).
     - Event yang datang sebelum modul selesai dimuat disimpan lalu diproses di akhir file.
     - Setiap perintah buka HP dibalas "got" ke server: i=1 modul siap, i=0 modul gagal
       (s = alasannya). Server menulis hasilnya di baris [PHONE] server_log.txt. */
  var PH = { ready: false, failed: false, why: "", q: [] };
  function phoneGot(d, ok, why) { if (d && d.t === "show") send("got", ok ? 1 : 0, ok ? "" : String(why || "").slice(0, 160)); }
  E.on("phone", function (d) {
    if (!d || !d.t) return;
    if (PH.ready) { phoneGot(d, 1); onPhoneEvent(d); return; }
    if (PH.failed) { phoneGot(d, 0, PH.why); return; }
    PH.q.push(d);
    if (PH.q.length > 20) PH.q.shift();
  });
  // berjalan setelah file ini selesai dieksekusi (berhasil atau berhenti karena error)
  setTimeout(function () {
    if (PH.ready) return;
    PH.failed = true;
    PH.why = "modul HP gagal dimuat" + (E.lastError && E.lastError() ? ": " + E.lastError() : "");
    if (E.report) E.report("phone", PH.why);
    var pend = PH.q.splice(0, PH.q.length);
    for (var pi = 0; pi < pend.length; pi++) phoneGot(pend[pi], 0, PH.why);
  }, 0);

  /* ------------------------------------------------------------------ */
  /* Util dasar                                                          */
  /* ------------------------------------------------------------------ */
  var SVGNS = "http://www.w3.org/2000/svg";
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (!attrs.hasOwnProperty(k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "style") el.setAttribute("style", v);
      else if (k === "value") el.value = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    add(el, kids);
    return el;
  }
  function add(el, kids) {
    if (kids == null) return el;
    if (!Array.isArray(kids)) kids = [kids];
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c == null || c === false) continue;
      if (Array.isArray(c)) add(el, c);
      else el.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  function svg(inner, cls, vb) {
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", vb || "0 0 24 24");
    if (cls) s.setAttribute("class", cls);
    s.innerHTML = inner;
    return s;
  }
  function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); return el; }
  function cls(el, c, on) { if (!el) return; if (on) el.classList.add(c); else el.classList.remove(c); }
  function pad2(n) { n = Math.floor(Math.abs(n)); return (n < 10 ? "0" : "") + n; }
  function num(v, d) { v = +v; return isFinite(v) ? v : (d || 0); }
  function money(n) {
    n = Math.round(num(n));
    var neg = n < 0; n = Math.abs(n);
    return (neg ? "-$" : "$") + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  // teks pemain -> aman untuk JSON/Pawn/MySQL
  function enc(s) {
    s = String(s == null ? "" : s);
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i), ch = s.charAt(i);
      if (c >= 32 && c < 127 && ch !== "%" && ch !== "\"" && ch !== "\\") { out += ch; continue; }
      if (c === 10) { out += "%0A"; continue; }
      if (c < 32) continue;
      try {
        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) { out += encodeURIComponent(s.substr(i, 2)); i++; }
        else out += encodeURIComponent(ch);
      } catch (e) { /* surrogate rusak -> buang */ }
    }
    return out;
  }
  function dec(s) {
    s = String(s == null ? "" : s);
    if (s.indexOf("%") < 0) return s.replace(/~n~/g, "\n");
    try { return decodeURIComponent(s).replace(/~n~/g, "\n"); } catch (e) { return s; }
  }
  function initials(name) {
    name = dec(name).replace(/_/g, " ").trim();
    if (!name) return "?";
    if (/^[0-9+ ]+$/.test(name)) return "#";
    var p = name.split(/\s+/);
    return (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : "")).toUpperCase();
  }
  var AVC = ["#ff6b6b,#e03e52", "#f7b733,#fc4a1a", "#4facfe,#2f6fe0", "#43e97b,#1aa36a", "#a18cd1,#7b53c9", "#ff9a9e,#f35f86", "#30cfd0,#2a7fba", "#f6d365,#e89b3a", "#89a1b8,#5f7488"];
  function avColor(name) {
    name = String(name || "");
    var hsh = 0; for (var i = 0; i < name.length; i++) hsh = (hsh * 31 + name.charCodeAt(i)) & 0xffff;
    var c = AVC[hsh % AVC.length].split(",");
    return "linear-gradient(180deg," + c[0] + "," + c[1] + ")";
  }
  function imgUrl(src) {
    if (!src) return "";
    src = dec(src);
    var m;
    if ((m = /^skin:(\d+)$/.exec(src))) return "https://assets.open.mp/assets/images/skins/" + m[1] + ".png";
    if ((m = /^veh:(\d+)$/.exec(src))) return "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_" + m[1] + ".jpg";
    if (/^https?:\/\//i.test(src)) return src;
    return "";
  }
  function img(src, c) {
    var u = imgUrl(src);
    if (!u) return null;
    var el = h("img", { src: u, alt: "", draggable: "false", class: c || "", loading: "lazy" });
    el.onerror = function () { el.style.visibility = "hidden"; };
    return el;
  }
  function avatar(name, pic, c) {
    var el = h("div", { class: "ep-av " + (c || "") });
    var u = imgUrl(pic);
    if (u) {
      if (/^skin:/.test(dec(pic))) el.classList.add("skin");
      el.style.background = "linear-gradient(180deg,#d6dae1,#aab1bd)";
      var im = h("img", { src: u, alt: "", draggable: "false" });
      im.onerror = function () { im.remove(); el.textContent = initials(name); el.style.background = avColor(name); };
      el.appendChild(im);
    } else {
      el.textContent = initials(name);
      el.style.background = /^[0-9+ #]+$/.test(dec(name)) ? "linear-gradient(180deg,#a5abb6,#858a94)" : avColor(name);
    }
    return el;
  }
  function nameOf(s) { return dec(s).replace(/_/g, " "); }
  function tap(el, fn) { if (el && fn) el.addEventListener("click", function (e) { e.stopPropagation(); fn(e); }); return el; }

  /* ------------------------------------------------------------------ */
  /* Ikon (SVG 24x24)                                                   */
  /* ------------------------------------------------------------------ */
  var I = {
    back: '<path d="M15 4.5 7.5 12l7.5 7.5"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
    compose: '<path d="M11 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6"/><path d="M18.5 3.5a2.1 2.1 0 0 1 3 3L12 16l-4 1 1-4z"/>',
    share: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
    heart: '<path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.3a4.5 4.5 0 0 1 8 3.2c0 6.1-8 11-8 11z"/>',
    comment: '<path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.4-3.8A8 8 0 1 1 20 11.5z"/>',
    repost: '<path d="M4 9V7a2 2 0 0 1 2-2h12l-3-3M20 15v2a2 2 0 0 1-2 2H6l3 3"/>',
    send: '<path d="M21 3 10 14M21 3l-6.5 18-4-8.5L2 8.5z"/>',
    up: '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    phoneF: '<path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>',
    msg: '<path d="M12 3.5c-5 0-9 3.4-9 7.6 0 2.3 1.2 4.3 3 5.7L5.3 20l3.8-1.8c.9.2 1.9.3 2.9.3 5 0 9-3.4 9-7.6s-4-7.4-9-7.4z"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.7"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',
    bellOff: '<path d="M6 16.5V11a6 6 0 0 1 1-3.3M18 14V11a6 6 0 0 0-8.7-5.3M4.5 18.5h11M10 20.5a2 2 0 0 0 4 0M3 3l18 18"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    plane: '<path d="M21 15.5v-2l-8-4.5V4a1.5 1.5 0 0 0-3 0v5L2 13.5v2l8-2.5V18l-2.5 2v1.5L11.5 20l4 1.5V20L13 18v-5z"/>',
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>',
    torch: '<path d="M8 3h8v4l-2 3v11h-4V10L8 7zM8 7h8M12 13v2"/>',
    cam: '<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.6"/><path d="M8.5 7l1.4-2.4h4.2L15.5 7"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7.5h8M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18.2h.01M12 18.2h.01M15.5 18.2h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
    cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 10.5a4 4 0 0 1-.5 8z"/>',
    rain: '<path d="M7 15.5a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 7.5a4 4 0 0 1-.5 8zM8 18.5l-1 2.5M12 18.5l-1 2.5M16 18.5l-1 2.5"/>',
    bolt: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
    fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
    loc: '<path d="M12 21s-6.5-5.8-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 15.2 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/>',
    nav: '<path d="M21 3 3 10.5l7.5 3 3 7.5z"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7.5"/>',
    car: '<path d="M5 16.5l1.5-5.5A2 2 0 0 1 8.4 9.5h7.2a2 2 0 0 1 1.9 1.5L19 16.5M4 16.5h16v3H4zM7 19.5v1.5M17 19.5v1.5"/><circle cx="7.5" cy="14" r=".6"/><circle cx="16.5" cy="14" r=".6"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    receipt: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21zM9 8h6M9 12h6M9 16h3"/>',
    arrowUR: '<path d="M7 17 17 7M9 7h8v8"/>',
    arrowDL: '<path d="M17 7 7 17M15 17H7V9"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16 15 10.5 5 19.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.3-3.8 4.3-5.7 7.5-5.7s6.2 1.9 7.5 5.7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.2 14.6c1.8.8 2.9 2.6 3.3 5.4"/>',
    userAdd: '<circle cx="9.5" cy="8" r="4"/><path d="M2.5 20.5c1.2-3.8 4-5.7 7-5.7 1.7 0 3.4.6 4.7 1.9M18.5 13v6M15.5 16h6"/>',
    block: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.6 7.6 0 0 0 7 6.5l-2.4-1-2 3.5 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.5 2.4-1A7.6 7.6 0 0 0 9.6 19l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.5z"/>',
    home: '<path d="M4 11 12 4l8 7M6 9.5V20h4.5v-5.5h3V20H18V9.5"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    list: '<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5z"/>',
    refresh: '<path d="M20 11.5a8 8 0 1 0-2.3 5.7M20 4.5v7h-7"/>',
    logout: '<path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2.5 2.5M14.5 8.5l2 2"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z"/>',
    flip: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5"/>',
    zap: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
    grid3: '<path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    note: '<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    micOff: '<path d="M9 9V6a3 3 0 0 1 5.8-1M15 11.5V11M5.5 11a6.5 6.5 0 0 0 10.6 5M18.5 11a6.5 6.5 0 0 1-.5 2.5M12 17.5V21M3 3l18 18"/>',
    speaker: '<path d="M4 9.5h4L13 5v14l-5-4.5H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    keypad: '<circle cx="6" cy="5" r="1.2"/><circle cx="12" cy="5" r="1.2"/><circle cx="18" cy="5" r="1.2"/><circle cx="6" cy="10.5" r="1.2"/><circle cx="12" cy="10.5" r="1.2"/><circle cx="18" cy="10.5" r="1.2"/><circle cx="6" cy="16" r="1.2"/><circle cx="12" cy="16" r="1.2"/><circle cx="18" cy="16" r="1.2"/><circle cx="12" cy="21" r="1.2"/>',
    bookmark: '<path d="M6.5 3.5h11v17L12 16l-5.5 4.5z"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM7.5 7.5h.01"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.4 8.3-7 10-3.6-1.7-7-5-7-10V6z"/>',
    cross: '<path d="M9 3.5h6v5.5h5.5v6H15v5.5H9V15H3.5V9H9z"/>',
    wrench: '<path d="M14.5 5.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z"/>',
    fuel: '<path d="M5 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14M4 20h12M7.5 8h5M15 9.5l2.5 2V17a1.5 1.5 0 0 0 3 0v-6.5L18 8"/>',
    taxi: '<path d="M5 15.5l1.5-5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5l1.5 5M4 15.5h16v3.5H4zM9.5 9 10.5 6h3l1 3"/><circle cx="7.5" cy="17.2" r=".6"/><circle cx="16.5" cy="17.2" r=".6"/>',
    bank: '<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12v8h13v-8M10 20v-4.5h4V20"/>',
    brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18"/>',
    news: '<path d="M4 5h12.5v14H6a2 2 0 0 1-2-2zM16.5 9H20v8a2 2 0 0 1-2 2M7 8.5h6.5M7 12h6.5M7 15.5h4"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    mask: '<path d="M3 10.5c0-2 1.6-3 4-3 2 0 3.3.8 5 .8s3-.8 5-.8c2.4 0 4 1 4 3 0 3.3-2.2 5.5-5 5.5-1.8 0-2.8-1-4-1s-2.2 1-4 1c-2.8 0-5-2.2-5-5.5z"/><path d="M7 11.5h2.5M14.5 11.5H17"/>',
    game: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7 10.5v3M5.5 12h3M15.5 11h.01M18 13h.01"/>',
    health: '<path d="M3 12h4l2-4 3 8 2-4h7"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.6-1.5 1.7-2.3 3-2.3s2.4.8 3 2.3M14 10h4M14 13.5h4"/>',
    stopwatch: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M10 3h4M12 3v3"/>',
    alarm: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 1.5M4 5.5 7 3M20 5.5 17 3"/>',
    globe2: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/>',
    power: '<path d="M12 3v8M6.4 6.4a8 8 0 1 0 11.2 0"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
    siren: '<path d="M7 17.5v-5a5 5 0 0 1 10 0v5M5 17.5h14v3H5zM12 3.5v2M4.6 6.6l1.4 1.4M19.4 6.6 18 8M12 10.5a2 2 0 0 0-2 2"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5M12 8v4.5l3 2"/>',
    at: '<circle cx="12" cy="12" r="3.8"/><path d="M15.8 12v1.4a2.6 2.6 0 0 0 5.2 0V12a9 9 0 1 0-3.5 7.1"/>',
    inbox: '<path d="M3 13.5 5.5 5h13l2.5 8.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 13.5h5l1.5 2.5h5l1.5-2.5h5"/>',
    sent: '<path d="M21 3 10 14M21 3l-6.5 18-4-8.5L2 8.5z"/>'
  };
  function ic(name, c) { return svg(I[name] || I.info, c); }

  /* ------------------------------------------------------------------ */
  /* Katalog aplikasi                                                    */
  /* ------------------------------------------------------------------ */
  var G = { // glyph ikon aplikasi (kelas ig-s = garis, ig-f = isi)
    phone: '<path class="ig-f" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>',
    messages: '<path class="ig-f" d="M12 3.5c-5 0-9 3.4-9 7.6 0 2.3 1.2 4.3 3 5.7L5.3 20l3.8-1.8c.9.2 1.9.3 2.9.3 5 0 9-3.4 9-7.6s-4-7.4-9-7.4z"/>',
    contacts: '<circle class="ig-f" cx="12" cy="9" r="3.8"/><path class="ig-f" d="M4.5 20c1.2-3.8 4.3-5.6 7.5-5.6s6.3 1.8 7.5 5.6z"/>',
    mail: '<rect class="ig-s" x="3" y="5.5" width="18" height="13" rx="2.2"/><path class="ig-s" d="M3.7 7.2 12 13l8.3-5.8"/>',
    darkchat: '<path class="ig-f" d="M3 10.5c0-2 1.6-3 4-3 2 0 3.3.8 5 .8s3-.8 5-.8c2.4 0 4 1 4 3 0 3.3-2.2 5.5-5 5.5-1.8 0-2.8-1-4-1s-2.2 1-4 1c-2.8 0-5-2.2-5-5.5z"/><path d="M6.8 11.4h2.8M14.4 11.4h2.8" stroke="#1a1a1e" stroke-width="1.8" stroke-linecap="round"/>',
    birdy: '<path class="ig-f" d="M4.5 14.2c0-4.3 3.4-7.7 7.8-7.7 2.9 0 5 1.4 6 3.5l2.7.6-2.3 1.4c.1.4.1.7.1 1.1 0 4.3-3.7 7.4-8.1 7.4-3.6 0-6.2-2.4-6.2-6.3z"/><circle cx="15" cy="10.3" r="1" fill="#1d9bf0"/><path d="M8.3 13.8c1.6 1.7 4.3 2.1 6.3 1" stroke="#1d9bf0" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    photogram: '<rect class="ig-s" x="3.8" y="5.2" width="16.4" height="14" rx="4"/><circle class="ig-s" cx="12" cy="12.4" r="3.6"/><path class="ig-s" d="M8.6 5.2l1.2-2h4.4l1.2 2"/><circle class="ig-f" cx="17" cy="8.4" r=".9"/>',
    pages: '<path class="ig-s" d="M4 10v4h3l6.5 4.5v-13L7 10H4zM16.5 9.3a3.8 3.8 0 0 1 0 5.4M19 7a7 7 0 0 1 0 10"/>',
    market: '<path class="ig-s" d="M5 8h14l-1.1 12H6.1z"/><path class="ig-s" d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    news: '<path class="ig-s" d="M4 5h12.5v14H6a2 2 0 0 1-2-2zM16.5 9H20v8a2 2 0 0 1-2 2"/><path class="ig-s" d="M7 8.5h6.5M7 12h6.5M7 15.5h4"/>',
    camera: '<rect class="ig-s" x="3" y="7" width="18" height="13" rx="3"/><circle class="ig-s" cx="12" cy="13.5" r="3.6"/><path class="ig-s" d="M8.5 7l1.4-2.4h4.2L15.5 7"/>',
    music: '<path class="ig-s" d="M9 18V5.5l11-2V16"/><circle class="ig-f" cx="6.5" cy="18" r="2.6"/><circle class="ig-f" cx="17.5" cy="16" r="2.6"/>',
    maps: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" fill="none" stroke="#3a8f55" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 4v13.5M15 6.5V20" stroke="#3a8f55" stroke-width="1.4"/><path d="M12 15.2s-3.2-2.8-3.2-5.6a3.2 3.2 0 0 1 6.4 0c0 2.8-3.2 5.6-3.2 5.6z" fill="#ff3b30"/><circle cx="12" cy="9.5" r="1.1" fill="#fff"/>',
    bank: '<path class="ig-s" d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    garage: '<path class="ig-s" d="M5 16.5l1.5-5.5A2 2 0 0 1 8.4 9.5h7.2a2 2 0 0 1 1.9 1.5L19 16.5M4 16.5h16v3H4zM7 19.5v1.5M17 19.5v1.5"/>',
    services: '<path class="ig-s" d="M7 17.5v-5a5 5 0 0 1 10 0v5M5 17.5h14v3H5zM12 3.5v2M4.6 6.6l1.4 1.4M19.4 6.6 18 8"/>',
    weather: '<circle cx="9" cy="9" r="3.8" fill="#ffd60a"/><path d="M8 19a4 4 0 0 1-.4-8 5.3 5.3 0 0 1 10.1 1.3A3.4 3.4 0 0 1 17.5 19z" fill="#fff"/>',
    health: '<path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.3a4.5 4.5 0 0 1 8 3.2c0 6.1-8 11-8 11z" fill="#ff2d55"/>',
    id: '<rect class="ig-s" x="3" y="5" width="18" height="14" rx="2.2"/><circle class="ig-s" cx="8.5" cy="11" r="2"/><path class="ig-s" d="M5.5 16c.6-1.5 1.7-2.3 3-2.3s2.4.8 3 2.3M14 10h4M14 13.5h4"/>',
    calculator: '<rect class="ig-s" x="5" y="3" width="14" height="18" rx="2.5"/><path class="ig-s" d="M8 7.5h8M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18.2h.01M12 18.2h.01M15.5 18.2h.01"/>',
    settings: '<circle class="ig-s" cx="12" cy="12" r="3.2"/><path class="ig-s" d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.6 7.6 0 0 0 7 6.5l-2.4-1-2 3.5 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.5 2.4-1A7.6 7.6 0 0 0 9.6 19l.4 2.5h4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.4 1 2-3.5z"/>',
    appstore: '<rect class="ig-s" x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect class="ig-s" x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect class="ig-s" x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><path class="ig-s" d="M16.75 13.5v6.5M13.5 16.75H20"/>',
    games: '<rect class="ig-s" x="2.5" y="7" width="19" height="10" rx="4"/><path class="ig-s" d="M7 10.5v3M5.5 12h3M15.5 11h.01M18 13h.01"/>',
    notes: '<path d="M5 8h14M7 12h10M7 15.5h10M7 19h6" stroke="#c7c7cc" stroke-width="1.4" stroke-linecap="round"/>',
    clock: '',
    photos: '',
    calendar: ''
  };
  var APPS = [
    { id: "phone", name: "Telepon", cat: "Komunikasi", bg: "linear-gradient(180deg,#5af777,#1cc23b)" },
    { id: "messages", name: "Pesan", cat: "Komunikasi", bg: "linear-gradient(180deg,#5cf777,#0cc241)" },
    { id: "contacts", name: "Kontak", cat: "Komunikasi", bg: "linear-gradient(180deg,#b9bec7,#8b919b)" },
    { id: "mail", name: "Mail", cat: "Komunikasi", bg: "linear-gradient(180deg,#1bc6fb,#1d6ff2)" },
    { id: "darkchat", name: "Dark Chat", cat: "Komunikasi", bg: "linear-gradient(180deg,#3a3a40,#0b0b0d)" },
    { id: "birdy", name: "Birdy", cat: "Sosial", bg: "linear-gradient(180deg,#48b5ff,#1d8ff0)" },
    { id: "photogram", name: "Photogram", cat: "Sosial", bg: "radial-gradient(circle at 30% 110%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285aeb 95%)" },
    { id: "pages", name: "Iklan", cat: "Sosial", bg: "linear-gradient(180deg,#ffe066,#ffb800)" },
    { id: "market", name: "Pasar", cat: "Sosial", bg: "linear-gradient(180deg,#ffb45c,#ff7a1a)" },
    { id: "news", name: "Berita", cat: "Sosial", bg: "linear-gradient(180deg,#ff5f57,#c9241d)" },
    { id: "camera", name: "Kamera", cat: "Media", bg: "linear-gradient(180deg,#8e939a,#4b4f55)" },
    { id: "photos", name: "Foto", cat: "Media", bg: "#ffffff", light: 1 },
    { id: "music", name: "Musik", cat: "Media", bg: "linear-gradient(180deg,#ff6482,#fa233b)" },
    { id: "maps", name: "Peta", cat: "Kota", bg: "linear-gradient(160deg,#e9f7de,#c7e6b6 55%,#b6d8f3)", light: 1 },
    { id: "bank", name: "Bank", cat: "Kota", bg: "linear-gradient(180deg,#2ec27e,#0b7a47)" },
    { id: "garage", name: "Garasi", cat: "Kota", bg: "linear-gradient(180deg,#5a8dee,#2b54c9)" },
    { id: "services", name: "Layanan", cat: "Kota", bg: "linear-gradient(180deg,#ff6b5b,#e0241a)" },
    { id: "weather", name: "Cuaca", cat: "Kota", bg: "linear-gradient(180deg,#4fb3ff,#1666d8)" },
    { id: "health", name: "Kesehatan", cat: "Utilitas", bg: "#ffffff", light: 1 },
    { id: "id", name: "KTP", cat: "Utilitas", bg: "linear-gradient(180deg,#6c7a89,#3d4852)" },
    { id: "clock", name: "Jam", cat: "Utilitas", bg: "#0b0b0d" },
    { id: "calculator", name: "Kalkulator", cat: "Utilitas", bg: "linear-gradient(180deg,#ff9f0a,#e0780c)" },
    { id: "notes", name: "Catatan", cat: "Utilitas", bg: "#ffffff", light: 1 },
    { id: "games", name: "Game", cat: "Utilitas", bg: "linear-gradient(180deg,#9b6bff,#5b2be0)" },
    { id: "settings", name: "Pengaturan", cat: "Utilitas", bg: "linear-gradient(180deg,#a7abb2,#6c7078)" },
    { id: "appstore", name: "App Store", cat: "Utilitas", bg: "linear-gradient(180deg,#27c4ff,#0a6cf0)" }
  ];
  var APP = {}; APPS.forEach(function (a) { APP[a.id] = a; });
  var CORE_APPS = ["phone", "messages", "contacts", "camera", "photos", "settings", "appstore", "maps", "bank"];
  var DOCK = ["phone", "messages", "camera", "photos"];
  var DEFAULT_HOME = [
    ["mail", "maps", "weather", "clock", "notes", "bank", "garage", "services", "birdy", "photogram", "pages", "market", "news", "music", "contacts", "health", "id", "calculator", "games", "settings"],
    ["darkchat", "appstore"]
  ];
  var PER_PAGE = 20;

  function appIcon(id, extraClass) {
    var a = APP[id] || { id: id, bg: "#8e8e93" };
    var box = h("div", { class: "ep-ico" + (a.light ? " light" : "") + (extraClass ? " " + extraClass : "") });
    box.style.background = a.bg;
    if (id === "photos") {
      var petals = "", cols = ["#ff9f0a", "#ffd60a", "#34c759", "#30b0c7", "#0a84ff", "#5e5ce6", "#bf5af2", "#ff375f"];
      for (var i = 0; i < 8; i++) petals += '<ellipse cx="12" cy="6.6" rx="2.6" ry="4.4" fill="' + cols[i] + '" opacity=".85" transform="rotate(' + (i * 45) + ' 12 12)"/>';
      box.appendChild(svg(petals));
    } else if (id === "clock") {
      var d = new Date(serverNow() * 1000 + tzo * 1000), hh = d.getUTCHours() % 12, mm = d.getUTCMinutes();
      var ticks = "";
      for (var t = 0; t < 12; t++) ticks += '<path d="M12 2.6v1.4" stroke="#1c1c1e" stroke-width="1" transform="rotate(' + (t * 30) + ' 12 12)"/>';
      box.appendChild(svg('<circle cx="12" cy="12" r="9.6" fill="#fff"/>' + ticks +
        '<path d="M12 12V7" stroke="#1c1c1e" stroke-width="1.6" stroke-linecap="round" transform="rotate(' + (hh * 30 + mm / 2) + ' 12 12)"/>' +
        '<path d="M12 12V4.6" stroke="#1c1c1e" stroke-width="1.1" stroke-linecap="round" transform="rotate(' + (mm * 6) + ' 12 12)"/>' +
        '<circle cx="12" cy="12" r="1" fill="#ff9500"/>'));
      box.querySelector("svg").style.width = "86%"; box.querySelector("svg").style.height = "86%";
    } else if (id === "notes") {
      box.style.background = "linear-gradient(180deg,#ffd60a 0,#ffd60a 26%,#fff 26%)";
      box.appendChild(svg(G.notes));
    } else if (id === "health") {
      box.appendChild(svg(G.health));
    } else {
      box.appendChild(svg(G[id] || G.appstore));
    }
    return box;
  }

  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  var S = {
    open: false, unlocked: false, dev: { num: "", name: "", cid: 0 }, notifs: [], badges: {},
    call: null, cur: null, lastApp: null, lastClose: 0, page: 0, edit: false, pick: null
  };
  var P = { wp: 1, wpurl: "", th: "light", sz: 1, air: 0, dnd: 0, sil: 0, faceid: 1, home: null, hidden: [], bright: 100, pc: 0 };
  var offset = 0, tzo = 0; // selisih jam server
  function serverNow() { return Date.now() / 1000 + offset; }
  function lsKey() { return "eaglephone24_" + (S.dev.cid || 0); }
  function loadLocal() {
    try { var o = JSON.parse(localStorage.getItem(lsKey()) || "{}"); for (var k in o) if (o.hasOwnProperty(k)) P[k] = o[k]; } catch (e) {}
  }
  function saveLocal() { try { localStorage.setItem(lsKey(), JSON.stringify(P)); } catch (e) {} }

  function send(a, i, s) { E.send("phone", a, i == null ? -1 : i, s == null ? "" : s); }
  function sendJ(a, i, obj) { send(a, i, JSON.stringify(obj || {})); }
  function setPref(k, v, noServer) {
    P[k] = v; saveLocal();
    if (noServer) return;
    var o = {};
    if (k === "home") o.home = v ? enc(JSON.stringify(v)) : "";      // disimpan di eph_settings
    else if (k === "hidden") o.hidden = (v || []).join(",");
    else o[k] = v;
    sendJ("set", -1, o);
  }

  /* ------------------------------------------------------------------ */
  /* Format waktu                                                        */
  /* ------------------------------------------------------------------ */
  var HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  function localDate(ts) { return new Date(((ts == null ? serverNow() : +ts) + tzo) * 1000); }
  function hhmm(ts) { var d = localDate(ts); return pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes()); }
  function longDate(ts) { var d = localDate(ts); return HARI[d.getUTCDay()] + ", " + d.getUTCDate() + " " + BULAN[d.getUTCMonth()]; }
  function dayKey(ts) { var d = localDate(ts); return d.getUTCFullYear() * 1000 + d.getUTCMonth() * 40 + d.getUTCDate(); }
  function ago(ts) {
    ts = +ts; if (!ts) return "";
    var s = serverNow() - ts;
    if (s < 45) return "baru";
    if (s < 3600) return Math.floor(s / 60) + "m";
    if (s < 86400) return Math.floor(s / 3600) + "j";
    if (s < 604800) return Math.floor(s / 86400) + "h";
    var d = localDate(ts); return d.getUTCDate() + "/" + (d.getUTCMonth() + 1);
  }
  function whenShort(ts) {
    ts = +ts; if (!ts) return "";
    var today = dayKey(), k = dayKey(ts);
    if (k === today) return hhmm(ts);
    if (k === dayKey(serverNow() - 86400)) return "Kemarin";
    var s = serverNow() - ts;
    if (s < 604800) return HARI[localDate(ts).getUTCDay()];
    var d = localDate(ts); return pad2(d.getUTCDate()) + "/" + pad2(d.getUTCMonth() + 1) + "/" + String(d.getUTCFullYear()).slice(2);
  }
  function dayLabel(ts) {
    var k = dayKey(ts);
    if (k === dayKey()) return "Hari ini";
    if (k === dayKey(serverNow() - 86400)) return "Kemarin";
    var d = localDate(ts); return HARI[d.getUTCDay()] + ", " + d.getUTCDate() + " " + BULAN[d.getUTCMonth()];
  }
  function dur(sec) { sec = Math.max(0, Math.floor(sec)); return (sec >= 3600 ? Math.floor(sec / 3600) + ":" : "") + pad2(Math.floor(sec / 60) % 60) + ":" + pad2(sec % 60); }

  /* ------------------------------------------------------------------ */
  /* Suara (WebAudio, tanpa file)                                        */
  /* ------------------------------------------------------------------ */
  var AC = null;
  function audio() {
    if (!AC) { try { var C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); } catch (e) {} }
    if (AC && AC.state === "suspended") { try { AC.resume(); } catch (e) {} }
    return AC;
  }
  document.addEventListener("pointerdown", function () { audio(); }, true);
  function tone(freq, start, len, vol, type) {
    var a = audio(); if (!a) return;
    try {
      var o = a.createOscillator(), g = a.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, a.currentTime + start);
      g.gain.exponentialRampToValueAtTime(vol || 0.08, a.currentTime + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + len);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime + start); o.stop(a.currentTime + start + len + 0.05);
    } catch (e) {}
  }
  var SFX = {
    ping: function () { if (P.sil || P.dnd) return; tone(1318, 0, 0.18, 0.06); tone(1760, 0.12, 0.28, 0.05); },
    sent: function () { if (P.sil) return; tone(880, 0, 0.12, 0.04); tone(1175, 0.06, 0.14, 0.035); },
    tick: function () { if (P.sil) return; tone(1600, 0, 0.03, 0.02, "square"); },
    shutter: function () { tone(2400, 0, 0.05, 0.05, "square"); tone(900, 0.05, 0.08, 0.04, "square"); },
    ringTimer: null,
    ring: function (on) {
      clearInterval(SFX.ringTimer); SFX.ringTimer = null;
      if (!on || P.sil) return;
      var play = function () { for (var k = 0; k < 6; k++) { tone(k % 2 ? 1046 : 880, k * 0.14, 0.13, 0.07, "triangle"); } };
      play(); SFX.ringTimer = setInterval(play, 2600);
    },
    dial: function (on) {
      clearInterval(SFX.dialTimer); SFX.dialTimer = null;
      if (!on) return;
      var play = function () { tone(425, 0, 1.0, 0.035); };
      play(); SFX.dialTimer = setInterval(play, 3000);
    }
  };

  /* ------------------------------------------------------------------ */
  /* DOM utama                                                           */
  /* ------------------------------------------------------------------ */
  var layer = document.getElementById("phonelayer");
  if (!layer) { layer = h("div", { id: "phonelayer", class: "layer" }); (document.getElementById("app") || document.body).appendChild(layer); }
  var root = h("div", { class: "eph ep-gone", "data-touch": "" });
  var frame = h("div", { class: "ep-frame" });
  var side = h("button", { class: "ep-side", type: "button", "aria-label": "Kunci" });
  var screen = h("div", { class: "ep-screen" });
  var wall = h("div", { class: "ep-wall" });
  var statusBar = h("div", { class: "ep-status" });
  var island = h("div", { class: "ep-island" });
  var lockEl = h("div", { class: "ep-layer ep-lock" });
  var passEl = h("div", { class: "ep-pass gone" });
  var homeEl = h("div", { class: "ep-layer ep-home" });
  var appWrap = h("div", { class: "ep-layer ep-appwrap" });
  var ncEl = h("div", { class: "ep-ncenter" });
  var ccEl = h("div", { class: "ep-ccenter" });
  var spotEl = h("div", { class: "ep-spot" });
  var callEl = h("div", { class: "ep-call" });
  var toastEl = h("div", { class: "ep-toast" });
  var bannerEl = h("div", { class: "ep-banner" });
  var overlay = h("div", { class: "ep-layer", style: "z-index:85;pointer-events:none" });
  var homeBar = h("div", { class: "ep-homebar" }, h("i"));
  var dimEl = h("div", { class: "ep-layer", style: "z-index:99;background:#000;opacity:0;pointer-events:none;border-radius:inherit" });
  add(screen, [wall, homeEl, lockEl, passEl, appWrap, callEl, ncEl, ccEl, spotEl, overlay, bannerEl, toastEl, statusBar, island, homeBar, dimEl]);
  add(frame, [screen, side]);
  root.appendChild(frame);
  layer.appendChild(root);
  var mini = h("div", { class: "ep-mini", "data-touch": "" });
  mini.style.visibility = "hidden";
  layer.appendChild(mini);

  /* ukuran: tinggi HP mengikuti tinggi layar (tidak mengecil saat keyboard muncul) */
  var maxH = 0, lastW = 0;
  function layout() {
    var H = window.innerHeight, W = window.innerWidth;
    if (W !== lastW) { maxH = 0; lastW = W; }
    if (H > maxH) maxH = H;
    var scale = [0.9, 1, 1.07][P.sz] || 1;
    var ph = Math.min(maxH * 0.965, 760) * scale;
    ph = Math.max(300, Math.min(ph, maxH * 0.985));
    var ratio = W < H ? 0.52 : 0.5;
    var pw = Math.min(ph * ratio, W * 0.92);
    if (W < H) { ph = Math.min(ph, W / ratio); pw = ph * ratio; }
    root.style.setProperty("--h", Math.round(ph) + "px");
    root.style.setProperty("--w", Math.round(pw) + "px");
    root.style.setProperty("--u", (ph / 100).toFixed(3) + "px");
    mini.style.setProperty("--mu", (Math.min(maxH * 0.965, 760) / 100).toFixed(3) + "px");
  }
  window.addEventListener("resize", function () { layout(); E.touch(); });
  layout();

  /* ------------------------------------------------------------------ */
  /* Status bar & island                                                 */
  /* ------------------------------------------------------------------ */
  var batt = 64 + Math.floor(Math.random() * 30);
  var sbTime = h("span"), sbLeft = h("div", { class: "sb-l" }, sbTime), sbRight = h("div", { class: "sb-r" });
  add(statusBar, [sbLeft, sbRight]);
  function paintStatus() {
    sbTime.textContent = hhmm();
    clear(sbRight);
    if (P.air) sbRight.appendChild(svg('<path d="M21 15.5v-2l-8-4.5V4a1.5 1.5 0 0 0-3 0v5L2 13.5v2l8-2.5V18l-2.5 2v1.5L11.5 20l4 1.5V20L13 18v-5z"/>'));
    else {
      sbRight.appendChild(svg('<rect x="1" y="14" width="3.6" height="6" rx="1"/><rect x="6.5" y="11" width="3.6" height="9" rx="1"/><rect x="12" y="7.5" width="3.6" height="12.5" rx="1"/><rect x="17.5" y="4" width="3.6" height="16" rx="1"/>'));
      sbRight.appendChild(svg('<path d="M12 20.5 2.3 9.2a14.5 14.5 0 0 1 19.4 0z"/>'));
    }
    if (P.dnd) sbRight.appendChild(svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'));
    var b = h("div", { class: "batt" + (batt < 20 ? " lo" : "") }, h("i", null, h("b", { style: "width:calc(" + batt + "% - 1.5px)" })));
    sbRight.appendChild(b);
    // warna tinta status bar: gelap bila aplikasi terang terbuka
    var ink = !!(S.cur && S.unlocked && !S.call && appWrap.classList.contains("open") && !root.classList.contains("dark") && !(S.cur.def && S.cur.def.darkBar));
    cls(statusBar, "dark-ink", ink);
    cls(homeBar, "ink", ink);
  }
  setInterval(function () {
    if (!S.open) return;
    paintStatus();
    var t = lockEl.querySelector(".lk-time"); if (t) t.textContent = hhmm();
    if (S.call && S.call.st === "active") paintCallTimer();
    if (Math.random() < 0.004 && batt > 8) batt--;
  }, 1000);

  function paintIsland() {
    clear(island); cls(island, "wide", false);
    if (S.call) {
      cls(island, "wide", true);
      var l = h("div", { class: "isl-l isl-call" }, [svg(I.phoneF, null), h("span", { text: S.call.st === "active" ? dur(serverNow() - S.call.t0) : (S.call.st === "in" ? "Masuk" : "Memanggil") })]);
      l.firstChild.style.cssText = "width:calc(var(--u)*2.2);height:calc(var(--u)*2.2);fill:#30d158";
      add(island, [l, h("div", { class: "isl-r" }, h("i", { class: "isl-dot" }))]);
      island.onclick = function () { showCall(true); };
    } else if (S.music) {
      cls(island, "wide", true);
      add(island, [h("div", { class: "isl-l" }, [h("span", { text: "♪ " + (S.music.length > 18 ? S.music.slice(0, 18) + "…" : S.music) })]), h("div", { class: "isl-r isl-bars" }, [h("i"), h("i"), h("i")])]);
      island.onclick = function () { openApp("music"); };
    } else island.onclick = null;
  }

  /* ------------------------------------------------------------------ */
  /* Tema & wallpaper                                                    */
  /* ------------------------------------------------------------------ */
  function applyTheme() {
    var dark = P.th === "dark" || (P.th === "auto" && (localDate().getUTCHours() >= 18 || localDate().getUTCHours() < 6));
    cls(root, "dark", dark);
    wall.className = "ep-wall";
    wall.style.backgroundImage = "";
    if (P.wp === 0 && imgUrl(P.wpurl)) wall.style.backgroundImage = "url(\"" + imgUrl(P.wpurl).replace(/"/g, "") + "\")";
    else wall.classList.add("wp-" + (P.wp || 1));
    dimEl.style.opacity = String(Math.max(0, Math.min(0.6, (100 - (P.bright || 100)) / 150)));
    layout();
  }

  /* ------------------------------------------------------------------ */
  /* Overlay: toast, alert, sheet, action sheet                          */
  /* ------------------------------------------------------------------ */
  var toastTimer = null;
  function toast(msg, err) {
    clear(toastEl); add(toastEl, [h("i"), h("span", { text: dec(msg) })]);
    cls(toastEl, "err", !!err);
    toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 2200);
  }
  function shade(onClose) {
    var sh = h("div", { class: "ep-shade" });
    sh.style.pointerEvents = "auto";
    overlay.appendChild(sh);
    requestAnimationFrame(function () { sh.classList.add("on"); });
    if (onClose) tap(sh, onClose);
    return sh;
  }
  function removeLater(el, ms) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms || 320); }
  function alertBox(o) {
    var sh = shade(null), box = h("div", { class: "ep-alert" });
    box.style.pointerEvents = "auto";
    var inp = null;
    var b = h("div", { class: "al-b" }, [o.title ? h("b", { text: o.title }) : null, o.text ? h("p", { text: o.text }) : null]);
    if (o.input) { inp = h("input", { type: o.input.type || "text", placeholder: o.input.ph || "", value: o.input.value || "", maxlength: o.input.max || 120 }); b.appendChild(inp); }
    var btns = o.buttons || [{ label: "OK", style: "b" }];
    var a = h("div", { class: "al-a" + (btns.length > 2 ? " col" : "") });
    function close() { box.classList.remove("on"); sh.classList.remove("on"); removeLater(box); removeLater(sh); E.touch(); }
    btns.forEach(function (bt) {
      a.appendChild(tap(h("button", { type: "button", class: bt.style || "", text: bt.label }), function () {
        close(); if (bt.fn) bt.fn(inp ? inp.value : undefined);
      }));
    });
    add(box, [b, a]);
    overlay.appendChild(box);
    requestAnimationFrame(function () { box.classList.add("on"); if (inp) inp.focus(); });
    E.touch();
    return { close: close };
  }
  function confirmBox(title, text, okLabel, fn, danger) {
    return alertBox({ title: title, text: text, buttons: [{ label: "Batal" }, { label: okLabel || "OK", style: danger ? "r b" : "b", fn: fn }] });
  }
  function prompt(title, text, opts, fn) {
    opts = opts || {};
    return alertBox({ title: title, text: text, input: opts, buttons: [{ label: "Batal" }, { label: opts.ok || "OK", style: "b", fn: function (v) { fn(v); } }] });
  }
  function actions(title, items) {
    var sh, box = h("div", { class: "ep-asheet" });
    box.style.pointerEvents = "auto";
    function close() { box.classList.remove("on"); sh.classList.remove("on"); removeLater(box); removeLater(sh); E.touch(); }
    sh = shade(close);
    var g = h("div", { class: "as-g" });
    if (title) g.appendChild(h("div", { class: "as-t", text: title }));
    items.forEach(function (it) {
      if (!it) return;
      g.appendChild(tap(h("button", { type: "button", class: it.style || "", text: it.label }), function () { close(); if (it.fn) it.fn(); }));
    });
    add(box, [g, h("div", { class: "as-g" }, tap(h("button", { type: "button", class: "b", text: "Batal" }), close))]);
    overlay.appendChild(box);
    requestAnimationFrame(function () { box.classList.add("on"); });
    E.touch();
    return { close: close };
  }
  function sheet(o) {
    var sh, box = h("div", { class: "ep-sheet" + (o.tall ? " tall" : "") });
    box.style.pointerEvents = "auto";
    function close() { box.classList.remove("on"); sh.classList.remove("on"); removeLater(box, 380); removeLater(sh, 380); if (o.onClose) o.onClose(); E.touch(); }
    sh = shade(o.tall ? null : close);
    var left = o.left ? tap(h("button", { type: "button", class: "ep-nav-btn", text: o.left.label }), function () { if (o.left.fn) o.left.fn(close); else close(); }) : h("span", { style: "width:20%" });
    var right = o.right ? tap(h("button", { type: "button", class: "ep-nav-btn bold", text: o.right.label }), function () { o.right.fn(close); }) : h("span", { style: "width:20%" });
    var body = h("div", { class: "sh-body" }, o.body);
    add(box, [h("div", { class: "sh-grab" }), h("div", { class: "sh-head" }, [left, h("b", { text: o.title || "" }), right]), body]);
    overlay.appendChild(box);
    requestAnimationFrame(function () { box.classList.add("on"); });
    E.touch();
    return { close: close, el: box, body: body, right: right };
  }
  function closeOverlays() { clear(overlay); }

  /* ------------------------------------------------------------------ */
  /* Komponen UI untuk aplikasi                                          */
  /* ------------------------------------------------------------------ */
  var UI = {
    h: h, svg: svg, ic: ic, add: add, clear: clear, tap: tap, enc: enc, dec: dec, money: money, img: img, imgUrl: imgUrl,
    avatar: avatar, initials: initials, nameOf: nameOf, appIcon: appIcon, pad2: pad2,
    hhmm: hhmm, ago: ago, whenShort: whenShort, dayLabel: dayLabel, dayKey: dayKey, longDate: longDate, dur: dur, now: serverNow,
    toast: toast, alert: alertBox, confirm: confirmBox, prompt: prompt, actions: actions, sheet: sheet,
    nav: function (o) {
      o = o || {};
      var row = h("div", { class: "ep-nav-row" });
      var left = h("div", { class: "ep-nav-acts" });
      if (o.back) {
        left.appendChild(tap(h("button", { type: "button", class: "ep-nav-btn" }, [ic("back"), h("span", { text: o.back === true ? "Kembali" : o.back })]), o.onBack || function () { popView(); }));
      } else if (o.left) add(left, o.left);
      row.appendChild(left);
      if (o.title) row.appendChild(h("div", { class: "nv-t" }, [o.title, o.sub ? h("small", { text: o.sub }) : null]));
      row.appendChild(h("div", { class: "ep-nav-acts" }, o.right || null));
      var nav = h("div", { class: "ep-nav" + (o.cls ? " " + o.cls : "") + (o.large ? "" : " line") }, [row]);
      if (o.large) nav.appendChild(h("div", { class: "ep-large" }, [o.large, o.largeSub ? h("small", { text: o.largeSub }) : null]));
      if (o.extra) add(nav, o.extra);
      return nav;
    },
    navBtn: function (label, fn, bold) { return tap(h("button", { type: "button", class: "ep-nav-btn" + (bold ? " bold" : "") }, label), fn); },
    navIcon: function (name, fn) { return tap(h("button", { type: "button", class: "ep-iconbtn" }, ic(name)), fn); },
    body: function (kids, c) { return h("div", { class: "ep-body" + (c ? " " + c : "") }, kids); },
    list: function (rows, c) { return h("div", { class: "ep-list" + (c ? " " + c : "") }, rows); },
    sec: function (t) { return h("div", { class: "ep-sec-t", text: t }); },
    foot: function (t) { return h("div", { class: "ep-sec-f", text: t }); },
    row: function (o) {
      var tag = o.onClick ? "button" : "div";
      var r = h(tag, { class: "ep-row" + (o.icon ? " wic" : "") + (o.av ? " av" : "") + (o.cls ? " " + o.cls : ""), type: o.onClick ? "button" : null });
      if (o.icon) { var b = h("div", { class: "rw-ic" }, ic(o.icon)); b.style.background = o.iconBg || "#8e8e93"; r.appendChild(b); }
      if (o.av) r.appendChild(o.av);
      if (o.lead) r.appendChild(o.lead);
      var m = h("div", { class: "rw-main" }, [h("div", { class: "rw-t" + (o.bold ? " b" : ""), text: o.title }), o.sub ? h("div", { class: "rw-s" + (o.wrap ? " wrap" : ""), text: o.sub }) : null]);
      r.appendChild(m);
      var right = h("div", { class: "rw-r" });
      if (o.right != null) right.appendChild(typeof o.right === "object" ? o.right : h("span", { class: "val", text: String(o.right) }));
      if (o.chev) right.appendChild(svg(I.chev, "chev"));
      if (right.childNodes.length) r.appendChild(right);
      if (o.onClick) tap(r, o.onClick);
      if (o.onHold) hold(r, o.onHold);
      return r;
    },
    toggle: function (on, fn) {
      var t = h("button", { type: "button", class: "ep-switch" + (on ? " on" : "") });
      tap(t, function () { var v = !t.classList.contains("on"); cls(t, "on", v); fn(v); });
      return t;
    },
    search: function (ph, val, fn) {
      var inp = h("input", { type: "text", placeholder: ph || "Cari", value: val || "" });
      inp.addEventListener("input", function () { fn(inp.value); });
      return h("div", { class: "ep-search" }, [ic("search"), inp]);
    },
    seg: function (opts, cur, fn) {
      return h("div", { class: "ep-seg" }, opts.map(function (o) {
        return tap(h("button", { type: "button", class: o[0] === cur ? "on" : "", text: o[1] }), function () { fn(o[0]); });
      }));
    },
    chips: function (opts, cur, fn) {
      return h("div", { class: "ep-chips" }, opts.map(function (o) {
        return tap(h("button", { type: "button", class: o[0] === cur ? "on" : "", text: o[1] }), function () { fn(o[0]); });
      }));
    },
    tabs: function (items, cur, fn) {
      return h("div", { class: "ep-tabs" }, items.map(function (t) {
        var b = tap(h("button", { type: "button", class: t[0] === cur ? "on" : "" }, [ic(t[2]), h("span", { text: t[1] })]), function () { fn(t[0]); });
        if (t[3]) b.appendChild(h("span", { class: "tb-badge", text: String(t[3]) }));
        return b;
      }));
    },
    btn: function (label, fn, c, icon) { return tap(h("button", { type: "button", class: "ep-btn " + (c || "") }, [icon ? ic(icon) : null, label]), fn); },
    empty: function (icon, t, s) { return h("div", { class: "ep-empty" }, [ic(icon || "info"), h("b", { text: t }), s ? h("span", { text: s }) : null]); },
    loading: function () { return h("div", { class: "ep-loading" }, h("div", { class: "ep-spin" })); },
    field: function (label, input) { return h("div", { class: "ep-field" }, [label ? h("label", { text: label }) : null, input]); },
    input: function (o) {
      o = o || {};
      var el = h(o.area ? "textarea" : "input", { class: "ep-input", type: o.area ? null : (o.type || "text"), placeholder: o.ph || "", maxlength: o.max || 200, inputmode: o.mode || null, rows: o.rows || null });
      if (o.value != null) el.value = dec(o.value);
      if (o.onInput) el.addEventListener("input", function () { o.onInput(el.value); });
      return el;
    },
    card: function (kids, c) { return h("div", { class: "ep-card" + (c ? " " + c : "") }, kids); },
    pill: function (t, c) { return h("span", { class: "ep-pill " + (c || ""), text: t }); },
    gap: function (lg) { return h("div", { class: "ep-gap" + (lg ? " lg" : "") }); }
  };
  function hold(el, fn) {
    var t = null, fired = false, sx = 0, sy = 0;
    el.addEventListener("pointerdown", function (e) { fired = false; sx = e.clientX; sy = e.clientY; clearTimeout(t); t = setTimeout(function () { fired = true; fn(e); }, 520); });
    el.addEventListener("pointermove", function (e) { var dx = e.clientX - sx, dy = e.clientY - sy; if (dx * dx + dy * dy > 100) clearTimeout(t); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { el.addEventListener(ev, function () { clearTimeout(t); }); });
    el.addEventListener("click", function (e) { if (fired) { e.stopImmediatePropagation(); e.preventDefault(); fired = false; } }, true);
  }
  UI.hold = hold;

  /* ------------------------------------------------------------------ */
  /* Kerangka aplikasi: stack view per aplikasi                          */
  /* ------------------------------------------------------------------ */
  var DEFS = {}, CTX = {}, KEYMAP = {};
  function makeCtx(id) {
    if (CTX[id]) return CTX[id];
    var def = DEFS[id];
    var c = {
      id: id, def: def, cache: {}, stack: [], st: {},
      send: send, sendJ: sendJ, ui: UI, dev: function () { return S.dev; }, prefs: P, setPref: setPref,
      push: function (render, st) { pushView(c, render, st || {}); },
      pop: function () { popView(); },
      replace: function (render, st) { replaceView(c, render, st || {}); },
      refresh: function () { refreshTop(c); },
      top: function () { return c.stack[c.stack.length - 1]; },
      badge: function (n) { setBadge(id, n); },
      openApp: openApp, toast: toast, closePhone: function () { send("close"); }
    };
    CTX[id] = c;
    return c;
  }
  function register(id, def) {
    DEFS[id] = def;
    (def.keys || [id]).forEach(function (k) { KEYMAP[k] = id; });
  }
  function paintView(c, entry) {
    var el = entry.el;
    var oldBody = el.querySelector(".ep-body");
    var sc = oldBody ? oldBody.scrollTop : 0, nearBottom = oldBody ? (oldBody.scrollHeight - oldBody.scrollTop - oldBody.clientHeight < 40) : true;
    var nodes;
    try { nodes = entry.render(c, entry.st) || []; }
    catch (err) {
      E.log("Phone render error [" + c.id + "]: " + (err && (err.stack || err.message) || err));
      nodes = [UI.nav({ back: c.stack.length > 1, title: (APP[c.id] || {}).name }), UI.body(UI.empty("info", "Terjadi kesalahan", "Coba buka ulang aplikasi."))];
    }
    if (!Array.isArray(nodes)) nodes = [nodes];
    nodes = nodes.filter(function (n) { return n; });
    var old = Array.prototype.slice.call(el.childNodes);
    for (var i = 0; i < nodes.length; i++) {
      if (el.childNodes[i] !== nodes[i]) el.insertBefore(nodes[i], el.childNodes[i] || null);
    }
    old.forEach(function (o) { if (nodes.indexOf(o) < 0 && o.parentNode === el) el.removeChild(o); });
    cls(el, "white", !!entry.st.white);
    var nb = el.querySelector(".ep-body");
    if (nb) {
      if (entry.st.stickBottom && (nearBottom || entry.st._first !== false)) nb.scrollTop = nb.scrollHeight;
      else nb.scrollTop = sc;
    }
    entry.st._first = false;
    E.touch();
  }
  function pushView(c, render, st) {
    var prev = c.stack[c.stack.length - 1];
    var el = h("div", { class: "ep-view" + (prev ? " enter" : "") });
    var entry = { render: render, st: st, el: el };
    c.stack.push(entry);
    if (S.cur === c) {
      appWrap.appendChild(el);
      paintView(c, entry);
      if (prev) {
        el.getBoundingClientRect();
        requestAnimationFrame(function () { el.classList.remove("enter"); prev.el.classList.add("behind"); });
      }
    }
  }
  function popView() {
    var c = S.cur; if (!c) return;
    if (c.stack.length <= 1) { goHome(); return; }
    var top = c.stack.pop(), prev = c.stack[c.stack.length - 1];
    if (top.st.onLeave) top.st.onLeave();
    top.el.classList.add("leave");
    prev.el.classList.remove("behind");
    if (prev.st.onBack) prev.st.onBack();
    paintView(c, prev);
    removeLater(top.el, 340);
    paintStatus();
  }
  function replaceView(c, render, st) {
    var top = c.stack[c.stack.length - 1];
    if (!top) return pushView(c, render, st);
    top.render = render; top.st = st;
    if (S.cur === c) paintView(c, top);
  }
  function refreshTop(c) {
    if (S.cur !== c) return;
    var top = c.stack[c.stack.length - 1];
    if (top) paintView(c, top);
  }
  function mountApp(c) {
    clear(appWrap);
    c.stack.forEach(function (e, i) { e.el.className = "ep-view" + (i < c.stack.length - 1 ? " behind" : ""); appWrap.appendChild(e.el); paintView(c, e); });
  }

  /* ------------------------------------------------------------------ */
  /* Navigasi                                                            */
  /* ------------------------------------------------------------------ */
  function openApp(id, arg) {
    if (!DEFS[id] || !APP[id]) { toast("Aplikasi belum tersedia", 1); return; }
    if (!S.unlocked) { S.pendingApp = [id, arg]; return; }
    closeSpot(); closeCC(); closeNC(); closeOverlays();
    var c = makeCtx(id);
    var same = S.cur === c;
    S.cur = c;
    if (!same || !c.stack.length || arg != null) {
      c.stack = [];
      clear(appWrap);
      try { DEFS[id].open(c, arg); } catch (e) { E.log("open " + id + ": " + (e.stack || e)); }
      if (!c.stack.length) pushView(c, function () { return [UI.nav({ title: APP[id].name }), UI.body(UI.loading())]; }, {});
    } else mountApp(c);
    appWrap.classList.add("open");
    homeEl.classList.add("behind");
    cls(root, "cam-mode", id === "camera");
    S.lastApp = id;
    if (DEFS[id].badgeClear !== false && S.badges[id]) setBadge(id, 0);
    send("open", arg == null ? -1 : (typeof arg === "number" ? arg : -1), id + (typeof arg === "string" && arg ? ":" + arg : ""));
    paintStatus(); E.touch();
  }
  function goHome() {
    var c = S.cur;
    if (c && c.def && c.def.onClose) { try { c.def.onClose(c); } catch (e) {} }
    S.cur = null;
    appWrap.classList.remove("open");
    homeEl.classList.remove("behind");
    cls(root, "cam-mode", false);
    closeOverlays(); closeSpot();
    setTimeout(function () { if (!S.cur) clear(appWrap); }, 360);
    renderHome();
    paintStatus();
    send("home");
    E.touch();
  }

  /* ------------------------------------------------------------------ */
  /* Lock screen & passcode                                              */
  /* ------------------------------------------------------------------ */
  function renderLock() {
    clear(lockEl);
    var lockIcon = svg(I.lock, "lk-ico");
    lockIcon.setAttribute("style", "stroke:#fff;fill:none;stroke-width:2");
    var notifs = h("div", { class: "lk-notifs" }, S.notifs.slice(-4).reverse().map(function (n) { return notifCard(n); }));
    var torch = h("button", { type: "button", class: "lk-round" + (S.torch ? " on" : "") }, svg(I.torch));
    tap(torch, function () { S.torch = !S.torch; cls(torch, "on", S.torch); send("torch", S.torch ? 1 : 0); });
    var cam = tap(h("button", { type: "button", class: "lk-round" }, svg(I.cam)), function () { unlock(function () { openApp("camera"); }); });
    add(lockEl, [
      lockIcon,
      h("div", { class: "lk-date", text: longDate() }),
      h("div", { class: "lk-time", text: hhmm() }),
      notifs,
      h("div", { class: "lk-bottom" }, [torch, h("div", { class: "lk-hint", text: P.pc ? "Geser ke atas untuk membuka" : "Ketuk untuk membuka" }), cam])
    ]);
    lockEl.onclick = function (e) { if (e.target === lockEl || e.target.classList.contains("lk-hint") || e.target.classList.contains("lk-time") || e.target.classList.contains("lk-date")) unlock(); };
  }
  var passBuf = "", passCb = null, passMode = "unlock";
  function renderPass(title) {
    clear(passEl);
    var dots = h("div", { class: "ps-dots" });
    for (var i = 0; i < 4; i++) dots.appendChild(h("i", { class: i < passBuf.length ? "on" : "" }));
    var pad = h("div", { class: "ps-pad" });
    var L = ["", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];
    for (var n = 1; n <= 9; n++) (function (d) { pad.appendChild(tap(h("button", { type: "button" }, [String(d), h("small", { text: L[d - 1] })]), function () { passKey(String(d)); })); })(n);
    pad.appendChild(h("button", { type: "button", class: "blank" }));
    pad.appendChild(tap(h("button", { type: "button" }, "0"), function () { passKey("0"); }));
    pad.appendChild(h("button", { type: "button", class: "blank" }));
    add(passEl, [h("div", { class: "ps-t", text: title || "Masukkan Kode Sandi" }), dots, pad,
      h("div", { class: "ps-foot" }, [tap(h("button", { type: "button", text: "Batal" }), function () { hidePass(); }), tap(h("button", { type: "button", text: "Hapus" }), function () { passBuf = passBuf.slice(0, -1); renderPass(title); })])]);
  }
  function showPass(mode, cb, title) { passMode = mode; passCb = cb; passBuf = ""; renderPass(title); passEl.classList.remove("gone"); E.touch(); }
  function hidePass() { passEl.classList.add("gone"); passBuf = ""; }
  function passKey(d) {
    if (passBuf.length >= 4) return;
    SFX.tick();
    passBuf += d; renderPass(passEl.querySelector(".ps-t") ? passEl.querySelector(".ps-t").textContent : "");
    if (passBuf.length === 4) {
      var code = passBuf;
      setTimeout(function () {
        if (passMode === "unlock") send("unlock", -1, code);
        else { hidePass(); if (passCb) passCb(code); }
      }, 120);
    }
  }
  function passFail() {
    var d = passEl.querySelector(".ps-dots"); if (d) { d.classList.add("shake"); }
    setTimeout(function () { passBuf = ""; renderPass("Kode salah, coba lagi"); }, 420);
  }
  var afterUnlock = null;
  function unlock(cb) {
    if (S.unlocked) { if (cb) cb(); return; }
    afterUnlock = cb || null;
    if (P.pc && !P.faceid) { showPass("unlock", null); return; }
    doUnlocked();
  }
  function doUnlocked() {
    hidePass();
    S.unlocked = true;
    lockEl.classList.add("gone");
    homeEl.classList.remove("locked");
    homeBar.classList.remove("hide");
    renderHome();
    var cb = afterUnlock; afterUnlock = null;
    if (cb) cb();
    else if (S.pendingApp) { var pa = S.pendingApp; S.pendingApp = null; openApp(pa[0], pa[1]); }
    paintStatus(); E.touch();
  }
  function lockPhone() {
    S.unlocked = false;
    if (S.cur) { S.cur = null; appWrap.classList.remove("open"); homeEl.classList.remove("behind"); cls(root, "cam-mode", false); }
    closeOverlays(); closeNC(); closeCC(); closeSpot();
    renderLock();
    lockEl.classList.remove("gone");
    homeEl.classList.add("locked");
    paintStatus();
  }

  /* ------------------------------------------------------------------ */
  /* Home screen                                                         */
  /* ------------------------------------------------------------------ */
  function installed(id) { return (P.hidden || []).indexOf(id) < 0 || CORE_APPS.indexOf(id) >= 0; }
  function homePages() {
    var pages = Array.isArray(P.home) && P.home.length ? P.home : DEFAULT_HOME;
    var seen = {}, out = [];
    DOCK.forEach(function (d) { seen[d] = 1; });
    pages.forEach(function (pg) {
      var p = [];
      (pg || []).forEach(function (id) { if (APP[id] && DEFS[id] && !seen[id] && installed(id)) { seen[id] = 1; p.push(id); } });
      if (p.length) out.push(p);
    });
    // aplikasi baru yang belum ada di layout -> tambahkan
    APPS.forEach(function (a) {
      if (!seen[a.id] && DEFS[a.id] && installed(a.id)) {
        var last = out[out.length - 1];
        if (!last || last.length >= PER_PAGE) { last = []; out.push(last); }
        last.push(a.id); seen[a.id] = 1;
      }
    });
    if (!out.length) out.push([]);
    return out;
  }
  function appTile(id, inDock) {
    var a = APP[id];
    var ai = h("div", { class: "ai" }, appIcon(id));
    if (id === "clock") { /* sudah dinamis */ }
    var n = S.badges[id] || 0;
    if (n > 0) ai.appendChild(h("div", { class: "ep-badge", text: n > 99 ? "99+" : String(n) }));
    var el = h("div", { class: "ep-app" + (S.pick === id ? " pick" : "") }, [ai, h("div", { class: "al", text: a.name })]);
    tap(el, function () {
      if (S.edit) { editPick(id); return; }
      openApp(id);
    });
    if (!inDock) hold(el, function () { appMenu(id); });
    return el;
  }
  function appMenu(id) {
    actions(APP[id].name, [
      { label: "Buka", style: "b", fn: function () { openApp(id); } },
      { label: "Edit Layar Utama", fn: function () { S.edit = true; S.pick = null; renderHome(); } },
      CORE_APPS.indexOf(id) < 0 ? { label: "Hapus Aplikasi", style: "r", fn: function () { removeApp(id); } } : null
    ]);
  }
  function removeApp(id) {
    confirmBox("Hapus \"" + APP[id].name + "\"?", "Aplikasi bisa dipasang lagi lewat App Store. Data kamu tetap tersimpan di server.", "Hapus", function () {
      var hdn = (P.hidden || []).slice(); if (hdn.indexOf(id) < 0) hdn.push(id);
      setPref("hidden", hdn); renderHome(); toast(APP[id].name + " dihapus");
    }, true);
  }
  function editPick(id) {
    if (!S.pick) { S.pick = id; renderHome(); return; }
    if (S.pick === id) { S.pick = null; renderHome(); return; }
    var pages = homePages().map(function (p) { return p.slice(); });
    var a = null, b = null;
    pages.forEach(function (p, pi) { p.forEach(function (x, xi) { if (x === S.pick) a = [pi, xi]; if (x === id) b = [pi, xi]; }); });
    if (a && b) { var t = pages[a[0]][a[1]]; pages[a[0]][a[1]] = pages[b[0]][b[1]]; pages[b[0]][b[1]] = t; setPref("home", pages); }
    S.pick = null; renderHome();
  }
  function moveToPage(dir) {
    if (!S.pick) return;
    var pages = homePages().map(function (p) { return p.slice(); });
    var from = -1;
    pages.forEach(function (p, pi) { var k = p.indexOf(S.pick); if (k >= 0) { from = pi; p.splice(k, 1); } });
    var to = Math.max(0, Math.min(pages.length, from + dir));
    if (!pages[to]) pages[to] = [];
    if (pages[to].length >= PER_PAGE) { toast("Halaman penuh", 1); return; }
    pages[to].push(S.pick);
    pages = pages.filter(function (p) { return p.length; });
    setPref("home", pages); S.page = Math.min(to, pages.length - 1); renderHome();
  }
  var strip = null;
  function renderHome() {
    var pages = homePages();
    clear(homeEl);
    cls(homeEl, "ep-edit", S.edit);
    var total = pages.length + 1; // + App Library
    if (S.page >= total) S.page = total - 1;
    strip = h("div", { class: "ep-pagestrip" });
    pages.forEach(function (pg) { strip.appendChild(h("div", { class: "ep-page" }, pg.map(function (id) { return appTile(id); }))); });
    strip.appendChild(libraryPage());
    strip.style.transform = "translateX(" + (-100 * S.page) + "%)";
    var pagesEl = h("div", { class: "ep-pages" }, strip);
    var dots;
    if (S.page === 0 && !S.edit) {
      dots = tap(h("div", { class: "ep-dots search" }, [svg(I.search), h("span", { text: "Cari" })]), function () { openSpot(); });
    } else {
      dots = h("div", { class: "ep-dots" });
      for (var i = 0; i < total; i++) (function (k) { dots.appendChild(tap(h("i", { class: k === S.page ? "on" : "" }), function () { S.page = k; renderHome(); })); })(i);
    }
    var dock = h("div", { class: "ep-dock" }, DOCK.map(function (id) { return appTile(id, true); }));
    add(homeEl, [pagesEl, dots, dock]);
    if (S.edit) {
      var bar = h("div", { class: "ep-edit-bar" }, [
        S.pick ? tap(h("button", { type: "button", text: "‹ Hal." }), function () { moveToPage(-1); }) : null,
        S.pick ? tap(h("button", { type: "button", text: "Hal. ›" }), function () { moveToPage(1); }) : null,
        tap(h("button", { type: "button", text: "Selesai" }), function () { S.edit = false; S.pick = null; renderHome(); })
      ]);
      homeEl.appendChild(bar);
      if (!S.pick) toast("Ketuk 2 ikon untuk menukar posisi");
    }
    swipePages(pagesEl, total);
  }
  function libraryPage() {
    var cats = {};
    APPS.forEach(function (a) { if (DEFS[a.id] && installed(a.id)) (cats[a.cat] = cats[a.cat] || []).push(a.id); });
    var box = h("div", { class: "ep-lib" }, [
      tap(h("div", { class: "ep-search", style: "margin:0 0 calc(var(--u)*1.4);background:rgba(235,235,245,.22);color:rgba(255,255,255,.75)" }, [svg(I.search), h("span", { text: "Pustaka Aplikasi", style: "font-size:calc(var(--u)*2.5)" })]), function () { openSpot(); })
    ]);
    Object.keys(cats).forEach(function (k) {
      box.appendChild(h("div", { class: "lb-cat" }, [h("b", { text: k }), h("div", { class: "lb-grid" }, cats[k].map(function (id) { return appTile(id, true); }))]));
    });
    return h("div", { class: "ep-page", style: "display:block;padding:0" }, box);
  }
  function swipePages(el, total) {
    var sx = 0, sy = 0, dx = 0, active = false, horiz = null;
    el.onpointerdown = function (e) { sx = e.clientX; sy = e.clientY; dx = 0; active = true; horiz = null; };
    el.onpointermove = function (e) {
      if (!active) return;
      var mx = e.clientX - sx, my = e.clientY - sy;
      if (horiz === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) horiz = Math.abs(mx) > Math.abs(my);
      if (horiz) { dx = mx; strip.style.transition = "none"; strip.style.transform = "translateX(calc(" + (-100 * S.page) + "% + " + dx + "px))"; }
    };
    el.onpointerup = el.onpointercancel = function (e) {
      if (!active) return; active = false; strip.style.transition = "";
      if (horiz && Math.abs(dx) > el.clientWidth * 0.18) { S.page = Math.max(0, Math.min(total - 1, S.page + (dx < 0 ? 1 : -1))); renderHome(); return; }
      if (horiz === false && e.clientY - sy > 60 && S.page < total - 1 && !S.edit) { openSpot(); }
      strip.style.transform = "translateX(" + (-100 * S.page) + "%)";
    };
  }

  /* ------------------------------------------------------------------ */
  /* Spotlight                                                           */
  /* ------------------------------------------------------------------ */
  function openSpot() {
    clear(spotEl);
    var res = h("div", { class: "sp-res" });
    var inp = h("input", { type: "text", placeholder: "Cari aplikasi & kontak" });
    function fill() {
      clear(res);
      var q = inp.value.toLowerCase().trim();
      var apps = APPS.filter(function (a) { return DEFS[a.id] && installed(a.id) && (!q || a.name.toLowerCase().indexOf(q) >= 0 || a.id.indexOf(q) >= 0); });
      if (apps.length) res.appendChild(h("div", { class: "sp-apps" }, apps.slice(0, q ? 8 : 8).map(function (a) { return appTile(a.id, true); })));
      var cts = (CTX.contacts && CTX.contacts.cache.contacts && CTX.contacts.cache.contacts.items) || [];
      if (q) cts.filter(function (c) { return nameOf(c.n).toLowerCase().indexOf(q) >= 0 || String(c.num).indexOf(q) >= 0; }).slice(0, 12).forEach(function (c) {
        res.appendChild(tap(h("div", { class: "sp-row" }, [avatar(c.n, null, "sm"), h("div", null, [h("b", { text: nameOf(c.n) }), h("small", { text: c.num })])]), function () { openApp("contacts", "c" + c.id); }));
      });
    }
    inp.addEventListener("input", fill);
    add(spotEl, [h("div", { class: "ep-search" }, [svg(I.search), inp]), res]);
    fill();
    spotEl.classList.add("on");
    tap(spotEl, function (e) { if (e.target === spotEl || e.target === res) closeSpot(); });
    setTimeout(function () { inp.focus(); }, 280);
    E.touch();
  }
  function closeSpot() { spotEl.classList.remove("on"); }

  /* ------------------------------------------------------------------ */
  /* Notifikasi                                                          */
  /* ------------------------------------------------------------------ */
  function notifCard(n) {
    var ico = h("div", { class: "nc-ico", style: "position:relative" }, appIcon(n.app));
    var card = h("div", { class: "ep-ncard" }, [ico, h("div", { class: "nc-body" }, [
      h("div", { class: "nc-top" }, [h("b", { text: dec(n.title) }), h("span", { text: ago(n.ts) })]),
      h("div", { class: "nc-text", text: dec(n.body) })
    ])]);
    tap(card, function () { openNotif(n); });
    return card;
  }
  function openNotif(n) {
    closeNC(); hideBanner();
    var go = function () { if (n.app && APP[n.app]) openApp(n.app, n.key || null); };
    if (!S.open) { S.pendingNotif = n; send("open_phone"); return; }
    if (!S.unlocked) unlock(go); else go();
  }
  var bannerTimer = null;
  function showBanner(n) {
    clear(bannerEl); bannerEl.appendChild(notifCard(n));
    bannerEl.classList.add("on");
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(hideBanner, 4200);
    E.touch();
  }
  function hideBanner() { bannerEl.classList.remove("on"); }
  var miniTimer = null;
  function showMini(kind, n) {
    clear(mini);
    var card;
    if (kind === "call") {
      card = h("div", { class: "mn-card" }, [avatar(S.call.name || S.call.num, null), h("div", { class: "mn-txt" }, [h("small", { text: "Panggilan masuk" }), h("b", { text: nameOf(S.call.name || S.call.num) }), h("span", { text: S.call.num })]),
        h("div", { class: "mn-btns" }, [
          tap(h("button", { class: "red", type: "button" }, svg(I.phoneF)), function () { send("decline"); }),
          tap(h("button", { class: "green", type: "button" }, svg(I.phoneF)), function () { send("accept"); })
        ])]);
    } else {
      card = h("div", { class: "mn-card" }, [h("div", { class: "mn-ico" }, appIcon(n.app)), h("div", { class: "mn-txt" }, [h("small", { text: (APP[n.app] || {}).name || "EAGLE" }), h("b", { text: dec(n.title) }), h("span", { text: dec(n.body) })])]);
      tap(card, function () { hideMini(); openNotif(n); });
      clearTimeout(miniTimer); miniTimer = setTimeout(hideMini, 5000);
    }
    mini.appendChild(card);
    mini.style.visibility = "visible";
    requestAnimationFrame(function () { mini.classList.add("on"); });
    setTimeout(E.touch, 450);
  }
  function hideMini() { mini.classList.remove("on"); setTimeout(function () { if (!mini.classList.contains("on")) { mini.style.visibility = "hidden"; E.touch(); } }, 420); }

  function pushNotif(d) {
    var n = { app: d.app || "settings", title: d.title || "", body: d.body || "", key: d.key || null, ts: +d.ts || serverNow() };
    S.notifs.push(n); if (S.notifs.length > 60) S.notifs.shift();
    if (d.silent) return;
    SFX.ping();
    if (P.dnd) return;
    if (S.open && S.unlocked) {
      var c = S.cur;
      if (c && c.id === n.app && c.def.isViewing && c.def.isViewing(c, n)) return; // sedang dibuka
      showBanner(n);
    } else if (S.open) { renderLock(); }
    else showMini("notif", n);
  }
  function renderNC() {
    clear(ncEl);
    var list = h("div", { class: "nc-list" }, S.notifs.slice().reverse().map(notifCard));
    if (!S.notifs.length) list.appendChild(h("div", { class: "nc-empty", text: "Tidak ada notifikasi" }));
    add(ncEl, [h("div", { class: "nc-h" }, [h("b", { text: "Notifikasi" }), S.notifs.length ? tap(h("button", { type: "button", text: "Hapus" }), function () { S.notifs = []; renderNC(); }) : null]), list]);
  }
  function openNC() { renderNC(); ncEl.classList.add("on"); E.touch(); }
  function closeNC() { ncEl.classList.remove("on"); }

  function setBadge(app, n) {
    n = Math.max(0, +n || 0);
    if ((S.badges[app] || 0) === n) return;
    S.badges[app] = n;
    if (!S.cur && S.unlocked) renderHome();
    if (S.cur && DEFS[S.cur.id] && DEFS[S.cur.id].onBadge) DEFS[S.cur.id].onBadge(S.cur);
  }

  /* ------------------------------------------------------------------ */
  /* Control Center                                                      */
  /* ------------------------------------------------------------------ */
  function renderCC() {
    clear(ccEl);
    function tile(icon, on, fn, extra, c2) {
      var t = h("button", { type: "button", class: "ep-cc-tile " + (extra || "") + (on ? " on" : "") }, svg(I[icon]));
      tap(t, function () { fn(); renderCC(); });
      return t;
    }
    var bright = h("div", { class: "ep-cc-slider h2" }, [h("i", { style: "height:" + (P.bright || 100) + "%" }), svg(I.sun)]);
    bright.style.gridRow = "span 2";
    bright.onpointerdown = bright.onpointermove = function (e) {
      if (e.type === "pointermove" && !e.buttons && e.pointerType === "mouse") return;
      var r = bright.getBoundingClientRect(); var v = Math.round(100 - (e.clientY - r.top) / r.height * 100);
      P.bright = Math.max(20, Math.min(100, v)); bright.firstChild.style.height = P.bright + "%"; applyTheme(); saveLocal();
    };
    var music = h("div", { class: "ep-cc-tile label w2" }, [svg(I.note), h("span", null, [S.music ? "Memutar" : "Musik", h("small", { text: S.music ? S.music : "Tidak ada" })])]);
    tap(music, function () { closeCC(); openApp("music"); });
    add(ccEl, [
      tile("plane", P.air, function () { setPref("air", P.air ? 0 : 1); paintStatus(); }, "or"),
      tile("wifi", !P.air, function () { toast(P.air ? "Mode pesawat aktif" : "Terhubung ke EAGLE-NET"); }, "bl"),
      tile("moon", P.dnd, function () { setPref("dnd", P.dnd ? 0 : 1); paintStatus(); toast(P.dnd ? "Jangan Ganggu aktif" : "Jangan Ganggu mati"); }, "pu"),
      tile(P.sil ? "bellOff" : "bell", P.sil, function () { setPref("sil", P.sil ? 0 : 1); toast(P.sil ? "Mode senyap" : "Nada dering aktif"); }, "or"),
      music,
      bright,
      tile("torch", S.torch, function () { S.torch = !S.torch; send("torch", S.torch ? 1 : 0); }),
      tile("calc", false, function () { closeCC(); openApp("calculator"); }),
      tile("cam", false, function () { closeCC(); openApp("camera"); }),
      tile("clock", false, function () { closeCC(); openApp("clock"); }),
      tile("lock", false, function () { closeCC(); send("close"); })
    ]);
  }
  function openCC() { renderCC(); ccEl.classList.add("on"); E.touch(); }
  function closeCC() { ccEl.classList.remove("on"); }
  tap(ccEl, function (e) { if (e.target === ccEl) closeCC(); });
  tap(ncEl, function (e) { if (e.target === ncEl) closeNC(); });

  /* ------------------------------------------------------------------ */
  /* Panggilan                                                           */
  /* ------------------------------------------------------------------ */
  var callTimerEl = null;
  function paintCallTimer() { if (callTimerEl && S.call && S.call.st === "active") callTimerEl.textContent = dur(serverNow() - S.call.t0); paintIsland(); }
  function renderCall() {
    clear(callEl); callTimerEl = null;
    var c = S.call; if (!c) return;
    var nm = nameOf(c.name || c.num || "Tidak dikenal");
    var st = c.st === "in" ? "panggilan masuk…" : c.st === "out" ? "memanggil…" : c.st === "active" ? "" : (c.msg || "panggilan berakhir");
    var stEl = h("div", { class: "cl-st", text: st });
    if (c.st === "active") { callTimerEl = stEl; stEl.textContent = dur(serverNow() - c.t0); }
    var av = avatar(c.name || c.num, c.pic || null, "xl" + (c.st === "in" ? " cl-ring" : ""));
    var parts = [stEl, h("div", { class: "cl-n", text: nm }), av];
    if (c.st === "active" || c.st === "out") {
      var mute = c.mute, spk = c.spk;
      function key(icon, label, on, fn) { var b = tap(h("button", { type: "button", class: on ? "on" : "" }, svg(I[icon])), fn); return h("div", { class: "cl-k" }, [b, h("span", { text: label })]); }
      parts.push(h("div", { class: "cl-grid" }, [
        key(mute ? "micOff" : "mic", "bisu", mute, function () { c.mute = !c.mute; send("call_mute", c.mute ? 1 : 0); renderCall(); }),
        key("keypad", "papan", false, function () { toast("Papan tombol"); }),
        key("speaker", "speaker", spk, function () { c.spk = !c.spk; renderCall(); }),
        key("plus", "tambah", false, function () { toast("Tidak tersedia", 1); }),
        key("users", "kontak", false, function () { showCall(false); openApp("contacts"); }),
        key("msg", "pesan", false, function () { showCall(false); openApp("messages", c.num); })
      ]));
      parts.push(h("div", { class: "cl-acts single" }, h("div", { class: "cl-btn" }, [tap(h("button", { type: "button", class: "red" }, svg(I.phoneF)), function () { send("hangup"); }), h("span", { text: "Akhiri" })])));
    } else if (c.st === "in") {
      parts.push(h("div", { style: "margin-top:auto" }));
      parts.push(h("div", { class: "cl-acts" }, [
        h("div", { class: "cl-btn" }, [tap(h("button", { type: "button", class: "red" }, svg(I.phoneF)), function () { send("decline"); }), h("span", { text: "Tolak" })]),
        h("div", { class: "cl-btn" }, [tap(h("button", { type: "button", class: "green" }, svg(I.phoneF)), function () { send("accept"); }), h("span", { text: "Terima" })])
      ]));
    } else {
      parts.push(h("div", { style: "margin-top:auto" }));
    }
    add(callEl, parts);
  }
  function showCall(on) { cls(callEl, "on", !!on); paintStatus(); E.touch(); }
  function onCall(d) {
    var st = d.st;
    if (st === "end" || st === "busy" || st === "off" || st === "declined") {
      SFX.ring(false); SFX.dial(false);
      if (S.call) { S.call.st = "end"; S.call.msg = d.msg || (st === "busy" ? "sedang sibuk" : st === "off" ? "tidak aktif" : st === "declined" ? "ditolak" : "panggilan berakhir"); renderCall(); }
      hideMini();
      setTimeout(function () { S.call = null; showCall(false); paintIsland(); renderCall(); }, 1400);
      paintIsland();
      return;
    }
    S.call = S.call && S.call.num === d.num ? S.call : {};
    S.call.st = st; S.call.name = d.name || ""; S.call.num = d.num || ""; S.call.pic = d.pic || null;
    if (st === "active") { S.call.t0 = serverNow() - (+d.dur || 0); SFX.ring(false); SFX.dial(false); hideMini(); }
    if (st === "in") { if (!+d.cr) SFX.ring(true); if (!S.open) showMini("call"); }
    if (st === "out") SFX.dial(true);
    renderCall();
    if (S.open) showCall(true);
    paintIsland();
  }

  /* ------------------------------------------------------------------ */
  /* Buka / tutup HP                                                     */
  /* ------------------------------------------------------------------ */
  var goneTimer = null;
  // langkah tampilan yang gagal tidak boleh membuat HP tidak muncul sama sekali
  function safe(tag, fn) {
    try { fn(); } catch (e) { if (E.report) E.report("phone", tag + " " + (e && e.stack || e)); else E.log("phone " + tag + ": " + e); }
  }
  function showPhone(d) {
    var firstOpen = !S.open;
    // data perangkat
    if (d.now) offset = +d.now - Date.now() / 1000;
    if (d.tzo != null) tzo = +d.tzo;
    var prevCid = S.dev.cid;
    S.dev = d;
    S.dev.cid = +d.cid || 0;
    if (S.dev.cid !== prevCid) loadLocal();
    ["wp", "th", "sz", "air", "dnd", "sil", "pc", "faceid"].forEach(function (k) { if (d[k] != null) P[k] = (k === "th") ? String(d[k]) : +d[k]; });
    if (d.wpurl != null) P.wpurl = String(d.wpurl);
    if (d.home) { try { var hm = JSON.parse(dec(d.home)); if (Array.isArray(hm)) P.home = hm; } catch (e) {} }
    if (d.hidden != null) P.hidden = String(dec(d.hidden)).split(",").filter(function (x) { return x; });
    saveLocal();
    if (d.badges) for (var k in d.badges) if (d.badges.hasOwnProperty(k)) S.badges[k] = +d.badges[k] || 0;
    safe("theme", applyTheme);
    S.open = true;
    clearTimeout(goneTimer);
    // HP baru dibuka: server sudah menutup dialog SA-MP, jadi status dialog lama tidak boleh menyembunyikan HP
    if (firstOpen) document.body.classList.remove("dlg-open");
    root.classList.remove("ep-gone"); root.getBoundingClientRect();
    safe("status", function () { paintStatus(); paintIsland(); });
    if (firstOpen) {
      var resume = S.lastApp && (Date.now() - S.lastClose < 90000) && !P.pc;
      if (!resume) safe("lock", function () { S.unlocked = false; renderLock(); lockEl.classList.remove("gone"); homeEl.classList.add("locked"); S.cur = null; appWrap.classList.remove("open"); homeEl.classList.remove("behind"); });
      safe("home", renderHome);
      requestAnimationFrame(function () { root.classList.add("on"); });
      // cadangan bila requestAnimationFrame tertahan (WebView sibuk)
      setTimeout(function () { if (S.open) root.classList.add("on"); }, 120);
      if (S.pendingNotif) { var n = S.pendingNotif; S.pendingNotif = null; setTimeout(function () { openNotif(n); }, 380); }
      else if (!resume && P.faceid && !S.call) setTimeout(function () { if (S.open && !S.unlocked) unlock(); }, 620);
      if (d.app && APP[d.app]) { var a = d.app, arg = d.arg || null; unlock(function () { openApp(a, arg); }); }
    } else {
      root.classList.add("on");
    }
    if (S.call) safe("call", function () { renderCall(); showCall(true); hideMini(); });
    setTimeout(E.touch, 460);
    // beri tahu server bahwa layar HP benar-benar tampil (cek di PH_CheckShown)
    setTimeout(function () {
      if (!S.open) return;
      var r = root.getBoundingClientRect(), cs = window.getComputedStyle(root);
      var vis = r.width > 20 && r.height > 20 && cs.visibility !== "hidden" && cs.display !== "none" && !document.body.classList.contains("dlg-open");
      if (vis) send("shown", 1);
      else if (E.report) E.report("phone", "HP dibuka tapi tidak terlihat w=" + Math.round(r.width) + " h=" + Math.round(r.height) + " vis=" + cs.visibility + " dlg=" + document.body.classList.contains("dlg-open"));
    }, 700);
  }
  function hidePhone() {
    if (!S.open) return;
    S.open = false;
    S.lastClose = Date.now();
    if (S.cur && S.cur.def && S.cur.def.onClose) { try { S.cur.def.onClose(S.cur); } catch (e) {} }
    root.classList.remove("on");
    closeOverlays(); closeNC(); closeCC(); closeSpot(); hideBanner();
    if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur();
    clearTimeout(goneTimer);
    goneTimer = setTimeout(function () { if (!S.open) { root.classList.add("ep-gone"); E.touch(); } }, 460);
    if (S.call && S.call.st === "in") showMini("call");
    E.touch();
  }
  tap(side, function () { send("close"); });

  /* ------------------------------------------------------------------ */
  /* Gestur                                                              */
  /* ------------------------------------------------------------------ */
  (function gestures() {
    var g = null;
    screen.addEventListener("pointerdown", function (e) {
      var r = screen.getBoundingClientRect();
      g = { x: e.clientX, y: e.clientY, rx: (e.clientX - r.left) / r.width, ry: (e.clientY - r.top) / r.height, t: Date.now(), target: e.target };
    }, true);
    screen.addEventListener("pointerup", function (e) {
      if (!g) return;
      var dx = e.clientX - g.x, dy = e.clientY - g.y, r = screen.getBoundingClientRect();
      var fast = Date.now() - g.t < 700, s = g; g = null;
      if (!fast) return;
      // dari atas ke bawah
      if (s.ry < 0.08 && dy > r.height * 0.08) { if (s.rx > 0.55) openCC(); else openNC(); return; }
      // lock screen: geser ke atas
      if (!S.unlocked && dy < -r.height * 0.1 && Math.abs(dy) > Math.abs(dx)) { unlock(); return; }
      // bawah ke atas = home
      if (S.unlocked && s.ry > 0.9 && dy < -r.height * 0.06) {
        if (ncEl.classList.contains("on")) closeNC(); else if (ccEl.classList.contains("on")) closeCC(); else if (S.cur) goHome();
        return;
      }
      // tutup NC/CC dengan geser ke atas
      if ((ncEl.classList.contains("on") || ccEl.classList.contains("on")) && dy < -r.height * 0.08) { closeNC(); closeCC(); return; }
      // kembali: geser dari tepi kiri
      if (S.cur && s.rx < 0.07 && dx > r.width * 0.22 && Math.abs(dy) < r.height * 0.1) { popView(); return; }
    }, true);
    tap(homeBar, function () {
      if (callEl.classList.contains("on") && S.call && S.call.st !== "in") { showCall(false); return; }
      if (ncEl.classList.contains("on") || ccEl.classList.contains("on")) { closeNC(); closeCC(); return; }
      if (S.edit) { S.edit = false; S.pick = null; renderHome(); return; }
      if (S.cur) goHome(); else if (S.unlocked) { if (S.page) { S.page = 0; renderHome(); } else send("close"); }
    });
    hold(homeBar, function () { send("close"); });
    tap(statusBar.querySelector(".sb-r"), function () { if (S.unlocked) openCC(); });
    tap(sbLeft, function () { openNC(); });
  })();

  /* ------------------------------------------------------------------ */
  /* Event dari server                                                   */
  /* ------------------------------------------------------------------ */
  function onPhoneEvent(d) {
    switch (d.t) {
      case "show": showPhone(d); break;
      case "hide": hidePhone(); break;
      case "unlocked": afterUnlock = afterUnlock || null; doUnlocked(); break;
      case "badfail": passFail(); break;
      case "notif": pushNotif(d); break;
      case "badge": setBadge(d.app, d.n); break;
      case "badges": for (var k in d) if (d.hasOwnProperty(k) && k !== "t") setBadge(k, d[k]); break;
      case "toast": toast(d.m || "", +d.err === 1 || d.ok === 0); break;
      case "call": onCall(d); break;
      case "sync":
        if (d.cash != null) S.dev.cash = +d.cash;
        if (d.bank != null) S.dev.bank = +d.bank;
        if (d.music != null) { S.music = dec(d.music); paintIsland(); }
        break;
      case "open": // server meminta aplikasi dibuka (mis. X/O dimulai)
        if (d.app && APP[d.app]) { var oa = d.app, og = d.arg || null; if (S.unlocked) openApp(oa, og); else unlock(function () { openApp(oa, og); }); }
        break;
      case "set": // pengaturan dari server
        for (var s in d) if (d.hasOwnProperty(s) && s !== "t" && P.hasOwnProperty(s)) P[s] = d[s];
        saveLocal(); applyTheme(); paintStatus(); break;
      case "data":
        var appId = KEYMAP[d.app] || d.app;
        var c = makeCtx(appId);
        c.cache[d.app] = d;
        if (DEFS[appId] && DEFS[appId].data) { try { DEFS[appId].data(c, d); } catch (e) { E.log("phone data " + d.app + ": " + (e.stack || e)); } }
        else if (S.cur === c) refreshTop(c);
        // aplikasi lain yang memakai data ini (mis. Telepon memakai kontak)
        if (S.cur && S.cur !== c && S.cur.def && S.cur.def.uses && S.cur.def.uses.indexOf(d.app) >= 0) refreshTop(S.cur);
        break;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Foto asli: kamera game & galeri HP (client Android: CefMedia.kt)    */
  /*   CefBridge.captureGame(json) -> PixelCopy layar game -> upload     */
  /*   CefBridge.pickImage(json)   -> pilih foto galeri HP -> upload     */
  /*   hasil: event "media" {id, ok, url, err}                           */
  /* ------------------------------------------------------------------ */
  var MEDIA = { seq: 0, cbs: {} };
  function bridgeHas(fn) { return !!(window.CefBridge && typeof window.CefBridge[fn] === "function"); }
  function mediaCall(fn, cb) {
    var id = "m" + Date.now().toString(36) + (++MEDIA.seq);
    MEDIA.cbs[id] = cb;
    try { window.CefBridge[fn](JSON.stringify({ id: id, up: S.dev.up || "catbox", max: 1280, q: 82 })); }
    catch (e) { delete MEDIA.cbs[id]; cb({ ok: 0, err: "Fitur foto belum ada di aplikasi game ini" }); return; }
    setTimeout(function () { if (MEDIA.cbs[id]) { delete MEDIA.cbs[id]; cb({ ok: 0, err: "Upload terlalu lama, coba lagi" }); } }, 60000);
  }
  E.on("media", function (d) {
    var cb = d && MEDIA.cbs[d.id]; if (!cb) return;
    delete MEDIA.cbs[d.id];
    cb(d);
  });
  var Media = {
    canCapture: function () { return bridgeHas("captureGame"); },
    canPick: function () { return bridgeHas("pickImage"); },
    capture: function (cb) { mediaCall("captureGame", cb); },
    pick: function (cb) { mediaCall("pickImage", cb); }
  };

  /* ------------------------------------------------------------------ */
  /* API untuk file aplikasi                                             */
  /* ------------------------------------------------------------------ */
  window.EPhone = {
    app: register, ui: UI, APP: APP, APPS: APPS, I: I, send: send, sendJ: sendJ,
    state: S, prefs: P, setPref: setPref, open: openApp, home: goHome, applyTheme: applyTheme, layout: layout,
    renderHome: renderHome, showPass: showPass, sfx: SFX, ctx: makeCtx, installed: installed, media: Media,
    get cur() { return S.cur; }
  };

  // mode pratinjau (browser PC): tampilkan HP jika ?phone=1
  if (/[?&]phone=1/.test(location.search)) setTimeout(function () { showPhone({ t: "show", cid: 1, num: "081234567890", name: "Althaf_Abraham", now: Math.floor(Date.now() / 1000), tzo: 25200 }); }, 300);

  /* Modul siap: proses event yang tertunda, lalu tandai selesai dimuat. */
  PH.ready = true;
  var pendingPhone = PH.q.splice(0, PH.q.length);
  for (var pq = 0; pq < pendingPhone.length; pq++) {
    try { phoneGot(pendingPhone[pq], 1); onPhoneEvent(pendingPhone[pq]); }
    catch (e) { if (E.report) E.report("phone", "event tertunda " + (e && e.stack || e)); }
  }
  if (E.done) E.done("phone_core");
})();
