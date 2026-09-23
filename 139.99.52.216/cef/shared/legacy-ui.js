/* Compatibility filename retained for old pages/modules.
   The actual renderer is the new Eagle UI runtime. */
(function(){
  if(window.__eagleUiRuntimeLoaded)return;
  window.__eagleUiRuntimeLoaded=true;
  const s=document.createElement('script');
  s.src='../shared/eagle-ui-runtime.js';
  s.async=false;
  document.head.appendChild(s);
})();
