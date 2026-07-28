const $ = (id)=>document.getElementById(id);
let state = {contacts:[], businesses:[], apps:{}};

/* ---------- CEF / SAMP bridge (PRESERVED) ---------- */
function send(event, payload={}){
  const json = JSON.stringify(payload);
  try{
    if(window.CefBridge && CefBridge.sendClientEvent) CefBridge.sendClientEvent(event, json);
    else console.log('CEF SEND', event, json);
  }catch(e){ console.log(e); }
}

function setRects(){
  try{
    const rect = $('phone').getBoundingClientRect();
    const payload = [[rect.left, rect.top, rect.width, rect.height]];
    if(window.CefBridge && CefBridge.updateInteractiveAreas) CefBridge.updateInteractiveAreas(JSON.stringify(payload));
  }catch(e){}
}

function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $(id)?.classList.add('active');
  setTimeout(setRects, 50);
}

function toast(msg, type='info'){
  const t = $('toast');
  t.textContent = msg;
  t.className = 'show';
  setTimeout(()=>t.className='', 2800);
}

function money(n){ return '$' + (Number(n)||0).toLocaleString('en-US'); }

/* ---------- App definitions ---------- */
const gridApps = [
  {id:'bank', label:'Bank', icon:'bank.svg', bg:'bg-bank'},
  {id:'contacts', label:'Kontak', icon:'contacts.svg', bg:'bg-contacts'},
  {id:'twitter', label:'Sosmed', icon:'twitter.svg', bg:'bg-twitter', badge:5},
  {id:'business', label:'Business', icon:'business.svg', bg:'bg-business'},
  {id:'gps', label:'GPS', icon:'gps.svg', bg:'bg-gps'},
  {id:'calc', label:'Calc', icon:'calc.svg', bg:'bg-calc'},
  {id:'camera', label:'Camera', icon:'camera.svg', bg:'bg-camera'},
  {id:'photo', label:'Foto RP', icon:'photo.svg', bg:'bg-photo'},
  {id:'unfreeze', label:'Unfreeze', icon:'unfreeze.svg', bg:'bg-unfreeze'},
  {id:'vehicle', label:'Vehicle', icon:'vehicle.svg', bg:'bg-vehicle'},
  {id:'inventory', label:'Inventory', icon:'inventory.svg', bg:'bg-inventory'},
  {id:'appstore', label:'AppStore', icon:'appstore.svg', bg:'bg-appstore'}
];

const dockApps = [
  {id:'contacts', label:'Phone', icon:'call.svg', bg:'bg-call'},
  {id:'contacts', label:'Messages', icon:'sms.svg', bg:'bg-sms'},
  {id:'photo', label:'Photos', icon:'photo.svg', bg:'bg-photo'},
  {id:'appstore', label:'Settings', icon:'appstore.svg', bg:'bg-settings'}
];

/* ---------- Renderers ---------- */
function render(){
  // Lock screen info
  $('lockPlayerName').textContent = state.player || 'Player';
  $('lockPhoneNumber').textContent = state.number || 'No Number';
  $('lockCash').textContent = money(state.cash);
  $('lockBank').textContent = money(state.bank);

  // Home header
  $('playerName') && ($('playerName').textContent = state.player || 'Player');
  $('phoneNumber') && ($('phoneNumber').textContent = state.number || 'No Number');
  $('cash') && ($('cash').textContent = money(state.cash));
  $('bank') && ($('bank').textContent = money(state.bank));

  renderHome();
  renderLockNotifs();
  renderContacts();
  renderBusinesses();
  renderApps();
  setRects();
}

function renderHome(){
  const grid = $('homeGrid');
  if(!grid) return;
  grid.innerHTML = '';
  gridApps.forEach(app=>{
    const btn = document.createElement('button');
    btn.dataset.app = app.id;
    const wrap = document.createElement('div');
    wrap.className = 'app-icon-wrap ' + app.bg;
    wrap.innerHTML = `<img src="../icons/${app.icon}" alt="">`;
    if(app.badge){
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = app.badge;
      wrap.style.position = 'relative';
      wrap.appendChild(badge);
    }
    const lbl = document.createElement('span');
    lbl.className = 'app-label';
    lbl.textContent = app.label;
    btn.appendChild(wrap);
    btn.appendChild(lbl);
    grid.appendChild(btn);
  });

  const dock = $('dock');
  if(!dock) return;
  dock.innerHTML = '';
  dockApps.forEach(app=>{
    const btn = document.createElement('button');
    btn.dataset.app = app.id;
    const wrap = document.createElement('div');
    wrap.className = 'app-icon-wrap ' + app.bg;
    wrap.innerHTML = `<img src="../icons/${app.icon}" alt="">`;
    const lbl = document.createElement('span');
    lbl.className = 'app-label';
    lbl.textContent = app.label;
    btn.appendChild(wrap);
    btn.appendChild(lbl);
    dock.appendChild(btn);
  });
}

function renderLockNotifs(){
  const box = $('lockNotifs');
  if(!box) return;
  // If we have contacts, show them as notifs; else keep dummy
  if(state.contacts && state.contacts.length){
    box.innerHTML = '';
    state.contacts.slice(0,3).forEach(c=>{
      const el = document.createElement('div');
      el.className = 'notif card-glass';
      el.innerHTML = `<div class="notif-app">Messages</div>
        <div class="notif-body">
          <img class="notif-icon" src="../icons/sms.svg" alt="">
          <div class="notif-text">
            <div class="notif-title">${escapeHtml(c.name)}</div>
            <div class="notif-preview">${escapeHtml(c.number)}</div>
          </div>
        </div>`;
      box.appendChild(el);
    });
  }
}

function renderContacts(){
  const box = $('contactList');
  if(!box) return;
  box.innerHTML = '';
  if(!state.contacts || !state.contacts.length){
    box.innerHTML = '<div class="ios-card empty"><h3>Belum ada kontak</h3><p>Tekan tombol + untuk tambah kontak.</p></div>';
    return;
  }
  state.contacts.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'ios-card';
    el.innerHTML = `<h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.number)}</p>
      <div class="actions">
        <button class="green"><img class="btn-icon" src="../icons/call.svg">Call</button>
        <button><img class="btn-icon" src="../icons/sms.svg">SMS</button>
        <button class="red"><img class="btn-icon" src="../icons/delete.svg">Hapus</button>
      </div>`;
    const btns = el.querySelectorAll('button');
    btns[0].onclick = ()=>send('phone:contact:call',{slot:c.slot});
    btns[1].onclick = ()=>{
      const msg = prompt('Isi SMS/WA:', 'Halo');
      if(msg) send('phone:contact:sms',{slot:c.slot,message:msg});
    };
    btns[2].onclick = ()=>send('phone:contact:delete',{slot:c.slot});
    box.appendChild(el);
  });
}

function renderBusinesses(){
  const box = $('businessList');
  if(!box) return;
  box.innerHTML = '';
  if(!state.businesses || !state.businesses.length){
    box.innerHTML = '<div class="ios-card empty"><h3>Business kosong</h3><p>Belum ada business dimuat di server.</p></div>';
    return;
  }
  state.businesses.forEach(b=>{
    const el = document.createElement('div');
    el.className = 'ios-card';
    el.innerHTML = `<h3>${escapeHtml(b.name)}</h3><p>${escapeHtml(b.type)} • ${escapeHtml(b.owner)} • ${b.dist}m</p>
      <div class="actions">
        <button class="green"><img class="btn-icon" src="../icons/gps.svg">GPS</button>
      </div>`;
    el.querySelector('button').onclick = ()=>send('phone:gps',{biz:b.id});
    box.appendChild(el);
  });
}

function renderApps(){
  const apps = [
    ['whatsapp','WhatsApp / Kontak','contacts'],
    ['spotify','Spotify / Boombox','contacts'],
    ['twitter','Twitter / Sosmed','twitter'],
    ['uber','Uber / GPS','gps'],
    ['yellow','YellowPage / Business','business']
  ];
  const box = $('appList');
  if(!box) return;
  box.innerHTML = '';
  apps.forEach(([id,label,icon])=>{
    const installed = state.apps && Number(state.apps[id]) === 1;
    const el = document.createElement('div');
    el.className = 'ios-card';
    el.innerHTML = `<h3><img class="btn-icon" src="../icons/${icon}.svg"> ${label}</h3><p>${installed ? 'Terpasang' : 'Belum terpasang'}</p>
      <div class="actions"><button class="${installed?'green':''}"><img class="btn-icon" src="../icons/appstore.svg">${installed?'Installed':'Install'}</button></div>`;
    el.querySelector('button').onclick = ()=>send('phone:install',{app:id});
    box.appendChild(el);
  });
}

function renderTimeline(data){
  const box = $('tweetList');
  if(!box) return;
  box.innerHTML = '';
  const tweets = (data && data.tweets) || [];
  if(!tweets.length){
    box.innerHTML = '<div class="ios-card empty"><h3>Timeline kosong</h3><p>Post tweet pertama kamu.</p></div>';
    return;
  }
  tweets.forEach(tw=>{
    const el = document.createElement('div');
    el.className = 'tweet-card';
    const name = escapeHtml(tw.name || 'User');
    const handle = '@' + name.toLowerCase().replace(/\s/g,'');
    el.innerHTML = `
      <div class="tweet-header">
        <div class="tweet-avatar">${name.charAt(0).toUpperCase()}</div>
        <div class="tweet-meta">
          <div class="tweet-name">${name}</div>
          <div class="tweet-handle">${handle} • Just Now</div>
        </div>
      </div>
      <div class="tweet-text">${escapeHtml(tw.text)}</div>
      <div class="tweet-actions">
        <span>💬 0</span>
        <span>🔁 0</span>
        <span>❤️ 0</span>
      </div>`;
    box.appendChild(el);
  });
}

function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- Event delegation (PRESERVED) ---------- */
document.addEventListener('click', e=>{
  const app = e.target.closest('[data-app]')?.dataset.app;
  if(!app) return;
  if(app === 'home') show('home');
  else if(['contacts','business','gps','twitter','calc','appstore'].includes(app)){
    if(app === 'gps') $('businessTitle').textContent = 'GPS Business';
    if(app === 'business') $('businessTitle').textContent = 'Business';
    show(app === 'gps' ? 'business' : app);
  }
  send('phone:app',{app});
});

/* Unlock */
$('unlockBtn').onclick = ()=> show('home');

/* Contacts */
$('addContact').onclick = ()=>{
  const name = prompt('Nama kontak:', 'Teman');
  if(!name) return;
  const number = prompt('Nomor HP:', '0812345678');
  if(!number) return;
  send('phone:contact:add',{name,number});
};

/* Twitter */
$('tweetBtn').onclick = ()=>{
  const text = prompt('Tulis tweet:', 'Halo Holy Roleplay!');
  if(text) send('phone:tweet',{text});
};
$('navPost').onclick = ()=>{
  const text = prompt('Tulis tweet:', 'Halo Holy Roleplay!');
  if(text) send('phone:tweet',{text});
};

/* Calc */
$('calcBtn').onclick = ()=>send('phone:calc',{expr:$('calcInput').value});

/* ---------- CEF Incoming (PRESERVED) ---------- */
window.Cef = {
  _trigger(event, json){
    let data = {};
    try{ data = json ? JSON.parse(json) : {}; }catch(e){ data = {}; }
    if(event === 'phone:update'){ state = Object.assign(state, data); render(); if(data.page) show(data.page === 'gps' ? 'business' : data.page); }
    if(event === 'phone:toast') toast(data.message || 'OK', data.type);
    if(event === 'phone:bank') { state = Object.assign(state, data); render(); toast(`Cash ${money(data.cash)} • Bank ${money(data.bank)}`); }
    if(event === 'phone:timeline') renderTimeline(data);
    if(event === 'phone:calcResult') $('calcResult').textContent = (data.ok ? `${data.expr} = ${data.result}` : data.result);
    if(event === 'phone:close') document.body.style.display = 'none';
    if(event === 'cef:clear') toast('');
  }
};

/* Clock */
function updateClock(){
  const d = new Date();
  const h = String(d.getHours()).padStart(2,'0');
  const m = String(d.getMinutes()).padStart(2,'0');
  const timeStr = h + ':' + m;
  $('clock').textContent = timeStr;
  $('lockClock').textContent = timeStr;

  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  $('lockDate').textContent = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()];
}
setInterval(updateClock, 1000);
updateClock();

window.addEventListener('resize', setRects);
window.addEventListener('load', ()=>{
  setRects();
  render();
  try{ if(window.CefBridge && CefBridge.cefReady) CefBridge.cefReady(); }catch(e){}
  setTimeout(()=>send('phone:ready',{}), 120);
});
