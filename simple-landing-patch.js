(function simpleProfileLanding(){
  function orderProfiles(){
    var grid=document.getElementById('profileGrid');
    if(!grid)return;
    var wanted=['papa','rithyna','thynith','mama'];
    var cards=Array.from(grid.querySelectorAll('.profile-card'));
    cards.forEach(function(card){
      var name=(card.querySelector('strong')||{}).textContent||'';
      var key=name.trim().toLowerCase();
      if(key==='dad')key='papa';
      var index=wanted.indexOf(key);
      card.style.order=index>=0?String(index):'99';
      card.classList.toggle('landing-add-member',key==='add member');
    });
  }

  function addHeader(){
    var main=document.querySelector('.landing-main');
    if(!main||document.getElementById('simpleLandingHeader'))return;
    var header=document.createElement('div');
    header.id='simpleLandingHeader';
    header.className='simple-landing-header';
    header.innerHTML='<h1><span>Family</span>Taste</h1><p>Choose your profile</p>';
    main.insertBefore(header,main.firstChild);
  }

  function addStyles(){
    if(document.getElementById('simpleLandingStyles'))return;
    var style=document.createElement('style');
    style.id='simpleLandingStyles';
    style.textContent=`
      #landing.landing-view{
        display:block!important;
        min-height:100vh!important;
        padding:42px 18px 58px!important;
        background:radial-gradient(circle at top,#fffaf2 0,#fff6eb 36%,#f3dfca 100%)!important;
        overflow-y:auto!important;
      }
      #landing .landing-sidebar,
      #landing .landing-topbar,
      #landing .weekly-preview,
      #landing .landing-actions,
      #landing .section-title,
      #landing .week-strip{
        display:none!important;
      }
      #landing .landing-main{
        width:min(900px,100%)!important;
        margin:0 auto!important;
        padding:0!important;
      }
      #landing .simple-landing-header{
        text-align:center!important;
        margin:18px auto 30px!important;
      }
      #landing .simple-landing-header h1{
        margin:0!important;
        font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;
        font-size:clamp(44px,7vw,68px)!important;
        line-height:1!important;
        letter-spacing:-.06em!important;
        font-weight:950!important;
        color:#1d1712!important;
      }
      #landing .simple-landing-header h1::after{
        content:'❤';
        display:inline-block;
        margin-left:4px;
        transform:translateY(-22px);
        color:#f06b17;
        font-size:.22em;
      }
      #landing .simple-landing-header h1 span{font-size:1em!important;color:#1d1712!important}
      #landing .simple-landing-header h1{color:#f06b17!important}
      #landing .simple-landing-header p{
        margin:18px 0 0!important;
        color:#6f6258!important;
        font-size:clamp(18px,3vw,28px)!important;
        font-weight:600!important;
      }
      #landing .profile-dock{margin:0!important}
      #landing .profile-grid{
        display:flex!important;
        flex-direction:column!important;
        gap:18px!important;
        width:min(860px,100%)!important;
        margin:0 auto!important;
      }
      #landing .profile-card{
        order:99;
        width:100%!important;
        min-height:220px!important;
        display:grid!important;
        grid-template-columns:190px 1fr auto!important;
        align-items:center!important;
        gap:30px!important;
        padding:28px 54px!important;
        border-radius:28px!important;
        background:rgba(255,253,249,.88)!important;
        border:1px solid rgba(255,255,255,.82)!important;
        box-shadow:0 22px 56px rgba(87,58,28,.10)!important;
        text-align:left!important;
        color:#1f1914!important;
      }
      #landing .profile-card::after{display:none!important;content:none!important}
      #landing .profile-card:hover{transform:translateY(-3px)!important;background:#fffefa!important}
      #landing .profile-card .avatar{
        width:170px!important;
        height:170px!important;
        margin:0!important;
        border-radius:50%!important;
        font-size:64px!important;
        box-shadow:0 18px 38px rgba(87,58,28,.12)!important;
      }
      #landing .profile-card .avatar img{width:100%!important;height:100%!important;object-fit:cover!important}
      #landing .profile-card strong{
        font-size:clamp(36px,5.8vw,54px)!important;
        line-height:1!important;
        font-weight:950!important;
        letter-spacing:-.04em!important;
      }
      #landing .profile-card::before{
        content:'›';
        order:3;
        justify-self:end;
        color:#9a9188;
        font-size:74px;
        font-weight:300;
      }
      #landing .landing-add-member{display:none!important}
      @media(max-width:680px){
        #landing.landing-view{padding:28px 14px 46px!important}
        #landing .profile-grid{gap:14px!important}
        #landing .profile-card{
          min-height:150px!important;
          grid-template-columns:112px 1fr auto!important;
          gap:18px!important;
          padding:20px!important;
          border-radius:22px!important;
        }
        #landing .profile-card .avatar{width:108px!important;height:108px!important;font-size:42px!important}
        #landing .profile-card strong{font-size:32px!important}
        #landing .profile-card::before{font-size:48px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function install(){
    addHeader();
    addStyles();
    orderProfiles();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  setTimeout(install,300);
  setTimeout(install,1000);
  var observer=new MutationObserver(orderProfiles);
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();
