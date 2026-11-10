/* EAGLE Character Creator + Full Body Editor (v164)
   GTA V + FiveM + Where Winds Meet inspired Dark Glass Roleplay Character Creator.
   100% compatible with native LOOK v2/v164 protocol (57B & 65B hex) and Pawn look_system.inc. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, h = U.h;
  var SLOTS = 24, NO_ITEM = 65535, MODE_SHOP = 1, MODE_CREATE = 2, MODE_FREE = 3;
  var DEFAULT_MORPH = 50;

  var NAV_ITEMS = [
    { id: 'character',   t: 'Character',   ico: 'user' },
    { id: 'face',        t: 'Face',        ico: 'face' },
    { id: 'hair',        t: 'Hair',        ico: 'scissors' },
    { id: 'hair_color',  t: 'Hair Color',  ico: 'palette' },
    { id: 'eyes',        t: 'Eyes',        ico: 'eye' },
    { id: 'skin',        t: 'Skin',        ico: 'droplet' },
    { id: 'facial_hair', t: 'Facial Hair', ico: 'beard' },
    { id: 'body',        t: 'Body',        ico: 'body' },
    { id: 'clothing',    t: 'Clothing',    ico: 'shirt' },
    { id: 'accessories', t: 'Accessories', ico: 'glasses' },
    { id: 'tattoos',     t: 'Tattoos',     ico: 'tattoo' },
    { id: 'presets',     t: 'Presets',     ico: 'star' }
  ];

  var CLOTH_SLOTS = [
    { slot: -1, label: 'Outfits' },
    { slot: 4,  label: 'T-Shirts & Tops' },
    { slot: 5,  label: 'Pants & Jeans' },
    { slot: 6,  label: 'Shoes & Boots' },
    { slot: 14, label: 'Vests' },
    { slot: 15, label: 'Belts' }
  ];

  var ACC_SLOTS = [
    { slot: -2, label: 'Sets' },
    { slot: 7,  label: 'Hats' },
    { slot: 8,  label: 'Glasses' },
    { slot: 9,  label: 'Masks' },
    { slot: 10, label: 'Necklaces' },
    { slot: 11, label: 'Watches' },
    { slot: 12, label: 'Earrings' },
    { slot: 13, label: 'Bags' }
  ];

  var TATTOO_SLOTS = [
    { slot: 21, label: 'Back' },
    { slot: 20, label: 'Chest' },
    { slot: 16, label: 'Left Arm' },
    { slot: 17, label: 'Right Arm' },
    { slot: 18, label: 'L Shoulder' },
    { slot: 19, label: 'R Shoulder' },
    { slot: 22, label: 'Left Leg' },
    { slot: 23, label: 'Right Leg' }
  ];

  var HAIR_PALETTE = [
    { id: 0,  name: 'Original',    hex: '#FFFFFF', rgb: [255, 255, 255] },
    { id: 1,  name: 'Black',       hex: '#1C1C20', rgb: [28,  28,  32]  },
    { id: 2,  name: 'Dark Brown',  hex: '#3B2A20', rgb: [59,  42,  32]  },
    { id: 3,  name: 'Brown',       hex: '#60402C', rgb: [96,  64,  44]  },
    { id: 4,  name: 'Light Brown', hex: '#8A6040', rgb: [138, 96,  64]  },
    { id: 5,  name: 'Blonde',      hex: '#D6B674', rgb: [214, 182, 116] },
    { id: 6,  name: 'Platinum',    hex: '#EEE8DC', rgb: [238, 232, 220] },
    { id: 7,  name: 'Red',         hex: '#A4302A', rgb: [164, 48,  42]  },
    { id: 8,  name: 'Auburn',      hex: '#BA5834', rgb: [186, 88,  52]  },
    { id: 9,  name: 'Gray',        hex: '#888E96', rgb: [136, 142, 150] },
    { id: 10, name: 'White',       hex: '#F2F5F8', rgb: [242, 245, 248] },
    { id: 11, name: 'Blue',        hex: '#3884EB', rgb: [56,  132, 235] },
    { id: 12, name: 'Cyan',        hex: '#00D9FF', rgb: [0,   217, 255] },
    { id: 13, name: 'Purple',      hex: '#9854E4', rgb: [152, 84,  228] },
    { id: 14, name: 'Pink',        hex: '#EC6CA8', rgb: [236, 108, 168] },
    { id: 15, name: 'Emerald',     hex: '#38C48A', rgb: [56,  196, 138] },
    { id: 16, name: 'Golden',      hex: '#E4B044', rgb: [228, 176, 68]  }
  ];

  var BODY_PRESETS_MALE = [
    { id: 'slim',     label: 'Slim',     weight: 56, muscle: 35, shoulder: 42, chest: 42, waist: 38, hip: 42, arm: 38, leg: 40 },
    { id: 'athletic', label: 'Athletic', weight: 72, muscle: 75, shoulder: 65, chest: 68, waist: 44, hip: 48, arm: 66, leg: 62 },
    { id: 'average',  label: 'Average',  weight: 68, muscle: 50, shoulder: 50, chest: 50, waist: 50, hip: 50, arm: 50, leg: 50 },
    { id: 'muscular', label: 'Muscular', weight: 82, muscle: 90, shoulder: 78, chest: 82, waist: 46, hip: 52, arm: 82, leg: 74 },
    { id: 'heavy',    label: 'Heavy',    weight: 90, muscle: 45, shoulder: 58, chest: 72, waist: 84, hip: 76, arm: 64, leg: 68 }
  ];

  var BODY_PRESETS_FEMALE = [
    { id: 'slim',     label: 'Slim',     weight: 49, muscle: 32, shoulder: 40, chest: 44, waist: 36, hip: 46, arm: 36, leg: 42 },
    { id: 'athletic', label: 'Athletic', weight: 58, muscle: 68, shoulder: 54, chest: 56, waist: 42, hip: 54, arm: 54, leg: 58 },
    { id: 'average',  label: 'Average',  weight: 56, muscle: 50, shoulder: 50, chest: 50, waist: 50, hip: 50, arm: 50, leg: 50 },
    { id: 'curvy',    label: 'Curvy',    weight: 62, muscle: 48, shoulder: 48, chest: 72, waist: 40, hip: 76, arm: 48, leg: 64 },
    { id: 'heavy',    label: 'Heavy',    weight: 78, muscle: 42, shoulder: 54, chest: 70, waist: 76, hip: 80, arm: 60, leg: 68 }
  ];

  var BODY_PART_VIEWS = [
    { id: 'front', label: 'Front',      cam: 0, rot: 0 },
    { id: 'back',  label: 'Back',       cam: 4, rot: 0 },
    { id: 'left',  label: 'Left Side',  cam: 5, rot: 0 },
    { id: 'right', label: 'Right Side', cam: 6, rot: 0 },
    { id: 'upper', label: 'Upper Body', cam: 3, rot: 0 },
    { id: 'lower', label: 'Lower Body', cam: 2, rot: 0 }
  ];

  var ICONS = {
    user:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    face:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M8.5 15c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/></svg>',
    palette:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4c0-5-4.5-11-10-11Z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/></svg>',
    eye:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/></svg>',
    droplet:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
    beard:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 11c0 6 3 9 7 9s7-3 7-9c-2 1-4 1-7-1-3 2-5 2-7 1Z"/></svg>',
    body:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M6 9h12M10 9l-1 12M14 9l1 12M9 14h6"/></svg>',
    shirt:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3c-.6 1.8-2.2 3-4 3s-3.4-1.2-4-3Z"/></svg>',
    glasses:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6.5" cy="14" r="3.5"/><circle cx="17.5" cy="14" r="3.5"/><path d="M10 14h4M3 14l2-7h2M21 14l-2-7h-2"/></svg>',
    tattoo:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.6z"/></svg>',
    star:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  };

  var TIER = { a: 0, b: 1, c: 2, d: 3, z: 4 };
  var st = null, shop = null, root = null, sendTimer = null, saveTimer = null, previewTimer = null;
  var shops = Object.create(null), shopOrder = [];
  var savedPresets = [];
  var favItems = Object.create(null);

  try {
    var rawP = localStorage.getItem('eagle_look_presets_v164');
    if (rawP) savedPresets = JSON.parse(rawP) || [];
    var rawF = localStorage.getItem('eagle_look_favs_v164');
    if (rawF) favItems = JSON.parse(rawF) || Object.create(null);
  } catch (e) {}

  function persistLocal() {
    try {
      localStorage.setItem('eagle_look_presets_v164', JSON.stringify(savedPresets.slice(0, 12)));
      localStorage.setItem('eagle_look_favs_v164', JSON.stringify(favItems));
    } catch (e) {}
  }

  function decode(hex) {
    if (typeof hex !== 'string' || !/^(?:[0-9a-fA-F]{114}|[0-9a-fA-F]{130})$/.test(hex)) return null;
    var n = hex.length / 2, b = [], i, s;
    for (i = 0; i < n; i++) b.push(parseInt(hex.substr(i * 2, 2), 16));
    if (b[0] !== 2 || b[3] > 1 || b[4] < 1 || b[4] > 4 || b[5] >= 12 || b[6] >= 12 ||
        b[55] < 151 || b[55] > 199 || b[56] < 41 || b[56] > 94) return null;
    var l = {
      skin: b[1] | (b[2] << 8),
      model: b[3],
      kind: b[4],
      tone: b[5],
      head: b[6],
      items: [],
      height: b[55],
      weight: b[56],
      muscle:   n >= 65 ? b[57] : DEFAULT_MORPH,
      shoulder: n >= 65 ? b[58] : DEFAULT_MORPH,
      chest:    n >= 65 ? b[59] : DEFAULT_MORPH,
      waist:    n >= 65 ? b[60] : DEFAULT_MORPH,
      hip:      n >= 65 ? b[61] : DEFAULT_MORPH,
      arm:      n >= 65 ? b[62] : DEFAULT_MORPH,
      leg:      n >= 65 ? b[63] : DEFAULT_MORPH,
      hairTint: n >= 65 ? b[64] : 0
    };
    for (s = 0; s < SLOTS; s++) l.items.push(b[7 + s * 2] | (b[8 + s * 2] << 8));
    return l;
  }

  function hasDefaultMorphs(l) {
    return l.muscle === DEFAULT_MORPH && l.shoulder === DEFAULT_MORPH && l.chest === DEFAULT_MORPH &&
           l.waist === DEFAULT_MORPH && l.hip === DEFAULT_MORPH && l.arm === DEFAULT_MORPH &&
           l.leg === DEFAULT_MORPH && (l.hairTint || 0) === 0;
  }

  function encode(l) {
    var b = [2, l.skin & 255, (l.skin >> 8) & 255, l.model, l.kind, l.tone, l.head];
    for (var s = 0; s < SLOTS; s++) b.push(l.items[s] & 255, (l.items[s] >> 8) & 255);
    b.push(l.height, l.weight);
    if (!hasDefaultMorphs(l)) {
      b.push(
        Math.max(0, Math.min(100, l.muscle == null ? 50 : l.muscle)),
        Math.max(0, Math.min(100, l.shoulder == null ? 50 : l.shoulder)),
        Math.max(0, Math.min(100, l.chest == null ? 50 : l.chest)),
        Math.max(0, Math.min(100, l.waist == null ? 50 : l.waist)),
        Math.max(0, Math.min(100, l.hip == null ? 50 : l.hip)),
        Math.max(0, Math.min(100, l.arm == null ? 50 : l.arm)),
        Math.max(0, Math.min(100, l.leg == null ? 50 : l.leg)),
        Math.max(0, Math.min(255, l.hairTint || 0))
      );
    }
    return b.map(function (v) { return ('0' + (v & 255).toString(16)).slice(-2); }).join('');
  }

  function rgbToTintCode(r, g, b) {
    var r6 = Math.max(0, Math.min(5, Math.round(r / 51)));
    var g6 = Math.max(0, Math.min(5, Math.round(g / 51)));
    var b6 = Math.max(0, Math.min(5, Math.round(b / 51)));
    return 17 + r6 * 36 + g6 * 6 + b6;
  }

  function tintCodeToRgb(code) {
    code = +code || 0;
    if (code === 0) return [255, 255, 255];
    if (code >= 1 && code <= 16) return HAIR_PALETTE[code].rgb.slice();
    if (code >= 17 && code <= 232) {
      var idx = code - 17;
      return [Math.floor(idx / 36) * 51, (Math.floor(idx / 6) % 6) * 51, (idx % 6) * 51];
    }
    return [255, 255, 255];
  }

  function rgbToHex(rgbArr) {
    return '#' + rgbArr.map(function (v) { return ('0' + Math.max(0, Math.min(255, v | 0)).toString(16)).slice(-2); }).join('').toUpperCase();
  }

  function hexToRgb(hexStr) {
    var m = /^#?([0-9a-fA-F]{6})$/.exec(String(hexStr || '').trim());
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  }

  function hsvToRgb(hDeg, sPct, vPct) {
    var h = ((hDeg % 360) + 360) % 360 / 60;
    var s = Math.max(0, Math.min(100, sPct)) / 100;
    var v = Math.max(0, Math.min(100, vPct)) / 100;
    var i = Math.floor(h), f = h - i;
    var p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
    var r = 0, g = 0, b = 0;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function mode() { return st && shop && String(shop.s) === st.s ? +shop.mode : 0; }
  function ready() { return !!mode(); }
  function busy() { return !st || st.waiting || !!st.pending; }
  function paid() { return mode() === MODE_SHOP; }
  function kindCat() { return st && st.kinds[String(st.draft.kind)]; }
  function isFemaleKind(k) { return k === 2 || k === 4; }
  function isSaved(slot, item) { return (st.saved.kind === st.draft.kind || slot <= 3 || slot >= 16) && st.saved.items[slot] === item; }
  function owned(slot, item) { var c = kindCat(), s = c && c.slots[slot]; return isSaved(slot, item) || !!(s && s.def === item); }
  function available(item) { return item && item[3] !== 0; }

  function itemPrice(kind, slot, item) {
    if (!paid() || item === NO_ITEM || item < 0) return 0;
    var tiers = shop.t2 && shop.t2[String(kind)], row = tiers && tiers[slot];
    var t = row && item < row.length ? TIER[row.charAt(item)] : 0;
    var pct = shop.p && shop.p[t] != null ? +shop.p[t] : 100;
    return Math.floor((+(shop.b && shop.b[slot]) || 0) * pct / 100);
  }

  function totalCost() {
    if (!st || !paid() || !st.draft.model) return 0;
    var d = st.draft, total = 0;
    for (var s = 0; s < SLOTS; s++) if (d.items[s] !== NO_ITEM && !owned(s, d.items[s])) total += itemPrice(d.kind, s, d.items[s]);
    if (d.head !== st.saved.head) total += +shop.hp || 0;
    if (d.tone !== st.saved.tone) total += +shop.tp || 0;
    return total;
  }

  function money(n) { return '$' + String(Math.max(0, Math.floor(n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function rgb(c) { c = +c || 0; return 'rgb(' + ((c >> 16) & 255) + ',' + ((c >> 8) & 255) + ',' + (c & 255) + ')'; }
  function stopDraft() { if (sendTimer) clearTimeout(sendTimer); sendTimer = null; }
  function stopSave() { if (saveTimer) clearTimeout(saveTimer); saveTimer = null; }
  function stopPreview() { if (previewTimer) clearTimeout(previewTimer); previewTimer = null; }
  function nextRevision() { st.revision++; }
  function flushDraft() { if (!st || !sendTimer) return; stopDraft(); toClient('draft', { h: encode(st.draft) }); }

  function toClient(a, extra) {
    if (!st) return false;
    var o = { a: a, s: st.s, r: String(st.revision) };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = String(extra[k]); });
    return E.sendRaw('lookui', o);
  }

  function awaitPreview(a, extra) {
    stopPreview(); nextRevision(); st.pending = a; st.previewTimeout = false; st.error = '';
    var session = st.s, revision = st.revision;
    if (!toClient(a, extra)) {
      st.previewTimeout = true; st.error = 'Preview belum terhubung. Coba muat ulang preview.'; render(); return;
    }
    previewTimer = setTimeout(function () {
      previewTimer = null;
      if (!st || st.s !== session || st.revision !== revision || !st.pending) return;
      st.previewTimeout = true;
      st.error = 'Preview belum menjawab. Muat ulang preview atau tutup lalu buka kembali.';
      render();
    }, 4000);
    render();
  }

  function command(a, extra) {
    if (busy()) return;
    flushDraft();
    if (a === 'model' || a === 'random' || a === 'reset') awaitPreview(a, extra);
    else toClient(a, extra);
  }

  function syncPreview() {
    if (!st || !st.pending || !st.previewTimeout || !st.sequenced) return;
    awaitPreview('sync');
  }

  function draftChanged() {
    if (busy()) return;
    nextRevision(); st.error = ''; stopDraft();
    var session = st.s;
    sendTimer = setTimeout(function () {
      sendTimer = null;
      if (st && st.s === session && !busy()) toClient('draft', { h: encode(st.draft) });
    }, 90);
    render();
  }

  var recentItems = Object.create(null);
  function select(slot, index) {
    if (busy()) return;
    st.draft.items[slot] = index;
    if (index !== NO_ITEM) {
      recentItems[st.draft.kind + ':' + slot + ':' + index] = Date.now();
    }
    if (st.draftByKind) st.draftByKind[st.draft.kind] = JSON.parse(JSON.stringify(st.draft));
    draftChanged();
  }

  function ids(slot, group, query) {
    var c = kindCat(), cs = c && c.slots[slot], out = [];
    if (!cs) return out;
    var q = String(query || '').trim().toLowerCase();
    cs.it.forEach(function (it, i) {
      if (!available(it)) return;
      if (group != null && group >= 0 && it[1] !== group) return;
      if (group === -99 && !favItems[st.draft.kind + ':' + slot + ':' + i]) return;
      if (group === -98 && !recentItems[st.draft.kind + ':' + slot + ':' + i]) return;
      if (q && String(it[0] || '').toLowerCase().indexOf(q) < 0) return;
      out.push(i);
    });
    return out;
  }

  function save() {
    if (busy() || !ready()) return;
    var cost = totalCost(), cash = +shop.cash || 0;
    if (paid() && cost > cash) { st.error = 'Saldo tidak cukup.'; render(); return; }
    if (st.torsoInspectMode && st.savedShirtBeforeInspect != null) {
      st.draft.items[4] = st.savedShirtBeforeInspect;
      st.torsoInspectMode = false;
    }
    stopDraft(); stopSave(); nextRevision(); st.waitRevision = st.revision; st.waiting = true; st.error = '';
    if (!toClient('save', { h: encode(st.draft) })) {
      st.waiting = false; st.error = 'Belum terhubung ke client. Coba simpan lagi.'; render(); return;
    }
    var session = st.s, revision = st.revision;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      if (st && st.s === session && st.revision === revision && st.waiting) {
        st.waiting = false; st.error = 'Belum ada jawaban server. Coba simpan lagi.'; toClient('retry'); render();
      }
    }, 9000);
    render();
  }

  function close() {
    stopDraft(); stopSave(); stopPreview();
    st = null;
    if (root) { root.classList.remove('on'); root.textContent = ''; }
    E.touch();
  }

  function cancel() {
    if (!st) return;
    stopDraft();
    toClient('cancel');
    close();
  }

  /* ---- UI BUILDING BLOCKS ---- */
  function secHead(title, rightText) {
    return h('div', { class: 'lk-sec-head' }, [
      h('b', null, [h('i', { text: '◈' }), h('span', { text: title })]),
      rightText ? h('span', { text: rightText }) : null
    ]);
  }

  function sliderRow(label, val, min, max, unit, onChange) {
    var disp = h('b', { text: val + (unit ? ' ' + unit : '') });
    var rng = h('input', { type: 'range', class: 'lk-range', min: min, max: max, value: val, step: 1 });
    rng.addEventListener('input', function () {
      if (busy()) return;
      var v = Math.max(min, Math.min(max, +rng.value));
      disp.textContent = v + (unit ? ' ' + unit : '');
      onChange(v, false);
    });
    rng.addEventListener('change', function () {
      if (busy()) return;
      var v = Math.max(min, Math.min(max, +rng.value));
      onChange(v, true);
    });
    var minus = h('button', { type: 'button', class: 'lk-step-mini', text: '‹' });
    minus.addEventListener('click', function () {
      if (busy()) return;
      var v = Math.max(min, val - 1);
      if (v !== val) onChange(v, true);
    });
    var plus = h('button', { type: 'button', class: 'lk-step-mini', text: '›' });
    plus.addEventListener('click', function () {
      if (busy()) return;
      var v = Math.min(max, val + 1);
      if (v !== val) onChange(v, true);
    });
    return h('div', { class: 'lk-slider-row' }, [
      h('div', { class: 'lk-slider-top' }, [h('span', { text: label }), disp]),
      h('div', { class: 'lk-slider-ctrl' }, [minus, rng, plus])
    ]);
  }

  function slotCatalogView(slot, titleOverride) {
    var cat = kindCat(), cs = cat && cat.slots[slot];
    if (!cs) return [h('div', { class: 'lk-note-box', text: 'Slot tidak tersedia untuk model ini.' })];
    var cur = st.draft.items[slot];
    var gFilter = st.group[slot] == null ? -1 : st.group[slot];
    var q = st.search || '';
    var list = ids(slot, gFilter, q);
    var pageSize = 12;
    var totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    var page = Math.max(0, Math.min(totalPages - 1, st.page[slot] || 0));
    st.page[slot] = page;
    var slice = list.slice(page * pageSize, (page + 1) * pageSize);

    var searchBox = h('input', {
      type: 'text',
      class: 'lk-search-input',
      placeholder: 'Search ' + (titleOverride || cs.n).toLowerCase() + '...',
      value: q
    });
    searchBox.addEventListener('input', function () {
      st.search = searchBox.value;
      st.page[slot] = 0;
      render();
    });

    var groupPills = [
      h('button', {
        type: 'button',
        class: 'lk-pill' + (gFilter === -1 ? ' on' : ''),
        text: 'All',
        onclick: function () { st.group[slot] = -1; st.page[slot] = 0; render(); }
      }),
      h('button', {
        type: 'button',
        class: 'lk-pill' + (gFilter === -99 ? ' on' : ''),
        text: '★ Fav',
        onclick: function () { st.group[slot] = -99; st.page[slot] = 0; render(); }
      }),
      h('button', {
        type: 'button',
        class: 'lk-pill' + (gFilter === -98 ? ' on' : ''),
        text: 'Recent',
        onclick: function () { st.group[slot] = -98; st.page[slot] = 0; render(); }
      })
    ];
    cs.g.forEach(function (gName, gi) {
      if (!ids(slot, gi, '').length) return;
      groupPills.push(h('button', {
        type: 'button',
        class: 'lk-pill' + (gFilter === gi ? ' on' : ''),
        text: gName,
        onclick: function () { st.group[slot] = gi; st.page[slot] = 0; render(); }
      }));
    });

    var grid = h('div', { class: 'lk-grid' });
    slice.forEach(function (itemIdx) {
      var it = cs.it[itemIdx], on = cur === itemIdx, own = owned(slot, itemIdx);
      var price = own ? 0 : itemPrice(st.draft.kind, slot, itemIdx);
      var favKey = st.draft.kind + ':' + slot + ':' + itemIdx;
      var isFav = !!favItems[favKey];
      var subText = own ? (paid() ? 'OWNED' : (cs.g[it[1]] || 'READY')) : (paid() && price ? money(price) : (cs.g[it[1]] || 'FREE'));
      var card = h('button', {
        type: 'button',
        class: 'lk-card' + (on ? ' on' : ''),
        title: it[0],
        onclick: function () { select(slot, itemIdx); }
      }, [
        h('span', { class: 'lk-card-num', text: '#' + (itemIdx + 1) + (isFav ? ' ★' : '') }),
        on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
        h('span', { class: 'lk-card-swatch', style: 'background:' + rgb(it[2]) }),
        h('span', { class: 'lk-card-title', text: it[0] }),
        h('span', { class: 'lk-card-sub' + (own ? ' owned' : ''), text: subText })
      ]);
      grid.appendChild(gridCardWithFav(card, favKey));
    });

    var pager = h('div', { class: 'lk-pager' }, [
      h('div', { style: 'display:flex;gap:0.35em;align-items:center' }, [
        h('button', {
          type: 'button',
          class: 'lk-btn-sm',
          text: '‹',
          disabled: page <= 0,
          onclick: function () { st.page[slot] = Math.max(0, page - 1); render(); }
        }),
        h('span', { text: (page + 1) + ' / ' + totalPages }),
        h('button', {
          type: 'button',
          class: 'lk-btn-sm',
          text: '›',
          disabled: page >= totalPages - 1,
          onclick: function () { st.page[slot] = Math.min(totalPages - 1, page + 1); render(); }
        })
      ]),
      h('div', { style: 'display:flex;gap:0.35em' }, [
        !cs.req ? h('button', {
          type: 'button',
          class: 'lk-btn-sm' + (cur === NO_ITEM ? ' on' : ' danger'),
          text: cur === NO_ITEM ? 'None ✓' : 'Remove',
          onclick: function () { select(slot, NO_ITEM); }
        }) : null,
        h('button', {
          type: 'button',
          class: 'lk-btn-sm',
          text: '🎲 Random',
          onclick: function () {
            var all = ids(slot, -1, '');
            if (all.length) select(slot, all[Math.floor(Math.random() * all.length)]);
          }
        })
      ])
    ]);

    return [
      secHead(titleOverride || cs.n, list.length + ' items'),
      h('div', { class: 'lk-search-wrap' }, [searchBox]),
      h('div', { class: 'lk-pills' }, groupPills),
      h('div', { class: 'lk-scroll-body' }, [
        slice.length ? grid : h('div', { class: 'lk-note-box', text: 'Tidak ada item yang cocok dengan filter.' })
      ]),
      pager
    ];
  }

  function gridCardWithFav(cardEl, favKey) {
    cardEl.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      if (favItems[favKey]) delete favItems[favKey];
      else favItems[favKey] = 1;
      persistLocal();
      render();
    });
    return cardEl;
  }

  /* ---- LEFT-SUB PANEL VIEWS PER NAV CATEGORY ---- */
  function buildSubPanel() {
    var d = st.draft, cat = kindCat(), nav = st.nav;
    if (!d.model || !cat) {
      if (nav !== 'character' && nav !== 'body') {
        var customIdx = -1;
        st.opts.forEach(function (o, i) { if (customIdx < 0 && +o.m) customIdx = i; });
        return [
          secHead('Standard Ped Active', 'Skin ID ' + d.skin),
          h('div', { class: 'lk-note-box', text: 'Anda sedang memakai skin GTA SA biasa. Aktifkan Model Karakter Kustom (Male/Female) untuk mengedit wajah, rambut, pakaian, aksesori, dan tato.' }),
          customIdx >= 0 ? h('button', {
            type: 'button',
            class: 'lk-save-btn',
            style: 'justify-content:center;width:100%',
            text: 'Gunakan Karakter Kustom EAGLE',
            onclick: function () { command('model', { i: customIdx }); }
          }) : null
        ];
      }
    }

    if (nav === 'character') {
      var modelCards = st.opts.map(function (o, i) {
        var on = +o.m === d.model && (!+o.m || +o.k === d.kind);
        return h('button', {
          type: 'button',
          class: 'lk-card' + (on ? ' on' : ''),
          onclick: function () { command('model', { i: i }); }
        }, [
          on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
          h('span', { class: 'lk-card-swatch', style: 'background:' + (+o.m ? 'linear-gradient(135deg,#00D9FF,#102638)' : '#4A5568') }),
          h('span', { class: 'lk-card-title', text: o.label }),
          h('span', { class: 'lk-card-sub', text: +o.m ? 'Modular Ped (Skin ' + o.skin + ')' : 'Standard Skin ' + o.skin })
        ]);
      });
      var photoPresets = [];
      if (d.model && (d.kind === 1 || d.kind === 3)) {
        [
          { label: 'Beach Curtain Look', hair: 42, head: 5, tone: 8 },
          { label: 'Urban Side Sweep',   hair: 45, head: 5, tone: 8 }
        ].forEach(function (pp) {
          var active = d.head === pp.head && d.items[0] === pp.hair;
          photoPresets.push(h('button', {
            type: 'button',
            class: 'lk-card' + (active ? ' on' : ''),
            onclick: function () {
              d.head = pp.head; d.tone = pp.tone; d.items[0] = pp.hair; d.items[1] = NO_ITEM; d.items[3] = 0;
              draftChanged();
            }
          }, [
            active ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
            h('span', { class: 'lk-card-title', text: pp.label }),
            h('span', { class: 'lk-card-sub', text: 'Photo Ref Preset' })
          ]));
        });
      }
      return [
        secHead('Character Identity', cat ? cat.label : 'Standard'),
        h('div', { class: 'lk-scroll-body' }, [
          h('div', { class: 'lk-grid' }, modelCards),
          photoPresets.length ? secHead('Signature Reference Looks', '2 Presets') : null,
          photoPresets.length ? h('div', { class: 'lk-grid' }, photoPresets) : null,
          h('div', { class: 'lk-note-box', text: 'Gunakan panel kiri untuk memilih kategori wajah, rambut, warna rambut, mata/alis, kulit, jenggot, proporsi tubuh (Body Morph), pakaian, aksesori, dan tato.' })
        ])
      ];
    }

    if (nav === 'face') {
      var headLabels = (cat && cat.headLabels) || [];
      var faceCards = [];
      for (var hi = 0; hi < (cat ? cat.heads : 12); hi++) {
        (function (idx) {
          var on = d.head === idx;
          var lbl = headLabels[idx] || ('Face Preset ' + (idx + 1));
          faceCards.push(h('button', {
            type: 'button',
            class: 'lk-card' + (on ? ' on' : ''),
            onclick: function () { d.head = idx; draftChanged(); }
          }, [
            h('span', { class: 'lk-card-num', text: '#' + (idx + 1) }),
            on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
            h('span', { class: 'lk-card-swatch', style: 'background:' + rgb(cat.tones[d.tone] || 0xDDBBAA) }),
            h('span', { class: 'lk-card-title', text: lbl }),
            h('span', { class: 'lk-card-sub', text: idx < 5 ? '3D Head Mesh ' + (idx + 1) : 'Realism Face HD' })
          ]));
        })(hi);
      }
      return [
        secHead('Face Presets & Shape', (d.head + 1) + ' / ' + cat.heads),
        h('div', { class: 'lk-scroll-body' }, [
          h('div', { class: 'lk-grid' }, faceCards),
          h('div', { class: 'lk-note-box', text: 'Info Teknis Ped: Model male01.dff & bfori.dff menggunakan 5 mesh kepala 3D (body.head1..5) + 7 tekstur wajah HD Realism dan 23 variasi alis. Tulang anatomi tubuh dikontrol penuh di tab Body.' })
        ]),
        h('div', { class: 'lk-pager' }, [
          h('button', { type: 'button', class: 'lk-btn-sm', text: '👁 Zoom Face', onclick: function () { st.view = 1; command('cam', { i: 1 }); render(); } }),
          h('button', {
            type: 'button',
            class: 'lk-btn-sm',
            text: '🎲 Random Face',
            onclick: function () { d.head = Math.floor(Math.random() * cat.heads); draftChanged(); }
          })
        ])
      ];
    }

    if (nav === 'hair') {
      return slotCatalogView(0, 'Hairstyle');
    }

    if (nav === 'hair_color') {
      var curTint = d.hairTint || 0;
      var curRgb = tintCodeToRgb(curTint);
      var swatchEls = HAIR_PALETTE.map(function (p) {
        var on = curTint === p.id;
        return h('button', {
          type: 'button',
          class: 'lk-card' + (on ? ' on' : ''),
          onclick: function () { d.hairTint = p.id; draftChanged(); }
        }, [
          on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
          h('span', { class: 'lk-card-swatch', style: 'background:' + p.hex }),
          h('span', { class: 'lk-card-title', text: p.name }),
          h('span', { class: 'lk-card-sub', text: p.id === 0 ? 'Default' : p.hex })
        ]);
      });

      var hexInput = h('input', {
        type: 'text',
        class: 'lk-search-input',
        value: rgbToHex(curRgb),
        placeholder: '#00D9FF'
      });
      hexInput.addEventListener('change', function () {
        var parsed = hexToRgb(hexInput.value);
        if (parsed) {
          d.hairTint = rgbToTintCode(parsed[0], parsed[1], parsed[2]);
          draftChanged();
        }
      });

      var curHsv = rgbToHsv(curRgb[0], curRgb[1], curRgb[2]);
      var cMode = st.colorMode || 'palette';
      var modePills = ['palette', 'rgb', 'hsv', 'hex'].map(function (m) {
        return h('button', {
          type: 'button',
          class: 'lk-pill' + (cMode === m ? ' on' : ''),
          text: m.toUpperCase(),
          onclick: function () { st.colorMode = m; render(); }
        });
      });
      var pickerBody = [];
      if (cMode === 'palette') {
        pickerBody.push(h('div', { class: 'lk-grid cols-4' }, swatchEls));
      } else if (cMode === 'rgb') {
        pickerBody.push(
          sliderRow('Red (R)', curRgb[0], 0, 255, '', function (v, commit) { d.hairTint = rgbToTintCode(v, curRgb[1], curRgb[2]); if (commit) draftChanged(); }),
          sliderRow('Green (G)', curRgb[1], 0, 255, '', function (v, commit) { d.hairTint = rgbToTintCode(curRgb[0], v, curRgb[2]); if (commit) draftChanged(); }),
          sliderRow('Blue (B)', curRgb[2], 0, 255, '', function (v, commit) { d.hairTint = rgbToTintCode(curRgb[0], curRgb[1], v); if (commit) draftChanged(); })
        );
      } else if (cMode === 'hsv') {
        pickerBody.push(
          sliderRow('Hue (H)', curHsv[0], 0, 360, '°', function (v, commit) { var nc = hsvToRgb(v, curHsv[1] || 75, curHsv[2] || 85); d.hairTint = rgbToTintCode(nc[0], nc[1], nc[2]); if (commit) draftChanged(); }),
          sliderRow('Saturation (S)', curHsv[1], 0, 100, '%', function (v, commit) { var nc = hsvToRgb(curHsv[0], v, curHsv[2] || 85); d.hairTint = rgbToTintCode(nc[0], nc[1], nc[2]); if (commit) draftChanged(); }),
          sliderRow('Value (V)', curHsv[2], 0, 100, '%', function (v, commit) { var nc = hsvToRgb(curHsv[0], curHsv[1], v); d.hairTint = rgbToTintCode(nc[0], nc[1], nc[2]); if (commit) draftChanged(); })
        );
      } else {
        pickerBody.push(
          h('div', { class: 'lk-search-wrap', style: 'gap:0.4em' }, [
            h('span', { style: 'font-size:0.76em;color:var(--lk-muted)', text: 'HEX:' }),
            hexInput,
            h('button', { type: 'button', class: 'lk-btn-sm', text: 'Apply', onclick: function () { var p = hexToRgb(hexInput.value); if (p) { d.hairTint = rgbToTintCode(p[0], p[1], p[2]); draftChanged(); } } })
          ]),
          h('div', { class: 'lk-grid cols-4' }, swatchEls.slice(0, 8))
        );
      }
      return [
        secHead('Hair & Beard Color', curTint === 0 ? 'Original Texture' : rgbToHex(curRgb)),
        h('div', { class: 'lk-pills' }, modePills),
        h('div', { class: 'lk-scroll-body' }, pickerBody),
        h('div', { class: 'lk-pager' }, [
          h('span', { style: 'display:inline-flex;align-items:center;gap:0.4em', text: 'Active: ' + (curTint === 0 ? 'Original' : rgbToHex(curRgb)) }),
          h('button', { type: 'button', class: 'lk-btn-sm', text: 'Reset Color', onclick: function () { d.hairTint = 0; draftChanged(); } })
        ])
      ];
    }

    if (nav === 'eyes') {
      return slotCatalogView(3, 'Eyebrows & Eye Frame');
    }

    if (nav === 'skin') {
      var toneLabels = (cat && cat.toneLabels) || [];
      var toneCards = (cat ? cat.tones : []).map(function (col, ti) {
        var on = d.tone === ti;
        return h('button', {
          type: 'button',
          class: 'lk-card' + (on ? ' on' : ''),
          onclick: function () { d.tone = ti; draftChanged(); }
        }, [
          h('span', { class: 'lk-card-num', text: '#' + (ti + 1) }),
          on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
          h('span', { class: 'lk-card-swatch', style: 'background:' + rgb(col) }),
          h('span', { class: 'lk-card-title', text: toneLabels[ti] || ('Tone ' + (ti + 1)) }),
          h('span', { class: 'lk-card-sub', text: ti < 6 ? 'Base Tone' : 'Realism Tint' })
        ]);
      });
      var makeupCards = [];
      if (cat && cat.slots[2] && ids(2, -1, '').length) {
        makeupCards.push(secHead('Skin Details & Makeup', cat.slots[2].n));
        var mGrid = h('div', { class: 'lk-grid' });
        mGrid.appendChild(h('button', {
          type: 'button',
          class: 'lk-card' + (d.items[2] === NO_ITEM ? ' on' : ''),
          onclick: function () { select(2, NO_ITEM); }
        }, [
          d.items[2] === NO_ITEM ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
          h('span', { class: 'lk-card-title', text: 'Natural Clean' }),
          h('span', { class: 'lk-card-sub', text: 'No Makeup' })
        ]));
        ids(2, -1, '').forEach(function (mi) {
          var it = cat.slots[2].it[mi], on = d.items[2] === mi;
          mGrid.appendChild(h('button', {
            type: 'button',
            class: 'lk-card' + (on ? ' on' : ''),
            onclick: function () { select(2, mi); }
          }, [
            on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
            h('span', { class: 'lk-card-swatch', style: 'background:' + rgb(it[2]) }),
            h('span', { class: 'lk-card-title', text: it[0] }),
            h('span', { class: 'lk-card-sub', text: 'Skin Detail' })
          ]));
        });
        makeupCards.push(mGrid);
      }
      return [
        secHead('Skin Tone & Complexion', (d.tone + 1) + ' / ' + (cat ? cat.tones.length : 12)),
        h('div', { class: 'lk-scroll-body' }, [
          h('div', { class: 'lk-grid' }, toneCards)
        ].concat(makeupCards))
      ];
    }

    if (nav === 'facial_hair') {
      if (isFemaleKind(d.kind)) {
        return [
          secHead('Facial Hair', 'Female Ped'),
          h('div', { class: 'lk-note-box', text: 'Model karakter perempuan (bfori.dff / forelli.dff) tidak menggunakan jenggot/kumis demi menjaga kompatibilitas geometri wajah. Gunakan tab Skin atau Eyes untuk riasan wajah.' })
        ];
      }
      return slotCatalogView(1, 'Facial Hair & Beard');
    }

    if (nav === 'body') {
      var presets = isFemaleKind(d.kind) ? BODY_PRESETS_FEMALE : BODY_PRESETS_MALE;
      var activePreset = 'custom';
      presets.forEach(function (p) {
        if (d.muscle === p.muscle && d.shoulder === p.shoulder && d.chest === p.chest &&
            d.waist === p.waist && d.hip === p.hip && d.arm === p.arm && d.leg === p.leg) {
          activePreset = p.id;
        }
      });

      var presetCards = presets.map(function (p) {
        var on = activePreset === p.id;
        return h('button', {
          type: 'button',
          class: 'lk-pill' + (on ? ' on' : ''),
          text: p.label + (on ? ' ✓' : ''),
          onclick: function () {
            if (busy()) return;
            d.weight = p.weight;
            d.muscle = p.muscle;
            d.shoulder = p.shoulder;
            d.chest = p.chest;
            d.waist = p.waist;
            d.hip = p.hip;
            d.arm = p.arm;
            d.leg = p.leg;
            draftChanged();
          }
        });
      });
      presetCards.push(h('span', { class: 'lk-pill' + (activePreset === 'custom' ? ' on' : ''), text: 'Custom' }));

      var metres = d.height / 100.0;
      var bmi = (d.weight / (metres * metres)).toFixed(1);

      return [
        secHead('Body Shape & Morph', 'BMI ' + bmi),
        h('div', { class: 'lk-pills' }, presetCards),
        h('div', { class: 'lk-scroll-body' }, [
          sliderRow('Muscle',         d.muscle,   0,       100,     '',   function (v, c) { d.muscle = v;   if (c) draftChanged(); }),
          sliderRow('Body Fat',       d.weight,   st.wmin, st.wmax, 'kg', function (v, c) { d.weight = v;   if (c) draftChanged(); }),
          sliderRow('Shoulder Width', d.shoulder, 0,       100,     '',   function (v, c) { d.shoulder = v; if (c) draftChanged(); }),
          sliderRow('Chest Size',     d.chest,    0,       100,     '',   function (v, c) { d.chest = v;    if (c) draftChanged(); }),
          sliderRow('Waist',          d.waist,    0,       100,     '',   function (v, c) { d.waist = v;    if (c) draftChanged(); }),
          sliderRow('Hip Width',      d.hip,      0,       100,     '',   function (v, c) { d.hip = v;      if (c) draftChanged(); }),
          sliderRow('Arm Size',       d.arm,      0,       100,     '',   function (v, c) { d.arm = v;      if (c) draftChanged(); }),
          sliderRow('Leg Size',       d.leg,      0,       100,     '',   function (v, c) { d.leg = v;      if (c) draftChanged(); }),
          sliderRow('Height',         d.height,   st.hmin, st.hmax, 'cm', function (v, c) { d.height = v;   if (c) draftChanged(); })
        ]),
        h('div', { class: 'lk-pager' }, [
          h('button', {
            type: 'button',
            class: 'lk-btn-sm',
            text: '↺ Reset Body',
            onclick: function () {
              if (busy()) return;
              d.height = 172; d.weight = 68;
              d.muscle = 50; d.shoulder = 50; d.chest = 50; d.waist = 50; d.hip = 50; d.arm = 50; d.leg = 50;
              draftChanged();
            }
          }),
          h('button', {
            type: 'button',
            class: 'lk-btn-sm',
            text: '🎲 Randomize Body',
            onclick: function () {
              if (busy()) return;
              var pick = presets[Math.floor(Math.random() * presets.length)];
              d.height = 160 + Math.floor(Math.random() * 28);
              d.weight = pick.weight;
              d.muscle = pick.muscle; d.shoulder = pick.shoulder; d.chest = pick.chest;
              d.waist = pick.waist; d.hip = pick.hip; d.arm = pick.arm; d.leg = pick.leg;
              draftChanged();
            }
          })
        ])
      ];
    }

    if (nav === 'clothing') {
      var activeClothSlot = st.clothSlot == null ? 4 : st.clothSlot;
      var slotPills = CLOTH_SLOTS.map(function (cs) {
        return h('button', {
          type: 'button',
          class: 'lk-pill' + (activeClothSlot === cs.slot ? ' on' : ''),
          text: cs.label,
          onclick: function () { st.clothSlot = cs.slot; st.search = ''; render(); }
        });
      });
      if (activeClothSlot === -1) {
        var outfits = (cat && cat.outfits) || [];
        var oGrid = h('div', { class: 'lk-grid' });
        outfits.forEach(function (o, idx) {
          var on = d.items[4] === o[1] && d.items[5] === o[2];
          oGrid.appendChild(h('button', {
            type: 'button',
            class: 'lk-card' + (on ? ' on' : ''),
            onclick: function () {
              if (busy()) return;
              d.items[4] = o[1]; d.items[5] = o[2];
              draftChanged();
            }
          }, [
            h('span', { class: 'lk-card-num', text: '#' + (idx + 1) }),
            on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
            h('span', { class: 'lk-card-swatch', style: 'background:linear-gradient(135deg,#00D9FF,#1B3B52)' }),
            h('span', { class: 'lk-card-title', text: o[0] }),
            h('span', { class: 'lk-card-sub', text: 'Outfit Set' })
          ]));
        });
        return [
          secHead('Clothing Categories', outfits.length + ' Outfit Sets'),
          h('div', { class: 'lk-pills' }, slotPills),
          h('div', { class: 'lk-scroll-body' }, [
            outfits.length ? oGrid : h('div', { class: 'lk-note-box', text: 'Pilih kategori pakaian di atas untuk mengganti kaos, jaket, celana, atau sepatu.' })
          ])
        ];
      }
      var views = slotCatalogView(activeClothSlot);
      views.splice(1, 0, h('div', { class: 'lk-pills' }, slotPills));
      return views;
    }

    if (nav === 'accessories') {
      var activeAccSlot = st.accSlot == null ? 7 : st.accSlot;
      var accPills = ACC_SLOTS.map(function (as) {
        return h('button', {
          type: 'button',
          class: 'lk-pill' + (activeAccSlot === as.slot ? ' on' : ''),
          text: as.label,
          onclick: function () { st.accSlot = as.slot; st.search = ''; render(); }
        });
      });
      if (activeAccSlot === -2) {
        var accPresets = (cat && cat.accPresets) || [];
        var aGrid = h('div', { class: 'lk-grid' });
        accPresets.forEach(function (ap, idx) {
          var match = ap.picks.every(function (pk) { return d.items[pk[0]] === pk[1]; });
          aGrid.appendChild(h('button', {
            type: 'button',
            class: 'lk-card' + (match ? ' on' : ''),
            onclick: function () {
              if (busy()) return;
              [7, 9, 10, 11, 12, 13, 14, 15].forEach(function (s) {
                if (cat.slots[s] && !cat.slots[s].req) d.items[s] = NO_ITEM;
              });
              ap.picks.forEach(function (pk) { d.items[pk[0]] = pk[1]; });
              draftChanged();
            }
          }, [
            h('span', { class: 'lk-card-num', text: '#' + (idx + 1) }),
            match ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
            h('span', { class: 'lk-card-swatch', style: 'background:linear-gradient(135deg,#00D9FF,#7928CA)' }),
            h('span', { class: 'lk-card-title', text: ap.label }),
            h('span', { class: 'lk-card-sub', text: ap.picks.length + ' Accessories' })
          ]));
        });
        return [
          secHead('Accessory Sets', accPresets.length + ' Sets'),
          h('div', { class: 'lk-pills' }, accPills),
          h('div', { class: 'lk-scroll-body' }, [
            accPresets.length ? aGrid : h('div', { class: 'lk-note-box', text: 'Pilih kategori aksesori di atas.' })
          ])
        ];
      }
      var aViews = slotCatalogView(activeAccSlot);
      aViews.splice(1, 0, h('div', { class: 'lk-pills' }, accPills));
      return aViews;
    }

    if (nav === 'tattoos') {
      var activeTatSlot = st.tatSlot == null ? 21 : st.tatSlot;
      var tatPills = TATTOO_SLOTS.map(function (ts) {
        return h('button', {
          type: 'button',
          class: 'lk-pill' + (activeTatSlot === ts.slot ? ' on' : ''),
          text: ts.label,
          onclick: function () { st.tatSlot = ts.slot; st.search = ''; render(); }
        });
      });
      var tViews = slotCatalogView(activeTatSlot);
      tViews.splice(1, 0, h('div', { class: 'lk-pills' }, tatPills));
      return tViews;
    }

    // Presets Tab
    var pGrid = h('div', { class: 'lk-grid' });
    savedPresets.forEach(function (pr, idx) {
      pGrid.appendChild(h('button', {
        type: 'button',
        class: 'lk-card',
        onclick: function () {
          if (busy()) return;
          var loaded = decode(pr.hex);
          if (loaded && loaded.kind === d.kind && loaded.model === d.model) {
            st.draft = loaded;
            st.activePresetName = pr.name;
            draftChanged();
          } else {
            st.error = 'Preset ini untuk model/gender berbeda.';
            render();
          }
        }
      }, [
        h('span', { class: 'lk-card-num', text: '#' + (idx + 1) }),
        h('span', { class: 'lk-card-swatch', style: 'background:linear-gradient(135deg,#00D9FF,#102638)' }),
        h('span', { class: 'lk-card-title', text: pr.name }),
        h('span', { class: 'lk-card-sub', text: 'Load Preset' })
      ]));
    });

    return [
      secHead('Saved Look Presets', savedPresets.length + ' / 12'),
      h('div', { class: 'lk-scroll-body' }, [
        savedPresets.length ? pGrid : h('div', { class: 'lk-note-box', text: 'Belum ada preset tersimpan. Klik "Save New Preset" di bawah untuk menyimpan kombinasi wajah, badan, dan outfit saat ini.' })
      ]),
      h('div', { class: 'lk-pager' }, [
        h('button', {
          type: 'button',
          class: 'lk-btn-sm on',
          text: '+ Save New Preset',
          onclick: function () {
            var name = 'Preset ' + ('0' + (savedPresets.length + 1)).slice(-2);
            savedPresets.unshift({ name: name, hex: encode(d), kind: d.kind });
            if (savedPresets.length > 12) savedPresets.length = 12;
            st.activePresetName = name;
            persistLocal();
            render();
          }
        }),
        savedPresets.length ? h('button', {
          type: 'button',
          class: 'lk-btn-sm danger',
          text: 'Clear Presets',
          onclick: function () { savedPresets = []; persistLocal(); render(); }
        }) : null
      ])
    ];
  }

  /* ---- RIGHT CONTEXT & DETAILS PANEL ---- */
  function buildRightPanel() {
    var d = st.draft, cat = kindCat(), nav = st.nav;
    var cards = [];

    if (nav === 'body' || nav === 'tattoos') {
      // Body Details: Preview Parts (Front, Back, Left Side, Right Side, Upper Body, Lower Body)
      var partGrid = h('div', { class: 'lk-grid' }, BODY_PART_VIEWS.map(function (pv) {
        var on = st.view === pv.cam;
        return h('button', {
          type: 'button',
          class: 'lk-card' + (on ? ' on' : ''),
          style: 'min-height:54px',
          onclick: function () {
            st.view = pv.cam;
            command('cam', { i: pv.cam });
            render();
          }
        }, [
          on ? h('span', { class: 'lk-card-check', text: '✓' }) : null,
          h('span', { class: 'lk-card-title', text: pv.label }),
          h('span', { class: 'lk-card-sub', text: 'Camera View' })
        ]);
      }));

      var hasTattoos = false;
      for (var ts = 16; ts <= 23; ts++) if (d.items[ts] !== NO_ITEM) hasTattoos = true;

      var torsoInspectOn = !!(cat && !cat.slots[4].req && d.items[4] === NO_ITEM);

      cards.push(h('div', { class: 'lk-rcard' }, [
        secHead('Body Details', 'Preview Parts'),
        partGrid,
        secHead('Additional Options', 'Inspect'),
        cat && !cat.slots[4].req ? h('div', { class: 'lk-toggle-row' }, [
          h('span', { text: 'Torso View Mode' }),
          h('button', {
            type: 'button',
            class: 'lk-switch' + (torsoInspectOn ? ' on' : ''),
            onclick: function () {
              if (busy()) return;
              if (!torsoInspectOn) {
                st.savedShirtBeforeInspect = d.items[4];
                st.torsoInspectMode = true;
                select(4, NO_ITEM);
              } else {
                var restore = st.savedShirtBeforeInspect != null ? st.savedShirtBeforeInspect : 0;
                st.torsoInspectMode = false;
                select(4, restore);
              }
            }
          })
        ]) : null,
        h('div', { class: 'lk-toggle-row' }, [
          h('span', { text: 'Tattoos Visible' }),
          h('button', {
            type: 'button',
            class: 'lk-switch' + (hasTattoos ? ' on' : ''),
            onclick: function () {
              if (busy()) return;
              if (hasTattoos) {
                st.savedTattoos = {};
                for (var s = 16; s <= 23; s++) { st.savedTattoos[s] = d.items[s]; d.items[s] = NO_ITEM; }
              } else if (st.savedTattoos) {
                for (var s2 = 16; s2 <= 23; s2++) if (st.savedTattoos[s2] != null) d.items[s2] = st.savedTattoos[s2];
              } else if (cat && cat.slots[21] && cat.slots[21].it.length) {
                d.items[21] = 0;
              }
              draftChanged();
            }
          })
        ]),
        h('div', { style: 'display:flex;gap:0.4em;margin-top:0.2em' }, [
          h('button', {
            type: 'button',
            class: 'lk-btn-sm',
            style: 'flex:1',
            text: '🎲 Randomize',
            onclick: function () { command('random'); }
          }),
          h('button', {
            type: 'button',
            class: 'lk-btn-sm',
            style: 'flex:1',
            text: '↺ Reset All',
            onclick: function () { command('reset'); }
          })
        ])
      ]));
    } else {
      // Face / Hair / Skin / Clothing Quick Context Panel
      if (cat && d.model) {
        var quickTones = h('div', { class: 'lk-swatch-grid' }, cat.tones.map(function (col, ti) {
          return h('button', {
            type: 'button',
            class: 'lk-swatch' + (d.tone === ti ? ' on' : ''),
            style: 'background:' + rgb(col),
            title: (cat.toneLabels && cat.toneLabels[ti]) || ('Skin Tone ' + (ti + 1)),
            onclick: function () { d.tone = ti; draftChanged(); }
          });
        }));

        var quickHairColors = h('div', { class: 'lk-swatch-grid' }, HAIR_PALETTE.slice(0, 12).map(function (hp) {
          return h('button', {
            type: 'button',
            class: 'lk-swatch' + ((d.hairTint || 0) === hp.id ? ' on' : ''),
            style: 'background:' + hp.hex,
            title: hp.name,
            onclick: function () { d.hairTint = hp.id; draftChanged(); }
          });
        }));

        cards.push(h('div', { class: 'lk-rcard' }, [
          secHead('Skin Tone', (d.tone + 1) + ' / ' + cat.tones.length),
          quickTones,
          secHead('Hair Color Tint', HAIR_PALETTE[Math.min(16, d.hairTint || 0)].name),
          quickHairColors
        ]));
      }
    }

    // Checkout / Summary Card
    var cost = totalCost(), cash = shop && String(shop.s) === st.s ? +shop.cash || 0 : 0;
    var changes = 0;
    for (var s = 0; s < SLOTS; s++) if (d.items[s] !== st.saved.items[s]) changes++;
    if (d.head !== st.saved.head) changes++;
    if (d.tone !== st.saved.tone) changes++;
    if (d.height !== st.saved.height || d.weight !== st.saved.weight || !hasDefaultMorphs(d)) changes++;

    cards.push(h('div', { class: 'lk-rcard' }, [
      secHead(paid() ? 'Store Checkout' : 'Character Summary', changes + ' modified'),
      paid() ? h('div', { class: 'lk-slider-top' }, [
        h('span', { text: 'Total Cost' }),
        h('b', { style: cost > cash ? 'color:var(--lk-danger)' : '', text: money(cost) })
      ]) : null,
      paid() ? h('div', { class: 'lk-slider-top' }, [
        h('span', { text: 'Wallet (' + ((shop && shop.cur) || 'Eagle Dollar') + ')' }),
        h('b', { text: money(cash) })
      ]) : null,
      h('div', { class: 'lk-slider-top' }, [
        h('span', { text: 'Body Stature' }),
        h('b', { text: d.height + ' cm · ' + d.weight + ' kg' })
      ]),
      st.error ? h('div', { class: 'lk-error-banner', text: st.error }) : null,
      st.pending && st.previewTimeout && st.sequenced ? h('button', {
        type: 'button',
        class: 'lk-btn-sm on preview-retry',
        text: '↻ Reload Preview',
        onclick: syncPreview
      }) : null,
      mode() === MODE_SHOP ? h('button', {
        type: 'button',
        class: 'lk-btn-sm oldstore',
        style: 'width:100%;margin-top:0.2em',
        text: 'Buka Toko Skin Standar ›',
        onclick: function () { stopDraft(); E.send('lookshop', 'oldstore', -1, ''); close(); }
      }) : null
    ]));

    return cards;
  }

  /* ---- MAIN RENDER ---- */
  function render() {
    if (!st) return;
    if (!root) {
      root = h('div', { id: 'lookui', class: 'lk-root' });
      (document.getElementById('panels') || document.body).appendChild(root);
    }

    var oldScroll = root.querySelector('.lk-scroll-body');
    var scrollPos = oldScroll ? oldScroll.scrollTop : 0;

    var d = st.draft, cat = kindCat(), create = mode() === MODE_CREATE;
    var cost = totalCost(), cash = shop && String(shop.s) === st.s ? +shop.cash || 0 : 0;

    // 1. Top Header Bar
    var topbar = h('header', { class: 'lk-topbar' }, [
      h('div', { class: 'lk-brand', 'data-touch': '1' }, [
        h('button', { type: 'button', class: 'lk-back-btn cancel', text: '‹', title: 'Close / Back', onclick: cancel }),
        h('div', { class: 'lk-brand-titles' }, [
          h('b', { text: create ? 'CHARACTER CREATOR' : (paid() ? 'EAGLE CLOTHING STUDIO' : 'CHARACTER CREATOR') }),
          h('small', { text: 'Customize Your Identity · ' + (cat ? cat.label : 'Standard Ped') })
        ])
      ]),
      h('div', { class: 'lk-gender-switch', 'data-touch': '1' }, st.opts.map(function (o, i) {
        var on = +o.m === d.model && (!+o.m || +o.k === d.kind);
        var isFem = isFemaleKind(+o.k);
        var shortLbl = +o.m ? (isFem ? '♀ FEMALE' : (+o.k >= 3 ? '★ POLICE' : '♂ MALE')) : ('SKIN ' + o.skin);
        return h('button', {
          type: 'button',
          class: 'lk-gender-btn' + (on ? ' on' : ''),
          text: shortLbl,
          onclick: function () { command('model', { i: i }); }
        });
      })),
      h('div', { class: 'lk-top-info', 'data-touch': '1' }, [
        h('i', { text: 'i' }),
        h('span', null, [
          paid() ? 'Total: ' : 'Real-Time Ped Preview · ',
          h('b', { text: paid() ? (money(cost) + ' / ' + money(cash)) : 'Active' })
        ])
      ])
    ]);

    // 2. Left Navigation Rail (12 Categories)
    var navRail = h('nav', { class: 'lk-nav-rail', 'data-touch': '1', 'aria-label': 'Categories' }, NAV_ITEMS.map(function (item) {
      var on = st.nav === item.id;
      return h('button', {
        type: 'button',
        class: 'lk-nav-btn' + (on ? ' on' : ''),
        onclick: function () {
          if (busy() || st.nav === item.id) return;
          st.nav = item.id;
          st.search = '';
          if (item.id === 'face' || item.id === 'eyes' || item.id === 'hair' || item.id === 'hair_color' || item.id === 'facial_hair') {
            st.view = 1; command('cam', { i: 1 });
          } else if (item.id === 'body' || item.id === 'clothing') {
            st.view = 0; command('cam', { i: 0 });
          }
          render();
        }
      }, [
        h('span', { class: 'lk-nav-left' }, [
          h('span', { class: 'lk-nav-ico', html: ICONS[item.ico] || ICONS.user }),
          h('span', { class: 'lk-nav-lbl', text: item.t })
        ]),
        h('small', { class: 'lk-nav-arr', text: '›' })
      ]);
    }));

    // 3. Left-Sub Main Customization Panel
    var subPanel = h('section', { class: 'lk-subpanel', 'data-touch': '1' }, buildSubPanel());

    // 4. Center Pedestal Touch-Drag & Rotate Bar
    var pedestal = h('div', { class: 'lk-stage-pedestal', 'data-touch': '1' }, [
      h('button', { type: 'button', class: 'lk-step-mini', text: '‹', onclick: function () { command('rot', { d: -25 }); } }),
      h('span', { text: '⟲ Drag / Tap to Rotate' }),
      h('button', { type: 'button', class: 'lk-step-mini', text: '›', onclick: function () { command('rot', { d: 25 }); } })
    ]);
    bindPedestalDrag(pedestal);

    // 5. Right Context & Details Panel
    var rightPanel = h('aside', { class: 'lk-rightpanel', 'data-touch': '1' }, buildRightPanel());

    // 6. Bottom Action Bar
    var bottomBar = h('footer', { class: 'lk-bottombar' }, [
      h('div', { class: 'lk-preset-chip', 'data-touch': '1', onclick: function () { st.nav = 'presets'; render(); } }, [
        h('div', { class: 'lk-preset-badge', text: isFemaleKind(d.kind) ? '♀' : '♂' }),
        h('div', null, [
          h('small', { text: 'Current Character' }),
          h('b', { text: st.activePresetName || 'Preset 01' })
        ])
      ]),
      h('div', { class: 'lk-actions-bar', 'data-touch': '1' }, [
        h('button', { type: 'button', class: 'lk-act-btn', text: '↶ Rotate', onclick: function () { command('rot', { d: 35 }); } }),
        h('button', {
          type: 'button',
          class: 'lk-act-btn' + (st.view === 7 || st.view === 1 ? ' on' : ''),
          text: '🔍 Zoom In',
          onclick: function () { st.view = st.view === 1 ? 7 : 1; command('cam', { i: st.view }); render(); }
        }),
        h('button', {
          type: 'button',
          class: 'lk-act-btn' + (st.view === 0 || st.view === 8 ? ' on' : ''),
          text: '🔎 Zoom Out',
          onclick: function () { st.view = st.view === 0 ? 8 : 0; command('cam', { i: st.view }); render(); }
        }),
        h('button', { type: 'button', class: 'lk-act-btn', text: '↺ Reset', onclick: function () { command('reset'); } }),
        h('button', {
          type: 'button',
          class: 'lk-act-btn',
          text: '★ Favorite',
          onclick: function () {
            var pName = 'Fav Look ' + (savedPresets.length + 1);
            savedPresets.unshift({ name: pName, hex: encode(d), kind: d.kind });
            st.activePresetName = pName;
            persistLocal();
            render();
          }
        }),
        h('button', { type: 'button', class: 'lk-act-btn', text: '🎲 Randomize All', onclick: function () { command('random'); } }),
        h('button', {
          type: 'button',
          class: 'lk-save-btn go',
          disabled: !ready() || busy() || (paid() && cost > cash),
          text: st.waiting ? 'SAVING…' : (paid() && cost > 0 ? 'BUY & SAVE ' + money(cost) : '💾 Save Appearance'),
          onclick: save
        })
      ])
    ]);

    root.textContent = '';
    root.appendChild(topbar);
    root.appendChild(navRail);
    root.appendChild(subPanel);
    root.appendChild(pedestal);
    root.appendChild(rightPanel);
    root.appendChild(bottomBar);
    root.classList.add('on');

    var newScroll = root.querySelector('.lk-scroll-body');
    if (newScroll) newScroll.scrollTop = scrollPos;

    root.querySelectorAll('button, input, select').forEach(function (b) {
      if (!b.classList.contains('go') && !b.classList.contains('cancel') && !b.classList.contains('preview-retry')) {
        if (!b.hasAttribute('disabled')) b.disabled = busy();
      }
    });
    root.setAttribute('aria-busy', busy() ? 'true' : 'false');
    E.touch();
  }

  function bindPedestalDrag(el) {
    var dragging = false, lastX = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.target && e.target.tagName === 'BUTTON') return;
      dragging = true;
      lastX = e.clientX;
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      if (Math.abs(dx) >= 12) {
        lastX = e.clientX;
        command('rot', { d: Math.max(-45, Math.min(45, Math.round(dx * 0.65))) });
      }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      el.addEventListener(ev, function () { dragging = false; });
    });
  }

  E.on('lookui', function (m) {
    if (!m || !m.t) return;
    if (m.t === 'open') {
      var saved = decode(m.saved), draft = decode(m.draft);
      if (!saved || !draft || !/^[1-9][0-9]{0,9}$/.test(String(m.s))) return;
      close();
      shop = shops[String(m.s)] || null;
      st = {
        s: String(m.s),
        opts: m.opts || [],
        kinds: m.kinds || {},
        saved: saved,
        draft: draft,
        nav: 'face',
        clothSlot: 4,
        accSlot: 7,
        tatSlot: 21,
        search: '',
        page: {},
        group: {},
        activePresetName: 'Preset 01',
        revision: 0,
        waitRevision: 0,
        sequenced: +m.sync === 1,
        pending: '',
        previewTimeout: false,
        view: 0,
        waiting: false,
        error: '',
        hmin: +m.hmin || 151,
        hmax: +m.hmax || 199,
        wmin: +m.wmin || 41,
        wmax: +m.wmax || 94
      };
      if (ready() && mode() === MODE_SHOP) st.nav = 'clothing';
      st.shopReady = ready();
      toClient('ack');
      render();
      return;
    }
    if (!st || String(m.s) !== st.s) return;
    if (m.t === 'draft' || m.t === 'wait') {
      var expected = m.t === 'wait' ? st.waitRevision : st.revision;
      if (st.sequenced && (!/^[0-9]{1,10}$/.test(String(m.r)) || +m.r !== expected)) return;
    }
    if (m.t === 'draft') {
      var next = decode(m.h);
      if (next) {
        if (st.pending && st.sequenced && m.a !== st.pending) return;
        stopDraft(); stopPreview(); st.pending = ''; st.previewTimeout = false;
        st.draft = next; st.error = String(m.error || '');
        if (m.waiting != null) st.waiting = !!+m.waiting;
        if (st.waiting && /^[0-9]{1,10}$/.test(String(m.wr))) st.waitRevision = +m.wr;
        if (!st.waiting) stopSave();
        render();
      }
    } else if (m.t === 'wait') {
      if (+m.on && !st.waiting) return;
      st.waiting = !!+m.on;
      if (!st.waiting) stopSave();
      render();
    } else if (m.t === 'close') {
      close();
    }
  });

  E.on('lookshop', function (m) {
    if (!m) return;
    if (m.t === 'error') {
      if (!st || String(m.s) !== st.s) return;
      stopSave(); st.waiting = false; st.error = String(m.message || 'Gagal menyimpan. Coba lagi.');
      toClient('retry', { r: st.waitRevision });
      render();
      return;
    }
    if (m.t !== 'shop') return;
    var session = String(m.s);
    if (!/^[1-9][0-9]{0,9}$/.test(session)) return;
    if (!shops[session]) shopOrder.push(session);
    shops[session] = m;
    while (shopOrder.length > 8) delete shops[shopOrder.shift()];
    if (st && session !== st.s) return;
    shop = m;
    if (st && String(m.s) === st.s) {
      if (!st.shopReady) st.nav = +m.mode === MODE_SHOP ? 'clothing' : 'face';
      st.shopReady = true;
      render();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (!st || /INPUT|SELECT|TEXTAREA/.test((event.target || {}).tagName || '')) return;
    if (event.key === 'Escape') { event.preventDefault(); cancel(); }
    else if (event.key === 'ArrowLeft') command('rot', { d: -15 });
    else if (event.key === 'ArrowRight') command('rot', { d: 15 });
  });

  window.ELook = { state: function () { return st; }, shop: function () { return shop; }, encode: encode, decode: decode, cost: totalCost };
  E.done('look');
})();
