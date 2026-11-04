(function(){
  'use strict';
  // Production build: do not seed or merge any demo marketplace listings.
  const DEMO=[];
  function arr(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}}
  function numericPrice(v){const n=parseFloat(String(v==null?'':v).replace(/[^0-9.]/g,''));return Number.isFinite(n)?n:null}
  function mine(){
    return arr('amOfferMyListings').map(x=>({
      id:String(x.id),
      price:numericPrice(x.priceValue),
      title:x.title||'Untitled listing',
      city:x.city||'',state:x.state||'',zip:x.zip||'',
      condition:(x.condition||'not specified').toLowerCase(),
      category:(x.category||'listing').toLowerCase(),
      desc:x.description||'',
      pic:x.image||'social-share-1200x1200.png',
      time:x.posted||'Posted recently',
      images:(Array.isArray(x.images)&&x.images.length?x.images:[x.image]).filter(Boolean),
      status:x.status||'Active',
      mine:true
    })).filter(x=>String(x.status).toLowerCase()!=='deleted');
  }
  function all(){
    // Only browser-created local items, if any, are returned here. No bundled demo inventory.
    return mine();
  }
  function byId(id){id=String(id);return all().find(x=>x.id===id)||null}
  function priceText(x){return x&&x.price!=null?'$'+Number(x.price).toLocaleString()+' · Make Offer':'Make Offer'}
  function priceOnly(x){return x&&x.price!=null?'$'+Number(x.price).toLocaleString():'Open to offers'}
  function locationText(x){return [x&&x.city,x&&x.state].filter(Boolean).join(', ')+(x&&x.zip?' · '+x.zip:'')}
  function cleanSelection(key){
    const ids=arr(key).map(String), valid=new Set(all().map(x=>x.id));
    const clean=[...new Set(ids.filter(id=>valid.has(id)))];
    if(clean.length!==ids.length){try{localStorage.setItem(key,JSON.stringify(clean))}catch(e){}}
    return clean;
  }
  window.AmOfferListings={DEMO,arr,mine,all,byId,priceText,priceOnly,locationText,cleanSelection};
})();
