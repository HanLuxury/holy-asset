(() => {
  'use strict';

  const appFactories = new Map();
  const instances = new Map();
  const worldRoot = document.getElementById('cef3d-world-root');

  const DEFAULT_LAYOUT = Object.freeze({
    width: 480,
    height: 180,
    anchorX: 0.5,
    anchorY: 1.0,
    minScale: 0.45,
    maxScale: 1.35,
    distanceScale: true,
    near: 2.0,
    far: 24.0
  });

  let rectSyncQueued = false;

  function parsePayload(payload) {
    if (payload == null || payload === '') return {};
    if (typeof payload !== 'string') return payload;
    try { return JSON.parse(payload); } catch (_) { return payload; }
  }

  function clamp(v, lo, hi) {
    v = Number(v);
    return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo;
  }

  function ensureInstance(id) {
    id = Number(id);
    if (!Number.isFinite(id) || id < 0) return null;
    if (instances.has(id)) return instances.get(id);

    const node = document.createElement('section');
    node.className = 'world-item is-hidden';
    node.dataset.worldId = String(id);
    node.dataset.focused = '1';

    const root = document.createElement('div');
    root.className = 'world-ui-root';
    root.dataset.worldId = String(id);
    node.appendChild(root);
    worldRoot.appendChild(node);

    const inst = {
      id,
      node,
      root,
      appName: null,
      app: null,
      data: {},
      layout: { ...DEFAULT_LAYOUT },
      frame: null,
      visible: false,
      focused: true,
      listeners: new Map()
    };
    instances.set(id, inst);
    applyLayout(inst);
    return inst;
  }

  function applyLayout(inst) {
    const l = inst.layout;
    inst.root.style.width = `${Math.round(l.width)}px`;
    inst.root.style.height = `${Math.round(l.height)}px`;
    inst.node.style.transformOrigin = `${l.anchorX * 100}% ${l.anchorY * 100}%`;
  }

  function setViewport(inst, config = {}) {
    const old = inst.layout || DEFAULT_LAYOUT;
    const next = {
      width: clamp(config.width ?? old.width, 48, 1920),
      height: clamp(config.height ?? old.height, 36, 1200),
      anchorX: clamp(config.anchorX ?? old.anchorX, 0, 1),
      anchorY: clamp(config.anchorY ?? old.anchorY, 0, 1),
      minScale: clamp(config.minScale ?? old.minScale, 0.05, 10),
      maxScale: clamp(config.maxScale ?? old.maxScale, 0.05, 10),
      distanceScale: config.distanceScale ?? old.distanceScale,
      near: Math.max(0, Number(config.near ?? old.near) || 0),
      far: Math.max(0.01, Number(config.far ?? old.far) || 0.01)
    };
    if (next.maxScale < next.minScale) next.maxScale = next.minScale;
    if (next.far <= next.near) next.far = next.near + 0.01;
    inst.layout = next;
    applyLayout(inst);
    applyFrame(inst);
    queueInteractiveSync();
  }

  function emit(id, event, data) {
    try {
      if (!window.CefBridge?.sendClientEvent) return false;
      const json = typeof data === 'string' ? data : JSON.stringify(data ?? {});
      window.CefBridge.sendClientEvent(Number(id), String(event), json);
      return true;
    } catch (e) {
      console.error('[CEF3D] emit failed', e);
      return false;
    }
  }

  function on(inst, event, callback) {
    if (!inst.listeners.has(event)) inst.listeners.set(event, new Set());
    inst.listeners.get(event).add(callback);
    return () => off(inst, event, callback);
  }

  function off(inst, event, callback) {
    const set = inst.listeners.get(event);
    if (!set) return;
    set.delete(callback);
    if (!set.size) inst.listeners.delete(event);
  }

  function dispatch(inst, event, data) {
    const set = inst.listeners.get(event);
    if (set) {
      [...set].forEach(fn => {
        try { fn(data); } catch (e) { console.error('[CEF3D]', inst.id, event, e); }
      });
    }
    window.dispatchEvent(new CustomEvent(`cef3d:${event}`, {
      detail: { id: inst.id, data }
    }));
  }

  function destroyApp(inst) {
    if (inst.app && typeof inst.app.destroy === 'function') {
      try { inst.app.destroy(); } catch (e) { console.error(e); }
    }
    inst.appName = null;
    inst.app = null;
    inst.data = {};
    inst.listeners.clear();
    inst.root.replaceChildren();
    queueInteractiveSync();
  }

  function mount(id, appName, data = {}) {
    const inst = ensureInstance(id);
    const factory = appFactories.get(String(appName));
    if (!inst || !factory) {
      console.warn(`[CEF3D] app '${appName}' is not registered for id=${id}`);
      return false;
    }

    destroyApp(inst);
    inst.appName = String(appName);
    inst.data = data && typeof data === 'object' ? data : {};

    const ctx = {
      id: inst.id,
      objectId: inst.id,
      root: inst.root,
      emit: (event, payload) => emit(inst.id, event, payload),
      viewport: config => setViewport(inst, config || {}),
      on: (event, cb) => on(inst, event, cb),
      off: (event, cb) => off(inst, event, cb),
      syncInteractiveAreas: queueInteractiveSync,
      close: () => emit(inst.id, 'ui:close', { app: inst.appName }),
      getData: () => inst.data
    };

    try {
      inst.app = factory(ctx) || {};
      if (typeof inst.app.mount === 'function') inst.app.mount(inst.data);
    } catch (e) {
      console.error('[CEF3D] mount failed', inst.id, appName, e);
      return false;
    }

    applyFrame(inst);
    queueInteractiveSync();
    return true;
  }

  function update(id, patch = {}) {
    const inst = ensureInstance(id);
    if (!inst || !inst.app) return false;
    if (patch && typeof patch === 'object') inst.data = { ...inst.data, ...patch };
    if (typeof inst.app.update === 'function') {
      try { inst.app.update(inst.data, patch); } catch (e) { console.error(e); }
    }
    applyFrame(inst);
    queueInteractiveSync();
    return true;
  }

  function remove(id) {
    const inst = instances.get(Number(id));
    if (!inst) return;
    destroyApp(inst);
    inst.node.remove();
    instances.delete(Number(id));
    queueInteractiveSync();
  }

  function clear() {
    [...instances.keys()].forEach(remove);
  }

  function applyFrame(inst) {
    const f = inst.frame;
    if (!f || !f.visible) {
      inst.visible = false;
      inst.node.classList.add('is-hidden');
      return;
    }

    inst.visible = true;
    inst.focused = f.focused !== false;
    inst.node.dataset.focused = inst.focused ? '1' : '0';
    inst.node.classList.remove('is-hidden');

    const l = inst.layout;
    let distanceScale = 1;
    if (l.distanceScale) {
      const t = clamp((Number(f.distance || 0) - l.near) / Math.max(0.01, l.far - l.near), 0, 1);
      distanceScale = 1 - 0.45 * t;
    }

    const finalScale = clamp((Number(f.scale) || 1) * distanceScale, l.minScale, l.maxScale);
    const x = (Number(f.nx) || 0) * window.innerWidth;
    const y = (Number(f.ny) || 0) * window.innerHeight;

    inst.node.style.left = `${x}px`;
    inst.node.style.top = `${y}px`;
    inst.node.style.transform = `translate(${-l.anchorX * 100}%, ${-l.anchorY * 100}%) scale(${finalScale})`;
    inst.node.style.zIndex = String(Math.max(1, 100000 - Math.floor((Number(f.distance) || 0) * 100)));
  }

  function applyFrames(frames) {
    if (!Array.isArray(frames)) return;
    frames.forEach(f => {
      const inst = ensureInstance(f?.id);
      if (!inst) return;
      inst.frame = f;
      applyFrame(inst);
    });
    queueInteractiveSync();
  }

  function queueInteractiveSync() {
    if (rectSyncQueued) return;
    rectSyncQueued = true;
    requestAnimationFrame(() => {
      rectSyncQueued = false;
      syncInteractiveAreas();
    });
  }

  function syncInteractiveAreas() {
    try {
      if (!window.CefBridge?.updateInteractiveAreas) return;
      const selectors = [
        'button', 'a[href]', 'input', 'select', 'textarea', 'iframe',
        '[role="button"]', '[data-cef-interactive]'
      ];
      const rects = [];

      instances.forEach(inst => {
        if (!inst.visible || !inst.focused) return;
        inst.root.querySelectorAll(selectors.join(',')).forEach(el => {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') return;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) return;
          rects.push({ id: inst.id, x: r.left, y: r.top, w: r.width, h: r.height });
        });
      });

      window.CefBridge.updateInteractiveAreas(JSON.stringify({
        vw: window.innerWidth,
        vh: window.innerHeight,
        rects
      }));
    } catch (e) {
      console.error('[CEF3D] interactive rect sync failed', e);
    }
  }

  function trigger(id, event, json) {
    const inst = ensureInstance(id);
    if (!inst) return false;
    const data = parsePayload(json);

    switch (String(event)) {
      case 'ui:open':
        if (data && typeof data === 'object') return mount(inst.id, data.app, data.data || {});
        return false;
      case 'ui:update':
        return update(inst.id, data && typeof data === 'object' ? data : {});
      case 'ui:close':
        destroyApp(inst);
        return true;
      case 'label:set':
        if (inst.appName !== 'label') return mount(inst.id, 'label', data || {});
        return update(inst.id, data || {});
      case 'world:url':
        return mount(inst.id, 'web', data || {});
      case 'world:mode':
        inst.mode = Number(data?.mode ?? 0) || 0;
        dispatch(inst, 'world:mode', data || {});
        return true;
      default:
        dispatch(inst, String(event), data);
        return true;
    }
  }

  window.CefWorld = {
    registerApp(name, factory) {
      if (!name || typeof factory !== 'function') throw new Error('registerApp(name, factory)');
      appFactories.set(String(name), factory);
      return this;
    },
    mount,
    update,
    remove,
    clear,
    emit,
    get: id => instances.get(Number(id)) || null,
    syncInteractiveAreas,

    // Native/Java entry points.
    _trigger: trigger,
    _frames: applyFrames,
    _remove: remove,
    _clear: clear
  };

  // Familiar CEFUI-style registry alias for feature files.
  window.Cef = window.CefWorld;

  window.addEventListener('resize', () => {
    instances.forEach(applyFrame);
    queueInteractiveSync();
  });

  const ready = () => {
    try { window.CefBridge?.cefReady?.(); }
    catch (e) { console.error('[CEF3D] ready failed', e); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();
