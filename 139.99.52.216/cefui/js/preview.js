/* =====================================================================
   EAGLE ROLEPLAY - preview.js  (HANYA untuk preview.html di browser PC)
   Menampilkan semua tampilan CEF dengan data contoh tanpa masuk game.
   Tidak dimuat oleh index.html (client Android).
   ===================================================================== */
(function () {
  "use strict";
  var T = function (ev, d) { window.Cef._trigger(ev, JSON.stringify(d)); };
  var ITEMS = [
    ["$5,000 Cash", 1212, 0, 2], ["$10,000 Cash", 1212, 0, 2], ["$15,000 Cash", 1212, 0, 3], ["Level Up (+3)", 1212, 1, 2], ["10 Coins", 1930, 3, 2],
    ["Bunga", 14, 3, 0], ["Bandage", 11736, 3, 1], ["Rokok", 19896, 3, 0], ["Tools Kit", 19918, 3, 2], ["Repair Kit", 19921, 3, 2],
    ["Katana", 8, 2, 2], ["Desert Eagle", 24, 2, 4], ["AK-47", 30, 2, 4], ["Kevlar", 19515, 3, 4], ["Nasi Goreng", 2355, 3, 0],
    ["Bakso", 19567, 3, 0], ["Beer", 1544, 3, 0], ["Kopi Kenangan", 19835, 3, 0], ["Smartphone", 18870, 3, 2], ["Radio", 19942, 3, 2],
    ["NRG-500", 522, 4, 4], ["Sultan", 560, 4, 4], ["Infernus Sport Car", 411, 4, 4], ["VIP 1 - 7 Days", 0, 5, 4], ["$50,000 RedMoney", 0, 7, 4]
  ].map(function (a) { return { n: a[0], m: a[1], t: a[2], r: a[3] }; });

  var S = {
    hud: function () {
      T("hud", { show: 1, mode: 1, hp: 85, ar: 40, hg: 62, th: 24, st: 22, info: 1, id: 12, cash: 15250, bank: 250000, fac: "SAPD", job: "Polisi", on: 57, vm: 2 });
      T("location", { show: 1, dir: "NE", zone: "Rodeo, Los Santos", time: "20:45" });
      T("fps", { show: 1, fps: 59, ping: 48, pl: "0.0%" });
      T("watermark", { show: 1, t: "EAGLE", s: "ROLEPLAY", l: "Indonesia Roleplay" });
    },
    speedo: function () { T("speedo", { show: 1, kmh: 128, fuel: 64, hp: 88, gear: "4", eng: 1, lig: 1, lock: 0 }); },
    notify: function () {
      T("notify", { t: 1, m: "Berhasil membeli {34d17c}Burger{ffffff} seharga $25", d: 6000 });
      setTimeout(function () { T("notify", { t: 0, m: "Anda tidak memiliki cukup uang!", d: 6000 }); }, 250);
      setTimeout(function () { T("notify", { t: 2, m: "Telah terjadi perampokan warung di~n~Idlewood", d: 8000, title: "Perampokan Warung" }); }, 500);
      T("itembox", { a: "Received 1x", n: "Burger", m: 2703 });
      setTimeout(function () { T("itembox", { a: "Removed 1x", n: "Hacking Card", m: 19792, neg: 1 }); }, 300);
    },
    progress: function () { T("progress", { show: 1, label: "MEMASAK", pct: 45 }); },
    banner: function () { T("banner", { id: "storm", show: 1, t: "Peringatan Badai", m: "Server akan restart, segera amankan kendaraanmu.", f: "04:59", c: "warn", icon: "warn", pos: "top" }); },
    interact: function () { T("interact", { show: 1, label: "Masuk Rumah", key: "F" }); },
    hint: function () { T("hint", { show: 1, t: "Garasi Umum", k: "ALT" }); },
    abox: function () {
      T("abox", { show: 1, id: "gym", t: "GYM", pct: 45, m: "Latihan untuk mengurangi stress", keys: [{ k: "ALT", t: "Untuk Latihan" }, { k: "H", t: "Untuk Berhenti" }] });
      T("abox", { show: 1, id: "zona", t: "Zona Santai", keys: [] });
    },
    target: function () { T("target", { show: 1, opts: [{ t: "ATM" }] }); },
    atm: function () { T("atm", { show: 1, name: "Althaf_Abraham", rek: 482913, bank: 250000, cash: 15250, to: 0, amt: 0 }); },
    ktp: function () { T("idcard", { show: 1, type: "ktp", name: "Althaf_Abraham", dob: "22/08/2000", gender: "Laki-Laki", height: 175, sig: "Althaf Abraham", skin: 60 }); },
    kta: function () { T("idcard", { show: 1, type: "kta", fac: "Kepolisian Kota EAGLE", name: "Cecep Sugeni", rank: "Wadir Umum", skin: 280 }); },
    bpjs: function () { T("idcard", { show: 1, type: "bpjs", name: "Althaf_Abraham", dob: "22/08/2000", exp: "29 Hari", skin: 60 }); },
    hack: function () {
      var b = ""; for (var i = 0; i < 36; i++) b += [3, 7, 9, 14, 18, 22, 25, 29, 31, 35].indexOf(i) >= 0 ? "1" : "0";
      T("hack", { show: 1, ph: 2, ok: 0, bad: 0, b: b });
    },
    hackplay: function () {
      var b = ""; for (var i = 0; i < 36; i++) b += [3, 7, 9].indexOf(i) >= 0 ? "1" : ([5, 12].indexOf(i) >= 0 ? "2" : "0");
      T("hack", { show: 1, ph: 4, ok: 3, bad: 2, b: b });
    },
    evscore: function () {
      T("evscore", { show: 1, full: 1, target: 25, a: 12, b: 9, feed: ["~r~Budi~w~_has_killed_by_~b~Andi_~w~Team_~b~B:_~g~9", "~b~Rizky~w~_bergabung dalam event sebagai team ~b~B", "_", "~r~Joko~w~_has_killed_by_~r~Dimas"] });
    },
    casino: function () { T("casino", { show: 1, r: "012", bet: 5, bal: 120, min: 5, max: 10 }); },
    casinospin: function () {
      T("casino", { show: 1, r: "012", bet: 5, bal: 115, spin: 1, ms: 3500 });
      setTimeout(function () { T("casino", { show: 1, r: "333", bet: 5, bal: 190, res: "win", win: 75 }); }, 3500);
    },
    drone: function () { T("drone", { show: 1, op: "Althaf_Abraham", alt: "184m", spd: "24km/h", pos: "Los Santos Airport", sig: "OPTIMAL", th: 0 }); },
    gacha: function () { T("gacha", { show: 1, coins: 25, roll: 0, items: ITEMS }); },
    gachaspin: function () {
      T("gacha", { show: 1, coins: 15, roll: 1, items: ITEMS });
      setTimeout(function () { T("gacha", { show: 1, coins: 15, roll: 0, win: "Infernus Sport Car", rar: 4, m: 411, items: ITEMS }); }, 3000);
    },
    inv: function () {
      T("inv", { show: 1, name: "Althaf_Abraham", w: "12.5", wm: "150.0", sel: 2, amt: 0, ground: 1,
        it: [{ s: 0, n: "Burger", q: 3, m: 2703 }, { s: 1, n: "Smartphone", q: 1, m: 18870 }, { s: 2, n: "Air Mineral", q: 5, m: 2958 },
          { s: 3, n: "Radio", q: 1, m: 19942 }, { s: 5, n: "Desert Eagle", q: 1, m: 348 }, { s: 6, n: "Peluru 9mm", q: 120, m: 2061 },
          { s: 8, n: "Repair Kit", q: 2, m: 19921 }, { s: 9, n: "Uang Merah", q: 3500, m: 1212 }, { s: 12, n: "KTP", q: 1, m: 1581 }],
        gr: [{ s: 0, n: "Bandage", q: 2, m: 11736 }, { s: 1, n: "Rokok", q: 12, m: 19896 }] });
    },
    // HP v24 (protokol {t:"show"...}); data aplikasi dari phone_mock.js bila dimuat
    phone: function () { if (window.PhoneMock) PhoneMock.show({ faceid: 0 }); else T("phone", { t: "show", cid: 1, num: "081234567890", name: "Althaf_Abraham", now: Math.floor(Date.now() / 1000), tzo: 25200 }); },
    phonebank: function () { S.phone(); setTimeout(function () { var l = document.querySelector(".ep-lock"); if (l) l.click(); if (window.EPhone) EPhone.open("bank"); }, 500); },
    radio: function () { T("radio", { show: 1, freq: 112, on: 1, mic: 0 }); },
    death: function () { T("death", { show: 1, m: 4, s: 32, ems: 3, rs: 0 }); },
    radial: function () { T("radial", { show: 1, t: "EAGLE", s: "ROLEPLAY" }); },
    garage: function () {
      T("panel", { id: "garage", show: 1, title: "Garasi Umum", sub: "Pilih kendaraan untuk dikeluarkan", icon: "car", pos: "c", w: 30,
        body: [{ k: "list", id: "veh", sel: 0, a: "sel", it: [{ t: "Sultan", s: "Plat: EAGLE 01", img: "veh:560", r: "Tersedia" }, { t: "NRG-500", s: "Plat: EAGLE 02", img: "veh:522", r: "Tersedia" }, { t: "Infernus", s: "Plat: EAGLE 03", img: "veh:411", r: "Rusak", c: "err" }] },
          { k: "card", t: "Sultan", s: "Kondisi kendaraan", r: [["Bensin", "84%"], ["Body", "1000.0"]] }],
        btns: [{ id: "close", t: "Tutup", c: "g" }, { id: "take", t: "Keluarkan", c: "p", icon: "key" }] });
    },
    shop: function () {
      T("panel", { id: "shop", show: 1, title: "Warung Makan", sub: "Pilih makanan & minuman", icon: "store", pos: "c", w: 34,
        body: [{ k: "grid", cols: 4, a: "sel", sel: 1, it: [{ t: "Nasi Goreng", s: "$25", icon: "food" }, { t: "Bakso", s: "$20", icon: "food" }, { t: "Es Teh", s: "$8", icon: "drink" },
          { t: "Kopi", s: "$12", icon: "drink" }, { t: "Burger", s: "$30", icon: "food" }, { t: "Pizza", s: "$45", icon: "food" }, { t: "Air Mineral", s: "$5", icon: "drink" }, { t: "Jus", s: "$10", icon: "drink" }] },
          { k: "nav", t: "Halaman 1 / 2" }],
        btns: [{ id: "close", t: "Tutup", c: "g" }, { id: "buy", t: "Beli", c: "p", icon: "cart" }] });
    },
    mixer: function () {
      T("panel", { id: "mixer", show: 1, title: "Batching Plant", sub: "Job Mix - samakan takaran dengan spesifikasi", icon: "box", pos: "c", w: 26,
        body: [{ k: "list", id: "mat", a: "set", it: [{ t: "SEMEN", s: "Spesifikasi: 523", r: "523", c: "ok" }, { t: "PASIR", s: "Spesifikasi: 812", r: "800", c: "err" }, { t: "KERIKIL 1-2", s: "Spesifikasi: 145", r: "Isi" }, { t: "KERIKIL 2-3", s: "Spesifikasi: 677", r: "Isi" }, { t: "AIR", s: "Spesifikasi: 390", r: "Isi" }] },
          { k: "txt", t: "Tap bahan untuk mengisi takaran, lalu tekan KONFIRMASI.", c: "muted center" }],
        btns: [{ id: "confirm", t: "KONFIRMASI", c: "p", icon: "check" }] });
    },
    clothes: function () {
      T("panel", { id: "cloth", show: 1, title: "Pilih Pakaian", sub: "Geser untuk mengganti", icon: "shirt", pos: "r", w: 22,
        body: [{ k: "step", it: [{ t: "Skin", v: "60", icon: "user" }, { t: "Topi / Helm", v: "Tidak ada", icon: "tag" }, { t: "Kacamata", v: "3", icon: "eye" }, { t: "Aksesoris", v: "1", icon: "star" }] }],
        btns: [{ id: "camera", t: "Kamera", c: "g", icon: "cam" }, { id: "save", t: "Simpan", c: "p", icon: "check" }] });
    },
    login: function () { T("auth", { v: "login", ucp: "althaf", ver: "v3.0", att: 0 }); },
    gametext: function () { T("gametext", { t: "~w~Mic Radio~n~~g~Aktif", d: 2500, s: 6 }); setTimeout(function () { T("gametext", { t: "3", d: 1000, s: 3 }); }, 300); },
    fade: function () { T("fade", { "in": 800, out: 800 }); },
    dlg: function () { T("dlg", { show: 1 }); setTimeout(function () { T("dlg", { show: 0 }); }, 2500); },
    clear: function () {
      ["inv", "radio", "death", "radial", "atm", "idcard", "hack", "casino", "drone", "gacha", "target", "hint", "evscore", "speedo", "progress", "interact"]
        .forEach(function (e) { T(e, { show: 0 }); });
      T("phone", { t: "hide" });
      T("abox", { id: "gym", show: 0 }); T("abox", { id: "zona", show: 0 });
      T("panel_close_all", {}); T("auth", { v: "none" }); T("banner", { id: "storm", show: 0 });
    }
  };
  window.PREVIEW = S;

  // panel tombol preview
  var bar = document.createElement("div");
  bar.id = "pv-bar";
  bar.innerHTML = Object.keys(S).map(function (k) { return '<button data-k="' + k + '">' + k + "</button>"; }).join("");
  document.body.appendChild(bar);
  bar.addEventListener("click", function (e) { var k = e.target.getAttribute("data-k"); if (k) { if (k !== "clear" && k !== "hud") S.clear(); S[k](); } });
  var log = document.createElement("div");
  log.id = "pv-log";
  document.body.appendChild(log);
  window.__eagleSent = { push: function (x) { log.textContent = "-> server: " + x[0] + " " + JSON.stringify(x[1]); } };
  S.hud();
})();
