const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {setup,current}=require('./desktop.test.cjs');
(async()=>{
 for(const width of [390,1920])for(const lang of ['en','ar']){
  const t=setup(width,lang==='ar'?'ar/':''),{q,click}=t;
  assert.equal(t.warnings.length,0);assert.equal(q('.os-atmosphere').getAttribute('aria-hidden'),'true');
  assert.equal(q('.os-clouds').children.length,3);assert.equal(q('.os-sky-stars').children.length,14);assert.equal(q('.os-fireflies').children.length,10);
  assert(!q('.os-shell').classList.contains('os-wallpaper-paused'));await click('.os-settings-toggle');
  await click('.os-motion-toggle');assert(q('.os-shell').classList.contains('os-wallpaper-paused'));assert.equal(t.saved.get('osaa601-wallpaper-motion'),'off');
  const visibilityListeners=t.doc.events.visibilitychange.length;
  await click('.os-language');assert(q('.os-shell').classList.contains('os-wallpaper-paused'));assert.equal(t.doc.events.visibilitychange.length,visibilityListeners);
  await click('.os-motion-toggle');assert(!q('.os-shell').classList.contains('os-wallpaper-paused'));assert.equal(t.saved.get('osaa601-wallpaper-motion'),'on');
  t.doc.hidden=true;t.doc.dispatchEvent({type:'visibilitychange'});assert(q('.os-shell').classList.contains('os-wallpaper-paused'));
  t.doc.hidden=false;t.doc.dispatchEvent({type:'visibilitychange'});assert(!q('.os-shell').classList.contains('os-wallpaper-paused'));
  t.win.dispatchEvent({type:'blur'});assert(q('.os-shell').classList.contains('os-wallpaper-paused'));t.win.dispatchEvent({type:'focus'});assert(!q('.os-shell').classList.contains('os-wallpaper-paused'));
  await click('.os-theme');assert(q('.os-wallpaper').src.includes('night'));await click('.os-theme');assert(q('.os-wallpaper').src.includes('day'));
  await click('.os-hire');assert.equal(current(t,'services'),'services');assert.equal(t.games.length,1);assert.equal(t.warnings.length,0);
  console.log('PASS '+width+'px '+lang+': decorative layers, pause preference, language cleanup, visibility/focus pause, themes and navigation.');
 }
 const stopped=setup(1920,'',null,new Map([['osaa601-wallpaper-motion','off']]));assert(stopped.q('.os-shell').classList.contains('os-wallpaper-paused'));
 const reduced=setup(1920,'',null,null,680,false,true);assert(reduced.q('.os-shell').classList.contains('os-wallpaper-paused'));assert(reduced.q('.os-motion-toggle').disabled);assert.equal(reduced.saved.get('osaa601-wallpaper-motion'),undefined);
 const css=fs.readFileSync(path.join(__dirname,'../assets/premium.css'),'utf8');assert(css.includes('@media(prefers-reduced-motion:reduce){.os-wallpaper,.os-atmosphere *{animation:none!important}'));assert(css.includes('animation-play-state:paused!important'));assert(css.includes('pointer-events:none;contain:layout paint'));
 console.log('PASS stored pause and reduced-motion startup; CSS motion/interaction safeguards.');
 if(process.env.FULLSCREEN_PREVIEW){const t=setup(1920,'',process.env.FULLSCREEN_PREVIEW);await t.click('.os-settings-toggle');await t.click('.os-motion-toggle');assert(t.q('.os-shell').classList.contains('os-wallpaper-paused'));await t.click('.os-language');assert(t.q('.os-shell').classList.contains('os-wallpaper-paused'));console.log('PASS standalone animated wallpaper and pause continuity.');}
})().catch(e=>{console.error(e);process.exitCode=1;});
