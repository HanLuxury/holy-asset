/* EAGLE KIT V1 - /modif: body kit (part GTA), stiker multi-layer 3D, aksesoris modshop.
   Server (cef_vehicle_kit.inc) yang memvalidasi & menyimpan; client jni menggambar stiker. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, cat = window.EAGLEStickerCatalog;
  if (!E || !U || !cat) return;
  var h = U.h, state = null, seq = 0, lastClosed = 0, pending = false, saveSeq = 0, queued = {}, timer = 0;
  var tab = 0, selected = -1, stickerCat = 0, lockRatio = true;
  var F = {sticker:0, side:1, u:2, v:3, w:4, h:5, rot:6, color:7, flags:8};
  var sides = [['Atas',4],['Kanan',5],['Kiri',6],['Depan',7],['Belakang',8]];
  var palette = ['ffffff','111214','cf4141','e8833a','f2d34b','58c46b','3aa7e8','4a5ee8','9b5de5','f15bb5','8a8f94','c9a46b'];
  var root = h('section',{id:'eagle-vehicle-kit',class:'evm ekv','aria-hidden':'true'});
  U.layer('vehiclemodlayer').appendChild(root);
  var panel, contents, title, note, badge, save, cancel, tabButtons = [];

  function button(label, cls, fn) { return h('button',{type:'button',class:cls,text:label,onclick:fn}); }
  function icon(name) { return h('span',{class:'evm-icon',html:U.icon(name)}); }
  function item(id) { return cat.items[id]; }
  function thumb(id) { var it = item(id); return it ? 'img/stickers/'+cat.categories[it[1]][0]+'/'+it[2]+'.png' : ''; }
  function u32(v) { return (v >>> 0); }
  function hex6(c) { return ('000000'+(u32(c) >>> 8).toString(16)).slice(-6).toUpperCase(); }
  function alpha(c) { return u32(c) & 255; }
  function rgba(rgb, a) { return ((rgb << 8) | (a & 255)) | 0; }

  function request(action, index, body) {
    if (!state) return 0;
    seq++;
    E.send('vehkit', action, index, state.sid+'|'+seq+'|'+String(body == null ? 0 : body));
    return seq;
  }
  function flush() {
    clearTimeout(timer); timer = 0;
    var entries = queued; queued = {};
    Object.keys(entries).forEach(function (k) { var e = entries[k]; request(e.action, e.index, e.body); });
  }
  function schedule(key, action, index, body, immediate) {
    queued[key] = {action:action, index:index, body:body};
    if (immediate) flush(); else if (!timer) timer = setTimeout(flush, 110);
  }
  function setLayer(i, field, value, immediate) {
    if (!state || pending || !state.layers[i]) return;
    state.layers[i][field] = value; state.message = '';
    schedule('set:'+i+':'+field, 'set', i, field+':'+value, immediate);
    footer();
  }
  function dirtyCount() {
    if (!state) return 0;
    var n = 0;
    state.kit.forEach(function (k) { if (k.cur !== k.saved) n++; });
    if (state.layers.length !== state.savedLayers.length) n++;
    else state.layers.forEach(function (l, i) { if (l.join() !== state.savedLayers[i].join()) n++; });
    return n;
  }
  function footer() {
    if (!state) return;
    var d = dirtyCount();
    badge.textContent = d ? d+' perubahan' : 'Sesuai data tersimpan';
    badge.classList.toggle('dirty', !!d);
    save.disabled = pending || !d; save.textContent = pending ? 'Menyimpan…' : 'Simpan modifikasi';
    cancel.disabled = pending;
    note.textContent = state.message || 'Preview langsung · Simpan agar semua pemain melihat.';
    note.classList.toggle('success', state.message === 'Modifikasi tersimpan.');
  }

  /* ---------------- Body kit ---------------- */
  function buildKit() {
    if (!state.kit.length) {
      contents.appendChild(h('p',{class:'evm-help',text:'Kendaraan ini tidak punya part tunable GTA. Pakai Stiker atau Aksesoris (modshop).'}));
      return;
    }
    contents.appendChild(h('div',{class:'ekv-row'},[button('Kembalikan semua part','evm-small',function(){
      if (pending) return; flush(); request('kitreset',0,0);
    })]));
    state.kit.forEach(function (k) {
      var row = h('section',{class:'evm-control'});
      row.appendChild(h('div',{class:'evm-control-head'},[h('label',{text:k.name}),
        h('span',{class:'ekv-tag',text:k.cur !== k.saved ? 'diubah' : ''})]));
      var choices = h('div',{class:'evm-choices'});
      [[0,'Standar']].concat(k.opt).forEach(function (o) {
        var b = button(o[1],'evm-choice'+(o[0] === k.cur ? ' selected' : ''),function(){
          if (pending || k.cur === o[0]) return;
          k.cur = o[0]; flush(); request('kit', k.slot, o[0]); buildControls();
        });
        if (o[0]) b.title = 'ID '+o[0];
        choices.appendChild(b);
      });
      row.appendChild(choices); contents.appendChild(row);
    });
  }

  /* ---------------- Stiker ---------------- */
  function layerName(l) { var it = item(l[F.sticker]); return it ? it[2] : ('#'+l[F.sticker]); }
  function buildLayers() {
    var wrap = h('section',{class:'evm-control ekv-layers'});
    wrap.appendChild(h('div',{class:'evm-control-head'},[h('label',{text:'Layer ('+state.layers.length+'/'+state.maxLayers+')'}),
      button('Hapus semua','evm-small',function(){ if (pending || !state.layers.length) return; flush(); selected=-1; state.layers=[]; request('clear',0,0); buildControls(); })]));
    if (!state.layers.length) wrap.appendChild(h('p',{class:'evm-help',text:'Belum ada stiker. Pilih stiker di bawah untuk menambah layer.'}));
    for (var i = state.layers.length - 1; i >= 0; i--) (function (i) {
      var l = state.layers[i], hidden = !!(l[F.flags] & 1);
      var row = h('div',{class:'ekv-layer'+(i === selected ? ' selected' : '')+(hidden ? ' hidden' : ''),onclick:function(){ selected = i; buildControls(); }});
      row.appendChild(h('img',{src:thumb(l[F.sticker]),alt:'',loading:'lazy'}));
      row.appendChild(h('span',{class:'ekv-layer-name',text:(i+1)+'. '+layerName(l)}));
      var tools = h('span',{class:'ekv-layer-tools'});
      function tool(label, fn, aria) { var b = button(label,'evm-small',function(e){ e.stopPropagation(); if (!pending) fn(); }); b.setAttribute('aria-label',aria); tools.appendChild(b); }
      tool(hidden ? 'Tampil' : 'Sembunyi', function(){ setLayer(i, F.flags, l[F.flags] ^ 1, true); buildControls(); }, 'Sembunyikan layer');
      tool('▲', function(){ if (i+1 >= state.layers.length) return; flush(); request('up',i,0); var t=state.layers[i]; state.layers[i]=state.layers[i+1]; state.layers[i+1]=t; selected=i+1; buildControls(); }, 'Naikkan layer');
      tool('▼', function(){ if (i <= 0) return; flush(); request('down',i,0); var t=state.layers[i]; state.layers[i]=state.layers[i-1]; state.layers[i-1]=t; selected=i-1; buildControls(); }, 'Turunkan layer');
      tool('Salin', function(){ if (state.layers.length >= state.maxLayers) return; flush(); request('dup',i,0); }, 'Salin layer');
      tool('Hapus', function(){ flush(); request('del',i,0); state.layers.splice(i,1); selected = Math.min(selected, state.layers.length-1); buildControls(); }, 'Hapus layer');
      row.appendChild(tools); wrap.appendChild(row);
    })(i);
    contents.appendChild(wrap);
  }
  function slider(label, min, max, step, value, fmt, onInput) {
    var out = h('output',{class:'evm-value',text:fmt(value)});
    var input = h('input',{type:'range',min:min,max:max,step:step,'aria-label':label,oninput:function(){
      var v = Math.round(+this.value); out.textContent = fmt(v); this.style.setProperty('--fill',((v-min)/(max-min)*100)+'%'); onInput(v, false);
    },onchange:function(){ onInput(Math.round(+this.value), true); }});
    input.value = value; input.style.setProperty('--fill',((value-min)/(max-min)*100)+'%');
    return h('section',{class:'evm-control'},[h('div',{class:'evm-range-caption'},[h('span',{text:label}),out]),input]);
  }
  function buildEditor() {
    var i = selected, l = state.layers[i];
    if (!l) return;
    var it = item(l[F.sticker]), aspect = it ? it[3] : 1;
    var box = h('section',{class:'evm-control ekv-editor'});
    box.appendChild(h('div',{class:'evm-control-head'},[h('label',{text:'Edit layer '+(i+1)+': '+layerName(l)})]));
    var sideRow = h('div',{class:'evm-choices'});
    sides.forEach(function (s, idx) {
      sideRow.appendChild(button(s[0],'evm-choice'+(l[F.side] === idx ? ' selected' : ''),function(){
        if (pending) return; setLayer(i, F.side, idx, true); request('camera', s[1], 0); buildControls();
      }));
    });
    box.appendChild(h('p',{class:'evm-help',text:'Sisi kendaraan tempat stiker ditempel.'}));
    box.appendChild(sideRow);
    // Tombol geser (tahan = terus).
    var pad = h('div',{class:'ekv-pad'});
    function nudge(field, delta) {
      var v = Math.max(-1000, Math.min(1000, state.layers[i][field] + delta));
      setLayer(i, field, v, false);
      var s = contents.querySelector('[data-ekv="'+field+'"]');
      if (s) { s.value = v; s.dispatchEvent(new Event('input')); }
    }
    [['◀',F.u,-1],['▲',F.v,1],['▼',F.v,-1],['▶',F.u,1]].forEach(function (d) {
      var hold = 0, step = function(){ nudge(d[1], d[2]*12); };
      var b = button(d[0],'evm-camera ekv-nudge',null);
      b.addEventListener('pointerdown',function(e){ e.preventDefault(); if (pending) return; step(); clearInterval(hold); hold = setInterval(step, 70); });
      ['pointerup','pointerleave','pointercancel'].forEach(function(n){ b.addEventListener(n,function(){ clearInterval(hold); flush(); }); });
      pad.appendChild(b);
    });
    box.appendChild(pad);
    var pu = slider('Posisi horizontal', -1000, 1000, 1, l[F.u], function(v){return (v/10).toFixed(1)+'%';}, function(v,imm){ setLayer(i, F.u, v, imm); });
    pu.querySelector('input').setAttribute('data-ekv', F.u); box.appendChild(pu);
    var pv = slider('Posisi vertikal', -1000, 1000, 1, l[F.v], function(v){return (v/10).toFixed(1)+'%';}, function(v,imm){ setLayer(i, F.v, v, imm); });
    pv.querySelector('input').setAttribute('data-ekv', F.v); box.appendChild(pv);
    box.appendChild(slider('Putar', -1800, 1800, 10, l[F.rot], function(v){return (v/10).toFixed(0)+'°';}, function(v,imm){ setLayer(i, F.rot, v, imm); }));
    box.appendChild(slider('Ukuran', 80, 4000, 10, l[F.w], function(v){return (v/1000).toFixed(2)+' m';}, function(v,imm){
      setLayer(i, F.w, v, imm);
      if (lockRatio) setLayer(i, F.h, Math.max(80, Math.min(4000, Math.round(v / (aspect || 1)))), imm);
    }));
    if (!lockRatio) box.appendChild(slider('Tinggi', 80, 4000, 10, l[F.h], function(v){return (v/1000).toFixed(2)+' m';}, function(v,imm){ setLayer(i, F.h, v, imm); }));
    var flags = h('div',{class:'evm-choices'});
    flags.appendChild(button(lockRatio ? 'Rasio terkunci' : 'Rasio bebas','evm-choice'+(lockRatio?' selected':''),function(){ lockRatio = !lockRatio; buildControls(); }));
    flags.appendChild(button('Cermin X','evm-choice'+((l[F.flags]&2)?' selected':''),function(){ setLayer(i, F.flags, l[F.flags]^2, true); buildControls(); }));
    flags.appendChild(button('Cermin Y','evm-choice'+((l[F.flags]&4)?' selected':''),function(){ setLayer(i, F.flags, l[F.flags]^4, true); buildControls(); }));
    box.appendChild(flags);
    // Warna + transparansi.
    var sw = h('div',{class:'evm-swatches'});
    palette.forEach(function (c) {
      var v = parseInt(c,16), b = button('','evm-swatch'+(hex6(l[F.color]) === c.toUpperCase() ? ' selected' : ''),function(){
        setLayer(i, F.color, rgba(v, alpha(l[F.color])), true); buildControls();
      });
      b.style.setProperty('--swatch','#'+c); b.setAttribute('aria-label','Warna #'+c); sw.appendChild(b);
    });
    box.appendChild(h('div',{class:'evm-control-head'},[h('label',{text:'Warna (putih = warna asli stiker)'})]));
    box.appendChild(sw);
    var hexIn = h('input',{class:'evm-hex',type:'text',maxlength:6,placeholder:'RRGGBB',autocomplete:'off',spellcheck:'false','aria-label':'Kode warna'});
    hexIn.value = hex6(l[F.color]);
    var applyHex = function(){ var t = hexIn.value.replace(/^#/,'').trim(); if (/^[0-9a-fA-F]{6}$/.test(t)) { setLayer(i, F.color, rgba(parseInt(t,16), alpha(l[F.color])), true); buildControls(); } };
    hexIn.addEventListener('keydown',function(e){ if (e.key === 'Enter') { e.preventDefault(); applyHex(); } });
    box.appendChild(h('div',{class:'evm-custom-color'},[h('span',{class:'evm-value',text:'#'}),hexIn,button('Terapkan','evm-small',applyHex)]));
    box.appendChild(slider('Transparansi', 20, 255, 1, alpha(l[F.color]), function(v){return Math.round(v/255*100)+'%';}, function(v,imm){
      setLayer(i, F.color, rgba(u32(l[F.color]) >>> 8, v), imm);
    }));
    contents.appendChild(box);
  }
  function buildCatalog() {
    var wrap = h('section',{class:'evm-control'});
    wrap.appendChild(h('div',{class:'evm-control-head'},[h('label',{text:'Tambah stiker'})]));
    var chips = h('div',{class:'evm-choices'});
    cat.categories.forEach(function (c, idx) {
      chips.appendChild(button(c[1],'evm-choice'+(idx === stickerCat ? ' selected' : ''),function(){ stickerCat = idx; buildControls(); }));
    });
    wrap.appendChild(chips);
    var grid = h('div',{class:'ekv-grid'});
    cat.items.forEach(function (it) {
      if (it[1] !== stickerCat) return;
      var b = h('button',{type:'button',class:'ekv-sticker',title:it[2],onclick:function(){
        if (pending) return;
        if (state.layers.length >= state.maxLayers) { state.message = 'Maksimal '+state.maxLayers+' layer stiker.'; footer(); return; }
        flush(); request('add', it[0], Math.max(80, Math.min(4000, Math.round(720 / (it[3] || 1)))));
        selected = state.layers.length; // layer baru muncul di urutan teratas setelah balasan server
      }},[h('img',{src:thumb(it[0]),alt:it[2],loading:'lazy'})]);
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    contents.appendChild(wrap);
  }
  function buildStickers() {
    buildLayers();
    if (selected >= 0 && selected < state.layers.length) buildEditor();
    buildCatalog();
  }

  /* ---------------- Aksesoris ---------------- */
  function buildAccessories() {
    contents.appendChild(h('p',{class:'evm-help',text:'Aksesoris attachment (bodi, teks, lampu sorot) memakai Modshop server. Bisa untuk semua jenis kendaraan, terlihat semua pemain.'}));
    contents.appendChild(h('div',{class:'ekv-row'},[button('Buka Modshop','evm-save',function(){
      if (pending) return; if (dirtyCount()) { state.message = 'Simpan atau batalkan perubahan dulu.'; footer(); return; }
      flush(); request('modshop',0,0); closeLocal();
    })]));
  }

  var tabs = [['Body kit','wrench'],['Stiker','grid'],['Aksesoris','box']];
  function buildControls() {
    if (!state) return;
    var keep = contents.scrollTop;
    contents.textContent = '';
    title.textContent = tabs[tab][0];
    tabButtons.forEach(function (b, i) { b.classList.toggle('active', i === tab); b.setAttribute('aria-selected', i === tab ? 'true' : 'false'); });
    if (tab === 0) buildKit(); else if (tab === 1) buildStickers(); else buildAccessories();
    footer(); contents.scrollTop = keep; E.touch();
  }
  function closeLocal() {
    clearTimeout(timer); timer = 0; queued = {}; state = null; pending = false; saveSeq = 0; selected = -1;
    root.classList.remove('on'); root.setAttribute('aria-hidden','true'); root.removeAttribute('data-touch');
    root.textContent = ''; document.body.classList.remove('eagle-vehmod-open'); E.touch();
  }
  function closeRequest() {
    if (!state || pending) return;
    clearTimeout(timer); timer = 0; queued = {};
    request('close',0,0); lastClosed = state.sid; closeLocal();
  }
  function saveRequest() {
    if (!state || pending || !dirtyCount()) return;
    flush(); pending = true; state.message = ''; saveSeq = request('save',0,0); footer();
  }
  function build() {
    root.textContent = '';
    var camera = h('nav',{class:'evm-cameras','aria-label':'Sudut kamera'});
    ['Depan','Belakang','Samping','Detail'].forEach(function (label, i) {
      var b = button(label,'evm-camera',function(){ if (pending) return; flush(); request('camera', i, 0);
        camera.querySelectorAll('button').forEach(function(el){ el.classList.toggle('active', el === b); }); });
      if (!i) b.classList.add('active'); camera.appendChild(b);
    });
    root.appendChild(h('div',{class:'evm-view-caption'},[
      h('span',{class:'evm-kicker',text:'RP EAGLE / KIT'}),
      h('h1',{text:state.name || ('Kendaraan '+state.model)}),
      h('span',{class:'evm-view-sub',text:'Body kit, stiker, aksesoris.'}), camera
    ]));
    panel = h('div',{class:'evm-panel'});
    var close = button('','evm-close',closeRequest); close.innerHTML = U.icon('x'); close.setAttribute('aria-label','Tutup');
    panel.appendChild(h('header',{class:'evm-header'},[h('div',{},[h('span',{class:'evm-kicker',text:'VEHICLE KIT'}),h('strong',{text:'Workshop'})]),close]));
    var nav = h('nav',{class:'evm-tabs',role:'tablist'}); tabButtons = [];
    tabs.forEach(function (t, i) {
      var b = button('','evm-tab',function(){ if (pending) return; flush(); tab = i; request('tab', i, 0); buildControls(); });
      b.setAttribute('role','tab'); b.appendChild(icon(t[1])); b.appendChild(h('span',{text:t[0]})); nav.appendChild(b); tabButtons.push(b);
    });
    if (state.evm) {
      var other = button('','evm-tab',function(){
        if (pending) return; if (dirtyCount()) { state.message = 'Simpan atau batalkan perubahan dulu.'; footer(); return; }
        flush(); request('evm',0,0); closeLocal();
      });
      other.appendChild(icon('engine')); other.appendChild(h('span',{text:'Cat & mesin'})); nav.appendChild(other);
    }
    title = h('h2',{}); contents = h('div',{class:'evm-controls',role:'tabpanel'});
    panel.appendChild(nav); panel.appendChild(h('div',{class:'evm-category-head'},[title,
      button('Batalkan perubahan','evm-small',function(){ if (pending) return; flush(); request('revert',0,0); request('kitreset',0,0); })]));
    panel.appendChild(contents);
    note = h('p',{class:'evm-status','aria-live':'polite'}); badge = h('span',{class:'evm-badge'});
    save = button('Simpan modifikasi','evm-save',saveRequest); cancel = button('Batal','evm-cancel',closeRequest);
    panel.appendChild(h('footer',{class:'evm-footer'},[badge,note,h('div',{class:'evm-actions'},[cancel,save])]));
    root.appendChild(panel); root.classList.add('on'); root.setAttribute('aria-hidden','false'); root.setAttribute('data-touch','');
    document.body.classList.add('eagle-vehmod-open'); buildControls(); E.touch();
  }
  function validLayer(l) { return Array.isArray(l) && l.length === 9 && l.every(function(v){ return Number.isInteger(v); }); }
  E.on('vehkit', function (d) {
    if (!d || !Number.isInteger(+d.sid) || +d.sid <= 0) return;
    var sid = +d.sid;
    if (d.show === 0 || d.show === false) { if (state && sid === state.sid) { lastClosed = Math.max(lastClosed, sid); closeLocal(); } return; }
    if (sid <= lastClosed || (state && sid < state.sid)) return;
    if (!Array.isArray(d.kit) || !Array.isArray(d.layers) || !Array.isArray(d.savedLayers)) return;
    if (!d.layers.every(validLayer) || !d.savedLayers.every(validLayer)) return;
    var fresh = !state || sid !== state.sid;
    if (fresh) {
      closeLocal(); state = Object.assign({}, d, {sid:sid}); seq = Math.max(0, +d.ack || 0); pending = false;
      tab = Math.max(0, Math.min(2, +d.tab || 0)); selected = state.layers.length ? state.layers.length - 1 : -1; build(); return;
    }
    var ack = +d.ack || 0;
    if (ack < (state.ack || 0)) return;
    state.ack = ack;
    if (ack < seq || Object.keys(queued).length) return;
    var grew = d.layers.length > state.layers.length;
    state = Object.assign({}, state, d);
    if (pending && ack >= saveSeq) { pending = false; saveSeq = 0; }
    if (grew) selected = state.layers.length - 1;
    if (selected >= state.layers.length) selected = state.layers.length - 1;
    buildControls();
  });
  E.on('auth', function (d) { if (d && ['login','register','chars','charinfo','create','spawn'].indexOf(d.v) >= 0) closeLocal(); });
  window.addEventListener('keydown', function (e) {
    if (!state || !E.canInteract(root) || e.defaultPrevented || e.isComposing || e.repeat) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeRequest(); }
  }, true);
  root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  E.done('vehicle_kit');
})();
