/* Eagle CEF bridge: server events remain unchanged; panel bounds are reported to the root router. */
(function(){
  function sendParent(event,data){
    try { return parent.__eagleSend ? parent.__eagleSend(event,data) : 0; } catch(e){ return 0; }
  }
  window.nativeSendEvent=function(event,data){
    if(event==='cef.panel.bounds'){
      try{
        const bounds=typeof data==='string'?JSON.parse(data||'{}'):(data||{});
        parent.postMessage({kind:'eagle-panel-bounds',feature:(document.body&&document.body.dataset.feature)||'common',bounds:bounds},'*');
      }catch(e){}
      return 1;
    }
    return sendParent(event,data);
  };
  window.EagleLegacyForward=window.nativeSendEvent;
})();
