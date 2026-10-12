/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : auth.js
   Layar login, pilih karakter, detail karakter, buat karakter, spawn.
   Server: event "auth" {v: login|chars|charinfo|create|spawn|none, ...}
   Klik  : EAGLE.send("auth", aksi, index, teks)
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var root = h("div", { id: "auth", class: "auth" });
  U.layer("screenlayer").appendChild(root);
  var send = function (a, i, s) { E.send("auth", a, i, s); };
  var state = { v: "none" };

  function brand() {
    return h("div", { class: "au-brand" }, [
      h("div", { class: "au-logo", html: 'EAGLE<span>ROLEPLAY</span>' }),
      h("div", { class: "au-tag", text: "Indonesia Roleplay Server" })
    ]);
  }
  function show(content, cls) {
    root.innerHTML = "";
    var scr = h("div", { class: "au-screen " + (cls || ""), "data-touch": "" }, content);
    root.appendChild(scr);
    root.className = "auth on";
    E.touch();
  }
  function hide() {
    root.className = "auth";
    setTimeout(function () { if (state.v === "none") root.innerHTML = ""; E.touch(); }, 320);
    E.touch();
  }

  /* ------------------------------ LOGIN ------------------------------ */
  function login(d) {
    show([
      brand(),
      h("div", { class: "au-card glass" }, [
        h("div", { class: "au-hello", text: "Selamat datang kembali," }),
        h("div", { class: "au-user" }, [U.iconEl("user"), h("b", { text: d.ucp || "" })]),
        h("div", { class: "au-info", html: "Akun UCP terdaftar &middot; " + U.esc(d.ver || "") }),
        d.att > 0 ? h("div", { class: "au-warn", html: U.icon("warn") + " Kata sandi salah " + (+d.att) + "/3" }) : null,
        U.button({ t: "MASUKKAN PASSWORD", c: "p", icon: "key" }, function () { send("pass", -1); }),
        U.button({ t: "Keluar", c: "g", icon: "power" }, function () { send("quit", -1); }),
        h("div", { class: "au-hint", text: "Keyboard akan muncul untuk mengetik password." })
      ])
    ], "login");
  }

  /* ------------------------------ PILIH KARAKTER ------------------------------ */
  var sel = 0;
  function chars(d) {
    sel = Math.max(0, Math.min((d.slots || []).length - 1, +d.sel || 0));
    var list = h("div", { class: "au-chars" });
    var foot = h("div", { class: "au-foot" });
    function paintFoot() {
      foot.innerHTML = "";
      var s = (d.slots || [])[sel] || {};
      foot.appendChild(U.button({ t: "Keluar", c: "g", icon: "power" }, function () { send("quit", -1); }));
      foot.appendChild(U.button(s.empty ? { t: "BUAT KARAKTER", c: "s", icon: "plus" } : { t: "MAINKAN", c: "p", icon: "next" },
        function () { send("play", sel); }));
    }
    (d.slots || []).forEach(function (s, i) {
      var card = h("div", { class: "au-char" + (s.empty ? " empty" : "") + (i === sel ? " sel" : "") }, [
        h("div", { class: "ac-img" }, s.empty ? h("div", { class: "ac-plus", html: U.icon("plus") }) : U.img("skin:" + (+s.skin || 0))),
        h("div", { class: "ac-slot", text: "SLOT " + (i + 1) }),
        h("div", { class: "ac-name", text: s.empty ? "Karakter Baru" : String(s.name || "").replace(/_/g, " ") })
      ]);
      card.addEventListener("click", function () {
        if (sel === i) { send("play", i); return; }
        sel = i;
        list.querySelectorAll(".au-char").forEach(function (c, k) { c.classList.toggle("sel", k === i); });
        paintFoot();
        send("slot", i);
      });
      list.appendChild(card);
    });
    paintFoot();
    show([
      h("div", { class: "au-top" }, [brand(), h("div", { class: "au-ucp", html: U.icon("user") + "<span>UCP</span><b>" + U.esc(d.ucp || "") + "</b>" })]),
      h("div", { class: "au-title", text: "Pilih Karakter" }),
      list, foot
    ], "chars");
  }

  /* ------------------------------ DETAIL KARAKTER ------------------------------ */
  function charinfo(d) {
    var rows = [["Jenis Kelamin", d.gender], ["Tanggal Lahir", d.age], ["Uang Tunai", d.cash], ["Bank", d.bank],
                ["Pekerjaan", d.job], ["Login Terakhir", d.last]];
    var modal = h("div", { class: "au-modal", "data-touch": "" }, h("div", { class: "au-card glass info" }, [
      h("div", { class: "ai-top" }, [
        h("div", { class: "ai-img" }, U.img("skin:" + (+d.skin || 0))),
        h("div", {}, [h("small", { text: "Main sebagai" }), h("div", { class: "ai-name", text: String(d.name || "").replace(/_/g, " ") })])
      ]),
      h("div", { class: "b-kv" }, rows.map(function (r) {
        return h("div", { class: "kv-row" }, [h("span", { class: "kv-k", text: r[0] }), h("span", { class: "kv-v", text: r[1] || "-" })]);
      })),
      h("div", { class: "au-foot" }, [
        U.button({ t: "Batal", c: "g" }, function () { send("cancel", -1); }),
        U.button({ t: "SPAWN", c: "p", icon: "next" }, function () { send("spawn", +d.slot); })
      ])
    ]));
    var scr = root.querySelector(".au-screen");
    if (!scr || state.prev !== "chars") { show([modal], "chars"); return; }
    var old = scr.querySelector(".au-modal"); if (old) old.remove();
    scr.appendChild(modal);
    E.touch();
  }

  /* ------------------------------ BUAT KARAKTER ------------------------------ */
  function create(d) {
    var fields = [["name", "Nama Karakter", "Nama_Belakang"], ["dob", "Tanggal Lahir", "hh/bb/tttt"], ["height", "Tinggi Badan", "cm"],
                  ["weight", "Berat Badan", "kg"], ["origin", "Negara Asal", "Indonesia"]];
    var done = fields.every(function (f) { return d[f[0]]; }) && (+d.gender === 1 || +d.gender === 2);
    var form = h("div", { class: "au-form" }, fields.map(function (f) {
      var v = d[f[0]];
      var row = h("div", { class: "af-row" + (v ? " ok" : "") }, [
        h("div", { class: "af-l" }, [h("small", { text: f[1] }), h("b", { text: v ? String(v).replace(/_/g, f[0] === "name" ? " " : "_") : "Belum diisi" })]),
        h("span", { class: "af-btn", html: v ? U.icon("check") : U.icon("plus") })
      ]);
      row.addEventListener("click", function () { send("field", -1, f[0]); });
      return row;
    }));
    var g = +d.gender || 0;
    var gender = h("div", { class: "af-gender" }, [
      h("button", { class: "gd" + (g === 1 ? " on" : ""), type: "button", onclick: function () { send("gender", 1); } }, [U.iconEl("male"), "Laki-laki"]),
      h("button", { class: "gd" + (g === 2 ? " on" : ""), type: "button", onclick: function () { send("gender", 2); } }, [U.iconEl("female"), "Perempuan"])
    ]);
    show([
      h("div", { class: "au-create glass" }, [
        h("div", { class: "ac-left" }, [
          h("div", { class: "p-title", text: "Buat Karakter" }),
          h("div", { class: "p-sub", text: "Ketuk kolom untuk mengisi. Gunakan nama gaya Indonesia (Nama_Belakang)." }),
          form, gender,
          h("div", { class: "au-foot" }, [
            U.button({ t: "Kembali", c: "g", icon: "back" }, function () { send("back", -1); }),
            U.button({ t: "BUAT KARAKTER", c: "s", icon: "check", dis: !done }, function () { send("create", -1); })
          ])
        ]),
        h("div", { class: "ac-right" }, [U.img("skin:" + (g === 2 ? 193 : 59)), h("div", { class: "ac-cap", text: g ? (g === 2 ? "Perempuan" : "Laki-laki") : "Pilih jenis kelamin" })])
      ])
    ], "create");
  }

  /* -------------------- FORTNITE-INSPIRED EAGLE 3D LOBBY --------------------
     The middle is transparent: GTA SA / RenderWare draws the real player.
     All server mutations go through the existing trusted 'auth' router. */
  var lobbyTab = "play", lobbyLoc = 0, lobbyBusy = false, lobbyResult = function () {};
  var lobbyAccepted = false, lobbyWaitTimer = null, lobbyCurtain = null;
  function lobbyRemoveCurtain(immediate) {
    if (lobbyWaitTimer) { clearTimeout(lobbyWaitTimer); lobbyWaitTimer = null; }
    if (!lobbyCurtain) return;
    var el = lobbyCurtain; lobbyCurtain = null;
    if (immediate) { el.remove(); return; }
    el.classList.add("fl-curtain-out");
    setTimeout(function () { el.remove(); }, 850);
  }
  function lobbyCurtainPhase(phase, location) {
    if (phase === "done") {
      lobbyAccepted = false;
      lobbyRemoveCurtain(false);
      return;
    }
    if (phase !== "start" && phase !== "slow") return;
    lobbyAccepted = true;
    if (lobbyWaitTimer) { clearTimeout(lobbyWaitTimer); lobbyWaitTimer = null; }
    if (!lobbyCurtain) {
      // Independent of #auth: stays visible while server sends auth=none.
      var cover = h("div", { class: "fl-curtain", role: "status", "aria-live": "polite" }, [
        h("div", { class: "fl-curtain-logo", text: "EAGLE" }),
        h("div", { class: "fl-curtain-line" }),
        h("h2", { text: "MEMASUKI DUNIA EAGLE" }),
        h("div", { class: "fl-curtain-target" }),
        h("div", { class: "fl-loader" }, h("i")),
        h("p", { class: "fl-curtain-hint", text: "Menyinkronkan karakter dan objek dunia…" })
      ]);
      document.body.appendChild(cover);
      lobbyCurtain = cover;
      requestAnimationFrame(function () { cover.classList.add("fl-curtain-on"); });
    }
    var target = lobbyCurtain.querySelector(".fl-curtain-target");
    if (target && location) target.textContent = "TUJUAN: " + String(location).toUpperCase();
    var hint = lobbyCurtain.querySelector(".fl-curtain-hint");
    if (hint && phase === "slow") hint.textContent = "Perangkat masih memuat objek. Mohon tunggu…";
  }
  var lobbyPrefs = { motion: true, tips: true, side: "right", dim: false };
  try {
    var pref = JSON.parse(localStorage.getItem("eagle_lobby_prefs") || "{}");
    if (typeof pref.motion === "boolean") lobbyPrefs.motion = pref.motion;
    if (typeof pref.tips === "boolean") lobbyPrefs.tips = pref.tips;
    if (pref.side === "left" || pref.side === "right") lobbyPrefs.side = pref.side;
    if (typeof pref.dim === "boolean") lobbyPrefs.dim = pref.dim;
  } catch (e) {}
  function lobbySavePrefs() {
    try { localStorage.setItem("eagle_lobby_prefs", JSON.stringify(lobbyPrefs)); } catch (e) {}
  }
  // Per-character spawn preference is cosmetic; server revalidates all choices.
  function lobbyPreferredKey(d) {
    return "eagle_lobby_favorite_v58_" + String(d.name || d.ucp || "default")
      .replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
  }
  function lobbyReadFavorite(d) {
    try {
      var raw = localStorage.getItem(lobbyPreferredKey(d));
      return raw == null ? null : Number(raw);
    } catch (e) { return null; }
  }
  function lobbyMoney(n) {
    return "$" + String(Math.max(0, Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function lobbyButton(label, cls, click, disabled) {
    return h("button", { class: "fl-btn " + (cls || ""), type: "button", disabled: disabled ? true : null, onclick: click, "data-touch": "" }, label);
  }
  function lobbyInfo(parent, eyebrow, title, desc) {
    parent.appendChild(h("div", { class: "fl-eyebrow", text: eyebrow }));
    parent.appendChild(h("h2", { class: "fl-title", text: title }));
    if (desc) parent.appendChild(h("p", { class: "fl-desc", text: desc }));
  }
  function spawn(d) {
    lobbyBusy = lobbyAccepted;
    var opts = d.opt || [];
    if (!opts.some(function (o) { return +o.id === lobbyLoc && !o.dis; })) {
      lobbyLoc = opts.length && !opts[0].dis ? +opts[0].id : 5;
    }
    var name = String(d.name || d.ucp || "EAGLE PLAYER").replace(/_/g, " ");
    var loc = opts.find(function (o) { return +o.id === lobbyLoc; }) || opts[0] || {};
    var page = h("div", { class: "fl-root" });
    var center = h("div", { class: "fl-stage", "aria-label": "Geser kiri atau kanan untuk memutar karakter", "data-touch": "" }, [
      h("div", { class: "fl-pad fl-pad-left" }),
      h("div", { class: "fl-pad fl-pad-mid" }),
      h("div", { class: "fl-pad fl-pad-right" }),
      h("div", { class: "fl-swipe-hint", text: "⇠ GESER UNTUK MEMUTAR KARAKTER ⇢" }),
      h("div", { class: "fl-identity" }, [
        h("span", { class: "fl-crown", text: "✦" }),
        h("b", { text: name }),
        h("small", { text: "LEVEL " + (+d.level || 1) })
      ])
    ]);
    // One orbit command per completed horizontal swipe. Pointer events work on
    // Chrome and modern Android WebView without continuous JNI traffic.
    var swipeStart = null;
    center.addEventListener("pointerdown", function (ev) {
      swipeStart = { x: ev.clientX, y: ev.clientY };
    });
    center.addEventListener("pointerup", function (ev) {
      if (!swipeStart || lobbyBusy) { swipeStart = null; return; }
      var dx = ev.clientX - swipeStart.x, dy = ev.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.35) send("orbit", dx > 0 ? -1 : 1);
    });
    center.addEventListener("pointercancel", function () { swipeStart = null; });
    var left = h("section", { class: "fl-left fl-section", "data-touch": "" });
    var right = h("section", { class: "fl-right fl-section", "data-touch": "" });
    var navbar = h("nav", { class: "fl-nav", "aria-label": "Menu Lobby", "data-touch": "" });
    var notify = h("div", { class: "fl-notice", role: "status", "aria-live": "polite" });
    function notice(t) { notify.textContent = t; }
    lobbyResult = function (message) {
      lobbyAccepted = false; lobbyBusy = false;
      lobbyRemoveCurtain(true); paint(); notice(message);
    };
    function setTab(tab) { lobbyTab = tab; paint(); }
    function putOpt(o) {
      var active = +o.id === lobbyLoc;
      var btn = lobbyButton([
        h("span", { class: "fl-mode-mark", text: ["✈", "⚓", "⌂", "✦", "▣", "◎"][+o.id] || "◆" }),
        h("span", { class: "fl-mode-text" }, [h("b", { text: o.t }), h("small", { text: o.s || "" })]),
        h("span", { class: "fl-mode-check", text: o.dis ? "TERKUNCI" : active ? "✓" : "›" })
      ], "fl-mode" + (active ? " selected" : "") + (o.dis ? " locked" : ""), function () {
        if (o.dis) { notice("Lokasi " + o.t + " belum tersedia untuk karakter ini."); return; }
        lobbyLoc = +o.id; paint();
      });
      return btn;
    }
    function enter() {
      var selected = opts.find(function (o) { return +o.id === lobbyLoc; });
      if (!selected || selected.dis || lobbyBusy) return;
      lobbyBusy = true;
      notice("Meminta izin spawn: " + selected.t + "…");
      send("loc", +selected.id);
      paint();
      if (lobbyWaitTimer) clearTimeout(lobbyWaitTimer);
      lobbyWaitTimer = setTimeout(function () {
        lobbyWaitTimer = null;
        // A delayed authoritative ACK means the server may still be processing.
        // Do not send repeated spawn commands automatically.
        if (!lobbyAccepted && lobbyBusy && state.v === "spawn") {
          lobbyBusy = false;
          paint();
          notice("Belum ada respons server. Periksa koneksi sebelum mencoba lagi.");
        }
      }, 5000);
    }
    function paint() {
      left.replaceChildren(); right.replaceChildren(); navbar.replaceChildren();
      [
        ["play", "PLAY"], ["locker", "LOCKER"], ["shop", "SHOP"],
        ["passes", "PASSES"], ["quests", "QUESTS"], ["career", "CAREER"],
        ["map", "MAP"], ["settings", "SETTINGS"]
      ].forEach(function (entry) {
        navbar.appendChild(lobbyButton(entry[1], "fl-nav-btn" + (lobbyTab === entry[0] ? " active" : ""), function () { setTab(entry[0]); }));
      });
      if (lobbyTab === "play") {
        lobbyInfo(left, "EAGLE • ROLEPLAY", "YOUR WORLD. YOUR STORY.", "Pilih tujuan lalu masuk ke dunia EAGLE bersama pemain lain.");
        left.appendChild(h("div", { class: "fl-promo" }, [
          h("div", { class: "fl-promo-tag", text: "EAGLE SEASON" }),
          h("strong", { text: "LOS SANTOS" }),
          h("small", { text: "Kehidupan baru dimulai dari sini" })
        ]));
        left.appendChild(h("div", { class: "fl-numbers" }, [
          h("div", {}, [h("span", { text: "ONLINE" }), h("b", { text: String(+d.online || 0) })]),
          h("div", {}, [h("span", { text: "LEVEL" }), h("b", { text: String(+d.level || 1) })]),
          h("div", {}, [h("span", { text: "UANG" }), h("b", { text: lobbyMoney(d.money) })])
        ]));
        left.appendChild(h("div", { class: "fl-player-badge" }, [
          h("span", { text: "● SERVER ONLINE" }),
          h("strong", { text: "Siap menjelajah Los Santos" })
        ]));
        left.appendChild(lobbyButton("↶ PUTAR KARAKTER", "fl-rotate", function () { send("orbit", -1); }));
        left.appendChild(lobbyButton("PUTAR ↷", "fl-rotate", function () { send("orbit", 1); }));
      } else if (lobbyTab === "locker") {
        lobbyInfo(left, "PERSONALISASI", "LOCKER", "Buka sistem Clothes EAGLE asli untuk mengubah outfit yang sudah dimiliki.");
        left.appendChild(h("div", { class: "fl-feature-icon", text: "♟" }));
        left.appendChild(lobbyButton("BUKA LEMARI PAKAIAN", "fl-action", function () { send("wardrobe", -1); }));
        left.appendChild(h("p", { class: "fl-note", text: "Pakaian, kepemilikan, dan penyimpanan tetap diverifikasi server dan MySQL." }));
      } else if (lobbyTab === "shop") {
        lobbyInfo(left, "EAGLE CITY", "SHOP & STYLE", "Jelajahi pakaian milikmu atau kunjungi toko pakaian di dalam kota untuk membeli item baru.");
        left.appendChild(h("div", { class: "fl-feature-icon", text: "♢" }));
        left.appendChild(lobbyButton("LIHAT OUTFIT MILIKKU", "fl-action", function () { send("wardrobe", -1); }));
        left.appendChild(h("p", { class: "fl-note", text: "Pembelian hanya tersedia di toko pakaian resmi dalam game. Item dan saldo diverifikasi server." }));
        left.appendChild(lobbyButton("PILIH TEMPAT SPAWN", "fl-secondary", function () { setTab("play"); }));
      } else if (lobbyTab === "passes") {
        lobbyInfo(left, "KEANGGOTAAN", "EAGLE PASS", "Status VIP dibaca dari karakter yang sedang login, bukan mata uang virtual buatan lobby.");
        left.appendChild(h("div", { class: "fl-feature-icon", text: "✦" }));
        left.appendChild(h("div", { class: "fl-data-label", text: (+d.vip > 0 ? "VIP TIER " + (+d.vip) : "STANDARD MEMBER") }));
        if (+d.vipUntil > 0 && +d.vip > 0)
          left.appendChild(h("div", { class: "fl-rowinfo" }, [h("span", { text: "BERLAKU SAMPAI" }), h("b", { text: new Date(+d.vipUntil * 1000).toLocaleDateString("id-ID") })]));
        left.appendChild(h("p", { class: "fl-note", text: "Pass ini membaca status VIP EAGLE yang asli. Tidak ada pembelian atau klaim hadiah melalui lobby." }));
        left.appendChild(lobbyButton("PERBARUI STATUS", "fl-secondary", function () { send("refresh", -1); }));
        left.appendChild(lobbyButton("BERMAIN SEKARANG", "fl-action", function () { setTab("play"); }));
      } else if (lobbyTab === "quests") {
        lobbyInfo(left, "PANDUAN PEMAIN", "QUESTS", "Aktivitas roleplay yang bisa dilakukan di dunia EAGLE. Ini panduan, bukan sistem klaim hadiah.");
        // Progress is derived from actual character data. No fake XP or reward claims.
        [
          ["Capai level 5", Math.max(0, +d.level || 0), 5],
          ["Memiliki pekerjaan", +d.job ? 1 : 0, 1],
          ["Bergabung dalam faction", +d.faction ? 1 : 0, 1],
          ["Tabung $10.000 di bank", Math.max(0, +d.bank || 0), 10000]
        ].forEach(function (task, i) {
          var done = task[1] >= task[2];
          left.appendChild(h("div", { class: "fl-task fl-task-progress" }, [
            h("b", { text: done ? "✓" : "0" + (i + 1) }),
            h("div", { class: "fl-task-detail" }, [
              h("span", { text: task[0] }),
              h("small", { text: done ? "SELESAI" : Math.min(task[1], task[2]).toLocaleString("id-ID") + " / " + task[2].toLocaleString("id-ID") }),
              h("div", { class: "fl-progress" }, h("i", { style: "width:" + Math.max(0, Math.min(100, (task[1] / task[2]) * 100)) + "%" }))
            ])
          ]));
        });
        left.appendChild(h("p", { class: "fl-note", text: "Progres aktivitas ini dibaca dari data karakter, bukan quest berhadiah baru." }));
        left.appendChild(lobbyButton("PERBARUI PROGRES", "fl-secondary", function () { send("refresh", -1); }));
        left.appendChild(lobbyButton("MULAI BERMAIN", "fl-action", function () { setTab("play"); }));
      } else if (lobbyTab === "career") {
        lobbyInfo(left, "DATA KARAKTER", "CAREER", "Profil ini mengambil level, pekerjaan, faction, dan uang dari data server saat lobby dibuka.");
        [["KARAKTER", name], ["LEVEL", String(+d.level || 1)], ["JOB ID", String(+d.job || 0)],
          ["FACTION ID", String(+d.faction || 0)], ["CASH", lobbyMoney(d.money)], ["SALDO BANK", lobbyMoney(d.bank)]].forEach(function (it) {
          left.appendChild(h("div", { class: "fl-rowinfo" }, [h("span", { text: it[0] }), h("b", { text: it[1] })]));
        });
        left.appendChild(lobbyButton("PERBARUI DATA", "fl-secondary", function () { send("refresh", -1); }));
        left.appendChild(lobbyButton("MENU BERMAIN", "fl-secondary", function () { setTab("play"); }));
      } else if (lobbyTab === "map") {
        lobbyInfo(left, "PILIH TITIK AWAL", "EXPLORE THE MAP", "Lokasi spawn mengikuti data rumah, faction, dan motel dari server.");
        opts.forEach(function (o) { left.appendChild(putOpt(o)); });
      } else if (lobbyTab === "settings") {
        lobbyInfo(left, "PREFERENSI", "SETTINGS", "Pengaturan tampilan lobby tersimpan pada perangkat ini.");
        [["motion", "ANIMASI LOBBY"], ["tips", "TAMPILKAN PETUNJUK"], ["dim", "PERKUAT KONTRAS LATAR"]].forEach(function (it) {
          left.appendChild(lobbyButton(it[1] + "  " + (lobbyPrefs[it[0]] ? "ON ✓" : "OFF"), "fl-pref", function () {
            lobbyPrefs[it[0]] = !lobbyPrefs[it[0]];
            lobbySavePrefs(); paint();
          }));
        });
        left.appendChild(lobbyButton("POSISI PLAY: " + (lobbyPrefs.side === "right" ? "KANAN" : "KIRI"), "fl-pref", function () {
          lobbyPrefs.side = lobbyPrefs.side === "right" ? "left" : "right";
          lobbySavePrefs(); paint();
        }));
        left.appendChild(lobbyButton("RESET KAMERA", "fl-secondary", function () { send("orbit", 0); }));
        left.appendChild(lobbyButton("KELUAR SERVER", "fl-danger", function () { send("quit", -1); }));
      }
      if (lobbyTab === "map" || lobbyTab === "play") {
        right.appendChild(h("div", { class: "fl-card-badge", text: "EAGLE / SELECT DESTINATION" }));
        right.appendChild(h("div", { class: "fl-map-preview" }, [
          h("span", { class: "fl-map-pin", text: "◆" }),
          h("b", { text: "LOS SANTOS" }),
          h("small", { text: "EXPLORE THE CITY" })
        ]));
        right.appendChild(h("div", { class: "fl-mode-head", text: "CHOOSE YOUR SPAWN" }));
        var choices = h("div", { class: "fl-modes" });
        opts.forEach(function (o) { choices.appendChild(putOpt(o)); });
        right.appendChild(choices);
        right.appendChild(h("div", { class: "fl-selected-label", text: "LOKASI: " + String((opts.find(function (o) { return +o.id === lobbyLoc; }) || loc).t || "-").toUpperCase() }));
        var favorite = lobbyReadFavorite(d);
        right.appendChild(lobbyButton((favorite === lobbyLoc ? "★ LOKASI FAVORIT" : "☆ SIMPAN SEBAGAI FAVORIT"), "fl-favorite", function () {
          try { localStorage.setItem(lobbyPreferredKey(d), String(lobbyLoc)); }
          catch (e) { notice("Preferensi tidak dapat disimpan pada WebView ini."); return; }
          notice("Lokasi " + String((opts.find(function (o) { return +o.id === lobbyLoc; }) || loc).t) + " tersimpan di perangkat.");
          paint();
        }, lobbyBusy));
        right.appendChild(lobbyButton(lobbyBusy ? "MEMUAT…" : "PLAY!", "fl-play", enter, lobbyBusy));
      } else {
        right.appendChild(h("div", { class: "fl-side-status" }, [
          h("span", { text: "● EAGLE ONLINE" }),
          h("strong", { text: name }),
          h("small", { text: "Level " + (+d.level || 1) + "  •  " + lobbyMoney(d.money) })
        ]));
        right.appendChild(lobbyButton("KEMBALI KE PLAY", "fl-play", function () { setTab("play"); }));
      }
      page.classList.toggle("fl-no-motion", !lobbyPrefs.motion);
      page.classList.toggle("fl-transitioning", lobbyAccepted);
      page.classList.toggle("fl-no-tips", !lobbyPrefs.tips);
      page.classList.toggle("fl-dim", !!lobbyPrefs.dim);
      page.classList.toggle("fl-layout-left", lobbyPrefs.side === "left");
      E.touch();
    }
    page.appendChild(h("header", { class: "fl-top", "data-touch": "" }, [
      h("div", { class: "fl-logo" }, [h("span", { text: "E" }), h("b", { text: "EAGLE" })]),
      navbar,
      h("div", { class: "fl-profile" }, [h("span", { text: "● " + (+d.online || 0) + " ONLINE" }), h("b", { text: name })])
    ]));
    page.appendChild(center);
    page.appendChild(h("div", { class: "fl-stage-glow", "aria-hidden": "true" }));
    page.appendChild(left);
    page.appendChild(right);
    page.appendChild(notify);
    page.appendChild(h("footer", { class: "fl-bottom", "data-touch": "" }, [
      h("div", { class: "fl-bottom-copy", text: "EAGLE ROLEPLAY  •  GAME LOBBY" }),
      lobbyButton("❮", "fl-camera-btn", function () { send("orbit", -1); }),
      lobbyButton("RESET", "fl-camera-btn", function () { send("orbit", 0); }),
      lobbyButton("❯", "fl-camera-btn", function () { send("orbit", 1); }),
      h("div", { class: "fl-bottom-copy", text: "LIVE CHARACTER • ARM64" })
    ]));
    paint();
    show([page], "eagle-lobby");
  }
  // Keep the lobby concealed while the existing CEF wardrobe editor has focus.
  // v200 clothes catalog (revision 3): the legacy editor opens with this event.
  E.on("eagle_character_open", function () {
    if (state.v === "spawn") { root.classList.add("au-under-editor"); E.touch(); }
  });
  E.on("eagle_character_close", function () {
    if (state.v === "spawn") { root.classList.remove("au-under-editor"); E.touch(); }
  });
  E.on("OPEN_CLOTHES_UI", function () {
    if (state.v === "spawn") { root.classList.add("au-under-editor"); E.touch(); }
  });
  E.on("CLOSE_CLOTHES_UI", function () {
    if (state.v === "spawn") { root.classList.remove("au-under-editor"); E.touch(); }
  });

  E.on("auth_lobby_transition", function (d) {
    if (!d) return;
    var phase = String(d.phase || "");
    // Allows WebView reload while teleporting: bridge sends an authoritative
    // transition event even before the new page has received auth=spawn.
    if (phase === "start" && state.v !== "spawn" && state.v !== "none") return;
    if (phase === "start") { lobbyBusy = true; lobbyAccepted = true; }
    if (phase === "done" && !lobbyCurtain && state.v !== "spawn") return;
    lobbyCurtainPhase(phase, d.location);
    if (phase === "done") lobbyBusy = false;
  });
  E.on("auth_lobby_result", function (d) {
    if (state.v === "spawn") lobbyResult(String((d && d.message) || "Spawn belum tersedia."));
  });
  E.on("auth", function (d) {
    var prev = state.v;
    // A fresh character/login must not inherit a previous player's selected tab or spawn.
    if (d.v === "spawn" && prev !== "spawn") {
      // A genuinely new lobby session invalidates older transition UI.
      lobbyAccepted = false;
      lobbyRemoveCurtain(true);
      lobbyTab = "play";
      var saved = lobbyReadFavorite(d);
      lobbyLoc = (saved != null && Number.isInteger(saved) && saved >= 0 && saved <= 5) ? saved : 0;
    }
    if (d.v !== "spawn") {
      lobbyBusy = false;
      if (d.v !== "none") { lobbyAccepted = false; lobbyRemoveCurtain(true); }
      // Keep the curtain until the authoritative `done` event fades it out.
      if (d.v === "none" && lobbyCurtain && lobbyAccepted) lobbyCurtainPhase("done");
      root.classList.remove("au-under-editor");
    }
    state = d; state.prev = prev;
    switch (d.v) {
      case "login": login(d); break;
      case "chars": chars(d); break;
      case "charinfo": charinfo(d); break;
      case "create": create(d); break;
      case "spawn": spawn(d); break;
      default: state.v = "none"; hide();
    }
    if (d.v === "charinfo") state.v = "chars";   // modal di atas daftar karakter
  });
  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("auth");   // v28: modul dimuat sampai selesai
})();
