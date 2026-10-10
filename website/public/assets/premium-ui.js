(() => {
  window.OsaaPremium={mount(shell,{ar=false,storage}={}){
    const root=shell.querySelector('[data-page="work"]');let filter='all';
    try{const saved=storage?.getItem('osaa601-project-filter');if(['all','professional','academic','experiment'].includes(saved))filter=saved;}catch(_){}
    const apply=()=>{for(const card of root.querySelectorAll('[data-project-kind]'))card.hidden=filter!=='all'&&card.dataset.projectKind!==filter;for(const button of root.querySelectorAll('[data-project-filter]'))button.setAttribute('aria-pressed',String(button.dataset.projectFilter===filter));};
    const click=e=>{const b=e.target.closest('[data-project-filter]');if(!b)return;filter=b.dataset.projectFilter;apply();try{storage?.setItem('osaa601-project-filter',filter);}catch(_){}shell.querySelector('.os-announcement').textContent=ar?'تم تحديث عرض المشاريع':'Project collection updated';};
    root.addEventListener('click',click);apply();return()=>root.removeEventListener('click',click);
  }};
})();
