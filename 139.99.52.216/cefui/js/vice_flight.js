/* =====================================================================
   EAGLE ROLEPLAY - Vice City flight transition v54
   Dedicated full-screen transition for Los Santos <-> Vice City.
   One event owns the whole visual state so dialog/progress/banner layers
   cannot race each other during a city transfer.
   ===================================================================== */
(function () {
  "use strict";

  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;

  var layer = U.layer("flightlayer");
  var root = document.createElement("div");
  root.id = "vice-flight";
  root.className = "vflight";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML =
    '<div class="vflight-bg">' +
      '<div class="vflight-grid"></div>' +
      '<div class="vflight-glow vflight-glow-a"></div>' +
      '<div class="vflight-glow vflight-glow-b"></div>' +
    '</div>' +
    '<section class="vflight-card">' +
      '<header class="vflight-head">' +
        '<div class="vflight-brand"><span class="vflight-wing"></span><div><small>RP EAGLE AIR</small><b>CITY TRANSFER</b></div></div>' +
        '<span class="vflight-state">BOARDING</span>' +
      '</header>' +
      '<div class="vflight-route">' +
        '<div class="vflight-stop vflight-from"><strong>LS</strong><span>Los Santos</span></div>' +
        '<div class="vflight-track"><i></i><span class="vflight-plane"></span></div>' +
        '<div class="vflight-stop vflight-to"><strong>VC</strong><span>Vice City</span></div>' +
      '</div>' +
      '<div class="vflight-copy">' +
        '<b class="vflight-title">Preparing aircraft</b>' +
        '<span class="vflight-message">Please wait while your destination is prepared.</span>' +
      '</div>' +
      '<div class="vflight-progress"><i></i></div>' +
      '<footer><span class="vflight-pct">0%</span><span class="vflight-foot">Do not close the game during transfer</span></footer>' +
    '</section>';
  // Prevent raw HTML text from appearing in the top-left before CSS loads.
  root.hidden = true;
  layer.appendChild(root);

  // Some launchers/hosts upload index.html and JS but omit css/vice_flight.css;
  // WebView then renders raw labels (exactly the flight overlay screenshot).
  // Ship an independent emergency stylesheet with the module, and use it only
  // when the external one is unavailable or from an incompatible build.
  function ensureFlightStyle() {
    var card = root.querySelector(".vflight-card");
    var gotStyle = (/^(absolute|fixed)$/.test(window.getComputedStyle(root).position)) &&
      window.getComputedStyle(card).position === "relative";
    if (gotStyle) return false;
    if (!document.getElementById("eagle-vflight-rescue")) {
      var el = document.createElement("style");
      el.id = "eagle-vflight-rescue";
      el.textContent = FLIGHT_FALLBACK_CSS;
      document.head.appendChild(el);
    }
    return true;
  }
  var FLIGHT_FALLBACK_CSS = "/* =====================================================================\n   EAGLE ROLEPLAY - FiveM-style LS <-> Vice City flight transition v54\n   ===================================================================== */\n#flightlayer { z-index: 100; }\n\n.vflight {\n  --vf-ac: #3dbff3;\n  --vf-ac2: #5c72ff;\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  overflow: hidden;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  background: #04070d;\n  color: #f5f8fc;\n  font-family: \"Poppins\", \"Inter\", \"Roboto\", sans-serif;\n  transition: opacity .25s ease, visibility .25s ease;\n}\n.vflight.on { opacity: 1; visibility: visible; pointer-events: auto; }\n.vflight-bg { position: absolute; inset: 0; overflow: hidden; }\n.vflight-bg::before {\n  content: \"\";\n  position: absolute;\n  inset: -20%;\n  background:\n    radial-gradient(circle at 18% 25%, rgba(61,191,243,.12), transparent 31%),\n    radial-gradient(circle at 82% 72%, rgba(92,114,255,.13), transparent 34%),\n    linear-gradient(125deg, #050913 0%, #080d18 47%, #03060b 100%);\n  animation: vf-breathe 4.8s ease-in-out infinite alternate;\n}\n.vflight-grid {\n  position: absolute;\n  inset: 0;\n  opacity: .13;\n  background-image: linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);\n  background-size: 3.2rem 3.2rem;\n  transform: perspective(26rem) rotateX(62deg) scale(1.55) translateY(22%);\n  transform-origin: center bottom;\n}\n.vflight-glow { position: absolute; width: 18rem; height: 18rem; border-radius: 50%; filter: blur(5rem); opacity: .13; }\n.vflight-glow-a { left: 3%; top: 4%; background: var(--vf-ac); }\n.vflight-glow-b { right: 2%; bottom: -8%; background: var(--vf-ac2); }\n\n.vflight-card {\n  position: relative;\n  z-index: 2;\n  width: min(42rem, 72vw);\n  padding: 1.15rem 1.25rem 1rem;\n  border: 1px solid rgba(255,255,255,.085);\n  border-radius: .72rem;\n  background: linear-gradient(165deg, rgba(14,23,39,.94), rgba(7,10,16,.96));\n  box-shadow: 0 1.8rem 6rem rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.035);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  transform: translateY(.8rem) scale(.99);\n  transition: transform .3s cubic-bezier(.2,.8,.2,1);\n}\n.vflight.on .vflight-card { transform: translateY(0) scale(1); }\n.vflight-card::before {\n  content: \"\";\n  position: absolute;\n  left: 1.25rem;\n  right: 1.25rem;\n  top: 0;\n  height: 2px;\n  background: linear-gradient(90deg, transparent, var(--vf-ac), var(--vf-ac2), transparent);\n  box-shadow: 0 0 1rem rgba(61,191,243,.3);\n}\n.vflight-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-bottom: .85rem; border-bottom: 1px solid rgba(255,255,255,.055); }\n.vflight-brand { display: flex; align-items: center; gap: .68rem; }\n.vflight-brand small { display: block; margin-bottom: .05rem; color: var(--vf-ac); font-size: .56rem; font-weight: 800; letter-spacing: .16em; }\n.vflight-brand b { display: block; color: rgba(255,255,255,.76); font-size: .7rem; letter-spacing: .08em; }\n.vflight-wing { width: 2.1rem; height: 2.1rem; border: 1px solid rgba(61,191,243,.26); border-radius: .5rem; background: linear-gradient(145deg, rgba(61,191,243,.2), rgba(92,114,255,.11)); box-shadow: inset 0 0 1rem rgba(61,191,243,.07); }\n.vflight-wing::before { content: \"\u2708\"; display: grid; place-items: center; width: 100%; height: 100%; color: var(--vf-ac); font-size: 1rem; transform: rotate(-10deg); }\n.vflight-state { padding: .32rem .48rem; border: 1px solid rgba(61,191,243,.18); border-radius: .38rem; color: var(--vf-ac); background: rgba(61,191,243,.06); font-size: .54rem; font-weight: 800; letter-spacing: .12em; }\n\n.vflight-route { display: grid; grid-template-columns: minmax(7rem,1fr) minmax(10rem,1.45fr) minmax(7rem,1fr); align-items: center; gap: 1rem; padding: 1.35rem .2rem 1.05rem; }\n.vflight-stop { min-width: 0; }\n.vflight-stop strong { display: block; color: #fff; font-size: 2.25rem; line-height: 1; font-weight: 750; letter-spacing: -.04em; }\n.vflight-stop span { display: block; margin-top: .32rem; overflow: hidden; color: rgba(255,255,255,.44); font-size: .66rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }\n.vflight-to { text-align: right; }\n.vflight-track { position: relative; height: 1.2rem; }\n.vflight-track::before, .vflight-track::after { content: \"\"; position: absolute; top: 50%; width: .34rem; height: .34rem; border: 2px solid rgba(255,255,255,.34); border-radius: 50%; transform: translateY(-50%); }\n.vflight-track::before { left: 0; } .vflight-track::after { right: 0; }\n.vflight-track i { position: absolute; left: .7rem; right: .7rem; top: 50%; height: 1px; background: repeating-linear-gradient(90deg, rgba(255,255,255,.23) 0 .75rem, transparent .75rem 1.15rem); }\n.vflight-plane { position: absolute; top: 50%; left: 8%; width: 1.7rem; height: 1.7rem; border-radius: 50%; background: #0a111c; border: 1px solid rgba(61,191,243,.24); box-shadow: 0 0 1rem rgba(61,191,243,.14); transform: translate(-50%,-50%); transition: left .8s cubic-bezier(.2,.8,.2,1); }\n.vflight-plane::before { content: \"\u2708\"; display: grid; place-items: center; width: 100%; height: 100%; color: var(--vf-ac); font-size: .75rem; transform: rotate(8deg); }\n\n.vflight-copy { display: flex; flex-direction: column; gap: .24rem; padding: .1rem 0 .78rem; }\n.vflight-title { color: rgba(255,255,255,.9); font-size: .82rem; font-weight: 700; }\n.vflight-message { color: rgba(255,255,255,.4); font-size: .65rem; font-weight: 500; }\n.vflight-progress { position: relative; height: .38rem; overflow: hidden; border-radius: 2rem; background: rgba(255,255,255,.07); }\n.vflight-progress i { display: block; width: 0; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--vf-ac2), var(--vf-ac)); box-shadow: 0 0 .9rem rgba(61,191,243,.35); transition: width .75s cubic-bezier(.2,.8,.2,1); }\n.vflight-card footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-top: .48rem; }\n.vflight-pct { color: var(--vf-ac); font-size: .61rem; font-weight: 800; letter-spacing: .05em; }\n.vflight-foot { color: rgba(255,255,255,.22); font-size: .55rem; font-weight: 500; }\n\n.vflight.stage-transit .vflight-plane { animation: vf-plane 1.7s ease-in-out infinite alternate; }\n.vflight.stage-streaming { --vf-ac:#67e8a9; --vf-ac2:#28a77a; }\n.vflight.stage-spawn { --vf-ac:#67e8a9; --vf-ac2:#43bff0; }\n\n@keyframes vf-breathe { from { transform: scale(1) rotate(0deg); } to { transform: scale(1.035) rotate(.5deg); } }\n@keyframes vf-plane { from { margin-top:-.08rem; } to { margin-top:.12rem; } }\n\n@media (orientation: portrait), (max-width: 720px) {\n  .vflight-card { width: min(34rem, 91vw); padding: 1rem; }\n  .vflight-route { grid-template-columns: minmax(4.7rem,1fr) minmax(7rem,1.2fr) minmax(4.7rem,1fr); gap: .55rem; }\n  .vflight-stop strong { font-size: 1.75rem; }\n  .vflight-stop span { font-size: .58rem; }\n  .vflight-foot { display: none; }\n}\n\n/* Flight layout rescue (v77): very short displays / landscape safe bounds. */\n#vice-flight[hidden] {display:none!important}\n.vflight {position:fixed;inset:0;z-index:9999;min-width:0;min-height:0}\n.vflight-card {box-sizing:border-box;max-width:calc(100vw - 28px);max-height:calc(100vh - 24px);overflow-y:auto;overscroll-behavior:contain}\n.vflight-stop {min-width:0}\n.vflight-title,.vflight-message {overflow-wrap:anywhere}\n@media(max-height:340px) {\n .vflight-card{padding:.55rem 1rem;max-height:calc(100vh - 12px)}\n .vflight-route{padding:.65rem .2rem .45rem}\n .vflight-head{padding-bottom:.42rem}\n .vflight-copy{padding-bottom:.35rem}\n}\n";
  var fallbackUsed = ensureFlightStyle();

  var els = {
    state: root.querySelector(".vflight-state"),
    fromCode: root.querySelector(".vflight-from strong"),
    fromName: root.querySelector(".vflight-from span"),
    toCode: root.querySelector(".vflight-to strong"),
    toName: root.querySelector(".vflight-to span"),
    title: root.querySelector(".vflight-title"),
    message: root.querySelector(".vflight-message"),
    bar: root.querySelector(".vflight-progress i"),
    pct: root.querySelector(".vflight-pct"),
    plane: root.querySelector(".vflight-plane")
  };

  var token = 0;
  var retiredToken = 0;
  var visibilityEpoch = 0;
  var requested = false;

  function str(v, fallback) {
    v = String(v == null ? "" : v).trim();
    return v || fallback || "";
  }

  function clamp(v) {
    v = +v || 0;
    return Math.max(0, Math.min(100, v));
  }

  function setProgress(v) {
    var pct = clamp(v);
    els.bar.style.width = pct + "%";
    els.pct.textContent = Math.round(pct) + "%";
    els.plane.style.left = Math.max(3, Math.min(97, pct)) + "%";
  }

  function hide(q) {
    // Ignore a delayed hide belonging to an older transfer session.
    if (q && token && q < token) return;
    retiredToken = Math.max(retiredToken, q || token);
    requested = false;
    visibilityEpoch++;
    root.classList.remove("on");
    root.hidden = true;
    root.removeAttribute("data-touch");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("vice-flight-open");
    root.classList.remove("stage-boarding", "stage-transit", "stage-streaming", "stage-spawn");
    if (E.touchNow) E.touchNow(); else E.touch();
  }

  function show(d) {
    var q = +d.q || 0;
    // Small hides can beat fragmented shows. A completed token cannot reopen;
    // a fresh auth session below explicitly resets this sequence history.
    if (q && (q <= retiredToken || token && q < token)) return;
    if (q) token = q;
    requested = true;
    var epoch = ++visibilityEpoch;
    // The hidden attribute keeps this entire module invisible before first
    // transfer, even if every external CSS request fails.
    root.hidden = false;
    if (ensureFlightStyle()) fallbackUsed = true;

    var stage = str(d.stage, "transit").toLowerCase();
    var wasOn = root.classList.contains("on");
    root.className = "vflight stage-" + stage + (wasOn ? " on" : "");
    root.setAttribute("data-touch", "");
    root.setAttribute("aria-hidden", "false");

    els.state.textContent = str(d.badge, stage === "spawn" ? "LOADING CITY" : stage.toUpperCase());
    els.fromCode.textContent = str(d.fc, "LS");
    els.fromName.textContent = str(d.from, "Los Santos");
    els.toCode.textContent = str(d.tc, "VC");
    els.toName.textContent = str(d.to, "Vice City");
    els.title.textContent = str(d.title, "City transfer in progress");
    els.message.textContent = str(d.msg, "Please wait while your destination is prepared.");
    setProgress(d.pct);

    document.body.classList.add("vice-flight-open");
    if (wasOn) {
      E.touch();
    } else {
      requestAnimationFrame(function () {
        // A hide/new transfer can arrive before this frame. Never resurrect it.
        if (!requested || visibilityEpoch !== epoch || root.hidden) return;
        root.classList.add("on");
        E.touch();
      });
    }
  }

  function eventVisible(value) {
    if (value === true || value === 1) return true;
    if (typeof value === "string") return /^(1|true|yes|on)$/i.test(value.trim());
    return false;
  }
  E.on("vice_flight", function (d) {
    if (!d || !eventVisible(d.show)) return hide(+((d && d.q) || 0));
    show(d);
  });
  E.on("auth", function (d) {
    if (d && ["login", "register", "chars", "charinfo", "create", "spawn"].indexOf(d.v) >= 0) {
      hide(0); token = 0; retiredToken = 0;
    }
  });

  if (fallbackUsed) {
    // Keep a readable error trace in /cefcek / native logs without creating
    // large network packets or repeatedly spamming the server.
    setTimeout(function () {
      if (E.report) E.report("css", "vice_flight.css missing/invalid; inline rescue activated");
    }, 500);
  }

  if (E.done) E.done("vice_flight");
})();
