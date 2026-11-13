/* EAGLE FV menu (v10): gaya menu penampilan seperti contoh FiveM.
   Kartu kategori di kanan (judul, keterangan, dua stepper "angka / total"), rel ikon bulat di kiri panel,
   petunjuk kontrol kiri atas, putar kamera atas tengah, tombol bulat kiri bawah, tombol SIMPAN hijau bawah tengah.
   Tanpa gambar: ikon SVG di dalam kode, warna dari CSS. Dipakai look.js (penampilan) dan vehicle_kit.js (stiker). */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, h = U.h;
  var S = ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var SVG = {
    arrowL: '<svg' + S + '><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    arrowR: '<svg' + S + '><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    person: '<svg' + S + '><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    shirt: '<svg' + S + '><path d="M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3c-.6 1.8-2.2 3-4 3s-3.4-1.2-4-3Z"/></svg>',
    scissors: '<svg' + S + '><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/></svg>',
    glasses: '<svg' + S + '><circle cx="6.5" cy="14" r="3.5"/><circle cx="17.5" cy="14" r="3.5"/><path d="M10 14h4M3 14l2-7h2M21 14l-2-7h-2"/></svg>',
    pen: '<svg' + S + '><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    heart: '<svg' + S + '><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    face: '<svg' + S + '><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M8.5 15c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/></svg>',
    legs: '<svg' + S + '><path d="M9 3v8l-2 10M15 3v8l2 10M9 11h6"/></svg>',
    body: '<svg' + S + '><circle cx="12" cy="4" r="2"/><path d="M12 7v7M7 9h10M12 14l-3 7M12 14l3 7"/></svg>',
    dice: '<svg' + S + '><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/></svg>',
    reset: '<svg' + S + '><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    store: '<svg' + S + '><path d="M4 9h16l-1 11H5L4 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/></svg>',
    wrench: '<svg' + S + '><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z"/></svg>',
    sticker: '<svg' + S + '><path d="M15 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h7l8-8V6a3 3 0 0 0-3-3h-3Z"/><path d="M13 21v-5a3 3 0 0 1 3-3h5"/></svg>',
    box: '<svg' + S + '><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    engine: '<svg' + S + '><path d="M4 10h3l2-3h6v3h3l2 2v4h-2v2h-4l-2-2H7l-1-2H4v-4Z"/></svg>',
    cam: '<svg' + S + '><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    layers: '<svg' + S + '><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M2 13l10 5 10-5"/></svg>',
    close: '<svg' + S + '><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };
  function ico(name) { return h('span', { class: 'fv-ico', html: SVG[name] || U.icon(name) }); }

  // Tombol panah bulat. opts.hold: tahan = berulang (mis. posisi stiker, tinggi badan).
  function arrow(dir, fn, opts) {
    var b = h('button', { type: 'button', class: 'fv-arrow', 'aria-label': dir < 0 ? 'Sebelumnya' : 'Berikutnya' }, ico(dir < 0 ? 'arrowL' : 'arrowR'));
    if (opts && opts.hold) {
      var t1 = 0, t2 = 0;
      var stop = function () { var was = t1 || t2; clearTimeout(t1); clearInterval(t2); t1 = t2 = 0; if (was && opts.release) opts.release(); };
      b.addEventListener('pointerdown', function (e) {
        if (b.disabled) return;
        e.preventDefault(); stop(); fn(dir);
        t1 = setTimeout(function () { t2 = setInterval(function () { if (b.disabled || !b.isConnected) return stop(); fn(dir); }, opts.every || 70); }, 380);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { b.addEventListener(n, stop); });
    } else b.addEventListener('click', function () { if (!b.disabled) fn(dir); });
    return b;
  }

  // Stepper "15 / 206" + label kecil (Jenis / Warna). o: {cur, total, label, dot, fn(dir), hold, every, release, disabled, off}
  function stepper(o) {
    var val = h('div', { class: 'fv-val' }, [h('b', { text: String(o.cur) }), o.total != null ? h('span', { text: ' / ' + o.total }) : null]);
    var num = h('div', { class: 'fv-num' }, [val, h('small', null, [o.dot ? h('i', { class: 'fv-dot', style: 'background:' + o.dot }) : null, h('span', { text: o.label || '' })])]);
    var l = arrow(-1, o.fn, o), r = arrow(1, o.fn, o);
    if (o.disabled) { l.disabled = true; r.disabled = true; }
    return h('div', { class: 'fv-step' + (o.off ? ' off' : '') }, [l, num, r]);
  }

  // Kartu kategori. o: {title, tag, tagCls, action, desc, steps[], extra[], cls}
  function card(o) {
    return h('section', { class: 'fv-card' + (o.cls ? ' ' + o.cls : '') }, [
      h('header', { class: 'fv-card-h' }, [h('b', { text: o.title }), o.tag ? h('span', { class: 'fv-tag' + (o.tagCls ? ' ' + o.tagCls : ''), text: o.tag }) : null, o.action || null]),
      o.desc ? h('p', { class: 'fv-desc', text: o.desc }) : null,
      o.steps && o.steps.length ? h('div', { class: 'fv-steps' + (o.steps.length === 1 ? ' one' : '') }, o.steps) : null,
      o.extra && o.extra.length ? h('div', { class: 'fv-extra' }, o.extra) : null
    ]);
  }
  function chip(text, fn, cls) {
    var b = h('button', { type: 'button', class: 'fv-chip' + (cls ? ' ' + cls : ''), text: text });
    b.addEventListener('click', function (e) { e.stopPropagation(); if (!b.disabled) fn(); });
    return b;
  }
  // Rel ikon bulat (tab). items: [{icon, t}]
  function rail(items, active, fn) {
    return h('nav', { class: 'fv-rail', 'data-touch': '1', 'aria-label': 'Kategori' }, items.map(function (it, i) {
      var b = h('button', { type: 'button', class: 'fv-rail-b' + (i === active ? ' on' : ''), 'aria-label': it.t, title: it.t, 'aria-pressed': i === active ? 'true' : 'false' }, ico(it.icon));
      b.addEventListener('click', function () { if (!b.disabled) fn(i); });
      return b;
    }));
  }
  // Petunjuk kiri atas, dua kolom. rows: [[tombol, teks], ...]
  function hints(rows, title) {
    var half = Math.ceil(rows.length / 2);
    function col(list) {
      return h('div', { class: 'fv-hcol' }, list.map(function (r) { return h('div', { class: 'fv-hint' }, [h('kbd', { text: r[0] }), h('span', { text: r[1] })]); }));
    }
    return h('div', { class: 'fv-hints', 'aria-hidden': 'true' }, [
      title ? h('div', { class: 'fv-title' }, [h('small', { text: title[0] }), h('b', { text: title[1] })]) : null,
      h('div', { class: 'fv-hrow' }, [col(rows.slice(0, half)), col(rows.slice(half))])]);
  }
  function topbar(label, fn) {
    return h('div', { class: 'fv-top', 'data-touch': '1' }, [arrow(-1, fn), h('span', { text: label }), arrow(1, fn)]);
  }
  // Tombol bulat kiri bawah. items: [{icon, t, label, fn, on, cls}]
  function poses(items) {
    return h('div', { class: 'fv-poses', 'data-touch': '1' }, items.filter(Boolean).map(function (it) {
      var b = h('button', { type: 'button', class: 'fv-pose' + (it.on ? ' on' : '') + (it.label ? ' wide' : '') + (it.cls ? ' ' + it.cls : ''), 'aria-label': it.t, title: it.t },
        [ico(it.icon), it.label ? h('span', { class: 'fv-pose-t', text: it.label }) : null]);
      b.addEventListener('click', function () { if (!b.disabled) it.fn(); });
      return b;
    }));
  }
  // Tombol SIMPAN hijau + batal. o: {status, error, label, fn, disabled, cancel, cancelFn, extra}
  function savebar(o) {
    var go = h('button', { type: 'button', class: 'fv-save', text: o.label || 'SIMPAN' });
    go.disabled = !!o.disabled;
    go.addEventListener('click', function () { if (!go.disabled) o.fn(); });
    var row = [];
    if (o.cancel) {
      var c = h('button', { type: 'button', class: 'fv-ghost', text: o.cancel });
      c.addEventListener('click', function () { if (!c.disabled) o.cancelFn(); });
      row.push(c);
    }
    row.push(go);
    return h('footer', { class: 'fv-savebar', 'data-touch': '1' }, [
      o.status || o.error ? h('p', { class: 'fv-status' + (o.error ? ' bad' : ''), role: 'status', text: o.error || o.status }) : null,
      o.extra || null,
      h('div', { class: 'fv-save-row' }, row)]);
  }
  window.FV = { ico: ico, arrow: arrow, stepper: stepper, card: card, chip: chip, rail: rail, hints: hints, topbar: topbar, poses: poses, savebar: savebar };
  if (E && E.done) E.done('fv_menu');
})();
