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

  /* ==================== EAGLE NP STYLE RADIAL v25 ====================
     Inspired by krrm1/qb-radialmenu's interaction/visual language.
     The NUI/FiveM event bridge is NOT imported: EAGLE remains the only bridge.
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
      { a:"veh_lock", t:"Kunci", i:"lock" },
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

  var radial = h("div", { id:"radial", class:"radial radial-np", "data-touch":"", "aria-hidden":"true" });
  var shade = h("div", { class:"rad-backdrop", "data-touch":"" });
  var rbox = h("div", { class:"rad-box", "data-touch":"", role:"dialog", "aria-label":"Menu aksi" });
  var rsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  rsvg.setAttribute("class", "rad-svg");
  rsvg.setAttribute("viewBox", "0 0 600 600");
  rsvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  rsvg.setAttribute("aria-hidden", "true");
  var rlabels = h("div", { class:"rad-labels" });
  var rmid = h("button", { class:"rad-mid", type:"button", "data-touch":"", "aria-label":"Tutup menu" }, [
    h("span", { class:"rad-mid-i", html: U.icon("x") }),
    h("span", { class:"rad-mid-text", text:"TUTUP" })
  ]);
  var rcaption = h("div", { class:"rad-caption", "aria-live":"polite" }, [
    h("b", { class:"rad-caption-title", text:"MENU AKSI" }),
    h("small", { class:"rad-caption-hint", text:"Pilih menu untuk melanjutkan" })
  ]);
  var rhint = h("div", { class:"rad-hint", text:"EAGLE ROLEPLAY  /  TAP TO SELECT" });
  rbox.appendChild(rsvg);
  rbox.appendChild(rlabels);
  rbox.appendChild(rmid);
  radial.appendChild(shade);
  radial.appendChild(rbox);
  radial.appendChild(rcaption);
  radial.appendChild(rhint);
  U.layer("screenlayer").appendChild(radial);

  var radialShown = false, activeIndex = 0, currentItems = [], currentMode = "main";
  var lastActionAt = 0, lastAction = "";
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
    if (!radialShown || typeof action !== "string" || !/^[a-z_]{1,32}$/.test(action)) return;
    // Android WebView may generate a click after touchend; one action per tap.
    var now = Date.now();
    if (lastAction === action && now - lastActionAt < 280) return;
    lastActionAt = now; lastAction = action;
    E.send("radial", action, -1);
  }
  function cleanItems(raw, mode) {
    var source = Array.isArray(raw) && raw.length ? raw : RADIAL_MENUS[mode] || RADIAL_MENUS.main;
    return source.slice(0, 9).filter(function (x) {
      return x && typeof (x.a || x.action) === "string" && /^[a-z_]{1,32}$/.test(x.a || x.action);
    }).map(function (x) {
      return { a:x.a || x.action, t:String(x.t || x.title || "Aksi").slice(0,22), i:String(x.i || x.icon || "info") };
    });
  }
  function renderRadial(raw, mode) {
    currentMode = mode;
    currentItems = cleanItems(raw, mode);
    rsvg.textContent = "";
    rlabels.textContent = "";
    if (!currentItems.length) { activeIndex = 0; return; }
    // Same wedge geometry as desktop; touch buttons are individually positioned.
    var count = currentItems.length, angleSize = 360 / count;
    var gap = count >= 7 ? 1.65 : 2.25;
    var r0 = 87, r1 = 267;
    var labelRadius = count >= 7 ? 178 : 177;
    currentItems.forEach(function (item, idx) {
      var a0 = -90 + idx*angleSize + gap, a1 = -90 + (idx+1)*angleSize-gap;
      var mid = (a0+a1)/2, path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "rad-sector");
      path.setAttribute("d", pathSector(a0,a1,r0,r1));
      path.setAttribute("data-index", String(idx));
      path.setAttribute("data-action", item.a);
      path.addEventListener("mouseenter", function(){setSelected(idx);});
      path.addEventListener("touchstart", function(){setSelected(idx);}, {passive:true});
      path.addEventListener("click", function(){setSelected(idx);radialAction(item.a);});
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
      b.addEventListener("click", function(ev){ev.stopPropagation();setSelected(idx);radialAction(item.a);});
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
    if (!radialShown) return;
    if (ev.key === "Escape" || ev.key === "Backspace") {ev.preventDefault();radialAction(currentMode === "main"?"close":"back");}
    else if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {ev.preventDefault();setSelected(activeIndex+1);}
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {ev.preventDefault();setSelected(activeIndex-1);}
    else if (ev.key === "Enter") {ev.preventDefault();if(currentItems[activeIndex])radialAction(currentItems[activeIndex].a);}
  });
  E.on("radial", function(d){
    radialShown = !!(d && d.show);
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

    /* ============================ CLOTHES CEF ============================ */
  var clothes = h("div", { id: "clothes-cef", class: "clothes-cef" });
  clothes.innerHTML =
    '<div class="clothes-backdrop"></div>' +
    '<div class="clothes-shell glass" data-touch="">' +
      '<div class="clothes-head">' +
        '<div class="clothes-brand"><span class="clothes-brand-i">'+U.icon("shirt")+'</span><div><b>PAKAIAN</b><small class="clothes-mode">LEMARI</small></div></div>' +
        '<div class="clothes-head-right"><span class="clothes-count">0 ITEM</span><button class="clothes-x btn btn-g sm" type="button" data-touch="">'+U.icon("x")+'<span>Tutup</span></button></div>' +
      '</div>' +
      '<div class="clothes-tabs" data-touch=""></div>' +
      '<div class="clothes-body">' +
        '<div class="clothes-catalog"><div class="clothes-catalog-head"><div><b>Katalog</b><small>Pilih item untuk preview</small></div><div class="clothes-page"><button class="clothes-pg-prev btn btn-g sm" type="button" data-touch="">'+U.icon("back")+'</button><span>1 / 1</span><button class="clothes-pg-next btn btn-g sm" type="button" data-touch="">'+U.icon("next")+'</button></div></div><div class="clothes-grid"></div></div>' +
        '<aside class="clothes-side">' +
          '<div class="clothes-preview glass"><div class="clothes-side-title"><b>Preview</b><span class="clothes-unsaved">BELUM DISIMPAN</span></div><div class="clothes-selected"><span class="clothes-selected-i">'+U.icon("shirt")+'</span><div><b class="clothes-selected-name">Belum memilih</b><small class="clothes-selected-type">Pilih item dari katalog</small></div></div><div class="clothes-slots"></div></div>' +
          '<div class="clothes-actions glass"><button type="button" class="clothes-action-reset btn btn-g sm" data-touch="">'+U.icon("refresh")+'<span>Reset</span></button><button type="button" class="clothes-action-remove btn btn-g sm" data-touch="">'+U.icon("trash")+'<span>Lepas Slot</span></button><button type="button" class="clothes-action-save btn btn-s" data-touch="">'+U.icon("check")+'<span>Beli & Simpan • $200</span></button></div>' +
        '</aside>' +
      '</div>' +
      '<div class="clothes-foot"><div class="clothes-tip">Preview berlaku langsung pada karakter. Di toko pakaian, tekan <b>Beli & Simpan</b> untuk menyimpan outfit ke database.</div><div class="clothes-status"></div></div>' +
    '</div>';
  U.layer("screenlayer").appendChild(clothes);

  var clothesGrid = clothes.querySelector(".clothes-grid");
  var clothesTabs = clothes.querySelector(".clothes-tabs");
  var clothesPageLabel = clothes.querySelector(".clothes-page span");
  var clothesPrev = clothes.querySelector(".clothes-pg-prev");
  var clothesNext = clothes.querySelector(".clothes-pg-next");
  var clothesSave = clothes.querySelector(".clothes-action-save");
  var clothesRemove = clothes.querySelector(".clothes-action-remove");
  var clothesReset = clothes.querySelector(".clothes-action-reset");
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
    // Preview is local. Do NOT send preview/remove/reset through the server.
    // nativeSendEvent intercepts this event and CClothesSystem::Process()
    // applies the latest state on the game thread.
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
  var CLOTHES_SLOT_NAMES = ["Atasan","Rambut / Kepala","Celana","Sepatu","Tattoo Lengan Kiri Atas","Tattoo Lengan Kiri Bawah",
    "Tattoo Lengan Kanan Atas","Tattoo Lengan Kanan Bawah","Tattoo Punggung","Tattoo Dada Kiri","Tattoo Dada Kanan",
    "Tattoo Perut","Tattoo Pinggang","Kalung","Jam","Kacamata","Topi","Aksesori"];
  var CLOTHES_HAIR_COLORS = ["Bawaan","Hitam Alami","Cokelat Tua","Cokelat","Kastanye","Merah Bata","Merah","Pirang",
    "Platina","Putih","Biru","Ungu","Merah Muda"];
  var CLOTHES_SKIN_COLORS = ["Bawaan","Porselen","Cerah","Cokelat Muda","Cokelat","Cokelat Gelap","Cokelat Tua","Sawo Matang"];
  function clothesTypeLabel(t) {
    t = +t;
    if (t === 249) return "Warna Rambut";
    if (t === 250) return "Warna Kulit";
    return CLOTHES_SLOT_NAMES[t] || "Pakaian";
  }
  function clothesPrettyName(texture) {
    var s = String(texture || "").replace(/_/g, " ");
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Item";
  }
  function clothesNormalizeCatalogItem(it, idx) {
    // Server row (gamemode ClothesCatalog_Send): [index, type, "texture", "model", colorId]
    if (Array.isArray(it)) {
      var t = +it[1] || 0, color = it[4] == null ? -1 : +it[4];
      var tex = String(it[2] == null ? "" : it[2]), mdl = String(it[3] == null ? "" : it[3]);
      var name = t === 249 ? (CLOTHES_HAIR_COLORS[color] || ("Warna " + color)) :
                 t === 250 ? (CLOTHES_SKIN_COLORS[color] || ("Warna " + color)) : clothesPrettyName(tex);
      return { index: it[0] != null ? +it[0] : idx, type: t, typeName: clothesTypeLabel(t), name: name,
               texture: tex, model: mdl, colorId: color, price: 0, store: "" };
    }
    it = it || {};
    var type = it.type != null ? +it.type : (it.t != null ? +it.t : 0);
    return {
      index: it.index != null ? +it.index : idx,
      type: type,
      typeName: String(it.typeName || it.category || clothesTypeLabel(type)),
      name: String(it.name || it.displayName || it.texture || ("Item " + (idx + 1))),
      texture: String(it.texture || it.x || it.textureName || ""),
      model: String(it.model || it.m || it.modelName || ""),
      colorId: it.colorId != null ? +it.colorId : -1,
      price: +it.price || 0,
      store: String(it.store || it.shop || "")
    };
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
    slice.forEach(function(item){
      var active=clothesItemActive(item);
      var card=h("button",{type:"button",class:"clothes-card"+(active?" active":""),"data-touch":"","aria-label":item.name||item.texture||"Item"},[
        h("span",{class:"clothes-card-icon",html:U.icon(clothesIconFor(item))}),
        h("span",{class:"clothes-card-name",text:item.name||item.texture||"Item"}),
        h("span",{class:"clothes-card-meta",text:(item.typeName||clothesCategoryLabel(clothesTypeKind(item)))})
      ]);
      card.onclick=function(){clothesChoose(item);};
      clothesGrid.appendChild(card);
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
  clothes.querySelector(".clothes-x").onclick=function(){
    try { E.sendRaw("clothes_native_state", clothesClone(clothesCommitted || clothesDefaultState())); } catch (e) {}
    clothesOpen=false; clothes.classList.remove("on"); E.touch();
    E.send("clothes","close",-1);
  };
  clothesRemove.onclick=function(){
    if(!clothesSelected){clothesShowStatus("Pilih slot atau item yang ingin dilepas.",false);return;}
    var t=+clothesSelected.type;
    if(t>=0&&t<18){clothesDraft.items[t]={t:t,a:0,x:"",m:""};clothesSelected=null;clothesRenderSide();clothesRenderGrid();clothesEmitState("remove");}
  };
  clothesReset.onclick=function(){
    clothesDraft=clothesDefaultState();clothesSelected=null;clothesRenderSide();clothesRenderGrid();clothesEmitState("reset");
  };
  clothesSave.onclick=function(){
    if(!clothesMode){clothesShowStatus("Kamu sedang di lemari pribadi. Pergi ke toko pakaian untuk menyimpan perubahan.",false);return;}
    E.send("clothes","buy",-1,JSON.stringify(clothesDraft));
  };

  // The server sends the catalog in batches of 24 rows: {"reset":1|0,"done":1|0,"total":N,"items":[[i,type,"tex","mdl",color],...]}.
  // Collect them; an old single-message catalog (no reset/done) still replaces the list.
  E.on("clothes_catalog", function(d){
    var raw = Array.isArray(d && d.items) ? d.items : [];
    var batched = d && (d.reset != null || d.done != null);
    if (!batched || +d.reset) { clothesCatalog = []; clothesPage = 1; }
    for (var i = 0; i < raw.length; i++) clothesCatalog.push(clothesNormalizeCatalogItem(raw[i], clothesCatalog.length));
    clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide();
    if (batched && !+d.done) clothesShowStatus("Memuat katalog " + clothesCatalog.length + (d.total ? "/" + d.total : "") + "...", true);
    else if (!clothesCatalog.length) clothesShowStatus("Katalog pakaian belum diterima dari server.", false);
    else clothesShowStatus(String(clothesCatalog.length) + " item pakaian dimuat.", true);
    E.touch();
  });
  E.on("clothes_open", function(d){
    clothesOpen=!!d.show; clothesMode=!!d.shop; clothes.querySelector(".clothes-mode").textContent=clothesMode?"TOKO PAKAIAN":"LEMARI PRIBADI";
    clothes.classList.toggle("on",clothesOpen); clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide(); E.touch();
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
  E.on("clothes_close", function(){
    clothesOpen=false; clothes.classList.remove("on"); E.touch();
  });
  E.on("clothes_open", function(){
    if(!clothesDraft) clothesDraft=clothesDefaultState();
    if(!clothesCommitted) clothesCommitted=clothesClone(clothesDraft);
  });
  clothesDraft=clothesDefaultState(); clothesCommitted=clothesClone(clothesDraft);
  clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide();

  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("widgets");   // v28: modul dimuat sampai selesai
})();

