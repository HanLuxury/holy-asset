/* EAGLE v75. Two-container CEF inventory; transactions stay on the Pawn server.
   Original implementation inspired by aj-inventory's two-grid interaction. */
(function(){
  'use strict';
  var E=window.EAGLE,U=window.UI,h=U.h;
  var st={show:0,it:[],gr:[],other:[],cl:[],sel:-1,amt:1,context:'ground',session:0,busy:0,w:0,wm:50,name:''};
  var tab='bag',left=-1,right=-1,pending=false,pendingTimer=0,search='',drag=null;
  var root=h('section',{id:'inv',class:'inv inv-v75','aria-label':'Inventory'});U.layer('screenlayer').appendChild(root);
  root.innerHTML='<header class="iv-top" data-touch><div><small>EAGLE ROLEPLAY / INVENTORY</small><h1>Barang Anda<span class="iv-live">ONLINE</span></h1></div><button class="iv-close" aria-label="Tutup inventory">×</button></header><div class="iv-layout"><section class="iv-container iv-player" data-touch><header><div><small>PERSONAL</small><h2 class="iv-name"></h2></div><span class="iv-weight"></span></header><div class="iv-meter"><i></i></div><div class="iv-tools"><nav><button data-tab="bag">Tas <span></span></button><button data-tab="clothes">Pakaian <span></span></button></nav><input class="iv-search" type="search" placeholder="Cari item…" aria-label="Cari item"></div><div class="iv-scroll"><div class="iv-grid iv-bag-grid"></div></div><footer class="iv-hint">Slot 1–6 terhubung ke quickbar</footer></section><aside class="iv-actions" data-touch><label for="iv-amount">JUMLAH</label><input id="iv-amount" type="number" inputmode="numeric" min="1" max="1000000" value="1"><button data-action="use">'+U.icon('hand')+'<span>Gunakan</span></button><button data-action="give">'+U.icon('gift')+'<span>Berikan</span></button><button data-action="transfer" class="iv-accent">'+U.icon('right')+'<span>Jatuhkan</span></button><button data-action="ground_view">'+U.icon('pin')+'<span>Tanah</span></button><button data-action="wardrobe">'+U.icon('user')+'<span>Ganti gaya</span></button><button data-action="refresh">'+U.icon('refresh')+'<span>Segarkan</span></button></aside><section class="iv-container iv-other" data-touch><header><div><small class="iv-context"></small><h2 class="iv-other-title"></h2></div><span class="iv-other-count"></span></header><div class="iv-meter iv-other-meter"><i></i></div><div class="iv-other-sub"></div><div class="iv-scroll"><div class="iv-grid iv-other-grid"></div><p class="iv-empty"></p></div><footer><button class="iv-take iv-accent" data-action="other">Ambil item</button></footer></section></div><footer class="iv-bottom" data-touch><div class="iv-details"><b>Pilih item</b><span>Klik untuk memilih · Seret untuk memindahkan</span></div><span class="iv-status" role="status"></span><button class="iv-exit">Tutup <kbd>ESC</kbd></button></footer>';
  var $=function(q){return root.querySelector(q);},amount=$('#iv-amount'),bagGrid=$('.iv-bag-grid'),otherGrid=$('.iv-other-grid');
  function qty(){var n=Number(amount.value);return Number.isSafeInteger(n)&&n>=1&&n<=1000000?n:0;}
  function items(){return tab==='clothes'?st.cl:st.it;}
  function others(){return st.context==='ground'?st.gr:st.other;}
  function find(a,id){return (a||[]).find(function(i){return +i.s===+id;});}
  function active(){return right>=0?find(others(),right):find(items(),left);}
  function notice(text){$('.iv-status').textContent=text;}
  function wire(action,index,wait){
    if(!+st.show||!+st.session||(pending&&action!=='refresh'))return;
    var n=/^(refresh|ground_view|wardrobe|wear)$/.test(action)?1:qty();if(!n){notice('Masukkan jumlah 1–1.000.000.');amount.focus();return;}
    if(wait){pending=true;notice('Menunggu server…');clearTimeout(pendingTimer);pendingTimer=setTimeout(function(){if(+st.show){notice('Memeriksa hasil server…');wire('refresh',-1,false);}},10000);}
    E.send('inv',action,index==null?-1:index,String(st.session)+'|'+n);buttons();return true;
  }
  function action(a){
    if(a==='refresh'||a==='ground_view'){wire(a,-1,false);return;}
    if(a==='wardrobe'){wire(a,-1,false);return;}
    if(pending||+st.busy)return;
    var item=find(items(),left);
    if(a==='other'){
      if(!find(others(),right))return;
      wire(st.context==='shop'?'buy':st.context==='craft'?'craft':'take',right,true);return;
    }
    if(!item){notice('Pilih item pada tas terlebih dahulu.');return;}
    if(a==='use'){
      if(tab==='clothes')wire('wear',left,false);
      else E.send('inv','use',left,'');
    }else if(a==='give'){
      if(tab==='clothes')return;
      if(wire('amount_set',left,false))E.send('inv','give',left,'');
    }else if(a==='transfer'){
      if(tab==='clothes')return;
      wire(st.context==='trunk'?'store':'drop_now',left,true);
    }
  }
  function buttons(){
    var busy=pending||!!+st.busy,garment=tab==='clothes',chosen=!!find(items(),left),other=find(others(),right);
    root.classList.toggle('iv-busy',busy);
    root.querySelectorAll('[data-action]').forEach(function(b){var a=b.dataset.action;
      b.disabled=a==='refresh'?false:a==='ground_view'||a==='wardrobe'?busy:a==='other'?busy||!other:busy||!chosen||(garment&&(a==='give'||a==='transfer'));
    });
    var transfer=$('[data-action=transfer] span');transfer.textContent=st.context==='trunk'?'Simpan':'Jatuhkan';
    $('.iv-take').textContent=st.context==='shop'?'Beli item':st.context==='craft'?'Buat item':'Ambil item';
    if(other&&st.context==='craft'&&(other.needs||[]).some(function(n){return +n.have<+n.q;}))$('.iv-take').disabled=true;
  }
  function details(){
    var i=active(),b=$('.iv-details b'),text=$('.iv-details span');
    b.textContent=i?U.plain(i.n):'Pilih item';
    if(!i)text.textContent='Klik untuk memilih · Seret untuk memindahkan';
    else if(right>=0&&st.context==='craft')text.textContent=(i.needs||[]).map(function(n){return n.n+' '+n.have+'/'+n.q;}).join(' · ');
    else if(right>=0&&st.context==='shop')text.textContent='Harga satuan $'+i.price+' · Total $'+(i.price*(qty()||1)).toLocaleString('id-ID');
    else text.textContent=tab==='clothes'&&right<0?(i.equipped?'Sedang dipakai':'Pakaian milik Anda · Gunakan untuk memakai'):'Tersedia '+i.q+' item';
    buttons();
  }
  function cell(item,id,side){
    var b=h('button',{type:'button',class:'iv-slot'+(item?' iv-full':'')+(id===(side==='bag'?left:right)?' iv-selected':''),'data-side':side,'data-index':id,'aria-label':item?U.plain(item.n)+' '+item.q:'Slot kosong '+(id+1)});
    if(side==='bag'&&tab==='bag'&&id<6)b.appendChild(h('small',{class:'iv-hot',text:id+1}));
    if(item){
      var icon=item.clothing?(/Sepatu/.test(item.n)?'👟':/Celana/.test(item.n)?'👖':'👕'):U.itemIcon(item.n,item.m);
      b.appendChild(h('span',{class:'iv-item-art',text:icon}));
      b.appendChild(h('strong',{class:'iv-item-qty',text:st.context==='shop'&&side==='other'?'$'+item.price:'×'+item.q}));
      b.appendChild(h('span',{class:'iv-item-name',text:U.plain(item.n)}));
      if(item.equipped)b.appendChild(h('span',{class:'iv-equipped',text:'DIPAKAI'}));
      if(item.needs)b.classList.toggle('iv-unavailable',item.needs.some(function(n){return +n.have<+n.q;}));
    }
    b.onclick=function(){
      if(drag&&drag.moved)return;
      if(pending||+st.busy)return;
      if(side==='bag'){
        if(!item&&tab==='bag'&&left>=0){E.send('inv','move',left,String(id));left=-1;}
        else {left=left===id?-1:id;right=-1;if(tab==='bag')E.send('inv','sel',id,'');}
      }else {right=right===id?-1:id;left=-1;}
      grids();details();
    };
    b.ondblclick=function(){if(item)action(side==='bag'?'use':'other');};
    b.onpointerdown=function(e){if(!item||pending||+st.busy||e.button>0)return;drag={x:e.clientX,y:e.clientY,id:id,side:side,moved:false,el:b,pointer:e.pointerId};};
    return b;
  }
  function grids(){
    bagGrid.replaceChildren();otherGrid.replaceChildren();
    var arr=items(),count=tab==='clothes'?Math.max(20,Math.ceil(arr.length/5)*5):20;
    for(var i=0;i<count;i++){
      var item=tab==='clothes'?arr[i]:find(arr,i),id=tab==='clothes'?(item?+item.s:-i-1):i;
      var node=cell(item,id,'bag');
      if(item&&search&&U.plain(item.n).toLowerCase().indexOf(search)<0){node.classList.add('iv-filtered');node.disabled=true;}
      bagGrid.appendChild(node);
    }
    var ot=others(),max=st.context==='ground'?Math.max(20,Math.ceil(ot.length/5)*5):Math.max(20,Math.ceil(ot.length/5)*5);
    for(var n=0;n<max;n++) {var oi=ot[n];otherGrid.appendChild(cell(oi,oi?+oi.s:n,'other'));}
    $('.iv-empty').textContent=ot.length?'':st.context==='ground'?'Belum ada barang di sekitar Anda.':st.context==='trunk'?'Bagasi kosong. Seret item dari tas untuk menyimpan.':'Tidak ada item tersedia.';
  }
  function render(){
    root.classList.toggle('on',!!+st.show);root.setAttribute('aria-hidden',+st.show?'false':'true');
    if(!+st.show){clearTimeout(pendingTimer);pending=false;drag=null;document.querySelectorAll('.iv-drag-ghost').forEach(function(n){n.remove();});return;}
    $('.iv-name').textContent=U.plain(st.name||'Inventory');
    $('.iv-weight').textContent=(+st.w||0).toFixed(2)+' / '+(+st.wm||50).toFixed(0)+' kg';
    $('.iv-meter i').style.width=Math.min(100,(+st.w||0)/(+st.wm||50)*100)+'%';
    $('.iv-context').textContent=({shop:'SHOP',trunk:'VEHICLE STORAGE',craft:'CRAFTING',ground:'GROUND'})[st.context]||'CONTAINER';
    amount.disabled=st.context==='craft';if(st.context==='craft')amount.value='1';
    $('.iv-other-title').textContent=st.otherTitle||'Barang di tanah';
    $('.iv-other-count').textContent=st.context==='shop'?'$'+(+st.cash||0).toLocaleString('id-ID'):others().length+' item';
    $('.iv-other-sub').textContent=st.context==='shop'?'Pilih item · Tentukan jumlah · Beli':st.context==='craft'?'Satu resep · 20 detik · Bahan diperiksa server':st.context==='trunk'?'Kapasitas 30 kg · Simpan dan ambil barang':'Barang dalam jangkauan 1,5 meter';
    root.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('iv-active',b.dataset.tab===tab);b.querySelector('span').textContent=(b.dataset.tab==='bag'?st.it:st.cl).length;});
    if(!find(items(),left))left=-1;if(!find(others(),right))right=-1;
    grids();details();if(E.touch)E.touch();
  }
  root.querySelectorAll('[data-action]').forEach(function(b){b.onclick=function(){action(b.dataset.action);};});
  root.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){tab=b.dataset.tab;left=right=-1;search='';$('.iv-search').value='';render();};});
  function close(){if(+st.show)E.send('inv','close',-1,'');}
  $('.iv-close').onclick=$('.iv-exit').onclick=close;
  $('.iv-search').oninput=function(){search=this.value.trim().toLowerCase();grids();};
  amount.oninput=details;amount.onfocus=function(){this.select();};
  document.addEventListener('keydown',function(e){if(st.show&&e.key==='Escape'){e.preventDefault();close();}});
  document.addEventListener('pointermove',function(e){
    if(!drag||drag.pointer!==e.pointerId)return;
    if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9)return;
    if(!drag.moved){drag.moved=true;drag.el.classList.add('iv-dragging');drag.ghost=drag.el.cloneNode(true);drag.ghost.className='iv-drag-ghost';document.body.appendChild(drag.ghost);}
    drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';e.preventDefault();
  },{passive:false});
  document.addEventListener('pointerup',function(e){
    if(!drag||drag.pointer!==e.pointerId)return;
    var d=drag;if(d.ghost)d.ghost.remove();d.el.classList.remove('iv-dragging');
    if(d.moved){
      var target=document.elementFromPoint(e.clientX,e.clientY),to=target&&target.closest('[data-side]');
      if(to){
        if(d.side==='bag'&&tab==='bag'){
          left=d.id;right=-1;
          if(to.dataset.side==='bag'&&!find(st.it,+to.dataset.index))E.send('inv','move',d.id,to.dataset.index);
          else if(to.dataset.side==='other'&&(st.context==='ground'||st.context==='trunk'))action('transfer');
        }else if(d.side==='other'&&to.dataset.side==='bag'){right=d.id;left=-1;action('other');}
      }
      setTimeout(function(){drag=null;},0);
    }else drag=null;
  });
  document.addEventListener('pointercancel',function(){if(drag){if(drag.ghost)drag.ghost.remove();drag.el.classList.remove('iv-dragging');drag=null;}});
  E.on('inv',function(d){
    if(!d || typeof d!=='object')return;
    var opening=!!+d.show&&!+st.show,changed=d.session&&+d.session!==+st.session;
    if(opening||changed){tab='bag';left=right=-1;search='';$('.iv-search').value='';amount.value='1';}
    if(d.context&&d.context!==st.context){right=-1;}
    Object.keys(d).forEach(function(k){st[k]=d[k];});
    if(!st.ground&&st.context==='ground')st.gr=[];
    pending=false;clearTimeout(pendingTimer);notice(st.busy?'Sedang diproses…':'');render();
  });
  E.done('inv');
})();
