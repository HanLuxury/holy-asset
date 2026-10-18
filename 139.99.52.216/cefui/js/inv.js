/* EAGLE V123 — CEF/Pawn inventory. All mutations are acknowledged by the server. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, A = window.EAGLEItems, h = U.h;
  var st = {show:0, session:0, busy:0, it:[], gr:[], other:[], cl:[], context:'ground', w:0, wm:50};
  var tab = 'bag', selection = null, search = '', pending = false, pendingTimer = 0;
  var drag = null, clickUntil = 0, lastTap = null, restoreFocus = null;
  var root = h('section', {id:'inv', class:'inv inv-v75 inv-lj', 'data-touch':'', 'aria-label':'Inventory', 'aria-hidden':'true'});
  U.layer('screenlayer').appendChild(root);
  var weightIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 6V5a3 3 0 0 1 6 0v1h3l3 15H3L6 6Zm2 0h2V5a1 1 0 0 0-2 0Z"/></svg>';
  var hand = '<svg viewBox="0 0 72 48" aria-hidden="true"><path fill="currentColor" d="m4 36 13-12h15l9 4c4 2 1 7-3 5l-8-2-2 3 15 3 20-15c5-3 10 3 5 7L46 46H16L4 46Zm18-18V3h5v11h3V1h5v13h3V3h5v12h3V7h5v15l-8 5-10-5H22Z"/></svg>';
  root.innerHTML =
    '<div class="iv-layout">' +
      '<section class="iv-container iv-player" aria-label="Tas pemain">' +
        '<header><div><h2>Player</h2><span class="iv-name"></span></div><nav class="iv-tabs" aria-label="Kategori"><button data-tab="bag" class="iv-active">Tas</button><button data-tab="clothes">Pakaian</button></nav></header>' +
        '<div class="iv-weight-row">'+weightIcon+'<div class="iv-meter"><i></i></div></div><div class="iv-weight"></div>' +
        '<div class="iv-scroll" tabindex="0" aria-label="Slot tas, gulir untuk melihat semua"><div class="iv-grid iv-bag-grid"></div></div>' +
        '<footer class="iv-player-footer"><span>QUICK SLOTS <b>1 — 5</b></span><input class="iv-search" type="search" placeholder="Cari item" aria-label="Cari item"></footer>' +
      '</section>' +
      '<aside class="iv-actions" aria-label="Aksi item"><label for="iv-amount">JUMLAH</label><input id="iv-amount" type="number" inputmode="numeric" min="1" max="1000000" value="1" aria-label="Jumlah item">' +
        '<button class="iv-use" data-action="use" data-drop="use" aria-label="Gunakan item"><span>USE</span>'+hand+'</button>' +
        '<button data-action="give" data-drop="give">GIVE ITEM</button><button class="iv-close" data-action="close">CLOSE</button>' +
        '<div class="iv-mini-tools"><button data-action="ground_view" title="Lihat tanah" aria-label="Lihat tanah">'+U.icon('pin')+'</button><button data-action="refresh" title="Segarkan" aria-label="Segarkan">'+U.icon('refresh')+'</button><button class="iv-help" title="Bantuan" aria-label="Bantuan">?</button></div>' +
      '</aside>' +
      '<section class="iv-container iv-other" aria-label="Inventory sekitar"><header><div><h2 class="iv-other-title">Ground</h2><span class="iv-other-sub"></span></div><span class="iv-cash"></span></header>' +
        '<div class="iv-weight-row">'+weightIcon+'<div class="iv-meter iv-other-meter"><i></i></div></div><div class="iv-other-weight"></div>' +
        '<div class="iv-scroll" tabindex="0" aria-label="Slot inventory sekitar"><div class="iv-grid iv-other-grid"></div><p class="iv-empty"></p></div><footer><button class="iv-take" data-action="other">AMBIL ITEM</button><span class="iv-context-note"></span></footer>' +
      '</section>' +
    '</div>' +
    '<div class="iv-bottom"><div class="iv-details" aria-live="polite"><b>Pilih item</b><span>Pilih barang untuk melihat keterangannya.</span></div><span class="iv-status" role="status"></span></div>' +
    '<div class="iv-key-hint"><span>SERET</span> pindah item <i></i><span>TAHAN + SERET</span> di Android <i></i><span>ESC</span> tutup</div>' +
    '<div class="iv-help-pop" role="dialog" aria-modal="true" aria-label="Panduan inventory" aria-hidden="true" hidden><h3>INVENTORY</h3><p>Ketuk item untuk memilih. Seret ke slot lain untuk memindahkan atau menukar posisinya. Lima slot pertama menjadi quick bar.</p><p>Android: tahan item sebentar, lalu seret. Geser vertikal tanpa menahan untuk menggulir tas.</p><p>Seret ke panel kanan untuk menjatuhkan atau menyimpan ke bagasi. Seret dari panel kanan ke tas untuk mengambil, membeli, atau membuat item.</p><p>Jumlah mengatur transaksi. Pindah slot selalu memindahkan seluruh tumpukan.</p><button class="iv-help-close">MENGERTI</button><button data-action="wardrobe">BUKA WARDROBE</button></div>';
  var $ = function (q) { return root.querySelector(q); };
  var amount = $('#iv-amount'), bagGrid = $('.iv-bag-grid'), otherGrid = $('.iv-other-grid');
  function quantity() {
    var n = Number(amount.value);
    return Number.isSafeInteger(n) && n >= 1 && n <= 1000000 ? n : 0;
  }
  function bag() { return tab === 'clothes' ? st.cl : st.it; }
  function other() { return st.context === 'ground' ? st.gr : st.other; }
  function find(arr, id) { return (arr || []).find(function (i) { return +i.s === +id; }); }
  function selected() { return selection && find(selection.side === 'bag' ? bag() : other(), selection.id); }
  function notice(text) { $('.iv-status').textContent = text || ''; }
  function unlock() { pending = false; clearTimeout(pendingTimer); }
  function wire(action, index, value, wait) {
    if (!+st.show || !+st.session || (pending && action !== 'refresh')) return false;
    if (value == null) value = quantity();
    if (!value) { notice('Masukkan jumlah 1–1.000.000.'); amount.focus(); return false; }
    if (wait) {
      pending = true; notice('Menunggu server…'); clearTimeout(pendingTimer);
      pendingTimer = setTimeout(function () {
        if (+st.show) { notice('Menyegarkan hasil transaksi…'); wire('refresh', -1, 1, false); }
      }, 7000);
    }
    E.send('inv', action, index == null ? -1 : index, String(st.session) + '|' + value);
    buttons(); return true;
  }
  function perform(action) {
    if (action === 'close') { close(); return; }
    if (/^(refresh|ground_view|wardrobe)$/.test(action)) { wire(action, -1, 1, action !== 'wardrobe'); return; }
    if (pending || +st.busy) return;
    var item = selected();
    if (!item) { notice('Pilih item terlebih dahulu.'); return; }
    if (action === 'other') {
      if (selection.side !== 'other') return;
      wire(st.context === 'shop' ? 'buy' : st.context === 'craft' ? 'craft' : 'take', +item.s, st.context === 'craft' ? 1 : null, true);
      return;
    }
    if (selection.side !== 'bag') return;
    if (action === 'use') wire(tab === 'clothes' ? 'wear' : 'use_now', +item.s, 1, false);
    if (action === 'give' && tab !== 'clothes') wire('give_now', +item.s, null, false);
    if (action === 'transfer' && tab !== 'clothes') {
      if (st.context !== 'ground' && st.context !== 'trunk') { notice('Panel ini menerima pembelian atau crafting.'); return; }
      wire(st.context === 'trunk' ? 'store' : 'drop_now', +item.s, null, true);
    }
  }
  function buttons() {
    var busy = pending || !!+st.busy, item = selected(), own = !!item && selection.side === 'bag';
    root.classList.toggle('iv-busy', busy);
    $('[data-action=use]').disabled = busy || !own;
    $('[data-action=give]').disabled = busy || !own || tab === 'clothes';
    var take = $('[data-action=other]');
    take.disabled = busy || !item || selection.side !== 'other' ||
      (st.context === 'craft' && (item.needs || []).some(function (n) { return +n.have < +n.q; }));
    take.textContent = st.context === 'shop' ? 'BELI ITEM' : st.context === 'craft' ? 'CRAFT ITEM' : 'AMBIL ITEM';
    $('[data-action=ground_view]').disabled = busy;
    $('[data-action=refresh]').disabled = false;
  }
  function details() {
    var item = selected(), inf = item && A.info(item), text = 'Pilih barang untuk melihat keterangannya.';
    $('.iv-details b').textContent = inf ? inf.label : 'Pilih item';
    if (item) {
      text = inf.description;
      if (selection.side === 'other' && st.context === 'craft') text = (item.needs || []).map(function (n) { return U.plain(n.n) + ' ' + n.have + '/' + n.q; }).join(' · ');
      else if (selection.side === 'other' && st.context === 'shop') text += '  $' + (+item.price || 0).toLocaleString('id-ID') + ' / item · Total $' + ((+item.price || 0) * (quantity() || 1)).toLocaleString('id-ID');
      else if (+item.kg >= 0) text += '  Berat ' + (+item.kg).toFixed(2) + ' kg.';
    }
    $('.iv-details span').textContent = text; buttons();
  }
  function choose(side, id) {
    if (pending || +st.busy) return;
    var item = find(side === 'bag' ? bag() : other(), id);
    if (!item) { selection = null; }
    else selection = selection && selection.side === side && selection.id === id ? null : {side:side, id:id};
    markSelection(); details(); notice('');
  }
  function markSelection() {
    root.querySelectorAll('.iv-slot').forEach(function (el) {
      var on = selection && el.dataset.side === selection.side && +el.dataset.index === selection.id;
      el.classList.toggle('iv-selected', !!on); el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function cell(item, id, side, visualIndex) {
    var inf = item && A.info(item);
    var el = h('button', {type:'button', class:'iv-slot' + (item ? ' iv-full' : ''), 'data-side':side, 'data-index':id,
      'aria-label':item ? inf.label + ', ' + item.q + ' item, slot ' + (visualIndex + 1) : 'Slot kosong ' + (visualIndex + 1), 'aria-pressed':'false'});
    if (side === 'bag' && tab === 'bag' && id < A.quickSlots) {
      el.classList.add('iv-quick-slot'); el.appendChild(h('small', {class:'iv-hot', text:id + 1}));
    }
    if (item) {
      var art = h('span', {class:'iv-item-art'}); art.appendChild(A.image(item)); el.appendChild(art);
      var count = st.context === 'shop' && side === 'other' ? '$' + (+item.price || 0) : String(item.q);
      if (+item.kg >= 0 && !(st.context === 'shop' && side === 'other')) count += ' (' + (+item.kg).toFixed(1) + ')';
      el.appendChild(h('strong', {class:'iv-item-qty', text:count}));
      el.appendChild(h('span', {class:'iv-item-name'}, h('span', {class:'iv-item-name-text', text:inf.label})));
      if (item.equipped) el.appendChild(h('span', {class:'iv-equipped', text:'DIPAKAI'}));
      if (item.needs && item.needs.some(function (n) { return +n.have < +n.q; })) el.classList.add('iv-unavailable');
      if (search && side === 'bag' && (U.plain(item.n) + ' ' + inf.label).toLowerCase().indexOf(search) < 0) el.classList.add('iv-filtered');
    } else el.appendChild(h('span', {class:'iv-item-name', 'aria-hidden':'true'}));
    el.addEventListener('click', function (e) { if (Date.now() >= clickUntil && !e.detail) choose(side, id); });
    el.addEventListener('pointerdown', function (e) { startPointer(e, el, item, side, id); });
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    return el;
  }
  function grids() {
    var ys = [$('.iv-player .iv-scroll').scrollTop, $('.iv-other .iv-scroll').scrollTop];
    bagGrid.replaceChildren(); otherGrid.replaceChildren();
    var arr = bag(), count = tab === 'clothes' ? Math.max(20, Math.ceil(arr.length / 5) * 5) : (+st.slots || 20);
    for (var i = 0; i < count; i++) {
      var item = tab === 'clothes' ? arr[i] : find(arr, i);
      bagGrid.appendChild(cell(item, tab === 'clothes' ? (item ? +item.s : -i-1) : i, 'bag', i));
    }
    var ot = other(), rows = Math.max(20, Math.ceil(ot.length / 5) * 5);
    for (var j = 0; j < rows; j++) otherGrid.appendChild(cell(ot[j], ot[j] ? +ot[j].s : -j-1, 'other', j));
    $('.iv-player .iv-scroll').scrollTop = ys[0]; $('.iv-other .iv-scroll').scrollTop = ys[1];
    $('.iv-empty').textContent = ot.length ? '' : st.context === 'trunk' ? 'Bagasi kosong' : st.context === 'ground' ? 'Tidak ada barang di sekitar' : 'Tidak ada item tersedia';
    markSelection();
  }
  function weight(which, value, max) {
    var meter = $(which + ' .iv-meter i');
    var ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    meter.style.width = (ratio * 100) + '%';
    meter.style.backgroundSize = (100 / Math.max(.01, ratio)) + '% 100%';
  }
  function render() {
    var show = !!+st.show;
    root.classList.toggle('on', show); root.setAttribute('aria-hidden', show ? 'false' : 'true');
    document.documentElement.classList.toggle('eagle-inventory-open', show);
    if (!show) { unlock(); cancelDrag(); help(false); return; }
    $('.iv-name').textContent = U.plain(st.name || '');
    $('.iv-weight').textContent = 'Weight: ' + (+st.w || 0).toFixed(2) + ' / ' + (+st.wm || 50).toFixed(2) + ' kg';
    weight('.iv-player', +st.w || 0, +st.wm || 50);
    $('.iv-other-title').textContent = U.plain(st.context === 'ground' ? 'Ground' : st.otherTitle || ({shop:'Shop',trunk:'Trunk',craft:'Crafting'})[st.context] || 'Inventory');
    $('.iv-other-sub').textContent = ({shop:'SHOP',trunk:'VEHICLE STORAGE',craft:'CRAFTING',ground:'NEARBY ITEMS'})[st.context] || '';
    $('.iv-cash').textContent = st.context === 'shop' ? '$' + (+st.cash || 0).toLocaleString('id-ID') : '';
    var ow = st.context === 'trunk' && st.ow != null ? +st.ow : other().reduce(function (n, i) { return n + (+i.kg || 0); }, 0);
    var capacity = +st.owm || 0;
    $('.iv-other-weight').textContent = st.context === 'shop' || st.context === 'craft' ?
      'Catalogue: ' + other().length + ' item' : 'Weight: ' + ow.toFixed(2) + (capacity > 0 ? ' / ' + capacity.toFixed(2) : '') + ' kg';
    weight('.iv-other', ow, capacity);
    $('.iv-context-note').textContent = st.context === 'shop' ? 'Pilih jumlah lalu beli atau seret ke tas' : st.context === 'craft' ? 'Bahan diperiksa sebelum crafting' : st.context === 'trunk' ? 'Seret item antar panel untuk memindahkan' : 'Jangkauan pengambilan 1,5 meter';
    amount.disabled = st.context === 'craft'; if (st.context === 'craft') amount.value = '1';
    root.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('iv-active', b.dataset.tab === tab); b.setAttribute('aria-pressed', b.dataset.tab === tab ? 'true' : 'false'); });
    if (!selected()) selection = null;
    grids(); details(); if (E.touch) E.touch();
  }
  function startPointer(e, el, item, side, id) {
    if (!+st.show || pending || +st.busy || e.button > 0 || e.isPrimary === false || root.classList.contains('iv-help-open')) return;
    if (drag) return;
    drag = {id:id, side:side, item:item, el:el, x:e.clientX, y:e.clientY, pointer:e.pointerId,
      touch:e.pointerType === 'touch', active:false, scroll:false, ready:false, scrollEl:el.closest('.iv-scroll')};
    drag.scrollTop = drag.scrollEl.scrollTop;
    if (item) drag.timer = setTimeout(function () { if (drag && drag.el === el) { drag.ready = true; el.classList.add('iv-held'); } }, 260);
    try { root.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function dropTarget(x, y) {
    var el = document.elementFromPoint(x, y);
    return el && (el.closest('[data-drop]') || el.closest('.iv-slot') || el.closest('.iv-other-grid') || el.closest('.iv-bag-grid'));
  }
  function validDrop(d, to) {
    if (!to || pending || +st.busy) return false;
    if (to.dataset.drop) return d.side === 'bag' && (to.dataset.drop === 'use' || tab === 'bag');
    var side = to.dataset.side || (to === bagGrid ? 'bag' : 'other');
    if (d.side === 'other') return side === 'bag' && tab === 'bag';
    if (tab !== 'bag') return false;
    return side === 'bag' ? !!to.dataset.index && +to.dataset.index !== d.id :
      st.context === 'ground' || st.context === 'trunk';
  }
  function clearHover() { root.querySelectorAll('.iv-drop-target').forEach(function (n) { n.classList.remove('iv-drop-target'); }); }
  function cancelDrag() {
    if (!drag) return;
    clearTimeout(drag.timer); if (drag.ghost) drag.ghost.remove();
    drag.el.classList.remove('iv-held','iv-dragging'); clearHover();
    try { root.releasePointerCapture(drag.pointer); } catch (_) {}
    root.classList.remove('iv-is-dragging'); drag = null;
  }
  document.addEventListener('pointermove', function (e) {
    var d = drag; if (!d || d.pointer !== e.pointerId) return;
    var dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.active && Math.hypot(dx, dy) < 9) return;
    if (!d.active && d.touch && (!d.item || !d.ready && Math.abs(dy) > Math.abs(dx) * 1.15)) {
      clearTimeout(d.timer); d.scroll = true; d.el.classList.remove('iv-held');
    }
    if (d.scroll) { d.scrollEl.scrollTop = d.scrollTop - dy; e.preventDefault(); return; }
    if (!d.item) return;
    if (!d.active) {
      d.active = true; clearTimeout(d.timer); selection = {side:d.side,id:d.id}; markSelection(); details();
      d.el.classList.add('iv-dragging'); d.ghost = d.el.cloneNode(true); d.ghost.className = 'iv-drag-ghost';
      d.ghost.removeAttribute('id'); d.ghost.removeAttribute('data-index'); d.ghost.removeAttribute('data-side'); d.ghost.setAttribute('aria-hidden','true');
      var r = d.el.getBoundingClientRect(); d.ghost.style.width = r.width + 'px'; d.ghost.style.height = r.height + 'px';
      document.body.appendChild(d.ghost); root.classList.add('iv-is-dragging');
    }
    d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = (e.clientY - (d.touch ? 25 : 0)) + 'px';
    clearHover(); var to = dropTarget(e.clientX, e.clientY);
    if (validDrop(d, to)) to.classList.add('iv-drop-target');
    var scroll = to && to.closest('.iv-scroll');
    if (scroll) { var r2 = scroll.getBoundingClientRect(); if (e.clientY > r2.bottom-24) scroll.scrollTop += 12; else if (e.clientY < r2.top+24) scroll.scrollTop -= 12; }
    e.preventDefault();
  }, {passive:false});
  document.addEventListener('pointerup', function (e) {
    var d = drag; if (!d || d.pointer !== e.pointerId) return;
    var to = d.active && dropTarget(e.clientX, e.clientY), good = d.active && validDrop(d, to);
    cancelDrag(); clickUntil = Date.now() + 400; e.preventDefault();
    if (d.scroll) return;
    if (!d.active) {
      var same = lastTap && lastTap.side === d.side && lastTap.id === d.id && Date.now() - lastTap.time < 280;
      if (same && d.item) { selection = {side:d.side,id:d.id}; markSelection(); details(); perform(d.side === 'bag' ? 'use' : 'other'); lastTap = null; }
      else { choose(d.side,d.id); lastTap = {side:d.side,id:d.id,time:Date.now()}; }
      return;
    }
    lastTap = null;
    if (!good) { notice('Lepaskan pada slot atau tombol aksi yang sesuai.'); return; }
    selection = {side:d.side,id:d.id};
    if (to.dataset.drop) perform(to.dataset.drop);
    else {
      var side = to.dataset.side || (to === bagGrid ? 'bag' : 'other');
      if (d.side === 'bag' && side === 'bag') wire('slot_move', d.id, +to.dataset.index + 1, true);
      else perform(d.side === 'bag' ? 'transfer' : 'other');
    }
  }, {passive:false});
  document.addEventListener('pointercancel', cancelDrag);
  window.addEventListener('blur', cancelDrag);
  document.addEventListener('visibilitychange', function () { if (document.hidden) cancelDrag(); });
  function help(show) {
    cancelDrag(); root.classList.toggle('iv-help-open', show); var pop = $('.iv-help-pop');
    pop.hidden = !show; pop.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) $('.iv-help-close').focus(); else if (+st.show && document.activeElement && pop.contains(document.activeElement)) $('.iv-help').focus();
    if (E.touch) E.touch();
  }
  function close() { cancelDrag(); help(false); if (+st.show) E.send('inv','close',-1,''); }
  root.querySelectorAll('[data-action]').forEach(function (b) { b.onclick = function () { perform(b.dataset.action); }; });
  root.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { cancelDrag(); tab = b.dataset.tab; selection = null; search = ''; $('.iv-search').value = ''; render(); }; });
  $('.iv-help').onclick = function () { help(!root.classList.contains('iv-help-open')); };
  $('.iv-help-close').onclick = function () { help(false); };
  $('.iv-search').oninput = function () { cancelDrag(); search = this.value.trim().toLowerCase(); grids(); };
  amount.oninput = details; amount.onfocus = function () { this.select(); };
  document.addEventListener('keydown', function (e) {
    if (!+st.show || document.body.classList.contains('dlg-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); if (root.classList.contains('iv-help-open')) help(false); else close(); }
  });
  E.on('inv', function (d) {
    if (!d || typeof d !== 'object') return;
    cancelDrag(); unlock();
    var opening = !!+d.show && !+st.show, changed = d.session != null && +d.session !== +st.session;
    if (opening) restoreFocus = document.activeElement;
    if (opening || changed) { tab = 'bag'; selection = null; search = ''; $('.iv-search').value = ''; amount.value = '1'; lastTap = null; }
    if (d.context && d.context !== st.context) selection = null;
    Object.keys(d).forEach(function (k) { st[k] = d[k]; });
    if (!st.ground && st.context === 'ground') st.gr = [];
    notice(+st.busy ? 'Sedang diproses…' : ''); render();
    if (opening) $('[data-action=close]').focus({preventScroll:true});
    if (!+st.show && restoreFocus && restoreFocus.isConnected) { restoreFocus.focus({preventScroll:true}); restoreFocus = null; }
  });
  E.done('inv');
})();
