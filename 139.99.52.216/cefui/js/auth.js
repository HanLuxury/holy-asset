/* EAGLE / Arrival v6 — login, multi karakter, buat karakter, pilih spawn.
 * Ringan: panel kecil di atas dunia game (karakter tetap terlihat), tanpa peta/gambar besar.
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
  var state = { v: "none" }, slots = [], sel = 0, selLoc = -1, draft = {}, draftKey = "";
  var pending = "", pendingTimer = null, curtain = null, curtainTimer = 0, accepted = false, skipTimer = 0;

  function send(a, i, s) { E.send("auth", a, i == null ? -1 : i, s == null ? "" : s); }
  function txt(v) { return v == null || v === "" ? "—" : String(v); }
  function nm(v) { return txt(v).replace(/_/g, " "); }
  function money(v) { return "$" + Math.max(0, Number(v) || 0).toLocaleString("id-ID"); }
  function ico(k) { return U.iconEl(k); }
  function btn(label, cls, fn, icon) {
    return h("button", { type: "button", class: "ea-btn " + (cls || ""), onclick: fn, "data-touch": "" },
      [icon ? ico(icon) : null, h("span", { text: label })]);
  }
  function waitBtn(label, fn, icon) { var b = btn(label, "ea-go", fn, icon); b.setAttribute("data-wait", ""); return b; }
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
  function brand(sub) {
    return h("div", { class: "ea-brand" }, [h("img", { src: "img/rpeagle_logo.webp", alt: "" }),
      h("div", {}, [h("b", { text: "RP EAGLE" }), h("small", { text: sub || "ROLEPLAY" })])]);
  }
  function topbar(title, ucp) {
    return h("header", { class: "ea-top" }, [brand(title),
      ucp ? h("div", { class: "ea-ucp", "data-touch": "" }, [ico("user"), h("span", { text: ucp })]) : null]);
  }
  function mount(children, cls) {
    clearTimeout(skipTimer);
    root.replaceChildren.apply(root, children);
    root.className = "auth ea on " + (cls || "");
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("eagle-auth-active");
    document.body.classList.remove("dlg-open");
    E.touch();
  }
  function hide() {
    clearTimeout(skipTimer);
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

  /* ---------------- TAHAP 1: LOGIN / REGISTER ---------------- */
  function account(d, register) {
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
    var err = d.err || (+d.att > 0 ? "Password salah (" + (+d.att) + "/3)." : "");
    var form = h("form", { class: "ea-card ea-login", "data-touch": "", novalidate: true, onsubmit: function (e) { e.preventDefault(); submit(); } }, [
      brand(register ? "DAFTAR AKUN" : "MASUK"),
      h("h1", { text: register ? "Buat password" : "Selamat datang" }),
      h("p", { class: "ea-sub", text: register ? "UCP baru. Buat password untuk akunmu." : "Masukkan password akun UCP." }),
      h("div", { class: "ea-ucpline" }, [ico("user"), h("b", { text: txt(d.ucp) })]),
      pw.el, cf ? cf.el : null,
      feedback(err),
      h("button", { type: "submit", class: "ea-btn ea-go", "data-touch": "", "data-wait": "" }, [h("span", { text: register ? "Daftar" : "Masuk" })]),
      btn("Keluar", "ea-link", function () { send("quit"); })
    ]);
    mount([form], "ea-v-login");
    if (err) message(err, true);
    setTimeout(function () { if (pw.input.isConnected) pw.input.focus(); }, 120);
  }

  /* ---------------- TAHAP 2: MULTI KARAKTER ---------------- */
  function chars(d) {
    if (Array.isArray(d.slots)) slots = d.slots;
    if (d.sel != null) sel = Math.max(0, Math.min(slots.length - 1, +d.sel || 0));
    if (d.slot != null) sel = +d.slot;
    var cur = slots[sel] || { empty: 1 };
    var list = h("div", { class: "ea-slots", "data-touch": "" });
    slots.forEach(function (s, i) {
      var tag = s.empty ? "Slot kosong" : i === 0 ? "Terakhir dimainkan" : "Karakter " + (i + 1);
      var card = h("button", { type: "button", class: "ea-slot" + (i === sel ? " on" : "") + (s.empty ? " empty" : ""), "data-touch": "",
        onclick: function () { if (pending || i === sel) return; sel = i; send("slot", i); chars({ slots: slots, ucp: d.ucp }); } }, [
        h("span", { class: "ea-slot-n", text: s.empty ? "+" : String(i + 1) }),
        h("span", { class: "ea-slot-t" }, [h("small", { text: tag }),
          h("b", { text: s.empty ? "Buat karakter baru" : nm(s.name) }),
          s.empty ? null : h("em", { text: "Level " + (+s.level || 1) + " · " + (s.job || "Warga") })])
      ]);
      list.appendChild(card);
    });
    var left = h("aside", { class: "ea-col ea-left" }, [h("div", { class: "ea-label", text: "KARAKTER  " + slots.filter(function (s) { return !s.empty; }).length + "/" + slots.length }), list,
      btn("Keluar server", "ea-link", function () { send("quit"); }, "power")]);
    var right = cur.empty ? h("aside", { class: "ea-col ea-right ea-card", "data-touch": "" }, [
      h("div", { class: "ea-label", text: "SLOT " + (sel + 1) }), h("h2", { text: "Karakter baru" }),
      h("p", { class: "ea-sub", text: "Nama, tanggal lahir, jenis kelamin, lalu wajah, rambut, warna kulit dan outfit." })
    ]) : h("aside", { class: "ea-col ea-right ea-card", "data-touch": "" }, [
      h("div", { class: "ea-label", text: "INFO KARAKTER" }),
      h("dl", { class: "ea-dl" }, [["Pekerjaan", cur.job || "Warga"], ["Uang", money(cur.cash)], ["Bank", money(cur.bank)],
        ["Jenis kelamin", +cur.gender === 2 ? "Perempuan" : "Laki-laki"], ["Tanggal lahir", cur.age], ["Login terakhir", cur.last]]
        .map(function (r) { return h("div", {}, [h("dt", { text: r[0] }), h("dd", { text: txt(r[1]) })]); }))
    ]);
    var bottom = h("footer", { class: "ea-bottom" }, [
      h("div", { class: "ea-name" }, [h("small", { text: cur.empty ? "SLOT " + (sel + 1) : "LEVEL " + (+cur.level || 1) }), h("b", { text: cur.empty ? "Karakter baru" : nm(cur.name) })]),
      h("div", { class: "ea-nav", "data-touch": "" }, [
        btn("", "ea-round", function () { pick(-1); }, "back"),
        waitBtn(cur.empty ? "Buat karakter" : "Main", function () {
          request("play", sel, "", cur.empty ? "Membuka pembuatan karakter…" : "Memuat karakter…");
        }, cur.empty ? "plus" : "play"),
        btn("", "ea-round", function () { pick(1); }, "next")]),
      feedback()
    ]);
    function pick(dir) {
      if (pending || slots.length < 2) return;
      sel = (sel + dir + slots.length) % slots.length; send("slot", sel); chars({ slots: slots, ucp: d.ucp });
    }
    mount([topbar("PILIH KARAKTER", d.ucp || state.ucp), left, right, bottom], "ea-v-chars");
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
    var nameLine = h("div", { class: "ea-preview-name" });
    function preview() { nameLine.textContent = (draft.first || "Nama") + " " + (draft.last || "Belakang"); }
    preview();
    var gender = h("div", { class: "ea-seg", role: "group", "aria-label": "Jenis kelamin" });
    [[1, "Laki-laki"], [2, "Perempuan"]].forEach(function (g) {
      var b = btn(g[1], +draft.gender === g[0] ? "on" : "", function () {
        draft.gender = g[0]; send("previewgender", g[0]);
        gender.querySelectorAll(".ea-btn").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
      });
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
    var form = h("form", { class: "ea-card ea-create", "data-touch": "", novalidate: true, onsubmit: function (e) { e.preventDefault(); submit(); } }, [
      h("ol", { class: "ea-steps" }, [h("li", { class: "on", text: "1  Identitas" }), h("li", { text: "2  Penampilan" }), h("li", { text: "3  Kota" })]),
      h("h1", { text: "Karakter baru" }),
      h("div", { class: "ea-row" }, [first.el, last.el]),
      dob.el,
      h("div", { class: "ea-field" }, [h("span", { text: "Jenis kelamin" }), gender]),
      feedback(d.err),
      h("div", { class: "ea-row ea-actions" }, [btn("Kembali", "ea-ghost", function () { if (!pending) { draftKey = ""; draft = {}; request("back"); } }, "back"),
        h("button", { type: "submit", class: "ea-btn ea-go", "data-touch": "", "data-wait": "" }, [h("span", { text: "Lanjut" }), ico("next")])])
    ]);
    mount([topbar("BUAT KARAKTER", d.ucp), form, h("footer", { class: "ea-bottom" }, [h("div", { class: "ea-name" }, [h("small", { text: "SLOT " + ((+d.slot || 0) + 1) }), nameLine])])], "ea-v-create");
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
    var opts = d.opt || [], avail = opts.filter(function (o) { return !o.dis; });
    if (!avail.some(function (o) { return +o.id === selLoc; })) selLoc = avail.length ? +avail[0].id : -1;
    var list = h("div", { class: "ea-locs", "data-touch": "" });
    opts.forEach(function (o) {
      var on = +o.id === selLoc;
      list.appendChild(h("button", { type: "button", class: "ea-loc" + (on ? " on" : "") + (o.dis ? " off" : ""), disabled: o.dis ? true : null, "data-touch": "",
        onclick: function () { if (!pending) { selLoc = +o.id; spawn(d); } } }, [
        h("span", { class: "ea-loc-i" }, ico(o.icon || "pin")),
        h("span", { class: "ea-loc-t" }, [h("b", { text: o.t }), h("small", { text: o.s || "" })]),
        h("span", { class: "ea-loc-c", text: o.dis ? "" : on ? "✓" : "" })]));
    });
    var stage = h("div", { class: "ea-stage", "data-touch": "" });
    var down = null;
    stage.addEventListener("pointerdown", function (e) { down = e.clientX; });
    stage.addEventListener("pointerup", function (e) { if (down != null && !pending && Math.abs(e.clientX - down) > 40) send("orbit", e.clientX > down ? -1 : 1); down = null; });
    var cur = opts.find(function (o) { return +o.id === selLoc; }) || {};
    mount([topbar(d.newchar ? "KOTA PERTAMA" : "PILIH SPAWN", d.ucp),
      h("aside", { class: "ea-col ea-left ea-card", "data-touch": "" }, [
        h("div", { class: "ea-label", text: d.newchar ? "PILIH BANDARA KEDATANGAN" : "MASUK KE KOTA" }), list]),
      stage,
      h("footer", { class: "ea-bottom" }, [
        h("div", { class: "ea-name" }, [h("small", { text: nm(d.name) }), h("b", { text: cur.t || "Pilih lokasi" })]),
        h("div", { class: "ea-nav", "data-touch": "" }, [
          btn("", "ea-round", function () { send("orbit", -1); }, "back"),
          waitBtn("Masuk", function () {
            if (selLoc < 0) return message("Pilih lokasi dulu.", true);
            request("loc", selLoc, "", "Menyiapkan kedatangan…");
          }, "next"),
          btn("", "ea-round", function () { send("orbit", 1); }, "next")]),
        feedback()])
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
    if (state.v === "chars" && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) {
      if (/INPUT/.test((ev.target || {}).tagName || "")) return;
      var b = root.querySelectorAll(".ea-round")[ev.key === "ArrowLeft" ? 0 : 1]; if (b) b.click();
    }
  });
  if (E.done) E.done("auth");
})();
