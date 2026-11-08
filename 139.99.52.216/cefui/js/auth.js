/* EAGLE / Lobby v8 — login, multi karakter, buat karakter, pilih spawn.
 * Tata letak lobby: logo kiri atas, kartu pemain kanan atas, kolom kiri (banner + daftar),
 * kolom kanan (kartu level + info + kartu kota), tombol besar di bawah tengah.
 * Tengah layar bening: ruang markas + karakter GTA tetap terlihat.
 * Transport: EAGLE.send("auth", action, index, payload). Server memutuskan semuanya.
 *   aksi : loginpass, regpass, quit, slot, play, createform, back, previewgender,
 *          loc, orbit, resync, skiplook
 *   event: auth {v: login|register|chars|charinfo|create|wait|spawn|none},
 *          auth_result, auth_lobby_transition, auth_lobby_result
 */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var root = h("div", { id: "auth", class: "auth ea", hidden: true, "aria-hidden": "true" });
  U.layer("screenlayer").appendChild(root);
  var state = { v: "none" }, slots = [], sel = 0, selLoc = -1, draft = {}, draftKey = "", online = 0;
  var pending = "", pendingTimer = null, curtain = null, curtainTimer = 0, accepted = false, skipTimer = 0;
  var submitNow = null;

  function send(a, i, s) { E.send("auth", a, i == null ? -1 : i, s == null ? "" : s); }
  function txt(v) { return v == null || v === "" ? "—" : String(v); }
  function nm(v) { return txt(v).replace(/_/g, " "); }
  function num(v) { return Math.max(0, Number(v) || 0).toLocaleString("id-ID"); }
  function money(v) { return "$" + num(v); }
  function ico(k) { return U.iconEl(k); }
  function btn(label, cls, fn, icon) {
    return h("button", { type: "button", class: "ea-btn " + (cls || ""), onclick: fn, "data-touch": "" },
      [icon ? ico(icon) : null, label ? h("span", { text: label }) : null]);
  }
  function feedback(t) { return h("div", { class: "ea-msg", role: "status", "aria-live": "polite", text: t || "" }); }
  function message(t, bad, field) {
    var el = root.querySelector(".ea-msg");
    if (el) { el.textContent = t || ""; el.classList.toggle("bad", !!bad); }
    if (field) {
      var input = root.querySelector('[name="' + String(field).replace(/[^a-z]/g, "") + '"]');
      if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
    }
    E.touch();
  }
  function clearPending() {
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = null; pending = "";
    root.classList.remove("ea-busy");
    root.querySelectorAll("[data-wait]").forEach(function (b) { b.disabled = false; });
  }
  function request(a, i, s, hint) {
    if (pending || accepted) return;
    pending = a;
    root.classList.add("ea-busy");
    root.querySelectorAll("[data-wait]").forEach(function (b) { b.disabled = true; });
    message(hint || "Menghubungi server…");
    send(a, i, s);
    pendingTimer = setTimeout(function () {
      pendingTimer = null;
      if (!pending) return;
      message("Server lebih lambat dari biasanya. Memeriksa…");
      send("resync", -1);
    }, 12000);
  }
  function mount(children, cls) {
    clearTimeout(skipTimer);
    root.replaceChildren.apply(root, children.filter(Boolean));
    root.className = "auth ea on " + (cls || "");
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("eagle-auth-active");
    document.body.classList.remove("dlg-open");
    E.touch();
  }
  function hide() {
    clearTimeout(skipTimer);
    submitNow = null;
    root.className = "auth ea";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    if (root.contains(document.activeElement)) document.activeElement.blur();
    document.body.classList.remove("eagle-auth-active");
    root.replaceChildren();
    if (E.touchNow) E.touchNow(); else E.touch();
  }
  function field(label, name, attrs, value) {
    var input = h("input", Object.assign({ name: name, class: "ea-input", "data-touch": "", spellcheck: "false", autocomplete: "off" }, attrs || {}));
    input.value = value || "";
    input.addEventListener("input", function () { input.removeAttribute("aria-invalid"); });
    input.addEventListener("focus", function () {
      setTimeout(function () { if (input.isConnected) input.scrollIntoView({ block: "nearest" }); }, 200);
    });
    return { input: input, el: h("label", { class: "ea-field" }, [h("span", { text: label }), input]) };
  }

  /* ---------------- potongan tata letak lobby ---------------- */
  // Logo kiri atas + pita kuning kecil di bawahnya.
  function logo(chip) {
    return h("header", { class: "ea-logo" }, [
      h("div", { class: "ea-logo-m" }, [h("img", { src: "img/rpeagle_logo.webp", alt: "" }),
        h("div", { class: "ea-logo-t" }, [h("b", { text: "RP EAGLE" }), h("small", { text: "ROLEPLAY" })])]),
      chip ? h("div", { class: "ea-chip" }, [h("span", { text: chip })]) : null]);
  }
  // Kartu pemain kanan atas: kotak level, nama, tag, ikon; baris mata uang di bawah.
  function pcard(p) {
    return h("div", { class: "ea-pcard" }, [
      h("div", { class: "ea-pc" }, [
        h("span", { class: "ea-pc-lv" }, [h("small", { text: "LV." }), h("b", { text: p.lv == null ? "–" : String(p.lv) })]),
        h("span", { class: "ea-pc-n" }, [h("b", { text: p.name }), p.tag ? h("small", { text: "[" + p.tag + "]" }) : null]),
        h("span", { class: "ea-pc-av" }, ico(p.icon || "user"))]),
      p.cur && p.cur.length ? h("div", { class: "ea-cur" }, p.cur.map(function (c) {
        return h("span", { class: "ea-cur-i ea-c-" + c[0] }, [ico(c[0]), h("b", { text: c[1] })]);
      })) : null]);
  }
  // Kartu banner kuning (kolom kiri atas).
  function banner(kicker, big, sub) {
    return h("div", { class: "ea-ban" }, [h("i", { class: "ea-ban-s" }), h("small", { text: kicker }), h("b", { text: big }), sub ? h("em", { text: sub }) : null]);
  }
  // Baris judul gelap dengan aksi kecil di kanan ("SOLO MODE   CHANGE").
  function bar(title, act, icon, fn) {
    return h("div", { class: "ea-bar" }, [h("b", { text: title }),
      act ? h("button", { type: "button", class: "ea-bar-a", "data-touch": "", onclick: fn }, [h("span", { text: act }), icon ? ico(icon) : null]) : null]);
  }
  // Kartu level kanan atas: lencana angka besar, judul, titik progres, ikon.
  function tier(big, label, title, sub, pips, icon) {
    var pp = null;
    if (pips != null) {
      pp = h("span", { class: "ea-pips" });
      for (var i = 0; i < 10; i++) pp.appendChild(h("i", { class: i < pips ? "on" : "" }));
    }
    return h("div", { class: "ea-tier" }, [
      h("span", { class: "ea-tier-b" }, [h("b", { text: big }), h("small", { text: label })]),
      h("span", { class: "ea-tier-t" }, [h("b", { text: title }), sub ? h("small", { text: sub }) : null, pp]),
      icon ? h("span", { class: "ea-tier-i" }, ico(icon)) : null]);
  }
  // Daftar ala misi: teks, bar hijau tipis, angka di kanan.
  function mission(title, rows) {
    return h("div", { class: "ea-mis" }, [h("div", { class: "ea-mis-h", text: title }),
      h("div", { class: "ea-mis-l" }, rows.map(function (r) {
        return h("div", { class: "ea-mis-r" + (r.on ? " on" : "") + (r.done ? " done" : "") }, [
          h("div", { class: "ea-mis-t" }, [h("span", { text: r.t }), h("b", { text: txt(r.v) })]),
          h("div", { class: "ea-mis-b" }, [
            h("span", { class: "ea-mis-p" }, h("i", { style: "width:" + Math.round(Math.max(0, Math.min(1, +r.p || 0)) * 100) + "%" })),
            r.n != null ? h("span", { class: "ea-mis-n", text: String(r.n) }) : null])]);
      }))]);
  }
  // Kartu kota kanan bawah (gambar peta milik server, teks besar di bawah).
  function promo(kicker, big, sub) {
    return h("div", { class: "ea-promo" }, [h("small", { text: kicker }), h("b", { text: big }), sub ? h("em", { text: sub }) : null]);
  }
  // Tombol besar bawah tengah (hijau) + tombol abu di kanannya.
  function cta(label, icon, fn, sub, subIcon, subFn) {
    var main = h("button", { type: "button", class: "ea-cta-go", "data-touch": "", "data-wait": "", onclick: fn }, [ico(icon || "play"), h("span", { text: label })]);
    var alt = sub ? h("button", { type: "button", class: "ea-cta-alt", "data-touch": "", onclick: subFn }, [subIcon ? ico(subIcon) : null, h("span", { text: sub })]) : null;
    return h("footer", { class: "ea-cta" }, [feedback(), h("div", { class: "ea-cta-row" }, [main, alt])]);
  }
  function corner(label, icon, fn) {
    return h("button", { type: "button", class: "ea-corner", "data-touch": "", onclick: fn }, [ico(icon || "power"), h("span", { text: label })]);
  }
  function hints(items) {
    return h("div", { class: "ea-hints" }, items.map(function (k) { return h("span", { class: k[1] ? "ea-key" : "", text: k[0] }); }));
  }
  function head(name, sub) {
    return h("div", { class: "ea-head", "aria-hidden": "true" }, [ico("vol"), h("b", { text: name }), sub ? h("small", { text: sub }) : null]);
  }
  function col(side, kids) {
    return h("aside", { class: "ea-col ea-" + side, "data-touch": "" }, kids);
  }
  function stage(onSwipe) {
    var el = h("div", { class: "ea-stage", "data-touch": "" }), down = null;
    el.addEventListener("pointerdown", function (e) { down = e.clientX; });
    el.addEventListener("pointerup", function (e) {
      if (down != null && !pending && Math.abs(e.clientX - down) > 40) onSwipe(e.clientX > down ? -1 : 1);
      down = null;
    });
    return el;
  }
  function onlineCur() { return online > 0 ? [["users", num(online) + " online"]] : []; }

  /* ---------------- TAHAP 1: LOGIN / REGISTER ---------------- */
  function account(d, register) {
    if (d.online != null) online = +d.online || 0;
    var pw = field(register ? "Password baru" : "Password", "password",
      { type: "password", maxlength: "63", placeholder: register ? "6–63 karakter" : "Password UCP" });
    var cf = register ? field("Ulangi password", "confirm", { type: "password", maxlength: "63", placeholder: "Ketik ulang" }) : null;
    var show = h("button", { type: "button", class: "ea-eye", "data-touch": "", "aria-label": "Tampilkan password", onclick: function () {
      var t = pw.input.type === "password" ? "text" : "password";
      pw.input.type = t; if (cf) cf.input.type = t;
    } }, ico("eye"));
    pw.el.appendChild(show);
    function submit() {
      var v = pw.input.value;
      if (!v) return message("Masukkan password.", true, "password");
      if (register && (v.length < 6 || v.length > 63)) return message("Password 6–63 karakter.", true, "password");
      if (register && !/^[A-Za-z0-9_\[\]().@#]+$/.test(v)) return message("Pakai huruf, angka, atau _ [ ] ( ) . @ #", true, "password");
      if (cf && v !== cf.input.value) return message("Password belum sama.", true, "confirm");
      request(register ? "regpass" : "loginpass", -1, v, register ? "Mendaftarkan akun…" : "Memeriksa password…");
      pw.input.value = ""; if (cf) cf.input.value = "";
    }
    submitNow = submit;
    var err = d.err || (+d.att > 0 ? "Password salah (" + (+d.att) + "/3)." : "");
    var form = h("form", { class: "ea-panel ea-form", novalidate: true, onsubmit: function (e) { e.preventDefault(); submit(); } }, [
      h("p", { class: "ea-sub", text: register ? "UCP baru. Buat password untuk akunmu." : "Masukkan password akun UCP kamu." }),
      pw.el, cf ? cf.el : null,
      h("button", { type: "submit", class: "ea-hidden-submit", tabindex: "-1", "aria-hidden": "true" })
    ]);
    mount([
      logo(register ? "AKUN BARU" : "TAHAP 1 / 4"),
      pcard({ lv: null, name: txt(d.ucp), tag: "UCP", cur: onlineCur() }),
      col("left", [banner(register ? "DAFTAR" : "SELAMAT DATANG", register ? "BUAT AKUN!" : "AYO MASUK!", "RP EAGLE ROLEPLAY"),
        bar(register ? "BUAT PASSWORD" : "MASUK AKUN", null), form]),
      col("right", [tier("3", "KOTA", "GTA MIXED", "Satu server, tiga kota", null, "map"),
        mission("ALUR MASUK", [
          { t: "Password akun", v: "1/4", p: 0.25, n: "1", on: true },
          { t: "Pilih atau buat karakter", v: "2/4", p: 0, n: "2" },
          { t: "Penampilan karakter", v: "3/4", p: 0, n: "3" },
          { t: "Pilih kota & spawn", v: "4/4", p: 0, n: "4" }]),
        promo("LIBERTY · VICE · SAN ANDREAS", "3 KOTA", "Mulai di bandara kota pilihanmu")]),
      cta(register ? "DAFTAR" : "MASUK", "next", function () { submit(); }, "KELUAR", "power", function () { send("quit"); }),
      hints([["ENTER", true], ["masuk", false]])
    ], "ea-v-login");
    if (err) message(err, true);
    setTimeout(function () { if (pw.input.isConnected) pw.input.focus(); }, 120);
  }

  /* ---------------- TAHAP 2: MULTI KARAKTER ---------------- */
  function chars(d) {
    if (Array.isArray(d.slots)) slots = d.slots;
    if (d.online != null) online = +d.online || 0;
    if (d.sel != null) sel = Math.max(0, Math.min(slots.length - 1, +d.sel || 0));
    if (d.slot != null) sel = +d.slot;
    var cur = slots[sel] || { empty: 1 }, used = slots.filter(function (s) { return !s.empty; }).length;
    function choose(i) { if (pending || i === sel || i < 0 || i >= slots.length) return; sel = i; send("slot", i); chars({ slots: slots, ucp: d.ucp }); }
    function pick(dir) { if (slots.length > 1) choose((sel + dir + slots.length) % slots.length); }
    var list = h("div", { class: "ea-panel ea-slots" });
    slots.forEach(function (s, i) {
      var tag = s.empty ? "SLOT KOSONG" : i === 0 ? "TERAKHIR DIMAINKAN" : "KARAKTER " + (i + 1);
      list.appendChild(h("button", { type: "button", class: "ea-slot" + (i === sel ? " on" : "") + (s.empty ? " empty" : ""), "data-touch": "",
        onclick: function () { choose(i); } }, [
        h("span", { class: "ea-slot-n" }, s.empty ? ico("plus") : h("b", { text: String(+s.level || 1) })),
        h("span", { class: "ea-slot-t" }, [h("small", { text: tag }),
          h("b", { text: s.empty ? "Buat karakter baru" : nm(s.name) }),
          s.empty ? null : h("em", { text: s.job || "Warga" })])]));
    });
    var total = (+cur.cash || 0) + (+cur.bank || 0);
    var right = cur.empty ? [
      tier("+", "SLOT " + (sel + 1), "KARAKTER BARU", "Slot ini masih kosong", null, "plus"),
      mission("YANG AKAN DIBUAT", [
        { t: "Nama depan & belakang", v: "Identitas", p: 0, n: "1", on: true },
        { t: "Tanggal lahir & jenis kelamin", v: "Identitas", p: 0, n: "1" },
        { t: "Wajah, rambut, kulit, outfit", v: "Penampilan", p: 0, n: "2" },
        { t: "Bandara kota pertama", v: "Kota", p: 0, n: "3" }]),
      promo("KARAKTER BARU", "MULAI DARI NOL", "Datang lewat bandara Liberty, Vice atau San Andreas")
    ] : [
      tier(String(+cur.level || 1), "LEVEL", nm(cur.name), (+cur.gender === 2 ? "Perempuan" : "Laki-laki") + " · " + txt(cur.age), (+cur.level || 1) % 10 || 10, +cur.gender === 2 ? "female" : "male"),
      mission("INFO KARAKTER", [
        { t: "Pekerjaan", v: cur.job || "Warga", p: cur.job && cur.job !== "Warga" ? 1 : 0.15 },
        { t: "Uang tunai", v: money(cur.cash), p: total ? (+cur.cash || 0) / total : 0 },
        { t: "Saldo bank", v: money(cur.bank), p: total ? (+cur.bank || 0) / total : 0 },
        { t: "Login terakhir", v: cur.last, p: 1, done: true }]),
      promo("SIAP MASUK", "LANJUTKAN", "Lokasi terakhir, rumah, apartemen atau bandara")
    ];
    mount([
      logo("TAHAP 2 / 4"),
      pcard({ lv: cur.empty ? null : (+cur.level || 1), name: cur.empty ? txt(d.ucp || state.ucp) : nm(cur.name), tag: d.ucp || state.ucp,
        icon: cur.empty ? "user" : (+cur.gender === 2 ? "female" : "male"),
        cur: cur.empty ? onlineCur() : [["cash", num(cur.cash)], ["bank", num(cur.bank)]].concat(onlineCur()) }),
      col("left", [banner("PILIH KARAKTER", "AYO MAIN!", used + " / " + slots.length + " slot terpakai"),
        bar("KARAKTER " + used + "/" + slots.length, "GANTI", "refresh", function () { pick(1); }), list]),
      col("right", right),
      stage(pick),
      head(cur.empty ? "SLOT " + (sel + 1) : nm(cur.name), cur.empty ? "Kosong" : "LV. " + (+cur.level || 1)),
      cta(cur.empty ? "BUAT KARAKTER" : "MAINKAN", cur.empty ? "plus" : "play", function () {
        request("play", sel, "", cur.empty ? "Membuka pembuatan karakter…" : "Memuat karakter…");
      }, "KELUAR", "power", function () { send("quit"); }),
      corner("GANTI SLOT", "refresh", function () { pick(1); }),
      hints([["◀ ▶", true], [(sel + 1) + " / " + slots.length, false]])
    ], "ea-v-chars");
  }

  /* ---------------- TAHAP 3: BUAT KARAKTER ---------------- */
  function birth(value) {
    var raw = String(value == null ? "" : value), dg = raw.replace(/\D/g, "").slice(0, 8), out = dg.slice(0, 2);
    if (dg.length > 2) out += "/" + dg.slice(2, 4);
    if (dg.length > 4) out += "/" + dg.slice(4);
    return out;
  }
  function create(d) {
    var key = String(d.ucp || "") + ":" + (+d.slot || 0);
    if (draftKey !== key) { draftKey = key; draft = {}; }
    ["first", "last", "dob", "gender"].forEach(function (k) { if (d[k] != null && d[k] !== "" && +d[k] !== 0) draft[k] = d[k]; });
    var first = field("Nama depan", "first", { type: "text", maxlength: "11", placeholder: "Arga" }, draft.first);
    var last = field("Nama belakang", "last", { type: "text", maxlength: "11", placeholder: "Pratama" }, draft.last);
    var dob = field("Tanggal lahir", "dob", { type: "text", maxlength: "10", placeholder: "hh/bb/tttt", inputmode: "numeric" }, draft.dob);
    var headName = h("b"), tierName = null, promoName = null;
    function preview() {
      var n = (draft.first || "Nama") + " " + (draft.last || "Belakang");
      headName.textContent = n;
      if (tierName) tierName.textContent = n;
      if (promoName) promoName.textContent = (draft.first || "Nama") + "_" + (draft.last || "Belakang");
    }
    function cap(f, k) {
      f.input.addEventListener("input", function () {
        var v = f.input.value.replace(/[^A-Za-z]/g, "");
        v = v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : "";
        if (v !== f.input.value) f.input.value = v;
        draft[k] = v; preview();
      });
    }
    cap(first, "first"); cap(last, "last");
    dob.input.addEventListener("input", function () { dob.input.value = birth(dob.input.value); draft.dob = dob.input.value; });
    var gender = h("div", { class: "ea-seg", role: "group", "aria-label": "Jenis kelamin" });
    [[1, "Laki-laki", "male"], [2, "Perempuan", "female"]].forEach(function (g) {
      var b = btn(g[1], +draft.gender === g[0] ? "on" : "", function () {
        draft.gender = g[0]; send("previewgender", g[0]);
        gender.querySelectorAll(".ea-btn").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
      }, g[2]);
      gender.appendChild(b);
    });
    function submit() {
      var p = { first: first.input.value.trim(), last: last.input.value.trim(), dob: birth(dob.input.value), gender: +draft.gender || 0 };
      if (!/^[A-Z][a-z]{1,10}$/.test(p.first)) return message("Nama depan: huruf saja, 2–11 karakter.", true, "first");
      if (!/^[A-Z][a-z]{1,10}$/.test(p.last)) return message("Nama belakang: huruf saja, 2–11 karakter.", true, "last");
      if ((p.first + "_" + p.last).length > 23) return message("Nama terlalu panjang.", true, "last");
      var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(p.dob), dt = m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
      if (!m || +m[3] < 1900 || dt.getFullYear() !== +m[3] || dt.getMonth() !== +m[2] - 1 || dt.getDate() !== +m[1] || dt > new Date())
        return message("Tanggal lahir tidak valid (hh/bb/tttt).", true, "dob");
      if (p.gender !== 1 && p.gender !== 2) return message("Pilih jenis kelamin.", true);
      request("createform", +d.slot || 0, JSON.stringify(p), "Menyimpan identitas…");
    }
    submitNow = submit;
    var form = h("form", { class: "ea-panel ea-form", novalidate: true, onsubmit: function (e) { e.preventDefault(); submit(); } }, [
      h("div", { class: "ea-row" }, [first.el, last.el]),
      dob.el,
      h("div", { class: "ea-field" }, [h("span", { text: "Jenis kelamin" }), gender]),
      h("button", { type: "submit", class: "ea-hidden-submit", tabindex: "-1", "aria-hidden": "true" })
    ]);
    var t = tier(String((+d.slot || 0) + 1), "SLOT", "Nama Belakang", "Karakter baru", 3, "id");
    var card = promo("NAMA DI SERVER", "Nama_Belakang", "Huruf saja, tanpa angka atau simbol");
    tierName = t.querySelector(".ea-tier-t b");
    promoName = card.querySelector("b");
    preview();
    mount([
      logo("TAHAP 3 / 4"),
      pcard({ lv: 1, name: txt(d.ucp), tag: "UCP", cur: onlineCur() }),
      col("left", [banner("KARAKTER BARU", "SIAPA KAMU?", "Isi identitas karakter"), bar("IDENTITAS", "1 / 3", null), form]),
      col("right", [t,
        mission("LANGKAH", [
          { t: "Identitas", v: "Sekarang", p: 0.5, n: "1", on: true },
          { t: "Wajah, rambut, kulit, outfit", v: "Berikutnya", p: 0, n: "2" },
          { t: "Bandara kota pertama", v: "Terakhir", p: 0, n: "3" }]),
        card]),
      h("div", { class: "ea-head", "aria-hidden": "true" }, [ico("vol"), headName, h("small", { text: "SLOT " + ((+d.slot || 0) + 1) })]),
      cta("LANJUT", "next", function () { submit(); }, "KEMBALI", "back", function () {
        if (!pending) { draftKey = ""; draft = {}; request("back"); }
      })
    ], "ea-v-create");
    if (d.err) message(d.err, true);
  }

  /* ---------------- TAHAP 3b: MENUNGGU EDITOR PENAMPILAN ---------------- */
  function wait(d) {
    var pill = h("div", { class: "ea-pill", "data-touch": "" }, [h("i", { class: "ea-spin" }), h("span", { text: d.text || "Memuat…" })]);
    mount([pill], "ea-v-wait");
    if (d.skip) skipTimer = setTimeout(function () {
      if (!pill.isConnected) return;
      pill.appendChild(btn("Lewati", "ea-link", function () { send("skiplook"); }));
      E.touch();
    }, 15000);
  }

  /* ---------------- TAHAP 4: PILIH SPAWN ---------------- */
  function spawn(d) {
    if (d.online != null) online = +d.online || 0;
    var opts = d.opt || [], avail = opts.filter(function (o) { return !o.dis; });
    if (!avail.some(function (o) { return +o.id === selLoc; })) selLoc = avail.length ? +avail[0].id : -1;
    var list = h("div", { class: "ea-panel ea-locs" });
    opts.forEach(function (o) {
      var on = +o.id === selLoc;
      list.appendChild(h("button", { type: "button", class: "ea-loc" + (on ? " on" : "") + (o.dis ? " off" : ""), disabled: o.dis ? true : null, "data-touch": "",
        onclick: function () { if (!pending) { selLoc = +o.id; spawn(d); } } }, [
        h("span", { class: "ea-loc-i" }, ico(o.icon || "pin")),
        h("span", { class: "ea-loc-t" }, [h("b", { text: o.t }), h("small", { text: o.s || "" })]),
        h("span", { class: "ea-loc-c" }, on ? ico("check") : null)]));
    });
    var cur = opts.find(function (o) { return +o.id === selLoc; }) || {};
    function go() {
      if (selLoc < 0) return message("Pilih lokasi dulu.", true);
      request("loc", selLoc, "", "Menyiapkan kedatangan…");
    }
    submitNow = go;
    mount([
      logo("TAHAP 4 / 4"),
      pcard({ lv: +d.level || 1, name: nm(d.name), tag: d.ucp, icon: "user",
        cur: [["cash", num(d.money)], ["bank", num(d.bank)]].concat(onlineCur()) }),
      col("left", [banner(d.newchar ? "KOTA PERTAMA" : "PILIH SPAWN", d.newchar ? "PILIH BANDARA!" : "MASUK KOTA!", avail.length + " lokasi tersedia"),
        bar(d.newchar ? "BANDARA KEDATANGAN" : "LOKASI SPAWN", "PUTAR", "refresh", function () { send("orbit", 1); }), list]),
      col("right", [tier(String(+d.level || 1), "LEVEL", nm(d.name), d.jobName || "Warga", (+d.level || 1) % 10 || 10, "user"),
        mission("STATUS", [
          { t: "Uang tunai", v: money(d.money), p: (+d.money || 0) / Math.max(1, (+d.money || 0) + (+d.bank || 0)) },
          { t: "Saldo bank", v: money(d.bank), p: (+d.bank || 0) / Math.max(1, (+d.money || 0) + (+d.bank || 0)) },
          { t: "Pekerjaan", v: d.jobName || "Warga", p: +d.job > 0 ? 1 : 0.15 },
          { t: "Pemain online", v: num(d.online), p: 1, done: true }]),
        promo(cur.s || "LOKASI", cur.t || "Pilih lokasi", d.newchar ? "Karakter baru memulai dari bandara" : "Geser layar untuk memutar kamera")]),
      stage(function (dir) { send("orbit", dir); }),
      cta("MASUK KOTA", "next", go, "", null, null),
      corner("PUTAR KAMERA", "refresh", function () { send("orbit", 1); }),
      hints([["GESER", true], ["putar kamera", false]])
    ], "ea-v-spawn");
  }

  /* ---------------- LOADING SPAWN (transparan) ---------------- */
  function transition(phase, location) {
    if (phase === "cancel" || phase === "done") {
      clearTimeout(curtainTimer);
      accepted = false;
      if (curtain) {
        var old = curtain; curtain = null;
        if (phase === "done") { old.classList.add("erp-transition-out"); setTimeout(function () { old.remove(); E.touch(); }, 350); }
        else old.remove();
      }
      E.touch();
      return;
    }
    if (phase !== "start" && phase !== "slow") return;
    clearTimeout(curtainTimer);
    // V157: kalau "done" tidak pernah datang, tirai ditutup sendiri.
    curtainTimer = setTimeout(function () { if (curtain) { if (E.report) E.report("auth", "loading spawn ditutup otomatis"); transition("done"); } }, 60000);
    clearPending(); accepted = true;
    if (!curtain) {
      curtain = h("div", { class: "erp-transition ea-load", role: "status", "aria-live": "polite", "data-touch": "" }, [
        h("div", { class: "ea-load-box" }, [h("i", { class: "ea-spin" }),
          h("div", {}, [h("b", { class: "ea-load-to", text: "Memuat kota…" }), h("small", { class: "ea-load-msg", text: "Menyiapkan karakter" })]),
          h("span", { class: "ea-load-bar" }, h("i"))])]);
      document.body.appendChild(curtain);
    }
    if (location) curtain.querySelector(".ea-load-to").textContent = "Menuju " + location;
    if (phase === "slow") curtain.querySelector(".ea-load-msg").textContent = "Lingkungan masih dimuat…";
    hide();
    E.touch();
  }

  E.on("auth_lobby_transition", function (d) { if (d) transition(String(d.phase || ""), d.location); });
  E.on("auth_lobby_result", function (d) {
    if (state.v !== "spawn") return;
    clearPending(); transition("cancel");
    if (root.hidden) spawn(state);
    message((d && d.message) || "Lokasi belum tersedia.", true);
  });
  E.on("auth_result", function (d) {
    if (!d || state.v === "none") return;
    if (d.pending) { message(d.message || "Server masih memproses…"); return; }
    clearPending(); message(d.message || "Coba lagi.", !d.ok, d.field);
  });
  E.on("auth", function (d) {
    if (!d || typeof d.v !== "string") return;
    var prev = state;
    clearPending();
    if (!d.ucp && prev.ucp) d.ucp = prev.ucp;
    state = d;
    submitNow = null;
    if (d.v !== "none" && d.v !== "spawn") transition("cancel");
    switch (d.v) {
      case "login": account(d, false); break;
      case "register": account(d, true); break;
      case "chars": case "charinfo": chars(d); break;
      case "create": create(d); break;
      case "wait": wait(d); break;
      case "spawn":
        if (prev.v !== "spawn") { accepted = false; transition("cancel"); selLoc = -1; }
        spawn(d); break;
      default: state.v = "none"; hide(); if (accepted || curtain) transition("done");
    }
    if (d.pending && state.v !== "none") {
      pending = "server";
      root.classList.add("ea-busy");
      root.querySelectorAll("[data-wait]").forEach(function (b) { b.disabled = true; });
      message("Server masih memproses…");
    }
  });
  root.addEventListener("keydown", function (ev) {
    if (pending || accepted) return;
    var inInput = /INPUT/.test((ev.target || {}).tagName || "");
    if (state.v === "chars" && !inInput && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) {
      var n = slots.length; if (n < 2) return;
      var i = (sel + (ev.key === "ArrowLeft" ? -1 : 1) + n) % n;
      var b = root.querySelectorAll(".ea-slot")[i]; if (b) b.click();
    } else if (ev.key === "Enter" && !inInput && submitNow && state.v !== "login" && state.v !== "register" && state.v !== "create") {
      var go = root.querySelector(".ea-cta-go"); if (go && !go.disabled) go.click();
    }
  });
  if (E.done) E.done("auth");
})();
