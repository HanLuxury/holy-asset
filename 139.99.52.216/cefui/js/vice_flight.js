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
        '<div class="vflight-brand"><span class="vflight-wing"></span><div><small>EAGLE AIR</small><b>CITY TRANSFER</b></div></div>' +
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
  layer.appendChild(root);

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
  var hideTimer = 0;

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
    clearTimeout(hideTimer);
    root.classList.remove("on");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("vice-flight-open");
    hideTimer = setTimeout(function () {
      if (!root.classList.contains("on")) root.classList.remove("stage-boarding", "stage-transit", "stage-streaming", "stage-spawn");
    }, 320);
    E.touch();
  }

  function show(d) {
    var q = +d.q || 0;
    // While visible, reject an older transfer session. When hidden, accept a
    // lower token as a fresh server/session reconnect (the WebView may survive it).
    if (q && token && q < token && root.classList.contains("on")) return;
    if (q) token = q;
    clearTimeout(hideTimer);

    var stage = str(d.stage, "transit").toLowerCase();
    var wasOn = root.classList.contains("on");
    root.className = "vflight stage-" + stage + (wasOn ? " on" : "");
    root.setAttribute("aria-hidden", "false");

    els.state.textContent = str(d.badge, stage === "spawn" ? "LOADING CITY" : stage.toUpperCase());
    els.fromCode.textContent = str(d.fc, "LS");
    els.fromName.textContent = str(d.from, "Los Santos");
    els.toCode.textContent = str(d.tc, "VC");
    els.toName.textContent = str(d.to, "Vice City");
    els.title.textContent = str(d.title, "City transfer in progress");
    els.message.textContent = str(d.msg, "Please wait while your destination is prepared.");
    setProgress(d.pct);

    document.body.classList.remove("cef-dialog-open");
    document.body.classList.add("vice-flight-open");
    if (wasOn) {
      E.touch();
    } else {
      requestAnimationFrame(function () {
        root.classList.add("on");
        E.touch();
      });
    }
  }

  E.on("vice_flight", function (d) {
    if (!d || !+d.show) return hide(+((d && d.q) || 0));
    show(d);
  });

  if (E.done) E.done("vice_flight");
})();
