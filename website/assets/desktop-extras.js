(function(host){
  const seals=['profile','services','work','creative','journal'],moods=['fantasy','blue','purple','starlight'];
  const normalize=text=>String(text||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f\u064b-\u065f]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
  class Archive{
    constructor(storage){this.storage=storage;this.listeners=new Set();this.state={seals:[],favorites:[],wallpaper:'fantasy',victory:false};try{const raw=JSON.parse(storage?.getItem('osaa601-archive')||'null');if(raw){this.state.seals=seals.filter(s=>raw.seals?.includes?.(s));this.state.favorites=Array.isArray(raw.favorites)?raw.favorites.filter(s=>typeof s==='string'&&/^[a-z0-9-]{1,80}$/.test(s)).slice(0,50):[];this.state.victory=raw.victory===true;if(moods.includes(raw.wallpaper)&&this.can(raw.wallpaper))this.state.wallpaper=raw.wallpaper;}}catch(_){}}
    can(mood){return mood==='fantasy'||mood==='blue'&&this.state.seals.length>=3||mood==='purple'&&this.state.seals.length>=5||mood==='starlight'&&this.state.victory;}
    subscribe(fn){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
    save(){try{this.storage?.setItem('osaa601-archive',JSON.stringify(this.state));}catch(_){}for(const fn of this.listeners)fn(this.state);}
    collect(id){if(!seals.includes(id)||this.state.seals.includes(id))return false;this.state.seals.push(id);this.save();return true;}
    bookmark(id){if(!/^[a-z0-9-]{1,80}$/.test(id))return;this.state.favorites=this.state.favorites.includes(id)?this.state.favorites.filter(s=>s!==id):[...this.state.favorites,id];this.save();}
    wallpaper(id){if(!this.can(id))return false;this.state.wallpaper=id;this.save();return true;}
    finish(){if(!this.state.victory){this.state.victory=true;this.save();}}
  }
  const api={Archive,normalize,seals};if(typeof module!=='undefined'&&module.exports)module.exports=api;else host.OsaaDesktopExtras=api;
})(typeof window==='undefined'?{}:window);

if(typeof window!=='undefined')(() => {
  window.OsaaDesktopExtras.mount=(shell,{archive,screens,entries,navigate,settings,ar=false,icon,arrange,restore,reset,hasSession})=>{
    const word=(en,a)=>ar?a:en;
    settings.innerHTML=`<div class="section-heading"><span class="eyebrow">${word('MAKE YOURSELF AT HOME','اجعل المكان مناسباً لك')}</span><h2>${word('Your desktop. Your way.','سطح مكتبك، بطريقتك.')}</h2><p>${word('Arrange your windows, choose a mood, and keep the things you discover.','رتب نوافذك، واختر أجواءك، واحتفظ بما تكتشفه.')}</p></div><section class="desktop-tools"><h3>${word('Windows','النوافذ')}</h3><div><button type="button" data-desktop-action="arrange">${icon('layout')} ${word('Arrange open windows','رتب النوافذ المفتوحة')}</button><button type="button" data-desktop-action="restore" ${hasSession?'':'disabled'}>${icon('restore')} ${word('Restore last session','استعد الجلسة السابقة')}</button><button type="button" data-desktop-action="reset">${icon('home')} ${word('Reset desktop','أعد ضبط سطح المكتب')}</button></div><p>${word('Drag a corner to resize. The window layout menu also has size and move buttons. Drag to a screen edge to snap, or use the menu. Positions are remembered on this device.','اسحب زاوية لتغيير الحجم. توفر قائمة ترتيب النافذة أزراراً للحجم والتحريك أيضاً. اسحب إلى حافة الشاشة للمحاذاة أو استخدم القائمة. تُحفظ المواضع على هذا الجهاز.')}</p></section><section class="archive-progress"><h3>${word('The archive trail','مسار الأرشيف')}</h3><p class="archive-count"></p><div class="archive-badges"></div><p>${word('Find the small archive seal in Profile, Services, Projects, Studio, and Journal. Three seals unlock Royal Blue; all five unlock Moonlit Purple. Finish Starfall Vale for Starlight.','ابحث عن ختم الأرشيف الصغير في الملف الشخصي والخدمات والمشاريع والاستوديو واليوميات. تفتح ثلاثة أختام الخلفية الزرقاء الملكية، وتفتح الأختام الخمسة البنفسجي القمري. أكمل ستارفول ڤيل لفتح ضوء النجوم.')}</p></section><section class="desktop-wallpapers"><h3>${word('Wallpaper mood','أجواء الخلفية')}</h3><div class="wallpaper-grid"></div></section>`;
    const search=document.createElement('section');search.className='os-search-overlay';search.hidden=true;search.setAttribute('role','dialog');search.setAttribute('aria-modal','true');search.setAttribute('aria-labelledby','os-search-title');
    search.innerHTML=`<div class="os-search-dialog"><header><h2 id="os-search-title">${word('Find your way','اعثر على طريقك')}</h2><button type="button" class="os-search-close" aria-label="${word('Close search','أغلق البحث')}">${icon('close')}</button></header><label for="os-search-input">${word('Search apps, projects, services, and journal notes','ابحث في التطبيقات والمشاريع والخدمات واليوميات')}</label><div class="os-search-field">${icon('search')}<input id="os-search-input" type="search" autocomplete="off" placeholder="${word('Try cybersecurity, editing, or a project…','جرّب الأمن السيبراني أو المونتاج أو مشروعاً…')}"></div><div class="os-search-results"></div><p class="os-search-empty" hidden>${word('Nothing found. Try another word.','لا توجد نتائج. جرّب كلمة أخرى.')}</p><footer>${word('↑ ↓ Choose · Enter Open · Esc Close · Ctrl/⌘ K Search','↑ ↓ اختيار · Enter فتح · Esc إغلاق · Ctrl/⌘ K بحث')}</footer></div>`;shell.append(search);
    const input=search.querySelector('input'),results=search.querySelector('.os-search-results');let chosen=0,current=[],filter='all';
    const updateSearch=()=>{
      const query=window.OsaaDesktopExtras.normalize(input.value),tokens=query.split(' ').filter(Boolean);
      current=[...screens.values()].filter(p=>{const text=window.OsaaDesktopExtras.normalize(p.label+' '+p.view.textContent);return !tokens.length?p.id===p.entry.id:tokens.every(t=>text.includes(t));}).sort((a,b)=>{const score=p=>(window.OsaaDesktopExtras.normalize(p.label).includes(query)?10:0)+(p.id===p.entry.id?2:0);return score(b)-score(a);}).slice(0,30);
      chosen=Math.max(0,Math.min(chosen,current.length-1));results.replaceChildren();
      for(const [index,page]of current.entries()){const button=document.createElement('button');button.type='button';button.dataset.result=String(index);button.setAttribute('aria-pressed',String(index===chosen));button.innerHTML=icon(page.entry.id)+'<span><b></b><small></small></span>'+icon('forward');button.querySelector('b').textContent=page.label;button.querySelector('small').textContent=page.id===page.entry.id?word('Application','تطبيق'):page.entry.label;button.addEventListener('click',()=>{close();navigate(page.id,{keyboard:true});});results.append(button);}
      search.querySelector('.os-search-empty').hidden=current.length>0;
    };
    const launcher=shell.querySelector('.os-search-toggle');
    const open=()=>{search.hidden=false;launcher.setAttribute('aria-expanded','true');input.value='';chosen=0;updateSearch();input.focus();};
    const close=()=>{search.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();};
    launcher.addEventListener('click',open);search.querySelector('.os-search-close').addEventListener('click',close);search.addEventListener('click',e=>{if(e.target===search)close();});input.addEventListener('input',()=>{chosen=0;updateSearch();});
    const handled=e=>{e.preventDefault();e.osHandled=true;e.stopImmediatePropagation?.();};
    const keys=e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){handled(e);search.hidden?open():close();return;}
      if(search.hidden)return;
      if(e.key==='Escape'){handled(e);close();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){handled(e);chosen=Math.max(0,Math.min(current.length-1,chosen+(e.key==='ArrowDown'?1:-1)));updateSearch();}else if(e.key==='Enter'&&current[chosen]){handled(e);const id=current[chosen].id;close();navigate(id,{keyboard:true});}else if(e.key==='Tab'){const controls=[...search.querySelectorAll('button,input')].filter(b=>!b.hidden&&!b.disabled);if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){handled(e);last.focus();}else if(!e.shiftKey&&document.activeElement===last){handled(e);first.focus();}}
    };
    document.addEventListener('keydown',keys);
    shell.querySelector('.os-settings-toggle').addEventListener('click',()=>navigate('settings',{keyboard:true}));
    const journal=entries.get('journal').pages.get('journal').view;
    const filterJournal=()=>{let count=0;for(const card of journal.querySelectorAll('.journal-card')){const show=filter==='all'||filter===card.dataset.category||filter==='saved'&&archive.state.favorites.includes(card.dataset.note);card.hidden=!show;if(show)count++;}journal.querySelector('.journal-empty').hidden=count>0;journal.querySelectorAll('[data-journal-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.journalFilter===filter)));};
    for(const id of window.OsaaDesktopExtras.seals){const page=entries.get(id)?.pages.get(id);if(!page)continue;const footer=document.createElement('div');footer.className='archive-discovery';footer.innerHTML=`<span>${word('A small discovery, if you look closely.','اكتشاف صغير لمن يتأمل.')}</span><button type="button" data-collect="${id}">${icon('star')}<span></span></button>`;page.view.append(footer);}
    const click=e=>{
      const seal=e.target.closest('[data-collect]');if(seal){const found=archive.collect(seal.dataset.collect);if(found)shell.querySelector('.os-announcement').textContent=word('Archive seal found. '+archive.state.seals.length+' of 5.','عثرت على ختم الأرشيف. '+archive.state.seals.length+' من 5.');}
      const bookmark=e.target.closest('[data-bookmark]');if(bookmark)archive.bookmark(bookmark.dataset.bookmark);
      const category=e.target.closest('[data-journal-filter]');if(category){filter=category.dataset.journalFilter;filterJournal();}
      const mood=e.target.closest('[data-wallpaper]');if(mood&&!mood.disabled)archive.wallpaper(mood.dataset.wallpaper);
      const action=e.target.closest('[data-desktop-action]')?.dataset.desktopAction;if(action==='arrange')arrange();else if(action==='restore')restore();else if(action==='reset')reset();
    };
    shell.addEventListener('click',click);
    const unsubscribe=archive.subscribe(state=>{
      shell.dataset.wallpaper=state.wallpaper;
      for(const button of shell.querySelectorAll('[data-collect]')){const found=state.seals.includes(button.dataset.collect);button.disabled=found;button.querySelector('span').textContent=found?word('Seal collected','الختم محفوظ'):word('Collect archive seal','اجمع ختم الأرشيف');}
      for(const button of shell.querySelectorAll('[data-bookmark]')){const saved=state.favorites.includes(button.dataset.bookmark);button.setAttribute('aria-pressed',String(saved));button.querySelector('span').textContent=saved?word('Bookmarked','محفوظة'):word('Bookmark','حفظ');}
      settings.querySelector('.archive-count').textContent=word(state.seals.length+' / 5 seals discovered · '+state.favorites.length+' notes bookmarked',state.seals.length+' / 5 أختام مكتشفة · '+state.favorites.length+' ملاحظات محفوظة');
      const badges=settings.querySelector('.archive-badges');badges.replaceChildren();for(const [title,earned]of [[word('Explorer','المستكشف'),state.seals.length>=3],[word('Archivist','أمين الأرشيف'),state.seals.length>=5],[word('Valley guardian','حارس الوادي'),state.victory]]){const badge=document.createElement('span');badge.dataset.earned=String(earned);badge.textContent=(earned?'✦ ':'◇ ')+title;badges.append(badge);}
      const moods=settings.querySelector('.wallpaper-grid');moods.replaceChildren();for(const [id,title,locked]of [['fantasy',word('Fantasy archive','أرشيف الخيال'),''],['blue',word('Royal Blue','الأزرق الملكي'),word('Find 3 seals','اكتشف 3 أختام')],['purple',word('Moonlit Purple','البنفسجي القمري'),word('Find all 5 seals','اكتشف الأختام الخمسة')],['starlight',word('Starlight','ضوء النجوم'),word('Finish Starfall Vale','أكمل ستارفول ڤيل')]]){const button=document.createElement('button');button.type='button';button.dataset.wallpaper=id;button.disabled=!archive.can(id);button.setAttribute('aria-pressed',String(state.wallpaper===id));button.innerHTML='<span class="wallpaper-swatch"></span><b></b><small></small>';button.querySelector('b').textContent=title;button.querySelector('small').textContent=button.disabled?locked:word('Available','متاحة');moods.append(button);}filterJournal();
    });
    return()=>{unsubscribe();document.removeEventListener('keydown',keys);shell.removeEventListener('click',click);search.remove();};
  };
})();
