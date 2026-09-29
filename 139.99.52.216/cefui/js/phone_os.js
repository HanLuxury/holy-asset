/* =====================================================================
   EAGLE ROLEPLAY - Android-like Smartphone OS
   Lightweight CEF front-end built on the existing EAGLE bridge.
   Visual target: Reduto/FiveM-style in-game smartphone overlay.
   No runtime framework/CDN is required.
   ===================================================================== */
(function(){
  "use strict";
  var E=window.EAGLE, U=window.UI, h=U.h;
  var send=function(a,i,s){E.send("phone_os",a,i==null?-1:i,s==null?"":s)};

  var root=h("div",{id:"phone-os"});
  var phone=h("div",{class:"e-phone","data-touch":"",role:"application","aria-label":"Eagle Phone"});
  var inner=h("div",{class:"e-inner"});
  var wall=h("div",{class:"e-wall"});
  var status=h("div",{class:"e-status"});
  var notch=h("div",{class:"e-notch"});
  var content=h("div",{class:"e-content"});
  var navGesture=h("i",{class:"e-gesture"});
  var navButtons=h("div",{class:"e-nav-buttons"},[
    h("button",{type:"button",text:"‹",title:"Back"}),
    h("button",{type:"button",text:"●",title:"Home"}),
    h("button",{type:"button",text:"▢",title:"Recent Apps"})
  ]);
  var nav=h("div",{class:"e-nav"},[navGesture,navButtons]);
  var mediaHost=h("div",{class:"e-media-host"});
  var mediaFrame=null;
  var mediaClose=h("button",{type:"button",class:"e-media-close",text:"×"});
  mediaClose.addEventListener("click",function(){hideMedia()});
  mediaHost.appendChild(mediaClose);

  inner.append(wall,status,notch,mediaHost,content,nav);
  phone.appendChild(inner); root.appendChild(phone);
  U.layer("screenlayer").appendChild(root);

  var saved={};
  try{saved=JSON.parse(localStorage.getItem("eagle_phone_prefs")||"{}")}catch(e){saved={}}
  var state={
    scr:"lock", brand:"Aevhone", model:"X25", os:"EagleOS 6.2", theme:"dark", wallpaper:1,
    owner:"", number:"", battery:87, signal:5, meId:0, drawerSearch:"", chatTarget:"", chatName:"",
    items:[],messages:[],group:false,lastMediaUrl:"",navMode:saved.navMode||"gesture",
    animations:saved.animations!==false, refresh:saved.refresh||"60", qsOpen:false, recents:[]
  };

  var APPS=[
    ["phone","Telepon","📞"],["contacts","Kontak","👥"],["whatsapp","WhatsApp","💬"],["x","Eagle X","𝕏"],
    ["camera","Kamera","📷"],["gallery","Galeri","🖼"],["youtube","YouTube","▶"],["music","Music","♫"],
    ["maps","Maps","⌖"],["bank","M-Bank","₿"],["files","File","▣"],["clock","Jam","◷"],
    ["calc","Kalkulator","+"],["settings","Setelan","⚙"],["vehicle","Kendaraan","🚗"],["browser","Browser","◉"]
  ];
  var DOCK=["phone","whatsapp","camera","settings"];

  function esc(v){return U.esc(String(v==null?"":v))}
  function initials(n){var p=String(n||"?").replace(/_/g," ").trim().split(/\s+/);return ((p[0]||"?")[0]+((p[1]||"")[0]||"")).toUpperCase()}
  function now(){var d=new Date();return U.pad(d.getHours())+":"+U.pad(d.getMinutes())}
  function today(){return new Date().toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long"})}
  function appDef(id){for(var i=0;i<APPS.length;i++)if(APPS[i][0]===id)return APPS[i];return[id,id,"•"]}
  function rememberScreen(scr){
    if(state.scr!==scr){state.recents.unshift(state.scr);state.recents=state.recents.filter(function(x,i,a){return x&&a.indexOf(x)===i}).slice(0,6)}
    state.scr=scr;
  }
  function persistPrefs(){try{localStorage.setItem("eagle_phone_prefs",JSON.stringify({navMode:state.navMode,animations:state.animations,refresh:state.refresh}))}catch(e){}}
  function oldPhone(show){var p=document.getElementById("phone");if(p)p.style.display=show?"none":""}
  function rootOn(){root.classList.add("on");oldPhone(true)}
  function rootOff(){root.classList.remove("on");oldPhone(false);hideMedia()}

  function paintStatus(){
    var b=Math.max(0,Math.min(100,+state.battery||87));
    var sig=+state.signal||0;
    var bars=sig>=5?"▂▄▆█":sig>=4?"▂▄▆":sig>=3?"▂▄":sig>=1?"▂":"×";
    status.innerHTML="<span>"+now()+"</span><span class='right'><span class='e-chip'>"+bars+"</span><span class='e-chip'>"+(sig?"5G":"—")+"</span><span class='e-battery'>"+b+"% ▏</span></span>";
    status.onclick=function(){showQuickSettings()};
  }
  function setWall(){wall.className="e-wall w"+(+state.wallpaper||1)}
  function openScreen(scr){rememberScreen(scr);render()}
  function goBack(fallback){if(fallback){openScreen(fallback);return}var x=state.recents.shift();openScreen(x&&x!==state.scr?x:"home")}
  function appIcon(id){
    var a=appDef(id), el=h("button",{type:"button",class:"e-app"},[h("span",{class:"ico",text:a[2]}),h("small",{text:a[1]})]);
    el.addEventListener("click",function(){send("open",-1,id)});return el;
  }
  function head(title,back,action){
    var b=h("button",{type:"button",class:"e-back",text:"‹"});
    b.addEventListener("click",function(){back?openScreen(back):goBack("home")});
    return h("div",{class:"e-head"},[b,h("h3",{text:title}),action||h("span",{style:"width:1.65rem"})]);
  }
  function page(kids,cls){return h("div",{class:"e-page "+(cls||"")},kids)}
  function row(name,sub,right,fn,avatar){
    var a=h("div",{class:"e-avatar",text:avatar||initials(name)});
    var r=h("div",{class:"e-row"},[a,h("div",{class:"e-row-main"},[h("b",{text:name}),h("small",{text:sub||""})]),right||null]);
    if(fn)r.addEventListener("click",fn);return r;
  }

  function lock(){
    var unlock=h("button",{type:"button",class:"e-lock-tap",title:"Buka ponsel"});
    unlock.addEventListener("click",function(){send("unlock")});
    var quick1=h("button",{class:"e-lock-pill",text:"◒"});quick1.addEventListener("click",function(){send("unlock")});
    var quick2=h("button",{class:"e-lock-pill",text:"📷"});quick2.addEventListener("click",function(){send("open",-1,"camera")});
    return h("div",{class:"e-lock"},[
      h("div",{class:"e-lock-brand",text:state.brand+" • "+state.model}),
      h("div",{class:"e-lock-time",text:now()}),
      h("div",{class:"e-lock-date",text:today()}),
      h("div",{class:"e-lock-notice"},[h("b",{text:"EagleOS"}),h("span",{text:state.number?"Ponsel terkunci • "+state.number:"Atur nomor telepon di Setelan"})]),
      unlock,
      h("div",{class:"e-lock-footer"},[quick1,h("span",{text:"Geser/ketuk untuk membuka"}),quick2])
    ]);
  }

  function home(){
    var brand=h("div",{class:"e-home-brand"},[h("span",{class:"e-brand-dot"}),h("b",{text:state.brand}),h("small",{text:state.model})]);
    var top=h("div",{class:"e-home"},[
      brand,h("div",{class:"e-clock",text:now()}),h("div",{class:"e-date",text:today()}),
      h("button",{class:"e-search",type:"button"},[h("span",{text:"⌕"}),h("span",{text:"Telusuri aplikasi & ponsel"})])
    ]);
    top.querySelector(".e-search").addEventListener("click",function(){send("drawer")});
    var grid=h("div",{class:"e-grid"},APPS.slice(0,12).map(function(a){return appIcon(a[0])}));top.appendChild(grid);
    var drawer=h("button",{type:"button",class:"e-allapps",text:"⌃"});drawer.title="Semua aplikasi";drawer.addEventListener("click",function(){send("drawer")});top.appendChild(drawer);
    top.appendChild(h("div",{class:"e-dock"},DOCK.map(appIcon)));
    return top;
  }

  function drawer(){
    var inp=h("input",{placeholder:"Cari aplikasi...",value:state.drawerSearch||"",autocomplete:"off"}),g=h("div",{class:"e-drawer-grid"});
    function fill(){g.innerHTML="";var q=(inp.value||"").toLowerCase();APPS.filter(function(a){return !q||a[1].toLowerCase().indexOf(q)>=0}).forEach(function(a){g.appendChild(appIcon(a[0]))})}
    inp.addEventListener("input",function(){state.drawerSearch=inp.value;fill()});fill();
    return page([head("Semua aplikasi","home"),h("div",{class:"e-drawer-top"},[inp]),g],"e-drawer");
  }

  function settings(){
    var p=page([
      head("Setelan","home"),
      h("div",{class:"e-card e-profile"},[h("div",{class:"e-avatar e-avatar-big",text:initials(state.owner)}),h("div",{class:"e-row-main"},[h("b",{text:state.owner||"Pemain"}),h("small",{text:state.number?"Nomor "+state.number:"Nomor belum terdaftar"}),h("small",{text:state.brand+" "+state.model+" • "+state.os})])]),
      (!state.number?h("div",{class:"e-card"},[h("div",{class:"e-note",text:"Nomor telepon belum terdaftar. Buat nomor untuk WhatsApp dan panggilan."}),h("div",{class:"e-form"},[h("input",{id:"phone-register-input",placeholder:"Contoh 0812345678",inputmode:"numeric"}),h("button",{class:"e-btn",text:"Daftar"})])]):null),
      h("div",{class:"e-card e-settings"},[
        h("h4",{text:"Perangkat"}),h("div",{class:"e-row"},[h("div",{class:"e-row-main"},[h("b",{text:state.brand+" "+state.model}),h("small",{text:"EagleOS • profil perangkat roleplay"})]),h("span",{class:"e-time",text:"›"})]),
        h("div",{class:"e-choice"},["Aevhone","Eagle One","Nova","Redu","PixelOne"].map(function(x){var b=h("button",{text:x,class:x===state.brand?"on":""});b.addEventListener("click",function(){send("brand",-1,x)});return b}))
      ]),
      h("div",{class:"e-card e-settings"},[
        h("h4",{text:"Tampilan"}),h("div",{class:"e-choice"},["dark","light"].map(function(x){var b=h("button",{text:x==="dark"?"Gelap":"Terang",class:x===state.theme?"on":""});b.addEventListener("click",function(){send("theme",-1,x)});return b})),
        h("div",{class:"e-choice"},[1,2,3,4,5,6].map(function(x){var b=h("button",{text:"W"+x,class:+state.wallpaper===x?"on":""});b.addEventListener("click",function(){send("wall",x-1,String(x))});return b}))
      ]),
      h("div",{class:"e-card e-settings"},[
        h("h4",{text:"Sistem"}),
        settingsRow("Jaringan & Internet","Wi-Fi, 4G/5G, hotspot, DNS",function(){openScreen("settings_network")}),
        settingsRow("Tampilan","Kecerahan, refresh rate, skala, animasi",function(){openScreen("settings_display")}),
        settingsRow("Baterai","Status, battery saver, penggunaan",function(){openScreen("settings_battery")}),
        settingsRow("Penyimpanan","Media, aplikasi, cache",function(){openScreen("settings_storage")}),
        settingsRow("Keamanan & Privasi","PIN, izin kamera/mikrofon, privacy dashboard",function(){openScreen("settings_privacy")}),
        settingsRow("Aplikasi","Manajemen aplikasi dan notifikasi",function(){openScreen("settings_apps")}),
        settingsRow("Sistem","Bahasa, input, opsi developer",function(){openScreen("settings_system")}),
        settingsRow("Tentang ponsel","Versi, perangkat, spesifikasi roleplay",function(){openScreen("settings_about")})
      ]),
      h("div",{class:"e-card e-settings"},[
        h("h4",{text:"Nada dering"}),h("div",{class:"e-form"},[h("input",{id:"ring-input",placeholder:"https://.../ringtone.mp3"}),h("button",{class:"e-btn",text:"Simpan"})])
      ])
    ]);
    var rb=p.querySelector("#ring-input + .e-btn");if(rb)rb.addEventListener("click",function(){send("ring",-1,p.querySelector("#ring-input").value||"")});
    var reg=p.querySelector("#phone-register-input");if(reg){var btn=reg.nextElementSibling;btn.addEventListener("click",function(){send("register",-1,(reg.value||"").replace(/[^0-9+]/g,""))})}
    return p;
  }
  function settingsRow(name,sub,fn){var r=h("button",{class:"e-settings-row",type:"button"},[h("div",{class:"e-row-main"},[h("b",{text:name}),h("small",{text:sub})]),h("span",{text:"›"})]);r.addEventListener("click",fn);return r}
  function toggleRow(name,sub,on,fn){var sw=h("button",{class:"e-switch "+(on?"on":""),type:"button",text:on?"ON":"OFF"});sw.addEventListener("click",fn);return h("div",{class:"e-settings-row"},[h("div",{class:"e-row-main"},[h("b",{text:name}),h("small",{text:sub})]),sw])}
  function settingDetail(kind){
    var title={settings_network:"Jaringan & Internet",settings_display:"Tampilan",settings_battery:"Baterai",settings_storage:"Penyimpanan",settings_privacy:"Keamanan & Privasi",settings_apps:"Aplikasi",settings_system:"Sistem",settings_about:"Tentang ponsel"}[kind]||"Setelan";
    var body=[];
    if(kind==="settings_network")body=[settingsRow("Wi-Fi","EagleRP Wi-Fi • terhubung",function(){}),settingsRow("Jaringan seluler","5G • sinyal "+state.signal+"/5",function(){}),settingsRow("Hotspot","Tersedia saat bridge native mengizinkan",function(){}),settingsRow("DNS Pribadi","Otomatis",function(){})];
    if(kind==="settings_display")body=[toggleRow("Mode gelap", "Mengikuti tema ponsel", state.theme==="dark",function(){send("theme",-1,state.theme==="dark"?"light":"dark")}),toggleRow("Animasi UI","Memakai animasi transisi",state.animations,function(){state.animations=!state.animations;persistPrefs();render()}),settingsRow("Refresh rate",""+state.refresh+" Hz (visual UI)",function(){state.refresh=state.refresh==="60"?"90":state.refresh==="90"?"120":"60";persistPrefs();render()})];
    if(kind==="settings_battery")body=[h("div",{class:"e-battery-card"},[h("strong",{text:Math.round(+state.battery||0)+"%"}),h("span",{text:"Baterai ponsel"}),h("div",{class:"e-battery-bar"},[h("i",{style:"width:"+Math.max(0,Math.min(100,+state.battery||0))+"%"})])]),toggleRow("Battery Saver","Batasi animasi/pemakaian UI",false,function(){this.classList.toggle("on")})];
    if(kind==="settings_storage")body=[h("div",{class:"e-card"},[h("div",{class:"e-storage-line"},[h("b",{text:"Phone Storage"}),h("span",{text:"Roleplay media"})]),h("div",{class:"e-storage-meter"},[h("i",{style:"width:32%"})]),h("div",{class:"e-note",text:"Foto/video di Galeri menggunakan URL media yang diekspos oleh bridge."})]),settingsRow("File Manager","Downloads, Camera, Documents",function(){send("open",-1,"files")})];
    if(kind==="settings_privacy")body=[settingsRow("Izin Kamera","Native GTA camera bridge",function(){}),settingsRow("Izin Mikrofon","CEF voice bridge",function(){}),settingsRow("Privacy Dashboard","Aktivitas izin 24 jam",function(){}),settingsRow("Kunci layar","PIN / pola dapat disambungkan ke native bridge",function(){})];
    if(kind==="settings_apps")body=[settingsRow("Aplikasi terpasang",""+APPS.length+" aplikasi utama",function(){send("drawer")}),settingsRow("Notifikasi","Kelola notifikasi CEF",function(){})];
    if(kind==="settings_system")body=[settingsRow("Bahasa & Input","Bahasa Indonesia",function(){}),settingsRow("Navigasi",""+state.navMode.toUpperCase(),function(){state.navMode=state.navMode==="gesture"?"buttons":"gesture";persistPrefs();applyNav();render()}),settingsRow("Opsi Developer","Pointer/touch debug, skala animasi",function(){})];
    if(kind==="settings_about")body=[h("div",{class:"e-about"},[h("div",{class:"e-about-logo",text:"E"}),h("h2",{text:state.brand+" "+state.model}),h("p",{text:state.os}),h("small",{text:"Eagle RP • Android-like CEF Phone"})]),settingsRow("Nomor perangkat",state.number||"Belum terdaftar",function(){}),settingsRow("Bridge","phone_os • legacy phone kompatibel",function(){})];
    return page([head(title,"settings"),h("div",{class:"e-card"},body)],"e-setting-detail");
  }

  function contacts(d){
    var arr=d.items||[],list=arr.map(function(c){return row(c.name||c.num,c.num,+c.on?h("span",{class:"e-badge",text:"●"}):h("span",{class:"e-time",text:"Offline"}),function(){send("wa_open",-1,c.num)})});
    if(!list.length)list=[h("div",{class:"e-note",text:"Belum ada kontak. Gunakan aplikasi Kontak lama atau tambahkan dari WhatsApp."})];
    return page([head("Kontak","home"),h("div",{class:"e-card"},list)],"");
  }

  function wa(d){
    if(d.target){state.chatTarget=d.target;state.chatName=d.targetName||d.target;state.group=(String(d.target).indexOf("g:")===0);return chat(d)}
    var list=(d.items||[]).map(function(c){var isg=c.type==="group"||String(c.num||"").indexOf("g:")===0;return row(c.name||c.num,c.preview||"Belum ada pesan",+c.unread?h("span",{class:"e-badge",text:c.unread}):h("span",{class:"e-time",text:isg?"Grup":(+c.on?"Online":"Offline")}),function(){send("wa_open",-1,c.num)},isg?"👥":initials(c.name))});
    if(!list.length)list=[h("div",{class:"e-note",text:"Belum ada percakapan. Ketuk + Chat atau Grup untuk memulai."})];
    var a=h("div",{},[h("button",{class:"e-btn sub",text:"+ Chat"}),h("button",{class:"e-btn sub",text:"+ Grup"})]);
    a.children[0].addEventListener("click",function(){var n=prompt("Nomor telepon tujuan:","");if(n)send("wa_open",-1,n)});
    a.children[1].addEventListener("click",function(){var n=prompt("Nama grup:","");if(!n)return;var nums=prompt("Nomor peserta dipisah koma:",state.number||"");if(nums)send("wa_group_create",-1,n+"\t"+nums)});
    return page([head("WhatsApp","home",a),h("div",{class:"e-card"},list)],"");
  }
  function chat(d){
    var bubbles=(d.messages||[]).map(function(m){var me=+m.me===1,kids=[];if(d.group&&m.from)kids.push(h("div",{class:"e-chat-from",text:m.from}));if(m.media_url)kids.push(h("img",{class:"e-img",src:m.media_url,loading:"lazy"}));if(m.body)kids.push(h("div",{text:m.body}));kids.push(h("div",{class:"e-meta",text:(m.time||"")+(me?(+m.status>=2?"  ✓✓":"  ✓"):"")}));return h("div",{class:"e-bub "+(me?"me":"them")},kids)});
    if(!bubbles.length)bubbles=[h("div",{class:"e-note",text:"Percakapan ini tersimpan di server roleplay."})];
    var tx=h("textarea",{placeholder:d.group?"Ketik pesan ke grup...":"Ketik pesan..."});
    var sendBtn=h("button",{class:"e-round",text:"➤"});
    sendBtn.addEventListener("click",function(){var v=tx.value.trim();if(!v)return;send("wa_send",-1,state.chatTarget+"\t"+v);tx.value=""});
    var imgBtn=h("button",{class:"e-round secondary",text:"▧",title:"Kirim media URL"});
    imgBtn.addEventListener("click",function(){var u=prompt("URL foto dari Galeri / bridge:",state.lastMediaUrl||"");if(u)send("wa_media",-1,state.chatTarget+"\t"+u+"\t");});
    return page([head(state.chatName||state.chatTarget,"whatsapp"),h("div",{class:"e-chat"},bubbles),h("div",{class:"e-compose"},[tx,imgBtn,sendBtn])]);
  }

  function x(d){
    var feed=(d.items||[]).map(function(t){
      var like=h("button",{text:"♥ "+(+t.likes||0),class:t.liked?"on":""}),rp=h("button",{text:"↻ "+(+t.reposts||0),class:t.reposted?"on":""}),reply=h("button",{text:"💬 "+(+t.replies||0)}),follow=null;
      like.addEventListener("click",function(){send("x_like",+t.id,"")});
      rp.addEventListener("click",function(){send("x_repost",+t.id,"")});
      reply.addEventListener("click",function(){var v=prompt("Balas tweet ini:","");if(v)send("x_reply",+t.id,v)});
      if(+t.author_id && +t.author_id!==+state.meId){follow=h("button",{text:t.followed?"Mengikuti":"Ikuti",class:"e-follow "+(t.followed?"on":"")});follow.addEventListener("click",function(){send(t.followed?"x_unfollow":"x_follow",+t.author_id,"")})}
      return h("article",{class:"e-tweet"},[
        h("div",{class:"e-t-head"},[h("div",{class:"e-avatar",text:initials(t.name)}),h("div",{class:"e-t-person"},[h("div",{class:"e-t-name",text:t.name}),h("div",{class:"e-t-handle",text:"@"+(t.handle||String(t.name||"").toLowerCase())})]),follow||null]),
        h("div",{class:"e-t-body",text:t.body||""}),t.media?h("img",{class:"e-img",src:t.media,loading:"lazy"}):null,
        h("div",{class:"e-actions"},[like,rp,reply,h("span",{text:t.date||""})])
      ]);
    });
    var post=h("textarea",{placeholder:"Apa yang terjadi?",maxlength:"280"});
    var mediaBtn=h("button",{class:"e-btn sub",text:"📷 Foto"}),pb=h("button",{class:"e-btn",text:"Post"});
    mediaBtn.addEventListener("click",function(){var u=state.lastMediaUrl||prompt("URL foto (opsional):","");if(u){var cap=post.value.trim();send("x_post_media",-1,cap+"\t"+u);post.value=""}});
    pb.addEventListener("click",function(){var v=post.value.trim();if(v){send("x_post",-1,v);post.value=""}});
    return page([head("Eagle X","home"),h("div",{class:"e-card"},[post,h("div",{class:"e-form-inline"},[mediaBtn,pb])]),h("div",{class:"e-feed"},feed)],"");
  }

  function camera(){
    var p=page([h("div",{class:"e-camera"})],"e-camera"),view=h("div",{class:"e-cam-view"});
    var top=h("div",{class:"e-cam-top"},[h("span",{text:"HDR"}),h("span",{text:"1×"}),h("span",{text:"⚡"})]);
    var galleryBtn=h("button",{class:"e-mode",type:"button",text:"GALERI"});galleryBtn.addEventListener("click",function(){send("open",-1,"gallery")});
    var shutter=h("button",{class:"e-shutter",title:"Ambil foto"});shutter.addEventListener("click",function(){send("camera_capture")});
    var videoBtn=h("button",{class:"e-mode",type:"button",text:"VIDEO"});videoBtn.addEventListener("click",function(){send("camera_video")});
    var bottom=h("div",{class:"e-cam-bottom"},[galleryBtn,shutter,videoBtn]);
    var close=h("button",{type:"button",class:"e-btn sub e-cam-close",text:"‹"});close.addEventListener("click",function(){send("home")});
    p.append(view,top,bottom,close);return p;
  }
  function gallery(d){
    var tiles=(d.items||[]).map(function(m){
      var img=h("img",{src:m.url,loading:"lazy"}),x=h("button",{class:"e-media-share",text:"𝕏"}),wa=h("button",{class:"e-media-share",text:"WA"});
      x.addEventListener("click",function(e){e.stopPropagation();var cap=prompt("Caption X:",m.caption||"");send("x_media",-1,String(m.url)+"\t"+String(cap||""))});
      wa.addEventListener("click",function(e){e.stopPropagation();var num=prompt("Nomor tujuan WhatsApp:",state.chatTarget||"");if(num)send("wa_media",-1,String(num)+"\t"+String(m.url)+"\t"+String(m.caption||""))});
      return h("div",{class:"e-media-tile"},[img,h("span",{text:m.date||"Foto"}),h("div",{class:"e-media-actions"},[x,wa])]);
    });
    if(!tiles.length)tiles=[h("div",{class:"e-note",text:"Belum ada foto. Ambil foto melalui Kamera atau kirim hasil native bridge."})];
    return page([head("Galeri","home"),h("div",{class:"e-tabs"},[h("div",{class:"e-tab on",text:"Foto"}),h("div",{class:"e-tab",text:"Video"}),h("div",{class:"e-tab",text:"Album"})]),h("div",{class:"e-media-grid"},tiles)],"");
  }

  function extractYT(v){return (v.match(/[?&]v=([^&]+)/)||v.match(/youtu\.be\/([^?&]+)/)||[])[1]||v.replace(/[^a-zA-Z0-9_-]/g,"")}
  function ensureMediaFrame(id){
    if(mediaFrame&&mediaFrame.__id===id)return mediaFrame;
    if(mediaFrame)mediaHost.removeChild(mediaFrame);
    mediaFrame=h("iframe",{allow:"autoplay; encrypted-media; picture-in-picture; fullscreen",allowfullscreen:"",src:"https://www.youtube.com/embed/"+id+"?autoplay=1&playsinline=1&rel=0"});
    mediaFrame.__id=id;mediaFrame.className="e-media-frame";mediaHost.appendChild(mediaFrame);return mediaFrame;
  }
  function showMedia(id){ensureMediaFrame(id);mediaHost.classList.add("visible");mediaHost.classList.add("playing")}
  function hideMedia(){mediaHost.classList.remove("visible");mediaHost.classList.add("background");mediaHost.style.pointerEvents="none"}
  function youtube(){
    var inp=h("input",{placeholder:"Masukkan URL YouTube video"}),btn=h("button",{class:"e-btn",text:"Putar"});
    btn.addEventListener("click",function(){var id=extractYT(inp.value.trim());if(id)showMedia(id)});
    var stop=h("button",{class:"e-btn sub",text:"Stop"});stop.addEventListener("click",function(){if(mediaFrame)mediaFrame.src="about:blank";hideMedia()});
    return page([head("YouTube","home"),h("div",{class:"e-form"},[inp,btn]),stop,h("div",{class:"e-note",text:"Player CEF dipertahankan di DOM. Background audio/PiP tetap bergantung pada kebijakan native CEF/Android."})]);
  }
  function music(){
    var inp=h("input",{placeholder:"URL YouTube Music / video musik"}),btn=h("button",{class:"e-btn",text:"Play"});
    btn.addEventListener("click",function(){var id=extractYT(inp.value.trim());if(id)showMedia(id)});
    var stop=h("button",{class:"e-btn sub",text:"Stop"});stop.addEventListener("click",function(){if(mediaFrame)mediaFrame.src="about:blank";hideMedia()});
    return page([head("Music","home"),h("div",{class:"e-card"},[h("b",{text:"Eagle Music"}),h("div",{class:"e-note",text:"Player tetap hidup saat kamu pindah aplikasi selama native CEF tidak menghentikan media."})]),h("div",{class:"e-form"},[inp,btn]),stop]);
  }
  function calc(){var v="",disp=h("div",{class:"e-card e-calc-display",text:"0"});var keys="7894561230+-*/.=C".split("");var g=h("div",{class:"e-keypad"},keys.map(function(k){var b=h("button",{class:"e-key",text:k});b.addEventListener("click",function(){if(k==="C"){v="";disp.textContent="0";return}if(k==="="){try{v=String(Function("return "+v)())}catch(e){v="";disp.textContent="Error";return}disp.textContent=v||"0";return}v+=k;disp.textContent=v});return b}));return page([head("Kalkulator","home"),disp,g],"")}
  function clock(){return page([head("Jam","home"),h("div",{class:"e-clock-page"},[h("div",{class:"e-clock",text:now()}),h("div",{class:"e-choice"},[h("button",{text:"Alarm"}),h("button",{text:"World Clock"}),h("button",{text:"Stopwatch"}),h("button",{text:"Timer"})])])],"")}
  function files(){return page([head("File","home"),h("div",{class:"e-card"},[row("Camera","DCIM / EaglePhone","›"),row("Downloads","File yang diunduh","›"),row("Documents","Dokumen roleplay","›")]),h("div",{class:"e-note",text:"Filesystem asli Android tetap dibatasi ke path yang diekspos bridge native."})])}
  function generic(name){return page([head(name,"home"),h("div",{class:"e-card e-note e-center",text:name+" terhubung melalui adapter legacy CEF."})])}

  function renderQuickSettings(){
    rootOn();setWall();paintStatus();content.innerHTML="";
    var close=h("button",{class:"e-btn sub",text:"Tutup"});close.addEventListener("click",function(){state.qsOpen=false;render()});
    var qs=["Wi-Fi","Bluetooth","Senter","Pesawat","Auto Rotate","Jangan Ganggu","Location","Battery Saver"];
    var grid=h("div",{class:"e-qs-grid"},qs.map(function(q){var b=h("button",{class:"e-qs",text:q});b.addEventListener("click",function(){b.classList.toggle("on")});return b}));
    content.appendChild(h("div",{class:"e-quick"},[h("div",{class:"e-qhead"},[h("b",{text:now()}),close]),h("div",{class:"e-note",text:"Quick Settings"}),grid]));E.touch();
  }
  function showQuickSettings(){state.qsOpen=!state.qsOpen;render()}
  function renderCall(d){
    rootOn();setWall();paintStatus();content.innerHTML="";
    var p=h("div",{class:"e-call-screen"},[h("div",{class:"e-avatar e-avatar-big",text:initials(d.name)}),h("div",{class:"e-call-name",text:d.name||"Telepon"}),h("div",{class:"e-call-status",text:d.st||"Panggilan"})]);
    var act=h("div",{class:"e-call-actions"});
    if(+d.mode===1){var dec=h("button",{class:"e-call-btn red",text:"✕"}),acc=h("button",{class:"e-call-btn green",text:"✓"});dec.addEventListener("click",function(){send("decline")});acc.addEventListener("click",function(){send("accept")});act.append(dec,acc)}
    else{var hng=h("button",{class:"e-call-btn red",text:"✕"});hng.addEventListener("click",function(){send("hangup")});act.append(hng)}
    p.appendChild(act);content.appendChild(p);E.touch();
  }
  function applyNav(){
    nav.classList.toggle("buttons",state.navMode==="buttons");nav.classList.toggle("gesture",state.navMode!=="buttons");
  }
  navButtons.children[0].addEventListener("click",function(){send("back")});
  navButtons.children[1].addEventListener("click",function(){send("home")});
  navButtons.children[2].addEventListener("click",function(){openScreen("recent")});
  navGesture.addEventListener("click",function(){send("home")});

  function recent(){
    var cards=state.recents.filter(function(s){return s!=="recent"}).map(function(s){var a=appDef(s),b=h("button",{class:"e-recent-card",text:a[2]+"  "+a[1]});b.addEventListener("click",function(){send("open",-1,s)});return b});
    if(!cards.length)cards=[h("div",{class:"e-note",text:"Belum ada aplikasi terbaru."})];
    return page([head("Aplikasi terbaru","home"),h("div",{class:"e-recent-grid"},cards)],"");
  }

  function render(){
    rootOn();setWall();inner.className="e-inner "+(state.theme==="light"?"light":"");applyNav();paintStatus();
    if(state.qsOpen){renderQuickSettings();return}
    content.innerHTML="";
    var s=state.scr,v;
    if(s!=="youtube")hideMedia();
    if(s==="lock")v=lock();
    else if(s==="home")v=home();else if(s==="drawer")v=drawer();else if(s==="settings")v=settings();
    else if(/^settings_/.test(s))v=settingDetail(s);else if(s==="contacts")v=contacts(state);else if(s==="whatsapp")v=wa(state);
    else if(s==="whatsapp_chat")v=chat(state);else if(s==="x")v=x(state);else if(s==="camera")v=camera();else if(s==="gallery")v=gallery(state);
    else if(s==="youtube")v=youtube();else if(s==="music")v=music();else if(s==="calc")v=calc();else if(s==="clock")v=clock();else if(s==="files")v=files();else if(s==="recent")v=recent();else v=generic(s);
    content.appendChild(v);E.touch();
  }

  E.on("phone_os",function(d){
    if(!d)return;
    if(d.show===0||d.show===false){rootOff();return}
    Object.keys(d).forEach(function(k){if(["show","scr","items","messages","target","targetName"].indexOf(k)<0)state[k]=d[k]});
    if(d.scr)state.scr=d.scr;if(d.items)state.items=d.items;if(d.messages)state.messages=d.messages;if(d.target)state.chatTarget=d.target;if(d.targetName)state.chatName=d.targetName;
    state.group=String(state.chatTarget||"").indexOf("g:")===0;
    render();
  });
  E.on("phone",function(d){if(!d)return;if(d.show===0||d.show===false){rootOff();return}rootOff();if(d.scr==="call")renderCall(d)});
  E.on("phone_camera",function(){
    try{
      if(window.CefBridge&&typeof window.CefBridge.openNativeGameCamera==="function")window.CefBridge.openNativeGameCamera();
      else if(window.CefBridge&&typeof window.CefBridge.captureGamePhoto==="function")window.CefBridge.captureGamePhoto();
      else E.log("phone_camera: expose openNativeGameCamera()/captureGamePhoto() pada native CEF bridge");
    }catch(e){E.log("phone_camera bridge error: "+e.message)}
  });
  E.on("phone_camera_result",function(d){
    if(!d)return;
    var url=d.url||d.uri||d.path||"";if(!url)return;
    state.lastMediaUrl=String(url);send("media_save",-1,String(url)+"\t"+String(d.caption||""));
  });
  phone.addEventListener("touchstart",function(e){var t=e.touches&&e.touches[0];if(!t)return;phone.__sx=t.clientX;phone.__sy=t.clientY},true);
  phone.addEventListener("touchend",function(e){
    var t=e.changedTouches&&e.changedTouches[0];if(!t)return;var dx=t.clientX-phone.__sx,dy=t.clientY-phone.__sy;
    if(Math.abs(dx)<25&&Math.abs(dy)<25)return;
    if(dy>70){showQuickSettings();return}
    if(dy<-70){send("drawer");return}
    if(Math.abs(dx)>70){send("back");return}
  },true);
  document.addEventListener("keydown",function(e){if(e.key==="Escape")send("back")});

  try{
    if(navigator.getBattery){navigator.getBattery().then(function(bat){function sync(){if(!bat||typeof bat.level!=="number")return;state.battery=Math.round(bat.level*100);paintStatus()}sync();bat.addEventListener("levelchange",sync)}).catch(function(){})}
  }catch(e){}
  setInterval(function(){
    if(root.classList.contains("on")){paintStatus();var c=content.querySelector(".e-clock");if(c)c.textContent=now();var lc=content.querySelector(".e-lock-time");if(lc)lc.textContent=now()}
  },5000);
  window.EaglePhoneOS={show:function(){send("unlock")},hide:function(){send("close")}};
  applyNav();
})();
