/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : look.js   (V159, 5 Nov 2026)
   Toko baju / penampilan karakter (pengganti editor ImGui client).
     client -> halaman  "lookui"   {t:open|draft|wait|close}  (look/LookCef.cpp, katalog + draft)
     server -> halaman  "lookshop" {t:shop, mode, cur, cash, b, p, t2, hp, tp}  (look_system.inc, harga)
     halaman -> client  sendRaw("lookui", {a, s, h, i, d})  (tidak ke server; client meneruskan simpan)
     halaman -> server  send("lookshop", "oldstore")        (toko skin lama)
   Format look (57 byte, hex) sama dengan look::Encode di client.
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var SLOTS = 24, NO_ITEM = 65535;
  var TABS = [
    { id: "char", t: "Karakter", slots: [0, 1, 2, 3] },
    { id: "cloth", t: "Pakaian", slots: [4, 5, 6, 14, 15] },
    { id: "acc", t: "Aksesoris", slots: [7, 8, 9, 10, 11, 12, 13] },
    { id: "tat", t: "Tato", slots: [16, 17, 18, 19, 20, 21, 22, 23] },
    { id: "body", t: "Badan", slots: [] }
  ];
  var TIER = { a: 0, b: 1, c: 2, d: 3, z: 4 };
  var MODE_SHOP = 1, MODE_CREATE = 2, MODE_FREE = 3;

  var st = null;        // editor terbuka: {s, female, opts, kinds, saved, draft, ...}
  var shop = null;      // harga dari server
  var root = null, sendTimer = null;

  /* ------------------------------ format look ------------------------------ */
  function decode(hex) {
    if (typeof hex !== "string" || hex.length !== 114) return null;
    var b = [];
    for (var i = 0; i < 57; i++) { var v = parseInt(hex.substr(i * 2, 2), 16); if (isNaN(v)) return null; b.push(v); }
    if (b[0] !== 2) return null;
    var l = { skin: b[1] | (b[2] << 8), model: b[3], kind: b[4], tone: b[5], head: b[6], items: [], height: b[55], weight: b[56] };
    for (var s = 0; s < SLOTS; s++) l.items.push(b[7 + s * 2] | (b[8 + s * 2] << 8));
    return l;
  }
  function encode(l) {
    var b = [2, l.skin & 255, (l.skin >> 8) & 255, l.model, l.kind, l.tone, l.head];
    for (var s = 0; s < SLOTS; s++) { b.push(l.items[s] & 255); b.push((l.items[s] >> 8) & 255); }
    b.push(l.height); b.push(l.weight);
    var out = "";
    for (var i = 0; i < b.length; i++) out += (b[i] < 16 ? "0" : "") + b[i].toString(16);
    return out;
  }
  function copy(l) { var c = JSON.parse(JSON.stringify(l)); return c; }

  /* ------------------------------ harga ------------------------------ */
  function mode() { return shop && shop.s == st.s ? +shop.mode : 0; }
  function paid() { return mode() === MODE_SHOP; }
  function itemPrice(kind, slot, item) {
    if (!paid() || item === NO_ITEM || item < 0) return 0;
    var tiers = shop.t2 && shop.t2[String(kind)], row = tiers && tiers[slot];
    var base = +(shop.b && shop.b[slot]) || 0;
    var t = row && item < row.length ? TIER[row.charAt(item)] : 0;
    var pct = shop.p && shop.p[t] != null ? +shop.p[t] : 100;
    return Math.round(base * pct / 100);
  }
  // sama dengan server (look_system.inc Look_ShopCost): item jenis model yang sama dan sudah tersimpan = gratis
  // rambut/wajah/tato tetap saat ganti model polisi (client Convert); bawaan model juga gratis
  function isSaved(slot, item) {
    var trait = slot <= 3 || slot >= 16;
    return (st.saved.kind === st.draft.kind || trait) && st.saved.items[slot] === item;
  }
  function owned(slot, item) {
    var cat = kindCat(), cs = cat && cat.slots[slot];
    return isSaved(slot, item) || !!(cs && cs.def === item);
  }
  function totalCost() {
    if (!paid() || !st.draft.model) return 0;
    var d = st.draft, cost = 0;
    for (var s = 0; s < SLOTS; s++) {
      var it = d.items[s];
      if (it === NO_ITEM || owned(s, it)) continue;
      cost += itemPrice(d.kind, s, it);
    }
    if (d.head !== st.saved.head) cost += +shop.hp || 0;
    if (d.tone !== st.saved.tone) cost += +shop.tp || 0;
    return cost;
  }
  function money(n) { return "$" + String(Math.max(0, Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function rgb(c) { c = +c || 0; return "rgb(" + ((c >> 16) & 255) + "," + ((c >> 8) & 255) + "," + (c & 255) + ")"; }

  /* ------------------------------ kirim ------------------------------ */
  function toClient(a, extra) {
    var o = { a: a, s: String(st ? st.s : 0) };
    if (extra) for (var k in extra) o[k] = String(extra[k]);
    E.sendRaw("lookui", o);
  }
  function draftChanged() {
    render();
    if (sendTimer) clearTimeout(sendTimer);
    sendTimer = setTimeout(function () { sendTimer = null; if (st) toClient("draft", { h: encode(st.draft) }); }, 110);
  }

  /* ------------------------------ tampilan ------------------------------ */
  function el() {
    if (root) return root;
    root = h("div", { id: "lookui", class: "lk-root" });
    (document.getElementById("panels") || document.body).appendChild(root);
    return root;
  }
  function kindCat() { return st && st.kinds[String(st.draft.kind)]; }
  function chip(text, on, fn, extra) {
    var b = h("button", { type: "button", class: "lk-chip" + (on ? " on" : "") + (extra ? " " + extra : "") }, text);
    b.addEventListener("click", fn);
    return b;
  }
  function priceTag(p, isOwned) {
    if (isOwned) return h("i", { class: "lk-own", text: "Dipakai" });
    if (!paid()) return null;
    return h("i", { class: p ? "lk-pr" : "lk-pr free", text: p ? money(p) : "Gratis" });
  }

  function slotBlock(slot) {
    var cat = kindCat(); if (!cat) return null;
    var cs = cat.slots[slot]; if (!cs || !cs.it || !cs.it.length) return null;
    var d = st.draft, cur = d.items[slot];
    if (cur !== NO_ITEM && cur >= cs.it.length) cur = NO_ITEM;
    var groups = cs.g || [], curGroup = cur === NO_ITEM ? -1 : cs.it[cur][1];
    var showGroup = st.group[slot] != null ? st.group[slot] : (curGroup >= 0 ? curGroup : 0);
    var head = h("div", { class: "lk-sh" }, [
      h("b", { text: cs.n }),
      h("span", { text: cur === NO_ITEM ? (slot === 0 ? "Botak" : "Tidak ada") : cs.it[cur][0] }),
      cur === NO_ITEM ? null : priceTag(owned(slot, cur) ? 0 : itemPrice(d.kind, slot, cur), isSaved(slot, cur))
    ]);
    var rows = [head];
    var chips = [];
    if (!cs.req) chips.push(chip(slot === 0 ? "Botak" : "Tidak ada", cur === NO_ITEM, function () { d.items[slot] = NO_ITEM; draftChanged(); }, "none"));
    if (groups.length > 1) groups.forEach(function (g, gi) {
      chips.push(chip(g, gi === showGroup, function () { st.group[slot] = gi; render(); }));
    });
    if (chips.length) rows.push(h("div", { class: "lk-chips" }, chips));
    var grid = h("div", { class: "lk-grid" });
    for (var i = 0; i < cs.it.length; i++) {
      var it = cs.it[i];
      if (groups.length > 1 && it[1] !== showGroup) continue;
      (function (i, it) {
        var own = isSaved(slot, i), p = owned(slot, i) ? 0 : itemPrice(d.kind, slot, i);
        var b = h("button", { type: "button", class: "lk-it" + (i === cur ? " on" : "") + (own ? " own" : "") }, [
          h("span", { class: "sw", style: "background:" + rgb(it[2]) }),
          h("em", { text: String(it[0]).replace(groups[it[1]] || "\u0000", "").trim() || it[0] }),
          own ? h("i", { class: "lk-own", text: "Dipakai" }) : (paid() ? h("i", { class: "lk-pr" + (p ? "" : " free"), text: p ? money(p) : "Gratis" }) : null)
        ]);
        b.addEventListener("click", function () { d.items[slot] = i; draftChanged(); });
        grid.appendChild(b);
      })(i, it);
    }
    rows.push(grid);
    return h("div", { class: "lk-slot" }, rows);
  }

  function charTab() {
    var d = st.draft, cat = kindCat(), out = [];
    // model: kustom / skin biasa / polisi
    if (st.opts.length > 1) {
      out.push(h("div", { class: "lk-sh" }, [h("b", { text: "Model" })]));
      out.push(h("div", { class: "lk-chips" }, st.opts.map(function (o, i) {
        var on = (+o.m === d.model) && (!+o.m || +o.k === d.kind);
        return chip(o.label, on, function () { toClient("model", { i: i }); });
      })));
    }
    if (!d.model || !cat) {
      out.push(h("p", { class: "lk-note", text: "Skin biasa: hanya tinggi dan berat badan. Pilih model Kustom untuk wajah, rambut, baju dan tato." }));
      return out;
    }
    out.push(h("div", { class: "lk-sh" }, [h("b", { text: "Warna kulit" }), paid() ? h("i", { class: "lk-pr", text: "Ganti " + money(+shop.tp || 0) }) : null]));
    out.push(h("div", { class: "lk-tones" }, cat.tones.map(function (c, i) {
      var b = h("button", { type: "button", class: "lk-tone" + (i === d.tone ? " on" : ""), style: "background:" + rgb(c) });
      b.addEventListener("click", function () { d.tone = i; draftChanged(); });
      return b;
    })));
    out.push(h("div", { class: "lk-sh" }, [h("b", { text: "Bentuk wajah" }), paid() ? h("i", { class: "lk-pr", text: "Operasi " + money(+shop.hp || 0) }) : null]));
    var faces = [];
    for (var i = 0; i < (cat.heads || 5); i++) (function (i) {
      faces.push(chip("Wajah " + (i + 1), i === d.head, function () { d.head = i; draftChanged(); }));
    })(i);
    out.push(h("div", { class: "lk-chips" }, faces));
    [0, 1, 2, 3].forEach(function (s) { var b = slotBlock(s); if (b) out.push(b); });
    return out;
  }

  function bodyTab() {
    var d = st.draft, can = mode() === MODE_CREATE || mode() === MODE_FREE || !shop;
    if (!can) return [h("p", { class: "lk-note", text: "Tinggi dan berat badan hanya bisa diatur saat membuat karakter." }),
      h("p", { class: "lk-note", text: "Tinggi " + d.height + " cm, berat " + d.weight + " kg." })];
    function slider(name, key, lo, hi, unit) {
      var val = h("b", { text: d[key] + " " + unit });
      var input = h("input", { type: "range", min: lo, max: hi, step: 1, value: d[key], class: "lk-range" });
      input.addEventListener("input", function () { d[key] = +input.value; val.textContent = d[key] + " " + unit; bmi.textContent = bmiText(); });
      input.addEventListener("change", function () { draftChanged(); });
      var minus = chip("−", false, function () { d[key] = Math.max(lo, d[key] - 1); draftChanged(); });
      var plus = chip("+", false, function () { d[key] = Math.min(hi, d[key] + 1); draftChanged(); });
      return h("div", { class: "lk-slot" }, [h("div", { class: "lk-sh" }, [h("b", { text: name }), val]), h("div", { class: "lk-rangebox" }, [minus, input, plus])]);
    }
    function bmiText() { var m = d.height / 100; return "BMI " + (d.weight / (m * m)).toFixed(1); }
    var bmi = h("p", { class: "lk-note", text: bmiText() });
    return [slider("Tinggi badan", "height", st.hmin, st.hmax, "cm"), slider("Berat badan", "weight", st.wmin, st.wmax, "kg"), bmi];
  }

  function render() {
    if (!st) return;
    var r = el(), d = st.draft;
    var m = mode();
    var title = m === MODE_CREATE ? "BUAT KARAKTER" : (m === MODE_SHOP ? "TOKO BAJU" : "PENAMPILAN");
    var cost = totalCost(), cash = shop && shop.s == st.s ? +shop.cash : 0;
    var tab = TABS[st.tab] || TABS[0];
    var tabs = h("div", { class: "lk-tabs" }, TABS.map(function (t, i) {
      return chip(t.t, i === st.tab, function () { st.tab = i; render(); var b = r.querySelector(".lk-body"); if (b) b.scrollTop = 0; }, "tab");
    }));
    var body;
    if (tab.id === "char") body = charTab();
    else if (tab.id === "body") body = bodyTab();
    else if (!d.model) body = [h("p", { class: "lk-note", text: "Pilih model Kustom di tab Karakter untuk baju, aksesoris dan tato." })];
    else body = tab.slots.map(slotBlock).filter(Boolean);
    if (tab.id === "tat" && d.model) body.push(h("p", { class: "lk-note", text: "Tato yang tertutup baju tidak terlihat." }));
    var oldScroll = r.querySelector(".lk-body"); var keep = oldScroll ? oldScroll.scrollTop : 0;
    var saveText = st.waiting ? "Menyimpan…" : (m === MODE_CREATE ? "Selesai" : (cost > 0 ? "Bayar " + money(cost) : "Simpan"));
    var panel = h("div", { class: "lk-panel", "data-touch": "1" }, [
      h("div", { class: "lk-head" }, [
        h("div", null, [h("b", { text: title }), h("small", { text: m === MODE_SHOP ? ("Uang: " + money(cash) + " " + (shop.cur || "")) : (m === MODE_CREATE ? "Gratis: wajah, rambut, tinggi badan" : "") })]),
        h("button", { type: "button", class: "lk-x", text: "×", onclick: function () { cancel(); } })
      ]),
      tabs,
      h("div", { class: "lk-body" }, body),
      h("div", { class: "lk-foot" }, [
        paid() ? h("div", { class: "lk-total" + (cost > cash ? " short" : "") }, [h("span", { text: "Total" }), h("b", { text: money(cost) })]) : null,
        h("div", { class: "lk-btns" }, [
          chip(m === MODE_CREATE ? "Lewati" : "Batal", false, function () { cancel(); }, "ghost"),
          chip(saveText, false, function () { save(); }, "go" + (st.waiting || (paid() && cost > cash) ? " dis" : ""))
        ])
      ])
    ]);
    var tools = h("div", { class: "lk-tools", "data-touch": "1" }, [
      chip("⟲", false, function () { toClient("rot", { d: -35 }); }, "ico"),
      chip("⟳", false, function () { toClient("rot", { d: 35 }); }, "ico"),
      chip(["Badan", "Wajah", "Kaki"][st.view] || "Badan", false, function () { st.view = (st.view + 1) % 3; toClient("cam", { i: st.view }); render(); }, "cam"),
      chip("Acak", false, function () { toClient("random"); }),
      chip("Reset", false, function () { toClient("reset"); }),
      m === MODE_SHOP ? chip("Skin lama", false, function () { E.send("lookshop", "oldstore", -1, ""); }) : null
    ]);
    r.textContent = "";
    r.appendChild(panel);
    r.appendChild(tools);
    r.classList.add("on");
    var nb = r.querySelector(".lk-body"); if (nb) nb.scrollTop = keep;
    E.touch();
  }

  function save() {
    if (!st || st.waiting) return;
    var cost = totalCost(), cash = shop && shop.s == st.s ? +shop.cash : 0;
    if (paid() && cost > cash) { if (U.toast) U.toast("Uang tidak cukup (" + money(cost) + ")"); return; }
    if (sendTimer) { clearTimeout(sendTimer); sendTimer = null; }
    st.waiting = true; render();
    toClient("save", { h: encode(st.draft) });
    setTimeout(function () { if (st && st.waiting) { st.waiting = false; render(); } }, 9000);
  }
  function cancel() {
    if (!st) return;
    toClient("cancel");
    close();
  }
  function close() {
    st = null;
    if (root) { root.classList.remove("on"); root.textContent = ""; }
    E.touch();
  }

  /* ------------------------------ event ------------------------------ */
  E.on("lookui", function (m) {
    if (!m || !m.t) return;
    if (m.t === "open") {
      var saved = decode(m.saved), draft = decode(m.draft);
      if (!saved || !draft) return;
      st = { s: String(m.s), female: +m.female, opts: m.opts || [], kinds: m.kinds || {}, saved: saved, savedKind: saved.kind,
             draft: draft, tab: 0, view: 0, group: {}, waiting: false,
             hmin: +m.hmin || 151, hmax: +m.hmax || 199, wmin: +m.wmin || 41, wmax: +m.wmax || 94 };
      toClient("ack");
      render();
      return;
    }
    if (!st || String(m.s) !== st.s) return;
    if (m.t === "draft") {
      var d2 = decode(m.h);
      if (d2) { st.draft = d2; st.group = {}; render(); }
    } else if (m.t === "wait") {
      st.waiting = !!+m.on; render();
    } else if (m.t === "close") {
      close();
    }
  });
  E.on("lookshop", function (m) {
    if (!m || m.t !== "shop") return;
    shop = m;
    if (st) render();
  });

  window.ELook = { state: function () { return st; }, shop: function () { return shop; }, encode: encode, decode: decode, cost: function () { return st ? totalCost() : 0; } };
  E.done("look");
})();
