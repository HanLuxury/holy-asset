/* EAGLE / Arrival — account, identities, lobby and spawn.
 * Production transport: EAGLE.send("auth", action, index, payload).
 * The server owns account names, slot capacity, permissions and final spawn.
 */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var root = h("div", { id: "auth", class: "auth erp-auth" });
  U.layer("screenlayer").appendChild(root);
  var state = { v: "none" }, slots = [], selectedSlot = 0, selectedLoc = 5;
  var lobbyPage = "lobby", lobbyIdentity = "", createIdentity = "", draft = {};
  var pending = "", pendingTimer = null, curtain = null, accepted = false;
  var resultHandler = null, returnFocus = null;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var prefs = { contrast: false, motion: !reduced };
  try {
    var saved = JSON.parse(localStorage.getItem("eagle_arrival_prefs") || "{}");
    if (typeof saved.contrast === "boolean") prefs.contrast = saved.contrast;
    if (typeof saved.motion === "boolean") prefs.motion = saved.motion && !reduced;
  } catch (_) {}
  function send(a, i, s) { E.send("auth", a, i == null ? -1 : i, s == null ? "" : s); }
  function text(value) { return value == null || value === "" ? "—" : String(value); }
  function name(value) { return text(value).replace(/_/g, " "); }
  function money(value) { return "$" + Math.max(0, Number(value) || 0).toLocaleString("id-ID"); }
  function number(value) { return String(Math.max(0, Number(value) || 0)).padStart(2, "0"); }
  function icon(key) { return U.iconEl(key); }
  function tag(t, cls) { return h("span", { class: "erp-tag " + (cls || ""), text: t }); }
  function label(t) { return h("div", { class: "erp-eyebrow", text: t }); }
  function title(t) { return h("h1", { class: "erp-title", text: t }); }
  function copy(t) { return h("p", { class: "erp-copy", text: t }); }
  function button(t, cls, fn, ico) {
    return h("button", { type: "button", class: "erp-button " + (cls || ""), onclick: fn, "data-touch": "" },
      Array.isArray(t) ? t : [h("span", { text: t }), ico ? icon(ico) : null]);
  }
  function secondary(t, fn, ico) { return button(t, "erp-secondary", fn, ico); }
  function brand() {
    return h("div", { class: "erp-brand" }, [
      h("img", { class: "erp-logo", src: "img/rpeagle_logo.webp", alt: "RP Eagle Roleplay" }),
      h("div", { class: "erp-brand-sub" }, [h("span", { text: "SAN ANDREAS / INDONESIA" })])
    ]);
  }
  function progress(step) {
    return h("ol", { class: "erp-progress", "aria-label": "Tahap masuk" },
      ["AKUN", "KARAKTER", "LOBBY", "SPAWN"].map(function (t, i) {
        return h("li", { class: (i === step ? "active" : i < step ? "complete" : ""), "aria-current": i === step ? "step" : null },
          [h("span", { text: i < step ? "✓" : "0" + (i + 1) }), h("b", { text: t })]);
      }));
  }
  function header(step, ucp) {
    return h("header", { class: "erp-header" }, [brand(), progress(step),
      h("div", { class: "erp-account" }, [h("i", { class: "erp-status-dot" }),
        h("div", {}, [h("small", { text: ucp ? "UCP TERHUBUNG" : "RP EAGLE ROLEPLAY" }), h("b", { text: ucp || "SELAMAT DATANG" })])])]);
  }
  function footer(left, right) {
    return h("footer", { class: "erp-footer" }, [h("span", { text: left || "RP EAGLE ROLEPLAY" }),
      h("span", { class: "erp-footer-right", text: right || "SAN ANDREAS / ROLEPLAY INDONESIA" })]);
  }
  function clearPending() {
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = null; pending = "";
    root.classList.remove("erp-pending");
    root.querySelectorAll("[data-wait]").forEach(function (b) { b.disabled = false; });
  }
  function message(t, bad, field) {
    var el = root.querySelector(".erp-feedback");
    if (el) { el.textContent = t || ""; el.classList.toggle("error", !!bad); }
    if (field) {
      var input = root.querySelector('[name="' + String(field).replace(/[^a-z]/g, "") + '"]');
      if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
    }
    E.touch();
  }
  function request(a, i, s, hint) {
    if (pending || accepted) return;
    pending = a;
    root.classList.add("erp-pending");
    root.querySelectorAll("[data-wait]").forEach(function (b) { b.disabled = true; });
    message(hint || "Menghubungi server…");
    send(a, i, s);
    pendingTimer = setTimeout(function () {
      pendingTimer = null;
      if (!pending) return;
      // Read-only recovery. A registration or spawn must never be retried blindly.
      message("Respons server lebih lama dari biasanya. Memeriksa status…");
      send("resync", -1);
    }, 12000);
  }
  function feedback(t) { return h("div", { class: "erp-feedback", role: "status", "aria-live": "polite", text: t || "" }); }
  function mount(content, cls, step, ucp, foot) {
    root.replaceChildren(h("main", { class: "erp-screen " + cls, "data-touch": "" }, [
      header(step, ucp), content, footer(foot)
    ]));
    root.className = "auth erp-auth on";
    root.classList.toggle("erp-no-motion", !prefs.motion);
    root.classList.toggle("erp-contrast", prefs.contrast);
    document.body.classList.add("eagle-auth-active");
    document.body.classList.remove("dlg-open", "eagle-auth-editor");
    E.touch();
  }
  function hide() {
    root.className = "auth erp-auth";
    document.body.classList.remove("eagle-auth-active", "eagle-auth-editor");
    var version = state;
    setTimeout(function () { if (state === version && state.v === "none") root.replaceChildren(); E.touch(); }, 240);
    E.touch();
  }
  function waitButton(t, fn, ico) { var b = button(t, "erp-primary", fn, ico || "next"); b.setAttribute("data-wait", ""); return b; }
  function formButton(t, ico) {
    var b = button(t, "erp-primary", null, ico || "next");
    b.type = "submit"; b.setAttribute("data-wait", ""); return b;
  }
  function accountField(t, fieldName, attrs, value) {
    var input = h("input", Object.assign({ name: fieldName, class: "erp-input", "data-touch": "", spellcheck: "false", autocomplete: "off" }, attrs || {}));
    input.value = value || "";
    input.addEventListener("input", function () { input.removeAttribute("aria-invalid"); });
    input.addEventListener("focus", function () {
      setTimeout(function () { if (input.isConnected) input.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 200);
    });
    return { input: input, el: h("label", { class: "erp-field" }, [h("span", { text: t }), input]) };
  }
  function passwordField(t, fieldName, hint, registering) {
    var f = accountField(t, fieldName, { type: "password", placeholder: hint, maxlength: "63", autocomplete: registering ? "new-password" : "current-password" });
    var toggle = button("Tampilkan", "erp-password-toggle", function () {
      var visible = f.input.type === "password";
      f.input.type = visible ? "text" : "password";
      toggle.querySelector("span").textContent = visible ? "Sembunyikan" : "Tampilkan";
      toggle.setAttribute("aria-pressed", String(visible));
    });
    toggle.setAttribute("aria-label", "Tampilkan atau sembunyikan password");
    toggle.setAttribute("aria-pressed", "false");
    f.el.appendChild(toggle); f.el.classList.add("erp-password-field");
    return f;
  }
  function help() {
    var overlay = h("div", { class: "erp-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "erp-help-title", "data-touch": "" });
    var close = secondary("Mengerti", function () { overlay.remove(); if (returnFocus) returnFocus.focus(); E.touch(); }, "check");
    overlay.appendChild(h("section", { class: "erp-modal-card" }, [label("PANDUAN AKUN"), h("h2", { id: "erp-help-title", text: "Satu akun. Beberapa identitas." }),
      copy("Nama UCP mengikuti nama yang kamu gunakan saat terhubung ke server."),
      h("ul", { class: "erp-help-list" }, [h("li", { text: "Akun terdaftar: masukkan password UCP yang sama." }),
        h("li", { text: "Akun baru: buat password, lalu isi identitas karakter." }),
        h("li", { text: "Setiap karakter menyimpan identitas, uang, dan progresnya sendiri." }),
        h("li", { text: "Untuk pemulihan akun, hubungi pengelola server. Jangan bagikan password." })]), close]));
    returnFocus = document.activeElement; root.appendChild(overlay); close.focus(); E.touch();
  }
  function auth(d, register) {
    var pw = passwordField(register ? "PASSWORD BARU" : "PASSWORD", "password", register ? "Buat password UCP" : "Masukkan password UCP", register);
    var confirm = register ? passwordField("ULANGI PASSWORD", "confirm", "Konfirmasi password", true) : null;
    var account = accountField("NAMA UCP", "ucp", { type: "text", readonly: true, tabindex: "-1", autocomplete: "username" }, d.ucp);
    account.el.classList.add("erp-account-field");
    var submit = function () {
      var value = pw.input.value;
      if (!value) return message("Masukkan password akunmu.", true, "password");
      if (register && (value.length < 6 || value.length > 63)) return message("Password harus berisi 6–63 karakter.", true, "password");
      if (register && !/^[A-Za-z0-9_\[\]().@#]+$/.test(value)) return message("Gunakan huruf, angka, atau simbol _ [ ] ( ) . @ #", true, "password");
      if (confirm && value !== confirm.input.value) return message("Kedua password belum sama.", true, "confirm");
      request(register ? "regpass" : "loginpass", -1, value, register ? "Mendaftarkan akun…" : "Memverifikasi akun…");
      pw.input.value = ""; if (confirm) confirm.input.value = "";
    };
    var form = h("form", { class: "erp-auth-form", novalidate: true, onsubmit: function (ev) { ev.preventDefault(); submit(); } }, [
      label(register ? "01 / PENDAFTARAN AKUN" : "01 / AKSES AKUN"),
      title(register ? "Kota ini menunggumu." : "Selamat datang\nkembali."),
      copy(register ? "Buat akun UCP untuk memulai kehidupan karaktermu di EAGLE." : "Masuk ke akun UCP dan lanjutkan cerita karaktermu."),
      account.el, pw.el, confirm ? confirm.el : null,
      register ? h("p", { class: "erp-field-hint", text: "6–63 karakter · huruf, angka, _ [ ] ( ) . @ #" }) : null,
      feedback(d.err || (+d.att > 0 ? "Password salah. Percobaan " + (+d.att) + " dari 3." : "")),
      formButton(register ? "Daftar & lanjutkan" : "Masuk ke akun"),
      h("div", { class: "erp-auth-links" }, [secondary("Panduan akun", help, "info"), secondary("Keluar", function () { send("quit"); }, "power")])
    ]);
    mount(h("div", { class: "erp-auth-content" }, [
      h("section", { class: "erp-auth-panel" }, form),
      h("section", { class: "erp-city-editorial", "aria-hidden": "true" }, [
        h("div", { class: "erp-edition", text: "THE CITY IS YOURS" }),
        h("div", { class: "erp-city-word", text: "LOS\nSANTOS." }),
        h("div", { class: "erp-city-caption" }, [h("span", { text: "SAN ANDREAS" }), h("span", { text: "RP EAGLE / ROLEPLAY" })]),
        h("div", { class: "erp-city-line" }), h("p", { text: "Mulai dari satu karakter. Temukan jalanmu sendiri." })])
    ]), register ? "erp-register" : "erp-login", 0, d.ucp, "UCP / " + text(d.ucp));
    if (+d.att > 0 || d.err) message(d.err || "Password salah. Percobaan " + (+d.att) + " dari 3.", true);
  }
  function initials(s) { return name(s).split(" ").filter(Boolean).slice(0, 2).map(function (n) { return n[0]; }).join("").toUpperCase(); }
  function detailRows(rows) {
    return h("dl", { class: "erp-details" }, rows.map(function (r) { return h("div", {}, [h("dt", { text: r[0] }), h("dd", { text: text(r[1]) })]); }));
  }
  function chars(d, info) {
    if (Array.isArray(d.slots)) slots = d.slots;
    if (d.sel != null) selectedSlot = Math.max(0, Math.min(slots.length - 1, +d.sel || 0));
    if (info && d.slot != null) selectedSlot = +d.slot;
    var selected = slots[selectedSlot] || { empty: 1 };
    var list = h("div", { class: "erp-slot-list", role: "group", "aria-label": "Slot karakter" });
    function select(i) {
      if (pending) return;
      selectedSlot = i; send("slot", i); chars(Object.assign({}, d, { slots: slots, sel: i }), false);
    }
    slots.forEach(function (s, i) {
      var b = button([
        h("span", { class: "erp-slot-portrait", text: s.empty ? "+" : initials(s.name), "aria-hidden": "true" }),
        h("span", { class: "erp-slot-text" }, [h("small", { text: "SLOT " + number(i + 1) }),
          h("strong", { text: s.empty ? "Identitas baru" : name(s.name) }),
          h("span", { text: s.empty ? "Buat karakter di slot ini" : "Level " + (+s.level || 1) + "  /  " + (s.job || "Warga") })]),
        h("span", { class: "erp-slot-state", text: selectedSlot === i ? "✓" : "›" })
      ], "erp-slot" + (selectedSlot === i ? " selected" : "") + (s.empty ? " empty" : ""), function () { select(i); });
      b.disabled = !!info;
      b.setAttribute("aria-pressed", String(selectedSlot === i));
      list.appendChild(b);
    });
    var summary = h("section", { class: "erp-character-summary" }, selected.empty ? [
      tag("SLOT TERSEDIA"), h("div", { class: "erp-empty-number", text: number(selectedSlot + 1) }),
      h("h2", { text: "Cerita berikutnya\ndimulai di sini." }), copy("Buat identitas baru. Nama, pekerjaan, dan progres setiap karakter berdiri sendiri.")
    ] : [tag(info ? "KONFIRMASI IDENTITAS" : "IDENTITAS TERPILIH"),
      h("h2", { text: name(info ? d.name : selected.name) }),
      detailRows([["PEKERJAAN", info ? d.job : selected.job || "Warga"],
        ["LEVEL", selected.level || 1], ["UANG TUNAI", info ? d.cash : money(selected.cash)],
        ["SALDO BANK", info ? d.bank : money(selected.bank)],
        ["TANGGAL LAHIR", info ? d.age : selected.age], ["LOGIN TERAKHIR", info ? d.last : selected.last]])
    ]);
    var next = waitButton(selected.empty ? "Buat karakter" : info ? "Lanjut ke lobby" : "Pilih karakter", function () {
      request(info ? "spawn" : "play", selectedSlot, "", selected.empty ? "Membuka formulir identitas…" : "Memuat karakter…");
    });
    summary.appendChild(feedback()); summary.appendChild(next);
    if (info) summary.appendChild(secondary("Kembali ke pilihan", function () { request("cancel"); }, "back"));
    mount(h("div", { class: "erp-character-content" }, [
      h("section", { class: "erp-character-picker" }, [label("02 / MULTI CHARACTER"), title("Pilih\nidentitasmu."),
        copy("Satu UCP. " + slots.length + " slot karakter."), list, secondary("Keluar server", function () { send("quit"); }, "power")]),
      h("div", { class: "erp-character-stage", "aria-hidden": "true" }, [h("span", { class: "erp-stage-caption", text: selected.empty ? "IDENTITAS BARU" : name(selected.name) }), h("span", { class: "erp-stage-rule" })]),
      summary
    ]), "erp-characters", 1, d.ucp || state.ucp, "IDENTITAS " + number(selectedSlot + 1) + " / " + number(slots.length));
  }
  function create(d) {
    var key = String(d.ucp || "") + ":" + (+d.slot || 0);
    if (createIdentity !== key) { createIdentity = key; draft = {}; }
    ["name", "dob", "origin", "height", "weight", "gender"].forEach(function (k) {
      if (d[k] != null && d[k] !== "" && +d[k] !== 0) draft[k] = k === "height" || k === "weight" ? parseInt(d[k], 10) : d[k];
    });
    var form = h("form", { class: "erp-identity-form", autocomplete: "off", novalidate: true });
    var fields = {};
    [["name", "NAMA KARAKTER", "Nama_Belakang", "text", "23"], ["dob", "TANGGAL LAHIR", "25/09/2001", "text", "10"],
      ["origin", "NEGARA ASAL", "Indonesia", "text", "31"], ["height", "TINGGI BADAN / CM", "151–199", "text", "3"],
      ["weight", "BERAT BADAN / KG", "41–94", "text", "2"]].forEach(function (f) {
      var attrs = { type: f[3], placeholder: f[2], maxlength: f[4], required: true };
      if (f[0] === "height" || f[0] === "weight" || f[0] === "dob") attrs.inputmode = "numeric";
      var field = accountField(f[1], f[0], attrs, draft[f[0]]);
      field.input.addEventListener("input", function () { draft[f[0]] = field.input.value; });
      fields[f[0]] = field; form.appendChild(field.el);
    });
    var gender = h("fieldset", { class: "erp-gender" }, h("legend", { text: "JENIS KELAMIN" }));
    [1, 2].forEach(function (g) {
      var radio = h("input", { type: "radio", name: "gender", value: String(g), required: true, "data-touch": "" });
      radio.checked = +draft.gender === g;
      radio.addEventListener("change", function () { draft.gender = g; send("previewgender", g); });
      gender.appendChild(h("label", {}, [radio, h("span", { text: g === 1 ? "Laki-laki" : "Perempuan" })]));
    });
    form.appendChild(gender);
    form.appendChild(h("p", { class: "erp-identity-hint", text: "Gunakan nama roleplay, misalnya Arga_Pratama. Identitas ini terpisah dari nama UCP." }));
    form.appendChild(feedback(d.err));
    function submit() {
      var payload = {};
      Object.keys(fields).forEach(function (k) { payload[k] = fields[k].input.value.trim(); });
      payload.gender = +draft.gender || 0;
      payload.height = Number(payload.height); payload.weight = Number(payload.weight);
      if (!/^[A-Z][A-Za-z.]*_[A-Z][A-Za-z._]*$/.test(payload.name) || payload.name.length > 23 || payload.name.slice(-1) === "_")
        return message("Gunakan format Nama_Belakang, diawali huruf kapital.", true, "name");
      var match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(payload.dob);
      var date = match ? new Date(+match[3], +match[2] - 1, +match[1]) : null;
      if (!match || +match[3] < 1900 || date.getFullYear() !== +match[3] || date.getMonth() !== +match[2] - 1 || date.getDate() !== +match[1] || date > new Date())
        return message("Tanggal lahir harus valid: hh/bb/tttt.", true, "dob");
      if (!/^[A-Za-z][A-Za-z ,.]{1,30}$/.test(payload.origin)) return message("Isi negara asal dengan nama yang valid.", true, "origin");
      if (!Number.isInteger(payload.height) || payload.height < 151 || payload.height > 199) return message("Tinggi badan harus 151–199 cm.", true, "height");
      if (!Number.isInteger(payload.weight) || payload.weight < 41 || payload.weight > 94) return message("Berat badan harus 41–94 kg.", true, "weight");
      if (payload.gender !== 1 && payload.gender !== 2) return message("Pilih jenis kelamin karakter.", true);
      request("createform", +d.slot || 0, JSON.stringify(payload), "Memeriksa dan menyimpan identitas…");
    }
    form.addEventListener("submit", function (ev) { ev.preventDefault(); submit(); });
    form.appendChild(h("div", { class: "erp-form-actions" }, [secondary("Kembali", function () {
      if (!pending) { createIdentity = ""; draft = {}; request("back"); }
    }, "back"), formButton("Simpan identitas", "check")]));
    mount(h("div", { class: "erp-create-content" }, [h("section", { class: "erp-create-intro" }, [label("02 / IDENTITAS BARU"),
      title("Awal dari\nceritamu."), copy("Isi identitas karakter yang akan kamu gunakan di dalam kota."),
      h("div", { class: "erp-document-stamp" }, [h("span", { text: "RP EAGLE" }), h("small", { text: "CITIZEN REGISTRY" }), h("b", { text: "SLOT " + number((+d.slot || 0) + 1) })])]),
      h("section", { class: "erp-create-panel" }, [h("div", { class: "erp-section-heading" }, [h("h2", { text: "Data diri karakter" }), tag("IDENTITAS ROLEPLAY")]), form])
    ]), "erp-create", 1, d.ucp, "PENDAFTARAN KARAKTER / SLOT " + number((+d.slot || 0) + 1));
  }
  function favoriteKey(d) { return "eagle_arrival_spawn_" + String(d.ucp || "") + "_" + String(d.name || ""); }
  function available(d) { return (d.opt || []).filter(function (o) { return !o.dis; }); }
  function chosen(d) { return (d.opt || []).find(function (o) { return +o.id === selectedLoc; }) || available(d)[0] || {}; }
  function savePrefs() { try { localStorage.setItem("eagle_arrival_prefs", JSON.stringify(prefs)); } catch (_) {} }
  function spawnMap(d) {
    var points = (d.opt || []).filter(function (o) { return !o.dis && Number.isFinite(+o.x) && Number.isFinite(+o.y) && o.x != null && o.y != null; });
    var map = h("div", { class: "erp-spawn-map", "aria-label": "Diagram titik spawn dari koordinat server" });
    map.appendChild(h("div", { class: "erp-map-caption" }, [label("SPAWN LOCATIONS"), h("span", { text: "N ↑" })]));
    if (!points.length) { map.appendChild(copy("Pilih titik kedatangan dari daftar lokasi.")); return map; }
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 800 480"); svg.setAttribute("role", "group");
    var xs = points.map(function (o) { return +o.x; }), ys = points.map(function (o) { return +o.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var span = Math.max(maxX - minX, (maxY - minY) * 1.6, 700);
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    function node(tagName, attrs) { var el = document.createElementNS(ns, tagName); Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); }); return el; }
    for (var x = 30; x < 800; x += 74) svg.appendChild(node("line", { x1: x, y1: 25, x2: x, y2: 455, class: "erp-map-grid" }));
    for (var y = 30; y < 480; y += 60) svg.appendChild(node("line", { x1: 20, y1: y, x2: 780, y2: y, class: "erp-map-grid" }));
    svg.appendChild(node("circle", { cx: 400, cy: 240, r: 180, class: "erp-map-range" }));
    svg.appendChild(node("circle", { cx: 400, cy: 240, r: 100, class: "erp-map-range" }));
    points.forEach(function (o) {
      var px = 400 + (+o.x - cx) / span * 620, py = 240 - (+o.y - cy) / span * 620;
      var g = node("g", { class: "erp-map-point" + (+o.id === selectedLoc ? " active" : ""), role: "button", tabindex: "0", "aria-label": "Pilih " + o.t });
      g.appendChild(node("rect", { x: px - 24, y: py - 24, width: Math.min(220, 48 + String(o.t || "").length * 7), height: 48, class: "erp-map-hit" }));
      g.appendChild(node("circle", { cx: px, cy: py, r: 13, class: "erp-map-halo" }));
      g.appendChild(node("circle", { cx: px, cy: py, r: 4, class: "erp-map-dot" }));
      var txt = node("text", { x: px + 20, y: py + 5 }); txt.textContent = String(o.t || "").toUpperCase(); g.appendChild(txt);
      function pick() { if (!pending) { selectedLoc = +o.id; spawn(d); } }
      g.addEventListener("click", pick); g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
      svg.appendChild(g);
    });
    map.appendChild(svg);
    map.appendChild(h("div", { class: "erp-map-legend", text: "DIAGRAM KOORDINAT  /  LOKASI DARI SERVER" }));
    return map;
  }
  function lobby(d) {
    var selected = chosen(d), displayName = name(d.name), view;
    if (lobbyPage === "spawn") return spawn(d);
    var stage = h("div", { class: "erp-lobby-stage", "data-touch": "", "aria-label": "Geser untuk memutar karakter" }, [
      h("div", { class: "erp-stage-identity" }, [tag("KARAKTER AKTIF"), h("strong", { text: displayName }), h("small", { text: "LEVEL " + (+d.level || 1) })]),
      h("div", { class: "erp-orbit-controls" }, [secondary("Putar kiri", function () { send("orbit", -1); }, "back"),
        secondary("Reset", function () { send("orbit", 0); }), secondary("Putar kanan", function () { send("orbit", 1); }, "next")])
    ]);
    var down = null;
    stage.addEventListener("pointerdown", function (e) { if (!e.target.closest("button")) down = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener("pointerup", function (e) { if (down && !pending) { var dx = e.clientX - down.x; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - down.y) * 1.3) send("orbit", dx > 0 ? -1 : 1); } down = null; });
    stage.addEventListener("pointercancel", function () { down = null; });
    var nav = h("nav", { class: "erp-lobby-nav", "aria-label": "Lobby" }, [
      button("Ringkasan", lobbyPage === "lobby" ? "active" : "", function () { lobbyPage = "lobby"; lobby(d); }),
      button("Pengaturan", lobbyPage === "settings" ? "active" : "", function () { lobbyPage = "settings"; lobby(d); })]);
    if (lobbyPage === "settings") {
      view = h("section", { class: "erp-lobby-summary" }, [label("PREFERENSI TAMPILAN"), h("h2", { text: "Atur kenyamananmu." }),
        copy("Pengaturan lobby tersimpan di perangkat ini."),
        button("Animasi  /  " + (prefs.motion ? "Aktif" : "Nonaktif"), "erp-setting", function () { prefs.motion = !prefs.motion; savePrefs(); lobby(d); }),
        button("Kontras  /  " + (prefs.contrast ? "Tinggi" : "Standar"), "erp-setting", function () { prefs.contrast = !prefs.contrast; savePrefs(); lobby(d); }),
        secondary("Kembali ke ringkasan", function () { lobbyPage = "lobby"; lobby(d); }, "back")]);
    } else {
      view = h("section", { class: "erp-lobby-summary" }, [label("03 / LOBBY KARAKTER"), title("Siap kembali\nke kota?"),
        copy("Cek identitasmu, lalu tentukan titik kedatangan."),
        detailRows([["UANG TUNAI", money(d.money)], ["SALDO BANK", money(d.bank)], ["PEKERJAAN", d.jobName || "Warga"],
          ["KEANGGOTAAN", +d.vip > 0 ? "VIP " + (+d.vip) : "Warga RP EAGLE"]])]);
    }
    var arrival = h("aside", { class: "erp-arrival-card" }, [h("div", { class: "erp-arrival-top" }, [icon("pin"), tag("TITIK KEDATANGAN")]),
      h("h2", { text: selected.t || "Pilih lokasi" }), copy(selected.s || "Tentukan titik spawn sebelum masuk ke kota."),
      h("div", { class: "erp-arrival-divider" }), h("p", { class: "erp-field-hint", text: available(d).length + " lokasi tersedia untuk karakter ini." }),
      button("Pilih lokasi spawn", "erp-primary", function () { lobbyPage = "spawn"; spawn(d); }, "next"),
      feedback(), secondary("Keluar server", function () { send("quit"); }, "power")]);
    mount(h("div", { class: "erp-lobby-content" }, [h("div", { class: "erp-lobby-left" }, [nav, view]), stage, arrival]), "erp-lobby", 2, d.ucp,
      (+d.online || 0) + " PEMAIN DI KOTA  /  " + displayName);
  }
  function spawn(d) {
    var opts = d.opt || [], current = chosen(d), fav = null;
    try { fav = localStorage.getItem(favoriteKey(d)); } catch (_) {}
    var list = h("div", { class: "erp-location-list", role: "group", "aria-label": "Titik kedatangan" });
    opts.forEach(function (o) {
      var b = h("button", { type: "button", class: "erp-location" + (+o.id === selectedLoc ? " selected" : "") + (o.dis ? " locked" : ""),
        disabled: o.dis ? true : null, "aria-pressed": String(+o.id === selectedLoc), "data-touch": "", onclick: function () {
          if (!pending) { selectedLoc = +o.id; spawn(d); }
        } }, [h("span", { class: "erp-location-index", text: number(+o.id + 1) }), h("span", {}, [h("b", { text: o.t }), h("small", { text: o.s || "" })]),
          h("span", { class: "erp-location-check", text: o.dis ? "—" : +o.id === selectedLoc ? "✓" : "›" })]);
      list.appendChild(b);
    });
    var favorite = secondary(String(fav) === String(selectedLoc) ? "Lokasi favorit ✓" : "Jadikan lokasi favorit", function () {
      try { localStorage.setItem(favoriteKey(d), String(selectedLoc)); message("Lokasi favorit disimpan."); } catch (_) { message("Perangkat tidak dapat menyimpan preferensi.", true); }
      favorite.querySelector("span").textContent = "Lokasi favorit ✓";
    }, "pin");
    mount(h("div", { class: "erp-spawn-content" }, [
      h("section", { class: "erp-location-picker" }, [label("04 / SPAWN SELECT"), title("Tentukan\ntitik awal."), copy("Pilih lokasi untuk melanjutkan roleplay."), list,
        secondary("Kembali ke lobby", function () { if (!pending) { lobbyPage = "lobby"; lobby(d); } }, "back")]),
      h("section", { class: "erp-spawn-overview" }, [spawnMap(d), h("div", { class: "erp-spawn-confirm" }, [h("div", {}, [tag("TUJUAN TERPILIH"),
        h("h2", { text: current.t || "Belum ada lokasi" }), copy(current.s || "")]),
        h("div", { class: "erp-spawn-actions" }, [favorite, waitButton("Masuk ke kota", function () {
          if (!current || current.dis || current.id == null) return message("Tidak ada lokasi spawn yang tersedia.", true);
          request("loc", +current.id, "", "Menyiapkan kedatangan…");
        }, "next")])]), feedback()])
    ]), "erp-spawn", 3, d.ucp, name(d.name) + " / PEMILIHAN SPAWN");
    requestAnimationFrame(function () {
      if (!list.isConnected || list.scrollHeight <= list.clientHeight) return;
      var active = list.querySelector(".selected");
      if (active) list.scrollTop += active.getBoundingClientRect().top - list.getBoundingClientRect().top - Math.max(0, (list.clientHeight - active.offsetHeight) / 2);
      E.touch();
    });
    resultHandler = function (d) { clearPending(); if (curtain) transition("cancel"); message(d.message || "Lokasi belum tersedia.", true); };
  }
  function transition(phase, location) {
    if (phase === "cancel") {
      accepted = false; if (curtain) curtain.remove(); curtain = null; E.touch(); return;
    }
    if (phase === "done") {
      accepted = false;
      if (curtain) { var old = curtain; curtain = null; old.classList.add("erp-transition-out"); setTimeout(function () { old.remove(); E.touch(); }, 500); }
      return;
    }
    if (phase !== "start" && phase !== "slow") return;
    clearPending(); accepted = true;
    if (!curtain) {
      curtain = h("div", { class: "erp-transition", role: "status", "aria-live": "polite", "data-touch": "" }, [brand(),
        h("div", { class: "erp-transition-content" }, [label("RP EAGLE / ARRIVAL"), h("h1", { text: "Selamat datang\ndi kota." }),
          h("div", { class: "erp-transition-location" }), h("div", { class: "erp-loading-track" }, h("i")),
          h("p", { class: "erp-transition-message", text: "Memuat karakter dan lingkungan…" })]), footer("MEMASUKI DUNIA ROLEPLAY")]);
      document.body.appendChild(curtain);
    }
    if (location) curtain.querySelector(".erp-transition-location").textContent = String(location).toUpperCase();
    if (phase === "slow") curtain.querySelector(".erp-transition-message").textContent = "Lingkungan masih dimuat. Tunggu sebentar…";
    E.touch();
  }
  function editor(open) {
    if (state.v !== "spawn") return;
    root.classList.toggle("au-under-editor", open);
    document.body.classList.toggle("eagle-auth-editor", open);
    document.body.classList.toggle("eagle-auth-active", !open);
    E.touch();
  }
  E.on("eagle_character_open", function () { editor(true); });
  E.on("eagle_character_close", function () { editor(false); });
  E.on("OPEN_CLOTHES_UI", function () { editor(true); });
  E.on("CLOSE_CLOTHES_UI", function () { editor(false); });
  E.on("auth_lobby_transition", function (d) { if (d) transition(String(d.phase || ""), d.location); });
  E.on("auth_lobby_result", function (d) { if (state.v === "spawn") { if (resultHandler) resultHandler(d || {}); else { clearPending(); transition("cancel"); message(d && d.message, true); } } });
  E.on("auth_result", function (d) {
    if (!d || state.v === "none") return;
    if (d.pending) { message(d.message || "Server masih memproses permintaan…"); return; }
    clearPending(); message(d.message || "Silakan coba kembali.", !d.ok, d.field);
  });
  E.on("auth", function (d) {
    if (!d || typeof d.v !== "string") return;
    var prev = state;
    clearPending(); resultHandler = null;
    if (!d.ucp && prev.ucp) d.ucp = prev.ucp;
    state = d;
    if (d.v !== "none" && d.v !== "spawn") transition("cancel");
    switch (d.v) {
      case "login": auth(d, false); break;
      case "register": auth(d, true); break;
      case "chars": chars(d, false); break;
      case "charinfo": chars(d, true); break;
      case "create": create(d); break;
      case "spawn":
        if (lobbyIdentity !== d.ucp + ":" + d.name || prev.v !== "spawn") {
          lobbyIdentity = d.ucp + ":" + d.name; lobbyPage = "lobby"; accepted = false; transition("cancel");
          try { selectedLoc = Number(localStorage.getItem(favoriteKey(d)) || 5); } catch (_) { selectedLoc = 5; }
          if (!available(d).some(function (o) { return +o.id === selectedLoc; })) selectedLoc = +(available(d)[0] || { id: 5 }).id;
        }
        lobby(d); break;
      default: state.v = "none"; hide(); if (accepted) transition("done");
    }
    if (d.pending && state.v !== "none") {
      pending = "server";
      root.classList.add("erp-pending");
      root.querySelectorAll("[data-wait]").forEach(function (b) { b.disabled = true; });
      message("Server masih memproses permintaan…");
    }
  });
  root.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape" || pending || accepted) return;
    var modal = root.querySelector(".erp-modal");
    if (modal) { modal.remove(); if (returnFocus) returnFocus.focus(); E.touch(); }
    else if (state.v === "spawn" && lobbyPage !== "lobby") { lobbyPage = "lobby"; lobby(state); }
    else if (state.v === "charinfo") request("cancel");
  });
  if (E.done) E.done("auth");
})();
