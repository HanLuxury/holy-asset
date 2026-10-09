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

  /* ------------------------------ PILIH SPAWN ------------------------------ */
  function spawn(d) {
    var grid = h("div", { class: "au-spawn" }, (d.opt || []).map(function (o) {
      var c = h("div", { class: "sp-opt" + (o.dis ? " dis" : "") }, [
        h("div", { class: "so-ic", html: U.icon(o.icon || "pin") }),
        h("div", { class: "so-t", text: o.t }), h("div", { class: "so-s", text: o.s || "" })
      ]);
      if (!o.dis) c.addEventListener("click", function () { send("loc", +o.id); });
      return c;
    }));
    show([
      h("div", { class: "au-top" }, [brand()]),
      h("div", { class: "au-title", text: "Pilih Lokasi Spawn" }),
      grid
    ], "spawn");
  }

  E.on("auth", function (d) {
    var prev = state.v;
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
