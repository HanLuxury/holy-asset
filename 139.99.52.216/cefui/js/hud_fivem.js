/* =====================================================================
   EAGLE ROLEPLAY - FiveM HUD / Layout Studio v2
   - 24 HUD styles
   - 8 speedometer styles
   - draggable per-element layout editor
   - local persistence in CEF
   - no server/database required for visual preferences
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  if (!E || !U || !h) return;

  var KEY = "eagle_hud_prefs_v10";
  var serverSaveTimer = 0;
  var D = {
    hudStyle: 4, speedoStyle: 2, accent: "cyan", scale: 65, opacity: 90,
    panelStyle: "glass", glow: true, radius: "soft",
    showHud: true, showStatus: true, showPlayerInfo: true, showLocation: true,
    showWatermark: true, showFps: false, showWeapon: true, showHotbar: true,
    showSpeedo: true, showVehicleInfo: true, showNotif: true, showItemBox: true,
    showSeatbelt: true, showClock: true, showVoice: true, speedUnit: "KM/H",
    notifyPos: "right", quickbarAutoHide: 5000,
    layout: {
      status:    { x: 2.0,  y: 72.0, scale: 100 },
      info:      { x: 63.0, y: 7.0,  scale: 100 },
      speedo:    { x: 72.0, y: 72.0, scale: 100 },
      location:  { x: 42.0, y: 2.2,  scale: 100 },
      fps:       { x: 2.0,  y: 2.0,  scale: 100 },
      watermark: { x: 83.0, y: 2.0,  scale: 100 },
      weapon:    { x: 79.0, y: 14.0, scale: 100 },
      hotbar:    { x: 31.0, y: 86.0, scale: 100 },
      notify:    { x: 79.0, y: 17.0, scale: 100 },
      itembox:   { x: 2.0,  y: 18.0, scale: 100 }
    }
  };
  var PRESETS = {
    "FiveM": {
      status:{x:2,y:72}, info:{x:62,y:7}, speedo:{x:72,y:72}, location:{x:42,y:2.2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:79,y:14}, hotbar:{x:31,y:86}, notify:{x:79,y:17}, itembox:{x:2,y:18}
    },
    "Bottom": {
      status:{x:2,y:78}, info:{x:54,y:78}, speedo:{x:72,y:78}, location:{x:40,y:2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:79,y:16}, hotbar:{x:31,y:91}, notify:{x:79,y:25}, itembox:{x:2,y:25}
    },
    "Top": {
      status:{x:2,y:7}, info:{x:54,y:7}, speedo:{x:72,y:71}, location:{x:40,y:2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:79,y:14}, hotbar:{x:31,y:86}, notify:{x:79,y:17}, itembox:{x:2,y:18}
    },
    "Left": {
      status:{x:2,y:58}, info:{x:2,y:7}, speedo:{x:74,y:72}, location:{x:42,y:2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:2,y:31}, hotbar:{x:31,y:86}, notify:{x:2,y:24}, itembox:{x:2,y:38}
    },
    "Right": {
      status:{x:82,y:60}, info:{x:62,y:7}, speedo:{x:70,y:72}, location:{x:42,y:2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:79,y:16}, hotbar:{x:31,y:86}, notify:{x:79,y:24}, itembox:{x:79,y:40}
    },
    "Minimal": {
      status:{x:2,y:82}, info:{x:76,y:7}, speedo:{x:78,y:82}, location:{x:43,y:2}, fps:{x:2,y:2}, watermark:{x:87,y:2}, weapon:{x:82,y:19}, hotbar:{x:39,y:92}, notify:{x:82,y:25}, itembox:{x:2,y:27}
    },
    "Mobile": {
      status:{x:2,y:76}, info:{x:61,y:7}, speedo:{x:76,y:80}, location:{x:36,y:2}, fps:{x:2,y:2}, watermark:{x:82,y:2}, weapon:{x:79,y:15}, hotbar:{x:29,y:89}, notify:{x:78,y:25}, itembox:{x:2,y:25}
    },
    "Racing": {
      status:{x:2,y:84}, info:{x:60,y:4}, speedo:{x:72,y:76}, location:{x:40,y:1.5}, fps:{x:2,y:1.5}, watermark:{x:84,y:1.5}, weapon:{x:79,y:12}, hotbar:{x:29,y:91}, notify:{x:80,y:21}, itembox:{x:2,y:21}
    },
    "Cinema": {
      status:{x:2,y:88}, info:{x:64,y:4}, speedo:{x:77,y:84}, location:{x:38,y:1.2}, fps:{x:2,y:1.2}, watermark:{x:86,y:1.2}, weapon:{x:82,y:11}, hotbar:{x:33,y:92}, notify:{x:81,y:20}, itembox:{x:2,y:22}
    },
    "Compact": {
      status:{x:2,y:79}, info:{x:70,y:5}, speedo:{x:77,y:80}, location:{x:42,y:2}, fps:{x:2,y:2}, watermark:{x:88,y:2}, weapon:{x:84,y:13}, hotbar:{x:35,y:92}, notify:{x:84,y:24}, itembox:{x:2,y:25}
    },
    "SafeArea": {
      status:{x:4,y:75}, info:{x:63,y:8}, speedo:{x:71,y:74}, location:{x:44,y:4}, fps:{x:4,y:4}, watermark:{x:82,y:4}, weapon:{x:77,y:16}, hotbar:{x:32,y:88}, notify:{x:77,y:20}, itembox:{x:4,y:21}
    },
    "TopRight": {
      status:{x:67,y:8}, info:{x:78,y:18}, speedo:{x:73,y:70}, location:{x:42,y:2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:80,y:29}, hotbar:{x:31,y:86}, notify:{x:78,y:33}, itembox:{x:2,y:18}
    },
    "BottomLeft": {
      status:{x:2,y:77}, info:{x:2,y:66}, speedo:{x:72,y:80}, location:{x:42,y:2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:79,y:14}, hotbar:{x:31,y:91}, notify:{x:2,y:28}, itembox:{x:2,y:38}
    },
    "Center": {
      status:{x:39,y:77}, info:{x:63,y:7}, speedo:{x:70,y:77}, location:{x:42,y:2}, fps:{x:2,y:2}, watermark:{x:83,y:2}, weapon:{x:79,y:14}, hotbar:{x:31,y:91}, notify:{x:42,y:16}, itembox:{x:2,y:22}
    }
  };
  var LABELS = {status:"Status",info:"Player Info",speedo:"Speedometer",location:"Compass / Location",fps:"FPS / Ping",watermark:"Watermark",weapon:"Weapon / Ammo",hotbar:"Quickbar",notify:"Notifications",itembox:"Item Box"};
  var H = {}, S = {};
  var hudEl = document.getElementById("hud"), infoEl = document.getElementById("hud-info"), speedEl = document.getElementById("speedo");
  var locEl = document.getElementById("hud-loc"), fpsEl = document.getElementById("hud-fps"), wmEl = document.getElementById("hud-wm");
  var notifEl = document.getElementById("notify"), itemEl = document.getElementById("itembox");
  var weapon = document.getElementById("hud-weapon");
  var editor = null, editorRaf = 0, drag = null, selected = "status";

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function loadPrefs() {
    var p = clone(D);
    try {
      var rawKey = KEY, raw = null;
      try {
        var candidates = [KEY,"eagle_hud_prefs_v9","eagle_hud_prefs_v8","eagle_hud_prefs_v7","eagle_hud_prefs_v6","eagle_hud_prefs_v5","eagle_hud_prefs_v3"];
        for (var ri=0; ri<candidates.length && !raw; ri++) {
          var rv = localStorage.getItem(candidates[ri]);
          if (rv) { raw = JSON.parse(rv); rawKey = candidates[ri]; }
        }
      } catch(e) { raw = null; }
      if (raw && typeof raw === "object") {
        Object.keys(raw).forEach(function (k) { if (k !== "layout" && k !== "__compactMigrationV9") p[k] = raw[k]; });
        if (raw.layout && typeof raw.layout === "object") Object.keys(p.layout).forEach(function (k) {
          if (raw.layout[k]) p.layout[k] = Object.assign({}, p.layout[k], raw.layout[k]);
        });
        if (rawKey !== KEY && !raw.__compactMigrationV9 && +raw.scale === 100) {
          p.scale = 65;
          p.__compactMigrationV9 = true;
        }
      }
    } catch (e) {}
    return p;
  }
  var P = loadPrefs();
  function queueServerSave(){
    if(serverSaveTimer) clearTimeout(serverSaveTimer);
    serverSaveTimer=setTimeout(function(){
      serverSaveTimer=0;
      try { if(E && E.send) E.send("hud", "save", 0, JSON.stringify(P)); } catch(e) {}
    }, 850);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {}
    queueServerSave();
    apply(); renderHud(); renderWeapon(); renderSpeedo(); renderSettings();
    applyLayout();
    if (editor && editor.classList.contains("on")) renderEditor();
  }

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function apply() {
    document.body.dataset.accent = P.accent || "cyan";
    document.body.dataset.panel = P.panelStyle || "glass";
    document.body.dataset.radius = P.radius || "soft";
    document.body.classList.toggle("hud-glow-off", !P.glow);
    document.body.classList.toggle("hud-off", !P.showHud);
    document.body.classList.toggle("hud-no-status", !P.showStatus);
    document.body.classList.toggle("hud-no-info", !P.showPlayerInfo);
    document.body.classList.toggle("hud-no-location", !P.showLocation);
    document.body.classList.toggle("hud-no-watermark", !P.showWatermark);
    document.body.classList.toggle("hud-no-fps", !P.showFps);
    document.body.classList.toggle("hud-no-hotbar", !P.showHotbar);
    document.body.classList.toggle("hud-no-speedo", !P.showSpeedo);
    document.body.classList.toggle("hud-no-vehicle-info", !P.showVehicleInfo);
    document.body.classList.toggle("hud-no-notify", !P.showNotif);
    document.body.classList.toggle("hud-no-itembox", !P.showItemBox);
    document.body.classList.toggle("hud-no-seatbelt", !P.showSeatbelt);
    document.body.classList.toggle("hud-no-clock", !P.showClock);
    document.body.classList.toggle("hud-no-voice", !P.showVoice);
    document.body.classList.toggle("hud-notify-left", P.notifyPos === "left");
    document.body.classList.toggle("hud-notify-right", P.notifyPos === "right");
    document.body.classList.toggle("hud-notify-bottom", P.notifyPos === "bottom");
    [70,80,90,100].forEach(function(x){document.body.classList.remove("hud-op-"+x);});
    document.body.classList.add("hud-op-" + ([70,80,100].indexOf(+P.opacity)>=0 ? +P.opacity : 90));
    P.scale=clamp(+P.scale||65,50,130);
    document.documentElement.style.setProperty("--hud-global-scale", String(P.scale/100));
  }
  function ring(v) {
    var r=15,c=2*Math.PI*r,off=c*(1-clamp(v,0,100)/100);
    return '<svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="15" class="rbg"/><circle cx="18" cy="18" r="15" class="rfg" stroke-dasharray="'+c.toFixed(2)+'" stroke-dashoffset="'+off.toFixed(2)+'"/></svg>';
  }
  var stats=[
    ["hp","heart","hp","Darah"],["ar","shield","ar","Armor"],["hg","food","hg","Lapar"],["th","drink","th","Haus"],["st","brain","st","Stres"]
  ];
  var weaponNames={22:"Colt 45",23:"Silenced",24:"Desert Eagle",25:"Shotgun",26:"Sawed-Off",27:"Combat SG",28:"Uzi",29:"MP5",30:"AK-47",31:"M4",32:"Tec-9",33:"Rifle",34:"Sniper",35:"RPG",38:"Minigun",41:"Spray",43:"Camera",46:"Parachute"};
  var styleNames={1:"Ring",2:"Bars",3:"Vertical",4:"QBCore",5:"Minimal",6:"Orbit",7:"Strip",8:"Tactical",9:"Neon",10:"Corner",11:"Dock",12:"RPG",13:"Pill",14:"Stack",15:"Micro",16:"Glass",17:"Line",18:"Rail",19:"Nano",20:"Grid",21:"GlassBar",22:"Soft",23:"Edge",24:"Tiny"};
  var speedNames={1:"Dial",2:"Digital",3:"Sport",4:"Compact",5:"Cyber",6:"Vertical",7:"Bar",8:"Classic"};

  function statHtml(mode,s,v,low){
    var k=s[0], ic=s[1], c=s[2], label=s[3], cls=c+(low?" low":"");
    if(mode===1) return '<div class="hc '+cls+'">'+ring(v)+'<span class="hc-ic">'+U.icon(ic)+'</span></div>';
    if(mode===2) return '<div class="hb '+cls+'"><span class="hb-ic">'+U.icon(ic)+'</span><div class="hb-main"><small>'+label+'</small><div class="hb-bar"><i style="width:'+v+'%"></i></div></div><b>'+v+'</b></div>';
    if(mode===3) return '<div class="hv '+cls+'"><div class="hv-bar"><i style="height:'+v+'%"></i></div><span class="hv-ic">'+U.icon(ic)+'</span><b>'+v+'</b></div>';
    if(mode===4) return '<div class="hq '+cls+'"><span class="hq-ic">'+U.icon(ic)+'</span><span class="hq-line"><b>'+v+'</b><i style="width:'+v+'%"></i></span></div>';
    if(mode===5) return '<div class="hm '+cls+'"><span class="hm-ic">'+U.icon(ic)+'</span><div class="hm-body"><span>'+label+'</span><b>'+v+'%</b><i style="width:'+v+'%"></i></div></div>';
    if(mode===6) return '<div class="ho '+cls+'"><div class="ho-ring">'+ring(v)+'</div><div><b>'+v+'</b><small>'+label+'</small></div></div>';
    if(mode===7) return '<div class="ht '+cls+'"><span>'+U.icon(ic)+'</span><div><b>'+label+'</b><i><em style="width:'+v+'%"></em></i></div><strong>'+v+'</strong></div>';
    if(mode===8) return '<div class="hx '+cls+'"><span>'+U.icon(ic)+'</span><div><small>'+label+'</small><b>'+v+'%</b></div><i style="width:'+v+'%"></i></div>';
    if(mode===9) return '<div class="hn '+cls+'"><span>'+U.icon(ic)+'</span><b>'+v+'</b><small>'+label+'</small><i style="width:'+v+'%"></i></div>';
    if(mode===10) return '<div class="hk '+cls+'"><span>'+U.icon(ic)+'</span><b>'+v+'</b><small>'+label+'</small></div>';
    if(mode===11) return '<div class="hd '+cls+'"><span>'+U.icon(ic)+'</span><div><b>'+v+'</b><i style="width:'+v+'%"></i></div></div>';
    if(mode===12) return '<div class="hr '+cls+'"><div class="hr-top"><span>'+U.icon(ic)+'</span><b>'+label+'</b><strong>'+v+'</strong></div><i><em style="width:'+v+'%"></em></i></div>';
    if(mode===13) return '<div class="hp13 '+cls+'"><span>'+U.icon(ic)+'</span><div><b>'+v+'</b><small>'+label+'</small></div><i><em style="width:'+v+'%"></em></i></div>';
    if(mode===14) return '<div class="hp14 '+cls+'"><span class="p14i">'+U.icon(ic)+'</span><div class="p14main"><b>'+label+'</b><i><em style="width:'+v+'%"></em></i></div><strong>'+v+'</strong></div>';
    if(mode===15) return '<div class="hp15 '+cls+'"><span>'+U.icon(ic)+'</span><b>'+v+'</b><small>'+label+'</small></div>';
    if(mode===16) return '<div class="hp16 '+cls+'"><div class="p16top"><span>'+U.icon(ic)+'</span><b>'+label+'</b><strong>'+v+'%</strong></div><i><em style="width:'+v+'%"></em></i></div>';
    if(mode===17) return '<div class="hp17 '+cls+'"><span>'+U.icon(ic)+'</span><b>'+label+'</b><strong>'+v+'</strong></div>';
    if(mode===18) return '<div class="hp18 '+cls+'"><span>'+U.icon(ic)+'</span><div><b>'+v+'</b><small>'+label+'</small></div></div>';
    if(mode===19) return '<div class="hp19 '+cls+'"><span>'+U.icon(ic)+'</span><b>'+v+'</b><i style="width:'+v+'%"></i></div>';
    if(mode===20) return '<div class="hp20 '+cls+'"><span>'+U.icon(ic)+'</span><div><b>'+label+'</b><i><em style="width:'+v+'%"></em></i></div><strong>'+v+'</strong></div>';
    if(mode===21) return '<div class="hp21 '+cls+'"><span>'+U.icon(ic)+'</span><div class="p21m"><small>'+label+'</small><i><em style="width:'+v+'%"></em></i></div><b>'+v+'%</b></div>';
    if(mode===22) return '<div class="hp22 '+cls+'"><span>'+U.icon(ic)+'</span><div><b>'+label+'</b><strong>'+v+'</strong><i><em style="width:'+v+'%"></em></i></div></div>';
    if(mode===23) return '<div class="hp23 '+cls+'"><span>'+U.icon(ic)+'</span><div><b>'+v+'</b><small>'+label+'</small></div><i style="width:'+v+'%"></i></div>';
    return '<div class="hp24 '+cls+'"><b>'+v+'</b><i><em style="width:'+v+'%"></em></i></div>';
  }
  function renderHud() {
    if(!hudEl)return;
    var show=!!H.show&&P.showHud&&P.showStatus, mode=clamp(+P.hudStyle||4,1,24);
    hudEl.className="hud mode-"+mode+(show?" on":"");
    if(!show){hudEl.innerHTML=""; if(infoEl)infoEl.className="hud-info glass"; return;}
    var out="";
    stats.forEach(function(s){var v=Math.round(+H[s[0]]||0);if(s[0]==="ar"&&v<=0&&mode!==3&&mode!==5&&mode!==8&&mode!==12&&mode!==13&&mode!==14&&mode!==16&&mode!==18&&mode!==19&&mode!==20&&mode!==21&&mode!==22&&mode!==23&&mode!==24)return;out+=statHtml(mode,s,v,s[0]==="st"?v>=70:v<=25);});
    if(P.showVoice){var vm=clamp(+H.vm||2,1,3);out+='<div class="hud-voice v'+vm+'">'+U.icon("mic")+'<i class="on"></i><i class="'+(vm>=2?'on':'')+'"></i><i class="'+(vm>=3?'on':'')+'"></i></div>';}
    hudEl.innerHTML=out;
    if(infoEl){var inf=!!H.info&&P.showPlayerInfo;infoEl.className="hud-info glass"+(inf?" on":"");if(inf)infoEl.innerHTML='<div class="hi-row"><span class="hi-ic">'+U.icon("id")+'</span><div><small>ID</small><b>#'+U.esc(H.id==null?"-":H.id)+'</b></div></div><div class="hi-row"><span class="hi-ic c-cash">'+U.icon("cash")+'</span><div><small>Cash</small><b>'+U.money(H.cash)+'</b></div></div><div class="hi-row"><span class="hi-ic c-bank">'+U.icon("bank")+'</span><div><small>Bank</small><b>'+U.money(H.bank)+'</b></div></div><div class="hi-row"><span class="hi-ic">'+U.icon("user")+'</span><div><small>'+U.esc(H.fac||"Civilian")+'</small><b>'+U.esc(H.job||"-")+'</b></div></div><div class="hi-row"><span class="hi-ic">'+U.icon("users")+'</span><div><small>Pemain</small><b>'+U.esc((H.on||0)+" Online")+'</b></div></div>';}    
  }
  E.on("hudconfig",function(d){
    if(!d || !d.prefs) return;
    try {
      var remote=typeof d.prefs === "string" ? JSON.parse(d.prefs) : d.prefs;
      if(remote && typeof remote === "object") {
        Object.keys(remote).forEach(function(k){ if(k!=="layout" && k!=="__compactMigrationV9") P[k]=remote[k]; });
        if(remote.layout && typeof remote.layout === "object") Object.keys(P.layout).forEach(function(k){ if(remote.layout[k]) P.layout[k]=Object.assign({},P.layout[k],remote.layout[k]); });
        try { localStorage.setItem(KEY, JSON.stringify(P)); } catch(e) {}
        apply(); renderHud(); renderWeapon(); renderSpeedo(); renderSettings(); applyLayout();
      }
    } catch(e) {}
  });

  E.on("hud",function(d){for(var k in d)H[k]=d[k];renderHud();renderWeapon();applyLayout();});

  function renderWeapon(){
    if(!weapon)return;
    var on=P.showWeapon&&P.showHud&&H.show&&+H.weapon>0;
    weapon.className="hud-weapon"+(on?" on":"");
    weapon.innerHTML=on?'<div class="hw-icon">'+U.icon("sword")+'</div><div class="hw-body"><small>'+U.esc(weaponNames[+H.weapon]||("Weapon "+(+H.weapon||0)))+'</small><b>'+Math.max(0,+H.ammo||0)+'</b></div>':'';
  }
  E.on("fps",function(d){if(!fpsEl)return;fpsEl.className="hud-fps"+(P.showFps&&P.showHud?" on":"");if(P.showFps&&P.showHud)fpsEl.innerHTML="FPS <b>"+Math.max(0,+d.fps||0)+"</b> · Ping <b>"+Math.max(0,+d.ping||0)+"</b> · PL <b>"+U.esc(d.pl||"0.00%")+"</b>";applyLayout();});

  function flagHtml(S){var belt=!!S.belt;return '<span class="sf '+(S.eng?'on':'')+'">'+U.icon("power")+'</span><span class="sf '+(S.lig?'on':'')+'">'+U.icon("light")+'</span><span class="sf '+(S.lock?'on red':'')+'">'+U.icon(S.lock?'lock':'unlock')+'</span><span class="belt '+(belt?'safe':'danger')+'">'+U.icon("shield")+'</span>';}
  function renderSpeedo(){
    if(!speedEl)return;var on=!!S.show&&P.showHud&&P.showSpeedo,style=clamp(+P.speedoStyle||2,1,8);speedEl.className="speedo speedo-"+style+(on?" on":"");if(!on){speedEl.innerHTML="";return;}
    var kmh=Math.max(0,Math.round(+S.kmh||0)), v=P.speedUnit==="MPH"?Math.round(kmh*.621371):kmh, fuel=clamp(+S.fuel||0,0,100),hp=clamp(+S.hp||0,0,100),gear=U.esc(S.gear||"N"),name=U.esc(S.name||"Vehicle"),plate=U.esc(S.plate||"-");
    var flags=flagHtml(S);
    if(style===1){var a=2*Math.PI*42*.75,o=a*(1-Math.min(1,kmh/260));speedEl.innerHTML='<svg viewBox="0 0 100 100" class="sp-dial"><circle cx="50" cy="50" r="42" class="sp-bg" stroke-dasharray="'+a.toFixed(1)+' 999"/><circle cx="50" cy="50" r="42" class="sp-fg" stroke-dasharray="'+a.toFixed(1)+' 999" stroke-dashoffset="'+o.toFixed(1)+'"/></svg><div class="sp-num"><b>'+v+'</b><small>'+P.speedUnit+'</small><span class="sp-gear">'+gear+'</span></div><div class="sp-bars"><div class="sp-line f"><span>'+U.icon("fuel")+'</span><div class="bar"><i style="width:'+fuel+'%"></i></div><b>'+Math.round(fuel)+'%</b></div><div class="sp-line e"><span>'+U.icon("engine")+'</span><div class="bar"><i style="width:'+hp+'%"></i></div><b>'+Math.round(hp)+'%</b></div></div><div class="sp-flags">'+flags+'</div>';
    } else if(style===2){speedEl.innerHTML='<div class="sd-head"><span class="sd-car">'+U.icon("car")+'</span><div><b>'+name+'</b><small>ID '+(+S.vehid||0)+' · '+plate+'</small></div><span class="sd-gear">'+gear+'</span></div><div class="sd-speed"><b>'+v+'</b><span>'+P.speedUnit+'</span></div><div class="sd-bars"><div><span>'+U.icon("fuel")+' FUEL</span><i><em style="width:'+fuel+'%"></em></i><b>'+Math.round(fuel)+'%</b></div><div><span>'+U.icon("engine")+' HEALTH</span><i><em style="width:'+hp+'%"></em></i><b>'+Math.round(hp)+'%</b></div></div><div class="sd-foot">'+flags+(P.showSeatbelt?'':'')+'</div>';
    } else if(style===3){var arc=236,off=arc*(1-Math.min(1,kmh/260));speedEl.innerHTML='<div class="ss-name"><b>'+name+'</b><small>'+plate+'</small></div><svg class="sport-dial" viewBox="0 0 240 140"><path d="M28 112 A92 92 0 0 1 212 112" class="sd-bg" pathLength="236"/><path d="M28 112 A92 92 0 0 1 212 112" class="sd-fg" pathLength="236" stroke-dasharray="236" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div class="ss-number"><b>'+v+'</b><small>'+P.speedUnit+'</small><span>'+gear+'</span></div><div class="ss-fuel"><span>'+U.icon("fuel")+'</span><i><em style="width:'+fuel+'%"></em></i></div><div class="ss-flags">'+flags+'</div>';
    } else if(style===4){speedEl.innerHTML='<div class="sc-left"><span class="sc-icon">'+U.icon("car")+'</span><div><small>'+name+'</small><b>'+v+' <i>'+P.speedUnit+'</i></b></div></div><span class="sc-gear">'+gear+'</span><span class="sc-fuel">'+U.icon("fuel")+' '+Math.round(fuel)+'%</span><span class="sc-belt '+(S.belt?'safe':'danger')+'">'+U.icon("shield")+'</span>';
    } else if(style===5){speedEl.innerHTML='<div class="cyber-top"><span>'+U.icon("car")+'</span><b>'+name+'</b><small>'+plate+'</small></div><div class="cyber-main"><b>'+v+'</b><span>'+P.speedUnit+'</span><em>'+gear+'</em></div><div class="cyber-grid"><div><span>FUEL</span><i><em style="width:'+fuel+'%"></em></i><b>'+Math.round(fuel)+'%</b></div><div><span>HEALTH</span><i><em style="width:'+hp+'%"></em></i><b>'+Math.round(hp)+'%</b></div></div><div class="cyber-flags">'+flags+'</div>';
    } else if(style===6){speedEl.innerHTML='<div class="sv-head"><b>'+v+'</b><span>'+P.speedUnit+'</span><strong>'+gear+'</strong></div><div class="sv-row"><span>'+U.icon("fuel")+' Fuel</span><i><em style="width:'+fuel+'%"></em></i><b>'+Math.round(fuel)+'%</b></div><div class="sv-row"><span>'+U.icon("engine")+' Engine</span><i><em style="width:'+hp+'%"></em></i><b>'+Math.round(hp)+'%</b></div><div class="sv-name">'+name+'</div><div class="sv-flags">'+flags+'</div>';
    } else if(style===7){speedEl.innerHTML='<div class="sb-speed"><b>'+v+'</b><small>'+P.speedUnit+'</small></div><div class="sb-vehicle"><b>'+name+'</b><span>'+gear+' · '+plate+'</span></div><div class="sb-meter"><span>'+U.icon("fuel")+'</span><i><em style="width:'+fuel+'%"></em></i><b>'+Math.round(fuel)+'%</b></div><div class="sb-actions">'+flags+'</div>';
    } else {var p=Math.round(kmh/2.6);speedEl.innerHTML='<div class="classic-dial"><div class="classic-track"><i style="transform:rotate('+(-130+p*2.6)+'deg)"></i></div><div class="classic-center"><b>'+v+'</b><small>'+P.speedUnit+'</small><span>'+gear+'</span></div></div><div class="classic-meta"><b>'+name+'</b><span>'+plate+'</span><span>FUEL '+Math.round(fuel)+'%</span><span>HP '+Math.round(hp)+'%</span></div><div class="classic-flags">'+flags+'</div>';}
  }
  E.on("speedo",function(d){for(var k in d)S[k]=d[k];renderSpeedo();applyLayout();});

  /* --------------------------- LAYOUT ENGINE --------------------------- */
  var TARGETS={
    status:function(){return document.getElementById("hud");},info:function(){return document.getElementById("hud-info");},speedo:function(){return document.getElementById("speedo");},location:function(){return document.getElementById("hud-loc");},fps:function(){return document.getElementById("hud-fps");},watermark:function(){return document.getElementById("hud-wm");},weapon:function(){return document.getElementById("hud-weapon");},hotbar:function(){return document.querySelector(".inv-quickbar");},notify:function(){return document.getElementById("notify");},itembox:function(){return document.getElementById("itembox");}
  };
  function targetEl(k){try{return TARGETS[k]();}catch(e){return null;}}
  function applyLayoutOne(k){var el=targetEl(k),p=P.layout[k];if(!el||!p)return;if(!el.dataset.hudBasePosition)el.dataset.hudBasePosition="1";el.style.setProperty("left",clamp(+p.x||0,0,100)+"vw","important");el.style.setProperty("top",clamp(+p.y||0,0,100)+"vh","important");el.style.setProperty("right","auto","important");el.style.setProperty("bottom","auto","important");el.style.setProperty("transform","scale("+(clamp(+p.scale||100,50,150)/100)*(clamp(+P.scale||65,50,130)/100)+")","important");el.style.setProperty("transform-origin","top left","important");}
  function applyLayout(){Object.keys(P.layout).forEach(applyLayoutOne);}
  function makePreset(name){var src=PRESETS[name]||PRESETS.FiveM;Object.keys(P.layout).forEach(function(k){if(src[k]){P.layout[k].x=src[k].x;P.layout[k].y=src[k].y;}});save();}

  /* --------------------------- SETTINGS PANEL -------------------------- */
  var settings=h("div",{id:"hud-settings",class:"hud-settings","data-touch":""});U.layer("viewlayer").appendChild(settings);settings.style.pointerEvents="none";
  var hudOpts=[[1,"Ring","Circular"],[2,"Bars","Horizontal"],[3,"Vertical","Slim"],[4,"QBCore","FiveM"],[5,"Minimal","Clean"],[6,"Orbit","Circle cards"],[7,"Strip","Flat strip"],[8,"Tactical","2-line grid"],[9,"Neon","Glowing"],[10,"Corner","Micro"],[11,"Dock","Bottom row"],[12,"RPG","Labeled"],[13,"Pill","Compact pill"],[14,"Stack","Stacked bars"],[15,"Micro","Icon + value"],[16,"Glass","Glass card"],[17,"Line","Single line"],[18,"Rail","Compact rail"],[19,"Nano","Ultra compact"],[20,"Grid","Five-column"],[21,"GlassBar","Glass meters"],[22,"Soft","Soft cards"],[23,"Edge","Edge bars"],[24,"Tiny","Minimal micro"]];
  var spOpts=[[1,"Dial","Classic"],[2,"Digital","Vehicle card"],[3,"Sport","Racing arc"],[4,"Compact","Pill"],[5,"Cyber","HUD grid"],[6,"Vertical","Meters"],[7,"Bar","Bottom bar"],[8,"Classic","Analog"]];
  var acOpts=[["cyan","Cyan"],["blue","Blue"],["purple","Purple"],["green","Green"],["gold","Gold"],["red","Red"],["orange","Orange"],["pink","Pink"],["white","White"]];
  function group(title,key,opts,tip){var sec=h("section",{class:"hs-section"},h("div",{class:"hs-title",text:title}));var g=h("div",{class:"hs-options"});opts.forEach(function(o){var b=h("button",{type:"button",class:"hs-opt","data-v":String(o[0])},[h("b",{text:o[1]}),h("small",{text:o[2]||tip||""})]);b.addEventListener("click",function(){P[key]=typeof o[0]==="number"?+o[0]:String(o[0]);save();});g.appendChild(b);});sec.appendChild(g);return sec;}
  function toggle(label,key,icon){var b=h("button",{type:"button",class:"hs-row"},[h("span",{class:"hs-ic",html:U.icon(icon)}),h("span",{class:"hs-label"},[h("b",{text:label}),h("small",{class:"hs-value"})]),h("span",{class:"hs-toggle"})]);b.addEventListener("click",function(){P[key]=!P[key];save();});b.dataset.key=key;return b;}
  var shell=h("div",{class:"hs-shell glass"});
  shell.appendChild(h("div",{class:"hs-head"},[h("div",{class:"hs-logo",html:U.icon("gear")}),h("div",{class:"hs-heading"},[h("b",{text:"HUD CONTROL CENTER"}),h("small",{text:"FiveM / QBCore • Layout Studio • Performance"})]),h("button",{class:"hs-close",type:"button",html:U.icon("x")})]));
  var bdy=h("div",{class:"hs-body"});
  bdy.appendChild(group("HUD STYLE","hudStyle",hudOpts));
  bdy.appendChild(group("SPEEDOMETER","speedoStyle",spOpts));
  bdy.appendChild(group("ACCENT","accent",acOpts));
  bdy.appendChild(group("GLOBAL SCALE","scale",[[50,"50%","Ultra Tiny"],[55,"55%","Tiny"],[60,"60%","Very Small"],[65,"65%","Compact"],[70,"70%","Small"],[75,"75%","Small+"],[80,"80%","Comfort"],[85,"85%","Comfort+"],[90,"90%","Default"],[100,"100%","Large"],[110,"110%","XL"],[120,"120%","XXL"],[130,"130%","Max"]]));
  bdy.appendChild(group("OPACITY","opacity",[[70,"70%","Soft"],[80,"80%","Light"],[90,"90%","Balanced"],[100,"100%","Solid"]]));
  bdy.appendChild(group("PANEL","panelStyle",[["glass","Glass","Blur"],["solid","Solid","Strong"],["flat","Flat","No blur"],["soft","Soft","Light"]]));
  bdy.appendChild(group("CORNERS","radius",[["sharp","Sharp","2px"],["soft","Soft","10px"],["round","Round","20px"]]));
  bdy.appendChild(group("SPEED UNIT","speedUnit",[["KM/H","KM/H","Kilometers"],["MPH","MPH","Miles"]]));
  bdy.appendChild(group("NOTIFICATION","notifyPos",[["right","Right","Top right"],["bottom","Bottom","Bottom right"],["left","Left","Top left"]]));
  bdy.appendChild(group("QUICKBAR AUTO HIDE","quickbarAutoHide",[[0,"OFF","Always visible"],[2500,"2.5 sec","Fast"],[5000,"5 sec","Recommended"],[8000,"8 sec","Normal"],[12000,"12 sec","Relaxed"],[20000,"20 sec","Long"],[30000,"30 sec","Very long"]]));
  var mod=h("section",{class:"hs-section"},h("div",{class:"hs-title",text:"MODULES"}));
  [["showHud","HUD utama","eye"],["showStatus","Status","heart"],["showPlayerInfo","Cash / bank / job","wallet"],["showLocation","Compass / location","map"],["showWatermark","Server watermark","star"],["showFps","FPS / ping","wifi"],["showWeapon","Weapon / ammo","sword"],["showHotbar","Inventory hotbar","bag"],["showSpeedo","Speedometer","car"],["showVehicleInfo","Vehicle details","receipt"],["showNotif","Notifications","bell"],["showItemBox","Item pickup","box"],["showSeatbelt","Seatbelt","shield"],["showClock","Clock / time","clock"],["showVoice","Voice meter","mic"],["glow","Glow / bloom","star"]].forEach(function(x){mod.appendChild(toggle(x[1],x[0],x[2]));});
  bdy.appendChild(mod);
  var lay=h("section",{class:"hs-section hs-layout-section"},h("div",{class:"hs-title",text:"LAYOUT"}));
  var presetRow=h("div",{class:"hs-layout-presets"});Object.keys(PRESETS).forEach(function(n){var b=h("button",{type:"button",class:"hs-opt",html:"<b>"+n+"</b><small>Preset</small>"});b.addEventListener("click",function(){makePreset(n);});presetRow.appendChild(b);});lay.appendChild(presetRow);
  var editBtn=h("button",{type:"button",class:"hs-layout-edit",html:U.icon("map")+"<span>OPEN LAYOUT EDITOR</span>"});editBtn.addEventListener("click",function(){hideSettings();showEditor();});lay.appendChild(editBtn);bdy.appendChild(lay);
  shell.appendChild(bdy);
  var foot=h("div",{class:"hs-foot"});var reset=h("button",{type:"button",class:"hs-btn ghost",html:U.icon("refresh")+"<span>RESET</span>"});var done=h("button",{type:"button",class:"hs-btn primary",html:U.icon("check")+"<span>DONE</span>"});
  function hideSettings(){settings.classList.remove("on");settings.style.pointerEvents="none";E.touch();}
  reset.addEventListener("click",function(){P=clone(D);save();});done.addEventListener("click",hideSettings);shell.querySelector(".hs-close").addEventListener("click",hideSettings);foot.appendChild(reset);foot.appendChild(done);shell.appendChild(foot);settings.appendChild(shell);
  function renderSettings(){if(!settings.isConnected)return;settings.querySelectorAll(".hs-opt").forEach(function(b){var sec=b.closest(".hs-section"),t=sec.querySelector(".hs-title").textContent;var k={"HUD STYLE":"hudStyle","SPEEDOMETER":"speedoStyle","ACCENT":"accent","GLOBAL SCALE":"scale","OPACITY":"opacity","PANEL":"panelStyle","CORNERS":"radius","SPEED UNIT":"speedUnit","NOTIFICATION":"notifyPos","QUICKBAR AUTO HIDE":"quickbarAutoHide"}[t];if(k)b.classList.toggle("active",String(P[k])===b.dataset.v);});settings.querySelectorAll(".hs-row").forEach(function(b){var k=b.dataset.key,on=!!P[k];b.querySelector(".hs-value").textContent=on?"ON":"OFF";b.querySelector(".hs-toggle").classList.toggle("on",on);});}
  E.on("hudsettings",function(d){if(d.show){settings.classList.add("on");settings.style.pointerEvents="auto";renderSettings();E.touch();}else hideSettings();});

  function editorMarkup(){
    editor=h("div",{id:"hud-editor",class:"hud-editor", "data-touch":""});
    editor.innerHTML='<div class="he-grid"></div><div class="he-top"><button class="he-btn" data-act="close">'+U.icon("x")+'</button><div class="he-title"><b>HUD LAYOUT STUDIO</b><small>Drag HUD elements • tap a module to edit</small></div><button class="he-btn" data-act="save">'+U.icon("check")+'</button></div><div class="he-side"><div class="he-section"><div class="he-label">MODULE</div><div class="he-targets"></div></div><div class="he-section"><div class="he-label">POSITION</div><div class="he-range"><span>X</span><input id="he-x" type="range" min="0" max="100" step="0.1"><b id="he-xv">0</b></div><div class="he-range"><span>Y</span><input id="he-y" type="range" min="0" max="100" step="0.1"><b id="he-yv">0</b></div><div class="he-range"><span>S</span><input id="he-s" type="range" min="50" max="150" step="1"><b id="he-sv">100</b></div></div><div class="he-section"><div class="he-label">PRESETS</div><div class="he-presets"></div></div><div class="he-section he-tip"><b>Tip</b><span>Geser elemen langsung di layar. Posisi disimpan otomatis di perangkat ini.</span></div></div>';
    U.layer("viewlayer").appendChild(editor);editor.style.pointerEvents="none";
    editor.querySelector('[data-act="close"]').addEventListener("click",hideEditor);editor.querySelector('[data-act="save"]').addEventListener("click",hideEditor);
    editor.querySelector("#he-x").addEventListener("input",function(){P.layout[selected].x=+this.value;save();renderEditor();});
    editor.querySelector("#he-y").addEventListener("input",function(){P.layout[selected].y=+this.value;save();renderEditor();});
    editor.querySelector("#he-s").addEventListener("input",function(){P.layout[selected].scale=+this.value;save();renderEditor();});
    var tp=editor.querySelector(".he-targets");Object.keys(LABELS).forEach(function(k){var b=h("button",{type:"button",class:"he-target",text:LABELS[k]});b.dataset.k=k;b.addEventListener("click",function(){selected=k;renderEditor();});tp.appendChild(b);});
    var pp=editor.querySelector(".he-presets");Object.keys(PRESETS).forEach(function(n){var b=h("button",{type:"button",class:"he-preset",text:n});b.addEventListener("click",function(){makePreset(n);renderEditor();});pp.appendChild(b);});
    editor.addEventListener("pointerdown",onEditorDown);editor.addEventListener("pointermove",onEditorMove);editor.addEventListener("pointerup",onEditorUp);editor.addEventListener("pointercancel",onEditorUp);
    return editor;
  }
  function scheduleEditor(){if(editorRaf)return;editorRaf=requestAnimationFrame(function(){editorRaf=0;renderEditor();});}
  function rectContains(r,x,y){return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
  function onEditorDown(ev){if(!editor||!editor.classList.contains("on"))return;if(ev.target.closest(".he-side,.he-top"))return;var x=ev.clientX,y=ev.clientY;var keys=Object.keys(LABELS),hit=null;for(var n=keys.length-1;n>=0;n--){var el=targetEl(keys[n]);if(el){var r=el.getBoundingClientRect();if(rectContains(r,x,y)){hit=keys[n];break;}}}if(!hit)hit=selected;selected=hit;drag={x:x,y:y};try{editor.setPointerCapture(ev.pointerId);}catch(e){}renderEditor();}
  function onEditorMove(ev){if(!drag)return;var dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;drag.x=ev.clientX;drag.y=ev.clientY;P.layout[selected].x=clamp(P.layout[selected].x+dx/window.innerWidth*100,0,100);P.layout[selected].y=clamp(P.layout[selected].y+dy/window.innerHeight*100,0,100);applyLayoutOne(selected);scheduleEditor();}
  function onEditorUp(){if(!drag)return;drag=null;save();}
  function showEditor(){if(!editor)editorMarkup();editor.classList.add("on");editor.style.pointerEvents="auto";applyLayout();renderEditor();E.touch();}
  function hideEditor(){if(!editor)return;drag=null;editor.classList.remove("on");editor.style.pointerEvents="none";E.touch();}
  function renderEditor(){if(!editor)return;applyLayout();var l=P.layout[selected];if(!l)return;editor.querySelector("#he-x").value=l.x;editor.querySelector("#he-y").value=l.y;editor.querySelector("#he-s").value=l.scale;editor.querySelector("#he-xv").textContent=l.x.toFixed(1);editor.querySelector("#he-yv").textContent=l.y.toFixed(1);editor.querySelector("#he-sv").textContent=Math.round(l.scale)+"%";editor.querySelectorAll(".he-target").forEach(function(b){b.classList.toggle("active",b.dataset.k===selected);});editor.querySelectorAll(".he-pick").forEach(function(e){e.remove();});Object.keys(LABELS).forEach(function(k){var el=targetEl(k);if(!el)return;var r=el.getBoundingClientRect();var tag=h("div",{class:"he-pick"+(k===selected?" active":"")});tag.style.left=r.left+"px";tag.style.top=r.top+"px";tag.style.width=Math.max(40,r.width)+"px";tag.style.height=Math.max(25,r.height)+"px";tag.innerHTML='<span>'+LABELS[k]+'</span>';tag.dataset.k=k;tag.addEventListener("click",function(ev){ev.stopPropagation();selected=k;renderEditor();});editor.appendChild(tag);});}

  /* Direct helper events for local CEF controls */
  E.on("hudlayout",function(d){if(d.show)showEditor();else hideEditor();});

  function syncNodes(){if(locEl)locEl.style.display=P.showLocation?"":"none";if(fpsEl)fpsEl.style.display=P.showFps?"":"none";if(wmEl)wmEl.style.display=P.showWatermark?"":"none";if(notifEl)notifEl.style.display=P.showNotif?"":"none";if(itemEl)itemEl.style.display=P.showItemBox?"":"none";if(locEl){var t=locEl.querySelector(".time");if(t)t.style.display=P.showClock?"":"none";}applyLayout();}
  var observer=new MutationObserver(function(){if(!editor||!editor.classList.contains("on"))applyLayout();});observer.observe(document.body,{childList:true,subtree:true});
  apply();syncNodes();renderHud();renderWeapon();renderSpeedo();renderSettings();applyLayout();
})();
