(() => {
  const root=document.documentElement;
  if(!document.querySelector('#main .hero-copy'))return;
  let audioStorage;try{audioStorage=localStorage;}catch(_){}
  const audio=new window.OsaaAudio.DeskAudio({storage:audioStorage});let audioTheme;
  const quest=new window.OsaaRuneQuest.Engine();
  const session=String(Date.now());
  window.addEventListener('pagehide',()=>audio.destroy(),{once:true});
  const locales=new Map();
  for(const template of document.querySelectorAll('template[data-desktop-language]')){
    if(template.dataset.desktopLanguage===root.lang&&!template.content.querySelector('#main'))template.content.append(document.querySelector('.os-preferences-source').cloneNode(true),document.querySelector('#main').cloneNode(true));
    locales.set(template.dataset.desktopLanguage,template);
  }
  let desktop;
  const changeLanguage=lang=>{
    const template=locales.get(lang);if(!template||root.lang===lang)return;
    const snapshot=desktop.snapshot(),source=template.content.cloneNode(true);
    desktop.dispose();
    document.querySelector('.os-preferences-source').replaceWith(source.querySelector('.os-preferences-source'));
    document.querySelector('#main').replaceWith(source.querySelector('#main'));
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
  const labels={profile:word('Profile','الملف الشخصي'),services:word('Services','الخدمات'),work:word('Projects','المشاريع'),creative:word('Studio','الاستوديو'),contact:word('Contact','التواصل'),links:word('Links','الروابط'),music:word('Music','الموسيقى'),arcade:word('Rune Quest','مغامرة الرون')};
  const disposers=[];
  const listen=(target,type,fn)=>{target.addEventListener(type,fn);disposers.push(()=>target.removeEventListener(type,fn));};
  const originalTheme=document.querySelector('.theme-button');
  const language=document.querySelector('.language-switch');
  const navigationMarkup=()=>`<nav class="os-navigation" aria-label="${word('Window navigation','التنقل في النافذة')}"><button type="button" class="os-nav-button" data-nav="back" aria-label="${word('Back in this window','رجوع في هذه النافذة')}">${icon('back')}</button><button type="button" class="os-nav-button" data-nav="forward" aria-label="${word('Forward in this window','تقدم في هذه النافذة')}">${icon('forward')}</button><button type="button" class="os-nav-button" data-nav="home" aria-label="${word('This window home','الرئيسية لهذه النافذة')}">${icon('home')}</button><div class="os-breadcrumb"></div></nav>`;
  const shell=document.createElement('div');shell.className='os-shell';
  shell.innerHTML=`<img class="os-wallpaper" alt="" width="1200" height="800"><div class="os-wallpaper-shade" aria-hidden="true"></div>
    <header class="os-topbar"><span class="os-brand">${icon('grid')}<span>OSAA601</span><span class="os-edition"></span></span>
      <div class="os-top-actions"><a class="os-language"></a><button type="button" class="os-theme"></button></div></header>
    <main id="desktop-main" class="os-stage" aria-label="${word('Personal desktop','سطح المكتب الشخصي')}"><nav class="os-icons" aria-label="${word('Applications','التطبيقات')}"></nav><div class="os-window-layer"></div><div class="os-wallpaper-label" aria-hidden="true"><span>Osaa601</span><span>${word('Security. Stories. New worlds.','أمن. قصص. عوالم جديدة.')}</span></div></main>
    <nav class="os-start-menu" aria-label="${word('Applications','التطبيقات')}" hidden><div class="os-start-heading">${ar?'أسامة واعر':'Osama Waer'}<span>Osaa601</span></div></nav>
    <footer class="os-taskbar"><button class="os-start" type="button" aria-expanded="false">${icon('grid')}<span>${word('Apps','التطبيقات')}</span></button><div class="os-tasks" aria-label="${word('Open windows','النوافذ المفتوحة')}"></div><div class="os-tray" aria-label="${word('Audio controls','أدوات التحكم بالصوت')}"><button type="button" class="os-music-toggle"></button><button type="button" class="os-audio-toggle" aria-label="${word('Audio settings','إعدادات الصوت')}" aria-expanded="false" aria-controls="os-audio-settings">${icon('volume')}</button><time class="os-clock"></time></div></footer>
    <section id="os-audio-settings" class="os-audio-settings" aria-label="${word('Audio settings','إعدادات الصوت')}" hidden><div class="os-tray-heading"><span>${word('Audio','الصوت')}</span><button type="button" class="os-audio-close" aria-label="${word('Close audio settings','إغلاق إعدادات الصوت')}">${icon('close')}</button></div><button type="button" class="os-tray-player">${icon('music')}<span>${word('Open Music player','فتح مشغل الموسيقى')}</span></button><label class="os-player-label" for="tray-volume">${word('Music volume','مستوى صوت الموسيقى')}<span class="os-tray-volume-label"></span></label><div class="os-tray-volume-row"><button type="button" class="os-music-mute"></button><input id="tray-volume" class="os-tray-volume" type="range" min="0" max="1" step="0.01" value="0.45"></div><button type="button" class="os-sound-toggle"></button></section><span class="os-announcement" role="status" aria-live="polite"></span>`;
  document.body.append(shell);root.classList.add('desktop-enhanced');
  const stage=shell.querySelector('.os-stage'),layer=shell.querySelector('.os-window-layer'),tasks=shell.querySelector('.os-tasks');
  const start=shell.querySelector('.os-start'),startMenu=shell.querySelector('.os-start-menu');
  const announcer=shell.querySelector('.os-announcement');
  const entries=new Map(),screens=new Map();let z=5;let device='desktop';let active='home';
  const sources={profile:[hero,main.querySelector('#about')]};
  for(const id of ['services','work','creative','contact','links'])sources[id]=[main.querySelector('#'+id)];
  const music=document.createElement('section');music.className='os-music-panel';
  music.innerHTML=`<span class="eyebrow">${word('LO-FI RADIO','راديو لوفاي')}</span><div class="os-music-cover" aria-hidden="true">${icon('music')}<div class="os-equalizer"><span></span><span></span><span></span><span></span><span></span></div></div><h2 class="os-music-title"></h2><p class="os-music-mood"></p>
    <label class="os-player-label" for="music-seek">${word('Playback position','موضع التشغيل')}</label><input id="music-seek" class="os-music-seek" type="range" min="0" max="30" step="0.1" value="0"><div class="os-music-time" dir="ltr"><span class="os-music-elapsed">0:00</span><span class="os-music-duration"></span></div>
    <div class="os-music-controls"><button type="button" data-music="previous" aria-label="${word('Previous track','المقطع السابق')}">${icon('previous')}</button><button type="button" class="os-music-play" data-music="play"></button><button type="button" data-music="next" aria-label="${word('Next track','المقطع التالي')}">${icon('next')}</button><button type="button" data-music="mute"></button></div>
    <label class="os-player-label" for="music-volume">${word('Music volume','مستوى صوت الموسيقى')} <span class="os-music-volume-label"></span></label><input id="music-volume" class="os-music-volume" type="range" min="0" max="1" step="0.01" value="0.45">
    <div class="os-music-playlist" aria-label="${word('Playlist','قائمة التشغيل')}"></div><button class="os-music-sounds" type="button" data-music="sounds"></button><p class="os-music-note">${word('Built-in ambient loops. Pick a track and press Play.','مقاطع هادئة مدمجة. اختر مقطعاً واضغط تشغيل.')}</p><p class="os-music-status" role="status" aria-live="polite"></p>`;
  sources.music=[music];
  const arcade=document.createElement('section');arcade.className='rune-quest';sources.arcade=[arcade];
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
    const route=locales.get(root.lang)?.dataset.route||location.pathname||'/';
    const url=route+'#'+screen,state={osaa:session,screen};
    if(record&&location.hash!=='#'+screen)history.pushState(state,'',url);else history.replaceState(state,'',url);
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
    updateAddress(id,record);closeStart();refreshNavigation();announcer.textContent=id==='home'?word('Desktop home','الشاشة الرئيسية'):screens.get(id).label;
  };
  const moveWithin=(entry,step)=>{
    if(step<0&&!entry.trail.canBack||step>0&&!entry.trail.canForward)return;
    entry.scrolls[entry.trail.current]=entry.content.scrollTop;entry.trail.move(step);renderPage(entry);select(entry);refreshNavigation();updateAddress(entry.trail.current,true);announcer.textContent=screens.get(entry.trail.current).label;
  };
  const hideWindow=(entry,closed)=>{
    entry.window.hidden=true;entry.task.setAttribute('aria-pressed','false');if(closed)entry.task.hidden=true;
    const next=[...entries.values()].filter(item=>!item.window.hidden).sort((a,b)=>Number(b.window.style.zIndex)-Number(a.window.style.zIndex))[0];
    if(next){select(next);next.title.focus();updateAddress(next.trail.current,false);}else{active='home';root.classList.add('os-home-view');entry.window.classList.remove('os-active');updateAddress('home',false);shell.querySelector('[data-app="profile"]').focus();}refreshNavigation();
  };
  const registerPage=(entry,id,label,nodes)=>{
    const view=document.createElement('div');view.className='os-view';view.dataset.page=id;view.hidden=id!==entry.id;
    for(const node of nodes)view.append(node);const page={id,label,view,entry};entry.pages.set(id,page);screens.set(id,page);entry.content.append(view);
  };
  const createWindow=(id,label,iconName,nodes)=>{
    const win=document.createElement('section');win.className='os-window';win.hidden=true;win.id='os-window-'+id.replace('/','-');
    const titleId='os-title-'+id.replace('/','-');win.setAttribute('aria-labelledby',titleId);
    win.innerHTML=`<div class="os-titlebar"><button type="button" class="os-drag-title" id="${titleId}">${icon(iconName)}<span></span></button><div class="os-window-controls"><button type="button" data-action="minimize" aria-label="${word('Minimize','تصغير')}">${icon('minimize')}</button><button type="button" data-action="maximize" aria-label="${word('Maximize','تكبير')}" aria-pressed="false">${icon('maximize')}</button><button type="button" data-action="close" aria-label="${word('Close','إغلاق')}">${icon('close')}</button></div></div>${navigationMarkup()}<div class="os-content"></div>`;
    win.querySelector('.os-drag-title span').textContent=label;
    const task=document.createElement('button');task.type='button';task.className='os-task';task.hidden=true;task.innerHTML=icon(iconName)+'<span></span>';task.querySelector('span').textContent=label;
    task.setAttribute('aria-label',label);task.setAttribute('aria-controls',win.id);task.setAttribute('aria-pressed','false');
    const index=entries.size;const sizing=State.bounds(State.deviceForWidth(stage.clientWidth),stage.clientWidth,stage.clientHeight);const entry={id,label,window:win,task,navigation:win.querySelector('.os-navigation'),title:win.querySelector('.os-drag-title'),content:win.querySelector('.os-content'),pages:new Map(),trail:new State.Trail(id),scrolls:{},x:Math.max(8,(stage.clientWidth-sizing.width)/2)+index*22,y:24+index*16};
    entries.set(id,entry);registerPage(entry,id,label,nodes);layer.append(win);tasks.append(task);
    entry.navigation.querySelector('[data-nav="back"]').addEventListener('click',()=>moveWithin(entry,-1));
    entry.navigation.querySelector('[data-nav="forward"]').addEventListener('click',()=>moveWithin(entry,1));
    entry.navigation.querySelector('[data-nav="home"]').addEventListener('click',()=>navigate(id));
    task.addEventListener('click',()=>{if(active===id&&!win.hidden)hideWindow(entry,false);else navigate(entry.trail.current,{keyboard:true});});
    win.addEventListener('pointerdown',()=>{if(active!==id)select(entry);});
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
      button.addEventListener('click',event=>navigate(entries.get(id).trail.current,{keyboard:event.detail===0}));container.append(button);
    }
  }
  for(const template of main.querySelectorAll('template[data-case]')){
    const id='project/'+template.dataset.case;const contents=document.createElement('div');contents.className='os-case-detail';contents.append(template.content.cloneNode(true));
    registerPage(entries.get('work'),id,template.dataset.title,[contents]);
  }
  for(const template of main.querySelectorAll('template[data-service]')){const contents=document.createElement('div');contents.append(template.content.cloneNode(true));registerPage(entries.get('services'),'service/'+template.dataset.service,template.dataset.title,[contents]);}
  const homeItem=document.createElement('button');homeItem.type='button';homeItem.className='os-start-item';homeItem.innerHTML=icon('home')+'<span>'+word('Show desktop','إظهار سطح المكتب')+'</span>';homeItem.addEventListener('click',()=>navigate('home'));startMenu.append(homeItem);
  disposers.push(window.OsaaRuneQuest.mount(arcade,quest,{ar,storage:audioStorage,icon}));
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
  shell.addEventListener('click',event=>{if(event.target.closest('[data-action="close"]'))audio.sfx('close');else if(event.target.closest('[data-app],.project-content a'))audio.sfx('open');else if(event.target.closest('button,a'))audio.sfx('click');});
  const decodeScreen=()=>{
    const hash=location.hash.slice(1);if(hash==='about')return 'profile';if(hash==='home'||screens.has(hash))return hash;
    const initial=main.dataset.initialProject;return screens.has('project/'+initial)?'project/'+initial:State.deviceForWidth(shell.clientWidth)==='mobile'?'home':'profile';
  };
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
  lang.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();queueMicrotask(()=>changeLanguage(lang.lang));});
  shell.querySelector('.os-theme').addEventListener('click',()=>originalTheme.click());listen(document,'portfolio-theme',syncTheme);
  start.addEventListener('click',()=>{startMenu.hidden=!startMenu.hidden;start.setAttribute('aria-expanded',String(!startMenu.hidden));});
  listen(window,'popstate',event=>navigate(event.state?.screen||decodeScreen(),{record:false}));
  shell.addEventListener('click',event=>{
    if(!event.target.closest('.os-start-menu,.os-start'))closeStart();const anchor=event.target.closest('a');if(!anchor||anchor.classList.contains('os-language'))return;
    const href=anchor.getAttribute('href');if(/^(mailto:|tel:)/.test(href)||anchor.target==='_blank')return;
    const url=new URL(href,location.href);if(url.origin!==location.origin)return;const match=url.pathname.match(/\/work\/([^/]+)\/?$/);
    if(match&&screens.has('project/'+match[1])){event.preventDefault();navigate('project/'+match[1],{keyboard:true});}
    else if(url.hash){const id=url.hash.slice(1)==='about'?'profile':url.hash.slice(1);if(id==='home'||screens.has(id)){event.preventDefault();navigate(id,{keyboard:true});}}
  });
  listen(document,'keydown',event=>{
    if(event.key.toLowerCase()==='m'&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.target.closest('input,textarea,select')&& !event.repeat){event.preventDefault();audio.toggle();}
    if(event.key==='Escape'){if(!audioPanel.hidden){closeAudio();audioButton.focus();}else{closeStart();start.focus();}}
    const entry=entries.get(active);
    if(event.altKey&&event.key==='ArrowLeft'&&entry){event.preventDefault();moveWithin(entry,-1);}
    if(event.altKey&&event.key==='ArrowRight'&&entry){event.preventDefault();moveWithin(entry,1);}
    if(active==='arcade'&&!entry.window.hidden&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!event.repeat&&!event.target.closest('input,textarea,select,.os-drag-title')){
      const directions={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
      const move=directions[event.key]||directions[event.key.toLowerCase()];
      if(move&&quest.state.phase==='playing'){event.preventDefault();quest.move(move[0],move[1]);}
      if(event.key.toLowerCase()==='g'&&quest.state.phase==='playing'){event.preventDefault();quest.guard();}
      if(event.key.toLowerCase()==='q'&&quest.state.phase==='playing'){event.preventDefault();quest.pulse();}
    }
  });
  listen(window,'resize',resize);const observer=new ResizeObserver(resize);observer.observe(stage);disposers.push(()=>observer.disconnect());
  const clock=shell.querySelector('.os-clock');const tick=()=>{const date=new Date();clock.dateTime=date.toISOString();clock.textContent=new Intl.DateTimeFormat(ar?'ar-LY':'en-GB',{hour:'2-digit',minute:'2-digit'}).format(date);};
  tick();const clockTimer=setInterval(tick,60000);disposers.push(()=>clearInterval(clockTimer));syncTheme();resize();
  if(snapshot)for(const [id,saved]of snapshot.windows){const entry=entries.get(id);if(!entry)continue;entry.x=saved.x;entry.y=saved.y;entry.trail=saved.trail;entry.scrolls=saved.scrolls;entry.window.hidden=saved.hidden;entry.task.hidden=saved.taskHidden;entry.window.style.zIndex=saved.zIndex;entry.window.classList.toggle('os-maximized',saved.maximized);if(saved.maximized){const button=entry.window.querySelector('[data-action="maximize"]');button.setAttribute('aria-pressed','true');button.innerHTML=icon('restore');button.setAttribute('aria-label',word('Restore','استعادة'));}renderPage(entry);place(entry);z=Math.max(z,Number(saved.zIndex)||0);}
  navigate(snapshot?.screen||decodeScreen(),{record:false});document.querySelector('.skip-link').href='#desktop-main';
  return {snapshot:()=>{for(const entry of entries.values())entry.scrolls[entry.trail.current]=entry.content.scrollTop;return {active,screen:active==='home'?'home':entries.get(active).trail.current,windows:[...entries].map(([id,e])=>[id,{x:e.x,y:e.y,trail:e.trail,scrolls:e.scrolls,hidden:e.window.hidden,taskHidden:e.task.hidden,maximized:e.window.classList.contains('os-maximized'),zIndex:e.window.style.zIndex}])};},dispose:()=>{for(const fn of disposers)fn();shell.remove();}};
  };
  desktop=mount();
})();
