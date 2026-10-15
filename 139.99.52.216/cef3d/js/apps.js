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

  // The native RPC 116 supplies the literal SA-MP label text. No generated
  // title is attached: only the source text is rendered. A separate tap button
  // appears when the gamemode confirms an actionable label at close range.
  CefWorld.registerApp('label', ctx => {
    const card = document.createElement('div');
    card.className = 'world-label';
    const line = document.createElement('span');
    line.className = 'world-label-content';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'world-label-tap';
    button.dataset.cefInteractive = '1';
    button.setAttribute('aria-label', 'Buka aksi label');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.2 12S5.7 6 12 6s9.8 6 9.8 6-3.5 6-9.8 6S2.2 12 2.2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    button.hidden = true;
    card.append(line, button);
    const apply = data => {
      applyViewport(ctx, data, {
        width: 470, height: 128, anchorX: 0.5, anchorY: 0.86,
        minScale: 0.72, maxScale: 1.14, distanceScale: true, near: 1.0, far: 7.0
      });
      renderSampText(line, data.text ?? '', data.color);
      button.hidden = !Boolean(Number(data.clickable || 0));
      button.dataset.clickEvent = 'label_click';
      button.dataset.labelId = data.labelId ?? -1;
      ctx.syncInteractiveAreas();
    };
    button.addEventListener('click', event => {
      event.preventDefault();
      if (button.hidden) return;
      ctx.emit('label_click', {
        kind: 'dynamic3dtextlabel', objectId: ctx.objectId,
        labelId: Number(button.dataset.labelId || -1)
      });
    });
    return {
      mount(data) { ctx.root.replaceChildren(card); apply(data); },
      update(data) { apply(data); }
    };
  });

  // FiveM-style animated world marker for pickups. The server may supply
  // nearby label text and a variant hint so special pickups (garage, shop, job)
  // can show distinct icons without inventing a generic "Pickup" title.
  CefWorld.registerApp('pickup', ctx => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pickup-marker pickup-fivem';
    button.dataset.cefInteractive = '1';

    const orb = document.createElement('span');
    orb.className = 'pickup-orb';
    const ring = document.createElement('span');
    ring.className = 'pickup-ring';
    const iconWrap = document.createElement('span');
    iconWrap.className = 'pickup-icon-wrap';
    const icon = document.createElement('span');
    icon.className = 'pickup-icon';
    iconWrap.append(icon);
    orb.append(ring, iconWrap);

    const bubble = document.createElement('span');
    bubble.className = 'pickup-bubble';
    const title = document.createElement('span');
    title.className = 'pickup-title';
    const sub = document.createElement('span');
    sub.className = 'pickup-sub';
    bubble.append(title, sub);

    button.append(orb, bubble);

    const iconSvg = variant => {
      switch (Number(variant || 0)) {
        case 1: return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 13.5 5.2 9a2.1 2.1 0 0 1 2-1.4h9.6a2.1 2.1 0 0 1 2 1.4l1.7 4.5"/><path d="M4 13.5h16v3.2A1.3 1.3 0 0 1 18.7 18H17v1.2a.8.8 0 0 1-.8.8h-.4a.8.8 0 0 1-.8-.8V18H9v1.2a.8.8 0 0 1-.8.8h-.4a.8.8 0 0 1-.8-.8V18H5.3A1.3 1.3 0 0 1 4 16.7Z"/><circle cx="7.7" cy="15.8" r="1"/><circle cx="16.3" cy="15.8" r="1"/></svg>';
        case 2: return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5-9 4.5Z"/><path d="M3 7.5V16.5L12 21l9-4.5V7.5"/><path d="M12 12v9"/></svg>';
        case 3: return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="M6 20V9l6-4 6 4v11"/><path d="M9 20v-4h6v4"/></svg>';
        case 4: return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M6 10.5V20h12v-9.5"/><path d="M10 20v-5h4v5"/></svg>';
        case 5: return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';
        case 6: return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 8.5 12 4l7.5 4.5V17L12 20 4.5 17Z"/><path d="M12 12 19.5 8.5"/><path d="M12 12 4.5 8.5"/><path d="M12 12v8"/></svg>';
        default: return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3.4"/></svg>';
      }
    };

    const subtitle = variant => {
      switch (Number(variant || 0)) {
        case 1: return 'Garasi Kendaraan';
        case 2: return 'Dealer Kendaraan';
        case 3: return 'Aksi Pekerjaan';
        case 4: return 'Interaksi Properti';
        case 5: return 'Belanja / Interaksi';
        case 6: return 'Ambil Interaksi';
        default: return 'Interaksi';
      }
    };

    const apply = data => {
      applyViewport(ctx, data, {
        width: 290, height: 108, anchorX: 0.5, anchorY: 0.9,
        minScale: 0.72, maxScale: 1.14, distanceScale: true, near: 1.0, far: 6.4
      });
      const caption = typeof data.label === 'string' ? data.label.trim() : '';
      const variant = Number(data.variant || 0);
      button.dataset.pickupId = data.pickupId ?? -1;
      button.dataset.model = data.model ?? 0;
      button.dataset.variant = variant;
      icon.innerHTML = iconSvg(variant);
      title.textContent = caption || subtitle(variant);
      sub.textContent = caption ? subtitle(variant) : 'Tekan untuk interaksi';
      bubble.classList.toggle('is-hidden', !caption && variant === 0);
      button.setAttribute('aria-label', caption || subtitle(variant) || 'Aksi pickup');
    };

    button.addEventListener('click', event => {
      event.preventDefault();
      ctx.emit('pickup_click', {
        kind: 'dynamicpickup', objectId: ctx.objectId,
        pickupId: Number(button.dataset.pickupId || -1),
        model: Number(button.dataset.model || 0),
        variant: Number(button.dataset.variant || 0)
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
