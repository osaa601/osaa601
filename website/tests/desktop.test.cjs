const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {Element,parse,setWidth}=require('./dom-fixture.cjs');
const assets=path.join(__dirname,'../assets'),publicDir=path.join(__dirname,'../public');
class Param{setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}}
class AudioNode{constructor(){this.frequency=new Param();this.gain=new Param();}connect(){}disconnect(){}start(){}stop(){}}
class AudioContext{constructor(){this.currentTime=0;this.destination={};this.sampleRate=8000;this.state='suspended';}async resume(){this.state='running';}async close(){this.state='closed';}createGain(){return new AudioNode();}createOscillator(){return new AudioNode();}createBufferSource(){return new AudioNode();}createBiquadFilter(){return new AudioNode();}createBuffer(c,n){return{getChannelData:()=>new Float32Array(n)};}}
function setup(width=1280,route='',inlineFile){
 setWidth(width);const html=fs.readFileSync(inlineFile||path.join(publicDir,route,'index.html'),'utf8');
 const doc=parse(html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,''));doc.createElement=tag=>new Element(tag);doc.getElementById=id=>doc.querySelector('#'+id);doc.documentElement=doc.querySelector('html');doc.body=doc.querySelector('body');
 const win=new Element('window'),microtasks=[],timers=new Map(),audio=[],games=[],saved=new Map();let serial=0;
 const location={href:inlineFile?'file:///test/portfolio.html':'https://osaa601.com/'+route,origin:inlineFile?'null':'https://osaa601.com',hash:''};
 const history={states:[],index:-1,setURL(url){const next=new URL(url,location.href);location.href=next.href;location.hash=next.hash;location.pathname=next.pathname;},replaceState(state,unused,url){if(this.index<0)this.index=0;this.states[this.index]=state;this.setURL(url);},pushState(state,unused,url){this.states=this.states.slice(0,this.index+1);this.states.push(state);this.index++;this.setURL(url);},back(){if(this.index>0){const state=this.states[--this.index];location.hash='#'+state.screen;win.dispatchEvent({type:'popstate',state});}},forward(){if(this.index<this.states.length-1){const state=this.states[++this.index];location.hash='#'+state.screen;win.dispatchEvent({type:'popstate',state});}}};
 Object.assign(win,{location,history,matchMedia:()=>({matches:false,addEventListener(){}}),AudioContext,setInterval:fn=>{const id=++serial;timers.set(id,fn);return id;},clearInterval:id=>timers.delete(id)});
 const context={window:win,document:doc,location,history,URL,Date,Intl,Map,Set,console,localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)},setInterval:()=>1,clearInterval(){},queueMicrotask:fn=>microtasks.push(fn),navigator:{clipboard:{writeText:async()=>{}}},CustomEvent:class{constructor(type,data){this.type=type;Object.assign(this,data);}},ResizeObserver:class{observe(){}disconnect(){}}};
 const instrument=()=>{const Audio=win.OsaaAudio.DeskAudio;win.OsaaAudio.DeskAudio=class extends Audio{constructor(o){super(o);audio.push(this);}};if(win.OsaaRuneQuest){const Engine=win.OsaaRuneQuest.Engine;win.OsaaRuneQuest.Engine=class extends Engine{constructor(){super();games.push(this);}};}};
 if(inlineFile){for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(match[1].includes('application/ld+json'))continue;if(match[2].includes('const locales=new Map'))instrument();vm.runInNewContext(match[2],context);}}
 else{for(const file of ['theme-init.js','site.js','desktop-state.js','audio.js','rune-engine.js','rune-game.js','desktop.js']){if(file==='desktop.js')instrument();vm.runInNewContext(fs.readFileSync(path.join(assets,file),'utf8'),context,{filename:file});}}
 const q=selector=>{const el=doc.querySelector(selector);assert(el,selector);return el;};const settle=async()=>{await Promise.resolve();await Promise.resolve();while(microtasks.length)microtasks.shift()();};const click=async selector=>{q(selector).click();await settle();};
 return {doc,win,q,click,settle,audio,games,timers,location};
}
const current=(test,app)=>test.q('#os-window-'+app).querySelectorAll('.os-view').find(view=>!view.hidden).dataset.page;
(async()=>{
 for(const width of [320,768,1024,1280])for(const lang of ['en','ar']){
  const t=setup(width,lang==='ar'?'ar/':''),{q,click}=t;
  assert.equal(t.doc.querySelectorAll('.os-window').length,8);assert.equal(t.audio[0].context,null,'No autoplay');
  await click('.os-icons [data-app="work"]');const work=q('#os-window-work');
  await click('.os-icons [data-app="services"]');const services=q('#os-window-services');
  await click('[href="#service/cybersecurity"]');assert.equal(current(t,'services'),'service/cybersecurity');
  const projectLinks=q('[data-page="work"]').querySelectorAll('.project-content h3 a');projectLinks[1].click();await t.settle();assert.equal(current(t,'work'),'project/potstation');assert.equal(t.doc.querySelectorAll('.os-window').length,8,'Project stays in the Projects window');assert(!services.hidden&&!work.hidden);
  const serviceVisible=services.querySelectorAll('.os-view').find(v=>!v.hidden);const servicesPosition={left:services.style.left,top:services.style.top};
  await click('#os-window-work [data-nav="back"]');assert.equal(current(t,'work'),'work');assert(!services.hidden&&!work.hidden,'Back cannot hide either open window');assert.equal(current(t,'services'),'service/cybersecurity');assert.equal(serviceVisible.hidden,false);assert.deepEqual({left:services.style.left,top:services.style.top},servicesPosition);
  assert(q('#os-window-work [data-nav="back"]').disabled);await click('#os-window-work [data-nav="forward"]');assert.equal(current(t,'work'),'project/potstation');
  await click('#os-window-services [data-nav="back"]');assert.equal(current(t,'services'),'services');assert.equal(current(t,'work'),'project/potstation');assert(!work.hidden&&!services.hidden);
  await click('#os-window-services [data-nav="forward"]');assert.equal(current(t,'services'),'service/cybersecurity');await click('#os-window-work [data-nav="home"]');assert.equal(current(t,'work'),'work');assert(!services.hidden,'Home is local to this window');
  for(const anchor of q('[data-page="services"]').querySelectorAll('.service-category')){anchor.click();await t.settle();assert.equal(current(t,'services'),anchor.getAttribute('href').slice(1));const page=services.querySelectorAll('.os-view').find(v=>!v.hidden);assert(page.querySelectorAll('.service-offer').length>=5);assert(page.querySelector('a[href^="mailto:"]')||page.querySelector('.button.primary'));await click('#os-window-services [data-nav="home"]');}
  assert.equal(q('[data-page="services"]').querySelectorAll('.service-category').length,7);
  const title=q('#os-window-work .os-drag-title'),beforeDrag=work.style.top;
  title.dispatchEvent({type:'pointerdown',button:0,pointerId:1,clientX:80,clientY:80,bubbles:true,preventDefault(){}});title.dispatchEvent({type:'pointermove',pointerId:1,clientX:80,clientY:64});title.dispatchEvent({type:'pointerup',pointerId:1});assert.notEqual(work.style.top,beforeDrag,'Windows remain draggable');
  await click('#os-window-work [data-action="maximize"]');assert(work.classList.contains('os-maximized'));const maximizedTop=work.style.top;title.dispatchEvent({type:'pointerdown',button:0,pointerId:2,clientX:80,clientY:80,preventDefault(){}});title.dispatchEvent({type:'pointermove',pointerId:2,clientX:80,clientY:150});assert.equal(work.style.top,maximizedTop,'Maximized windows ignore dragging');
  await click('.os-icons [data-app="arcade"]');await click('[data-quest="start"]');const game=t.games[0];const turn=game.state.turn;await click('[data-quest="guard"]');assert.equal(game.state.turn,turn+1);
  const gameVersion=JSON.stringify(game.state);await click('.os-music-toggle');const audio=t.audio[0];audio.context.currentTime=6;for(const fn of t.timers.values())fn();audio.setVolume(.37);audio.toggleMute();audio.toggleSounds();
  const audioVersion=audio.version;for(let n=0;n<6;n++){await click('.os-language');assert.equal(t.audio.length,1);assert.equal(t.games.length,1);assert.equal(audio.version,audioVersion);assert(audio.playing);assert.equal(audio.position,6);assert.equal(audio.volume,.37);assert(audio.muted&&!audio.sounds);assert.equal(audio.listeners.size,1);assert.equal(game.listeners.size,1);assert.equal(JSON.stringify(game.state),gameVersion);assert.equal(t.doc.querySelectorAll('.os-window').length,8);assert.equal(t.doc.events.keydown.length,1);}
  assert.equal(current(t,'services'),'services');assert.equal(current(t,'work'),'work');assert(q('.os-audio-toggle').closest('.os-taskbar'));
  assert(q('#os-window-work').classList.contains('os-maximized'),'Language preserves maximized state');await click('#os-window-work [data-action="maximize"]');assert(!q('#os-window-work').classList.contains('os-maximized'));
  await click('#os-window-arcade [data-action="minimize"]');const pausedTurn=game.state.turn;t.doc.dispatchEvent({type:'keydown',key:'g',target:q('.os-start'),preventDefault(){}});assert.equal(game.state.turn,pausedTurn,'A minimized game ignores game keys');
  const arcadeTask=t.doc.querySelectorAll('.os-task').find(task=>task.getAttribute('aria-controls')==='os-window-arcade');arcadeTask.click();await t.settle();assert(!q('#os-window-arcade').hidden);t.doc.dispatchEvent({type:'keydown',key:'g',target:q('[data-quest="guard"]'),preventDefault(){}});assert.equal(game.state.turn,pausedTurn+1);
  await click('#os-window-work [data-action="close"]');assert(q('#os-window-work').hidden);assert(!q('#os-window-services').hidden,'Closing Projects leaves Services open');
  await click('.os-music-toggle');assert(!audio.playing);t.win.dispatchEvent({type:'pagehide'});assert.equal(audio.context.state,'closed');
  console.log('PASS '+width+'px '+lang+': local histories, same-window projects/services, all service detail pages, audio/game continuity, and minimized-game input.');
 }
 for(const route of ['work/potstation/','ar/work/isms/']){const t=setup(1280,route);assert(current(t,'work').startsWith('project/'));await t.click('#os-window-work [data-nav="back"]');assert.equal(current(t,'work'),'work');console.log('PASS direct project route '+route);}
 if(process.env.FULLSCREEN_PREVIEW){const t=setup(1280,'',process.env.FULLSCREEN_PREVIEW);await t.click('.os-icons [data-app="work"]');t.q('.project-content h3 a').click();await t.settle();assert(current(t,'work').startsWith('project/'));await t.click('.os-language');assert(t.location.href.startsWith('file:///'));assert(current(t,'work').startsWith('project/'));console.log('PASS standalone local-file preview.');}
})().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={setup,current};
