(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = { dialog: null, selectedIndex: 0, readySent: false, gotServer: false, logged: false };
  const DIALOG_STYLE_MSGBOX = 0, DIALOG_STYLE_INPUT = 1, DIALOG_STYLE_LIST = 2, DIALOG_STYLE_PASSWORD = 3, DIALOG_STYLE_TABLIST = 4, DIALOG_STYLE_TABLIST_HEADERS = 5;
  const el = {};

  function boot() {
    ['bootScreen','topHud','statusPanel','speedometer','gameText','notifications','dialogOverlay','serverName','serverVersion','hudServer','hudVersion','fakePlayer','fakeStatus','connectHint','moneyValue','bankValue','levelValue','expValue','wantedValue','healthBar','armourBar','hungerBar','thirstBar','healthValue','armourValue','hungerValue','thirstValue','speedValue','fuelValue','mileageValue','dialogTitle','dialogBody','dialogActions','dialogClose','readyButton'].forEach(id => el[id] = $(id));
    bindNativeReceivers();
    bindUiEvents();
    showLogin('UI aktif. Menunggu event login dari server...');
    ready();
    let autoRetryCount = 0;
    const autoRetry = setInterval(() => {
      if (state.gotServer || autoRetryCount >= 30) { clearInterval(autoRetry); return; }
      autoRetryCount++;
      ready();
    }, 1200);
    setTimeout(() => {
      if (!state.gotServer) {
        setStatus('Belum ada balasan server. Tekan Refresh UI atau cek bridge CEF/RakNet.');
        if (el.connectHint) el.connectHint.innerHTML = '<b>Debug:</b> app.js aktif, tetapi server belum mengirim <b>cef:bootstrap/dialog:show/hud:update</b>.';
      }
    }, 2500);
  }

  function clamp(n, min = 0, max = 100) { n = Number(n || 0); return Math.max(min, Math.min(max, n)); }
  function formatMoney(n) { return '$' + Number(n || 0).toLocaleString('en-US'); }
  function parseJson(input) { if (!input) return {}; if (typeof input === 'object') return input; try { return JSON.parse(String(input)); } catch (_) { return {}; } }
  function escapeHtml(str) { return String(str ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }
  function cleanSampText(text) { return String(text ?? '').replace(/\{[0-9a-fA-F]{6}\}/g,'').replace(/~n~/gi,'\n').replace(/~[rgbypwh]~/gi,'').replace(/\t/g,'    '); }
  function setHidden(node, hidden) { if (!node) return; node.hidden = !!hidden; node.classList.toggle('hidden', !!hidden); }
  function setStatus(text) { if (el.fakeStatus) el.fakeStatus.value = text; }

  function sendToPawn(event, payload = {}) {
    const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const packed = JSON.stringify({ event, json, payload });
    let touchedBridge = false;

    const call = (fn) => {
      try {
        const result = fn();
        touchedBridge = true;
        return result !== false;
      } catch (e) {
        return false;
      }
    };

    const candidates = [
      () => window.cef && typeof window.cef.emit === 'function' && call(() => window.cef.emit(event, json)),
      () => window.cef && typeof window.cef.send === 'function' && call(() => window.cef.send(event, json)),
      () => window.cef && typeof window.cef.call === 'function' && call(() => window.cef.call(event, json)),
      () => window.CEF && typeof window.CEF.emit === 'function' && call(() => window.CEF.emit(event, json)),
      () => window.CEF && typeof window.CEF.send === 'function' && call(() => window.CEF.send(event, json)),
      () => window.sampcef && typeof window.sampcef.emit === 'function' && call(() => window.sampcef.emit(event, json)),
      () => window.sampcef && typeof window.sampcef.send === 'function' && call(() => window.sampcef.send(event, json)),
      () => window.HolyAndroid && typeof window.HolyAndroid.sendCefEvent === 'function' && call(() => window.HolyAndroid.sendCefEvent(event, json)),
      () => window.HolyAndroid && typeof window.HolyAndroid.send === 'function' && call(() => window.HolyAndroid.send(event, json)),
      () => window.Android && typeof window.Android.sendCefEvent === 'function' && call(() => window.Android.sendCefEvent(event, json)),
      () => window.Android && typeof window.Android.onCefClientEvent === 'function' && call(() => window.Android.onCefClientEvent(event, json)),
      () => window.Android && typeof window.Android.send === 'function' && call(() => window.Android.send(event, json)),
      () => window.Android && typeof window.Android.postMessage === 'function' && call(() => window.Android.postMessage(packed)),
      () => window.AndroidCEF && typeof window.AndroidCEF.sendCefEvent === 'function' && call(() => window.AndroidCEF.sendCefEvent(event, json)),
      () => window.AndroidCEF && typeof window.AndroidCEF.send === 'function' && call(() => window.AndroidCEF.send(event, json)),
      () => window.JSBridge && typeof window.JSBridge.sendCefEvent === 'function' && call(() => window.JSBridge.sendCefEvent(event, json)),
      () => window.NativeBridge && typeof window.NativeBridge.sendCefEvent === 'function' && call(() => window.NativeBridge.sendCefEvent(event, json)),
      () => window.external && typeof window.external.invoke === 'function' && call(() => window.external.invoke(packed)),
      () => window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cef && call(() => window.webkit.messageHandlers.cef.postMessage(packed)),
      () => typeof window.cef_emit === 'function' && call(() => window.cef_emit(event, json)),
      () => typeof window.sendCefEvent === 'function' && call(() => window.sendCefEvent(event, json)),
      () => typeof window.OnCefClientEvent === 'function' && call(() => window.OnCefClientEvent(event, json)),
      () => sendByUrlScheme(event, json)
    ];

    for (const fn of candidates) {
      try { if (fn()) return true; } catch (_) {}
    }

    if (!touchedBridge) console.log('[CEF->PAWN:NO_BRIDGE]', event, json);
    else console.log('[CEF->PAWN:FAILED]', event, json);
    return false;
  }

  function sendByUrlScheme(event, json) {
    try {
      const url = 'sampcef://event?name=' + encodeURIComponent(event) + '&json=' + encodeURIComponent(json);
      const frame = document.createElement('iframe');
      frame.style.display = 'none';
      frame.src = url;
      document.documentElement.appendChild(frame);
      setTimeout(() => frame.remove(), 250);
      return true;
    } catch (_) {
      return false;
    }
  }

  function receiveFromPawn(event, payload) {
    if (typeof event === 'object' && event) { payload = event.json ?? event.payload ?? event.data; event = event.event ?? event.name; }
    const data = parseJson(payload);
    state.gotServer = true;
    switch (String(event || '')) {
      case 'cef:bootstrap': return onBootstrap(data);
      case 'ui:login': return showLogin('Silakan login dari dialog server.');
      case 'ui:showHud':
      case 'login:success': state.logged = true; return showHud();
      case 'notification:push': return pushNotification(data);
      case 'gametext:show': return showGameText(data);
      case 'hud:update': state.logged = true; showHud(); return updateHud(data);
      case 'dialog:show': return showDialog(data);
      case 'dialog:hide': return hideDialog(false);
      default: console.log('[PAWN->CEF]', event, data);
    }
  }

  function bindNativeReceivers() {
    window.HolyCEF = { receive: receiveFromPawn, emit: sendToPawn, ready, showLogin, showHud };
    ['CefEvent','onCefEvent','dispatchCefEvent','receiveCefEvent','CEFReceive','OnCefEvent','cefEvent','CEF_Event'].forEach(name => { window[name] = receiveFromPawn; });
    window.addEventListener('message', e => { const d = parseJson(e.data); if (d.event || d.name) receiveFromPawn(d.event || d.name, d.json ?? d.payload ?? d.data); });
    if (window.cef && typeof window.cef.on === 'function') {
      ['cef:bootstrap','ui:login','ui:showHud','login:success','notification:push','gametext:show','hud:update','dialog:show','dialog:hide'].forEach(name => { try { window.cef.on(name, payload => receiveFromPawn(name, payload)); } catch (_) {} });
    }
  }

  function bindPress(node, handler) {
    if (!node) return;
    const run = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      handler();
    };
    node.addEventListener('click', run, false);
    node.addEventListener('touchend', run, { passive: false });
    node.addEventListener('pointerup', run, false);
  }

  function bindUiEvents() {
    bindPress(el.dialogClose, () => submitDialog(0));
    bindPress(el.readyButton, () => {
      setStatus('Tombol aktif. Mengirim ready ke server...');
      const ok1 = sendToPawn('cef:ready', { version: 'holy-fivem-ui-touch-bridge-fixed', time: Date.now(), button: 1 });
      const ok2 = sendToPawn('ui:ready', { version: 'holy-fivem-ui-touch-bridge-fixed', time: Date.now(), button: 1 });
      if (!ok1 && !ok2) setStatus('Tombol aktif, tapi bridge JS ke Pawn tidak ditemukan. Fix Java WebView/JNI.');
    });
    document.addEventListener('keydown', e => {
      if (!state.dialog) return;
      if (e.key === 'Escape') submitDialog(0);
      if (e.key === 'Enter') submitDialog(1);
      if (e.key === 'ArrowDown') selectRow(Math.min(state.selectedIndex + 1, el.dialogBody.querySelectorAll('.dialog-item').length - 1));
      if (e.key === 'ArrowUp') selectRow(Math.max(state.selectedIndex - 1, 0));
    });
  }

  function ready() {
    state.readySent = true;
    setStatus('UI ready. Menunggu server...');
    sendToPawn('cef:ready', { version: 'holy-fivem-ui-touch-bridge-fixed', time: Date.now() });
    sendToPawn('ui:ready', { version: 'holy-fivem-ui-touch-bridge-fixed', time: Date.now() });
  }

  function showLogin(status) {
    setHidden(el.bootScreen, false); setHidden(el.topHud, true); setHidden(el.statusPanel, true); setHidden(el.speedometer, true);
    if (el.bootScreen) el.bootScreen.classList.remove('closed');
    if (status) setStatus(status);
  }

  function showHud() {
    if (el.bootScreen) el.bootScreen.classList.add('closed');
    setTimeout(() => setHidden(el.bootScreen, true), 260);
    setHidden(el.topHud, false); setHidden(el.statusPanel, false);
  }

  function onBootstrap(data) {
    const server = data.server || 'Holy Roleplay'; const version = data.version || 'Mobile CEF';
    if (el.serverName) el.serverName.textContent = server;
    if (el.serverVersion) el.serverVersion.textContent = version;
    if (el.hudServer) el.hudServer.textContent = server;
    if (el.hudVersion) el.hudVersion.textContent = version;
    if (el.fakePlayer) el.fakePlayer.value = data.player || ('ID ' + (data.playerid ?? 0));
    setStatus(data.logged ? 'Login berhasil.' : 'Terhubung. Menunggu dialog login...');
    if (data.logged) showHud(); else showLogin();
  }

  function pushNotification(data) {
    if (!el.notifications) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<strong>${data.broadcast ? 'Broadcast' : 'Notification'}</strong><p>${escapeHtml(cleanSampText(data.message || data.text || ''))}</p>`;
    el.notifications.prepend(toast);
    const time = Number(data.time || 5200);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-10px)'; }, time);
    setTimeout(() => toast.remove(), time + 450);
  }

  function showGameText(data) {
    if (!el.gameText) return;
    el.gameText.textContent = cleanSampText(data.text || '');
    setHidden(el.gameText, false);
    clearTimeout(showGameText.timer);
    showGameText.timer = setTimeout(() => setHidden(el.gameText, true), Number(data.time || 3000));
  }

  function updateHud(data) {
    if (el.moneyValue) el.moneyValue.textContent = formatMoney(data.money);
    if (el.bankValue) el.bankValue.textContent = formatMoney(data.bank);
    if (el.levelValue) el.levelValue.textContent = data.level ?? 1;
    if (el.expValue) el.expValue.textContent = data.exp ?? 0;
    if (el.wantedValue) el.wantedValue.textContent = data.wanted ?? 0;
    setBar(el.healthBar, el.healthValue, data.health ?? 100);
    setBar(el.armourBar, el.armourValue, data.armour ?? data.armor ?? 0);
    setBar(el.hungerBar, el.hungerValue, data.hunger ?? 100);
    setBar(el.thirstBar, el.thirstValue, data.thirst ?? 100);
    const speed = Number(data.speed || 0);
    if (el.speedValue) el.speedValue.textContent = Math.round(speed);
    if (el.fuelValue) el.fuelValue.textContent = Math.round(Number(data.fuel || 0));
    if (el.mileageValue) el.mileageValue.textContent = Number(data.mileage || 0).toFixed(1);
    setHidden(el.speedometer, speed <= 0 && !data.vehicle);
  }

  function setBar(bar, valueEl, value) { const v = clamp(value); if (bar) bar.style.width = v + '%'; if (valueEl) valueEl.textContent = Math.round(v); }

  function showDialog(data) {
    state.dialog = data; state.selectedIndex = 0;
    if (!el.dialogBody || !el.dialogActions || !el.dialogTitle) return;
    el.dialogTitle.textContent = cleanSampText(data.caption || data.title || 'Dialog');
    el.dialogBody.innerHTML = ''; el.dialogActions.innerHTML = '';
    const style = Number(data.style || 0); const info = cleanSampText(data.info || data.text || '');
    const isList = style === DIALOG_STYLE_LIST || style === DIALOG_STYLE_TABLIST || style === DIALOG_STYLE_TABLIST_HEADERS || data.isList;
    if (isList) renderList(info, style === DIALOG_STYLE_TABLIST_HEADERS);
    else if (style === DIALOG_STYLE_INPUT || style === DIALOG_STYLE_PASSWORD) {
      const text = document.createElement('div'); text.className = 'dialog-text'; text.textContent = info;
      const input = document.createElement('input'); input.id = 'dialogInput'; input.className = 'dialog-input'; input.type = style === DIALOG_STYLE_PASSWORD ? 'password' : 'text'; input.autocomplete = 'off';
      input.addEventListener('keydown', ev => { if (ev.key === 'Enter') submitDialog(1); });
      el.dialogBody.append(text, input); setTimeout(() => input.focus(), 50);
    } else { const text = document.createElement('div'); text.className = 'dialog-text'; text.textContent = info; el.dialogBody.append(text); }
    addActions(data.button1 || 'Pilih', data.button2 || 'Tutup');
    setHidden(el.dialogOverlay, false);
  }

  function renderList(info, hasHeader) {
    const list = document.createElement('div'); list.className = 'dialog-list';
    const lines = info.split('\n').map(x => x.trim()).filter(Boolean); const rows = hasHeader && lines.length > 1 ? lines.slice(1) : lines;
    rows.forEach((line, index) => {
      const row = document.createElement('div'); row.className = 'dialog-item' + (index === 0 ? ' active' : ''); row.dataset.index = index;
      const parts = line.split('\t').filter(Boolean);
      row.innerHTML = parts.length > 1 ? `<b>${escapeHtml(parts[0])}</b><small>${escapeHtml(parts.slice(1).join('  ·  '))}</small>` : `<b>${escapeHtml(line)}</b>`;
      bindPress(row, () => selectRow(index, true)); list.appendChild(row);
    });
    if (!rows.length) { const empty = document.createElement('div'); empty.className = 'dialog-text'; empty.textContent = 'Tidak ada data.'; list.appendChild(empty); }
    el.dialogBody.append(list);
  }

  function selectRow(index, submit = false) {
    state.selectedIndex = index;
    [...el.dialogBody.querySelectorAll('.dialog-item')].forEach(node => node.classList.toggle('active', Number(node.dataset.index) === index));
    if (submit) submitDialog(1);
  }

  function addActions(button1, button2) {
    if (button2) { const cancel = document.createElement('button'); cancel.className = 'dialog-btn danger'; cancel.textContent = cleanSampText(button2); bindPress(cancel, () => submitDialog(0)); el.dialogActions.appendChild(cancel); }
    const ok = document.createElement('button'); ok.className = 'dialog-btn primary'; ok.textContent = cleanSampText(button1 || 'OK'); bindPress(ok, () => submitDialog(1)); el.dialogActions.appendChild(ok);
  }

  function submitDialog(response) {
    if (!state.dialog) return;
    const style = Number(state.dialog.style || 0); const input = $('dialogInput'); const selected = Number(state.selectedIndex || 0);
    let inputtext = input ? input.value : '';
    if (style === DIALOG_STYLE_LIST || style === DIALOG_STYLE_TABLIST || style === DIALOG_STYLE_TABLIST_HEADERS || state.dialog.isList) inputtext = String(selected + 1);
    sendToPawn('dialog:response', { dialogid: Number(state.dialog.dialogid), response: Number(response), listitem: selected, index: selected, inputtext, input: inputtext });
    hideDialog(false);
  }

  function hideDialog(notify = true) {
    if (notify && state.dialog) sendToPawn('dialog:close', { dialogid: Number(state.dialog.dialogid) });
    state.dialog = null; setHidden(el.dialogOverlay, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();