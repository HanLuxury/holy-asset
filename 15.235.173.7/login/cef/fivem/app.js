(() => {
  const $ = (id) => document.getElementById(id);

  const state = {
    dialog: null,
    selectedIndex: 0,
    server: 'Holy Roleplay',
    version: 'CEF'
  };

  const el = {
    boot: $('bootScreen'), serverName: $('serverName'), serverVersion: $('serverVersion'),
    hudServer: $('hudServer'), hudVersion: $('hudVersion'), fakePlayer: $('fakePlayer'), fakeStatus: $('fakeStatus'),
    money: $('moneyValue'), bank: $('bankValue'), level: $('levelValue'), exp: $('expValue'), wanted: $('wantedValue'),
    healthBar: $('healthBar'), armourBar: $('armourBar'), hungerBar: $('hungerBar'), thirstBar: $('thirstBar'),
    healthValue: $('healthValue'), armourValue: $('armourValue'), hungerValue: $('hungerValue'), thirstValue: $('thirstValue'),
    speedometer: $('speedometer'), speed: $('speedValue'), fuel: $('fuelValue'), mileage: $('mileageValue'),
    notifications: $('notifications'), gameText: $('gameText'),
    overlay: $('dialogOverlay'), dialogTitle: $('dialogTitle'), dialogBody: $('dialogBody'), dialogActions: $('dialogActions'),
    dialogClose: $('dialogClose'), readyButton: $('readyButton')
  };

  const DIALOG_STYLE_MSGBOX = 0;
  const DIALOG_STYLE_INPUT = 1;
  const DIALOG_STYLE_LIST = 2;
  const DIALOG_STYLE_PASSWORD = 3;
  const DIALOG_STYLE_TABLIST = 4;
  const DIALOG_STYLE_TABLIST_HEADERS = 5;

  function clamp(n, min = 0, max = 100) {
    n = Number(n || 0);
    return Math.max(min, Math.min(max, n));
  }

  function money(n) {
    n = Number(n || 0);
    return '$' + n.toLocaleString('en-US');
  }

  function parseJson(input) {
    if (!input) return {};
    if (typeof input === 'object') return input;
    try { return JSON.parse(String(input)); } catch (_) { return {}; }
  }

  function cleanSampText(text) {
    return String(text ?? '')
      .replace(/\{[0-9a-fA-F]{6}\}/g, '')
      .replace(/~n~/gi, '\n')
      .replace(/~r~/gi, '')
      .replace(/~g~/gi, '')
      .replace(/~b~/gi, '')
      .replace(/~y~/gi, '')
      .replace(/~w~/gi, '')
      .replace(/~h~/gi, '')
      .replace(/\t/g, '    ');
  }

  function sendToPawn(event, payload = {}) {
    const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const candidates = [
      () => window.cef && typeof window.cef.emit === 'function' && window.cef.emit(event, json),
      () => window.cef && typeof window.cef.send === 'function' && window.cef.send(event, json),
      () => window.CEF && typeof window.CEF.emit === 'function' && window.CEF.emit(event, json),
      () => window.sampcef && typeof window.sampcef.emit === 'function' && window.sampcef.emit(event, json),
      () => window.HolyAndroid && typeof window.HolyAndroid.sendCefEvent === 'function' && window.HolyAndroid.sendCefEvent(event, json),
      () => window.Android && typeof window.Android.sendCefEvent === 'function' && window.Android.sendCefEvent(event, json),
      () => window.Android && typeof window.Android.onCefClientEvent === 'function' && window.Android.onCefClientEvent(event, json),
      () => window.external && typeof window.external.invoke === 'function' && window.external.invoke(JSON.stringify({ event, json })),
      () => typeof window.cef_emit === 'function' && window.cef_emit(event, json),
      () => typeof window.sendCefEvent === 'function' && window.sendCefEvent(event, json)
    ];

    for (const fn of candidates) {
      try {
        const result = fn();
        if (result !== false && result !== undefined) return true;
      } catch (_) {}
    }

    console.log('[CEF->PAWN]', event, json);
    return false;
  }

  function receiveFromPawn(event, payload) {
    const data = parseJson(payload);
    switch (event) {
      case 'cef:bootstrap': return onBootstrap(data);
      case 'notification:push': return pushNotification(data);
      case 'gametext:show': return showGameText(data);
      case 'hud:update': return updateHud(data);
      case 'dialog:show': return showDialog(data);
      case 'dialog:hide': return hideDialog(false);
      default:
        console.log('[PAWN->CEF]', event, data);
    }
  }

  function bindNativeReceivers() {
    window.HolyCEF = { receive: receiveFromPawn, emit: sendToPawn, ready };
    window.CefEvent = receiveFromPawn;
    window.onCefEvent = receiveFromPawn;
    window.dispatchCefEvent = receiveFromPawn;
    window.receiveCefEvent = receiveFromPawn;

    window.addEventListener('message', (e) => {
      const data = parseJson(e.data);
      if (data.event) receiveFromPawn(data.event, data.json ?? data.payload ?? data.data ?? {});
    });

    if (window.cef && typeof window.cef.on === 'function') {
      ['cef:bootstrap', 'notification:push', 'gametext:show', 'hud:update', 'dialog:show', 'dialog:hide'].forEach((name) => {
        try { window.cef.on(name, (payload) => receiveFromPawn(name, payload)); } catch (_) {}
      });
    }
  }

  function ready() {
    el.fakeStatus.value = 'UI ready';
    sendToPawn('cef:ready', { version: 'holy-fivem-ui', time: Date.now() });
    setTimeout(() => el.boot.classList.add('minimized'), 900);
  }

  function onBootstrap(data) {
    state.server = data.server || 'Holy Roleplay';
    state.version = data.version || 'Mobile CEF';
    el.serverName.textContent = state.server;
    el.serverVersion.textContent = state.version;
    el.hudServer.textContent = state.server;
    el.hudVersion.textContent = state.version;
    el.fakePlayer.value = data.player || 'Connected';
    el.fakeStatus.value = 'Server connected';
    setTimeout(() => el.boot.classList.add('minimized'), 650);
  }

  function pushNotification(data) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<strong>${data.broadcast ? 'Broadcast' : 'Notification'}</strong><p>${escapeHtml(cleanSampText(data.message || data.text || ''))}</p>`;
    el.notifications.prepend(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-10px)'; }, data.time || 5200);
    setTimeout(() => toast.remove(), (data.time || 5200) + 450);
  }

  function showGameText(data) {
    el.gameText.textContent = cleanSampText(data.text || '');
    el.gameText.classList.remove('hidden');
    clearTimeout(showGameText.timer);
    showGameText.timer = setTimeout(() => el.gameText.classList.add('hidden'), Number(data.time || 3000));
  }

  function updateHud(data) {
    el.money.textContent = money(data.money);
    el.bank.textContent = money(data.bank);
    el.level.textContent = data.level ?? 1;
    el.exp.textContent = data.exp ?? 0;
    el.wanted.textContent = data.wanted ?? 0;

    setBar(el.healthBar, el.healthValue, data.health);
    setBar(el.armourBar, el.armourValue, data.armour);
    setBar(el.hungerBar, el.hungerValue, data.hunger);
    setBar(el.thirstBar, el.thirstValue, data.thirst);

    const veh = data.vehicle || {};
    if (veh.active) {
      el.speedometer.classList.remove('hidden');
      el.speed.textContent = Math.round(Number(veh.speed || 0));
      el.fuel.textContent = Math.round(Number(veh.fuel || 0));
      el.mileage.textContent = Number(veh.mileage || 0).toFixed(1);
    } else {
      el.speedometer.classList.add('hidden');
    }
  }

  function setBar(bar, text, value) {
    const v = clamp(value);
    bar.style.width = v + '%';
    text.textContent = Math.round(v);
  }

  function showDialog(data) {
    state.dialog = data;
    state.selectedIndex = 0;
    el.dialogTitle.textContent = cleanSampText(data.caption || 'Dialog');
    el.dialogBody.innerHTML = '';
    el.dialogActions.innerHTML = '';

    const style = Number(data.style || 0);
    const info = cleanSampText(data.info || '');

    if (style === DIALOG_STYLE_LIST || style === DIALOG_STYLE_TABLIST || style === DIALOG_STYLE_TABLIST_HEADERS || data.isList) {
      renderList(info, style === DIALOG_STYLE_TABLIST_HEADERS);
    } else if (style === DIALOG_STYLE_INPUT || style === DIALOG_STYLE_PASSWORD) {
      const text = document.createElement('div');
      text.className = 'dialog-text';
      text.textContent = info;
      const input = document.createElement('input');
      input.id = 'dialogInput';
      input.className = 'dialog-input';
      input.type = style === DIALOG_STYLE_PASSWORD ? 'password' : 'text';
      input.placeholder = 'Ketik di sini...';
      input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') submitDialog(1); });
      el.dialogBody.append(text, input);
      setTimeout(() => input.focus(), 50);
    } else {
      const text = document.createElement('div');
      text.className = 'dialog-text';
      text.textContent = info;
      el.dialogBody.append(text);
    }

    addActions(data.button1 || 'Pilih', data.button2 || 'Tutup');
    el.overlay.classList.remove('hidden');
  }

  function renderList(info, hasHeader) {
    const list = document.createElement('div');
    list.className = 'dialog-list';
    const lines = info.split('\n').map(x => x.trim()).filter(Boolean);
    const rows = hasHeader && lines.length > 1 ? lines.slice(1) : lines;

    rows.forEach((line, index) => {
      const row = document.createElement('div');
      row.className = 'dialog-item' + (index === 0 ? ' active' : '');
      row.dataset.index = index;

      const parts = line.split('\t').filter(Boolean);
      if (parts.length > 1) {
        row.innerHTML = `<b>${escapeHtml(parts[0])}</b><small>${escapeHtml(parts.slice(1).join('  ·  '))}</small>`;
      } else {
        row.innerHTML = `<b>${escapeHtml(line)}</b>`;
      }

      row.addEventListener('click', () => selectRow(index, true));
      list.appendChild(row);
    });

    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'dialog-text';
      empty.textContent = 'Tidak ada data.';
      list.appendChild(empty);
    }

    el.dialogBody.append(list);
  }

  function selectRow(index, submit = false) {
    state.selectedIndex = index;
    [...el.dialogBody.querySelectorAll('.dialog-item')].forEach((node) => {
      node.classList.toggle('active', Number(node.dataset.index) === index);
    });
    if (submit) submitDialog(1);
  }

  function addActions(button1, button2) {
    if (button2) {
      const cancel = document.createElement('button');
      cancel.className = 'dialog-btn danger';
      cancel.textContent = cleanSampText(button2);
      cancel.onclick = () => submitDialog(0);
      el.dialogActions.appendChild(cancel);
    }

    const ok = document.createElement('button');
    ok.className = 'dialog-btn primary';
    ok.textContent = cleanSampText(button1 || 'OK');
    ok.onclick = () => submitDialog(1);
    el.dialogActions.appendChild(ok);
  }

  function submitDialog(response) {
    if (!state.dialog) return;
    const style = Number(state.dialog.style || 0);
    const input = $('dialogInput');
    const selected = Number(state.selectedIndex || 0);
    let inputtext = input ? input.value : '';

    if (style === DIALOG_STYLE_LIST || style === DIALOG_STYLE_TABLIST || style === DIALOG_STYLE_TABLIST_HEADERS || state.dialog.isList) {
      inputtext = String(selected + 1);
    }

    sendToPawn('dialog:response', {
      dialogid: Number(state.dialog.dialogid),
      response: Number(response),
      listitem: selected,
      index: selected,
      inputtext,
      input: inputtext
    });

    hideDialog(false);
  }

  function hideDialog(notify = true) {
    if (notify && state.dialog) {
      sendToPawn('dialog:close', { dialogid: Number(state.dialog.dialogid) });
    }
    state.dialog = null;
    el.overlay.classList.add('hidden');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[s]));
  }

  document.addEventListener('keydown', (e) => {
    if (!state.dialog) return;
    if (e.key === 'Escape') submitDialog(0);
    if (e.key === 'Enter') submitDialog(1);
    if (e.key === 'ArrowDown') selectRow(Math.min(state.selectedIndex + 1, el.dialogBody.querySelectorAll('.dialog-item').length - 1));
    if (e.key === 'ArrowUp') selectRow(Math.max(state.selectedIndex - 1, 0));
  });

  el.dialogClose.onclick = () => submitDialog(0);
  el.readyButton.onclick = ready;

  bindNativeReceivers();
  document.addEventListener('DOMContentLoaded', ready);
  if (document.readyState !== 'loading') ready();
})();
