const emit=(event,data)=>{const raw=String(data??"");try{if(window.nativeSendEvent)return window.nativeSendEvent(event,raw);if(window.Android&&Android.sendEvent)return Android.sendEvent(event,raw);if(window.Cef?.sendEvent)return window.Cef.sendEvent(event,raw);if(window.CEF?.sendEvent)return window.CEF.sendEvent(event,raw);if(window.cef?.sendEvent)return window.cef.sendEvent(event,raw)}catch(e){console.log(e)}return false};
const $=s=>document.querySelector(s);
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',1800)}
function send(action,...v){emit('dynamic.action',[action,...v].join('|'))}
function parseState(data){
  const p=String(data||'').split('|');
  if(p.length<29)return;
  const [id,type,name,model,x,y,z,a,rx,ry,rz,tx,ty,tz,ta,int,vw,tint,tvw,price,owner,faction,locked,enabled,v1,v2,v3,typeName,admin]=p;
  $('#id').textContent=id;
  $('#type').textContent=typeName;
  if($('#name'))$('#name').value=name;
  if($('#model'))$('#model').value=model;
  if($('#price'))$('#price').value=price;
  if($('#v1'))$('#v1').value=v1;
  if($('#v2'))$('#v2').value=v2;
  if($('#v3'))$('#v3').value=v3;
  if($('#locked'))$('#locked').value=locked;
  if($('#enabled'))$('#enabled').value=enabled;
  if($('#rx'))$('#rx').value=rx; if($('#ry'))$('#ry').value=ry; if($('#rz'))$('#rz').value=rz;
  if($('#tx'))$('#tx').value=tx; if($('#ty'))$('#ty').value=ty; if($('#tz'))$('#tz').value=tz; if($('#ta'))$('#ta').value=ta;
  if($('#int'))$('#int').value=int; if($('#vw'))$('#vw').value=vw; if($('#tint'))$('#tint').value=tint; if($('#tvw'))$('#tvw').value=tvw;
  if($('#owner'))$('#owner').value=owner; if($('#faction'))$('#faction').value=faction;
  $('#coords').textContent=`${Number(x).toFixed(2)}, ${Number(y).toFixed(2)}, ${Number(z).toFixed(2)} | VW ${vw} | INT ${int}`;
  window.DYN_ADMIN = admin === '1';
  document.querySelectorAll('.adminOnly').forEach(e=>e.classList.toggle('hidden',!window.DYN_ADMIN));
}

window.Cef=window.Cef||{};const nativeTrigger=window.Cef._trigger;window.Cef._trigger=(event,payload)=>{if(event==='dynamic.state')parseState(payload);if(event==='dynamic.toast')toast(payload);if(event==='dynamic.close')location.reload();if(typeof nativeTrigger==='function'){try{return nativeTrigger(event,payload)}catch(e){}}};
window.addEventListener('load',()=>emit('dynamic.ready',''));
