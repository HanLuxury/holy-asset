/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : hud.js
   HUD status (3 gaya), info pemain, speedometer, kompas/lokasi, FPS,
   notifikasi, item box, progress bar, banner (warning/pesan global/
   badai/asuransi/footer), overlay layar, tombol interaksi, spectate.
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;

  /* ============================ HUD ============================ */
  var hud = { show: 0, mode: 1, hp: 100, ar: 0, hg: 100, th: 100, st: 0, info: 0 };
  var hudEl = h("div", { id: "hud", class: "hud" });
  var infoEl = h("div", { id: "hud-info", class: "hud-info glass" });
  U.layer("hudlayer").appendChild(hudEl);
  U.layer("hudlayer").appendChild(infoEl);

  var STATS = [
    { k: "hp", icon: "heart", c: "hp", t: "Darah" },
    { k: "ar", icon: "shield", c: "ar", t: "Armor" },
    { k: "hg", icon: "food", c: "hg", t: "Lapar" },
    { k: "th", icon: "drink", c: "th", t: "Haus" },
    { k: "st", icon: "brain", c: "st", t: "Stres" }
  ];
  function ring(v) {
    var r = 15, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, v)) / 100);
    return '<svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="' + r + '" class="rbg"/>' +
      '<circle cx="18" cy="18" r="' + r + '" class="rfg" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/></svg>';
  }
  function renderHud() {
    hudEl.className = "hud mode-" + (hud.mode || 1) + (hud.show ? " on" : "");
    var html = "";
    STATS.forEach(function (s) {
      var v = Math.round(+hud[s.k] || 0);
      if (s.k === "ar" && v <= 0 && hud.mode !== 3) return;          // armor 0 disembunyikan
      var low = (s.k === "st") ? v >= 70 : v <= 25;
      if (hud.mode === 2) {
        html += '<div class="hb ' + s.c + (low ? " low" : "") + '"><span class="hb-ic">' + U.icon(s.icon) + '</span>' +
          '<div class="hb-bar"><i style="width:' + v + '%"></i></div><b>' + v + "</b></div>";
      } else if (hud.mode === 3) {
        html += '<div class="hv ' + s.c + (low ? " low" : "") + '"><div class="hv-bar"><i style="height:' + v + '%"></i></div>' +
          '<span class="hv-ic">' + U.icon(s.icon) + "</span></div>";
      } else {
        html += '<div class="hc ' + s.c + (low ? " low" : "") + '">' + ring(v) + '<span class="hc-ic">' + U.icon(s.icon) + "</span></div>";
      }
    });
    // indikator mode suara (1 = berbisik, 2 = normal, 3 = teriak)
    var vm = Math.max(1, Math.min(3, +hud.vm || 2));
    html += '<div class="hud-voice v' + vm + '">' + U.icon("mic") + "<i" + (vm >= 1 ? ' class="on"' : "") + "></i><i" +
      (vm >= 2 ? ' class="on"' : "") + "></i><i" + (vm >= 3 ? ' class="on"' : "") + "></i></div>";
    hudEl.innerHTML = html;
    // panel info kanan
    infoEl.className = "hud-info glass" + (hud.show && hud.info ? " on" : "");
    infoEl.innerHTML =
      '<div class="hi-row"><span class="hi-ic">' + U.icon("id") + '</span><div><small>ID</small><b>' + U.esc(hud.id != null ? "#" + hud.id : "-") + "</b></div></div>" +
      '<div class="hi-row"><span class="hi-ic c-cash">' + U.icon("cash") + '</span><div><small>Cash</small><b>' + U.money(hud.cash) + "</b></div></div>" +
      '<div class="hi-row"><span class="hi-ic c-bank">' + U.icon("bank") + '</span><div><small>Bank</small><b>' + U.money(hud.bank) + "</b></div></div>" +
      '<div class="hi-row"><span class="hi-ic">' + U.icon("user") + '</span><div><small>' + U.esc(hud.fac || "Civilian") + '</small><b>' + U.esc(hud.job || "-") + "</b></div></div>" +
      '<div class="hi-row"><span class="hi-ic">' + U.icon("users") + '</span><div><small>Pemain</small><b>' + U.esc((hud.on != null ? hud.on : 0) + " Online") + "</b></div></div>";
  }
  E.on("hud", function (d) {
    for (var k in d) hud[k] = d[k];
    if (d && d.id != null) window.__EAGLE_PLAYER_ID = +d.id;
    renderHud();
    if (window.EAGLEHudLayout) window.EAGLEHudLayout.applySaved();
  });

  /* ============================ SPEEDO ============================ */
  var sp = { show: 0 };
  var spEl = h("div", { id: "speedo", class: "speedo" });
  U.layer("hudlayer").appendChild(spEl);
  function renderSpeedo() {
    spEl.className = "speedo" + (sp.show ? " on" : "");
    if (!sp.show) return;
    var kmh = Math.max(0, Math.round(+sp.kmh || 0));
    var pct = Math.min(1, kmh / 260);
    var arc = 2 * Math.PI * 42 * 0.75, off = arc * (1 - pct);
    var fuel = Math.max(0, Math.min(100, +sp.fuel || 0));
    var vh = Math.max(0, Math.min(100, sp.hp != null ? +sp.hp : 100));
    spEl.innerHTML =
      '<svg viewBox="0 0 100 100" class="sp-dial"><circle cx="50" cy="50" r="42" class="sp-bg" stroke-dasharray="' + arc.toFixed(1) + ' 999"/>' +
      '<circle cx="50" cy="50" r="42" class="sp-fg" stroke-dasharray="' + arc.toFixed(1) + ' 999" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
      '<div class="sp-num"><b>' + kmh + '</b><small>KM/H</small><span class="sp-gear">' + U.esc(sp.gear || "N") + "</span></div>" +
      '<div class="sp-bars"><div class="sp-line f"><span>' + U.icon("fuel") + '</span><div class="bar"><i style="width:' + fuel + '%"></i></div></div>' +
      '<div class="sp-line e"><span>' + U.icon("engine") + '</span><div class="bar"><i style="width:' + vh + '%"></i></div></div></div>' +
      '<div class="sp-flags"><span class="' + (sp.eng ? "on" : "") + '">' + U.icon("power") + '</span><span class="' + (sp.lig ? "on" : "") + '">' +
      U.icon("light") + '</span><span class="' + (sp.lock ? "on red" : "") + '">' + U.icon(sp.lock ? "lock" : "unlock") + "</span></div>";
  }
  E.on("speedo", function (d) { for (var k in d) sp[k] = d[k]; renderSpeedo(); });

  /* ============================ LOKASI / KOMPAS ============================ */
  var locEl = h("div", { id: "hud-loc", class: "hud-loc" });
  U.layer("hudlayer").appendChild(locEl);
  E.on("location", function (d) {
    locEl.className = "hud-loc" + (d.show ? " on" : "");
    if (!d.show) return;
    locEl.innerHTML = '<span class="dir">' + U.esc(d.dir || "") + '</span><span class="sep"></span><span class="zone">' + U.icon("pin") + U.esc(d.zone || "") + "</span>" +
      (d.time ? '<span class="sep"></span><span class="time">' + U.icon("clock") + U.esc(d.time) + "</span>" : "");
  });

  /* ============================ FPS ============================ */
  var fpsEl = h("div", { id: "hud-fps", class: "hud-fps" });
  U.layer("hudlayer").appendChild(fpsEl);
  E.on("fps", function (d) {
    fpsEl.className = "hud-fps" + (d.show ? " on" : "");
    if (d.show) fpsEl.innerHTML = "FPS <b>" + (+d.fps || 0) + "</b> &nbsp; PING <b>" + (+d.ping || 0) + "</b>" + (d.pl != null ? " &nbsp; PL <b>" + U.esc(d.pl) + "</b>" : "");
  });

  /* ============================ WATERMARK / NAMA ============================ */
  var wmEl = h("div", { id: "hud-wm", class: "hud-wm" });
  U.layer("hudlayer").appendChild(wmEl);
  E.on("watermark", function (d) {
    wmEl.className = "hud-wm" + (d.show ? " on" : "");
    if (d.show) wmEl.innerHTML = '<div class="wm-logo">' + U.fmt(d.t || "EAGLE") + '<span>' + U.fmt(d.s || "ROLEPLAY") + "</span></div>" +
      (d.l ? '<div class="wm-line">' + U.fmt(d.l) + "</div>" : "");
  });

  /* ============================ NOTIFIKASI ============================ */
  var NT = {
    0: { c: "err", t: "ERROR", i: "err" }, 1: { c: "ok", t: "BERHASIL", i: "ok" },
    2: { c: "warn", t: "PERINGATAN", i: "warn" }, 3: { c: "info", t: "INFO", i: "info" },
    4: { c: "syn", t: "PERINTAH", i: "list" }
  };
  var notifBox = h("div", { id: "notify", class: "notify-stack" });
  U.layer("toastlayer").appendChild(notifBox);
  function pushToast(box, el, ms, max) {
    el.style.setProperty("--dur", ms + "ms");
    box.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("on"); });
    while (box.children.length > max) box.removeChild(box.firstChild);
    setTimeout(function () {
      el.classList.remove("on");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, ms);
  }
  E.on("notify", function (d) {
    var m = NT[+d.t] || NT[3];
    var el = h("div", { class: "toast t-" + m.c }, [
      h("span", { class: "t-ic", html: U.icon(m.i) }),
      h("div", { class: "t-body" }, [h("b", { text: d.title || m.t }), h("div", { html: U.fmt(d.m) })])
    ]);
    pushToast(notifBox, el, +d.d || 4500, 4);
  });

  /* ============================ ITEM BOX ============================ */
  var itemBox = h("div", { id: "itembox", class: "item-stack" });
  U.layer("toastlayer").appendChild(itemBox);
  E.on("itembox", function (d) {
    var el = h("div", { class: "ibox" + (d.neg ? " neg" : "") }, [
      h("div", { class: "ib-ic" }, h("span", { class: "emo", text: d.ic || U.itemIcon(d.n, d.m) })),
      h("div", { class: "ib-body" }, [h("b", { html: U.fmt(d.a || "") }), h("span", { html: U.fmt(d.n || "") })])
    ]);
    pushToast(itemBox, el, +d.d || 3500, 5);
  });

  /* ============================ PROGRESS ============================ */
  var prog = h("div", { id: "progress", class: "progress glass" }, [
    h("div", { class: "pr-top" }, [h("span", { class: "pr-label" }), h("b", { class: "pr-pct" })]),
    h("div", { class: "bar" }, h("i"))
  ]);
  U.layer("toastlayer").appendChild(prog);
  E.on("progress", function (d) {
    if (!d.show) { prog.classList.remove("on"); return; }
    if (typeof d.label === "string") prog.querySelector(".pr-label").innerHTML = U.fmt(d.label);
    if (d.pct != null) {
      var p = Math.max(0, Math.min(100, +d.pct));
      prog.querySelector(".bar i").style.width = p + "%";
      prog.querySelector(".pr-pct").textContent = Math.round(p) + "%";
    }
    prog.classList.add("on");
  });

  /* ============================ BANNER ============================ */
  // id: warning | global | storm | insurance | footer | segel | gym | robbery | ...
  var banners = {};
  E.on("banner", function (d) {
    var id = d.id || "b";
    var el = banners[id];
    if (!d.show) {
      if (el) { el.classList.remove("on"); clearTimeout(el._t); }
      return;
    }
    if (!el) {
      el = banners[id] = h("div", { class: "banner" });
      U.layer("bannerlayer").appendChild(el);
    }
    el.className = "banner b-" + (d.c || "info") + " pos-" + (d.pos || "top") + (d.sm ? " sm" : "");
    el.innerHTML = (d.icon ? '<span class="bn-ic">' + U.icon(d.icon) + "</span>" : "") +
      '<div class="bn-body">' + (d.t ? '<div class="bn-t">' + U.fmt(d.t) + "</div>" : "") +
      (d.m ? '<div class="bn-m">' + U.fmt(d.m) + "</div>" : "") + (d.f ? '<div class="bn-f">' + U.fmt(d.f) + "</div>" : "") + "</div>";
    requestAnimationFrame(function () { el.classList.add("on"); });
    clearTimeout(el._t);
    if (+d.d > 0) el._t = setTimeout(function () { el.classList.remove("on"); }, +d.d);
  });

  /* ============================ OVERLAY LAYAR ============================ */
  // {id, show, c: warna css} mis. stres ungu, thermal drone, efek tembakan
  var overlays = {};
  E.on("overlay", function (d) {
    var id = d.id || "o";
    var el = overlays[id];
    if (!el) { el = overlays[id] = h("div", { class: "overlay ov-" + id }); U.layer("overlaylayer").appendChild(el); }
    if (d.c) el.style.background = d.c;
    el.classList.toggle("on", !!d.show);
    if (d.show && +d.d > 0) { clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove("on"); }, +d.d); }
  });

  /* ============================ TOMBOL INTERAKSI ============================ */
  var act = h("div", { id: "interact", class: "interact", "data-touch": "" }, [
    h("button", { class: "ia-btn", type: "button" }, [h("span", { class: "ia-key", text: "F" }), h("span", { class: "ia-label" })])
  ]);
  U.layer("toastlayer").appendChild(act);
  act.querySelector("button").addEventListener("click", function () { E.send("interact", "press", -1); });
  E.on("interact", function (d) {
    if (!d.show) { act.classList.remove("on"); E.touch(); return; }
    act.querySelector(".ia-label").textContent = d.label || "Interaksi";
    act.querySelector(".ia-key").textContent = d.key || "F";
    act.classList.add("on");
    E.touch();
  });

  /* ============================ SPECTATE ============================ */
  var specEl = h("div", { id: "spectate", class: "spectate glass" });
  U.layer("hudlayer").appendChild(specEl);
  E.on("spectate", function (d) {
    specEl.classList.toggle("on", !!d.show);
    if (!d.show) return;
    specEl.innerHTML = '<div class="sp-name">' + U.icon("cam") + U.esc(d.name || "") + " <small>(" + (+d.id || 0) + ")</small></div>" +
      '<div class="b-kv">' + [["Cash", U.money(d.cash)], ["HP / Armor", (+d.hp || 0) + " / " + (+d.ar || 0)],
        ["Int / VW", (+d.int || 0) + " / " + (+d.vw || 0)], ["Lapar / Haus", (+d.hg || 0) + "% / " + (+d.th || 0) + "%"],
        ["FPS / Ping", (+d.fps || 0) + " / " + (+d.ping || 0) + "ms"]].map(function (r) {
          return '<div class="kv-row"><span class="kv-k">' + r[0] + '</span><span class="kv-v">' + r[1] + "</span></div>";
        }).join("") + "</div>";
  });

  /* ============================ HUD LAYOUT ENGINE ============================
     Layout is client-side and per-player/device. Coordinates are normalized
     percentages, so the same arrangement survives resolution changes. */
  (function () {
    var KEY = "eagle_hud_layout_v2_";
    var targets = {
      status:    { sel: "#hud",         label: "Status / HP",     fallback: [39, 83] },
      info:      { sel: "#hud-info",    label: "Info pemain",    fallback: [76, 10] },
      speedo:    { sel: "#speedo",      label: "Speedometer",    fallback: [72, 75] },
      location:  { sel: "#hud-loc",     label: "Lokasi / Kompas",fallback: [40, 2] },
      fps:       { sel: "#hud-fps",     label: "FPS / Ping",     fallback: [2, 1] },
      watermark: { sel: "#hud-wm",      label: "Watermark",      fallback: [83, 1] },
      spectate:  { sel: "#spectate",    label: "Spectate",       fallback: [40, 78] },
      radio:     { sel: ".radio",       label: "Radio",          fallback: [2, 84] },
      quickbar:  { sel: "#eagle-quickbar", label: "Quickbar 6 slot", fallback: [38, 84] }
    };
    var order = Object.keys(targets);

    function playerKey() {
      var id = window.__EAGLE_PLAYER_ID;
      return KEY + (id == null ? "local" : String(id));
    }
    function clamp(v) { return Math.max(0, Math.min(94, +v || 0)); }
    function validLayout(x) {
      if (!x || typeof x !== "object") return {};
      var out = {};
      order.forEach(function (k) {
        if (x[k] && isFinite(+x[k].x) && isFinite(+x[k].y))
          out[k] = { x: clamp(x[k].x), y: clamp(x[k].y) };
      });
      return out;
    }
    function fallbackLayout() {
      var out = {};
      order.forEach(function (k) {
        var t = targets[k], el = document.querySelector(t.sel), r = el && el.getBoundingClientRect();
        if (r && r.width > 0 && r.height > 0 && window.innerWidth > 0 && window.innerHeight > 0) {
          out[k] = { x: clamp((r.left / window.innerWidth) * 100), y: clamp((r.top / window.innerHeight) * 100) };
        } else {
          out[k] = { x: t.fallback[0], y: t.fallback[1] };
        }
      });
      return out;
    }
    function load() {
      try {
        var raw = localStorage.getItem(playerKey());
        if (raw) return validLayout(JSON.parse(raw));
      } catch (_) {}
      return {};
    }
    function save(layout) {
      var clean = validLayout(layout);
      try { localStorage.setItem(playerKey(), JSON.stringify(clean)); } catch (_) {}
      apply(clean);
      return clean;
    }
    function find(k) {
      var el = document.querySelector(targets[k].sel);
      return el || null;
    }
    function apply(layout) {
      layout = validLayout(layout || {});
      order.forEach(function (k) {
        var el = find(k);
        if (!el || !layout[k]) return;
        el.classList.add("eagle-hud-layout-custom");
        el.style.setProperty("left", layout[k].x + "%", "important");
        el.style.setProperty("top", layout[k].y + "%", "important");
        el.style.setProperty("right", "auto", "important");
        el.style.setProperty("bottom", "auto", "important");
        el.style.setProperty("margin-left", "0", "important");
        el.style.setProperty("margin-right", "0", "important");
        el.style.setProperty("transform", "none", "important");
      });
      return layout;
    }
    function applySaved() {
      var layout = load();
      if (!Object.keys(layout).length) return;
      apply(layout);
    }
    function current() {
      var saved = load();
      var base = fallbackLayout();
      order.forEach(function (k) { if (saved[k]) base[k] = saved[k]; });
      return base;
    }
    function reset() {
      try { localStorage.removeItem(playerKey()); } catch (_) {}
      order.forEach(function (k) {
        var el = find(k);
        if (!el) return;
        el.classList.remove("eagle-hud-layout-custom");
        ["left","top","right","bottom","margin-left","margin-right","transform"].forEach(function (p) { el.style.removeProperty(p); });
      });
      return fallbackLayout();
    }
    function setPlayerId(id) {
      if (id != null && isFinite(+id)) window.__EAGLE_PLAYER_ID = +id;
      applySaved();
    }
    window.EAGLEHudLayout = {
      targets: targets, order: order, playerKey: playerKey,
      load: load, save: save, current: current, fallback: fallbackLayout,
      apply: apply, applySaved: applySaved, reset: reset, setPlayerId: setPlayerId
    };
    /* HUD elements are intentionally tagged for external editor discovery. */
    order.forEach(function (k) {
      var el = find(k);
      if (el) el.setAttribute("data-hud-key", k);
    });
    setTimeout(applySaved, 0);
  })();
})();
