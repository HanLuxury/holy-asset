/* EAGLE V220 - EAGLE GARAGE (/modif) gaya Need for Speed Underground 2. Satu layar untuk semua modif:
   performa, dyno, cat spesial, cat & kaca, velg, lampu & neon, stance, plat, body kit, part universal,
   vinyl berlapis dan livery. Edit langsung di mobil: 1 jari geser, 2 jari cubit (ukuran) & putar.
   Tiga sesi server berjalan bersama: nfsgarage (tuning, kamera, part), vehkit (body kit, vinyl, livery),
   vehmod (cat, velg, lampu, stance, plat). Server yang memvalidasi & menyimpan semuanya ke database. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;
  var D = window.EAGLENfsData || {cats: [], parts: [], liveries: [], thumbs: {}};
  var SC = window.EAGLEStickerCatalog || {categories: [], items: []};
  var VC = window.EAGLEVehicleModCatalog || [];
  var h = U.h;

  // ------------------------------------------------------------------ data tetap
  var LEVELS = ['STANDAR', 'STREET', 'PRO', 'EXTREME'];
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
  var DYNO = [
    [11, 'Mesin', 'Putaran atas', 'Torsi', 2], [12, 'Turbo', 'Boost rendah', 'Boost tinggi', 4],
    [13, 'ECU', 'Halus', 'Responsif', 3], [14, 'Gigi', 'Rasio pendek', 'Rasio panjang', 5],
    [15, 'Suspensi', 'Empuk', 'Keras', 6], [16, 'Bias', 'Belakang', 'Depan', 6],
    [17, 'Setir', 'Lambat', 'Tajam', 6], [18, 'Rem', 'Lembut', 'Pakem', 9],
    [19, 'Ban', 'Drift', 'Grip', 8], [20, 'Aero', 'Kecepatan', 'Downforce', -1]
  ];
  var DRIVES = ['BAWAAN', 'RWD', 'FWD', 'AWD'];
  var FINISH = [['GLOSS', 'Kilap standar'], ['METALIK', 'Serpihan logam'], ['PEARL', 'Kilau dua warna'],
    ['DOFF', 'Matte'], ['KROM', 'Cermin'], ['CANDY', 'Pekat & dalam']];
  var PEARL = ['ffffff', 'ccff00', '7cf7ff', '5b7cff', 'b45bff', 'ff5bd1', 'ff5b5b', 'ffb35b', 'ffe45b', '5bff9a', '8a8f94', 'd9b36b'];
  // warna cat & stiker (RGB) gaya palet NFSU2
  var PAL = ['ffffff', 'c9ccd1', '8a8f94', '3a3d42', '111214', 'e02b2b', 'ff6a00', 'ffb400', 'ffe600', 'b4ff00', '33d96b', '00c2a8',
    '00b4ff', '1f5cff', '5a2dff', 'a020f0', 'ff2ea6', 'ff7aa8', '7a1010', '0b2a66', '2f4f2f', 'c9a46b', 'b87333', '6b4423'];
  var GTA = '000000f5f5f52a77a184041026373986446ed78e104c75b7bdbec65e707246597a656a795d7e8d58595ad6dad69ca1a3335f3f730e1a7b0a2a9f9d943b4e78732e3e691e3b96918c5154593f3e45a5a9a7635c5a3d4a68979592421f215f272b8494ab767b7c6464645a57522525272d3a3593a3966d7a882219186f675f7c1c2a5f0a151938265d1b209d98727a7560989586adb0b0848988304f454d6268162248272f4b7d62569ea4ab9c8d716d18224e68819c9c98917347661c26949d9fa4a7a58e8c46341a1e6a7a8caaad8eab988f851f2e6f82975858539aa790601a2320202ca4a096aa9d8478222b0e316d722a3f7b715e741d281e2e324d322f7c1b442e5b20395a836d2837a7a28fafb1b13641556d6c6e0f6a89204b6b2b3e579b9f9d6c84954d8495ae9b7f406c8f1f253bab927613457396816c64686a105082a199833856945256617f69568c929a596e8747353244624f730a27223457640d1ba3adc66958539b8b80620b1c5b5d5e6244287318271b376dec6aae000000177517210606125478452a0d571e1e01070125225a2c89aa8a4dbd35963ab7b7b7464c8d84888c817867817a266a506f583e6f8cb972824f786d276a1e1d131e13061f25182c45311e4c992e5f431e99481e99999999767c8499992e1e2c1e08142407993e4d1e4c991981811a292a16616f1b66876c3f99481a0e7a7399746d9953387e2224073e190c46210e991e1e8d4c8d805b807b3e7e3c173773351778181883341a8e2f1c7e3e537c6d7c020c0207240716301216301b642b4f368452999590818d9699991e7f994c8392927882222b3c993a3a0b8a794e0e1f4915371c15273a37577506082007132620394b2c508915426c1032502416636920158c8d94516013090f028c573a52888e995c5299581e993a63998f4e99311e0d1842521e1e42420d4c991e082a1d96821d197f193b141f745217893f8d7e1a6c0b370b27450d071f247845738a653a73261731949056941d59163d1b8a2f38160b041804355d8e2e3f5b561a284e0e27706c673b3e422e2d337b7e7d4a444228344e';
  // sama urutan dengan FontNames di server (tanpa "Custom Font")
  var FONTS = ['Arial', 'Calibri', 'Comic Sans MS', 'Georgia', 'Times New Roman', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
    'Impact', 'Lucida Console', 'Palatino Linotype', 'Tahoma', 'Trebuchet MS', 'Verdana'];
  // [yaw, pitch, jarak*10] sama dengan NFS_Camera di server
  var CAMP = [[35, 12, 60], [145, 12, 60], [270, 10, 60], [0, 6, 48], [0, 70, 64], [270, 10, 52], [90, 10, 52], [0, 12, 52], [180, 12, 52]];
  var CAMS = [['DEPAN', 0], ['BELAKANG', 1], ['SAMPING', 2], ['ATAS', 4], ['DYNO', 3]];
  var SIDES = ['ATAS', 'KANAN', 'KIRI', 'DEPAN', 'BELAKANG'];
  // sumbu U & V tiap sisi vinyl (x kanan, y depan, z atas) + indeks setengah ukuran mobil
  var AX = [[[1, 0, 0], [0, 1, 0], 0, 1], [[0, 1, 0], [0, 0, 1], 1, 2], [[0, -1, 0], [0, 0, 1], 1, 2],
    [[-1, 0, 0], [0, 0, 1], 0, 2], [[1, 0, 0], [0, 0, 1], 0, 2]];
  var CAT_WORD = {stickers: 'Stiker', racing: 'Racing', logos: 'Logo', clubs: 'Klub', characters: 'Karakter', letters: 'Huruf',
    shapes: 'Bentuk', gradients: 'Gradasi', flame: 'Api', tribal: 'Tribal', stripe: 'Strip', splash: 'Cipratan',
    abstract: 'Abstrak', number: 'Nomor', sponsor: 'Sponsor', banner: 'Banner'};
  var VIEWS = {
    1: {t: 'PERFORMA', icon: 'engine', d: 'Mesin, turbo, nitro', need: 'perf', cam: 3},
    2: {t: 'DYNO TUNING', icon: 'gear', d: 'Setel part terpasang', need: 'perf', cam: 3},
    3: {t: 'CAT SPESIAL', icon: 'star', d: 'Gloss, pearl, krom, candy', cam: 0},
    4: {t: 'VINYL', icon: 'tag', d: 'Stiker berlapis, edit langsung', need: 'kit', cam: 5},
    5: {t: 'PART UNIVERSAL', icon: 'box', d: 'Sayap, kap, rok, bumper', cam: 0},
    6: {t: 'BODY KIT', icon: 'wrench', d: 'Set Alien, X-Flow, Krom', need: 'kit', cam: 0},
    7: {t: 'LIVERY', icon: 'flag', d: '20 livery siap pakai', need: 'kit', cam: 2},
    8: {t: 'CAT & KACA', icon: 'grid', d: 'Warna bodi & kaca film', need: 'evm', cam: 0},
    9: {t: 'VELG', icon: 'target', d: 'Model, warna, ukuran', need: 'evm', cam: 2},
    10: {t: 'LAMPU & NEON', icon: 'light', d: 'Lampu & underglow', need: 'evm', cam: 0},
    11: {t: 'STANCE', icon: 'down', d: 'Tinggi, camber, offset', need: 'evm', cam: 2},
    12: {t: 'PLAT', icon: 'id', d: 'Nomor & wilayah', need: 'evm', cam: 1}
  };
  var GROUPS = [['PART', 'wrench', [6, 5, 9, 11]], ['VISUAL', 'star', [8, 3, 4, 7, 10, 12]], ['PERFORMA', 'engine', [1, 2]]];

  // gambar vinyl (img/vinyl_sheet.png: 8 kolom, sel 96x48, urut id)
  var thumbIds = Object.keys(D.thumbs || {}).map(Number).sort(function (a, b) { return a - b; });
  var thumbPos = {};
  thumbIds.forEach(function (id, n) { thumbPos[id] = n; });
  var SHEET = 'url(img/vinyl_sheet.png)', ROWS = Math.max(1, Math.ceil(thumbIds.length / 8));
  var byCat = (SC.categories || []).map(function () { return []; });
  (SC.items || []).forEach(function (it) { if (byCat[it[1]]) byCat[it[1]].push(it[0]); });

  // ------------------------------------------------------------------ sesi server
  function chan(name) { return {name: name, st: null, seq: 0, ack: 0, lastClosed: 0, q: {}, timer: 0, pending: false, saveSeq: 0}; }
  var C = {nfs: chan('nfsgarage'), kit: chan('vehkit'), evm: chan('vehmod')};
  var ALL = [C.nfs, C.kit, C.evm];
  function send(c, action, index, body) {
    if (!c.st) return 0;
    c.seq++;
    E.send(c.name, action, index | 0, c.st.sid + '|' + c.seq + '|' + String(body == null ? 0 : body));
    return c.seq;
  }
  function flush(c) {
    clearTimeout(c.timer); c.timer = 0;
    var q = c.q; c.q = {};
    Object.keys(q).forEach(function (k) { send(c, q[k][0], q[k][1], q[k][2]); });
  }
  function flushAll() { ALL.forEach(flush); }
  function queue(c, key, action, index, body, now) {
    if (!c.st) return;
    c.q[key] = [action, index, body];
    if (now) flush(c); else if (!c.timer) c.timer = setTimeout(function () { flush(c); }, 110);
  }
  function quiet(c) { return c.ack >= c.seq && !Object.keys(c.q).length; }
  function busy() { return ALL.some(function (c) { return c.pending; }); }

  // ------------------------------------------------------------------ state UI
  var view = 0, group = 1, sel = -1, psel = -1, mode = 'obj', picker = '', partPick = false, pickCat = 8, partCat = 0;
  var lockRatio = true, sym = true, lvA = 0xe02b2b, lvB = 0x111214, curSide = 1, addWait = false, padd = false;
  var msg = '', msgBad = false, confirmExit = false, exitAfterSave = false, allColors = false, hideUi = false;
  var cam = CAMP[0].slice(), raf = 0, partTouched = false, sliding = false;
  // slider yang sedang digeser jangan dibangun ulang (balasan server datang di tengah geseran)
  function slideEnd() { if (sliding) { sliding = false; flushAll(); render(); } }
  window.addEventListener('pointerup', slideEnd, true);
  window.addEventListener('pointercancel', slideEnd, true);
  window.addEventListener('touchend', slideEnd, true);

  var root = h('section', {id: 'eagle-nfs-garage', class: 'nfs', 'aria-hidden': 'true'});
  var pad = h('div', {class: 'nfs-pad', 'data-touch': '1'});
  var ui = h('div', {class: 'nfs-ui'});
  var readout = h('div', {class: 'nfs-readout', role: 'status'});
  root.appendChild(pad); root.appendChild(ui); root.appendChild(readout);
  U.layer('vehiclemodlayer').appendChild(root);

  // ------------------------------------------------------------------ util
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sign(v) { v = +v || 0; return (v > 0 ? '+' : '') + v; }
  function hex6(rgb) { return ('000000' + ((rgb >>> 0) & 0xffffff).toString(16)).slice(-6); }
  function rgba(rgb, a) { return (((rgb & 0xffffff) << 8) | (a & 255)) | 0; }
  function cssRgba(c) { c = c >>> 0; return 'rgba(' + (c >>> 24) + ',' + ((c >>> 16) & 255) + ',' + ((c >>> 8) & 255) + ',' + ((c & 255) / 255).toFixed(2) + ')'; }
  function gta(i) { return i >= 0 && i < 256 ? '#' + GTA.substr(i * 6, 6) : 'transparent'; }
  function wrapRot(v, lim) { lim = lim || 1800; v = Math.round(v); while (v > lim) v -= 2 * lim; while (v < -lim) v += 2 * lim; return v; }
  function ico(name) { return h('span', {class: 'nfs-ico', html: U.icon(name)}); }
  function btn(text, cls, fn, icon) {
    var b = h('button', {type: 'button', class: cls}, [icon ? ico(icon) : null, text ? h('span', {text: text}) : null]);
    b.addEventListener('click', function (e) { e.stopPropagation(); if (!b.disabled) { clearMsg(); fn(e); } });
    return b;
  }
  // tombol tahan: ulang terus selama ditekan
  function hold(text, cls, fn, icon, title) {
    var b = h('button', {type: 'button', class: cls, title: title || ''}, [icon ? ico(icon) : null, text ? h('span', {text: text}) : null]);
    var t1 = 0, t2 = 0;
    function stop() { clearTimeout(t1); clearInterval(t2); t1 = t2 = 0; flushAll(); }
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation(); if (b.disabled) return;
      clearMsg(); fn(); t1 = setTimeout(function () { t2 = setInterval(fn, 70); }, 320);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, stop); });
    return b;
  }
  function setMsg(m, bad) { msg = m || ''; msgBad = !!bad || /tidak|gagal|penuh|kurang|maksimal|dulu|hanya|butuh/i.test(msg); }
  function clearMsg() { msg = ''; msgBad = false; }
  function money(n) { return U.money ? U.money(n) : '$' + n; }
  function stickerName(id) {
    var it = SC.items && SC.items[id]; if (!it) return '#' + id;
    var m = /^([a-z]+)_(\d+)$/.exec(it[2]);
    if (m && CAT_WORD[m[1]]) return CAT_WORD[m[1]] + ' ' + (+m[2]);
    return it[2].replace(/_/g, ' ');
  }
  function thumb(id, bg) {
    var n = thumbPos[id], el = h('i', {class: 'nfs-th'});
    if (n == null) { el.classList.add('txt'); el.textContent = stickerName(id).replace(/^[A-Za-z]+ /, ''); return el; }
    el.style.webkitMaskImage = el.style.maskImage = SHEET;
    el.style.webkitMaskSize = el.style.maskSize = '800% ' + (ROWS * 100) + '%';
    el.style.webkitMaskPosition = el.style.maskPosition = ((n % 8) / 7 * 100) + '% ' + (ROWS > 1 ? Math.floor(n / 8) / (ROWS - 1) * 100 : 0) + '%';
    if (bg) el.style.background = bg;
    return el;
  }
  // stiker dengan ukuran sebenarnya (em) untuk pratinjau livery
  function stickerBox(id, w, hh, bg) {
    var n = thumbPos[id], el = h('i', {class: 'nfs-lvst'});
    el.style.width = w + 'em'; el.style.height = hh + 'em'; el.style.background = bg;
    if (n == null) return el;
    var it = SC.items[id], a = it ? (+it[3] || 2) : 2;
    var cw = Math.min(92, 44 * a), ch = cw / a;
    if (ch > 44) { ch = 44; cw = 44 * a; }
    cw = Math.max(1, Math.round(cw)); ch = Math.max(1, Math.round(ch));
    var x0 = (n % 8) * 96 + Math.floor((96 - cw) / 2), y0 = Math.floor(n / 8) * 48 + Math.floor((48 - ch) / 2);
    var ex = w / cw, ey = hh / ch;
    el.style.webkitMaskImage = el.style.maskImage = SHEET;
    el.style.webkitMaskSize = el.style.maskSize = (768 * ex) + 'em ' + (ROWS * 48 * ey) + 'em';
    el.style.webkitMaskPosition = el.style.maskPosition = (-x0 * ex) + 'em ' + (-y0 * ey) + 'em';
    return el;
  }
  function carSize() {
    var s = C.nfs.st && C.nfs.st.size;
    if (!Array.isArray(s) || s.length !== 3 || !(s[0] > 300) || !(s[1] > 300) || !(s[2] > 300)) return [2000, 4600, 1400];
    return s;
  }

  // ------------------------------------------------------------------ perubahan
  function dNfs() {
    var s = C.nfs.st; if (!s) return 0;
    var n = 0; s.values.forEach(function (v, i) { if (v !== s.saved[i]) n++; });
    return n + ((+s.partDirty || 0) > 0 || partTouched ? 1 : 0);
  }
  function dKit() {
    var s = C.kit.st; if (!s) return 0;
    var n = 0;
    s.kit.forEach(function (k) { if (k.cur !== k.saved) n++; });
    if (s.layers.length !== s.savedLayers.length) n++;
    else s.layers.forEach(function (l, i) { if (l.join() !== s.savedLayers[i].join()) n++; });
    return n;
  }
  function dEvm() {
    var s = C.evm.st; if (!s) return 0;
    var n = 0; s.values.forEach(function (v, i) { if (v !== s.saved[i]) n++; });
    return n + (s.plate !== s.savedPlate ? 1 : 0) + (s.region !== s.savedRegion ? 1 : 0);
  }
  function dirtyOf(c) { return c === C.nfs ? dNfs() : c === C.kit ? dKit() : dEvm(); }
  function dirty() { return dNfs() + dKit() + dEvm(); }

  // ------------------------------------------------------------------ kamera
  function camRight() { var t = cam[0] * Math.PI / 180; return [-Math.cos(t), -Math.sin(t), 0]; }
  function camUp() {
    var t = cam[0] * Math.PI / 180, p = cam[1] * Math.PI / 180;
    return [Math.sin(t) * Math.sin(p), -Math.cos(t) * Math.sin(p), Math.cos(p)];
  }
  function camFwd() {
    var t = cam[0] * Math.PI / 180, p = cam[1] * Math.PI / 180;
    return [Math.sin(t) * Math.cos(p), -Math.cos(t) * Math.cos(p), -Math.sin(p)];
  }
  function mpp() { return 0.93 * Math.max(1.2, cam[2] / 10 - 1.0) / Math.max(200, window.innerHeight || 400); }
  // geser layar (px) -> geser dunia di ruang mobil (meter)
  function screenToCar(dx, dy) {
    var r = camRight(), u = camUp(), k = mpp();
    return [(dx * r[0] - dy * u[0]) * k, (dx * r[1] - dy * u[1]) * k, (dx * r[2] - dy * u[2]) * k];
  }
  function setCam(i) {
    if (!CAMP[i] || !C.nfs.st) return;
    cam = CAMP[i].slice();
    flush(C.nfs); send(C.nfs, 'camera', i, 0);
  }
  function orbit(now) { queue(C.nfs, 'orbit', 'orbit', 1, Math.round(cam[0]) + ',' + Math.round(cam[1]) + ',' + Math.round(cam[2]), now); }

  // ------------------------------------------------------------------ vinyl & part terpilih
  function layers() { return C.kit.st ? C.kit.st.layers : []; }
  function layer() { var l = layers(); return sel >= 0 && sel < l.length ? l[sel] : null; }
  function parts() { return C.nfs.st && Array.isArray(C.nfs.st.parts) ? C.nfs.st.parts : []; }
  function part() { var p = parts(); for (var i = 0; i < p.length; i++) if (p[i][0] === psel) return p[i]; return null; }
  function partner(p) {
    if (!p || !sym) return null;
    var best = null, bd = 1e9;
    parts().forEach(function (q) {
      if (q === p || q[11] !== p[11] || q[11] < 0 || q[1] !== p[1]) return;
      var d = Math.abs(q[4] + p[4]) + Math.abs(q[5] - p[5]) + Math.abs(q[6] - p[6]);
      if (d < bd) { bd = d; best = q; }
    });
    return best && bd < 2500 ? best : null;
  }
  function partName(p) {
    if (p[1] === 2) return 'Teks "' + (p[12] || '') + '"';
    var it = D.parts[p[11]];
    if (it && it[2] === p[2]) return it[6];
    if (it && it[3] === p[2]) return it[6] + ' (kanan)';
    for (var i = 0; i < D.parts.length; i++) if (D.parts[i][2] === p[2] && p[2]) return D.parts[i][6];
    return (p[1] === 3 ? 'Lampu ' : 'Objek ') + p[2];
  }
  function sendLayer(i, now) {
    var l = layers()[i]; if (!l) return;
    queue(C.kit, 'xf:' + i, 'xf', i, [l[2], l[3], l[4], l[5], l[6]].join(','), now);
  }
  function setLayerField(i, f, v) {
    var l = layers()[i]; if (!l || busy()) return;
    l[f] = v; flush(C.kit); send(C.kit, 'set', i, f + ':' + v);
  }
  function sendPart(p, now) {
    if (!p) return;
    partTouched = true;
    queue(C.nfs, 'pxf:' + p[0], 'pxf', p[0], [p[4], p[5], p[6], p[7], p[8], p[9]].join(','), now);
  }
  function mirrorTo(p, q) {
    if (!q) return;
    q[4] = -p[4]; q[5] = p[5]; q[6] = p[6]; q[7] = p[7]; q[8] = wrapRot(-p[8], 3600); q[9] = wrapRot(-p[9], 3600);
    sendPart(q, false);
  }
  function showReadout() {
    var t = '';
    if (view === 4 && layer()) {
      var l = layer();
      t = SIDES[l[1]] + ' · ' + (l[2] / 10).toFixed(0) + '% , ' + (l[3] / 10).toFixed(0) + '% · ' + (l[4] / 1000).toFixed(2) + ' × ' + (l[5] / 1000).toFixed(2) + ' m · ' + (l[6] / 10).toFixed(0) + '°';
    } else if (view === 5 && part()) {
      var p = part();
      t = 'X ' + (p[4] / 1000).toFixed(2) + ' · Y ' + (p[5] / 1000).toFixed(2) + ' · Z ' + (p[6] / 1000).toFixed(2) + ' m · ' +
        (p[7] / 10).toFixed(0) + '° ' + (p[8] / 10).toFixed(0) + '° ' + (p[9] / 10).toFixed(0) + '°';
    }
    readout.textContent = t;
    readout.classList.toggle('on', !!t);
  }

  // ------------------------------------------------------------------ sentuh langsung di mobil
  var P = {}, G = null;
  function pts() { return Object.keys(P).map(function (k) { return P[k]; }); }
  function center(p) { var x = 0, y = 0; p.forEach(function (q) { x += q.x; y += q.y; }); return {x: x / p.length, y: y / p.length}; }
  function gap(p) { return p.length > 1 ? Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y) : 0; }
  function angle(p) { return p.length > 1 ? Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x) : 0; }
  function target() {
    if (mode === 'cam' || busy()) return 'cam';
    if (view === 4 && layer()) return 'stk';
    if (view === 5 && part()) return 'part';
    return 'cam';
  }
  function gBegin() {
    var p = pts();
    if (!p.length) { G = null; return; }
    G = {n: p.length, c: center(p), d: gap(p), a: angle(p), t: target(), cam: cam.slice(), moved: G ? G.moved : false, t0: G ? G.t0 : Date.now()};
    if (G.t === 'stk') G.base = layer().slice();
    if (G.t === 'part') G.base = part().slice();
  }
  function gMove() {
    if (!G) return;
    var p = pts();
    if (p.length !== G.n) { gBegin(); return; }
    var c = center(p), dx = c.x - G.c.x, dy = c.y - G.c.y;
    var s = G.n > 1 && G.d > 12 ? gap(p) / G.d : 1, da = 0;
    if (G.n > 1) { da = angle(p) - G.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; }
    if (!G.moved && Math.abs(dx) + Math.abs(dy) < 5 && Math.abs(s - 1) < 0.03 && Math.abs(da) < 0.03) return;
    G.moved = true;
    if (G.t === 'stk') dragSticker(dx, dy, s, da);
    else if (G.t === 'part') dragPart(dx, dy, s, da);
    else {
      cam[0] = ((G.cam[0] - dx * 0.4) % 360 + 360) % 360;
      cam[1] = clamp(G.cam[1] + dy * 0.25, -8, 85);
      cam[2] = clamp(G.cam[2] / s, 24, 120);
      orbit(false);
    }
    showReadout();
  }
  function dragSticker(dx, dy, s, da) {
    var l = layer(), b = G.base;
    if (!l) return;
    var ax = AX[l[1]] || AX[1], size = carSize(), w = screenToCar(dx, dy);
    var du = (w[0] * ax[0][0] + w[1] * ax[0][1] + w[2] * ax[0][2]) * 1000, dv = (w[0] * ax[1][0] + w[1] * ax[1][1] + w[2] * ax[1][2]) * 1000;
    l[2] = clamp(Math.round(b[2] + du / (size[ax[2]] / 2) * 1000), -1000, 1000);
    l[3] = clamp(Math.round(b[3] + dv / (size[ax[3]] / 2) * 1000), -1000, 1000);
    if (G.n > 1) {
      var k = clamp(s, 80 / Math.min(b[4], b[5]), 4000 / Math.max(b[4], b[5]));
      l[4] = clamp(Math.round(b[4] * k), 80, 4000); l[5] = clamp(Math.round(b[5] * k), 80, 4000);
      l[6] = wrapRot(b[6] - da * 1800 / Math.PI);
    }
    sendLayer(sel, false);
  }
  function dragPart(dx, dy, s, da) {
    var p = part(), b = G.base;
    if (!p) return;
    if (mode === 'rot') {
      p[9] = wrapRot(b[9] - dx * 5, 3600); p[7] = wrapRot(b[7] + dy * 5, 3600);
      if (G.n > 1) p[8] = wrapRot(b[8] + da * 1800 / Math.PI, 3600);
    } else {
      var w = screenToCar(dx, dy), f = camFwd(), z = G.n > 1 ? (s - 1) * 1500 : 0;
      p[4] = clamp(Math.round(b[4] + w[0] * 1000 - f[0] * z), -6000, 6000);
      p[5] = clamp(Math.round(b[5] + w[1] * 1000 - f[1] * z), -6000, 6000);
      p[6] = clamp(Math.round(b[6] + w[2] * 1000 - f[2] * z), -6000, 6000);
      if (G.n > 1) p[9] = wrapRot(b[9] - da * 1800 / Math.PI, 3600);
    }
    sendPart(p, false); mirrorTo(p, partner(p));
  }
  pad.addEventListener('pointerdown', function (e) {
    if (!C.nfs.st) return;
    e.preventDefault();
    try { pad.setPointerCapture(e.pointerId); } catch (x) { /* pointer sudah lepas */ }
    P[e.pointerId] = {x: e.clientX, y: e.clientY};
    if (Object.keys(P).length > 2) return;
    var moved = G && G.moved; gBegin(); if (G) G.moved = !!moved;
  });
  pad.addEventListener('pointermove', function (e) {
    if (!P[e.pointerId]) return;
    P[e.pointerId] = {x: e.clientX, y: e.clientY};
    gMove();
  });
  function pEnd(e) {
    if (!P[e.pointerId]) return;
    delete P[e.pointerId];
    if (Object.keys(P).length) { var m = G && G.moved; gBegin(); if (G) G.moved = !!m; return; }
    var moved = G && G.moved, t = G && G.t;
    var quick = G && Date.now() - G.t0 < 300;
    G = null; flushAll();
    if (moved) render();
    else if (quick && (view === 4 || view === 5)) { hideUi = !hideUi; render(); }
  }
  pad.addEventListener('pointerup', pEnd);
  pad.addEventListener('pointercancel', pEnd);
  pad.addEventListener('wheel', function (e) {
    if (!C.nfs.st) return;
    e.preventDefault(); cam[2] = clamp(cam[2] * (e.deltaY > 0 ? 1.08 : 0.92), 24, 120); orbit(false);
  }, {passive: false});

  // ------------------------------------------------------------------ navigasi
  function viewOk(v) {
    var m = VIEWS[v], s = C.nfs.st;
    if (!m || !s) return false;
    if (m.need === 'perf') return !!s.perf;
    if (m.need === 'kit') return !!C.kit.st;
    if (m.need === 'evm') return !!C.evm.st;
    return true;
  }
  function viewShown(v) {
    var m = VIEWS[v], s = C.nfs.st;
    if (!m || !s) return false;
    if (m.need === 'perf') return !!s.perf;
    if (m.need === 'evm') return !!s.evm;
    return true;
  }
  function go(v) {
    if (busy()) return;
    flushAll(); clearMsg();
    picker = ''; partPick = false; hideUi = false; confirmExit = false;
    view = v; sendView(v);
    if (v === 4) { var l = layer(); setCam(4 + (l ? l[1] : curSide)); mode = 'obj'; }
    else if (v === 5) { mode = 'obj'; setCam(0); }
    else if (v && VIEWS[v]) setCam(VIEWS[v].cam);
    if (!v) GROUPS.forEach(function (g, i) { if (g[2].indexOf(view) >= 0) group = i; });
    render();
  }
  var lastSentView = 0;
  function sendView(v) { lastSentView = v >= 0 && v <= 6 ? v : 0; send(C.nfs, 'view', lastSentView, 0); }
  function back() {
    if (picker) { picker = ''; render(); return; }
    if (partPick) { partPick = false; render(); return; }
    var from = view; view = 0; flushAll(); sendView(0);
    GROUPS.forEach(function (g, i) { if (g[2].indexOf(from) >= 0) group = i; });
    hideUi = false; render();
  }

  // ------------------------------------------------------------------ bagian layar umum
  function stat(label, now, saved) {
    var diff = (now || 0) - (saved || 0);
    return h('div', {class: 'nfs-stat'}, [
      h('div', {class: 'nfs-stat-h'}, [h('span', {text: label}), h('b', {class: diff > 0 ? 'up' : diff < 0 ? 'down' : '', text: diff ? sign(diff) : ''})]),
      h('div', {class: 'nfs-bar'}, [h('i', {class: 'nfs-bar-s', style: 'width:' + clamp(saved || 0, 0, 100) + '%'}),
        h('i', {class: 'nfs-bar-d', style: 'width:' + clamp(now || 0, 0, 100) + '%'})])]);
  }
  function head() {
    var s = C.nfs.st, sub = view ? VIEWS[view].t : 'GARASI';
    var out = h('header', {class: 'nfs-head' + (view ? ' mini' : '')}, [
      h('div', {class: 'nfs-brand'}, [h('span', {class: 'nfs-logo', text: 'EAGLE GARAGE'}), view ? h('b', {class: 'nfs-crumb', text: sub}) : null]),
      h('h1', {class: 'nfs-car', text: s.name || ('Kendaraan ' + s.model)}),
      view ? null : h('div', {class: 'nfs-tags'}, [h('span', {class: 'nfs-tag', text: String(s.cls || 'Street').toUpperCase()}),
        s.custom ? h('span', {class: 'nfs-tag ghost', text: 'ID ' + s.model}) : null])
    ]);
    return out;
  }
  function stats() {
    var s = C.nfs.st;
    if (!s.perf || (view && view !== 1 && view !== 2)) return null;
    return h('aside', {class: 'nfs-stats'}, [
      h('div', {class: 'nfs-top'}, [h('b', {text: String(s.top || 0)}), h('span', {text: 'km/jam'}),
        s.top !== s.savedTop ? h('em', {text: sign((s.top || 0) - (s.savedTop || 0))}) : null]),
      stat('KECEPATAN', s.speed, s.savedSpeed), stat('AKSELERASI', s.accel, s.savedAccel), stat('HANDLING', s.handling, s.savedHandling),
      h('div', {class: 'nfs-mini'}, [h('span', {text: 'Tenaga ' + sign(s.power) + '%'}), h('span', {text: 'Grip ' + sign(s.grip) + '%'}),
        h('span', {text: 'Rem ' + sign(s.brake) + '%'}), h('span', {text: 'Bobot ' + sign(s.mass) + '%'})])
    ]);
  }
  function camBar() {
    var b = h('nav', {class: 'nfs-cams'}, CAMS.map(function (c) {
      return btn(c[0], 'nfs-cam', function () { setCam(c[1]); });
    }));
    b.appendChild(hold('', 'nfs-cam z', function () { cam[2] = clamp(cam[2] * 0.94, 24, 120); orbit(false); }, 'plus', 'Dekat'));
    b.appendChild(hold('', 'nfs-cam z', function () { cam[2] = clamp(cam[2] * 1.06, 24, 120); orbit(false); }, 'minus', 'Jauh'));
    return b;
  }
  function hub() {
    var g = GROUPS[group] && GROUPS[group][2].some(viewShown) ? group : 0;
    while (g < GROUPS.length - 1 && !GROUPS[g][2].some(viewShown)) g++;
    var tabs = h('div', {class: 'nfs-groups'}, GROUPS.map(function (gr, i) {
      if (!gr[2].some(viewShown)) return null;
      return btn(gr[0], 'nfs-group' + (i === g ? ' on' : ''), function () { group = i; render(); }, gr[1]);
    }));
    var list = GROUPS[g][2].filter(viewShown), k = 0;
    var tiles = h('div', {class: 'nfs-tiles'}, list.map(function (v) {
      var m = VIEWS[v], ok = viewOk(v);
      var b = h('button', {type: 'button', class: 'nfs-tile' + (ok ? '' : ' wait'), style: '--i:' + (k++)}, [
        ico(m.icon), h('b', {text: m.t}), h('small', {text: ok ? (summary(v) || m.d) : 'Memuat…'})]);
      b.addEventListener('click', function () { if (viewOk(v)) go(v); });
      return b;
    }));
    return h('div', {class: 'nfs-hub'}, [tabs, tiles]);
  }
  function summary(v) {
    var s = C.nfs.st, k = C.kit.st, e = C.evm.st;
    if (v === 1 && s) { var lv = PARTS.map(function (p) { return s.values[p[0]]; }), mx = Math.max.apply(null, lv); return mx ? 'Level tertinggi: ' + LEVELS[mx] : ''; }
    if (v === 3 && s) return FINISH[s.values[0]] ? 'Finishing ' + FINISH[s.values[0]][0] : '';
    if (v === 4 && k) return k.layers.length ? k.layers.length + ' / ' + k.maxLayers + ' layer' : '';
    if (v === 5 && s) return parts().length + ' / ' + (s.partMax || 0) + ' part terpasang';
    if (v === 6 && k) { var n = k.kit.filter(function (x) { return x.cur; }).length; return n ? n + ' part GTA terpasang' : ''; }
    if (v === 7 && k) return k.layers.some(function (l) { return l[8] & 8; }) ? 'Livery terpasang' : '';
    if (v === 12 && e) return e.plate || '';
    return '';
  }
  function section(title, icon, extra, body) {
    return h('section', {class: 'nfs-sec'}, [h('div', {class: 'nfs-sec-h'}, [icon ? ico(icon) : null, h('b', {text: title}),
      extra ? h('span', {class: 'nfs-sec-x', text: extra}) : null]), body]);
  }
  function chips(list, cur, fn, cls) {
    return h('div', {class: 'nfs-chips ' + (cls || '')}, list.map(function (o) {
      var b = btn(o[1], 'nfs-chip' + (o[0] === cur ? ' on' : ''), function () { fn(o[0]); });
      if (o[2]) b.disabled = true;
      return b;
    }));
  }
  // palet RGB (cat bodi, neon, stiker). orig: tombol warna asli (-1)
  function palette(cur, fn, orig) {
    var row = h('div', {class: 'nfs-pal'});
    if (orig) row.appendChild(btn('ASLI', 'nfs-sw orig' + (cur < 0 ? ' on' : ''), function () { fn(-1); }));
    PAL.forEach(function (c) {
      var v = parseInt(c, 16), b = btn('', 'nfs-sw' + ((cur & 0xffffff) === v && cur >= 0 ? ' on' : ''), function () { fn(v); });
      b.style.setProperty('--sw', '#' + c); row.appendChild(b);
    });
    var input = h('input', {type: 'text', class: 'nfs-hex', maxlength: 6, placeholder: 'RRGGBB', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Kode warna'});
    if (cur >= 0) input.value = hex6(cur).toUpperCase();
    function apply() {
      var t = input.value.replace(/^#/, '').trim();
      if (/^[0-9a-fA-F]{6}$/.test(t)) { fn(parseInt(t, 16)); input.blur(); } else { setMsg('Kode warna harus 6 digit, contoh FF6A00.', true); paintFoot(); }
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    row.appendChild(h('div', {class: 'nfs-hexrow'}, [h('i', {class: 'nfs-hexdot', style: 'background:' + (cur >= 0 ? '#' + hex6(cur) : 'transparent')}), input, btn('OK', 'nfs-chip', apply)]));
    return row;
  }
  function gtaPalette(cur, fn, orig) {
    var ids = allColors ? null : [0, 1, 3, 6, 126, 79, 86, 128, 135, 136, 137, 2, 7, 16, 17, 18, 36, 40, 53, 75, 83, 91, 104, 109, 146, 152, 158, 175, 189, 205, 211, 228, 252];
    var row = h('div', {class: 'nfs-pal gta'});
    if (orig) row.appendChild(btn('ASLI', 'nfs-sw orig' + (cur < 0 ? ' on' : ''), function () { fn(-1); }));
    (ids || Array.apply(null, Array(256)).map(function (x, i) { return i; })).forEach(function (i) {
      var b = btn('', 'nfs-sw' + (cur === i ? ' on' : ''), function () { fn(i); });
      b.style.setProperty('--sw', gta(i)); b.title = 'Warna ' + i; row.appendChild(b);
    });
    row.appendChild(btn(allColors ? 'RINGKAS' : 'SEMUA 256', 'nfs-chip', function () { allColors = !allColors; render(); }));
    return row;
  }
  function range(min, max, value, label, fmt, onInput) {
    var out = h('output', {text: fmt(value)});
    var r = h('input', {type: 'range', min: min, max: max, step: 1, class: 'nfs-range', 'aria-label': label});
    r.value = value; r.style.setProperty('--fill', ((value - min) / (max - min) * 100) + '%');
    r.addEventListener('input', function () {
      var v = Math.round(+r.value); r.style.setProperty('--fill', ((v - min) / (max - min) * 100) + '%'); out.textContent = fmt(v); onInput(v, false);
    });
    r.addEventListener('change', function () { onInput(Math.round(+r.value), true); r.blur(); });
    r.addEventListener('pointerdown', function () { sliding = true; });
    r.addEventListener('touchstart', function () { sliding = true; }, {passive: true});
    return h('div', {class: 'nfs-rangebox'}, [r, out]);
  }

  // ------------------------------------------------------------------ PERFORMA / DYNO / CAT SPESIAL (nfsgarage)
  function nfsSet(f, v, now) {
    var s = C.nfs.st; if (!s || busy()) return;
    s.values[f] = v; queue(C.nfs, 'set:' + f, 'set', f, v, now);
    if (now) render();
  }
  function perfPanel() {
    var v = C.nfs.st.values, out = [];
    out.push(section('PAKET CEPAT', 'bolt', '', chips(LEVELS.map(function (l, i) { return [i, l]; }),
      PARTS.every(function (p) { return (p[0] === 7 && !C.nfs.st.nitroOk) || v[p[0]] === v[2]; }) ? v[2] : -9,
      function (i) {
        flush(C.nfs);
        PARTS.forEach(function (p) { if (p[0] !== 7 || C.nfs.st.nitroOk) v[p[0]] = i; });
        if (!i) for (var d = 11; d <= 21; d++) v[d] = 0;
        send(C.nfs, 'preset', i, 0); render();
      })));
    PARTS.forEach(function (p) {
      var f = p[0], off = f === 7 && !C.nfs.st.nitroOk;
      out.push(section(p[1], p[2], off ? 'Tidak didukung' : (p[3][v[f]] || 'Bawaan pabrik'),
        chips(LEVELS.map(function (l, i) { return [i, l, off]; }), v[f], function (i) { nfsSet(f, i, true); }, 'lv')));
    });
    return out;
  }
  function dynoPanel() {
    var v = C.nfs.st.values, out = [];
    DYNO.forEach(function (d) {
      var f = d[0], open = d[4] < 0 || v[d[4]] > 0;
      var need = d[4] >= 0 ? PARTS.filter(function (p) { return p[0] === d[4]; })[0] : null;
      var body = open ? h('div', {class: 'nfs-dyno'}, [
        range(-10, 10, v[f], d[1], sign, function (n, end) { v[f] = n; queue(C.nfs, 'set:' + f, 'set', f, n, end); }),
        h('div', {class: 'nfs-dyno-l'}, [h('small', {text: '◀ ' + d[2]}), h('small', {text: d[3] + ' ▶'})])])
        : h('p', {class: 'nfs-note', text: 'Pasang ' + (need ? need[1] : 'part') + ' dulu di menu Performa.'});
      out.push(section(d[1], open ? 'gear' : 'lock', '', body));
    });
    out.push(section('PENGGERAK', 'car', v[5] < 2 ? 'Butuh Transmisi PRO' : '',
      chips(DRIVES.map(function (t, i) { return [i, t, i > 0 && v[5] < 2]; }), v[21], function (i) { nfsSet(21, i, true); }, 'lv')));
    out.push(h('div', {class: 'nfs-row-actions'}, [btn('NETRALKAN DYNO', 'nfs-chip', function () {
      flush(C.nfs);
      for (var d = 11; d <= 20; d++) { if (v[d]) send(C.nfs, 'reset', d, 0); v[d] = 0; }
      render();
    }, 'refresh')]));
    return out;
  }
  function paintPanel() {
    var v = C.nfs.st.values, out = [];
    out.push(h('div', {class: 'nfs-finish'}, FINISH.map(function (f, i) {
      var b = h('button', {type: 'button', class: 'nfs-fin fin-' + i + (v[0] === i ? ' on' : '')}, [h('i'), h('b', {text: f[0]}), h('small', {text: f[1]})]);
      b.addEventListener('click', function () { clearMsg(); nfsSet(0, i, true); });
      return b;
    })));
    if (v[0] === 2) {
      var row = h('div', {class: 'nfs-pal'}, [btn('TANPA', 'nfs-sw orig' + (v[1] < 0 ? ' on' : ''), function () { nfsSet(1, -1, true); })]);
      PEARL.forEach(function (c) {
        var n = parseInt(c, 16), b = btn('', 'nfs-sw' + (v[1] === n ? ' on' : ''), function () { nfsSet(1, n, true); });
        b.style.setProperty('--sw', '#' + c); row.appendChild(b);
      });
      out.push(section('WARNA PEARL', 'star', '', row));
    }
    out.push(h('p', {class: 'nfs-note', text: 'Warna dasar bodi diatur di CAT & KACA. Finishing terlihat semua pemain setelah disimpan.'}));
    return out;
  }

  // ------------------------------------------------------------------ CAT, VELG, LAMPU, STANCE, PLAT (vehmod)
  function evmField(id) { for (var i = 0; i < VC.length; i++) if (VC[i].id === id) return VC[i]; return null; }
  function evmSet(id, v, now) {
    var s = C.evm.st; if (!s || busy()) return;
    s.values[id] = v; queue(C.evm, 'set:' + id, 'set', id, v, now);
    if (now) render(); else paintFoot();
  }
  function evmLabel(f, v) {
    if (f.id === 1 || f.id === 2) return v + '%';
    if (f.id === 5 || f.id === 6) return v + '°';
    if (f.id === 14) return v < 0 ? 'Asli' : Math.round(v / 220 * 100) + '%';
    return sign(v) + ' cm';
  }
  function evmRow(id) {
    var f = evmField(id), s = C.evm.st;
    if (!f || !s) return null;
    var v = s.values[id], body;
    if (f.type === 'range') body = range(f.min, f.max, v, f.name, function (n) { return evmLabel(f, n); }, function (n, end) { evmSet(id, n, end); });
    else if (f.type === 'color') body = palette(v, function (n) { evmSet(id, n, true); }, f.min < 0);
    else {
      var opts = (f.options || []).slice();
      if (f.type === 'vinyl') { opts = [[-1, 'Tanpa']]; for (var n = 0; n < 16; n++) if (s.vinylMask & (1 << n)) opts.push([n, 'Vinyl ' + (n + 1)]); }
      if (f.id === 19 && !s.paintable) opts = opts.map(function (o) { return [o[0], o[1], o[0] >= 0]; });
      body = chips(opts, v, function (n) { evmSet(id, n, true); }, f.type === 'rim' ? 'rim' : '');
    }
    return section(f.name.toUpperCase(), '', v !== s.saved[id] ? 'DIUBAH' : '', body);
  }
  function evmPanel(ids) {
    var out = ids.map(evmRow).filter(Boolean);
    out.push(h('div', {class: 'nfs-row-actions'}, [btn('KEMBALIKAN BAGIAN INI', 'nfs-chip', function () {
      var s = C.evm.st; flush(C.evm);
      ids.forEach(function (id) { var f = evmField(id); if (f && s.values[id] !== f.default) { s.values[id] = f.default; send(C.evm, 'reset', id, 0); } });
      render();
    }, 'refresh')]));
    return out;
  }
  function platePanel() {
    var s = C.evm.st, out = [];
    var prev = h('div', {class: 'nfs-plate'}, [h('b', {text: s.plate || 'NOMOR'}), h('span', {text: s.region || 'RP'})]);
    out.push(prev);
    [[0, 'NOMOR PLAT', 12], [1, 'KODE WILAYAH', 3]].forEach(function (p) {
      var input = h('input', {type: 'text', class: 'nfs-text', maxlength: p[2], autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': p[1]});
      input.value = p[0] ? s.region : s.plate;
      input.addEventListener('input', function () {
        var t = input.value.toUpperCase().replace(p[0] ? /[^A-Z0-9]/g : /[^A-Z0-9 -]/g, '').slice(0, p[2]);
        input.value = t;
        if (p[0]) s.region = t; else s.plate = t;
        prev.firstChild.textContent = s.plate || 'NOMOR'; prev.lastChild.textContent = s.region || 'RP';
        clearMsg(); paintFoot();
        if (!p[0] && !/[A-Z0-9]/.test(t)) return;
        queue(C.evm, 'plate:' + p[0], 'plate', p[0], t || '0', false);
      });
      input.addEventListener('blur', function () { flush(C.evm); render(); });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
      out.push(section(p[1], 'id', '', input));
    });
    var r = evmRow(18); if (r) out.push(r);
    return out;
  }

  // ------------------------------------------------------------------ BODY KIT (vehkit)
  function kitPanel() {
    var s = C.kit.st, out = [];
    out.push(section('SET BODY KIT', 'wrench', 'Sekali tekan', h('div', {class: 'nfs-chips'}, [
      ['ALIEN', 0], ['X-FLOW', 1], ['KROM', 2], ['SLAMIN', 3], ['LEPAS SEMUA', 4]].map(function (k) {
      return btn(k[0], 'nfs-chip' + (k[1] === 4 ? ' bad' : ''), function () { flush(C.kit); send(C.kit, 'kitset', k[1], 0); });
    }).concat([btn('KEMBALIKAN', 'nfs-chip', function () { flush(C.kit); send(C.kit, 'kitreset', 0, 0); }, 'refresh')]))));
    if (!s.kit.length) out.push(h('p', {class: 'nfs-note', text: 'Kendaraan ini tidak punya part body kit GTA. Pakai PART UNIVERSAL: bisa dipasang di semua kendaraan.'}));
    s.kit.forEach(function (k) {
      var opts = [[0, 'Standar']].concat(k.opt.map(function (o) { return [o[0], o[1]]; }));
      out.push(section(String(k.name).toUpperCase(), '', k.cur !== k.saved ? 'DIUBAH' : '', chips(opts, k.cur, function (cid) {
        if (busy()) return; k.cur = cid; flush(C.kit); send(C.kit, 'kit', k.slot, cid); render();
      })));
    });
    out.push(btn('BUKA PART UNIVERSAL', 'nfs-wide', function () { go(5); }, 'box'));
    return out;
  }

  // ------------------------------------------------------------------ LIVERY (vehkit)
  function liveryOn() { return layers().some(function (l) { return l[8] & 8; }); }
  function syncLiveryColors() {
    layers().forEach(function (l) {
      if (!(l[8] & 8) || (l[8] & 32)) return;
      if (l[8] & 16) lvB = (l[7] >>> 8) & 0xffffff; else lvA = (l[7] >>> 8) & 0xffffff;
    });
  }
  function lvPreview(lv) {
    var size = carSize(), ls = lv[2] || [], side = ls.some(function (l) { return l[1] === 1; }) ? 1 : 0;
    var k = 9 / size[1], bw = size[1] * k, bh = (side ? size[2] : size[0]) * k;
    var box = h('div', {class: 'nfs-lvbox ' + (side ? 'side' : 'top')});
    box.style.width = bw + 'em'; box.style.height = bh + 'em';
    box.appendChild(h('i', {class: 'nfs-lvcar'}));
    ls.forEach(function (l) {
      if (l[1] !== side) return;
      var col = l[7] === 0 ? lvA : l[7] === 1 ? lvB : l[7] === 2 ? 0xffffff : 0x101010;
      var el = stickerBox(l[0], l[4] * k, l[5] * k, cssRgba(rgba(col, l[8])));
      var cx, cy, rot;
      if (side) { cx = (0.5 + l[2] / 2000) * bw; cy = (0.5 - l[3] / 2000) * bh; rot = -l[6] / 10; }
      else { cx = (0.5 + l[3] / 2000) * bw; cy = (0.5 + l[2] / 2000) * bh; rot = 90 - l[6] / 10; }
      el.style.left = cx + 'em'; el.style.top = cy + 'em';
      el.style.transform = 'translate(-50%,-50%) rotate(' + rot + 'deg)' + ((l[9] & 2) ? ' scaleX(-1)' : '') + ((l[9] & 4) ? ' scaleY(-1)' : '');
      box.appendChild(el);
    });
    return box;
  }
  function lvColors() { return (rgba(lvA, 255)) + ',' + (rgba(lvB, 255)); }
  function liveryPanel() {
    var out = [], on = liveryOn();
    out.push(h('div', {class: 'nfs-lvgrid'}, (D.liveries || []).map(function (lv) {
      var b = h('button', {type: 'button', class: 'nfs-lv'}, [lvPreview(lv), h('b', {text: lv[1]})]);
      b.addEventListener('click', function () {
        if (busy()) return; clearMsg(); flush(C.kit); send(C.kit, 'livery', lv[0], lvColors()); setCam(2);
      });
      return b;
    })));
    out.push(section('WARNA UTAMA (A)', '', on ? 'Langsung diterapkan' : '', palette(lvA, function (v) { lvA = v; if (on) { flush(C.kit); send(C.kit, 'lvcol', 0, lvColors()); } render(); })));
    out.push(section('WARNA KEDUA (B)', '', '', palette(lvB, function (v) { lvB = v; if (on) { flush(C.kit); send(C.kit, 'lvcol', 0, lvColors()); } render(); })));
    out.push(h('div', {class: 'nfs-row-actions'}, [
      btn('HAPUS LIVERY', 'nfs-chip bad', function () { flush(C.kit); send(C.kit, 'lvoff', 0, 0); }, 'trash'),
      btn('EDIT DI VINYL', 'nfs-chip', function () { go(4); }, 'tag')]));
    out.push(h('p', {class: 'nfs-note', text: 'Livery = kumpulan stiker. Stiker pribadimu tetap di atas livery. Tiap lapisan livery bisa digeser di menu VINYL.'}));
    return out;
  }

  // ------------------------------------------------------------------ VINYL (vehkit)
  function vinylPicker() {
    var out = [];
    out.push(h('div', {class: 'nfs-chips scroll'}, (SC.categories || []).map(function (c, i) {
      return btn(c[1], 'nfs-chip' + (i === pickCat ? ' on' : ''), function () { pickCat = i; render(); });
    })));
    var list = byCat[pickCat] || [], cur = layer();
    out.push(h('div', {class: 'nfs-grid'}, list.map(function (id) {
      var b = h('button', {type: 'button', class: 'nfs-cell' + (cur && picker === 'swap' && cur[0] === id ? ' on' : '')}, [thumb(id), h('small', {text: stickerName(id)})]);
      b.addEventListener('click', function () {
        if (busy()) return; clearMsg();
        if (picker === 'swap' && cur) { setLayerField(sel, 0, id); picker = ''; render(); return; }
        if (layers().length >= C.kit.st.maxLayers) { setMsg('Maksimal ' + C.kit.st.maxLayers + ' layer stiker.', true); paintFoot(); return; }
        var it = SC.items[id], a = it ? (+it[3] || 1) : 1;
        flush(C.kit); addWait = true; send(C.kit, 'add', id, clamp(Math.round(720 / a), 80, 4000)); picker = '';
      });
      return b;
    })));
    return out;
  }
  function vinylPanel() {
    if (picker) return vinylPicker();
    var s = C.kit.st, ls = s.layers, out = [], l = layer();
    out.push(h('div', {class: 'nfs-row-actions'}, [
      btn('TAMBAH', 'nfs-chip on', function () { picker = 'add'; render(); }, 'plus'),
      l ? btn('GANTI', 'nfs-chip', function () { var it = SC.items[l[0]]; if (it) pickCat = it[1]; picker = 'swap'; render(); }, 'refresh') : null,
      h('span', {class: 'nfs-count', text: ls.length + ' / ' + s.maxLayers})]));
    var list = h('div', {class: 'nfs-layers'});
    for (var i = ls.length - 1; i >= 0; i--) (function (i) {
      var L = ls[i], hid = !!(L[8] & 1);
      var row = h('div', {class: 'nfs-layer' + (i === sel ? ' on' : '') + (hid ? ' off' : '')}, [
        h('span', {class: 'nfs-lnum', text: String(i + 1)}), h('span', {class: 'nfs-thw'}, thumb(L[0], cssRgba(L[7]))),
        h('div', {class: 'nfs-lname'}, [h('b', {text: stickerName(L[0])}), h('small', {text: SIDES[L[1]] + ((L[8] & 8) ? ' · LIVERY' : '')})])]);
      var eye = btn('', 'nfs-eye', function () { setLayerField(i, 8, L[8] ^ 1); render(); }, hid ? 'lock' : 'eye');
      row.appendChild(eye);
      row.addEventListener('click', function () {
        if (busy()) return;
        sel = i; mode = 'obj'; curSide = L[1]; setCam(4 + L[1]); render();
      });
      list.appendChild(row);
    })(i);
    if (!ls.length) list.appendChild(h('p', {class: 'nfs-note', text: 'Belum ada vinyl. Tekan TAMBAH lalu pilih gambar. Geser di mobil dengan 1 jari, cubit 2 jari untuk ukuran, putar 2 jari untuk rotasi.'}));
    out.push(list);
    if (!l) return out;
    out.push(h('div', {class: 'nfs-row-actions'}, [
      btn('NAIK', 'nfs-chip', function () { if (sel + 1 >= ls.length) return; flush(C.kit); send(C.kit, 'up', sel, 0); var t = ls[sel]; ls[sel] = ls[sel + 1]; ls[sel + 1] = t; sel++; render(); }, 'up'),
      btn('TURUN', 'nfs-chip', function () { if (sel <= 0) return; flush(C.kit); send(C.kit, 'down', sel, 0); var t = ls[sel]; ls[sel] = ls[sel - 1]; ls[sel - 1] = t; sel--; render(); }, 'down'),
      btn('SALIN', 'nfs-chip', function () { if (ls.length >= s.maxLayers) { setMsg('Maksimal ' + s.maxLayers + ' layer stiker.', true); paintFoot(); return; } flush(C.kit); addWait = true; send(C.kit, 'dup', sel, 0); }, 'plus'),
      btn('HAPUS', 'nfs-chip bad', function () { flush(C.kit); send(C.kit, 'del', sel, 0); ls.splice(sel, 1); sel = Math.min(sel, ls.length - 1); render(); }, 'trash')]));
    out.push(section('SISI MOBIL', 'car', '', chips(SIDES.map(function (t, i) { return [i, t]; }), l[1], function (sd) {
      curSide = sd; setLayerField(sel, 1, sd); setCam(4 + sd); render();
    })));
    out.push(section('WARNA', '', '', palette((l[7] >>> 8) & 0xffffff, function (v) { setLayerField(sel, 7, rgba(v, l[7] & 255)); render(); })));
    out.push(section('TAMPAK', '', '', range(20, 255, l[7] & 255, 'Tampak', function (a) { return Math.round(a / 255 * 100) + '%'; }, function (a, end) {
      l[7] = rgba((l[7] >>> 8) & 0xffffff, a);
      queue(C.kit, 'set:' + sel + ':7', 'set', sel, '7:' + l[7], end);
    })));
    out.push(section('UKURAN', '', lockRatio ? 'Rasio terkunci' : 'Rasio bebas', h('div', {}, [
      range(80, 4000, l[4], 'Lebar', function (v) { return (v / 1000).toFixed(2) + ' m'; }, function (v, end) {
        if (lockRatio) l[5] = clamp(Math.round(l[5] * v / l[4]), 80, 4000);
        l[4] = v; sendLayer(sel, end); if (end) render();
      }),
      lockRatio ? null : range(80, 4000, l[5], 'Tinggi', function (v) { return (v / 1000).toFixed(2) + ' m'; }, function (v, end) { l[5] = v; sendLayer(sel, end); }),
      range(-1800, 1800, l[6], 'Putar', function (v) { return (v / 10).toFixed(0) + '°'; }, function (v, end) { l[6] = v; sendLayer(sel, end); })
    ])));
    out.push(h('div', {class: 'nfs-row-actions'}, [
      btn(lockRatio ? 'RASIO TERKUNCI' : 'RASIO BEBAS', 'nfs-chip' + (lockRatio ? ' on' : ''), function () { lockRatio = !lockRatio; render(); }),
      btn('CERMIN X', 'nfs-chip' + ((l[8] & 2) ? ' on' : ''), function () { setLayerField(sel, 8, l[8] ^ 2); render(); }),
      btn('CERMIN Y', 'nfs-chip' + ((l[8] & 4) ? ' on' : ''), function () { setLayerField(sel, 8, l[8] ^ 4); render(); }),
      btn('HAPUS SEMUA', 'nfs-chip bad', function () { flush(C.kit); sel = -1; s.layers = []; send(C.kit, 'clear', 0, 0); render(); }, 'trash')]));
    return out;
  }

  // ------------------------------------------------------------------ PART UNIVERSAL (nfsgarage)
  function partPicker() {
    var s = C.nfs.st, out = [];
    out.push(h('div', {class: 'nfs-chips scroll'}, (D.cats || []).map(function (c) {
      return btn(c[1], 'nfs-chip' + (c[0] === partCat ? ' on' : ''), function () { partCat = c[0]; render(); });
    })));
    var list = h('div', {class: 'nfs-items'});
    (D.parts || []).forEach(function (it) {
      if (it[1] !== partCat) return;
      var row = h('button', {type: 'button', class: 'nfs-item'}, [ico(it[5] === 2 ? 'tag' : it[5] === 3 ? 'light' : 'box'),
        h('b', {text: it[6]}), h('small', {text: it[3] ? 'Sepasang' : (it[0] === 150 ? 'Isi ID' : '')}), h('em', {text: money(it[4])})]);
      row.addEventListener('click', function () {
        if (busy()) return; clearMsg();
        if (it[0] === 150) { customId(); return; }
        flush(C.nfs); padd = true; partTouched = true; send(C.nfs, 'padd', it[0], 0); partPick = false;
      });
      list.appendChild(row);
    });
    out.push(list);
    if (partCat === 9) {
      var input = h('input', {type: 'number', class: 'nfs-text', min: 321, max: 19999, placeholder: 'ID objek 321-19999', 'aria-label': 'ID objek'});
      out.push(section('OBJEK ID BEBAS', 'box', '', h('div', {class: 'nfs-hexrow'}, [input, btn('PASANG', 'nfs-chip on', function () {
        var n = Math.round(+input.value);
        if (!(n >= 321 && n <= 19999) || (n >= 400 && n <= 611)) { setMsg('ID objek 321-19999 (bukan ID kendaraan).', true); paintFoot(); return; }
        input.blur(); flush(C.nfs); padd = true; partTouched = true; send(C.nfs, 'padd', 150, n); partPick = false;
      })])));
    }
    return out;
    function customId() { partCat = 9; render(); }
  }
  function partsPanel() {
    if (partPick) return partPicker();
    var s = C.nfs.st, ps = parts(), out = [], p = part();
    out.push(h('div', {class: 'nfs-partinfo'}, [h('span', {text: 'SLOT ' + ps.length + ' / ' + (s.partMax || 0)}),
      h('span', {text: 'BIAYA BARU ' + money(s.partCost || 0)}), h('span', {text: 'UANG ' + money(s.cash || 0)})]));
    out.push(h('div', {class: 'nfs-row-actions'}, [
      btn('TAMBAH PART', 'nfs-chip on', function () { partPick = true; render(); }, 'plus'),
      btn('KEMBALIKAN', 'nfs-chip', function () { flush(C.nfs); send(C.nfs, 'prevert', 0, 0); partTouched = false; }, 'refresh')]));
    var list = h('div', {class: 'nfs-layers'});
    ps.forEach(function (q) {
      var row = h('div', {class: 'nfs-layer' + (q[0] === psel ? ' on' : '')}, [h('span', {class: 'nfs-lnum', text: String(q[0] + 1)}),
        h('i', {class: 'nfs-pdot', style: 'background:' + (q[3] >= 0 ? gta(q[3]) : 'transparent')}),
        h('div', {class: 'nfs-lname'}, [h('b', {text: partName(q)}), h('small', {text: q[10] ? 'BARU · bayar saat simpan' : 'Terpasang'})])]);
      row.addEventListener('click', function () { if (busy()) return; psel = q[0]; mode = 'obj'; render(); });
      list.appendChild(row);
    });
    if (!ps.length) list.appendChild(h('p', {class: 'nfs-note', text: 'Belum ada part. Tekan TAMBAH PART. Part dipasang otomatis di posisi yang pas, lalu bisa digeser langsung di mobil.'}));
    out.push(list);
    if (!p) return out;
    out.push(h('div', {class: 'nfs-row-actions'}, [
      btn('SIMETRIS ' + (sym ? 'NYALA' : 'MATI'), 'nfs-chip' + (sym ? ' on' : ''), function () { sym = !sym; render(); }),
      btn('CERMIN', 'nfs-chip', function () { flush(C.nfs); partTouched = true; send(C.nfs, 'pmir', p[0], 0); }, 'plus'),
      btn('HAPUS', 'nfs-chip bad', function () { flush(C.nfs); partTouched = true; send(C.nfs, 'pdel', p[0], 0); psel = -1; }, 'trash')]));
    if (p[1] === 1) out.push(section('WARNA PART', '', p[3] < 0 ? 'Asli' : '#' + p[3], gtaPalette(p[3], function (c) {
      flush(C.nfs); p[3] = c; partTouched = true; send(C.nfs, 'pcol', p[0], c); var q = partner(p); if (q) { q[3] = c; send(C.nfs, 'pcol', q[0], c); } render();
    }, true)));
    if (p[1] === 2) {
      var t = h('input', {type: 'text', class: 'nfs-text', maxlength: 31, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Teks'});
      t.value = p[12] || '';
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); t.blur(); } });
      t.addEventListener('change', function () {
        var v = t.value.replace(/[|"\\%]/g, '').trim().slice(0, 31);
        if (!v) return; p[12] = v; flush(C.nfs); partTouched = true; send(C.nfs, 'ptext', p[0], v);
      });
      out.push(section('TEKS', 'tag', '', t));
      out.push(section('FONT', '', '', chips(FONTS.map(function (f, i) { return [i, f.replace(/ (MS|New|Roman|Console|Linotype)/g, '')]; }), FONTS.indexOf(p[13]), function (i) { flush(C.nfs); partTouched = true; send(C.nfs, 'pfont', p[0], i); })));
      out.push(section('UKURAN TEKS', '', '', range(8, 120, p[14] || 24, 'Ukuran', String, function (v, end) {
        p[14] = v; if (end) { flush(C.nfs); partTouched = true; send(C.nfs, 'psize', p[0], v); }
      })));
      out.push(section('WARNA TEKS', '', '', gtaPalette(p[15], function (c) { flush(C.nfs); partTouched = true; send(C.nfs, 'pfcol', p[0], c); }, false)));
    }
    out.push(h('p', {class: 'nfs-note', text: 'GESER: 1 jari pindah, 2 jari cubit = maju/mundur, putar = arah. PUTAR: 1 jari memutar part. Part baru dibayar saat SIMPAN.'}));
    return out;
  }

  // ------------------------------------------------------------------ alat kanan (edit langsung)
  function tools() {
    var stk = view === 4 && !picker && layer(), pp = view === 5 && !partPick && part();
    if (!stk && !pp) return null;
    var out = h('aside', {class: 'nfs-tools'});
    var modes = stk ? [['cam', 'KAMERA', 'cam'], ['obj', 'GESER', 'hand']] : [['cam', 'KAMERA', 'cam'], ['obj', 'GESER', 'hand'], ['rot', 'PUTAR', 'refresh']];
    out.appendChild(h('div', {class: 'nfs-modes'}, modes.map(function (m) {
      return btn(m[1], 'nfs-tool' + (mode === m[0] ? ' on' : ''), function () { mode = m[0]; render(); }, m[2]);
    })));
    var grid = h('div', {class: 'nfs-pad3'});
    if (stk) {
      var nudge = function (du, dv) { var l = layer(); if (!l) return; l[2] = clamp(l[2] + du, -1000, 1000); l[3] = clamp(l[3] + dv, -1000, 1000); sendLayer(sel, false); showReadout(); };
      var rot = function (d) { var l = layer(); if (!l) return; l[6] = wrapRot(l[6] + d); sendLayer(sel, false); showReadout(); };
      var scale = function (k) { var l = layer(); if (!l) return; l[4] = clamp(Math.round(l[4] * k), 80, 4000); l[5] = clamp(Math.round(l[5] * k), 80, 4000); sendLayer(sel, false); showReadout(); };
      [hold('', 'nfs-tool', function () { rot(20); }, 'refresh', 'Putar kiri'), hold('', 'nfs-tool', function () { nudge(0, 8); }, 'up', 'Atas'), hold('', 'nfs-tool', function () { scale(1.03); }, 'plus', 'Besar'),
        hold('', 'nfs-tool', function () { nudge(-8, 0); }, 'back', 'Kiri'), h('i', {class: 'nfs-hub-dot'}), hold('', 'nfs-tool', function () { nudge(8, 0); }, 'next', 'Kanan'),
        hold('', 'nfs-tool flip', function () { rot(-20); }, 'refresh', 'Putar kanan'), hold('', 'nfs-tool', function () { nudge(0, -8); }, 'down', 'Bawah'), hold('', 'nfs-tool', function () { scale(0.97); }, 'minus', 'Kecil')
      ].forEach(function (b) { grid.appendChild(b); });
    } else {
      var mv = function (ax, d) {
        var p = part(); if (!p) return;
        if (mode === 'rot') p[7 + ax] = wrapRot(p[7 + ax] + d * 25, 3600); else p[4 + ax] = clamp(p[4 + ax] + d * 10, -6000, 6000);
        sendPart(p, false); mirrorTo(p, partner(p)); showReadout();
      };
      var lab = mode === 'rot' ? [['RX−', 'RX+'], ['RY−', 'RY+'], ['RZ−', 'RZ+']] : [['KIRI', 'KANAN'], ['MUNDUR', 'MAJU'], ['TURUN', 'NAIK']];
      [0, 1, 2].forEach(function (ax) {
        grid.appendChild(hold(lab[ax][0], 'nfs-tool ax', function () { mv(ax, -1); }));
        grid.appendChild(hold(lab[ax][1], 'nfs-tool ax', function () { mv(ax, 1); }));
      });
      grid.classList.add('part');
    }
    out.appendChild(grid);
    return out;
  }

  // ------------------------------------------------------------------ bawah: simpan / batal / keluar
  var footEl = null;
  function foot() {
    var n = dirty(), cost = C.nfs.st ? (+C.nfs.st.partCost || 0) : 0;
    var text = msg || (busy() ? 'Menyimpan ke database…' : n ? n + ' perubahan belum disimpan' : 'Sesuai data tersimpan');
    var save = btn(busy() ? 'MENYIMPAN…' : (cost > 0 ? 'SIMPAN · ' + money(cost) : 'SIMPAN'), 'nfs-save', function () { saveAll(); }, 'check');
    save.disabled = busy() || !n;
    footEl = h('footer', {class: 'nfs-foot'}, [
      btn(view ? 'KEMBALI' : 'KELUAR', 'nfs-ghost', function () { if (view) back(); else exitReq(); }, view ? 'back' : 'x'),
      h('p', {class: 'nfs-status' + (msgBad ? ' bad' : msg ? ' msg' : ''), role: 'status', text: text}),
      n ? btn('BATAL', 'nfs-ghost', revertAll, 'refresh') : null,
      save]);
    if (busy()) footEl.lastChild.disabled = true;
    return footEl;
  }
  function paintFoot() {
    if (!footEl || !footEl.parentNode) return;
    var old = footEl, f = foot();
    old.parentNode.replaceChild(f, old); E.touch();
  }
  function confirmBox() {
    return h('div', {class: 'nfs-confirm'}, [h('div', {class: 'nfs-confirm-box'}, [
      h('b', {text: 'PERUBAHAN BELUM DISIMPAN'}),
      h('p', {text: dirty() + ' perubahan akan hilang kalau keluar tanpa menyimpan.'}),
      h('div', {class: 'nfs-row-actions'}, [
        btn('SIMPAN & KELUAR', 'nfs-save', function () { confirmExit = false; exitAfterSave = true; saveAll(); }, 'check'),
        btn('BUANG', 'nfs-ghost', function () { confirmExit = false; closeReq(); }, 'trash'),
        btn('LANJUT EDIT', 'nfs-ghost', function () { confirmExit = false; render(); })])])]);
  }

  // ------------------------------------------------------------------ gambar layar
  function editing() {
    var a = document.activeElement;
    return a && root.contains(a) && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
  }
  function render() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; draw(); });
  }
  function draw() {
    if (!C.nfs.st) return;
    if (editing() || sliding || (G && G.moved)) { paintFoot(); return; }
    var old = ui.querySelector('.nfs-panel-b'), top = old ? old.scrollTop : 0, key = old ? old.getAttribute('data-k') : '';
    ui.textContent = '';
    root.classList.toggle('clean', hideUi);
    ui.appendChild(head());
    var st = stats(); if (st) ui.appendChild(st);
    ui.appendChild(camBar());
    if (!view) ui.appendChild(hub());
    else if (!hideUi) {
      var body = !viewOk(view) ? [h('p', {class: 'nfs-note', text: 'Memuat data modifikasi…'})] : view === 1 ? perfPanel() : view === 2 ? dynoPanel() : view === 3 ? paintPanel() : view === 4 ? vinylPanel()
        : view === 5 ? partsPanel() : view === 6 ? kitPanel() : view === 7 ? liveryPanel() : view === 8 ? evmPanel([10, 11, 14, 19, 16])
        : view === 9 ? evmPanel([7, 12, 2, 1]) : view === 10 ? evmPanel([13, 15, 8, 9, 17]) : view === 11 ? evmPanel([0, 3, 4, 5, 6]) : platePanel();
      var k = view + ':' + picker + ':' + partPick + ':' + pickCat + ':' + partCat;
      var title = picker ? (picker === 'swap' ? 'GANTI GAMBAR' : 'PILIH VINYL') : partPick ? 'PILIH PART' : VIEWS[view].t;
      var b = h('div', {class: 'nfs-panel-b', 'data-k': k}, body);
      var panel = h('div', {class: 'nfs-panel'}, [h('div', {class: 'nfs-panel-h'}, [btn('', 'nfs-back', back, 'back'), ico(VIEWS[view].icon), h('b', {text: title})]), b]);
      ui.appendChild(panel);
      if (k === key) b.scrollTop = top;
    } else ui.appendChild(h('div', {class: 'nfs-cleanhint', text: 'Ketuk mobil untuk menampilkan menu'}));
    var t = tools(); if (t) ui.appendChild(t);
    ui.appendChild(foot());
    if (confirmExit) ui.appendChild(confirmBox());
    showReadout();
    E.touch();
  }

  // ------------------------------------------------------------------ simpan / batal / tutup
  function saveAll() {
    if (busy()) return;
    if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur();
    flushAll();
    var any = false;
    ALL.forEach(function (c) {
      if (!c.st || !dirtyOf(c)) return;
      if (c === C.evm && !/[A-Z0-9]/.test(c.st.plate || '')) { setMsg('Nomor plat harus berisi huruf atau angka.', true); return; }
      c.pending = true; c.saveSeq = send(c, 'save', 0, 0); any = true;
    });
    if (!any && !msg) setMsg('Tidak ada perubahan.');
    if (!any) exitAfterSave = false;
    render();
  }
  function afterSave() {
    if (busy()) return;
    if (exitAfterSave) {
      exitAfterSave = false;
      if (!dirty()) { closeReq(); return; }
      setMsg((msg ? msg + ' ' : '') + 'Belum semua tersimpan.', true);
    }
  }
  function revertAll() {
    if (busy()) return;
    flushAll(); clearMsg();
    var n = C.nfs.st, k = C.kit.st, e = C.evm.st;
    if (n) { send(C.nfs, 'revert', 0, 0); n.values = n.saved.slice(); partTouched = false; }
    if (k) { send(C.kit, 'revert', 0, 0); send(C.kit, 'kitreset', 0, 0); k.layers = k.savedLayers.map(function (l) { return l.slice(); }); k.kit.forEach(function (x) { x.cur = x.saved; }); sel = Math.min(sel, k.layers.length - 1); }
    if (e) { send(C.evm, 'revert', 0, 0); e.values = e.saved.slice(); e.plate = e.savedPlate; e.region = e.savedRegion; }
    setMsg('Perubahan dibatalkan.');
    render();
  }
  function exitReq() {
    if (busy()) return;
    if (dirty()) { confirmExit = true; render(); return; }
    closeReq();
  }
  function closeReq() {
    if (!C.nfs.st) return;
    ALL.forEach(function (c) { clearTimeout(c.timer); c.timer = 0; c.q = {}; });
    send(C.nfs, 'close', 0, 0);
    closeAll();
  }
  function closeAll() {
    ALL.forEach(function (c) {
      clearTimeout(c.timer); c.timer = 0; c.q = {};
      if (c.st) c.lastClosed = Math.max(c.lastClosed, c.st.sid);
      c.st = null; c.pending = false; c.saveSeq = 0;
    });
    P = {}; G = null; confirmExit = false; exitAfterSave = false; picker = ''; partPick = false; hideUi = false; partTouched = false;
    root.classList.remove('on', 'clean'); root.setAttribute('aria-hidden', 'true');
    ui.textContent = ''; readout.classList.remove('on'); footEl = null;
    document.body.classList.remove('eagle-vehmod-open'); E.touch();
  }

  // ------------------------------------------------------------------ data dari server
  function ints(a, n) { return Array.isArray(a) && (n == null || a.length === n) && a.every(function (v) { return Number.isInteger(v); }); }
  function head0(c, d) {
    // umum: cek sid, tutup, balasan ringan. Mengembalikan 'fresh' | 'full' | ''
    if (!d || !Number.isInteger(+d.sid) || +d.sid <= 0) return '';
    var sid = +d.sid;
    if (d.show === 0 || d.show === false) {
      if (c.st && sid === c.st.sid) {
        c.lastClosed = Math.max(c.lastClosed, sid);
        if (c === C.nfs) closeAll(); else { c.st = null; c.q = {}; c.pending = false; if (view && !viewOk(view)) view = 0; render(); }
      }
      return '';
    }
    if (sid <= c.lastClosed || (c.st && sid < c.st.sid)) return '';
    var ack = +d.ack || 0;
    if (d.lite) {
      if (!c.st || sid !== c.st.sid) return '';
      if (ack > c.ack) c.ack = ack;
      if (d.message) { setMsg(d.message); paintFoot(); }
      return '';
    }
    if (!c.st || sid !== c.st.sid) return 'fresh';
    if (ack < c.ack) return '';
    c.ack = ack;
    return 'full';
  }
  function show() {
    root.classList.add('on'); root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('eagle-vehmod-open');
  }
  E.on('nfsgarage', function (d) {
    var c = C.nfs, k = head0(c, d);
    if (!k) return;
    if (!ints(d.values, 22) || !ints(d.saved, 22)) return;
    if (!Array.isArray(d.parts)) d.parts = [];
    if (k === 'fresh') {
      if (c.st) closeAll();
      c.st = Object.assign({}, d, {sid: +d.sid, values: d.values.slice(), saved: d.saved.slice()});
      c.seq = c.ack = +d.ack || 0; c.pending = false;
      view = clamp(+d.view || 0, 0, 6); if (view && !viewShown(view)) view = 0;
      cam = ints(d.cam, 3) ? d.cam.slice() : CAMP[0].slice();
      sel = -1; psel = -1; picker = ''; partPick = false; hideUi = false; mode = 'obj'; clearMsg(); partTouched = false;
      GROUPS.forEach(function (g, i) { if (g[2].indexOf(view) >= 0) group = i; });
      lastSentView = view;
      if (view) setCam(VIEWS[view].cam);
      show(); render(); return;
    }
    var s = c.st;
    // /stiker, /livery, /dyno saat garasi terbuka: server mengganti menu
    if (Number.isInteger(d.view) && d.view !== s.view) {
      s.view = d.view;
      if (d.view !== lastSentView && viewShown(d.view)) { lastSentView = d.view; view = d.view; picker = ''; partPick = false; if (view) setCam(VIEWS[view].cam); }
    }
    ['top', 'savedTop', 'speed', 'accel', 'handling', 'savedSpeed', 'savedAccel', 'savedHandling', 'power', 'grip', 'brake', 'mass',
      'nitroOk', 'perf', 'evm', 'partMax', 'partCost', 'partDirty', 'cash', 'size', 'color1', 'color2', 'name', 'cls'].forEach(function (key) { if (key in d) s[key] = d[key]; });
    s.saved = d.saved.slice();
    if (c.pending && c.ack >= c.saveSeq) { c.pending = false; c.saveSeq = 0; }
    if (quiet(c) && !(G && G.t === 'part')) {
      s.values = d.values.slice(); s.parts = d.parts; partTouched = false;
      if (padd) { padd = false; var mx = -1; s.parts.forEach(function (q) { if (q[10] && q[0] > mx) mx = q[0]; }); if (mx >= 0) { psel = mx; mode = 'obj'; } }
      if (psel >= 0 && !part()) psel = -1;
    }
    if (d.message) setMsg(d.message);
    afterSave(); render();
  });
  function validLayer(l) { return ints(l, 9); }
  E.on('vehkit', function (d) {
    var c = C.kit, k = head0(c, d);
    if (!k) return;
    if (!Array.isArray(d.kit) || !Array.isArray(d.layers) || !Array.isArray(d.savedLayers)) return;
    if (!d.layers.every(validLayer) || !d.savedLayers.every(validLayer)) return;
    if (k === 'fresh') {
      c.st = Object.assign({}, d, {sid: +d.sid, layers: d.layers.map(function (l) { return l.slice(); })});
      c.seq = c.ack = +d.ack || 0; c.pending = false;
      sel = c.st.layers.length - 1; syncLiveryColors(); render(); return;
    }
    var s = c.st;
    s.savedLayers = d.savedLayers; s.maxLayers = d.maxLayers || s.maxLayers;
    if (c.pending && c.ack >= c.saveSeq) { c.pending = false; c.saveSeq = 0; }
    if (quiet(c) && !(G && G.t === 'stk')) {
      var grew = d.layers.length > s.layers.length;
      s.layers = d.layers.map(function (l) { return l.slice(); }); s.kit = d.kit;
      if (grew && addWait) {
        sel = s.layers.length - 1; mode = 'obj';
        var L = s.layers[sel];
        if (L && L[1] !== curSide && !(L[8] & 8)) setLayerField(sel, 1, curSide);
        if (view === 4) setCam(4 + curSide);
      }
      addWait = false;
      if (sel >= s.layers.length) sel = s.layers.length - 1;
      syncLiveryColors();
    }
    if (d.message) setMsg(d.message);
    afterSave(); render();
  });
  E.on('vehmod', function (d) {
    var c = C.evm, k = head0(c, d);
    if (!k) return;
    if (!ints(d.values, VC.length || null) || !ints(d.saved, VC.length || null)) return;
    if (k === 'fresh') {
      c.st = Object.assign({}, d, {sid: +d.sid, values: d.values.slice(), saved: d.saved.slice()});
      c.seq = c.ack = +d.ack || 0; c.pending = false; render(); return;
    }
    var s = c.st;
    s.saved = d.saved.slice(); s.savedPlate = d.savedPlate; s.savedRegion = d.savedRegion;
    s.vinylMask = d.vinylMask; s.paintable = d.paintable;
    if (c.pending && c.ack >= c.saveSeq) { c.pending = false; c.saveSeq = 0; }
    if (quiet(c) && !editing()) { s.values = d.values.slice(); s.plate = d.plate; s.region = d.region; }
    if (d.message) setMsg(d.message);
    afterSave(); render();
  });
  E.on('auth', function (d) { if (d && ['login', 'register', 'chars', 'charinfo', 'create', 'spawn'].indexOf(d.v) >= 0) closeAll(); });
  window.addEventListener('keydown', function (e) {
    if (!C.nfs.st || !E.canInteract(root) || e.defaultPrevented || e.isComposing || e.repeat) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopImmediatePropagation();
      if (confirmExit) { confirmExit = false; render(); } else if (view) back(); else exitReq();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveAll(); }
  }, true);
  root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  E.done('nfs_garage');
})();
