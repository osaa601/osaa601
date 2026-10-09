/* The desktop is a progressive enhancement of the complete, indexable website. */
(() => {
  const main = document.querySelector('#main');
  const hero = main?.querySelector('.hero-copy');
  if (!hero || !main.querySelector('#about')) return;
  const root = document.documentElement;
  const ar = root.lang === 'ar';
  const word = (en, arabic) => ar ? arabic : en;
  const labels = {
    profile: word('Profile', 'الملف الشخصي'), services: word('Services', 'الخدمات'),
    work: word('Projects', 'المشاريع'), creative: word('Studio', 'الاستوديو'),
    contact: word('Contact', 'التواصل')
  };
  const symbols = {profile:'OW', services:'SEC', work:'DIR', creative:'PLAY', contact:'@'};
  const originalTheme = document.querySelector('.theme-button');
  const language = document.querySelector('.language-switch');
  const skip = document.querySelector('.skip-link');
  const shell = document.createElement('div');
  shell.className = 'os-shell';
  shell.innerHTML = `
    <img class="os-wallpaper" alt="" width="1200" height="800">
    <div class="os-wallpaper-shade" aria-hidden="true"></div>
    <header class="os-topbar"><span class="os-brand"><span class="os-brand-pixel" aria-hidden="true">✦</span> OSAA601 <span class="os-edition">${word('PERSONAL DESKTOP','سطح المكتب الشخصي')}</span></span>
      <div class="os-top-actions"><button type="button" class="os-view">${word('Website view','عرض الموقع')}</button><a class="os-language"></a><button type="button" class="os-theme"></button></div>
    </header>
    <main id="desktop-main" class="os-stage" aria-label="${word('Personal desktop','سطح المكتب الشخصي')}">
      <nav class="os-icons" aria-label="${word('Desktop applications','تطبيقات سطح المكتب')}"></nav>
      <div class="os-window-layer"></div>
      <div class="os-wallpaper-label" aria-hidden="true"><span>Osaa601</span><span>${word('Security. Stories. New worlds.','أمن. قصص. عوالم جديدة.')}</span></div>
    </main>
    <nav class="os-start-menu" aria-label="${word('Applications','التطبيقات')}" hidden><div class="os-start-heading">Osama Waer <span>Osaa601</span></div></nav>
    <footer class="os-taskbar"><button class="os-start" type="button" aria-expanded="false">✦ ${word('Start','ابدأ')}</button><div class="os-tasks" aria-label="${word('Open windows','النوافذ المفتوحة')}"></div><time class="os-clock"></time></footer>`;
  document.body.append(shell);
  const stage = shell.querySelector('.os-stage');
  const layer = shell.querySelector('.os-window-layer');
  const tasks = shell.querySelector('.os-tasks');
  const start = shell.querySelector('.os-start');
  const startMenu = shell.querySelector('.os-start-menu');
  const wallpaper = shell.querySelector('.os-wallpaper');
  const desktopTheme = shell.querySelector('.os-theme');
  const entries = new Map();
  let z = 5;
  let enhanced = false;
  let positioned = false;
  let caseNode;
  const sources = {profile:[hero,main.querySelector('#about')]};
  for (const id of ['services','work','creative','contact']) sources[id] = [main.querySelector('#'+id)];
  const placements = new Map();
  for (const nodes of Object.values(sources)) for (const node of nodes) {
    const placeholder = document.createComment('desktop content position');
    node.before(placeholder); placements.set(node,placeholder);
  }
  const closeStart = () => {startMenu.hidden=true;start.setAttribute('aria-expanded','false');};
  const focusWindow = entry => {
    entry.window.style.zIndex=String(++z);
    for (const item of entries.values()) {
      const active=item===entry && !item.window.hidden;
      item.window.classList.toggle('os-active',active);
      item.task.setAttribute('aria-pressed',String(active));
    }
  };
  const constrain = entry => {
    if (entry.window.classList.contains('os-maximized')) return;
    const width=entry.window.offsetWidth;
    entry.x=Math.max(8,Math.min(entry.x,Math.max(8,stage.clientWidth-width-8)));
    entry.y=Math.max(8,Math.min(entry.y,Math.max(8,stage.clientHeight-entry.window.offsetHeight-8)));
    entry.window.style.left=entry.x+'px';entry.window.style.top=entry.y+'px';
  };
  const open = (id, keyboard=false) => {
    const entry=entries.get(id);if(!entry)return;
    entry.window.hidden=false;entry.task.hidden=false;focusWindow(entry);constrain(entry);closeStart();
    if (keyboard) entry.title.focus();
  };
  for (const [id,label] of Object.entries(labels)) {
    for (const [container,className] of [[shell.querySelector('.os-icons'),'os-icon'],[startMenu,'os-start-item']]) {
      const button=document.createElement('button');button.type='button';button.className=className;
      const symbol=document.createElement('span');symbol.className='os-app-symbol';symbol.textContent=symbols[id];symbol.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.textContent=label;
      button.append(symbol,text);button.addEventListener('click',event=>open(id,event.detail===0));container.append(button);
    }
    const win=document.createElement('section');win.className='os-window';win.hidden=true;
    win.setAttribute('aria-labelledby','os-title-'+id);
    win.innerHTML=`<div class="os-titlebar"><button type="button" class="os-drag-title" id="os-title-${id}"><span aria-hidden="true">${symbols[id]}</span> ${label}</button><div class="os-window-controls"><button type="button" data-action="minimize" aria-label="${word('Minimize','تصغير')} ${label}">−</button><button type="button" data-action="maximize" aria-label="${word('Maximize','تكبير')} ${label}" aria-pressed="false">□</button><button type="button" data-action="close" aria-label="${word('Close','إغلاق')} ${label}">×</button></div></div><div class="os-content"></div>`;
    const task=document.createElement('button');task.type='button';task.className='os-task';task.hidden=true;task.textContent=label;task.setAttribute('aria-pressed','false');task.setAttribute('aria-controls','os-window-'+id);
    win.id='os-window-'+id;
    const entry={window:win,task,title:win.querySelector('.os-drag-title'),content:win.querySelector('.os-content'),x:Math.max(135,stage.clientWidth*.2),y:36};
    entries.set(id,entry);layer.append(win);tasks.append(task);
    task.addEventListener('click',()=>{if(!win.hidden && win.classList.contains('os-active')){win.hidden=true;task.setAttribute('aria-pressed','false');}else open(id,true);});
    win.addEventListener('pointerdown',()=>focusWindow(entry));
    win.querySelector('.os-window-controls').addEventListener('click',event=>{
      const control=event.target.closest('[data-action]');if(!control)return;
      if(control.dataset.action==='maximize'){
        const maximized=win.classList.toggle('os-maximized');control.setAttribute('aria-pressed',String(maximized));
        control.setAttribute('aria-label',word(maximized?'Restore':'Maximize',maximized?'استعادة':'تكبير')+' '+label);constrain(entry);
      }else{
        win.hidden=true;task.setAttribute('aria-pressed','false');
        if(control.dataset.action==='close')task.hidden=true;
        shell.querySelector('.os-icons .os-icon').focus();
      }
    });
    let drag;
    entry.title.addEventListener('pointerdown',event=>{
      if(event.button!==0 || window.innerWidth<701 || win.classList.contains('os-maximized'))return;
      drag={x:event.clientX,y:event.clientY,left:entry.x,top:entry.y};entry.title.setPointerCapture(event.pointerId);
    });
    entry.title.addEventListener('pointermove',event=>{
      if(!drag)return;entry.x=drag.left+event.clientX-drag.x;entry.y=drag.top+event.clientY-drag.y;constrain(entry);
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])entry.title.addEventListener(type,()=>{drag=null;});
    entry.title.addEventListener('keydown',event=>{
      const direction={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];
      if(!direction || window.innerWidth<701)return;
      event.preventDefault();entry.x+=direction[0];entry.y+=direction[1];constrain(entry);
    });
  }
  const syncTheme=()=>{
    const dark=root.dataset.theme==='dark';
    const art=document.querySelector('#hero-art');
    wallpaper.src=dark?art.dataset.night:art.dataset.day;
    desktopTheme.textContent=dark?word('Light mode','الوضع الفاتح'):word('Dark mode','الوضع الداكن');
    desktopTheme.setAttribute('aria-pressed',String(dark));
  };
  desktopTheme.addEventListener('click',()=>originalTheme.click());
  document.addEventListener('portfolio-theme',syncTheme);
  const desktopLanguage=shell.querySelector('.os-language');desktopLanguage.href=language.href;desktopLanguage.textContent=language.textContent;desktopLanguage.lang=language.lang;desktopLanguage.hreflang=language.hreflang;
  const returnButton=document.createElement('button');returnButton.type='button';returnButton.className='os-return';returnButton.textContent=word('Desktop view','سطح المكتب');
  document.querySelector('.header-controls').append(returnButton);
  const setView = desktop => {
    enhanced=desktop;root.classList.toggle('desktop-enhanced',desktop);shell.hidden=!desktop;returnButton.hidden=desktop;
    if(!desktop){caseNode?.remove();caseNode=null;sources.work[0].hidden=false;}
    for(const [id,nodes] of Object.entries(sources))for(const node of nodes){
      if(desktop)entries.get(id).content.append(node);else placements.get(node).after(node);
    }
    skip.href=desktop?'#desktop-main':'#main';
    if(desktop){
      if(!positioned){let index=0;for(const entry of entries.values()){entry.x=Math.max(135,(stage.clientWidth-700)/2)+index*24;entry.y=28+index*15;index++;}positioned=true;}
      open('profile');requestAnimationFrame(()=>{for(const entry of entries.values())constrain(entry);});
    }
  };
  shell.querySelector('.os-view').addEventListener('click',()=>setView(false));
  returnButton.addEventListener('click',()=>setView(true));
  start.addEventListener('click',()=>{startMenu.hidden=!startMenu.hidden;start.setAttribute('aria-expanded',String(!startMenu.hidden));});
  shell.addEventListener('click',event=>{
    if(!event.target.closest('.os-start-menu,.os-start'))closeStart();
    const anchor=event.target.closest('a');
    if(!anchor)return;
    const href=anchor.getAttribute('href');
    if(/^(mailto:|tel:)/.test(href))return;
    const url=new URL(href,location.href);
    if(url.origin!==location.origin)return;
    const match=url.pathname.match(/\/work\/([^/]+)\/?$/);
    if(match){
      const template=main.querySelector('template[data-case="'+match[1]+'"]');
      if(template){
        event.preventDefault();caseNode?.remove();
        caseNode=document.createElement('div');caseNode.className='os-case-detail';caseNode.append(template.content.cloneNode(true));
        sources.work[0].hidden=true;entries.get('work').content.append(caseNode);entries.get('work').content.scrollTop=0;open('work',true);
      }
    }else if(url.hash){
      const id=url.hash.slice(1);
      if(entries.has(id)){
        event.preventDefault();
        if(id==='work'){caseNode?.remove();caseNode=null;sources.work[0].hidden=false;}
        open(id,true);
      }
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeStart();});
  window.addEventListener('resize',()=>{if(enhanced)for(const entry of entries.values())constrain(entry);});
  const clock=shell.querySelector('.os-clock');
  const tick=()=>{const date=new Date();clock.dateTime=date.toISOString();clock.textContent=new Intl.DateTimeFormat(ar?'ar-LY':'en-GB',{hour:'2-digit',minute:'2-digit'}).format(date);};
  tick();setInterval(tick,60000);syncTheme();setView(true);
  const hash=location.hash.slice(1);if(entries.has(hash))open(hash);
})();
