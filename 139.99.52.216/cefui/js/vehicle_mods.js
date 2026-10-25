/* EAGLE V125 - real native vehicle preview; the server owns validation and saving. */
(function () {
  'use strict';
  var E = window.EAGLE, U = window.UI, catalog = window.EAGLEVehicleModCatalog;
  if (!E || !U || !catalog) return;
  var performanceCatalog=window.EAGLEVehiclePerformanceCatalog || [];
  var presets=[[0,0,0,0,0,0,0],[1,1,1,1,1,1,1],[2,2,2,2,2,2,2],[4,3,3,3,3,3,3],[5,4,3,3,3,3,3]];
  var h = U.h, state = null, seq = 0, lastClosed = 0, category = 0, queued = {}, timer = 0, pending = false, saveSeq = 0;
  var groups = [
    ['paint','Cat & kaca','grid','Warna yang membentuk karakter mobilmu.'],
    ['wheels','Velg','gear','Pilih model dan finishing velg.'],
    ['lights','Lampu','light','Atur sorot lampu dan cahaya bawah bodi.'],
    ['stance','Stance','wrench','Sesuaikan tinggi, tapak, dan posisi roda.'],
    ['plate','Plat','id','Buat identitas kendaraanmu.'],
    ['performance','Mesin','engine','Bangun tenaga mobilmu. Pilihan stage dan target mengikuti data handling kendaraan ini.']
  ];
  var palette = ['e7e4dd','242629','111214','7e8588','cf4141','a25a40','d29e4b','d9ca86','647d66','3d626c','4a72a5','736089'];
  var root = h('section',{id:'eagle-vehicle-mods',class:'evm','aria-hidden':'true'});
  U.layer('vehiclemodlayer').appendChild(root);
  var panel, contents, title, note, badge, save, cancel, previewPlate, tabButtons = [];
  function button(label, cls, fn) { return h('button',{type:'button',class:cls,text:label,onclick:fn}); }
  function icon(name) { return h('span',{class:'evm-icon',html:U.icon(name)}); }
  function clamp(f, v) { v = Math.round(Number(v)); return isFinite(v) ? Math.max(f.min,Math.min(f.max,v)) : f.default; }
  function hex(v) { return v < 0 ? 'ORIGINAL' : '#'+('000000'+(v>>>0).toString(16)).slice(-6).toUpperCase(); }
  function valueLabel(f, v) {
    if (f.id === 1 || f.id === 2) return v+'%';
    if (f.id === 5 || f.id === 6) return v+'°';
    if (f.id === 14) return v < 0 ? 'Original' : Math.round(v/220*100)+'%';
    return (v > 0 ? '+' : '')+v+' cm';
  }
  function dirtyCount() {
    if (!state) return 0;
    return state.performance.filter(function(v,i){return v !== state.savedPerformance[i];}).length +
      state.values.filter(function(v,i){return v !== state.saved[i];}).length +
      (state.plate !== state.savedPlate ? 1 : 0) + (state.region !== state.savedRegion ? 1 : 0);
  }
  function footer() {
    if (!state) return;
    var dirty = dirtyCount();
    badge.textContent = dirty ? dirty+' perubahan' : 'Sesuai data tersimpan';
    badge.classList.toggle('dirty',!!dirty);
    save.disabled = pending || !dirty;
    save.textContent = pending ? 'Menyimpan…' : 'Simpan modifikasi';
    cancel.disabled = pending;
    note.textContent = state.message || (category===5 ? 'Performa aktif setelah Simpan. Target tuning bukan hasil uji kecepatan di jalan.' : 'Preview pribadi · Simpan untuk menerapkan ke semua pemain.');
    syncPerformance();
    note.classList.toggle('success',state.message === 'Modifikasi tersimpan.');
    if (previewPlate) {
      previewPlate.querySelector('.evm-plate-number').textContent = state.plate || 'NOMOR PLAT';
      previewPlate.querySelector('.evm-plate-region').textContent = state.region || 'RP EAGLE';
    }
  }
  function request(action, index, body) {
    if (!state) return 0;
    seq++;
    E.send('vehmod',action,index,state.sid+'|'+seq+'|'+String(body == null ? 0 : body));
    return seq;
  }
  function flush() {
    clearTimeout(timer); timer = 0;
    var entries = queued; queued = {};
    Object.keys(entries).forEach(function(key) {
      var entry = entries[key]; request(entry.action,entry.index,entry.body);
    });
  }
  function schedule(action,index,body,immediate) {
    queued[action+':'+index] = {action:action,index:index,body:body};
    if (immediate) flush();
    else if (!timer) timer = setTimeout(flush,120);
  }
  function setField(f, value, immediate) {
    if (!state || pending) return;
    value = clamp(f,value);
    if (f.options && !f.options.some(function(o){return o[0] === value;})) return;
    if (f.id === 16 && value >= 0 && !(state.vinylMask & (1<<value))) return;
    if (f.id === 19 && value >= 0 && !state.paintable) return;
    state.values[f.id] = value; state.message = '';
    syncField(f); schedule('set',f.id,value,immediate); footer();
  }
  function syncField(f) {
    if (!state) return;
    var row = contents.querySelector('[data-field="'+f.id+'"]');
    if (!row) return;
    var value = state.values[f.id], range = row.querySelector('input[type=range]'), read = row.querySelector('.evm-value');
    if (range) {
      if (+range.value !== value) range.value = value;
      range.style.setProperty('--fill',((value-f.min)/(f.max-f.min)*100)+'%');
    }
    if (read) read.textContent = f.type === 'color' ? hex(value) : valueLabel(f,value);
    row.querySelectorAll('[data-choice]').forEach(function(b){
      var selected = +b.dataset.choice === value; b.classList.toggle('selected',selected); b.setAttribute('aria-pressed',selected?'true':'false');
    });
    var input = row.querySelector('.evm-hex');
    if (input && document.activeElement !== input) input.value = value < 0 ? '' : hex(value).slice(1);
  }
  function makeField(f) {
    var row = h('section',{class:'evm-control','data-field':f.id});
    var reset = button('Reset','evm-small',function(){setField(f,f.default,true);});
    reset.setAttribute('aria-label','Reset '+f.name);
    row.appendChild(h('div',{class:'evm-control-head'},[h('label',{text:f.name,for:'evm-input-'+f.id}),reset]));
    if (f.type === 'range') {
      row.appendChild(h('div',{class:'evm-range-caption'},[
        h('span',{text:f.id === 14 ? 'Original → gelap' : 'Preview langsung'}),h('output',{class:'evm-value'})
      ]));
      var slider = h('input',{id:'evm-input-'+f.id,type:'range',min:f.min,max:f.max,step:f.step,
        'aria-label':f.name,oninput:function(){setField(f,this.value,false);},onchange:flush});
      row.appendChild(slider);
      row.appendChild(h('div',{class:'evm-limits'},[h('span',{text:valueLabel(f,f.min)}),h('span',{text:valueLabel(f,f.max)})]));
    } else if (f.type === 'color') {
      var swatches = h('div',{class:'evm-swatches'});
      if (f.min < 0) {
        var original = button('Asli','evm-swatch evm-original',function(){setField(f,-1,true);});
        original.dataset.choice = -1; original.title = 'Warna asli kendaraan'; swatches.appendChild(original);
      }
      palette.forEach(function(color){
        var v = parseInt(color,16), b = button('','evm-swatch',function(){setField(f,v,true);});
        b.dataset.choice = v; b.style.setProperty('--swatch','#'+color); b.setAttribute('aria-label','Warna #'+color); swatches.appendChild(b);
      });
      row.appendChild(swatches);
      var custom = h('input',{id:'evm-input-'+f.id,class:'evm-hex',type:'text',maxlength:6,placeholder:'RRGGBB',autocomplete:'off',spellcheck:'false','aria-label':'Kode hex '+f.name});
      var apply = function(){
        var text = custom.value.replace(/^#/,'').trim();
        if (/^[0-9a-fA-F]{6}$/.test(text)) { custom.setCustomValidity('');setField(f,parseInt(text,16),true); }
        else { custom.setCustomValidity('Masukkan 6 digit kode warna.');state.message='Kode warna harus 6 digit, contoh: E7E4DD.';footer(); }
      };
      custom.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();apply();custom.blur();}});
      row.appendChild(h('div',{class:'evm-custom-color'},[h('span',{class:'evm-value'}),custom,button('Terapkan','evm-small',apply)]));
    } else {
      var options = f.options || [[-1,'Tanpa vinyl']];
      if (f.type === 'vinyl') for (var n=0;n<16;n++) if (state.vinylMask & (1<<n)) options.push([n,'Vinyl '+(n+1)]);
      var choices = h('div',{class:'evm-choices'+(f.type === 'rim' ? ' evm-rims' : '')});
      options.forEach(function(option, i){
        var b = button('','evm-choice',function(){setField(f,option[0],true);});
        b.dataset.choice=option[0]; b.disabled = f.id === 19 && option[0] >= 0 && !state.paintable;
        if (f.type === 'rim') b.appendChild(h('span',{class:'evm-rim-mark',text:('0'+i).slice(-2)}));
        b.appendChild(h('span',{text:option[1]})); b.setAttribute('aria-label',f.name+': '+option[1]); choices.appendChild(b);
      });
      row.appendChild(choices);
      if (f.id === 16 && !state.vinylMask) row.appendChild(h('p',{class:'evm-help',text:'Belum ada tekstur vinyl di client ini.'}));
      if (f.id === 19 && !state.paintable) row.appendChild(h('p',{class:'evm-help',text:'Model kendaraan ini tidak mendukung paintjob GTA.'}));
    }
    return row;
  }
  function performanceAllowed() {return !!(state && state.performanceAllowed && performanceCatalog.length===7);}
  function setPerformance(field,value) {
    if (!performanceAllowed() || pending) return;
    value=Math.round(Number(value));
    if (!Number.isFinite(value) || value<field.min || value>field.max) return;
    state.performance[field.id]=value;state.performancePending=true;state.message='';
    schedule('performance',field.id,value,true);syncPerformance();footer();
  }
  function choosePreset(index) {
    if (!performanceAllowed() || pending || !presets[index]) return;
    state.performance=presets[index].slice();state.performancePending=true;state.message='';
    schedule('preset',index,0,true);syncPerformance();footer();
  }
  function syncPerformance() {
    if (!state || !contents) return;
    performanceCatalog.forEach(function(field){
      var row=contents.querySelector('[data-performance="'+field.id+'"]');
      if(!row)return;
      row.querySelectorAll('[data-stage]').forEach(function(b){
        var selected=+b.dataset.stage===state.performance[field.id];
        b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected?'true':'false');
      });
    });
    contents.querySelectorAll('[data-preset]').forEach(function(b){
      b.classList.toggle('selected',presets[+b.dataset.preset].every(function(v,i){return v===state.performance[i];}));
    });
    var top=contents.querySelector('[data-performance-top]');
    if(top)top.textContent=state.performancePending ? '…' : String(+state.estimatedTop||0);
    var acceleration=contents.querySelector('[data-performance-accel]');
    if(acceleration)acceleration.textContent=state.performancePending ? '…' : '+'+(+state.accelerationBonus||0);
    var brake=contents.querySelector('[data-performance-brake]');
    if(brake)brake.textContent=state.performancePending ? '…' : '+'+(+state.brakeBonus||0);
  }
  function buildPerformance() {
    var metrics=h('div',{class:'evm-performance-metrics'});
    [['Target tuning','data-performance-top','km/jam'],['Bonus akselerasi','data-performance-accel','km/jam per detik'],['Bonus pengereman','data-performance-brake','km/jam per detik']].forEach(function(metric){
      var value=h('strong',{});value.setAttribute(metric[1],'');
      metrics.appendChild(h('div',{class:'evm-performance-metric'},[h('span',{text:metric[0]}),value,h('small',{text:metric[2]})]));
    });
    contents.appendChild(metrics);
    var presetRow=h('div',{class:'evm-performance-presets','aria-label':'Paket performa'});
    ['Standar','Street','Sport','Race','Extreme'].forEach(function(label,index){
      var b=button(label,'evm-choice',function(){choosePreset(index);});b.dataset.preset=index;presetRow.appendChild(b);
    });contents.appendChild(presetRow);
    performanceCatalog.forEach(function(field){
      var row=h('section',{class:'evm-control','data-performance':field.id});
      row.appendChild(h('div',{class:'evm-control-head'},[h('label',{text:field.name}),button('Standar','evm-small',function(){setPerformance(field,0);})]));
      var choices=h('div',{class:'evm-choices evm-performance-choices'});
      field.options.forEach(function(option){
        var b=button(option[1],'evm-choice',function(){setPerformance(field,option[0]);});b.dataset.stage=option[0];
        b.setAttribute('aria-label',field.name+': '+option[1]);choices.appendChild(b);
      });row.appendChild(choices);contents.appendChild(row);
    });
    contents.appendChild(h('p',{class:'evm-help',text:'Basis handling: '+(+state.baseTop||0)+' km/jam. Kombinasi mesin dan turbo menambah tenaga; rem membantu mengurangi kecepatan. Mode manual mengikuti target gigi. Simpan untuk menerapkan pada kendaraan ini.'}));
  }
  function plateInput(index,label,max) {
    var input = h('input',{class:'evm-text',type:'text',id:'evm-plate-'+index,maxlength:max,autocomplete:'off',autocapitalize:'characters',spellcheck:'false','aria-label':label});
    input.value = index === 0 ? state.plate : state.region;
    input.addEventListener('input',function(){
      if (!state || pending) return;
      var value = input.value.toUpperCase().replace(index === 0 ? /[^A-Z0-9 -]/g : /[^A-Z0-9]/g,'').slice(0,max);
      input.value=value;
      if (index===0) state.plate=value; else state.region=value;
      state.message='';footer();
      if (index===0 && !/[A-Z0-9]/.test(value)) return;
      schedule('plate',index,value,false);
    });
    input.addEventListener('blur',flush);
    input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();flush();input.blur();}});
    return h('div',{class:'evm-control'},[h('label',{for:input.id,text:label}),input]);
  }
  function buildControls() {
    if (!state) return;
    contents.textContent='';previewPlate=null;
    title.textContent=groups[category][1];
    tabButtons.forEach(function(b,i){b.classList.toggle('active',i===category);b.setAttribute('aria-selected',i===category?'true':'false');});
    contents.appendChild(h('p',{class:'evm-section-note',text:groups[category][3]}));
    if(category===5 && performanceAllowed())buildPerformance();
    if (category===4) {
      previewPlate=h('div',{class:'evm-plate-preview','aria-label':'Preview teks plat'},[
        h('span',{class:'evm-plate-number'}),h('span',{class:'evm-plate-region'})
      ]);
      contents.appendChild(previewPlate);
      contents.appendChild(plateInput(0,'Nomor plat',12));contents.appendChild(plateInput(1,'Kode wilayah',3));
    }
    catalog.forEach(function(f){if(f.group===groups[category][0])contents.appendChild(makeField(f));});
    catalog.forEach(syncField);footer();contents.scrollTop=0;E.touch();
  }
  function closeLocal() {
    clearTimeout(timer);timer=0;queued={};state=null;pending=false;saveSeq=0;
    root.classList.remove('on');root.setAttribute('aria-hidden','true');root.removeAttribute('data-touch');
    root.textContent='';document.body.classList.remove('eagle-vehmod-open');E.touch();
  }
  function closeRequest() {
    if (!state || pending) return;
    // Cancel does not need pending previews; the server restores the committed profile.
    clearTimeout(timer);timer=0;queued={};
    request('close',0,0);lastClosed=state.sid;closeLocal();
  }
  function saveRequest() {
    if (!state || pending || !dirtyCount()) return;
    if (!/[A-Z0-9]/.test(state.plate)) {state.message='Nomor plat harus berisi huruf atau angka.';footer();return;}
    // Finish text edits first. Network event queue preserves this order.
    if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur();
    flush();pending=true;state.message='';saveSeq=request('save',0,0);footer();
  }
  function build() {
    root.textContent='';
    var camera=h('nav',{class:'evm-cameras','aria-label':'Sudut kamera'});
    ['Depan','Belakang','Samping','Detail'].forEach(function(label,i){
      var b=button(label,'evm-camera',function(){
        if(pending)return;flush();request('camera',i,0);
        camera.querySelectorAll('button').forEach(function(el){el.classList.toggle('active',el===b);});
      });
      if(!i)b.classList.add('active');camera.appendChild(b);
    });
    root.appendChild(h('div',{class:'evm-view-caption'},[
      h('span',{class:'evm-kicker',text:'RP EAGLE / CUSTOMS'}),
      h('h1',{text:state.name || ('Kendaraan '+state.model)}),
      h('span',{class:'evm-view-sub',text:'Bangun gaya berkendaramu.'}),camera
    ]));
    panel=h('div',{class:'evm-panel'});
    var close=button('','evm-close',closeRequest);close.innerHTML=U.icon('x');close.setAttribute('aria-label','Tutup modifikasi');
    panel.appendChild(h('header',{class:'evm-header'},[
      h('div',{},[h('span',{class:'evm-kicker',text:'VEHICLE CUSTOMIZATION'}),h('strong',{text:'Workshop'})]),close
    ]));
    var tabs=h('nav',{class:'evm-tabs',role:'tablist','aria-label':'Kategori modifikasi'});tabButtons=[];
    groups.forEach(function(group,i){
      var b=button('','evm-tab',function(){if(pending)return;flush();category=i;buildControls();});
      if(i===5 && !performanceAllowed())b.style.display='none';
      b.setAttribute('role','tab');b.setAttribute('aria-label',group[1]);b.appendChild(icon(group[2]));b.appendChild(h('span',{text:group[1]}));tabs.appendChild(b);tabButtons.push(b);
    });
    title=h('h2',{});contents=h('div',{class:'evm-controls',role:'tabpanel'});
    panel.appendChild(tabs);panel.appendChild(h('div',{class:'evm-category-head'},[
      title,button('Reset semua','evm-small',function(){
        if(pending)return;flush();state.values=catalog.map(function(f){return f.default;});state.message='';
        if(performanceAllowed()){state.performance=presets[0].slice();state.performancePending=true;}
        request('reset',-1,0);buildControls();
      })
    ]));panel.appendChild(contents);
    note=h('p',{class:'evm-status','aria-live':'polite'});badge=h('span',{class:'evm-badge'});
    save=button('Simpan modifikasi','evm-save',saveRequest);cancel=button('Batal','evm-cancel',closeRequest);
    panel.appendChild(h('footer',{class:'evm-footer'},[badge,note,h('div',{class:'evm-actions'},[cancel,save])]));
    root.appendChild(panel);root.classList.add('on');root.setAttribute('aria-hidden','false');root.setAttribute('data-touch','');
    document.body.classList.add('eagle-vehmod-open');buildControls();E.touch();
  }
  E.on('vehmod',function(d){
    if (!d || !Number.isInteger(+d.sid) || +d.sid <= 0) return;
    var sid=+d.sid;
    if (d.show === 0 || d.show === false) {
      if (state && sid === state.sid) {lastClosed=Math.max(lastClosed,sid);closeLocal();}
      return;
    }
    if (sid<=lastClosed || (state && sid<state.sid)) return;
    if (!Array.isArray(d.values) || d.values.length!==catalog.length || !Array.isArray(d.saved) || d.saved.length!==catalog.length) return;
    if (!d.values.every(function(v,i){return Number.isInteger(v)&&v>=catalog[i].min&&v<=catalog[i].max;})) return;
    var hasPerformance=Array.isArray(d.performance) && Array.isArray(d.savedPerformance);
    if(hasPerformance) {
      if(d.performance.length!==performanceCatalog.length || d.savedPerformance.length!==performanceCatalog.length)return;
      if(![d.performance,d.savedPerformance].every(function(values){return values.every(function(v,i){return Number.isInteger(v)&&v>=performanceCatalog[i].min&&v<=performanceCatalog[i].max;});}))return;
    } else if(d.performanceAllowed)return;
    var tune=hasPerformance ? d.performance.slice():performanceCatalog.map(function(){return 0;});
    var savedTune=hasPerformance ? d.savedPerformance.slice():performanceCatalog.map(function(){return 0;});
    d=Object.assign({},d,{performance:tune,savedPerformance:savedTune,performancePending:false});
    var fresh=!state || sid!==state.sid;
    if (fresh) {
      closeLocal();state=Object.assign({},d,{sid:sid,values:d.values.slice(),saved:d.saved.slice()});
      seq=Math.max(0,+d.ack||0);pending=false;category=Math.max(0,Math.min(d.performanceAllowed ? 5:4,+d.category||0));build();return;
    }
    var ack=+d.ack||0;
    if (ack < (state.ack||0)) return;
    state.ack=ack;
    // Keep unsent or newer local inputs stable until the matching server response.
    if (ack < seq || Object.keys(queued).length) return;
    state=Object.assign({},state,d,{values:d.values.slice(),saved:d.saved.slice()});
    if (pending && ack>=saveSeq) {pending=false;saveSeq=0;}
    catalog.forEach(syncField);syncPerformance();
    tabButtons.forEach(function(b,i){if(i===5)b.style.display=performanceAllowed()?'':'none';});
    var number=contents.querySelector('#evm-plate-0'),region=contents.querySelector('#evm-plate-1');
    if(number && document.activeElement!==number)number.value=state.plate;
    if(region && document.activeElement!==region)region.value=state.region;
    footer();
  });
  E.on('auth',function(d){if(d && ['login','register','chars','charinfo','create','spawn'].indexOf(d.v)>=0)closeLocal();});
  window.addEventListener('keydown',function(e){
    if(!state || !E.canInteract(root) || e.defaultPrevented || e.isComposing || e.repeat)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeRequest();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveRequest();}
  },true);
  root.addEventListener('contextmenu',function(e){e.preventDefault();});
  E.done('vehicle_mods');
})();

