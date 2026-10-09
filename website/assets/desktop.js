(() => {
  const root=document.documentElement;
  const main=document.querySelector('#main');
  const hero=main?.querySelector('.hero-copy');
  if(!hero)return;
  const ar=root.lang==='ar';
  const word=(en,arabic)=>ar?arabic:en;
  const State=window.OsaaDesktopState;
  const icon=name=>`<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
  const labels={profile:word('Profile','الملف الشخصي'),services:word('Services','الخدمات'),work:word('Projects','المشاريع'),creative:word('Studio','الاستوديو'),contact:word('Contact','التواصل'),links:word('Links','الروابط'),music:word('Music','الموسيقى')};
  let audioStorage;try{audioStorage=localStorage;}catch(_){}
  const audio=new window.OsaaAudio.DeskAudio({storage:audioStorage});let audioTheme;
  const originalTheme=document.querySelector('.theme-button');
  const language=document.querySelector('.language-switch');
  const navigationMarkup=()=>`<nav class="os-navigation" aria-label="${word('Window navigation','التنقل في النافذة')}"><button type="button" class="os-nav-button" data-nav="back" aria-label="${word('Back','رجوع')}">${icon('back')}</button><button type="button" class="os-nav-button" data-nav="forward" aria-label="${word('Forward','تقدم')}">${icon('forward')}</button><button type="button" class="os-nav-button" data-nav="home" aria-label="${word('Desktop home','الشاشة الرئيسية')}">${icon('home')}</button><div class="os-breadcrumb"></div></nav>`;
  const shell=document.createElement('div');shell.className='os-shell';
  shell.innerHTML=`<img class="os-wallpaper" alt="" width="1200" height="800"><div class="os-wallpaper-shade" aria-hidden="true"></div>
    <header class="os-topbar"><span class="os-brand">${icon('grid')}<span>OSAA601</span><span class="os-edition"></span></span>
      <div class="os-top-actions"><a class="os-language"></a><button type="button" class="os-music-toggle"></button><button type="button" class="os-sound-toggle" aria-label="${word('Interface sounds','أصوات الواجهة')}"></button><button type="button" class="os-theme"></button></div></header>
    <main id="desktop-main" class="os-stage" aria-label="${word('Personal desktop','سطح المكتب الشخصي')}"><nav class="os-icons" aria-label="${word('Applications','التطبيقات')}"></nav><div class="os-window-layer"></div><div class="os-wallpaper-label" aria-hidden="true"><span>Osaa601</span><span>${word('Security. Stories. New worlds.','أمن. قصص. عوالم جديدة.')}</span></div></main>
    <nav class="os-start-menu" aria-label="${word('Applications','التطبيقات')}" hidden><div class="os-start-heading">${ar?'أسامة واعر':'Osama Waer'}<span>Osaa601</span></div></nav>
    <footer class="os-taskbar"><button class="os-start" type="button" aria-expanded="false">${icon('grid')}<span>${word('Apps','التطبيقات')}</span></button><div class="os-tasks" aria-label="${word('Open windows','النوافذ المفتوحة')}"></div><time class="os-clock"></time></footer><span class="os-announcement" role="status" aria-live="polite"></span>`;
  document.body.append(shell);root.classList.add('desktop-enhanced');
  const stage=shell.querySelector('.os-stage'),layer=shell.querySelector('.os-window-layer'),tasks=shell.querySelector('.os-tasks');
  const start=shell.querySelector('.os-start'),startMenu=shell.querySelector('.os-start-menu');
  const announcer=shell.querySelector('.os-announcement');
  const entries=new Map();let z=5;let device='desktop';let active='home';
  const session=String(Date.now());
  const sources={profile:[hero,main.querySelector('#about')]};
  for(const id of ['services','work','creative','contact','links'])sources[id]=[main.querySelector('#'+id)];
  const music=document.createElement('section');music.className='os-music-panel';
  music.innerHTML=`<span class="eyebrow">${word('LO-FI RADIO','راديو لوفاي')}</span><div class="os-music-cover" aria-hidden="true">${icon('music')}<div class="os-equalizer"><span></span><span></span><span></span><span></span><span></span></div></div><h2 class="os-music-title"></h2><p class="os-music-mood"></p>
    <label class="os-player-label" for="music-seek">${word('Playback position','موضع التشغيل')}</label><input id="music-seek" class="os-music-seek" type="range" min="0" max="30" step="0.1" value="0"><div class="os-music-time" dir="ltr"><span class="os-music-elapsed">0:00</span><span class="os-music-duration"></span></div>
    <div class="os-music-controls"><button type="button" data-music="previous" aria-label="${word('Previous track','المقطع السابق')}">${icon('previous')}</button><button type="button" class="os-music-play" data-music="play"></button><button type="button" data-music="next" aria-label="${word('Next track','المقطع التالي')}">${icon('next')}</button><button type="button" data-music="mute"></button></div>
    <label class="os-player-label" for="music-volume">${word('Music volume','مستوى صوت الموسيقى')} <span class="os-music-volume-label"></span></label><input id="music-volume" class="os-music-volume" type="range" min="0" max="1" step="0.01" value="0.45">
    <div class="os-music-playlist" aria-label="${word('Playlist','قائمة التشغيل')}"></div><button class="os-music-sounds" type="button" data-music="sounds"></button><p class="os-music-note">${word('Built-in ambient loops. Pick a track and press Play.','مقاطع هادئة مدمجة. اختر مقطعاً واضغط تشغيل.')}</p><p class="os-music-status" role="status" aria-live="polite"></p>`;
  sources.music=[music];
  window.addEventListener('pagehide',()=>audio.destroy(),{once:true});
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
    for(const entry of entries.values()){
      const navigation=entry.navigation;
      navigation.querySelector('[data-nav="back"]').disabled=!trail.canBack;
      navigation.querySelector('[data-nav="forward"]').disabled=!trail.canForward;
      const breadcrumb=navigation.querySelector('.os-breadcrumb');breadcrumb.replaceChildren();
      const parts=[['home',word('Desktop','سطح المكتب')]];
      if(entry.id.startsWith('project/'))parts.push(['work',labels.work],[entry.id,entry.label]);
      else parts.push([entry.id,entry.label]);
      for(const [index,[id,label]] of parts.entries()){
        if(index){const divider=document.createElement('span');divider.className='os-crumb-divider';divider.textContent='/';divider.setAttribute('aria-hidden','true');breadcrumb.append(divider);}
        const button=document.createElement('button');button.type='button';button.textContent=label;button.className='os-crumb';button.dataset.screen=id;
        if(id===entry.id)button.setAttribute('aria-current','page');button.addEventListener('click',()=>navigate(id));breadcrumb.append(button);
      }
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
    win.innerHTML=`<div class="os-titlebar"><button type="button" class="os-drag-title" id="${titleId}">${icon(iconName)}<span></span></button><div class="os-window-controls"><button type="button" data-action="minimize" aria-label="${word('Minimize','تصغير')}">${icon('minimize')}</button><button type="button" data-action="maximize" aria-label="${word('Maximize','تكبير')}" aria-pressed="false">${icon('maximize')}</button><button type="button" data-action="close" aria-label="${word('Close','إغلاق')}">${icon('close')}</button></div></div>${navigationMarkup()}<div class="os-content"></div>`;
    win.querySelector('.os-drag-title span').textContent=label;
    const task=document.createElement('button');task.type='button';task.className='os-task';task.hidden=true;task.innerHTML=icon(iconName)+'<span></span>';task.querySelector('span').textContent=label;
    task.setAttribute('aria-label',label);task.setAttribute('aria-controls',win.id);task.setAttribute('aria-pressed','false');
    const index=entries.size;const sizing=State.bounds(State.deviceForWidth(stage.clientWidth),stage.clientWidth,stage.clientHeight);const entry={id,label,window:win,task,navigation:win.querySelector('.os-navigation'),title:win.querySelector('.os-drag-title'),content:win.querySelector('.os-content'),x:Math.max(8,(stage.clientWidth-sizing.width)/2)+index*22,y:24+index*16};
    for(const node of nodes)entry.content.append(node);entries.set(id,entry);layer.append(win);tasks.append(task);
    entry.navigation.querySelector('[data-nav="back"]').addEventListener('click',()=>{if(trail.canBack)history.back();});
    entry.navigation.querySelector('[data-nav="forward"]').addEventListener('click',()=>{if(trail.canForward)history.forward();});
    entry.navigation.querySelector('[data-nav="home"]').addEventListener('click',()=>navigate('home'));
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
      if(event.button!==0||win.classList.contains('os-maximized'))return;
      event.preventDefault();
      drag={pointer:event.pointerId,x:event.clientX,y:event.clientY,left:entry.x,top:entry.y};entry.title.setPointerCapture(event.pointerId);
    });
    entry.title.addEventListener('pointermove',event=>{if(!drag)return;entry.x=drag.left+event.clientX-drag.x;entry.y=drag.top+event.clientY-drag.y;place(entry);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])entry.title.addEventListener(type,()=>{drag=null;});
    entry.title.addEventListener('keydown',event=>{
      const move={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];if(move&&!event.altKey&&!win.classList.contains('os-maximized')){event.preventDefault();entry.x+=move[0];entry.y+=move[1];place(entry);}
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
  const time=value=>{const seconds=Math.floor(value);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
  const seek=music.querySelector('.os-music-seek'),volume=music.querySelector('.os-music-volume');
  for(const [index,track]of window.OsaaAudio.tracks.entries()){
    const button=document.createElement('button');button.type='button';button.dataset.track=String(index);button.innerHTML=icon('music')+'<span></span>';button.querySelector('span').textContent=ar?track.arabic:track.name;button.addEventListener('click',()=>audio.choose(index));music.querySelector('.os-music-playlist').append(button);
  }
  let lastAudioKey='';
  audio.subscribe(state=>{
    music.dataset.playing=String(state.playing);
    const track=state.tracks[state.track];music.querySelector('.os-music-title').textContent=ar?track.arabic:track.name;music.querySelector('.os-music-mood').textContent=ar?track.arabicMood:track.mood;
    seek.max=String(state.duration);seek.value=String(state.position);music.querySelector('.os-music-elapsed').textContent=time(state.position);music.querySelector('.os-music-duration').textContent=time(state.duration);
    volume.value=String(state.volume);music.querySelector('.os-music-volume-label').textContent=Math.round(state.volume*100)+'%';
    const key=[state.playing,state.pending,state.muted,state.sounds].join('/');
    if(key!==lastAudioKey){
      lastAudioKey=key;const play=music.querySelector('[data-music="play"]');play.innerHTML=icon(state.playing?'pause':'play')+'<span>'+word(state.pending?'Starting…':state.playing?'Pause':'Play',state.pending?'جارٍ التشغيل…':state.playing?'إيقاف مؤقت':'تشغيل')+'</span>';play.setAttribute('aria-label',word(state.playing?'Pause music':'Play music',state.playing?'إيقاف الموسيقى مؤقتاً':'تشغيل الموسيقى'));play.setAttribute('aria-pressed',String(state.playing));
      const quick=shell.querySelector('.os-music-toggle');quick.innerHTML=icon(state.playing?'pause':'play');quick.setAttribute('aria-label',word(state.playing?'Pause music':'Play music',state.playing?'إيقاف الموسيقى مؤقتاً':'تشغيل الموسيقى'));quick.setAttribute('aria-pressed',String(state.playing));
      const mute=music.querySelector('[data-music="mute"]');mute.innerHTML=icon(state.muted?'volume-off':'volume');mute.setAttribute('aria-label',word(state.muted?'Unmute music':'Mute music',state.muted?'إلغاء كتم الموسيقى':'كتم الموسيقى'));mute.setAttribute('aria-pressed',String(state.muted));
      for(const button of [shell.querySelector('.os-sound-toggle'),music.querySelector('[data-music="sounds"]')]){button.innerHTML=icon(state.sounds?'volume':'volume-off')+(button.classList.contains('os-music-sounds')?'<span>'+word('Interface sounds: '+(state.sounds?'On':'Off'),'أصوات الواجهة: '+(state.sounds?'مفعلة':'مغلقة'))+'</span>':'');button.setAttribute('aria-pressed',String(state.sounds));button.setAttribute('aria-label',word(state.sounds?'Turn interface sounds off':'Turn interface sounds on',state.sounds?'إغلاق أصوات الواجهة':'تفعيل أصوات الواجهة'));}
      document.dispatchEvent(new CustomEvent('portfolio-icons'));
    }
    music.querySelectorAll('[data-track]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.track)===state.track)));
    music.querySelector('.os-music-status').textContent=state.message?word('Audio could not start. Press Play to try again.','تعذر تشغيل الصوت. اضغط تشغيل للمحاولة مجدداً.'):'';
  });
  music.addEventListener('click',event=>{const button=event.target.closest('[data-music]');if(!button)return;const action=button.dataset.music;if(action==='play')audio.toggle();else if(action==='previous')audio.next(-1);else if(action==='next')audio.next();else if(action==='mute')audio.toggleMute();else if(action==='sounds')audio.toggleSounds();});
  seek.addEventListener('input',()=>audio.seek(seek.value));volume.addEventListener('input',()=>audio.setVolume(volume.value));shell.querySelector('.os-music-toggle').addEventListener('click',()=>audio.toggle());shell.querySelector('.os-sound-toggle').addEventListener('click',()=>audio.toggleSounds());
  shell.addEventListener('click',event=>{if(event.target.closest('[data-action="close"]'))audio.sfx('close');else if(event.target.closest('[data-app],.project-content a'))audio.sfx('open');else if(event.target.closest('button,a'))audio.sfx('click');});
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
    const dark=root.dataset.theme==='dark';if(audioTheme!==dark){audioTheme=dark;audio.choose(dark?1:0);}const art=document.querySelector('#hero-art');shell.querySelector('.os-wallpaper').src=dark?art.dataset.night:art.dataset.day;
    const button=shell.querySelector('.os-theme');button.innerHTML=icon(dark?'sun':'moon');button.setAttribute('aria-label',word(dark?'Light mode':'Dark mode',dark?'الوضع الفاتح':'الوضع الداكن'));button.setAttribute('aria-pressed',String(dark));
  };
  const lang=shell.querySelector('.os-language');lang.href=language.href;lang.textContent=language.textContent;lang.lang=language.lang;lang.hreflang=language.hreflang;
  shell.querySelector('.os-theme').addEventListener('click',()=>originalTheme.click());document.addEventListener('portfolio-theme',syncTheme);
  start.addEventListener('click',()=>{startMenu.hidden=!startMenu.hidden;start.setAttribute('aria-expanded',String(!startMenu.hidden));});
  window.addEventListener('popstate',event=>{const id=event.state?.screen||decodeScreen();if(event.state?.osaa===session)trail.restore(event.state.index,id);else trail.visit(id);navigate(id,{record:false});});
  shell.addEventListener('click',event=>{
    if(!event.target.closest('.os-start-menu,.os-start'))closeStart();const anchor=event.target.closest('a');if(!anchor)return;
    const href=anchor.getAttribute('href');if(/^(mailto:|tel:)/.test(href)||anchor.target==='_blank')return;
    const url=new URL(href,location.href);if(url.origin!==location.origin)return;const match=url.pathname.match(/\/work\/([^/]+)\/?$/);
    if(match&&entries.has('project/'+match[1])){event.preventDefault();navigate('project/'+match[1],{keyboard:true});}
    else if(url.hash){const id=url.hash.slice(1)==='about'?'profile':url.hash.slice(1);if(id==='home'||entries.has(id)){event.preventDefault();navigate(id,{keyboard:true});}}
  });
  document.addEventListener('keydown',event=>{
    if(event.key.toLowerCase()==='m'&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.target.closest('input,textarea,select')&& !event.repeat){event.preventDefault();audio.toggle();}
    if(event.key==='Escape'){closeStart();start.focus();}
    if(event.altKey&&event.key==='ArrowLeft'&&trail.canBack){event.preventDefault();history.back();}
    if(event.altKey&&event.key==='ArrowRight'&&trail.canForward){event.preventDefault();history.forward();}
  });
  window.addEventListener('resize',resize);new ResizeObserver(resize).observe(stage);
  const clock=shell.querySelector('.os-clock');const tick=()=>{const date=new Date();clock.dateTime=date.toISOString();clock.textContent=new Intl.DateTimeFormat(ar?'ar-LY':'en-GB',{hour:'2-digit',minute:'2-digit'}).format(date);};
  tick();setInterval(tick,60000);syncTheme();resize();navigate(trail.current,{record:false});document.querySelector('.skip-link').href='#desktop-main';
})();
