(function(host){
  const W=32,H=24,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function map(kind){
    const a=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||y===0||x===W-1||y===H-1?'#':'.'));
    const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)a[j][i]=c;};
    if(kind==='village'){
      rect(1,12,30,2,':');rect(12,1,2,22,':');rect(3,4,5,4,'h');rect(20,4,6,4,'h');rect(4,17,4,3,'h');
      rect(21,16,7,5,'~');rect(23,15,2,7,':');rect(2,2,5,1,'t');rect(18,2,9,1,'t');rect(2,9,3,2,'t');
    }else if(kind==='forest'){
      rect(1,12,30,2,':');rect(16,1,2,21,':');rect(3,3,6,5,'t');rect(23,3,6,4,'t');rect(3,17,6,4,'t');rect(22,18,7,3,'t');
      rect(12,5,3,4,'~');rect(23,10,4,3,'~');rect(10,19,3,2,'t');rect(18,8,2,2,'t');
    }else{
      for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)a[y][x]='s';
      rect(2,2,4,7,'#');rect(26,2,4,7,'#');rect(2,17,5,5,'#');rect(25,17,5,5,'#');
      rect(8,12,5,1,'#');rect(20,12,4,1,'#');rect(8,5,1,3,'#');rect(23,5,1,3,'#');rect(13,3,7,2,':');
    }
    return a.map(r=>r.join(''));
  }
  const maps={village:map('village'),forest:map('forest'),temple:map('temple')};
  const portals={village:[{x:30,y:12,to:'forest',at:[2,12]}],forest:[{x:1,y:12,to:'village',at:[29,12]},{x:16,y:1,to:'temple',at:[16,21],key:true}],temple:[{x:16,y:22,to:'forest',at:[16,2]}]};
  const npcs=[{id:'elder',x:12,y:10},{id:'healer',x:8,y:13},{id:'smith',x:21,y:12}];
  const treasures=[{id:'village-cache',area:'village',x:10,y:19},{id:'forest-key',area:'forest',x:27,y:8},{id:'temple-heart',area:'temple',x:5,y:12}];
  const enemy=(id,type,x,y)=>({id,type,x,y,hp:type==='boss'?24:type==='wisp'?3:4,maxHp:type==='boss'?24:type==='wisp'?3:4,cooldown:1,windup:0,invulnerable:0});
  function enemies(){return {village:[],forest:[enemy('f1','slime',11,12),enemy('f2','slime',21,8),enemy('f3','slime',26,8),enemy('f4','wisp',27,15),enemy('f5','slime',16,17)],temple:[enemy('t1','wisp',10,16),enemy('t2','slime',23,16),enemy('t3','slime',22,9),enemy('t4','wisp',10,9),enemy('warden','boss',16,7)]};}
  function initial(){return {version:1,phase:'intro',area:'village',time:0,player:{x:12,y:14,hp:8,maxHp:8,coins:0,xp:0,blade:1,face:[0,-1],stamina:2,invulnerable:0,attack:0,cooldown:0,dash:0,dashVector:[0,-1]},flags:{talked:false,key:false,seal:false},opened:[],enemies:enemies(),projectiles:[],pickups:[],effects:[],dialog:null,message:'welcome'};}
  class Engine{
    constructor({storage}={}){this.listeners=new Set();this.storage=storage;this.state=initial();this.paused=false;this.soundId=0;this.sound='click';this.saveClock=0;this.saveStatus='local';try{const raw=storage?.getItem('osaa601-starfall-save');if(raw)this.load(JSON.parse(raw));}catch(_){this.saveStatus='unavailable';}}
    subscribe(fn){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
    emit(){for(const fn of this.listeners)fn(this.state);}
    signal(kind){this.sound=kind;this.soundId++;}
    start(){this.state=initial();this.state.phase='playing';this.state.message='explore';this.save();this.emit();}
    tile(x,y,area=this.state.area){return maps[area]?.[Math.floor(y)]?.[Math.floor(x)]||'#';}
    solid(x,y,area=this.state.area){return '#th~'.includes(this.tile(x,y,area));}
    valid(x,y,r=.24,area=this.state.area){return ![[x-r,y-r],[x+r,y-r],[x-r,y+r],[x+r,y+r]].some(([x,y])=>this.solid(x,y,area));}
    moveEntity(e,dx,dy,r=.24){if(this.valid(e.x+dx,e.y,r))e.x+=dx;if(this.valid(e.x,e.y+dy,r))e.y+=dy;}
    attack(){const s=this.state,p=s.player;if(s.phase!=='playing'||p.cooldown>0)return false;p.attack=.18;p.cooldown=.3;s.message='sword';this.signal('click');
      for(const e of s.enemies[s.area]){const dx=e.x-p.x,dy=e.y-p.y,d=distance(e,p);if(e.hp>0&&e.invulnerable<=0&&d<1.8&&(d<.7||(dx*p.face[0]+dy*p.face[1])/d>-.05)){e.hp-=p.blade;e.invulnerable=.27;if(e.type!=='boss'){e.windup=0;e.cooldown=.5;}this.effect(e.x,e.y,'spark');if(e.hp<=0)this.defeat(e);}}
      this.emit();return true;}
    defeat(e){const s=this.state;s.player.coins+=e.type==='boss'?15:3;s.player.xp+=e.type==='boss'?50:10;s.message=e.type==='boss'?'boss-defeated':'enemy-defeated';this.effect(e.x,e.y,'burst');if(e.type==='boss')s.projectiles=[];else if(s.player.xp%20===0)s.pickups.push({area:s.area,x:e.x,y:e.y,type:'heart'});this.save();}
    effect(x,y,type){this.state.effects.push({x,y,type,ttl:.35});}
    dash(){const p=this.state.player;if(this.state.phase!=='playing'||p.stamina<1||p.dash>0)return false;p.stamina-=1;p.dash=.16;p.dashVector=[...p.face];p.invulnerable=Math.max(p.invulnerable,.22);this.signal('open');this.emit();return true;}
    damage(amount){const s=this.state,p=s.player;if(s.phase!=='playing'||p.invulnerable>0)return false;p.hp=Math.max(0,p.hp-amount);p.invulnerable=1.1;s.message='hurt';this.signal('close');this.effect(p.x,p.y,'hurt');if(p.hp===0){s.phase='lost';s.projectiles=[];this.save();}return true;}
    dialog(id){this.state.phase='dialog';this.state.dialog=id;this.state.message=id;this.save();this.emit();}
    closeDialog(){if(this.state.phase!=='dialog')return;this.state.phase=this.state.dialog==='ending'?'won':'playing';this.state.dialog=null;this.save();this.emit();}
    interact(){const s=this.state,p=s.player;if(s.phase==='dialog'){this.closeDialog();return true;}if(s.phase!=='playing')return false;
      if(s.area==='village'){const n=npcs.find(n=>distance(n,p)<1.6);if(n){if(n.id==='elder'){s.flags.talked=true;this.dialog(s.flags.seal?'ending':s.flags.key?'elder-key':'elder');}else if(n.id==='healer'){p.hp=p.maxHp;this.dialog('healer');}else if(p.blade===2)this.dialog('smith-done');else if(p.coins>=10){p.coins-=10;p.blade=2;p.maxHp+=2;p.hp=p.maxHp;this.dialog('smith-upgrade');}else this.dialog('smith');return true;}}
      const chest=treasures.find(c=>c.area===s.area&&!s.opened.includes(c.id)&&distance(c,p)<1.6);if(chest){if(chest.id==='forest-key'&&s.enemies.forest.some(e=>e.hp>0&&distance(e,chest)<4)){this.dialog('guarded');return true;}s.opened.push(chest.id);if(chest.id==='forest-key')s.flags.key=true;else if(chest.id==='temple-heart'){p.maxHp+=2;p.hp=p.maxHp;}else p.coins+=5;this.dialog(chest.id);return true;}
      if(s.area==='temple'&&distance(p,{x:16,y:4})<1.6&&!s.flags.seal){if(s.enemies.temple.some(e=>e.type==='boss'&&e.hp>0))this.dialog('seal-locked');else{s.flags.seal=true;this.dialog('seal');}return true;}
      const gate=portals[s.area].find(g=>distance(g,p)<1.6);if(gate){if(gate.key&&!s.flags.key){this.dialog('gate-locked');return true;}s.area=gate.to;[p.x,p.y]=gate.at;p.invulnerable=1;p.attack=0;p.dash=0;s.projectiles=[];s.message='entered';this.save();this.emit();return true;}
      s.message='nothing';this.emit();return false;
    }
    revive(){if(this.state.phase!=='lost')return;const s=this.state;s.area='village';Object.assign(s.player,{x:8,y:14,hp:s.player.maxHp,invulnerable:1,dash:0,attack:0,stamina:2});s.phase='playing';s.message='revived';s.projectiles=[];this.save();this.emit();}
    shoot(e,dx,dy,speed=4){const length=Math.hypot(dx,dy)||1;this.state.projectiles.push({x:e.x,y:e.y,vx:dx/length*speed,vy:dy/length*speed,ttl:4,boss:e.type==='boss'});}
    step(dt,input={}){
      const s=this.state;if(s.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);s.time+=dt;const p=s.player;
      for(const k of ['invulnerable','attack','cooldown','dash'])p[k]=Math.max(0,p[k]-dt);p.stamina=Math.min(2,p.stamina+dt*.8);
      let dx=clamp(Number(input.x)||0,-1,1),dy=clamp(Number(input.y)||0,-1,1),len=Math.hypot(dx,dy);if(len){dx/=len;dy/=len;p.face=[dx,dy];}
      if(input.attack)this.attack();if(input.dash)this.dash();if(p.dash>0){[dx,dy]=p.dashVector;this.moveEntity(p,dx*11*dt,dy*11*dt);}else this.moveEntity(p,dx*3.8*dt,dy*3.8*dt);
      for(const e of s.enemies[s.area]){if(e.hp<=0)continue;e.invulnerable=Math.max(0,e.invulnerable-dt);e.cooldown=Math.max(0,e.cooldown-dt);const d=distance(e,p);
        if(e.windup>0){e.windup-=dt;if(e.windup<=0){if(e.type==='boss'){const count=e.hp<=12?12:8;for(let i=0;i<count;i++)this.shoot(e,Math.cos(i*Math.PI*2/count),Math.sin(i*Math.PI*2/count),e.hp<=12?4.2:3.5);e.cooldown=e.hp<=12?1.1:1.7;}else if(e.type==='wisp'){this.shoot(e,p.x-e.x,p.y-e.y);e.cooldown=1.8;}else{if(d<1.4)this.damage(1);e.cooldown=.9;}}}
        else if(e.cooldown===0&&((e.type==='boss'&&d<12)||(e.type==='wisp'&&d<7)||d<1.1))e.windup=e.type==='boss'?.75:.45;
        else if(d>1&&d<(e.type==='boss'?12:8)){const speed=e.type==='boss'?.6:e.type==='wisp'?.65:1.15;this.moveEntity(e,(p.x-e.x)/d*speed*dt,(p.y-e.y)/d*speed*dt,e.type==='boss'?.48:.22);}
      }
      s.projectiles=s.projectiles.filter(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.ttl-=dt;if(distance(b,p)<.45){this.damage(b.boss?2:1);return false;}return b.ttl>0&&!this.solid(b.x,b.y);});
      s.pickups=s.pickups.filter(item=>{if(item.area===s.area&&distance(item,p)<.7){p.hp=Math.min(p.maxHp,p.hp+2);s.message='heart';return false;}return true;});
      s.effects=s.effects.filter(e=>(e.ttl-=dt)>0);this.saveClock+=dt;if(this.saveClock>=2){this.saveClock=0;this.save();}this.emit();
    }
    objective(){const s=this.state;return s.flags.seal?'return':!s.flags.talked?'elder':!s.flags.key?'key':s.enemies.temple.some(e=>e.type==='boss'&&e.hp>0)?'warden':'seal';}
    save(){try{this.storage?.setItem('osaa601-starfall-save',JSON.stringify(this.state));this.saveStatus=this.storage?'saved':'unavailable';}catch(_){this.saveStatus='unavailable';}}
    load(raw){
      if(!raw||raw.version!==1||!maps[raw.area]||!['playing','dialog','lost','won'].includes(raw.phase))return false;
      const s=initial(),n=(v,a,b,f)=>Number.isFinite(v)?clamp(v,a,b):f;
      s.area=raw.area;s.phase=raw.phase==='dialog'?'playing':raw.phase;s.time=n(raw.time,0,1e7,0);
      const p=raw.player||{};Object.assign(s.player,{x:n(p.x,1,W-2,12),y:n(p.y,1,H-2,14),maxHp:n(p.maxHp,8,12,8),coins:n(p.coins,0,9999,0),xp:n(p.xp,0,9999,0),blade:p.blade===2?2:1});s.player.hp=n(p.hp,0,s.player.maxHp,s.player.maxHp);
      if(!this.valid(s.player.x,s.player.y,.24,s.area)){s.area='village';s.player.x=12;s.player.y=14;}
      for(const k of ['talked','key','seal'])s.flags[k]=raw.flags?.[k]===true;s.opened=treasures.filter(c=>Array.isArray(raw.opened)&&raw.opened.includes(c.id)).map(c=>c.id);
      for(const area of Object.keys(s.enemies))for(const e of s.enemies[area]){const old=raw.enemies?.[area]?.find?.(x=>x.id===e.id);if(old){e.hp=n(old.hp,0,e.maxHp,e.hp);const x=n(old.x,1,W-2,e.x),y=n(old.y,1,H-2,e.y);if(this.valid(x,y,.22,area)){e.x=x;e.y=y;}}}
      s.message='loaded';this.state=s;return true;
    }
  }
  const api={Engine,maps,portals,npcs,treasures,W,H,distance};if(typeof module!=='undefined'&&module.exports)module.exports=api;else host.OsaaStarfall=api;
})(typeof window==='undefined'?{}:window);
