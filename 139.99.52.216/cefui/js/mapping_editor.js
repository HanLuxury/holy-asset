/* EAGLE Ingame Mapping Editor + player-left quick controls.
 * Pawn remains authoritative for all edits, ownership and vehicle locks. */
(function () {
  'use strict';
  var E = window.EAGLE;
  if (!E || !E.on || !E.send) return;
  var mount = document.getElementById('overlaylayer') || document.getElementById('app');
  if (!mount) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function btn(label, cls, callback, title) {
    var b = el('button', cls || '', label);
    b.type = 'button'; b.setAttribute('data-touch', '');
    if (title) b.title = title;
    b.addEventListener('click', function (ev) { ev.preventDefault(); callback(); });
    return b;
  }
  function send(a, i, s) { E.send('mapping', a, i == null ? -1 : i, s || ''); }
  function controls() {
    var quick = el('div', 'eagle-quick-actions');
    quick.id = 'eagle-quick-actions';
    var menu = btn('☷', 'eagle-quick-btn menu', function () { E.send('quick', 'menu', -1); }, 'Buka menu radial');
    var lock = btn('⌑', 'eagle-quick-btn lock', function () { E.send('quick', 'lock', -1); }, 'Kunci / buka kendaraan terdekat milikmu');
    menu.setAttribute('aria-label', 'Buka Menu');
    lock.setAttribute('aria-label', 'Kunci Kendaraan');
    menu.appendChild(el('small', '', 'MENU'));
    lock.appendChild(el('small', '', 'LOCK'));
    quick.append(menu, lock);
    mount.appendChild(quick);
    E.on('hud', function (d) {
      quick.classList.toggle('show', Number(d && d.show || 0) === 1);
      if (E.touch) E.touch();
    });
  }
  controls();

  var root = el('section', 'eagle-mapping-editor');
  root.id = 'eagle-mapping-editor';
  root.setAttribute('aria-label', 'Editor Mapping Ingame');
  mount.appendChild(root);
  var data = {show:0};
  var stepMode = 2;
  var pendingDelete = false;

  function render() {
    root.replaceChildren();
    root.classList.toggle('open', Number(data.show) === 1);
    if (!Number(data.show)) { if (E.touch) E.touch(); return; }
    var view = el('div', 'eagle-map-browser');
    var bar = el('header', 'eagle-map-head');
    var hd = el('div', 'eagle-map-heading');
    hd.append(el('span', 'eagle-map-eyebrow', 'EAGLE ROLEPLAY / BUILDER'), el('strong', '', 'MAPPING EDITOR'));
    bar.append(hd, btn('✕', 'eagle-map-close', function () { send('close'); }, 'Tutup mapping'));
    view.append(bar);

    var tabs = el('div','eagle-map-tabs');
    tabs.append(
      btn('TEMPLATE', 'eagle-map-tab ' + (!Number(data.mode) ? 'active' : ''), function(){send('mode',0);}),
      btn('TERPASANG', 'eagle-map-tab ' + (Number(data.mode) ? 'active' : ''), function(){send('mode',1);})
    );
    view.append(tabs);
    var all = el('div', 'eagle-map-list');
    (Array.isArray(data.items) ? data.items : []).forEach(function (it) {
      var id = Number(it.id);
      var isSelected = Number(data.mode) ? Number(data.selected) === id : Number(data.chosen) === id;
      var row = btn('', 'eagle-map-list-row ' + (isSelected ? 'selected' : ''), function () { send('choose',id); });
      row.append(el('b','',String(id)), el('span','eagle-map-item-name',String(it.name || 'Mapping')),el('small','',String(it.objects || 0) + ' objek'));
      all.appendChild(row);
    });
    if (!all.children.length) all.appendChild(el('div','eagle-map-empty','Belum ada instance. Pilih template lalu pasang.'));
    view.append(all);
    var pages = el('div','eagle-map-pages');
    pages.append(
      btn('‹', 'eagle-map-nav',function(){send('page',-1);}),
      el('span','', String(Number(data.page||0)+1) + ' / ' + String(data.pages||1)),
      btn('›','eagle-map-nav',function(){send('page',1);})
    );
    view.append(pages);
    var bottom = el('div','eagle-map-browser-actions');
    if (!Number(data.mode)) {
      bottom.appendChild(btn('+ PASANG TEMPLATE', 'eagle-map-cta', function () { send('add'); }));
    } else {
      bottom.appendChild(btn('◎ CARI TERDEKAT', 'eagle-map-cta ghost', function(){send('nearest');}));
    }
    view.append(bottom);
    root.append(view);

    var side = el('aside','eagle-map-tools');
    side.append(el('div','eagle-map-tool-heading','TRANSFORM'));
    var sel = Number(data.selected) || 0;
    if (sel) {
      side.append(el('div','eagle-map-target','#' + sel + '  ' + String(data.name || 'Objek')));
      var coords = el('div','eagle-map-coords');
      coords.append(el('span','', 'X ' + Number(data.x||0).toFixed(2)),el('span','', 'Y ' + Number(data.y||0).toFixed(2)),
        el('span','', 'Z ' + Number(data.z||0).toFixed(2)),el('span','', 'R ' + Number(data.yaw||0).toFixed(1) + '°'));
      side.append(coords);
    } else side.append(el('div','eagle-map-target muted','Pilih instance terpasang'));

    var step = el('div','eagle-map-step');
    step.append(el('label','','LANGKAH'));
    [[1,'0.1'],[2,'0.5'],[3,'1'],[4,'5']].forEach(function(k){
      step.append(btn(k[1], 'eagle-map-step-btn ' + (stepMode === k[0] ? 'chosen' : ''), function(){stepMode=k[0];render();}));
    });
    side.append(step);
    [['X','xn','xp'],['Y','yn','yp'],['Z','zn','zp'],['ROTASI','rn','rp']].forEach(function(row){
      var line = el('div','eagle-map-axis');
      line.append(el('b','',row[0]), btn('−','eagle-map-nudge',function(){send(row[1],stepMode);}),
        btn('+','eagle-map-nudge',function(){send(row[2],stepMode);}));
      side.append(line);
    });
    side.append(btn('◉  KE POSISI SAYA','eagle-map-tool-action',function(){send('place');}),
      btn('↗  TELEPORT KE OBJEK','eagle-map-tool-action',function(){send('goto');}));
    if (pendingDelete) {
      var warning = el('div','eagle-map-warning');
      warning.append(el('span','','Hapus instance #' + sel + '?'),
        btn('YA, HAPUS','eagle-map-danger',function(){send('remove',sel);pendingDelete=false;}),
        btn('BATAL','eagle-map-tool-action',function(){pendingDelete=false;render();}));
      side.append(warning);
    } else side.append(btn('HAPUS INSTANCE','eagle-map-danger-outline',function(){if(sel>0){pendingDelete=true;render();}}));
    if (Number(data.protected)) side.append(el('small','eagle-map-save-protect','Mode aman: database prefab belum lengkap. Simpan dinonaktifkan.'));
    else side.append(el('small','eagle-map-save-note','Perubahan posisi langsung disimpan ke instances.db.'));
    if (!sel) side.classList.add('no-selection');
    root.append(side);
    if (E.touch) E.touch();
  }

  E.on('mapping',function(d){
    if (!d) return;
    if (Number(d.selected) !== Number(data.selected)) pendingDelete=false;
    data=d; render();
  });
  if (E.done) E.done('mapping_editor');
})();
