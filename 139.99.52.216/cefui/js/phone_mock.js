/* =====================================================================
   EAGLE PHONE v24 — MOCK SERVER (hanya untuk preview_phone.html di PC)
   Meniru balasan Pawn supaya semua aplikasi bisa dicoba tanpa game.
   TIDAK dimuat oleh index.html (client Android).
   ===================================================================== */
(function () {
  "use strict";
  var now = function () { return Math.floor(Date.now() / 1000); };
  function T(d) { window.Cef._trigger("phone", JSON.stringify(d)); }
  function D(app, o) { o = o || {}; o.t = "data"; o.app = app; T(o); }
  var ME = { cid: 7, num: "081234567890", name: "Althaf_Abraham", rek: 482913, cash: 15250, bank: 250000, skin: 60, mail: "althaf.abraham@eaglemail.id" };
  var st = {
    contacts: [{ id: 1, n: "Budi_Santoso", num: "081200001111", fav: 1, bl: 0, on: 1 }, { id: 2, n: "Siti_Rahma", num: "081200002222", fav: 0, bl: 0, on: 0 }, { id: 3, n: "Mekanik_Joko", num: "081200003333", fav: 1, bl: 0, on: 1 }, { id: 4, n: "Andi_Pratama", num: "081200004444", fav: 0, bl: 0, on: 1 }],
    recents: [{ id: 1, num: "081200001111", n: "Budi_Santoso", dir: 1, st: 1, dur: 94, ts: now() - 600 }, { id: 2, num: "081200002222", n: "", dir: 1, st: 0, dur: 0, ts: now() - 5000 }, { id: 3, num: "081299998888", n: "", dir: 0, st: 1, dur: 30, ts: now() - 90000 }],
    msgs: { "081200001111": [{ id: 1, me: 0, tx: "Bro jadi ngumpul di bengkel?", att: 0, ts: now() - 3600 }, { id: 2, me: 1, tx: "Jadi, jam 8 malam ya", att: 0, ts: now() - 3500, rd: 1 }, { id: 3, me: 0, tx: "", att: 2, ad: "1520.5,-1675.2,13.5", ts: now() - 3400 }, { id: 4, me: 0, tx: "Oke gas %F0%9F%94%A5", att: 0, ts: now() - 60 }],
      "081200002222": [{ id: 5, me: 1, tx: "Makasih ya", att: 0, ts: now() - 86400 * 2, rd: 1 }, { id: 6, me: 0, tx: "", att: 3, ad: "5000", ts: now() - 86400 * 2 + 30 }] },
    mail: [{ id: 1, from: "gov@eaglemail.id", fromn: "Pemerintah Kota", to: ME.mail, sub: "Selamat datang di EAGLE", pre: "Terima kasih telah menjadi warga kota EAGLE…", body: "Terima kasih telah menjadi warga kota EAGLE.%0A%0AGunakan HP ini untuk menghubungi layanan kota.", ts: now() - 7200, rd: 0, out: 0 }],
    posts: [{ id: 11, a: 2, u: "budi.s", dn: "Budi Santoso", av: "", vf: 1, tx: "Macet parah di Rodeo, hati-hati warga!", md: "", lk: 12, cm: 2, rp: 1, ml: 0, mr: 0, ts: now() - 900 },
      { id: 12, a: 3, u: "jokomech", dn: "Bengkel Joko", av: "", vf: 0, tx: "Promo servis mesin minggu ini diskon 20%", md: "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_560.jpg", lk: 40, cm: 5, rp: 3, ml: 1, mr: 0, ts: now() - 5400 }],
    bdacc: null, pgacc: { id: 1, u: "althaf", dn: "Althaf Abraham", av: "skin:60", bio: "Warga EAGLE", fl: 120, fw: 80, po: 3 },
    photos: [{ id: 1, url: "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_411.jpg", cap: "Mobil impian", src: 1, loc: "Pershing Square", ts: now() - 4000 }, { id: 2, url: "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_522.jpg", cap: "", src: 0, loc: "", ts: now() - 9000 }],
    notes: [{ id: 1, tt: "Belanja", tx: "Roti%0ASusu%0ABensin", ts: now() - 3000 }],
    dc: [{ id: 1, al: "Ghost", tx: "ada yang jual senter?", ts: now() - 300, me: 0 }],
    ads: [{ id: 1, n: "Budi_Santoso", num: "081200001111", tx: "Jual Sultan mulus harga nego, COD Idlewood", ts: now() - 1200, mine: 0 }],
    market: [{ id: 1, tt: "NRG-500 bekas", pr: 45000, tx: "Mesin halus, surat lengkap", md: "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_522.jpg", n: "Andi_Pratama", num: "081200004444", ts: now() - 20000, mine: 0 }],
    news: [{ id: 1, tt: "Pemkot resmikan jalan tol baru", tx: "Jalan tol penghubung Los Santos dan Las Venturas resmi dibuka hari ini.", md: "", au: "Pemerintah_Kota", ts: now() - 30000, mine: 0 }],
    music: [{ id: 1, tt: "Lofi Radio", url: "https://stream.example/lofi.mp3" }]
  };
  var nid = 100;
  function threads() {
    return Object.keys(st.msgs).map(function (k) { var l = st.msgs[k], m = l[l.length - 1]; return { num: k, n: "", last: m.tx, att: m.att, ts: m.ts, un: m.me ? 0 : (k === "081200001111" ? 1 : 0), mine: m.me }; }).sort(function (a, b) { return b.ts - a.ts; });
  }
  function bank() { return { bal: ME.bank, cash: ME.cash, rek: ME.rek, name: ME.name, tx: [{ id: 1, amt: 5000, tt: "Siti_Rahma", sub: "Transfer masuk", ts: now() - 86400 * 2 }, { id: 2, amt: -250, tt: "Pom Bensin", sub: "Pembayaran", ts: now() - 86400 * 3 }], inv: [{ id: 9, n: "Tilang kecepatan", fn: "Kepolisian", cost: 1500 }] }; }
  function show(extra) {
    var o = { t: "show", cid: ME.cid, num: ME.num, name: ME.name, rek: ME.rek, cash: ME.cash, bank: ME.bank, skin: ME.skin, mail: ME.mail, now: now(), tzo: 25200, wp: 3, th: "light", sz: 1, air: 0, dnd: 0, sil: 0, pc: 0, faceid: 1, ring: "", up: "catbox", badges: { messages: 1, phone: 1, mail: 1 } };
    for (var k in extra || {}) o[k] = extra[k];
    T(o);
  }
  function openData(app, arg) {
    switch (app) {
      case "contacts": D("contacts", { items: st.contacts }); break;
      case "phone": D("recents", { items: st.recents }); D("contacts", { items: st.contacts }); break;
      case "messages": D("threads", { items: threads() }); D("contacts", { items: st.contacts }); break;
      case "mail": D("mail", { addr: ME.mail, items: st.mail }); break;
      case "bank": D("bank", bank()); break;
      case "garage": D("garage", { items: [{ id: 3, m: 560, n: "Sultan", pl: "EAGLE 01", st: "Spawned", sp: 1, lk: 1, fu: 72, hp: 88, ins: 0, imp: 0 }, { id: 5, m: 522, n: "NRG-500", pl: "EAGLE 02", st: "Garkot Idlewood", sp: 0, lk: 1, fu: 30, hp: 100, ins: 0, imp: 0 }, { id: 7, m: 411, n: "Infernus", pl: "EAGLE 03", st: "Samsat", sp: 0, lk: 1, fu: 10, hp: 40, ins: 0, imp: 1 }] }); break;
      case "maps": D("maps", { x: 1480, y: -1700, z: 13, zone: "Pershing Square, Los Santos", wp: null, pins: [{ id: 1, n: "Rumah", x: 2100, y: -1800, z: 13 }], cats: [{ n: "Umum", items: [{ n: "Balai Kota", x: 1483.9, y: -1744.2, z: 13.5 }, { n: "Kantor Polisi", x: 650.2, y: -1463.7, z: 15.4 }, { n: "Rumah Sakit LS", x: 325.7, y: -1515.1, z: 36 }, { n: "Bank", x: 2166.8, y: 952.2, z: 10.8 }] }, { n: "Pekerjaan", items: [{ n: "Supir Bus", x: 1750, y: -1880, z: 13 }] }] }); break;
      case "services": D("services", { duty: 1, facname: "Kepolisian", open: 1, svc: [{ id: "police", on: 3 }, { id: "ems", on: 2 }, { id: "mechanic", on: 1 }, { id: "taxi", on: 0 }, { id: "gov", on: 1 }, { id: "trader", on: 0 }], mine: [], calls: [{ id: 1, svc: "police", n: "Siti_Rahma", num: "081200002222", tx: "Ada perampokan di warung", loc: "Idlewood", ts: now() - 120, st: 0, by: "", me: 0 }] }); break;
      case "weather": D("weather", { wx: 1, tm: "20:45", zone: "Los Santos", temp: 31 }); break;
      case "health": D("health", { hp: 85, ar: 40, hg: 62, th: 24, sr: 22, inj: 0 }); break;
      case "id": D("id", { name: ME.name, dob: "22/08/2000", gender: 1, origin: "Indonesia", tb: 175, bb: 70, num: ME.num, rek: ME.rek, skin: 60, ktp: 1, sima: 1, simb: 0, simc: 1, gun: 0, delay: [{ n: "Sidejob Sweeper", m: 0 }, { n: "Sidejob Bus", m: 12 }, { n: "Sidejob Forklift", m: 4 }] }); break;
      case "birdy": D("bd_acc", { acc: st.bdacc }); break;
      case "photogram": D("pg_acc", { acc: st.pgacc }); break;
      case "darkchat": break;
      case "pages": D("ads", { price: 250, items: st.ads }); break;
      case "market": D("market", { items: st.market }); break;
      case "news": D("news", { canpost: 1, admin: 0, items: st.news }); break;
      case "notes": D("notes", { items: st.notes }); break;
      case "photos": D("photos", { items: st.photos }); break;
      case "music": D("music", { ear: 1, vip: 1, playing: "", items: st.music }); break;
    }
  }
  function feed(ap, tab) {
    if (ap === "bd") D("bd_feed", { tab: tab, items: st.posts });
    else D("pg_feed", { items: st.posts.filter(function (p) { return p.md; }), stories: [{ a: 2, u: "budi.s", dn: "Budi Santoso", av: "", seen: 0 }, { a: 3, u: "jokomech", dn: "Bengkel Joko", av: "", seen: 1 }], mystory: 0 });
  }
  function onSend(ev, json) {
    if (ev !== "ui") return;
    var o = JSON.parse(json); if (o.v !== "phone") return;
    var a = o.a, i = +o.i, s = o.s, j = {};
    try { if (s && s.charAt(0) === "{") j = JSON.parse(s); } catch (e) {}
    console.log("[mock] <- " + a + " " + i + " " + s);
    setTimeout(function () {
      switch (a) {
        case "close": T({ t: "hide" }); break;
        case "open": var p = String(s).split(":"); openData(p[0], p[1]); break;
        case "open_phone": show(); break;
        case "unlock": if (s === "1234") T({ t: "unlocked" }); else T({ t: "badfail" }); break;
        case "ct_save": if (i > 0) st.contacts.forEach(function (c) { if (c.id === i) { c.n = decodeURIComponent(j.n).replace(/ /g, "_"); c.num = j.num; c.fav = j.fav; } }); else st.contacts.push({ id: ++nid, n: decodeURIComponent(j.n).replace(/ /g, "_"), num: j.num, fav: j.fav, bl: 0, on: 0 }); D("contacts", { items: st.contacts }); T({ t: "toast", m: "Kontak disimpan" }); break;
        case "ct_del": st.contacts = st.contacts.filter(function (c) { return c.id !== i; }); D("contacts", { items: st.contacts }); break;
        case "ct_block": st.contacts.forEach(function (c) { if (c.id === i) c.bl = +s; }); D("contacts", { items: st.contacts }); break;
        case "thread": D("thread", { num: s, n: "", items: st.msgs[s] || [] }); break;
        case "msg":
          var m = { id: ++nid, me: 1, tx: j.tx, att: +j.at, ad: j.ad, ts: now(), rd: 0 };
          if (+j.at === 2) m.ad = "1480,-1700,13";
          (st.msgs[j.to] = st.msgs[j.to] || []).push(m);
          D("msg_new", { num: j.to, m: m });
          setTimeout(function () { var r = { id: ++nid, me: 0, tx: "Siap!", att: 0, ts: now() }; st.msgs[j.to].push(r); D("msg_new", { num: j.to, m: r }); T({ t: "notif", app: "messages", title: "Budi Santoso", body: "Siap!", key: j.to }); }, 1500);
          break;
        case "call": T({ t: "call", st: "out", num: s, name: "" }); setTimeout(function () { T({ t: "call", st: "active", num: s, name: "", dur: 0 }); }, 2000); break;
        case "hangup": case "decline": T({ t: "call", st: "end" }); break;
        case "accept": T({ t: "call", st: "active", num: "081200001111", name: "Budi_Santoso", dur: 0 }); break;
        case "mail_view": st.mail.forEach(function (m) { if (m.id === i) { m.rd = 1; D("mailview", m); } }); break;
        case "mail_send": st.mail.push({ id: ++nid, from: ME.mail, to: j.to, sub: j.sub, pre: j.body.slice(0, 60), body: j.body, ts: now(), rd: 1, out: 1 }); D("mail", { addr: ME.mail, items: st.mail }); T({ t: "toast", m: "Email terkirim" }); break;
        case "tf_check": D("bank_chk", { ok: 1, name: "Budi_Santoso", rek: 551234 }); break;
        case "transfer": ME.bank -= +j.amt; D("bank", bank()); T({ t: "toast", m: "Transfer berhasil" }); break;
        case "inv_pay": T({ t: "toast", m: "Tagihan dibayar" }); break;
        case "acc_new": var acc = { id: 9, u: j.u, dn: j.dn, av: j.av, bio: j.bio, fl: 0, fw: 0, po: 0 }; if (j.ap === "bd") { st.bdacc = acc; D("bd_acc", { acc: acc }); } else { st.pgacc = acc; D("pg_acc", { acc: acc }); } break;
        case "feed": feed(j.ap, j.tab); break;
        case "post": st.posts.unshift({ id: ++nid, a: 9, u: (st.bdacc || st.pgacc || {}).u || "me", dn: "Althaf Abraham", av: "", vf: 0, tx: j.tx, md: j.md, lk: 0, cm: 0, rp: 0, ml: 0, mr: 0, ts: now() }); feed(j.ap === "pgs" ? "pg" : j.ap, "all"); T({ t: "toast", m: "Terposting" }); break;
        case "comments": D(s === "bd" ? "bd_post" : "pg_post", { id: i, items: [{ id: 1, u: "siti", dn: "Siti", av: "", tx: "Setuju!", ts: now() - 100 }] }); break;
        case "profile": var pa = j.u === (st.pgacc || {}).u ? st.pgacc : { id: 2, u: j.u, dn: j.u, av: "", bio: "", fl: 10, fw: 3, po: 1 }; D(j.ap === "bd" ? "bd_prof" : "pg_prof", { acc: pa, fol: 0, num: "081200001111", items: st.posts.filter(function (p) { return p.md; }) }); break;
        case "notifs": D(j.ap === "bd" ? "bd_notif" : "pg_notif", { items: [{ k: "like", u: "budi.s", dn: "Budi Santoso", av: "", ts: now() - 60 }, { k: "follow", u: "siti", dn: "Siti", av: "", ts: now() - 600 }] }); break;
        case "search": D(j.ap === "bd" ? "bd_search" : "pg_search", { users: [{ u: "budi.s", dn: "Budi Santoso", av: "" }], posts: st.posts.filter(function (p) { return p.md; }) }); break;
        case "story": D("pg_story", { a: i, u: "budi.s", dn: "Budi Santoso", av: "", items: [{ id: 1, md: "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_560.jpg", ts: now() - 3000 }] }); break;
        case "dc_open": D("dc", { ch: s, alias: "Ghost", items: st.dc }); break;
        case "dc_send": var dm = { id: ++nid, al: "Ghost", tx: j.tx, ts: now(), me: 1 }; st.dc.push(dm); D("dc_msg", { ch: j.ch, m: dm }); break;
        case "ad_new": st.ads.unshift({ id: ++nid, n: ME.name, num: ME.num, tx: s, ts: now(), mine: 1 }); D("ads", { price: 250, items: st.ads }); break;
        case "mk_new": st.market.unshift({ id: ++nid, tt: j.tt, pr: j.pr, tx: j.tx, md: j.md, n: ME.name, num: ME.num, ts: now(), mine: 1 }); D("market", { items: st.market }); break;
        case "news_new": st.news.unshift({ id: ++nid, tt: j.tt, tx: j.tx, md: j.md, au: ME.name, ts: now(), mine: 1 }); D("news", { canpost: 1, items: st.news }); break;
        case "note_save": if (i > 0) st.notes.forEach(function (n) { if (n.id === i) { n.tt = j.tt; n.tx = j.tx; n.ts = now(); } }); else st.notes.unshift({ id: ++nid, tt: j.tt, tx: j.tx, ts: now() }); D("notes", { items: st.notes }); break;
        case "note_del": st.notes = st.notes.filter(function (n) { return n.id !== i; }); D("notes", { items: st.notes }); break;
        case "photos_get": D("photos", { items: st.photos }); break;
        case "photo_add": st.photos.unshift({ id: ++nid, url: j.url, cap: j.cap || "", src: +j.src || 0, loc: +j.src === 1 ? "Pershing Square" : "", ts: now() }); D("photos", { items: st.photos }); T({ t: "toast", m: +j.src === 1 ? "Foto tersimpan di Galeri" : "Foto disimpan" }); break;
        case "cam": if (s === "camera_capture") console.log("[mock] * Memotret dengan kamera HP"); break;
        case "gps_near": T({ t: "toast", m: "GPS ke lokasi terdekat dipasang" }); break;
        case "gps_legacy": T({ t: "hide" }); console.log("[mock] dialog GPS lama dibuka"); break;
        case "boombox": T({ t: "hide" }); console.log("[mock] dialog boombox dibuka"); break;
        case "show_id": T({ t: "toast", m: "KTP ditunjukkan ke pemain terdekat" }); break;
        case "photo_del": st.photos = st.photos.filter(function (n) { return n.id !== i; }); D("photos", { items: st.photos }); break;
        case "music_play": T({ t: "sync", music: "Lofi Radio" }); D("music", { ear: 1, vip: 1, playing: "Lofi Radio", items: st.music }); break;
        case "music_stop": T({ t: "sync", music: "" }); D("music", { ear: 1, vip: 1, playing: "", items: st.music }); break;
        case "svc": T({ t: "toast", m: "Permintaan dikirim ke petugas" }); break;
        case "gps": T({ t: "toast", m: "GPS dipasang: " + decodeURIComponent(j.n || "") }); break;
        case "slot": D("slot", { c: ["10c", "1h", "13s"], spin: 0, res: "" }); break;
        case "slot_spin": D("slot", { c: ["?", "?", "?"], spin: 1, res: "" }); setTimeout(function () { D("slot", { c: ["12d", "12h", "3s"], spin: 0, res: "Kamu kalah" }); }, 2500); break;
        case "xo": D("xo", { b: "100020000", me: "X", turn: 1, cash: 100 }); break;
      }
    }, 120);
  }
  // pasang jembatan tiruan
  window.CefBridge = window.CefBridge || {};
  window.CefBridge.sendClientEvent = function (ev, json) { onSend(ev, json); };
  window.CefBridge.cefReady = function () {};
  window.CefBridge.updateInteractiveAreas = function (r) { window.__rects = r; };
  window.CefBridge.log = function (m) { console.log("[cef] " + m); };
  // tiruan CefMedia.kt: kamera game & galeri HP -> "upload" -> event "media"
  var SAMPLE = ["https://assets.open.mp/assets/images/vehiclePictures/Vehicle_451.jpg", "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_429.jpg", "https://assets.open.mp/assets/images/vehiclePictures/Vehicle_541.jpg"];
  function media(json, cancel) {
    var o = {}; try { o = JSON.parse(json || "{}"); } catch (e) {}
    setTimeout(function () {
      var r = cancel ? { id: o.id, ok: 0, err: "Dibatalkan" } : { id: o.id, ok: 1, url: SAMPLE[(nid++) % SAMPLE.length] };
      window.Cef._trigger("media", JSON.stringify(r));
    }, 900);
  }
  window.CefBridge.captureGame = function (json) { media(json, false); };
  window.CefBridge.pickImage = function (json) { media(json, !!window.__pickCancel); };
  window.CefBridge.mediaVersion = function () { return 1; };
  window.PhoneMock = { show: show, T: T, D: D, st: st,
    incoming: function () { T({ t: "call", st: "in", num: "081200001111", name: "Budi_Santoso" }); },
    notify: function () { T({ t: "notif", app: "messages", title: "Siti Rahma", body: "Halo, kamu di mana?", key: "081200002222" }); }
  };
})();
