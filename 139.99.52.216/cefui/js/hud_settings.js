/* EAGLE HUD Settings Center: client preference layer, no server HUD rewrite. */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  if (!E || !U) return;
  var cfg = {
    style: "compact",
    speedo: "digital",
    scale: 0.65,
    opacity: 0.92,
    accent: "cyan",
    autoHide: 5000,
    qbScale: 1,
    qbOnly: false
  };
  var playerId = 0, timer = 0;
  var styles = ["compact","ring","bars","vertical","minimal","pill","neon","glass","flat","dots","stack","corner"];
  var speedos = ["digital","dial","compact","sport","minimal","neon","bar","pill"];
  var sizes = [0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,1,1.1,1.2,1.3];
  var autoVals = [{v:0,t:"OFF"},{v:2500,t:"2.5s"},{v:5000,t:"5s"},{v:8000,t:"8s"},{v:12000,t:"12s"},{v:20000,t:"20s"},{v:30000,t:"30s"}];

  var root = h("div", { id: "hud-settings", class: "hs-wrap" });
  var card = h("div", { class: "hs-card" });
  var head = h("div", { class: "hs-head" }, [
    h("div", { class: "hs-title" }, [h("b", { text: "HUD CONTROL CENTER" }), h("small", { text: "EAGLE • Personal Layout" })]),
    h("button", { class: "hs-close", type: "button", html: U.icon("x") })
  ]);
  var body = h("div", { class: "hs-body" });
  card.appendChild(head); card.appendChild(body); root.appendChild(card);
  U.layer("panels").appendChild(root);

  function key() { return "eagle_hud_settings_v5_" + String(playerId || "local"); }
  function load() {
    try {
      var raw = localStorage.getItem(key());
      if (raw) { var x = JSON.parse(raw); if (x) for (var k in cfg) if (x[k] != null) cfg[k] = x[k]; }
    } catch (_) {}
    apply(false);
  }
  function save() {
    try { localStorage.setItem(key(), JSON.stringify(cfg)); } catch (_) {}
    apply(true);
  }
  function setVar(k, v) { document.documentElement.style.setProperty(k, v); }
  function apply(showSettings) {
    document.documentElement.setAttribute("data-eagle-hud-style", cfg.style);
    document.documentElement.setAttribute("data-eagle-speedo", cfg.speedo);
    setVar("--eagle-hud-scale", String(cfg.scale));
    setVar("--eagle-hud-opacity", String(cfg.opacity));
    document.documentElement.setAttribute("data-eagle-accent", cfg.accent);
    if (window.EAGLEQuickbar) {
      window.EAGLEQuickbar.setAutoHide(+cfg.autoHide || 0);
      window.EAGLEQuickbar.setScale(+cfg.qbScale || 1);
    }
    if (showSettings) render();
  }
  function btnRow(label, value, options, onChange) {
    var row = h("div", { class: "hs-row" }, [h("div", { class: "hs-label", text: label }), h("div", { class: "hs-options" })]);
    var box = row.querySelector(".hs-options");
    options.forEach(function (o) {
      var b = h("button", { type: "button", class: "hs-opt", text: o.t, "data-v": String(o.v) });
      if (String(o.v) === String(value)) b.classList.add("on");
      b.addEventListener("click", function () { onChange(o.v); });
      box.appendChild(b);
    });
    return row;
  }
  function render() {
    body.innerHTML = "";
    body.appendChild(btnRow("HUD STYLE", cfg.style, styles.map(function (x){return {v:x,t:x.toUpperCase()};}), function(v){cfg.style=v;save();}));
    body.appendChild(btnRow("HUD SIZE", cfg.scale, sizes.map(function(x){return {v:x,t:Math.round(x*100)+"%"};}), function(v){cfg.scale=+v;save();}));
    body.appendChild(btnRow("HUD OPACITY", cfg.opacity, [0.55,0.65,0.75,0.85,0.92,1].map(function(x){return {v:x,t:Math.round(x*100)+"%"};}), function(v){cfg.opacity=+v;save();}));
    body.appendChild(btnRow("SPEEDOMETER", cfg.speedo, speedos.map(function(x){return {v:x,t:x.toUpperCase()};}), function(v){cfg.speedo=v;save();}));
    body.appendChild(btnRow("QUICKBAR AUTO-HIDE", cfg.autoHide, autoVals, function(v){cfg.autoHide=+v;save();}));
    body.appendChild(btnRow("QUICKBAR SIZE", cfg.qbScale, [0.8,0.9,1,1.1,1.2].map(function(x){return {v:x,t:Math.round(x*100)+"%"};}), function(v){cfg.qbScale=+v;save();}));
    body.appendChild(btnRow("ACCENT", cfg.accent, ["cyan","blue","purple","green","gold","red","white"].map(function(x){return {v:x,t:x.toUpperCase()};}), function(v){cfg.accent=v;save();}));
    var foot = h("div", { class: "hs-foot" }, [h("span", { html: U.icon("info") + " Pengaturan disimpan per ID pemain di perangkat." }), h("button", { class: "hs-reset", type: "button", text: "RESET" })]);
    foot.querySelector(".hs-reset").addEventListener("click", function () {
      cfg = {style:"compact",speedo:"digital",scale:.65,opacity:.92,accent:"cyan",autoHide:5000,qbScale:1,qbOnly:false};
      save();
    });
    body.appendChild(foot);
    E.touch();
  }
  function show(d) {
    if (d && d.player != null) playerId = +d.player;
    load(); root.classList.add("on"); render(); E.touch();
    clearTimeout(timer); timer = 0;
  }
  function hide() { root.classList.remove("on"); E.touch(); }
  head.querySelector(".hs-close").addEventListener("click", hide);
  E.on("hudsettings", show);
  E.on("hud", function (d) { if (d && d.id != null) { playerId=+d.id; load(); } });

  // Apply style layer whenever the server HUD update arrives.
  load();
})();
