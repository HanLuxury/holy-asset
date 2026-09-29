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
  function applyLive(){targets.forEach(function(t){var el=document.getElementById(t[0]),p=layout[t[0]];if(!el||!p)return;el.classList.add("hde-positioned-v20");el.style.left=clamp(p.x,0,100)+"%";el.style.top=clamp(p.y,0,100)+"%";el.style.right="auto";el.style.bottom="auto";el.style.margin=0;el.style.transform="none";el.style.visibility=p.enabled===false?"hidden":"visible";});}
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
