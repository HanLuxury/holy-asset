/* Eagle UI runtime v2
 * Compatibility contract: Pawn still calls EagleUI_Create/Set/Show/Hide and
 * clickable elements return the original ui_click packet. The browser DOM is
 * a new FiveM-style renderer, not a TextDraw renderer.
 */
(function(){
  const root=document.createElement('div'); root.className='eagle-ui-canvas'; root.id='eagleUiCanvas';
  const nodes=new Map(); const state=new Map();
  const toastStack=document.createElement('div'); toastStack.className='eagle-ui-toast-stack'; document.body.appendChild(toastStack);
  const progress=document.createElement('div'); progress.className='eagle-ui-progress'; progress.style.display='none'; document.body.appendChild(progress);
  const gameText=document.createElement('div'); gameText.className='eagle-ui-game-text'; gameText.style.display='none'; document.body.appendChild(gameText);
  document.body.appendChild(root);

  function send(ev,data){try{return window.nativeSendEvent?window.nativeSendEvent(ev,typeof data==='string'?data:JSON.stringify(data)):0}catch(e){return 0}}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function num(v,d=0){const n=Number(v); return Number.isFinite(n)?n:d}
  function rgba(n){n=(Number(n)||0)>>>0; const a=((n>>>24)&255)/255; return `rgba(${(n>>>16)&255},${(n>>>8)&255},${n&255},${a||1})`}
  function pxX(x){return `${(num(x)/640)*100}vw`}
  function pxY(y){return `${(num(y)/480)*100}vh`}
  function dim(id){return state.get(String(id));}
  function activeCount(){let n=0; for(const s of state.values())if(s.visible)n++; return n}
  function notifyRoot(){try{parent.postMessage({kind:'eagle-ui-layout',feature:(document.body&&document.body.dataset.feature)||'common'},'*')}catch(e){}}

  function estimateWidth(s){
    if(s.model>=0) return Math.max(70,Math.abs(num(s.textX,.2))*480);
    const txt=String(s.text||''); return Math.max(34,Math.min(280,txt.length*6.5+22));
  }
  function estimateHeight(s){return Math.max(26,Math.min(100,Math.abs(num(s.letterY,1))*17+14))}
  function styleItem(el,s){
    el.style.left=pxX(s.x); el.style.top=pxY(s.y);
    el.style.width=estimateWidth(s)+'px'; el.style.minHeight=estimateHeight(s)+'px';
    el.style.color=rgba(s.color===-1?0xffffffff:s.color);
    const fs=Math.max(9,Math.min(18,Math.abs(num(s.letterY,1))*10)); el.style.fontSize=fs+'px';
    el.style.fontWeight=s.select?700:(num(s.font,1)>=3?650:500);
    el.style.textShadow=num(s.shadow)?'0 2px 4px rgba(0,0,0,.8)':'none';
    el.dataset.align=String(num(s.align,1));
    el.dataset.uiId=String(s.id);
    el.dataset.uiScope=s.scope||'p';
    el.classList.toggle('eagle-ui-button',!!s.select);
    el.classList.toggle('eagle-ui-box',!!s.box && !s.select);
    el.classList.toggle('eagle-ui-model',num(s.model,-1)>=0);
    el.style.display=s.visible===0?'none':'flex';
    el.style.opacity=s.visible===0?'0':'1';
    if(s.select) el.setAttribute('role','button'); else el.removeAttribute('role');
    if(num(s.model,-1)>=0){el.innerHTML=`<span>MODEL ${num(s.model,-1)}</span>`;}
    else el.textContent=String(s.text||'');
  }
  function make(id,s){
    let el=nodes.get(String(id));
    if(!el){
      el=document.createElement(s.select?'button':'div');
      el.className='eagle-ui-item';
      if(s.select){el.type='button';el.addEventListener('click',()=>send('ui_click',JSON.stringify({s:s.scope||'p',id:Number(s.id)})));}
      root.appendChild(el); nodes.set(String(id),el);
    }
    styleItem(el,s);
  }
  function remove(id){const e=nodes.get(String(id)); if(e)e.remove(); nodes.delete(String(id)); state.delete(String(id)); notifyRoot()}
  function applyProp(d){const s=state.get(String(d.id)); if(!s)return; if(d.key==='pos'){s.x=d.a;s.y=d.b}else if(d.key==='textsize'){s.textX=d.a;s.textY=d.b}else if(d.key==='letter'){s.letterX=d.a;s.letterY=d.b}else if(d.key==='align')s.align=d.value;else if(d.key==='color')s.color=d.value;else if(d.key==='box')s.box=d.value;else if(d.key==='boxColor')s.boxColor=d.value;else if(d.key==='shadow')s.shadow=d.value;else if(d.key==='outline')s.outline=d.value;else if(d.key==='bg')s.bg=d.value;else if(d.key==='font')s.font=d.value;else if(d.key==='prop')s.prop=d.value;else if(d.key==='select')s.select=d.value;else if(d.key==='model')s.model=d.value; state.set(String(d.id),s); make(d.id,s); notifyRoot()}
  function handleFeatureUI(d){
    const id=String(d.id);
    if(d.op==='create'){
      const s=Object.assign({visible:0,text:'',scope:'p',select:0,model:-1,box:0,align:1,color:-1,letterY:1,textX:.2},d); state.set(id,s); make(d.id,s); notifyRoot(); return;
    }
    if(d.op==='remove'){remove(d.id);return;}
    const s=state.get(id)||{id:d.id,scope:'p',visible:0};
    if(d.op==='show')s.visible=1;
    else if(d.op==='hide')s.visible=0;
    else if(d.op==='text')s.text=d.text;
    state.set(id,s); make(d.id,s); notifyRoot();
  }
  function toast(text,sub){const e=document.createElement('div');e.className='eagle-ui-toast';e.innerHTML=`<div>${esc(text)}</div>${sub?`<small>${esc(sub)}</small>`:''}`;toastStack.appendChild(e);setTimeout(()=>e.remove(),4200);notifyRoot()}
  function handle(ev,payload){
    let d=payload; try{if(typeof d==='string')d=JSON.parse(d||'{}')}catch(e){d={}}
    if(ev==='feature.ui'){handleFeatureUI(d);return}
    if(ev==='notify'||ev==='notify_icon'){toast(d.text||d.message||'',d.title||d.type||'');return}
    if(ev==='progress'){
      progress.style.display='block'; const pct=Math.max(0,Math.min(100,num(d.value,d.percent))); progress.innerHTML=`<div class="row"><b>${esc(d.label||d.text||'Progress')}</b><span>${Math.round(pct)}%</span></div><div class="eagle-ui-track"><i style="width:${pct}%"></i></div>`; notifyRoot(); return;
    }
    if(ev==='itembox'){toast(d.name||d.item||'Item',d.amount?`x${d.amount}`:'');return}
    if(ev==='game.text'){gameText.textContent=d.text||'';gameText.style.display='block';clearTimeout(gameText._t);gameText._t=setTimeout(()=>gameText.style.display='none',Math.max(800,num(d.time,2000)));return}
    if(ev==='input_mode'){document.body.classList.toggle('input-mode',!!d.enabled);return}
    if(ev==='cef_ready'){return}
  }
  window.Cef=window.Cef||{}; window.Cef._trigger=function(ev,payload){handle(ev,payload)};
  window.EagleServerDeliver=function(feature,op,data){handle('feature.ui',Object.assign({op:op},data||{}))};
  window.addEventListener('message',e=>{const d=e.data||{};if(d.kind==='eagle-server')handle(d.event,d.payload)});
  function runtimeFeature(){try{if(document.body&&document.body.dataset&&document.body.dataset.feature)return document.body.dataset.feature;const p=String(location.pathname||'').split('/').filter(Boolean);const i=p.indexOf('cef');return i>=0&&p[i+1]?decodeURIComponent(p[i+1]):'common'}catch(e){return 'common'}}
  function runtimeReady(){send('ui.runtime.ready',{feature:runtimeFeature()});}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',runtimeReady,{once:true}); else runtimeReady();
})();
