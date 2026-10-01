(() => {
  'use strict';

  const listeners = new Map();
  const apps = new Map();
  const root = () => document.getElementById('cef3d-root');

  let currentAppName = null;
  let currentApp = null;
  let currentData = {};

  function parsePayload(payload) {
    if (typeof payload !== 'string') return payload ?? {};
    try { return JSON.parse(payload); } catch (_) { return payload; }
  }

  function dispatch(event, data) {
    const set = listeners.get(event);
    if (set) {
      [...set].forEach(fn => {
        try { fn(data); } catch (e) { console.error('[CEF3D]', event, e); }
      });
    }
    window.dispatchEvent(new CustomEvent(`cef:${event}`, { detail: data }));
  }

  function bridgeEmit(event, data) {
    try {
      if (!window.CefBridge || !window.CefBridge.sendClientEvent) return false;
      const json = typeof data === 'string' ? data : JSON.stringify(data ?? {});
      window.CefBridge.sendClientEvent(String(event), json);
      return true;
    } catch (e) {
      console.error('[CEF3D] emit failed', e);
      return false;
    }
  }

  function destroyCurrent() {
    if (currentApp && typeof currentApp.destroy === 'function') {
      try { currentApp.destroy(); } catch (e) { console.error(e); }
    }
    currentAppName = null;
    currentApp = null;
    currentData = {};
    const el = root();
    if (el) el.replaceChildren();
  }

  function mount(name, data = {}) {
    const factory = apps.get(String(name));
    if (!factory) {
      console.warn(`[CEF3D] app '${name}' is not registered`);
      return false;
    }

    destroyCurrent();
    currentAppName = String(name);
    currentData = data && typeof data === 'object' ? data : {};

    const context = {
      root: root(),
      objectId: objectId(),
      emit: bridgeEmit,
      close: () => bridgeEmit('ui:close', { app: currentAppName }),
      getData: () => currentData
    };

    currentApp = factory(context) || {};
    if (typeof currentApp.mount === 'function') currentApp.mount(currentData);
    return true;
  }

  function update(data = {}) {
    if (!currentApp) return false;
    if (data && typeof data === 'object') currentData = { ...currentData, ...data };
    if (typeof currentApp.update === 'function') currentApp.update(currentData, data);
    return true;
  }

  function objectId() {
    try {
      return window.CefBridge && window.CefBridge.getObjectId
        ? window.CefBridge.getObjectId()
        : -1;
    } catch (_) {
      return -1;
    }
  }

  window.Cef = {
    on(event, callback) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(callback);
      return () => this.off(event, callback);
    },

    off(event, callback) {
      const set = listeners.get(event);
      if (!set) return;
      set.delete(callback);
      if (!set.size) listeners.delete(event);
    },

    emit: bridgeEmit,

    _trigger(event, json) {
      const data = parsePayload(json);
      dispatch(event, data);
    },

    registerApp(name, factory) {
      if (!name || typeof factory !== 'function') throw new Error('registerApp(name, factory)');
      apps.set(String(name), factory);
      return this;
    },

    mount,
    update,
    unmount: destroyCurrent,
    objectId,
    currentApp: () => currentAppName
  };

  // Generic server -> UI contract.
  Cef.on('ui:open', payload => {
    if (!payload || typeof payload !== 'object') return;
    mount(payload.app, payload.data || {});
  });

  Cef.on('ui:update', payload => update(payload || {}));
  Cef.on('ui:close', () => destroyCurrent());

  // Backward-compatible label event.
  Cef.on('label:set', payload => {
    if (currentAppName !== 'label') mount('label', payload || {});
    else update(payload || {});
  });

  const ready = () => {
    try {
      if (window.CefBridge && window.CefBridge.cefReady) window.CefBridge.cefReady();
    } catch (e) {
      console.error('[CEF3D] ready failed', e);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();
