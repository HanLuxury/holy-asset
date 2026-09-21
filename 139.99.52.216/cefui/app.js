/* EAGLE RP - Direct CEF UI renderer.
 * The server sends semantic UI operations; this page owns layout, paint and input.
 * It is transparent over the game. Only actual UI nodes receive pointer events.
 */
(function () {
  "use strict";

  var VW = 640, VH = 448;
  var FONT_SCALE = 20.0;
  var stage = document.getElementById("stage");
  var els = { g: {}, p: {} };
  var inputEnabled = false;

  function fit() {
    var sx = window.innerWidth / VW, sy = window.innerHeight / VH;
    var s = Math.min(sx, sy);
    stage.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  }
  window.addEventListener("resize", fit, { passive: true });
  fit();

  function rgba(v) {
    v = (Number(v) || 0) >>> 0;
    return "rgba(" + ((v >>> 24) & 255) + "," + ((v >>> 16) & 255) + "," + ((v >>> 8) & 255) + "," + ((v & 255) / 255) + ")";
  }
  function escText(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\{([0-9a-fA-F]{6})\}/g, function (_, h) { return '</span><span style="color:#' + h + '">'; })
      .replace(/~n~/g, "<br>").replace(/~[a-z]~/gi, "");
  }
  function spriteKey(t) { return String(t || "").trim().toLowerCase().replace(/:/g, "_"); }
  var SPRITES = {
    ld_spac_white:1, ld_dual_white:1, ld_bum_blkdot:1, ld_beat_chit:1,
    ld_spac_backgnd:1, ld_bum_bum2:1, ld_spac_rockshp:1, ld_pool_ball:1,
    ld_beat_circle:1, ld_beat_cring:1, ld_beat_cross:1, ld_beat_left:1,
    ld_beat_right:1, ld_beat_upl:1, ld_chat_badchat:1, ld_chat_goodcha:1
  };
  function isSprite(s) { return (s.fn | 0) === 4 || /^[A-Za-z0-9_]+:[A-Za-z0-9_]+$/.test(String(s.text || "").trim()); }
  function defState() {
    return { x:0,y:0,lx:.5,ly:1,tx:0,ty:0,al:1,col:0xffffffff,box:0,bcol:0x00000080,
      sh:1,ol:0,bg:0x00000080,fn:1,pr:1,sel:0,mdl:-1,rx:0,ry:0,rz:0,zoom:1,vc1:0,vc2:0,text:"" };
  }
  function get(scope,id) {
    id = id | 0;
    if (!els[scope][id]) {
      var n = document.createElement("div");
      n.className = "ui-element";
      n.dataset.scope = scope; n.dataset.id = id;
      stage.appendChild(n);
      els[scope][id] = { node:n, st:defState() };
    }
    return els[scope][id];
  }
  function alignment(a) { return a === 2 ? "-50%" : (a === 3 ? "-100%" : "0"); }
  function shadow(s) {
    if ((s.ol|0) > 0) { var c = rgba(s.bg); return "-1px 0 "+c+",1px 0 "+c+",0 -1px "+c+",0 1px "+c; }
    if ((s.sh|0) > 0) { var q = s.sh|0; return q+"px "+q+"px 0 "+rgba(s.bg); }
    return "none";
  }
  function apply(scope,id) {
    var o = els[scope][id]; if (!o) return;
    var s=o.st,n=o.node;
    n.style.left=(+s.x||0)+"px"; n.style.top=(+s.y||0)+"px";
    n.style.transform="translateX("+alignment(s.al|0)+")";
    n.style.setProperty("--ui-color", rgba(s.col));
    n.style.fontSize=Math.max(4,(+s.ly||0)*FONT_SCALE).toFixed(1)+"px";
    n.style.letterSpacing=((+s.lx||.5)-.5)*1.5+"px";
    n.style.color=rgba(s.col);
    n.style.textShadow=shadow(s);
    n.style.width="auto"; n.style.height="auto";
    n.style.background="transparent";
    n.style.border="0";
    n.className="ui-element font"+(s.fn|0)+(s.sel?" selectable":"")+(s.box?" boxed":"")+(s.mdl>=0?" model":"");
    n.style.pointerEvents=s.sel?"auto":"none";
    if (isSprite(s) && s.mdl < 0) {
      var key=spriteKey(s.text);
      n.className="ui-element sprite"+(s.sel?" selectable":"");
      n.style.width=(+s.tx>0?+s.tx:8)+"px";
      n.style.height=(+s.ty>0?+s.ty:8)+"px";
      n.style.background=rgba(s.col);
      n.style.boxShadow=(s.box?"inset 0 0 0 1px rgba(255,255,255,.06)":"none");
      n.style.webkitMaskImage=SPRITES[key]?"url('sprites/"+key+".png')":"none";
      n.style.maskImage=SPRITES[key]?"url('sprites/"+key+".png')":"none";
      n.style.webkitMaskSize="100% 100%"; n.style.maskSize="100% 100%";
      n.style.webkitMaskRepeat="no-repeat"; n.style.maskRepeat="no-repeat";
      n.textContent="";
      return;
    }
    if (s.mdl >= 0) {
      n.innerHTML='<div class="model-id">'+(s.mdl|0)+'</div>';
      n.style.width=(+s.tx>0?+s.tx:72)+"px";
      n.style.height=(+s.ty>0?+s.ty:72)+"px";
      n.style.background="rgba(9,12,17,.78)";
      n.style.border="1px solid rgba(255,255,255,.10)";
      n.style.borderRadius="4px";
      n.style.fontSize="10px";
      n.style.color="rgba(255,255,255,.55)";
      n.style.textShadow="none";
      return;
    }
    if (s.box) {
      n.style.background=rgba(s.bcol);
      if (+s.tx>0) n.style.width=Math.max(1,(+s.tx-(+s.x||0)))+"px";
      n.style.padding="1px 3px";
      n.style.borderRadius="3px";
      n.style.boxSizing="border-box";
    }
    n.innerHTML="<span>"+escText(s.text)+"</span>";
  }
  function mutate(d) {
    var scope=d.s==="p"?"p":"g", id=d.id|0, o, s;
    switch(d.op){
      case "create": o=get(scope,id); s=o.st; Object.keys(d).forEach(function(k){ if(k!=="op"&&k!=="s"&&k!=="id"&&k!=="vis") s[k]=d[k]; }); apply(scope,id); if(d.vis) o.node.classList.add("visible"); break;
      case "prop": o=get(scope,id); s=o.st; s[d.k]=d.v; apply(scope,id); break;
      case "prop2": o=get(scope,id); s=o.st; if(d.k==="letter"){s.lx=+d.a;s.ly=+d.b;} else if(d.k==="textsize"){s.tx=+d.a;s.ty=+d.b;} else if(d.k==="pos"){s.x=+d.a;s.y=+d.b;} apply(scope,id); break;
      case "text": o=get(scope,id); o.st.text=d.t||""; apply(scope,id); break;
      case "show": o=get(scope,id); o.node.classList.add("visible"); break;
      case "hide": o=els[scope][id]; if(o)o.node.classList.remove("visible"); break;
      case "remove": o=els[scope][id]; if(o){o.node.remove();delete els[scope][id];} break;
      case "preview": o=get(scope,id); o.st.rx=+d.rx;o.st.ry=+d.ry;o.st.rz=+d.rz;o.st.zoom=+d.zoom; apply(scope,id); break;
      case "vehcol": o=get(scope,id); o.st.vc1=d.c1;o.st.vc2=d.c2; break;
    }
  }
  function batch(a){ if(!Array.isArray(a))return; for(var i=0;i<a.length;i++) mutate(a[i]); }
  function emit(name,payload){
    try{
      if(window.cefEmit)return window.cefEmit(name,payload);
      if(window.cef&&typeof window.cef.emit==="function")return window.cef.emit(name,payload);
      if(window.external&&window.external.emit)return window.external.emit(name,payload);
    }catch(e){}
  }
  stage.addEventListener("click",function(ev){
    var n=ev.target;
    while(n&&n!==stage&&!n.classList.contains("selectable")) n=n.parentNode;
    if(!n||n===stage)return;
    emit("ui_click",JSON.stringify({s:n.dataset.scope,id:(n.dataset.id|0)}));
  },true);
  stage.addEventListener("pointerdown",function(ev){
    var n=ev.target;
    while(n&&n!==stage&&!n.classList.contains("selectable")) n=n.parentNode;
    if(n&&n!==stage) n.classList.add("pressed");
  },true);
  stage.addEventListener("pointerup",function(){
    var p=stage.querySelectorAll(".pressed"); for(var i=0;i<p.length;i++)p[i].classList.remove("pressed");
  },true);

  var handlers={};
  function on(event,cb){handlers[event]=cb;}
  function onServerEvent(event,data){
    var d=data; if(typeof data==="string"){try{d=JSON.parse(data);}catch(e){}}
    if(event==="ui"){mutate(d);return;}
    if(event==="ui_batch"){batch(d);return;}
    if(event==="input_mode"){inputEnabled=!!(d&&d.enabled);document.body.classList.toggle("cef-input",inputEnabled);return;}
    if(handlers[event])handlers[event](d);
  }
  window.EAGLE={onServerEvent:onServerEvent,on:on,emit:emit,handleUI:mutate,_els:els};
  if(window.cef&&typeof window.cef.on==="function"){
    window.cef.on("ui",function(d){onServerEvent("ui",d);});
    window.cef.on("ui_batch",function(d){onServerEvent("ui_batch",d);});
  }
  document.addEventListener("cef",function(e){if(e.detail)onServerEvent(e.detail.event,e.detail.data);});
  function ready(){emit("cef_ready","{}");}
  if(document.readyState==="complete")ready(); else window.addEventListener("load",ready,{once:true});
})();
