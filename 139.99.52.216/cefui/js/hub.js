/* =====================================================================
   EAGLE V181 - Eagle Hub
   Bar ikon atas (hudlayer) + panel (panels): Manual Book, Activity, Mall,
   Battle Pass, Phone, Inventory. Data dari server (SERVER/player/eaglehub):
     hubbar {show, bp, act, coin}            -> bar + titik merah
     hub    {sec:"bp"|"mall"|"act"|"log"|"jobs", ...}
   Kirim: E.send("hub", aksi, angka, teks)
   ===================================================================== */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, A = window.EAGLEItems, h = U.h;

  /* ---------------------------------------------------------------- ikon */
  var SV = function (p, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var IC = {
    man: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8.5 7.5h7M8.5 11h5"/>',
    act: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M8 15l2.6 2.4L16 12.6"/>',
    mall: '<path d="M5 8h14l-1.2 12.2a1.6 1.6 0 0 1-1.6 1.4H7.8a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M8.8 10.5V6.8a3.2 3.2 0 0 1 6.4 0v3.7"/>',
    bp: '<path d="M12 2.6l7.4 3.1v5.6c0 4.8-3.2 8.6-7.4 10.1-4.2-1.5-7.4-5.3-7.4-10.1V5.7z"/><path d="M12 7.4l1.5 3.1 3.4.4-2.5 2.3.7 3.3-3.1-1.7-3.1 1.7.7-3.3-2.5-2.3 3.4-.4z"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.4"/><path d="M10.5 18.5h3"/>',
    inv: '<path d="M7 7.5V6a5 5 0 0 1 10 0v1.5"/><rect x="4" y="7.5" width="16" height="14" rx="3"/><path d="M4 13h16M10 13v2.5h4V13"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 8.6A4 4 0 1 0 14.8 15.4M8.8 12h4.6"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
    hat: '<path d="M3 17.5c3 1.4 15 1.4 18 0"/><path d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6"/><path d="M6.5 13.5h11"/>',
    box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    fold: '<path d="M15 5l-7 7 7 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    crown: '<path d="M3.5 8l4.3 3.6L12 5l4.2 6.6L20.5 8l-1.8 10.5H5.3z"/>',
    gift: '<rect x="3.5" y="9" width="17" height="12" rx="1.6"/><path d="M2.5 9h19v-3h-19zM12 6v15M12 6c-1.8-3.6-6-3.2-5.2-.6C7.3 7 12 6 12 6zM12 6c1.8-3.6 6-3.2 5.2-.6C16.7 7 12 6 12 6z"/>',
    briefcase: '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M8.5 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2M3 12.5h18"/>',
    chat: '<path d="M4 5.5h16v10.5H9.5L5 19.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 21h7M9.5 17h5v4h-5z"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4v4.5h4.5M12 8v4.5l3 1.8"/>',
    car: '<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7 19v2M17 19v2"/>',
    shirt: '<path d="M8 3l-5 3 2 5 2-1v11h10V10l2 1 2-5-5-3a4 4 0 0 1-8 0z"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3.4 8.3-7 10-3.6-1.7-7-5-7-10V6z"/>',
    gavel: '<path d="M14 4l6 6M11.5 6.5l6 6M13 8l-9 9 3 3 9-9M3 21h8"/>',
    mask: '<path d="M3 8c3-2 15-2 18 0 0 6-3 9-6 9-1.5 0-2-1.5-3-1.5S10.5 17 9 17c-3 0-6-3-6-9z"/><path d="M7.5 11h2.5M14 11h2.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8M12 17.2v.1"/>',
    home: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.8 3 2.6 3.5 5.2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    bag: '<path d="M6 7h12l1 14H5zM9 7a3 3 0 0 1 6 0"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    moneybag: '<path d="M9 3.2h6l-1.6 3.2h-2.8z"/><path d="M10.6 6.4C6.4 8.3 4 12 4 15.4 4 19 6.9 21 12 21s8-2 8-5.6c0-3.4-2.4-7.1-6.6-9"/><path d="M14.2 11.6c-.4-.8-1.2-1.2-2.2-1.2-1.3 0-2.2.7-2.2 1.6 0 2.2 4.6 1.2 4.6 3.5 0 1-1 1.7-2.4 1.7-1.1 0-2-.5-2.4-1.3M12 9.2v1.2M12 16.8v1.3"/>'
  };
  var EMBLEM = '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
    '<path d="M100 18l64 26v46c0 44-28 76-64 92-36-16-64-48-64-92V44z"/>' +
    '<path d="M100 34l50 20v36c0 36-22 62-50 76-28-14-50-40-50-76V54z" opacity=".5"/>' +
    '<path d="M52 92c18-4 30 2 40 14 4-16 14-30 30-36 10-4 22-2 30 4-12 0-20 4-26 10 10 0 18 4 22 10-10-2-18 0-24 4 6 6 8 14 6 22-6-8-14-12-22-12-8 12-20 18-34 18 8-6 12-12 14-20-12 0-24-6-36-14z"/>' +
    '<circle cx="122" cy="84" r="3" fill="currentColor"/></svg>';
  function ico(n, cls) { return SV(IC[n] || IC.help, cls); }
  function icoEl(n, cls) { return h('span', {class:'eh-ic ' + (cls || ''), html:ico(n)}); }

  /* ---------------------------------------------------------------- data */
  var bar = {show:0, bp:0, act:0, coin:0};
  var D = {bp:null, mall:null, act:null};
  var logs = {}, jobs = null, recvAt = {};
  var cur = null, tab = 0, busy = false, busyTimer = 0, folded = false, openTok = 0;
  try { folded = localStorage.getItem('eagle.hub.fold') === '1'; } catch (_) {}

  var STATS = ['mnt', 'tugas', '$', 'm', 'pesan', 'panggilan', 'postingan', 'kali', 'barang', 'event', 'hari', 'misi', 'misi'];
  function fmtStat(st, v) {
    v = +v || 0;
    if (st === 2) return U.money(v);
    if (st === 3) return (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace('.', ',') + ' km';
    return v + ' ' + (STATS[st] || '');
  }
  function num(n) { return String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function coinTxt(n) { return num(n) + ' Coin'; }
  function left(sec) {
    sec = Math.max(0, Math.floor(sec));
    var d = Math.floor(sec / 86400), hh = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    if (d > 0) return d + ' hari ' + hh + ' jam';
    if (hh > 0) return hh + ' jam ' + m + ' mnt';
    return m + ' mnt ' + (s < 10 ? '0' : '') + s + ' dtk';
  }
  function shortLeft(sec) {
    sec = Math.max(0, Math.floor(sec));
    var d = Math.floor(sec / 86400), hh = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60);
    return d > 0 ? d + ' Hari' : hh > 0 ? hh + ' Jam ' + m + ' Mnt' : m + ' Menit';
  }
  function since(sec, key) { return sec - (Date.now() - (recvAt[key] || Date.now())) / 1000; }
  function dateTxt(ts) {
    var d = new Date((+ts || 0) * 1000), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* gambar hadiah / barang: t 1 uang, 2 coin, 3 item, 4 skin, 5 aksesoris, 6 kendaraan, 7 paket */
  function art(t, m, itemName, cls) {
    var box = h('span', {class:'eh-art ' + (cls || '') + ' eh-t' + t});
    if (t === 3) box.appendChild(A.image({n:itemName || ''}, 'eh-img'));
    else if (t === 4 || t === 6) {
      // ikon cadangan di belakang; foto (assets.open.mp) menutupinya bila berhasil dimuat
      box.innerHTML = ico(t === 4 ? 'shirt' : 'car', 'eh-fb');
      var im = U.img((t === 4 ? 'skin:' : 'veh:') + m, 'eh-img eh-abs ' + (t === 4 ? 'eh-skin' : 'eh-veh'));
      if (im) { im.addEventListener('error', function () { im.remove(); }); box.appendChild(im); }
    }
    else if (t === 5) box.innerHTML = ico('hat');
    else box.innerHTML = ico(t === 1 ? 'moneybag' : t === 2 ? 'coin' : t === 7 ? 'gift' : 'box');
    return box;
  }

  /* ---------------------------------------------------------------- bar atas */
  // ikon bar (diisi, garis tepi gelap, tanpa kotak latar)
  var K = '#111', BI = {
    man: '<path d="M5 3.5h12.6A1.4 1.4 0 0 1 19 4.9v15.6H6.6A1.6 1.6 0 0 1 5 18.9z" fill="#ffd21f" stroke="' + K + '" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M6.6 17.6H19" stroke="' + K + '" stroke-width="1.3"/><path d="M9.9 8.7a2.2 2.2 0 1 1 3.2 1.9c-.8.4-1.1.9-1.1 1.7v.3" fill="none" stroke="' + K + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="12" cy="14.9" r="1.05" fill="' + K + '"/>',
    act: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.2" fill="#fff" stroke="' + K + '" stroke-width="1.3"/><path d="M3.5 9.6h17" stroke="' + K + '" stroke-width="1.3"/>' +
      '<path d="M8 3v4M16 3v4" stroke="' + K + '" stroke-width="1.9" stroke-linecap="round"/><path d="M8.4 14.7l2.4 2.3 4.9-5" fill="none" stroke="' + K + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    mall: '<path d="M5.2 8h13.6l-1 12.3a1.6 1.6 0 0 1-1.6 1.5H7.8a1.6 1.6 0 0 1-1.6-1.5z" fill="#fff" stroke="' + K + '" stroke-width="1.3" stroke-linejoin="round"/>' +
      '<path d="M9 10.2V6.6a3 3 0 0 1 6 0v3.6" fill="none" stroke="' + K + '" stroke-width="1.7" stroke-linecap="round"/><rect x="8.6" y="12.6" width="6.8" height="5.6" rx="1.2" fill="#e8384f"/>' +
      '<path d="M10.6 15.4h2.8" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>',
    bp: '<g fill="none" stroke-linejoin="round" stroke-linecap="round"><path d="M7 4.5h10l3.7 5L12 20.6 3.3 9.5z M3.3 9.5h17.4 M9.6 4.5 8.1 9.5 12 20.6l3.9-11.1-1.5-5" stroke="' + K + '" stroke-width="3.4"/>' +
      '<path d="M7 4.5h10l3.7 5L12 20.6 3.3 9.5z M3.3 9.5h17.4 M9.6 4.5 8.1 9.5 12 20.6l3.9-11.1-1.5-5" stroke="#fff" stroke-width="1.5"/></g>',
    phone: '<rect x="6.3" y="2.5" width="11.4" height="19" rx="2.4" fill="#fff" stroke="' + K + '" stroke-width="1.3"/><rect x="8" y="5" width="8" height="12" rx=".9" fill="#1d2433"/>' +
      '<circle cx="12" cy="19.3" r=".95" fill="' + K + '"/>',
    inv: '<path d="M8.4 7.2V5.8a3.6 3.6 0 0 1 7.2 0v1.4" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round"/><path d="M8.4 7.2V5.8a3.6 3.6 0 0 1 7.2 0v1.4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M5 10.2a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v9.3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="#fff" stroke="' + K + '" stroke-width="1.3"/>' +
      '<path d="M5 13.2h14" stroke="' + K + '" stroke-width="1.3"/><rect x="9.2" y="11.8" width="5.6" height="4.4" rx="1" fill="#ffd21f" stroke="' + K + '" stroke-width="1.2"/>'
  };
  function barIco(k) { return '<svg viewBox="0 0 24 24">' + BI[k] + '</svg>'; }
  var barEl = h('div', {id:'ehub-bar', class:'ehb', 'data-touch':'', 'aria-label':'Menu utama'});
  var BAR = [['man', 'MANUAL'], ['act', 'ACTIVITY'], ['mall', 'MALL'], ['bp', 'BATTLE<br>PASS'], ['phone', 'PHONE'], ['inv', 'INVENTORY']];
  var barBtns = {};
  var barList = h('div', {class:'ehb-list'}), barFixed = h('div', {class:'ehb-fixed'});
  BAR.forEach(function (b) {
    var btn = h('button', {type:'button', class:'ehb-btn ehb-' + b[0], 'aria-label':b[1].replace('<br>', ' ')});
    btn.innerHTML = '<span class="ehb-ico">' + barIco(b[0]) + '<i class="ehb-dot" hidden></i></span><span class="ehb-lbl">' + b[1] + '</span>';
    btn.addEventListener('click', function () { tapBar(b[0]); });
    barBtns[b[0]] = btn;
    (b[0] === 'phone' || b[0] === 'inv' ? barFixed : barList).appendChild(btn);
  });
  // tombol lipat di antara grup (seperti referensi): sembunyikan Manual..Battle Pass
  var foldBtn = h('button', {type:'button', class:'ehb-fold', 'aria-label':'Sembunyikan menu',
    html:'<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'});
  foldBtn.addEventListener('click', function () {
    folded = !folded;
    try { localStorage.setItem('eagle.hub.fold', folded ? '1' : '0'); } catch (_) {}
    renderBar();
  });
  barEl.appendChild(barList);
  barEl.appendChild(foldBtn);
  barEl.appendChild(barFixed);
  U.layer('hudlayer').appendChild(barEl);

  function phoneOpen() { return !!document.querySelector('.eph:not(.ep-gone)'); }
  function renderBar() {
    var vis = !!bar.show && !cur && !phoneOpen();
    barEl.classList.toggle('on', vis);
    barEl.classList.toggle('folded', folded);
    barEl.setAttribute('aria-hidden', vis ? 'false' : 'true');
    barBtns.bp.querySelector('.ehb-dot').hidden = !(+bar.bp > 0);
    barBtns.act.querySelector('.ehb-dot').hidden = !(+bar.act > 0);
    foldBtn.classList.toggle('dot', folded && (+bar.bp > 0 || +bar.act > 0));
    foldBtn.setAttribute('aria-label', folded ? 'Tampilkan menu' : 'Sembunyikan menu');
    E.touch();
  }
  function tapBar(k) {
    if (k === 'phone' || k === 'inv') { E.send('hub', k, 0, ''); return; }
    open(k);
  }
  var lastPhone = false;
  setInterval(function () { var p = phoneOpen(); if (p !== lastPhone) { lastPhone = p; renderBar(); } }, 400);

  /* ---------------------------------------------------------------- panel */
  var SEC = {
    bp:   {title:'BATTLE PASS', t1:'EAGLE', t2:'BATTLE PASS', icon:'bp', tabs:[['Battle Pass', 'bp'], ['Item Eksklusif', 'crown']]},
    mall: {title:'EAGLE MALL', t1:'EAGLE', t2:'MALL', icon:'mall', tabs:[['Unggulan', 'star'], ['Pakaian', 'shirt'], ['Aksesoris', 'hat'], ['Kendaraan', 'car'], ['Kebutuhan', 'box'], ['Paket Hemat', 'gift'], ['Item Spesial', 'sparkle'], ['Koleksi Saya', 'bag'], ['Riwayat Beli', 'history']]},
    act:  {title:'ACTIVITY', t1:'EAGLE', t2:'ACTIVITY', icon:'act', tabs:[['Aktivitas Harian', 'calendar'], ['Hadiah Login', 'gift'], ['Waktu Bermain', 'clock'], ['Pencapaian', 'trophy'], ['Riwayat Misi', 'history'], ['Aktivitas Kerja', 'briefcase'], ['Aktivitas Sosial', 'chat'], ['Aktivitas Event', 'flag'], ['Statistik', 'chart']]},
    man:  {title:'MANUAL BOOK', t1:'MANUAL', t2:'BOOK', icon:'man', tabs:[['Panduan Roleplay', 'user'], ['Pekerjaan', 'briefcase'], ['Kendaraan', 'car'], ['Inventory', 'inv'], ['Bisnis & Properti', 'home'], ['Organisasi & Faction', 'users'], ['Peraturan Server', 'gavel'], ['Kriminalitas', 'mask'], ['Komunikasi', 'chat'], ['FAQ', 'help']]}
  };
  var root = h('section', {id:'ehub', class:'ehub', 'data-touch':'', hidden:true, 'aria-hidden':'true'});
  root.innerHTML =
    '<div class="eh-emblem" aria-hidden="true">' + EMBLEM + '</div>' +
    '<div class="eh-box" role="dialog" aria-modal="true">' +
      '<header class="eh-head"><h1 class="eh-title"><span class="eh-t1"></span> <span class="eh-t2"></span></h1><i class="eh-hline"></i>' +
        '<div class="eh-remain" hidden>' + ico('history') + '<div><small>Sisa Waktu</small><b></b></div></div>' +
        '<div class="eh-wallet"><span class="eh-coin" title="Eagle Coin">' + ico('coin') + '<b>0</b></span><span class="eh-wbank" title="Saldo bank">' + ico('cash') + '<b>$0</b></span></div>' +
        '<button type="button" class="eh-x" aria-label="Tutup">' + ico('x') + '</button></header>' +
      '<div class="eh-body"><nav class="eh-nav"></nav><main class="eh-main"></main></div>' +
    '</div>' +
    '<div class="eh-modal" hidden></div>';
  U.layer('panels').appendChild(root);
  var $ = function (s) { return root.querySelector(s); };
  var nav = $('.eh-nav'), main = $('.eh-main'), modal = $('.eh-modal');
  $('.eh-x').addEventListener('click', close);
  root.addEventListener('click', function (e) { if (e.target === root) close(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) hideModal(); });
  document.addEventListener('keydown', function (e) {
    if (!cur) return;
    if (e.key === 'Escape') { e.preventDefault(); if (!modal.hidden) hideModal(); else close(); }
  });

  function open(k) {
    if (!SEC[k]) return;
    cur = k; tab = 0; bpScroll = null;
    root.hidden = false; root.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { root.classList.add('on'); });
    hideModal();
    if (k !== 'man') {
      var at = Date.now(), tok = ++openTok;
      E.send('hub', 'open', 0, k);
      // server membatasi 1 aksi / 200 ms: kirim ulang bila belum ada jawaban
      setTimeout(function () { if (cur === k && tok === openTok && (recvAt[k] || 0) < at) E.send('hub', 'open', 0, k); }, 1500);
    }
    render();
    renderBar();
  }
  function close() {
    if (!cur) return;
    E.send('hub', 'close', 0, '');
    cur = null;
    root.classList.remove('on');
    root.hidden = true; root.setAttribute('aria-hidden', 'true');
    hideModal();
    renderBar();
  }
  function setBusy(v) {
    busy = v; clearTimeout(busyTimer);
    root.classList.toggle('busy', v);
    if (v) busyTimer = setTimeout(function () { setBusy(false); }, 2500);
  }
  function act(a, i, s) {
    if (busy) return;
    setBusy(true);
    E.send('hub', a, i | 0, s == null ? '' : String(s));
  }

  function render() {
    if (!cur) return;
    var S = SEC[cur], d = D[cur];
    $('.eh-t1').textContent = S.t1;
    $('.eh-t2').textContent = S.t2;
    var rem = $('.eh-remain');
    rem.hidden = !(cur === 'bp' && d);
    if (cur === 'bp' && d) rem.querySelector('b').textContent = shortLeft(since(d.left, 'bp'));
    var w = d || D.bp || D.mall || D.act;
    $('.eh-coin b').textContent = num(w ? w.coin : bar.coin);
    $('.eh-wbank b').textContent = U.money(w ? w.bank : 0);
    $('.eh-wallet').hidden = cur === 'man';
    $('.eh-wbank').hidden = cur === 'bp';
    root.dataset.sec = cur;
    nav.replaceChildren();
    S.tabs.forEach(function (t, i) {
      var b = h('button', {type:'button', class:'eh-tab' + (i === tab ? ' on' : '')});
      b.innerHTML = ico(t[1]) + '<span>' + t[0] + '</span>';
      if (cur === 'bp' && d && i === 0 && (d.daily.some(misReady) || d.weekly.some(misReady) || d.lv.some(function (l) { return +l.f.s === 1 || +l.p.s === 1; })))
        b.appendChild(h('i', {class:'eh-dot'}));
      if (cur === 'act' && d && ((i === 1 && +d.login.can) || (i === 3 && d.ach.some(function (a) { return +a.s === 1; })))) b.appendChild(h('i', {class:'eh-dot'}));
      b.addEventListener('click', function () { tab = i; main.scrollTop = 0; render(); });
      nav.appendChild(b);
    });
    var y = main.scrollTop;
    main.replaceChildren();
    if (cur === 'man') renderManual();
    else if (!d) main.appendChild(h('div', {class:'eh-empty', text:'Memuat data...'}));
    else if (cur === 'bp') renderBP(d);
    else if (cur === 'mall') renderMall(d);
    else if (cur === 'act') renderAct(d);
    main.scrollTop = y;
    E.touch();
  }
  function misReady(m) { return !+m.c && +m.p >= +m.g; }

  /* ---------------------------------------------------------------- modal */
  function showModal(node) { modal.replaceChildren(node); modal.hidden = false; E.touch(); }
  function hideModal() { modal.hidden = true; modal.replaceChildren(); }
  function confirmBox(title, body, okText, onOk) {
    var box = h('div', {class:'eh-confirm'});
    box.appendChild(h('b', {class:'eh-ctitle', text:title}));
    if (body) box.appendChild(body);
    var row = h('div', {class:'eh-crow'});
    var no = h('button', {type:'button', class:'eh-btn ghost', text:'BATAL'});
    var ok = h('button', {type:'button', class:'eh-btn', text:okText || 'YA'});
    no.addEventListener('click', hideModal);
    ok.addEventListener('click', function () { hideModal(); onOk(); });
    row.appendChild(no); row.appendChild(ok); box.appendChild(row);
    showModal(box);
  }

  /* ---------------------------------------------------------------- Battle Pass */
  var TYPE = {1:'UANG', 2:'EAGLE COIN', 3:'ITEM', 4:'SKIN', 5:'AKSESORIS', 6:'KENDARAAN'};
  var DESC = ['Bermain tanpa AFK, dihitung per menit.', 'Tugas dari pekerjaan apa pun yang dibayar.', 'Total penghasilan dari pekerjaan.', 'Jarak saat kamu menyetir kendaraan.',
    'Pesan SMS / WhatsApp yang terkirim.', 'Panggilan telepon yang tersambung.', 'Postingan di media sosial HP.', 'Tarik gaji dari Paycheck.', 'Belanja apa saja di Eagle Mall.',
    'Ikuti event yang diadakan admin.', 'Ambil hadiah login harian di Activity.', 'Selesaikan misi harian Battle Pass.', 'Selesaikan misi mingguan Battle Pass.'];
  function compactVal(st, v) {
    v = +v || 0;
    if (st === 3) { var km = v / 1000; return (km >= 10 ? Math.round(km) : Math.round(km * 10) / 10).toString().replace('.', ','); }
    if (v >= 1000) { var k = v / 1000; return (k >= 10 ? Math.round(k) : Math.round(k * 10) / 10).toString().replace('.', ',') + 'K'; }
    return String(v);
  }
  function ring(p, g, label, cls) {
    var pct = Math.max(0, Math.min(1, (+p || 0) / Math.max(1, +g))), C = 2 * Math.PI * 15;
    return '<span class="ehr-ring ' + (cls || '') + '"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" class="bg"/>' +
      '<circle cx="18" cy="18" r="15" class="fg" stroke-dasharray="' + (C * pct).toFixed(2) + ' ' + C.toFixed(2) + '" transform="rotate(-90 18 18)"/></svg><span>' + label + '</span></span>';
  }
  function misCard(m, i, weekly, compact) {
    var done = +m.p >= +m.g, claimed = +m.c;
    var c = h('button', {type:'button', class:'eh-mc' + (compact ? ' compact' : '') + (claimed ? ' claimed' : done ? ' ready' : '')});
    var txt = h('div', {class:'eh-mct'});
    txt.appendChild(h('b', {html:'<em>#' + (i + 1) + '</em> ' + U.esc(String(m.t).toUpperCase())}));
    txt.appendChild(h('small', {text:(compact ? '' : DESC[+m.st] + ' ') + 'Progres: ' + fmtStat(+m.st, m.p) + ' / ' + fmtStat(+m.st, m.g) + '.'}));
    c.appendChild(txt);
    var lab = claimed ? ico('check') : done ? 'KLAIM' : compactVal(+m.st, m.p) + '/' + compactVal(+m.st, m.g);
    c.appendChild(h('div', {class:'eh-mcr', html:ring(m.p, m.g, lab, claimed ? 'done' : done ? 'ready' : '')}));
    c.appendChild(h('span', {class:'eh-mcx', html:'REWARD : <b>' + num(m.x) + '</b> EXP'}));
    c.addEventListener('click', function () {
      if (!claimed && done) act('claimmis', i, weekly ? 'w' : 'd');
      else if (!claimed) note('Belum selesai: ' + fmtStat(+m.st, m.p) + ' / ' + fmtStat(+m.st, m.g));
    });
    return c;
  }
  function trackCard(r, level, track) {
    var st = +r.s;
    var c = h('button', {type:'button', class:'eh-tc st' + st + (track ? ' prem' : '') + (+r.x ? ' ex' : '')});
    c.appendChild(h('small', {class:'eh-tct', text:TYPE[+r.t] || 'HADIAH'}));
    c.appendChild(art(+r.t, +r.m, r.it, 'tc'));
    c.appendChild(h('b', {class:'eh-tcv', text:r.n}));
    if (st === 2) c.appendChild(h('span', {class:'eh-tcok', html:ico('check')}));
    else if (st === 1) c.appendChild(h('span', {class:'eh-tcclaim', text:'KLAIM'}));
    else if (st === 0) c.appendChild(h('span', {class:'eh-tclock', html:ico('lock')}));
    if (+r.x) c.appendChild(h('span', {class:'eh-tcex', text:'EKSKLUSIF'}));
    c.addEventListener('click', function () {
      if (st === 1) act('claimlvl', level, track);
      else if (st === 3) note('Hadiah premium butuh Battle Pass Premium. Hubungi admin server.');
      else if (st === 0) note('Capai level ' + level + ' untuk membuka hadiah ini.');
      else note('Hadiah sudah diklaim.');
    });
    return c;
  }
  function renderBP(d) {
    if (tab === 1) return renderExclusive(d);
    var lvl = +d.lvl, max = +d.max, inLvl = lvl >= max ? +d.need : (+d.xp % +d.need);
    var page = h('div', {class:'eh-bp'});

    // kiri: kartu akun + misi mingguan
    var L = h('div', {class:'eh-bpl'});
    var acc = h('div', {class:'eh-acc'});
    var av = h('span', {class:'eh-av', html:ico('user')});
    if (+d.skin > 0) { var im = U.img('skin:' + d.skin, 'eh-avimg'); if (im) { im.addEventListener('error', function () { im.remove(); }); av.appendChild(im); } }
    acc.appendChild(av);
    acc.appendChild(h('b', {class:'eh-accn', text:String(d.name || 'Pemain').replace(/_/g, ' ')}));
    acc.appendChild(h('span', {class:'eh-acct' + (+d.prem ? ' prem' : ''), html:'TIPE AKUN : <b>' + (+d.prem ? 'PREMIUM' : 'STANDAR') + '</b>'}));
    L.appendChild(acc);
    L.appendChild(h('div', {class:'eh-mh'}, [h('b', {html:'MISI <em>MINGGUAN</em>'}), h('span', {class:'eh-mhs eh-wreset', text:'Reset ' + left(since(d.wreset, 'bp'))})]));
    var wl = h('div', {class:'eh-wlist'});
    d.weekly.forEach(function (m, i) { wl.appendChild(misCard(m, i, true, true)); });
    L.appendChild(wl);
    page.appendChild(L);

    // kanan: level + track Standar / Premium
    var Rt = h('div', {class:'eh-bpr'});
    var n = 0; d.lv.forEach(function (l) { if (+l.f.s === 1) n++; if (+l.p.s === 1) n++; });
    var head = h('div', {class:'eh-lvlrow'});
    var all = h('button', {type:'button', class:'eh-claimall' + (n ? ' on' : ''), html:ico('gift') + '<span>' + (n ? 'KLAIM SEMUA (' + n + ')' : 'SEMUA SUDAH DIKLAIM') + '</span>'});
    all.addEventListener('click', function () { if (n) act('claimall', 0, ''); else note('Belum ada hadiah yang bisa diklaim.'); });
    head.appendChild(all);
    head.appendChild(h('div', {class:'eh-lvltxt'}, [h('b', {html:'Level : <em>' + lvl + '</em>/' + max}), h('small', {html:'<b>' + num(inLvl) + '</b>/' + num(d.need) + ' XP'})]));
    Rt.appendChild(head);
    var xb = h('div', {class:'eh-xpbar'}); var xf = h('i'); xf.style.width = Math.min(100, inLvl / +d.need * 100) + '%'; xb.appendChild(xf);
    Rt.appendChild(xb);
    var tw = h('div', {class:'eh-tw' + (+d.prem ? ' premium' : '')});
    tw.appendChild(h('span', {class:'eh-rl std', text:'STANDAR'}));
    tw.appendChild(h('span', {class:'eh-rl pre', text:'PREMIUM'}));
    var cols = h('div', {class:'eh-tcols'});
    var focus = null;
    d.lv.forEach(function (l, i) {
      var level = i + 1;
      var col = h('div', {class:'eh-tcol' + (level <= lvl ? ' got' : '') + (level === lvl + 1 ? ' next' : '')});
      col.appendChild(h('span', {class:'eh-tlv', html:'<i></i>' + level + ' LVL<i></i>'}));
      col.appendChild(trackCard(l.f, level, 0));
      col.appendChild(trackCard(l.p, level, 1));
      cols.appendChild(col);
      if (!focus && (+l.f.s === 1 || (+d.prem && +l.p.s === 1))) focus = col;
    });
    tw.appendChild(cols);
    if (!+d.prem) {
      var lock = h('button', {type:'button', class:'eh-premlock', html:ico('crown') + '<span>PREMIUM</span>'});
      lock.addEventListener('click', function () { note('Battle Pass Premium diaktifkan oleh admin server. Hubungi admin untuk membeli.'); });
      tw.appendChild(lock);
    }
    var sc = h('div', {class:'eh-tscroll'}), sci = h('i'); sc.appendChild(sci);
    tw.appendChild(sc);
    Rt.appendChild(tw);
    page.appendChild(Rt);

    // bawah: misi harian
    var B = h('div', {class:'eh-bpd'});
    var now = new Date();
    B.appendChild(h('div', {class:'eh-mh'}, [h('b', {html:'MISI <em>HARIAN</em>'}),
      h('span', {class:'eh-mhs eh-dreset', text:now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() + ' • reset ' + left(since(d.dreset, 'bp'))})]));
    var dg = h('div', {class:'eh-dgrid'});
    d.daily.forEach(function (m, i) { dg.appendChild(misCard(m, i, false, false)); });
    B.appendChild(dg);
    page.appendChild(B);
    main.appendChild(page);

    function syncBar() {
      var w = cols.scrollWidth || 1;
      sci.style.width = Math.max(8, cols.clientWidth / w * 100) + '%';
      sci.style.left = (cols.scrollLeft / w * 100) + '%';
    }
    cols.addEventListener('scroll', function () { bpScroll = cols.scrollLeft; syncBar(); });
    requestAnimationFrame(function () {
      if (bpScroll != null) cols.scrollLeft = bpScroll;
      else {
        var target = focus || cols.children[Math.max(0, Math.min(lvl, cols.children.length - 1))];
        if (target) cols.scrollLeft = Math.max(0, target.offsetLeft - cols.clientWidth * 0.3);
      }
      syncBar();
    });
  }
  function renderExclusive(d) {
    main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {html:'ITEM <em>EKSKLUSIF</em>'}), h('span', {class:'eh-sub2', text:d.season + ' • hanya dari Battle Pass'})]));
    var grid = h('div', {class:'eh-grid'});
    d.lv.forEach(function (l, i) {
      [['f', 0], ['p', 1]].forEach(function (k) {
        var r = l[k[0]];
        if (!+r.x) return;
        var st = +r.s, c = h('div', {class:'eh-card ex st' + st});
        c.appendChild(h('span', {class:'eh-flag ' + (k[1] ? 'prem' : 'std'), text:k[1] ? 'PREMIUM' : 'STANDAR'}));
        c.appendChild(art(+r.t, +r.m, r.it, 'lg'));
        c.appendChild(h('b', {class:'eh-cn', text:r.n}));
        c.appendChild(h('small', {class:'eh-cs', text:(TYPE[+r.t] || 'Hadiah') + ' • Level ' + (i + 1)}));
        var b = h('button', {type:'button', class:'eh-btn sm' + (st === 1 ? '' : ' off'), html:st === 2 ? ico('check') + ' DIMILIKI' : st === 1 ? 'KLAIM' : ico('lock') + (st === 3 ? ' PREMIUM' : ' LV.' + (i + 1))});
        b.addEventListener('click', function () { if (st === 1) act('claimlvl', i + 1, k[1]); });
        c.appendChild(b);
        grid.appendChild(c);
      });
    });
    main.appendChild(grid);
    main.appendChild(h('div', {class:'eh-howxp', text:'Skin & aksesoris masuk ke Mall → Koleksi Saya (tekan PAKAI). Kendaraan dikirim ke dekatmu. XP: 5 per menit aktif, misi harian & mingguan, login +100.'}));
  }
  var bpScroll = null;

  /* ---------------------------------------------------------------- Mall */
  var BUNDLE = {1:'Nasi Goreng x5, Air Mineral x5, Bandage x3', 2:'Repair Kit x3, Tools Kit x1, Jerigen x1', 3:'Medkit x2, Bandage x5', 4:'$25.000 ke bank + Medkit x3 + Repair Kit x3'};
  function price(it) { return +it.cur ? coinTxt(it.p) : U.money(it.p); }
  function mallCard(it, d) {
    var c = h('div', {class:'eh-card' + (+it.f & 4 ? ' ex' : '') + (+it.own ? ' own' : '')});
    if (+it.f & 1) c.appendChild(h('span', {class:'eh-flag hot', text:'UNGGULAN'}));
    else if (+it.f & 2) c.appendChild(h('span', {class:'eh-flag new', text:'BARU'}));
    else if (+it.f & 4) c.appendChild(h('span', {class:'eh-flag exf', text:'EKSKLUSIF'}));
    c.appendChild(art(+it.t, +it.m, it.it, 'lg'));
    c.appendChild(h('b', {class:'eh-cn', text:it.n + (+it.t === 3 && +it.q > 1 ? ' x' + it.q : '')}));
    var sub = +it.t === 7 ? BUNDLE[+it.m] : +it.t === 6 ? 'Kendaraan pribadi' : +it.t === 4 ? 'Skin karakter' : +it.t === 5 ? 'Aksesoris' : 'Masuk ke tas';
    c.appendChild(h('small', {class:'eh-cs', text:sub || ''}));
    var p = h('span', {class:'eh-price' + (+it.cur ? ' coin' : ''), html:ico(+it.cur ? 'coin' : 'cash') + '<b>' + price(it) + '</b>'});
    c.appendChild(p);
    var b;
    if (+it.own) {
      b = h('button', {type:'button', class:'eh-btn sm alt', text:'PAKAI'});
      b.addEventListener('click', function () { act('wear', +it.m, +it.t); });
    } else {
      var can = +it.cur ? +d.coin >= +it.p : +d.bank >= +it.p;
      b = h('button', {type:'button', class:'eh-btn sm' + (can ? '' : ' off'), text:'BELI'});
      b.addEventListener('click', function () {
        if (!can) { note(+it.cur ? 'Eagle Coin tidak cukup.' : 'Saldo bank tidak cukup.'); return; }
        var body = h('div', {class:'eh-cbody'});
        body.appendChild(art(+it.t, +it.m, it.it, 'lg'));
        var tx = h('div', {class:'eh-ctext'});
        tx.appendChild(h('b', {text:it.n + (+it.t === 3 && +it.q > 1 ? ' x' + it.q : '')}));
        tx.appendChild(h('span', {text:'Harga: ' + price(it)}));
        tx.appendChild(h('span', {text:'Sisa saldo: ' + (+it.cur ? coinTxt(+d.coin - +it.p) : U.money(+d.bank - +it.p))}));
        tx.appendChild(h('small', {text:+it.t === 6 ? 'Kendaraan muncul di dekatmu (atau di dealer bila di dalam ruangan).' : +it.t === 4 || +it.t === 5 ? 'Langsung dipakai & tersimpan di Koleksi Saya.' : 'Barang langsung masuk ke tas.'}));
        body.appendChild(tx);
        confirmBox('Konfirmasi Pembelian', body, 'BELI', function () { act('buy', +it.id, ''); });
      });
    }
    c.appendChild(b);
    return c;
  }
  function renderMall(d) {
    if (tab === 8) return renderLog(6, 'Riwayat Pembelian', 'Belum ada pembelian.');
    if (tab === 7) {
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Koleksi Saya'}), h('span', {class:'eh-sub2', text:'Skin & aksesoris dari Mall dan Battle Pass'})]));
      if (!d.own || !d.own.length) { main.appendChild(h('div', {class:'eh-empty', text:'Koleksi masih kosong.'})); return; }
      var g = h('div', {class:'eh-grid'});
      d.own.forEach(function (o) {
        var c = h('div', {class:'eh-card own'});
        c.appendChild(art(+o.k, +o.m, '', 'lg'));
        c.appendChild(h('b', {class:'eh-cn', text:o.n}));
        c.appendChild(h('small', {class:'eh-cs', text:+o.k === 4 ? 'Skin' : 'Aksesoris'}));
        var b = h('button', {type:'button', class:'eh-btn sm alt' + (+o.on ? ' off' : ''), text:+o.on ? 'DIPAKAI' : 'PAKAI'});
        b.addEventListener('click', function () { if (!+o.on) act('wear', +o.m, +o.k); });
        c.appendChild(b);
        g.appendChild(c);
      });
      main.appendChild(g);
      main.appendChild(h('div', {class:'eh-howxp', text:'Aksesoris butuh slot kosong (maks 4). Lepas / atur posisi lewat menu Aksesoris.'}));
      return;
    }
    var list = d.it.filter(function (it) { return tab === 0 ? (+it.f & 1) || (+it.f & 4) : +it.c === tab; });
    var titles = ['Produk Unggulan', 'Pakaian', 'Aksesoris', 'Kendaraan', 'Kebutuhan Sehari-hari', 'Paket Hemat', 'Item Spesial (Eagle Coin)'];
    var hint = tab === 6 ? 'Dibeli dengan Eagle Coin' : tab === 0 ? 'Pilihan terbaik minggu ini' : 'Dibayar dari saldo bank';
    main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:titles[tab]}), h('span', {class:'eh-sub2', text:hint})]));
    var grid = h('div', {class:'eh-grid'});
    list.forEach(function (it) { grid.appendChild(mallCard(it, d)); });
    main.appendChild(grid);
  }
  function renderLog(kind, title, empty) {
    main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:title})]));
    var rows = logs[kind];
    if (!rows) {
      main.appendChild(h('div', {class:'eh-empty', text:'Memuat...'}));
      if (!logs['req' + kind] || Date.now() - logs['req' + kind] > 2500) {
        logs['req' + kind] = Date.now(); E.send('hub', 'log', kind, '');
        setTimeout(function () { if (cur && !logs[kind]) render(); }, 2700);
      }
      return;
    }
    if (!rows.length) { main.appendChild(h('div', {class:'eh-empty', text:empty})); return; }
    var KIND = {1:'Misi Harian', 2:'Misi Mingguan', 3:'Battle Pass', 4:'Login', 5:'Pencapaian', 6:'Mall', 7:'Event', 8:'Admin'};
    var t = h('div', {class:'eh-log'});
    rows.forEach(function (r) {
      t.appendChild(h('div', {class:'eh-logr'}, [h('span', {class:'eh-logk k' + r.k, text:KIND[+r.k] || '-'}), h('b', {text:r.t}), h('span', {class:'eh-logv', text:r.r}), h('small', {text:dateTxt(r.ts)})]));
    });
    main.appendChild(t);
  }

  /* ---------------------------------------------------------------- Activity */
  function statCard(icon, label, value, sub) {
    var c = h('div', {class:'eh-stat'});
    c.appendChild(h('span', {class:'eh-sti', html:ico(icon)}));
    c.appendChild(h('small', {text:label}));
    c.appendChild(h('b', {text:value}));
    if (sub) c.appendChild(h('em', {text:sub}));
    return c;
  }
  function triple(rows) {
    var t = h('div', {class:'eh-table'});
    t.appendChild(h('div', {class:'eh-tr th'}, [h('span', {text:''}), h('span', {text:'Hari ini'}), h('span', {text:'Minggu ini'}), h('span', {text:'Total'})]));
    rows.forEach(function (r) { t.appendChild(h('div', {class:'eh-tr'}, [h('span', {text:r[0]}), h('b', {text:r[1]}), h('b', {text:r[2]}), h('b', {text:r[3]})])); });
    return t;
  }
  function renderAct(d) {
    var T = d.today, W = d.week, A3 = d.total, L = d.login;
    if (tab === 0) {
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Aktivitas Hari Ini'}), h('span', {class:'eh-timer', html:ico('clock') + '<span>Reset dalam ' + left(since(L.reset, 'act')) + '</span>'})]));
      var g = h('div', {class:'eh-stats'});
      g.appendChild(statCard('clock', 'Waktu aktif', fmtStat(0, T.play)));
      g.appendChild(statCard('briefcase', 'Tugas kerja', num(T.jobs), U.money(T.earn)));
      g.appendChild(statCard('car', 'Berkendara', fmtStat(3, T.drive)));
      g.appendChild(statCard('chat', 'Pesan & telepon', num(T.msg) + ' / ' + num(T.call)));
      g.appendChild(statCard('flag', 'Misi selesai', num(T.daily + T.weekly)));
      g.appendChild(statCard('mall', 'Belanja Mall', num(T.mall)));
      main.appendChild(g);
      var lg = h('div', {class:'eh-banner' + (+L.can ? ' ready' : '')});
      lg.appendChild(h('span', {class:'eh-sti', html:ico('gift')}));
      lg.appendChild(h('div', {}, [h('b', {text:+L.can ? 'Hadiah login hari ini siap diambil!' : 'Hadiah login hari ini sudah diambil'}), h('small', {text:'Streak ' + L.streak + ' hari • kembali besok untuk hadiah berikutnya'})]));
      var b = h('button', {type:'button', class:'eh-btn sm' + (+L.can ? '' : ' off'), text:+L.can ? 'AMBIL' : 'BESOK'});
      b.addEventListener('click', function () { if (+L.can) act('login', 0, ''); });
      lg.appendChild(b);
      main.appendChild(lg);
      return;
    }
    if (tab === 1) {
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Hadiah Login 7 Hari'}), h('span', {class:'eh-sub2', text:'Streak ' + L.streak + ' • terbaik ' + L.best + ' • total ' + L.total + ' hari'})]));
      var cal = h('div', {class:'eh-cal'});
      L.cal.forEach(function (c, i) {
        var done = +L.can ? i < +L.day && +L.streak > 0 : i <= +L.day && +L.streak > 0;
        var today = +L.can && i === +L.day;
        var el = h('div', {class:'eh-day' + (done ? ' done' : '') + (today ? ' today' : '') + (i === 6 ? ' big' : '')});
        el.appendChild(h('small', {text:'HARI ' + (i + 1)}));
        el.appendChild(art(+c.t, +c.m, c.it, 'md'));
        el.appendChild(h('b', {text:c.n}));
        if (done) el.appendChild(h('span', {class:'eh-dayok', html:ico('check')}));
        cal.appendChild(el);
      });
      main.appendChild(cal);
      var row = h('div', {class:'eh-loginrow'});
      row.appendChild(h('span', {class:'eh-timer', html:ico('clock') + '<span>' + (+L.can ? 'Ambil sebelum ' : 'Hadiah berikutnya dalam ') + left(since(L.reset, 'act')) + '</span>'}));
      var b2 = h('button', {type:'button', class:'eh-btn' + (+L.can ? '' : ' off'), text:+L.can ? 'AMBIL HADIAH HARI INI' : 'SUDAH DIAMBIL'});
      b2.addEventListener('click', function () { if (+L.can) act('login', 0, ''); });
      row.appendChild(b2);
      main.appendChild(row);
      main.appendChild(h('div', {class:'eh-howxp', text:'Login tiap hari tanpa putus untuk sampai Hari 7 (10 Eagle Coin). Lewat satu hari = mulai dari Hari 1 lagi. Tiap klaim +100 XP Battle Pass.'}));
      return;
    }
    if (tab === 2) {
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Waktu Bermain'})]));
      var big = h('div', {class:'eh-bigtime'});
      big.appendChild(h('b', {text:num(d.play.h)}));
      big.appendChild(h('span', {text:'jam ' + (+d.play.m || 0) + ' menit total bermain'}));
      main.appendChild(big);
      var g2 = h('div', {class:'eh-stats'});
      g2.appendChild(statCard('clock', 'Aktif hari ini', fmtStat(0, T.play)));
      g2.appendChild(statCard('calendar', 'Aktif minggu ini', (W.play / 60).toFixed(1).replace('.', ',') + ' jam'));
      g2.appendChild(statCard('chart', 'Tercatat sejak Hub', (A3.play / 60).toFixed(1).replace('.', ',') + ' jam'));
      main.appendChild(g2);
      main.appendChild(h('div', {class:'eh-howxp', text:'Waktu aktif hanya dihitung saat tidak AFK. Setiap menit aktif memberi 5 XP Battle Pass.'}));
      return;
    }
    if (tab === 3) {
      var got = d.ach.filter(function (a) { return +a.s === 2; }).length;
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Pencapaian'}), h('span', {class:'eh-sub2', text:got + ' / ' + d.ach.length + ' diklaim'})]));
      var list = h('div', {class:'eh-list'});
      d.ach.forEach(function (a, i) {
        var st = +a.s, row = h('div', {class:'eh-mis' + (st === 2 ? ' claimed' : st === 1 ? ' ready' : '')});
        row.appendChild(h('span', {class:'eh-misi', html:ico('trophy')}));
        var mid = h('div', {class:'eh-mism'});
        mid.appendChild(h('b', {text:a.t}));
        mid.appendChild(h('small', {class:'eh-desc', text:a.d}));
        var pb = h('div', {class:'eh-pbar'}); var f = h('i'); f.style.width = Math.min(100, +a.p / Math.max(1, +a.g) * 100) + '%'; pb.appendChild(f);
        mid.appendChild(pb);
        mid.appendChild(h('small', {text:num(a.p) + ' / ' + num(a.g)}));
        row.appendChild(mid);
        row.appendChild(h('span', {class:'eh-xpb', text:a.r}));
        var b3 = h('button', {type:'button', class:'eh-btn sm' + (st === 1 ? '' : ' off'), html:st === 2 ? ico('check') : st === 1 ? 'KLAIM' : 'PROSES'});
        b3.addEventListener('click', function () { if (st === 1) act('ach', i, ''); });
        row.appendChild(b3);
        list.appendChild(row);
      });
      main.appendChild(list);
      return;
    }
    if (tab === 4) return renderLog(1, 'Riwayat Misi & Hadiah', 'Belum ada misi yang diklaim.');
    if (tab === 5) {
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Aktivitas Kerja'})]));
      main.appendChild(triple([['Tugas selesai', num(T.jobs), num(W.jobs), num(A3.jobs)], ['Penghasilan', U.money(T.earn), U.money(W.earn), U.money(A3.earn)], ['Gaji dicairkan', num(T.pay), num(W.pay), num(A3.pay)]]));
      main.appendChild(h('div', {class:'eh-sechead sm'}, [h('b', {text:'Per Pekerjaan'})]));
      if (!jobs) {
        main.appendChild(h('div', {class:'eh-empty', text:'Memuat...'}));
        if (!logs.reqJobs || Date.now() - logs.reqJobs > 2500) {
          logs.reqJobs = Date.now(); E.send('hub', 'jobs', 0, '');
          setTimeout(function () { if (cur === 'act' && !jobs) render(); }, 2700);
        }
        return;
      }
      if (!jobs.length) { main.appendChild(h('div', {class:'eh-empty', text:'Belum ada pekerjaan yang tercatat. Ambil pekerjaan di Kantor Pekerjaan / sidejob.'})); return; }
      var mx = Math.max.apply(null, jobs.map(function (j) { return +j.c; }).concat([1]));
      var jl = h('div', {class:'eh-list'});
      jobs.forEach(function (j) {
        var r = h('div', {class:'eh-jrow'});
        r.appendChild(h('span', {class:'eh-misi', html:ico('briefcase')}));
        var m = h('div', {class:'eh-mism'});
        m.appendChild(h('b', {text:j.j}));
        var pb = h('div', {class:'eh-pbar'}); var f = h('i'); f.style.width = (+j.c / mx * 100) + '%'; pb.appendChild(f); m.appendChild(pb);
        m.appendChild(h('small', {text:num(j.c) + ' tugas'}));
        r.appendChild(m);
        r.appendChild(h('span', {class:'eh-xpb', text:U.money(j.e)}));
        jl.appendChild(r);
      });
      main.appendChild(jl);
      return;
    }
    if (tab === 6) {
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Aktivitas Sosial'})]));
      main.appendChild(triple([['Pesan terkirim', num(T.msg), num(W.msg), num(A3.msg)], ['Telepon tersambung', num(T.call), num(W.call), num(A3.call)], ['Postingan sosial', num(T.post), num(W.post), num(A3.post)]]));
      main.appendChild(h('div', {class:'eh-howxp', text:'Dihitung dari aplikasi Pesan, WhatsApp, Telepon, dan media sosial di HP.'}));
      return;
    }
    if (tab === 7) {
      main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:'Aktivitas Event'})]));
      var g3 = h('div', {class:'eh-stats'});
      g3.appendChild(statCard('flag', 'Event hari ini', num(T.event)));
      g3.appendChild(statCard('calendar', 'Event minggu ini', num(W.event)));
      g3.appendChild(statCard('trophy', 'Total event diikuti', num(A3.event)));
      main.appendChild(g3);
      renderLog(7, 'Riwayat Event', 'Belum pernah ikut event. Pantau pengumuman admin!');
      return;
    }
    var s = d.stat;
    main.appendChild(h('div', {class:'eh-sechead'}, [h('b', {text:String(s.name || '').replace(/_/g, ' ')}), h('span', {class:'eh-sub2', text:'Statistik karakter'})]));
    var g4 = h('div', {class:'eh-stats'});
    g4.appendChild(statCard('user', 'Level karakter', num(s.lvl)));
    g4.appendChild(statCard('clock', 'Jam bermain', num(s.hours) + ' jam'));
    g4.appendChild(statCard('cash', 'Uang di saku', U.money(s.cash)));
    g4.appendChild(statCard('home', 'Saldo bank', U.money(s.bank)));
    g4.appendChild(statCard('coin', 'Eagle Coin', num(s.coin)));
    g4.appendChild(statCard('car', 'Kendaraan', num(s.veh)));
    g4.appendChild(statCard('bp', 'Battle Pass', 'Lv.' + s.bp, +s.prem ? 'Premium' : 'Free'));
    g4.appendChild(statCard('trophy', 'Pencapaian', s.achN + ' / ' + s.achT));
    g4.appendChild(statCard('flag', 'Misi selesai', num(A3.daily + A3.weekly)));
    g4.appendChild(statCard('briefcase', 'Tugas kerja', num(A3.jobs), U.money(A3.earn)));
    g4.appendChild(statCard('car', 'Total berkendara', fmtStat(3, A3.drive)));
    g4.appendChild(statCard('mall', 'Belanja Mall', num(A3.mall) + ' kali'));
    main.appendChild(g4);
  }

  /* ---------------------------------------------------------------- Manual Book */
  var MAN = [
    {t:'Panduan Bermain Roleplay', p:'Roleplay (RP) berarti memerankan karakter seperti kehidupan nyata. Semua yang dilakukan karakter harus masuk akal dan menghormati pemain lain.', s:[
      ['Dasar', ['Buat karakter dengan nama Nama_Belakang yang wajar.', 'Pisahkan IC (In Character, di dalam cerita) dan OOC (Out Of Character, di luar cerita).', 'Gunakan /me untuk aksi, /do untuk keadaan sekitar, /b untuk obrolan OOC lokal.', 'Hargai alur cerita pemain lain: beri kesempatan mereka merespons.']],
      ['Langkah pertama', ['Ambil hadiah login di menu ACTIVITY.', 'Cari pekerjaan pertama (lihat bab Pekerjaan) untuk modal awal.', 'Urus KTP di balai kota agar bisa memakai banyak layanan kota.', 'Buka HP (ikon PHONE) untuk GPS, pesan, bank, dan aplikasi lain.']],
      ['Istilah penting', ['Metagaming: memakai info OOC di dalam cerita (dilarang).', 'Powergaming: memaksakan aksi tanpa memberi kesempatan lawan (dilarang).', 'Fear RP: karakter wajar takut saat nyawanya terancam.', 'NLR (New Life Rule): setelah pingsan/mati, lupakan kejadian yang membuatmu jatuh.']]]},
    {t:'Panduan Pekerjaan', p:'Pekerjaan adalah sumber uang utama. Setiap tugas kerja yang dibayar ikut dihitung di Activity dan misi Battle Pass.', s:[
      ['Memulai', ['Gunakan /joblist dan /carakerja atau /panduanjob untuk melihat pekerjaan.', 'Pekerjaan kota (City Jobs) bisa diambil lewat /kerjakota di lokasi kerja.', 'Sidejob (bus, kurir, penyapu jalan, sampah, forklift, kargo, dll) diambil di titik kerja masing-masing.', 'Berhenti kerja dengan /berhentikerja.']],
      ['Gaji', ['Sebagian pekerjaan membayar langsung, sebagian masuk ke Paycheck.', 'Cairkan paycheck ke saku atau rekening bank.', 'Hasil tambang, kebun, ladang, dan nelayan dijual di Pasar.']],
      ['Tips', ['Kerjakan misi harian “Selesaikan 5 tugas kerja” untuk XP tambahan.', 'Pantau riwayat & penghasilanmu di ACTIVITY → Aktivitas Kerja.']]]},
    {t:'Panduan Kendaraan', p:'Kendaraan pribadi bisa dibeli di dealer/showroom atau lewat EAGLE MALL.', s:[
      ['Dasar', ['/myv untuk melihat dan mengatur kendaraan milikmu.', 'Pakai /seatbelt saat berkendara.', 'Isi bensin di SPBU sebelum habis; perbaiki kendaraan di bengkel atau pakai Repair Kit.']],
      ['Kepemilikan', ['Jumlah kendaraan dibatasi; rumah menambah slot kendaraan.', 'Kendaraan dari Mall muncul di dekatmu (atau di dealer bila kamu di dalam ruangan).', 'Jangan meninggalkan kendaraan sembarangan di jalan.']],
      ['Lalu lintas', ['Patuhi aturan lalu lintas seperti di dunia nyata.', 'Menabrak pejalan kaki tanpa alasan RP termasuk pelanggaran.']]]},
    {t:'Panduan Inventory', p:'Tas menampung item dengan batas berat. Enam slot pertama adalah quickbar (bar cepat 1–6) di layar.', s:[
      ['Menggunakan tas', ['Buka lewat ikon INVENTORY di bar atas.', 'Ketuk item untuk memilih, ketuk dua kali / USE untuk memakai.', 'Seret item antar slot untuk menyusun; seret ke panel Ground untuk membuang.', 'Berikan item ke pemain terdekat lewat tombol GIVE ITEM.']],
      ['Senjata', ['Senjata tampil di tas bersama item, lengkap dengan jumlah peluru.', 'Seret senjata ke slot 1–6 atau tekan “PASANG KE” untuk mengatur quickbar.', 'Seret senjata ke Ground (atau tombol BUANG) untuk menaruhnya di tanah.', 'Susunan quickbar senjata tersimpan otomatis.']],
      ['Berat', ['Jika tas terlalu berat, kamu tidak bisa menerima item baru.', 'Simpan barang di bagasi kendaraan atau rumah.']]]},
    {t:'Panduan Bisnis & Properti', p:'Properti memberi tempat tinggal, slot kendaraan, dan penghasilan.', s:[
      ['Rumah', ['Lihat rumah yang dijual di kota dan beli lewat agen/titik rumah.', 'Rumah menambah slot kendaraan pribadi dan tempat penyimpanan.', 'Bayar pajak tepat waktu agar properti tidak disita.']],
      ['Bisnis', ['Bisnis (warung, toko, bengkel, dll) bisa dibeli dan dikelola pemilik.', 'Isi stok agar pelanggan bisa berbelanja.', 'Pendapatan bisnis masuk ke brankas bisnis.']],
      ['Tips', ['Simpan uang di bank, bukan di saku.', 'Kerja sama dengan pemain lain untuk mengembangkan bisnis.']]]},
    {t:'Panduan Organisasi & Faction', p:'Faction adalah organisasi resmi (polisi, medis, pemerintah, mekanik, dll). Families/geng adalah organisasi tidak resmi.', s:[
      ['Faction resmi', ['Bergabung melalui proses rekrutmen di dalam cerita (IC).', 'Ikuti struktur pangkat dan SOP faction.', 'Gunakan seragam dan peralatan faction hanya saat bertugas.']],
      ['Families', ['Families dibentuk lewat pengajuan ke admin.', 'Wilayah, konflik, dan aliansi harus dimainkan dengan RP yang baik.', 'Perang antar families wajib mengikuti aturan server.']],
      ['Etika', ['Jangan membocorkan info internal organisasi secara OOC.', 'Pemimpin bertanggung jawab atas perilaku anggotanya.']]]},
    {t:'Peraturan Server', p:'Peraturan dibuat agar semua pemain nyaman. Pelanggaran dapat dikenai peringatan, jail, kick, atau ban.', s:[
      ['Dilarang', ['Cheat, mod ilegal, bug abuse, dan eksploit.', 'Deathmatch (DM): menyerang tanpa alasan RP.', 'Metagaming dan powergaming.', 'Car ramming / vehicle DM tanpa alasan RP.', 'Menghina SARA, pelecehan, dan spam.', 'Jual beli akun / item dengan uang asli di luar jalur resmi.']],
      ['Wajib', ['Menghormati staff dan pemain lain.', 'Melaporkan bug & pelanggaran lewat /report.', 'Memakai nama karakter yang wajar.']],
      ['Bantuan', ['Pertanyaan umum: /ask.', 'Laporan pelanggaran / bug: /report.', 'Bukti (rekaman / screenshot) sangat membantu staff.']]]},
    {t:'Panduan Kriminalitas', p:'Kriminalitas boleh dimainkan selama memberi pengalaman RP yang baik bagi semua pihak.', s:[
      ['Aturan dasar', ['Selalu punya alasan dan alur cerita (bukan sekadar mencari uang cepat).', 'Perhatikan batas jumlah pelaku dan polisi sesuai aturan server.', 'Korban berhak melakukan RP takut / negosiasi; jangan buru-buru menembak.']],
      ['Perampokan & aksi', ['Gunakan topeng (/mask) bila ingin menyembunyikan identitas.', 'Sandera dan negosiasi dimainkan dengan wajar.', 'Barang ilegal dan senjata ilegal punya risiko ditangkap.']],
      ['Saat ditangkap', ['Ikuti proses RP polisi (borgol, interogasi, penjara).', 'Jangan keluar dari game untuk menghindari hukuman (combat log).']]]},
    {t:'Panduan Komunikasi', p:'Komunikasi yang jelas membuat RP lebih hidup.', s:[
      ['Chat', ['Chat biasa = bicara IC di sekitar.', '/me aksi, /do keadaan, /b OOC lokal.', 'Gunakan bahasa yang sopan dan mudah dimengerti.']],
      ['HP', ['Telepon, Pesan, dan WhatsApp untuk menghubungi pemain lain.', 'Media sosial di HP untuk postingan, iklan, dan berita.', 'Sinyal dan baterai mempengaruhi HP; isi daya bila perlu.']],
      ['Radio', ['Faction memakai radio untuk koordinasi.', 'Jaga frekuensi tetap rapi dan tidak spam.']]]},
    {t:'FAQ (Pertanyaan Umum)', p:'Jawaban singkat untuk pertanyaan yang sering muncul.', s:[
      ['Battle Pass', ['Bagaimana dapat XP? Main aktif (5 XP/menit), misi harian & mingguan, dan hadiah login.', 'Premium dari mana? Diaktifkan oleh admin.', 'Kapan season berakhir? Lihat timer di menu Battle Pass.']],
      ['Eagle Coin', ['Eagle Coin didapat dari Battle Pass, hadiah login, pencapaian, dan admin.', 'Dipakai untuk Item Spesial dan paket tertentu di Mall.', 'Cek saldo dengan /coin.']],
      ['Lain-lain', ['Tidak bisa membuka tas? Pastikan tidak pingsan dan tidak di dalam menu lain.', 'Barang Mall tidak masuk? Pastikan tas tidak penuh / slot aksesoris kosong.', 'Masih bingung? Tanyakan lewat /ask.']]]}
  ];
  function renderManual() {
    var m = MAN[tab] || MAN[0];
    var art = h('article', {class:'eh-man'});
    art.appendChild(h('h2', {text:m.t}));
    art.appendChild(h('p', {class:'eh-lead', text:m.p}));
    m.s.forEach(function (sec) {
      var box = h('div', {class:'eh-mansec'});
      box.appendChild(h('h3', {text:sec[0]}));
      var ul = h('ul');
      sec[1].forEach(function (li) { ul.appendChild(h('li', {text:li})); });
      box.appendChild(ul);
      art.appendChild(box);
    });
    main.appendChild(art);
  }

  /* ---------------------------------------------------------------- event dari server */
  E.on('hubbar', function (d) {
    if (!d || typeof d !== 'object') return;
    bar.show = +d.show || 0; bar.bp = +d.bp || 0; bar.act = +d.act || 0; bar.coin = +d.coin || 0;
    if (!bar.show && cur) close();
    renderBar();
  });
  E.on('hub', function (d) {
    if (!d || typeof d !== 'object') return;
    setBusy(false);
    if (d.sec === 'log') { logs[+d.kind] = d.rows || []; logs['req' + d.kind] = 0; if (cur) render(); return; }
    if (d.sec === 'jobs') { jobs = d.rows || []; logs.reqJobs = 0; if (cur === 'act') render(); return; }
    if (!SEC[d.sec]) return;
    D[d.sec] = d;
    recvAt[d.sec] = Date.now();
    // riwayat bisa berubah sesudah klaim / beli
    if (d.sec === 'mall') logs[6] = null;
    if (d.sec === 'act' || d.sec === 'bp') { logs[1] = null; jobs = jobs && cur === 'act' && tab === 5 ? jobs : null; }
    if (cur === d.sec) render();
  });
  // timer berjalan
  setInterval(function () {
    if (!cur || cur === 'man' || !modal.hidden) return;
    var d = D[cur];
    if (!d) return;
    if (cur === 'bp') {
      var rb = $('.eh-remain b'); if (rb) rb.textContent = shortLeft(since(d.left, 'bp'));
      var wr = main.querySelector('.eh-wreset'); if (wr) wr.textContent = 'Reset ' + left(since(d.wreset, 'bp'));
      var dr = main.querySelector('.eh-dreset');
      if (dr) { var nw = new Date(); dr.textContent = nw.getDate() + '/' + (nw.getMonth() + 1) + '/' + nw.getFullYear() + ' • reset ' + left(since(d.dreset, 'bp')); }
    } else if (cur === 'act') {
      var t = main.querySelector('.eh-timer span');
      if (t) t.textContent = (tab === 1 ? (+d.login.can ? 'Ambil sebelum ' : 'Hadiah berikutnya dalam ') : 'Reset dalam ') + left(since(d.login.reset, 'act'));
    }
  }, 1000);

  window.EAGLEHub = {open:open, close:close, state:function () { return {bar:bar, cur:cur, tab:tab, D:D}; }};
  renderBar();
  E.done('hub');
})();
