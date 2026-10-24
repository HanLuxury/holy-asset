/* EAGLE modular creator. All previews use the existing JNI event bridge;
   only save/buy/close cross RakNet. No client-supplied asset paths or prices. */
(function () {
  'use strict';
  var E=window.EAGLE, fields=['gender','bodyType','skinTone','face','hair','hairColor','eyebrows','beard','makeup','top','jacket','pants','shoes','hat','glasses','mask','watch','necklace','bag','accessory','tattoo','freckles'];
  var state={open:false,required:false,mode:'creator',catalog:null,serverCatalog:0,look:null,confirmed:null,nonce:0,revision:0,owned:[],prices:{},money:0,category:'identity',pending:false,ready:false}, previewTimer=0, retry=0;
  var layer=document.createElement('section');layer.id='eagle-character';layer.hidden=true;layer.setAttribute('aria-label','Karakter Eagle');document.getElementById('app').appendChild(layer);
  layer.innerHTML='<header class="ec-header"><div><span class="ec-eyebrow">EAGLE / PERSONAL</span><h1 id="ec-title">Karakter Anda</h1></div><button class="ec-close" data-touch aria-label="Tutup">×</button></header><nav class="ec-nav" data-touch aria-label="Kategori"></nav><aside class="ec-panel" data-touch><div class="ec-panel-heading"><span id="ec-step">IDENTITAS</span><span id="ec-money"></span></div><div class="ec-options"></div><p id="ec-message" role="status">Menyiapkan karakter…</p><button id="ec-save" class="ec-primary">Simpan karakter</button></aside><div class="ec-orbit" data-touch aria-label="Geser untuk memutar karakter"><span>GESER UNTUK MEMUTAR</span></div><footer class="ec-camera" data-touch><button data-camera="left" aria-label="Putar kiri">↶</button><button data-camera="minus" aria-label="Perkecil">−</button><button data-camera="reset">Reset kamera</button><button data-camera="plus" aria-label="Perbesar">+</button><button data-camera="right" aria-label="Putar kanan">↷</button></footer>';
  var options=layer.querySelector('.ec-options'),nav=layer.querySelector('.ec-nav'),message=layer.querySelector('#ec-message'),save=layer.querySelector('#ec-save');
  function clone(o){return JSON.parse(JSON.stringify(o));}
  function local(action,data){var p=data||{};p.action=action;if(window.CefBridge&&window.CefBridge.sendClientEvent) window.CefBridge.sendClientEvent('eagle_character_local',JSON.stringify(p));}
  function money(n){return '$'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
  function bodyKey(){return (state.look.gender?'female_':'male_')+['slim','normal','large'][state.look.bodyType];}
  function text(tag,content,cls){var n=document.createElement(tag);n.textContent=content;if(cls)n.className=cls;return n;}
  function button(label,active,fn){var n=text('button',label,active?'is-selected':'');n.type='button';n.disabled=state.pending;n.setAttribute('aria-pressed',String(!!active));n.onclick=fn;return n;}
  function section(title){var block=text('div','', 'ec-field');block.appendChild(text('h3',title));options.appendChild(block);return block;}
  function preview(){state.ready=false;clearTimeout(previewTimer);previewTimer=setTimeout(function(){local('preview',{appearance:state.look});},35);render();}
  function set(key,n){state.look[key]=n;if(key==='gender'&&n===1)state.look.beard=0;if(key==='hair')state.look.hat=0;preview();}
  function choices(title,key,labels,values){var b=section(title),row=text('div','','ec-choices');b.appendChild(row);labels.forEach(function(label,i){var value=values?values[i]:i;var btn=button(label,state.look[key]===value,function(){set(key,value);});if((key==='hair'||key==='face')&&value){var img=document.createElement('img');img.src='assets/character/'+(state.look.gender?'female':'male')+'_'+key+value+'.png';img.alt='';img.loading='lazy';btn.prepend(img);btn.classList.add('ec-hair-card');}row.appendChild(btn);});}
  function palette(title,key,colours,start){var b=section(title),row=text('div','','ec-swatches');b.appendChild(row);colours.forEach(function(rgb,i){var n=button('',state.look[key]===i+start,function(){set(key,i+start);});n.style.background='rgb('+rgb.join(',')+')';n.setAttribute('aria-label',title+' '+(i+1));n.title=title+' '+(i+1);row.appendChild(n);});}
  var creator=[['identity','Identitas'],['skin','Kulit'],['face','Wajah'],['hair','Rambut'],['detail','Detail']];
  var shop=[['top','Atasan'],['jacket','Jaket'],['pants','Celana'],['shoes','Sepatu'],['hat','Topi'],['glasses','Kacamata'],['mask','Masker'],['accessories','Aksesori']];
  function render(){
    if(!state.open)return;
    document.getElementById('ec-title').textContent=state.mode==='creator'?'Bentuk karakter Anda':state.mode==='shop'?'Temukan gaya Anda':'Lemari pakaian';
    document.getElementById('ec-money').textContent=money(state.money);
    nav.replaceChildren();(state.mode==='creator'?creator:shop).forEach(function(c){nav.appendChild(button(c[1],state.category===c[0],function(){state.category=c[0];local('focus',{area:['face','hair','detail'].indexOf(c[0])>=0?'face':c[0]==='shoes'?'shoes':'body'});render();}));});
    save.disabled=state.pending||!state.ready||!state.catalog||!state.look||!state.nonce;
    save.textContent=state.pending?'Menyimpan…':state.mode==='creator'?'Simpan karakter':'Pakai pilihan';
    options.replaceChildren();if(!state.catalog||!state.look){options.appendChild(text('p','Memuat katalog dari client…'));return;}
    var c=state.catalog,a=state.look,cat=state.category;document.getElementById('ec-step').textContent=nav.querySelector('.is-selected')?nav.querySelector('.is-selected').textContent.toUpperCase():'';
    if(cat==='identity'){choices('Gender','gender',['Male','Female']);choices('Bentuk tubuh','bodyType',['Slim','Normal','Large']);}
    else if(cat==='skin'){palette('Warna kulit','skinTone',c.skinTones,1);choices('Freckles','freckles',['Tanpa','Ringan','Penuh']);choices('Tattoo','tattoo',['Tanpa','01','02']);}
    else if(cat==='face'){var ids=(c.faces[bodyKey()]||[]).slice().sort(function(x,y){return x-y;});choices('Bentuk wajah','face',ids.map(function(n){return c.faceLabels[n-1]||'Wajah '+n;}),ids);if(ids.length){var faceNav=section('Ganti wajah');faceNav.appendChild(button('← Sebelumnya',false,function(){set('face',ids[(ids.indexOf(a.face)+ids.length-1)%ids.length]);}));faceNav.appendChild(button('Berikutnya →',false,function(){set('face',ids[(ids.indexOf(a.face)+1)%ids.length]);}));}choices('Alis','eyebrows',['Natural','Tipis','Tebal']);}
    else if(cat==='hair'){var hairstyles=[0].concat((c.hair[bodyKey()]||[]).slice().sort(function(x,y){return x-y;})),hairLabels=c.hairLabels[a.gender?'female':'male'];choices('Gaya rambut','hair',hairstyles.map(function(n){return n?(hairLabels[n-1]||'Gaya '+n):'Tanpa';}),hairstyles);palette('Warna rambut','hairColor',c.hairColors,0);}
    else if(cat==='detail'){if(a.gender===0)choices('Janggut','beard',['Tanpa','Stubble','Penuh']);choices('Makeup','makeup',['Tanpa','Soft','Bold']);}
    else {
      var slots=cat==='accessories'?['watch','necklace','bag','accessory']:[cat];
      slots.forEach(function(slot){var b=section(slot.toUpperCase());b.appendChild(button('Lepas',a[slot]===0,function(){set(slot,0);}));var grid=text('div','','ec-item-grid');b.appendChild(grid);var visible=0;
        c.items.filter(function(x){return x.slot===slot&&x.bodies.indexOf(bodyKey())>=0;}).forEach(function(item){
          var price=state.prices[item.id],owned=state.owned.indexOf(item.id)>=0;if(state.mode==='wardrobe'&&!owned)return;
          var card=text('div','','ec-item');var pic=document.createElement('img');pic.src='assets/character/items/'+(a.gender?'female':'male')+'_'+item.id+'.png';pic.alt=item.label;pic.loading='lazy';pic.style.cssText='width:100%;height:100px;object-fit:contain;grid-column:1/-1';card.appendChild(pic);card.appendChild(button(item.label,a[slot]===item.id,function(){set(slot,item.id);}));card.appendChild(text('small',owned?'DIMILIKI':(Number.isInteger(price)?money(price):'Tidak tersedia')));
          if(!owned){var buy=button('Beli',false,function(){commit(item.id);});buy.disabled=state.pending||!Number.isInteger(price)||state.money<price||!state.ready||a[slot]!==item.id;card.appendChild(buy);}grid.appendChild(card);visible++;
        });
        if(!visible)b.appendChild(text('p','Belum ada pakaian di kategori ini.','ec-empty'));
      });
    }
    E.touch();
  }
  function commit(item){
    if(state.pending||!state.look||!state.nonce)return;
    var values=[state.nonce,state.revision].concat(fields.map(function(k){return state.look[k];}));
    if(values.some(function(n){return !Number.isSafeInteger(n)||n<0||n>2147483647;}))return;
    state.pending=true;message.textContent='Memeriksa dan menyimpan pilihan…';render();
    E.send('character',item?'buy':'save',item||0,values.join(','));
    // A timeout is not a rollback. Ask the user to reopen; never auto-retry a buy.
    setTimeout(function(){if(state.open&&state.pending)message.textContent='Belum ada balasan. Tutup lalu buka kembali untuk memuat status transaksi.';},10000);
  }
  save.onclick=function(){commit(0);};
  layer.querySelector('.ec-close').onclick=function(){if(state.required){message.textContent='Simpan karakter sebelum memilih lokasi spawn.';return;}E.send('character','close',0,'');};
  function close(){state.open=false;state.pending=false;layer.hidden=true;clearTimeout(previewTimer);clearInterval(retry);local('cancel');E.touch();}
  layer.querySelectorAll('[data-camera]').forEach(function(n){n.onclick=function(){var a=n.dataset.camera;if(a==='reset')local('cameraReset');else if(a==='left'||a==='right')local('rotate',{delta:a==='left'?-.25:.25});else local('zoom',{delta:a==='plus'?-.2:.2});};});
  var orbit=layer.querySelector('.ec-orbit'),lastX=null,lastMove=0;
  orbit.addEventListener('pointerdown',function(e){lastX=e.clientX;orbit.setPointerCapture(e.pointerId);});
  orbit.addEventListener('pointermove',function(e){if(lastX===null)return;var now=performance.now();if(now-lastMove<25)return;local('rotate',{delta:(e.clientX-lastX)*.006});lastX=e.clientX;lastMove=now;});
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(ev){orbit.addEventListener(ev,function(){lastX=null;});});
  E.on('eagle_character_open',function(d){
    state.open=true;state.required=!!d.required;state.pending=false;state.ready=false;state.mode=d.mode||'creator';state.nonce=+d.nonce;state.category=state.mode==='creator'?'identity':'top';state.look=state.confirmed?clone(state.confirmed):null;layer.hidden=false;message.textContent='Menyiapkan karakter…';
    layer.querySelector('.ec-close').hidden=state.required;
    local('begin',{mode:state.mode});clearInterval(retry);var attempts=0;retry=setInterval(function(){if(!state.open||state.ready){clearInterval(retry);return;}if(++attempts>8){clearInterval(retry);message.textContent='Aset karakter belum siap. Periksa folder TESTLIT dan versi client.';return;}if(!state.catalog||!state.look)local('begin',{mode:state.mode});},1000);render();
  });
  E.on('eagle_character_catalog',function(d){if(d.version!==1||d.revision!==3||(state.serverCatalog&&state.serverCatalog!==d.revision)){state.catalog=null;state.ready=false;message.textContent='Katalog client dan server berbeda. Perlu wardrobe versi 3.';render();return;}state.catalog=d;render();});
  E.on('eagle_character_local_state',function(d){if(state.open){state.look=clone(d.appearance);state.revision=+d.revision;render();}});
  E.on('eagle_character_server_state',function(d){state.serverCatalog=+d.catalogRevision||0;if(state.serverCatalog!==3){state.catalog=null;state.ready=false;message.textContent='Katalog server harus versi 3.';}state.confirmed=clone(d.appearance);state.revision=+d.revision;state.nonce=+d.nonce;state.money=+d.money;state.owned=d.owned||[];state.prices=d.prices||{};if(!state.open||state.pending)state.look=clone(d.appearance);render();});
  E.on('eagle_character_confirmed',function(d){state.confirmed=clone(d.appearance);state.revision=+d.revision;});
  E.on('eagle_character_preview_status',function(d){state.ready=!!d.ready;message.textContent=state.ready?'Pilihan ditampilkan langsung pada karakter.':'Memuat mesh dan material…';render();});
  E.on('eagle_character_saved',function(){state.pending=false;message.textContent='Pilihan berhasil disimpan.';render();});
  E.on('eagle_character_error',function(d){state.pending=false;message.textContent=d.message||'Pilihan belum dapat diterapkan.';render();});
  E.on('eagle_character_close',close);
  document.addEventListener('keydown',function(e){if(state.open&&e.key==='Escape')layer.querySelector('.ec-close').click();});
  E.done('character');
})();
