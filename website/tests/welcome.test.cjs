const assert=require('assert/strict');
const {setup,current}=require('./desktop.test.cjs');
(async()=>{
 for(const width of [320,390,768,1920])for(const lang of ['en','ar']){
  const t=setup(width,lang==='ar'?'ar/':''),{q,click}=t;
  assert.equal(t.warnings.length,0);
  assert(q('.os-icons [data-app="profile"]').textContent.includes(lang==='ar'?'ابدأ هنا':'Start here'));
  await click(width<700?'.os-home-guide-link':'.os-icons [data-app="profile"]');
  assert.equal(current(t,'profile'),'profile');
  const welcome=q('[data-page="profile"] .welcome-paths');
  assert.equal(welcome.querySelectorAll('a').length,3);
  for(const slug of ['cybersecurity','networks-systems','video-media']){
   await click('[data-page="profile"] .welcome-path[href="#service/'+slug+'"]');
   assert.equal(current(t,'services'),'service/'+slug);
   assert(q('[data-page="service/'+slug+'"] .scope-cta a').getAttribute('href').startsWith('mailto:osaa@osaa601.com?'));
   assert(!q('#os-window-profile').hidden);
   await click('.os-icons [data-app="profile"]');
  }
  assert.equal(q('[data-page="profile"] .desktop-guide').querySelectorAll('li').length,3);
  await click('[data-page="profile"] .desktop-guide [href="#home"]');
  assert(t.doc.documentElement.classList.contains('os-home-view'));
  q('.os-stage').scrollTop=180;
  await click(width<700?'.os-home-actions [href="#services"]':'.os-hire');assert.equal(current(t,'services'),'services');assert.equal(q('.os-stage').scrollTop,0);
  // The primary mobile action reaches the catalog after viewing a detail.
  await click('#os-window-services [data-nav="home"]');assert.equal(current(t,'services'),'services');
  await click(width<700?'.os-home-actions [href="#work"]':'.os-icons [data-app="work"]');assert.equal(current(t,'work'),'work');
  await click('.os-icons [data-app="profile"]');await click('.os-language');
  assert.equal(q('[data-page="profile"] .welcome-paths').querySelectorAll('a').length,3);
  assert.equal(t.games.length,1);assert.equal(t.warnings.length,0);
  console.log('PASS '+width+'px '+lang+': welcome offers, contextual inquiry routes, Start here, guide/home, mobile actions and locale continuity.');
 }
 if(process.env.FULLSCREEN_PREVIEW){const t=setup(1920,'',process.env.FULLSCREEN_PREVIEW);
 await t.click('[data-page="profile"] .welcome-path[href="#service/cybersecurity"]');assert.equal(current(t,'services'),'service/cybersecurity');
 await t.click('.os-language');assert(t.location.href.startsWith('file:///'));assert.equal(current(t,'services'),'service/cybersecurity');
 console.log('PASS V6.1 standalone preview welcome path and local language history.');}
})().catch(e=>{console.error(e);process.exitCode=1;});
