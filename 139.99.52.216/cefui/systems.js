/* =====================================================================
   GAMEMODE EAGLE - CEF UI sistem (systems.js)
   Pengganti tampilan UI untuk: notifikasi (ShowTDN), notify+icon
   (ShowNotify), item box (ShowItemBox).
   FOKUS TAMPILAN: dirender di dalam panggung virtual 640x448 pada
   POSISI yang sama dengan UI aslinya (skala mengikuti layar).
   ===================================================================== */
(function () {
  "use strict";
  if (!window.EAGLE) return;

  var stage = document.getElementById("stage");

  function samp(t) {
    t = String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    t = t.replace(/\{([0-9A-Fa-f]{6})\}/g, function (_, h) {
      return '</span><span style="color:#' + h + '">';
    });
    t = t.replace(/~n~/g, "<br>").replace(/~[a-z]~/gi, "");
    return '<span>' + t + '</span>';
  }

  // container anak #stage pada koordinat 640x448 (px)
  function stack(id, cls, leftPx, topPx) {
    var e = document.getElementById(id);
    if (!e) {
      e = document.createElement("div");
      e.id = id; e.className = cls;
      e.style.left = leftPx + "px";
      e.style.top  = topPx + "px";
      stage.appendChild(e);
    }
    return e;
  }
  // TDN asli: sisi KIRI (x~15). Notify asli: KANAN-ATAS (x~500,y~107).
  // ItemBox asli: KIRI-BAWAH (x~12,y~199).
  var notifyWrap = stack("eagle-notify", "eagle-stack left", 13, 170);   // ShowTDN
  var iconWrap   = stack("eagle-notify2", "eagle-stack right", 498, 105); // ShowNotify
  var itemWrap   = stack("eagle-itembox", "eagle-stack left", 12, 196);   // ItemBox

  function pop(wrap, el, ttl, max) {
    wrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });
    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { if (el.parentNode) el.remove(); }, 300);
    }, ttl);
    while (wrap.children.length > max) wrap.removeChild(wrap.firstChild);
  }

  // ---------- NOTIFIKASI (ShowTDN) : 0 ERR,1 OK,2 WARN,3 INFO,4 SYNTAX ----------
  var NOTI = {
    0: { c: "err",  t: "ERROR",   i: "✖" },
    1: { c: "ok",   t: "SUKSES",  i: "✔" },
    2: { c: "warn", t: "WARNING", i: "⚠" },
    3: { c: "info", t: "INFO",    i: "ℹ" },
    4: { c: "syn",  t: "SYNTAX",  i: "❕" }
  };
  window.EAGLE.on("notify", function (d) {
    var m = NOTI[d.type | 0] || NOTI[3];
    var el = document.createElement("div");
    el.className = "en-item " + m.c;
    el.innerHTML =
      '<div class="en-ic">' + m.i + '</div>' +
      '<div class="en-body"><div class="en-title">' + m.t + '</div>' +
      '<div class="en-msg">' + samp(d.text) + '</div></div>';
    pop(notifyWrap, el, 5000, 3);
  });

  // ---------- NOTIFY + ICON (ShowNotify) ----------
  window.EAGLE.on("notify_icon", function (d) {
    var el = document.createElement("div");
    el.className = "en-item info icon" + (d.icon | 0);
    el.innerHTML =
      '<div class="en-ic">✦</div>' +
      '<div class="en-body"><div class="en-msg">' + samp(d.text) + '</div></div>';
    pop(iconWrap, el, 6500, 4);
  });

  // ---------- PROGRESS BAR (ShowProgressBar) ----------
  // Posisi asli UI: x175,y350 (bar), label y338. Dirender di panggung.
  var progWrap = stack("eagle-progress", "eagle-progress", 174, 338);
  progWrap.innerHTML =
    '<div class="epr-label"></div>' +
    '<div class="epr-track"><div class="epr-fill"></div></div>';
  progWrap.style.display = "none";
  var progLabel = progWrap.querySelector(".epr-label");
  var progFill  = progWrap.querySelector(".epr-fill");
  window.EAGLE.on("progress", function (d) {
    if (!d.show) { progWrap.style.display = "none"; return; }
    progWrap.style.display = "block";
    if (typeof d.label === "string") progLabel.textContent = d.label;
    if (typeof d.pct === "number") progFill.style.width = Math.max(0, Math.min(100, d.pct)) + "%";
  });

  // ---------- SPAWN MENU (SpawnMenu / ui_spawnnew) ----------
  var spawnWrap = document.getElementById("eagle-spawn");
  if (!spawnWrap) {
    spawnWrap = document.createElement("div");
    spawnWrap.id = "eagle-spawn"; spawnWrap.className = "eagle-spawn";
    spawnWrap.style.display = "none";
    stage.appendChild(spawnWrap);
  }
  window.EAGLE.on("spawn", function (d) {
    if (!d.show) {
      spawnWrap.classList.remove("open");                 // animasi tutup
      setTimeout(function () {
        if (!spawnWrap.classList.contains("open")) { spawnWrap.style.display = "none"; spawnWrap.innerHTML = ""; }
      }, 220);
      return;
    }
    var html = '<div class="esp-card">' +
      '<div class="esp-logo">HOPE<span>INDONESIA</span></div>' +
      '<div class="esp-title">Pilih Lokasi Spawn</div><div class="esp-list">';
    (d.buttons || []).forEach(function (b) {
      html += '<button class="esp-btn" data-id="' + (b.id|0) + '">' + samp(b.t) + '</button>';
    });
    html += '</div></div>';
    spawnWrap.innerHTML = html;
    spawnWrap.style.display = "flex";
    requestAnimationFrame(function () { spawnWrap.classList.add("open"); });  // animasi buka
    spawnWrap.querySelectorAll(".esp-btn").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-id");
        window.EAGLE.emit("ui_click", '{"s":"p","id":' + id + '}');
      });
    });
  });

  // ---------- TOMBOL INTERAKSI (pengganti tombol F) ----------
  // Muncul otomatis saat dekat dynamic; ditekan -> server simulasikan tombol F.
  var actWrap = document.getElementById("eagle-interact");
  if (!actWrap) {
    actWrap = document.createElement("div");
    actWrap.id = "eagle-interact";
    actWrap.className = "eagle-interact";
    actWrap.innerHTML = '<button class="eia-btn"><span class="eia-key">F</span>'
                      + '<span class="eia-label"></span></button>';
    stage.appendChild(actWrap);
  }
  var actLabel = actWrap.querySelector(".eia-label");
  actWrap.querySelector(".eia-btn").addEventListener("click", function () {
    window.EAGLE.emit("interact_press", "{}");
  });
  window.EAGLE.on("interact", function (d) {
    if (!d.show) { actWrap.classList.remove("open"); return; }
    actLabel.textContent = d.label || "Interaksi";
    actWrap.classList.add("open");
  });

  // ---------- ITEM BOX (ShowItemBox) ----------
  window.EAGLE.on("itembox", function (d) {
    var el = document.createElement("div");
    el.className = "eib-item";
    el.innerHTML =
      '<div class="eib-ic" data-model="' + (d.model | 0) + '">📦</div>' +
      '<div class="eib-body"><div class="eib-l1">' + samp(d.line1) + '</div>' +
      '<div class="eib-l2">' + samp(d.line2) + '</div></div>';
    pop(itemWrap, el, 7000, 4);
  });
})();
