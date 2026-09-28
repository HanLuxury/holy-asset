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
  // FiveM/QBCore style: 5 sektor utama dan submenu yang tetap radial.
  // Label selalu dihitung di dalam ring sektor, bukan di luar SVG.
  var RADIAL_MENUS = {
    main: [
      { a: "citizen",   t: "Citizen",  i: "user" },
      { a: "general",   t: "General",  i: "list" },
      { a: "veh",       t: "Vehicle",  i: "car" },
      { a: "work",      t: "Work",     i: "briefcase" },
      { a: "emergency", t: "10-999",   i: "badge" }
    ],
    citizen: [
      { a: "docs",     t: "Berkas",  i: "id" },
      { a: "action",   t: "Aksi",    i: "hand" },
      { a: "fashion",  t: "Pakaian", i: "shirt" }
    ],
    general: [
      { a: "inv",    t: "Tas",    i: "bag" },
      { a: "phone",  t: "Ponsel", i: "phone" },
      { a: "toggle", t: "Toggle", i: "gear" }
    ],
    work: [
      { a: "jobduty",    t: "Job Duty", i: "briefcase" },
      { a: "emote_anim", t: "Emote",    i: "smile" },
      { a: "emote_prop", t: "Prop",     i: "box" },
      { a: "emote_stop", t: "Stop",     i: "stop" }
    ],
    vehicle: [
      { a: "veh_lock",       t: "Kunci",       i: "lock" },
      { a: "veh_light",      t: "Lampu",       i: "light" },
      { a: "veh_hood",       t: "Hood",        i: "door" },
      { a: "veh_trunk",      t: "Trunk",       i: "door" },
      { a: "veh_bag",        t: "Bagasi",      i: "box" },
      { a: "veh_holster",    t: "Holster",     i: "wrench" },
      { a: "veh_entertrunk", t: "Masuk Bagasi", i: "down" }
    ],
    emote: [
      { a: "emote_anim", t: "Emote", i: "smile" },
      { a: "emote_prop", t: "Prop",  i: "box" },
      { a: "emote_stop", t: "Stop",  i: "stop" }
    ]
  };

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
  function getItems(items, mode) {
    if (items && items.length) return items;
    var local = RADIAL_MENUS[mode] || RADIAL_MENUS.main;
    return local.map(function (x) {
      return { a: x.a, t: x.t, i: x.i };
    });
  }
  function renderRadialItems(items, mode) {
    clearRadial();
    items = getItems(items, mode);

    var count = items.length;
    if (!count) return;

    var span = 360 / count;
    var gap = count === 5 ? 2.0 : Math.min(2.4, Math.max(1.0, span * 0.035));
    var innerR = 90;
    var outerR = 265;
    // Jarak pusat label dari titik tengah radial. Kritis: dibagi TOTAL viewBox (600),
    // karena posisi CSS dihitung dari sisi kiri/atas box. Versi lama membagi 300
    // sehingga label terdorong keluar dari sektor.
    var labelR = count === 5 ? 177 : Math.min(176, 178);
    var defaultIndex = mode === "main" && count === 5 ? 0 : 0;

    items.forEach(function (r, idx) {
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

      // Posisi dalam wedge: radius dibagi 600 (ukuran penuh SVG), bukan 300 (setengah SVG).
      var x = 50 + Math.cos(deg(mid)) * (labelR / 600 * 100);
      var y = 50 + Math.sin(deg(mid)) * (labelR / 600 * 100);
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

  renderRadialItems(RADIAL_MENUS.main, "main");
  centerHandler(false);

  E.on("radial", function (d) {
    radial.classList.toggle("on", !!d.show);
    var mode = String(d.mode || "main").toLowerCase();
    radial.setAttribute("data-mode", mode);
    if (d.show) {
      var raw = Array.isArray(d.items) ? d.items : [];
      var items = raw.map(function (x) {
        return { a: x.a || x.action || "close", t: x.t || x.title || "Aksi", i: x.i || x.icon || "info" };
      });
      renderRadialItems(items, mode);
      centerHandler(!!d.back || mode !== "main");
    }
    E.touch();
  });


  /* ============================ CLOTHES CEF ============================ */
  var clothes = h("div", { id: "clothes-cef", class: "clothes-cef" });
  clothes.innerHTML =
    '<div class="clothes-backdrop"></div>' +
    '<div class="clothes-title-rail"><div>CHOICE OF CLOTHING</div></div>' +
    '<div class="clothes-hint">[F] - Toko Pakaian</div>' +
    '<div class="clothes-shell" data-touch="">' +
      '<div class="clothes-head">' +
        '<div class="clothes-brand"><span class="clothes-brand-i">'+U.icon("shirt")+'</span><div><b>PAKAIAN</b><small class="clothes-mode">TOKO PAKAIAN</small></div></div>' +
        '<div class="clothes-head-right"><span class="clothes-count">0 SLOT AKTIF</span><button class="clothes-x btn btn-g sm" type="button" data-touch="">'+U.icon("x")+'<span>Tutup</span></button></div>' +
      '</div>' +
      '<div class="clothes-tabs" data-touch=""></div>' +
      '<div class="clothes-body">' +
        '<div class="clothes-catalog">' +
          '<div class="clothes-catalog-head"><div><b>Pilihan</b><small>Gunakan tombol kiri/kanan untuk mengganti item</small></div><div class="clothes-page"><button class="clothes-pg-prev btn btn-g sm" type="button" data-touch="">'+U.icon("back")+'</button><span>1 / 1</span><button class="clothes-pg-next btn btn-g sm" type="button" data-touch="">'+U.icon("next")+'</button></div></div>' +
          '<div class="clothes-grid"></div>' +
        '</div>' +
        '<aside class="clothes-side">' +
          '<div class="clothes-preview"><div class="clothes-side-title"><b>Preview</b><span class="clothes-unsaved">PREVIEW AKTIF</span></div><div class="clothes-selected"><span class="clothes-selected-i">'+U.icon("shirt")+'</span><div><b class="clothes-selected-name">Belum memilih</b><small class="clothes-selected-type">Pilih item dari katalog</small></div></div><div class="clothes-slots"></div></div>' +
        '</aside>' +
      '</div>' +
      '<div class="clothes-foot">' +
        '<div class="clothes-status"></div>' +
        '<div class="clothes-actions"><button type="button" class="clothes-action-draft btn btn-g sm" data-touch="">Simpan Outfit</button><button type="button" class="clothes-action-cancel btn btn-g sm" data-touch="">Batal</button><button type="button" class="clothes-action-save btn btn-s" data-touch="">Konfirmasi</button></div>' +
      '</div>' +
    '</div>';
  U.layer("screenlayer").appendChild(clothes);

  var clothesGrid = clothes.querySelector(".clothes-grid");
  var clothesTabs = clothes.querySelector(".clothes-tabs");
  var clothesPageLabel = clothes.querySelector(".clothes-page span");
  var clothesPrev = clothes.querySelector(".clothes-pg-prev");
  var clothesNext = clothes.querySelector(".clothes-pg-next");
  var clothesSave = clothes.querySelector(".clothes-action-save");
  var clothesDraftBtn = clothes.querySelector(".clothes-action-draft");
  var clothesCancelBtn = clothes.querySelector(".clothes-action-cancel");
  var clothesMode = false;
  var clothesOpen = false;
  var clothesCatalog = [];
  var clothesFilter = "all";
  var clothesPage = 1;
  var clothesDraft = null;
  var clothesCommitted = null;
  var clothesSelected = null;
  var CLOTHES_PER_PAGE = 30;

  function clothesDefaultState() {
    var items = [];
    for (var i = 0; i < 18; i++) items.push({t:i,a:0,x:"",m:""});
    return { v:1, hairColor:0, skinColor:0, items:items };
  }
  function clothesClone(o) {
    try { return JSON.parse(JSON.stringify(o)); } catch(e) { return clothesDefaultState(); }
  }
  function clothesParseState(raw) {
    if (raw && typeof raw === "object") return raw;
    try { return JSON.parse(String(raw || "")); } catch(e) { return clothesDefaultState(); }
  }
  function clothesNormState(st) {
    st = st || clothesDefaultState();
    if (!Array.isArray(st.items)) st.items = [];
    var out = clothesDefaultState();
    out.hairColor = +st.hairColor || 0;
    out.skinColor = +st.skinColor || 0;
    for (var i=0;i<18;i++) {
      var x = st.items[i] || {};
      out.items[i] = {t:i, a:+x.a?1:0, x:String(x.x||""), m:String(x.m||"")};
    }
    return out;
  }
  function clothesEmitState(action) {
    var state = clothesClone(clothesDraft || clothesDefaultState());
    // PREVIEW IS LOCAL ONLY. Sending every selection through the server caused
    // an echo back to the client and multiple player.img rebuilds, which could
    // reset the RakNet connection on some Android builds. The server receives
    // only the final "buy" event.
    try { E.sendRaw("clothes_native_state", state); } catch (e) {}
  }
  function clothesTypeKind(item) {
    var t = +item.type;
    if (t === 249) return "hair";
    if (t === 250) return "skin";
    if (t >= 4 && t <= 12) return "tattoo";
    if (t >= 13 && t <= 17) return "accessory";
    return "clothes";
  }
  function clothesIconFor(item) {
    var k = clothesTypeKind(item);
    if (k === "hair") return "user";
    if (k === "skin") return "user";
    if (k === "tattoo") return "star";
    if (k === "accessory") return "box";
    return "shirt";
  }
  function clothesCategoryLabel(k) {
    return k === "all" ? "Semua" : (k === "clothes" ? "Pakaian" : k === "tattoo" ? "Tattoo" : k === "accessory" ? "Aksesoris" : k === "hair" ? "Warna Rambut" : "Warna Kulit");
  }
  function clothesBuildTabs() {
    clothesTabs.innerHTML = "";
    ["all","clothes","tattoo","accessory","hair","skin"].forEach(function(k) {
      var b = h("button", {type:"button", class:"clothes-tab"+(clothesFilter===k?" active":""), "data-touch":"", "aria-label":clothesCategoryLabel(k)}, [h("span",{text:clothesCategoryLabel(k)})]);
      b.onclick=function(){clothesFilter=k;clothesPage=1;clothesBuildTabs();clothesRenderGrid();};
      clothesTabs.appendChild(b);
    });
  }
  function clothesFiltered() {
    return clothesCatalog.filter(function(it){ return clothesFilter === "all" || clothesTypeKind(it) === clothesFilter; });
  }
  function clothesItemActive(item) {
    var k=clothesTypeKind(item);
    if(k==="hair") return +clothesDraft.hairColor === +item.colorId;
    if(k==="skin") return +clothesDraft.skinColor === +item.colorId;
    var t=+item.type, x=clothesDraft.items[t]||{};
    return !!x.a && String(x.x||"")===String(item.texture||"") && String(x.m||"")===String(item.model||"");
  }
  function clothesChoose(item) {
    if (!clothesDraft) clothesDraft = clothesDefaultState();
    clothesSelected = item;
    var k=clothesTypeKind(item);
    if(k==="hair") clothesDraft.hairColor=+item.colorId||0;
    else if(k==="skin") clothesDraft.skinColor=+item.colorId||0;
    else {
      var t=+item.type;
      if(t<0 || t>=18) return;
      clothesDraft.items[t]={t:t,a:1,x:String(item.texture||""),m:String(item.model||"")};
    }
    clothesRenderSide();
    clothesRenderGrid();
    clothesEmitState("preview");
  }
  function clothesRenderGrid() {
    var arr=clothesFiltered();
    var pages=Math.max(1,Math.ceil(arr.length/CLOTHES_PER_PAGE));
    if(clothesPage>pages) clothesPage=pages;
    var start=(clothesPage-1)*CLOTHES_PER_PAGE;
    var slice=arr.slice(start,start+CLOTHES_PER_PAGE);
    clothesPageLabel.textContent=clothesPage+" / "+pages;
    clothesPrev.classList.toggle("dis",clothesPage<=1);
    clothesNext.classList.toggle("dis",clothesPage>=pages);
    clothesGrid.innerHTML="";
    slice.forEach(function(item, localIndex){
      var active=clothesItemActive(item);
      var globalIndex=start+localIndex;
      var prevItem=arr[globalIndex-1]||null;
      var nextItem=arr[globalIndex+1]||null;
      var typeText=(item.typeName||clothesCategoryLabel(clothesTypeKind(item))).toUpperCase();
      var meta1=(item.texture!==undefined?String(item.texture):"-");
      var meta2=(item.model!==undefined?String(item.model):"-");
      var row=h("div",{class:"clothes-choice-row"+(active?" active":""),"data-touch":""},[
        h("button",{type:"button",class:"clothes-arrow clothes-arrow-left btn btn-g sm","data-touch":"", "aria-label":"Sebelumnya"},[h("span",{text:"‹"})]),
        h("button",{type:"button",class:"clothes-choice-main","data-touch":"","aria-label":item.name||"Item"},[
          h("span",{class:"clothes-choice-top",text:typeText}),
          h("span",{class:"clothes-choice-name",text:item.name||("Item "+(item.id!==undefined?item.id:globalIndex+1))}),
          h("span",{class:"clothes-choice-meta",text:"ITEM: "+(item.type!==undefined?item.type:"-")+"   •   TEXTURE: "+meta1+"   •   MODEL: "+meta2})
        ]),
        h("button",{type:"button",class:"clothes-arrow clothes-arrow-right btn btn-g sm","data-touch":"", "aria-label":"Berikutnya"},[h("span",{text:"›"})])
      ]);
      row.querySelector(".clothes-choice-main").onclick=function(){clothesChoose(item);};
      row.querySelector(".clothes-arrow-left").onclick=function(){ if(prevItem) clothesChoose(prevItem); };
      row.querySelector(".clothes-arrow-right").onclick=function(){ if(nextItem) clothesChoose(nextItem); };
      if(!prevItem) row.querySelector(".clothes-arrow-left").classList.add("dis");
      if(!nextItem) row.querySelector(".clothes-arrow-right").classList.add("dis");
      clothesGrid.appendChild(row);
    });
  }

  function clothesRenderSide() {
    if(!clothesDraft) return;
    var count=0;
    clothesDraft.items.forEach(function(x){if(x&&x.a)count++;});
    if(+clothesDraft.hairColor) count++;
    if(+clothesDraft.skinColor) count++;
    clothes.querySelector(".clothes-count").textContent=count+" SLOT AKTIF";
    clothes.querySelector(".clothes-unsaved").textContent=JSON.stringify(clothesDraft)!==JSON.stringify(clothesCommitted||clothesDefaultState())?"PREVIEW AKTIF":"TERSIMPAN";
    var name=clothesSelected?(clothesSelected.name||clothesSelected.texture||"Item"):"Belum memilih";
    var type=clothesSelected?(clothesSelected.typeName||clothesCategoryLabel(clothesTypeKind(clothesSelected))):"Pilih item dari katalog";
    clothes.querySelector(".clothes-selected-name").textContent=name;
    clothes.querySelector(".clothes-selected-type").textContent=type;
    var slotBox=clothes.querySelector(".clothes-slots"); slotBox.innerHTML="";
    for(var i=0;i<18;i++){
      var x=clothesDraft.items[i]||{};
      var label=["Atasan","Kepala","Celana","Sepatu","Tattoo A.1","Tattoo A.2","Tattoo B.1","Tattoo B.2","Tattoo Punggung","Tattoo Dada L","Tattoo Dada R","Tattoo Perut","Tattoo Pinggang","Kalung","Jam","Kacamata","Topi","Aksesori"][i];
      var row=h("button",{type:"button",class:"clothes-slot"+(x.a?" active":""),"data-touch":"", "aria-label":label},[
        h("span",{class:"clothes-slot-i",html:U.icon(x.a?"check":"minus")}), h("span",{class:"clothes-slot-name",text:label}), h("span",{class:"clothes-slot-state",text:x.a?(x.x||"Terpasang"):"Kosong"})
      ]);
      row.onclick=function(idx){return function(){
        var y=clothesDraft.items[idx]||{}; if(y.a){y.a=0;y.x="";y.m="";clothesDraft.items[idx]=y;clothesSelected=null;clothesRenderSide();clothesRenderGrid();clothesEmitState("remove");}
      };}(i);
      slotBox.appendChild(row);
    }
    clothesSave.classList.toggle("dis",!clothesMode);
  }
  function clothesShowStatus(msg, ok) {
    var el=clothes.querySelector(".clothes-status"); el.textContent=msg||""; el.classList.toggle("ok",!!ok); el.classList.toggle("err",!ok);
    clearTimeout(clothesShowStatus.t); clothesShowStatus.t=setTimeout(function(){el.textContent="";},2600);
  }
  clothesPrev.onclick=function(){if(clothesPage>1){clothesPage--;clothesRenderGrid();}};
  clothesNext.onclick=function(){var n=Math.max(1,Math.ceil(clothesFiltered().length/CLOTHES_PER_PAGE));if(clothesPage<n){clothesPage++;clothesRenderGrid();}};
  function clothesCloseLocal() {
    // Restore the last committed outfit immediately on the native ped.
    var committed = clothesClone(clothesCommitted || clothesDefaultState());
    clothesDraft = clothesClone(committed);
    clothesSelected = null;
    try { E.sendRaw("clothes_native_state", committed); } catch (e) {}

    // Hide the UI first so the close button always feels responsive even if
    // the server round-trip is delayed. Then notify the server to re-enable
    // controls and restore the gameplay camera.
    clothesOpen = false;
    clothes.classList.remove("on");
    E.touch();
    try { E.send("clothes", "close", -1); } catch (e) {}
  }
  clothes.querySelector(".clothes-x").onclick=function(ev){ if(ev) ev.stopPropagation(); clothesCloseLocal(); };
  clothesCancelBtn.onclick=function(ev){ if(ev) ev.stopPropagation(); clothesCloseLocal(); };
  clothesDraftBtn.onclick=function(ev){
    if (ev) ev.stopPropagation();
    clothesShowStatus("Preview pakaian aktif. Tekan Konfirmasi untuk menyimpan.",true);
  };
  clothesSave.onclick=function(){
    if(!clothesMode){clothesShowStatus("Pergi ke toko pakaian untuk menyimpan outfit.",false);return;}
    E.send("clothes","buy",-1,JSON.stringify(clothesDraft));
  };

  E.on("clothes_catalog", function(d){
    clothesCatalog=Array.isArray(d&&d.items)?d.items:[];
    clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide(); E.touch();
  });
  E.on("clothes_open", function(d){
    clothesOpen=!!d.show; clothesMode=!!d.shop; clothes.querySelector(".clothes-mode").textContent=clothesMode?"TOKO PAKAIAN":"LEMARI PRIBADI";
    clothes.classList.toggle("on",clothesOpen); clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide(); E.touch();
    // shopping.dat is client-side. Ask native ClothesSystem for the catalog.
    if (clothesOpen) { try { E.sendRaw("clothes_native_catalog", {}); } catch (e) {} }
  });
  E.on("clothes_ui_state", function(d){
    if(d && d.state){ clothesDraft=clothesNormState(clothesParseState(d.state)); if(!clothesCommitted) clothesCommitted=clothesClone(clothesDraft); }
    if(d && typeof d.shop!=="undefined") clothesMode=!!d.shop;
    if(d && typeof d.show!=="undefined") clothesOpen=!!d.show;
    clothes.querySelector(".clothes-mode").textContent=clothesMode?"TOKO PAKAIAN":"LEMARI PRIBADI";
    clothes.classList.toggle("on",clothesOpen); clothesRenderSide(); clothesRenderGrid();
    if(d&&d.saved){clothesCommitted=clothesClone(clothesDraft);clothesShowStatus("Outfit berhasil disimpan ke database.",true);}
    E.touch();
  });
  E.on("clothes_preview", function(d){
    // Server sends the committed state when cancelling the wardrobe.
    var state = d && d.state ? d.state : d;
    if (typeof state === "string") { try { state = JSON.parse(state); } catch(e) { return; } }
    if (!state || !state.items) return;
    clothesDraft = clothesNormState(state);
    clothesCommitted = clothesClone(clothesDraft);
    clothesSelected = null;
    try { E.sendRaw("clothes_native_state", clothesClone(clothesDraft)); } catch (e) {}
    clothesRenderSide(); clothesRenderGrid();
  });
  E.on("clothes_state", function(d){
    if (!d) return;
    // Applies both local and streamed remote outfit state to the native peds.
    try { E.sendRaw("clothes_native_state", d); } catch (e) {}
    var hasOwner = Object.prototype.hasOwnProperty.call(d, "owner");
    if (!hasOwner || clothesOpen) {
      var state = d.state || d;
      if (typeof state === "string") { try { state = JSON.parse(state); } catch(e) { state = null; } }
      if (state && state.items) {
        clothesDraft = clothesNormState(state);
        if (!clothesOpen) clothesCommitted = clothesClone(clothesDraft);
        clothesRenderSide(); clothesRenderGrid();
      }
    }
  });
  E.on("clothes_close", function(){
    clothesOpen=false; clothes.classList.remove("on"); E.touch();
  });
  E.on("clothes_open", function(){
    if(!clothesDraft) clothesDraft=clothesDefaultState();
    if(!clothesCommitted) clothesCommitted=clothesClone(clothesDraft);
  });
  clothesDraft=clothesDefaultState(); clothesCommitted=clothesClone(clothesDraft);
  clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide();

})();
