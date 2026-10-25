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
    '<button type="button" class="rd-mic" data-a="mic">' + U.icon("mic") + '<span>MIC RADIO</span></button>' +
    '<button type="button" class="fq" data-a="freq">' + U.icon("radio") + '<span>SET FQ</span></button>' +
    "</div>";
  U.layer("screenlayer").appendChild(radio);
  radio.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { E.send("radio", b.getAttribute("data-a"), -1); });
  });
  E.on("radio", function (d) {
    radio.classList.toggle("on", !!+d.show);
    if (+d.show) {
      radio.querySelector(".rd-freq").textContent = String(d.freq != null ? d.freq : 0);
      radio.classList.toggle("pw", !!+d.on);
      radio.classList.toggle("mic", !!+d.mic);
      radio.querySelector('[data-a="mic"]').setAttribute("aria-pressed", String(!!+d.mic));
      radio.querySelector('[data-a="mic"]').setAttribute("aria-label", "Rute mikrofon radio " + (+d.mic ? "aktif" : "mati") + "; tahan MIC untuk bicara");
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

  /* ==================== RP EAGLE QB STYLE RADIAL v117 ====================
     UI adapted for RP EAGLE from qb-radialmenu's radial navigation design.
     The NUI/FiveM event bridge is NOT imported: RP EAGLE remains the only bridge.
     Never trust client actions; Pawn validates menu state and allowed actions.
  */
  var RADIAL_MENUS = {
    main: [
      { a:"citizen", t:"Warga", i:"user" },
      { a:"general", t:"Umum", i:"list" },
      { a:"veh", t:"Kendaraan", i:"car" },
      { a:"work", t:"Pekerjaan", i:"briefcase" },
      { a:"emergency", t:"Darurat", i:"badge" }
    ],
    citizen: [
      { a:"docs", t:"Dokumen", i:"id" },
      { a:"action", t:"Interaksi", i:"hand" },
      { a:"fashion", t:"Pakaian", i:"shirt" }
    ],
    general: [
      { a:"inv", t:"Tas", i:"bag" },
      { a:"phone", t:"Ponsel", i:"phone" },
      { a:"toggle", t:"Pengaturan", i:"gear" }
    ],
    work: [
      { a:"jobduty", t:"Duty", i:"briefcase" },
      { a:"emote_anim", t:"Emote", i:"smile" },
      { a:"emote_prop", t:"Prop", i:"box" },
      { a:"emote_stop", t:"Stop", i:"stop" }
    ],
    vehicle: [
      { a:"veh_light", t:"Lampu", i:"light" },
      { a:"veh_hood", t:"Kap Mesin", i:"door" },
      { a:"veh_trunk", t:"Bagasi", i:"door" },
      { a:"veh_bag", t:"Item", i:"box" },
      { a:"veh_holster", t:"Holster", i:"wrench" },
      { a:"veh_entertrunk", t:"Masuk Bagasi", i:"down" }
    ],
    emote: [
      { a:"emote_anim", t:"Emote", i:"smile" },
      { a:"emote_prop", t:"Prop", i:"box" },
      { a:"emote_stop", t:"Stop", i:"stop" }
    ]
  };

  var radial = h("div", { id:"radial", class:"radial radial-np radial-qb", "data-touch":"", "aria-hidden":"true" });
  var shade = h("div", { class:"rad-backdrop", "data-touch":"" });
  var rbox = h("div", { class:"rad-box", "data-touch":"", role:"dialog", "aria-label":"RP Eagle radial actions" });
  var rsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  rsvg.setAttribute("class", "rad-svg");
  rsvg.setAttribute("viewBox", "0 0 600 600");
  rsvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  rsvg.setAttribute("aria-hidden", "true");
  var rlabels = h("div", { class:"rad-labels" });
  var rbrand = h("div", { class:"rad-qb-brand", "aria-hidden":"true" },[
    h("img",{class:"rad-logo",src:"img/rpeagle_logo.webp",alt:""}),
    h("span",{text:"RP EAGLE / INTERACTION"})
  ]);
  var rmid = h("button", { class:"rad-mid", type:"button", "data-touch":"", "aria-label":"Tutup menu" }, [
    h("span", { class:"rad-mid-i", html: U.icon("x") }),
    h("span", { class:"rad-mid-text", text:"TUTUP" })
  ]);
  var rcaption = h("div", { class:"rad-caption", "aria-live":"polite" }, [
    h("b", { class:"rad-caption-title", text:"MENU AKSI" }),
    h("small", { class:"rad-caption-hint", text:"Pilih menu untuk melanjutkan" })
  ]);
  var rhint = h("div", { class:"rad-hint", text:"RP EAGLE · TOUCH / KLIK UNTUK AKSI" });
  rbox.appendChild(rsvg);
  rbox.appendChild(rlabels);
  rbox.appendChild(rbrand);
  rbox.appendChild(rmid);
  radial.appendChild(shade);
  radial.appendChild(rbox);
  radial.appendChild(rcaption);
  radial.appendChild(rhint);
  U.layer("screenlayer").appendChild(radial);

  var radialShown = false, activeIndex = 0, currentItems = [], currentMode = "main";
  var lastActionAt = 0, lastAction = "", currentSeq = 0, highestSeq = 0, retiredSeq = 0, renderEpoch = 0, pending = false, pendingTimer = 0;
  function angleRad(a) { return a * Math.PI / 180; }
  function circlePt(r, a) { return { x:300 + Math.cos(angleRad(a)) * r, y:300 + Math.sin(angleRad(a)) * r }; }
  function pathSector(a0, a1, r0, r1) {
    var o0=circlePt(r1,a0), o1=circlePt(r1,a1), i1=circlePt(r0,a1), i0=circlePt(r0,a0);
    return "M"+o0.x.toFixed(3)+" "+o0.y.toFixed(3)+
      " A"+r1+" "+r1+" 0 0 1 "+o1.x.toFixed(3)+" "+o1.y.toFixed(3)+
      " L"+i1.x.toFixed(3)+" "+i1.y.toFixed(3)+
      " A"+r0+" "+r0+" 0 0 0 "+i0.x.toFixed(3)+" "+i0.y.toFixed(3)+" Z";
  }
  function setSelected(idx) {
    if (!currentItems.length) return;
    activeIndex = ((idx % currentItems.length) + currentItems.length) % currentItems.length;
    Array.prototype.forEach.call(rsvg.querySelectorAll(".rad-sector"), function (e,i) {
      e.classList.toggle("is-active", i === activeIndex);
    });
    Array.prototype.forEach.call(rlabels.querySelectorAll(".rad-label"), function (e,i) {
      e.classList.toggle("is-active", i === activeIndex);
      e.setAttribute("aria-pressed", i === activeIndex ? "true" : "false");
    });
    rcaption.querySelector(".rad-caption-title").textContent = currentItems[activeIndex].t;
  }
  function radialAction(action) {
    if (!radialShown || !E.canInteract(radial) || typeof action !== "string" || !/^[a-z_]{1,32}$/.test(action)) return;
    // Android WebView may generate a click after touchend; one action per tap.
    if (pending && action !== "close") return;
    var now = Date.now();
    if (lastAction === action && now - lastActionAt < 280) return;
    lastActionAt = now; lastAction = action;
    if (E.send("radial", action, currentSeq || -1) === false) return;
    pending = true;radial.setAttribute("aria-busy","true");
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(function(){pending=false;radial.removeAttribute("aria-busy");},900);
    if (action === "close") hideRadial();
  }
  function cleanItems(raw, mode) {
    var source = Array.isArray(raw) ? raw : RADIAL_MENUS[mode] || RADIAL_MENUS.main;
    return source.filter(function (x) {
      // V115: never reintroduce the removed vehicle lock button.
      return x && typeof (x.a || x.action) === "string" &&
        /^[a-z_]{1,32}$/.test(x.a || x.action) && (x.a || x.action) !== "veh_lock";
    }).slice(0, 9).map(function (x) {
      return { a:x.a || x.action, t:String(x.t || x.title || "Aksi").slice(0,22), i:String(x.i || x.icon || "info") };
    });
  }
  function renderRadial(raw, mode) {
    currentMode = mode;
    var thisEpoch = ++renderEpoch;
    currentItems = cleanItems(raw, mode);
    rsvg.textContent = "";
    rlabels.textContent = "";
    if (!currentItems.length) { activeIndex = 0; return; }
    // Same wedge geometry as desktop; touch buttons are individually positioned.
    var count = currentItems.length, angleSize = 360 / count;
    var gap = count >= 7 ? 2.0 : 2.75;
    var r0 = 101, r1 = 268;
    var labelRadius = count >= 7 ? 191 : 186;
    currentItems.forEach(function (item, idx) {
      var a0 = -90 + idx*angleSize + gap, a1 = -90 + (idx+1)*angleSize-gap;
      var mid = (a0+a1)/2, path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "rad-sector");
      path.setAttribute("d", pathSector(a0,a1,r0,r1));
      path.setAttribute("data-index", String(idx));
      path.setAttribute("data-action", item.a);
      path.addEventListener("mouseenter", function(){setSelected(idx);});
      path.addEventListener("touchstart", function(){setSelected(idx);}, {passive:true});
      path.addEventListener("click", function(){if(thisEpoch!==renderEpoch)return;setSelected(idx);radialAction(item.a);});
      rsvg.appendChild(path);
      var p=circlePt(labelRadius,mid), b=h("button",{
        type:"button", class:"rad-label", "data-touch":"", "data-action":item.a,
        "aria-label":item.t,
        style:"left:"+(p.x/6).toFixed(3)+"%;top:"+(p.y/6).toFixed(3)+"%"
      }, [
        h("span",{class:"rad-label-i",html:U.icon(item.i)}),
        h("span",{class:"rad-label-t",text:item.t})
      ]);
      b.addEventListener("mouseenter", function(){setSelected(idx);});
      b.addEventListener("touchstart", function(){setSelected(idx);}, {passive:true});
      b.addEventListener("click", function(ev){ev.stopPropagation();if(thisEpoch!==renderEpoch)return;setSelected(idx);radialAction(item.a);});
      rlabels.appendChild(b);
    });
    rmid.querySelector(".rad-mid-i").innerHTML = U.icon(mode === "main" ? "x" : "back");
    rmid.querySelector(".rad-mid-text").textContent = mode === "main" ? "TUTUP" : "KEMBALI";
    rmid.setAttribute("aria-label", mode === "main" ? "Tutup menu" : "Kembali ke menu utama");
    rcaption.querySelector(".rad-caption-hint").textContent = mode === "main" ? "Pilih kategori aksi" : "Tekan tengah untuk kembali";
    setSelected(0);
  }
  rmid.addEventListener("click", function(){radialAction(currentMode === "main" ? "close" : "back");});
  shade.addEventListener("click", function(){radialAction("close");});
  document.addEventListener("keydown", function(ev){
    if (!radialShown || !E.canInteract(radial) || ev.defaultPrevented || ev.isComposing || ev.repeat) return;
    var target=ev.target;
    if(target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    if (ev.key === "Escape" || ev.key === "Backspace") {ev.preventDefault();radialAction(currentMode === "main"?"close":"back");}
    else if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {ev.preventDefault();setSelected(activeIndex+1);}
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {ev.preventDefault();setSelected(activeIndex-1);}
    else if (ev.key === "Enter") {ev.preventDefault();if(currentItems[activeIndex])radialAction(currentItems[activeIndex].a);}
  });
  function hideRadial() {
    radialShown=false;pending=false;clearTimeout(pendingTimer);++renderEpoch;
    retiredSeq=Math.max(retiredSeq,currentSeq);
    radial.classList.remove("on");radial.setAttribute("aria-hidden","true");radial.removeAttribute("aria-busy");
    rsvg.textContent="";rlabels.textContent="";currentItems=[];
    if(radial.contains(document.activeElement))document.activeElement.blur();
    if(E.touchNow)E.touchNow();else E.touch();
  }
  E.on("radial", function(d){
    if(!d || typeof d!=="object")return;
    var incoming=+d.seq||0;
    if(incoming && (incoming<highestSeq || +d.show && incoming<=retiredSeq))return;
    if(incoming)highestSeq=Math.max(highestSeq,incoming);
    // A small hide packet can arrive before the fragmented show it cancels.
    if(!+d.show){retiredSeq=Math.max(retiredSeq,incoming);hideRadial();return;}
    currentSeq=incoming;pending=false;clearTimeout(pendingTimer);radial.removeAttribute("aria-busy");
    radialShown = !!+(d && d.show);
    radial.classList.toggle("on",radialShown);
    radial.setAttribute("aria-hidden",radialShown?"false":"true");
    if(radialShown){
      var mode=String(d.mode||"main").toLowerCase();
      if(!RADIAL_MENUS[mode]) mode="main";
      renderRadial(Array.isArray(d.items)?d.items:null,mode);
      lastActionAt=0; lastAction="";
    }
    E.touch();
  });

  E.on("auth",function(d){
    if(d && ["login","register","chars","charinfo","create","spawn"].indexOf(d.v)>=0){hideRadial();currentSeq=highestSeq=retiredSeq=0;}
  });

  // V127: the CJ panel was removed; character.js owns the BRL wardrobe.

  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("widgets");   // v28: modul dimuat sampai selesai
})();

