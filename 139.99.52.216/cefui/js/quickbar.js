/* EAGLE V123: five quick slots, shared local artwork and server inventory. */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, A = window.EAGLEItems, h = U.h;
  if (!E || !U) return;
  var root = h("div", { id: "eagle-quickbar", class: "eagle-qb", "data-touch": "" });
  var tray = h("div", { class: "eagle-qb-tray" });
  var handle = h("button", { class: "eagle-qb-handle", type: "button", html: U.icon("up") + "<span>ITEM</span>" });
  var cells = [];
  for (var i = 0; i < A.quickSlots; i++) {
    var c = h("button", { type: "button", class: "eagle-qb-slot empty", "data-q": i });
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
    safeZone(vis && !collapsed);
    // beri tahu editor HUD: komponen bawah yang tertutup quickbar akan diangkat
    try { window.dispatchEvent(new Event("eagle-qb")); } catch (_) {}
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
  root.addEventListener("pointerdown", wake, { passive: true });
  root.addEventListener("pointerup", wake, { passive: true });
  root.addEventListener("click", function (ev) {
    var el = ev.target;
    while (el && el !== root && !el.hasAttribute("data-q")) el = el.parentElement;
    if (!el || el === root || !E.canInteract(root)) return;
    var slot = +el.getAttribute("data-q"), found = null;
    (state.it || []).some(function (it) { if (+it.s === slot) { found = it; return true; } return false; });
    if (found && !inventoryOpen && !driving && +state.show) { collapsed = false; apply(); E.send("inv", "quickuse", slot); scheduleHide(); }
  });

  document.addEventListener("keydown", function (ev) {
    if (!E.canInteract(root) || ev.defaultPrevented || ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey || inventoryOpen || driving || !+state.show) return;
    var focused = document.activeElement;
    if (document.body.classList.contains("dlg-open") || focused && (focused.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName))) return;
    var slot = /^[1-5]$/.test(ev.key) ? Number(ev.key) - 1 : -1;
    if (slot >= 0 && (state.it || []).some(function (it) { return +it.s === slot; })) {
      ev.preventDefault(); E.send("inv", "quickuse", slot); scheduleHide();
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
