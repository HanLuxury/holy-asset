const $ = (id)=>document.getElementById(id);
let state = {contacts:[], businesses:[], apps:{}};

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

function render(){
  $('playerName').textContent = state.player || 'Player';
  $('phoneNumber').textContent = state.number || 'No Number';
  $('cash').textContent = money(state.cash);
  $('bank').textContent = money(state.bank);

  renderContacts();
  renderBusinesses();
  renderApps();
  setRects();
}

function renderContacts(){
  const box = $('contactList');
  box.innerHTML = '';
  if(!state.contacts || !state.contacts.length){
    box.innerHTML = '<div class="card"><h3>Belum ada kontak</h3><p>Tekan tombol + untuk tambah kontak.</p></div>';
    return;
  }
  state.contacts.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'card';
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
  box.innerHTML = '';
  if(!state.businesses || !state.businesses.length){
    box.innerHTML = '<div class="card"><h3>Business kosong</h3><p>Belum ada business dimuat di server.</p></div>';
    return;
  }
  state.businesses.forEach(b=>{
    const el = document.createElement('div');
    el.className = 'card';
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
    ['spotify','Spotify / Boombox','spotify'],
    ['twitter','Twitter / Sosmed','twitter'],
    ['uber','Uber / GPS','gps'],
    ['yellow','YellowPage / Business','business']
  ];
  const box = $('appList');
  box.innerHTML = '';
  apps.forEach(([id,label,icon])=>{
    const installed = state.apps && Number(state.apps[id]) === 1;
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<h3><img class="title-icon" src="../icons/${icon}.svg">${label}</h3><p>${installed ? 'Terpasang' : 'Belum terpasang'}</p>
      <div class="actions"><button class="${installed?'green':''}"><img class="btn-icon" src="../icons/appstore.svg">${installed?'Installed':'Install'}</button></div>`;
    el.querySelector('button').onclick = ()=>send('phone:install',{app:id});
    box.appendChild(el);
  });
}

function renderTimeline(data){
  const box = $('tweetList');
  box.innerHTML = '';
  const tweets = data.tweets || [];
  if(!tweets.length){
    box.innerHTML = '<div class="card"><h3>Timeline kosong</h3><p>Post tweet pertama kamu.</p></div>';
    return;
  }
  tweets.forEach(tw=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<h3>@${escapeHtml(tw.name)}</h3><p>${escapeHtml(tw.text)}</p>`;
    box.appendChild(el);
  });
}

function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

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

$('addContact').onclick = ()=>{
  const name = prompt('Nama kontak:', 'Teman');
  if(!name) return;
  const number = prompt('Nomor HP:', '0812345678');
  if(!number) return;
  send('phone:contact:add',{name,number});
};

$('tweetBtn').onclick = ()=>{
  const text = prompt('Tulis tweet:', 'Halo Holy Roleplay!');
  if(text) send('phone:tweet',{text});
};

$('calcBtn').onclick = ()=>send('phone:calc',{expr:$('calcInput').value});

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

setInterval(()=>{
  const d = new Date();
  $('clock').textContent = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
},1000);

window.addEventListener('resize', setRects);
window.addEventListener('load', ()=>{
  setRects();
  try{ if(window.CefBridge && CefBridge.cefReady) CefBridge.cefReady(); }catch(e){}
  setTimeout(()=>send('phone:ready',{}), 120);
});
