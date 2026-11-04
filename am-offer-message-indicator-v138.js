(function(){
  'use strict';
  const STYLE_ID='amOfferUnreadMessageStyleV142';
  const DOT_CLASS='am-offer-unread-dot-v142';
  let timer=null;

  function installStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      @keyframes amOfferMessagePulseV142 {
        0%,100% { background:#18c84a; box-shadow:0 0 0 1px #0a6c28,0 0 7px 3px rgba(24,200,74,.65); }
        50% { background:#fff; box-shadow:0 0 0 1px #18c84a,0 0 10px 5px rgba(255,255,255,.98); }
      }
      a[data-amoffer-alert-link="1"]{display:inline-flex !important;align-items:center;gap:6px;white-space:nowrap;}
      .${DOT_CLASS}{display:none;width:13px;height:13px;margin:0;border-radius:50%;vertical-align:middle;flex:0 0 13px;animation:amOfferMessagePulseV142 .85s ease-in-out infinite;}
      .${DOT_CLASS}.show{display:inline-block}
      @media (prefers-reduced-motion: reduce){.${DOT_CLASS}{animation-duration:1.8s}}
    `;
    document.head.appendChild(s);
  }

  function targetLinks(){
    return [...document.querySelectorAll('a')].filter(a=>{
      const href=String(a.getAttribute('href')||'').toLowerCase();
      const text=String(a.textContent||'').trim().toLowerCase();
      const isAccount=href.includes('am-offer-net-my-account-v1.html') && /^account\b/.test(text);
      const isMessages=href.includes('am-offer-net-messages-offer-flow-v3.html') && /^messages\b/.test(text);
      return isAccount || isMessages;
    });
  }

  function ensureDots(){
    installStyle();
    const dots=[];
    targetLinks().forEach(link=>{
      link.dataset.amofferAlertLink='1';
      let dot=[...link.children].find(el=>el.classList && el.classList.contains(DOT_CLASS));
      if(!dot){
        dot=document.createElement('span');
        dot.className=DOT_CLASS;
        dot.setAttribute('aria-label','New unread message');
        dot.setAttribute('title','New unread message');
        dot.setAttribute('role','status');
        link.appendChild(dot);
      }
      dots.push(dot);
    });
    return dots;
  }

  function showDots(show){ ensureDots().forEach(dot=>dot.classList.toggle('show',!!show)); }

  async function hasUnreadMessageForCurrentUser(){
    if(!window.AmOfferAuth) return false;
    const client=window.AmOfferAuth.client();
    const {data:{session}}=await client.auth.getSession();
    if(!session) return false;
    const uid=session.user.id;
    const offerIds=new Set();

    // Buyer conversations: lets a buyer see the alert when a seller replies.
    const {data:buyerOffers,error:buyerErr}=await client.from('offers').select('id').eq('buyer_id',uid);
    if(buyerErr) throw buyerErr;
    (buyerOffers||[]).forEach(o=>offerIds.add(o.id));

    // Seller conversations: lets a seller see the alert when a buyer sends/replies.
    const {data:listings,error:listErr}=await client.from('listings').select('id').eq('seller_id',uid);
    if(listErr) throw listErr;
    const listingIds=(listings||[]).map(x=>x.id);
    if(listingIds.length){
      const {data:sellerOffers,error:sellerErr}=await client.from('offers').select('id').in('listing_id',listingIds);
      if(sellerErr) throw sellerErr;
      (sellerOffers||[]).forEach(o=>offerIds.add(o.id));
    }

    const ids=[...offerIds];
    if(!ids.length) return false;
    const {data:msgs,error:msgErr}=await client.from('messages')
      .select('id,sender_id,read_at').in('offer_id',ids).neq('sender_id',uid).is('read_at',null).limit(1);
    if(msgErr) throw msgErr;
    return !!(msgs&&msgs.length);
  }

  async function refresh(){ try{showDots(await hasUnreadMessageForCurrentUser());}catch(_e){showDots(false);} }
  function start(){
    ensureDots(); refresh();
    if(timer) clearInterval(timer);
    timer=setInterval(refresh,5000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    window.addEventListener('focus',refresh);
    window.addEventListener('pageshow',refresh);
  }
  window.AmOfferRefreshUnreadIndicator=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
