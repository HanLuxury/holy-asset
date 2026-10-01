(() => {
  'use strict';

  function applyViewport(ctx, data, defaults) {
    const custom = data && typeof data.viewport === 'object' ? data.viewport : {};
    ctx.viewport({ ...defaults, ...custom });
  }

  function rgbaToCss(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '#f4f7fb';
    const u = n >>> 0;
    const r = (u >>> 24) & 255;
    const g = (u >>> 16) & 255;
    const b = (u >>> 8) & 255;
    return `rgb(${r},${g},${b})`;
  }

  function appendTextToken(parent, text, color) {
    if (!text) return;
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = text;
    parent.appendChild(span);
  }

  function renderSampText(target, input, baseColor) {
    target.replaceChildren();
    const text = String(input ?? '');
    let color = rgbaToCss(baseColor);
    let buffer = '';

    const flush = () => {
      appendTextToken(target, buffer, color);
      buffer = '';
    };

    for (let i = 0; i < text.length;) {
      if (text.startsWith('~n~', i)) {
        flush(); target.appendChild(document.createElement('br')); i += 3; continue;
      }
      if (text[i] === '\n') {
        flush(); target.appendChild(document.createElement('br')); i++; continue;
      }
      if (text[i] === '{') {
        const end = text.indexOf('}', i + 1);
        const hex = end > i ? text.slice(i + 1, end) : '';
        if (/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
          flush(); color = `#${hex.slice(0, 6)}`; i = end + 1; continue;
        }
      }
      if (text[i] === '~' && i + 2 < text.length && text[i + 2] === '~') {
        const map = { r:'#ff526d', g:'#25e3a1', b:'#459cff', y:'#f7c94b', p:'#a78bfa', w:'#f4f7fb' };
        const mapped = map[text[i + 1].toLowerCase()];
        if (mapped) { flush(); color = mapped; i += 3; continue; }
      }
      if (text[i] === '[') {
        const end = text.indexOf(']', i + 1);
        if (end > i && end - i <= 9) {
          const key = text.slice(i + 1, end);
          if (/^[A-Za-z0-9]+$/.test(key)) {
            flush();
            const el = document.createElement('span');
            el.className = 'cef-key';
            el.textContent = key.toUpperCase();
            target.appendChild(el);
            i = end + 1;
            continue;
          }
        }
      }
      buffer += text[i++];
    }
    flush();
  }

  // CreateDynamic3DTextLabel -> transparent FiveM world label.
  CefWorld.registerApp('label', ctx => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'world-label';
    button.dataset.cefInteractive = '1';

    const apply = data => {
      applyViewport(ctx, data, {
        width: 520, height: 170, anchorX: 0.5, anchorY: 0.92,
        minScale: 0.52, maxScale: 1.18, distanceScale: true, near: 2.0, far: 26.0
      });
      renderSampText(button, data.text ?? '', data.color);
      button.dataset.clickEvent = data.clickEvent || 'label_click';
      button.dataset.labelId = data.labelId ?? -1;
    };

    button.addEventListener('click', event => {
      event.preventDefault();
      ctx.emit(button.dataset.clickEvent || 'label_click', {
        kind: 'dynamic3dtextlabel',
        objectId: ctx.objectId,
        labelId: Number(button.dataset.labelId || -1)
      });
    });

    return {
      mount(data) { ctx.root.replaceChildren(button); apply(data); },
      update(data) { apply(data); }
    };
  });

  // CreateDynamicPickup -> lightweight transparent interaction marker.
  CefWorld.registerApp('pickup', ctx => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pickup-marker';
    button.dataset.cefInteractive = '1';

    const halo = document.createElement('span'); halo.className = 'pickup-halo';
    const key = document.createElement('span'); key.className = 'cef-key pickup-key';
    const label = document.createElement('span'); label.className = 'pickup-label';
    button.append(halo, key, label);

    const apply = data => {
      applyViewport(ctx, data, {
        width: 330, height: 100, anchorX: 0.5, anchorY: 0.85,
        minScale: 0.48, maxScale: 1.05, distanceScale: true, near: 2.0, far: 22.0
      });
      key.textContent = String(data.key || 'F').toUpperCase();
      label.textContent = data.label || 'Interaksi';
      button.dataset.pickupId = data.pickupId ?? -1;
      button.dataset.model = data.model ?? 0;
    };

    button.addEventListener('click', event => {
      event.preventDefault();
      ctx.emit('pickup_click', {
        kind: 'dynamicpickup',
        objectId: ctx.objectId,
        pickupId: Number(button.dataset.pickupId || -1),
        model: Number(button.dataset.model || 0)
      });
    });

    return {
      mount(data) { ctx.root.replaceChildren(button); apply(data); },
      update(data) { apply(data); }
    };
  });

  // Generic world panel for ATM/dealer/house/shop/etc.
  CefWorld.registerApp('panel', ctx => {
    const panel = document.createElement('section');
    panel.className = 'cef-card ui-panel';
    const eyebrow = document.createElement('div'); eyebrow.className = 'ui-eyebrow';
    const title = document.createElement('div'); title.className = 'ui-title';
    const desc = document.createElement('div'); desc.className = 'ui-description';
    const actions = document.createElement('div'); actions.className = 'ui-actions';
    panel.append(eyebrow, title, desc, actions);

    const apply = data => {
      applyViewport(ctx, data, {
        width: 430, height: 300, anchorX: 0.5, anchorY: 0.5,
        minScale: 0.65, maxScale: 1.35, distanceScale: false, near: 0.0, far: 40.0
      });
      eyebrow.textContent = data.eyebrow || 'RP EAGLE';
      title.textContent = data.title || 'World UI';
      desc.textContent = data.description || '';
      actions.replaceChildren();
      (Array.isArray(data.actions) ? data.actions : []).forEach(action => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `ui-btn${action.danger ? ' danger' : ''}`;
        btn.dataset.cefInteractive = '1';
        btn.textContent = action.label || action.id || 'Action';
        btn.addEventListener('click', () => ctx.emit(action.event || 'ui:action', {
          action: action.id || '', objectId: ctx.objectId, payload: action.payload || {}
        }));
        actions.appendChild(btn);
      });
    };

    return {
      mount(data) { ctx.root.replaceChildren(panel); apply(data); },
      update(data) { apply(data); }
    };
  });

  // Generic URL/YouTube surface inside the same world WebView shell.
  CefWorld.registerApp('web', ctx => {
    const frame = document.createElement('iframe');
    frame.className = 'world-web-frame';
    frame.dataset.cefInteractive = '1';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.setAttribute('allowfullscreen', '');

    const apply = data => {
      applyViewport(ctx, data, {
        width: 640, height: 360, anchorX: 0.5, anchorY: 0.5,
        minScale: 0.55, maxScale: 1.25, distanceScale: true, near: 2.0, far: 30.0
      });
      const url = String(data.url || '').trim();
      if (url && frame.src !== url) frame.src = url;
    };

    return {
      mount(data) { ctx.root.replaceChildren(frame); apply(data); },
      update(data) { apply(data); },
      destroy() { frame.src = 'about:blank'; }
    };
  });

  // Add future apps below: CefWorld.registerApp('atm', ctx => ({ mount(){...} }));
})();
