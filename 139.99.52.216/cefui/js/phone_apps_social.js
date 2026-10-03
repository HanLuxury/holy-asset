/* =====================================================================
   EAGLE PHONE v48 — aplikasi sosial
   Birdy (mirip X) · Photogram (mirip IG) · Dark Chat · Iklan · Pasar · Berita
   Semua data tersimpan di MySQL lewat Pawn (tabel eph_*), dan terlihat
   oleh SEMUA pemain secara real-time.
   ===================================================================== */
(function () {
  "use strict";
  var P = window.EPhone; if (!P) return;
  var U = P.ui, h = U.h, ic = U.ic, tap = U.tap, dec = U.dec, enc = U.enc, nameOf = U.nameOf;

  function verified() { return U.svg('<path d="M12 2.5l2.4 1.8 3-.2 1 2.8 2.6 1.6-.6 2.9 1.2 2.7-2.1 2.1-.2 3-2.9.6-1.6 2.5-2.8-1-2.8 1-1.6-2.5-2.9-.6-.2-3-2.1-2.1 1.2-2.7-.6-2.9 2.6-1.6 1-2.8 3 .2z" fill="#1d9bf0"/><path d="M8.5 12.3l2.3 2.3 4.7-4.9" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', "ep-verified"); }
  function fmtCount(n) { n = +n || 0; if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + " jt"; if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + " rb"; return String(n); }

  /* ------------------------------------------------------------------ */
  /* Akun aplikasi sosial (daftar sekali per karakter)                   */
  /* ------------------------------------------------------------------ */
  function signup(c, ap, title, color) {
    var u = U.input({ ph: "username (huruf kecil, angka, _ .)", max: 20 });
    var dn = U.input({ ph: "Nama tampilan", max: 32, value: nameOf(P.state.dev.name) });
    var av = U.input({ ph: "Link foto profil (opsional)", max: 250 });
    var bio = U.input({ ph: "Bio (opsional)", max: 120 });
    u.addEventListener("input", function () { var v = u.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""); if (v !== u.value) u.value = v; });
    return [
      U.nav({ title: title, left: [U.navBtn("Tutup", function () { P.home(); })] }),
      U.body([
        h("div", { style: "display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*1);padding:calc(var(--u)*3) calc(var(--u)*3) calc(var(--u)*1);text-align:center" }, [
          h("div", { style: "width:calc(var(--u)*12);height:calc(var(--u)*12);position:relative" }, U.appIcon(ap === "bd" ? "birdy" : "photogram")),
          h("b", { text: "Buat akun " + title, style: "font-size:calc(var(--u)*3.4)" }),
          h("span", { class: "ep-muted", text: "Satu akun per karakter. Username tidak bisa diganti setelah dibuat." })
        ]),
        h("div", { class: "ep-form" }, [U.field("Username", u), U.field("Nama", dn), U.field("Foto profil", av), U.field("Bio", bio),
          U.btn("Daftar", function () {
            var un = u.value.trim();
            if (!/^[a-z0-9_.]{3,20}$/.test(un)) return U.toast("Username 3-20 karakter (a-z 0-9 _ .)", 1);
            if (!dn.value.trim()) return U.toast("Nama wajib diisi", 1);
            if (av.value.trim() && !U.imgUrl(av.value.trim())) return U.toast("Link foto tidak valid", 1);
            P.sendJ("acc_new", -1, { ap: ap, u: un, dn: enc(dn.value.trim()), av: enc(av.value.trim()), bio: enc(bio.value.trim()) });
          }, "full" + (color ? " " + color : ""))])
      ])
    ];
  }
  function editProfile(c, ap, acc) {
    var dn = U.input({ ph: "Nama tampilan", max: 32, value: acc.dn });
    var av = U.input({ ph: "Link foto profil", max: 250, value: acc.av });
    var bio = U.input({ ph: "Bio", max: 120, value: acc.bio, area: true, rows: 3 });
    U.sheet({ title: "Edit Profil", tall: true, left: { label: "Batal" }, right: { label: "Simpan", fn: function (close) {
      if (!dn.value.trim()) return U.toast("Nama wajib diisi", 1);
      if (av.value.trim() && !U.imgUrl(av.value.trim())) return U.toast("Link foto tidak valid", 1);
      P.sendJ("acc_edit", -1, { ap: ap, dn: enc(dn.value.trim()), av: enc(av.value.trim()), bio: enc(bio.value.trim()) });
      close();
    } }, body: h("div", { class: "ep-form" }, [h("div", { style: "display:flex;justify-content:center" }, U.avatar(acc.dn, acc.av, "lg")), U.field("Nama", dn), U.field("Foto profil (link)", av), U.field("Bio", bio)]) });
  }
  function composePost(ap, opts) {
    opts = opts || {};
    var tx = U.input({ ph: opts.ph || "Apa yang terjadi?", area: true, max: opts.max || 280, rows: 5 });
    var md = opts.media || "";
    var prev = h("div");
    var cnt = h("div", { class: "ep-counter", text: "0/" + (opts.max || 280) });
    tx.addEventListener("input", function () { cnt.textContent = tx.value.length + "/" + (opts.max || 280); });
    function paintPrev() { U.clear(prev); if (md) prev.appendChild(h("div", { style: "position:relative;border-radius:calc(var(--u)*2);overflow:hidden;margin-top:calc(var(--u)*1)" }, [U.img(md), tap(h("button", { type: "button", class: "ep-iconbtn fill", style: "position:absolute;right:6px;top:6px;background:rgba(0,0,0,.55);color:#fff" }, ic("x")), function () { md = ""; paintPrev(); })])); }
    paintPrev();
    var tools = h("div", { class: "ep-row-flex", style: "gap:calc(var(--u)*1.4)" }, [
      U.btn("Galeri", function () { P.pickPhoto(function (u) { md = u; paintPrev(); }); }, "sm tinted", "image"),
      U.btn("Link", function () { U.prompt("Foto dari link", "Tempel link gambar (https://...)", { ph: "https://", max: 300 }, function (v) { if (!U.imgUrl(v)) return U.toast("Link tidak valid", 1); md = v.trim(); paintPrev(); }); }, "sm tinted", "link")
    ]);
    U.sheet({ title: opts.title || "Posting", tall: true, left: { label: "Batal" }, right: { label: opts.ok || "Posting", fn: function (close) {
      var t = tx.value.trim();
      if (opts.needMedia && !md) return U.toast("Pilih foto terlebih dahulu", 1);
      if (!t && !md) return U.toast("Tulis sesuatu", 1);
      opts.onSend({ tx: enc(t), md: enc(md) });
      close();
    } }, body: h("div", { class: "ep-form" }, [tx, cnt, prev, tools]) });
    setTimeout(function () { tx.focus(); }, 380);
  }
  /* bagikan foto dari aplikasi Foto/Kamera ke Birdy / Photogram.
     Aplikasi tujuan dibuka dulu supaya akun dimuat server, lalu
     composer terbuka otomatis dengan foto terpasang. */
  function shareTo(ap, url) {
    var id = ap === "bd" ? "birdy" : "photogram";
    if (P.installed && !P.installed(id)) return U.toast("Pasang " + P.APP[id].name + " dari App Store dulu", 1);
    P.pendingShare = { ap: ap, url: url, t: Date.now() };
    P.open(id);
  }
  function takeShare(ctx, ap) {
    var ps = P.pendingShare;
    if (!ps || ps.ap !== ap) return;
    if (Date.now() - ps.t > 600000) { P.pendingShare = null; return; }
    if (!ctx.st.acc) return U.toast("Buat akun dulu untuk membagikan foto", 1);
    P.pendingShare = null;
    if (ap === "pg") composePost("pg", { title: "Postingan Baru", ph: "Tulis keterangan…", max: 220, media: ps.url, needMedia: true, ok: "Bagikan", onSend: function (o) { P.sendJ("post", -1, { ap: "pg", tx: o.tx, md: o.md }); } });
    else composePost("bd", { media: ps.url, onSend: function (o) { P.sendJ("post", -1, { ap: "bd", tx: o.tx, md: o.md }); } });
  }
  P.shareTo = shareTo;

  /* ------------------------------------------------------------------ */
  /* BIRDY                                                               */
  /* ------------------------------------------------------------------ */
  P.app("birdy", {
    keys: ["bd_acc", "bd_feed", "bd_post", "bd_prof", "bd_notif", "bd_search"],
    open: function (ctx, arg) {
      ctx.st.tab = ctx.st.tab || "home";
      ctx.st.feed = ctx.st.feed || "all";
      P.send("data_get", -1, "birdy");
      ctx.push(birdyRoot, {});
    },
    data: function (ctx, d) {
      if (d.app === "bd_acc" && d.acc) { ctx.st.acc = d.acc; P.sendJ("feed", -1, { ap: "bd", tab: ctx.st.feed }); }
      if (d.app === "bd_acc" && !d.acc) ctx.st.acc = null;
      ctx.refresh();
      if (d.app === "bd_acc") takeShare(ctx, "bd");
    }
  });
  function bdPost(c, p, opts) {
    opts = opts || {};
    var liked = +p.ml, rp = +p.mr;
    var likeB = tap(h("button", { type: "button", class: liked ? "liked" : "" }, [ic("heart"), h("span", { text: fmtCount(p.lk) })]), function () {
      liked = !liked; p.ml = liked ? 1 : 0; p.lk = (+p.lk || 0) + (liked ? 1 : -1);
      likeB.className = liked ? "liked" : ""; likeB.lastChild.textContent = fmtCount(p.lk);
      P.send("like", +p.id, "bd");
    });
    var rpB = tap(h("button", { type: "button", class: rp ? "rp" : "" }, [ic("repost"), h("span", { text: fmtCount(p.rp) })]), function () {
      rp = !rp; p.mr = rp ? 1 : 0; p.rp = (+p.rp || 0) + (rp ? 1 : -1);
      rpB.className = rp ? "rp" : ""; rpB.lastChild.textContent = fmtCount(p.rp);
      P.send("repost", +p.id, "bd");
    });
    var head = h("div", { class: "ps-h" }, [h("b", { text: dec(p.dn) }), +p.vf ? verified() : null, h("span", { text: "@" + p.u + " · " + U.ago(p.ts) })]);
    var main = h("div", { class: "ps-main" }, [
      p.rpbn ? h("div", { style: "font-size:calc(var(--u)*1.9);color:var(--tx2);margin-bottom:calc(var(--u)*.3)", text: "↻ " + dec(p.rpbn) + " me-repost" }) : null,
      head,
      p.tx ? h("div", { class: "ps-tx", text: dec(p.tx) }) : null,
      p.md && U.imgUrl(p.md) ? tap(h("div", { class: "ps-md" }, U.img(p.md)), function () { P.viewImage(dec(p.md)); }) : null,
      h("div", { class: "ps-acts" }, [
        tap(h("button", { type: "button" }, [ic("comment"), h("span", { text: fmtCount(p.cm) })]), function () { bdThread(c, p); }),
        rpB, likeB,
        tap(h("button", { type: "button" }, ic("more")), function () {
          var mine = c.st.acc && +c.st.acc.id === +p.a;
          U.actions("@" + p.u, [
            { label: "Lihat profil", fn: function () { bdProfile(c, p.u); } },
            mine ? { label: "Hapus postingan", style: "r", fn: function () { U.confirm("Hapus postingan?", null, "Hapus", function () { P.send("del_post", +p.id, "bd"); }, true); } } : null
          ]);
        })
      ])
    ]);
    var av = tap(U.avatar(p.dn, p.av), function () { bdProfile(c, p.u); });
    var el = h("div", { class: "ep-post" }, [av, main]);
    if (!opts.noOpen) tap(el, function (e) { if (e.target.closest && (e.target.closest("button") || e.target.closest(".ep-av"))) return; bdThread(c, p); });
    return el;
  }
  function birdyRoot(c, st) {
    if (c.st.acc === undefined) { var ad = c.cache.bd_acc; if (ad) c.st.acc = ad.acc || null; }
    if (c.st.acc === undefined) return [U.nav({ title: "Birdy" }), U.body(U.loading())];
    if (!c.st.acc) return signup(c, "bd", "Birdy", "");
    var tab = c.st.tab, nav, body, fab = null;
    var acc = c.st.acc;
    if (tab === "home") {
      var d = c.cache.bd_feed;
      var logo = h("div", { style: "width:calc(var(--u)*4.6);height:calc(var(--u)*4.6);position:relative" }, U.appIcon("birdy"));
      nav = U.nav({ left: [tap(U.avatar(acc.dn, acc.av, "sm"), function () { c.st.tab = "me"; c.refresh(); })], title: logo, right: [U.navIcon("refresh", function () { P.sendJ("feed", -1, { ap: "bd", tab: c.st.feed }); })],
        extra: U.seg([["all", "Untuk Kamu"], ["following", "Mengikuti"]], c.st.feed, function (v) { c.st.feed = v; c.cache.bd_feed = null; P.sendJ("feed", -1, { ap: "bd", tab: v }); c.refresh(); }) });
      body = U.body(!d ? U.loading() : (d.items && d.items.length ? d.items.map(function (p) { return bdPost(c, p); }) : U.empty("comment", "Belum ada postingan", c.st.feed === "following" ? "Ikuti akun lain untuk melihat postingan mereka." : "Jadilah yang pertama memposting!")), "flush");
      fab = tap(h("button", { type: "button", class: "ep-fab", style: "background:#1d9bf0" }, ic("plus")), function () {
        composePost("bd", { onSend: function (o) { P.sendJ("post", -1, { ap: "bd", tx: o.tx, md: o.md }); } });
      });
    } else if (tab === "search") {
      var srch = st.srch || (st.srch = U.search("Cari Birdy", c.st.q || "", function (v) { c.st.q = v; clearTimeout(st.t); st.t = setTimeout(function () { if (v.trim().length >= 2) P.sendJ("search", -1, { ap: "bd", q: enc(v.trim()) }); }, 400); }));
      var sr = c.cache.bd_search;
      nav = U.nav({ title: "Jelajahi", extra: srch });
      var items = [];
      if (sr && sr.users && sr.users.length) { items.push(U.sec("Akun")); items.push(U.list(sr.users.map(function (x) { return U.row({ av: U.avatar(x.dn, x.av, "sm"), title: dec(x.dn), sub: "@" + x.u, chev: true, onClick: function () { bdProfile(c, x.u); } }); }))); }
      if (sr && sr.posts && sr.posts.length) { items.push(U.sec("Postingan")); sr.posts.forEach(function (p) { items.push(bdPost(c, p)); }); }
      if (!items.length) items.push(U.empty("search", "Cari akun & postingan", "Ketik minimal 2 huruf."));
      body = U.body(items);
    } else if (tab === "notif") {
      var nd = c.cache.bd_notif;
      nav = U.nav({ large: "Notifikasi" });
      body = U.body(!nd ? U.loading() : (nd.items && nd.items.length ? [U.list(nd.items.map(function (n) {
        var what = n.k === "like" ? "menyukai postinganmu" : n.k === "comment" ? "membalas: " + dec(n.tx) : n.k === "repost" ? "me-repost postinganmu" : "mulai mengikutimu";
        return U.row({ av: U.avatar(n.dn, n.av, "sm"), title: dec(n.dn), sub: what, wrap: true, right: U.ago(n.ts), onClick: function () { if (n.k === "follow") bdProfile(c, n.u); } });
      }), "plain")] : U.empty("bell", "Belum ada notifikasi")));
    } else {
      return bdProfileView(c, st, acc.u, true);
    }
    var tabs = U.tabs([["home", "Beranda", "home"], ["search", "Cari", "search"], ["notif", "Notifikasi", "bell"], ["me", "Profil", "user"]], tab, function (t) {
      c.st.tab = t; st.srch = null;
      if (t === "notif") P.sendJ("notifs", -1, { ap: "bd" });
      if (t === "me") P.sendJ("profile", -1, { ap: "bd", u: acc.u });
      if (t === "home") P.sendJ("feed", -1, { ap: "bd", tab: c.st.feed });
      c.refresh();
    });
    var out = [nav, body, tabs];
    if (fab) out.push(fab);
    return out;
  }
  function bdThread(c, p) {
    c.cache.bd_post = null;
    P.send("comments", +p.id, "bd");
    c.push(function (c2, st) {
      var d = c2.cache.bd_post && +c2.cache.bd_post.id === +p.id ? c2.cache.bd_post : null;
      var post = d && d.post ? d.post : p;
      var list = [bdPost(c2, post, { noOpen: true })];
      if (!d) list.push(U.loading());
      else (d.items || []).forEach(function (r) {
        list.push(h("div", { class: "ep-post" }, [U.avatar(r.dn, r.av), h("div", { class: "ps-main" }, [h("div", { class: "ps-h" }, [h("b", { text: dec(r.dn) }), h("span", { text: "@" + r.u + " · " + U.ago(r.ts) })]), h("div", { class: "ps-tx", text: dec(r.tx) })])]));
      });
      if (!st.comp) {
        var inp = h("textarea", { class: "cp-in", rows: "1", placeholder: "Balas postingan…", maxlength: "200" });
        var sb = tap(h("button", { type: "button", class: "cp-send", style: "background:#1d9bf0" }, ic("up")), function () {
          var v = inp.value.trim(); if (!v) return;
          P.send("comment", +p.id, JSON.stringify({ ap: "bd", tx: enc(v) })); inp.value = ""; P.sfx.sent();
        });
        st.comp = h("div", { class: "ep-composer" }, [inp, sb]);
      }
      return [U.nav({ back: true, title: "Postingan" }), U.body(list, "flush"), st.comp];
    }, { white: true });
  }
  function bdProfile(c, u) {
    c.cache.bd_prof = null;
    P.sendJ("profile", -1, { ap: "bd", u: u });
    c.push(function (c2, st) { return bdProfileView(c2, st, u, false); }, { white: true });
  }
  function bdProfileView(c, st, u, isTab) {
    var d = c.cache.bd_prof && c.cache.bd_prof.acc && c.cache.bd_prof.acc.u === u ? c.cache.bd_prof : null;
    var me = c.st.acc && c.st.acc.u === u;
    var head, body;
    if (!d) body = [U.loading()];
    else {
      var a = d.acc;
      var btn = me ? U.btn("Edit profil", function () { editProfile(c, "bd", c.st.acc); }, "sm gray") :
        U.btn(+d.fol ? "Mengikuti" : "Ikuti", function () { P.send("follow", +a.id, "bd"); }, "sm " + (+d.fol ? "gray" : "black"));
      body = [
        h("div", { style: "height:calc(var(--u)*10);background:linear-gradient(135deg,#1d9bf0,#0a5aa8)" }),
        h("div", { style: "display:flex;justify-content:space-between;align-items:flex-end;padding:0 calc(var(--u)*2);margin-top:calc(var(--u)*-5)" }, [U.avatar(a.dn, a.av, "lg"), btn]),
        h("div", { style: "padding:calc(var(--u)*1) calc(var(--u)*2.2)" }, [
          h("div", { style: "font-size:calc(var(--u)*3.2);font-weight:800" }, [dec(a.dn), " ", +a.vf ? verified() : null]),
          h("div", { class: "ep-muted", text: "@" + a.u }),
          a.bio ? h("div", { style: "margin-top:calc(var(--u)*.8)", text: dec(a.bio) }) : null,
          h("div", { style: "display:flex;gap:calc(var(--u)*2);margin-top:calc(var(--u)*.8);font-size:calc(var(--u)*2.3)" }, [h("span", null, [h("b", { text: fmtCount(a.fw) }), " Mengikuti"]), h("span", null, [h("b", { text: fmtCount(a.fl) }), " Pengikut"])])
        ]),
        h("div", { style: "border-top:.5px solid var(--sep)" })
      ];
      if (d.items && d.items.length) d.items.forEach(function (p) { body.push(bdPost(c, p)); });
      else body.push(U.empty("comment", "Belum ada postingan"));
    }
    var nav = U.nav({ back: !isTab, title: d ? dec(d.acc.dn) : "@" + u, cls: "", right: me ? [U.navIcon("gear", function () { editProfile(c, "bd", c.st.acc); })] : null });
    var out = [nav, U.body(body, "flush")];
    if (isTab) out.push(U.tabs([["home", "Beranda", "home"], ["search", "Cari", "search"], ["notif", "Notifikasi", "bell"], ["me", "Profil", "user"]], "me", function (t) {
      c.st.tab = t; st.srch = null;
      if (t === "notif") P.sendJ("notifs", -1, { ap: "bd" });
      if (t === "home") P.sendJ("feed", -1, { ap: "bd", tab: c.st.feed });
      c.refresh();
    }));
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* PHOTOGRAM                                                           */
  /* ------------------------------------------------------------------ */
  P.app("photogram", {
    keys: ["pg_acc", "pg_feed", "pg_post", "pg_prof", "pg_notif", "pg_search", "pg_story"],
    open: function (ctx) {
      ctx.st.tab = ctx.st.tab || "home";
      P.send("data_get", -1, "photogram");
      ctx.push(pgRoot, {});
    },
    data: function (ctx, d) {
      if (d.app === "pg_acc") { ctx.st.acc = d.acc || null; if (d.acc) P.sendJ("feed", -1, { ap: "pg", tab: "all" }); }
      if (d.app === "pg_story") { showStory(ctx, d); return; }
      ctx.refresh();
      if (d.app === "pg_acc") takeShare(ctx, "pg");
    }
  });
  function pgPost(c, p) {
    var liked = +p.ml;
    var heart = U.svg(P.I.heart, "heart");
    var likesEl = h("b", { text: fmtCount(p.lk) + " suka" });
    var likeB = tap(h("button", { type: "button", class: liked ? "liked" : "" }, ic("heart")), function () { toggle(); });
    function toggle(forceOn) {
      if (forceOn && liked) return;
      liked = !liked; p.ml = liked ? 1 : 0; p.lk = (+p.lk || 0) + (liked ? 1 : -1);
      likeB.className = liked ? "liked" : ""; likesEl.textContent = fmtCount(p.lk) + " suka";
      P.send("like", +p.id, "pg");
    }
    var imgBox = h("div", { class: "pp-img" }, [U.img(p.md), heart]);
    var lastTap = 0;
    imgBox.addEventListener("click", function () {
      var now = Date.now();
      if (now - lastTap < 320) { toggle(true); heart.classList.add("pop"); setTimeout(function () { heart.classList.remove("pop"); }, 650); }
      lastTap = now;
    });
    var mine = c.st.acc && +c.st.acc.id === +p.a;
    return h("div", { class: "ep-pgpost" }, [
      h("div", { class: "pp-h" }, [tap(U.avatar(p.dn, p.av, "sm"), function () { pgProfile(c, p.u); }), tap(h("b", { text: p.u }), function () { pgProfile(c, p.u); }),
        tap(h("button", { type: "button", class: "ep-iconbtn", style: "color:var(--tx)" }, ic("more")), function () {
          U.actions(p.u, [{ label: "Lihat profil", fn: function () { pgProfile(c, p.u); } }, { label: "Simpan foto ke galeri", fn: function () { P.sendJ("photo_add", -1, { url: p.md, cap: "" }); } }, mine ? { label: "Hapus postingan", style: "r", fn: function () { U.confirm("Hapus postingan?", null, "Hapus", function () { P.send("del_post", +p.id, "pg"); }, true); } } : null]);
        })]),
      imgBox,
      h("div", { class: "pp-acts" }, [likeB, tap(h("button", { type: "button" }, ic("comment")), function () { pgComments(c, p); }), tap(h("button", { type: "button" }, ic("send")), function () { sharePost(p); }), h("span", { class: "sp" })]),
      h("div", { class: "pp-meta" }, [likesEl, p.tx ? h("div", null, [h("b", { text: p.u + " " }), dec(p.tx)]) : null,
        +p.cm ? tap(h("span", { class: "cmt", text: "Lihat " + p.cm + " komentar" }), function () { pgComments(c, p); }) : null, h("span", { class: "when", text: U.ago(p.ts) })])
    ]);
  }
  function sharePost(p) {
    var list = P.contacts.list();
    if (!list.length) return U.toast("Belum ada kontak", 1);
    U.actions("Kirim ke", list.slice(0, 8).map(function (x) {
      return { label: nameOf(x.n), fn: function () { P.sendJ("msg", -1, { to: x.num, tx: enc("Postingan @" + p.u + (p.tx ? ": " + dec(p.tx) : "")), at: 1, ad: p.md }); U.toast("Terkirim ke " + nameOf(x.n)); } };
    }));
  }
  function pgRoot(c, st) {
    if (c.st.acc === undefined) { var ad = c.cache.pg_acc; if (ad) c.st.acc = ad.acc || null; }
    if (c.st.acc === undefined) return [U.nav({ title: "Photogram" }), U.body(U.loading())];
    if (!c.st.acc) return signup(c, "pg", "Photogram", "");
    var tab = c.st.tab, acc = c.st.acc, nav, body;
    if (tab === "home") {
      var d = c.cache.pg_feed;
      var logo = h("div", { class: "ep-pg-logo", text: "Photogram" });
      nav = h("div", { class: "ep-nav line" }, [h("div", { class: "ep-pg-head", style: "height:calc(var(--u)*5.6)" }, [logo, h("div", { class: "ep-nav-acts" }, [U.navIcon("plus", function () { newPgPost(c); }), U.navIcon("heart", function () { c.st.tab = "notif"; P.sendJ("notifs", -1, { ap: "pg" }); c.refresh(); })])])]);
      var stories = h("div", { class: "ep-stories" });
      var mine = h("div", { class: "ep-story" }, [h("div", { style: "position:relative" }, [U.avatar(acc.dn, acc.av, d && d.mystory ? "sring" : ""), h("div", { class: "add", text: "+" })]), h("span", { text: "Cerita kamu" })]);
      tap(mine, function () { if (d && d.mystory) P.send("story", +acc.id); else newStory(c); });
      stories.appendChild(mine);
      ((d && d.stories) || []).forEach(function (s) {
        stories.appendChild(tap(h("div", { class: "ep-story" }, [U.avatar(s.dn, s.av, "sring" + (+s.seen ? " seen" : "")), h("span", { text: s.u })]), function () { P.send("story", +s.a); }));
      });
      var items = [stories];
      if (!d) items.push(U.loading());
      else if (!d.items || !d.items.length) items.push(U.empty("image", "Belum ada postingan", "Ikuti teman atau posting foto pertamamu."));
      else d.items.forEach(function (p) { items.push(pgPost(c, p)); });
      body = U.body(items, "flush");
    } else if (tab === "search") {
      var srch = st.srch || (st.srch = U.search("Cari akun", "", function (v) { clearTimeout(st.t); st.t = setTimeout(function () { P.sendJ("search", -1, { ap: "pg", q: enc(v.trim()) }); }, 380); }));
      var sr = c.cache.pg_search;
      nav = U.nav({ title: "Jelajahi", extra: srch });
      var parts = [];
      if (sr && sr.users && sr.users.length) parts.push(U.list(sr.users.map(function (x) { return U.row({ av: U.avatar(x.dn, x.av, "sm"), title: x.u, sub: dec(x.dn), onClick: function () { pgProfile(c, x.u); } }); }), "plain"));
      if (sr && sr.posts && sr.posts.length) parts.push(h("div", { class: "ep-grid3" }, sr.posts.map(function (p) { return tap(h("div", null, U.img(p.md)), function () { pgSingle(c, p); }); })));
      if (!parts.length) { parts.push(U.loading()); if (!st.asked) { st.asked = 1; P.sendJ("search", -1, { ap: "pg", q: "" }); } }
      body = U.body(parts, "flush");
    } else if (tab === "notif") {
      var nd = c.cache.pg_notif;
      nav = U.nav({ large: "Aktivitas" });
      body = U.body(!nd ? U.loading() : (nd.items && nd.items.length ? [U.list(nd.items.map(function (n) {
        var what = n.k === "like" ? "menyukai fotomu." : n.k === "comment" ? "berkomentar: " + dec(n.tx) : "mulai mengikutimu.";
        return U.row({ av: U.avatar(n.dn, n.av, "sm"), title: n.u, sub: what, wrap: true, right: U.ago(n.ts), onClick: function () { pgProfile(c, n.u); } });
      }), "plain")] : U.empty("heart", "Belum ada aktivitas")));
    } else return pgProfileView(c, st, acc.u, true);
    return [nav, body, pgTabs(c, st, tab)];
  }
  function pgTabs(c, st, tab) {
    return U.tabs([["home", "Beranda", "home"], ["search", "Cari", "search"], ["add", "Posting", "plus"], ["notif", "Aktivitas", "heart"], ["me", "Profil", "user"]], tab, function (t) {
      if (t === "add") { newPgPost(c); return; }
      c.st.tab = t; st.srch = null; st.asked = 0;
      if (t === "home") P.sendJ("feed", -1, { ap: "pg", tab: "all" });
      if (t === "notif") P.sendJ("notifs", -1, { ap: "pg" });
      if (t === "me") P.sendJ("profile", -1, { ap: "pg", u: c.st.acc.u });
      c.refresh();
    });
  }
  function newPgPost(c) {
    P.pickPhoto(function (url) {
      composePost("pg", { title: "Postingan Baru", ph: "Tulis keterangan…", max: 220, media: url, needMedia: true, ok: "Bagikan", onSend: function (o) { P.sendJ("post", -1, { ap: "pg", tx: o.tx, md: o.md }); } });
    });
  }
  function newStory(c) {
    U.actions("Tambah cerita (24 jam)", [
      { label: "Dari galeri", fn: function () { P.pickPhoto(function (u) { P.sendJ("post", -1, { ap: "pgs", tx: "", md: enc(u) }); }); } },
      { label: "Dari link gambar", fn: function () { U.prompt("Cerita", "Tempel link gambar", { ph: "https://", max: 300 }, function (v) { if (!U.imgUrl(v)) return U.toast("Link tidak valid", 1); P.sendJ("post", -1, { ap: "pgs", tx: "", md: enc(v.trim()) }); }); } }
    ]);
  }
  function showStory(c, d) {
    var items = d.items || []; if (!items.length) return U.toast("Cerita sudah berakhir", 1);
    var idx = 0, timer = null;
    var bars = h("div", { style: "position:absolute;left:8px;right:8px;top:calc(var(--u)*6.4);display:flex;gap:3px;z-index:2" }, items.map(function () { return h("i", { style: "flex:1;height:2px;background:rgba(255,255,255,.35);border-radius:2px;overflow:hidden" }, h("b", { style: "display:block;height:100%;width:0;background:#fff" })); }));
    var head = h("div", { style: "position:absolute;left:10px;right:10px;top:calc(var(--u)*7.6);display:flex;align-items:center;gap:8px;color:#fff;z-index:2;font-weight:600" }, [U.avatar(d.dn, d.av, "sm"), h("span", { text: d.u }), h("span", { class: "tm", style: "opacity:.7;font-weight:400" })]);
    var pic = h("div", { style: "position:absolute;inset:0;display:grid;place-items:center;background:#000" });
    var box = h("div", { style: "position:absolute;inset:0;background:#000" }, [pic, bars, head]);
    var sh = U.sheet({ title: "", tall: true, body: box, left: { label: "Tutup" } });
    sh.el.style.top = "0"; sh.el.style.borderRadius = "0"; sh.el.style.background = "#000";
    sh.body.style.position = "relative"; sh.body.style.padding = "0";
    function show() {
      clearTimeout(timer);
      if (idx >= items.length) { sh.close(); return; }
      U.clear(pic); pic.appendChild(U.img(items[idx].md));
      head.querySelector(".tm").textContent = U.ago(items[idx].ts);
      var b = bars.children;
      for (var k = 0; k < b.length; k++) { var f = b[k].firstChild; f.style.transition = "none"; f.style.width = k < idx ? "100%" : "0"; }
      var cur = b[idx].firstChild; cur.getBoundingClientRect(); cur.style.transition = "width 5s linear"; cur.style.width = "100%";
      P.send("story_seen", +items[idx].id);
      timer = setTimeout(function () { idx++; show(); }, 5000);
    }
    tap(box, function (e) { var r = box.getBoundingClientRect(); idx += (e.clientX - r.left < r.width / 3) ? -1 : 1; if (idx < 0) idx = 0; show(); });
    show();
  }
  function pgComments(c, p) {
    c.cache.pg_post = null;
    P.send("comments", +p.id, "pg");
    c.push(function (c2, st) {
      var d = c2.cache.pg_post && +c2.cache.pg_post.id === +p.id ? c2.cache.pg_post : null;
      var list = [h("div", { class: "ep-row av", style: "align-items:flex-start" }, [U.avatar(p.dn, p.av, "sm"), h("div", { class: "rw-main" }, [h("div", { class: "rw-t", style: "white-space:normal" }, [h("b", { text: p.u + " " }), dec(p.tx)]), h("div", { class: "rw-s", text: U.ago(p.ts) })])])];
      if (!d) list.push(U.loading());
      else if (!d.items || !d.items.length) list.push(U.empty("comment", "Belum ada komentar", "Mulai percakapan."));
      else d.items.forEach(function (r) { list.push(h("div", { class: "ep-row av", style: "align-items:flex-start" }, [U.avatar(r.dn, r.av, "sm"), h("div", { class: "rw-main" }, [h("div", { class: "rw-t", style: "white-space:normal" }, [h("b", { text: r.u + " " }), dec(r.tx)]), h("div", { class: "rw-s", text: U.ago(r.ts) })])])); });
      if (!st.comp) {
        var inp = h("textarea", { class: "cp-in", rows: "1", placeholder: "Tambahkan komentar…", maxlength: "200" });
        var sb = tap(h("button", { type: "button", class: "cp-send" }, ic("up")), function () { var v = inp.value.trim(); if (!v) return; P.send("comment", +p.id, JSON.stringify({ ap: "pg", tx: enc(v) })); inp.value = ""; });
        st.comp = h("div", { class: "ep-composer" }, [U.avatar(c2.st.acc ? c2.st.acc.dn : "?", c2.st.acc ? c2.st.acc.av : null, "sm"), inp, sb]);
      }
      return [U.nav({ back: true, title: "Komentar" }), U.body(U.list(list, "plain"), "flush"), st.comp];
    }, { white: true });
  }
  function pgSingle(c, p) { c.push(function (c2) { return [U.nav({ back: true, title: "Postingan" }), U.body(pgPost(c2, p), "flush")]; }, { white: true }); }
  function pgProfile(c, u) {
    c.cache.pg_prof = null;
    P.sendJ("profile", -1, { ap: "pg", u: u });
    c.push(function (c2, st) { return pgProfileView(c2, st, u, false); }, { white: true });
  }
  function pgProfileView(c, st, u, isTab) {
    var d = c.cache.pg_prof && c.cache.pg_prof.acc && c.cache.pg_prof.acc.u === u ? c.cache.pg_prof : null;
    var me = c.st.acc && c.st.acc.u === u;
    var body;
    if (!d) body = [U.loading()];
    else {
      var a = d.acc;
      body = [
        h("div", { class: "ep-prof" }, [U.avatar(a.dn, a.av, "lg"), h("div", { class: "pf-stats" }, [h("div", null, [h("b", { text: fmtCount(a.po) }), h("span", { text: "postingan" })]), h("div", null, [h("b", { text: fmtCount(a.fl) }), h("span", { text: "pengikut" })]), h("div", null, [h("b", { text: fmtCount(a.fw) }), h("span", { text: "mengikuti" })])])]),
        h("div", { class: "ep-bio" }, [h("b", { text: dec(a.dn) }), a.bio ? dec(a.bio) : null]),
        h("div", { style: "display:flex;gap:calc(var(--u)*1);padding:0 calc(var(--u)*2.2) calc(var(--u)*1.4)" }, me ? [U.btn("Edit profil", function () { editProfile(c, "pg", c.st.acc); }, "sm gray full"), U.btn("Cerita", function () { newStory(c); }, "sm gray full")] :
          [U.btn(+d.fol ? "Mengikuti" : "Ikuti", function () { P.send("follow", +a.id, "pg"); }, "sm full " + (+d.fol ? "gray" : "")), U.btn("Pesan", function () { if (d.num) P.open("messages", d.num); else U.toast("Saling mengikuti dulu untuk mengirim pesan", 1); }, "sm gray full")]),
        d.items && d.items.length ? h("div", { class: "ep-grid3" }, d.items.map(function (p) { return tap(h("div", null, U.img(p.md)), function () { pgSingle(c, p); }); })) : U.empty("image", "Belum ada postingan")
      ];
    }
    var out = [U.nav({ back: !isTab, title: u, right: me ? [U.navIcon("plus", function () { newPgPost(c); })] : null }), U.body(body, "flush")];
    if (isTab) out.push(pgTabs(c, st, "me"));
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* DARK CHAT (anonim)                                                  */
  /* ------------------------------------------------------------------ */
  P.app("darkchat", {
    keys: ["dc", "dc_msg"], darkBar: true,
    open: function (ctx) {
      ctx.st.ch = ctx.st.ch || "umum";
      ctx.push(dcView, { stickBottom: true });
      P.send("dc_open", -1, ctx.st.ch);
    },
    data: function (ctx, d) {
      if (d.app === "dc_msg") { var c = ctx.cache.dc; if (c && c.ch === d.ch && d.m) c.items = (c.items || []).concat([d.m]).slice(-80); }
      ctx.refresh();
    }
  });
  function dcView(c, st) {
    var d = c.cache.dc && c.cache.dc.ch === c.st.ch ? c.cache.dc : null;
    var box = h("div", { class: "ep-dc" });
    var list = h("div", { class: "ep-body", style: "background:#0b0b0d;padding:calc(var(--u)*1) 0" });
    if (!d) list.appendChild(U.loading());
    else if (!d.items || !d.items.length) list.appendChild(h("div", { class: "dc-msg", style: "color:#6e6e73;text-align:center;padding-top:calc(var(--u)*8)", text: "Belum ada pesan di #" + c.st.ch + ". Semua pesan anonim." }));
    else d.items.forEach(function (m) { list.appendChild(h("div", { class: "dc-msg" }, [h("b", { class: +m.me ? "me" : "", text: dec(m.al) }), dec(m.tx), h("span", { text: U.hhmm(m.ts) })])); });
    if (!st.comp) {
      var inp = h("textarea", { class: "cp-in", rows: "1", placeholder: "Kirim anonim…", maxlength: "200", style: "background:#1c1c1e;color:#fff;box-shadow:none" });
      var sb = tap(h("button", { type: "button", class: "cp-send", style: "background:#5e5ce6" }, ic("up")), function () { var v = inp.value.trim(); if (!v) return; P.sendJ("dc_send", -1, { ch: c.st.ch, tx: enc(v) }); inp.value = ""; });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); sb.click(); } });
      st.comp = h("div", { class: "ep-composer", style: "background:#111;box-shadow:none" }, [inp, sb]);
    }
    var nav = h("div", { class: "ep-nav", style: "background:#111;color:#fff" }, h("div", { class: "ep-nav-row" }, [
      h("div", { class: "ep-nav-acts" }, U.navBtn("Tutup", function () { P.home(); })),
      h("div", { class: "nv-t" }, ["#" + c.st.ch, h("small", { text: d && d.alias ? "sebagai " + dec(d.alias) : "anonim" })]),
      h("div", { class: "ep-nav-acts" }, [U.navIcon("list", function () { channels(c); }), U.navIcon("mask", function () { setAlias(c, d); })])
    ]));
    U.add(box, [list, st.comp]);
    return [nav, box];
  }
  function channels(c) {
    var chs = ["umum", "jual-beli", "info-kota", "loker", "curhat"];
    U.actions("Pilih channel", chs.map(function (x) { return { label: "#" + x, style: x === c.st.ch ? "b" : "", fn: function () { c.st.ch = x; c.cache.dc = null; P.send("dc_open", -1, x); c.refresh(); } }; }).concat([{ label: "Channel lain…", fn: function () {
      U.prompt("Masuk channel", "Nama channel (huruf kecil, tanpa spasi)", { ph: "contoh: rahasia", max: 20 }, function (v) { v = String(v || "").toLowerCase().replace(/[^a-z0-9-]/g, ""); if (v.length < 2) return; c.st.ch = v; c.cache.dc = null; P.send("dc_open", -1, v); c.refresh(); });
    } }]));
  }
  function setAlias(c, d) {
    U.prompt("Nama samaran", "Nama ini tampil di Dark Chat (bukan nama asli).", { ph: "contoh: Ghost", max: 16, value: d && d.alias ? dec(d.alias) : "" }, function (v) {
      v = String(v || "").trim(); if (v.length < 2) return U.toast("Minimal 2 huruf", 1);
      P.send("dc_alias", -1, enc(v));
    });
  }

  /* ------------------------------------------------------------------ */
  /* IKLAN (Yellow Pages)                                                */
  /* ------------------------------------------------------------------ */
  P.app("pages", {
    keys: ["ads"],
    open: function (ctx) {
      P.send("data_get", -1, "pages");
      ctx.push(function (c) {
        var d = c.cache.ads;
        var body = !d ? [U.loading()] : (d.items && d.items.length ? d.items.map(function (a) {
          return h("div", { class: "ep-card" }, [
            h("div", { class: "ep-row-flex", style: "justify-content:space-between" }, [h("b", { text: nameOf(a.n) }), h("span", { class: "ep-muted", style: "font-size:calc(var(--u)*2)", text: U.ago(a.ts) })]),
            h("div", { style: "margin:calc(var(--u)*.8) 0 calc(var(--u)*1.2);white-space:pre-wrap;word-break:break-word", text: dec(a.tx) }),
            h("div", { class: "ep-row-flex" }, [
              U.btn("Telepon", function () { P.contacts.call(a.num); }, "sm green", "phone"),
              U.btn("Pesan", function () { P.open("messages", a.num); }, "sm tinted", "msg"),
              +a.mine ? U.btn("Hapus", function () { U.confirm("Hapus iklan?", null, "Hapus", function () { P.send("ad_del", +a.id); }, true); }, "sm gray") : null
            ])
          ]);
        }) : [U.empty("bell", "Belum ada iklan", "Pasang iklan pertamamu.")]);
        var price = d && d.price ? U.money(d.price) : "";
        return [U.nav({ large: "Iklan", largeSub: "Yellow Pages kota" + (price ? " · biaya " + price : ""), right: [U.navIcon("plus", function () {
          composePost("ad", { title: "Pasang Iklan", ph: "Contoh: Jual Sultan mulus, harga nego. Hubungi saya!", max: 150, ok: "Pasang", onSend: function (o) { P.send("ad_new", -1, o.tx); } });
        })] }), U.body([U.gap()].concat(body))];
      }, {});
    }
  });

  /* ------------------------------------------------------------------ */
  /* PASAR (Marketplace)                                                 */
  /* ------------------------------------------------------------------ */
  P.app("market", {
    keys: ["market"],
    open: function (ctx) {
      P.send("data_get", -1, "market");
      ctx.st.f = ctx.st.f || "all";
      ctx.push(function (c, st) {
        var d = c.cache.market;
        var srch = st.srch || (st.srch = U.search("Cari barang atau penjual", "", function (v) { c.st.q = v; c.refresh(); }));
        var q = (c.st.q || "").toLowerCase();
        var items = d ? (d.items || []).filter(function (x) { return (c.st.f === "all" || +x.mine) && (!q || dec(x.tt).toLowerCase().indexOf(q) >= 0 || nameOf(x.n).toLowerCase().indexOf(q) >= 0); }) : null;
        var body = !d ? [U.loading()] : (items.length ? items.map(function (x) {
          return tap(h("div", { class: "ep-mkt" }, [h("div", { class: "mk-img" }, U.img(x.md) || ic("tag")), h("div", { class: "mk-b" }, [h("b", { text: dec(x.tt) }), h("div", { class: "pr", text: U.money(x.pr) }), h("p", { text: dec(x.tx) }), h("small", { text: nameOf(x.n) + " · " + U.ago(x.ts) })])]), function () { mkDetail(c, x); });
        }) : [U.empty("tag", "Tidak ada barang", c.st.f === "mine" ? "Kamu belum memasang barang." : "Belum ada yang berjualan.")]);
        return [U.nav({ large: "Pasar", right: [U.navIcon("plus", function () { mkNew(c); })], extra: [srch, U.chips([["all", "Semua"], ["mine", "Barang saya"]], c.st.f, function (v) { c.st.f = v; c.refresh(); })] }), U.body(body, "flush")];
      }, {});
    }
  });
  function mkDetail(c, x) {
    c.push(function () {
      return [U.nav({ back: "Pasar", title: "Detail" }), U.body([
        U.img(x.md) ? h("div", { style: "background:#000" }, U.img(x.md)) : null,
        h("div", { class: "ep-article", style: "padding-top:calc(var(--u)*1.6)" }, [h("h2", { text: dec(x.tt) }), h("div", { style: "color:var(--green);font-weight:800;font-size:calc(var(--u)*3.4)", text: U.money(x.pr) }), h("div", { class: "meta", text: "Dijual oleh " + nameOf(x.n) + " · " + U.ago(x.ts) }), dec(x.tx)]),
        h("div", { class: "ep-form" }, +x.mine ? [U.btn("Hapus Iklan", function () { U.confirm("Hapus barang?", null, "Hapus", function () { P.send("mk_del", +x.id); c.pop(); }, true); }, "full red")] :
          [U.btn("Telepon Penjual", function () { P.contacts.call(x.num); }, "full green", "phone"), U.btn("Kirim Pesan", function () { P.open("messages", x.num); }, "full tinted", "msg")])
      ])];
    }, { white: true });
  }
  function mkNew(c) {
    var tt = U.input({ ph: "Judul barang", max: 40 }), pr = U.input({ ph: "Harga ($)", type: "number", mode: "numeric", max: 10 });
    var tx = U.input({ ph: "Deskripsi, kondisi, lokasi COD…", area: true, max: 250, rows: 4 });
    var md = "", prev = h("div");
    function paint() { U.clear(prev); if (md) prev.appendChild(h("div", { style: "border-radius:calc(var(--u)*1.6);overflow:hidden" }, U.img(md))); }
    U.sheet({ title: "Jual Barang", tall: true, left: { label: "Batal" }, right: { label: "Pasang", fn: function (close) {
      if (!tt.value.trim()) return U.toast("Judul wajib diisi", 1);
      var p = Math.floor(+pr.value); if (!(p >= 0)) return U.toast("Harga tidak valid", 1);
      P.sendJ("mk_new", -1, { tt: enc(tt.value.trim()), pr: p, tx: enc(tx.value.trim()), md: enc(md) }); close();
    } }, body: h("div", { class: "ep-form" }, [U.field("Judul", tt), U.field("Harga", pr), U.field("Deskripsi", tx), prev,
      U.btn("Tambah foto", function () { P.pickPhoto(function (u) { md = u; paint(); }); }, "sm tinted", "image")]) });
  }

  /* ------------------------------------------------------------------ */
  /* BERITA                                                              */
  /* ------------------------------------------------------------------ */
  P.app("news", {
    keys: ["news"],
    open: function (ctx) {
      P.send("data_get", -1, "news");
      ctx.push(function (c) {
        var d = c.cache.news;
        var body = !d ? [U.loading()] : (d.items && d.items.length ? d.items.map(function (n, i) {
          return tap(h("div", { class: "ep-news-card" }, [i === 0 || U.img(n.md) ? h("div", { class: "nw-img" }, U.img(n.md)) : null, h("div", { class: "nw-b" }, [h("small", { text: "EAGLE NEWS · " + U.ago(n.ts) }), h("b", { text: dec(n.tt) }), h("p", { text: dec(n.tx) })])]), function () { article(c, n); });
        }) : [U.empty("news", "Belum ada berita", "Berita resmi kota akan tampil di sini.")]);
        return [U.nav({ large: "Berita", largeSub: U.longDate(), right: d && +d.canpost ? [U.navIcon("compose", function () { newArticle(c); })] : null }), U.body(body)];
      }, {});
    }
  });
  function article(c, n) {
    c.push(function () {
      var d = c.cache.news;
      return [U.nav({ back: "Berita", right: (+n.mine || (d && +d.admin)) ? [U.navIcon("trash", function () { U.confirm("Hapus berita?", null, "Hapus", function () { P.send("news_del", +n.id); c.pop(); }, true); })] : null }),
        U.body(h("div", { class: "ep-article" }, [U.img(n.md), h("h2", { text: dec(n.tt) }), h("div", { class: "meta", text: "Oleh " + nameOf(n.au) + " · " + U.dayLabel(n.ts) + " " + U.hhmm(n.ts) }), dec(n.tx)]))];
    }, { white: true });
  }
  function newArticle(c) {
    var tt = U.input({ ph: "Judul berita", max: 80 }), tx = U.input({ ph: "Isi berita…", area: true, max: 1500, rows: 8 });
    var md = "", prev = h("div");
    U.sheet({ title: "Tulis Berita", tall: true, left: { label: "Batal" }, right: { label: "Terbitkan", fn: function (close) {
      if (tt.value.trim().length < 4) return U.toast("Judul terlalu pendek", 1);
      if (tx.value.trim().length < 10) return U.toast("Isi terlalu pendek", 1);
      P.sendJ("news_new", -1, { tt: enc(tt.value.trim()), tx: enc(tx.value.trim()), md: enc(md) }); close();
    } }, body: h("div", { class: "ep-form" }, [U.field("Judul", tt), tx, prev, U.btn("Foto sampul", function () { P.pickPhoto(function (u) { md = u; U.clear(prev); prev.appendChild(U.img(u)); }); }, "sm tinted", "image")]) });
  }
  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("phone_apps_social");   // v28: modul dimuat sampai selesai
})();
