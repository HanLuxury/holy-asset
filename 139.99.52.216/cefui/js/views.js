/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : views.js
   Tampilan pengganti textdraw yang tersisa (gaya FiveM / Reduto):
     hint     : kotak "[ALT] Garasi Umum" (bisa ditekan)      -> ("hint","press")
     abox     : kotak aksi kiri (gym, taxi, slump, race, dll)  -> ("abox","key",-1,"ALT")
     target   : ox_target (ikon mata + daftar aksi)            -> ("target","sel"|"close")
     atm      : Fleeca / EAGLE Bank                             -> ("atm", withdraw|deposit|transfer|close)
     idcard   : KTP / KTA / BPJS                               -> ("idcard","close")
     hack     : minigame hacking 6x6 perampokan warung         -> ("hack","box",1..36 | "close")
     evscore  : papan skor event TDM + feed
     casino   : mesin slot kasino                              -> ("casino", spin|bet|exit)
     drone    : HUD kamera drone                               -> ("drone", thermal|exit)
     gacha    : buka kotak hadiah (case opening)               -> ("gacha", spin|close)
     fade     : layar gelap masuk/keluar pintu
     dlg      : saat dialog SA-MP terbuka, panel CEF disembunyikan sementara
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  function td(s) { return U.fmt(String(s == null ? "" : s).replace(/_/g, " ")); }
  function nm(s) { return U.plain(s || "").replace(/_/g, " "); }
  function toggle(el, on) { el.classList.toggle("on", !!on); E.touch(); }

  /* ============================ DIALOG SA-MP ============================ */
  E.on("dlg", function (d) {
    document.body.classList.toggle("dlg-open", !!+d.show);
    E.touch();
  });

  /* ============================ LAYAR GELAP ============================ */
  var fade = h("div", { id: "fade", class: "fade" });
  U.layer("fadelayer").appendChild(fade);
  E.on("fade", function (d) {
    var tin = Math.max(0, +d["in"] || 800), tout = Math.max(0, +d.out || 800);
    clearTimeout(fade._t);
    fade.style.transition = "opacity " + tin + "ms ease";
    fade.classList.add("on");
    fade._t = setTimeout(function () {
      fade.style.transition = "opacity " + tout + "ms ease";
      fade.classList.remove("on");
    }, tin + 60);
  });

  /* ============================ GAME TEXT ============================ */
  // GameTextForPlayer dari server (countdown, "Start!", info singkat) gaya FiveM
  var gtx = h("div", { id: "gametext", class: "gtext" });
  U.layer("toastlayer").appendChild(gtx);
  E.on("gametext", function (d) {
    var st = +d.s || 0;
    var txt = String(d.t || "").replace(/~k~~[A-Z_]+~/g, "").replace(/_/g, " ");
    gtx.className = "gtext st-" + (st === 3 ? "big" : (st === 4 || st === 5) ? "low" : st === 6 ? "mid" : "title");
    gtx.innerHTML = '<div class="gt-in">' + U.fmt(txt) + "</div>";
    void gtx.offsetWidth;
    gtx.classList.add("on");
    clearTimeout(gtx._t);
    gtx._t = setTimeout(function () { gtx.classList.remove("on"); }, Math.max(600, +d.d || 2000));
  });

  /* ============================ HINT (text UI) ============================ */
  var hint = h("div", { id: "hint", class: "hint", "data-touch": "" }, [
    h("span", { class: "hn-key" }), h("span", { class: "hn-t" })
  ]);
  U.layer("hudlayer").appendChild(hint);
  hint.addEventListener("click", function () { E.send("hint", "press", -1); });
  E.on("hint", function (d) {
    if (+d.show) {
      hint.querySelector(".hn-key").textContent = d.k || "ALT";
      hint.querySelector(".hn-t").innerHTML = td(d.t || "");
    }
    toggle(hint, +d.show);
  });

  /* ============================ KOTAK AKSI ============================ */
  var aboxStack = h("div", { id: "abox", class: "abox-stack" });
  U.layer("hudlayer").appendChild(aboxStack);
  var boxes = {};
  E.on("abox", function (d) {
    var id = d.id || "box", el = boxes[id];
    if (!+d.show) {
      if (el) {
        el.classList.remove("on");
        delete boxes[id];
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); E.touch(); }, 260);
      }
      E.touch();
      return;
    }
    var fresh = !el;
    if (fresh) { el = boxes[id] = h("div", { class: "abox ab-" + id }); aboxStack.appendChild(el); }
    var keys = (d.keys || []).map(function (k) {
      var b = h("button", { type: "button", class: "ab-key", "data-touch": "" }, [h("b", { text: k.k }), h("span", { html: td(k.t) })]);
      b.addEventListener("click", function () { E.send("abox", "key", -1, k.k); });
      return b;
    });
    var pct = d.pct != null ? Math.max(0, Math.min(100, +d.pct)) : null;
    el.innerHTML = "";
    el.appendChild(h("div", { class: "ab-t" }, [h("i"), h("span", { html: td(d.t || "") }),
      pct != null ? h("b", { class: "ab-pct", text: Math.round(pct) + "%" }) : null]));
    var bcls = id === "slump" ? (pct <= 30 ? "c-err" : pct <= 60 ? "c-warn" : "c-ok") : "";
    if (pct != null) el.appendChild(h("div", { class: "bar ab-bar" }, h("i", { class: bcls, style: "width:" + pct + "%" })));
    if (d.m) el.appendChild(h("div", { class: "ab-m", html: td(d.m) }));
    if (keys.length) el.appendChild(h("div", { class: "ab-keys" }, keys));
    if (fresh) requestAnimationFrame(function () { el.classList.add("on"); E.touch(); });
    else el.classList.add("on");
    E.touch();
  });

  /* ============================ OX TARGET ============================ */
  var target = h("div", { id: "target", class: "target" }, [
    h("div", { class: "tg-eye", html: U.icon("eye") }),
    h("div", { class: "tg-opts", "data-touch": "" })
  ]);
  U.layer("viewlayer").appendChild(target);
  E.on("target", function (d) {
    var box = target.querySelector(".tg-opts");
    box.innerHTML = "";
    if (+d.show) {
      (d.opts || []).forEach(function (o, i) {
        var b = h("button", { type: "button", class: "tg-opt" }, [h("span", { class: "tg-ic", html: U.icon(targetIcon(o.t)) }), h("span", { html: td(o.t) })]);
        b.addEventListener("click", function () { E.send("target", "sel", i); });
        box.appendChild(b);
      });
      var x = h("button", { type: "button", class: "tg-opt tg-x" }, [h("span", { class: "tg-ic", html: U.icon("x") }), h("span", { text: "Batal" })]);
      x.addEventListener("click", function () { E.send("target", "close", -1); });
      box.appendChild(x);
    }
    toggle(target, +d.show);
  });
  function targetIcon(t) {
    t = U.plain(t || "").toLowerCase();
    if (/atm|bank/.test(t)) return "bank";
    if (/garasi|garage|kendaraan/.test(t)) return "car";
    if (/toko|shop|warung|market/.test(t)) return "store";
    if (/pintu|door|masuk/.test(t)) return "door";
    if (/rumah|house/.test(t)) return "home";
    if (/baju|cloth|pakaian/.test(t)) return "shirt";
    return "hand";
  }

  /* ============================ ATM / BANK ============================ */
  var atm = h("div", { id: "atm", class: "atm" });
  U.layer("viewlayer").appendChild(atm);
  var A = { mode: "withdraw", amt: "", rek: "", field: "amt", last: null };
  var QUICK = [100, 500, 1000, 5000, 10000, 50000];
  function atmRender(d) {
    var tabs = [["withdraw", "Tarik", "down"], ["deposit", "Setor", "up"], ["transfer", "Transfer", "send"]];
    var fieldAmt = h("div", { class: "at-field" + (A.field === "amt" ? " focus" : "") }, [h("small", { text: "Nominal" }), h("b", { text: "$ " + (A.amt ? (+A.amt).toLocaleString("id-ID") : "0") })]);
    fieldAmt.addEventListener("click", function () { A.field = "amt"; atmRender(d); });
    var fieldRek = null;
    if (A.mode === "transfer") {
      fieldRek = h("div", { class: "at-field" + (A.field === "rek" ? " focus" : "") }, [h("small", { text: "No. Rekening Tujuan" }), h("b", { text: A.rek || "- - - - - -" })]);
      fieldRek.addEventListener("click", function () { A.field = "rek"; atmRender(d); });
    }
    var keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "<"].map(function (k) {
      var b = h("button", { type: "button", class: "at-key" + (k === "C" ? " fn" : k === "<" ? " fn" : ""), html: k === "<" ? U.icon("back") : k });
      b.addEventListener("click", function () {
        var f = A.field === "rek" && A.mode === "transfer" ? "rek" : "amt";
        if (k === "C") A[f] = "";
        else if (k === "<") A[f] = A[f].slice(0, -1);
        else if (A[f].length < 9 && !(A[f] === "" && k === "0")) A[f] += k;
        atmRender(d);
      });
      return b;
    });
    var quick = QUICK.map(function (q) {
      var b = h("button", { type: "button", class: "at-q", text: U.money(q) });
      b.addEventListener("click", function () { A.amt = String(q); A.field = "amt"; atmRender(d); });
      return b;
    });
    var go = h("button", { type: "button", class: "btn btn-p at-go" }, [U.iconEl("check"), h("span", { text: "Konfirmasi " + tabs.filter(function (t) { return t[0] === A.mode; })[0][1] })]);
    go.addEventListener("click", function () {
      var n = parseInt(A.amt || "0", 10) || 0;
      if (A.mode === "transfer") E.send("atm", "transfer", n, A.rek);
      else E.send("atm", A.mode, n);
    });
    var close = h("button", { type: "button", class: "at-close", html: U.icon("x") });
    close.addEventListener("click", function () { E.send("atm", "close", -1); });
    atm.innerHTML = "";
    atm.appendChild(h("div", { class: "at-box", "data-touch": "" }, [
      h("div", { class: "at-head" }, [
        h("div", { class: "at-logo" }, [U.iconEl("bank"), h("div", {}, [h("b", { text: "EAGLE BANK" }), h("small", { text: "Fleeca ATM Services" })])]),
        h("div", { class: "at-user" }, [h("b", { text: nm(d.name) }), h("small", { text: "No. Rek " + (d.rek || "-") })]),
        close
      ]),
      h("div", { class: "at-main" }, [
        h("div", { class: "at-left" }, [
          h("div", { class: "at-card" }, [h("small", { text: "Saldo Bank" }), h("b", { text: U.money(d.bank) }),
            h("div", { class: "at-chip" }), h("span", { class: "at-num", text: "**** **** " + String(d.rek || "0000").slice(-4) })]),
          h("div", { class: "at-cash" }, [U.iconEl("wallet"), h("span", { text: "Uang Tunai" }), h("b", { text: U.money(d.cash) })]),
          h("div", { class: "at-quick" }, quick)
        ]),
        h("div", { class: "at-right" }, [
          h("div", { class: "at-tabs" }, tabs.map(function (t) {
            var b = h("button", { type: "button", class: "at-tab" + (A.mode === t[0] ? " on" : "") }, [U.iconEl(t[2]), h("span", { text: t[1] })]);
            b.addEventListener("click", function () { A.mode = t[0]; A.field = t[0] === "transfer" ? "rek" : "amt"; atmRender(d); });
            return b;
          })),
          h("div", { class: "at-fields" }, [fieldRek, fieldAmt]),
          h("div", { class: "at-pad" }, keys),
          go
        ])
      ])
    ]));
    E.touch();
  }
  E.on("atm", function (d) {
    if (!+d.show) { toggle(atm, false); A.last = null; return; }
    // saldo berubah -> transaksi berhasil, kosongkan input
    if (A.last && (A.last.bank !== +d.bank || A.last.cash !== +d.cash)) { A.amt = ""; A.rek = ""; }
    if (!A.last) { A.amt = ""; A.rek = ""; A.mode = "withdraw"; A.field = "amt"; }
    A.last = { bank: +d.bank, cash: +d.cash };
    atmRender(d);
    toggle(atm, true);
  });

  /* ============================ KARTU IDENTITAS ============================ */
  var idc = h("div", { id: "idcard", class: "idcard" });
  U.layer("viewlayer").appendChild(idc);
  function idRow(k, v) { return h("div", { class: "id-row" }, [h("small", { text: k }), h("b", { text: v || "-" })]); }
  E.on("idcard", function (d) {
    if (!+d.show) { toggle(idc, false); return; }
    var card, type = d.type || "ktp";
    if (type === "kta") {
      card = h("div", { class: "id-card kta" }, [
        h("div", { class: "id-top" }, [U.iconEl("badge"), h("div", {}, [h("small", { text: nm(d.fac) || "Faction" }), h("b", { text: "KARTU TANDA ANGGOTA" })])]),
        h("div", { class: "id-body" }, [
          h("div", { class: "id-photo" }, U.img("skin:" + (+d.skin || 0))),
          h("div", { class: "id-fields" }, [idRow("Nama", nm(d.name)), idRow("Jabatan", nm(d.rank)), idRow("Instansi", nm(d.fac))])
        ]),
        h("div", { class: "id-foot", text: "Kartu ini adalah tanda keaslian keanggotaan pemegangnya" })
      ]);
    } else if (type === "bpjs") {
      card = h("div", { class: "id-card bpjs" }, [
        h("div", { class: "id-top" }, [U.iconEl("medic"), h("div", {}, [h("small", { text: "Badan Penyelenggara Jaminan Sosial" }), h("b", { text: "BPJS KESEHATAN" })])]),
        h("div", { class: "id-body" }, [
          h("div", { class: "id-photo" }, U.img("skin:" + (+d.skin || 0))),
          h("div", { class: "id-fields" }, [idRow("Nama", nm(d.name)), idRow("Tanggal Lahir", d.dob), idRow("Berlaku", nm(d.exp))])
        ]),
        h("div", { class: "id-foot", text: "EAGLE ROLEPLAY - Kartu Indonesia Sehat" })
      ]);
    } else {
      card = h("div", { class: "id-card ktp" }, [
        h("div", { class: "id-top" }, [U.iconEl("id"), h("div", {}, [h("small", { text: "PEMERINTAH KOTA EAGLE" }), h("b", { text: "KARTU TANDA PENDUDUK" })])]),
        h("div", { class: "id-body" }, [
          h("div", { class: "id-fields" }, [idRow("Nama", nm(d.name)), idRow("Tanggal Lahir", d.dob),
            h("div", { class: "id-2" }, [idRow("Jenis Kelamin", d.gender), idRow("Tinggi", (+d.height || 0) + " cm")]),
            idRow("Berlaku Hingga", "SEUMUR HIDUP")]),
          h("div", { class: "id-side" }, [h("div", { class: "id-photo" }, U.img("skin:" + (+d.skin || 0))),
            h("div", { class: "id-sig", text: nm(d.sig).split(" ")[0] }), h("small", { text: "Tanda Tangan" })])
        ]),
        h("div", { class: "id-foot", text: "Kartu ini resmi dikeluarkan Pemerintah Kota Eagle Roleplay" })
      ]);
    }
    var close = h("button", { type: "button", class: "id-close", html: U.icon("x") });
    close.addEventListener("click", function () { E.send("idcard", "close", -1); });
    idc.innerHTML = "";
    idc.appendChild(h("div", { class: "id-wrap", "data-touch": "" }, [card, close]));
    toggle(idc, true);
  });

  /* ============================ HACKING 6x6 ============================ */
  var hack = h("div", { id: "hack", class: "hack" });
  U.layer("viewlayer").appendChild(hack);
  var hk = { cells: [], ph: 0 };
  (function build() {
    var box = h("div", { class: "hk-box", "data-touch": "" });
    var head = h("div", { class: "hk-head" }, [
      h("div", { class: "hk-t" }, [U.iconEl("bolt"), h("div", {}, [h("b", { text: "HACKING DEVICE" }), h("small", { class: "hk-sub", text: "" })])]),
      h("div", { class: "hk-score" }, [h("span", { class: "ok" }, [U.iconEl("check"), h("b", { class: "hk-ok", text: "0" }), h("small", { text: "/10" })]),
        h("span", { class: "bad" }, [U.iconEl("x"), h("b", { class: "hk-bad", text: "0" }), h("small", { text: "/10" })])])
    ]);
    var closeB = h("button", { type: "button", class: "hk-close", html: U.icon("x") });
    closeB.addEventListener("click", function () { E.send("hack", "close", -1); });
    head.appendChild(closeB);
    var grid = h("div", { class: "hk-grid" });
    for (var i = 1; i <= 36; i++) (function (idx) {
      var c = h("button", { type: "button", class: "hk-cell" });
      c.addEventListener("click", function () { if (hk.ph === 4 && !c.classList.contains("ok") && !c.classList.contains("bad")) E.send("hack", "box", idx); });
      grid.appendChild(c); hk.cells.push(c);
    })(i);
    var load = h("div", { class: "hk-load" }, [h("div", { class: "hk-spin" }), h("b", { text: "Preparing hacks..." })]);
    var timer = h("div", { class: "bar hk-timer" }, h("i"));
    box.appendChild(head); box.appendChild(timer); box.appendChild(grid); box.appendChild(load);
    hack.appendChild(box);
    hk.box = box; hk.timer = timer;
  })();
  E.on("hack", function (d) {
    if (!+d.show) { toggle(hack, false); hk.ph = 0; return; }
    hk.ph = +d.ph || 0;
    var b = String(d.b || "");
    hack.className = "hack on ph-" + hk.ph;
    var sub = { 1: "Menyiapkan perangkat...", 2: "Hafalkan kotak yang menyala!", 3: "Bersiap...", 4: "Pilih 10 kotak yang tadi menyala" }[hk.ph] || "";
    hack.querySelector(".hk-sub").textContent = sub;
    hack.querySelector(".hk-ok").textContent = String(+d.ok || 0);
    hack.querySelector(".hk-bad").textContent = String(+d.bad || 0);
    hk.cells.forEach(function (c, i) {
      var v = b.charAt(i);
      c.className = "hk-cell" + (hk.ph === 2 && v === "1" ? " clue" : "") + (hk.ph === 4 && v === "1" ? " ok" : "") + (hk.ph === 4 && v === "2" ? " bad" : "");
    });
    var ti = hk.timer.querySelector("i");
    if (hk.ph === 2) {
      ti.style.transition = "none"; ti.style.width = "100%";
      void ti.offsetWidth; ti.style.transition = "width 5.4s linear"; ti.style.width = "0%";
    } else if (hk.ph !== 4) { ti.style.transition = "none"; ti.style.width = "0%"; }
    E.touch();
  });

  /* ============================ PAPAN SKOR EVENT ============================ */
  var ev = h("div", { id: "evscore", class: "evscore" });
  U.layer("hudlayer").appendChild(ev);
  E.on("evscore", function (d) {
    if (!+d.show) { toggle(ev, false); return; }
    ev.innerHTML = "";
    if (+d.full) {
      ev.appendChild(h("div", { class: "es-board" }, [
        h("div", { class: "es-t" }, [U.iconEl("trophy"), h("b", { text: "TDM EVENT" }), h("small", { text: "Target " + (+d.target || 0) })]),
        h("div", { class: "es-teams" }, [
          h("div", { class: "es-team a" }, [h("small", { text: "TEAM A" }), h("b", { text: String(+d.a || 0) })]),
          h("span", { class: "es-vs", text: "VS" }),
          h("div", { class: "es-team b" }, [h("small", { text: "TEAM B" }), h("b", { text: String(+d.b || 0) })])
        ])
      ]));
    }
    var feed = h("div", { class: "es-feed" });
    (d.feed || []).forEach(function (f) { if (f && f !== "_" && U.plain(f).trim()) feed.appendChild(h("div", { class: "es-line", html: td(f) })); });
    ev.appendChild(feed);
    toggle(ev, true);
  });

  /* ============================ CASINO SLOT ============================ */
  var SYM = [
    { t: "\u{1F352}", n: "Cherry", x: "x2" }, { t: "\u{1F347}", n: "Anggur", x: "x5" }, { t: "69", n: "69", x: "x10", c: "txt" },
    { t: "\u{1F514}", n: "Lonceng", x: "x15" }, { t: "BAR", n: "Bar", x: "x25", c: "bar" }, { t: "BAR", n: "Double Bar", x: "x40", c: "bar2" }
  ];
  function symEl(i) {
    var s = SYM[i] || SYM[0];
    var kids = s.c === "bar2" ? [h("span", { text: "BAR" }), h("span", { text: "BAR" })] : s.c === "bar" ? [h("span", { text: "BAR" })] : s.t;
    return h("div", { class: "cs-sym " + (s.c || "") }, kids);
  }
  var casino = h("div", { id: "casino", class: "casino" });
  U.layer("viewlayer").appendChild(casino);
  var C = { reels: [], spinning: false, last: "000" };
  (function build() {
    var box = h("div", { class: "cs-box", "data-touch": "" });
    box.appendChild(h("div", { class: "cs-head" }, [h("b", { html: "EAGLE <span>CASINO</span>" }), h("small", { text: "SLOT MACHINE" })]));
    var reels = h("div", { class: "cs-reels" });
    for (var i = 0; i < 3; i++) {
      var r = h("div", { class: "cs-reel" }, [h("div", { class: "cs-strip" })]);
      reels.appendChild(r); C.reels.push(r);
    }
    box.appendChild(h("div", { class: "cs-window" }, [reels, h("i", { class: "cs-line" })]));
    box.appendChild(h("div", { class: "cs-res" }));
    box.appendChild(h("div", { class: "cs-info" }, [
      h("div", {}, [h("small", { text: "TARUHAN" }), h("b", { class: "cs-bet", text: "$0" })]),
      h("div", {}, [h("small", { text: "CHIP" }), h("b", { class: "cs-bal", text: "$0" })])
    ]));
    var btns = h("div", { class: "cs-btns" });
    [["bet", "Bet", "cash", "g"], ["spin", "SPIN", "refresh", "p"], ["exit", "Keluar", "x", "d"]].forEach(function (b) {
      var el = U.button({ id: b[0], t: b[1], icon: b[2], c: b[3] }, function () { E.send("casino", b[0], -1); });
      el.classList.add("cs-" + b[0]);
      btns.appendChild(el);
    });
    box.appendChild(btns);
    box.appendChild(h("div", { class: "cs-pay" }, SYM.map(function (s, i) { return h("span", {}, [symEl(i), h("b", { text: s.x })]); })));
    casino.appendChild(box);
  })();
  function setReel(r, sym) {
    var strip = r.querySelector(".cs-strip");
    strip.innerHTML = "";
    strip.appendChild(symEl(sym));
    r.classList.remove("spin");
  }
  function spinReel(r) {
    var strip = r.querySelector(".cs-strip");
    strip.innerHTML = "";
    for (var k = 0; k < 12; k++) strip.appendChild(symEl(Math.floor(Math.random() * 6)));
    r.classList.add("spin");
  }
  E.on("casino", function (d) {
    if (!+d.show) { toggle(casino, false); C.spinning = false; return; }
    var r = String(d.r || "000");
    casino.querySelector(".cs-bet").textContent = U.money(+d.bet || 0);
    casino.querySelector(".cs-bal").textContent = U.money(+d.bal || 0);
    var resEl = casino.querySelector(".cs-res");
    if (+d.spin) {
      C.spinning = true;
      resEl.className = "cs-res"; resEl.textContent = "";
      C.reels.forEach(spinReel);
      casino.classList.add("busy");
    } else if (d.res) {
      C.spinning = false;
      C.reels.forEach(function (reel, i) { setTimeout(function () { setReel(reel, +r.charAt(i) || 0); reel.classList.add("stop"); setTimeout(function () { reel.classList.remove("stop"); }, 400); }, i * 260); });
      setTimeout(function () {
        var m = d.res === "win" ? ["win", "MENANG +" + U.money(+d.win || 0)] : d.res === "near" ? ["near", "Hampir!"] : ["lose", "Rungkad!"];
        resEl.className = "cs-res on " + m[0]; resEl.textContent = m[1];
        casino.classList.remove("busy");
      }, 3 * 260 + 150);
    } else if (!C.spinning) {
      C.reels.forEach(function (reel, i) { setReel(reel, +r.charAt(i) || 0); });
      casino.classList.remove("busy");
    }
    toggle(casino, true);
  });

  /* ============================ DRONE HUD ============================ */
  var drone = h("div", { id: "drone", class: "drone" });
  drone.innerHTML =
    '<i class="dr-c tl"></i><i class="dr-c tr"></i><i class="dr-c bl"></i><i class="dr-c br"></i>' +
    '<div class="dr-cross"><i></i><i></i></div>' +
    '<div class="dr-rec"><i></i>REC</div>' +
    '<div class="dr-info tlx"><div><small>SIGNAL</small><b class="dr-sig">-</b></div><div><small>DRONE STATUS</small><b>[ ACTIVE ]</b></div><div><small>OPERATOR</small><b class="dr-op">-</b></div></div>' +
    '<div class="dr-info brx"><div><small>ALTITUDE</small><b class="dr-alt">0m</b></div><div><small>SPEED</small><b class="dr-spd">0km/h</b></div><div><small>POSITION</small><b class="dr-pos">-</b></div></div>';
  var dbtn = h("div", { class: "dr-btns", "data-touch": "" });
  var bTh = U.button({ t: "THERMAL", icon: "fire", c: "g" }, function () { E.send("drone", "thermal", -1); });
  var bEx = U.button({ t: "KELUAR", icon: "x", c: "d" }, function () { E.send("drone", "exit", -1); });
  dbtn.appendChild(bTh); dbtn.appendChild(bEx);
  drone.appendChild(dbtn);
  U.layer("overlaylayer").appendChild(drone);
  E.on("drone", function (d) {
    if (!+d.show) { toggle(drone, false); return; }
    drone.querySelector(".dr-op").textContent = nm(d.op);
    drone.querySelector(".dr-alt").textContent = d.alt || "0m";
    drone.querySelector(".dr-spd").textContent = d.spd || "0km/h";
    drone.querySelector(".dr-pos").textContent = nm(d.pos).toUpperCase();
    var sig = drone.querySelector(".dr-sig");
    sig.textContent = d.sig || "-";
    sig.className = "dr-sig s-" + String(d.sig || "").toLowerCase();
    bTh.classList.toggle("btn-w", !!+d.th);
    drone.classList.toggle("thermal", !!+d.th);
    toggle(drone, true);
  });

  /* ============================ GACHA / CASE OPENING ============================ */
  var RAR = [["Common", "c0"], ["Uncommon", "c1"], ["Rare", "c2"], ["Legendary", "c3"], ["Mythic", "c4"]];
  function gIcon(it) {
    var t = +it.t, m = +it.m, n = it.n || "";
    if (t === 4) return h("div", { class: "gc-img" }, U.img("veh:" + m));
    var e;
    switch (t) {
      case 0: e = "\u{1F4B5}"; break;
      case 1: e = "⭐"; break;
      case 2: e = /katana/i.test(n) ? "\u{1F5E1}" : "\u{1F52B}"; break;
      case 5: e = "\u{1F451}"; break;
      case 6: e = "\u{1F31F}"; break;
      case 7: e = "\u{1F4B0}"; break;
      case 8: e = "\u{1F697}"; break;
      case 10: e = "\u{1F3F7}"; break;
      default: e = U.itemIcon(n, m);
    }
    return h("div", { class: "gc-emo", text: e });
  }
  function gCard(it, cls) {
    var r = RAR[+it.r] || RAR[0];
    return h("div", { class: "gc-card " + r[1] + (cls ? " " + cls : "") }, [gIcon(it), h("b", { text: it.n || "" }), h("small", { text: r[0] })]);
  }
  var gacha = h("div", { id: "gacha", class: "gacha" });
  U.layer("viewlayer").appendChild(gacha);
  var G = { items: [], rolling: false, stripEl: null, track: null, pos: 0 };
  (function build() {
    var box = h("div", { class: "gc-box", "data-touch": "" });
    var close = h("button", { type: "button", class: "gc-close", html: U.icon("x") });
    close.addEventListener("click", function () { E.send("gacha", "close", -1); });
    box.appendChild(h("div", { class: "gc-head" }, [
      h("div", { class: "gc-title" }, [U.iconEl("gift"), h("div", {}, [h("b", { text: "EAGLE CASE" }), h("small", { text: "Buka kotak & dapatkan hadiah langka" })])]),
      h("div", { class: "gc-coins" }, [h("span", { class: "gc-coin" }), h("b", { class: "gc-cv", text: "0" }), h("small", { text: "Koin" })]),
      close
    ]));
    var track = h("div", { class: "gc-track" }, [h("div", { class: "gc-strip" }), h("i", { class: "gc-mark" })]);
    box.appendChild(track);
    box.appendChild(h("div", { class: "gc-win" }));
    var spin = U.button({ t: "BUKA KOTAK (10 Koin)", icon: "gift", c: "p" }, function () { if (!G.rolling) E.send("gacha", "spin", -1); });
    spin.classList.add("gc-spin");
    box.appendChild(spin);
    box.appendChild(h("div", { class: "gc-sub", text: "Isi kotak" }));
    box.appendChild(h("div", { class: "gc-list" }));
    gacha.appendChild(box);
    G.track = track; G.stripEl = track.querySelector(".gc-strip");
  })();
  function randItem() {
    // peluang tampilan mirip bobot server (50/30/15/4/1)
    var w = [50, 30, 15, 4, 1], tot = 0, i;
    var pool = G.items.length ? G.items : [{ n: "?", r: 0 }];
    for (i = 0; i < pool.length; i++) tot += w[+pool[i].r] || 1;
    var x = Math.random() * tot;
    for (i = 0; i < pool.length; i++) { x -= w[+pool[i].r] || 1; if (x < 0) return pool[i]; }
    return pool[0];
  }
  function fillStrip(n, winItem) {
    G.stripEl.innerHTML = "";
    for (var i = 0; i < n; i++) G.stripEl.appendChild(gCard(i === n - 6 && winItem ? winItem : randItem()));
  }
  function stripShift(index) {
    var card = G.stripEl.children[index];
    if (!card) return 0;
    var tw = G.track.clientWidth;
    return -(card.offsetLeft + card.offsetWidth / 2 - tw / 2) + (Math.random() * 0.5 - 0.25) * card.offsetWidth;
  }
  E.on("gacha", function (d) {
    if (!+d.show) { toggle(gacha, false); G.rolling = false; return; }
    G.items = d.items || G.items;
    gacha.querySelector(".gc-cv").textContent = String(+d.coins || 0);
    var list = gacha.querySelector(".gc-list");
    if (!list.children.length || list._n !== G.items.length) {
      list.innerHTML = "";
      G.items.slice().sort(function (a, b) { return (+b.r) - (+a.r); }).forEach(function (it) { list.appendChild(gCard(it, "sm")); });
      list._n = G.items.length;
    }
    var winBox = gacha.querySelector(".gc-win");
    var spinBtn = gacha.querySelector(".gc-spin");
    var wasOn = gacha.classList.contains("on");
    toggle(gacha, true);
    if (+d.roll) {
      // mulai berputar (server menyelesaikan dalam +-3 detik)
      G.rolling = true;
      winBox.className = "gc-win"; winBox.innerHTML = "";
      spinBtn.classList.add("dis");
      fillStrip(70, null);
      G.stripEl.style.transition = "none";
      G.stripEl.style.transform = "translateX(0)";
      void G.stripEl.offsetWidth;
      G.stripEl.style.transition = "transform 3.2s cubic-bezier(.3,.05,.35,1)";
      G.stripEl.style.transform = "translateX(" + stripShift(45) + "px)";
      return;
    }
    if (d.win != null && d.win !== "") {
      var win = { n: d.win, r: +d.rar, m: +d.m, t: 3 };
      for (var i = 0; i < G.items.length; i++) if (G.items[i].n === d.win) { win = G.items[i]; break; }
      // pasang kartu pemenang di posisi berhenti lalu melambat ke sana
      var M = window.DOMMatrix || window.WebKitCSSMatrix, tf = getComputedStyle(G.stripEl).transform;
      var cur = (M && tf && tf !== "none") ? (new M(tf).m41 || 0) : 0;
      G.stripEl.style.transition = "none";
      var cards = G.stripEl.children, stop = cards.length - 6;
      if (cards[stop]) G.stripEl.replaceChild(gCard(win), cards[stop]);
      G.stripEl.style.transform = "translateX(" + cur + "px)";
      void G.stripEl.offsetWidth;
      G.stripEl.style.transition = "transform 1.4s cubic-bezier(.12,.8,.2,1)";
      var target = stripShift(stop);
      G.stripEl.style.transform = "translateX(" + target + "px)";
      setTimeout(function () {
        G.rolling = false;
        spinBtn.classList.remove("dis");
        var r = RAR[+win.r] || RAR[0];
        winBox.className = "gc-win on " + r[1];
        winBox.innerHTML = "";
        winBox.appendChild(h("small", { text: "KAMU MENDAPATKAN" }));
        winBox.appendChild(h("b", { text: win.n }));
        winBox.appendChild(h("span", { text: r[0] }));
      }, 1450);
      return;
    }
    if (!wasOn || !G.stripEl.children.length) {
      fillStrip(14, null);
      G.stripEl.style.transition = "none";
      G.stripEl.style.transform = "translateX(0)";
      spinBtn.classList.remove("dis");
    }
  });
})();
