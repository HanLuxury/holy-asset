/* EAGLE V109 - RP Eagle manual transmission controls (Android touch / FiveM HUD).
   Server is authoritative for gearbox state and speed limiting.
   Position and size are device-local preferences, NOT sent over RakNet. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;
  var root = document.createElement('section');
  root.id = 'eagle-mt';
  root.className = 'eagle-mt';
  root.setAttribute('data-touch', '1');
  root.setAttribute('aria-label', 'Kontrol transmisi kendaraan RP Eagle');
  root.innerHTML = '' +
    '<div class="mt-top" data-mt-grip="1"><div class="mt-logo">RE</div><div class="mt-brand"><b>RP EAGLE</b><span>TRANSMISSION</span></div><button type="button" class="mt-edit" aria-label="Atur posisi">⌖</button></div>' +
    '<div class="mt-main"><div class="mt-indicator"><small>GEAR</small><strong class="mt-gear">1</strong><em class="mt-mode">MANUAL</em></div>' +
      '<div class="mt-keys"><button class="mt-up" type="button" aria-label="Naik gigi">▲<span>UP</span></button>' +
      '<button class="mt-down" type="button" aria-label="Turun gigi">▼<span>DOWN</span></button></div></div>' +
    '<div class="mt-foot"><span class="mt-speed">0 KM/H</span><button class="mt-toggle" type="button" aria-label="Ganti mode transmisi">M / A</button></div>' +
    '<div class="mt-feedback" role="status" aria-live="polite"></div>' +
    '<div class="mt-position"><span>GESER PANEL DARI HEADER</span><div><button type="button" class="mt-smaller">−</button>' +
      '<button type="button" class="mt-bigger">+</button><button type="button" class="mt-reset">RESET</button>' +
      '<button type="button" class="mt-done">OK</button></div></div>';
  U.layer('hudlayer').appendChild(root);
  var $ = function (sel) { return root.querySelector(sel); };
  var state = { show: 0, veh: 0, gear: 1, manual: 1, label: '1', max: 5, cap: 30 };
  var pref = { x: null, y: null, scale: 1 };
  var editing = false, dragging = false, px = 0, py = 0, dragX = 0, dragY = 0;
  var speed = 0, tapped = 0, pending = false, pendingTimer = 0, noticeTimer = 0;
  var key = 'EAGLE_MT_POS_V108';
  try {
    var prev = JSON.parse(localStorage.getItem(key) || 'null');
    if (prev && typeof prev === 'object') {
      // Number(null) is 0: do not turn a RESET position into top-left (0,0).
      if (prev.x !== null && prev.x !== undefined && prev.y !== null && prev.y !== undefined &&
          isFinite(+prev.x) && isFinite(+prev.y)) { pref.x = +prev.x; pref.y = +prev.y; }
      if (isFinite(+prev.scale)) pref.scale = Math.max(.7, Math.min(1.35, +prev.scale));
    }
  } catch (_) {}
  function save() { try { localStorage.setItem(key, JSON.stringify(pref)); } catch (_) {} }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function applyPos() {
    root.style.setProperty('--mt-scale', pref.scale);
    if (pref.x == null || pref.y == null) { root.style.removeProperty('left'); root.style.removeProperty('top'); root.style.removeProperty('right'); root.style.removeProperty('bottom'); return; }
    // Layout width/height are unscaled: account for CSS scale when clamping.
    var w = root.offsetWidth * pref.scale, h = root.offsetHeight * pref.scale;
    pref.x = clamp(pref.x, 0, Math.max(0, window.innerWidth - w));
    pref.y = clamp(pref.y, 0, Math.max(0, window.innerHeight - h));
    root.style.left = pref.x + 'px';
    root.style.top = pref.y + 'px';
    root.style.right = 'auto'; root.style.bottom = 'auto';
  }
  function getRectPos() {
    var rect = root.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }
  function setEditing(v) {
    editing = !!v;
    root.classList.toggle('editing', editing);
    $('.mt-edit').textContent = editing ? '✓' : '⌖';
    if (!editing) { finishDrag(); save(); }
    E.touch();
  }
  function feedback(message, ok) {
    var el = $('.mt-feedback');
    clearTimeout(noticeTimer);
    if (!message) { el.textContent = ''; el.classList.remove('visible', 'warn'); return; }
    el.textContent = String(message).slice(0, 120);
    el.classList.toggle('warn', !ok);
    el.classList.add('visible');
    noticeTimer = setTimeout(function () { el.classList.remove('visible'); el.textContent = ''; }, 2400);
  }
  function clearPending() {
    pending = false; clearTimeout(pendingTimer);
    root.classList.remove('pending');
  }
  function render() {
    var shown = !!+state.show && !document.body.classList.contains('eagle-auth-active');
    root.classList.toggle('on', shown);
    root.classList.toggle('automatic', !+state.manual);
    if (!shown) { clearPending(); feedback('', true); }
    $('.mt-gear').textContent = +state.manual ? String(state.label || state.gear || 'N') : 'D';
    $('.mt-mode').textContent = +state.manual ? 'MANUAL' : 'AUTO';
    $('.mt-speed').textContent = Math.max(0, Math.round(speed)) + ' KM/H';
    $('.mt-toggle').textContent = +state.manual ? 'AUTO' : 'MANUAL';
    $('.mt-up').disabled = pending || !+state.manual || (+state.gear >= +state.max);
    $('.mt-down').disabled = pending || !+state.manual || (+state.gear <= -1);
    $('.mt-toggle').disabled = pending;
    if (window.EHUD && window.EHUD.setTransmission) {
      // HUD speed is updated by speedo event; don't pin manual.speed to the old value.
      window.EHUD.setTransmission(shown && +state.manual ? { armed: true, label: state.label || '1' } : null);
    }
    E.touch();
  }
  function send(action) {
    if (!+state.show || editing || pending) return;
    var now = Date.now();
    if (now - tapped < 330) return;
    tapped = now;
    pending = true;
    root.classList.add('pending');
    render();
    E.send('gear', action, 0, '');
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(function () {
      clearPending(); render();
      feedback('Belum ada balasan server. Coba lagi.', false);
    }, 2200);
  }
  $('.mt-up').addEventListener('click', function () { send('up'); });
  $('.mt-down').addEventListener('click', function () { send('down'); });
  $('.mt-toggle').addEventListener('click', function () { send('mode'); });
  $('.mt-edit').addEventListener('click', function () { setEditing(!editing); });
  $('.mt-done').addEventListener('click', function () { setEditing(false); });
  $('.mt-bigger').addEventListener('click', function () { pref.scale = clamp(pref.scale + .1, .7, 1.35); applyPos(); save(); });
  $('.mt-smaller').addEventListener('click', function () { pref.scale = clamp(pref.scale - .1, .7, 1.35); applyPos(); save(); });
  $('.mt-reset').addEventListener('click', function () { pref = { x: null, y: null, scale: 1 }; applyPos(); save(); });
  var grip = root.querySelector('[data-mt-grip]');
  function startDrag(ev) {
    if (!editing || ev.target.closest('.mt-edit')) return;
    var p = getRectPos();
    pref.x = p.x; pref.y = p.y;
    dragging = true; px = ev.clientX; py = ev.clientY; dragX = pref.x; dragY = pref.y;
    if (ev.preventDefault) ev.preventDefault();
    if (grip.setPointerCapture) try { grip.setPointerCapture(ev.pointerId); } catch (_) {}
  }
  function moveDrag(ev) {
    if (!dragging) return;
    pref.x = clamp(dragX + ev.clientX - px, 0, Math.max(0, window.innerWidth - root.offsetWidth * pref.scale));
    pref.y = clamp(dragY + ev.clientY - py, 0, Math.max(0, window.innerHeight - root.offsetHeight * pref.scale));
    applyPos();
    if (ev.preventDefault) ev.preventDefault();
  }
  function finishDrag() { if (!dragging) return; dragging = false; save(); }
  grip.addEventListener('pointerdown', startDrag);
  document.addEventListener('pointermove', moveDrag);
  document.addEventListener('pointerup', finishDrag);
  document.addEventListener('pointercancel', finishDrag);
  window.addEventListener('resize', applyPos);
  E.on('gear', function (payload) {
    if (!payload) return;
    if (payload.show == null) return;
    var previousVehicle = state.veh;
    for (var k in state) if (Object.prototype.hasOwnProperty.call(payload, k)) state[k] = payload[k];
    clearPending();
    if (previousVehicle && +state.veh !== +previousVehicle) feedback('', true);
    if (!+state.show) setEditing(false);
    render(); applyPos();
    if (payload.tip) feedback(payload.tip, +payload.ok !== 0);
  });
  E.on('speedo', function (payload) {
    if (!payload) return;
    if (payload.kmh != null) speed = Math.max(0, +payload.kmh || 0);
    $('.mt-speed').textContent = Math.round(speed) + ' KM/H';
    if (!+payload.show) {
      state.show = 0; setEditing(false); render();
    }
  });
  E.on('auth', function (payload) {
    if (payload && ['login', 'register', 'spawn', 'create', 'chars', 'charinfo'].indexOf(payload.v) >= 0) {
      state.show = 0; setEditing(false); render();
    }
  });
  applyPos(); render();
  E.done('gear');
})();
