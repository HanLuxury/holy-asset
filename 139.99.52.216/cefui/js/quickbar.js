/* EAGLE 6-slot quickbar: independent from inventory DOM. */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  if (!E || !U) return;
  var root = h("div", { id: "eagle-quickbar", class: "eagle-qb", "data-touch": "" });
  var tray = h("div", { class: "eagle-qb-tray" });
  var handle = h("button", { class: "eagle-qb-handle", type: "button", html: U.icon("up") + "<span>ITEM</span>" });
  var cells = [];
  for (var i = 0; i < 6; i++) {
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
  var cfg = { autoHide: 5000, scale: 1 };
  var hideTimer = 0;
  var collapsed = false;

  function prefsKey() {
    var id = window.__EAGLE_PLAYER_ID;
    return "eagle_qb_v2_" + (id == null ? "local" : String(id));
  }
  function loadPrefs() {
    try {
      var raw = localStorage.getItem(prefsKey());
      if (raw) {
        var x = JSON.parse(raw);
        if (x && x.autoHide != null) cfg.autoHide = Math.max(0, +x.autoHide || 0);
        if (x && x.scale != null) cfg.scale = Math.max(.7, Math.min(1.3, +x.scale || 1));
      }
    } catch (_) {}
  }
  function savePrefs() {
    try { localStorage.setItem(prefsKey(), JSON.stringify(cfg)); } catch (_) {}
  }
  loadPrefs();

  function safeZone(on) { document.documentElement.classList.toggle("eagle-qb-visible", !!on); }
  function apply() {
    root.classList.toggle("on", !!state.show);
    root.classList.toggle("peek", collapsed && !!state.show);
    root.style.setProperty("--qb-scale", cfg.scale);
    safeZone(!!state.show && !collapsed);
  }
  function scheduleHide() {
    clearTimeout(hideTimer);
    if (!state.show || cfg.autoHide <= 0) { collapsed = false; apply(); return; }
    collapsed = false; apply();
    hideTimer = setTimeout(function () { collapsed = true; apply(); }, cfg.autoHide);
  }
  function wake() { if (!state.show) return; scheduleHide(); }

  function render() {
    var map = {};
    (state.it || []).forEach(function (it) { map[+it.s] = it; });
    for (var i = 0; i < 6; i++) {
      var c = cells[i], it = map[i];
      c.className = "eagle-qb-slot " + (it ? "filled" : "empty");
      c.querySelector(".eagle-qb-icon").innerHTML = it ? U.esc(U.itemIcon(it.n, it.m)) : "";
      c.querySelector(".eagle-qb-qty").textContent = it ? ((+it.q || 0) + "x") : "";
      c.querySelector(".eagle-qb-name").textContent = it ? U.plain(it.n || "") : "";
    }
    window.__EAGLE_PLAYER_ID = state.player != null ? state.player : window.__EAGLE_PLAYER_ID;
    apply();
    wake();
    E.touch();
  }

  E.on("invbar", function (d) {
    for (var k in d) state[k] = d[k];
    if (!d.show) { state.show = 0; collapsed = false; clearTimeout(hideTimer); }
    loadPrefs(); render();
  });
  E.on("hudsettings", function (d) {
    if (d && d.player != null) window.__EAGLE_PLAYER_ID = d.player;
  });
  E.on("inv", function (d) {
    // Inventory overlay takes precedence over the bar.
    if (d && +d.show) { clearTimeout(hideTimer); root.classList.remove("on", "peek"); collapsed = false; safeZone(false); }
    else if (state.show) { render(); }
  });

  handle.addEventListener("click", function () { collapsed = false; apply(); wake(); });
  root.addEventListener("pointerdown", wake, { passive: true });
  root.addEventListener("pointerup", wake, { passive: true });
  root.addEventListener("click", function (ev) {
    var el = ev.target;
    while (el && el !== root && !el.hasAttribute("data-q")) el = el.parentElement;
    if (!el || el === root) return;
    var slot = +el.getAttribute("data-q"), found = null;
    (state.it || []).some(function (it) { if (+it.s === slot) { found = it; return true; } return false; });
    if (found) { collapsed = false; apply(); E.send("inv", "quickuse", slot); scheduleHide(); }
  });

  window.EAGLEQuickbar = {
    setAutoHide: function (ms) { cfg.autoHide = Math.max(0, +ms || 0); savePrefs(); scheduleHide(); },
    setScale: function (v) { cfg.scale = Math.max(.7, Math.min(1.3, +v || 1)); savePrefs(); apply(); },
    get: function () { return { autoHide: cfg.autoHide, scale: cfg.scale }; }
  };
})();
