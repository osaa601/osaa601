(() => {
  const root=document.documentElement;
  if(!document.querySelector('#main .hero-copy'))return;
  let audioStorage;try{audioStorage=localStorage;}catch(_){}
  const audio=new window.OsaaAudio.DeskAudio({storage:audioStorage});let audioTheme;
  const quest=new window.OsaaStarfall.Engine({storage:audioStorage});
  const archive=new window.OsaaDesktopExtras.Archive(audioStorage);
  let rememberedLayout;
  try{const saved=JSON.parse(audioStorage?.getItem('osaa601-desktop-layout')||'null');if(saved?.version===1&&Array.isArray(saved.windows))rememberedLayout=saved;}catch(_){}
  let wallpaperMotion=true;try{wallpaperMotion=audioStorage?.getItem('osaa601-wallpaper-motion')!=='off';}catch(_){}
  const session=String(Date.now());
  window.addEventListener('pagehide',()=>{desktop?.persist();quest.save();audio.destroy();},{once:true});
  const locales=new Map();
  for(const template of document.querySelectorAll('template[data-desktop-language]')){
    if(template.dataset.desktopLanguage===root.lang&&!template.content.querySelector('#main'))template.content.append(document.querySelector('.os-preferences-source').cloneNode(true),document.querySelector('#main').cloneNode(true),document.querySelector('.os-rescue').cloneNode(true));
    locales.set(template.dataset.desktopLanguage,template);
  }
  let desktop;
  const changeLanguage=lang=>{
    const template=locales.get(lang);if(!template||root.lang===lang)return;
    const snapshot=desktop.snapshot(),source=template.content.cloneNode(true);
    desktop.dispose();
    document.querySelector('.os-preferences-source').replaceWith(source.querySelector('.os-preferences-source'));
    document.querySelector('#main').replaceWith(source.querySelector('#main'));
    if(source.querySelector('.os-rescue'))document.querySelector('.os-rescue').replaceWith(source.querySelector('.os-rescue'));
    root.lang=lang;root.dir=lang==='ar'?'rtl':'ltr';document.title=template.dataset.title;
    document.querySelector('.skip-link').textContent=template.dataset.skip;
    const canonical=new URL(template.dataset.route,location.href).href;
    for(const [selector,value] of [['meta[name="description"]',template.dataset.description],['meta[property="og:title"]',template.dataset.title],['meta[property="og:description"]',template.dataset.description],['meta[property="og:url"]',canonical],['meta[property="og:locale"]',lang==='ar'?'ar_LY':'en_US'],['meta[name="twitter:title"]',template.dataset.title],['meta[name="twitter:description"]',template.dataset.description]]){const meta=document.querySelector(selector);if(meta)meta.content=value;}
    const link=document.querySelector('link[rel="canonical"]');if(link)link.href=canonical;
    history.replaceState({osaa:session,screen:snapshot.screen},'',template.dataset.route+'#'+snapshot.screen);
    desktop=mount(snapshot);document.dispatchEvent(new CustomEvent('portfolio-language'));
    document.dispatchEvent(new CustomEvent('portfolio-icons'));
    document.querySelector('.os-language').focus();
  };
  const mount=snapshot=>{
  const main=document.querySelector('#main');
  const hero=main?.querySelector('.hero-copy');
  if(!hero)return;
  const ar=root.lang==='ar';
  const word=(en,arabic)=>ar?arabic:en;
  const State=window.OsaaDesktopState;
  const icon=name=>`<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
  const labels={profile:word('Start here','ابدأ هنا'),services:word('Work with me','اعمل معي'),work:word('Projects','المشاريع'),creative:word('Studio','الاستوديو'),contact:word('Contact','التواصل'),links:word('Links','الروابط'),music:word('Music','الموسيقى'),arcade:word('Starfall Vale','ستارفول ڤيل'),journal:word('Journal','اليوميات'),settings:word('Desktop settings','إعدادات سطح المكتب'),journeys:word('Adventures','المغامرات')};
  const disposers=[];
  const listen=(target,type,fn)=>{target.addEventListener(type,fn);disposers.push(()=>target.removeEventListener(type,fn));};
  const originalTheme=document.querySelector('.theme-button');
  const language=document.querySelector('.language-switch');
  const navigationMarkup=()=>`<nav class="os-navigation" aria-label="${word('Window navigation','التنقل في النافذة')}"><button type="button" class="os-nav-button" data-nav="back" aria-label="${word('Back in this window','رجوع في هذه النافذة')}">${icon('back')}</button><button type="button" class="os-nav-button" data-nav="forward" aria-label="${word('Forward in this window','تقدم في هذه النافذة')}">${icon('forward')}</button><button type="button" class="os-nav-button" data-nav="home" aria-label="${word('This window home','الرئيسية لهذه النافذة')}">${icon('home')}</button><div class="os-breadcrumb"></div></nav>`;
  const shell=document.createElement('div');shell.className='os-shell';
  shell.innerHTML=`<img class="os-wallpaper" alt="" width="1200" height="800"><div class="os-atmosphere" aria-hidden="true"><div class="os-clouds"><span></span><span></span><span></span></div><div class="os-valley-mist"></div><div class="os-sky-stars">${Array.from({length:14},()=>'<i></i>').join('')}</div><div class="os-fireflies">${Array.from({length:10},()=>'<i></i>').join('')}</div><span class="os-shooting-star"></span></div><div class="os-wallpaper-shade" aria-hidden="true"></div>
    <header class="os-topbar"><span class="os-brand">${icon('identity')}<span>OSAA601</span><span class="os-edition"></span></span>
      <div class="os-top-actions"><a class="os-hire" href="#services" aria-label="${word('Work with me','اعمل معي')}">${icon('contact')}<span>${word('Work with me','اعمل معي')}</span></a><button type="button" class="os-search-toggle" aria-expanded="false" aria-label="${word('Search desktop (Ctrl or Command K)','ابحث في سطح المكتب (Ctrl أو Command K)')}">${icon('search')}<span>${word('Search','بحث')}</span><kbd>⌘/Ctrl K</kbd></button><button type="button" class="os-settings-toggle" aria-label="${word('Desktop settings','إعدادات سطح المكتب')}">${icon('settings')}</button><a class="os-language"></a><button type="button" class="os-theme"></button></div></header>
    <main id="desktop-main" class="os-stage" tabindex="-1" aria-label="${word('Personal desktop','سطح المكتب الشخصي')}"><section class="os-mobile-intro"><span>OSAA601 / ${word('WELCOME TO MY DESKTOP','مرحباً بك في سطح مكتبي')}</span><h1>${word('Osama Waer','أسامة واعر')}</h1><p>${word('Remote cybersecurity & GRC, secure infrastructure, and video production.','الأمن السيبراني والحوكمة والبنية التحتية الآمنة وإنتاج الفيديو عن بُعد.')}</p><div class="os-home-actions"><a href="#services">${icon('contact')} ${word('Work with me','اعمل معي')}</a><a href="#work">${icon('work')} ${word('See my work','شاهد أعمالي')}</a></div><a class="os-home-guide-link" href="#profile">${word('Start here · meet me & learn the controls','ابدأ هنا · تعرف عليّ وعلى طريقة الاستخدام')} ${icon('forward')}</a></section><nav class="os-icons" aria-label="${word('Applications','التطبيقات')}"></nav><div class="os-window-layer"></div><div class="os-wallpaper-label" aria-hidden="true"><span>${word('Osama Waer','أسامة واعر')}</span><span>OSAA601 · ${word('Security. Stories. New worlds.','أمن. قصص. عوالم جديدة.')}</span></div></main>
    <nav class="os-start-menu" aria-label="${word('Applications','التطبيقات')}" hidden><div class="os-start-heading">${ar?'أسامة واعر':'Osama Waer'}<span>Osaa601</span></div></nav>
    <footer class="os-taskbar"><button class="os-start" type="button" aria-expanded="false">${icon('grid')}<span>${word('Apps','التطبيقات')}</span></button><div class="os-tasks" aria-label="${word('Open windows','النوافذ المفتوحة')}"></div><div class="os-tray" aria-label="${word('Audio controls','أدوات التحكم بالصوت')}"><button type="button" class="os-music-toggle"></button><button type="button" class="os-audio-toggle" aria-label="${word('Audio settings','إعدادات الصوت')}" aria-expanded="false" aria-controls="os-audio-settings">${icon('volume')}</button><time class="os-clock"></time></div></footer>
    <section id="os-audio-settings" class="os-audio-settings" aria-label="${word('Audio settings','إعدادات الصوت')}" hidden><div class="os-tray-heading"><span>${word('Audio','الصوت')}</span><button type="button" class="os-audio-close" aria-label="${word('Close audio settings','إغلاق إعدادات الصوت')}">${icon('close')}</button></div><button type="button" class="os-tray-player">${icon('music')}<span>${word('Open Music player','فتح مشغل الموسيقى')}</span></button><label class="os-player-label" for="tray-volume">${word('Music volume','مستوى صوت الموسيقى')}<span class="os-tray-volume-label"></span></label><div class="os-tray-volume-row"><button type="button" class="os-music-mute"></button><input id="tray-volume" class="os-tray-volume" type="range" min="0" max="1" step="0.01" value="0.45"></div><button type="button" class="os-sound-toggle"></button></section><span class="os-announcement" role="status" aria-live="polite"></span>`;
  document.body.append(shell);
  const stage=shell.querySelector('.os-stage'),layer=shell.querySelector('.os-window-layer'),tasks=shell.querySelector('.os-tasks');
  const start=shell.querySelector('.os-start'),startMenu=shell.querySelector('.os-start-menu');
  const announcer=shell.querySelector('.os-announcement');
  const pageMeta=new Map([...main.querySelectorAll('template[data-page-meta]')].map(t=>[t.dataset.pageMeta,{route:t.dataset.route,title:t.dataset.title,description:t.dataset.description}]));
  const entries=new Map(),screens=new Map();let z=5;let device='desktop';let active='home';let starting=true;
  const persist=()=>{if(starting)return;try{audioStorage?.setItem('osaa601-desktop-layout',JSON.stringify({version:1,active,windows:[...entries.values()].map(e=>({id:e.id,x:e.x,y:e.y,width:e.width,height:e.height,snap:e.snap,maximized:e.window.classList.contains('os-maximized'),hidden:e.window.hidden,closed:e.task.hidden,screen:e.trail.current,trail:e.trail.screens.slice(-100),trailIndex:Math.min(e.trail.index,99),scrolls:e.scrolls}))}));}catch(_){}};
  const profileIntro=document.createElement('div');profileIntro.className='os-profile-intro';profileIntro.append(hero);
  const sourceArt=main.querySelector('#hero-art');
  const profileArt=document.createElement('figure');profileArt.className='os-profile-art';
  profileArt.innerHTML=`<img alt="" width="1200" height="800"><div class="os-profile-art-shade" aria-hidden="true"></div><span class="os-profile-seal" aria-hidden="true">✦</span><figcaption><span class="os-profile-art-label">${word('THE OSAA601 ARCHIVE','أرشيف OSAA601')}</span><strong>${word('Clear decisions. Stronger systems.','قرارات واضحة. أنظمة أقوى.')}</strong><span>${word('Security · Infrastructure · Visual stories','أمن · بنية تحتية · قصص مرئية')}</span></figcaption>`;
  profileArt.querySelector('img').src=sourceArt.src;profileIntro.append(profileArt);
  const sources={profile:[profileIntro,main.querySelector('#about'),main.querySelector('#profile-brief')]};
  for(const id of ['services','work','creative','contact','links','journal','journeys'])sources[id]=[main.querySelector('#'+id)];
  const settings=document.createElement('section');settings.className='os-settings-panel';sources.settings=[settings];
  const music=document.createElement('section');music.className='os-music-panel';
  music.innerHTML=`<span class="eyebrow">${word('LO-FI RADIO','راديو لوفاي')}</span><div class="os-music-cover" aria-hidden="true">${icon('music')}<div class="os-equalizer"><span></span><span></span><span></span><span></span><span></span></div></div><h2 class="os-music-title"></h2><p class="os-music-mood"></p>
    <label class="os-player-label" for="music-seek">${word('Playback position','موضع التشغيل')}</label><input id="music-seek" class="os-music-seek" type="range" min="0" max="30" step="0.1" value="0"><div class="os-music-time" dir="ltr"><span class="os-music-elapsed">0:00</span><span class="os-music-duration"></span></div>
    <div class="os-music-controls"><button type="button" data-music="previous" aria-label="${word('Previous track','المقطع السابق')}">${icon('previous')}</button><button type="button" class="os-music-play" data-music="play"></button><button type="button" data-music="next" aria-label="${word('Next track','المقطع التالي')}">${icon('next')}</button><button type="button" data-music="mute"></button></div>
    <label class="os-player-label" for="music-volume">${word('Music volume','مستوى صوت الموسيقى')} <span class="os-music-volume-label"></span></label><input id="music-volume" class="os-music-volume" type="range" min="0" max="1" step="0.01" value="0.45">
    <div class="os-music-playlist" aria-label="${word('Playlist','قائمة التشغيل')}"></div><button class="os-music-sounds" type="button" data-music="sounds"></button><p class="os-music-note">${word('Built-in ambient loops. Pick a track and press Play.','مقاطع هادئة مدمجة. اختر مقطعاً واضغط تشغيل.')}</p><p class="os-music-status" role="status" aria-live="polite"></p>`;
  sources.music=[music];
  const arcade=document.createElement('section');arcade.className='starfall-game';sources.arcade=[arcade];
  const closeStart=()=>{startMenu.hidden=true;start.setAttribute('aria-expanded','false');};
  const place=entry=>{
    if(entry.window.classList.contains('os-maximized'))return;
    const b=entry.snap?State.snap(device,stage.clientWidth,stage.clientHeight,entry.snap):State.bounds(device,stage.clientWidth,stage.clientHeight,entry);
    Object.assign(entry,{x:b.x,y:b.y});
    entry.window.style.left=b.x+'px';entry.window.style.top=b.y+'px';entry.window.style.width=b.width+'px';entry.window.style.height=b.height+'px';
  };
  const select=entry=>{
    active=entry.id;entry.window.style.zIndex=String(++z);root.classList.remove('os-home-view');
    stage.scrollTop=0;
    for(const item of entries.values()){
      const selected=item===entry&&!item.window.hidden;item.window.classList.toggle('os-active',selected);item.task.setAttribute('aria-pressed',String(selected));
    }
    shell.querySelectorAll('[data-app]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.app===entry.id)));
    persist();
  };
  const showHome=()=>{
    active='home';root.classList.add('os-home-view');
    for(const entry of entries.values()){entry.window.hidden=true;entry.task.setAttribute('aria-pressed','false');entry.window.classList.remove('os-active');}
    shell.querySelectorAll('[data-app]').forEach(button=>button.setAttribute('aria-pressed','false'));
  };
  const refreshNavigation=()=>{
    for(const entry of entries.values()){
      const navigation=entry.navigation;
      navigation.querySelector('[data-nav="back"]').disabled=!entry.trail.canBack;
      navigation.querySelector('[data-nav="forward"]').disabled=!entry.trail.canForward;
      const breadcrumb=navigation.querySelector('.os-breadcrumb');breadcrumb.replaceChildren();
      const page=screens.get(entry.trail.current);const parts=[[entry.id,entry.label]];
      if(page.id!==entry.id)parts.push([page.id,page.label]);
      for(const [index,[id,label]] of parts.entries()){
        if(index){const divider=document.createElement('span');divider.className='os-crumb-divider';divider.textContent='/';divider.setAttribute('aria-hidden','true');breadcrumb.append(divider);}
        const button=document.createElement('button');button.type='button';button.textContent=label;button.className='os-crumb';button.dataset.screen=id;
        if(id===page.id)button.setAttribute('aria-current','page');button.addEventListener('click',()=>navigate(id));breadcrumb.append(button);
      }
    }
  };
  const updateAddress=(screen,record)=>{
    const meta=pageMeta.get(screen)||pageMeta.get('profile'),entry=screens.get(screen)?.entry;
    const route=meta?.route||locales.get(root.lang)?.dataset.route||'/';
    const url=route+'#'+screen,state={osaa:session,screen,owner:entry?.id,trailIndex:entry?.trail.index};
    if(record&&location.hash!=='#'+screen)history.pushState(state,'',url);else history.replaceState(state,'',url);
    if(meta){document.title=meta.title;const canonical=new URL(route,location.href).href;
      for(const [selector,value]of [['meta[name="description"]',meta.description],['meta[property="og:title"]',meta.title],['meta[property="og:description"]',meta.description],['meta[property="og:url"]',canonical],['meta[name="twitter:title"]',meta.title],['meta[name="twitter:description"]',meta.description]]){const node=document.querySelector(selector);if(node)node.content=value;}
      const link=document.querySelector('link[rel="canonical"]');if(link)link.href=canonical;
      for(const alt of document.querySelectorAll('link[rel="alternate"]')){const alternate=alt.getAttribute('hreflang'),enRoute=route.replace(/^\/ar\//,'/');alt.href=new URL(alternate==='ar'?'/ar'+enRoute:enRoute,location.href).href;}
      const opposite=root.lang==='ar'?'en':'ar',switcher=shell.querySelector('.os-language');switcher.href=(opposite==='ar'?'/ar':'')+route.replace(/^\/ar\//,'/');}
  };
  const renderPage=entry=>{
    const page=screens.get(entry.trail.current);
    for(const view of entry.pages.values())view.view.hidden=view!==page;
    entry.title.querySelector('span').textContent=page.id===entry.id?entry.label:entry.label+' — '+page.label;
    entry.task.setAttribute('aria-label',entry.title.querySelector('span').textContent);
    entry.content.scrollTop=entry.scrolls[page.id]||0;
  };
  const navigate=(id,{record=true,keyboard=false}={})=>{
    if(id!=='home'&&!screens.has(id))id='profile';
    if(id==='home')showHome();else{
      const entry=screens.get(id).entry;entry.scrolls[entry.trail.current]=entry.content.scrollTop;
      if(record)entry.trail.visit(id);else if(entry.trail.current!==id)entry.trail.visit(id);
      renderPage(entry);entry.window.hidden=false;entry.task.hidden=false;place(entry);select(entry);if(keyboard)entry.title.focus();
    }
    updateAddress(id,record);closeStart();refreshNavigation();announcer.textContent=id==='home'?word('Desktop home','الشاشة الرئيسية'):screens.get(id).label;persist();
  };
  const moveWithin=(entry,step)=>{
    if(step<0&&!entry.trail.canBack||step>0&&!entry.trail.canForward)return;
    entry.scrolls[entry.trail.current]=entry.content.scrollTop;entry.trail.move(step);renderPage(entry);select(entry);refreshNavigation();updateAddress(entry.trail.current,true);announcer.textContent=screens.get(entry.trail.current).label;persist();
  };
  const hideWindow=(entry,closed)=>{
    entry.window.hidden=true;entry.task.setAttribute('aria-pressed','false');if(closed)entry.task.hidden=true;
    const next=[...entries.values()].filter(item=>!item.window.hidden).sort((a,b)=>Number(b.window.style.zIndex)-Number(a.window.style.zIndex))[0];
    if(next){select(next);next.title.focus();updateAddress(next.trail.current,false);}else{active='home';root.classList.add('os-home-view');entry.window.classList.remove('os-active');updateAddress('home',false);shell.querySelector('[data-app="profile"]').focus();}refreshNavigation();persist();
  };
  const registerPage=(entry,id,label,nodes)=>{
    const view=document.createElement('div');view.className='os-view';view.dataset.page=id;view.hidden=id!==entry.id;
    for(const node of nodes)view.append(node);const page={id,label,view,entry,...pageMeta.get(id)};entry.pages.set(id,page);screens.set(id,page);entry.content.append(view);
  };
  const maximize=(entry,value)=>{
    entry.window.classList.toggle('os-maximized',value);
    const button=entry.window.querySelector('[data-action="maximize"]');button.setAttribute('aria-pressed',String(value));button.innerHTML=icon(value?'restore':'maximize');button.setAttribute('aria-label',word(value?'Restore':'Maximize',value?'استعادة':'تكبير'));place(entry);persist();
  };
  const unsnap=entry=>{if(entry.snap){entry.width=parseFloat(entry.window.style.width);entry.height=parseFloat(entry.window.style.height);entry.snap=null;}};
  const layoutWindow=(entry,action)=>{
    maximize(entry,false);
    if(['left','right','upper','lower'].includes(action))entry.snap=action;
    else{
      unsnap(entry);
      if(action==='center'){entry.width=null;entry.height=null;const size=State.bounds(device,stage.clientWidth,stage.clientHeight);entry.x=(stage.clientWidth-size.width)/2;entry.y=(stage.clientHeight-(device==='tablet'?90:0)-size.height)/2;}
      if(action==='smaller'||action==='larger'){const factor=action==='larger'?1.15:.85;entry.width=parseFloat(entry.window.style.width)*factor;entry.height=parseFloat(entry.window.style.height)*factor;}
      const move={'move-left':[-32,0],'move-right':[32,0],'move-up':[0,-32],'move-down':[0,32]}[action];if(move){entry.x+=move[0];entry.y+=move[1];}
    }
    place(entry);persist();
  };
  const restoreGeometry=(entry,saved)=>{
    for(const key of ['x','y','width','height'])if(Number.isFinite(saved[key]))entry[key]=saved[key];else if(key==='width'||key==='height')entry[key]=null;
    entry.snap=['left','right','upper','lower'].includes(saved.snap)?saved.snap:null;maximize(entry,saved.maximized===true);place(entry);
  };
  const restoreSession=()=>{
    if(!rememberedLayout)return;starting=true;
    for(const saved of rememberedLayout.windows){const entry=entries.get(saved.id);if(!entry)continue;restoreGeometry(entry,saved);if(Array.isArray(saved.trail)&&saved.trail.length<=100&&saved.trail.every(p=>entry.pages.has(p))){entry.trail.screens=saved.trail.length?saved.trail:[entry.id];entry.trail.index=Math.max(0,Math.min(Number.isInteger(saved.trailIndex)?saved.trailIndex:0,entry.trail.screens.length-1));}else if(entry.pages.has(saved.screen))entry.trail.visit(saved.screen);entry.scrolls=saved.scrolls&&typeof saved.scrolls==='object'?saved.scrolls:{};renderPage(entry);entry.window.hidden=saved.hidden!==false||saved.closed===true;entry.task.hidden=saved.closed!==false;}
    const target=entries.get(rememberedLayout.active),visible=[...entries.values()].filter(e=>!e.window.hidden),entry=target&&!target.window.hidden?target:visible[0];
    if(entry){select(entry);updateAddress(entry.trail.current,false);}else{showHome();updateAddress('home',false);}refreshNavigation();starting=false;persist();announcer.textContent=word('Previous desktop session restored','استُعيدت جلسة سطح المكتب السابقة');
  };
  const resetDesktop=()=>{
    starting=true;for(const [index,entry]of [...entries.values()].entries()){entry.snap=null;entry.width=null;entry.height=null;entry.x=Math.max(8,(stage.clientWidth-State.bounds(device,stage.clientWidth,stage.clientHeight).width)/2)+index*22;entry.y=24+index*16;entry.trail=new State.Trail(entry.id);entry.scrolls={};maximize(entry,false);entry.window.hidden=true;entry.task.hidden=true;renderPage(entry);}
    rememberedLayout=null;settings.querySelector('[data-desktop-action="restore"]').disabled=true;navigate('profile',{record:false});starting=false;persist();
  };
  const arrangeWindows=()=>{
    const visible=[...entries.values()].filter(e=>!e.window.hidden),old=entries.get(active);
    for(const [index,entry]of visible.entries()){
      maximize(entry,false);entry.snap=null;
      if(device==='mobile'){entry.width=null;entry.height=null;entry.x=8;entry.y=8;}
      else if(visible.length<=4&&stage.clientHeight>=520){const cols=Math.min(2,visible.length),rows=Math.ceil(visible.length/cols),margin=device==='desktop'?12:8,gap=8;entry.width=(stage.clientWidth-margin*2-gap*(cols-1))/cols;entry.height=(stage.clientHeight-(device==='tablet'?90:0)-margin*2-gap*(rows-1))/rows;entry.x=margin+index%cols*(entry.width+gap);entry.y=margin+Math.floor(index/cols)*(entry.height+gap);}
      else{entry.width=null;entry.height=null;entry.x=150+index*26;entry.y=12+index*22;}place(entry);
    }
    if(old&&!old.window.hidden)select(old);persist();announcer.textContent=word('Open windows arranged','رُتبت النوافذ المفتوحة');
  };
  const createWindow=(id,label,iconName,nodes)=>{
    const win=document.createElement('section');win.className='os-window';win.hidden=true;win.id='os-window-'+id.replace('/','-');
    const titleId='os-title-'+id.replace('/','-');win.setAttribute('aria-labelledby',titleId);
    win.innerHTML=`<div class="os-titlebar"><button type="button" class="os-drag-title" id="${titleId}">${icon(iconName)}<span></span></button><div class="os-window-controls"><button type="button" data-action="layout" aria-expanded="false" aria-label="${word('Window layout and size','ترتيب النافذة وحجمها')}">${icon('layout')}</button><button type="button" data-action="minimize" aria-label="${word('Minimize','تصغير')}">${icon('minimize')}</button><button type="button" data-action="maximize" aria-label="${word('Maximize','تكبير')}" aria-pressed="false">${icon('maximize')}</button><button type="button" data-action="close" aria-label="${word('Close','إغلاق')}">${icon('close')}</button></div></div>${navigationMarkup()}<div class="os-content"></div><div class="os-window-menu" hidden></div>`;
    const menu=win.querySelector('.os-window-menu');
    for(const [action,en,arabic]of [['left','Left half','النصف الأيسر'],['right','Right half','النصف الأيمن'],['upper','Top half','النصف العلوي'],['lower','Bottom half','النصف السفلي'],['center','Center & default size','توسيط والحجم الافتراضي'],['smaller','Smaller','أصغر'],['larger','Larger','أكبر'],['move-left','Move left','تحريك لليسار'],['move-right','Move right','تحريك لليمين'],['move-up','Move up','تحريك للأعلى'],['move-down','Move down','تحريك للأسفل']]){const button=document.createElement('button');button.type='button';button.dataset.windowLayout=action;button.textContent=word(en,arabic);menu.append(button);}
    menu.addEventListener('click',event=>{const button=event.target.closest('[data-window-layout]');if(!button)return;layoutWindow(entry,button.dataset.windowLayout);menu.hidden=true;win.querySelector('[data-action="layout"]').setAttribute('aria-expanded','false');});
    win.querySelector('.os-drag-title span').textContent=label;
    const task=document.createElement('button');task.type='button';task.className='os-task';task.hidden=true;task.innerHTML=icon(iconName)+'<span></span>';task.querySelector('span').textContent=label;
    task.setAttribute('aria-label',label);task.setAttribute('aria-controls',win.id);task.setAttribute('aria-pressed','false');
    const index=entries.size;const sizing=State.bounds(State.deviceForWidth(stage.clientWidth),stage.clientWidth,stage.clientHeight);const entry={id,label,window:win,task,navigation:win.querySelector('.os-navigation'),title:win.querySelector('.os-drag-title'),content:win.querySelector('.os-content'),pages:new Map(),trail:new State.Trail(id),scrolls:{},width:null,height:null,snap:null,x:Math.max(State.deviceForWidth(stage.clientWidth)==='desktop'?220:8,(stage.clientWidth-sizing.width)/2)+index*22,y:24+index*16};
    entries.set(id,entry);registerPage(entry,id,label,nodes);layer.append(win);tasks.append(task);
    entry.navigation.querySelector('[data-nav="back"]').addEventListener('click',()=>moveWithin(entry,-1));
    entry.navigation.querySelector('[data-nav="forward"]').addEventListener('click',()=>moveWithin(entry,1));
    entry.navigation.querySelector('[data-nav="home"]').addEventListener('click',()=>navigate(id));
    task.addEventListener('click',()=>{if(active===id&&!win.hidden)hideWindow(entry,false);else navigate(entry.trail.current,{keyboard:true});});
    win.addEventListener('pointerdown',()=>{if(active!==id)select(entry);},{capture:true});
    win.addEventListener('focusin',()=>{if(active!==id&&!win.hidden){select(entry);updateAddress(entry.trail.current,false);}});
    win.querySelector('.os-window-controls').addEventListener('click',event=>{
      const button=event.target.closest('[data-action]');if(!button)return;
      if(button.dataset.action==='maximize')maximize(entry,!win.classList.contains('os-maximized'));
      else if(button.dataset.action==='layout'){menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));}
      else hideWindow(entry,button.dataset.action==='close');
    });
    entry.title.addEventListener('dblclick',()=>win.querySelector('[data-action="maximize"]').click());
    let drag;
    entry.title.addEventListener('pointerdown',event=>{
      if(event.button!==0||win.classList.contains('os-maximized'))return;
      event.preventDefault();
      unsnap(entry);
      drag={pointer:event.pointerId,x:event.clientX,y:event.clientY,left:entry.x,top:entry.y};entry.title.setPointerCapture(event.pointerId);
    });
    entry.title.addEventListener('pointermove',event=>{if(!drag||drag.pointer!==event.pointerId)return;entry.x=drag.left+event.clientX-drag.x;entry.y=drag.top+event.clientY-drag.y;place(entry);});
    entry.title.addEventListener('pointerup',event=>{if(!drag)return;drag=null;if(device!=='mobile'&&Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)){const rect=stage.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;if(y<=18)maximize(entry,true);else if(x<=20)layoutWindow(entry,'left');else if(x>=rect.width-20)layoutWindow(entry,'right');else if(y>=rect.height-18)layoutWindow(entry,'lower');}persist();});
    for(const type of ['pointercancel','lostpointercapture'])entry.title.addEventListener(type,()=>{drag=null;persist();});
    entry.title.addEventListener('keydown',event=>{
      const move={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];if(move&&!event.altKey&&!win.classList.contains('os-maximized')){event.preventDefault();unsnap(entry);entry.x+=move[0];entry.y+=move[1];place(entry);persist();}
    });
    for(const corner of ['nw','ne','sw','se']){
      const handle=document.createElement('button');handle.type='button';handle.className='os-resize-handle';handle.dataset.resize=corner;handle.setAttribute('aria-label',word('Resize window from '+({nw:'top left',ne:'top right',sw:'bottom left',se:'bottom right'}[corner])+' (arrow keys)','غيّر حجم النافذة من '+({nw:'أعلى اليسار',ne:'أعلى اليمين',sw:'أسفل اليسار',se:'أسفل اليمين'}[corner])+' (مفاتيح الأسهم)'));win.append(handle);let resizeDrag;
      const size=(dx,dy,base)=>{const west=corner.includes('w'),north=corner.includes('n'),candidate=State.bounds(device,stage.clientWidth,stage.clientHeight,{x:base.left,y:base.top,width:base.width+(west?-dx:dx),height:base.height+(north?-dy:dy)});entry.width=candidate.width;entry.height=candidate.height;entry.x=base.left+(west?base.width-candidate.width:0);entry.y=base.top+(north?base.height-candidate.height:0);place(entry);};
      const base=()=>({left:entry.x,top:entry.y,width:parseFloat(win.style.width),height:parseFloat(win.style.height)});
      handle.addEventListener('pointerdown',event=>{if(event.button!==0||win.classList.contains('os-maximized'))return;event.preventDefault();unsnap(entry);resizeDrag={...base(),pointer:event.pointerId,x:event.clientX,y:event.clientY};handle.setPointerCapture(event.pointerId);});
      handle.addEventListener('pointermove',event=>{if(resizeDrag&&resizeDrag.pointer===event.pointerId)size(event.clientX-resizeDrag.x,event.clientY-resizeDrag.y,resizeDrag);});
      for(const type of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(type,()=>{resizeDrag=null;persist();});
      handle.addEventListener('keydown',event=>{const movement={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(!movement||win.classList.contains('os-maximized'))return;event.preventDefault();unsnap(entry);const step=event.shiftKey?64:16;size(movement[0]*step,movement[1]*step,base());persist();});
    }
    return entry;
  };
  for(const [id,label] of Object.entries(labels)){
    createWindow(id,label,id,sources[id]);
    for(const [container,className] of [[shell.querySelector('.os-icons'),'os-icon'],[startMenu,'os-start-item']]){
      const button=document.createElement('button');button.type='button';button.className=className;button.dataset.app=id;button.setAttribute('aria-pressed','false');button.innerHTML=`<span class="os-app-symbol">${icon(id)}</span><span>${label}</span>`;
      button.addEventListener('click',event=>navigate(entries.get(id).trail.current,{keyboard:event.detail===0}));container.append(button);
    }
  }
  for(const template of main.querySelectorAll('template[data-case]')){
    const id='project/'+template.dataset.case;const contents=document.createElement('div');contents.className='os-case-detail';contents.append(template.content.cloneNode(true));
    registerPage(entries.get('work'),id,template.dataset.title,[contents]);
  }
  for(const template of main.querySelectorAll('template[data-service]')){const contents=document.createElement('div');contents.append(template.content.cloneNode(true));registerPage(entries.get('services'),'service/'+template.dataset.service,template.dataset.title,[contents]);}
  for(const template of main.querySelectorAll('template[data-note-page]')){const contents=document.createElement('div');contents.append(template.content.cloneNode(true));registerPage(entries.get('journal'),'note/'+template.dataset.notePage,template.dataset.title,[contents]);}
  disposers.push(window.OsaaPremium.mount(shell,{ar,storage:audioStorage}));
  disposers.push(window.OsaaDesktopExtras.mount(shell,{archive,screens,entries,navigate,settings,ar,icon,arrange:arrangeWindows,restore:restoreSession,reset:resetDesktop,hasSession:!!rememberedLayout}));
  const motionPanel=document.createElement('section');motionPanel.className='os-motion-settings';
  motionPanel.innerHTML=`<h3>${word('Living wallpaper','الخلفية المتحركة')}</h3><p>${word('Clouds drift by day; stars and fireflies glow at night. Pause the motion whenever you prefer a still desktop.','غيوم تتحرك نهاراً ونجوم ويراعات تتوهج ليلاً. أوقف الحركة عندما تفضل سطح مكتب ثابتاً.')}</p><button type="button" class="os-motion-toggle">${icon('activity')}<span></span></button>`;settings.append(motionPanel);
  const motionButton=motionPanel.querySelector('.os-motion-toggle'),motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  let wallpaperFocused=true;
  const syncWallpaperMotion=()=>{const reduced=motionQuery.matches;shell.classList.toggle('os-wallpaper-paused',!wallpaperMotion||reduced||document.hidden||!wallpaperFocused);motionButton.disabled=reduced;motionButton.setAttribute('aria-label',word('Background animation','حركة الخلفية'));motionButton.setAttribute('aria-pressed',String(wallpaperMotion&&!reduced));motionButton.querySelector('span').textContent=reduced?word('Motion reduced by device preference','الحركة متوقفة وفق إعدادات الجهاز'):word(wallpaperMotion?'Pause background animation':'Enable background animation',wallpaperMotion?'أوقف حركة الخلفية':'فعّل حركة الخلفية');};
  listen(motionButton,'click',()=>{wallpaperMotion=!wallpaperMotion;try{audioStorage?.setItem('osaa601-wallpaper-motion',wallpaperMotion?'on':'off');}catch(_){}syncWallpaperMotion();});
  listen(document,'visibilitychange',syncWallpaperMotion);listen(window,'blur',()=>{wallpaperFocused=false;syncWallpaperMotion();});listen(window,'focus',()=>{wallpaperFocused=true;syncWallpaperMotion();});
  if(motionQuery.addEventListener){motionQuery.addEventListener('change',syncWallpaperMotion);disposers.push(()=>motionQuery.removeEventListener?.('change',syncWallpaperMotion));}syncWallpaperMotion();
  const homeItem=document.createElement('button');homeItem.type='button';homeItem.className='os-start-item';homeItem.innerHTML=icon('home')+'<span>'+word('Show desktop','إظهار سطح المكتب')+'</span>';homeItem.addEventListener('click',()=>navigate('home'));startMenu.append(homeItem);
  disposers.push(window.OsaaStarfall.mount(arcade,quest,{ar,icon,isActive:()=>active==='arcade'&&!entries.get('arcade').window.hidden&&shell.querySelector('.os-search-overlay').hidden,onSound:kind=>audio.sfx(kind),onProgress:state=>{if(state.phase==='won')archive.finish();}}));
  const time=value=>{const seconds=Math.floor(value);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
  const seek=music.querySelector('.os-music-seek'),volume=music.querySelector('.os-music-volume');
  for(const [index,track]of window.OsaaAudio.tracks.entries()){
    const button=document.createElement('button');button.type='button';button.dataset.track=String(index);button.innerHTML=icon('music')+'<span></span>';button.querySelector('span').textContent=ar?track.arabic:track.name;button.addEventListener('click',()=>audio.choose(index));music.querySelector('.os-music-playlist').append(button);
  }
  let lastAudioKey='';
  disposers.push(audio.subscribe(state=>{
    music.dataset.playing=String(state.playing);
    const track=state.tracks[state.track];music.querySelector('.os-music-title').textContent=ar?track.arabic:track.name;music.querySelector('.os-music-mood').textContent=ar?track.arabicMood:track.mood;
    seek.max=String(state.duration);seek.value=String(state.position);music.querySelector('.os-music-elapsed').textContent=time(state.position);music.querySelector('.os-music-duration').textContent=time(state.duration);
    volume.value=String(state.volume);music.querySelector('.os-music-volume-label').textContent=Math.round(state.volume*100)+'%';
    shell.querySelector('.os-tray-volume').value=String(state.volume);shell.querySelector('.os-tray-volume-label').textContent=Math.round(state.volume*100)+'%';
    const key=[state.playing,state.pending,state.muted,state.sounds].join('/');
    if(key!==lastAudioKey){
      lastAudioKey=key;const play=music.querySelector('[data-music="play"]');play.innerHTML=icon(state.playing?'pause':'play')+'<span>'+word(state.pending?'Starting…':state.playing?'Pause':'Play',state.pending?'جارٍ التشغيل…':state.playing?'إيقاف مؤقت':'تشغيل')+'</span>';play.setAttribute('aria-label',word(state.playing?'Pause music':'Play music',state.playing?'إيقاف الموسيقى مؤقتاً':'تشغيل الموسيقى'));play.setAttribute('aria-pressed',String(state.playing));
      const quick=shell.querySelector('.os-music-toggle');quick.innerHTML=icon(state.playing?'pause':'play');quick.setAttribute('aria-label',word(state.playing?'Pause music':'Play music',state.playing?'إيقاف الموسيقى مؤقتاً':'تشغيل الموسيقى'));quick.setAttribute('aria-pressed',String(state.playing));
      const mute=music.querySelector('[data-music="mute"]');mute.innerHTML=icon(state.muted?'volume-off':'volume');mute.setAttribute('aria-label',word(state.muted?'Unmute music':'Mute music',state.muted?'إلغاء كتم الموسيقى':'كتم الموسيقى'));mute.setAttribute('aria-pressed',String(state.muted));
      const trayMute=shell.querySelector('.os-music-mute');trayMute.innerHTML=icon(state.muted?'volume-off':'volume');trayMute.setAttribute('aria-label',mute.getAttribute('aria-label'));trayMute.setAttribute('aria-pressed',String(state.muted));
      const speaker=shell.querySelector('.os-audio-toggle');speaker.innerHTML=icon(state.muted&& !state.sounds?'volume-off':'volume');
      for(const button of [shell.querySelector('.os-sound-toggle'),music.querySelector('[data-music="sounds"]')]){button.innerHTML=icon(state.sounds?'volume':'volume-off')+'<span>'+word('Interface sounds: '+(state.sounds?'On':'Off'),'أصوات الواجهة: '+(state.sounds?'مفعلة':'مغلقة'))+'</span>';button.setAttribute('aria-pressed',String(state.sounds));button.setAttribute('aria-label',word(state.sounds?'Turn interface sounds off':'Turn interface sounds on',state.sounds?'إغلاق أصوات الواجهة':'تفعيل أصوات الواجهة'));}
      document.dispatchEvent(new CustomEvent('portfolio-icons'));
    }
    music.querySelectorAll('[data-track]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.track)===state.track)));
    music.querySelector('.os-music-status').textContent=state.message?word('Audio could not start. Press Play to try again.','تعذر تشغيل الصوت. اضغط تشغيل للمحاولة مجدداً.'):'';
  }));
  music.addEventListener('click',event=>{const button=event.target.closest('[data-music]');if(!button)return;const action=button.dataset.music;if(action==='play')audio.toggle();else if(action==='previous')audio.next(-1);else if(action==='next')audio.next();else if(action==='mute')audio.toggleMute();else if(action==='sounds')audio.toggleSounds();});
  seek.addEventListener('input',()=>audio.seek(seek.value));volume.addEventListener('input',()=>audio.setVolume(volume.value));shell.querySelector('.os-music-toggle').addEventListener('click',()=>audio.toggle());shell.querySelector('.os-sound-toggle').addEventListener('click',()=>audio.toggleSounds());
  const audioPanel=shell.querySelector('.os-audio-settings'),audioButton=shell.querySelector('.os-audio-toggle');
  const closeAudio=()=>{audioPanel.hidden=true;audioButton.setAttribute('aria-expanded','false');};
  audioButton.addEventListener('click',()=>{audioPanel.hidden=!audioPanel.hidden;audioButton.setAttribute('aria-expanded',String(!audioPanel.hidden));closeStart();});
  shell.querySelector('.os-audio-close').addEventListener('click',()=>{closeAudio();audioButton.focus();});
  shell.querySelector('.os-tray-player').addEventListener('click',()=>{navigate('music',{keyboard:true});closeAudio();});
  shell.querySelector('.os-tray-volume').addEventListener('input',event=>audio.setVolume(event.target.value));shell.querySelector('.os-music-mute').addEventListener('click',()=>audio.toggleMute());
  shell.addEventListener('click',event=>{if(!event.target.closest('.os-audio-settings,.os-audio-toggle'))closeAudio();});
  shell.addEventListener('click',event=>{if(event.target.closest('[data-rpg="attack"],[data-rpg="dash"]'))return;if(event.target.closest('[data-action="close"]'))audio.sfx('close');else if(event.target.closest('[data-app],.project-content a'))audio.sfx('open');else if(event.target.closest('button,a'))audio.sfx('click');});
  const decodeScreen=()=>{
    const hash=location.hash.slice(1);if(hash==='about')return 'profile';if(hash==='home'||screens.has(hash))return hash;
    if(screens.has(main.dataset.initialScreen))return main.dataset.initialScreen;
    const initial=main.dataset.initialProject;return screens.has('project/'+initial)?'project/'+initial:State.deviceForWidth(shell.clientWidth)==='mobile'?'home':'profile';
  };
  const resize=()=>{
    device=State.deviceForWidth(shell.clientWidth);root.dataset.device=device;
    shell.querySelector('.os-edition').textContent=word({mobile:'MOBILE DESKTOP',tablet:'TABLET DESKTOP',desktop:'PERSONAL DESKTOP'}[device],{mobile:'سطح مكتب الهاتف',tablet:'سطح مكتب الجهاز اللوحي',desktop:'سطح المكتب الشخصي'}[device]);
    for(const entry of entries.values())if(!entry.window.hidden)place(entry);
  };
  const syncTheme=()=>{
    const dark=root.dataset.theme==='dark';if(audioTheme!==dark){audioTheme=dark;audio.choose(dark?1:0);}const art=document.querySelector('#hero-art'),artSource=dark?art.dataset.night:art.dataset.day;shell.querySelector('.os-wallpaper').src=artSource;profileArt.querySelector('img').src=artSource;
    const button=shell.querySelector('.os-theme');button.innerHTML=icon(dark?'sun':'moon');button.setAttribute('aria-label',word(dark?'Light mode':'Dark mode',dark?'الوضع الفاتح':'الوضع الداكن'));button.setAttribute('aria-pressed',String(dark));
  };
  const lang=shell.querySelector('.os-language');lang.href=language.href;lang.textContent=language.textContent;lang.lang=language.lang;lang.hreflang=language.hreflang;
  lang.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();queueMicrotask(()=>changeLanguage(lang.lang));});
  shell.querySelector('.os-theme').addEventListener('click',()=>originalTheme.click());listen(document,'portfolio-theme',syncTheme);
  start.addEventListener('click',()=>{startMenu.hidden=!startMenu.hidden;start.setAttribute('aria-expanded',String(!startMenu.hidden));});
  listen(window,'popstate',event=>{const state=event.state,entry=entries.get(state?.owner);if(entry&&Number.isInteger(state.trailIndex)&&entry.pages.has(state.screen))entry.trail.restore(state.trailIndex,state.screen);navigate(state?.screen||decodeScreen(),{record:false});});
  shell.addEventListener('click',event=>{
    if(!event.target.closest('.os-window-menu,[data-action="layout"]'))for(const entry of entries.values()){entry.window.querySelector('.os-window-menu').hidden=true;entry.window.querySelector('[data-action="layout"]').setAttribute('aria-expanded','false');}
    if(!event.target.closest('.os-start-menu,.os-start'))closeStart();const anchor=event.target.closest('a');if(!anchor||anchor.classList.contains('os-language'))return;
    const href=anchor.getAttribute('href');if(!href||/^(mailto:|tel:)/.test(href)||anchor.target==='_blank'||anchor.getAttribute('download')!==null||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const url=new URL(href,location.href);if(url.origin!==location.origin)return;const direct=[...screens.values()].find(p=>p.route===url.pathname);if(!url.hash&&direct){event.preventDefault();navigate(direct.id,{keyboard:true});return;}const match=url.pathname.match(/\/work\/([^/]+)\/?$/);
    if(match&&screens.has('project/'+match[1])){event.preventDefault();navigate('project/'+match[1],{keyboard:true});}
    else if(url.hash){const id=url.hash.slice(1)==='about'?'profile':url.hash.slice(1);if(id==='home'||screens.has(id)){event.preventDefault();navigate(id,{keyboard:true});}}
  });
  listen(document,'keydown',event=>{
    if(event.osHandled||event.defaultPrevented)return;
    if(event.key.toLowerCase()==='m'&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.target.closest('input,textarea,select')&& !event.repeat){event.preventDefault();audio.toggle();}
    if(event.key==='Escape'){const entry=entries.get(active),menu=entry?.window.querySelector('.os-window-menu');if(menu&&!menu.hidden){menu.hidden=true;entry.window.querySelector('[data-action="layout"]').setAttribute('aria-expanded','false');entry.window.querySelector('[data-action="layout"]').focus();}else if(!audioPanel.hidden){closeAudio();audioButton.focus();}else{closeStart();start.focus();}}
    const entry=entries.get(active);
    if(event.altKey&&event.key==='ArrowLeft'&&entry){event.preventDefault();moveWithin(entry,-1);}
    if(event.altKey&&event.key==='ArrowRight'&&entry){event.preventDefault();moveWithin(entry,1);}

  });
  listen(window,'resize',resize);const observer=new ResizeObserver(resize);observer.observe(stage);disposers.push(()=>observer.disconnect());
  const clock=shell.querySelector('.os-clock');const tick=()=>{const date=new Date();clock.dateTime=date.toISOString();clock.textContent=new Intl.DateTimeFormat(ar?'ar-LY':'en-GB',{hour:'2-digit',minute:'2-digit'}).format(date);};
  tick();const clockTimer=setInterval(tick,60000);disposers.push(()=>clearInterval(clockTimer));syncTheme();resize();
  if(snapshot)for(const [id,saved]of snapshot.windows){const entry=entries.get(id);if(!entry)continue;restoreGeometry(entry,saved);entry.trail=saved.trail;entry.scrolls=saved.scrolls;entry.window.hidden=saved.hidden;entry.task.hidden=saved.taskHidden;entry.window.style.zIndex=saved.zIndex;renderPage(entry);place(entry);z=Math.max(z,Number(saved.zIndex)||0);}
  else if(rememberedLayout)for(const saved of rememberedLayout.windows){const entry=entries.get(saved.id);if(entry)restoreGeometry(entry,saved);}
  navigate(snapshot?.screen||decodeScreen(),{record:false});document.querySelector('.skip-link').href='#desktop-main';
  starting=false;root.classList.add('desktop-enhanced');
  return {persist,snapshot:()=>{for(const entry of entries.values())entry.scrolls[entry.trail.current]=entry.content.scrollTop;return {active,screen:active==='home'?'home':entries.get(active).trail.current,windows:[...entries].map(([id,e])=>[id,{x:e.x,y:e.y,width:e.width,height:e.height,snap:e.snap,trail:e.trail,scrolls:e.scrolls,hidden:e.window.hidden,taskHidden:e.task.hidden,maximized:e.window.classList.contains('os-maximized'),zIndex:e.window.style.zIndex}])};},dispose:()=>{for(const fn of disposers)fn();shell.remove();}};
  };
  try{desktop=mount();}catch(error){for(const shell of document.querySelectorAll('.os-shell'))shell.remove();root.classList.remove('desktop-enhanced');console.warn('Desktop unavailable; professional information remains accessible.',error);}
})();
