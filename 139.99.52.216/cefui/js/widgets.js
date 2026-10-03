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
  var clothesDirty = false;
  var clothesCatalogReady = false;
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
  function clothesTypeName(type) {
    type=+type;
    var names=["Atasan","Rambut / Kepala","Celana","Sepatu","Tattoo Lengan Kiri Atas","Tattoo Lengan Kiri Bawah","Tattoo Lengan Kanan Atas","Tattoo Lengan Kanan Bawah","Tattoo Punggung","Tattoo Dada Kiri","Tattoo Dada Kanan","Tattoo Perut","Tattoo Pinggang","Kalung","Jam","Kacamata","Topi","Aksesori"];
    if(type===249) return "Warna Rambut";
    if(type===250) return "Warna Kulit";
    return names[type] || "Pakaian";
  }
  function clothesPrettyName(raw, type) {
    raw=String(raw||"");
    if(+type===249) { var hn=["Default","Natural Black","Dark Brown","Brown","Chestnut","Auburn","Red","Blonde","Platinum","White","Blue","Purple","Pink"]; return hn[+(raw.split("_").pop())]||"Warna Rambut"; }
    if(+type===250) { var sn=["Default","Porcelain","Fair","Light Brown","Brown","Deep Brown","Dark Brown","Warm Brown"]; return sn[+(raw.split("_").pop())]||"Warna Kulit"; }
    var v=raw.replace(/_/g," ").replace(/([a-z])([A-Z])/g,"$1 $2").trim();
    return v ? v.replace(/\b\w/g,function(c){return c.toUpperCase();}) : "Item";
  }
  function clothesNormalizeCatalogItem(it, idx) {
    if (Array.isArray(it)) {
      var t=+it[1]||0, tex=String(it[2]||""), colorId=+it[4];
      return {index:+it[0],type:t,typeName:clothesTypeName(t),name:clothesPrettyName(tex,t),texture:tex,model:String(it[3]||""),price:0,store:"EAGLE",colorId:isNaN(colorId)?0:colorId};
    }
    it = it || {};
    var type = it.type != null ? +it.type : (it.t != null ? +it.t : 0);
    var texture=String(it.texture || it.x || it.textureName || "");
    return {
      index: it.index != null ? +it.index : idx,
      type: type,
      typeName: String(it.typeName || it.category || clothesTypeName(type)),
      name: String(it.name || it.displayName || clothesPrettyName(texture,type) || ("Item " + (idx + 1))),
      texture: texture,
      model: String(it.model || it.m || it.modelName || ""),
      price: +it.price || 0,
      store: String(it.store || it.shop || "EAGLE"),
      colorId: it.colorId != null ? +it.colorId : 0
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
    clothesDirty=true;
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
        var y=clothesDraft.items[idx]||{}; if(y.a){y.a=0;y.x="";y.m="";clothesDraft.items[idx]=y;clothesSelected=null;clothesDirty=true;clothesRenderSide();clothesRenderGrid();clothesEmitState("remove");}
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
    clothesOpen=false; clothesDirty=false; clothes.classList.remove("on"); E.touch();
    E.send("clothes","close",-1);
  };
  clothesRemove.onclick=function(){
    if(!clothesSelected){clothesShowStatus("Pilih slot atau item yang ingin dilepas.",false);return;}
    var t=+clothesSelected.type;
    if(t>=0&&t<18){clothesDraft.items[t]={t:t,a:0,x:"",m:""};clothesSelected=null;clothesDirty=true;clothesRenderSide();clothesRenderGrid();clothesEmitState("remove");}
  };
  clothesReset.onclick=function(){
    clothesDraft=clothesDefaultState();clothesSelected=null;clothesDirty=true;clothesRenderSide();clothesRenderGrid();clothesEmitState("reset");
  };
  clothesSave.onclick=function(){
    if(!clothesMode){clothesShowStatus("Kamu sedang di lemari pribadi. Pergi ke toko pakaian untuk menyimpan perubahan.",false);return;}
    if(!clothesCatalogReady){clothesShowStatus("Katalog server belum selesai dimuat.",false);return;}
    if(!clothesDirty){clothesShowStatus("Tidak ada perubahan outfit.",false);return;}
    E.send("clothes","buy",-1,JSON.stringify(clothesDraft));
  };

  /* Server -> CEF -> native C++ clothes bridge. Without this, remote outfit
     broadcasts reached JavaScript but never touched the GTA ped descriptor. */
  E.on("clothes_state", function(d){
    if(!d || typeof d!=="object") return;
    try { E.sendRaw("clothes_native_state", d); } catch(e) {}
  });
  E.on("clothes_preview", function(d){
    if(!d || typeof d!=="object") return;
    try { E.sendRaw("clothes_native_state", d); } catch(e) {}
  });

  E.on("clothes_catalog", function(d){
    var raw = Array.isArray(d && d.items) ? d.items : [];
    if(d && d.reset) { clothesCatalog=[]; clothesCatalogReady=false; clothesPage=1; }
    var base=clothesCatalog.length;
    raw.forEach(function(it,n){ clothesCatalog.push(clothesNormalizeCatalogItem(it,base+n)); });
    if(d && d.done) clothesCatalogReady=true;
    clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide();
    if(d && d.done) {
      if (!clothesCatalog.length) clothesShowStatus("Katalog Pawn kosong.", false);
      else clothesShowStatus(String(clothesCatalog.length) + " CJ component siap dari server.", true);
    }
    E.touch();
  });
  E.on("clothes_open", function(d){
    clothesOpen=!!d.show; clothesMode=!!d.shop; clothes.querySelector(".clothes-mode").textContent=clothesMode?"TOKO PAKAIAN":"LEMARI PRIBADI";
    clothes.classList.toggle("on",clothesOpen); clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide(); E.touch();
  });
  E.on("clothes_ui_state", function(d){
    if(d && d.state && (!clothesDirty || d.saved)){
      clothesDraft=clothesNormState(clothesParseState(d.state));
      clothesCommitted=clothesClone(clothesDraft);
      clothesDirty=false;
    }
    if(d && typeof d.shop!=="undefined") clothesMode=!!d.shop;
    if(d && typeof d.show!=="undefined") clothesOpen=!!d.show;
    clothes.querySelector(".clothes-mode").textContent=clothesMode?"TOKO PAKAIAN":"LEMARI PRIBADI";
    clothes.classList.toggle("on",clothesOpen); clothesRenderSide(); clothesRenderGrid();
    if(d&&d.saved){clothesCommitted=clothesClone(clothesDraft);clothesDirty=false;clothesShowStatus("Outfit tersimpan dan tersinkron ke player lain.",true);}
    E.touch();
  });
  E.on("clothes_close", function(){
    clothesOpen=false; clothesDirty=false; clothes.classList.remove("on"); E.touch();
  });
  E.on("clothes_open", function(){
    if(!clothesDraft) clothesDraft=clothesDefaultState();
    if(!clothesCommitted) clothesCommitted=clothesClone(clothesDraft);
  });
  clothesDraft=clothesDefaultState(); clothesCommitted=clothesClone(clothesDraft);
  clothesBuildTabs(); clothesRenderGrid(); clothesRenderSide();

  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("widgets");   // v28: modul dimuat sampai selesai
})();
