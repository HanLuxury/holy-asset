/* EAGLE KIT v10 - /modif: body kit (part GTA), stiker multi-layer 3D, aksesoris modshop.
   Tampilan menu gaya FiveM (fv_menu.js): kartu + stepper, tanpa gambar stiker. Stiker dicoba langsung
   di mobil (preview client), jadi tidak perlu thumbnail.
   Server (cef_vehicle_kit.inc) yang memvalidasi & menyimpan; client jni menggambar stiker. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, FV = window.FV, cat = window.EAGLEStickerCatalog;
  if (!E || !U || !FV || !cat) return;
  var h = U.h, state = null, seq = 0, lastClosed = 0, pending = false, saveSeq = 0, queued = {}, timer = 0;
  var tab = 0, selected = -1, lockRatio = true, cam = 0, tryLive = true;
  var F = {sticker:0, side:1, u:2, v:3, w:4, h:5, rot:6, color:7, flags:8};
  var sides = [['Atas',4],['Kanan',5],['Kiri',6],['Depan',7],['Belakang',8]];
  var cams = ['DEPAN','BELAKANG','SAMPING','DETAIL'];
  var palette = ['ffffff','111214','cf4141','e8833a','f2d34b','58c46b','3aa7e8','4a5ee8','9b5de5','f15bb5','8a8f94','c9a46b'];
  var paletteName = ['Putih (asli)','Hitam','Merah','Oranye','Kuning','Hijau','Biru muda','Biru','Ungu','Merah muda','Abu-abu','Emas'];
  var root = h('section',{id:'eagle-vehicle-kit',class:'ekv fv-root','aria-hidden':'true'});
  U.layer('vehiclemodlayer').appendChild(root);
  var saveBtn = null, statusEl = null;

  // katalog per kategori (tanpa gambar)
  var byCat = cat.categories.map(function () { return []; });
  cat.items.forEach(function (it) { if (byCat[it[1]]) byCat[it[1]].push(it[0]); });
  var pickCat = 0, pickIdx = cat.categories.map(function () { return 0; });
  var CAT_WORD = {stickers:'Stiker', racing:'Racing', logos:'Logo', clubs:'Klub', characters:'Karakter', letters:'Huruf', shapes:'Bentuk', gradients:'Gradasi'};

  function item(id) { return cat.items[id]; }
  function pretty(id) {
    var it = item(id); if (!it) return '#' + id;
    var m = /^([a-z]+)_(\d+)$/.exec(it[2]);
    if (m && CAT_WORD[m[1]]) return CAT_WORD[m[1]] + ' ' + m[2];
    return it[2].replace(/_/g,' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
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
  function statusText() {
    if (!state) return '';
    if (state.message) return state.message;
    var d = dirtyCount();
    return d ? d + ' perubahan · simpan agar semua pemain melihat' : 'Preview langsung · sesuai data tersimpan';
  }
  // perbarui tombol simpan tanpa membangun ulang panel (dipakai saat tombol panah ditahan)
  function footer() {
    if (!state || !saveBtn) return;
    var d = dirtyCount();
    saveBtn.disabled = pending || !d;
    saveBtn.textContent = pending ? 'MENYIMPAN…' : 'SIMPAN';
    if (statusEl) { statusEl.textContent = statusText(); statusEl.classList.toggle('bad', /tidak valid|Maksimal|dulu/.test(state.message || '')); }
  }
  // stepper angka bebas (posisi, ukuran, putar): nilai diperbarui di tempat, kirim saat dilepas.
  function valueStepper(label, i, field, lo, hi, step, fmt, after) {
    var vb = null;
    var st = FV.stepper({ cur: fmt(state.layers[i][field]), total: null, label: label, hold: true, every: 70,
      fn: function (dir) {
        if (pending || !state.layers[i]) return;
        var v = Math.max(lo, Math.min(hi, state.layers[i][field] + dir * step));
        if (v === state.layers[i][field]) return;
        setLayer(i, field, v, false);
        if (after) after(v);
        if (vb) vb.textContent = fmt(v);
      },
      release: flush });
    vb = st.querySelector('.fv-val b');
    return st;
  }

  /* ---------------- Body kit ---------------- */
  function kitCards() {
    if (!state.kit.length) return [FV.card({ title: 'Body kit', cls: 'note', desc: 'Kendaraan ini tidak punya part tunable GTA. Pakai Stiker atau Aksesoris (modshop).' })];
    var out = [FV.card({ title: 'Semua part', cls: 'note', desc: 'Ganti part dengan panah. Kembalikan semua ke standar dengan tombol di bawah.',
      extra: [FV.chip('KEMBALIKAN SEMUA', function () { if (pending) return; flush(); request('kitreset',0,0); })] })];
    state.kit.forEach(function (k) {
      var opts = [[0,'Standar']].concat(k.opt), idx = 0;
      opts.forEach(function (o, i) { if (o[0] === k.cur) idx = i; });
      out.push(FV.card({ title: k.name, tag: k.cur !== k.saved ? 'DIUBAH' : '', tagCls: 'g',
        desc: 'Dipasang: ' + opts[idx][1] + (k.cur ? ' (ID ' + k.cur + ')' : '') + '.',
        steps: [FV.stepper({ cur: idx + 1, total: opts.length, label: 'Part', fn: function (dir) {
          if (pending) return;
          var n = opts.length, o = opts[(idx + dir + n) % n];
          k.cur = o[0]; flush(); request('kit', k.slot, o[0]); buildControls();
        } })] }));
    });
    return out;
  }

  /* ---------------- Stiker ---------------- */
  function pickId() { var l = byCat[pickCat] || []; return l.length ? l[Math.min(pickIdx[pickCat], l.length - 1)] : -1; }
  function addLayer() {
    if (pending) return;
    var id = pickId(), it = item(id);
    if (!it) return;
    if (state.layers.length >= state.maxLayers) { state.message = 'Maksimal '+state.maxLayers+' layer stiker.'; footer(); return; }
    flush(); request('add', id, Math.max(80, Math.min(4000, Math.round(720 / (it[3] || 1)))));
    selected = state.layers.length; // layer baru muncul di urutan teratas setelah balasan server
  }
  function pickCard() {
    var list = byCat[pickCat] || [], id = pickId(), live = tryLive && selected >= 0 && selected < state.layers.length;
    function stepCat(dir) {
      if (pending) return;
      var n = cat.categories.length; pickCat = (pickCat + dir + n) % n;
      if (live) { var nid = pickId(); if (nid >= 0) setLayer(selected, F.sticker, nid, true); }
      buildControls();
    }
    function stepSticker(dir) {
      if (pending || !list.length) return;
      var n = list.length; pickIdx[pickCat] = (pickIdx[pickCat] + dir + n) % n;
      if (live) setLayer(selected, F.sticker, pickId(), true);
      buildControls();
    }
    return FV.card({ title: 'Pilih stiker', tag: live ? 'COBA DI LAYER ' + (selected + 1) : '', tagCls: 'g',
      desc: (cat.categories[pickCat] ? cat.categories[pickCat][1] : '') + ' · ' + pretty(id) + '. ' +
        (live ? 'Panah langsung mengganti stiker di layer terpilih (lihat di mobil).' : 'Tekan TAMBAH LAYER untuk menempel di mobil.'),
      steps: [
        FV.stepper({ cur: pickCat + 1, total: cat.categories.length, label: 'Kategori', fn: stepCat }),
        FV.stepper({ cur: list.length ? Math.min(pickIdx[pickCat], list.length - 1) + 1 : '–', total: list.length, label: 'Stiker', fn: stepSticker })
      ],
      extra: [
        FV.chip('+ TAMBAH LAYER', addLayer, 'on'),
        state.layers.length ? FV.chip(tryLive ? 'COBA LANGSUNG: NYALA' : 'COBA LANGSUNG: MATI', function () { tryLive = !tryLive; buildControls(); }) : null
      ].filter(Boolean)
    });
  }
  function layerCard() {
    var n = state.layers.length;
    if (!n) return FV.card({ title: 'Layer', cls: 'note', desc: 'Belum ada stiker. Pilih stiker di atas lalu tekan TAMBAH LAYER. Maksimal ' + state.maxLayers + ' layer.' });
    if (selected < 0 || selected >= n) selected = n - 1;
    var i = selected, l = state.layers[i], hidden = !!(l[F.flags] & 1), side = l[F.side];
    function stepLayer(dir) { if (pending) return; selected = (selected + dir + n) % n; syncPick(); buildControls(); }
    function stepSide(dir) {
      if (pending) return;
      var m = sides.length, s = (side + dir + m) % m;
      setLayer(i, F.side, s, true); request('camera', sides[s][1], 0); buildControls();
    }
    function tool(label, fn, cls) { return FV.chip(label, function () { if (!pending) fn(); }, cls); }
    return FV.card({ title: 'Layer', tag: hidden ? 'TERSEMBUNYI' : '', cls: 'sel',
      desc: 'Layer ' + (i + 1) + ' dari ' + n + ': ' + pretty(l[F.sticker]) + '. Layer atas menutupi layer bawah.',
      steps: [
        FV.stepper({ cur: i + 1, total: n, label: 'Layer', fn: stepLayer }),
        FV.stepper({ cur: sides[side] ? sides[side][0] : '–', total: null, label: 'Sisi mobil', fn: stepSide })
      ],
      extra: [
        tool(hidden ? 'TAMPILKAN' : 'SEMBUNYIKAN', function () { setLayer(i, F.flags, l[F.flags] ^ 1, true); buildControls(); }),
        tool('NAIK', function () { if (i + 1 >= n) return; flush(); request('up',i,0); var t = state.layers[i]; state.layers[i] = state.layers[i+1]; state.layers[i+1] = t; selected = i + 1; buildControls(); }),
        tool('TURUN', function () { if (i <= 0) return; flush(); request('down',i,0); var t = state.layers[i]; state.layers[i] = state.layers[i-1]; state.layers[i-1] = t; selected = i - 1; buildControls(); }),
        tool('SALIN', function () { if (n >= state.maxLayers) { state.message = 'Maksimal '+state.maxLayers+' layer stiker.'; footer(); return; } flush(); request('dup',i,0); }),
        tool('HAPUS', function () { flush(); request('del',i,0); state.layers.splice(i,1); selected = Math.min(selected, state.layers.length-1); buildControls(); }, 'bad'),
        tool('HAPUS SEMUA', function () { flush(); selected = -1; state.layers = []; request('clear',0,0); buildControls(); }, 'bad')
      ] });
  }
  function editCards() {
    var i = selected, l = state.layers[i];
    if (!l) return [];
    var it = item(l[F.sticker]), aspect = it ? it[3] : 1;
    var pct = function (v) { return (v / 10).toFixed(1) + '%'; };
    var out = [];
    out.push(FV.card({ title: 'Posisi', desc: 'Geser stiker. Tahan panah untuk geser terus.', steps: [
      valueStepper('Horizontal', i, F.u, -1000, 1000, 12, pct),
      valueStepper('Vertikal', i, F.v, -1000, 1000, 12, pct)] }));
    out.push(FV.card({ title: 'Ukuran & putar', desc: lockRatio ? 'Rasio terkunci: tinggi ikut lebar.' : 'Rasio bebas: atur tinggi di kartu bawah.', steps: [
      valueStepper('Lebar', i, F.w, 80, 4000, 20, function (v) { return (v / 1000).toFixed(2) + ' m'; }, function (v) {
        if (lockRatio) setLayer(i, F.h, Math.max(80, Math.min(4000, Math.round(v / (aspect || 1)))), false);
      }),
      valueStepper('Putar', i, F.rot, -1800, 1800, 50, function (v) { return (v / 10).toFixed(0) + '°'; })],
      extra: [
        FV.chip(lockRatio ? 'RASIO TERKUNCI' : 'RASIO BEBAS', function () { lockRatio = !lockRatio; buildControls(); }, lockRatio ? 'on' : ''),
        FV.chip('CERMIN X', function () { if (!pending) { setLayer(i, F.flags, l[F.flags] ^ 2, true); buildControls(); } }, (l[F.flags] & 2) ? 'on' : ''),
        FV.chip('CERMIN Y', function () { if (!pending) { setLayer(i, F.flags, l[F.flags] ^ 4, true); buildControls(); } }, (l[F.flags] & 4) ? 'on' : '')
      ] }));
    if (!lockRatio) out.push(FV.card({ title: 'Tinggi', desc: 'Tinggi stiker (rasio bebas).', steps: [
      valueStepper('Tinggi', i, F.h, 80, 4000, 20, function (v) { return (v / 1000).toFixed(2) + ' m'; })] }));
    var hx = hex6(l[F.color]), pi = palette.indexOf(hx.toLowerCase());
    out.push(FV.card({ title: 'Warna', desc: 'Putih = warna asli stiker. ' + (pi >= 0 ? paletteName[pi] : '#' + hx) + '.', steps: [
      FV.stepper({ cur: pi < 0 ? '–' : pi + 1, total: palette.length, label: 'Warna', dot: '#' + hx, fn: function (dir) {
        if (pending) return;
        var m = palette.length, next = pi < 0 ? 0 : (pi + dir + m) % m;
        setLayer(i, F.color, rgba(parseInt(palette[next], 16), alpha(l[F.color])), true); buildControls();
      } }),
      (function () {
        var vb = null;
        var s = FV.stepper({ cur: Math.round(alpha(l[F.color]) / 255 * 100) + '%', total: null, label: 'Tampak', hold: true, every: 70, release: flush,
          fn: function (dir) {
            if (pending) return;
            var a = Math.max(20, Math.min(255, alpha(l[F.color]) + dir * 5));
            setLayer(i, F.color, rgba(u32(l[F.color]) >>> 8, a), false);
            if (vb) vb.textContent = Math.round(a / 255 * 100) + '%';
          } });
        vb = s.querySelector('.fv-val b');
        return s;
      })()] }));
    return out;
  }
  function syncPick() {
    var l = state && state.layers[selected];
    if (!l) return;
    var it = item(l[F.sticker]);
    if (!it) return;
    pickCat = it[1];
    var k = (byCat[pickCat] || []).indexOf(it[0]);
    if (k >= 0) pickIdx[pickCat] = k;
  }
  function stickerCards() { return [pickCard(), layerCard()].concat(editCards()); }

  /* ---------------- Aksesoris ---------------- */
  function accCards() {
    return [FV.card({ title: 'Aksesoris', cls: 'note', desc: 'Aksesoris attachment (bodi, teks, lampu sorot) memakai Modshop server. Bisa untuk semua jenis kendaraan, terlihat semua pemain.',
      extra: [FV.chip('BUKA MODSHOP', function () {
        if (pending) return; if (dirtyCount()) { state.message = 'Simpan atau batalkan perubahan dulu.'; footer(); return; }
        flush(); request('modshop',0,0); closeLocal();
      }, 'on')] })];
  }

  var tabs = [{t:'Body kit', icon:'wrench'}, {t:'Stiker', icon:'sticker'}, {t:'Aksesoris', icon:'box'}];
  function buildControls() {
    if (!state) return;
    var old = root.querySelector('.fv-panel'), keep = old && old.getAttribute('data-tab') === String(tab) ? old.scrollTop : 0;
    root.textContent = '';
    root.appendChild(FV.hints([['◀ ▶', 'Ganti sudut kamera'], ['TAHAN', 'Geser stiker terus'], ['+ LAYER', 'Tempel stiker baru'], ['SIMPAN', 'Terlihat semua pemain']],
      ['RP EAGLE / KIT', state.name || ('Kendaraan ' + state.model)]));
    root.appendChild(FV.topbar('KAMERA: ' + cams[cam], function (dir) {
      if (pending) return; cam = (cam + dir + cams.length) % cams.length; flush(); request('camera', cam, 0); buildControls();
    }));
    var railItems = tabs.slice();
    if (state.evm) railItems.push({t:'Cat & mesin', icon:'engine'});
    root.appendChild(FV.rail(railItems, tab, function (i) {
      if (pending) return;
      if (i === 3) {
        if (dirtyCount()) { state.message = 'Simpan atau batalkan perubahan dulu.'; footer(); return; }
        flush(); request('evm',0,0); closeLocal(); return;
      }
      if (i === tab) return;
      flush(); tab = i; request('tab', i, 0); buildControls();
    }));
    var cards = tab === 0 ? kitCards() : tab === 1 ? stickerCards() : accCards();
    var panel = h('div', { class: 'fv-panel', 'data-touch': '1', 'data-tab': String(tab), 'aria-label': tabs[tab].t }, cards);
    root.appendChild(panel);
    root.appendChild(FV.poses([
      { icon: 'reset', t: 'Batalkan perubahan', label: 'Batalkan', fn: function () { if (pending) return; flush(); request('revert',0,0); request('kitreset',0,0); } }
    ]));
    var bar = FV.savebar({ status: statusText(), label: pending ? 'MENYIMPAN…' : 'SIMPAN', disabled: pending || !dirtyCount(), fn: saveRequest,
      cancel: 'BATAL', cancelFn: closeRequest });
    root.appendChild(bar);
    saveBtn = bar.querySelector('.fv-save'); statusEl = bar.querySelector('.fv-status');
    panel.scrollTop = keep;
    footer(); E.touch();
  }
  function closeLocal() {
    clearTimeout(timer); timer = 0; queued = {}; state = null; pending = false; saveSeq = 0; selected = -1; saveBtn = statusEl = null;
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
    root.classList.add('on'); root.setAttribute('aria-hidden','false');
    document.body.classList.add('eagle-vehmod-open'); cam = 0; syncPick(); buildControls(); E.touch();
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
    if (grew) { selected = state.layers.length - 1; syncPick(); }
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
