/* =====================================================================
   EAGLE PHONE V18
   SD-PHONE-INSPIRED iOS UI FOR EAGLE SA-MP / OPEN.MP
   ---------------------------------------------------------------------
   Independent UI implementation. The public sd-phone feature set is used
   as a design/feature reference; EAGLE's Pawn/MySQL/CEF bridge remains
   authoritative.

   Transport:
      CEF -> EAGLE.send("phone_os", action, index, payload)
      Pawn -> phone_os event -> this file
   ===================================================================== */
(function(){
  "use strict";

  var E=window.EAGLE, U=window.UI, h=U.h;
  if(!E || !U){return;}
  var send=function(a,i,s){E.send("phone_os",a,i==null?-1:String(i),s==null?"":String(s));};
  var phoneSend=function(a,i,s){E.send("phone_os",a,i==null?-1:String(i),s==null?"":String(s));};

  /* ------------------------------------------------------------------ */
  /* APP CATALOG                                                       */
  /* ------------------------------------------------------------------ */
  var APPS=[
    {id:"phone",name:"Phone",glyph:"☎",cat:"Communication",tint:"green",desc:"Calls, recents and keypad."},
    {id:"contacts",name:"Contacts",glyph:"●",cat:"Communication",tint:"blue",desc:"Your phonebook and contacts."},
    {id:"messages",name:"Messages",glyph:"✉",cat:"Communication",tint:"green",desc:"SMS and group conversations."},
    {id:"mail",name:"Mail",glyph:"@",cat:"Communication",tint:"blue",desc:"Eagle Mail inbox."},
    {id:"groups",name:"Groups",glyph:"♧",cat:"Communication",tint:"purple",desc:"Group chats and communities."},
    {id:"darkchat",name:"Dark Chat",glyph:"◐",cat:"Communication",tint:"black",desc:"Alias-first private chat."},
    {id:"radio",name:"Radio",glyph:"▣",cat:"Communication",tint:"orange",desc:"Faction and frequency radio."},
    {id:"findfriends",name:"Find Friends",glyph:"⌖",cat:"Communication",tint:"cyan",desc:"Nearby online players."},

    {id:"photogram",name:"Photogram",glyph:"◎",cat:"Social",tint:"pink",desc:"Photo social network."},
    {id:"birdy",name:"Birdy",glyph:"◆",cat:"Social",tint:"blue",desc:"Short social posts."},
    {id:"cherry",name:"Cherry",glyph:"♥",cat:"Social",tint:"pink",desc:"Friends and messages."},
    {id:"clout",name:"Clout",glyph:"▶",cat:"Social",tint:"red",desc:"Short video feed."},
    {id:"streaks",name:"Streaks",glyph:"✦",cat:"Social",tint:"orange",desc:"Friend streaks."},
    {id:"x",name:"Eagle X",glyph:"𝕏",cat:"Social",tint:"black",desc:"Public social feed."},

    {id:"camera",name:"Camera",glyph:"◉",cat:"Media",tint:"gray",desc:"Live GTA/Pawn camera."},
    {id:"gallery",name:"Photos",glyph:"▧",cat:"Media",tint:"purple",desc:"Saved media."},
    {id:"music",name:"Music",glyph:"♫",cat:"Media",tint:"pink",desc:"Music library and player."},
    {id:"voice",name:"Voice Memos",glyph:"●",cat:"Media",tint:"orange",desc:"Voice-note metadata storage."},

    {id:"maps",name:"Maps",glyph:"⌁",cat:"World",tint:"green",desc:"GPS and world map."},
    {id:"garage",name:"Garages",glyph:"▰",cat:"World",tint:"blue",desc:"Your vehicles."},
    {id:"homes",name:"Homes",glyph:"⌂",cat:"World",tint:"orange",desc:"Owned/access houses."},
    {id:"bank",name:"Bank",glyph:"$",cat:"World",tint:"green",desc:"Cash, bank and transfers."},
    {id:"services",name:"Services",glyph:"✚",cat:"World",tint:"red",desc:"Police, EMS, taxi and more."},
    {id:"ryde",name:"Ryde",glyph:"↗",cat:"World",tint:"purple",desc:"Player-to-player rides."},
    {id:"racing",name:"Racing",glyph:"➤",cat:"World",tint:"orange",desc:"Race rooms and tracks."},
    {id:"weazel",name:"Weazel News",glyph:"N",cat:"World",tint:"red",desc:"Local breaking news."},
    {id:"pages",name:"Pages",glyph:"▤",cat:"World",tint:"yellow",desc:"Business directory."},
    {id:"market",name:"Marketplace",glyph:"▱",cat:"World",tint:"green",desc:"Player listings."},
    {id:"weather",name:"Weather",glyph:"☀",cat:"World",tint:"cyan",desc:"Los Santos conditions."},
    {id:"stocks",name:"Stocks",glyph:"⌁",cat:"World",tint:"green",desc:"Market watchlist."},

    {id:"casino",name:"Casino",glyph:"♠",cat:"Games",tint:"purple",desc:"Casino launcher and scores."},
    {id:"chess",name:"Chess",glyph:"♞",cat:"Games",tint:"gray",desc:"Online lobby."},
    {id:"connect4",name:"Connect Four",glyph:"●",cat:"Games",tint:"red",desc:"Online lobby."},
    {id:"battleship",name:"Battleship",glyph:"⚓",cat:"Games",tint:"blue",desc:"Online lobby."},
    {id:"wordle",name:"Wordle",glyph:"W",cat:"Games",tint:"green",desc:"Daily word game."},
    {id:"cookie",name:"Cookie",glyph:"●",cat:"Games",tint:"orange",desc:"Leaderboard mini-game."},
    {id:"flappy",name:"Flappy",glyph:"↝",cat:"Games",tint:"cyan",desc:"Leaderboard mini-game."},
    {id:"blocks",name:"Blocks",glyph:"■",cat:"Games",tint:"purple",desc:"Leaderboard mini-game."},
    {id:"climber",name:"Climber",glyph:"↟",cat:"Games",tint:"green",desc:"Leaderboard mini-game."},

    {id:"mdt",name:"MDT",glyph:"▤",cat:"Job",tint:"blue",desc:"Police terminal."},
    {id:"ems",name:"EMS",glyph:"✚",cat:"Job",tint:"red",desc:"EMS terminal."},
    {id:"doj",name:"DOJ",glyph:"⚖",cat:"Job",tint:"purple",desc:"Legal terminal."},

    {id:"clock",name:"Clock",glyph:"◷",cat:"Utilities",tint:"gray",desc:"Alarms and timers."},
    {id:"calendar",name:"Calendar",glyph:"▦",cat:"Utilities",tint:"red",desc:"Server-backed events."},
    {id:"notes",name:"Notes",glyph:"✎",cat:"Utilities",tint:"yellow",desc:"Private notes."},
    {id:"files",name:"Files",glyph:"□",cat:"Utilities",tint:"blue",desc:"Documents and links."},
    {id:"calculator",name:"Calculator",glyph:"＋",cat:"Utilities",tint:"gray",desc:"Calculator."},
    {id:"compass",name:"Compass",glyph:"✦",cat:"Utilities",tint:"red",desc:"Heading and navigation."},
    {id:"health",name:"Health",glyph:"♥",cat:"Utilities",tint:"red",desc:"Player wellness summary."},
    {id:"passwords",name:"Passwords",glyph:"⌑",cat:"Utilities",tint:"blue",desc:"Private password vault UI."},
    {id:"id",name:"ID",glyph:"▥",cat:"Utilities",tint:"gray",desc:"Identity card."},
    {id:"appstore",name:"App Store",glyph:"A",cat:"Utilities",tint:"blue",desc:"Install and arrange apps."},
    {id:"settings",name:"Settings",glyph:"⚙",cat:"Utilities",tint:"gray",desc:"Phone configuration."}
  ];
  var APPS_BY_ID={}; APPS.forEach(function(a){APPS_BY_ID[a.id]=a;});

  var DOCK=["phone","messages","camera","settings"];
  var CAT_ORDER=["Communication","Social","Media","World","Games","Job","Utilities"];
  var WALLPAPERS=["aurora","sunset","city","ocean","graphite","purple"];
  var WALL_LABELS=["Aurora","Sunset","City","Ocean","Graphite","Purple"];

  var state={
    show:false,scr:"lock",brand:"Eagle",model:"Pro",os:"EagleOS 6.2",theme:"dark",wallpaper:1,battery:87,signal:5,
    owner:"Eagle Roleplay",number:"",meId:0,cash:0,bankBal:0,
    items:[],messages:[],chatTarget:"",chatName:"",mail:"",notes:[],notifications:[],badges:{},
    camActive:0,camFront:0,camFlash:0,camGrid:0,camMode:0,camZoom:1,
    editing:false,search:"",page:0,iconScale:1,nav:"gesture",installed:{},home:[],
    overlay:null,menuOpen:false,spotlight:false,currentApp:"home",prevScr:"home",game:""
  };
  try{
    var saved=JSON.parse(localStorage.getItem("eagle_phone_v18")||"{}");
    Object.keys(saved).forEach(function(k){state[k]=saved[k];});
  }catch(e){}

  /* ------------------------------------------------------------------ */
  /* DOM                                                                */
  /* ------------------------------------------------------------------ */
  var root=h("div",{id:"phone-os-v17"});
  var shell=h("div",{class:"sdp-shell"});
  var glass=h("div",{class:"sdp-glass"});
  var topIsland=h("div",{class:"sdp-island"});
  var status=h("div",{class:"sdp-status"}); status.dataset.touch=""; status.onclick=function(){if(state.show){state.overlay="control";render();}};
  var wallpaper=h("div",{class:"sdp-wallpaper"});
  var topShade=h("div",{class:"sdp-top-shade"});
  var screen=h("div",{class:"sdp-screen"});
  var bottomBar=h("div",{class:"sdp-bottombar"});
  var homeIndicator=h("button",{class:"sdp-home-indicator",type:"button","aria-label":"Home"});
  var dynamicIsland=h("button",{class:"sdp-dynamic-island",type:"button"});
  var modalLayer=h("div",{class:"sdp-modal-layer"});
  var toast=h("div",{class:"sdp-toast"});
  glass.append(wallpaper,topShade,topIsland,status,screen,bottomBar,dynamicIsland,homeIndicator,modalLayer,toast);
  shell.appendChild(glass);root.appendChild(shell);U.layer("screenlayer").appendChild(root);

  function esc(v){return U.esc(String(v==null?"":v));}
  function app(id){return APPS_BY_ID[id]||{id:id,name:id,glyph:"•",cat:"Utilities",tint:"gray",desc:"Eagle Phone application."};}
  function save(){try{localStorage.setItem("eagle_phone_v18",JSON.stringify({theme:state.theme,wallpaper:state.wallpaper,iconScale:state.iconScale,nav:state.nav,home:state.home,installed:state.installed}))}catch(e){}}
  function now(){var d=new Date();return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);}
  function longDate(){return new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"});}
  function shortDate(){return new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit"});}
  function money(v){if(U.money)return U.money(+v||0);return "$"+Number(v||0).toLocaleString("en-US");}
  function notifyLocal(text){toast.textContent=text;toast.classList.add("show");clearTimeout(toast._timer);toast._timer=setTimeout(function(){toast.classList.remove("show");},1900);}
  function primary(label,fn){var b=h("button",{class:"sdp-btn primary",type:"button",text:label});b.dataset.touch="";b.onclick=fn;return b;}
  function secondary(label,fn){var b=h("button",{class:"sdp-btn secondary",type:"button",text:label});b.dataset.touch="";b.onclick=fn;return b;}
  function danger(label,fn){var b=h("button",{class:"sdp-btn danger",type:"button",text:label});b.dataset.touch="";b.onclick=fn;return b;}
  function iconButton(label,fn,cls){var b=h("button",{class:"sdp-icon-btn "+(cls||""),type:"button",text:label});b.dataset.touch="";b.onclick=fn;return b;}
  function pill(label,cls){return h("span",{class:"sdp-pill "+(cls||""),text:label});}
  function card(kids,cls){return h("section",{class:"sdp-card "+(cls||"")},kids||[]);}
  function titleRow(title,sub,action){var r=h("div",{class:"sdp-title-row"});r.append(h("div",{class:"sdp-title-copy"},[h("h1",{text:title}),sub?h("small",{text:sub}):null]),action||h("span",{class:"sdp-spacer"}));return r;}
  function sectionLabel(text){return h("div",{class:"sdp-section-label",text:text});}
  function listRow(icon,title,sub,fn,badge){var r=h("button",{type:"button",class:"sdp-list-row"},[h("span",{class:"sdp-list-icon",text:icon}),h("span",{class:"sdp-list-copy"},[h("b",{text:title}),sub?h("small",{text:sub}):null]),badge!=null?h("em",{class:"sdp-list-badge",text:String(badge)}):h("span",{class:"sdp-chevron",text:"›"})]);r.dataset.touch="";if(fn)r.onclick=fn;return r;}
  function header(title,opts){opts=opts||{};var r=h("div",{class:"sdp-header"});var back=iconButton(opts.close?"×":"‹",function(){if(opts.close)send("close");else backLocal();});r.append(back,h("div",{class:"sdp-head-title"},[h("h2",{text:title}),opts.sub?h("small",{text:opts.sub}):null]),opts.action||h("span",{class:"sdp-spacer"}));return r;}
  function page(children,cls){return h("div",{class:"sdp-page "+(cls||"")},children||[]);}
  function backLocal(){state.spotlight=false;state.menuOpen=false;if(state.scr!=="home"&&state.scr!=="lock"){state.scr="home";state.currentApp="home";render();send("back");}}
  function openApp(id){state.prevScr=state.scr;state.currentApp=id;state.search="";state.spotlight=false;state.menuOpen=false;send("open",-1,id);}
  function renderWallpaper(){wallpaper.className="sdp-wallpaper wp-"+(WALLPAPERS[Math.max(0,(+state.wallpaper||1)-1)%WALLPAPERS.length]||"aurora");}
  function paintStatus(){status.innerHTML="<span class='sdp-time'>"+now()+"</span><span class='sdp-status-right'><span>▴</span><span>"+(state.signal?"5G":"×")+"</span><span>▮</span><b>"+Math.max(0,Math.min(100,+state.battery||87))+"%</b></span>";}
  function isInstalled(id){return state.installed[id]!==false;}

  /* ------------------------------------------------------------------ */
  /* CUSTOM FORM / ACTION SHEET                                         */
  /* ------------------------------------------------------------------ */
  function dialog(title,fields,okLabel,onOk){
    modalLayer.innerHTML="";modalLayer.classList.add("show");
    var box=h("div",{class:"sdp-dialog"});
    var inputs={};
    fields.forEach(function(f){
      var wrap=h("label",{class:"sdp-field"},[h("span",{text:f.label})]);
      var input;
      if(f.type==="textarea") input=h("textarea",{class:"sdp-input",placeholder:f.placeholder||""});
      else input=h("input",{class:"sdp-input",type:f.type||"text",placeholder:f.placeholder||""});
      input.dataset.touch="";wrap.appendChild(input);inputs[f.name]=input;box.appendChild(wrap);
    });
    var foot=h("div",{class:"sdp-dialog-foot"});
    foot.append(secondary("Cancel",closeModal),primary(okLabel||"Done",function(){var vals={};Object.keys(inputs).forEach(function(k){vals[k]=inputs[k].value.trim();});closeModal();onOk(vals);}));
    box.insertBefore(h("div",{class:"sdp-dialog-head"},[h("h3",{text:title}),iconButton("×",closeModal)]),box.firstChild);
    box.appendChild(foot);modalLayer.appendChild(box);E.touch();
  }
  function confirm(title,body,onYes){
    modalLayer.innerHTML="";modalLayer.classList.add("show");
    var box=h("div",{class:"sdp-dialog confirm"},[
      h("div",{class:"sdp-dialog-head"},[h("h3",{text:title}),iconButton("×",closeModal)]),
      h("p",{text:body}),
      h("div",{class:"sdp-dialog-foot"},[secondary("Cancel",closeModal),danger("Confirm",function(){closeModal();onYes();})])
    ]);modalLayer.appendChild(box);E.touch();
  }
  function closeModal(){modalLayer.classList.remove("show");modalLayer.innerHTML="";}

  /* ------------------------------------------------------------------ */
  /* HOME / LOCK / SEARCH / DRAWER                                       */
  /* ------------------------------------------------------------------ */
  function appIcon(id,compact){var a=app(id);var b=h("button",{class:"sdp-app-icon"+(compact?" compact":""),type:"button"});b.dataset.touch="";
    var badge=state.badges[id]&&+state.badges[id]>0?h("em",{class:"sdp-badge",text:+state.badges[id]>99?"99+":String(state.badges[id])}):null;
    b.append(h("span",{class:"sdp-icon-bg tint-"+a.tint},[h("span",{text:a.glyph})]),h("span",{class:"sdp-app-label",text:a.name}),badge);
    b.onclick=function(){if(state.editing){notifyLocal("Edit mode: drag ikon untuk mengurutkan.");return;}openApp(id);};
    b.draggable=state.editing;
    b.ondragstart=function(e){e.dataTransfer.setData("text/plain",id);};
    b.ondragover=function(e){if(state.editing)e.preventDefault();};
    b.ondrop=function(e){if(!state.editing)return;e.preventDefault();var from=e.dataTransfer.getData("text/plain");swapHome(from,id);};
    if(state.editing)b.classList.add("jiggle");
    return b;
  }
  function swapHome(a,b){var list=getHomeList();var ai=list.indexOf(a),bi=list.indexOf(b);if(ai<0||bi<0)return;list.splice(ai,1);list.splice(bi,0,a);state.home=list;save();render();}
  function getHomeList(){var list=(state.home&&state.home.length?state.home.slice():[]);if(!list.length)list=APPS.filter(function(a){return isInstalled(a.id);}).map(function(a){return a.id;});return list;}
  function lock(){return page([
    h("div",{class:"sdp-lock-top"},[h("span",{text:state.brand||"Eagle"}),h("small",{text:state.model||"Pro"})]),
    h("div",{class:"sdp-lock-time",text:now()}),h("div",{class:"sdp-lock-date",text:longDate()}),
    h("div",{class:"sdp-lock-fill"}),
    card([h("div",{class:"sdp-lock-profile"},[h("span",{class:"sdp-profile-avatar",text:(state.owner||"E").slice(0,1).toUpperCase()}),h("div",[h("b",{text:state.owner||"Eagle Roleplay"}),h("small",{text:state.number||"Phone not registered"})])])],"lock-card"),
    h("div",{class:"sdp-lock-actions"},[iconButton("◑",function(){notifyLocal("Flashlight diaktifkan.");}),primary("Unlock",function(){send("unlock");}),iconButton("◉",function(){openApp("camera");})]),
    h("small",{class:"sdp-lock-hint",text:"Swipe up or press Unlock"})
  ],"sdp-lock");}
  function widgetClock(){return h("div",{class:"sdp-widget wide"},[h("div",{class:"sdp-widget-top"},[h("span",{text:"EAGLE PHONE"}),pill("LIVE","live")]),h("strong",{text:now()}),h("small",{text:shortDate()+" · Los Santos"})]);}
  function widgetWeather(){return h("div",{class:"sdp-widget weather"},[h("span",{text:"Los Santos"}),h("strong",{text:(22+(new Date().getHours()%8))+"°"}),h("small",{text:"Clear skies · feels good"})]);}
  function widgetWallet(){return h("div",{class:"sdp-widget"},[h("span",{text:"Wallet"}),h("strong",{text:money(state.cash)}),h("small",{text:"Bank "+money(state.bankBal)})]);}
  function home(){
    var top=h("div",{class:"sdp-home-top"});
    var left=h("div",{class:"sdp-home-brand"},[h("b",{text:state.brand||"Eagle"}),h("span",{text:state.model||"Pro"})]);
    var edit=secondary(state.editing?"Done":"Edit",function(){state.editing=!state.editing;save();render();});
    top.append(left,edit);
    var search=secondary("⌕  Search",function(){state.spotlight=true;render();});search.classList.add("wide-search");
    var widgets=h("div",{class:"sdp-widget-grid"},[widgetClock(),widgetWeather(),widgetWallet()]);
    var grid=h("div",{class:"sdp-home-grid"});
    getHomeList().slice(0,24).forEach(function(id){if(isInstalled(id))grid.appendChild(appIcon(id));});
    var dock=h("div",{class:"sdp-dock"});DOCK.forEach(function(id){dock.appendChild(appIcon(id,true));});
    var dots=h("div",{class:"sdp-dots"},[h("i",{class:"on"}),h("i"),h("i")]);
    var editHint=state.editing?h("div",{class:"sdp-edit-hint",text:"Drag icon to rearrange • tap Done to finish"}):null;
    return page([top,search,widgets,grid,dots,dock,editHint],"sdp-home");
  }
  function drawer(){
    var inp=h("input",{class:"sdp-search-input",placeholder:"Search apps",value:state.search||""});inp.dataset.touch="";
    var body=h("div",{class:"sdp-drawer-body"});
    function fill(){body.innerHTML="";var q=String(inp.value||"").toLowerCase();CAT_ORDER.forEach(function(cat){var apps=APPS.filter(function(a){return a.cat===cat&&isInstalled(a.id)&&(!q||a.name.toLowerCase().indexOf(q)>=0);});if(!apps.length)return;body.appendChild(sectionLabel(cat));var g=h("div",{class:"sdp-home-grid compact"});apps.forEach(function(a){g.appendChild(appIcon(a.id));});body.appendChild(g);});E.touch();}
    inp.oninput=function(){state.search=inp.value;fill();};fill();
    return page([header("App Library",{close:false,action:secondary("Edit",function(){state.editing=!state.editing;render();})}),inp,body],"sdp-drawer");
  }
  function spotlight(){
    var inp=h("input",{class:"sdp-search-input hero",placeholder:"Search apps, people or messages",value:state.search||""});inp.dataset.touch="";
    var list=h("div",{class:"sdp-search-results"});
    function fill(){list.innerHTML="";var q=String(inp.value||"").toLowerCase();APPS.filter(function(a){return isInstalled(a.id)&&(!q||a.name.toLowerCase().indexOf(q)>=0||a.desc.toLowerCase().indexOf(q)>=0);}).slice(0,12).forEach(function(a){list.appendChild(listRow(a.glyph,a.name,a.desc,function(){state.spotlight=false;openApp(a.id);}));});
      if(!q)list.appendChild(card([h("b",{text:"Quick actions"}),listRow("+","New note","Create a private note",function(){state.spotlight=false;openApp("notes");}),listRow("⌖","GPS","Open navigation",function(){state.spotlight=false;openApp("maps");})],"quick-card"));
    }
    inp.oninput=function(){state.search=inp.value;fill();};fill();
    var box=page([h("div",{class:"sdp-search-head"},[iconButton("×",function(){state.spotlight=false;render();}),h("b",{text:"Spotlight"})]),inp,list],"sdp-search");return box;
  }

  /* ------------------------------------------------------------------ */
  /* COMMON APP SCREENS                                                 */
  /* ------------------------------------------------------------------ */
  function dialer(){
    var number="";if(state.dialNumber)number=state.dialNumber;
    var display=h("div",{class:"sdp-dial-display",text:number||""});
    var digits=["1","2","3","4","5","6","7","8","9","*","0","#"];var grid=h("div",{class:"sdp-keypad"});
    digits.forEach(function(d){var b=buttonKey(d);grid.appendChild(b);});
    function buttonKey(d){var b=h("button",{class:"sdp-key",text:d,type:"button"});b.dataset.touch="";b.onclick=function(){number+=d;state.dialNumber=number;display.textContent=number;};return b;}
    return page([header("Phone",{sub:state.number||"Your number"}),display,grid,h("div",{class:"sdp-dial-actions"},[danger("⌫",function(){number=number.slice(0,-1);state.dialNumber=number;display.textContent=number;}),primary("Call",function(){if(number)send("call",-1,number);}),secondary("Contacts",function(){openApp("contacts");})])],"sdp-app-screen");
  }
  function contacts(d){
    var list=h("div",{class:"sdp-list"});var items=d.items||d.contacts||state.items||[];
    items.forEach(function(c){list.appendChild(listRow("●",c.name||c.display_name||"Contact",c.phone||c.target||c.number||"",function(){state.dialNumber=c.phone||c.target||c.number||"";openApp("phone");}));});
    if(!items.length)list.appendChild(card([h("b",{text:"No contacts yet"}),h("small",{text:"Use Add Contact to populate your phonebook."})],"empty"));
    return page([header("Contacts",{action:primary("+",function(){dialog("Add Contact",[{name:"number",label:"Phone number",placeholder:"08..."},{name:"name",label:"Name",placeholder:"Contact name"}],"Save",function(v){if(v.number&&v.name)send("contact_add_cef",-1,v.number+"\t"+v.name);});})}),list],"sdp-app-screen");
  }
  function messages(d){
    var list=h("div",{class:"sdp-list"});var items=d.items||[];
    items.forEach(function(c){var unread=+c.unread||0;list.appendChild(listRow(c.kind==="group"?"♧":"●",c.name||"Conversation",(c.onx?"Online · ":"")+(c.preview||"No messages"),function(){send("wa_open",-1,c.target||"");},unread));});
    var newGroup=secondary("New Group",function(){dialog("Create group",[{name:"name",label:"Group name",placeholder:"Family / Crew"},{name:"numbers",label:"Phone numbers",placeholder:"0812...,0813..."}],"Create",function(v){if(v.name&&v.numbers)send("wa_group_create",-1,v.name+"\t"+v.numbers);});});
    return page([header("Messages",{action:primary("+",function(){state.dialNumber="";state.composeTarget="";state.composeMode="message";dialog("New message",[{name:"number",label:"Phone number",placeholder:"08..."},{name:"body",label:"Message",placeholder:"Write a message",type:"textarea"}],"Send",function(v){if(v.number&&v.body)send("wa_send",-1,v.number+"\t"+v.body);});})}),newGroup,list],"sdp-app-screen");
  }
  function chat(d){
    var target=d.target||state.chatTarget||"";var name=d.targetName||state.chatName||target;var msgs=d.messages||[];var bubbles=h("div",{class:"sdp-chat-bubbles"});
    msgs.forEach(function(m){var mine=String(m.sender||"")==String(state.meId);bubbles.appendChild(h("div",{class:"sdp-bubble "+(mine?"mine":"" )},[h("span",{text:m.body||m.message||""}),h("small",{text:m.time||m.date||""})]));});
    var input=h("textarea",{class:"sdp-chat-input",placeholder:"Message "+name});input.dataset.touch="";
    return page([header(name,{sub:target}),h("div",{class:"sdp-chat-window"},[bubbles]),h("div",{class:"sdp-chat-composer"},[input,primary("Send",function(){if(input.value.trim())send("wa_send",-1,target+"\t"+input.value.trim());})])],"sdp-chat-screen");
  }
  function mail(d){var list=h("div",{class:"sdp-list"}),items=d.items||[];items.forEach(function(m){list.appendChild(listRow("@",m.subject||"(No subject)",((m.sender_name||m.sender_address||"Unknown")+" · "+(m.date||"")),function(){state.mailCurrent=m;send("mail_read",+(m.id||0),"");state.scr="mail_view";render();},m.is_read?null:"1"));});return page([header("Mail",{action:primary("+",function(){openMailCompose();})}),card([h("small",{text:"Signed in as"}),h("b",{text:d.mail||((state.number||"user")+"@eagle.phone")})],"account-card"),list],"sdp-app-screen");}
  function openMailCompose(){dialog("New Mail",[{name:"to",label:"To",placeholder:"user@eagle.phone"},{name:"subject",label:"Subject",placeholder:"Subject"},{name:"body",label:"Message",placeholder:"Write an email",type:"textarea"}],"Send",function(v){if(v.to&&v.body)send("mail_send",-1,v.to+"\t"+v.subject+"\t"+v.body);});}
  function mailView(m){return page([header(m.subject||"Mail"),card([h("div",{class:"sdp-mail-from"},[h("b",{text:m.sender_name||m.sender_address||"Unknown"}),h("small",{text:m.sender_address||""})]),h("p",{class:"sdp-prose",text:m.body||""})]),danger("Delete mail",function(){send("mail_delete",+(m.id||0),"");state.scr="mail";render();})],"sdp-app-screen");}
  function notesScreen(d){var list=h("div",{class:"sdp-list"});(d.items||[]).forEach(function(n){list.appendChild(card([h("div",{class:"sdp-note-head"},[h("b",{text:n.title||"Note"}),h("small",{text:n.date||""})]),h("p",{class:"sdp-prose",text:n.body||""}),danger("Delete",function(){send("note_delete",+(n.id||0),"");})]));});if(!d.items||!d.items.length)list.appendChild(card([h("b",{text:"No notes"}),h("small",{text:"Notes are private to your character."})],"empty"));return page([header("Notes",{action:primary("+",function(){dialog("New Note",[{name:"title",label:"Title",placeholder:"Shopping list"},{name:"body",label:"Note",placeholder:"Write your note...",type:"textarea"}],"Save",function(v){if(v.body)send("note_save",-1,(v.title||"Note")+"\t"+v.body);});})}),list],"sdp-app-screen");}
  function gallery(d){var grid=h("div",{class:"sdp-photo-grid"});(d.items||[]).forEach(function(m){var b=h("button",{class:"sdp-photo-card",type:"button"});b.dataset.touch="";if(m.url){b.appendChild(h("img",{src:m.url,alt:m.caption||"photo"}));}b.appendChild(h("span",{text:m.caption||"Photo"}));grid.appendChild(b);});if(!d.items||!d.items.length)grid.appendChild(card([h("b",{text:"No photos yet"}),h("small",{text:"Camera captures that have a client URL will appear here."})],"empty"));return page([header("Photos"),grid],"sdp-app-screen");}
  function xfeed(d,id){
    var title=app(id).name;
    var feed=h("div",{class:"sdp-feed"});
    (d.items||[]).forEach(function(t){
      var actions=h("div",{class:"sdp-post-actions"});
      actions.appendChild(secondary("♥ "+(+t.likes||0),function(){send("x_like",+(t.id||0),"");}));
      actions.appendChild(secondary("↻ "+(+t.reposts||0),function(){send("x_repost",+(t.id||0),"");}));
      actions.appendChild(secondary("Reply",function(){
        dialog("Reply",[{name:"body",label:"Reply",placeholder:"Your reply",type:"textarea"}],"Send",function(v){
          if(v.body) send("x_reply",+(t.id||0),v.body);
        });
      }));
      var children=[
        h("div",{class:"sdp-post-head"},[
          h("div",{class:"sdp-avatar"},[h("span",{text:(t.name||"E").slice(0,1)})]),
          h("div",[h("b",{text:t.name||"Eagle User"}),h("small",{text:t.date||"Now"})])
        ]),
        h("p",{class:"sdp-prose",text:t.body||""})
      ];
      if(t.media) children.push(h("img",{class:"sdp-post-media",src:t.media,alt:"media"}));
      children.push(actions);
      feed.appendChild(card(children));
    });
    if(!feed.children.length){
      feed.appendChild(card([
        h("b",{text:"No posts"}),
        h("small",{text:"Belum ada postingan di aplikasi ini."})
      ],"empty"));
    }
    var create=primary("+",function(){
      dialog("New post",[
        {name:"body",label:"Post",placeholder:"What is happening?",type:"textarea"},
        {name:"media",label:"Media URL (optional)",placeholder:"https://..."}
      ],"Post",function(v){
        if(!v.body && !v.media) return;
        if(v.media) send("x_post_media",-1,(v.body||"")+"\t"+v.media);
        else send("x_post",-1,v.body);
      });
    });
    return page([header(title,{action:create}),feed],"sdp-app-screen");
  }
  function radio(d){return page([header("Radio",{sub:(d.on?"Online":"Offline")}),card([h("div",{class:"sdp-radio-frequency",text:String(d.freq||0).replace(/(\d)(?=(\d{3})+$)/g,"$1.")}),h("small",{text:d.mic?"Microphone active":"Microphone muted"})]),h("div",{class:"sdp-button-grid"},[primary(d.on?"Power Off":"Power On",function(){send("radio_power");}),secondary("Set Frequency",function(){send("radio_freq");}),secondary(d.mic?"Mic ON":"Mic OFF",function(){send("radio_mic");}),secondary("Close",function(){state.scr="home";render();})])],"sdp-app-screen");}
  function camera(){
    var live=h("div",{class:"sdp-camera-live"});if(state.camGrid)live.classList.add("grid-on");
    return page([h("div",{class:"sdp-camera-screen"},[
      h("div",{class:"sdp-camera-top"},[h("span",{class:"sdp-camera-chip",text:(state.brand||"Eagle")+" Camera"}),h("div",{class:"sdp-camera-top-actions"},[iconButton(state.camFlash?"⚡":"♧",function(){send("camera_flash");}),iconButton(state.camGrid?"▦":"□",function(){send("camera_grid");}),iconButton("×",function(){send("back");})])]),
      live,
      h("div",{class:"sdp-camera-guide"}),
      h("div",{class:"sdp-camera-modes"},[h("button",{class:state.camMode==0?"on":"",text:"PHOTO",onclick:function(){send("camera_mode",-1,"");}}),h("button",{class:state.camMode==1?"on":"",text:"PORTRAIT",onclick:function(){send("camera_mode",1,"");}}),h("button",{class:state.camMode==2?"on":"",text:"NIGHT",onclick:function(){send("camera_mode",2,"");}}),h("button",{class:state.camMode==3?"on":"",text:"VIDEO",onclick:function(){send("camera_mode",3,"");}})]),
      h("div",{class:"sdp-camera-controls"},[secondary("‹",function(){send("camera_zoom_out");}),h("button",{class:"sdp-shutter",type:"button",text:"",onclick:function(){send("camera_capture");}}),secondary("›",function(){send("camera_zoom_in");})]),
      h("div",{class:"sdp-camera-bottom"},[secondary(state.camFront?"Rear":"Selfie",function(){send(state.camFront?"camera_rear":"camera_front");}),pill((+state.camZoom||1)+".0×","camera-zoom"),secondary("Reset",function(){send("camera_reset");})])
    ])],"sdp-camera-page");
  }
  function wallet(){return page([header("Wallet"),card([h("small",{text:"Available balance"}),h("strong",{class:"sdp-balance",text:money(state.bankBal)}),h("div",{class:"sdp-wallet-split"},[h("span",[h("small",{text:"Cash"}),h("b",{text:money(state.cash)})]),h("span",[h("small",{text:"Bank"}),h("b",{text:money(state.bankBal)})])])]),primary("Transfer",function(){send("bank_transfer");}),secondary("Open full bank",function(){send("legacy",-1,"bank");})],"sdp-app-screen");}
  function idcard(){return page([header("My ID"),card([h("div",{class:"sdp-id-hero"},[h("span",{text:"EAGLE RP"}),h("strong",{text:state.owner||"Unknown"}),h("small",{text:"Character ID: "+(state.meId||0)}),h("small",{text:"Phone: "+(state.number||"Not registered")})])]),card([h("div",{class:"sdp-kv"},[h("span",{text:"Character"}),h("b",{text:state.owner||"-"})]),h("div",{class:"sdp-kv"},[h("span",{text:"Phone"}),h("b",{text:state.number||"-"})])])],"sdp-app-screen");}
  function health(){var hval=76;return page([header("Health",{sub:"Daily summary"}),card([h("div",{class:"sdp-health-ring"},[h("b",{text:hval+"%"}),h("small",{text:"active"})]),h("div",{class:"sdp-health-stats"},[h("span",[h("b",{text:"6,820"}),h("small",{text:"steps"})]),h("span",[h("b",{text:"4.6 km"}),h("small",{text:"distance"})]),h("span",[h("b",{text:"72"}),h("small",{text:"BPM"})])])])],"sdp-app-screen");}
  function calculator(){var display=h("div",{class:"sdp-calc-display",text:"0"});var value="";var grid=h("div",{class:"sdp-calc-grid"});"7894561230.+-*/=C".split("").forEach(function(k){var b=h("button",{type:"button",class:"sdp-key",text:k});b.dataset.touch="";b.onclick=function(){if(k==="C"){value="";display.textContent="0";return;}if(k==="="){if(!/^[0-9.+\-*/() ]+$/.test(value)){display.textContent="Error";value="";return;}try{value=String(Function("return "+value)());display.textContent=value;}catch(e){value="";display.textContent="Error";}return;}value+=k;display.textContent=value;};grid.appendChild(b);});return page([header("Calculator"),display,grid],"sdp-app-screen");}
  function clock(){return page([header("Clock"),h("div",{class:"sdp-big-time",text:now()}),h("div",{class:"sdp-button-grid"},[card([h("b",{text:"Alarms"}),h("small",{text:"No alarms configured"})]),card([h("b",{text:"Timer"}),h("small",{text:"Ready"})]),card([h("b",{text:"Stopwatch"}),h("small",{text:"00:00:00"})])])],"sdp-app-screen");}
  function calendar(d){
    var list=h("div",{class:"sdp-list"});
    (d.items||[]).forEach(function(e){
      list.appendChild(card([
        h("div",{class:"sdp-event-head"},[h("b",{text:e.title||"Event"}),pill(e.value1||"",e.status?"live":"")]),
        h("p",{class:"sdp-prose",text:e.body||""}),
        danger("Delete",function(){send("sd_calendar_delete",+(e.id||0),"");})
      ]));
    });
    if(!list.children.length) list.appendChild(card([h("b",{text:"No events"}),h("small",{text:"Create an event and it will be saved to MySQL."})],"empty"));
    var add=primary("+",function(){
      dialog("New event",[
        {name:"title",label:"Title",placeholder:"Meeting"},
        {name:"when",label:"Date / time",placeholder:"2026-09-29 20:00"},
        {name:"notes",label:"Notes",placeholder:"Details",type:"textarea"}
      ],"Save",function(v){
        if(v.title&&v.when) send("sd_calendar_save",-1,v.title+"\t"+v.when+"\t"+v.notes);
      });
    });
    return page([header("Calendar",{action:add}),list],"sdp-app-screen");
  }
  function market(d){
    var list=h("div",{class:"sdp-feed"});
    (d.items||[]).forEach(function(x){
      var actions=h("div",{class:"sdp-button-row"});
      actions.appendChild(secondary("Contact",function(){if(x.seller)send("call",-1,x.seller);}));
      actions.appendChild(secondary("Save",function(){notifyLocal("Listing disimpan.");}));
      list.appendChild(card([
        h("div",{class:"sdp-market-head"},[
          h("div",[h("b",{text:x.title||"Listing"}),h("small",{text:"Seller "+(x.seller||"Unknown")})]),
          h("strong",{text:x.price||"Negotiable"})
        ]),
        h("p",{class:"sdp-prose",text:x.body||""}),
        actions
      ]));
    });
    if(!list.children.length) list.appendChild(card([h("b",{text:"No listings"}),h("small",{text:"The marketplace is server-backed."})],"empty"));
    var add=primary("+",function(){
      dialog("Create listing",[
        {name:"title",label:"Title",placeholder:"iPhone / Vehicle"},
        {name:"price",label:"Price",placeholder:"1250000"},
        {name:"body",label:"Description",placeholder:"Describe your item",type:"textarea"}
      ],"Publish",function(v){
        if(v.title) send("sd_market_post",-1,v.title+"\t"+v.price+"\t"+v.body);
      });
    });
    return page([header("Marketplace",{action:add}),list],"sdp-app-screen");
  }
  function ryde(d){var list=h("div",{class:"sdp-feed"});(d.items||[]).forEach(function(x){list.appendChild(card([h("b",{text:x.title||"Pickup"}),h("small",{text:"Destination: "+(x.value1||"-")}),h("p",{class:"sdp-prose",text:x.body||""})]));});return page([header("Ryde",{action:primary("Request",function(){dialog("Request ride",[{name:"pickup",label:"Pickup",placeholder:"Legion Square"},{name:"destination",label:"Destination",placeholder:"Airport"},{name:"note",label:"Note",placeholder:"Any special note"}],"Request",function(v){if(v.pickup&&v.destination)send("sd_ryde_request",-1,v.pickup+"\t"+v.destination+"\t"+v.note);});})}),card([h("b",{text:"Player-to-player rides"}),h("small",{text:"Your request is persisted and broadcast to online players."})]),list],"sdp-app-screen");}
  function racing(d){var list=h("div",{class:"sdp-feed"});(d.items||[]).forEach(function(x){list.appendChild(card([h("div",{class:"sdp-market-head"},[h("b",{text:x.title||"Race"}),pill(x.status?"OPEN":"CLOSED",x.status?"live":"")]),h("small",{text:"Track: "+(x.value1||"Unknown")}),h("small",{text:"Host: "+(x.value2||"Unknown")}),secondary("Join",function(){notifyLocal("Race join hook ready.");})]));});return page([header("Racing",{action:primary("+",function(){dialog("Create race",[{name:"name",label:"Race name",placeholder:"Downtown Sprint"},{name:"track",label:"Track",placeholder:"Los Santos Circuit"}],"Create",function(v){if(v.name&&v.track)send("sd_race_create",-1,v.name+"\t"+v.track);});})}),list.length?list:card([h("b",{text:"No open races"}),h("small",{text:"Create the first race room."})],"empty")],"sdp-app-screen");}
  function files(d){var list=h("div",{class:"sdp-feed"});(d.items||[]).forEach(function(x){list.appendChild(card([h("div",{class:"sdp-file-row"},[h("span",{class:"sdp-file-icon",text:"□"}),h("div",[h("b",{text:x.title||"File"}),h("small",{text:x.value1||""})])]),h("p",{class:"sdp-prose",text:x.body||""}),danger("Delete",function(){send("sd_file_delete",+(x.id||0),"");})]));});return page([header("Files",{action:primary("+",function(){dialog("Add file",[{name:"title",label:"Title",placeholder:"Document"},{name:"url",label:"URL",placeholder:"https://..."},{name:"desc",label:"Description",placeholder:"Description"}],"Save",function(v){if(v.title&&v.url)send("sd_file_add",-1,v.title+"\t"+v.url+"\t"+v.desc);});})}),list.length?list:card([h("b",{text:"No files"}),h("small",{text:"Add URLs or documents shared by the game."})],"empty")],"sdp-app-screen");}
  function voice(d){var list=h("div",{class:"sdp-feed"});(d.items||[]).forEach(function(x){list.appendChild(card([h("b",{text:x.title||"Voice memo"}),h("small",{text:x.value1||""})]));});return page([header("Voice Memos",{action:primary("+",function(){dialog("Save voice memo",[{name:"title",label:"Title",placeholder:"Dispatch note"},{name:"url",label:"Recording URL",placeholder:"client://recording"}],"Save",function(v){if(v.url)send("sd_voice_save",-1,(v.title||"Voice memo")+"\t"+v.url);});})}),list.length?list:card([h("b",{text:"No memos"}),h("small",{text:"A client recording URL can be stored here."})],"empty")],"sdp-app-screen");}
  function homes(d){var list=h("div",{class:"sdp-feed"});(d.items||[]).forEach(function(x){list.appendChild(card([h("b",{text:x.title||"House"}),h("small",{text:x.body||"House"}),pill(x.value1||"Access","live")],"house-card"));});if(!list.children.length)list.appendChild(card([h("b",{text:"No house access"}),h("small",{text:"Owned/friend-access houses will appear here."})],"empty"));return page([header("Homes"),list],"sdp-app-screen");}
  function services(d){var items=d.items||[{title:"Police"},{title:"EMS"},{title:"Taxi"},{title:"Mechanic"},{title:"Tow"},{title:"Government"}];var grid=h("div",{class:"sdp-service-grid"});items.forEach(function(s){grid.appendChild(card([h("div",{class:"sdp-service-icon",text:(s.title||"S").slice(0,1)}),h("b",{text:s.title}),h("small",{text:"Dispatch available"}),primary("Call",function(){dialog("Call "+s.title,[{name:"phone",label:"Phone",placeholder:"service number"}],"Call",function(v){if(v.phone)send("sd_dispatch",-1,(s.title||"Service")+"\t"+v.phone);});})]));});return page([header("Services"),grid],"sdp-app-screen");}
  function jobApp(id,d){var a=app(id);if(d.allowed===0||d.allowed===false)return page([header(a.name),card([h("div",{class:"sdp-lockout"},[h("span",{text:"⌑"}),h("b",{text:"Access restricted"}),h("small",{text:"Your faction does not have access to this terminal."})])])],"sdp-app-screen");return page([header(a.name,{sub:"Secure terminal"}),card([h("b",{text:a.name+" Terminal"}),h("small",{text:a.desc}),h("div",{class:"sdp-terminal-grid"},[pill("ONLINE","live"),pill("JOB", "blue"),pill("SERVER" )])]),h("div",{class:"sdp-list"},[listRow("▤","Records","Search records",function(){notifyLocal("Records module ready.");}),listRow("!","Reports","Create incident report",function(){notifyLocal("Report composer ready.");}),listRow("⌖","Dispatch","Open calls",function(){openApp("services");})])],"sdp-app-screen");}
  function weather(){var deg=22+(new Date().getHours()%8);return page([header("Weather",{sub:"Los Santos"}),card([h("div",{class:"sdp-weather-hero"},[h("span",{text:"☀"}),h("strong",{text:deg+"°"}),h("small",{text:"Clear skies"})])]),h("div",{class:"sdp-forecast"},["Now","+1h","+2h","Tomorrow","Fri"].map(function(k,i){return card([h("b",{text:k}),h("strong",{text:(deg+(i%3))+"°"}),h("small",{text:"Clear"})]);}))],"sdp-app-screen");}
  function stocks(){var data=[['EAGL',128.42,'+2.8%'],['LSX',84.21,'+1.1%'],['SND',63.88,'-0.7%'],['MKT',44.05,'+0.4%']];return page([header("Stocks"),card([h("small",{text:"Portfolio"}),h("strong",{class:"sdp-balance",text:"$128,420"}),h("small",{text:"Today's change +2.1%"})]),h("div",{class:"sdp-list"},data.map(function(x){return listRow("⌁",x[0],"$"+x[1].toFixed(2),function(){notifyLocal(x[0]+" added to watchlist.");},x[2]);}))],"sdp-app-screen");}
  function music(){return page([header("Music"),card([h("div",{class:"sdp-now-playing"},[h("div",{class:"sdp-album-art",text:"♫"}),h("b",{text:"Eagle Radio"}),h("small",{text:"Playlist · Los Santos"})])]),h("div",{class:"sdp-player-controls"},[secondary("↶",function(){}),primary("▶",function(){notifyLocal("Playback toggled.");}),secondary("↷",function(){})]),h("div",{class:"sdp-list"},[listRow("01","Night Drive","Eagle Mix",function(){}),listRow("02","Sunset Blvd","Los Santos Radio",function(){}),listRow("03","City Lights","Community",function(){})])],"sdp-app-screen");}
  function browser(){var url=h("input",{class:"sdp-input",placeholder:"https://example.com"});url.dataset.touch="";var frame=h("iframe",{class:"sdp-browser-frame",src:"about:blank"});frame.setAttribute("sandbox","allow-scripts allow-forms allow-same-origin");return page([header("Browser"),h("div",{class:"sdp-browser-bar"},[url,primary("Go",function(){var u=url.value.trim();if(u&&/^https?:\/\//i.test(u))frame.src=u;else notifyLocal("Use a valid http/https URL.");})]),frame],"sdp-app-screen");}
  function garage(d){
    var list=h("div",{class:"sdp-feed"});
    (d.items||[]).forEach(function(x){
      list.appendChild(card([
        h("div",{class:"sdp-market-head"},[h("div",[h("b",{text:x.title||"Vehicle"}),h("small",{text:(x.plate||"NO PLATE")+" · Fuel "+(x.fuel==null?"-":x.fuel)+"%"})]),pill(x.spawned?"OUT":"STORED",x.spawned?"live":"")]),
        h("div",{class:"sdp-vehicle-stats"},[h("span",{text:"Health "+(x.health==null?"-":x.health)}),h("span",{text:"Model "+(x.model||"-")})]),
        primary("Details",function(){send("sd_garage_info",x.id||0,"");})
      ],"vehicle-card"));
    });
    if(!list.children.length) list.appendChild(card([h("b",{text:"No vehicles"}),h("small",{text:"Your owned vehicles will appear here."})],"empty"));
    return page([header("Garages",{action:secondary("Refresh",function(){send("sd_open_garage");})}),list],"sdp-app-screen");
  }
  function garageView(d){
    return page([header(d.title||"Vehicle"),card([h("div",{class:"sdp-app-hero"},[h("span",{class:"sdp-hero-icon tint-blue",text:"▰"}),h("div",[h("b",{text:d.title||"Vehicle"}),h("small",{text:d.plate||"No plate"})])]),h("div",{class:"sdp-stat-grid"},[h("div",[h("small",{text:"Fuel"}),h("b",{text:(d.fuel==null?"-":d.fuel)+"%"})]),h("div",[h("small",{text:"Health"}),h("b",{text:String(d.health==null?"-":d.health)})]),h("div",[h("small",{text:"Status"}),h("b",{text:d.status||"Stored"})])])]),secondary("Back to garage",function(){send("sd_open_garage");})],"sdp-app-screen");
  }
  function pages(d){
    var grid=h("div",{class:"sdp-service-grid"});
    (d.items||[]).forEach(function(x){grid.appendChild(card([h("div",{class:"sdp-service-icon",text:(x.title||"S").slice(0,1)}),h("b",{text:x.title}),h("small",{text:x.body||"Directory"}),primary("Call",function(){if(x.number)send("call",-1,x.number);})]));});
    return page([header("Pages"),grid],"sdp-app-screen");
  }
  function weazel(d){
    var feed=h("div",{class:"sdp-feed"});
    (d.items||[]).forEach(function(x){feed.appendChild(card([h("div",{class:"sdp-post-head"},[h("div",{class:"sdp-avatar"},[h("span",{text:"W"})]),h("div",[h("b",{text:"Weazel News"}),h("small",{text:x.date||"Today"})])]),h("h3",{text:x.name||"Local News"}),h("p",{class:"sdp-prose",text:x.body||""}),x.media?h("img",{class:"sdp-post-media",src:x.media,alt:"news"}):null]) );});
    if(!feed.children.length) feed.appendChild(card([h("b",{text:"No breaking news"}),h("small",{text:"News feed is connected to the phone database."})],"empty"));
    return page([header("Weazel News",{sub:"Los Santos"}),feed],"sdp-app-screen");
  }
  function stocksLive(d){
    var list=h("div",{class:"sdp-list"});
    (d.items||[]).forEach(function(x){list.appendChild(listRow("⌁",x.symbol||"STK",x.name||"",function(){notifyLocal((x.symbol||"Stock")+" added to watchlist.");},x.change||""));});
    return page([header("Stocks",{sub:"Los Santos Exchange"}),card([h("small",{text:"Portfolio value"}),h("strong",{class:"sdp-balance",text:money(state.bankBal)}),h("small",{text:"Watchlist synchronized through phone OS"})]),list],"sdp-app-screen");
  }
  function gameHub(id){
    var a=app(id);return page([header(a.name,{sub:"Online lobby"}),card([h("div",{class:"sdp-app-hero"},[h("span",{class:"sdp-hero-icon tint-purple",text:a.glyph}),h("div",[h("b",{text:a.name}),h("small",{text:a.desc})])])]),h("div",{class:"sdp-button-grid"},[primary("Leaderboard",function(){send("sd_game_scores",-1,id);}),secondary("Quick Play",function(){notifyLocal("Lobby bridge siap. Tambahkan opponent untuk memulai match.");}),secondary("How to Play",function(){notifyLocal("Game data dikirim melalui event phone_os dan server Pawn.");})])],"sdp-app-screen");
  }

  function idGeneric(id){var a=app(id);var descriptions={maps:"Eagle GPS route/checkpoint integration.",pages:"Business and service directory.",weazel:"Community news feed.",darkchat:"Alias-based private communication.",youtube:"Video/media surface.",airdrop:"Nearby file sharing.",passwords:"Private vault surface; connect a secure secrets provider before production.",compass:"Live direction and heading UI.",appstore:"Install and arrange phone apps.",clout:"Short video social surface.",photogram:"Photo social surface.",birdy:"Microblog social surface.",cherry:"Friends social surface.",streaks:"Friend streak tracker.",voice:"Voice memo storage.",files:"Documents and attachments.",casino:"Casino/game launcher.",chess:"Online chess lobby.",connect4:"Connect Four lobby.",battleship:"Battleship lobby.",wordle:"Wordle lobby.",cookie:"Cookie leaderboard.",flappy:"Flappy leaderboard.",blocks:"Blocks leaderboard.",climber:"Climber leaderboard.",mdt:"Police job terminal.",ems:"EMS job terminal.",doj:"DOJ job terminal.",homes:"Housing app.",racing:"Race board and track creator.",ryde:"Ride hailing.",market:"Marketplace.",stocks:"Stock market.",weather:"Weather.",pages:"Business directory.",youtube:"Video/media.",browser:"CEF browser."};return page([header(a.name,{sub:a.cat}),card([h("div",{class:"sdp-app-hero"},[h("span",{class:"sdp-hero-icon tint-"+a.tint,text:a.glyph}),h("div",[h("b",{text:a.name}),h("small",{text:descriptions[id]||a.desc})])])]),card([listRow("✓","Open","Server bridge ready",function(){send("app_action",-1,a.name+" opened");}),listRow("ⓘ","About","Eagle Phone V17",function(){notifyLocal("Eagle Phone application.");})])],"sdp-app-screen");}
  function appstore(){
    var q=h("input",{class:"sdp-search-input",placeholder:"Search App Store"});
    q.dataset.touch="";
    var box=h("div",{class:"sdp-feed"});
    function fill(){
      box.innerHTML="";
      var term=(q.value||"").toLowerCase();
      APPS.filter(function(a){
        return !term || a.name.toLowerCase().indexOf(term)>=0 || a.desc.toLowerCase().indexOf(term)>=0;
      }).forEach(function(a){
        var installed=isInstalled(a.id);
        var action=installed ? pill("INSTALLED","live") : primary("GET",function(){
          state.installed[a.id]=true;
          save();
          fill();
        });
        box.appendChild(card([
          h("div",{class:"sdp-store-row"},[
            h("span",{class:"sdp-hero-icon tint-"+a.tint,text:a.glyph}),
            h("div",[h("b",{text:a.name}),h("small",{text:a.desc})]),
            action
          ])
        ]));
      });
    }
    q.oninput=fill;
    fill();
    return page([header("App Store"),q,box],"sdp-app-screen");
  }
  function settings(){
    var themeBtn=secondary(state.theme==="dark"?"Dark":"Light",function(){state.theme=state.theme==="dark"?"light":"dark";send("theme",-1,state.theme);save();render();});
    var wall=secondary(WALL_LABELS[(+state.wallpaper-1)%WALL_LABELS.length]||"Wallpaper",function(){var next=((+state.wallpaper)%WALLPAPERS.length)+1;send("wall",-1,String(next));});
    return page([header("Settings"),card([sectionLabel("Device"),listRow("◉","Device",""+state.brand+" "+state.model,function(){dialog("Device name",[{name:"brand",label:"Brand",placeholder:state.brand},{name:"model",label:"Model",placeholder:state.model}],"Save",function(v){if(v.brand)send("brand",-1,v.brand);});}),listRow("▣","Software",""+state.os,function(){notifyLocal(state.os);}),listRow("▤","Phone number",state.number||"Not registered",function(){dialog("Register number",[{name:"number",label:"Phone number",placeholder:"0812..."}],"Register",function(v){if(v.number)send("register",-1,v.number);});})]),
      card([sectionLabel("Appearance"),listRow("◐","Theme",state.theme, function(){themeBtn.onclick();}),listRow("▧","Wallpaper",WALL_LABELS[(+state.wallpaper-1)%WALLPAPERS.length],function(){wall.onclick();}),listRow("A","Icon scale",String(Math.round((+state.iconScale||1)*100))+"%",function(){state.iconScale=state.iconScale>=1.2?.85:state.iconScale+.1;save();render();})]),
      card([sectionLabel("Security & Network"),listRow("✈","Airplane mode",state.signal?"Off":"On",function(){send("air");}),listRow("⌁","Ringtone","System ringtone",function(){send("ring");}),listRow("⌑","Passcode","Configure local lock UI",function(){notifyLocal("Passcode storage can be connected here.");})]),
      card([sectionLabel("About"),listRow("ⓘ","About Eagle Phone",state.os,function(){send("about");}),danger("Close phone",function(){send("close");})])],"sdp-app-screen");
  }

  /* ================================================================== */
  /* V18 UI LAYER - deeper app surfaces and iOS-style shell behaviour   */
  /* ================================================================== */
  state.homePage = +state.homePage || 0;
  state.phoneTab = state.phoneTab || "keypad";
  state.notifications = Array.isArray(state.notifications) ? state.notifications : [];
  state.controlCenter = false;
  state.notificationCenter = false;

  function initials(name){
    var parts=String(name||"E").trim().split(/\s+/).filter(Boolean);
    return ((parts[0]||"E")[0]+(parts.length>1?parts[parts.length-1][0]:"")).toUpperCase().slice(0,2);
  }
  function v18Card(kids){return h("section",{class:"sdp-card sdp-v18-card"},kids||[]);}
  function v18IconLabel(g,name,tint){
    return h("button",{type:"button",class:"sdp-app-icon"},[
      h("span",{class:"sdp-icon-bg tint-"+(tint||"gray")},[h("span",{text:g||"•"})]),
      h("span",{class:"sdp-app-label",text:name||"App"})
    ]);
  }
  function touchButton(el){el.dataset.touch="";return el;}

  function appIconV18(id, compact){
    var a=app(id);
    var b=h("button",{class:"sdp-app-icon"+(compact?" compact":""),type:"button"});
    b.dataset.touch="";
    var badge=state.badges[id]&&+state.badges[id]>0?h("em",{class:"sdp-badge",text:+state.badges[id]>99?"99+":String(state.badges[id])}):null;
    b.append(h("span",{class:"sdp-icon-bg tint-"+a.tint},[h("span",{text:a.glyph})]),h("span",{class:"sdp-app-label",text:a.name}),badge);
    b.draggable=!!state.editing;
    b.onclick=function(){
      if(state.editing){notifyLocal("Edit mode: tahan ikon lalu pindahkan.");return;}
      openApp(id);
    };
    b.ondragstart=function(e){if(!state.editing)return;e.dataTransfer.setData("text/plain",id);};
    b.ondragover=function(e){if(state.editing)e.preventDefault();};
    b.ondrop=function(e){if(!state.editing)return;e.preventDefault();var from=e.dataTransfer.getData("text/plain");swapHome(from,id);};
    var pt=0;
    b.addEventListener("pointerdown",function(){pt=Date.now();});
    b.addEventListener("pointerup",function(){if(state.editing)return;if(Date.now()-pt>520){state.editing=true;save();render();}});
    if(state.editing)b.classList.add("jiggle");
    return b;
  }

  function homeV18(){
    var all=getHomeList();
    var pageSize=20;
    var maxPage=Math.max(0,Math.ceil(all.length/pageSize)-1);
    if(state.homePage<0)state.homePage=0;if(state.homePage>maxPage)state.homePage=maxPage;
    var start=state.homePage*pageSize;
    var current=all.slice(start,start+pageSize);
    var grid=h("div",{class:"sdp-home-grid sdp-home-grid-v18"});
    current.forEach(function(id){if(isInstalled(id))grid.appendChild(appIconV18(id));});
    var dots=h("div",{class:"sdp-page-dots-v18"});
    for(var di=0;di<=maxPage;di++)dots.appendChild(h("i",{class:di===state.homePage?"on":""}));
    var top=h("div",{class:"sdp-home-top"});
    var brand=h("div",{class:"sdp-home-brand"},[h("b",{text:state.brand||"Eagle"}),h("span",{text:(state.model||"Pro")+" · "+(state.number||"No SIM")})]);
    var topBtns=h("div",{style:"display:flex;gap:.35rem;"},[
      secondary("⌕",function(){state.spotlight=true;render();}),
      secondary("☷",function(){showControlCenter();})
    ]);
    top.append(brand,topBtns);
    var search=secondary("⌕  Spotlight — apps, people, messages",function(){state.spotlight=true;render();});search.classList.add("wide-search");
    var widgets=h("div",{class:"sdp-widgets-v18"},[
      h("div",{class:"sdp-v18-card sdp-v18-widget wide"},[
        h("div",{class:"sdp-v18-mini-row"},[h("div",{class:"sdp-v18-label",text:"Eagle Phone"}),h("div",{class:"sdp-v18-widget-icon",text:"⌁"})]),
        h("strong",{class:"sdp-v18-big",text:now()}),
        h("div",{class:"sdp-v18-sub",text:longDate()+" · Los Santos"}),
        h("div",{class:"sdp-v18-mini-row"},[h("span",{class:"sdp-v18-sub",text:"Battery"}),h("span",{class:"sdp-v18-sub",text:Math.max(0,Math.min(100,+state.battery||87))+"%"})]),
        h("div",{class:"sdp-v18-slider"},[h("i",{style:"width:"+Math.max(4,Math.min(100,+state.battery||87))+"%"})])
      ]),
      h("div",{class:"sdp-v18-card sdp-v18-widget"},[h("span",{class:"sdp-v18-label",text:"Weather"}),h("strong",{class:"sdp-v18-big",text:"24°"}),h("span",{class:"sdp-v18-sub",text:"Clear · Los Santos"})]),
      h("div",{class:"sdp-v18-card sdp-v18-widget"},[h("span",{class:"sdp-v18-label",text:"Wallet"}),h("strong",{class:"sdp-v18-big",text:money(state.cash)}),h("span",{class:"sdp-v18-sub",text:"Bank "+money(state.bankBal)})])
    ]);
    var dock=h("div",{class:"sdp-dock"});["phone","messages","camera","settings"].forEach(function(id){dock.appendChild(appIconV18(id,true));});
    return page([top,search,widgets,grid,dots,dock,state.editing?h("div",{class:"sdp-home-hint-v18",text:"Drag icon untuk urutkan · ketuk Done untuk selesai"}):null],"sdp-home sdp-home-v18");
  }

  function phoneV18(d){
    var tab=state.phoneTab||"keypad";
    var tabs=h("div",{class:"sdp-phone-tabs-v18"});
    ["favorites","recents","keypad"].forEach(function(t){var b=h("button",{type:"button",class:tab===t?"on":"",text:t==="favorites"?"Favorites":(t==="recents"?"Recents":"Keypad")});b.dataset.touch="";b.onclick=function(){state.phoneTab=t;render();};tabs.appendChild(b);});
    if(tab==="keypad"){
      var number=state.dialNumber||"";
      var display=h("div",{class:"sdp-dial-display",text:number||"Enter number"});
      var keys=h("div",{class:"sdp-dialpad-v18"});
      ["1","2","3","4","5","6","7","8","9","*","0","#"].forEach(function(k){var b=h("button",{type:"button",text:k});b.dataset.touch="";b.onclick=function(){state.dialNumber=(state.dialNumber||"")+k;display.textContent=state.dialNumber;};keys.appendChild(b);});
      var act=h("div",{style:"display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem;"},[
        secondary("⌫",function(){state.dialNumber=(state.dialNumber||"").slice(0,-1);display.textContent=state.dialNumber||"Enter number";}),
        primary("●",function(){if(state.dialNumber)send("call",-1,state.dialNumber);}),
        secondary("Contacts",function(){openApp("contacts");})
      ]);
      return page([header("Phone",{sub:state.number||"No SIM"}),tabs,display,keys,act],"sdp-app-screen");
    }
    var src=(d.items||d.recent||[]);var rows=h("div",{class:"sdp-call-list-v18"});
    if(!src.length){rows.appendChild(v18Card([h("b",{text:tab==="favorites"?"No favorites":"No recent calls"}),h("small",{text:"Riwayat panggilan dari sistem Phone EAGLE akan muncul di sini."})]));}
    src.slice(0,12).forEach(function(c){var num=c.phone||c.number||c.target||c.num||"";var name=c.name||c.sender_name||c.display_name||num||"Unknown";var row=h("button",{type:"button",class:"sdp-call-row-v18"},[
      h("span",{class:"sdp-avatar-v18",text:initials(name)}),h("span",{class:"copy"},[h("b",{text:name}),h("small",{text:(c.date||c.time||"Recent")+" · "+num})]),h("span",{},[h("em",{text:c.missed?"Missed":"Call"})])
    ]);row.dataset.touch="";row.onclick=function(){if(num)send("call",-1,num);};rows.appendChild(row);});
    return page([header("Phone",{sub:state.number||"No SIM"}),tabs,rows],"sdp-app-screen");
  }

  function messagesV18(d){
    var search=h("input",{class:"sdp-search-input",placeholder:"Search messages"});search.dataset.touch="";
    var list=h("div",{class:"sdp-message-list-v18"});var items=d.items||[];var fill=function(){list.innerHTML="";var q=(search.value||"").toLowerCase();var filtered=items.filter(function(x){return !q||String(x.name||"").toLowerCase().indexOf(q)>=0||String(x.preview||"").toLowerCase().indexOf(q)>=0;});filtered.forEach(function(c){var target=c.target||c.num||c.number||"";var row=h("button",{type:"button",class:"sdp-message-preview-v18"},[
      h("span",{class:"sdp-avatar-v18",text:initials(c.name||"Chat")}),h("span",{class:"meta"},[h("b",{text:c.name||"Conversation"}),h("small",{text:c.preview||"No messages"})]),h("span",{class:"right"},[h("small",{text:c.time||""}),(+c.unread||0)?h("span",{class:"sdp-unread-v18",text:+c.unread>99?"99+":String(c.unread)}):null])
    ]);row.dataset.touch="";row.onclick=function(){send("wa_open",-1,target);};list.appendChild(row);});if(!filtered.length)list.appendChild(v18Card([h("b",{text:"No conversations"}),h("small",{text:"Mulai chat baru dari tombol + di atas."})]));};
    search.oninput=fill;fill();
    var newBtn=primary("+",function(){dialog("New message",[{name:"number",label:"Phone number",placeholder:"08..."},{name:"body",label:"Message",placeholder:"Type message",type:"textarea"}],"Send",function(v){if(v.number&&v.body)send("wa_send",-1,v.number+"\t"+v.body);});});
    var groupBtn=secondary("New Group",function(){dialog("Create group",[{name:"name",label:"Group name",placeholder:"Crew"},{name:"numbers",label:"Phone numbers",placeholder:"08...,08..."}],"Create",function(v){if(v.name&&v.numbers)send("wa_group_create",-1,v.name+"\t"+v.numbers);});});
    return page([header("Messages",{action:newBtn}),search,h("div",{style:"display:flex;justify-content:flex-end;"},[groupBtn]),list],"sdp-app-screen");
  }

  function socialV18(d,id){
    var a=app(id);var feed=h("div",{class:"sdp-feed"});var items=d.items||[];
    items.forEach(function(t){
      var box=h("section",{class:"sdp-card sdp-social-card-v18"});
      box.append(h("div",{class:"sdp-post-head"},[
        h("div",{class:"sdp-avatar-v18",text:initials(t.name||"Eagle User")}),
        h("div",{},[h("b",{text:t.name||"Eagle User"}),h("small",{text:t.date||"Now"})])
      ]));
      if(t.body)box.append(h("p",{class:"sdp-prose",text:t.body}));
      if(t.media)box.append(h("img",{src:t.media,alt:"media"}));
      var acts=h("div",{class:"sdp-social-actions-v18"});
      acts.append(secondary("♥ "+(+t.likes||0),function(){send("x_like",+(t.id||0),"");}),secondary("↻ "+(+t.reposts||0),function(){send("x_repost",+(t.id||0),"");}),secondary("Reply",function(){dialog("Reply",[{name:"body",label:"Reply",placeholder:"Write reply",type:"textarea"}],"Send",function(v){if(v.body)send("x_reply",+(t.id||0),v.body);});}));
      box.append(acts);
      feed.appendChild(box);
    });
    if(!feed.children.length)feed.appendChild(v18Card([h("b",{text:"No posts yet"}),h("small",{text:a.name+" terhubung ke backend Phone EAGLE."})]));
    var create=primary("+",function(){dialog("New post",[{name:"body",label:"Post",placeholder:"What's happening?",type:"textarea"},{name:"media",label:"Media URL (optional)",placeholder:"https://..."}],"Post",function(v){if(v.media)send("x_post_media",-1,(v.body||"")+"\t"+v.media);else if(v.body)send("x_post",-1,v.body);});});
    return page([header(a.name,{sub:"Social" ,action:create}),feed],"sdp-app-screen");
  }

  function galleryV18(d){
    var tabs=h("div",{class:"sdp-phone-tabs-v18"});["All","Photos","Videos"].forEach(function(t,i){var b=h("button",{type:"button",class:i===0?"on":"",text:t});b.dataset.touch="";tabs.appendChild(b);});
    var grid=h("div",{class:"sdp-photo-grid"});(d.items||[]).forEach(function(m){var b=h("button",{class:"sdp-photo-card",type:"button"});b.dataset.touch="";if(m.url)b.appendChild(h("img",{src:m.url,alt:m.caption||"photo"}));b.appendChild(h("span",{text:(m.caption||"Photo")+" · "+(m.date||"")}));grid.appendChild(b);});
    if(!grid.children.length)grid.appendChild(v18Card([h("b",{text:"No photos yet"}),h("small",{text:"Camera captures yang memiliki URL akan muncul di Photos."})]));
    return page([header("Photos",{sub:"Library"}),tabs,grid],"sdp-app-screen");
  }

  function mapsV18(){
    return page([header("Maps",{sub:"Los Santos"}),h("div",{class:"sdp-map-hero-v18"},[h("div",{class:"sdp-map-grid-v18"}),h("div",{class:"sdp-map-road-v18"}),h("span",{class:"sdp-map-pin-v18"}),h("div",{style:"position:absolute;left:.7rem;bottom:.6rem;right:.7rem;display:flex;gap:.35rem;"},[pill("GPS","live"),pill("ONLINE")])]),v18Card([h("b",{text:"Quick destinations"}),h("div",{class:"sdp-button-grid"},[secondary("Police",function(){send("service_call",-1,"Police\t112");}),secondary("EMS",function(){send("service_call",-1,"EMS\t118");}),secondary("Garage",function(){openApp("garage");}),secondary("Current position",function(){send("legacy",-1,"gps");})])])],"sdp-app-screen");
  }

  function walletV18(){
    var n=String(state.number||"0000000000");var masked=n.length>4?"•••• "+n.slice(-4):n;
    return page([header("Wallet",{sub:"Eagle Bank"}),h("div",{class:"sdp-bank-card-v18"},[h("span",{class:"sdp-v18-label",text:"EAGLE BANK"}),h("div",{class:"num",text:masked}),h("div",{class:"holder"},[h("div",[h("small",{text:"CARD HOLDER"}),h("b",{text:state.owner||"Unknown"})]),h("div",[h("small",{text:"BALANCE"}),h("b",{text:money(state.bankBal)})])])]),v18Card([h("div",{class:"sdp-wallet-split"},[h("span",[h("small",{text:"Cash"}),h("b",{text:money(state.cash)})]),h("span",[h("small",{text:"Bank"}),h("b",{text:money(state.bankBal)})])])]),h("div",{class:"sdp-button-grid"},[primary("Transfer",function(){send("bank_transfer");}),secondary("Transactions",function(){send("legacy",-1,"bank");})])],"sdp-app-screen");
  }

  function servicesV18(d){
    var grid=h("div",{class:"sdp-service-grid-v18"});(d.items||[]).forEach(function(x){grid.appendChild(v18Card([h("span",{class:"sdp-service-icon",text:(x.title||"S").slice(0,1)}),h("b",{text:x.title||"Service"}),h("small",{text:x.body||"Dispatch"}),primary("Call",function(){if(x.number)send("call",-1,x.number);})]));});
    if(!grid.children.length){["Police","EMS","Taxi","Mechanic","Tow","Government"].forEach(function(name,i){var nums=["112","118","555-0101","555-0102","555-0103","555-0104"];grid.appendChild(v18Card([h("span",{class:"sdp-service-icon",text:name[0]}),h("b",{text:name}),h("small",{text:"Dispatch / call"}),primary("Call",function(){send("call",-1,nums[i]);})]));});}
    return page([header("Services",{sub:"Directory & dispatch"}),grid],"sdp-app-screen");
  }

  function marketV18(d){
    var grid=h("div",{class:"sdp-market-grid-v18"});(d.items||[]).forEach(function(x){grid.appendChild(h("article",{class:"sdp-market-item-v18"},[h("b",{text:x.title||"Listing"}),h("small",{text:x.body||"Marketplace item"}),h("strong",{text:money(x.price||x.value1||0)}),h("small",{text:"Seller: "+(x.seller||"Unknown")})]));});
    if(!grid.children.length)grid.appendChild(v18Card([h("b",{text:"Marketplace kosong"}),h("small",{text:"Belum ada listing aktif."})]));
    return page([header("Marketplace",{action:primary("+",function(){dialog("New Listing",[{name:"title",label:"Title",placeholder:"Vehicle / item"},{name:"price",label:"Price",placeholder:"250000",type:"number"},{name:"body",label:"Description",placeholder:"Description",type:"textarea"}],"Post",function(v){if(v.title&&v.price)send("sd_market_post",-1,v.title+"\t"+v.price+"\t"+(v.body||""));});})}),grid],"sdp-app-screen");
  }

  function garageV18(d){
    var list=h("div",{class:"sdp-list"});(d.items||[]).forEach(function(x){list.appendChild(listRow("▰",x.n||"Vehicle","Plate "+(x.pl||"-")+" · "+(x.st||"Stored"),function(){send("sd_garage_info",+(x.id||0),"");}));});
    if(!list.children.length)list.appendChild(v18Card([h("b",{text:"No vehicles"}),h("small",{text:"Garage akan memuat kendaraan milik karakter Anda."})]));
    return page([header("Garages",{sub:"My vehicles",action:secondary("Refresh",function(){send("sd_open_garage");})}),list],"sdp-app-screen");
  }

  function settingsV18(){
    function row(iconName,title,sub,value,fn,toggle){var r=h("button",{type:"button",class:"sdp-settings-row-v18"},[h("span",{class:"si",text:iconName}),h("span",{},[h("b",{text:title}),h("small",{text:sub||""})])]);
      var right=toggle?h("span",{class:"sdp-toggle-v18 "+(toggle.on?"on":"")},[h("i")]):h("span",{class:"value",text:value||""});r.appendChild(right);r.dataset.touch="";r.onclick=fn;return r;}
    var general=h("div",{class:"sdp-settings-section-v18"},[h("div",{class:"sdp-settings-title-v18",text:"General"})]);
    general.appendChild(row("◉","Device",state.brand+" "+state.model,"",function(){dialog("Device",[{name:"brand",label:"Brand",placeholder:state.brand},{name:"model",label:"Model",placeholder:state.model}],"Save",function(v){if(v.brand)send("brand",-1,v.brand);});}));
    general.appendChild(row("⌁","Phone number",state.number||"No SIM","",function(){dialog("Phone number",[{name:"number",label:"Number",placeholder:"08..."}],"Save",function(v){if(v.number)send("register",-1,v.number);});}));
    general.appendChild(row("◐","Theme","Appearance",state.theme,function(){state.theme=state.theme==="dark"?"light":"dark";send("theme",-1,state.theme);save();render();}));
    general.appendChild(row("▧","Wallpaper","Personalize",WALL_LABELS[(+state.wallpaper-1)%WALL_LABELS.length],function(){send("wall",-1,String(((+state.wallpaper)%WALLPAPERS.length)+1));}));
    var privacy=h("div",{class:"sdp-settings-section-v18"},[h("div",{class:"sdp-settings-title-v18",text:"Network & privacy"})]);
    privacy.appendChild(row("✈","Airplane mode","Disconnect mobile network","",function(){send("air");},{on:!state.signal}));
    privacy.appendChild(row("🔒","Passcode","Lock the phone","",function(){notifyLocal("Passcode screen siap dihubungkan ke account auth EAGLE.");}));
    privacy.appendChild(row("🔔","Notifications","Preview and badges","On",function(){notifyLocal("Notification preview: On");}));
    var about=h("div",{class:"sdp-settings-section-v18"},[h("div",{class:"sdp-settings-title-v18",text:"About"})]);
    about.appendChild(row("ⓘ","Software",state.os,"V18",function(){notifyLocal(state.os+" · EAGLE Phone V18");}));
    about.appendChild(row("♻","Reset local UI","Clear only this device's visual settings","",function(){confirm("Reset UI","Reset theme, wallpaper, icon order and local preferences?",function(){try{localStorage.removeItem("eagle_phone_v18");}catch(e){}state.theme="dark";state.wallpaper=1;state.home=[];state.homePage=0;save();render();});}));
    return page([header("Settings",{sub:state.brand+" "+state.model}),general,privacy,about,danger("Close Phone",function(){send("close");})],"sdp-app-screen");
  }

  function utilityV18(id){
    var a=app(id);
    var body={clock:"Alarms, timers and stopwatch.",calendar:"Server-backed calendar and reminders.",notes:"Private notes with database storage.",files:"Documents, signing and attachments.",voice:"Voice memo metadata and library.",calculator:"Smart calculator.",compass:"Live heading from the character.",health:"Daily steps and wellness summary.",passwords:"Local secure vault surface.",id:"Identity card and licences.",weather:"Current weather and forecast.",stocks:"Los Santos Exchange watchlist."}[id]||a.desc;
    return page([header(a.name,{sub:a.cat}),v18Card([h("div",{class:"sdp-app-hero"},[h("span",{class:"sdp-hero-icon tint-"+a.tint,text:a.glyph}),h("div",[h("b",{text:a.name}),h("small",{text:body})])])]),v18Card([h("b",{text:"Connected"}),h("small",{text:"UI shell, event router dan data bridge aktif."}),primary("Open",function(){if(id==="calendar")send("sd_open_calendar");else if(id==="files")send("sd_open_files");else if(id==="voice")send("sd_open_voice");else if(id==="homes")send("sd_open_homes");else if(id==="garage")send("sd_open_garage");else if(id==="weather")notifyLocal("Weather backend connected.");else if(id==="stocks")send("sd_open_stocks");else if(id==="id")notifyLocal("ID card backend connected.");else if(id==="compass")notifyLocal("Compass follows the player's heading.");else openApp(id);})])],"sdp-app-screen");
  }

  function showPanelV18(kind){
    var wrap=h("div",{class:kind==="cc"?"sdp-control-panel-v18":"sdp-notification-panel-v18"});
    var close=iconButton("×",function(){hidePanelV18();});
    var title=kind==="cc"?"Control Center":"Notifications";
    wrap.appendChild(h("div",{class:"sdp-panel-top-v18"},[h("div",{},[h("b",{text:title}),h("small",{text:kind==="cc"?"Quick controls":"Recent alerts"})]),close]));
    if(kind==="cc"){
      var cc=h("div",{class:"sdp-cc-grid-v18"});
      function tile(label,sub,on,fn,wide){var b=h("button",{type:"button",class:"sdp-cc-tile-v18 "+(on?"on":"")+(wide?" sdp-cc-wide-v18":"")},[h("b",{text:label}),h("small",{text:sub})]);b.dataset.touch="";b.onclick=fn;cc.appendChild(b);}
      tile("Airplane mode",state.signal?"Off":"On",!state.signal,function(){send("air");showControlCenter();});
      tile("Theme",state.theme,state.theme==="dark",function(){state.theme=state.theme==="dark"?"light":"dark";send("theme",-1,state.theme);save();showControlCenter();});
      tile("Camera","Open camera",false,function(){hidePanelV18();openApp("camera");});
      tile("Silent mode","Phone sounds",false,function(){notifyLocal("Silent mode UI ready.");});
      tile("Brightness","72%",true,function(){notifyLocal("Brightness follows the game display bridge.");},true);
      tile("Focus","Personal",false,function(){notifyLocal("Focus profile: Personal");},true);
      wrap.appendChild(cc);
    }else{
      if(!state.notifications.length)wrap.appendChild(v18Card([h("b",{text:"No notifications"}),h("small",{text:"Notifikasi panggilan, pesan dan server akan muncul di sini."})]));
      state.notifications.slice().reverse().slice(0,20).forEach(function(n){wrap.appendChild(h("div",{class:"sdp-notification-item-v18"},[h("span",{class:"ni",text:n.icon||"•"}),h("div",{},[h("b",{text:n.title||"Eagle Phone"}),h("small",{text:n.body||""}),h("small",{text:n.time||"Now"})])]));});
      wrap.appendChild(secondary("Clear all",function(){state.notifications=[];hidePanelV18();render();}));
    }
    modalLayer.innerHTML="";modalLayer.classList.add("show");modalLayer.appendChild(wrap);E.touch();
  }
  function hidePanelV18(){modalLayer.classList.remove("show");modalLayer.innerHTML="";state.controlCenter=false;state.notificationCenter=false;}
  function showControlCenter(){state.controlCenter=true;showPanelV18("cc");}
  function showNotifications(){state.notificationCenter=true;showPanelV18("notifications");}

  /* Override shell routes with the V18 surfaces. */
  home=homeV18;
  appIcon=appIconV18;
  contacts=function(d){return contactsV18(d);};
  messages=messagesV18;
  gallery=galleryV18;
  wallet=walletV18;
  settings=settingsV18;
  services=servicesV18;
  market=marketV18;
  garage=garageV18;
  maps=mapsV18;
  xfeed=function(d,id){return socialV18(d,id);};
  dialer=phoneV18;

  function contactsV18(d){
    var items=d.items||d.contacts||state.items||[];var q=h("input",{class:"sdp-search-input",placeholder:"Search contacts"});q.dataset.touch="";
    var list=h("div",{class:"sdp-list"});function fill(){list.innerHTML="";var term=(q.value||"").toLowerCase();items.filter(function(c){return !term||String(c.name||"").toLowerCase().indexOf(term)>=0||String(c.phone||c.number||"").indexOf(term)>=0;}).forEach(function(c){var num=c.phone||c.number||c.target||"";list.appendChild(listRow("●",c.name||"Contact",num,function(){state.dialNumber=num;state.phoneTab="keypad";openApp("phone");},c.on?"Online":""));});if(!list.children.length)list.appendChild(v18Card([h("b",{text:"No contacts"}),h("small",{text:"Tambahkan contact melalui tombol +."})]));}q.oninput=fill;fill();
    return page([header("Contacts",{action:primary("+",function(){dialog("Add Contact",[{name:"number",label:"Number",placeholder:"08..."},{name:"name",label:"Name",placeholder:"Contact name"}],"Save",function(v){if(v.number&&v.name)send("contact_add_cef",-1,v.number+"\t"+v.name);});})}),q,list],"sdp-app-screen");
  }

  /* ================================================================== */
  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */
  function appScreen(d){
    var id=state.scr;
    if(id==="phone"||id==="dial")return dialer();
    if(id==="contacts")return contacts(d);
    if(id==="messages"||id==="whatsapp")return messages(d);
    if(id==="whatsapp_chat")return chat(d);
    if(id==="mail")return mail(d);
    if(id==="mail_view")return mailView(state.mailCurrent||{});
    if(id==="notes")return notesScreen(d);
    if(id==="gallery")return gallery(d);
    if(id==="camera")return camera();
    if(id==="settings")return settings();
    if(id==="radio")return radio(d);
    if(id==="wallet")return wallet();
    if(id==="id")return idcard();
    if(id==="health")return health();
    if(id==="calculator")return calculator();
    if(id==="clock")return clock();
    if(id==="calendar")return calendar(d);
    if(id==="market")return market(d);
    if(id==="ryde")return ryde(d);
    if(id==="racing")return racing(d);
    if(id==="files")return files(d);
    if(id==="voice")return voice(d);
    if(id==="homes")return homes(d);
    if(id==="garage")return garage(d);
    if(id==="garage_view")return garageView(d);
    if(id==="pages")return pages(d);
    if(id==="weazel")return weazel(d);
    if(id==="stocks")return stocksLive(d);
    if(id==="services")return services(d);
    if(id==="weather")return weather();
    if(id==="stocks")return stocks();
    if(id==="music")return music();
    if(id==="browser")return browser();
    if(id==="appstore")return appstore();
    if(id==="x"||["photogram","birdy","cherry","clout","streaks"].indexOf(id)>=0)return xfeed(d,id);
    if(["mdt","ems","doj"].indexOf(id)>=0)return jobApp(id,d);
    if(id==="gameboard")return gameboard(d);
    if(["casino","chess","connect4","battleship","wordle","cookie","flappy","blocks","climber"].indexOf(id)>=0)return gameHub(id);
    return idGeneric(id);
  }
  function gameboard(d){var id=d.game||state.game||"game";var a=app(id);var rows=(d.items||[]).map(function(x,i){return h("div",{class:"sdp-score-row"},[h("b",{text:String(i+1).padStart(2,"0")}),h("span",{text:x.owner||x.title||"Player"}),h("strong",{text:x.score||"0"})]);});return page([header(a.name),card([h("b",{text:"Leaderboard"}),h("small",{text:"Server-backed scores"})]),h("div",{class:"sdp-score-list"},rows.length?rows:[h("div",{class:"sdp-empty-line",text:"No scores yet."})]),primary("Submit score",function(){dialog("Submit score",[{name:"score",label:"Score",placeholder:"1000",type:"number"}],"Submit",function(v){send("sd_game_score",-1,id+"\t"+(v.score||"0"));});})],"sdp-app-screen");}

  function render(){
    if(!state.show){root.classList.remove("visible");return;}
    root.classList.add("visible");renderWallpaper();paintStatus();screen.innerHTML="";
    screen.style.setProperty("--sdp-scale",String(Math.max(.85,Math.min(1.2,+state.iconScale||1))));
    var v;if(state.scr==="lock")v=lock();else if(state.scr==="home")v=home();else if(state.scr==="drawer")v=drawer();else if(state.spotlight)v=spotlight();else v=appScreen(state);
    screen.appendChild(v);
    homeIndicator.classList.toggle("hidden",state.scr==="lock");
    bottomBar.classList.toggle("hidden",state.scr==="lock"||state.scr==="camera");
    dynamicIsland.classList.toggle("show",state.scr!=="lock");
    dynamicIsland.textContent=state.scr!=="home"&&state.scr!=="drawer"?app(state.scr).name:"Eagle Phone";
    dynamicIsland.onclick=function(){state.scr="home";state.currentApp="home";state.spotlight=false;render();send("home");};
    homeIndicator.onclick=function(){if(state.scr!=="home"&&state.scr!=="lock"){state.scr="home";render();send("home");}else send("close");};
    E.touch();
  }

  /* ------------------------------------------------------------------ */
  /* BACKEND EVENTS                                                     */
  /* ------------------------------------------------------------------ */
  E.on("phone_os",function(d){
    if(!d)return;
    if(d.show===0||d.show===false){state.show=false;root.classList.remove("visible");return;}
    state.show=true;
    Object.keys(d).forEach(function(k){if(k!=="items"&&k!=="messages")state[k]=d[k];});
    if(d.items)state.items=d.items;
    if(d.messages)state.messages=d.messages;
    if(d.scr)state.scr=d.scr;
    if(d.target)state.chatTarget=d.target;
    if(d.targetName)state.chatName=d.targetName;
    if(d.cash!=null)state.cash=+d.cash||0;
    if(d.bankBal!=null)state.bankBal=+d.bankBal||0;
    state.currentApp=(d.scr&&d.scr!=="home"&&d.scr!=="lock")?d.scr:"home";
    render();
  });

  E.on("phone",function(d){
    if(!d)return;
    if(d.scr==="call"){
      modalLayer.innerHTML="";modalLayer.classList.add("show");
      var box=h("div",{class:"sdp-call-overlay"},[
        h("div",{class:"sdp-call-avatar",text:(d.name||"?").slice(0,1).toUpperCase()}),
        h("small",{text:d.st||"Incoming call"}),
        h("h2",{text:d.name||"Phone"}),
        h("div",{class:"sdp-call-buttons"},[danger("Decline",function(){closeModal();send("decline");}),primary(+d.mode===1?"Accept":"Hang Up",function(){closeModal();send(+d.mode===1?"accept":"hangup");})])
      ]);modalLayer.appendChild(box);E.touch();
    }
  });
  E.on("phone_badge",function(d){if(!d)return;state.badges[d.app||""]=+d.count||0;render();});
  E.on("phone_notification",function(d){if(!d)return;state.notifications.push({title:d.title||"Eagle Phone",body:d.body||"",icon:d.icon||"•",time:now()});if(state.notifications.length>40)state.notifications.shift();notifyLocal((d.title?d.title+": ":"")+(d.body||""));});
  E.on("phone_camera_result",function(d){if(!d)return;var u=d.url||d.uri||d.path||"";if(u)send("media_save",-1,String(u)+"\t"+String(d.caption||""));});

  /* Gestures */
  var touchStart=null;
  glass.addEventListener("touchstart",function(e){var t=e.touches&&e.touches[0];if(t)touchStart={x:t.clientX,y:t.clientY};},true);
  glass.addEventListener("touchend",function(e){if(!touchStart)return;var t=e.changedTouches&&e.changedTouches[0];if(!t)return;var dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;var sx=Math.abs(dx),sy=Math.abs(dy);var fromTop=touchStart.y<115;touchStart=null;if(state.scr==="lock"&&dy<-80){send("unlock");return;}if(fromTop&&dy>70&&!state.editing){showNotifications();return;}if(fromTop&&dy<-70&&!state.editing){showControlCenter();return;}if(state.scr==="home"&&sx>90&&sx>sy*1.15){var pages=Math.max(0,Math.ceil(getHomeList().length/20)-1);if(pages>0){state.homePage=Math.max(0,Math.min(pages,state.homePage+(dx<0?1:-1)));save();render();}return;}if(dy>100&&state.scr!=="lock"){state.spotlight=true;render();return;}if(dy<-100&&state.scr!=="lock"){send("drawer");return;}},true);
  document.addEventListener("keydown",function(e){if(!state.show)return;if(e.key==="Escape")backLocal();});
  setInterval(function(){if(state.show){paintStatus();var tm=screen.querySelector(".sdp-lock-time,.sdp-big-time");if(tm)tm.textContent=now();}},1000);

  window.EaglePhoneOS={
    show:function(){send("unlock");},
    hide:function(){send("close");},
    open:function(id){openApp(id);},
    notify:function(t){state.notifications.push({title:"Eagle Phone",body:t,time:now()});notifyLocal(t);},
    notifications:function(){showNotifications();},
    controlCenter:function(){showControlCenter();}
  };
  render();
})();
