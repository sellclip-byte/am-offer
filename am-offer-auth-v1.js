(function(){
  const URL='https://rryehtaskbjnfbodymjj.supabase.co';
  const KEY='sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';

  function cleanReturnPath(path){
    path=String(path||'').trim();
    if(!path) return '';
    if(path.includes('://') || path.startsWith('//') || path.includes('..')) return '';
    return path.replace(/^\/+/,'');
  }

  async function requireActiveMember(returnPath){
    const client=window.AmOfferAuth.client();
    const {data:{session}}=await client.auth.getSession();
    const safe=cleanReturnPath(returnPath||location.pathname.split('/').pop()||'home.html');

    if(!session){
      location.replace('am-offer-net-sign-in-v1.html?return='+encodeURIComponent(safe));
      return null;
    }

    const {data:admin}=await client.from('admin_users').select('role').eq('user_id',session.user.id).maybeSingle();
    if(admin) return {client,session,user:session.user,isAdmin:true,profile:null};

    const {data:profile,error}=await client.from('profiles')
      .select('display_name,nickname,phone,state,city,zip_code,membership_status')
      .eq('id',session.user.id).maybeSingle();

    if(error || !profile){
      // The user has a valid authenticated session. Do not destroy it merely
      // because a profile lookup is temporarily unavailable.
      return {client,session,user:session.user,isAdmin:false,profile:null};
    }
    const membershipStatus=String(profile.membership_status||'').trim().toLowerCase();
    if(membershipStatus==='pending' || membershipStatus==='rejected' || membershipStatus==='inactive' || membershipStatus==='suspended'){
      const reason=membershipStatus;
      location.replace('am-offer-net-sign-in-v1.html?reason='+encodeURIComponent(reason)+'&return='+encodeURIComponent(safe));
      return null;
    }
    return {client,session,user:session.user,isAdmin:false,profile};
  }

  async function installAdminDashboardLink(){
    try{
      const client=window.AmOfferAuth.client();
      const {data:{session}}=await client.auth.getSession();
      if(!session) return;
      const {data:admin}=await client.from('admin_users').select('role').eq('user_id',session.user.id).maybeSingle();
      if(!admin || document.getElementById('amOfferAdminDashboardLink')) return;

      const link=document.createElement('a');
      link.id='amOfferAdminDashboardLink';
      link.href='am-offer-net-admin-membership-v1.html';
      link.textContent='Admin Dashboard';
      link.style.fontWeight='700';

      const preferred=document.querySelector('.topnav, .links, nav, header');
      if(preferred){
        preferred.appendChild(link);
      }else{
        const bar=document.createElement('div');
        bar.id='amOfferAdminDashboardBar';
        bar.style.cssText='position:fixed;top:10px;right:10px;z-index:9998;background:#fff;border:1px solid #111;padding:8px 10px;font:700 13px Arial,sans-serif';
        bar.appendChild(link);
        document.body.appendChild(bar);
      }
    }catch(_e){}
  }

  window.AmOfferAuth={
    url:URL,
    key:KEY,
    cleanReturnPath,
    client:function(){
      if(!window.supabase||!window.supabase.createClient) throw new Error('Authentication library did not load.');
      if(!this._client) this._client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      return this._client;
    },
    requireActiveMember,
    async signOutAndGo(target){
      try{await this.client().auth.signOut();}catch(_e){}
      location.href=target||'am-offer-net-sign-in-v1.html';
    }
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installAdminDashboardLink,{once:true});
  else setTimeout(installAdminDashboardLink,0);
})();