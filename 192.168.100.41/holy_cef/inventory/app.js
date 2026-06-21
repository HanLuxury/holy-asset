(function(){
  const grid=document.getElementById('grid');
  const weight=document.getElementById('weight');
  const money=document.getElementById('money');
  const level=document.getElementById('level');
  const toast=document.getElementById('toast');
  const modal=document.getElementById('modal');
  const modalTitle=document.getElementById('modalTitle');
  const targetWrap=document.getElementById('targetWrap');
  const targetInput=document.getElementById('targetInput');
  const amountInput=document.getElementById('amountInput');
  const infoBox=document.getElementById('infoBox');
  const infoContent=document.getElementById('infoContent');
  let modalMode='drop';
  let state={maxSlots:48,selected:-1,items:[]};

  function parse(data){ if(typeof data==='string'){try{return JSON.parse(data||'{}')}catch(e){return {}}} return data||{}; }
  window.Cef=window.Cef||{_handlers:{},on(e,fn){this._handlers[e]=fn},_trigger(e,json){if(this._handlers[e])this._handlers[e](parse(json));}};
  function bridge(name,payload){
    try{ if(window.CefBridge&&CefBridge.sendClientEvent) CefBridge.sendClientEvent(name, JSON.stringify(payload||{})); }catch(e){}
  }
  function updateAreas(){
    try{
      const rects=[...document.querySelectorAll('[data-cef-area],button,input,.slot')].filter(el=>!!(el.offsetWidth||el.offsetHeight)).map(el=>{const r=el.getBoundingClientRect();return [r.left,r.top,r.width,r.height];});
      if(window.CefBridge&&CefBridge.updateInteractiveAreas) CefBridge.updateInteractiveAreas(JSON.stringify(rects));
    }catch(e){}
  }
  function esc(v){ return String(v??'').replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }
  function render(payload){
    state=payload||state; const map={}; (state.items||[]).forEach(it=>map[it.slot]=it);
    const wspan=weight.querySelector('span'); if(wspan) wspan.textContent=state.weight||'0/30 KG'; else weight.textContent=state.weight||'0/30 KG'; money.textContent='$'+(state.money||0).toLocaleString('id-ID'); level.textContent='Level '+(state.level||1);
    grid.innerHTML='';
    for(let i=0;i<(state.maxSlots||48);i++){
      const it=map[i]; const div=document.createElement('div'); div.className='slot '+(!it?'empty ':'')+(state.selected===i?'selected':''); div.dataset.index=i+1; div.dataset.cefArea='1'; div.onclick=()=>bridge('inventory:click',{slot:i});
      if(it){ div.innerHTML=`<div class="model"><img src="../icons/item.svg" alt=""><span>OBJ ${esc(it.model)}</span></div><div class="count">x${esc(it.amount)}</div><div class="name">${esc(it.name)}</div>`; }
      grid.appendChild(div);
    }
    setTimeout(updateAreas,30);
  }
  function showToast(type,msg){ toast.className='toast '+(type||'info'); toast.textContent=msg||''; toast.classList.remove('hidden'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.add('hidden'),2600); setTimeout(updateAreas,20); }
  window.sendButton=function(button){ bridge('inventory:button',{button}); };
  window.openAmountModal=function(mode){ modalMode=mode; modalTitle.textContent=mode==='give'?'Beri Item':'Buang Item'; targetWrap.classList.toggle('hidden',mode!=='give'); amountInput.value='1'; modal.classList.remove('hidden'); setTimeout(updateAreas,20); };
  window.closeModal=function(){ modal.classList.add('hidden'); setTimeout(updateAreas,20); };
  window.submitModal=function(){ const amount=Math.max(1,parseInt(amountInput.value||'1',10)); const target=parseInt(targetInput.value||'-1',10); bridge('inventory:button',modalMode==='give'?{button:'give',target,amount}:{button:'drop',amount}); closeModal(); };
  window.hideInfo=function(){ infoBox.classList.add('hidden'); setTimeout(updateAreas,20); };
  Cef.on('inventory:update', render);
  Cef.on('inventory:toast', data=>showToast(data.type,data.message));
  Cef.on('inventory:info', data=>{ infoContent.innerHTML=`<b>${esc(data.name)}</b><br>Slot: ${Number(data.slot)+1}<br>Jumlah: ${esc(data.amount)}<br>Object: ${esc(data.model)}<br>Berat/item: ${esc(data.weight)} KG`; infoBox.classList.remove('hidden'); setTimeout(updateAreas,20); });
  Cef.on('inventory:close', ()=>{ document.body.innerHTML=''; try{CefBridge.updateInteractiveAreas('[]')}catch(e){} });
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{try{CefBridge.cefReady()}catch(e){} bridge('inventory:ready',{}); updateAreas();},80); });
  window.addEventListener('resize',()=>setTimeout(updateAreas,50));
})();
