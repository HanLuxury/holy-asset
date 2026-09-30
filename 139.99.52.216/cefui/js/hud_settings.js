/* EAGLE HUD EDITOR V20
   Safe editor: does NOT mutate live HUD while editing.
   Uses virtual preview boxes and applies saved layout only on SAVE.
*/
(function(){
  "use strict";
  var E=window.EAGLE, U=window.UI;
  if(!E||!U||!U.h) return;
  var h=U.h;
  var DEFAULT_CFG={style:"compact",speedo:"digital",scale:.65,opacity:.92,accent:"cyan",autoHide:5000,qbScale:1,qbOnly:false};
  var styles=["compact","ring","bars","vertical","minimal","pill","neon","glass","flat","dots","stack","corner"];
  var speedos=["digital","dial","compact","sport","minimal","neon","bar","pill"];
  var targets=[
    ["hud","Status / HP","Health, armor, hunger, thirst, stress"],
    ["hud-info","Info Pemain","ID, cash, bank, job, online"],
    ["speedo","Speedometer","Vehicle speed, fuel, engine"],
    ["hud-loc","Lokasi / Kompas","Direction, zone, server time"],
    ["hud-fps","FPS / Ping","Performance information"],
    ["hud-wm","Watermark","EAGLE / ROLEPLAY branding"],
    ["spectate","Spectate","Admin/player spectate panel"],
    ["eagle-quickbar","Quickbar","Six-slot hotbar"]
  ];
  var root=h("div",{id:"hud-editor-v20",class:"hde20-root"});
  var dim=h("div",{class:"hde20-dim"});
  var preview=h("div",{class:"hde20-preview"});
  var grid=h("div",{class:"hde20-grid"});
  var panel=h("section",{class:"hde20-panel"});
  var head=h("div",{class:"hde20-head"});
  var close=h("button",{class:"hde20-close",type:"button",text:"×"});
  head.append(h("div",{class:"hde20-title"},[h("b",{text:"HUD EDITOR"}),h("small",{text:"Pilih komponen lalu geser kotaknya"})]),close);
  var body=h("div",{class:"hde20-body"});
  var footer=h("div",{class:"hde20-footer"});
  var reset=h("button",{class:"hde20-btn ghost",type:"button",text:"RESET"});
  var save=h("button",{class:"hde20-btn primary",type:"button",text:"SIMPAN"});
  footer.append(reset,save); panel.append(head,body,footer); root.append(dim,grid,preview,panel);
  U.layer("panels").appendChild(root);
  var cfg=Object.assign({},DEFAULT_CFG), playerId=0, active="hud", openState=false;
  function defaults(){return {
    hud:{x:3,y:70,w:16,h:9,enabled:true},
    "hud-info":{x:82,y:13,w:16,h:24,enabled:true},
    speedo:{x:82,y:74,w:15,h:22,enabled:true},
    "hud-loc":{x:35,y:2,w:30,h:6,enabled:true},
    "hud-fps":{x:3,y:2,w:20,h:5,enabled:true},
    "hud-wm":{x:82,y:2,w:16,h:6,enabled:true},
    spectate:{x:35,y:84,w:30,h:8,enabled:true},
    "eagle-quickbar":{x:35,y:88,w:30,h:9,enabled:true}
  };}
  var layout=defaults();
  function key(){return "eagle_hud_editor_v20_"+(playerId||"local");}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function num(v,d){v=parseFloat(v);return isFinite(v)?v:d;}
  function load(){cfg=Object.assign({},DEFAULT_CFG);layout=defaults();try{var x=JSON.parse(localStorage.getItem(key())||"{}");if(x.cfg)Object.keys(cfg).forEach(function(k){if(x.cfg[k]!=null)cfg[k]=x.cfg[k]});if(x.layout)Object.keys(layout).forEach(function(k){if(x.layout[k])layout[k]=Object.assign(layout[k],x.layout[k]);});}catch(_){}applyConfig();applyLive();}
  function persist(){try{localStorage.setItem(key(),JSON.stringify({cfg:cfg,layout:layout}));}catch(_){}applyConfig();}
  function applyConfig(){document.documentElement.dataset.eagleHudStyle=cfg.style;document.documentElement.dataset.eagleSpeedo=cfg.speedo;document.documentElement.dataset.eagleAccent=cfg.accent;document.documentElement.style.setProperty("--eagle-hud-scale",String(num(cfg.scale,.65)));document.documentElement.style.setProperty("--eagle-hud-opacity",String(num(cfg.opacity,.92)));if(window.EAGLEQuickbar){window.EAGLEQuickbar.setAutoHide(+cfg.autoHide||0);window.EAGLEQuickbar.setScale(+cfg.qbScale||1);}}
  /* Posisi live (V24): elemen ditempatkan di dalam kotak editornya.
     Kotak di kanan layar ditambatkan ke tepi kanan, kotak di tengah ditambatkan
     ke titik tengah, lalu dijaga agar tidak keluar layar (dulu info pemain /
     watermark / speedo terpotong di kanan pada HP 18:9 & tablet).
     Quickbar tetap memakai transform bawaannya (animasi sembunyi/peek). */
  function placeLive(id){
    var el=document.getElementById(id),p=layout[id];if(!el||!p)return;
    var s=el.style,vw=window.innerWidth||1,vh=window.innerHeight||1,qb=(id==="eagle-quickbar");
    var x=clamp(num(p.x,0),0,100),y=clamp(num(p.y,0),0,100),w=clamp(num(p.w,12),6,70),bh=clamp(num(p.h,7),3,35);
    var cx=x+w/2,mode=qb||Math.abs(cx-50)<=8?"c":(cx>50?"r":"l");
    el.classList.add("hde-positioned-v20");
    s.margin="0";
    s.visibility=p.enabled===false?"hidden":"";
    if(mode==="c"){s.left=cx+"%";s.right="auto";}
    else if(mode==="r"){s.right=Math.max(0,100-x-w)+"%";s.left="auto";}
    else{s.left=x+"%";s.right="auto";}
    if(qb){s.bottom=Math.max(0,100-y-bh)+"%";s.top="auto";}
    else{s.top=y+"%";s.bottom="auto";s.transform=mode==="c"?"translateX(-50%)":"none";}
    if(ro&&!el.__hdeRO){el.__hdeRO=1;try{ro.observe(el);}catch(_){}}
    // jaga tetap di dalam layar (ukuran elemen berubah mengikuti isi & skala HUD)
    var r=el.getBoundingClientRect();if(!r.width||!r.height)return;
    // WebView lama (sebelum standar CSS zoom) memberi koordinat berbeda untuk
    // elemen ber-zoom: hanya koreksi bila posisi terukur cocok dengan yang dipasang.
    var tol=3+vw*.02,ax=mode==="l"?r.left:mode==="r"?r.right:(r.left+r.right)/2;
    var ex=mode==="l"?parseFloat(s.left)*vw/100:mode==="r"?vw-parseFloat(s.right)*vw/100:parseFloat(s.left)*vw/100;
    if(Math.abs(ax-ex)>tol)return;
    var pad=Math.max(2,vw*.006),dx=0,dy=0;
    if(r.right>vw-pad)dx=(vw-pad)-r.right;if(r.left+dx<pad)dx=pad-r.left;
    if(!qb&&Math.abs(r.top-y*vh/100)<=3+vh*.02){if(r.bottom>vh-pad)dy=(vh-pad)-r.bottom;if(r.top+dy<0)dy=-r.top;}
    if(dx){var dp=dx/vw*100;if(mode==="r")s.right=(parseFloat(s.right)-dp)+"%";else s.left=(parseFloat(s.left)+dp)+"%";}
    if(dy)s.top=(parseFloat(s.top)+dy/vh*100)+"%";
  }
  function applyLive(){targets.forEach(function(t){placeLive(t[0]);});}
  var fitTimer=0;function refit(){clearTimeout(fitTimer);fitTimer=setTimeout(applyLive,80);}
  var ro=window.ResizeObserver?new ResizeObserver(refit):null;
  window.addEventListener("resize",refit);
  window.addEventListener("load",refit);
  function marker(id,label){var b=h("button",{type:"button",class:"hde20-marker",datasetid:id});b.dataset.id=id;b.dataset.touch="";b.innerHTML="<b>"+U.esc(label)+"</b><small>geser</small>";b.onclick=function(e){e.preventDefault();active=id;paint();};return b;}
  function place(b,id){var p=layout[id]||{};b.style.left=num(p.x,0)+"%";b.style.top=num(p.y,0)+"%";b.style.width=clamp(num(p.w,12),6,70)+"%";b.style.height=clamp(num(p.h,7),3,35)+"%";b.classList.toggle("active",id===active);b.style.display=p.enabled===false?"none":"flex";}
  function drag(b,id){var s=null;function down(e){if(e.button!==undefined&&e.button!==0&&e.pointerType!=="touch")return;e.preventDefault();active=id;var p=layout[id],r=preview.getBoundingClientRect();s={sx:e.clientX,sy:e.clientY,ox:p.x,oy:p.y,rw:r.width,rh:r.height};if(b.setPointerCapture)b.setPointerCapture(e.pointerId);paint();}
    function move(e){if(!s)return;e.preventDefault();var p=layout[id];p.x=+clamp(s.ox+(e.clientX-s.sx)/s.rw*100,0,100).toFixed(3);p.y=+clamp(s.oy+(e.clientY-s.sy)/s.rh*100,0,100).toFixed(3);if(Math.abs(p.x-50)<1.2)p.x=50;if(Math.abs(p.y-50)<1.2)p.y=50;place(b,id);paintSelection();}
    function up(){if(s){s=null;}}
    b.addEventListener("pointerdown",down);b.addEventListener("pointermove",move);b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);
  }
  function paintSelection(){preview.querySelectorAll(".hde20-marker").forEach(function(x){x.classList.toggle("active",x.dataset.id===active)});var el=document.getElementById("hde20-selected");var t=targets.find(function(x){return x[0]===active});if(el)el.textContent=t?t[1]:"HUD";}
  function paintMarkers(){preview.innerHTML="";if(!openState)return;targets.forEach(function(t){var b=marker(t[0],t[1]);preview.appendChild(b);place(b,t[0]);drag(b,t[0]);});paintSelection();E.touch();}
  function choice(label,value,arr,fn){var row=h("div",{class:"hde20-choice"});row.appendChild(h("span",{text:label}));var wrap=h("div",{class:"hde20-choices"});arr.forEach(function(v){var t=typeof v==="number"?Math.round(v*100)+"%":String(v).toUpperCase();var b=h("button",{type:"button",text:t,class:String(v)===String(value)?"on":""});b.dataset.touch="";b.onclick=function(){fn(v);};wrap.appendChild(b);});row.appendChild(wrap);return row;}
  function paint(){body.innerHTML="";var c=h("div",{class:"hde20-group"});c.appendChild(h("div",{class:"hde20-label",text:"KOMPONEN"}));targets.forEach(function(t){var b=h("button",{type:"button",class:"hde20-item"+(t[0]===active?" active":"")},[h("b",{text:t[1]}),h("small",{text:t[2]})]);b.dataset.touch="";b.onclick=function(){active=t[0];paint();};c.appendChild(b);});body.appendChild(c);
    var o=h("div",{class:"hde20-group"},[h("div",{class:"hde20-label",text:"TAMPILAN"})]);o.appendChild(choice("HUD",cfg.style,styles,function(v){cfg.style=v;applyConfig();paint();}));o.appendChild(choice("SPEEDO",cfg.speedo,speedos,function(v){cfg.speedo=v;applyConfig();paint();}));o.appendChild(choice("SCALE",cfg.scale,[.55,.6,.65,.7,.8,.9,1,1.1],function(v){cfg.scale=+v;applyConfig();paint();}));o.appendChild(choice("OPACITY",cfg.opacity,[.55,.7,.85,.92,1],function(v){cfg.opacity=+v;applyConfig();paint();}));o.appendChild(choice("ACCENT",cfg.accent,["cyan","blue","purple","green","gold","red","white"],function(v){cfg.accent=v;applyConfig();paint();}));o.appendChild(choice("QUICKBAR",cfg.qbScale,[.8,.9,1,1.1,1.2],function(v){cfg.qbScale=+v;applyConfig();paint();}));body.appendChild(o);
    var s=layout[active]||{};var pbox=h("div",{class:"hde20-selected"},[h("span",{text:"DIPILIH"}),h("b",{id:"hde20-selected",text:(targets.find(function(x){return x[0]===active})||targets[0])[1]}),h("small",{text:"Posisi: "+num(s.x,0).toFixed(1)+"% × "+num(s.y,0).toFixed(1)+"%"})]);body.appendChild(pbox);paintMarkers();
  }
  function open(d){playerId=d&&d.player!=null?+d.player:playerId;load();openState=true;root.classList.add("on");document.documentElement.classList.add("hud-editing-v20");paintMarkers();paint();E.touch();}
  function closeEditor(){openState=false;root.classList.remove("on");document.documentElement.classList.remove("hud-editing-v20");preview.innerHTML="";E.touch();}
  close.onclick=closeEditor;save.onclick=function(){persist();applyLive();closeEditor();};reset.onclick=function(){layout=defaults();cfg=Object.assign({},DEFAULT_CFG);paint();};
  window.addEventListener("resize",function(){if(openState)paintMarkers();});
  window.EAGLEHUDLayout={apply:applyLive,open:open,close:closeEditor,getConfig:function(){return cfg;},getLayout:function(){return layout;}};
  E.on("hudsettings",open);E.on("hud",function(d){if(d&&d.id!=null){playerId=+d.id;load();}});load();
})();
