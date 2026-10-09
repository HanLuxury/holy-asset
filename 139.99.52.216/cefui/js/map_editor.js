/* =====================================================================
   EAGLE ROLEPLAY - In-game Map Editor v50
   FiveM-inspired workflow adapted for SA-MP Android + Streamer.
   ===================================================================== */
(function () {
  "use strict";

  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;

  var layer = U.layer("mapeditorlayer");
  var root = document.createElement("div");
  root.id = "eagle-mapeditor";
  root.className = "emap";
  root.setAttribute("aria-hidden", "true");
  layer.appendChild(root);

  var state = null;
  var tab = "objects";
  var selectedModel = 966;
  var selectedTexture = 0;
  var deleteArmedUntil = 0;
  var query = "";
  var category = "all";

  var GROUPS = {
    infrastructure: [966,968,970,1238,1316,1317,1422,1424,1445,2899,14402,7313,11688,11744],
    furniture: [1271,1835,1997,2103,2253,2332,2425,2453,2659,2662,2663,2702,2714,2912,345,364,3930],
    nature: [657,804,806,1611,1681],
    effects: [18646,18661,18691,18728,18763,18880,19078],
    mapping: [19308,19311,19315,19473,19482,19483,19580,19620,19797,19833,19893,19900,19917,19940],
    vehicle: [1002,1003,1115,1116,1181,1182,1185],
    misc: [1174,2886,3632,18763,19308,19311,19315,19917]
  };

  var LABELS = {
    966:"Barrier base", 968:"Barrier arm", 970:"Fence / railing", 1238:"Traffic cone",
    1422:"Road barrier", 2899:"Road spike", 657:"Nature prop", 804:"Vegetation",
    806:"Vegetation", 1997:"Interior prop", 18646:"Light effect", 18691:"Fire effect",
    19482:"SA-MP mapping prop", 19483:"SA-MP mapping surface", 19797:"SA-MP prop",
    19893:"SA-MP prop", 19940:"SA-MP prop"
  };

  var OBJECTS = [];
  (function () {
    var seen = {};
    for (var cat in GROUPS) if (GROUPS.hasOwnProperty(cat)) {
      for (var i = 0; i < GROUPS[cat].length; i++) {
        var id = GROUPS[cat][i];
        if (seen[id]) continue;
        seen[id] = 1;
        OBJECTS.push({ id:id, cat:cat, name:LABELS[id] || ("Project object #" + id) });
      }
    }
    OBJECTS.sort(function (a,b) { return a.id - b.id; });
  })();

  // Every preset below is taken from SetDynamicObjectMaterial calls already used by this project.
  var TEXTURES = [
    { name:"Solid White", model:10765, txd:"airportgnd_sfse", tex:"white", cat:"clean" },
    { name:"Glass Showcase", model:1649, txd:"wglass", tex:"carshowwin2", cat:"glass" },
    { name:"Soft Grey", model:18646, txd:"matcolours", tex:"grey-93-percent", cat:"color" },
    { name:"Parking Line", model:9514, txd:"711_sfw", tex:"dt_carpark_line_texture", cat:"road" },
    { name:"Metal Pattern", model:16640, txd:"a51", tex:"metpat64", cat:"metal" },
    { name:"Pavement", model:10101, txd:"2notherbuildsfe", tex:"Bow_Abpave_Gen", cat:"road" },
    { name:"Building Surface", model:10101, txd:"2notherbuildsfe", tex:"ferry_build14", cat:"building" },
    { name:"Cabin Panel", model:16093, txd:"a51_ext", tex:"cabin5", cat:"building" },
    { name:"Back Door", model:16093, txd:"a51_ext", tex:"des_backdoor1", cat:"door" },
    { name:"Carwash", model:5397, txd:"barrio1_lae", tex:"carwash_256", cat:"sign" },
    { name:"ATM Face", model:6060, txd:"shops2_law", tex:"atmflat", cat:"sign" }
  ];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>\"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function n(v, d) { v = Number(v); return isFinite(v) ? v : (d || 0); }
  function f(v) { return n(v,0).toFixed(3); }
  function icon(name) { try { return U.icon(name); } catch (_) { return ""; } }
  function send(a, i, s) { E.send("mapedit", a, i == null ? -1 : i, s == null ? "" : s); }

  function categoryLabel(c) {
    var m = {infrastructure:"Infrastructure", furniture:"Furniture", nature:"Nature", effects:"Effects", mapping:"SA-MP Mapping", vehicle:"Vehicle Props", misc:"Misc"};
    return m[c] || "Objects";
  }

  function hideLocal() {
    root.classList.remove("on");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("mapeditor-open");
    E.touch();
  }

  function currentObject() {
    return state && state.object && state.object.valid ? state.object : null;
  }

  function appliedMaterial(slot) {
    var a = state && state.materials || [];
    for (var i=0;i<a.length;i++) if (+a[i].slot === +slot) return a[i];
    return null;
  }

  function renderTabs() {
    return '<div class="emap-tabs" data-touch="1">' +
      '<button class="emap-tab '+(tab==="objects"?"active":"")+'" data-act="tab" data-tab="objects">'+icon("grid")+'<span>Objects</span></button>'+
      '<button class="emap-tab '+(tab==="scene"?"active":"")+'" data-act="tab" data-tab="scene">'+icon("list")+'<span>Scene</span></button>'+
      '<button class="emap-tab '+(tab==="materials"?"active":"")+'" data-act="tab" data-tab="materials">'+icon("gear")+'<span>Textures</span></button>'+
    '</div>';
  }

  function objectCard(o) {
    var active = selectedModel === o.id;
    return '<button class="emap-object '+(active?'active':'')+'" data-touch="1" data-model="'+o.id+'">' +
      '<span class="emap-object-preview"><b>'+o.id+'</b><small>'+esc(o.cat)+'</small></span>'+
      '<span class="emap-object-copy"><strong>'+esc(o.name)+'</strong><small>'+esc(categoryLabel(o.cat))+'</small></span>'+
      '<span class="emap-object-check">'+icon(active?"check":"next")+'</span>'+
    '</button>';
  }

  function renderObjects() {
    var cats = ["all","infrastructure","furniture","nature","effects","mapping","vehicle","misc"];
    var out = '<div class="emap-library-head"><div><b>Object Library</b><small>Catalog object yang sudah dipakai project + custom model ID</small></div></div>';
    out += '<label class="emap-search" data-touch="1">'+icon("search")+'<input id="emap-search" value="'+esc(query)+'" placeholder="Cari nama / model ID"></label>';
    out += '<div class="emap-cats" data-touch="1">';
    for (var c=0;c<cats.length;c++) out += '<button data-cat="'+cats[c]+'" class="'+(category===cats[c]?"active":"")+'">'+(cats[c]==="all"?"All":esc(categoryLabel(cats[c])))+'</button>';
    out += '</div>';
    out += '<div class="emap-object-list">';
    var q = query.toLowerCase().trim(), count=0;
    for (var i=0;i<OBJECTS.length;i++) {
      var o=OBJECTS[i];
      if (category!=="all" && o.cat!==category) continue;
      if (q && (String(o.id).indexOf(q)<0 && o.name.toLowerCase().indexOf(q)<0 && o.cat.indexOf(q)<0)) continue;
      out += objectCard(o); count++;
    }
    if (!count) out += '<div class="emap-empty">Tidak ada preset yang cocok. Kamu tetap bisa memasukkan model ID manual.</div>';
    out += '</div>';
    out += '<div class="emap-custom-model" data-touch="1"><label>Custom model ID<input id="emap-custom-model" type="number" min="1" max="20000" value="'+selectedModel+'"></label>'+
      '<button class="emap-btn primary" data-act="create">'+icon("plus")+' Create object</button></div>';
    return out;
  }

  function renderScene() {
    var list = state && state.nearby || [];
    var out='<div class="emap-library-head"><div><b>Nearby Scene</b><small>Object database dalam radius 120 meter</small></div><button class="emap-iconbtn" data-touch="1" data-act="refresh">'+icon("refresh")+'</button></div>';
    out += '<div class="emap-scene-list">';
    if (!list.length) out += '<div class="emap-empty">Tidak ada object mapping database di sekitar pemain.</div>';
    for (var i=0;i<list.length;i++) {
      var it=list[i], active=state.selected===+it.id;
      out += '<button class="emap-scene-row '+(active?'active':'')+'" data-touch="1" data-obj="'+(+it.id)+'">'+
        '<span class="emap-scene-id">#'+(+it.id)+'</span><span><b>Model '+(+it.model)+'</b><small>'+n(it.d,0).toFixed(1)+' m · '+n(it.x,0).toFixed(1)+', '+n(it.y,0).toFixed(1)+', '+n(it.z,0).toFixed(1)+'</small></span>'+icon(active?"check":"next")+'</button>';
    }
    out += '</div>';
    return out;
  }

  function textureCard(t, idx) {
    var active=selectedTexture===idx;
    return '<button class="emap-texture '+(active?'active':'')+'" data-touch="1" data-texture="'+idx+'">'+
      '<span class="emap-texture-chip '+esc(t.cat)+'"></span><span><strong>'+esc(t.name)+'</strong><small>'+esc(t.txd)+' / '+esc(t.tex)+'</small><em>src '+t.model+'</em></span>'+icon(active?"check":"next")+'</button>';
  }

  function renderMaterials() {
    var obj=currentObject();
    var out='<div class="emap-library-head"><div><b>Texture Library</b><small>Preset material yang sudah terbukti dipakai source project</small></div></div>';
    out += '<div class="emap-texture-list">';
    for (var i=0;i<TEXTURES.length;i++) out += textureCard(TEXTURES[i],i);
    out += '</div>';
    out += '<div class="emap-material-form" data-touch="1">'+
      '<label>Slot<input id="emap-mat-slot" type="number" min="0" max="15" value="0"></label>'+
      '<label>Tint<input id="emap-mat-color" type="color" value="#ffffff"></label>'+
      '<button class="emap-btn primary" data-act="applymat" '+(!obj?'disabled':'')+'>'+icon("ok")+' Apply texture</button>'+
      '<button class="emap-btn ghost" data-act="clearmat" '+(!obj?'disabled':'')+'>'+icon("x")+' Reset slot</button>'+
    '</div>';
    if (obj) {
      var mats=state.materials||[];
      out += '<div class="emap-applied"><b>Applied material slots</b>';
      if (!mats.length) out += '<small>Belum ada material custom pada object ini.</small>';
      for (var m=0;m<mats.length;m++) out += '<span>Slot '+(+mats[m].slot)+' · '+esc(mats[m].txd)+'/'+esc(mats[m].tex)+'</span>';
      out += '</div>';
    }
    return out;
  }

  function transformField(key, label, value, rotate) {
    return '<div class="emap-transform-row" data-touch="1"><span>'+label+'</span><button data-nudge="'+key+'" data-dir="-1">−</button><input data-transform="'+key+'" type="number" step="0.001" value="'+f(value)+'"><button data-nudge="'+key+'" data-dir="1">+</button><small>'+(rotate?'deg':'pos')+'</small></div>';
  }

  function renderInspector() {
    var o=currentObject();
    if (!o) return '<aside class="emap-inspector" data-touch="1"><div class="emap-no-selection">'+icon("target")+'<b>No object selected</b><span>Pilih object dari library untuk membuat mapping baru, atau pilih object existing dari tab Scene.</span></div></aside>';

    var model=+o.model;
    var out='<aside class="emap-inspector" data-touch="1">'+
      '<div class="emap-inspector-top"><div><small>SELECTED OBJECT</small><b>#'+(+o.id)+' <em>Model '+model+'</em></b></div><button class="emap-iconbtn" data-act="goto" title="Teleport ke object">'+icon("pin")+'</button></div>'+
      '<div class="emap-model-swap"><label>Model ID<input id="emap-swap-model" type="number" min="1" max="20000" value="'+model+'"></label><button class="emap-btn ghost" data-act="swap">Replace</button></div>'+
      '<div class="emap-section-title"><span>Transform</span><label>Step<select id="emap-step"><option>0.05</option><option>0.1</option><option selected>0.25</option><option>0.5</option><option>1</option><option>5</option></select></label></div>'+
      transformField("x","X",o.x,false)+transformField("y","Y",o.y,false)+transformField("z","Z",o.z,false)+
      '<div class="emap-divider"></div>'+transformField("rx","RX",o.rx,true)+transformField("ry","RY",o.ry,true)+transformField("rz","RZ",o.rz,true)+
      '<div class="emap-world-meta"><span>World <b>'+ (+o.vw) +'</b></span><span>Interior <b>'+ (+o.int) +'</b></span><span class="'+(o.dirty?'dirty':'saved')+'">'+(o.dirty?'Unsaved':'Saved')+'</span></div>'+
      '<div class="emap-tools">'+
        '<button class="emap-btn primary" data-act="save">'+icon("ok")+' Save</button>'+
        '<button class="emap-btn ghost" data-act="native">'+icon("anim")+' Gizmo</button>'+
        '<button class="emap-btn ghost" data-act="clone">'+icon("box")+' Duplicate</button>'+
      '</div>'+
      '<button class="emap-btn danger wide" data-act="delete">'+icon("trash")+' Delete object</button>'+
    '</aside>';
    return out;
  }

  function render() {
    if (!state || !state.show) { hideLocal(); return; }

    root.innerHTML = '<div class="emap-vignette"></div><div class="emap-crosshair"><i></i><i></i></div>'+
      '<header class="emap-topbar" data-touch="1"><div class="emap-brand"><span>'+icon("grid")+'</span><div><small>EAGLE TOOLING</small><b>MAP EDITOR</b></div></div>'+
      '<div class="emap-status"><span>'+state.total+' objects</span><span>VW '+state.world+'</span><span>INT '+state.interior+'</span></div>'+
      '<div class="emap-top-actions"><button class="emap-iconbtn" data-act="refresh">'+icon("refresh")+'</button><button class="emap-close" data-act="close">'+icon("x")+'</button></div></header>'+
      '<section class="emap-left" data-touch="1">'+renderTabs()+'<div class="emap-library">'+(tab==="objects"?renderObjects():(tab==="scene"?renderScene():renderMaterials()))+'</div></section>'+
      renderInspector() +
      '<div class="emap-hint"><b>Touch workflow</b><span>Panel kiri = library · Panel kanan = transform · area tengah tetap transparan untuk melihat world.</span></div>';

    root.setAttribute("aria-hidden","false");
    document.body.classList.add("mapeditor-open");
    bind();
    requestAnimationFrame(function(){ root.classList.add("on"); E.touch(); });
  }

  function readTransform() {
    var keys=["x","y","z","rx","ry","rz"], vals=[];
    for (var i=0;i<keys.length;i++) {
      var el=root.querySelector('[data-transform="'+keys[i]+'"]');
      vals.push(f(el ? el.value : 0));
    }
    return vals.join("|");
  }

  function commitTransform() { send("transform",-1,readTransform()); }

  function bind() {
    var buttons=root.querySelectorAll("[data-act]");
    for (var i=0;i<buttons.length;i++) buttons[i].addEventListener("click",function(){
      var a=this.getAttribute("data-act");
      if (a==="tab") { tab=this.getAttribute("data-tab")||"objects"; render(); return; }
      if (a==="close") { send("close"); hideLocal(); return; }
      if (a==="refresh") { send("refresh"); return; }
      if (a==="create") {
        var c=document.getElementById("emap-custom-model"), id=c?parseInt(c.value,10):selectedModel;
        if (!id || id<1 || id>20000) return;
        selectedModel=id; send("create",id); return;
      }
      if (a==="save") { send("save"); return; }
      if (a==="clone") { send("clone"); return; }
      if (a==="goto") { send("goto"); return; }
      if (a==="native") { send("native"); hideLocal(); return; }
      if (a==="swap") {
        var sw=document.getElementById("emap-swap-model"), sm=sw?parseInt(sw.value,10):0;
        if (sm>0 && sm<=20000) { selectedModel=sm; send("swap",sm); }
        return;
      }
      if (a==="delete") {
        var now=Date.now();
        if (now>deleteArmedUntil) { deleteArmedUntil=now+3000; this.classList.add("armed"); this.innerHTML=icon("trash")+' Tap again to confirm'; return; }
        deleteArmedUntil=0; send("delete"); return;
      }
      if (a==="applymat") {
        var sl=document.getElementById("emap-mat-slot"), co=document.getElementById("emap-mat-color");
        var slot=sl?Math.max(0,Math.min(15,parseInt(sl.value,10)||0)):0;
        var t=TEXTURES[selectedTexture]||TEXTURES[0];
        var rgb=parseInt(String(co&&co.value||"#ffffff").replace("#",""),16)||0xffffff;
        var color=(0xff000000|rgb)|0;
        send("material",slot,[t.model,t.txd,t.tex,color].join("|")); return;
      }
      if (a==="clearmat") {
        var s=document.getElementById("emap-mat-slot"), slot2=s?Math.max(0,Math.min(15,parseInt(s.value,10)||0)):0;
        send("materialclear",slot2); return;
      }
    });

    var oc=root.querySelectorAll("[data-model]");
    for (var j=0;j<oc.length;j++) oc[j].addEventListener("click",function(){ selectedModel=+this.getAttribute("data-model"); render(); });

    var sc=root.querySelectorAll("[data-obj]");
    for (var k=0;k<sc.length;k++) sc[k].addEventListener("click",function(){ send("select",+this.getAttribute("data-obj")); });

    var tx=root.querySelectorAll("[data-texture]");
    for (var t=0;t<tx.length;t++) tx[t].addEventListener("click",function(){ selectedTexture=+this.getAttribute("data-texture"); render(); });

    var cats=root.querySelectorAll("[data-cat]");
    for (var c=0;c<cats.length;c++) cats[c].addEventListener("click",function(){ category=this.getAttribute("data-cat")||"all"; render(); });

    var search=document.getElementById("emap-search");
    if (search) search.addEventListener("input",function(){ query=this.value||""; var pos=this.selectionStart; render(); var n=document.getElementById("emap-search"); if(n){n.focus(); try{n.setSelectionRange(pos,pos);}catch(_){}} });

    var tf=root.querySelectorAll("[data-transform]");
    for (var x=0;x<tf.length;x++) tf[x].addEventListener("change",commitTransform);

    var nudges=root.querySelectorAll("[data-nudge]");
    for (var y=0;y<nudges.length;y++) nudges[y].addEventListener("click",function(){
      var key=this.getAttribute("data-nudge"), dir=+this.getAttribute("data-dir")||1;
      var input=root.querySelector('[data-transform="'+key+'"]'), step=document.getElementById("emap-step");
      if (!input) return;
      var amount=n(step&&step.value,0.25); input.value=f(n(input.value,0)+(amount*dir)); commitTransform();
    });
  }

  E.on("mapeditor", function (d) {
    state=d||{};
    if (+state.show !== 1) { state=null; hideLocal(); return; }
    state.show=1;
    state.selected=+state.selected;
    state.total=+state.total||0;
    state.world=+state.world||0;
    state.interior=+state.interior||0;
    if (state.object && state.object.valid) {
      state.object.id=+state.object.id; state.object.model=+state.object.model;
      selectedModel=state.object.model || selectedModel;
    }
    render();
  });

  E.done("map_editor");
})();
