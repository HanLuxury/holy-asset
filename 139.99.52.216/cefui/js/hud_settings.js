/* EAGLE HUD Settings + real drag/drop layout editor. */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  if (!E || !U) return;

  var defaults = {
    style: "compact", speedo: "digital", scale: 0.65, opacity: 0.92,
    accent: "cyan", autoHide: 5000, qbScale: 1, qbOnly: false
  };
  var cfg = {};
  for (var dk in defaults) cfg[dk] = defaults[dk];

  var playerId = 0, timer = 0, tab = "layout";
  var styles = ["compact","ring","bars","vertical","minimal","pill","neon","glass","flat","dots","stack","corner"];
  var speedos = ["digital","dial","compact","sport","minimal","neon","bar","pill"];
  var sizes = [0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,1,1.1,1.2,1.3];
  var autoVals = [{v:0,t:"OFF"},{v:2500,t:"2.5s"},{v:5000,t:"5s"},{v:8000,t:"8s"},{v:12000,t:"12s"},{v:20000,t:"20s"},{v:30000,t:"30s"}];

  var root = h("div", { id: "hud-settings", class: "hs-wrap", "data-touch": "" });
  var card = h("div", { class: "hs-card" });
  var head = h("div", { class: "hs-head" }, [
    h("div", { class: "hs-title" }, [
      h("b", { text: "HUD CONTROL CENTER" }),
      h("small", { text: "EAGLE • Editor posisi & gaya HUD" })
    ]),
    h("button", { class: "hs-close", type: "button", html: U.icon("x"), title: "Tutup" })
  ]);
  var tabs = h("div", { class: "hs-tabs" }, [
    h("button", { type: "button", class: "hs-tab on", text: "LAYOUT EDITOR", "data-tab": "layout" }),
    h("button", { type: "button", class: "hs-tab", text: "STYLE", "data-tab": "style" })
  ]);
  var body = h("div", { class: "hs-body" });
  card.appendChild(head); card.appendChild(tabs); card.appendChild(body); root.appendChild(card);
  U.layer("panels").appendChild(root);

  function settingsKey() { return "eagle_hud_settings_v6_" + (playerId == null ? "local" : String(playerId)); }
  function loadSettings() {
    for (var k in defaults) cfg[k] = defaults[k];
    try {
      var raw = localStorage.getItem(settingsKey());
      if (raw) {
        var x = JSON.parse(raw);
        if (x) for (var k2 in cfg) if (x[k2] != null) cfg[k2] = x[k2];
      }
    } catch (_) {}
    apply(false);
  }
  function saveSettings() {
    try { localStorage.setItem(settingsKey(), JSON.stringify(cfg)); } catch (_) {}
    apply(false);
  }
  function setVar(k, v) { document.documentElement.style.setProperty(k, v); }
  function apply(showRender) {
    document.documentElement.setAttribute("data-eagle-hud-style", cfg.style);
    document.documentElement.setAttribute("data-eagle-speedo", cfg.speedo);
    document.documentElement.setAttribute("data-eagle-accent", cfg.accent);
    setVar("--eagle-hud-scale", String(cfg.scale));
    setVar("--eagle-hud-opacity", String(cfg.opacity));
    if (window.EAGLEQuickbar) {
      window.EAGLEQuickbar.setAutoHide(+cfg.autoHide || 0);
      window.EAGLEQuickbar.setScale(+cfg.qbScale || 1);
    }
    if (showRender) render();
  }

  function btnRow(label, value, options, onChange) {
    var row = h("div", { class: "hs-row" }, [
      h("div", { class: "hs-label", text: label }),
      h("div", { class: "hs-options" })
    ]);
    var box = row.querySelector(".hs-options");
    options.forEach(function (o) {
      var b = h("button", { type: "button", class: "hs-opt", text: o.t, "data-v": String(o.v) });
      if (String(o.v) === String(value)) b.classList.add("on");
      b.addEventListener("click", function () { onChange(o.v); });
      box.appendChild(b);
    });
    return row;
  }

  function layoutProxy(name, key) {
    var p = h("button", { type: "button", class: "hs-proxy", "data-hud-proxy": key }, [
      h("span", { class: "hs-proxy-grip", text: "⠿" }),
      h("b", { text: name }),
      h("small", { text: "DRAG" })
    ]);
    return p;
  }

  function renderLayout() {
    var manager = window.EAGLEHudLayout;
    body.innerHTML = "";
    var intro = h("div", { class: "hs-intro" }, [
      h("b", { text: "Atur posisi HUD" }),
      h("span", { text: "Geser kartu pada layar. Posisi tersimpan berdasarkan ID pemain dan resolusi." })
    ]);

    var stage = h("div", { class: "hs-stage", "data-stage": "" }, [
      h("div", { class: "hs-grid" }),
      h("div", { class: "hs-stage-title", text: "PREVIEW AREA • SNAP 1%" })
    ]);
    var proxies = {};
    var order = manager ? manager.order : ["status","info","speedo","location","fps","watermark","spectate","radio","quickbar"];
    var targets = manager ? manager.targets : {};
    order.forEach(function (key) {
      if (!targets[key]) return;
      var p = proxies[key] = layoutProxy(targets[key].label, key);
      stage.appendChild(p);
    });

    var tools = h("div", { class: "hs-layout-tools" }, [
      h("div", { class: "hs-selected", text: "Pilih elemen lalu geser" }),
      h("div", { class: "hs-coords", text: "X 0% • Y 0%" }),
      h("div", { class: "hs-help", text: "Tip: posisi menggunakan koordinat persentase, sehingga tidak rusak saat resolusi berubah." }),
      h("div", { class: "hs-actions" }, [
        h("button", { type: "button", class: "hs-primary", text: "SIMPAN LAYOUT" }),
        h("button", { type: "button", class: "hs-reset-layout", text: "RESET POSISI" })
      ])
    ]);
    body.appendChild(intro); body.appendChild(stage); body.appendChild(tools);

    if (!manager) return;
    var layout = manager.current();
    var selected = null;

    function paint(key) {
      if (!key) return;
      var p = proxies[key], pos = layout[key];
      if (!p || !pos) return;
      p.style.left = pos.x + "%";
      p.style.top = pos.y + "%";
      p.classList.toggle("selected", selected === key);
    }
    order.forEach(paint);

    function choose(key) {
      selected = key;
      order.forEach(function (k) { if (proxies[k]) proxies[k].classList.toggle("selected", k === key); });
      if (layout[key]) {
        tools.querySelector(".hs-selected").textContent = targets[key].label;
        tools.querySelector(".hs-coords").textContent = "X " + Math.round(layout[key].x) + "% • Y " + Math.round(layout[key].y) + "%";
      }
    }
    function updateCoords() {
      if (!selected || !layout[selected]) return;
      tools.querySelector(".hs-coords").textContent = "X " + Math.round(layout[selected].x) + "% • Y " + Math.round(layout[selected].y) + "%";
    }
    function dragStart(ev, key) {
      choose(key);
      var p = proxies[key];
      var sr = stage.getBoundingClientRect();
      var startX = ev.clientX, startY = ev.clientY;
      var baseX = layout[key].x, baseY = layout[key].y;
      try { p.setPointerCapture(ev.pointerId); } catch (_) {}
      function move(e) {
        var dx = (e.clientX - startX) / Math.max(1, sr.width) * 100;
        var dy = (e.clientY - startY) / Math.max(1, sr.height) * 100;
        layout[key].x = Math.max(0, Math.min(94, Math.round((baseX + dx) * 1) / 1));
        layout[key].y = Math.max(0, Math.min(92, Math.round((baseY + dy) * 1) / 1));
        paint(key); updateCoords();
        if (e.cancelable) e.preventDefault();
      }
      function done() {
        p.removeEventListener("pointermove", move);
        p.removeEventListener("pointerup", done);
        p.removeEventListener("pointercancel", done);
        try { p.releasePointerCapture(ev.pointerId); } catch (_) {}
        manager.apply(layout);
      }
      p.addEventListener("pointermove", move, { passive: false });
      p.addEventListener("pointerup", done);
      p.addEventListener("pointercancel", done);
      if (ev.cancelable) ev.preventDefault();
    }
    order.forEach(function (key) {
      var p = proxies[key];
      if (!p) return;
      p.addEventListener("pointerdown", function (ev) { dragStart(ev, key); });
      p.addEventListener("click", function () { choose(key); });
    });

    tools.querySelector(".hs-primary").addEventListener("click", function () {
      manager.save(layout);
      tools.querySelector(".hs-selected").textContent = "Layout tersimpan ✓";
      setTimeout(function () { if (root.classList.contains("on")) choose(selected || order[0]); }, 900);
    });
    tools.querySelector(".hs-reset-layout").addEventListener("click", function () {
      layout = manager.reset();
      order.forEach(paint);
      manager.apply(layout);
      choose(selected || order[0]);
    });
    choose(order[0]);
  }

  function renderStyle() {
    body.innerHTML = "";
    body.appendChild(btnRow("HUD STYLE", cfg.style, styles.map(function (x) { return {v:x,t:x.toUpperCase()}; }), function (v) { cfg.style=v; saveSettings(); render(); }));
    body.appendChild(btnRow("HUD SIZE", cfg.scale, sizes.map(function (x) { return {v:x,t:Math.round(x*100)+"%"}; }), function (v) { cfg.scale=+v; saveSettings(); render(); }));
    body.appendChild(btnRow("HUD OPACITY", cfg.opacity, [0.55,0.65,0.75,0.85,0.92,1].map(function (x) { return {v:x,t:Math.round(x*100)+"%"}; }), function (v) { cfg.opacity=+v; saveSettings(); render(); }));
    body.appendChild(btnRow("SPEEDOMETER", cfg.speedo, speedos.map(function (x) { return {v:x,t:x.toUpperCase()}; }), function (v) { cfg.speedo=v; saveSettings(); render(); }));
    body.appendChild(btnRow("QUICKBAR AUTO-HIDE", cfg.autoHide, autoVals, function (v) { cfg.autoHide=+v; saveSettings(); render(); }));
    body.appendChild(btnRow("QUICKBAR SIZE", cfg.qbScale, [0.8,0.9,1,1.1,1.2].map(function (x) { return {v:x,t:Math.round(x*100)+"%"}; }), function (v) { cfg.qbScale=+v; saveSettings(); render(); }));
    body.appendChild(btnRow("ACCENT", cfg.accent, ["cyan","blue","purple","green","gold","red","white"].map(function (x) { return {v:x,t:x.toUpperCase()}; }), function (v) { cfg.accent=v; saveSettings(); render(); }));

    var foot = h("div", { class: "hs-foot" }, [
      h("span", { html: U.icon("info") + " Gaya HUD dan ukuran disimpan per ID pemain di perangkat." }),
      h("button", { class: "hs-reset", type: "button", text: "RESET STYLE" })
    ]);
    foot.querySelector(".hs-reset").addEventListener("click", function () {
      for (var k in defaults) cfg[k] = defaults[k];
      saveSettings(); render();
    });
    body.appendChild(foot);
  }

  function render() {
    tabs.querySelectorAll(".hs-tab").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === tab); });
    if (tab === "layout") renderLayout(); else renderStyle();
    E.touch();
  }
  function show(d) {
    if (d && d.player != null) {
      playerId = +d.player;
      if (window.EAGLEHudLayout) window.EAGLEHudLayout.setPlayerId(playerId);
    }
    loadSettings();
    tab = "layout";
    root.classList.add("on");
    render();
    E.touch();
    clearTimeout(timer); timer = 0;
  }
  function hide() { root.classList.remove("on"); E.touch(); }

  tabs.querySelectorAll(".hs-tab").forEach(function (b) {
    b.addEventListener("click", function () { tab = b.getAttribute("data-tab") || "layout"; render(); });
  });
  head.querySelector(".hs-close").addEventListener("click", hide);
  E.on("hudsettings", show);
  E.on("hud", function (d) {
    if (d && d.id != null) {
      playerId = +d.id;
      window.__EAGLE_PLAYER_ID = playerId;
      if (!root.classList.contains("on")) loadSettings();
    }
  });
  loadSettings();
})();
