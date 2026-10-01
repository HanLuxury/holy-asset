(() => {
  'use strict';

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

  /** Safe SA-MP text renderer: supports {RRGGBB}, ~n~, basic ~r~/~g~ colors and [F] keycaps. */
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
        flush();
        target.appendChild(document.createElement('br'));
        i += 3;
        continue;
      }

      if (text[i] === '\n') {
        flush();
        target.appendChild(document.createElement('br'));
        i++;
        continue;
      }

      if (text[i] === '{') {
        const end = text.indexOf('}', i + 1);
        const hex = end > i ? text.slice(i + 1, end) : '';
        if (/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
          flush();
          color = `#${hex.slice(0, 6)}`;
          i = end + 1;
          continue;
        }
      }

      if (text[i] === '~' && i + 2 < text.length && text[i + 2] === '~') {
        const map = {
          r: '#ff526d', g: '#25e3a1', b: '#459cff', y: '#f7c94b',
          p: '#a78bfa', w: '#f4f7fb'
        };
        const mapped = map[text[i + 1].toLowerCase()];
        if (mapped) {
          flush();
          color = mapped;
          i += 3;
          continue;
        }
      }

      // [F], [H], [E], [ENTER], etc become keycaps.
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

  // ================================================================
  // APP: label - replacement for CreateDynamic3DTextLabel
  // ================================================================
  Cef.registerApp('label', ctx => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'world-label';

    const apply = data => {
      renderSampText(button, data.text ?? '', data.color);
      button.dataset.clickEvent = data.clickEvent || 'label_click';
      button.dataset.labelId = data.labelId ?? -1;
    };

    button.addEventListener('pointerdown', () => button.classList.add('is-pressed'));
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
      button.addEventListener(type, () => button.classList.remove('is-pressed'));
    });
    button.addEventListener('click', event => {
      event.preventDefault();
      ctx.emit(button.dataset.clickEvent || 'label_click', {
        kind: 'dynamic3dtextlabel',
        objectId: ctx.objectId,
        labelId: Number(button.dataset.labelId || -1)
      });
    });

    return {
      mount(data) {
        ctx.root.replaceChildren(button);
        apply(data);
      },
      update(data) { apply(data); }
    };
  });


  // ================================================================
  // APP: pickup - transparent FiveM-style pickup marker.
  // It is deliberately visually light: the GTA pickup model remains the
  // gameplay object; this HTML surface is only the touch/facing overlay.
  // ================================================================
  Cef.registerApp('pickup', ctx => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pickup-marker';

    const halo = document.createElement('span');
    halo.className = 'pickup-halo';
    const key = document.createElement('span');
    key.className = 'cef-key pickup-key';
    const label = document.createElement('span');
    label.className = 'pickup-label';
    button.append(halo, key, label);

    const apply = data => {
      key.textContent = String(data.key || 'F').toUpperCase();
      label.textContent = data.label || 'Interaksi';
      button.dataset.pickupId = data.pickupId ?? -1;
      button.dataset.model = data.model ?? 0;
    };

    button.addEventListener('pointerdown', () => button.classList.add('is-pressed'));
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
      button.addEventListener(type, () => button.classList.remove('is-pressed'));
    });
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

  // ================================================================
  // APP: panel - generic reusable world UI for future systems.
  // Data example:
  // { eyebrow:'DEALER', title:'Vehicle Dealer', description:'...',
  //   actions:[{id:'open',label:'Open'},{id:'close',label:'Close',danger:true}] }
  // ================================================================
  Cef.registerApp('panel', ctx => {
    const panel = document.createElement('section');
    panel.className = 'cef-card ui-panel';
    const eyebrow = document.createElement('div'); eyebrow.className = 'ui-eyebrow';
    const title = document.createElement('div'); title.className = 'ui-title';
    const desc = document.createElement('div'); desc.className = 'ui-description';
    const actions = document.createElement('div'); actions.className = 'ui-actions';
    panel.append(eyebrow, title, desc, actions);

    const apply = data => {
      eyebrow.textContent = data.eyebrow || 'RP EAGLE';
      title.textContent = data.title || 'World UI';
      desc.textContent = data.description || '';
      actions.replaceChildren();
      const list = Array.isArray(data.actions) ? data.actions : [];
      list.forEach(action => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `ui-btn${action.danger ? ' danger' : ''}`;
        btn.textContent = action.label || action.id || 'Action';
        btn.addEventListener('click', () => {
          ctx.emit(action.event || 'ui:action', {
            action: action.id || '',
            objectId: ctx.objectId,
            payload: action.payload || {}
          });
        });
        actions.appendChild(btn);
      });
    };

    return {
      mount(data) { ctx.root.replaceChildren(panel); apply(data); },
      update(data) { apply(data); }
    };
  });

  // Add future features below with Cef.registerApp('atm', ctx => ({...})).
})();
