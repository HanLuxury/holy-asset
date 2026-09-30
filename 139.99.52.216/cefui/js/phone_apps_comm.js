/* =====================================================================
   EAGLE PHONE v24 — aplikasi komunikasi
   Telepon · Kontak · Pesan · Mail
   ===================================================================== */
(function () {
  "use strict";
  var P = window.EPhone; if (!P) return;
  var U = P.ui, h = U.h, ic = U.ic, tap = U.tap, dec = U.dec, enc = U.enc, nameOf = U.nameOf;

  /* ------------------------------------------------------------------ */
  /* Helper kontak (dipakai banyak aplikasi)                            */
  /* ------------------------------------------------------------------ */
  function contacts() { var c = P.ctx("contacts").cache.contacts; return (c && c.items) || []; }
  function contactByNum(num) { num = String(num || ""); var l = contacts(); for (var i = 0; i < l.length; i++) if (String(l[i].num) === num) return l[i]; return null; }
  function contactById(id) { var l = contacts(); for (var i = 0; i < l.length; i++) if (+l[i].id === +id) return l[i]; return null; }
  function displayName(num, fallback) { var c = contactByNum(num); return c ? nameOf(c.n) : (fallback ? nameOf(fallback) : String(num || "")); }
  function cleanNum(s) { return String(s || "").replace(/[^0-9#*+]/g, "").slice(0, 16); }
  function call(num) { num = cleanNum(num); if (!num) return U.toast("Nomor kosong", 1); P.send("call", -1, num); }
  P.contacts = { list: contacts, byNum: contactByNum, name: displayName, call: call };

  /* form tambah / edit kontak */
  function contactForm(ctx, c, preset) {
    c = c || {};
    var nm = U.input({ ph: "Nama", max: 30, value: c.n ? nameOf(c.n) : (preset && preset.n) || "" });
    var nb = U.input({ ph: "Nomor telepon", max: 16, type: "tel", mode: "tel", value: c.num || (preset && preset.num) || "" });
    var fav = !!+c.fav;
    var favT = U.toggle(fav, function (v) { fav = v; });
    var body = h("div", null, [
      h("div", { style: "display:flex;justify-content:center;padding:calc(var(--u)*1.4) 0" }, U.avatar(c.n || "?", null, "lg")),
      h("div", { class: "ep-form" }, [U.field("Nama", nm), U.field("Nomor", nb)]),
      U.list([U.row({ title: "Favorit", right: favT })])
    ]);
    var sh = U.sheet({
      title: c.id ? "Edit Kontak" : "Kontak Baru", left: { label: "Batal" },
      right: { label: "Simpan", fn: function (close) {
        var n = nm.value.trim(), num = cleanNum(nb.value);
        if (!n) return U.toast("Nama wajib diisi", 1);
        if (num.length < 3) return U.toast("Nomor tidak valid", 1);
        P.sendJ("ct_save", c.id ? +c.id : -1, { n: enc(n), num: num, fav: fav ? 1 : 0 });
        close();
      } },
      body: body
    });
    setTimeout(function () { nm.focus(); }, 350);
    return sh;
  }
  P.contactForm = contactForm;

  function contactDetail(ctx, c) {
    ctx.push(function (ctx2) {
      var cur = contactById(c.id) || c;
      var act = function (icon, label, fn) { return tap(h("button", { type: "button", class: "ep-svc", style: "align-items:center;text-align:center;padding:calc(var(--u)*1.2) calc(var(--u)*.6)" }, [h("div", { class: "sv-ic", style: "background:var(--tint)" }, ic(icon)), h("small", { text: label, style: "color:var(--tint);font-weight:600" })]), fn); };
      return [
        U.nav({ back: true, right: [U.navBtn("Edit", function () { contactForm(ctx2, cur); })] }),
        U.body([
          h("div", { style: "display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.8);padding:calc(var(--u)*1) 0 calc(var(--u)*2)" }, [
            U.avatar(cur.n, null, "xl"), h("div", { style: "font-size:calc(var(--u)*4);font-weight:600;text-align:center;padding:0 calc(var(--u)*2)", text: nameOf(cur.n) }),
            +cur.on ? U.pill("Online", "green") : U.pill("Offline")
          ]),
          h("div", { style: "display:grid;grid-template-columns:repeat(4,1fr);gap:calc(var(--u)*1);padding:0 calc(var(--u)*2) calc(var(--u)*1.6)" }, [
            act("msg", "pesan", function () { P.open("messages", cur.num); }),
            act("phone", "panggil", function () { call(cur.num); }),
            act("loc", "lokasi", function () { P.send("share_loc", -1, cur.num); }),
            act("money", "bayar", function () { P.open("bank", "pay:" + cur.num); })
          ]),
          U.list([U.row({ title: "telepon", sub: null, right: h("span", { text: cur.num, style: "color:var(--tint)" }), onClick: function () { call(cur.num); } })]),
          U.gap(),
          U.list([
            U.row({ title: +cur.fav ? "Hapus dari Favorit" : "Tambah ke Favorit", cls: "tint", onClick: function () { P.sendJ("ct_save", +cur.id, { n: enc(nameOf(cur.n)), num: cur.num, fav: +cur.fav ? 0 : 1 }); } }),
            U.row({ title: +cur.bl ? "Buka Blokir" : "Blokir Kontak Ini", cls: "danger", onClick: function () { P.send("ct_block", +cur.id, +cur.bl ? "0" : "1"); } }),
            U.row({ title: "Hapus Kontak", cls: "danger", onClick: function () {
              U.confirm("Hapus kontak?", nameOf(cur.n) + " akan dihapus dari kontak.", "Hapus", function () { P.send("ct_del", +cur.id); ctx2.pop(); }, true);
            } })
          ])
        ])
      ];
    }, {});
  }
  P.contactDetail = contactDetail;

  function contactRows(ctx, list, q, onPick) {
    q = (q || "").toLowerCase();
    var f = list.filter(function (c) { return !q || nameOf(c.n).toLowerCase().indexOf(q) >= 0 || String(c.num).indexOf(q) >= 0; })
      .sort(function (a, b) { return nameOf(a.n).toLowerCase() < nameOf(b.n).toLowerCase() ? -1 : 1; });
    if (!f.length) return [U.empty("users", q ? "Tidak ditemukan" : "Belum ada kontak", q ? null : "Ketuk + untuk menambah kontak.")];
    var out = [], groups = {};
    f.forEach(function (c) { var k = nameOf(c.n).charAt(0).toUpperCase(); if (!/[A-Z]/.test(k)) k = "#"; (groups[k] = groups[k] || []).push(c); });
    Object.keys(groups).sort().forEach(function (k) {
      out.push(U.sec(k));
      out.push(U.list(groups[k].map(function (c) {
        return U.row({ av: U.avatar(c.n, null, "sm"), title: nameOf(c.n), sub: c.num + (+c.bl ? " · diblokir" : ""), right: +c.on ? h("span", { class: "unread-dot", style: "background:var(--green)" }) : null, onClick: function () { onPick(c); } });
      })));
    });
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* KONTAK                                                              */
  /* ------------------------------------------------------------------ */
  P.app("contacts", {
    keys: ["contacts"],
    open: function (ctx, arg) {
      ctx.st.q = "";
      ctx.push(function (c, st) {
        var d = c.cache.contacts, dev = P.state.dev;
        var list = d ? d.items || [] : null;
        var srch = st.srch || (st.srch = U.search("Cari", "", function (v) { c.st.q = v; c.refresh(); }));
        var me = U.list([U.row({ av: U.avatar(dev.name, dev.skin ? "skin:" + dev.skin : null), title: nameOf(dev.name), sub: "Kartu Saya · " + (dev.num || "-"), chev: true, onClick: function () { myCard(c); } })]);
        return [
          U.nav({ large: "Kontak", right: [U.navIcon("plus", function () { contactForm(c, null); })], extra: srch }),
          U.body(list ? [me, U.gap()].concat(contactRows(c, list, c.st.q, function (ct) { contactDetail(c, ct); })) : [U.loading()])
        ];
      }, {});
      if (typeof arg === "string" && arg.charAt(0) === "c") { var ct = contactById(+arg.slice(1)); if (ct) contactDetail(ctx, ct); }
      if (typeof arg === "string" && arg.indexOf("add:") === 0) { var p = arg.slice(4).split("|"); contactForm(ctx, null, { num: p[0], n: dec(p[1] || "") }); }
    },
    data: function (ctx, d) {
      if (d.app === "contacts") {
        // detail yang sedang terbuka ikut diperbarui
        ctx.refresh();
        var cur = P.cur;
        if (cur && cur !== ctx && cur.def.uses && cur.def.uses.indexOf("contacts") >= 0) cur.refresh();
      }
    }
  });
  function myCard(ctx) {
    var dev = P.state.dev;
    ctx.push(function () {
      return [U.nav({ back: true, title: "Kartu Saya" }), U.body([
        h("div", { style: "display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.8);padding:calc(var(--u)*2) 0" }, [U.avatar(dev.name, dev.skin ? "skin:" + dev.skin : null, "xl"), h("b", { text: nameOf(dev.name), style: "font-size:calc(var(--u)*3.6)" })]),
        U.list([U.row({ title: "Nomor", right: dev.num || "-" }), U.row({ title: "No. Rekening", right: String(dev.rek || "-") }), U.row({ title: "Email", right: dev.mail || "-" })]),
        U.gap(),
        U.list([U.row({ icon: "share", iconBg: "#007aff", title: "Bagikan kontak ke pemain terdekat", onClick: function () { P.send("ct_share"); } })]),
        U.foot("Pemain dalam jarak 3 meter yang memegang HP akan menerima kartu kontakmu.")
      ])];
    }, {});
  }

  /* ------------------------------------------------------------------ */
  /* TELEPON                                                             */
  /* ------------------------------------------------------------------ */
  P.app("phone", {
    keys: ["recents"], uses: ["contacts"],
    open: function (ctx) {
      ctx.st.tab = ctx.st.tab || "recents";
      ctx.st.dial = ctx.st.dial || "";
      ctx.push(function (c, st) {
        var tab = c.st.tab, body, nav;
        var missed = P.state.badges.phone || 0;
        if (tab === "keypad") { nav = null; body = keypad(c); }
        else if (tab === "recents") {
          var seg = U.seg([["all", "Semua"], ["missed", "Tak Terjawab"]], c.st.rf || "all", function (v) { c.st.rf = v; c.refresh(); });
          nav = U.nav({ large: "Terbaru", right: [U.navBtn("Hapus", function () { U.confirm("Hapus riwayat?", "Semua riwayat panggilan akan dihapus.", "Hapus", function () { P.send("calllog_clear"); }, true); })], extra: seg });
          body = U.body(recents(c));
        } else if (tab === "contacts") {
          var srch = st.srch || (st.srch = U.search("Cari", "", function (v) { c.st.q = v; c.refresh(); }));
          nav = U.nav({ large: "Kontak", right: [U.navIcon("plus", function () { contactForm(c, null); })], extra: srch });
          var l = P.ctx("contacts").cache.contacts;
          body = U.body(l ? contactRows(c, l.items || [], c.st.q, function (ct) { contactDetail(c, ct); }) : [U.loading()]);
        } else {
          nav = U.nav({ large: "Favorit" });
          var favs = contacts().filter(function (x) { return +x.fav; });
          body = U.body(favs.length ? [U.list(favs.map(function (x) {
            return U.row({ av: U.avatar(x.n, null, "sm"), title: nameOf(x.n), sub: x.num, right: h("span", { style: "color:var(--tint)" }, ic("phone")), onClick: function () { call(x.num); } });
          }))] : [U.empty("star", "Belum ada favorit", "Tandai kontak sebagai favorit dari detail kontak.")]);
        }
        var tabs = U.tabs([["fav", "Favorit", "star"], ["recents", "Terbaru", "clock", missed || null], ["contacts", "Kontak", "user"], ["keypad", "Papan", "keypad"]], tab, function (t) { c.st.tab = t; st.srch = null; c.refresh(); });
        return [nav, body, tabs];
      }, {});
    },
    onBadge: function (ctx) { ctx.refresh(); }
  });
  function recents(c) {
    var d = c.cache.recents;
    if (!d) return [U.loading()];
    var items = (d.items || []).filter(function (x) { return c.st.rf !== "missed" || +x.st === 0; });
    if (!items.length) return [U.empty("clock", "Tidak ada riwayat", "Panggilan masuk & keluar tampil di sini.")];
    return [U.list(items.map(function (x) {
      var missed = +x.st === 0 && +x.dir === 1;
      var nm = displayName(x.num, x.n);
      var sub = (+x.dir ? "masuk" : "keluar") + (+x.st === 1 ? " · " + U.dur(x.dur) : +x.st === 0 ? (+x.dir ? " · tak terjawab" : " · tidak diangkat") : " · ditolak");
      var row = U.row({ lead: h("div", { class: "rw-lead" }, +x.dir ? null : ic("arrowUR")), title: nm, sub: sub, right: U.whenShort(x.ts), cls: missed ? "danger" : "", onClick: function () { call(x.num); } });
      return row;
    }))];
  }
  function keypad(c) {
    var num = h("div", { class: "dl-num", text: c.st.dial });
    var who = h("div", { class: "dl-who" });
    function upd() { num.textContent = c.st.dial; var ct = contactByNum(c.st.dial); who.textContent = ct ? nameOf(ct.n) : (c.st.dial.length > 3 ? "Tambah Nomor" : ""); }
    tap(who, function () { if (!contactByNum(c.st.dial) && c.st.dial.length > 3) contactForm(c, null, { num: c.st.dial }); });
    var L = ["", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ", "", "+", ""];
    var keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
    var pad = h("div", { class: "dl-pad" }, keys.map(function (k, i) {
      return tap(h("button", { type: "button" }, [k, h("small", { text: L[i] })]), function () { if (c.st.dial.length < 16) { c.st.dial += k; P.sfx.tick(); upd(); } });
    }));
    var del = tap(h("button", { type: "button", class: "dl-del" }, U.svg('<path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/>')), function () { c.st.dial = c.st.dial.slice(0, -1); upd(); });
    U.hold(del, function () { c.st.dial = ""; upd(); });
    var callBtn = tap(h("button", { type: "button", class: "dl-call" }, U.svg(P.I.phoneF)), function () {
      if (!c.st.dial) { var r = c.cache.recents; if (r && r.items && r.items[0]) { c.st.dial = r.items[0].num; upd(); } return; }
      call(c.st.dial);
    });
    upd();
    return h("div", { class: "ep-dial", style: "padding-top:calc(var(--u)*6)" }, [num, who, pad, h("div", { class: "dl-row" }, [h("span"), callBtn, c.st.dial ? del : h("span")])]);
  }

  /* ------------------------------------------------------------------ */
  /* PESAN                                                               */
  /* ------------------------------------------------------------------ */
  var ATT = { TEXT: 0, IMG: 1, LOC: 2, MONEY: 3, CONTACT: 4 };
  P.app("messages", {
    keys: ["threads", "thread", "msg_new"], uses: ["contacts"], badgeClear: false,
    open: function (ctx, arg) {
      ctx.st.q = "";
      ctx.push(threadList, {});
      if (arg && typeof arg === "string") openThread(ctx, arg);
    },
    data: function (ctx, d) {
      if (d.app === "msg_new") {
        // pesan baru masuk / terkirim -> tambah ke thread yang sama
        var t = ctx.cache.thread;
        if (t && String(t.num) === String(d.num) && d.m) { t.items = (t.items || []).concat([d.m]); if (d.m.me) delete ctx.st.pending; }
        ctx.refresh();
        return;
      }
      ctx.refresh();
    },
    isViewing: function (ctx, n) { var top = ctx.top(); return !!(top && top.st.num && String(top.st.num) === String(n.key) && P.state.open); }
  });
  function threadList(c, st) {
    var d = c.cache.threads;
    var srch = st.srch || (st.srch = U.search("Cari", "", function (v) { c.st.q = v; c.refresh(); }));
    var body;
    if (!d) body = [U.loading()];
    else {
      var q = (c.st.q || "").toLowerCase();
      var items = (d.items || []).filter(function (x) { var nm = displayName(x.num, x.n).toLowerCase(); return !q || nm.indexOf(q) >= 0 || String(x.num).indexOf(q) >= 0 || dec(x.last).toLowerCase().indexOf(q) >= 0; });
      body = items.length ? [U.list(items.map(function (x) {
        var nm = displayName(x.num, x.n);
        var prev = +x.att === ATT.IMG ? "🖼 Foto" : +x.att === ATT.LOC ? "📍 Lokasi" : +x.att === ATT.MONEY ? "💵 Transfer uang" : dec(x.last);
        var r = U.row({ av: U.avatar(nm, null), title: nm, bold: +x.un > 0, sub: (+x.mine ? "Kamu: " : "") + prev, wrap: true,
          right: h("div", { style: "display:flex;flex-direction:column;align-items:flex-end;gap:calc(var(--u)*.6)" }, [h("span", { text: U.whenShort(x.ts) }), +x.un > 0 ? h("span", { class: "count", text: String(x.un) }) : null]),
          onClick: function () { openThread(c, x.num); }, onHold: function () {
            U.actions(nm, [{ label: "Hapus Percakapan", style: "r", fn: function () { U.confirm("Hapus percakapan?", "Pesan dengan " + nm + " akan dihapus dari HP kamu.", "Hapus", function () { P.send("thread_del", -1, x.num); }, true); } }]);
          } });
        return r;
      }), "plain")] : [U.empty("msg", q ? "Tidak ditemukan" : "Belum ada pesan", q ? null : "Ketuk ikon tulis untuk mengirim pesan baru.")];
    }
    return [U.nav({ large: "Pesan", left: [U.navBtn("Edit", function () { U.toast("Tahan percakapan untuk menghapus"); })], right: [U.navIcon("compose", function () { newMessage(c); })], extra: srch }), U.body(body)];
  }
  function newMessage(c) {
    var to = U.input({ ph: "Nomor telepon atau nama kontak", max: 30 });
    var list = h("div");
    function fill() {
      U.clear(list);
      var q = to.value.toLowerCase();
      var l = contacts().filter(function (x) { return !q || nameOf(x.n).toLowerCase().indexOf(q) >= 0 || String(x.num).indexOf(q) >= 0; }).slice(0, 40);
      if (l.length) list.appendChild(U.list(l.map(function (x) { return U.row({ av: U.avatar(x.n, null, "sm"), title: nameOf(x.n), sub: x.num, onClick: function () { sh.close(); openThread(c, x.num); } }); })));
    }
    to.addEventListener("input", fill);
    var sh = U.sheet({ title: "Pesan Baru", tall: true, left: { label: "Batal" }, right: { label: "Lanjut", fn: function (close) {
      var v = to.value.trim(); var ct = null;
      contacts().forEach(function (x) { if (nameOf(x.n).toLowerCase() === v.toLowerCase()) ct = x; });
      var num = ct ? ct.num : cleanNum(v);
      if (num.length < 3) return U.toast("Masukkan nomor yang valid", 1);
      close(); openThread(c, num);
    } }, body: h("div", null, [h("div", { class: "ep-form" }, U.field("Kepada", to)), list]) });
    fill(); setTimeout(function () { to.focus(); }, 380);
  }
  function openThread(c, num) {
    num = cleanNum(num);
    if (!num) return;
    var t = c.cache.thread;
    if (!t || String(t.num) !== num) c.cache.thread = { num: num, items: null };
    c.push(threadView, { num: num, stickBottom: true, white: true });
    P.send("thread", -1, num);
  }
  function bubble(m, prevTs) {
    var out = [];
    if (!prevTs || m.ts - prevTs > 1800) out.push(h("div", { class: "ep-daysep", text: U.dayLabel(m.ts) + " " + U.hhmm(m.ts) }));
    var cl = "ep-bub " + (+m.me ? "me" : "them");
    var a = +m.att, ad = dec(m.ad || "");
    if (a === ATT.IMG && U.imgUrl(ad)) {
      var b = h("div", { class: cl + " media" }, U.img(ad));
      tap(b, function () { viewImage(ad); });
      out.push(b);
      if (m.tx) out.push(h("div", { class: cl, text: dec(m.tx) }));
    } else if (a === ATT.LOC) {
      var p = ad.split(",");
      out.push(tap(h("div", { class: cl + " special" }, [h("div", { class: "sp-ic" }, ic("loc")), h("div", null, [h("b", { text: "Lokasi" }), h("small", { text: dec(m.tx) || "Ketuk untuk memasang GPS" })])]), function () {
        P.sendJ("gps", -1, { x: +p[0], y: +p[1], z: +p[2], n: enc(dec(m.tx) || "Lokasi dibagikan") });
      }));
    } else if (a === ATT.MONEY) {
      out.push(h("div", { class: cl + " special" }, [h("div", { class: "sp-ic" }, ic("money")), h("div", null, [h("b", { text: U.money(+ad) }), h("small", { text: +m.me ? "Transfer terkirim" : "Transfer diterima" })])]));
    } else if (a === ATT.CONTACT) {
      var q = ad.split("|");
      out.push(tap(h("div", { class: cl + " special" }, [h("div", { class: "sp-ic" }, ic("user")), h("div", null, [h("b", { text: nameOf(q[1] || q[0]) }), h("small", { text: q[0] + " · simpan" })])]), function () { P.open("contacts", "add:" + q[0] + "|" + (q[1] || "")); }));
    } else {
      out.push(h("div", { class: cl, text: dec(m.tx) }));
    }
    return out;
  }
  function viewImage(url) {
    var sh = U.sheet({ title: "Foto", tall: true, left: { label: "Tutup" }, right: { label: "Simpan", fn: function (close) { P.sendJ("photo_add", -1, { url: enc(url), cap: "" }); close(); } }, body: h("div", { class: "ep-imgfull" }, U.img(url)) });
    return sh;
  }
  P.viewImage = viewImage;
  function threadView(c, st) {
    var t = c.cache.thread && String(c.cache.thread.num) === st.num ? c.cache.thread : null;
    var nm = displayName(st.num, t && t.n);
    var msgs = h("div", { class: "ep-chat" });
    if (!t || !t.items) msgs.appendChild(U.loading());
    else {
      if (!t.items.length) msgs.appendChild(h("div", { class: "ep-daysep", text: "Belum ada pesan. Sapa " + nm + "!" }));
      var prev = 0;
      t.items.forEach(function (m) { U.add(msgs, bubble(m, prev)); prev = +m.ts; });
      var last = t.items[t.items.length - 1];
      if (last && +last.me) msgs.appendChild(h("div", { class: "ep-read", text: +last.rd ? "Dibaca" : "Terkirim" }));
    }
    if (st.pending) U.add(msgs, [h("div", { class: "ep-bub me", style: "opacity:.55", text: st.pending })]);
    // composer (dipertahankan antar refresh agar keyboard tidak tertutup)
    if (!st.comp) {
      var inp = h("textarea", { class: "cp-in", rows: "1", placeholder: "Pesan", maxlength: "300" });
      var sendB = h("button", { type: "button", class: "cp-send" }, ic("up"));
      var plus = tap(h("button", { type: "button", class: "cp-plus" }, ic("plus")), function () { attach(c, st); });
      inp.addEventListener("input", function () { inp.style.height = "auto"; inp.style.height = Math.min(inp.scrollHeight, 140) + "px"; sendB.disabled = !inp.value.trim(); });
      tap(sendB, function () {
        var v = inp.value.trim(); if (!v) return;
        P.sendJ("msg", -1, { to: st.num, tx: enc(v), at: 0, ad: "" });
        st.pending = v; inp.value = ""; inp.style.height = "auto"; sendB.disabled = true; P.sfx.sent(); c.refresh();
        setTimeout(function () { if (st.pending === v) { delete st.pending; c.refresh(); } }, 5000);
      });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendB.click(); } });
      sendB.disabled = true;
      st.comp = h("div", { class: "ep-composer" }, [plus, inp, sendB]);
    }
    var nav = U.nav({ back: "Pesan", title: nm, sub: nm !== st.num ? st.num : null, right: [U.navIcon("phone", function () { call(st.num); })] });
    var body = U.body(msgs, "flush");
    body.style.background = "var(--bg2)";
    return [nav, body, st.comp];
  }
  function attach(c, st) {
    U.actions("Lampiran", [
      { label: "Foto dari galeri", fn: function () { pickPhoto(function (url) { P.sendJ("msg", -1, { to: st.num, tx: "", at: ATT.IMG, ad: enc(url) }); }); } },
      { label: "Foto dari link (URL)", fn: function () { U.prompt("Kirim foto", "Tempel link gambar (https://...)", { ph: "https://", max: 300 }, function (v) { if (!U.imgUrl(v)) return U.toast("Link tidak valid", 1); P.sendJ("msg", -1, { to: st.num, tx: "", at: ATT.IMG, ad: enc(v) }); }); } },
      { label: "Bagikan lokasi saya", fn: function () { P.sendJ("msg", -1, { to: st.num, tx: "", at: ATT.LOC, ad: "" }); } },
      { label: "Kirim uang (bank)", fn: function () { U.prompt("Kirim uang", "Jumlah akan dipotong dari saldo bank.", { ph: "Jumlah", type: "number", max: 10 }, function (v) { v = Math.floor(+v); if (!(v > 0)) return U.toast("Jumlah tidak valid", 1); P.sendJ("msg", -1, { to: st.num, tx: "", at: ATT.MONEY, ad: String(v) }); }); } },
      { label: "Kirim kartu kontak saya", fn: function () { P.sendJ("msg", -1, { to: st.num, tx: "", at: ATT.CONTACT, ad: "" }); } }
    ]);
  }
  /* pemilih foto dari aplikasi Foto */
  function pickPhoto(cb) {
    var cache = P.ctx("photos").cache.photos;
    var grid = h("div", { class: "ep-grid3" });
    function fill(d) {
      U.clear(grid);
      var items = (d && d.items) || [];
      if (!items.length) { grid.style.display = "block"; grid.appendChild(U.empty("image", "Galeri kosong", "Simpan foto lewat aplikasi Foto (link gambar).")); return; }
      items.forEach(function (it) { grid.appendChild(tap(h("div", null, U.img(it.url)), function () { sh.close(); cb(dec(it.url)); })); });
    }
    var sh = U.sheet({ title: "Pilih Foto", tall: true, left: { label: "Batal" }, body: grid,
      right: P.media && P.media.canPick() && P.uploadFromDevice ? { label: "Dari HP", fn: function (close) { close(); P.uploadFromDevice(function (url) { cb(url); }); } } : null });
    fill(cache);
    P.pickerCb = function (d) { fill(d); };
    P.send("photos_get");
  }
  P.pickPhoto = pickPhoto;

  /* ------------------------------------------------------------------ */
  /* MAIL                                                                */
  /* ------------------------------------------------------------------ */
  P.app("mail", {
    keys: ["mail", "mailview"], badgeClear: false,
    open: function (ctx) {
      ctx.st.box = ctx.st.box || "in";
      ctx.push(function (c, st) {
        var d = c.cache.mail;
        var box = c.st.box;
        var seg = U.seg([["in", "Kotak Masuk"], ["sent", "Terkirim"]], box, function (v) { c.st.box = v; c.refresh(); });
        var body;
        if (!d) body = [U.loading()];
        else {
          var items = (d.items || []).filter(function (m) { return (box === "sent") ? +m.out === 1 : +m.out !== 1; });
          body = items.length ? [U.list(items.map(function (m) {
            return U.row({ lead: +m.rd || +m.out ? h("span", { style: "width:calc(var(--u)*1.4)" }) : h("span", { class: "unread-dot" }), title: dec(+m.out ? m.to : m.fromn || m.from), bold: !+m.rd && !+m.out, sub: dec(m.sub) + " — " + dec(m.pre), wrap: true, right: U.whenShort(m.ts), onClick: function () { openMail(c, m); } });
          }), "plain")] : [U.empty("inbox", box === "sent" ? "Belum ada email terkirim" : "Kotak masuk kosong", d.addr ? "Alamatmu: " + dec(d.addr) : null)];
        }
        return [U.nav({ large: box === "sent" ? "Terkirim" : "Kotak Masuk", largeSub: d && d.addr ? dec(d.addr) : null, right: [U.navIcon("compose", function () { compose(c); })], extra: seg }), U.body(body)];
      }, {});
    },
    data: function (ctx) { ctx.refresh(); }
  });
  function openMail(c, m) {
    if (!+m.rd && !+m.out) { m.rd = 1; }
    c.cache.mailview = null;
    P.send("mail_view", +m.id);
    c.push(function (c2, st) {
      var v = c2.cache.mailview && +c2.cache.mailview.id === +m.id ? c2.cache.mailview : null;
      var body = v ? h("div", { class: "ep-article", style: "padding-top:calc(var(--u)*1)" }, [
        h("h2", { text: dec(v.sub) || "(tanpa subjek)" }),
        h("div", { class: "meta" }, [h("div", { text: "Dari: " + dec(v.fromn ? v.fromn + " <" + v.from + ">" : v.from) }), h("div", { text: "Kepada: " + dec(v.to) }), h("div", { text: U.dayLabel(v.ts) + " " + U.hhmm(v.ts) })]),
        dec(v.body)
      ]) : U.loading();
      return [U.nav({ back: "Mail", right: [
        U.navIcon("trash", function () { U.confirm("Hapus email?", null, "Hapus", function () { P.send("mail_del", +m.id); c2.pop(); }, true); }),
        v && !+m.out ? U.navIcon("send", function () { compose(c2, { to: dec(v.from), sub: "Re: " + dec(v.sub) }); }) : null
      ] }), U.body(body)];
    }, { white: true });
  }
  function compose(c, pre) {
    pre = pre || {};
    var to = U.input({ ph: "nama@eaglemail.id", max: 60, value: pre.to || "" });
    var sub = U.input({ ph: "Subjek", max: 60, value: pre.sub || "" });
    var body = U.input({ ph: "Tulis email…", area: true, max: 1000, rows: 8 });
    U.sheet({ title: "Email Baru", tall: true, left: { label: "Batal" }, right: { label: "Kirim", fn: function (close) {
      var t = to.value.trim().toLowerCase();
      if (t.indexOf("@") < 1) return U.toast("Alamat email tidak valid", 1);
      if (!body.value.trim()) return U.toast("Isi email kosong", 1);
      P.sendJ("mail_send", -1, { to: enc(t), sub: enc(sub.value.trim()), body: enc(body.value.trim()) });
      close();
    } }, body: h("div", { class: "ep-form" }, [U.field("Kepada", to), U.field("Subjek", sub), body]) });
  }
})();
