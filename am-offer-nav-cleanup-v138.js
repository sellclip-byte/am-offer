(function(){
  'use strict';
  function cleanup(){
    const all=[...document.querySelectorAll('a,button')].filter(a=>/^sign\s*out$/i.test((a.textContent||'').trim()));
    if(!all.length)return;
    const preferred=document.querySelector('header .topnav, header .links, header nav, .topnav');
    let keep=preferred ? all.find(a=>preferred.contains(a)) : null;
    if(!keep && preferred){ keep=all[0]; preferred.appendChild(keep); }
    all.forEach(a=>{ if(a!==keep) a.remove(); });
    if(!preferred && all.length) all.forEach(a=>a.remove());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(cleanup,250));
  else setTimeout(cleanup,250);
  setTimeout(cleanup,900); setTimeout(cleanup,1800);
})();
