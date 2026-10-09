(() => {
  const root=document.documentElement;
  const toggle=document.querySelector('.theme-button');
  const art=document.querySelector('#hero-art');
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const update=theme=>{
    root.dataset.theme=theme;const dark=theme==='dark';
    if(toggle){toggle.setAttribute('aria-pressed',String(dark));const label=dark?toggle.dataset.light:toggle.dataset.dark;toggle.querySelector('[data-theme-label]').textContent=label;toggle.setAttribute('aria-label',label);}
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?'#0b1027':'#f2f3fc';if(art)art.src=dark?art.dataset.night:art.dataset.day;
    document.dispatchEvent(new CustomEvent('portfolio-theme',{detail:theme}));
  };
  update(root.dataset.theme);
  toggle?.addEventListener('click',()=>{const theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('osaa601-theme',theme);}catch(_){}update(theme);});
  media.addEventListener('change',event=>{let saved;try{saved=localStorage.getItem('osaa601-theme');}catch(_){}if(saved!=='light'&&saved!=='dark')update(event.matches?'dark':'light');});
  document.addEventListener('click',async event=>{
    const copy=event.target.closest('[data-copy-email]');if(!copy)return;const status=copy.closest('.email-row').querySelector('.copy-status');
    try{await navigator.clipboard.writeText(copy.dataset.copyEmail);status.textContent=copy.dataset.success;}catch(_){status.textContent=copy.dataset.fallback+copy.dataset.copyEmail;}
  });
})();
