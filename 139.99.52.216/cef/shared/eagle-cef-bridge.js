/* EAGLE CEF bridge: direct page + root iframe compatible. */
(function(){
  function resolveFeature(){
    try {
      const body=document.body;
      if(body && body.dataset && body.dataset.feature) return body.dataset.feature;
      const parts=String(location.pathname||'').split('/').filter(Boolean);
      const cef=parts.indexOf('cef');
      if(cef>=0 && parts[cef+1]) return decodeURIComponent(parts[cef+1]);
    } catch(e){}
    return 'common';
  }

  const injectedNative=(typeof window.nativeSendEvent==='function')
    ? window.nativeSendEvent.bind(window) : null;

  function parentSend(event,data){
    try{
      const payload=typeof data==='string'?data:JSON.stringify(data==null?{}:data);
      if(window.parent && window.parent!==window && typeof window.parent.__eagleSend==='function')
        return window.parent.__eagleSend(event,payload);
      if(injectedNative) return injectedNative(event,payload);
      if(window.Android&&typeof window.Android.sendEvent==='function')
        return window.Android.sendEvent(event,payload);
      if(window.Cef&&typeof window.Cef.sendEvent==='function')
        return window.Cef.sendEvent(event,payload);
      if(window.CEF&&typeof window.CEF.sendEvent==='function')
        return window.CEF.sendEvent(event,payload);
    }catch(e){}
    return 0;
  }

  window.EagleCEF=window.EagleCEF||{};
  window.EagleCEF.emit=parentSend;
  window.EagleCEF.send=parentSend;
  window.EagleCEF.ready=function(){
    const feature=resolveFeature();
    return parentSend(feature+'.ready',{feature:feature});
  };
  window.EagleCEF.close=function(){return parentSend('cef.close',{feature:resolveFeature()});};
  window.EagleCEF.openFeature=function(feature){return parentSend('cef.open',{feature:String(feature||'common')});};
  window.EagleCEF.command=function(command,args){return parentSend('cef.command',{command:command,args:args||''});};
  window.nativeSendEvent=function(event,data){return parentSend(event,data);};

  let closeLock=0;
  function sendClose(){
    const now=Date.now();
    if(now-closeLock<300) return 0;
    closeLock=now;
    return window.EagleCEF.close();
  }

  document.addEventListener('click',function(e){
    const el=e.target.closest&&e.target.closest('[data-cef-close], .cef-close');
    if(!el) return;
    if(!el.hasAttribute('data-local-close')){
      e.preventDefault();
      e.stopImmediatePropagation();
      sendClose();
    }
  },true);

  document.addEventListener('click',function(e){
    const el=e.target.closest&&e.target.closest('[data-cef-feature]');
    if(!el) return;
    const feature=el.getAttribute('data-cef-feature');
    if(!feature) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    parentSend('cef.open',{feature:feature});
  },true);

  document.documentElement.classList.add('eagle-modern');
  function markReady(){setTimeout(function(){window.EagleCEF.ready();},80);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',markReady,{once:true});
  else markReady();
})();
