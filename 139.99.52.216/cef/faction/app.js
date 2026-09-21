// CEF event compatibility for Eagle native client.
(function(){
  function open(data){
    if(!data) return;
    if(window.openState) window.openState(data);
    else {
      const t=document.getElementById('title'), s=document.getElementById('subtitle');
      if(t) t.textContent=data.faction||'Eagle Faction';
      if(s) s.textContent=(data.name||'Player')+' • Rank '+(data.rank||0);
    }
  }
  window.cefEvents = window.cefEvents || {};
  window.cefEvents['faction.open'] = open;
  window.eagleReceive = function(event,data){
    if(window.cefEvents[event]) window.cefEvents[event](data||{});
  };
})();
