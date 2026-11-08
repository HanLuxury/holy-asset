/* EAGLE clothes V163. Native LOOK v2 IDs are preserved; one CEF surface owns input. */
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
  function chip(text, on, fn, extra) {
    var b = h('button', { type: 'button', class: 'lk-chip' + (on ? ' on' : '') + (extra ? ' ' + extra : '') }, text);
    b.addEventListener('click', function () { if (!st || busy() && String(extra).indexOf('cancel') !== 0 && extra !== 'preview-retry') return; fn(); });
    return b;
  }
  function image(slot, index, extra) {
    var img = h('img', { class: 'lk-thumb ' + (extra || ''), src: 'img/look/' + st.draft.kind + '/' + slot + '_' + index + '.webp', alt: '', loading: 'lazy', decoding: 'async', draggable: 'false' });
    img.addEventListener('error', function () { img.hidden = true; });
    return img;
  }
  function select(slot, index) { if (busy()) return; st.draft.items[slot] = index; draftChanged(); }
  function ids(slot, group) {
    var c = kindCat(), cs = c && c.slots[slot], out = [];
    if (!cs) return out;
    cs.it.forEach(function (it, i) { if (available(it) && (group == null || it[1] === group)) out.push(i); });
    return out;
  }
  function currentSlot() {
    var tab = tabs()[st.tab] || tabs()[0], c = kindCat(), slots = tab.slots.filter(function (s) { return c && c.slots[s] && ids(s).length; });
    if (slots.indexOf(st.slot) < 0) st.slot = slots.length ? slots[0] : -1;
    return slots;
  }
  function categories(slots) {
    var cat = kindCat();
    return h('nav', { class: 'lk-categories', 'aria-label': 'Bagian pakaian' }, slots.map(function (slot) {
      return chip(cat.slots[slot].n, st.slot === slot, function () { st.slot = slot; render(); }, 'category');
    }));
  }
  function stepItem(slot, direction) {
    var list = ids(slot, st.group[slot]), i = list.indexOf(st.draft.items[slot]);
    if (list.length) select(slot, list[(i + direction + list.length) % list.length]);
  }
  function slotBlock(slot) {
    var cat = kindCat(), cs = cat && cat.slots[slot];
    if (!cs || !ids(slot).length) return h('p', { class: 'lk-note', text: 'Tidak ada pilihan untuk bagian ini.' });
    var cur = st.draft.items[slot], selected = cs.it[cur], groups = [];
    cs.g.forEach(function (g, i) { if (ids(slot, i).length) groups.push(i); });
    var group = st.group[slot];
    if (groups.indexOf(group) < 0) group = selected && available(selected) ? selected[1] : groups[0];
    st.group[slot] = group;
    var list = ids(slot, group), options = h('select', { class: 'lk-select', 'aria-label': 'Jenis ' + cs.n });
    groups.forEach(function (i) { options.appendChild(h('option', { value: i, text: cs.g[i] })); });
    options.value = String(group);
    options.addEventListener('change', function () { if (busy()) return; st.group[slot] = +options.value; render(); });
    var index = list.indexOf(cur), count = list.length;
    var head = h('div', { class: 'lk-selection' }, [
      h('div', { class: 'lk-sh' }, [h('b', { text: cs.n }), h('span', { text: selected && available(selected) ? selected[0] : 'Tidak dipakai' })]),
      options,
      h('div', { class: 'lk-step' }, [
        chip('‹', false, function () { stepItem(slot, -1); }, 'arrow'),
        h('span', null, [h('b', { text: index < 0 ? '—' : ('0' + (index + 1)).slice(-Math.max(2, String(index + 1).length)) }), h('small', { text: ' / ' + count + ' VARIAN' })]),
        chip('›', false, function () { stepItem(slot, 1); }, 'arrow next'),
        !cs.req ? chip(cur === NO_ITEM ? 'Tanpa ✓' : 'Lepas', cur === NO_ITEM, function () { select(slot, NO_ITEM); }, 'remove') : h('small', { class: 'lk-required', text: 'WAJIB' })
      ])
    ]);
    var grid = h('div', { class: 'lk-grid' });
    list.forEach(function (i) {
      var it = cs.it[i], on = i === cur, own = owned(slot, i), price = own ? 0 : itemPrice(st.draft.kind, slot, i);
      var b = h('button', { type: 'button', class: 'lk-it' + (on ? ' on' : ''), title: it[0], 'aria-label': it[0], 'aria-pressed': on ? 'true' : 'false', 'data-item': i }, [
        h('small', { class: 'lk-number', text: '#' + (i + 1) }), image(slot, i),
        on ? h('span', { class: 'lk-check', text: '✓' }) : null,
        h('em', { text: it[0] }), h('i', { class: 'lk-price', text: own ? 'DIMILIKI' : paid() && price ? money(price) : 'GRATIS' })
      ]);
      b.addEventListener('click', function () { select(slot, i); }); grid.appendChild(b);
    });
    return h('div', { class: 'lk-slot', 'data-slot': slot }, [head, grid]);
  }
  function charTab() {
    var d = st.draft, cat = kindCat(), out = [];
    out.push(h('div', { class: 'lk-sh' }, [h('b', { text: 'Model karakter' })]));
    out.push(h('div', { class: 'lk-chips' }, st.opts.map(function (o, i) {
      return chip(o.label, +o.m === d.model && (!+o.m || +o.k === d.kind), function () { command('model', { i: i }); });
    })));
    if (!d.model || !cat) return out.concat([h('p', { class: 'lk-note', text: 'Pilih model Kustom untuk mengganti wajah, rambut dan pakaian.' })]);
    out.push(h('div', { class: 'lk-sh' }, [h('b', { text: 'Warna kulit' }), h('span', { text: (d.tone + 1) + ' / ' + cat.tones.length })]));
    out.push(h('div', { class: 'lk-tones' }, cat.tones.map(function (color, i) {
      var b = chip('', i === d.tone, function () { d.tone = i; draftChanged(); }, 'tone');
      b.style.backgroundColor = rgb(color); b.setAttribute('aria-label', 'Warna kulit ' + (i + 1)); return b;
    })));
    out.push(h('div', { class: 'lk-sh' }, [h('b', { text: 'Bentuk wajah' })]));
    var faces = [];
    for (var i = 0; i < cat.heads; i++) (function (n) { faces.push(chip(String(n + 1), n === d.head, function () { d.head = n; draftChanged(); }, 'face')); })(i);
    out.push(h('div', { class: 'lk-chips faces' }, faces));
    var slots = currentSlot(); out.push(categories(slots)); if (st.slot >= 0) out.push(slotBlock(st.slot));
    return out;
  }
  // v6: Wajah = warna kulit + bentuk wajah (model kustom dipilih otomatis).
  function faceTab() {
    var d = st.draft, cat = kindCat(), out = [];
    if (!d.model || !cat) {
      var custom = -1;
      st.opts.forEach(function (o, i) { if (custom < 0 && +o.m) custom = i; });
      return [h('p', { class: 'lk-note', text: 'Karakter memakai model standar.' }),
        custom >= 0 ? chip('Pakai model kustom', false, function () { command('model', { i: custom }); }) : null];
    }
    out.push(h('div', { class: 'lk-sh' }, [h('b', { text: 'Warna kulit' }), h('span', { text: (d.tone + 1) + ' / ' + cat.tones.length })]));
    out.push(h('div', { class: 'lk-tones' }, cat.tones.map(function (color, i) {
      var b = chip('', i === d.tone, function () { d.tone = i; draftChanged(); }, 'tone');
      b.style.backgroundColor = rgb(color); b.setAttribute('aria-label', 'Warna kulit ' + (i + 1)); return b;
    })));
    out.push(h('div', { class: 'lk-sh' }, [h('b', { text: 'Bentuk wajah' })]));
    var faces = [];
    for (var i = 0; i < cat.heads; i++) (function (n) { faces.push(chip(String(n + 1), n === d.head, function () { d.head = n; draftChanged(); }, 'face')); })(i);
    out.push(h('div', { class: 'lk-chips faces' }, faces));
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
  function outfitTab() {
    var d = st.draft, cat = kindCat();
    if (!d.model || !cat) return [h('p', { class: 'lk-note', text: 'Pilih model kustom di tab Wajah dulu.' })];
    var sets = outfitSets();
    if (!sets.length) return [h('p', { class: 'lk-note', text: 'Belum ada outfit untuk model ini.' })];
    var grid = h('div', { class: 'lk-grid lk-outfit-grid' });
    sets.forEach(function (set, n) {
      var on = [4, 5, 6].every(function (sl) { return set[sl] < 0 || d.items[sl] === set[sl]; });
      var b = h('button', { type: 'button', class: 'lk-it lk-set' + (on ? ' on' : ''), 'aria-pressed': on ? 'true' : 'false' }, [
        set[4] >= 0 ? image(4, set[4]) : null,
        h('span', { class: 'lk-set-mini' }, [set[5] >= 0 ? image(5, set[5]) : null, set[6] >= 0 ? image(6, set[6]) : null]),
        h('b', { text: 'Outfit ' + (n + 1) })]);
      b.addEventListener('click', function () {
        if (busy()) return;
        [4, 5, 6].forEach(function (sl) { if (set[sl] >= 0) d.items[sl] = set[sl]; });
        [14, 15].forEach(function (sl) { var cs = cat.slots[sl]; if (cs && !cs.req) d.items[sl] = NO_ITEM; });
        draftChanged(); render();
      });
      grid.appendChild(b);
    });
    return [h('div', { class: 'lk-sh' }, [h('b', { text: 'Outfit' }), h('span', { text: sets.length + ' set' })]), grid];
  }
  function bodyTab() {
    var d = st.draft;
    if (mode() !== MODE_CREATE && mode() !== MODE_FREE) return [h('p', { class: 'lk-note', text: 'Tinggi dan berat badan diatur saat membuat karakter.' }), h('b', { text: d.height + ' cm · ' + d.weight + ' kg' })];
    function slider(label, key, lo, hi, unit) {
      var val = h('b', { text: d[key] + ' ' + unit });
      var input = h('input', { type: 'range', min: lo, max: hi, value: d[key], step: 1, 'aria-label': label });
      input.addEventListener('input', function () {
        if (busy()) return;
        d[key] = +input.value; nextRevision(); st.error = '';
        val.textContent = d[key] + ' ' + unit;
      });
      input.addEventListener('change', draftChanged);
      return h('div', { class: 'lk-body-control' }, [h('div', { class: 'lk-sh' }, [h('b', { text: label }), val]), input]);
    }
    return [slider('Tinggi badan', 'height', st.hmin, st.hmax, 'cm'), slider('Berat badan', 'weight', st.wmin, st.wmax, 'kg')];
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
  function tools() {
    return h('div', { class: 'lk-tools', 'data-touch': '1', 'aria-label': 'Kontrol karakter' }, [
      chip('↶', false, function () { command('rot', { d: -30 }); }, 'tool'),
      chip(['Badan', 'Wajah', 'Kaki'][st.view], false, function () { st.view = (st.view + 1) % 3; command('cam', { i: st.view }); render(); }, 'camera'),
      chip('↷', false, function () { command('rot', { d: 30 }); }, 'tool')
    ]);
  }
  function leftPanel(cost, cash) {
    var cat = kindCat(), d = st.draft, worn = [], total = 0;
    if (cat && d.model) [4, 5, 6, 7, 13, 14].forEach(function (s) {
      var item = d.items[s], cs = cat.slots[s];
      if (!available(cs.it[item])) return;
      worn.push(h('div', { class: 'lk-equipped-item' }, [image(s, item), h('span', { text: cs.n })]));
    });
    for (var s = 0; s < SLOTS; s++) if (d.items[s] !== st.saved.items[s]) total++;
    if (d.head !== st.saved.head) total++; if (d.tone !== st.saved.tone) total++;
    if (d.height !== st.saved.height) total++; if (d.weight !== st.saved.weight) total++;
    if (d.skin !== st.saved.skin || d.model !== st.saved.model) total++;
    return h('aside', { class: 'lk-left' }, [
      h('div', { class: 'lk-help', 'data-touch': '1' }, [
        h('small', { class: 'lk-eyebrow', text: 'EAGLE ROLEPLAY' }),
        h('h2', { text: 'YOUR STYLE.' }), h('p', { text: 'Pilih. Coba. Tampil beda.' }),
        h('div', { class: 'lk-help-actions' }, [chip('↶  Putar kiri', false, function () { command('rot', { d: -30 }); }), chip('Putar kanan  ↷', false, function () { command('rot', { d: 30 }); })]),
        h('div', { class: 'lk-help-actions' }, [chip('Acak', false, function () { command('random'); }), chip('Reset', false, function () { command('reset'); })])
      ]),
      h('div', { class: 'lk-outfit', 'data-touch': '1' }, [h('div', { class: 'lk-sh' }, [h('b', { text: 'Penampilan' }), h('span', { text: worn.length + ' BAGIAN' })]), h('div', { class: 'lk-equipped' }, worn.length ? worn : [h('p', { class: 'lk-note', text: 'Model karakter standar' })])]),
      h('div', { class: 'lk-checkout', 'data-touch': '1' }, [
        h('div', { class: 'lk-outfits-label' }, [h('span', { text: '◈  OUTFIT SAAT INI' }), h('small', { text: total + ' perubahan' })]),
        h('div', { class: 'lk-total' + (paid() && cost > cash ? ' short' : '') }, [h('span', { text: 'TOTAL' }), h('b', { text: ready() ? money(cost) : '…' })]),
        h('div', { class: 'lk-wallet' }, [h('span', { text: paid() ? 'Tunai · ' + (shop.cur || 'Eagle Dollar') : mode() === MODE_CREATE ? 'Pembuatan karakter' : 'Penampilan' }), h('b', { text: paid() ? money(cash) : ready() ? 'GRATIS' : 'Memuat…' })]),
        h('p', { class: 'lk-message' + (st.error ? ' error' : ''), role: 'status', text: st.error || (st.waiting ? 'Menyimpan penampilan…' : st.pending ? 'Memperbarui preview karakter…' : ready() ? 'Pratinjau langsung pada karakter' : 'Menunggu data toko…') }),
        st.pending && st.previewTimeout && st.sequenced ? chip('Muat ulang preview', false, syncPreview, 'preview-retry') : null,
        h('div', { class: 'lk-btns' }, [chip(mode() === MODE_CREATE ? 'Lewati' : 'Batal', false, cancel, 'cancel'), chip(st.waiting ? 'MENYIMPAN…' : paid() && cost > 0 ? 'BELI & SIMPAN' : mode() === MODE_CREATE ? 'SIMPAN & LANJUT' : 'SIMPAN', false, save, 'go')]),
        mode() === MODE_SHOP ? chip('Buka toko skin biasa  ›', false, function () { stopDraft(); E.send('lookshop', 'oldstore', -1, ''); close(); }, 'oldstore') : null
      ])
    ]);
  }
  function render() {
    if (!st) return;
    if (!root) { root = h('div', { id: 'lookui', class: 'lk-root' }); (document.getElementById('panels') || document.body).appendChild(root); }
    var old = root.querySelector('.lk-body'), scroll = old ? old.scrollTop : 0, tab = tabs()[st.tab] || tabs()[0];
    var cat = kindCat(), cost = totalCost(), cash = shop && String(shop.s) === st.s ? +shop.cash || 0 : 0;
    var body = [];
    if (tab.id === 'char') body = charTab();
    else if (tab.id === 'face') body = faceTab();
    else if (tab.id === 'outfit') body = outfitTab();
    else if (tab.id === 'body') body = bodyTab();
    else if (!st.draft.model) body = [h('p', { class: 'lk-note', text: 'Pilih model Kustom di tab Karakter untuk mengganti pakaian.' })];
    else { var slots = currentSlot(); body.push(categories(slots)); if (st.slot >= 0) body.push(slotBlock(st.slot)); }
    if (tab.id === 'tat') body.push(h('p', { class: 'lk-note', text: 'Tato yang tertutup pakaian tidak terlihat.' }));
    var panel = h('section', { class: 'lk-panel', 'data-touch': '1', 'aria-label': 'Katalog pakaian' }, [
      h('header', { class: 'lk-head' }, [h('div', null, [h('small', { class: 'lk-eyebrow', text: mode() === MODE_CREATE ? 'KARAKTER BARU · LANGKAH 2' : 'DRESS TO EXPRESS' }), h('h1', { text: mode() === MODE_CREATE ? 'PENAMPILAN' : 'CLOTHING' })]), chip('×', false, cancel, 'cancel close')]),
      h('nav', { class: 'lk-tabs', 'aria-label': 'Kategori' }, tabs().map(function (t, i) { return chip(t.t, st.tab === i, function () { st.tab = i; st.slot = -1; render(); root.querySelector('.lk-body').scrollTop = 0; }, 'tab'); })),
      h('div', { class: 'lk-body' }, body),
      h('div', { class: 'lk-catalog-foot', text: cat ? cat.label + ' · Pratinjau karakter langsung' : 'EAGLE ROLEPLAY' })
    ]);
    root.textContent = ''; root.appendChild(leftPanel(cost, cash)); root.appendChild(panel); root.appendChild(tools()); root.classList.add('on');
    root.querySelector('.lk-body').scrollTop = scroll;
    var go = root.querySelector('.go'); go.disabled = !ready() || busy() || paid() && cost > cash;
    root.querySelectorAll('button, input, select').forEach(function (b) {
      if (!b.classList.contains('go') && !b.classList.contains('cancel') && !b.classList.contains('preview-retry')) b.disabled = busy();
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
