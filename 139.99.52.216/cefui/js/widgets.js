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
  // Radial dinamis: main -> kendaraan / emote -> aksi spesifik.
  var RAD_MAIN = [
    { a: "inv", t: "Tas", i: "bag" },
    { a: "phone", t: "Ponsel", i: "phone" },
    { a: "docs", t: "Berkas", i: "id" },
    { a: "emote", t: "Emote", i: "smile" },
    { a: "action", t: "Aksi", i: "hand" },
    { a: "veh", t: "Kendaraan", i: "car" },
    { a: "fashion", t: "Pakaian", i: "shirt" }
  ];
  var radial = h("div", { id: "radial", class: "radial" });
  var rbox = h("div", { class: "rad-box" });
  var rring = h("div", { class: "rad-ring" });
  radial.appendChild(rbox);
  rbox.appendChild(rring);
  var rmid = h("button", { type: "button", class: "rad-mid", "data-touch": "" }, [
    h("span", { class: "rh-i", html: U.icon("x") }),
    h("b", { class: "rm-t", text: "EAGLE" }),
    h("small", { class: "rm-s", text: "ROLEPLAY" })
  ]);
  rbox.appendChild(rmid);

  function clearRadialItems() {
    Array.prototype.slice.call(rbox.querySelectorAll(".rad-item")).forEach(function (el) { el.remove(); });
  }
  function renderRadialItems(items) {
    clearRadialItems();
    items = items && items.length ? items : RAD_MAIN;
    items.forEach(function (r, idx) {
      var ang = -90 + idx * (360 / items.length);
      var b = h("button", { type: "button", class: "rad-item", "data-touch": "",
        style: "--a:" + ang + "deg;--d:" + (idx * 30) + "ms" }, [
        h("span", { class: "rh-i", html: U.icon(r.i || "info") }),
        h("span", { class: "rh-t", text: r.t || "Aksi" })
      ]);
      b.addEventListener("click", function () { E.send("radial", r.a, -1); });
      rbox.appendChild(b);
    });
  }

  function centerHandler(back) {
    rmid.onclick = function () { E.send("radial", back ? "back" : "close", -1); };
  }

  renderRadialItems(RAD_MAIN);
  centerHandler(false);
  U.layer("screenlayer").appendChild(radial);
  E.on("radial", function (d) {
    radial.classList.toggle("on", !!d.show);
    if (d.show) {
      var items = (d.items || []).map(function (x) {
        return { a: x.a || x.action || "close", t: x.t || x.title || "Aksi", i: x.i || x.icon || "info" };
      });
      renderRadialItems(items);
      centerHandler(!!d.back || d.mode === "vehicle" || d.mode === "emote");
      rmid.querySelector(".rm-t").textContent = U.plain(d.t || (d.mode === "vehicle" ? "KENDARAAN" : d.mode === "emote" ? "EMOTE" : "EAGLE"));
      rmid.querySelector(".rm-s").textContent = U.plain(d.s || (d.back ? "Pilih aksi" : "ROLEPLAY"));
    }
    E.touch();
  });
})();
