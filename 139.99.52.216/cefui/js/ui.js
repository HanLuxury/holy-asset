/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : ui.js
   Pembantu DOM, format teks SA-MP, ikon, dan PANEL GENERIK.
   Panel generik dipakai banyak sistem (garasi, toko, ATM, gov, dll):
     server kirim event "panel" {id, show, title, body:[blok], btns:[..]}
     klik -> EAGLE.send(id, aksi, index, teks)
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE;

  /* ------------------------ DOM ------------------------ */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k === "style") el.setAttribute("style", v);
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
    });
    return el;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function layer(id) {
    var el = document.getElementById(id);
    if (!el) { el = h("div", { id: id, class: "layer" }); document.getElementById("app").appendChild(el); }
    return el;
  }

  /* ------------------------ teks ------------------------ */
  var GT = { r: "#ff5a5a", g: "#4ade80", b: "#5b9bff", y: "#ffd24d", p: "#c58cff", w: "#ffffff", l: "#1a1a1a", o: "#ffa94d" };
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // {RRGGBB} warna, ~r~ ~g~ dll, ~n~ baris baru, _ jadi spasi (gaya textdraw)
  function fmt(s) {
    var t = esc(s);
    var open = 0;
    t = t.replace(/\{([0-9A-Fa-f]{6})\}/g, function (_, c) { open++; return '<span style="color:#' + c + '">'; });
    t = t.replace(/~n~/gi, "<br>");
    t = t.replace(/~([rgbyplwoh])~/gi, function (_, c) {
      c = c.toLowerCase();
      if (c === "h") return "";
      open++; return '<span style="color:' + (GT[c] || "#fff") + '">';
    });
    t = t.replace(/~[a-z]~/gi, "");
    for (var i = 0; i < open; i++) t += "</span>";
    return t;
  }
  function plain(s) { return String(s == null ? "" : s).replace(/\{[0-9A-Fa-f]{6}\}/g, "").replace(/~n~/gi, " ").replace(/~[a-z]~/gi, ""); }
  function money(n) {
    n = Math.round(+n || 0);
    var neg = n < 0; n = Math.abs(n);
    return (neg ? "-$" : "$") + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ------------------------ gambar model ------------------------ */
  // "skin:ID" / "veh:ID" -> gambar resmi open.mp, selain itu URL apa adanya.
  function imgUrl(src) {
    if (!src) return "";
    src = String(src);
    var m;
    if ((m = /^skin:(\d+)$/.exec(src))) return "https://assets.open.mp/assets/images/skins/" + m[1] + ".png";
    if ((m = /^veh:(\d+)$/.exec(src))) return "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_" + m[1] + ".jpg";
    if (/^(https?:|data:|\.\/|img\/)/.test(src)) return src;
    return "";
  }
  function img(src, cls) {
    var u = imgUrl(src);
    if (!u) return null;
    var el = h("img", { class: cls || "", src: u, draggable: "false", alt: "" });
    el.onerror = function () { el.style.visibility = "hidden"; };
    return el;
  }

  /* ------------------------ ikon ------------------------ */
  var P = {
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.4 8.3-7 10-3.6-1.7-7-5-7-10V6z"/>',
    food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5v5h3v8"/>',
    drink: '<path d="M7 4h10l-1.2 15a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8zM6.5 9h11"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.5A3 3 0 0 0 9 18v2M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.5A3 3 0 0 1 15 18v2M12 4v16"/>',
    cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    bank: '<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.8 3 2.6 3.5 5.2"/>',
    car: '<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7 19v2M17 19v2"/><circle cx="7.5" cy="16.5" r=".5"/><circle cx="16.5" cy="16.5" r=".5"/>',
    fuel: '<path d="M4 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M3 20h12M5 9h8M14 8l3 2v7a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
    engine: '<path d="M4 10h3l2-2h5v2h3l2 2v5h-2v2H9l-2-2H4zM1 12v3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    light: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.6 1.5 2.6V17h4v-.5c0-1 .7-2 1.5-2.6A6 6 0 0 0 12 3z"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
    box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"/>',
    pin: '<path d="M12 21s-6-5.4-6-11a6 6 0 0 1 12 0c0 5.6-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    radio: '<rect x="4" y="9" width="16" height="12" rx="2"/><path d="M8 9l9-5M8 15h2M14 13v4"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.2"/>',
    warn: '<path d="M12 3.5l9.5 16.5h-19zM12 10v4.5M12 17.2v.2"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>',
    err: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5V4a1.5 1.5 0 0 1 3 0v7m0-5.5a1.5 1.5 0 0 1 3 0V12m0-3.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.9-2.5L4 14.5a1.6 1.6 0 0 1 2.5-2z"/>',
    home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2 2M15 8l2 2"/>',
    wrench: '<path d="M14.5 5.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z"/>',
    ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.6-1.5 1.7-2.3 3-2.3s2.4.8 3 2.3M14 10h4M14 13.5h4"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    game: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7 10.5v3M5.5 12h3M15.5 11h.01M18 13h.01"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
    cam: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8.5 7l1.5-2.5h4L15.5 7"/>',
    run: '<circle cx="14" cy="4.5" r="2"/><path d="M8 21l3-6 3 3v3M6 12l3-3 4 1 2 3 3 1M11 15l-1-5"/>',
    shirt: '<path d="M8 3l-5 3 2 4 3-1.5V21h8V8.5l3 1.5 2-4-5-3a4 4 0 0 1-8 0z"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM7.5 7.5h.01"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    power: '<path d="M12 3v8M6.4 6.4a8 8 0 1 0 11.2 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>',
    battery: '<rect x="2.5" y="7.5" width="17" height="9" rx="2"/><path d="M21.5 11v2M5 10h9v4H5z"/>',
    plane: '<path d="M10.5 21l1.5-1 1.5 1v-4l6.5-2v-2l-6.5-1V5.5a1.5 1.5 0 0 0-3 0V12L4 13v2l6.5 2z"/>',
    ship: '<path d="M3 17l2 3h14l2-3M5 17V11h14v6M8 11V7h8v4M11 4h2v3"/>',
    door: '<path d="M5 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M13.5 12.5h.01"/>',
    male: '<circle cx="10" cy="14" r="5"/><path d="M14 10l6-6M15 4h5v5"/>',
    female: '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
    gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-2-3-6-3-6-1s4 1 6 1c2 0 6 1 6-1s-4-2-6 1"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    bag: '<path d="M6 8h12l1 13H5zM9 8V6a3 3 0 0 1 6 0v2"/>',
    down: '<path d="M12 4v14M6 12l6 6 6-6"/>',
    up: '<path d="M12 20V6M6 12l6-6 6 6"/>',
    map: '<path d="M9 4L3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',
    cart: '<path d="M3 4h2.5l2.2 11h10.6L20.5 7H7M9 20h.01M17 20h.01"/>',
    bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    wallet: '<path d="M4 7h15a1 1 0 0 1 1 1v11H5a1 1 0 0 1-1-1zM4 7V6a2 2 0 0 1 2-2h11v3M16 13h.01"/>',
    bird: '<path d="M22 6c-.8.4-1.6.6-2.4.7A4.2 4.2 0 0 0 21.4 4a8.4 8.4 0 0 1-2.6 1A4.2 4.2 0 0 0 11.6 8.8 11.9 11.9 0 0 1 3 4.5s-4 9 5 13a13 13 0 0 1-7 2c9 5 20 0 20-11.5 0-.3 0-.6-.1-.9A6 6 0 0 0 22 6z"/>',
    mega: '<path d="M3 10v4h3l6 4V6L6 10zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>',
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
    leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15zM5 19l8-8"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    store: '<path d="M4 9l1.5-5h13L20 9M4 9h16v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-4 2.8M5 12.5V20h14v-7.5M10 20v-5h4v5"/>',
    fish: '<path d="M3 12s3.5-5 9.5-5c4 0 6.5 2.5 8 5-1.5 2.5-4 5-8 5C6.5 17 3 12 3 12zM3 12l-1-3M3 12l-1 3M16 11h.01"/>',
    fire: '<path d="M12 21a6.5 6.5 0 0 1-6.5-6.5c0-3.5 3-6 4-9.5 2 1.5 3 3.5 3 5 1-1 1.5-2 1.5-3.5 2.5 2 4.5 5 4.5 8A6.5 6.5 0 0 1 12 21z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    vol: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.7-4.3L4 8M4 4v4h4M4 13a8 8 0 0 0 14.7 4.3L20 16M20 20v-4h-4"/>',
    drone: '<circle cx="5.5" cy="5.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/><path d="M7.3 7.3L9 9M16.7 7.3L15 9M7.3 16.7L9 15M16.7 16.7L15 15"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    sword: '<path d="M14.5 4H20v5.5L9 20.5 3.5 15zM6 12.5l5.5 5.5M4 20l2.5-2.5"/>',
    medic: '<rect x="3.5" y="6.5" width="17" height="13" rx="2"/><path d="M9 6.5V4.5h6v2M12 10v6M9 13h6"/>',
    badge: '<path d="M12 3l7 3v5c0 5-3.4 8.3-7 10-3.6-1.7-7-5-7-10V6z"/><path d="M12 8l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/>',
    anim: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M12 14l-4 6.5M12 14l4 6.5M5 9.5l7-2 7 2"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'
  };
  function icon(name, cls) {
    var p = P[name] || P.info;
    return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
  function iconEl(name, cls) { var s = h("span", { class: "ico", html: icon(name, cls) }); return s; }
  // Ikon bisa berupa nama ikon SVG atau emoji
  function glyph(v) {
    if (!v) return null;
    if (P[v]) return iconEl(v);
    return h("span", { class: "emo", text: v });
  }

  /* ------------------------ ikon item (emoji) ------------------------ */
  var ITEM_KW = [
    [/magazine|magasin/i, "\u{1F4A5}"], [/desert eagle/i, "\u{1F52B}"], [/kevlar/i, "\u{1F9BA}"], [/alprazolam/i, "\u{1F48A}"],
    [/earphone|headset/i, "\u{1F3A7}"], [/kta\b/i, "\u{1FAAA}"], [/uranium/i, "\u2622"], [/senter|flashlight/i, "\u{1F526}"],
    [/petasan|firework/i, "\u{1F9E8}"], [/korek/i, "\u{1F525}"], [/kaca\b|glass/i, "\u{1FA9F}"], [/karet|rubber/i, "\u{1F9E4}"],
    [/plastik/i, "\u{1F6CD}"], [/material/i, "\u{1F9F1}"], [/component/i, "\u2699"], [/tanduk/i, "\u{1F9B4}"],
    [/kulit|leather/i, "\u{1F45C}"], [/bulu|feather/i, "\u{1FAB6}"], [/benang|thread/i, "\u{1F9F5}"], [/petrol|pure oil/i, "\u26FD"],
    [/cabe|cabai|chili|sambal/i, "\u{1F336}"], [/tebu/i, "\u{1F38B}"], [/gula|garam/i, "\u{1F9C2}"], [/beras/i, "\u{1F35A}"],
    [/tahu/i, "\u{1F362}"], [/kebab/i, "\u{1F959}"], [/bubur/i, "\u{1F963}"], [/bakso/i, "\u{1F35C}"], [/matcha|choco/i, "\u{1F375}"],
    [/pecel/i, "\u{1F957}"], [/chip\b/i, "\u{1F4BE}"], [/hacking/i, "\u{1F4BE}"], [/hiu|shark/i, "\u{1F988}"], [/penyu|turtle/i, "\u{1F422}"],
    [/tools? ?kit|repair ?kit/i, "\u{1F9F0}"], [/boxmats/i, "\u{1F4E6}"],
    [/burger|hamburger/i, "\u{1F354}"], [/pizza/i, "\u{1F355}"], [/hot ?dog/i, "\u{1F32D}"], [/roti|bread|sandwich/i, "\u{1F35E}"],
    [/nasi|rice/i, "\u{1F35A}"], [/mie|noodle|indomie/i, "\u{1F35C}"], [/ayam|chicken/i, "\u{1F357}"], [/daging|meat|steak/i, "\u{1F969}"],
    [/ikan|fish/i, "\u{1F41F}"], [/telur|egg/i, "\u{1F95A}"], [/susu|milk/i, "\u{1F95B}"], [/kopi|coffee/i, "\u2615"],
    [/bir|beer|wine|anggur|vodka|whisk/i, "\u{1F37A}"], [/air|water|aqua|mineral/i, "\u{1F4A7}"],
    [/jus|juice|sprunk|cola|soda|minum|drink|teh|tea/i, "\u{1F964}"], [/snack|chiki|keripik|chips/i, "\u{1F35F}"],
    [/rokok|cigar|cerutu/i, "\u{1F6AC}"], [/vape/i, "\u{1F4A8}"], [/medkit|obat|pil|perban|bandage|p3k|first aid/i, "\u{1F48A}"],
    [/phone|hp|ponsel|handphone/i, "\u{1F4F1}"], [/radio|walkie/i, "\u{1F4FB}"], [/boombox|speaker/i, "\u{1F4FB}"],
    [/uang|money|cash|dollar/i, "\u{1F4B5}"], [/kartu|card|atm/i, "\u{1F4B3}"], [/tiket|ticket|voucher/i, "\u{1F3AB}"],
    [/ktp|sim|lisensi|license|identitas/i, "\u{1FAAA}"], [/kunci|key/i, "\u{1F511}"],
    [/pisau|knife|machete|golok/i, "\u{1F52A}"], [/bat|pemukul|stick/i, "\u{1F3CF}"],
    [/pistol|deagle|glock|colt|rifle|ak-?47|m4|shotgun|uzi|mp5|sniper|senjata|weapon|gun|tec/i, "\u{1F52B}"],
    [/peluru|ammo|amunisi/i, "\u{1F4A5}"], [/rompi|armou?r|vest/i, "\u{1F9BA}"],
    [/pancing|rod|umpan|bait/i, "\u{1F3A3}"], [/kayu|wood|log|papan/i, "\u{1FAB5}"], [/batu|stone|rock|ore|bijih/i, "\u{1FAA8}"],
    [/emas|gold/i, "\u{1F947}"], [/berlian|diamond/i, "\u{1F48E}"], [/besi|iron|baja|steel|logam|metal/i, "\u{1F529}"],
    [/tembaga|copper|aluminium|alum/i, "\u{1F7EB}"], [/minyak|oil|bensin|fuel|jerigen|gas/i, "\u26FD"],
    [/ganja|weed|kanabis|marijuana|cannabis/i, "\u{1F33F}"], [/bibit|seed|benih/i, "\u{1F331}"], [/sawit|palm/i, "\u{1F334}"],
    [/padi|gandum|wheat/i, "\u{1F33E}"], [/sabu|meth|narkoba|drug|kokain|cocaine/i, "\u{1F489}"],
    [/kain|pakaian|baju|kaos|cloth|shirt/i, "\u{1F455}"], [/topi|hat|helm/i, "\u{1F9E2}"], [/tas|bag|backpack/i, "\u{1F392}"],
    [/sampah|trash|rongsok/i, "\u{1F5D1}"], [/ban|tire|wheel/i, "\u{1F6DE}"], [/part|mesin|engine|komponen|sparepart|repair/i, "\u2699"],
    [/palu|hammer|obeng|kunci inggris|wrench|toolkit|tool/i, "\u{1F527}"], [/kapak|axe/i, "\u{1FA93}"], [/gergaji|saw/i, "\u{1FA9A}"],
    [/lockpick|linggis|crowbar/i, "\u{1F6E0}"], [/kamera|camera/i, "\u{1F4F7}"], [/tali|rope/i, "\u{1FAA2}"],
    [/paket|package|kotak|box|crate/i, "\u{1F4E6}"], [/bunga|flower|mawar/i, "\u{1F339}"], [/buah|apel|apple|jeruk|orange/i, "\u{1F34E}"],
    [/sayur|vegetable|wortel|carrot/i, "\u{1F955}"], [/kalung|necklace|cincin|ring|jam|watch|perhiasan/i, "\u{1F48D}"],
    [/masker|mask/i, "\u{1F637}"], [/koin|coin/i, "\u{1FA99}"], [/bola|ball/i, "\u26BD"], [/buku|book|kertas|paper|surat|dokumen/i, "\u{1F4C4}"],
    [/drone/i, "\u{1F6F8}"], [/parasut|parachute/i, "\u{1FA82}"], [/pilox|spray|cat/i, "\u{1F3A8}"]
  ];
  function itemIcon(name, model) {
    var n = plain(name || "");
    for (var i = 0; i < ITEM_KW.length; i++) if (ITEM_KW[i][0].test(n)) return ITEM_KW[i][1];
    model = +model || 0;
    if (model >= 321 && model <= 372) return "\u{1F52B}";
    if (model >= 18865 && model <= 18874) return "\u{1F4F1}";
    if (model === 1212) return "\u{1F4B5}";
    return "\u{1F4E6}";
  }

  /* ------------------------ tombol ------------------------ */
  function button(b, onClick) {
    var cls = "btn" + (b.c ? " btn-" + b.c : "") + (b.dis ? " dis" : "") + (b.sm ? " sm" : "");
    var el = h("button", { class: cls, type: "button" }, [b.icon ? glyph(b.icon) : null, b.t ? h("span", { html: fmt(b.t) }) : null]);
    if (!b.dis) el.addEventListener("click", function (ev) { ev.stopPropagation(); onClick(b); });
    return el;
  }

  /* ------------------------ PANEL GENERIK ------------------------ */
  var panels = {};
  function block(p, b, idx) {
    var send = function (a, i, s) { E.send(p.id, a, i, s); };
    switch (b.k) {
      case "txt":
        return h("div", { class: "b-txt " + (b.c || ""), html: fmt(b.t) });
      case "kv":
        return h("div", { class: "b-kv" }, (b.r || []).map(function (r) {
          return h("div", { class: "kv-row" }, [h("span", { class: "kv-k", html: fmt(r[0]) }), h("span", { class: "kv-v", html: fmt(r[1]) })]);
        }));
      case "tiles":
        return h("div", { class: "b-tiles" }, (b.it || []).map(function (t) {
          return h("div", { class: "tile" + (t.c ? " c-" + t.c : "") }, [t.icon ? glyph(t.icon) : null,
            h("div", { class: "tile-v", html: fmt(t.v) }), h("div", { class: "tile-t", html: fmt(t.t) })]);
        }));
      case "bar":
        var v = Math.max(0, Math.min(100, +b.v || 0));
        return h("div", { class: "b-bar" }, [
          b.t ? h("div", { class: "bar-t" }, [h("span", { html: fmt(b.t) }), h("b", { text: b.vt != null ? b.vt : Math.round(v) + "%" })]) : null,
          h("div", { class: "bar" }, h("i", { class: b.c ? "c-" + b.c : "", style: "width:" + v + "%" }))]);
      case "list":
      case "grid":
        var box = h("div", { class: "b-" + b.k + (b.cols ? " cols-" + b.cols : ""), style: b.hmax ? "max-height:" + b.hmax + "rem" : null });
        (b.it || []).forEach(function (it, i) {
          var cell = h("div", { class: "it" + (i === b.sel ? " sel" : "") + (it.dis ? " dis" : "") + (it.c ? " c-" + it.c : "") }, [
            it.img ? h("div", { class: "it-img" }, img(it.img)) : (it.icon ? h("div", { class: "it-ic" }, glyph(it.icon)) : null),
            h("div", { class: "it-body" }, [h("div", { class: "it-t", html: fmt(it.t) }), it.s ? h("div", { class: "it-s", html: fmt(it.s) }) : null]),
            it.r ? h("div", { class: "it-r", html: fmt(it.r) }) : null,
            it.q != null ? h("div", { class: "it-q", text: it.q }) : null,
            it.b ? h("div", { class: "it-badge", html: fmt(it.b) }) : null
          ]);
          if (!it.dis) cell.addEventListener("click", function () {
            if (b.pick !== 0) {
              box.querySelectorAll(".it.sel").forEach(function (x) { x.classList.remove("sel"); });
              cell.classList.add("sel");
            }
            send(b.a || "sel", i, b.id || "");
          });
          box.appendChild(cell);
        });
        if (!(b.it || []).length) box.appendChild(h("div", { class: "empty", html: fmt(b.empty || "Kosong") }));
        return box;
      case "nav":
        return h("div", { class: "b-nav" }, [
          button({ icon: "back", c: "g", sm: 1 }, function () { send("prev", -1); }),
          h("span", { html: fmt(b.t || "") }),
          button({ icon: "next", c: "g", sm: 1 }, function () { send("next", -1); })]);
      case "step":
        return h("div", { class: "b-step" }, (b.it || []).map(function (st, i) {
          return h("div", { class: "st-row" }, [
            button({ icon: "back", c: "g", sm: 1 }, function () { send("prev", i); }),
            h("div", { class: "st-mid" }, [st.icon ? glyph(st.icon) : null, h("span", { class: "st-t", html: fmt(st.t || "") }), h("b", { class: "st-v", html: fmt(st.v || "") })]),
            button({ icon: "next", c: "g", sm: 1 }, function () { send("next", i); })
          ]);
        }));
      case "btns":
        return h("div", { class: "b-btns" + (b.col ? " col" : "") }, (b.b || []).map(function (x) {
          return button(x, function () { send(x.id, x.i != null ? x.i : -1); });
        }));
      case "img":
        return h("div", { class: "b-img", style: b.hgt ? "height:" + b.hgt + "rem" : null }, img(b.src));
      case "sep":
        return h("div", { class: "b-sep" });
      case "card":
        return h("div", { class: "b-card " + (b.c || "") }, [
          b.img ? h("div", { class: "card-img" }, img(b.img)) : null,
          h("div", { class: "card-body" }, [
            b.t ? h("div", { class: "card-t", html: fmt(b.t) }) : null,
            b.s ? h("div", { class: "card-s", html: fmt(b.s) }) : null,
            h("div", { class: "b-kv" }, (b.r || []).map(function (r) {
              return h("div", { class: "kv-row" }, [h("span", { class: "kv-k", html: fmt(r[0]) }), h("span", { class: "kv-v", html: fmt(r[1]) })]);
            }))])]);
    }
    return null;
  }

  function renderPanel(p) {
    var old = panels[p.id];
    var wrap = h("div", { class: "panel-wrap pos-" + (p.pos || "c") + (p.modal ? " modal" : ""), "data-panel": p.id });
    if (p.modal) wrap.setAttribute("data-touch", "");
    var box = h("div", { class: "panel glass" + (p.cls ? " " + p.cls : ""), "data-touch": "", style: "width:" + (p.w || 26) + "rem" });
    var head = h("div", { class: "p-head" }, [
      p.icon ? h("div", { class: "p-ic" }, glyph(p.icon)) : null,
      h("div", { class: "p-tt" }, [h("div", { class: "p-title", html: fmt(p.title || "") }), p.sub ? h("div", { class: "p-sub", html: fmt(p.sub) }) : null]),
      p.close !== 0 ? button({ icon: "x", c: "g", sm: 1 }, function () { E.send(p.id, "close", -1); if (p.localClose) closePanel(p.id); }) : null
    ]);
    box.appendChild(head);
    var body = h("div", { class: "p-body" });
    (p.body || []).forEach(function (b, i) { var el = block(p, b, i); if (el) body.appendChild(el); });
    box.appendChild(body);
    if (p.btns && p.btns.length) {
      box.appendChild(h("div", { class: "p-foot" }, p.btns.map(function (b) {
        return button(b, function () { E.send(p.id, b.id, b.i != null ? b.i : -1); });
      })));
    }
    if (p.foot) box.appendChild(h("div", { class: "p-note", html: fmt(p.foot) }));
    wrap.appendChild(box);
    var host = layer("panels");
    if (old && old.parentNode) {
      var sc = old.querySelector(".p-body"); var st = sc ? sc.scrollTop : 0;
      host.replaceChild(wrap, old);
      body.scrollTop = st;
      wrap.classList.add("on", "instant");
    } else {
      host.appendChild(wrap);
      requestAnimationFrame(function () { wrap.classList.add("on"); });
    }
    panels[p.id] = wrap;
    E.touch();
  }
  function closePanel(id) {
    var w = panels[id];
    if (!w) return;
    delete panels[id];
    w.classList.remove("on");
    setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); E.touch(); }, 220);
    E.touch();
  }
  E.on("panel", function (d) {
    if (!d || !d.id) return;
    if (d.show === 0 || d.show === false) closePanel(d.id);
    else renderPanel(d);
  });
  E.on("panel_close_all", function () { Object.keys(panels).forEach(closePanel); });

  window.UI = {
    h: h, $: $, layer: layer, fmt: fmt, plain: plain, esc: esc, money: money, pad: pad,
    icon: icon, iconEl: iconEl, glyph: glyph, img: img, imgUrl: imgUrl, button: button, itemIcon: itemIcon,
    panel: renderPanel, closePanel: closePanel, panels: panels
  };
})();
