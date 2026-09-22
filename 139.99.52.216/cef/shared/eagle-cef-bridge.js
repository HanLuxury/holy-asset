/* EAGLE CEF bridge: browser -> parent/native + safe feature lifecycle. */
(function(){
  const feature=(document.body&&document.body.dataset.feature)||'common';
  function parentSend(event,data){try{return parent.__eagleSend?parent.__eagleSend(event,typeof data==='string'?data:JSON.stringify(data)):0}catch(e){return 0}}
  window.EagleCEF=window.EagleCEF||{};
  window.EagleCEF.emit=parentSend;
  window.EagleCEF.send=parentSend;
  window.nativeSendEvent=function(event,data){return parentSend(event,data)};
  window.EagleCEF.ready=function(){return parentSend(feature+'.ready',{feature:feature})};
  window.EagleCEF.close=function(){return parentSend('cef.close',{feature:feature})};
  window.EagleCEF.command=function(command,args){return parentSend('cef.command',{command:command,args:args||''})};
  document.documentElement.classList.add('eagle-modern');
  document.addEventListener('click',function(e){
    const b=e.target.closest&&e.target.closest('[data-cef-event]');
    if(!b)return;
    const ev=b.getAttribute('data-cef-event'); if(!ev)return;
    let payload={}; const raw=b.getAttribute('data-cef-data');
    if(raw){try{payload=JSON.parse(raw)}catch(_){payload={value:raw}}}
    parentSend(ev,payload);
  },true);
  window.addEventListener('load',function(){setTimeout(window.EagleCEF.ready,80)});
})();
