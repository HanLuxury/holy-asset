/* =====================================================================
   EAGLE ROLEPLAY - FiveM/QBCore HUD extension
   Runs after hud.js and upgrades its existing HUD nodes in-place.
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var KEY = "eagle_hud_prefs_v3";
  var D = {
    hudStyle: 4, speedoStyle: 2, accent: "cyan", scale: 100, opacity: 90,
    showHud: true, showStatus: true, showPlayerInfo: true, showLocation: true,
    showWatermark: true, showFps: false, showWeapon: true, showHotbar: true,
    showSpeedo: true, showVehicleInfo: true, showNotif: true, showItemBox: true,
    showSeatbelt: true, showClock: true, speedUnit: "KM/H", notifyPos: "right"
  };
  var P = {};
  try { P = Object.assign({}, D, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { P = Object.assign({}, D); }

  var H = {}, S = {};
  var hudEl = document.getElementById("hud");
  var infoEl = document.getElementById("hud-info");
  var speedEl = document.getElementById("speedo");
  var locEl = document.getElementById("hud-loc");
  var fpsEl = document.getElementById("hud-fps");
  var wmEl = document.getElementById("hud-wm");
  var notifEl = document.getElementById("notify");
  var itemEl = document.getElementById("itembox");

  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} apply(); renderHud(); renderSpeedo(); renderSettings(); }
  function apply() {
    document.body.dataset.accent = P.accent || "cyan";
    document.body.dataset.uiScale = String(P.scale || 100);
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
    document.body.classList.toggle("hud-notify-left", P.notifyPos === "left");
    document.body.classList.toggle("hud-notify-right", P.notifyPos === "right");
    document.body.classList.toggle("hud-notify-bottom", P.notifyPos === "bottom");
    [70,90,100].forEach(function (x) { document.body.classList.remove("hud-op-" + x); });
    document.body.classList.add("hud-op-" + ([70,100].indexOf(+P.opacity) >= 0 ? +P.opacity : 90));
  }

  function ring(v) {
    var r=15, c=2*Math.PI*r, off=c*(1-Math.max(0,Math.min(100,v))/100);
    return '<svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="15" class="rbg"/><circle cx="18" cy="18" r="15" class="rfg" stroke-dasharray="'+c.toFixed(2)+'" stroke-dashoffset="'+off.toFixed(2)+'"/></svg>';
  }
  var stats=[
    ["hp","heart","hp","Darah"],["ar","shield","ar","Armor"],["hg","food","hg","Lapar"],["th","drink","th","Haus"],["st","brain","st","Stres"]
  ];
  function renderHud() {
    if(!hudEl) return;
    var show=!!H.show && P.showHud && P.showStatus;
    var mode=+P.hudStyle||4; if(mode<1||mode>5) mode=4;
    hudEl.className="hud mode-"+mode+(show?" on":"");
    if(!show){ hudEl.innerHTML=""; if(infoEl) infoEl.className="hud-info glass"; return; }
    var out="";
    stats.forEach(function(s){
      var v=Math.round(+H[s[0]]||0); if(s[0]==="ar"&&v<=0&&mode!==3&&mode!==5)return;
      var low=s[0]==="st"?v>=70:v<=25;
      if(mode===1) out+='<div class="hc '+s[2]+(low?' low':'')+'">'+ring(v)+'<span class="hc-ic">'+U.icon(s[1])+'</span></div>';
      else if(mode===2) out+='<div class="hb '+s[2]+(low?' low':'')+'"><span class="hb-ic">'+U.icon(s[1])+'</span><div class="hb-main"><small>'+s[3]+'</small><div class="hb-bar"><i style="width:'+v+'%"></i></div></div><b>'+v+'</b></div>';
      else if(mode===3) out+='<div class="hv '+s[2]+(low?' low':'')+'"><div class="hv-bar"><i style="height:'+v+'%"></i></div><span class="hv-ic">'+U.icon(s[1])+'</span></div>';
      else if(mode===4) out+='<div class="hq '+s[2]+(low?' low':'')+'"><span class="hq-ic">'+U.icon(s[1])+'</span><span class="hq-line"><b>'+v+'</b><i style="width:'+v+'%"></i></span></div>';
      else out+='<div class="hm '+s[2]+(low?' low':'')+'"><span class="hm-ic">'+U.icon(s[1])+'</span><div class="hm-body"><span>'+s[3]+'</span><b>'+v+'%</b><i style="width:'+v+'%"></i></div></div>';
    });
    var vm=Math.max(1,Math.min(3,+H.vm||2));
    out+='<div class="hud-voice v'+vm+'">'+U.icon("mic")+'<i class="on"></i><i class="'+(vm>=2?'on':'')+'"></i><i class="'+(vm>=3?'on':'')+'"></i></div>';
    hudEl.innerHTML=out;
    if(infoEl){
      var inf=!!H.info&&P.showPlayerInfo;
      infoEl.className="hud-info glass"+(inf?" on":"");
      if(inf) infoEl.innerHTML='<div class="hi-row"><span class="hi-ic">'+U.icon("id")+'</span><div><small>ID</small><b>#'+U.esc(H.id==null?"-":H.id)+'</b></div></div><div class="hi-row"><span class="hi-ic c-cash">'+U.icon("cash")+'</span><div><small>Cash</small><b>'+U.money(H.cash)+'</b></div></div><div class="hi-row"><span class="hi-ic c-bank">'+U.icon("bank")+'</span><div><small>Bank</small><b>'+U.money(H.bank)+'</b></div></div><div class="hi-row"><span class="hi-ic">'+U.icon("user")+'</span><div><small>'+U.esc(H.fac||"Civilian")+'</small><b>'+U.esc(H.job||"-")+'</b></div></div><div class="hi-row"><span class="hi-ic">'+U.icon("users")+'</span><div><small>Pemain</small><b>'+U.esc((H.on||0)+" Online")+'</b></div></div>';
    }
  }
  E.on("hud",function(d){ for(var k in d)H[k]=d[k]; renderHud(); renderWeapon(); });

  var weapon=h("div",{id:"hud-weapon",class:"hud-weapon"}); U.layer("hudlayer").appendChild(weapon);
  function weaponName(id){ var n={22:"Colt 45",23:"Silenced",24:"Desert Eagle",25:"Shotgun",26:"Sawed-Off",27:"Combat SG",28:"Uzi",29:"MP5",30:"AK-47",31:"M4",32:"Tec-9",33:"Rifle",34:"Sniper",35:"RPG",38:"Minigun",41:"Spray",43:"Camera"}; return n[+id]||"Weapon "+(+id||0); }
  function renderWeapon(){ var on=P.showWeapon&&P.showHud&&H.show&&+H.weapon>0; weapon.className="hud-weapon"+(on?" on":""); weapon.innerHTML=on?'<div class="hw-icon">'+U.icon("sword")+'</div><div class="hw-body"><small>'+U.esc(weaponName(H.weapon))+'</small><b>'+Math.max(0,+H.ammo||0)+'</b></div>':''; }

  /* FPS locally follows the CEF preference, even when the old server preference is off. */
  E.on("fps",function(d){
    if(!fpsEl) return;
    fpsEl.className="hud-fps"+(P.showFps&&P.showHud?" on":"");
    if(P.showFps&&P.showHud){
      fpsEl.innerHTML="FPS <b>"+Math.max(0,+d.fps||0)+"</b>  •  Ping <b>"+Math.max(0,+d.ping||0)+"</b>  •  PL <b>"+U.esc(d.pl||"0.00%")+"</b>";
    }
  });

  function renderSpeedo(){
    if(!speedEl)return;
    var on=!!S.show&&P.showHud&&P.showSpeedo, style=+P.speedoStyle||2; if(style<1||style>4)style=2;
    speedEl.className="speedo speedo-"+style+(on?" on":""); if(!on){speedEl.innerHTML="";return;}
    var kmh=Math.max(0,Math.round(+S.kmh||0)), v=P.speedUnit==="MPH"?Math.round(kmh*.621371):kmh;
    var fuel=Math.max(0,Math.min(100,+S.fuel||0)), hp=Math.max(0,Math.min(100,+S.hp||0)), gear=U.esc(S.gear||"N"), belt=!!S.belt;
    var flags='<span class="sf '+(S.eng?'on':'')+'">'+U.icon("power")+'</span><span class="sf '+(S.lig?'on':'')+'">'+U.icon("light")+'</span><span class="sf '+(S.lock?'on red':'')+'">'+U.icon(S.lock?'lock':'unlock')+'</span>';
    if(style===1){var a=2*Math.PI*42*.75,o=a*(1-Math.min(1,kmh/260));speedEl.innerHTML='<svg viewBox="0 0 100 100" class="sp-dial"><circle cx="50" cy="50" r="42" class="sp-bg" stroke-dasharray="'+a.toFixed(1)+' 999"/><circle cx="50" cy="50" r="42" class="sp-fg" stroke-dasharray="'+a.toFixed(1)+' 999" stroke-dashoffset="'+o.toFixed(1)+'"/></svg><div class="sp-num"><b>'+v+'</b><small>'+P.speedUnit+'</small><span class="sp-gear">'+gear+'</span></div><div class="sp-bars"><div class="sp-line f"><span>'+U.icon("fuel")+'</span><div class="bar"><i style="width:'+fuel+'%"></i></div><b>'+Math.round(fuel)+'%</b></div><div class="sp-line e"><span>'+U.icon("engine")+'</span><div class="bar"><i style="width:'+hp+'%"></i></div><b>'+Math.round(hp)+'%</b></div></div><div class="sp-flags">'+flags+'</div>';
    } else if(style===2){speedEl.innerHTML='<div class="sd-head"><span class="sd-car">'+U.icon("car")+'</span><div><b>'+U.esc(S.name||"Vehicle")+'</b><small>ID '+(+S.vehid||0)+' · '+U.esc(S.plate||"-")+'</small></div><span class="sd-gear">'+gear+'</span></div><div class="sd-speed"><b>'+v+'</b><span>'+P.speedUnit+'</span></div><div class="sd-bars"><div><span>'+U.icon("fuel")+' FUEL</span><i><em style="width:'+fuel+'%"></em></i><b>'+Math.round(fuel)+'%</b></div><div><span>'+U.icon("engine")+' HEALTH</span><i><em style="width:'+hp+'%"></em></i><b>'+Math.round(hp)+'%</b></div></div><div class="sd-foot">'+flags+'<span class="belt '+(belt?'safe':'danger')+'">'+U.icon("shield")+' BELT '+(belt?'ON':'OFF')+'</span></div>';
    } else if(style===3){var arc=236,off=arc*(1-Math.min(1,kmh/260));speedEl.innerHTML='<div class="ss-name"><b>'+U.esc(S.name||"Vehicle")+'</b><small>'+U.esc(S.plate||"-")+'</small></div><svg class="sport-dial" viewBox="0 0 240 140"><path d="M28 112 A92 92 0 0 1 212 112" class="sd-bg" pathLength="236"/><path d="M28 112 A92 92 0 0 1 212 112" class="sd-fg" pathLength="236" stroke-dasharray="236" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div class="ss-number"><b>'+v+'</b><small>'+P.speedUnit+'</small><span>'+gear+'</span></div><div class="ss-fuel"><span>'+U.icon("fuel")+'</span><i><em style="width:'+fuel+'%"></em></i></div><div class="ss-flags">'+flags+'<span class="belt '+(belt?'safe':'danger')+'">'+U.icon("shield")+'</span></div>';}
    else speedEl.innerHTML='<div class="sc-left"><span class="sc-icon">'+U.icon("car")+'</span><div><small>'+U.esc(S.name||"Vehicle")+'</small><b>'+v+' <i>'+P.speedUnit+'</i></b></div></div><span class="sc-gear">'+gear+'</span><span class="sc-fuel">'+U.icon("fuel")+' '+Math.round(fuel)+'%</span><span class="sc-belt '+(belt?'safe':'danger')+'">'+U.icon("shield")+'</span>';
  }
  E.on("speedo",function(d){for(var k in d)S[k]=d[k];renderSpeedo();});

  /* ============================ HUD SETTINGS ============================ */
  var settings=h("div",{id:"hud-settings",class:"hud-settings","data-touch":""}); U.layer("viewlayer").appendChild(settings); settings.style.pointerEvents="none";
  var hudOpts=[[1,"Ring","Circular"],[2,"Bars","Horizontal"],[3,"Vertical","Slim"],[4,"QBCore","FiveM"],[5,"Minimal","Clean"]];
  var spOpts=[[1,"Dial","Classic"],[2,"Digital","Vehicle card"],[3,"Sport","Racing arc"],[4,"Compact","Pill"]];
  var acOpts=[["cyan","Cyan"],["blue","Blue"],["purple","Purple"],["green","Green"],["gold","Gold"],["red","Red"]];
  function group(title,key,opts,tip){var sec=h("section",{class:"hs-section"},h("div",{class:"hs-title",text:title}));var g=h("div",{class:"hs-options"});opts.forEach(function(o){var b=h("button",{type:"button",class:"hs-opt","data-v":String(o[0])},[h("b",{text:o[1]}),h("small",{text:o[2]||tip||""})]);b.addEventListener("click",function(){P[key]=typeof o[0]==="number"?+o[0]:String(o[0]);save();});g.appendChild(b);});sec.appendChild(g);return sec;}
  function toggle(label,key,icon){var b=h("button",{type:"button",class:"hs-row"},[h("span",{class:"hs-ic",html:U.icon(icon)}),h("span",{class:"hs-label"},[h("b",{text:label}),h("small",{class:"hs-value"})]),h("span",{class:"hs-toggle"})]);b.addEventListener("click",function(){P[key]=!P[key];save();});b.dataset.key=key;return b;}
  var shell=h("div",{class:"hs-shell glass"});
  shell.appendChild(h("div",{class:"hs-head"},[h("div",{class:"hs-logo",html:U.icon("gear")}),h("div",{class:"hs-heading"},[h("b",{text:"HUD SETTINGS"}),h("small",{text:"FiveM / QBCore mobile control center"})]),h("button",{class:"hs-close",type:"button",html:U.icon("x")})]));
  var bdy=h("div",{class:"hs-body"});
  bdy.appendChild(group("HUD STYLE","hudStyle",hudOpts)); bdy.appendChild(group("SPEEDOMETER","speedoStyle",spOpts)); bdy.appendChild(group("ACCENT","accent",acOpts));
  bdy.appendChild(group("SCALE","scale",[[90,"90%","Compact"],[100,"100%","Default"],[110,"110%","Large"]])); bdy.appendChild(group("OPACITY","opacity",[[70,"70%","Soft"],[90,"90%","Balanced"],[100,"100%","Solid"]]));
  var mod=h("section",{class:"hs-section"},h("div",{class:"hs-title",text:"MODULES"}));
  [["showHud","HUD utama","eye"],["showStatus","HP / armor / hunger","heart"],["showPlayerInfo","Cash / bank / job","wallet"],["showLocation","Compass / location","map"],["showWatermark","Server watermark","star"],["showFps","FPS / ping","wifi"],["showWeapon","Weapon / ammo","sword"],["showHotbar","Inventory hotbar","bag"],["showSpeedo","Speedometer","car"],["showVehicleInfo","Vehicle details","receipt"],["showNotif","Notifications","bell"],["showItemBox","Item pickup","box"],["showSeatbelt","Seatbelt status","shield"],["showClock","Clock / time","clock"]].forEach(function(x){mod.appendChild(toggle(x[1],x[0],x[2]));}); bdy.appendChild(mod);
  bdy.appendChild(group("SPEED UNIT","speedUnit",[["KM/H","KM/H","Kilometers"],["MPH","MPH","Miles"]])); bdy.appendChild(group("NOTIFICATION","notifyPos",[["right","Right","Top right"],["bottom","Bottom","Bottom right"],["left","Left","Top left"]]));
  shell.appendChild(bdy);
  var foot=h("div",{class:"hs-foot"}); var reset=h("button",{type:"button",class:"hs-btn ghost",html:U.icon("refresh")+"<span>RESET</span>"}); var done=h("button",{type:"button",class:"hs-btn primary",html:U.icon("check")+"<span>DONE</span>"});
  function hide(){settings.classList.remove("on");settings.style.pointerEvents="none";E.touch();E.send("hudsettings","close",-1);}
  reset.addEventListener("click",function(){P=Object.assign({},D);save();}); done.addEventListener("click",hide); shell.querySelector(".hs-close").addEventListener("click",hide); foot.appendChild(reset);foot.appendChild(done);shell.appendChild(foot);settings.appendChild(shell);
  function renderSettings(){ if(!settings.isConnected)return; settings.querySelectorAll(".hs-opt").forEach(function(b){var sec=b.closest(".hs-section"),t=sec.querySelector(".hs-title").textContent,k=t==="HUD STYLE"?"hudStyle":t==="SPEEDOMETER"?"speedoStyle":t==="ACCENT"?"accent":t==="SCALE"?"scale":t==="OPACITY"?"opacity":t==="SPEED UNIT"?"speedUnit":"notifyPos";b.classList.toggle("active",String(P[k])===b.dataset.v);}); settings.querySelectorAll(".hs-row").forEach(function(b){var k=b.dataset.key,on=!!P[k];b.querySelector(".hs-value").textContent=on?"ON":"OFF";b.querySelector(".hs-toggle").classList.toggle("on",on);});}
  E.on("hudsettings",function(d){if(d.show){settings.classList.add("on");settings.style.pointerEvents="auto";renderSettings();E.touch();}else hide();});

  /* Existing nodes are still used for location/FPS/watermark; these classes
     make the switches instant even while the server is updating them. */
  function syncNodes(){
    if(locEl) locEl.style.display=P.showLocation?"":"none";
    if(fpsEl) fpsEl.style.display=P.showFps?"":"none";
    if(wmEl) wmEl.style.display=P.showWatermark?"":"none";
    if(notifEl) notifEl.style.display=P.showNotif?"":"none";
    if(itemEl) itemEl.style.display=P.showItemBox?"":"none";
    if(locEl) { var t=locEl.querySelector(".time"); if(t) t.style.display=P.showClock?"":"none"; }
  }

  apply(); syncNodes(); renderHud(); renderWeapon(); renderSpeedo(); renderSettings();
})();
