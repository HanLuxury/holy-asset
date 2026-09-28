/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : widgets.js
   Widget kecil pengganti textdraw:
     radio  : walkie-talkie (ATRP_RadioTD)  -> EAGLE.send("radio", power|close|freq)
     death  : layar pingsan (Hope_Injured)  -> EAGLE.send("death", signal|respawn)
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;

  /* ============================ RADIO ============================ */
  var radio = h("div", { id: "radio", class: "radio", "data-touch": "" });
  radio.innerHTML =
    '<div class="rd-top"><span>JAVALKIE</span><span class="rd-led"></span></div>' +
    '<div class="rd-screen"><small>FREQ</small><b class="rd-freq">0</b></div>' +
    '<div class="rd-btns">' +
    '<button type="button" class="pw" data-a="power">' + U.icon("power") + '<span>POWER</span></button>' +
    '<button type="button" class="cl" data-a="close">' + U.icon("x") + '<span>TUTUP</span></button>' +
    '<button type="button" class="fq" data-a="freq">' + U.icon("radio") + '<span>SET FQ</span></button>' +
    "</div>";
  U.layer("screenlayer").appendChild(radio);
  radio.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { E.send("radio", b.getAttribute("data-a"), -1); });
  });
  E.on("radio", function (d) {
    radio.classList.toggle("on", !!d.show);
    if (d.show) {
      radio.querySelector(".rd-freq").textContent = String(d.freq != null ? d.freq : 0);
      radio.classList.toggle("pw", !!+d.on);
      radio.classList.toggle("mic", !!+d.mic);
    }
    E.touch();
  });

  /* ============================ LAYAR PINGSAN ============================ */
  var death = h("div", { id: "death", class: "death" });
  death.innerHTML =
    '<svg class="dt-ecg" viewBox="0 0 320 60" preserveAspectRatio="none"><path d="M0 34 H90 L100 34 L108 18 L116 50 L126 6 L136 56 L146 30 L154 34 H200 L208 26 L216 38 L222 34 H320"/></svg>' +
    '<div class="dt-box glass" data-touch="">' +
    '<div class="dt-t">Kamu Tidak Sadarkan Diri</div>' +
    '<div class="dt-s">Kirim sinyal ke paramedis yang sedang bertugas, atau tunggu waktu habis lalu <b>respawn</b> ke rumah sakit.</div>' +
    '<div class="dt-timer"><span class="dt-m">00</span><i>:</i><span class="dt-sc">00</span></div>' +
    '<div class="dt-ems">' + U.icon("medic") + '<span class="dt-emsn">0</span>&nbsp;EMS bertugas</div>' +
    '<div class="dt-btns"></div>' +
    "</div>";
  U.layer("overlaylayer").appendChild(death);
  var btnBox = death.querySelector(".dt-btns");
  var bSignal = U.button({ t: "Sinyal EMS [Y]", c: "p", icon: "bell" }, function () { E.send("death", "signal", -1); });
  var bResp = U.button({ t: "Respawn [ALT]", c: "d", icon: "refresh" }, function () { E.send("death", "respawn", -1); });
  btnBox.appendChild(bSignal); btnBox.appendChild(bResp);
  E.on("death", function (d) {
    death.classList.toggle("on", !!+d.show);
    if (+d.show) {
      death.querySelector(".dt-m").textContent = U.pad(+d.m || 0);
      death.querySelector(".dt-sc").textContent = U.pad(+d.s || 0);
      death.querySelector(".dt-emsn").textContent = String(+d.ems || 0);
      bResp.classList.toggle("wait", !+d.rs);
    }
    E.touch();
  });

  /* ============================ RADIAL MENU ============================ */
  // Radial ala FiveM/QBCore: 5 sektor utama, divider putih tebal,
  // sektor aktif merah, icon + label putih, tombol X transparan di tengah.
  // Semua action tetap dikirim melalui router yang sama.
  var RAD_MAIN = [
    { a: "citizen",    t: "Citizen",  i: "user" },
    { a: "general",    t: "General",  i: "list" },
    { a: "veh",        t: "Vehicle",  i: "car" },
    { a: "work",       t: "Work",     i: "briefcase" },
    { a: "emergency",  t: "10-999",   i: "badge" }
  ];

  var radial = h("div", { id: "radial", class: "radial", "data-touch": "" });
  var rbox = h("div", { class: "rad-box" });
  var rsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  rsvg.setAttribute("class", "rad-svg");
  rsvg.setAttribute("viewBox", "0 0 600 600");
  rsvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  rsvg.setAttribute("aria-hidden", "true");
  var rlabels = h("div", { class: "rad-labels" });
  var rshadow = h("div", { class: "rad-shadow", "aria-hidden": "true" });
  var rmid = h("button", { type: "button", class: "rad-mid", "data-touch": "", "aria-label": "Tutup radial" }, [
    h("span", { class: "rad-mid-i", html: U.icon("x") })
  ]);

  rbox.appendChild(rshadow);
  rbox.appendChild(rsvg);
  rbox.appendChild(rlabels);
  rbox.appendChild(rmid);
  radial.appendChild(rbox);
  U.layer("screenlayer").appendChild(radial);

  function deg(v) { return v * Math.PI / 180; }
  function pt(cx, cy, radius, angle) {
    return { x: cx + Math.cos(deg(angle)) * radius, y: cy + Math.sin(deg(angle)) * radius };
  }
  function sectorPath(a0, a1, innerR, outerR) {
    var c = 300;
    var p0 = pt(c, c, outerR, a0), p1 = pt(c, c, outerR, a1);
    var q1 = pt(c, c, innerR, a1), q0 = pt(c, c, innerR, a0);
    return "M" + q0.x.toFixed(2) + " " + q0.y.toFixed(2) +
      "L" + p0.x.toFixed(2) + " " + p0.y.toFixed(2) +
      "A" + outerR + " " + outerR + " 0 0 1 " + p1.x.toFixed(2) + " " + p1.y.toFixed(2) +
      "L" + q1.x.toFixed(2) + " " + q1.y.toFixed(2) +
      "A" + innerR + " " + innerR + " 0 0 0 " + q0.x.toFixed(2) + " " + q0.y.toFixed(2) + "Z";
  }
  function setRadialActive(index) {
    var paths = rsvg.querySelectorAll(".rad-sector");
    var labels = rlabels.querySelectorAll(".rad-label");
    for (var i = 0; i < paths.length; i++) paths[i].classList.toggle("is-active", i === index);
    for (var j = 0; j < labels.length; j++) labels[j].classList.toggle("is-active", j === index);
  }
  function radialAction(action) {
    E.send("radial", action, -1);
  }
  function clearRadial() {
    while (rsvg.firstChild) rsvg.removeChild(rsvg.firstChild);
    rlabels.innerHTML = "";
  }
  function renderRadialItems(items, mode) {
    clearRadial();
    items = items && items.length ? items : RAD_MAIN;

    var count = items.length;
    var span = 360 / count;
    var gap = count === 5 ? 2.0 : Math.min(2.4, Math.max(0.9, span * 0.04));
    var innerR = 92;
    var outerR = 262;
    var labelR = count === 5 ? 192 : 184;
    var defaultIndex = mode === "main" && count === 5 ? 4 : 0;

    items.forEach(function (r, idx) {
      // Sama persis orientasi referensi: Citizen kanan-atas,
      // General kanan, Vehicle bawah, Work kiri-bawah, 10-999 kiri-atas.
      var a0 = -90 + idx * span + gap;
      var a1 = -90 + (idx + 1) * span - gap;
      var mid = (a0 + a1) / 2;

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "rad-sector" + (idx === defaultIndex ? " is-active" : ""));
      path.setAttribute("d", sectorPath(a0, a1, innerR, outerR));
      path.setAttribute("data-index", String(idx));
      path.setAttribute("aria-label", r.t || "Aksi");
      path.addEventListener("mouseenter", function () { setRadialActive(idx); });
      path.addEventListener("mousemove", function () { setRadialActive(idx); });
      path.addEventListener("touchstart", function () { setRadialActive(idx); }, { passive: true });
      path.addEventListener("click", function () { setRadialActive(idx); radialAction(r.a); });
      rsvg.appendChild(path);

      var x = 50 + Math.cos(deg(mid)) * (labelR / 300 * 100);
      var y = 50 + Math.sin(deg(mid)) * (labelR / 300 * 100);
      var b = h("button", {
        type: "button",
        class: "rad-label" + (idx === defaultIndex ? " is-active" : ""),
        "data-touch": "",
        "aria-label": r.t || "Aksi",
        style: "left:" + x.toFixed(2) + "%;top:" + y.toFixed(2) + "%"
      }, [
        h("span", { class: "rad-label-i", html: U.icon(r.i || "info") }),
        h("span", { class: "rad-label-t", text: r.t || "Aksi" })
      ]);
      b.addEventListener("mouseenter", function () { setRadialActive(idx); });
      b.addEventListener("touchstart", function () { setRadialActive(idx); }, { passive: true });
      b.addEventListener("click", function (ev) { ev.stopPropagation(); setRadialActive(idx); radialAction(r.a); });
      rlabels.appendChild(b);
    });
  }

  function centerHandler(back) {
    rmid.onclick = function () { radialAction(back ? "back" : "close"); };
    rmid.querySelector(".rad-mid-i").innerHTML = U.icon(back ? "back" : "x");
    rmid.setAttribute("aria-label", back ? "Kembali" : "Tutup radial");
  }

  renderRadialItems(RAD_MAIN, "main");
  centerHandler(false);

  E.on("radial", function (d) {
    radial.classList.toggle("on", !!d.show);
    radial.setAttribute("data-mode", String(d.mode || "main"));
    if (d.show) {
      var mode = String(d.mode || "main");
      var items = (d.items || []).map(function (x) {
        return { a: x.a || x.action || "close", t: x.t || x.title || "Aksi", i: x.i || x.icon || "info" };
      });
      renderRadialItems(items.length ? items : RAD_MAIN, mode);
      centerHandler(!!d.back || mode !== "main");
    }
    E.touch();
  });

})();
