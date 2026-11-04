const SUPABASE='https://rryehtaskbjnfbodymjj.supabase.co';
const KEY='sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
const SITE='https://am-offer.net';
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
module.exports=async(req,res)=>{
  const id=String(req.query.id||'');
  if(!/^[0-9a-f-]{36}$/i.test(id)){res.status(302).setHeader('Location',SITE);return res.end()}
  try{
    const url=SUPABASE+'/rest/v1/listings?id=eq.'+encodeURIComponent(id)+'&select=id,title,description,asking_price,city,state,listing_media(storage_path,sort_order,media_type)';
    const r=await fetch(url,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}});
    const rows=await r.json(); const x=Array.isArray(rows)?rows[0]:null;
    if(!x)throw new Error('not found');
    const media=(x.listing_media||[]).filter(m=>m.media_type==='image').sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    const image=media[0]?.storage_path
      ? SUPABASE+'/storage/v1/object/public/listing-media/'+media[0].storage_path.split('/').map(encodeURIComponent).join('/')
      : SITE+'/social-share-1200x1200.png';
    const detail=SITE+'/am-offer-net-listing-detail-v12.html?listing='+encodeURIComponent(id);
    const price=x.asking_price==null?'Make Offer':'$'+Number(x.asking_price).toLocaleString('en-US');
    const loc=[x.city,x.state].filter(Boolean).join(', ');
    const desc=[price,loc,x.description].filter(Boolean).join(' · ').slice(0,240);
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=3600');
    res.status(200).end(`<!doctype html><html><head>
<meta charset="utf-8"><title>${esc(x.title)} | am-Offer</title>
<meta property="og:type" content="website"><meta property="og:site_name" content="am-Offer">
<meta property="og:title" content="${esc(x.title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}"><meta property="og:image:secure_url" content="${esc(image)}">
<meta property="og:url" content="${esc(SITE+'/api/listing-share?id='+id)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(x.title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0;url=${esc(detail)}"></head>
<body><p><a href="${esc(detail)}">View ${esc(x.title)} on am-Offer</a></p>
<script>location.replace(${JSON.stringify(detail)})<\/script></body></html>`);
  }catch(e){res.status(302).setHeader('Location',SITE);res.end()}
};