/* EAGLE V218 - /modif "EAGLE GARAGE" gaya Need for Speed Underground 2.
   Menu utama berupa kartu kategori di bawah (seperti garasi NFSU2), statistik Kecepatan / Akselerasi / Handling
   di kanan atas, panel Performa (part Street/Pro/Extreme), Dyno Tuning (slider tunable) dan Cat Spesial.
   Body kit, vinyl & decal, cat, velg, lampu, stance, plat dibuka di panel EKV/EVM yang sudah ada.
   Server (cef_nfs_garage.inc) yang memvalidasi & menyimpan; efek handling dihitung di HP (game/EagleTune.cpp). */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;
  var h = U.h, state = null, seq = 0, lastClosed = 0, pending = false, saveSeq = 0, queued = {}, timer = 0, cam = 0;

  var LEVELS = ['STANDAR', 'STREET', 'PRO', 'EXTREME'];
  // [field, nama, ikon, efek per level]
  var PARTS = [
    [2, 'Mesin', 'engine', ['', '+8% tenaga', '+16% tenaga', '+26% tenaga']],
    [3, 'ECU', 'brain', ['', 'Respon +5%', 'Respon +10%', 'Respon +15%']],
    [4, 'Turbo', 'bolt', ['', '+8% boost', '+15% boost', '+24% boost']],
    [5, 'Transmisi', 'gear', ['', 'Top speed +3%', 'Top speed +6%', 'Top speed +10%']],
    [6, 'Suspensi', 'down', ['', 'Kaku +8%', 'Kaku +16%', 'Kaku +25%']],
    [7, 'Nitro', 'fire', ['', 'Nitro 2x', 'Nitro 5x', 'Nitro 10x']],
    [8, 'Ban', 'target', ['', 'Grip +5%', 'Grip +10%', 'Grip +16%']],
    [9, 'Rem', 'stop', ['', 'Rem +12%', 'Rem +25%', 'Rem +40%']],
    [10, 'Bobot', 'dumbbell', ['', 'Bobot -4%', 'Bobot -8%', 'Bobot -12%']]
  ];
  // [field, nama, kiri, kanan, field part yang harus terpasang]
  var DYNO = [
    [11, 'Mesin', 'Putaran atas', 'Torsi', 2], [12, 'Turbo', 'Boost rendah', 'Boost tinggi', 4],
    [13, 'ECU', 'Halus', 'Responsif', 3], [14, 'Gigi', 'Rasio pendek', 'Rasio panjang', 5],
    [15, 'Suspensi', 'Empuk', 'Keras', 6], [16, 'Bias', 'Belakang', 'Depan', 6],
    [17, 'Setir', 'Lambat', 'Tajam', 6], [18, 'Rem', 'Lembut', 'Pakem', 9],
    [19, 'Ban', 'Drift', 'Grip', 8], [20, 'Aero', 'Kecepatan', 'Downforce', -1]
  ];
  var DRIVES = ['BAWAAN', 'RWD', 'FWD', 'AWD'];
  var FINISH = [['GLOSS', 'Kilap standar'], ['METALIK', 'Serpihan logam halus'], ['PEARL', 'Kilau dua warna'],
    ['DOFF', 'Matte tanpa kilap'], ['KROM', 'Cermin mengilap'], ['CANDY', 'Warna pekat & dalam']];
  var PEARL = ['ffffff', 'ccff00', '7cf7ff', '5b7cff', 'b45bff', 'ff5bd1', 'ff5b5b', 'ffb35b', 'ffe45b', '5bff9a', '8a8f94', 'd9b36b'];
  var MENU = [
    {t: 'PERFORMA', d: 'Mesin, turbo, nitro & lainnya', icon: 'engine', view: 1},
    {t: 'DYNO TUNING', d: 'Setel tiap part yang terpasang', icon: 'gear', view: 2},
    {t: 'CAT SPESIAL', d: 'Gloss, metalik, pearl, candy', icon: 'star', view: 3},
    {t: 'BODY KIT', d: 'Bumper, sideskirt, spoiler, kap', icon: 'wrench', go: 5},
    {t: 'VINYL & DECAL', d: 'Stiker berlapis di bodi', icon: 'tag', go: 6},
    {t: 'CAT & KACA', d: 'Warna bodi & kaca film', icon: 'grid', go: 0, evm: true},
    {t: 'VELG', d: 'Model, warna & ukuran velg', icon: 'target', go: 1, evm: true},
    {t: 'LAMPU & NEON', d: 'Warna lampu & underglow', icon: 'light', go: 2, evm: true},
    {t: 'STANCE', d: 'Tinggi, camber, offset', icon: 'down', go: 3, evm: true},
    {t: 'PLAT', d: 'Nomor & wilayah plat', icon: 'id', go: 4, evm: true},
    {t: 'AKSESORIS', d: 'Attachment modshop', icon: 'box', go: 7}
  ];
  var CAMS = ['DEPAN', 'BELAKANG', 'SAMPING', 'DYNO'];

  var root = h('section', {id: 'eagle-nfs-garage', class: 'nfs', 'aria-hidden': 'true'});
  U.layer('vehiclemodlayer').appendChild(root);

  function btn(text, cls, fn) {
    var b = h('button', {type: 'button', class: cls, text: text});
    b.addEventListener('click', function (e) { e.stopPropagation(); if (!b.disabled) fn(); });
    return b;
  }
  function ico(name) { return h('span', {class: 'nfs-ico', html: U.icon(name)}); }
  function request(action, index, body) {
    if (!state) return 0;
    seq++;
    E.send('nfsgarage', action, index, state.sid + '|' + seq + '|' + String(body == null ? 0 : body));
    return seq;
  }
  function flush() {
    clearTimeout(timer); timer = 0;
    var q = queued; queued = {};
    Object.keys(q).forEach(function (k) { request(q[k].action, q[k].index, q[k].body); });
  }
  function schedule(key, action, index, body, now) {
    queued[key] = {action: action, index: index, body: body};
    if (now) flush(); else if (!timer) timer = setTimeout(flush, 110);
  }
  function dirty() {
    if (!state) return 0;
    return state.values.filter(function (v, i) { return v !== state.saved[i]; }).length;
  }
  function setField(f, v, now) {
    if (!state || pending) return;
    state.values[f] = v; state.message = '';
    schedule('set:' + f, 'set', f, v, now);
    render();
  }

  // ---------------------------------------------------------------- bagian layar
  function stat(label, now, saved) {
    var bar = h('div', {class: 'nfs-bar'}, [
      h('i', {class: 'nfs-bar-s', style: 'width:' + saved + '%'}), h('i', {class: 'nfs-bar-d', style: 'width:' + now + '%'})]);
    var diff = now - saved;
    return h('div', {class: 'nfs-stat'}, [
      h('div', {class: 'nfs-stat-h'}, [h('span', {text: label}),
        h('b', {class: diff > 0 ? 'up' : diff < 0 ? 'down' : '', text: (diff > 0 ? '+' : '') + (diff || '')})]), bar]);
  }
  function header() {
    var s = state;
    return h('header', {class: 'nfs-head'}, [
      h('div', {class: 'nfs-brand'}, [
        h('span', {class: 'nfs-logo', text: 'EAGLE GARAGE'}),
        h('h1', {class: 'nfs-car', text: s.name || ('Kendaraan ' + s.model)}),
        h('div', {class: 'nfs-tags'}, [h('span', {class: 'nfs-tag', text: (s.cls || 'Street').toUpperCase()}),
          s.custom ? h('span', {class: 'nfs-tag ghost', text: 'ID ' + s.model}) : null])
      ]),
      h('div', {class: 'nfs-stats', 'aria-label': 'Statistik'}, [
        h('div', {class: 'nfs-top'}, [h('b', {text: String(s.top || 0)}), h('span', {text: 'km/jam'})]),
        stat('KECEPATAN', s.speed, s.savedSpeed), stat('AKSELERASI', s.accel, s.savedAccel), stat('HANDLING', s.handling, s.savedHandling),
        h('div', {class: 'nfs-mini'}, [
          h('span', {text: 'Tenaga ' + sign(s.power) + '%'}), h('span', {text: 'Grip ' + sign(s.grip) + '%'}),
          h('span', {text: 'Rem ' + sign(s.brake) + '%'}), h('span', {text: 'Bobot ' + sign(s.mass) + '%'})])
      ])
    ]);
  }
  function sign(v) { v = +v || 0; return (v > 0 ? '+' : '') + v; }
  function cameras() {
    return h('nav', {class: 'nfs-cams', 'data-touch': '1'}, CAMS.map(function (c, i) {
      return btn(c, 'nfs-cam' + (i === cam ? ' on' : ''), function () { if (pending) return; cam = i; flush(); request('camera', i, 0); render(); });
    }));
  }
  function hub() {
    var list = MENU.filter(function (m) { return !m.evm || state.evm; });
    return h('div', {class: 'nfs-menu', 'data-touch': '1'}, list.map(function (m, i) {
      var b = h('button', {type: 'button', class: 'nfs-tile', style: '--i:' + i}, [
        ico(m.icon), h('b', {text: m.t}), h('small', {text: m.d})]);
      b.addEventListener('click', function () {
        if (pending) return;
        if (m.view) { flush(); state.view = m.view; request('view', m.view, 0); render(); return; }
        if (dirty()) { state.message = 'Simpan atau batalkan tuning dulu sebelum pindah menu.'; render(); return; }
        flush(); request('go', m.go, 0); lastClosed = state.sid; closeLocal();
      });
      return b;
    }));
  }
  function row(title, iconName, extra, body) {
    return h('section', {class: 'nfs-row'}, [
      h('div', {class: 'nfs-row-h'}, [ico(iconName), h('b', {text: title}), extra ? h('span', {class: 'nfs-row-x', text: extra}) : null]), body]);
  }
  function performance() {
    var v = state.values, out = [];
    out.push(h('div', {class: 'nfs-presets'}, [h('span', {text: 'PAKET'})].concat(LEVELS.map(function (l, i) {
      var all = PARTS.every(function (p) { return p[0] === 7 && !state.nitroOk ? true : v[p[0]] === i; });
      return btn(l, 'nfs-chip' + (all ? ' on' : ''), function () {
        if (pending) return; flush();
        PARTS.forEach(function (p) { if (p[0] !== 7 || state.nitroOk) v[p[0]] = i; });
        if (!i) for (var d = 11; d <= 21; d++) v[d] = 0;
        request('preset', i, 0); render();
      });
    }))));
    PARTS.forEach(function (p) {
      var f = p[0], off = f === 7 && !state.nitroOk;
      var chips = h('div', {class: 'nfs-levels'}, LEVELS.map(function (l, i) {
        var b = btn(l, 'nfs-lv' + (v[f] === i ? ' on' : '') + (state.saved[f] === i ? ' saved' : ''), function () { setField(f, i, true); });
        b.disabled = off || pending; return b;
      }));
      out.push(row(p[1], p[2], off ? 'Tidak didukung' : (p[3][v[f]] || 'Bawaan pabrik'), chips));
    });
    return out;
  }
  function dyno() {
    var v = state.values, out = [];
    DYNO.forEach(function (d) {
      var f = d[0], open = d[4] < 0 || v[d[4]] > 0, val = v[f];
      var range = h('input', {type: 'range', min: -10, max: 10, step: 1, class: 'nfs-range', 'aria-label': d[1]});
      range.value = val; range.disabled = !open || pending;
      range.style.setProperty('--fill', ((val + 10) / 20 * 100) + '%');
      range.addEventListener('input', function () {
        var n = Math.round(+range.value); state.values[f] = n; state.message = '';
        range.style.setProperty('--fill', ((n + 10) / 20 * 100) + '%');
        var o = range.parentNode.querySelector('output'); if (o) o.textContent = sign(n);
        schedule('set:' + f, 'set', f, n, false);
      });
      range.addEventListener('change', function () { flush(); });
      var need = d[4] >= 0 ? PARTS.filter(function (p) { return p[0] === d[4]; })[0] : null;
      out.push(row(d[1], open ? 'gear' : 'lock', open ? '' : 'Pasang ' + (need ? need[1] : 'part'),
        h('div', {class: 'nfs-dyno' + (open ? '' : ' off')}, [h('small', {text: d[2]}), range, h('small', {text: d[3]}), h('output', {text: sign(val)})])));
    });
    var drive = h('div', {class: 'nfs-levels'}, DRIVES.map(function (t, i) {
      var b = btn(t, 'nfs-lv' + (v[21] === i ? ' on' : ''), function () { setField(21, i, true); });
      b.disabled = pending || (i > 0 && v[5] < 2); return b;
    }));
    out.push(row('Penggerak', 'car', v[5] < 2 ? 'Butuh Transmisi PRO' : '', drive));
    out.push(h('div', {class: 'nfs-actions'}, [btn('NETRALKAN DYNO', 'nfs-chip', function () {
      if (pending) return; flush();
      for (var d = 11; d <= 20; d++) { if (state.values[d]) request('reset', d, 0); state.values[d] = 0; }
      render();
    })]));
    return out;
  }
  function paint() {
    var v = state.values, out = [];
    out.push(h('div', {class: 'nfs-finish'}, FINISH.map(function (f, i) {
      var b = h('button', {type: 'button', class: 'nfs-fin fin-' + i + (v[0] === i ? ' on' : '')}, [h('i'), h('b', {text: f[0]}), h('small', {text: f[1]})]);
      b.addEventListener('click', function () { setField(0, i, true); });
      return b;
    })));
    if (v[0] === 2) {
      var sw = h('div', {class: 'nfs-swatches'}, [btn('TANPA', 'nfs-sw none' + (v[1] < 0 ? ' on' : ''), function () { setField(1, -1, true); })]
        .concat(PEARL.map(function (c) {
          var n = parseInt(c, 16), b = btn('', 'nfs-sw' + (v[1] === n ? ' on' : ''), function () { setField(1, n, true); });
          b.style.setProperty('--sw', '#' + c); return b;
        })));
      out.push(row('Warna pearl', 'star', '', sw));
    }
    out.push(h('p', {class: 'nfs-note', text: 'Warna dasar bodi diatur di menu CAT & KACA. Finishing berlaku untuk semua pemain setelah disimpan.'}));
    return out;
  }
  function render() {
    if (!state) return;
    var keep = root.querySelector('.nfs-panel'), scroll = keep ? keep.scrollTop : 0;
    root.textContent = '';
    root.appendChild(header());
    root.appendChild(cameras());
    if (!state.view) root.appendChild(hub());
    else {
      var titles = ['', 'PERFORMA', 'DYNO TUNING', 'CAT SPESIAL'];
      var body = state.view === 1 ? performance() : state.view === 2 ? dyno() : paint();
      var panel = h('div', {class: 'nfs-panel', 'data-touch': '1'}, [h('div', {class: 'nfs-panel-h'}, [
        btn('', 'nfs-back', function () { if (pending) return; flush(); state.view = 0; request('view', 0, 0); render(); }),
        h('b', {text: titles[state.view]})])].concat(body));
      panel.querySelector('.nfs-back').innerHTML = U.icon('back');
      root.appendChild(panel);
      panel.scrollTop = scroll;
    }
    var n = dirty();
    var status = state.message || (n ? n + ' perubahan belum disimpan' : 'Sesuai data tersimpan');
    var save = btn(pending ? 'MENYIMPAN…' : 'SIMPAN', 'nfs-save', saveRequest);
    save.disabled = pending || !n;
    root.appendChild(h('footer', {class: 'nfs-foot', 'data-touch': '1'}, [
      btn(state.view ? 'MENU' : 'KELUAR', 'nfs-ghost', function () {
        if (state.view) { if (pending) return; flush(); state.view = 0; request('view', 0, 0); render(); } else closeRequest();
      }),
      h('p', {class: 'nfs-status' + (state.message ? ' msg' : ''), role: 'status', text: status}),
      n ? btn('BATAL', 'nfs-ghost', function () { if (pending) return; flush(); request('reset', -1, 0); state.values = state.saved.slice(); render(); }) : null,
      save]));
    E.touch();
  }
  function closeLocal() {
    clearTimeout(timer); timer = 0; queued = {}; state = null; pending = false; saveSeq = 0;
    root.classList.remove('on'); root.setAttribute('aria-hidden', 'true'); root.removeAttribute('data-touch');
    root.textContent = ''; document.body.classList.remove('eagle-vehmod-open'); E.touch();
  }
  function closeRequest() {
    if (!state || pending) return;
    clearTimeout(timer); timer = 0; queued = {};
    request('close', 0, 0); lastClosed = state.sid; closeLocal();
  }
  function saveRequest() {
    if (!state || pending || !dirty()) return;
    flush(); pending = true; state.message = ''; saveSeq = request('save', 0, 0); render();
  }
  function valid(a) { return Array.isArray(a) && a.length === 22 && a.every(function (v) { return Number.isInteger(v); }); }
  E.on('nfsgarage', function (d) {
    if (!d || !Number.isInteger(+d.sid) || +d.sid <= 0) return;
    var sid = +d.sid;
    if (d.show === 0 || d.show === false) { if (state && sid === state.sid) { lastClosed = Math.max(lastClosed, sid); closeLocal(); } return; }
    if (sid <= lastClosed || (state && sid < state.sid)) return;
    if (!valid(d.values) || !valid(d.saved)) return;
    var fresh = !state || sid !== state.sid;
    if (fresh) {
      closeLocal();
      state = Object.assign({}, d, {sid: sid, values: d.values.slice(), saved: d.saved.slice(), view: Math.max(0, Math.min(3, +d.view || 0))});
      seq = Math.max(0, +d.ack || 0); pending = false; cam = 0;
      root.classList.add('on'); root.setAttribute('aria-hidden', 'false'); root.setAttribute('data-touch', '');
      document.body.classList.add('eagle-vehmod-open'); render(); return;
    }
    var ack = +d.ack || 0;
    if (ack < (state.ack || 0)) return;
    state.ack = ack;
    var stats = ['top', 'savedTop', 'speed', 'accel', 'handling', 'savedSpeed', 'savedAccel', 'savedHandling', 'power', 'grip', 'brake', 'mass', 'nitroOk'];
    stats.forEach(function (k) { state[k] = d[k]; });
    state.saved = d.saved.slice(); state.message = d.message || '';
    if (pending && ack >= saveSeq) { pending = false; saveSeq = 0; }
    // input lokal yang belum dibalas server tetap dipakai
    if (ack >= seq && !Object.keys(queued).length) { state.values = d.values.slice(); state.view = Math.max(0, Math.min(3, +d.view || 0)); }
    var active = document.activeElement;
    if (active && active.classList && active.classList.contains('nfs-range')) return;   // jangan ganggu slider yang sedang digeser
    render();
  });
  E.on('auth', function (d) { if (d && ['login', 'register', 'chars', 'charinfo', 'create', 'spawn'].indexOf(d.v) >= 0) closeLocal(); });
  window.addEventListener('keydown', function (e) {
    if (!state || !E.canInteract(root) || e.defaultPrevented || e.isComposing || e.repeat) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (state.view) { flush(); state.view = 0; request('view', 0, 0); render(); } else closeRequest(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveRequest(); }
  }, true);
  root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  E.done('nfs_garage');
})();
