const state = {
  mode: 'login',
  name: 'Player',
  id: 0,
  logged: false,
};

const $ = (id) => document.getElementById(id);

function safeParse(data) {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch (e) { return {}; }
}

function sendToNative(event, payload = {}) {
  const json = JSON.stringify(payload);
  try {
    if (window.cef && typeof window.cef.emit === 'function') {
      window.cef.emit(event, json);
      return true;
    }
  } catch (e) {}
  try {
    if (window.CefBridge && typeof window.CefBridge.sendClientEvent === 'function') {
      window.CefBridge.sendClientEvent(event, json);
      return true;
    }
  } catch (e) {}
  try {
    if (window.SampCEF && typeof window.SampCEF.emit === 'function') {
      window.SampCEF.emit(event, json);
      return true;
    }
  } catch (e) {}
  console.log('[CEF] bridge not found', event, json);
  toast('Bridge CEF belum ready');
  return false;
}

function emitEvent(event, payload = {}) { sendToNative(event, payload); }
function sendClose() { emitEvent('ui:close'); }

function setAuthMode(mode, message) {
  state.mode = mode === 'register' ? 'register' : 'login';
  $('authTitle').textContent = state.mode === 'register' ? 'Register' : 'Login';
  $('submitBtn').textContent = state.mode === 'register' ? 'Daftar' : 'Masuk';
  if (message !== undefined) $('authMessage').textContent = message;
}

function updateState(data) {
  const d = safeParse(data);
  if (d.name !== undefined) state.name = d.name;
  if (d.id !== undefined) state.id = d.id;
  if (d.mode !== undefined) setAuthMode(d.mode, d.message || '');
  if (d.message !== undefined) $('authMessage').textContent = d.message;
  if (d.logged !== undefined) state.logged = !!Number(d.logged);

  $('playerName').textContent = state.name;
  $('playerId').textContent = state.id;
  $('panelName').textContent = state.name;

  if (d.money !== undefined) $('money').textContent = '$' + Number(d.money).toLocaleString('en-US');
  if (d.score !== undefined) $('score').textContent = d.score;
  if (d.skin !== undefined) { $('skin').textContent = d.skin; $('skinBox').textContent = d.skin; }
}

function showMain() {
  $('authPanel').classList.add('hidden');
  $('mainPanel').classList.remove('hidden');
}

function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

// Server -> JS event receiver. Different CEF builds call different names, so expose several aliases.
function onPawnEvent(event, data) {
  const d = safeParse(data);
  if (event === 'auth:state') updateState(d);
  else if (event === 'auth:success') { toast(d.message || 'Berhasil'); showMain(); }
  else if (event === 'server:update') updateState(d);
  else if (event === 'server:toast') toast(d.text || 'OK');
  else if (event === 'server:pong') toast('Pong dari server');
  else console.log('[CEF] event from server', event, d);
}

window.onPawnEvent = onPawnEvent;
window.cefEvent = onPawnEvent;
window.handleServerEvent = onPawnEvent;
window.HolyCEF = { onPawnEvent, emit: emitEvent };

$('submitBtn').addEventListener('click', () => {
  const password = $('password').value.trim();
  if (password.length < 3) return toast('Password minimal 3 karakter');
  emitEvent(state.mode === 'register' ? 'auth:register' : 'auth:login', { password });
});

$('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('submitBtn').click();
});

$('pingBtn').addEventListener('click', () => emitEvent('auth:ready'));

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => emitEvent('auth:ready'), 200);
  setTimeout(() => emitEvent('auth:ready'), 1200);
});
