/* EAGLE clothes V163 -> v10: menu gaya FiveM (kartu + stepper Jenis/Warna), tanpa gambar.
   Native LOOK v2 IDs are preserved; one CEF surface owns input. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, h = U.h;
  var SLOTS = 24, NO_ITEM = 65535, MODE_SHOP = 1, MODE_CREATE = 2, MODE_FREE = 3;
  var TABS = [
    { id: 'cloth', t: 'Pakaian', slots: [4, 5, 6, 14, 15] },
    { id: 'char', t: 'Karakter', slots: [0, 1, 2, 3] },
    { id: 'acc', t: 'Aksesori', slots: [7, 8, 9, 10, 11, 12, 13] },
    { id: 'tat', t: 'Tato', slots: [16, 17, 18, 19, 20, 21, 22, 23] },
    { id: 'body', t: 'Badan', slots: [] }
  ];
  // v6 buat karakter: hanya wajah (warna kulit + bentuk), rambut, dan outfit jadi (atasan+bawahan+sepatu).
  var CREATE_TABS = [
    { id: 'face', t: 'Wajah', slots: [] },
    { id: 'hair', t: 'Rambut', slots: [0, 3, 1] },
    { id: 'outfit', t: 'Outfit', slots: [] }
  ];
  function tabs() { return mode() === MODE_CREATE ? CREATE_TABS : TABS; }
  var TIER = { a: 0, b: 1, c: 2, d: 3, z: 4 };
  var st = null, shop = null, root = null, sendTimer = null, saveTimer = null, previewTimer = null;
  var shops = Object.create(null), shopOrder = [];
  function decode(hex) {
    if (typeof hex !== 'string' || !/^[0-9a-fA-F]{114}$/.test(hex)) return null;
    var b = [], i, s;
    for (i = 0; i < 57; i++) b.push(parseInt(hex.substr(i * 2, 2), 16));
    if (b[0] !== 2 || b[3] > 1 || b[4] < 1 || b[4] > 4 || b[5] >= 12 || b[6] >= 12 ||
        b[55] < 151 || b[55] > 199 || b[56] < 41 || b[56] > 94) return null;
    var l = { skin: b[1] | b[2] << 8, model: b[3], kind: b[4], tone: b[5], head: b[6], items: [], height: b[55], weight: b[56] };
    for (s = 0; s < SLOTS; s++) l.items.push(b[7 + s * 2] | b[8 + s * 2] << 8);
    return l;
  }
  function encode(l) {
    var b = [2, l.skin & 255, l.skin >> 8 & 255, l.model, l.kind, l.tone, l.head];
    for (var s = 0; s < SLOTS; s++) b.push(l.items[s] & 255, l.items[s] >> 8 & 255);
    b.push(l.height, l.weight);
    return b.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
  }
  function mode() { return st && shop && String(shop.s) === st.s ? +shop.mode : 0; }
  function ready() { return !!mode(); }
  function busy() { return !st || st.waiting || !!st.pending; }
  function paid() { return mode() === MODE_SHOP; }
  function kindCat() { return st && st.kinds[String(st.draft.kind)]; }
  function isSaved(slot, item) { return (st.saved.kind === st.draft.kind || slot <= 3 || slot >= 16) && st.saved.items[slot] === item; }
  function owned(slot, item) { var c = kindCat(), s = c && c.slots[slot]; return isSaved(slot, item) || !!(s && s.def === item); }
  function available(item) { return item && item[3] !== 0; }
  function itemPrice(kind, slot, item) {
    if (!paid() || item === NO_ITEM || item < 0) return 0;
    var tiers = shop.t2 && shop.t2[String(kind)], row = tiers && tiers[slot];
    var t = row && item < row.length ? TIER[row.charAt(item)] : 0;
    var pct = shop.p && shop.p[t] != null ? +shop.p[t] : 100;
    return Math.floor((+(shop.b && shop.b[slot]) || 0) * pct / 100);
  }
  function totalCost() {
    if (!st || !paid() || !st.draft.model) return 0;
    var d = st.draft, total = 0;
    for (var s = 0; s < SLOTS; s++) if (d.items[s] !== NO_ITEM && !owned(s, d.items[s])) total += itemPrice(d.kind, s, d.items[s]);
    if (d.head !== st.saved.head) total += +shop.hp || 0;
    if (d.tone !== st.saved.tone) total += +shop.tp || 0;
    return total;
  }
  function money(n) { return '$' + String(Math.max(0, Math.floor(n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function rgb(c) { c = +c || 0; return 'rgb(' + (c >> 16 & 255) + ',' + (c >> 8 & 255) + ',' + (c & 255) + ')'; }
  function stopDraft() { if (sendTimer) clearTimeout(sendTimer); sendTimer = null; }
  function stopSave() { if (saveTimer) clearTimeout(saveTimer); saveTimer = null; }
  function stopPreview() { if (previewTimer) clearTimeout(previewTimer); previewTimer = null; }
  function nextRevision() { st.revision++; }
  function flushDraft() { if (!st || !sendTimer) return; stopDraft(); toClient('draft', { h: encode(st.draft) }); }
  function toClient(a, extra) {
    if (!st) return false;
    var o = { a: a, s: st.s, r: String(st.revision) };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = String(extra[k]); });
    return E.sendRaw('lookui', o);
  }
  function awaitPreview(a, extra) {
    stopPreview(); nextRevision(); st.pending = a; st.previewTimeout = false; st.error = '';
    var session = st.s, revision = st.revision;
    if (!toClient(a, extra)) {
      st.previewTimeout = true; st.error = 'Preview belum terhubung. Coba muat ulang preview.'; render(); return;
    }
    previewTimer = setTimeout(function () {
      previewTimer = null;
      if (!st || st.s !== session || st.revision !== revision || !st.pending) return;
      st.previewTimeout = true;
      st.error = 'Preview belum menjawab. Muat ulang preview atau tutup lalu buka kembali.';
      render();
    }, 4000);
    render();
  }
  function command(a, extra) {
    if (busy()) return;
    flushDraft();
    if (a === 'model' || a === 'random' || a === 'reset') awaitPreview(a, extra);
    else toClient(a, extra);
  }
  function syncPreview() {
    if (!st || !st.pending || !st.previewTimeout || !st.sequenced) return;
    awaitPreview('sync'); // fetch current state; never repeat a timed-out random/model action
  }
  function draftChanged() {
    if (busy()) return;
    nextRevision(); st.error = ''; stopDraft();
    var session = st.s;
    sendTimer = setTimeout(function () { sendTimer = null; if (st && st.s === session && !busy()) toClient('draft', { h: encode(st.draft) }); }, 120);
    render();
  }
  function select(slot, index) { if (busy()) return; st.draft.items[slot] = index; draftChanged(); }
  function ids(slot, group) {
    var c = kindCat(), cs = c && c.slots[slot], out = [];
    if (!cs) return out;
    cs.it.forEach(function (it, i) { if (available(it) && (group == null || it[1] === group)) out.push(i); });
    return out;
  }
  // v6: Outfit = set jadi atasan + bawahan + sepatu (tanpa pilih baju satu per satu).
  function outfitSets() {
    var cat = kindCat(); if (!cat) return [];
    var kind = st.draft.kind;
    function pool(slot) {
      if (!cat.slots[slot]) return [];
      var all = ids(slot);
      var row = shop && shop.t2 && shop.t2[String(kind)] && shop.t2[String(kind)][slot];
      var basic = row ? all.filter(function (i) { return row.charAt(i) === 'a'; }) : [];
      return basic.length >= 3 ? basic : all;
    }
    var top = pool(4), bot = pool(5), shoe = pool(6), out = [], seen = {};
    var n = Math.min(12, Math.max(top.length, bot.length, shoe.length));
    for (var k = 0; k < n * 2 && out.length < n; k++) {
      var set = { 4: top.length ? top[(k * 3) % top.length] : -1, 5: bot.length ? bot[(k * 5 + 1) % bot.length] : -1, 6: shoe.length ? shoe[(k * 7 + 2) % shoe.length] : -1 };
      var key = set[4] + ':' + set[5] + ':' + set[6];
      if (seen[key]) continue; seen[key] = 1; out.push(set);
    }
    return out;
  }
  function save() {
    if (busy() || !ready()) return;
    var cost = totalCost(), cash = +shop.cash || 0;
    if (paid() && cost > cash) { st.error = 'Saldo tidak cukup.'; render(); return; }
    stopDraft(); stopSave(); nextRevision(); st.waitRevision = st.revision; st.waiting = true; st.error = '';
    if (!toClient('save', { h: encode(st.draft) })) {
      st.waiting = false; st.error = 'Belum terhubung ke client. Coba simpan lagi.'; render(); return;
    }
    var session = st.s, revision = st.revision;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      if (st && st.s === session && st.revision === revision && st.waiting) { st.waiting = false; st.error = 'Belum ada jawaban server. Coba simpan lagi.'; toClient('retry'); render(); }
    }, 9000);
    render();
  }
  function close() {
    stopDraft(); stopSave(); stopPreview();
    st = null;
    if (root) { root.classList.remove('on'); root.textContent = ''; }
    E.touch();
  }
  function cancel() { if (!st) return; stopDraft(); toClient('cancel'); close(); }

  /* ---------------- v10: tampilan menu gaya FiveM (tanpa gambar) ---------------- */
  var FV = window.FV;
  var TAB_ICON = { cloth: 'shirt', char: 'person', acc: 'glasses', tat: 'pen', body: 'heart', face: 'face', hair: 'scissors', outfit: 'shirt' };
  var SLOT_DESC = ['Gaya dan warna rambut.', 'Kumis dan jenggot.', 'Riasan wajah.', 'Bentuk dan warna alis.',
    'Atasan: kaos, kemeja, jaket.', 'Bawahan: celana dan rok.', 'Alas kaki.', 'Penutup kepala.', 'Kacamata.',
    'Topeng dan penutup wajah.', 'Kalung.', 'Jam tangan.', 'Anting.', 'Tas.', 'Rompi di atas baju.', 'Sabuk.'];
  function slotDesc(slot) { return slot >= 16 ? 'Tato. Bagian yang tertutup pakaian tidak terlihat.' : (SLOT_DESC[slot] || ''); }
  function note(title, text, extra) { return FV.card({ title: title, desc: text, extra: extra, cls: 'note' }); }
  function slotCard(slot) {
    var cat = kindCat(), cs = cat && cat.slots[slot];
    if (!cs || !ids(slot).length) return null;
    var cur = st.draft.items[slot], sel = cur !== NO_ITEM ? cs.it[cur] : null, worn = !!(sel && available(sel));
    var groups = [];
    cs.g.forEach(function (g, i) { if (ids(slot, i).length) groups.push(i); });
    var group = worn ? sel[1] : st.group[slot];
    if (groups.indexOf(group) < 0) group = groups[0];
    st.group[slot] = group;
    var list = ids(slot, group), gi = groups.indexOf(group), ii = worn ? list.indexOf(cur) : -1;
    function stepGroup(dir) {
      if (busy() || !groups.length) return;
      var n = groups.length, next = worn ? (gi + dir + n) % n : (dir > 0 ? gi : (gi - 1 + n) % n);
      var g = groups[next], l2 = ids(slot, g);
      st.group[slot] = g;
      if (l2.length) select(slot, l2[0]);
    }
    function stepItem(dir) {
      if (busy() || !list.length) return;
      var n = list.length, next = ii < 0 ? (dir > 0 ? 0 : n - 1) : (ii + dir + n) % n;
      select(slot, list[next]);
    }
    var tag = '', tagCls = '';
    if (worn) {
      if (owned(slot, cur)) { tag = paid() ? 'DIMILIKI' : ''; }
      else if (paid()) { var price = itemPrice(st.draft.kind, slot, cur); tag = price ? money(price) : 'GRATIS'; tagCls = 'g'; }
    } else if (cs.req) { tag = 'WAJIB'; tagCls = 'bad'; }
    var action = worn && !cs.req ? FV.chip('LEPAS', function () { select(slot, NO_ITEM); }) : null;
    return FV.card({
      title: cs.n, tag: tag, tagCls: tagCls, action: action,
      desc: slotDesc(slot) + ' ' + (worn ? 'Dipakai: ' + (cs.g[group] || '') + ', ' + sel[0] + '.' : 'Sedang tidak dipakai.'),
      steps: [
        FV.stepper({ cur: gi < 0 ? '–' : gi + 1, total: groups.length, label: 'Jenis', hold: true, every: 70, fn: stepGroup, off: !worn }),
        FV.stepper({ cur: ii < 0 ? '–' : ii + 1, total: list.length, label: 'Warna', hold: true, every: 70, dot: worn ? rgb(sel[2]) : null, fn: stepItem, off: !worn })
      ]
    });
  }
  function toneCard() {
    var d = st.draft, cat = kindCat(), n = cat.tones.length;
    return FV.card({ title: 'Warna kulit', desc: 'Warna kulit karakter.', steps: [
      FV.stepper({ cur: d.tone + 1, total: n, label: 'Kulit', dot: rgb(cat.tones[d.tone]), fn: function (dir) { if (busy()) return; d.tone = (d.tone + dir + n) % n; draftChanged(); } })] });
  }
  function headCard() {
    var d = st.draft, cat = kindCat(), n = cat.heads;
    return FV.card({ title: 'Bentuk wajah', desc: 'Bentuk kepala dan wajah.', steps: [
      FV.stepper({ cur: d.head + 1, total: n, label: 'Wajah', fn: function (dir) { if (busy()) return; d.head = (d.head + dir + n) % n; draftChanged(); } })] });
  }
  function modelCard() {
    var d = st.draft, opts = st.opts, cur = -1;
    opts.forEach(function (o, i) { if (cur < 0 && +o.m === d.model && (!+o.m || +o.k === d.kind)) cur = i; });
    return FV.card({ title: 'Model karakter', desc: 'Sekarang: ' + (cur >= 0 ? opts[cur].label : 'standar') + '. Model kustom bisa ganti wajah, rambut dan pakaian.', steps: [
      FV.stepper({ cur: cur < 0 ? '–' : cur + 1, total: opts.length, label: 'Model', fn: function (dir) {
        if (busy() || !opts.length) return;
        var n = opts.length; command('model', { i: cur < 0 ? 0 : (cur + dir + n) % n });
      } })] });
  }
  function customHint() {
    var custom = -1;
    st.opts.forEach(function (o, i) { if (custom < 0 && +o.m) custom = i; });
    return note('Model standar', 'Karakter memakai model standar. Pakai model kustom untuk mengubah penampilan.',
      custom >= 0 ? [FV.chip('PAKAI MODEL KUSTOM', function () { command('model', { i: custom }); }, 'on')] : null);
  }
  function outfitCard() {
    var d = st.draft, cat = kindCat(), sets = outfitSets();
    if (!sets.length) return note('Outfit', 'Belum ada outfit untuk model ini.');
    var cur = -1;
    sets.forEach(function (set, n) { if (cur < 0 && [4, 5, 6].every(function (sl) { return set[sl] < 0 || d.items[sl] === set[sl]; })) cur = n; });
    function apply(dir) {
      if (busy()) return;
      var n = sets.length, set = sets[cur < 0 ? (dir > 0 ? 0 : n - 1) : (cur + dir + n) % n];
      [4, 5, 6].forEach(function (sl) { if (set[sl] >= 0) d.items[sl] = set[sl]; });
      [14, 15].forEach(function (sl) { var cs = cat.slots[sl]; if (cs && !cs.req) d.items[sl] = NO_ITEM; });
      draftChanged();
    }
    var names = [4, 5, 6].map(function (sl) { var cs = cat.slots[sl], it = cs && cs.it[d.items[sl]]; return it && available(it) ? it[0] : null; }).filter(Boolean);
    return FV.card({ title: 'Outfit', desc: 'Set atasan, bawahan dan sepatu. ' + (names.length ? 'Dipakai: ' + names.join(', ') + '.' : ''), steps: [
      FV.stepper({ cur: cur < 0 ? '–' : cur + 1, total: sets.length, label: 'Set', fn: apply })] });
  }
  function bodyCards() {
    var d = st.draft;
    if (mode() !== MODE_CREATE && mode() !== MODE_FREE)
      return [note('Badan', 'Tinggi ' + d.height + ' cm, berat ' + d.weight + ' kg. Diatur saat membuat karakter.')];
    function num(title, key, lo, hi, unit) {
      var vb = null;
      var c = FV.card({ title: title, desc: 'Tahan panah untuk ubah cepat (' + lo + '–' + hi + ' ' + unit + ').', steps: [
        FV.stepper({ cur: d[key], total: null, label: unit, hold: true, every: 90,
          fn: function (dir) { if (busy()) return; var v = Math.max(lo, Math.min(hi, d[key] + dir)); if (v === d[key]) return; d[key] = v; nextRevision(); st.error = ''; if (vb) vb.textContent = String(v); },
          release: function () { draftChanged(); } })] });
      vb = c.querySelector('.fv-val b');
      return c;
    }
    return [num('Tinggi badan', 'height', st.hmin, st.hmax, 'cm'), num('Berat badan', 'weight', st.wmin, st.wmax, 'kg')];
  }
  function tabCards(tab) {
    var d = st.draft, cat = kindCat(), out = [];
    function slots(list) { list.forEach(function (sl) { var c = slotCard(sl); if (c) out.push(c); }); }
    if (tab.id === 'body') return bodyCards();
    if (tab.id === 'char') {
      out.push(modelCard());
      if (!d.model || !cat) { out.push(note('Model standar', 'Pilih model kustom untuk mengganti wajah, rambut dan pakaian.')); return out; }
      out.push(toneCard(), headCard()); slots(tab.slots); return out;
    }
    if (!d.model || !cat) return [customHint()];
    if (tab.id === 'face') return [toneCard(), headCard()];
    if (tab.id === 'outfit') return [outfitCard()];
    slots(tab.slots);
    if (!out.length) out.push(note(tab.t, 'Tidak ada pilihan untuk bagian ini.'));
    return out;
  }
  function render() {
    if (!st) return;
    if (!root) { root = h('div', { id: 'lookui', class: 'lk-root fv-root' }); (document.getElementById('panels') || document.body).appendChild(root); }
    var old = root.querySelector('.fv-panel'), scroll = old && old.getAttribute('data-tab') === String(st.tab) ? old.scrollTop : 0;
    var list = tabs(), tab = list[st.tab] || list[0], create = mode() === MODE_CREATE;
    var cost = totalCost(), cash = shop && String(shop.s) === st.s ? +shop.cash || 0 : 0;
    var panel = h('div', { class: 'fv-panel', 'data-touch': '1', 'data-tab': String(st.tab), 'aria-label': 'Penampilan' }, tabCards(tab));
    var status = st.error ? '' : st.waiting ? 'Menyimpan penampilan…' : st.pending ? 'Memperbarui karakter…' : !ready() ? 'Menunggu data…' :
      paid() ? 'Total ' + money(cost) + ' · Tunai ' + money(cash) : create ? 'Karakter baru · ' + tab.t : 'Pratinjau langsung';
    root.textContent = '';
    root.appendChild(FV.hints([['◀ ▶', 'Putar karakter'], ['KAMERA', 'Badan, wajah, kaki'], ['ACAK', 'Coba gaya acak'], ['RESET', 'Kembali seperti awal']],
      create ? ['KARAKTER BARU', 'PENAMPILAN'] : paid() ? ['TOKO PAKAIAN', 'CLOTHING'] : ['RP EAGLE', 'PENAMPILAN']));
    root.appendChild(FV.topbar('PUTAR KARAKTER', function (dir) { command('rot', { d: 30 * dir }); }));
    root.appendChild(FV.rail(list.map(function (t) { return { icon: TAB_ICON[t.id] || 'person', t: t.t }; }), st.tab, function (i) {
      if (busy() || i === st.tab) return; st.tab = i; st.slot = -1; render();
    }));
    root.appendChild(panel);
    root.appendChild(FV.poses([
      { icon: 'body', t: 'Kamera badan', on: st.view === 0, fn: function () { st.view = 0; command('cam', { i: 0 }); render(); } },
      { icon: 'face', t: 'Kamera wajah', on: st.view === 1, fn: function () { st.view = 1; command('cam', { i: 1 }); render(); } },
      { icon: 'legs', t: 'Kamera kaki', on: st.view === 2, fn: function () { st.view = 2; command('cam', { i: 2 }); render(); } },
      { icon: 'dice', t: 'Acak', fn: function () { command('random'); } },
      { icon: 'reset', t: 'Reset', fn: function () { command('reset'); } },
      mode() === MODE_SHOP ? { icon: 'store', t: 'Toko skin biasa', label: 'Skin biasa', cls: 'oldstore', fn: function () { stopDraft(); E.send('lookshop', 'oldstore', -1, ''); close(); } } : null
    ]));
    root.appendChild(FV.savebar({
      status: status, error: st.error,
      label: st.waiting ? 'MENYIMPAN…' : paid() && cost > 0 ? 'BELI ' + money(cost) : create ? 'SIMPAN & LANJUT' : 'SIMPAN',
      disabled: !ready() || busy() || paid() && cost > cash, fn: save,
      cancel: create ? 'LEWATI' : 'BATAL', cancelFn: cancel,
      extra: st.pending && st.previewTimeout && st.sequenced ? FV.chip('MUAT ULANG PREVIEW', syncPreview, 'preview-retry') : null
    }));
    root.classList.add('on');
    panel.scrollTop = scroll;
    root.querySelectorAll('button, input, select').forEach(function (b) {
      if (!b.classList.contains('fv-save') && !b.classList.contains('fv-ghost') && !b.classList.contains('preview-retry')) b.disabled = busy();
    });
    root.setAttribute('aria-busy', busy() ? 'true' : 'false');
    E.touch();
  }
  E.on('lookui', function (m) {
    if (!m || !m.t) return;
    if (m.t === 'open') {
      var saved = decode(m.saved), draft = decode(m.draft);
      if (!saved || !draft || !/^[1-9][0-9]{0,9}$/.test(String(m.s))) return;
      close();
      shop = shops[String(m.s)] || null;
      st = { s: String(m.s), opts: m.opts || [], kinds: m.kinds || {}, saved: saved, draft: draft, tab: 0, slot: 4,
        revision: 0, waitRevision: 0, sequenced: +m.sync === 1, pending: '', previewTimeout: false,
        view: 0, group: {}, waiting: false, error: '', hmin: +m.hmin || 151, hmax: +m.hmax || 199, wmin: +m.wmin || 41, wmax: +m.wmax || 94 };
      if (ready() && mode() === MODE_CREATE) { st.tab = 0; st.slot = -1; }
      st.shopReady = ready(); toClient('ack'); render(); return;
    }
    if (!st || String(m.s) !== st.s) return;
    if (m.t === 'draft' || m.t === 'wait') {
      var expected = m.t === 'wait' ? st.waitRevision : st.revision;
      if (st.sequenced && (!/^[0-9]{1,10}$/.test(String(m.r)) || +m.r !== expected)) return;
    }
    if (m.t === 'draft') {
      var next = decode(m.h);
      if (next) {
        // An old draft response cannot acknowledge a model/reset/sync in flight.
        if (st.pending && st.sequenced && m.a !== st.pending) return;
        stopDraft(); stopPreview(); st.pending = ''; st.previewTimeout = false;
        st.draft = next; st.group = {}; st.error = String(m.error || '');
        if (m.waiting != null) st.waiting = !!+m.waiting;
        if (st.waiting && /^[0-9]{1,10}$/.test(String(m.wr))) st.waitRevision = +m.wr;
        if (!st.waiting) stopSave();
        render();
      }
    }
    else if (m.t === 'wait') {
      if (+m.on && !st.waiting) return; // late start notification after error/timeout
      st.waiting = !!+m.on; if (!st.waiting) stopSave(); render();
    }
    else if (m.t === 'close') close();
  });
  E.on('lookshop', function (m) {
    if (!m) return;
    if (m.t === 'error') {
      if (!st || String(m.s) !== st.s) return;
      stopSave(); st.waiting = false; st.error = String(m.message || 'Gagal menyimpan. Coba lagi.'); toClient('retry', { r: st.waitRevision }); render(); return;
    }
    if (m.t !== 'shop') return;
    var session = String(m.s);
    if (!/^[1-9][0-9]{0,9}$/.test(session)) return;
    if (!shops[session]) shopOrder.push(session);
    shops[session] = m;
    while (shopOrder.length > 8) delete shops[shopOrder.shift()];
    if (st && session !== st.s) return;
    shop = m;
    if (st && String(m.s) === st.s) { if (!st.shopReady && +m.mode === MODE_CREATE) { st.tab = 0; st.slot = -1; } st.shopReady = true; render(); }
  });
  document.addEventListener('keydown', function (event) {
    if (!st || /INPUT|SELECT|TEXTAREA/.test((event.target || {}).tagName || '')) return;
    if (event.key === 'Escape') { event.preventDefault(); cancel(); }
    else if (event.key === 'ArrowLeft') command('rot', { d: -15 });
    else if (event.key === 'ArrowRight') command('rot', { d: 15 });
  });
  window.ELook = { state: function () { return st; }, shop: function () { return shop; }, encode: encode, decode: decode, cost: totalCost };
  E.done('look');
})();
