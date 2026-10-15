/* =====================================================================
   EAGLE PHONE v24 — aplikasi kota
   Bank · Garasi · Peta (GPS) · Layanan (Polisi/EMS/Montir/Trans/…) ·
   Cuaca · Kesehatan · KTP
   ===================================================================== */
(function () {
  "use strict";
  var P = window.EPhone; if (!P) return;
  var U = P.ui, h = U.h, ic = U.ic, tap = U.tap, dec = U.dec, enc = U.enc, nameOf = U.nameOf;

  /* ------------------------------------------------------------------ */
  /* BANK                                                                */
  /* ------------------------------------------------------------------ */
  P.app("bank", {
    keys: ["bank", "bank_chk"],
    open: function (ctx, arg) {
      ctx.st.tab = "home";
      ctx.push(bankRoot, {});
      if (typeof arg === "string" && arg.indexOf("pay:") === 0) setTimeout(function () { transfer(ctx, arg.slice(4)); }, 250);
    },
    data: function (ctx, d) {
      if (d.app === "bank_chk") { if (ctx.st.onChk) ctx.st.onChk(d); return; }
      ctx.refresh();
    }
  });
  function fmtRek(r) { r = String(r || ""); return r.replace(/(\d{3})(?=\d)/g, "$1 "); }
  function bankRoot(c, st) {
    var d = c.cache.bank, dev = P.state.dev;
    var tab = c.st.tab, body = [];
    if (!d) body = [U.loading()];
    else if (tab === "home") {
      body = [
        h("div", { class: "ep-bankcard" }, [
          h("div", { class: "bc-top" }, [h("b", { text: "EAGLE Bank" }), h("span", { text: "DEBIT" })]),
          h("div", { class: "bc-chip" }),
          h("div", { class: "bc-num", text: "•••• " + fmtRek(d.rek) }),
          h("div", { class: "bc-foot" }, [h("span", { text: nameOf(d.name || dev.name) }), h("span", { text: "VALID 12/30" })])
        ]),
        U.card(h("div", { class: "ep-balance" }, [h("div", null, [h("small", { text: "Saldo" }), h("b", { text: U.money(d.bal) })]), U.btn("Kirim", function () { transfer(c, ""); }, "black")])),
        U.card(h("div", { class: "ep-balance" }, [h("div", null, [h("small", { text: "Uang tunai" }), h("b", { text: U.money(d.cash), style: "font-size:calc(var(--u)*3.2)" })]), h("span", { class: "ep-muted", style: "font-size:calc(var(--u)*2)", text: "Rek. " + fmtRek(d.rek) })])),
        U.list([
          U.row({ icon: "repost", iconBg: "#007aff", title: "Transfer", sub: "Ke no. rekening / no. HP / kontak", chev: true, onClick: function () { transfer(c, ""); } }),
          U.row({ icon: "receipt", iconBg: "#ff9500", title: "Tagihan", right: d.inv && d.inv.length ? h("span", { class: "count", style: "background:var(--red)", text: String(d.inv.length) }) : null, chev: true, onClick: function () { c.st.tab = "inv"; c.refresh(); } })
        ]),
        h("div", { class: "ep-row-flex", style: "justify-content:space-between;padding:calc(var(--u)*2) calc(var(--u)*2.4) calc(var(--u)*.8)" }, [h("b", { text: "Transaksi Terbaru", style: "font-size:calc(var(--u)*2.9)" }), tap(h("span", { class: "ep-link", text: "Semua ›" }), function () { c.st.tab = "tx"; c.refresh(); })]),
        txList(d.tx, 5)
      ];
    } else if (tab === "tx") body = [txList(d.tx, 100)];
    else body = [invList(c, d)];
    var nav = tab === "home" ? U.nav({ large: "Dompet", right: [U.navIcon("refresh", function () { P.send("open", -1, "bank"); })] }) :
      U.nav({ large: tab === "tx" ? "Riwayat" : "Tagihan", left: [U.navBtn("‹ Dompet", function () { c.st.tab = "home"; c.refresh(); })] });
    return [nav, U.body(body), U.tabs([["home", "Beranda", "home"], ["tx", "Riwayat", "history"], ["inv", "Tagihan", "receipt", d && d.inv && d.inv.length ? d.inv.length : null]], tab, function (t) { c.st.tab = t; c.refresh(); })];
  }
  function txList(tx, n) {
    tx = (tx || []).slice(0, n);
    if (!tx.length) return U.empty("history", "Belum ada transaksi");
    return U.list(tx.map(function (t) {
      var amt = +t.amt;
      return U.row({ av: U.avatar(t.tt || "?", null, "sm"), title: dec(t.tt), sub: dec(t.sub) + " · " + U.whenShort(t.ts), right: h("span", { class: amt > 0 ? "ep-amt-in" : "ep-amt-out", text: (amt > 0 ? "+" : "") + U.money(amt) }) });
    }));
  }
  function invList(c, d) {
    var inv = d.inv || [];
    if (!inv.length) return U.empty("receipt", "Tidak ada tagihan", "Tagihan dari faksi (polisi, EMS, dll) tampil di sini.");
    return U.list(inv.map(function (x) {
      return U.row({ icon: "receipt", iconBg: "#ff9500", title: dec(x.n), sub: dec(x.fn || "Faksi"), right: U.btn(U.money(x.cost), function () {
        U.confirm("Bayar tagihan?", dec(x.n) + " sebesar " + U.money(x.cost) + " dari saldo bank.", "Bayar", function () { P.send("inv_pay", +x.id); });
      }, "sm") });
    }));
  }
  function transfer(c, pre) {
    var to = U.input({ ph: "No. rekening atau no. HP", max: 16, type: "tel", mode: "numeric", value: pre || "" });
    var amt = U.input({ ph: "Jumlah ($)", type: "number", mode: "numeric", max: 10 });
    var note = U.input({ ph: "Catatan (opsional)", max: 40 });
    var cts = P.contacts.list().slice(0, 30);
    var pick = cts.length ? U.list(cts.map(function (x) { return U.row({ av: U.avatar(x.n, null, "sm"), title: nameOf(x.n), sub: x.num, onClick: function () { to.value = x.num; } }); })) : null;
    var busy = false;
    var sh = U.sheet({ title: "Transfer", tall: true, left: { label: "Batal" }, right: { label: "Lanjut", fn: function (close) {
      if (busy) return;
      var t = String(to.value).replace(/[^0-9]/g, ""), a = Math.floor(+amt.value);
      if (t.length < 3) return U.toast("Tujuan tidak valid", 1);
      if (!(a > 0)) return U.toast("Jumlah tidak valid", 1);
      busy = true;
      c.st.onChk = function (d) {
        busy = false; c.st.onChk = null;
        if (!+d.ok) return U.toast(dec(d.m || "Tujuan tidak ditemukan"), 1);
        U.confirm("Kirim " + U.money(a) + "?", "Ke " + nameOf(d.name) + " (rek " + fmtRek(d.rek) + ")", "Kirim", function () {
          P.sendJ("transfer", -1, { rek: String(d.rek), amt: a, note: enc(note.value.trim()) }); close();
        });
      };
      P.sendJ("tf_check", -1, { to: t });
      setTimeout(function () { busy = false; }, 4000);
    } }, body: h("div", null, [h("div", { class: "ep-form" }, [U.field("Tujuan", to), U.field("Jumlah", amt), U.field("Catatan", note)]), pick ? U.sec("Kontak") : null, pick]) });
    setTimeout(function () { (pre ? amt : to).focus(); }, 380);
    return sh;
  }

  /* ------------------------------------------------------------------ */
  /* GARASI                                                              */
  /* ------------------------------------------------------------------ */
  P.app("garage", {
    keys: ["garage"],
    open: function (ctx) {
      ctx.push(function (c) {
        var d = c.cache.garage;
        var body = !d ? [U.loading()] : (d.items && d.items.length ? [U.list(d.items.map(function (v) {
          var pic = h("div", { style: "width:calc(var(--u)*10);height:calc(var(--u)*6.4);border-radius:calc(var(--u)*1.2);overflow:hidden;background:var(--fill);flex:none" }, U.img("veh:" + v.m));
          var pill = +v.imp ? U.pill("Samsat", "red") : +v.ins ? U.pill("Asuransi", "orange") : +v.sp ? U.pill("Di luar", "green") : U.pill("Garasi", "blue");
          return U.row({ lead: pic, title: dec(v.n), sub: "Plat " + (dec(v.pl) || "-"), right: pill, chev: true, onClick: function () { vehDetail(c, v); } });
        }))] : [U.empty("car", "Tidak ada kendaraan", "Kendaraan pribadimu akan tampil di sini.")]);
        return [U.nav({ large: "Garasi", largeSub: d && d.items ? d.items.length + " kendaraan" : null, right: [U.navIcon("refresh", function () { P.send("open", -1, "garage"); })] }), U.body(body)];
      }, {});
    }
  });
  function meter(label, val, color) {
    val = Math.max(0, Math.min(100, Math.round(+val || 0)));
    return h("div", { style: "margin-bottom:calc(var(--u)*1.4)" }, [h("div", { class: "ep-row-flex", style: "justify-content:space-between;font-size:calc(var(--u)*2.3)" }, [h("span", { text: label }), h("b", { text: val + "%" })]), h("div", { class: "ep-meter" }, h("i", { style: "width:" + val + "%;background:" + color }))]);
  }
  function vehDetail(c, v) {
    c.push(function (c2) {
      var d = c2.cache.garage, cur = v;
      if (d && d.items) d.items.forEach(function (x) { if (+x.id === +v.id) cur = x; });
      return [U.nav({ back: "Garasi", title: dec(cur.n) }), U.body([
        h("div", { style: "margin:0 calc(var(--u)*2) calc(var(--u)*1.4);border-radius:calc(var(--u)*2.4);overflow:hidden;background:var(--fill);height:calc(var(--u)*22)" }, U.img("veh:" + cur.m)),
        U.card([meter("Bensin", cur.fu, "linear-gradient(90deg,#ff9f0a,#ffd60a)"), meter("Kondisi mesin", cur.hp, "linear-gradient(90deg,#34c759,#30d158)")]),
        U.list([U.row({ title: "Plat nomor", right: dec(cur.pl) || "-" }), U.row({ title: "Status", right: dec(cur.st) }), U.row({ title: "Kunci", right: +cur.lk ? "Terkunci" : "Terbuka" })]),
        U.gap(),
        h("div", { class: "ep-form" }, [
          U.btn("Lacak di GPS", function () { P.send("veh_track", +cur.id); }, "full", "nav"),
          +cur.sp ? U.btn(+cur.lk ? "Buka kunci (remote)" : "Kunci (remote)", function () { P.send("veh_lock", +cur.id); }, "full gray", +cur.lk ? "unlock" : "lock") : null
        ])
      ])];
    }, {});
  }

  /* ------------------------------------------------------------------ */
  /* PETA / GPS                                                          */
  /* ------------------------------------------------------------------ */
  var SA = 3000; // koordinat dunia -3000..3000
  function mapXY(x, y) { return [((+x + SA) / (2 * SA)) * 100, ((SA - +y) / (2 * SA)) * 100]; }
  function mapSvg() {
    // bentuk daratan San Andreas yang disederhanakan (bukan gambar asli GTA)
    return U.svg(
      '<rect width="100" height="100" fill="#8cc4e3"/>' +
      '<path d="M8 8 L36 5 L44 10 L55 7 L80 6 L94 12 L95 40 L92 58 L96 70 L93 92 L70 95 L52 93 L46 88 L30 92 L14 90 L10 76 L4 64 L8 50 L3 38 L6 22 Z" fill="#dfe8c9"/>' +
      '<path d="M52 8 L92 10 L93 40 L60 44 L52 30 Z" fill="#e8dcb8"/>' +
      '<path d="M5 22 L30 20 L34 44 L8 50 L3 38 Z" fill="#cfe0b8"/>' +
      '<path d="M55 58 L92 58 L93 90 L60 92 L52 80 Z" fill="#e7e2d4"/>' +
      '<path d="M40 44 C45 50 48 60 44 70 C40 78 34 80 30 88" stroke="#a9c7de" stroke-width="2.4" fill="none"/>' +
      '<path d="M20 48 L50 50 L82 52 M62 20 L60 60 L74 88 M18 30 L34 60 L52 76" stroke="#fff" stroke-width=".9" fill="none" opacity=".9"/>' +
      '<text x="70" y="78" font-size="4" fill="#6b6b6b" font-weight="700">LOS SANTOS</text>' +
      '<text x="9" y="34" font-size="4" fill="#6b6b6b" font-weight="700">SAN FIERRO</text>' +
      '<text x="62" y="26" font-size="4" fill="#6b6b6b" font-weight="700">LAS VENTURAS</text>', "mp-land", "0 0 100 100");
  }
  P.app("maps", {
    keys: ["maps"],
    open: function (ctx) {
      ctx.st.cat = ctx.st.cat || 0;
      ctx.push(function (c, st) {
        var d = c.cache.maps;
        var map = h("div", { class: "ep-map" }, mapSvg());
        map.firstChild.setAttribute("preserveAspectRatio", "none");
        map.firstChild.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
        var body = [];
        if (!d) body = [map, U.loading()];
        else {
          var me = mapXY(d.x, d.y);
          (d.pins || []).forEach(function (p) { var q = mapXY(p.x, p.y); map.appendChild(h("i", { class: "mp-pin saved", style: "left:" + q[0] + "%;top:" + q[1] + "%" })); });
          if (d.wp) { var w = mapXY(d.wp.x, d.wp.y); map.appendChild(h("i", { class: "mp-pin", style: "left:" + w[0] + "%;top:" + w[1] + "%" })); }
          map.appendChild(h("i", { class: "mp-me", style: "left:" + me[0] + "%;top:" + me[1] + "%" }));
          map.appendChild(h("div", { class: "mp-zone", text: "📍 " + dec(d.zone || "San Andreas") }));
          var dist = function (x) { var dx = +x.x - d.x, dy = +x.y - d.y; var m = Math.sqrt(dx * dx + dy * dy); return m >= 1000 ? (m / 1000).toFixed(1) + " km" : Math.round(m) + " m"; };
          var cats = d.cats || [];
          var chips = U.chips([["near", "Terdekat"], ["pins", "★ Tersimpan"]].concat(cats.map(function (k, i) { return [i, dec(k.n)]; })), c.st.cat, function (v) { c.st.cat = v; c.refresh(); });
          var list;
          if (c.st.cat === "near") {
            var NEAR = [["ATM", "card", "#34c759"], ["Garasi umum", "car", "#5a8dee"], ["Tong sampah", "trash", "#8e8e93"], ["Pom bensin", "fuel", "#ff9500"], ["Bengkel Modshop", "wrench", "#ff3b30"]];
            list = h("div", null, [U.list(NEAR.map(function (n, i) {
              return U.row({ icon: n[1], iconBg: n[2], title: n[0] + " terdekat", right: h("span", { style: "color:var(--tint)" }, ic("nav")), onClick: function () { P.send("gps_near", i); } });
            })), U.gap(), U.list([U.row({ icon: "list", iconBg: "#5856d6", title: "Menu GPS lengkap", sub: "Warung, rumah saya, pertokoan, sinyal EMS", chev: true, onClick: function () { P.send("gps_legacy"); } })])]);
          } else if (c.st.cat === "pins") {
            list = (d.pins || []).length ? U.list(d.pins.map(function (p) {
              return U.row({ icon: "star", iconBg: "#ff9500", title: dec(p.n), sub: dist(p), right: h("span", { style: "color:var(--tint)" }, ic("nav")), onClick: function () { P.sendJ("gps", -1, { x: +p.x, y: +p.y, z: +p.z, n: p.n }); }, onHold: function () {
                U.actions(dec(p.n), [{ label: "Pasang GPS", fn: function () { P.sendJ("gps", -1, { x: +p.x, y: +p.y, z: +p.z, n: p.n }); } }, { label: "Hapus", style: "r", fn: function () { P.send("pin_del", +p.id); } }]);
              } });
            })) : U.empty("star", "Belum ada lokasi tersimpan", "Ketuk “Simpan lokasi ini”.");
          } else {
            var cat = cats[+c.st.cat] || { items: [] };
            var items = (cat.items || []).slice().sort(function (a, b) { var da = (a.x - d.x) * (a.x - d.x) + (a.y - d.y) * (a.y - d.y), db = (b.x - d.x) * (b.x - d.x) + (b.y - d.y) * (b.y - d.y); return da - db; });
            list = U.list(items.map(function (p) {
              return U.row({ icon: "loc", iconBg: "#34c759", title: dec(p.n), sub: dist(p), right: h("span", { style: "color:var(--tint)" }, ic("nav")), onClick: function () { P.sendJ("gps", -1, { x: +p.x, y: +p.y, z: +p.z, n: p.n }); } });
            }));
          }
          body = [map, h("div", { class: "ep-row-flex", style: "padding:0 calc(var(--u)*2) calc(var(--u)*1.2);gap:calc(var(--u)*1)" }, [
            U.btn("Simpan lokasi ini", function () { U.prompt("Simpan lokasi", "Nama lokasi", { ph: "contoh: Rumah", max: 30 }, function (v) { if (String(v || "").trim()) P.send("pin_add", -1, enc(String(v).trim())); }); }, "sm tinted", "star"),
            d.wp ? U.btn("Hapus GPS", function () { P.send("gps_off"); }, "sm gray", "x") : U.btn("Bagikan", function () { shareLoc(); }, "sm gray", "share")
          ]), chips, list];
        }
        return [U.nav({ large: "Peta", right: [U.navIcon("refresh", function () { P.send("open", -1, "maps"); })] }), U.body(body)];
      }, {});
    }
  });
  function shareLoc() {
    var l = P.contacts.list();
    if (!l.length) return U.toast("Belum ada kontak", 1);
    U.actions("Bagikan lokasi ke", l.slice(0, 10).map(function (x) { return { label: nameOf(x.n), fn: function () { P.send("share_loc", -1, x.num); } }; }));
  }

  /* ------------------------------------------------------------------ */
  /* LAYANAN (Polisi, EMS, Montir, Trans, Pemerintah, Pedagang)          */
  /* ------------------------------------------------------------------ */
  var SVC = {
    police: { n: "Polisi", icon: "shield", bg: "#0a84ff", d: "Laporan kejahatan & darurat" },
    ems: { n: "EMS / Medis", icon: "cross", bg: "#ff3b30", d: "Ambulans & medis" },
    mechanic: { n: "Montir", icon: "wrench", bg: "#ff9500", d: "Bengkel & derek" },
    taxi: { n: "Trans / Taksi", icon: "taxi", bg: "#ffcc00", d: "Pesan kendaraan" },
    gov: { n: "Pemerintah", icon: "bank", bg: "#5856d6", d: "Layanan kota" },
    trader: { n: "Pedagang", icon: "store", bg: "#34c759", d: "Pesan makanan & barang" }
  };
  P.app("services", {
    keys: ["services"],
    open: function (ctx) {
      ctx.st.tab = ctx.st.tab || "svc";
      ctx.push(function (c) {
        var d = c.cache.services, tab = c.st.tab, body;
        var duty = d && +d.duty;
        if (!d) body = [U.loading()];
        else if (tab === "svc") {
          var cards = (d.svc || []).map(function (s) {
            var def = SVC[s.id] || { n: s.id, icon: "info", bg: "#8e8e93", d: "" };
            return tap(h("button", { type: "button", class: "ep-svc" }, [h("div", { class: "sv-ic", style: "background:" + def.bg }, ic(def.icon)), h("b", { text: def.n }), h("small", null, [h("i", { class: +s.on ? "on" : "" }), (+s.on ? s.on + " bertugas" : "tidak ada yang bertugas")])]), function () { request(c, s.id, def); });
          });
          body = [h("div", { class: "ep-svc-grid" }, cards), U.foot("Laporanmu dikirim ke anggota faksi yang sedang bertugas beserta lokasi GPS kamu."),
            d.mine && d.mine.length ? U.sec("Permintaan kamu") : null,
            d.mine && d.mine.length ? U.list(d.mine.map(function (r) { return U.row({ icon: (SVC[r.svc] || {}).icon || "info", iconBg: (SVC[r.svc] || {}).bg, title: (SVC[r.svc] || {}).n || r.svc, sub: dec(r.tx), wrap: true, right: +r.st === 0 ? U.pill("Menunggu", "orange") : +r.st === 1 ? U.pill(nameOf(r.by) || "Diproses", "green") : U.pill("Selesai") }); })) : null];
        } else {
          var calls = d.calls || [];
          body = calls.length ? [U.list(calls.map(function (r) {
            var st = +r.st === 0 ? U.pill("Baru", "red") : +r.st === 1 ? U.pill(+r.me ? "Kamu" : nameOf(r.by), "green") : U.pill("Selesai");
            return U.row({ icon: (SVC[r.svc] || {}).icon || "info", iconBg: (SVC[r.svc] || {}).bg, title: nameOf(r.n) + " · " + r.num, sub: dec(r.tx) + "\n" + dec(r.loc) + " · " + U.ago(r.ts), wrap: true, right: st, onClick: function () { dispatchActions(r); } });
          }))] : [U.empty("siren", "Tidak ada panggilan", "Panggilan warga untuk faksimu tampil di sini.")];
        }
        var tabs = duty ? U.tabs([["svc", "Layanan", "grid"], ["disp", "Dispatch", "siren", d && d.open ? d.open : null]], tab, function (t) { c.st.tab = t; c.refresh(); }) : null;
        return [U.nav({ large: tab === "svc" ? "Layanan" : "Dispatch", largeSub: tab === "disp" ? dec(d.facname || "") : null, right: [U.navIcon("refresh", function () { P.send("open", -1, "services"); })] }), U.body(body), tabs];
      }, {});
    },
    onBadge: function (ctx) { ctx.refresh(); }
  });
  function request(c, id, def) {
    var tx = U.input({ ph: id === "taxi" ? "Mau diantar ke mana?" : "Jelaskan kejadian / kebutuhanmu…", area: true, max: 128, rows: 4 });
    U.sheet({ title: def.n, left: { label: "Batal" }, right: { label: "Kirim", fn: function (close) {
      var v = tx.value.trim(); if (v.length < 3) return U.toast("Tulis minimal 3 huruf", 1);
      P.sendJ("svc", -1, { id: id, tx: enc(v) }); close();
    } }, body: h("div", { class: "ep-form" }, [h("div", { class: "ep-row-flex" }, [h("div", { class: "rw-ic", style: "width:calc(var(--u)*5);height:calc(var(--u)*5);border-radius:calc(var(--u)*1.2);display:grid;place-items:center;background:" + def.bg }, ic(def.icon)), h("span", { class: "ep-muted", text: def.d })]), tx]) });
    setTimeout(function () { tx.focus(); }, 350);
  }
  function dispatchActions(r) {
    U.actions(nameOf(r.n) + " · " + r.num, [
      +r.st === 0 ? { label: "Terima & pasang GPS", style: "b", fn: function () { P.send("svc_take", +r.id); } } : null,
      { label: "Pasang GPS ke lokasi", fn: function () { P.send("svc_gps", +r.id); } },
      { label: "Telepon pelapor", fn: function () { P.contacts.call(r.num); } },
      { label: "Kirim pesan", fn: function () { P.open("messages", r.num); } },
      +r.st !== 2 && (+r.me || +r.st === 0) ? { label: "Tandai selesai", style: "r", fn: function () { P.send("svc_done", +r.id); } } : null
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* CUACA                                                               */
  /* ------------------------------------------------------------------ */
  var WX = { 0: ["Cerah", "sun"], 1: ["Cerah", "sun"], 2: ["Cerah", "sun"], 3: ["Cerah", "sun"], 4: ["Berawan", "cloud"], 5: ["Cerah", "sun"], 6: ["Cerah", "sun"], 7: ["Berawan", "cloud"], 8: ["Hujan badai", "storm"], 9: ["Berkabut", "fog"], 10: ["Cerah", "sun"], 11: ["Panas terik", "sun"], 12: ["Berawan", "cloud"], 13: ["Cerah", "sun"], 14: ["Cerah", "sun"], 15: ["Berawan", "cloud"], 16: ["Hujan", "rain"], 17: ["Panas terik", "sun"], 18: ["Cerah", "sun"], 19: ["Badai pasir", "fog"], 20: ["Berkabut", "fog"] };
  P.app("weather", {
    keys: ["weather"], darkBar: true,
    open: function (ctx) {
      ctx.push(function (c) {
        var d = c.cache.weather || { wx: 1, zone: "Los Santos", temp: 30 };
        var w = WX[+d.wx] || ["Cerah", "sun"], hour = +(String(d.tm || U.hhmm()).split(":")[0]);
        var night = hour >= 19 || hour < 6;
        var kind = w[1] === "storm" ? "w-storm" : w[1] === "rain" ? "w-rain" : w[1] === "fog" ? "w-fog" : w[1] === "cloud" ? "w-cloud" : night ? "w-night" : "w-sun";
        var t = +d.temp || 30;
        var icon = function (k) { return ic(k === "storm" ? "bolt" : k === "rain" ? "rain" : k === "fog" ? "fog" : k === "cloud" ? "cloud" : "sun"); };
        var hours = [];
        for (var i = 0; i < 6; i++) { var hh = (hour + i) % 24; hours.push(h("div", null, [h("span", { text: i ? U.pad2(hh) : "Kini" }), icon(i < 3 ? w[1] : (i % 2 ? "cloud" : w[1])), h("b", { text: (t + (i % 3) - 1) + "°" })])); }
        var el = h("div", { class: "ep-weather " + kind }, [
          h("div", { class: "wx-loc", text: dec(d.zone || "San Andreas") }),
          h("div", { class: "wx-t", text: t + "°" }),
          h("div", { class: "wx-c", text: w[0] }),
          h("div", { class: "wx-hl", text: "T:" + (t + 3) + "°  R:" + (t - 6) + "°" }),
          h("div", { class: "wx-card" }, [h("small", { text: "Perkiraan per jam" }), h("div", { class: "wx-hours" }, hours)]),
          h("div", { class: "wx-grid" }, [
            h("div", { class: "wx-card" }, [h("small", { text: "Terasa seperti" }), h("b", { text: (t + 2) + "°" })]),
            h("div", { class: "wx-card" }, [h("small", { text: "Kelembapan" }), h("b", { text: (w[1] === "rain" || w[1] === "storm" ? 88 : 54) + "%" })]),
            h("div", { class: "wx-card" }, [h("small", { text: "Angin" }), h("b", { text: (w[1] === "storm" ? 34 : 9) + " km/j" })]),
            h("div", { class: "wx-card" }, [h("small", { text: "Jam kota" }), h("b", { text: d.tm || U.hhmm() })])
          ])
        ]);
        return [h("div", { class: "ep-nav clear", style: "position:absolute;left:0;right:0;z-index:6" }, h("div", { class: "ep-nav-row" }, h("div", { class: "ep-nav-acts" }, tap(h("button", { type: "button", class: "ep-nav-btn", style: "color:#fff" }, [ic("back"), "Tutup"]), function () { P.home(); })))), el];
      }, {});
    }
  });

  /* ------------------------------------------------------------------ */
  /* KESEHATAN                                                           */
  /* ------------------------------------------------------------------ */
  function ring(val, color) {
    val = Math.max(0, Math.min(100, +val || 0));
    var r = 15.9, circ = 2 * Math.PI * r;
    return U.svg('<circle cx="18" cy="18" r="' + r + '" fill="none" stroke="rgba(120,120,128,.2)" stroke-width="3.6"/><circle cx="18" cy="18" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="' + (circ * val / 100).toFixed(2) + ' ' + circ.toFixed(2) + '"/>', "hring", "0 0 36 36");
  }
  P.app("health", {
    keys: ["health"],
    open: function (ctx) {
      ctx.push(function (c) {
        var d = c.cache.health;
        if (!d) return [U.nav({ large: "Kesehatan" }), U.body(U.loading())];
        function card(title, val, color, sub) { return U.card(h("div", { class: "ep-ring-card" }, [h("div", { style: "position:relative" }, [ring(val, color), h("b", { style: "position:absolute;inset:0;display:grid;place-items:center;font-size:calc(var(--u)*2.6)", text: Math.round(+val) + "%" })]), h("div", null, [h("b", { text: title, style: "font-size:calc(var(--u)*2.9)" }), h("div", { class: "ep-muted", text: sub })])])); }
        var hp = +d.hp, hg = +d.hg, th = +d.th, sr = +d.sr;
        return [U.nav({ large: "Kesehatan", largeSub: +d.inj ? "⚠ Kamu sedang pingsan" : "Ringkasan hari ini" }), U.body([
          card("Darah", hp, "#ff2d55", hp < 30 ? "Segera ke rumah sakit" : "Kondisi baik"),
          card("Makan", hg, "#ff9500", hg < 25 ? "Kamu lapar" : "Kenyang"),
          card("Minum", th, "#0a84ff", th < 25 ? "Kamu haus" : "Terhidrasi"),
          card("Stres", sr, "#af52de", sr > 70 ? "Tingkat stres tinggi" : "Tenang"),
          +d.ar > 0 ? card("Armor", +d.ar, "#8e8e93", "Pelindung tubuh") : null,
          U.list([U.row({ icon: "cross", iconBg: "#ff3b30", title: "Panggil EMS", chev: true, onClick: function () { P.open("services"); } })])
        ])];
      }, {});
    }
  });

  /* ------------------------------------------------------------------ */
  /* KTP / IDENTITAS                                                     */
  /* ------------------------------------------------------------------ */
  P.app("id", {
    keys: ["id"],
    open: function (ctx) {
      ctx.push(function (c) {
        var d = c.cache.id;
        if (!d) return [U.nav({ large: "KTP" }), U.body(U.loading())];
        var f = function (k, v) { return [h("div", { class: "id-f", text: k }), h("div", { class: "id-v", text: v })]; };
        var card = h("div", { class: "ep-idcard" }, [h("div", { class: "id-h", text: "Pemerintah Kota EAGLE" }), h("div", { class: "id-t", text: "KARTU TANDA PENDUDUK" }),
          h("div", { class: "id-b" }, [h("div", { class: "id-pic" }, U.img("skin:" + d.skin)), h("div", { style: "min-width:0" }, [].concat(f("Nama", nameOf(d.name)), f("Tgl. lahir", dec(d.dob) || "-"), f("Jenis kelamin", +d.gender === 2 ? "Perempuan" : "Laki-laki"), f("Asal", dec(d.origin) || "-")))])]);
        var lic = function (k, on) { return U.row({ title: k, right: on ? U.pill("Aktif", "green") : U.pill("Tidak ada") }); };
        return [U.nav({ large: "KTP" }), U.body([card, U.list([
          U.row({ title: "Tinggi / Berat", right: (d.tb || "-") + " cm / " + (d.bb || "-") + " kg" }),
          U.row({ title: "No. HP", right: d.num || "-" }), U.row({ title: "No. Rekening", right: String(d.rek || "-") }),
          U.row({ title: "Status KTP", right: +d.ktp ? U.pill("Terdaftar", "green") : U.pill("Belum dibuat", "red") })
        ]), U.sec("Lisensi"), U.list([lic("SIM A", +d.sima), lic("SIM B", +d.simb), lic("SIM C", +d.simc), lic("Lisensi senjata", +d.gun)]),
          d.delay && d.delay.length ? U.sec("Waktu tunggu sidejob") : null,
          d.delay && d.delay.length ? U.list(d.delay.map(function (x) { return U.row({ title: dec(x.n), right: +x.m > 0 ? U.pill(x.m + " menit", "orange") : U.pill("Siap", "green") }); })) : null,
          U.gap(), U.list([U.row({ icon: "id", iconBg: "#5856d6", title: "Tunjukkan KTP ke pemain terdekat", onClick: function () { P.send("show_id"); } })])])];
      }, {});
    }
  });
  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("phone_apps_world");   // v28: modul dimuat sampai selesai
})();
