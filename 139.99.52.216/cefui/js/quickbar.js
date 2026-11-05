/* EAGLE V123: five quick slots, shared local artwork and server inventory.
   V157 (5 Nov): - "sembunyi otomatis" sekarang hanya meredupkan quickbar; slot tetap
                   terlihat dan bisa ditekan (dulu tray hilang, tinggal tab kecil "ITEM").
                 - slot dipakai saat jari diangkat (pointerup). Event click di WebView
                   Android sering hilang bila jari sedikit bergeser.
                 - tetap jalan walau item_assets.js gagal dimuat. */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;
  var h = U.h;
  var A = window.EAGLEItems || {
    quickSlots: 5,
    info: function (it) { return { label: String((it && it.n) || "Item").replace(/_/g, " ") }; },
    image: function (it) { return h("span", { class: "eagle-qb-item-image", text: String((it && it.n) || "?").charAt(0).toUpperCase() }); }
  };
  var root = h("div", { id: "eagle-quickbar", class: "eagle-qb" });
  var tray = h("div", { class: "eagle-qb-tray" });
  var handle = h("button", { class: "eagle-qb-handle", type: "button", "data-touch": "", html: U.icon("up") + "<span>ITEM</span>" });
  var cells = [];
  for (var i = 0; i < A.quickSlots; i++) {
    var c = h("button", { type: "button", class: "eagle-qb-slot empty", "data-q": i, "data-touch": "" });
    c.appendChild(h("span", { class: "eagle-qb-key", text: String(i + 1) }));
    c.appendChild(h("span", { class: "eagle-qb-icon" }));
    c.appendChild(h("span", { class: "eagle-qb-qty" }));
    c.appendChild(h("span", { class: "eagle-qb-name" }));
    tray.appendChild(c); cells.push(c);
  }
  root.appendChild(tray); root.appendChild(handle);
  U.layer("hudlayer").appendChild(root);

  var state = { show: 0, it: [] };
  var inventoryOpen = false;
  var lastUseAt = -1000;
  // sembunyi otomatis & ukuran diatur editor HUD (EHUD.cfg.qbhide / qbsc)
  var cfg = { autoHide: 5000, scale: 1 };
  var hideTimer = 0;
  var collapsed = false;
  var driving = false;   // saat menyetir quickbar disembunyikan
  var drivingIn = false; // status menyetir terakhir dari speedometer

  function safeZone(on) { document.documentElement.classList.toggle("eagle-qb-visible", !!on); }
  function apply() {
    // saat menyetir quickbar disembunyikan (seperti hotbar FiveM) supaya tidak menimpa speedometer
    var vis = !!+state.show && !driving && !inventoryOpen;
    root.classList.toggle("on", vis);
    root.classList.toggle("peek", collapsed && vis);
    root.style.setProperty("--qb-scale", cfg.scale);
    document.documentElement.style.setProperty("--qb-scale", cfg.scale); // untuk --eagle-qb-space
    // V157: saat redup quickbar tetap di tempat, jadi ruangnya tetap dipakai.
    safeZone(vis);
    // beri tahu editor HUD: komponen bawah yang tertutup quickbar akan diangkat
    try { window.dispatchEvent(new Event("eagle-qb")); } catch (_) {}
    // V153: the wrapper passes taps through; Android must receive each button's
    // rectangle and refresh it after auto-hide, scaling and HUD layout changes.
    E.touch();
  }
  function scheduleHide() {
    clearTimeout(hideTimer);
    if (!+state.show || cfg.autoHide <= 0 || driving || inventoryOpen) { collapsed = false; apply(); return; }
    collapsed = false; apply();
    hideTimer = setTimeout(function () { collapsed = true; apply(); }, cfg.autoHide);
  }
  function wake() { if (!+state.show) return; scheduleHide(); }

  function render() {
    var map = {};
    (state.it || []).forEach(function (it) { map[+it.s] = it; });
    for (var i = 0; i < A.quickSlots; i++) {
      var c = cells[i], it = map[i];
      c.className = "eagle-qb-slot " + (it ? "filled" : "empty");
      var art = c.querySelector(".eagle-qb-icon"); art.replaceChildren();
      if (it) art.appendChild(A.image(it, "eagle-qb-item-image"));
      c.querySelector(".eagle-qb-qty").textContent = it ? ((+it.q || 0) + "x") : "";
      var label = c.querySelector(".eagle-qb-name"); label.replaceChildren();
      if (it) label.appendChild(h("span", {text:A.info(it).label}));
      c.setAttribute("aria-label", it ? "Slot " + (i + 1) + ": " + A.info(it).label + ", " + it.q + " item" : "Slot " + (i + 1) + " kosong");
    }
    window.__EAGLE_PLAYER_ID = state.player != null ? state.player : window.__EAGLE_PLAYER_ID;
    apply();
    wake();
    E.touch();
  }

  E.on("invbar", function (d) {
    for (var k in d) state[k] = d[k];
    if (!+d.show) { state.show = 0; collapsed = false; clearTimeout(hideTimer); }
    render();
  });
  E.on("inv", function (d) {
    if (d && Object.prototype.hasOwnProperty.call(d, "show")) inventoryOpen = !!+d.show;
    // Inventory overlay takes precedence, including later invbar/HUD updates.
    if (inventoryOpen) { clearTimeout(hideTimer); root.classList.remove("on", "peek"); collapsed = false; safeZone(false); }
    else if (+state.show) { render(); }
  });

  handle.addEventListener("click", function () { collapsed = false; apply(); wake(); });
  function slotOf(target) {
    var el = target;
    while (el && el !== root && !(el.hasAttribute && el.hasAttribute("data-q"))) el = el.parentElement;
    return el && el !== root ? el : null;
  }
  function useSlot(el) {
    if (!el || !E.canInteract(root)) return;
    var slot = +el.getAttribute("data-q"), found = null;
    (state.it || []).some(function (it) { if (+it.s === slot) { found = it; return true; } return false; });
    if (!found) { wake(); return; }
    if (inventoryOpen || driving || !+state.show || performance.now() - lastUseAt < 350) return;
    lastUseAt = performance.now(); collapsed = false; apply();
    el.classList.add("used"); setTimeout(function () { el.classList.remove("used"); }, 180);
    E.send("inv", "quickuse", slot, found.t || ""); scheduleHide();
  }
  var press = null;
  root.addEventListener("pointerdown", function (ev) {
    var el = slotOf(ev.target);
    press = el ? { el: el, x: ev.clientX, y: ev.clientY, t: performance.now(), id: ev.pointerId } : null;
    wake();
  }, { passive: true });
  root.addEventListener("pointerup", function (ev) {
    var p = press; press = null; wake();
    if (!p || (p.id != null && ev.pointerId != null && p.id !== ev.pointerId)) return;
    var el = slotOf(ev.target) || p.el;
    // geser kecil (jempol) tetap dihitung tekan; geser jauh = batal
    if (el !== p.el || Math.abs(ev.clientX - p.x) > 28 || Math.abs(ev.clientY - p.y) > 28 || performance.now() - p.t > 1200) return;
    useSlot(el);
  }, { passive: true });
  root.addEventListener("pointercancel", function () { press = null; }, { passive: true });
  // cadangan: perangkat/preview tanpa pointer event (lastUseAt mencegah dobel)
  root.addEventListener("click", function (ev) { useSlot(slotOf(ev.target)); });

  document.addEventListener("keydown", function (ev) {
    if (!E.canInteract(root) || ev.defaultPrevented || ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey || inventoryOpen || driving || !+state.show) return;
    var focused = document.activeElement;
    if (document.body.classList.contains("dlg-open") || focused && (focused.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName))) return;
    var slot = /^[1-5]$/.test(ev.key) ? Number(ev.key) - 1 : -1;
    if (slot >= 0 && (state.it || []).some(function (it) { return +it.s === slot; })) {
      var found = (state.it || []).filter(function (it) { return +it.s === slot; })[0];
      if (performance.now() - lastUseAt < 350) return;
      lastUseAt = performance.now(); ev.preventDefault(); E.send("inv", "quickuse", slot, found.t || ""); scheduleHide();
    }
  });
  window.EAGLEQuickbar = {
    setAutoHide: function (ms) { cfg.autoHide = Math.max(0, +ms || 0); scheduleHide(); },
    setScale: function (v) { cfg.scale = Math.max(.7, Math.min(1.3, +v || 1)); apply(); },
    // dipanggil hud.js setiap speedometer diperbarui; hanya bereaksi saat status menyetir berubah
    setDriving: function (on) { on = !!on; if (on === drivingIn) return; drivingIn = on; driving = on; collapsed = false; apply(); if (!on) scheduleHide(); },
    get: function () { return { autoHide: cfg.autoHide, scale: cfg.scale }; }
  };
  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("quickbar");   // v28: modul dimuat sampai selesai
})();
