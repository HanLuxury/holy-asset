/* EAGLE CITY JOBS - job mini game di Liberty City + Vice City.
   Server: SERVER/jobs/cityjobs/cityjobs.inc (event "cjob", aksi view "cjob").
   Mini game memakai seed dari server; hasil dikirim: result, skor 0..100, seed. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;
  var h = U.h;
  var layer = U.layer('cityjoblayer');
  var wrap = h('section', {id: 'eagle-cityjob', class: 'panel-wrap cj-wrap', 'aria-hidden': 'true'});
  var hud = h('div', {class: 'cj-hud', hidden: true});
  layer.appendChild(wrap);
  layer.appendChild(hud);
  var game = null;          // running mini game {stop()}
  var lastHud = null;       // last HUD state (action label)
  var finishing = false;    // result message on screen
  var ICON = {fisher: '🎣', pizza: '🍕', port: '🏗️', mechanic: '🔧', electric: '⚡', taxi: '🚕', trash: '♻️'};
  var KEYS = ['fisher', 'pizza', 'port', 'mechanic', 'electric', 'taxi', 'trash'];

  function send(action, index, text) { E.send('cjob', action, index == null ? 0 : index, text == null ? '' : String(text)); }
  function money(v) { return '$' + (+v || 0).toLocaleString('id-ID'); }
  function rng(seed) {                         // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, r) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }
  function btn(label, cls, fn) { return h('button', {type: 'button', class: 'cj-btn ' + (cls || ''), text: label, onclick: fn}); }

  function openWrap(node) {
    stopGame();
    wrap.replaceChildren(node);
    wrap.classList.add('on'); wrap.setAttribute('aria-hidden', 'false'); wrap.setAttribute('data-touch', '');
    E.touch();
  }
  function closeWrap(notify) {
    stopGame();
    if (!wrap.classList.contains('on')) return;
    wrap.classList.remove('on'); wrap.setAttribute('aria-hidden', 'true'); wrap.removeAttribute('data-touch');
    wrap.replaceChildren();
    if (notify) send('close');
    E.touch();
  }
  function stopGame() { if (game && game.stop) game.stop(); game = null; }

  /* ---------------- board ---------------- */
  function board(d) {
    var key = KEYS[d.job] || 'fisher';
    var card = h('div', {class: 'cj-card cj-board'}, [
      h('div', {class: 'cj-head'}, [
        h('span', {class: 'cj-ico', text: ICON[key]}),
        h('div', {}, [h('div', {class: 'cj-title', text: d.name}), h('div', {class: 'cj-sub', text: 'Job Kota · ' + d.city})]),
        btn('✕', 'cj-x', function () { closeWrap(true); })
      ]),
      h('p', {class: 'cj-desc', text: d.desc}),
      h('div', {class: 'cj-stats'}, [
        h('div', {}, [h('b', {text: d.pay ? money(d.pay) : 'Argo'}), h('span', {text: 'per tugas'})]),
        h('div', {}, [h('b', {text: String(d.done || 0)}), h('span', {text: 'tugas shift ini'})]),
        h('div', {}, [h('b', {text: money(d.earned)}), h('span', {text: 'pendapatan'})])
      ]),
      d.busy ? h('p', {class: 'cj-warn', text: 'Kamu sedang job kota lain. Berhenti dulu.'}) : null,
      h('div', {class: 'cj-row'}, d.working
        ? [btn('Berhenti kerja', 'red', function () { send('stop'); closeWrap(false); })]
        : [btn(d.busy ? 'Berhenti job lain' : 'Mulai kerja', 'go', function () {
            if (d.busy) { send('stop'); closeWrap(false); return; }
            send('start', d.job); })])
    ]);
    openWrap(card);
  }

  /* ---------------- hud ---------------- */
  function showHud(d) {
    var key = KEYS[d.job] || 'fisher';
    hud.replaceChildren(
      h('div', {class: 'cj-hud-top'}, [
        h('span', {class: 'cj-ico sm', text: ICON[key]}),
        h('div', {class: 'cj-hud-name'}, [h('b', {text: d.name}), h('small', {text: d.city})]),
        h('button', {type: 'button', class: 'cj-hud-stop', text: '■', title: 'Berhenti', onclick: function () { send('stop'); }})
      ]),
      h('div', {class: 'cj-hud-task', text: d.task || ''}),
      h('div', {class: 'cj-hud-meta', text: (d.done || 0) + ' tugas · ' + money(d.earned) + (d.load ? ' · muatan ' + d.load : '')}),
      d.act ? btn(d.act, 'go cj-hud-act', function () { send('act'); }) : null
    );
    hud.hidden = false;
    hud.setAttribute('data-touch', '');
    E.touch();
  }
  function hideHud() { hud.hidden = true; hud.removeAttribute('data-touch'); hud.replaceChildren(); E.touch(); }

  /* ---------------- mini games ---------------- */
  function gameFrame(d, title, help) {
    var body = h('div', {class: 'cj-game-body'});
    var status = h('div', {class: 'cj-game-status'});
    var card = h('div', {class: 'cj-card cj-game'}, [
      h('div', {class: 'cj-head'}, [
        h('span', {class: 'cj-ico', text: ICON[KEYS[d.job]] || '🎮'}),
        h('div', {}, [h('div', {class: 'cj-title', text: title}), h('div', {class: 'cj-sub', text: help})]),
        btn('✕', 'cj-x', function () { closeWrap(true); })
      ]),
      body, status
    ]);
    openWrap(card);
    return {body: body, status: status};
  }
  function finish(d, score, text) {
    var s = Math.max(0, Math.min(100, Math.round(score)));
    stopGame();
    finishing = true;
    send('result', s, String(d.seed));
    var msg = h('div', {class: 'cj-done ' + (s >= 50 ? 'ok' : 'bad')}, [
      h('b', {text: s >= 50 ? 'Berhasil!' : 'Gagal'}), h('span', {text: (text ? text + ' · ' : '') + 'skor ' + s})
    ]);
    wrap.querySelector('.cj-game-body') && wrap.querySelector('.cj-game-body').replaceChildren(msg);
    setTimeout(function () { finishing = false; closeWrap(false); }, 1100);
  }

  // 1. Pancing: tekan TARIK saat penanda di zona hijau (3 kena sebelum 3 lepas)
  function gFish(d) {
    var r = rng(d.seed), lvl = Math.min(5, d.level || 1);
    var fr = gameFrame(d, 'Memancing', 'Tekan TARIK saat penanda di zona hijau');
    var bar = h('div', {class: 'cj-bar'}), zone = h('div', {class: 'cj-zone'}), mark = h('div', {class: 'cj-mark'});
    bar.append(zone, mark);
    var hits = 0, miss = 0, t0 = performance.now(), raf = 0, zw = 22 - lvl * 2, zx = 0, speed = 0.9 + lvl * 0.18 + r() * 0.3;
    function newZone() { zx = 8 + r() * (84 - zw); zone.style.left = zx + '%'; zone.style.width = zw + '%'; }
    newZone();
    var pull = btn('TARIK', 'go big', function () {
      var p = parseFloat(mark.style.left) || 0;
      if (p >= zx - 1 && p <= zx + zw + 1) { hits++; bar.classList.add('hit'); newZone(); }
      else { miss++; bar.classList.add('miss'); }
      setTimeout(function () { bar.classList.remove('hit', 'miss'); }, 180);
      fr.status.textContent = 'Kena ' + hits + '/3 · Lepas ' + miss + '/3';
      if (hits >= 3) finish(d, 100 - miss * 15, 'ikan didapat');
      else if (miss >= 3) finish(d, 20, 'ikan lepas');
    });
    fr.body.append(h('div', {class: 'cj-water'}, [bar]), pull);
    fr.status.textContent = 'Kena 0/3 · Lepas 0/3';
    (function loop(now) {
      var t = (now - t0) / 1000;
      mark.style.left = (50 + 47 * Math.sin(t * speed * 2.2)) + '%';
      raf = requestAnimationFrame(loop);
    })(t0);
    game = {stop: function () { cancelAnimationFrame(raf); }};
  }

  // 2. Pizza: susun topping sesuai urutan pesanan
  function gPizza(d) {
    var r = rng(d.seed), lvl = Math.min(4, d.level || 1);
    var all = ['Keju', 'Jamur', 'Sosis', 'Paprika', 'Nanas', 'Daging', 'Zaitun', 'Bawang'];
    var order = shuffle(all.slice(), r).slice(0, 3 + lvl);
    var fr = gameFrame(d, d.act === 'SERAHKAN' ? 'Serahkan pesanan' : 'Rakit pesanan', 'Ketuk topping sesuai urutan pesanan');
    var at = 0, wrong = 0;
    var list = h('div', {class: 'cj-order'}, order.map(function (o, i) { return h('span', {class: 'cj-chip', 'data-i': i, text: (i + 1) + '. ' + o}); }));
    var pizza = h('div', {class: 'cj-pizza'});
    var grid = h('div', {class: 'cj-grid4'}, shuffle(all.slice(), r).map(function (t) {
      return btn(t, '', function () {
        if (t === order[at]) {
          list.children[at].classList.add('ok');
          pizza.append(h('i', {class: 'cj-top', style: 'left:' + (20 + r() * 60) + '%;top:' + (20 + r() * 60) + '%'}));
          at++;
          if (at >= order.length) finish(d, 100 - wrong * 15, 'pesanan pas');
        } else { wrong++; fr.status.textContent = 'Salah topping: ' + wrong; if (wrong >= 4) finish(d, 30, 'pesanan kacau'); }
      });
    }));
    fr.body.append(list, pizza, grid);
  }

  // 3. Crane: jatuhkan kontainer tepat di atas tumpukan (3 kali)
  function gCrane(d) {
    var r = rng(d.seed), lvl = Math.min(5, d.level || 1);
    var fr = gameFrame(d, 'Crane pelabuhan', 'Tekan TURUNKAN saat kontainer di atas tanda');
    var yard = h('div', {class: 'cj-yard'}), box = h('div', {class: 'cj-box'}), target = h('div', {class: 'cj-target'});
    yard.append(target, box);
    var drops = 0, acc = 0, t0 = performance.now(), raf = 0, speed = 0.8 + lvl * 0.2 + r() * 0.2, tx = 50;
    function newTarget() { tx = 15 + r() * 70; target.style.left = tx + '%'; }
    newTarget();
    fr.body.append(yard, btn('TURUNKAN', 'go big', function () {
      var bx = parseFloat(box.style.left) || 0, err = Math.abs(bx - tx);
      acc += Math.max(0, 100 - err * 6); drops++;
      yard.classList.add(err < 6 ? 'hit' : 'miss'); setTimeout(function () { yard.classList.remove('hit', 'miss'); }, 200);
      fr.status.textContent = 'Kontainer ' + drops + '/3 · selisih ' + err.toFixed(1) + ' m';
      if (drops >= 3) finish(d, acc / 3, 'kontainer tersusun'); else newTarget();
    }));
    (function loop(now) {
      var t = (now - t0) / 1000;
      box.style.left = (50 + 44 * Math.sin(t * speed * 1.9)) + '%';
      raf = requestAnimationFrame(loop);
    })(t0);
    game = {stop: function () { cancelAnimationFrame(raf); }};
  }

  // 4. Montir: hafalkan urutan perbaikan lalu ulangi
  function gRepair(d) {
    var r = rng(d.seed), lvl = Math.min(4, d.level || 1);
    var parts = ['Aki', 'Busi', 'Oli', 'Filter', 'Radiator', 'Kipas', 'Rem', 'Sabuk'];
    var seq = shuffle(parts.slice(), r).slice(0, 3 + lvl);
    var fr = gameFrame(d, 'Perbaikan mesin', 'Hafalkan urutan, lalu ketuk part sesuai urutan');
    var show = h('div', {class: 'cj-order'}, seq.map(function (p, i) { return h('span', {class: 'cj-chip', text: (i + 1) + '. ' + p}); }));
    var at = 0, wrong = 0, grid = h('div', {class: 'cj-grid4 hidden'});
    shuffle(parts.slice(), r).forEach(function (p) {
      grid.append(btn(p, '', function () {
        if (p === seq[at]) { at++; fr.status.textContent = 'Langkah ' + at + '/' + seq.length; if (at >= seq.length) finish(d, 100 - wrong * 20, 'mesin hidup'); }
        else { wrong++; fr.status.textContent = 'Salah urutan: ' + wrong; if (wrong >= 3) finish(d, 25, 'mesin masih mati'); }
      }));
    });
    fr.body.append(show, grid);
    fr.status.textContent = 'Hafalkan...';
    var tm = setTimeout(function () { show.classList.add('hidden'); grid.classList.remove('hidden'); fr.status.textContent = 'Langkah 0/' + seq.length; }, 2600 + lvl * 300);
    game = {stop: function () { clearTimeout(tm); }};
  }

  // 5. Listrik: sambung kabel kiri ke warna yang sama di kanan
  function gWires(d) {
    var r = rng(d.seed), lvl = Math.min(3, d.level || 1);
    var colors = [['Merah', '#ff4d4d'], ['Kuning', '#ffd24d'], ['Biru', '#4d8cff'], ['Hijau', '#45d483'], ['Ungu', '#b36bff'], ['Oranye', '#ff9a3c']].slice(0, 3 + lvl);
    var fr = gameFrame(d, 'Sambung kabel', 'Ketuk kabel kiri lalu terminal kanan dengan warna sama');
    var left = shuffle(colors.slice(), r), right = shuffle(colors.slice(), r);
    var pick = null, done = 0, wrong = 0;
    var L = h('div', {class: 'cj-col'}), R = h('div', {class: 'cj-col'});
    left.forEach(function (c) {
      var b = h('button', {type: 'button', class: 'cj-wire', style: '--w:' + c[1], text: c[0]});
      b.onclick = function () { if (b.classList.contains('ok')) return; L.querySelectorAll('.sel').forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); pick = {c: c, b: b}; };
      L.append(b);
    });
    right.forEach(function (c) {
      var b = h('button', {type: 'button', class: 'cj-wire term', style: '--w:' + c[1], text: '●'});
      b.onclick = function () {
        if (!pick || b.classList.contains('ok')) return;
        if (pick.c[0] === c[0]) { pick.b.classList.add('ok'); pick.b.classList.remove('sel'); b.classList.add('ok'); done++; pick = null; if (done >= colors.length) finish(d, 100 - wrong * 20, 'listrik menyala'); }
        else { wrong++; fr.status.textContent = 'Korsleting: ' + wrong; if (wrong >= 3) finish(d, 20, 'korsleting'); }
      };
      R.append(b);
    });
    fr.body.append(h('div', {class: 'cj-wires'}, [L, h('div', {class: 'cj-panel-box', text: '⚡'}), R]));
  }

  // 6. Taksi: pilih kembalian yang benar
  function gFare(d) {
    var r = rng(d.seed), fare = +d.fare || 0, paid = +d.paid || fare, change = paid - fare;
    var fr = gameFrame(d, 'Terima pembayaran', 'Penumpang bayar ' + money(paid) + ' untuk argo ' + money(fare));
    var opts = shuffle([change, change + 50, Math.max(0, change - 50), change + 20].filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 3), r);
    if (opts.indexOf(change) < 0) opts[0] = change;
    var t0 = performance.now(), tries = 0;
    fr.body.append(h('div', {class: 'cj-receipt'}, [
      h('div', {}, [h('span', {text: 'Argo'}), h('b', {text: money(fare)})]),
      h('div', {}, [h('span', {text: 'Dibayar'}), h('b', {text: money(paid)})]),
      h('div', {}, [h('span', {text: 'Kembalian?'}), h('b', {text: '...'})])
    ]), h('div', {class: 'cj-grid3'}, opts.map(function (v) {
      return btn(money(v), '', function () {
        tries++;
        if (v === change) { var s = (performance.now() - t0) < 8000 ? 100 : 80; finish(d, tries > 1 ? 70 : s, 'penumpang puas'); }
        else { fr.status.textContent = 'Kembalian salah!'; if (tries >= 2) finish(d, 30, 'penumpang kesal'); }
      });
    })));
  }

  // 7. Sampah: pilah ke tong yang benar
  function gSort(d) {
    var r = rng(d.seed);
    var items = [['Kulit pisang', 0], ['Sisa nasi', 0], ['Daun kering', 0], ['Tulang ikan', 0], ['Botol plastik', 1], ['Kaleng', 1], ['Kardus', 1],
      ['Kantong plastik', 1], ['Baterai', 2], ['Lampu neon', 2], ['Kaleng cat', 2], ['Obat kedaluwarsa', 2]];
    var pick = shuffle(items.slice(), r).slice(0, 6);
    var fr = gameFrame(d, 'Pilah sampah', 'Masukkan tiap sampah ke tong yang benar');
    var at = 0, ok = 0, timer = 0, left = 0;
    var item = h('div', {class: 'cj-item'}), bar = h('div', {class: 'cj-timer'});
    var bins = h('div', {class: 'cj-grid3'}, [['Organik', 'g'], ['Anorganik', 'y'], ['B3 / Berbahaya', 'r']].map(function (b, i) {
      return btn(b[0], 'bin ' + b[1], function () { answer(i); });
    }));
    function next() {
      if (at >= pick.length) { clearInterval(timer); finish(d, ok / pick.length * 100, ok + '/6 benar'); return; }
      item.textContent = pick[at][0]; left = 45; bar.style.width = '100%';
    }
    function answer(i) {
      if (at >= pick.length) return;
      if (i === pick[at][1]) ok++;
      fr.status.textContent = 'Benar ' + ok + ' dari ' + (at + 1);
      at++; next();
    }
    timer = setInterval(function () { left--; bar.style.width = Math.max(0, left / 45 * 100) + '%'; if (left <= 0) { at++; next(); } }, 100);
    fr.body.append(item, h('div', {class: 'cj-timer-wrap'}, [bar]), bins);
    next();
    game = {stop: function () { clearInterval(timer); }};
  }

  var GAMES = {fish: gFish, pizza: gPizza, crane: gCrane, repair: gRepair, wires: gWires, fare: gFare, sort: gSort};

  E.on('cjob', function (d) {
    if (!d) return;
    if (d.mode === 'board') { finishing = false; return board(d); }
    if (d.mode === 'hud') { lastHud = d; if (!finishing) closeWrap(false); return showHud(d); }
    if (d.mode === 'game') { var g = GAMES[d.game]; finishing = false; if (g) { d.act = lastHud && lastHud.act; g(d); } return; }
    if (d.mode === 'close') { finishing = false; closeWrap(false); hideHud(); }
  });
  E.on('auth', function (d) { if (d && ['login', 'register', 'chars', 'charinfo', 'create', 'spawn'].indexOf(d.v) >= 0) { closeWrap(false); hideHud(); } });
  wrap.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  E.done('cityjobs');
})();
