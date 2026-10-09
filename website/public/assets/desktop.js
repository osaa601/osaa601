(() => {
  const root=document.documentElement;
  const main=document.querySelector('#main');
  const hero=main?.querySelector('.hero-copy');
  if(!hero)return;
  const ar=root.lang==='ar';
  const word=(en,arabic)=>ar?arabic:en;
  const State=window.OsaaDesktopState;
  const icon=name=>`<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
  const labels={profile:word('Profile','الملف الشخصي'),services:word('Services','الخدمات'),work:word('Projects','المشاريع'),creative:word('Studio','الاستوديو'),contact:word('Contact','التواصل'),links:word('Links','الروابط')};
  const originalTheme=document.querySelector('.theme-button');
  const language=document.querySelector('.language-switch');
  const shell=document.createElement('div');shell.className='os-shell';
  shell.innerHTML=`<img class="os-wallpaper" alt="" width="1200" height="800"><div class="os-wallpaper-shade" aria-hidden="true"></div>
    <header class="os-topbar"><span class="os-brand">${icon('grid')}<span>OSAA601</span><span class="os-edition"></span></span>
      <nav class="os-navigation" aria-label="${word('Desktop navigation','التنقل في سطح المكتب')}"><button type="button" class="os-nav-button" data-nav="back" aria-label="${word('Back','رجوع')}">${icon('back')}</button><button type="button" class="os-nav-button" data-nav="forward" aria-label="${word('Forward','تقدم')}">${icon('forward')}</button><button type="button" class="os-nav-button" data-nav="home" aria-label="${word('Desktop home','الشاشة الرئيسية')}">${icon('home')}</button><div class="os-breadcrumb"></div></nav>
      <div class="os-top-actions"><a class="os-language"></a><button type="button" class="os-theme"></button></div></header>
    <main id="desktop-main" class="os-stage" aria-label="${word('Personal desktop','سطح المكتب الشخصي')}"><nav class="os-icons" aria-label="${word('Applications','التطبيقات')}"></nav><div class="os-window-layer"></div><div class="os-wallpaper-label" aria-hidden="true"><span>Osaa601</span><span>${word('Security. Stories. New worlds.','أمن. قصص. عوالم جديدة.')}</span></div></main>
    <nav class="os-start-menu" aria-label="${word('Applications','التطبيقات')}" hidden><div class="os-start-heading">${ar?'أسامة واعر':'Osama Waer'}<span>Osaa601</span></div></nav>
    <footer class="os-taskbar"><button class="os-start" type="button" aria-expanded="false">${icon('grid')}<span>${word('Apps','التطبيقات')}</span></button><div class="os-tasks" aria-label="${word('Open windows','النوافذ المفتوحة')}"></div><time class="os-clock"></time></footer><span class="os-announcement" role="status" aria-live="polite"></span>`;
  document.body.append(shell);root.classList.add('desktop-enhanced');
  const stage=shell.querySelector('.os-stage'),layer=shell.querySelector('.os-window-layer'),tasks=shell.querySelector('.os-tasks');
  const start=shell.querySelector('.os-start'),startMenu=shell.querySelector('.os-start-menu');
  const back=shell.querySelector('[data-nav="back"]'),forward=shell.querySelector('[data-nav="forward"]');
  const breadcrumb=shell.querySelector('.os-breadcrumb'),announcer=shell.querySelector('.os-announcement');
  const entries=new Map();let z=5;let device='desktop';let active='home';
  const session=String(Date.now());
  const sources={profile:[hero,main.querySelector('#about')]};
  for(const id of ['services','work','creative','contact','links'])sources[id]=[main.querySelector('#'+id)];
  const closeStart=()=>{startMenu.hidden=true;start.setAttribute('aria-expanded','false');};
  const place=entry=>{
    if(entry.window.classList.contains('os-maximized'))return;
    const b=State.bounds(device,stage.clientWidth,stage.clientHeight,entry);
    Object.assign(entry,{x:b.x,y:b.y});
    entry.window.style.left=b.x+'px';entry.window.style.top=b.y+'px';entry.window.style.width=b.width+'px';entry.window.style.height=b.height+'px';
  };
  const select=entry=>{
    active=entry.id;entry.window.style.zIndex=String(++z);root.classList.remove('os-home-view');
    for(const item of entries.values()){
      const selected=item===entry&&!item.window.hidden;item.window.classList.toggle('os-active',selected);item.task.setAttribute('aria-pressed',String(selected));
    }
    shell.querySelectorAll('[data-app]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.app===entry.id)));
  };
  const showHome=()=>{
    active='home';root.classList.add('os-home-view');
    for(const entry of entries.values()){entry.window.hidden=true;entry.task.setAttribute('aria-pressed','false');entry.window.classList.remove('os-active');}
    shell.querySelectorAll('[data-app]').forEach(button=>button.setAttribute('aria-pressed','false'));
  };
  const refreshNavigation=()=>{
    back.disabled=!trail.canBack;forward.disabled=!trail.canForward;breadcrumb.replaceChildren();
    const parts=[['home',word('Desktop','سطح المكتب')]];
    if(active.startsWith('project/'))parts.push(['work',labels.work],[active,entries.get(active).label]);
    else if(active!=='home')parts.push([active,labels[active]]);
    for(const [index,[id,label]] of parts.entries()){
      if(index){const divider=document.createElement('span');divider.className='os-crumb-divider';divider.textContent='/';divider.setAttribute('aria-hidden','true');breadcrumb.append(divider);}
      const button=document.createElement('button');button.type='button';button.textContent=label;button.className='os-crumb';button.dataset.screen=id;
      if(id===active)button.setAttribute('aria-current','page');button.addEventListener('click',()=>navigate(id));breadcrumb.append(button);
    }
  };
  const navigate=(id,{record=true,keyboard=false}={})=>{
    if(id!=='home'&&!entries.has(id))id='profile';
    if(id==='home')showHome();else{
      const entry=entries.get(id);entry.window.hidden=false;entry.task.hidden=false;place(entry);select(entry);if(keyboard)entry.title.focus();
    }
    if(record&&trail.visit(id))history.pushState({osaa:session,index:trail.index,screen:id},'', '#'+id);
    closeStart();refreshNavigation();announcer.textContent=id==='home'?word('Desktop home','الشاشة الرئيسية'):entries.get(id).label;
  };
  const hideWindow=(entry,closed)=>{
    entry.window.hidden=true;entry.task.setAttribute('aria-pressed','false');if(closed)entry.task.hidden=true;
    const next=[...entries.values()].filter(item=>!item.window.hidden).sort((a,b)=>Number(b.window.style.zIndex)-Number(a.window.style.zIndex))[0];
    navigate(next?.id||'home',{keyboard:!!next});if(!next)shell.querySelector('[data-app="profile"]').focus();
  };
  const createWindow=(id,label,iconName,nodes)=>{
    const win=document.createElement('section');win.className='os-window';win.hidden=true;win.id='os-window-'+id.replace('/','-');
    const titleId='os-title-'+id.replace('/','-');win.setAttribute('aria-labelledby',titleId);
    win.innerHTML=`<div class="os-titlebar"><button type="button" class="os-drag-title" id="${titleId}">${icon(iconName)}<span></span></button><div class="os-window-controls"><button type="button" data-action="minimize" aria-label="${word('Minimize','تصغير')}">${icon('minimize')}</button><button type="button" data-action="maximize" aria-label="${word('Maximize','تكبير')}" aria-pressed="false">${icon('maximize')}</button><button type="button" data-action="close" aria-label="${word('Close','إغلاق')}">${icon('close')}</button></div></div><div class="os-content"></div>`;
    win.querySelector('.os-drag-title span').textContent=label;
    const task=document.createElement('button');task.type='button';task.className='os-task';task.hidden=true;task.innerHTML=icon(iconName)+'<span></span>';task.querySelector('span').textContent=label;
    task.setAttribute('aria-label',label);task.setAttribute('aria-controls',win.id);task.setAttribute('aria-pressed','false');
    const index=entries.size;const entry={id,label,window:win,task,title:win.querySelector('.os-drag-title'),content:win.querySelector('.os-content'),x:Math.max(130,(stage.clientWidth-700)/2)+index*22,y:24+index*16};
    for(const node of nodes)entry.content.append(node);entries.set(id,entry);layer.append(win);tasks.append(task);
    task.addEventListener('click',()=>{if(active===id&&!win.hidden)hideWindow(entry,false);else navigate(id,{keyboard:true});});
    win.addEventListener('pointerdown',()=>{if(active!==id)navigate(id);});
    win.querySelector('.os-window-controls').addEventListener('click',event=>{
      const button=event.target.closest('[data-action]');if(!button)return;
      if(button.dataset.action==='maximize'){
        const maximized=win.classList.toggle('os-maximized');button.setAttribute('aria-pressed',String(maximized));button.innerHTML=icon(maximized?'restore':'maximize');button.setAttribute('aria-label',word(maximized?'Restore':'Maximize',maximized?'استعادة':'تكبير'));place(entry);
      }else hideWindow(entry,button.dataset.action==='close');
    });
    entry.title.addEventListener('dblclick',()=>win.querySelector('[data-action="maximize"]').click());
    let drag;
    entry.title.addEventListener('pointerdown',event=>{
      if(event.button!==0||device!=='desktop'||win.classList.contains('os-maximized'))return;
      drag={pointer:event.pointerId,x:event.clientX,y:event.clientY,left:entry.x,top:entry.y};entry.title.setPointerCapture(event.pointerId);
    });
    entry.title.addEventListener('pointermove',event=>{if(!drag)return;entry.x=drag.left+event.clientX-drag.x;entry.y=drag.top+event.clientY-drag.y;place(entry);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])entry.title.addEventListener(type,()=>{drag=null;});
    entry.title.addEventListener('keydown',event=>{
      const move={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];if(move&&device==='desktop'){event.preventDefault();entry.x+=move[0];entry.y+=move[1];place(entry);}
    });
    return entry;
  };
  for(const [id,label] of Object.entries(labels)){
    createWindow(id,label,id,sources[id]);
    for(const [container,className] of [[shell.querySelector('.os-icons'),'os-icon'],[startMenu,'os-start-item']]){
      const button=document.createElement('button');button.type='button';button.className=className;button.dataset.app=id;button.setAttribute('aria-pressed','false');button.innerHTML=`<span class="os-app-symbol">${icon(id)}</span><span>${label}</span>`;
      button.addEventListener('click',event=>navigate(id,{keyboard:event.detail===0}));container.append(button);
    }
  }
  for(const template of main.querySelectorAll('template[data-case]')){
    const id='project/'+template.dataset.case;const contents=document.createElement('div');contents.className='os-case-detail';contents.append(template.content.cloneNode(true));
    const type={'security-operations':'activity',potstation:'server',isms:'document',wedding:'game'}[template.dataset.case]||'document';createWindow(id,template.dataset.title,type,[contents]);
  }
  const decodeScreen=()=>{
    const hash=location.hash.slice(1);if(hash==='about')return 'profile';if(hash==='home'||entries.has(hash))return hash;
    const initial=main.dataset.initialProject;return entries.has('project/'+initial)?'project/'+initial:State.deviceForWidth(shell.clientWidth)==='mobile'?'home':'profile';
  };
  const trail=new State.Trail(decodeScreen());history.replaceState({osaa:session,index:0,screen:trail.current},'',location.hash||'#'+trail.current);
  const resize=()=>{
    device=State.deviceForWidth(shell.clientWidth);root.dataset.device=device;
    shell.querySelector('.os-edition').textContent=word({mobile:'MOBILE DESKTOP',tablet:'TABLET DESKTOP',desktop:'PERSONAL DESKTOP'}[device],{mobile:'سطح مكتب الهاتف',tablet:'سطح مكتب الجهاز اللوحي',desktop:'سطح المكتب الشخصي'}[device]);
    for(const entry of entries.values())if(!entry.window.hidden)place(entry);
  };
  const syncTheme=()=>{
    const dark=root.dataset.theme==='dark';const art=document.querySelector('#hero-art');shell.querySelector('.os-wallpaper').src=dark?art.dataset.night:art.dataset.day;
    const button=shell.querySelector('.os-theme');button.innerHTML=icon(dark?'sun':'moon');button.setAttribute('aria-label',word(dark?'Light mode':'Dark mode',dark?'الوضع الفاتح':'الوضع الداكن'));button.setAttribute('aria-pressed',String(dark));
  };
  const lang=shell.querySelector('.os-language');lang.href=language.href;lang.textContent=language.textContent;lang.lang=language.lang;lang.hreflang=language.hreflang;
  shell.querySelector('.os-theme').addEventListener('click',()=>originalTheme.click());document.addEventListener('portfolio-theme',syncTheme);
  start.addEventListener('click',()=>{startMenu.hidden=!startMenu.hidden;start.setAttribute('aria-expanded',String(!startMenu.hidden));});
  back.addEventListener('click',()=>{if(trail.canBack)history.back();});forward.addEventListener('click',()=>{if(trail.canForward)history.forward();});shell.querySelector('[data-nav="home"]').addEventListener('click',()=>navigate('home'));
  window.addEventListener('popstate',event=>{const id=event.state?.screen||decodeScreen();if(event.state?.osaa===session)trail.restore(event.state.index,id);else trail.visit(id);navigate(id,{record:false});});
  shell.addEventListener('click',event=>{
    if(!event.target.closest('.os-start-menu,.os-start'))closeStart();const anchor=event.target.closest('a');if(!anchor)return;
    const href=anchor.getAttribute('href');if(/^(mailto:|tel:)/.test(href)||anchor.target==='_blank')return;
    const url=new URL(href,location.href);if(url.origin!==location.origin)return;const match=url.pathname.match(/\/work\/([^/]+)\/?$/);
    if(match&&entries.has('project/'+match[1])){event.preventDefault();navigate('project/'+match[1],{keyboard:true});}
    else if(url.hash){const id=url.hash.slice(1)==='about'?'profile':url.hash.slice(1);if(id==='home'||entries.has(id)){event.preventDefault();navigate(id,{keyboard:true});}}
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){closeStart();start.focus();}
    if(event.altKey&&event.key==='ArrowLeft'&&trail.canBack){event.preventDefault();history.back();}
    if(event.altKey&&event.key==='ArrowRight'&&trail.canForward){event.preventDefault();history.forward();}
  });
  window.addEventListener('resize',resize);new ResizeObserver(resize).observe(stage);
  const clock=shell.querySelector('.os-clock');const tick=()=>{const date=new Date();clock.dateTime=date.toISOString();clock.textContent=new Intl.DateTimeFormat(ar?'ar-LY':'en-GB',{hour:'2-digit',minute:'2-digit'}).format(date);};
  tick();setInterval(tick,60000);syncTheme();resize();navigate(trail.current,{record:false});document.querySelector('.skip-link').href='#desktop-main';
})();
