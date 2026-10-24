(() => {
  'use strict';

  function applyViewport(ctx, data, defaults) {
    const custom = data && typeof data.viewport === 'object' ? data.viewport : {};
    ctx.viewport({ ...defaults, ...custom });
  }

  // V151: accept legacy label RPCs without creating visible text or touch
  // controls. Source labels remain on the server for validated eye actions.
  CefWorld.registerApp('label', ctx => ({
    mount() { ctx.root.replaceChildren(); ctx.syncInteractiveAreas(); },
    update() { ctx.root.replaceChildren(); ctx.syncInteractiveAreas(); }
  }));

  // FiveM-style animated world marker for pickups. The server may supply
  // nearby label text and a variant hint so special pickups (garage, shop, job)
  // can show distinct icons without inventing a generic "Pickup" title.
  CefWorld.registerApp('pickup', ctx => {
    const slot = document.createElement('div');
    slot.className = 'pickup3d-slot';
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
    slot.append(button);

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
        width: 280, height: 64, anchorX: 22 / 280, anchorY: 0.5,
        minScale: 0.85, maxScale: 1.0, distanceScale: true, near: 1.0, far: 3.5
      });
      const caption = typeof data.label === 'string' ? data.label.trim() : '';
      const variant = Number(data.variant || 0);
      button.dataset.pickupId = data.pickupId ?? -1;
      button.dataset.model = data.model ?? 0;
      button.dataset.variant = variant;
      icon.innerHTML = EYE_SVG;
      title.textContent = caption || subtitle(variant);
      sub.textContent = caption ? subtitle(variant) : 'Tekan untuk interaksi';
      bubble.classList.toggle('is-hidden', !caption);
      sub.hidden = true;
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
      mount(data) { ctx.root.replaceChildren(slot); apply(data); },
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

  // ------------------------------------------------------------------
  // EYE: FiveM "third-eye" target anchored at a world interaction point.
  // Server data: { t:title, near:0|1, sig:number,
  //                o:[{ t:text, k:"F"|"ALT"|"", c:0 key|1 command|2 target|3 item }] }
  // Far away  -> small dim eye (not touchable).
  // In range  -> glowing eye; tap opens the option list; tap an option -> server.
  // ------------------------------------------------------------------
  const EYE_SVG = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor"><path fill-rule="evenodd" d="M1 12s3.8-8 11-8 11 8 11 8-3.8 8-11 8S1 12 1 12Zm11-5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/></svg>';
  const EYE_ICONS = {
    1: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 4 4-4 4"/><path d="M12 17h7"/></svg>',
    2: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>',
    3: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5-9 4.5Z"/><path d="M3 7.5v9L12 21l9-4.5v-9"/></svg>'
  };

  CefWorld.registerApp('eye', ctx => {
    const wrap = document.createElement('div');
    wrap.className = 'eye3d';
    const orb = document.createElement('button');
    orb.type = 'button';
    orb.className = 'eye3d-orb';
    orb.setAttribute('aria-label', 'Interaksi');
    orb.innerHTML = '<span class="eye3d-icon">' + EYE_SVG + '</span>';
    const side = document.createElement('div');
    side.className = 'eye3d-side';
    const tag = document.createElement('div');
    tag.className = 'eye3d-tag';
    const menu = document.createElement('div');
    menu.className = 'eye3d-menu';
    side.append(tag, menu);
    wrap.append(orb, side);

    let data = {};
    let open = false;
    let busyUntil = 0;

    const options = () => (Array.isArray(data.o) ? data.o : []).slice(0, 8);
    const isNear = () => Number(data.near || 0) === 1 && options().length > 0;

    const setOpen = value => {
      open = Boolean(value) && isNear();
      render();
    };

    const renderMenu = () => {
      menu.replaceChildren();
      options().forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'eye3d-opt';
        btn.dataset.cefInteractive = '1';
        const badge = document.createElement('span');
        const key = String(opt.k || '').trim();
        if (key) {
          badge.className = 'eye3d-key';
          badge.textContent = key.toUpperCase();
        } else {
          badge.className = 'eye3d-glyph';
          badge.innerHTML = EYE_ICONS[Number(opt.c || 2)] || EYE_ICONS[2];
        }
        const text = document.createElement('span');
        text.className = 'eye3d-text';
        text.textContent = String(opt.t || 'Pilih');
        btn.append(badge, text);
        btn.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          const now = Date.now();
          if (now < busyUntil) return;
          busyUntil = now + 600;
          btn.classList.add('is-sent');
          ctx.emit('eye_select', { i: index, sig: Number(data.sig || 0) });
          setOpen(false);
        });
        menu.appendChild(btn);
      });
    };

    const render = () => {
      const near = isNear();
      if (!near) open = false;
      wrap.dataset.near = near ? '1' : '0';
      wrap.dataset.open = open ? '1' : '0';
      tag.textContent = String(data.t || '');
      tag.hidden = !near || open || !tag.textContent;
      if (near) orb.dataset.cefInteractive = '1';
      else delete orb.dataset.cefInteractive;
      menu.hidden = !open;
      if (open) renderMenu(); else menu.replaceChildren();
      orb.setAttribute('aria-expanded', String(open));
      ctx.syncInteractiveAreas();
    };

    // Scale/opacity animate in; report the final touch box once it settles.
    orb.addEventListener('transitionend', () => ctx.syncInteractiveAreas());
    orb.addEventListener('click', event => {
      event.preventDefault();
      if (!isNear()) return;
      setOpen(!open);
    });

    const apply = (next, patch) => {
      const wasNear = isNear();
      const oldSig = Number(data.sig || 0);
      data = next || {};
      applyViewport(ctx, data, {
        width: 286, height: 304, anchorX: 22 / 286, anchorY: 0.5,
        minScale: 0.85, maxScale: 1.0, distanceScale: true, near: 1.0, far: 3.5
      });
      if (isNear() && (!wasNear || Number(data.sig || 0) !== oldSig)) open = true;
      render();
      if (patch && patch.ping) orb.classList.add('is-ping');
    };

    return {
      mount(next) {
        ctx.root.replaceChildren(wrap);
        apply(next);
        // Tells the server this client renders eyes, so the old 2D prompt
        // and label tap buttons can be retired for this player.
        const now = Date.now();
        if (now - (window.__eyeReadyAt || 0) > 15000) {
          window.__eyeReadyAt = now;
          ctx.emit('eye_ready', { v: 1 });
        }
      },
      update(next, patch) { apply(next, patch); },
      destroy() { open = false; }
    };
  });

  // Add future apps below: CefWorld.registerApp('atm', ctx => ({ mount(){...} }));
})();
