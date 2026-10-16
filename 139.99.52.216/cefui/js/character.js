/* BRL clothes on the EAGLE CEF bridge. Editor opens only after a server/native grant. */
(function(){
  'use strict';
  var E=window.EAGLE,fields=['gender','bodyType','skinTone','face','hair','hairColor','eyebrows','beard','makeup','top','jacket','pants','shoes','hat','glasses','mask','watch','necklace','bag','accessory','tattoo','freckles'];
  var s={open:false,nonce:0,session:0,request:0,revision:0,ready:false,pending:false,serverReady:false,mode:'creator',required:false,catalog:null,look:null,confirmed:null,owned:[],prices:{},money:0,category:'skin'};
  var previewTimer=0,retry=0,pendingTimer=0,serverState=null;
  function token(d){return !!d && +d.nonce===s.nonce && +d.session===s.session && s.nonce>0 && s.session>0;}
  function validToken(d){return d && Number.isInteger(+d.nonce) && +d.nonce>0 && +d.nonce<=1000000000 && Number.isInteger(+d.session) && +d.session>0 && +d.session<=2147483647;}
  function timers(){clearTimeout(previewTimer);clearTimeout(pendingTimer);clearInterval(retry);previewTimer=pendingTimer=retry=0;}
  function canCommit(item){
    if(!s.open||s.pending||!s.serverReady||!s.ready||!s.catalog||!s.look||s.revision<1)return false;
    if(item && (s.mode!=='shop'||s.owned.indexOf(item)>=0||!Number.isInteger(s.prices[item])||s.money<s.prices[item]))return false;
    var selected=['top','pants','shoes'].map(function(k){return s.look[k];});
    return (!item||selected.indexOf(item)>=0) && selected.every(function(id){return !id||id===item||s.owned.indexOf(id)>=0;});
  }
  var layer=document.createElement('section');layer.id='eagle-character';layer.hidden=true;document.getElementById('app').appendChild(layer);
  layer.innerHTML='<header class="ec-header" data-touch><div><span class="ec-eyebrow">EAGLE / CLOTHING STORE</span><h1>Pilih gaya Anda</h1></div><button class="ec-close" data-touch aria-label="Tutup">×</button></header><nav class="ec-mode-tabs" data-touch><button data-collection="all">CLOTHING</button><button data-collection="owned">KOLEKSI SAYA</button></nav><nav class="ec-nav" data-touch aria-label="Kategori pakaian"></nav><aside class="ec-panel" data-touch><div class="ec-panel-heading"><span id="ec-step"></span><span id="ec-money"></span></div><div class="ec-options"></div><p id="ec-message" role="status">Menyiapkan pakaian…</p><button id="ec-save" class="ec-primary">Simpan</button><small class="ec-save-note">Pakaian yang dibeli tersedia di inventory.</small></aside><div class="ec-orbit" data-touch><span>GESER UNTUK MEMUTAR KARAKTER</span></div><footer class="ec-camera" data-touch><button data-camera="left" aria-label="Putar kiri">↶</button><button data-camera="minus" aria-label="Perkecil">−</button><button data-camera="reset">Reset kamera</button><button data-camera="plus" aria-label="Perbesar">+</button><button data-camera="right" aria-label="Putar kanan">↷</button></footer>';
  var ownedOnly=false;
  layer.querySelectorAll('[data-collection]').forEach(function(b){b.onclick=function(){ownedOnly=b.dataset.collection==='owned';render();};});

  var nav=layer.querySelector('.ec-nav'),options=layer.querySelector('.ec-options'),message=layer.querySelector('#ec-message'),save=layer.querySelector('#ec-save');
  function clone(a){return a?JSON.parse(JSON.stringify(a)):null;}
  function local(action,data){var d=data||{};d.action=action;d.nonce=s.nonce;d.session=s.session;if(window.CefBridge&&window.CefBridge.sendClientEvent)window.CefBridge.sendClientEvent('eagle_character_local',JSON.stringify(d));}
  function begin(){if(s.nonce&&s.session)local('begin');}
  function money(n){return '$'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
  function limits(){return s.catalog.limits[s.look.gender?'female':'male'];}
  function normalize(){
    var a=s.look,c=limits();a.bodyType=1;
    a.face=Math.max(1,Math.min(a.face,c.faces[a.skinTone-1]));a.hair=Math.max(1,Math.min(a.hair,c.hair.length));a.hairColor=Math.max(1,Math.min(a.hairColor,c.hair[a.hair-1]));
    ['top','pants','shoes'].forEach(function(k){var base=k==='top'?100:k==='pants'?300:400,style=a[k]?a[k]-base:0,color=k==='top'?'jacket':k==='pants'?'hat':'freckles';
      if(style<1||style>c[k].length||!c[k][style-1]){if(a.gender||k==='pants')a[k]=base+1;else a[k]=0;style=a[k]?a[k]-base:0;}
      a[color]=Math.max(1,Math.min(a[color],style?c[k][style-1]:k==='shoes'?55:35));
    });
    if(a.gender)a.beard=0;else a.makeup=0;
  }
  function preview(){
    if(!s.open||s.pending||!s.catalog||!s.look)return;
    normalize();s.ready=false;s.request++;clearTimeout(previewTimer);
    var request=s.request,nonce=s.nonce,session=s.session,look=clone(s.look);
    previewTimer=setTimeout(function(){
      previewTimer=0;
      if(s.open&&!s.pending&&s.nonce===nonce&&s.session===session&&s.request===request)
        local('preview',{appearance:look,request:request});
    },35);render();
  }
  function section(title){var b=document.createElement('div');b.className='ec-field';var h=document.createElement('h3');h.textContent=title;b.appendChild(h);options.appendChild(b);return b;}
  function button(label,fn){var b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=s.pending;b.onclick=fn;return b;}
  function select(title,value,min,max,change){
    var b=section(title),controls=document.createElement('div');controls.className='ec-stepper';
    var el=document.createElement('select');el.className='ec-select';el.disabled=s.pending;el.setAttribute('aria-label',title);
    for(var n=min;n<=max;n++){var o=document.createElement('option');o.value=n;o.textContent=n===0?'Tanpa':title==='Wajah'&&s.catalog.faceNames?s.catalog.faceNames[s.look.gender?'female':'male'][n-1]:String(n).padStart(2,'0');el.appendChild(o);}
    el.value=value;el.onchange=function(){change(+el.value);preview();};
    function step(delta){var n=+el.value+delta;if(n>max)n=min;if(n<min)n=max;change(n);preview();}
    var prev=button('‹',function(){step(-1);}),next=button('›',function(){step(1);});
    prev.setAttribute('aria-label',title+' sebelumnya');next.setAttribute('aria-label',title+' berikutnya');prev.disabled=next.disabled=s.pending||min===max;
    controls.appendChild(prev);controls.appendChild(el);controls.appendChild(next);b.appendChild(controls);
  }
  function available(k){return s.catalog.items.filter(function(i){return i.slot===k&&i.bodies.indexOf(s.look.gender?'female_normal':'male_normal')>=0&&(!(ownedOnly||s.mode==='wardrobe')||s.owned.indexOf(i.id)>=0);}).sort(function(a,b){return a.id-b.id;});}
  function choose(k,item){
    ['top','pants','shoes'].forEach(function(other){if(other!==k&&s.owned.indexOf(s.look[other])<0&&s.confirmed){s.look[other]=s.confirmed[other];var color=other==='top'?'jacket':other==='pants'?'hat':'freckles';s.look[color]=s.confirmed[color];}});
    s.look[k]=item.id;s.look[k==='top'?'jacket':k==='pants'?'hat':'freckles']=1;s.category=k;
    local('focus',{area:k==='shoes'?'shoes':'body'});preview();
  }
  function clothesRow(k,title){
    var a=s.look,c=limits(),list=available(k),base=k==='top'?100:k==='pants'?300:400,color=k==='top'?'jacket':k==='pants'?'hat':'freckles';
    var row=section(title);row.classList.add('ec-garment');row.dataset.category=k;
    if(!list.length){var empty=document.createElement('p');empty.className='ec-empty';empty.textContent='Belum ada item dalam koleksi ini.';row.appendChild(empty);return;}
    var selected=s.catalog.items.find(function(i){return i.id===a[k];}),at=list.findIndex(function(i){return i.id===a[k];});
    var pair=document.createElement('div');pair.className='ec-pair';row.appendChild(pair);
    function arrows(label,value,prev,next){var box=document.createElement('div');box.className='ec-choice';var caption=document.createElement('small');caption.textContent=label;box.appendChild(caption);var wrap=document.createElement('div');wrap.className='ec-stepper';var v=document.createElement('span');v.textContent=value;var l=button('‹',prev),r=button('›',next);l.setAttribute('aria-label',title+' '+label+' sebelumnya');r.setAttribute('aria-label',title+' '+label+' berikutnya');wrap.appendChild(l);wrap.appendChild(v);wrap.appendChild(r);box.appendChild(wrap);pair.appendChild(box);return [l,r];}
    var itemArrows=arrows('ITEM',String(a[k]||'—'),function(){choose(k,list[(at-1+list.length)%list.length]);},function(){choose(k,list[(at+1)%list.length]);});
    if(list.length===1)itemArrows.forEach(function(b){b.disabled=true;});
    var style=a[k]?a[k]-base:0,count=style?c[k][style-1]:k==='shoes'?55:35;
    var colorArrows=arrows('TEXTURE',String(a[color]).padStart(2,'0')+' / '+count,function(){a[color]=a[color]<=1?count:a[color]-1;preview();},function(){a[color]=a[color]>=count?1:a[color]+1;preview();});
    if(count<=1)colorArrows.forEach(function(b){b.disabled=true;});
    var summary=document.createElement('div');summary.className='ec-garment-summary';
    var label=document.createElement('span');label.textContent=selected?selected.label:'Tanpa '+title.toLowerCase();summary.appendChild(label);
    var owned=s.owned.indexOf(a[k])>=0,status=document.createElement('small');status.textContent=owned?'DIMILIKI':a[k]?money(s.prices[a[k]]||0):'';status.className=owned?'ec-owned':'';summary.appendChild(status);row.appendChild(summary);
    if(a[k]&&!owned&&s.mode==='shop') {var buy=button('Beli '+title.toLowerCase(),function(){commit(a[k]);});buy.className='ec-buy';buy.disabled=!canCommit(a[k]);buy.dataset.buy=a[k];row.appendChild(buy);}
    if(!a.gender&&k!=='pants'){var remove=button('Lepas '+title.toLowerCase(),function(){a[k]=0;a[color]=1;preview();});remove.className='ec-remove';row.appendChild(remove);}
  }

  function field(title,k,min,max){select(title,s.look[k],min,max,function(n){s.look[k]=n;});}
  function packed(title,k,styles,colors){var n=s.look[k],style=Math.floor(n/100),color=n%100||1;
    select(title,style,0,styles,function(v){s.look[k]=v?v*100+color:0;});
    if(style)select('Warna '+title,color,1,colors,function(v){s.look[k]=style*100+v;});
  }
  function tattoo(title,k,side,max){var n=s.look[k],value=side? n%100:Math.floor(n/100);select(title,value,0,max,function(v){s.look[k]=side?Math.floor(n/100)*100+v:v*100+n%100;});}
  function render(){
    if(!s.open)return;save.disabled=!canCommit(0);save.textContent=s.pending?'Menyimpan…':'Simpan pilihan';
    document.getElementById('ec-money').textContent=money(s.money);nav.replaceChildren();options.replaceChildren();
    layer.dataset.mode=s.mode;layer.querySelector('h1').textContent=s.mode==='creator'?'Karakter Anda':s.mode==='shop'?'Clothing Store':'Koleksi pakaian';
    layer.querySelector('.ec-mode-tabs').hidden=s.mode==='creator';layer.querySelectorAll('[data-collection]').forEach(function(b){b.classList.toggle('is-selected',(b.dataset.collection==='owned')===ownedOnly);});
    var cats=s.mode==='creator'?[['skin','Kulit'],['face','Wajah'],['hair','Rambut'],['detail','Detail'],['tattoo','Tato']]:[['top','Atasan'],['pants','Celana'],['shoes','Sepatu']];
    cats.forEach(function(c){var b=button(c[1],function(){s.category=c[0];local('focus',{area:['face','hair','detail'].indexOf(c[0])>=0?'face':c[0]==='shoes'?'shoes':'body'});render();});b.className=c[0]===s.category?'is-selected':'';nav.appendChild(b);});
    document.getElementById('ec-step').textContent=(cats.find(function(c){return c[0]===s.category;})||cats[0])[1];
    if(!s.catalog||!s.look){section('Memuat katalog pakaian…');return;}
    var a=s.look,c=limits();
    if(s.category==='skin'){var b=section('Gender');b.appendChild(button('Pria',function(){a.gender=0;preview();}));b.appendChild(button('Wanita',function(){a.gender=1;preview();}));field('Warna kulit','skinTone',1,6);}
    else if(s.category==='face')field('Wajah','face',1,c.faces[a.skinTone-1]);
    else if(s.category==='hair'){field('Gaya rambut','hair',1,c.hair.length);field('Warna rambut','hairColor',1,c.hair[a.hair-1]);}
    else if(s.category==='detail'){packed('Alis','eyebrows',5,54);if(!a.gender)packed('Janggut','beard',5,54);if(a.gender)packed('Makeup','makeup',5,26);}
    else if(s.category==='tattoo'){tattoo('Lengan kiri','tattoo',0,38);tattoo('Lengan kanan','tattoo',1,38);tattoo('Kaki kiri','mask',0,26);tattoo('Kaki kanan','mask',1,26);tattoo('Punggung','necklace',0,16);tattoo('Dada','necklace',1,25);}
    else {clothesRow('top','Atasan');clothesRow('pants','Celana');clothesRow('shoes','Sepatu');}
    if(s.mode!=='creator'){
      nav.querySelectorAll('button').forEach(function(b,index){var icon=document.createElement('span');icon.className='ec-category-icon';icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">'+['<path d="M8 3l4 2 4-2 5 4-3 4-2-1v11H8V10l-2 1-3-4z"/>','<path d="M6 3h12l2 18h-6l-2-12-2 12H4zM6 7h12"/>','<path d="M4 6h6l2 5 8 4v5H3v-8zM3 17h17M13 12l-2 2m5 0l-2 2"/>'][index]+'</svg>';b.prepend(icon);});
    }

    if(E.touch)E.touch();
  }
  function commit(item){
    if(!canCommit(item))return;
    var values=[s.nonce,s.revision].concat(fields.map(function(k){return s.look[k];}));
    if(values.some(function(n){return !Number.isSafeInteger(n)||n<0||n>2147483647;}))return;
    clearTimeout(previewTimer);s.pending=true;message.textContent='Memeriksa pilihan…';render();
    E.send('character',item?'buy':'save',item||0,values.join(','));
    var nonce=s.nonce,session=s.session;
    clearTimeout(pendingTimer);pendingTimer=setTimeout(function(){
      if(s.open&&s.pending&&s.nonce===nonce&&s.session===session)
        message.textContent='Masih menunggu server. Tunggu hasil transaksi sebelum mencoba kembali.';
    },10000);
  }
  save.onclick=function(){commit(0);};
  function close(){timers();s.open=false;s.ready=false;s.pending=false;s.serverReady=false;s.nonce=0;s.session=0;s.request=0;layer.hidden=true;}
  layer.querySelector('.ec-close').onclick=function(){if(s.nonce&&!s.required)E.send('character','close',s.nonce,String(s.session));};
  function applyServer(d){
    if(!token(d)||!Number.isInteger(+d.revision)||+d.revision<1||+d.revision<s.revision)return;
    s.confirmed=clone(d.appearance);s.revision=+d.revision;s.owned=d.owned||[];s.prices=d.prices||{};s.money=+d.money;
    s.serverReady=+d.catalogRevision===8;
    if(typeof d.pending==='boolean')s.pending=d.pending;
    if(!s.serverReady){s.ready=false;message.textContent='Katalog server belum diperbarui.';}
    if(!s.look)s.look=clone(d.appearance);render();
  }
  E.on('eagle_character_open',function(d){
    if(!validToken(d))return;
    var same=token(d);
    if(!same){
      timers();s.open=false;layer.hidden=true;s.nonce=+d.nonce;s.session=+d.session;
      s.look=null;s.confirmed=null;s.revision=0;s.owned=[];s.prices={};s.money=0;s.serverReady=false;
      s.request=0;s.ready=false;s.pending=false;
    }
    s.required=!!d.required;s.mode=d.mode||'creator';if(!same)ownedOnly=s.mode==='wardrobe';s.category=s.mode==='creator'?'skin':'top';
    layer.querySelector('.ec-close').hidden=s.required;
    if(!same&&serverState&&token(serverState))applyServer(serverState);
    begin();clearInterval(retry);var attempts=0,nonce=s.nonce,session=s.session;
    retry=setInterval(function(){
      if(s.nonce!==nonce||s.session!==session||s.ready){clearInterval(retry);return;}
      begin();if(++attempts>=10)clearInterval(retry);
    },1000);
  });
  E.on('eagle_character_ui_authorized',function(d){
    if(!token(d))return;s.mode=d.mode;s.open=true;layer.hidden=false;
    if(!s.pending&&!s.ready)message.textContent='Menyiapkan pakaian…';render();
  });
  E.on('eagle_character_catalog',function(d){
    if(!token(d))return;
    if(d.version!==2||d.revision!==8||d.renderer!=='brl_material'){
      s.catalog=null;s.ready=false;message.textContent='Versi clothes client/server berbeda.';render();return;
    }
    s.catalog=d;render();
  });
  E.on('eagle_character_local_state',function(d){
    if(!token(d)||!Number.isInteger(+d.request)||+d.request<s.request||(s.pending&&s.request!==0))return;
    // A CEF reload adopts the native preview serial; a begin retry cannot undo
    // an edit still waiting in the debounce timer.
    s.request=+d.request;s.look=clone(d.appearance);render();
  });
  E.on('eagle_character_server_state',function(d){
    if(!d||!Number.isInteger(+d.session)||+d.session<1||!Number.isInteger(+d.nonce)||+d.nonce<0)return;
    if(!serverState||+d.session>=+serverState.session)serverState=clone(d);
    if(token(d))applyServer(d);
  });
  E.on('eagle_character_preview_status',function(d){
    if(!token(d)||+d.request!==s.request)return;s.ready=!!d.ready;
    if(!s.pending)message.textContent=s.ready?'Pilihan tampil pada karakter.':'Memuat tekstur pakaian…';render();
  });
  E.on('eagle_character_saved',function(d){
    if(!token(d)||+d.revision!==s.revision)return;
    clearTimeout(pendingTimer);s.pending=false;message.textContent='Pilihan tersimpan.';render();
  });
  E.on('eagle_character_error',function(d){
    if(!token(d)|| (d.origin!=='server'&&Number.isInteger(+d.request)&&+d.request!==s.request))return;
    // Native texture diagnostics do not cancel a transaction already sent.
    if(d.origin==='server'){s.pending=!!d.pending;if(!s.pending)clearTimeout(pendingTimer);}
    message.textContent=d.message||'Pilihan belum tersedia.';render();
  });
  E.on('eagle_character_close',function(d){if(token(d))close();});
  E.on('CLOSE_CLOTHES_UI',function(d){if(token(d))close();});
  var orbit=layer.querySelector('.ec-orbit'),x=null;orbit.onpointerdown=function(e){x=e.clientX;orbit.setPointerCapture(e.pointerId);};orbit.onpointermove=function(e){if(x===null)return;local('rotate',{delta:(e.clientX-x)*.006});x=e.clientX;};orbit.onpointerup=orbit.onpointercancel=function(){x=null;};
  layer.querySelectorAll('[data-camera]').forEach(function(b){b.onclick=function(){var a=b.dataset.camera;if(a==='reset')local('cameraReset');else if(a==='left'||a==='right')local('rotate',{delta:a==='left'?-.25:.25});else local('zoom',{delta:a==='plus'?-.25:.25});};});
  document.addEventListener('keydown',function(e){if(s.open&&e.key==='Escape')layer.querySelector('.ec-close').click();});
  E.done('character');
})();
