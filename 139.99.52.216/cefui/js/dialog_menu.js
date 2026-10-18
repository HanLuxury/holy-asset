/* EAGLE V124. Global SA-MP/easyDialog cards, single activation per server sequence.
   Existing dialog IDs, indices, button responses and input callbacks are preserved. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, h = U.h;
  if (!E || !U) return;
  var root = h('div', {id:'eagle-dialog',class:'edlg','aria-hidden':'true'});
  U.layer('dialoglayer').appendChild(root);
  var state = null, selected = 0, locked = false, epoch = 0, highestSeq = 0;
  var activationUntil = 0, inputTimer = 0, priorFocus = null, pointerIntent = null;
  function text(v) { return String(v == null ? '' : v); }
  function plain(v) { return U.plain(text(v).replace(/~\^~|~t~/gi,' ').replace(/~\|~/g,' ')).replace(/\s+/g,' ').trim(); }
  function title(v) {
    return plain(v).replace(/^(?:rp\s*eagle|eagle(?:\s+roleplay)?)\s*[-–:|]\s*/i,'') || 'Menu';
  }
  function isList(s) { return s === 2 || s === 4 || s === 5; }
  function isInput(s) { return s === 1 || s === 3; }
  function lines(info, enc) {
    var s = text(info).replace(/\r/g,'');
    return ((enc|0) >= 2 ? s.replace(/~\|~/g,'\n') : s.replace(/~n~/gi,'\n')).split('\n');
  }
  function columns(line, enc) { return (enc|0) >= 2 ? text(line).split('~^~') : text(line).split(/\t|~t~/gi); }
  function listData(d) {
    var rows = lines(d.info,d.enc), headers = null;
    // Match Pawn's count: trailing line breaks add no rows; a blank middle row does.
    while (rows.length && rows[rows.length-1] === '') rows.pop();
    if (d.style === 5 && rows.length) headers = columns(rows.shift(),d.enc);
    return {headers:headers,rows:rows.map(function (line,i) { return {index:i,cols:columns(line,d.enc)}; })};
  }
  var ICONS = {
    gear:'<path d="m10 2-.6 3-2 .8-2.6-1.7L2 8l2.4 2-.2 2L2 14l2.8 4 2.6-1.6 2 .8.6 3h4l.6-3 2-.8 2.6 1.6 2.8-4-2.2-2-.2-2L22 8l-2.8-3.9-2.6 1.7-2-.8L14 2Zm2 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" fill="currentColor" fill-rule="evenodd"/>',
    bolt:'<path d="M14 1 3 14h7l-1 9L22 9h-8Z" fill="currentColor"/>',
    flag:'<path d="M4 22V3h16v12H6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 3h4v4H5Zm8 0h4v4h-4ZM9 7h4v4H9Zm8 0h3v4h-3ZM5 11h4v4H5Zm8 0h4v4h-4Z" fill="currentColor"/>',
    truck:'<path d="M4 8h9l2 4h5l2 4H2l2-8Zm2 2-1 3h8l-2-3Z" fill="currentColor" fill-rule="evenodd"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 4h3v3H2Zm0 6h3v3H2Zm0 6h3v3H2Z" fill="currentColor"/>'
  };
  var MATCH = [
    [/stock|factory|standar|default/i,'gear'],[/srt|sport|turbo|boost|engine|mesin/i,'bolt'],
    [/track|race|racing|balap/i,'flag'],[/trx|off.?road|truk|truck/i,'truck'],
    [/batal|tutup|close|keluar|hapus|delete/i,'x'],[/kembali|back|sebelumnya/i,'back'],
    [/pesawat|bandara|airport|flight|penerbangan|terbang/i,'plane'],
    [/bank|atm|saldo|setor|tarik|transfer|uang|cash|deposit|withdraw/i,'wallet'],
    [/kendaraan|vehicle|mobil|motor|garasi|garage|bengkel|dealer|bagasi/i,'car'],
    [/rumah|house|rusun|property|gudang|brankas/i,'home'],
    [/job|kerja|tambang|miner|nelayan|taxi|delivery/i,'briefcase'],
    [/polisi|police|sapd|lspd|faction|ems|medic|admin|staff/i,'badge'],
    [/beli|jual|shop|store|warung|market|toko/i,'store'],
    [/pakaian|clothes|character|karakter|skin|appearance|akun/i,'user'],
    [/senjata|weapon|ammo|peluru|rifle|pistol/i,'target'],
    [/setting|pengaturan|atur/i,'gear']
  ];
  function glyph(label, caption) {
    var key = 'list', source = plain(label);
    for (var i=0;i<MATCH.length;i++) if (MATCH[i][0].test(source)) {key=MATCH[i][1];break;}
    if (key === 'list') for (var j=0;j<MATCH.length;j++) if (MATCH[j][0].test(plain(caption))) {key=MATCH[j][1];break;}
    return ICONS[key] ? '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+ICONS[key]+'</svg>' : U.icon(key);
  }
  function format(v,cls) { return h('span',{class:cls||'',html:U.fmt(text(v).replace(/~\^~|~t~/gi,'    '))}); }
  function active(d) { return state === d && !locked; }
  function select(index, scroll) {
    if (!state || !isList(state.style) || !state.rows.length) return;
    selected = Math.max(0,Math.min(state.rows.length-1,index|0));
    root.querySelectorAll('.edlg-row-item').forEach(function (el) {
      var on = +el.dataset.index === selected;
      el.classList.toggle('selected',on); el.setAttribute('aria-selected',on?'true':'false');
      if (on && scroll) el.scrollIntoView({block:'nearest'});
    });
    var list = root.querySelector('.edlg-list');
    if (list) list.setAttribute('aria-activedescendant','edlg-'+epoch+'-'+selected);
  }
  function mayActivate(ev,d) {
    if (!active(d)) return false;
    // A double tap on A must not select the row occupying the same position in B.
    if (Date.now() < activationUntil && ev && ev.detail > 0) return false;
    return !pointerIntent || pointerIntent.epoch === epoch;
  }
  function clearLocal(restore) {
    ++epoch; clearTimeout(inputTimer);
    if (root.contains(document.activeElement)) try { document.activeElement.blur(); } catch (_) {}
    root.classList.remove('on');root.setAttribute('aria-hidden','true');
    root.removeAttribute('data-touch');
    // Clear synchronously: no old row, closing animation or cleanup timer can overlap B.
    root.replaceChildren();document.body.classList.remove('cef-dialog-open');
    pointerIntent = null;
    if (restore && priorFocus && priorFocus.isConnected) try {priorFocus.focus({preventScroll:true});} catch (_) {}
    if (restore) priorFocus = null;
    if (E.touch) E.touch();
  }
  function submit(accept,d) {
    d = d || state;
    if (!active(d) || accept && isList(d.style) && !d.rows.length) return;
    var index = isList(d.style) ? (d.rows.length ? selected : -1) : -1;
    var input = root.querySelector('.edlg-input'), value = isInput(d.style) && input ? input.value : '';
    locked = true; state = null;activationUntil = Date.now()+240;
    clearLocal(true);
    E.send('dialog',(accept?'accept':'cancel')+'|'+d.seq,index,value);
  }
  function renderRows(d,body) {
    var data = listData(d);d.rows = data.rows;
    if (data.headers) body.appendChild(h('div',{class:'edlg-table-header',text:data.headers.map(plain).join(' / ')}));
    var list = h('div',{class:'edlg-list',role:'listbox','aria-label':title(d.title),tabindex:'0'});
    data.rows.forEach(function (row) {
      var chunks = text(row.cols[0]).split(/~n~/gi), name = chunks.shift();
      var el = h('button',{type:'button',class:'edlg-row-item',id:'edlg-'+epoch+'-'+row.index,
        'data-index':row.index,role:'option','aria-selected':row.index===0?'true':'false',tabindex:'-1'});
      el.appendChild(h('span',{class:'edlg-row-icon',html:glyph(name,d.title),'aria-hidden':'true'}));
      var content = h('span',{class:'edlg-row-content'});
      content.appendChild(format(name || '—','edlg-row-title'));
      if (chunks.length) content.appendChild(format(chunks.join('~n~'),'edlg-row-description'));
      if (row.cols.length > 1) {
        var fields = h('span',{class:'edlg-row-fields'});
        for (var i=1;i<row.cols.length;i++) {
          var field = h('span',{class:'edlg-field'});
          if (data.headers && plain(data.headers[i])) field.appendChild(h('span',{class:'edlg-field-name',text:plain(data.headers[i])+': '}));
          field.appendChild(format(row.cols[i],'edlg-field-value'));fields.appendChild(field);
        }
        content.appendChild(fields);
      }
      el.appendChild(content);
      el.addEventListener('pointerdown',function (ev) {
        if (ev.button > 0 || ev.isPrimary === false) return;
        pointerIntent = {epoch:epoch,pointer:ev.pointerId};
      });
      el.addEventListener('click',function (ev) {
        if (!mayActivate(ev,d)) return;
        select(row.index,false);submit(true,d);
      });
      list.appendChild(el);
    });
    if (!data.rows.length) list.appendChild(h('div',{class:'edlg-empty',text:'Tidak ada pilihan tersedia.'}));
    body.appendChild(list);
  }
  function renderCopy(info,enc) {
    var box = h('div',{class:'edlg-copy'});
    lines(info,enc).forEach(function (line) {box.appendChild(format(line,'edlg-copy-line'));});
    return box;
  }
  function actionButton(label,accept,d,primary) {
    var b = h('button',{type:'button',class:'edlg-btn '+(primary?'primary':'secondary'),text:plain(label),'data-response':accept?'1':'0'});
    b.addEventListener('click',function (ev) {if(mayActivate(ev,d))submit(accept,d);});
    return b;
  }
  function render(d) {
    var hadDialog = !!state;
    if (!hadDialog && !priorFocus) priorFocus = document.activeElement;
    clearLocal(false);
    state = d;locked = false;selected = 0;d.rows = [];
    var currentEpoch = epoch;
    root.className = 'edlg';
    root.setAttribute('aria-hidden','false');root.setAttribute('data-touch','1');
    var shell = h('section',{class:'edlg-shell style-'+d.style,role:'dialog','aria-modal':'true','aria-labelledby':'edlg-title'});
    var heading = h('header',{class:'edlg-top'},h('h2',{id:'edlg-title',text:title(d.title)}));
    shell.appendChild(heading);
    var body = h('div',{class:'edlg-body'});
    if (isList(d.style)) renderRows(d,body);
    else {
      body.appendChild(renderCopy(d.info,d.enc));
      if (isInput(d.style)) {
        var label = h('label',{class:'edlg-input-wrap'},h('span',{class:'edlg-input-label',text:d.style===3?'Password':'Input'}));
        var input = h('input',{id:'edlg-input',class:'edlg-input',type:d.style===3?'password':'text',maxlength:'255',
          autocomplete:'off',autocapitalize:'off',spellcheck:'false',placeholder:d.style===3?'Masukkan password':'Ketik di sini'});
        label.appendChild(input);body.appendChild(label);
        inputTimer = setTimeout(function () {
          if(epoch===currentEpoch && active(d) && input.isConnected) {
            input.focus({preventScroll:true});input.scrollIntoView({block:'nearest'});
          }
        },70);
      }
    }
    shell.appendChild(body);
    var foot = h('footer',{class:'edlg-foot'});
    if (!isList(d.style)) foot.appendChild(actionButton(plain(d.b1)||'Lanjutkan',true,d,true));
    if (isList(d.style) || plain(d.b2)) foot.appendChild(actionButton(plain(d.b2)||'Tutup',false,d,false));
    shell.appendChild(foot);root.appendChild(shell);
    document.body.classList.add('cef-dialog-open');
    select(0,false);
    // Make the new dialog interactive immediately; no deferred open can revive A.
    root.classList.add('on');
    if (isList(d.style)) {
      var list = root.querySelector('.edlg-list');
      if (list) list.focus({preventScroll:true});
    } else if (!isInput(d.style)) {
      var primary = root.querySelector('.edlg-btn');
      if (primary) primary.focus({preventScroll:true});
    }
    if (E.touch) E.touch();
  }
  function normalized(d) {
    return {id:+d.id||0,seq:+d.seq||0,style:+d.style||0,enc:+d.enc||0,title:text(d.title),info:text(d.info),b1:text(d.b1),b2:text(d.b2)};
  }
  E.on('dialog',function (d) {
    if (!d || typeof d!=='object') return;
    var seq = +d.seq||0;
    if (seq && seq < highestSeq) return;
    if (!+d.show) {if(seq)highestSeq=Math.max(highestSeq,seq);state=null;locked=false;clearLocal(true);return;}
    var next = normalized(d);
    // A repeated delivery of the active instance must preserve input and keyboard selection.
    if (state && next.seq && state.seq===next.seq && state.id===next.id &&
      state.style===next.style && state.enc===next.enc && state.title===next.title &&
      state.info===next.info && state.b1===next.b1 && state.b2===next.b2) return;
    if (seq) highestSeq = Math.max(highestSeq,seq);
    // A same-sequence retry while closed is intentional server validation recovery.
    render(next);
  });
  E.on('auth',function (d) {
    if (!d || ['login','chars','charinfo','create','spawn'].indexOf(d.v)<0) return;
    state=null;locked=false;highestSeq=0;activationUntil=0;clearLocal(false);priorFocus=null;
  });
  E.on('dlg',function (d) {
    if (d && +d.show) {state=null;locked=false;clearLocal(true);}
  });
  document.addEventListener('keydown',function (ev) {
    if (!state || !root.classList.contains('on') || ev.isComposing || ev.keyCode===229) return;
    if (ev.key==='Escape') {ev.preventDefault();ev.stopImmediatePropagation();submit(false);return;}
    if (ev.key==='Tab') {
      var focusable = root.querySelectorAll('.edlg-list,.edlg-input,.edlg-btn');
      var first = focusable[0],last = focusable[focusable.length-1];
      if (first && (!root.contains(document.activeElement) || ev.shiftKey && document.activeElement===first || !ev.shiftKey && document.activeElement===last)) {
        ev.preventDefault();(ev.shiftKey?last:first).focus({preventScroll:true});
      }
      ev.stopPropagation();return;
    }
    if (isList(state.style)) {
      var total = state.rows.length;
      if (/^(ArrowDown|ArrowUp|Home|End)$/.test(ev.key)) {
        ev.preventDefault();ev.stopImmediatePropagation();
        select(ev.key==='Home'?0:ev.key==='End'?total-1:selected+(ev.key==='ArrowDown'?1:-1),true);
      } else if (ev.key==='Enter' || ev.key===' ') {
        ev.preventDefault();ev.stopImmediatePropagation();if(!ev.repeat)submit(true);
      }
    } else if (ev.key==='Enter') {ev.preventDefault();ev.stopImmediatePropagation();if(!ev.repeat)submit(true);}
  },true);
  // Keep the menu inside the visible area when Android's keyboard changes its height.
  function viewport() {
    var vv = window.visualViewport;
    root.style.setProperty('--edlg-height',(vv ? Math.min(window.innerHeight,vv.height) : window.innerHeight)+'px');
    if (E.touch) E.touch();
  }
  window.addEventListener('resize',viewport);
  if (window.visualViewport) window.visualViewport.addEventListener('resize',viewport);
  viewport();E.done('dialog_menu');
})();
