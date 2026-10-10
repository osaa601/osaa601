const assert=require('assert/strict');
const {Engine,maps,portals,npcs,treasures,W,H}=require('../assets/starfall-engine.js');
const storage=()=>{const values=new Map();return{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),values};};
const engine=()=>{const e=new Engine({storage:storage()});e.start();return e;};
const advance=(e,seconds,input={})=>{for(let i=0;i<Math.ceil(seconds/.02);i++)e.step(.02,input);};

// Every quest location has a walkable route from its area's entrance.
for(const area of ['village','forest','temple']){
 const e=engine(),origin=area==='village'?[12,14]:area==='forest'?[2,12]:[16,21];
 const visited=new Set([origin.join(',')]),queue=[origin];
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const [x,y]=queue[i],nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<1||ny<1||nx>=W-1||ny>=H-1||visited.has(k)||e.solid(nx+.5,ny+.5,area))continue;visited.add(k);queue.push([nx,ny]);}
 const goals=[...portals[area],...treasures.filter(c=>c.area===area),...(area==='village'?npcs:area==='temple'?[{x:16,y:4},{x:16,y:7}]:[])];
 for(const goal of goals)assert(visited.has(Math.floor(goal.x)+','+Math.floor(goal.y)),area+' inaccessible quest point '+JSON.stringify(goal));
 assert.equal(maps[area].length,H);assert(maps[area].every(row=>row.length===W));
}

{
 const a=engine(),b=engine();advance(a,1,{x:1});advance(b,1,{x:1,y:1});assert(Math.abs(Math.hypot(b.state.player.x-12,b.state.player.y-14)-(a.state.player.x-12))<.02,'Diagonal movement has no speed bonus');
 a.state.player.x=2;advance(a,2,{x:-1});assert(a.state.player.x>=1.24,'Boundary walls prevent escape');
 const x=a.state.player.x;a.step(Infinity,{x:1});assert.equal(a.state.player.x,x);a.step(1000,{x:1});assert(a.state.player.x-x<=.2,'Long frames cannot teleport the player');
}
{
 const e=engine(),p=e.state.player;e.state.area='forest';Object.assign(p,{x:10,y:12,face:[1,0]});const enemy=e.state.enemies.forest[0];Object.assign(enemy,{x:11,y:12});
 assert(e.attack());assert.equal(enemy.hp,3);assert(!e.attack(),'Sword cooldown prevents instant repeat damage');advance(e,.32);e.attack();assert.equal(enemy.hp,2);
 Object.assign(p,{face:[-1,0],cooldown:0});enemy.invulnerable=0;e.attack();assert.equal(enemy.hp,2,'Sword cannot hit behind the player');
 Object.assign(p,{face:[1,0],blade:2,cooldown:0});enemy.invulnerable=0;e.attack();assert.equal(enemy.hp,0);assert.equal(p.coins,3);assert.equal(p.xp,10);p.cooldown=0;e.attack();assert.equal(p.coins,3,'Defeated enemies cannot be farmed repeatedly');
}
{
 const e=engine(),p=e.state.player;assert(e.dash());assert(!e.damage(2),'Dash grants brief invulnerability');advance(e,.3);assert(e.damage(2));assert.equal(p.hp,6);assert(!e.damage(2),'Damage grace period prevents stacked hits');
 advance(e,1.2);p.hp=1;e.damage(2);assert.equal(e.state.phase,'lost');const pos=p.x;advance(e,1,{x:1});assert.equal(p.x,pos,'Defeat halts gameplay');p.blade=2;e.state.flags.key=true;e.revive();assert.equal(e.state.area,'village');assert.equal(p.hp,p.maxHp);assert.equal(p.blade,2);assert(e.state.flags.key);
}
{
 const e=engine(),p=e.state.player;e.state.area='temple';Object.assign(p,{x:16,y:7.9});const boss=e.state.enemies.temple.find(e=>e.type==='boss');e.state.enemies.temple=[boss];boss.cooldown=0;e.step(.02);assert(boss.windup>0);assert.equal(e.state.projectiles.length,0,'Boss warning precedes projectile burst');
 p.face=[0,-1];e.attack();assert(boss.windup>0,'Sword cannot indefinitely cancel the boss attack');advance(e,.8);assert(e.state.projectiles.length>0,'Boss fires real-time projectiles');
 e.state.projectiles=[{x:p.x+.1,y:p.y,vx:0,vy:0,ttl:1,boss:false}];p.invulnerable=0;const hp=p.hp;e.step(.02);assert.equal(p.hp,hp-1);assert.equal(e.state.projectiles.length,0);
}
{
 const e=engine(),p=e.state.player;Object.assign(p,{x:12,y:10});e.interact();assert(e.state.flags.talked);assert.equal(e.state.phase,'dialog');const time=e.state.time;e.step(.05,{x:1});assert.equal(e.state.time,time,'Dialogue pauses combat');e.closeDialog();
 Object.assign(p,{x:10,y:19});e.interact();e.closeDialog();assert.equal(p.coins,5);e.interact();assert.equal(p.coins,5,'Chests open once');
 Object.assign(p,{x:21,y:12});e.interact();assert.equal(e.state.dialog,'smith');e.closeDialog();p.coins=10;e.interact();e.closeDialog();assert.equal(p.blade,2);assert.equal(p.maxHp,10);assert.equal(p.coins,0);
 Object.assign(p,{x:30,y:12});e.interact();assert.equal(e.state.area,'forest');Object.assign(p,{x:16,y:1});e.interact();assert.equal(e.state.dialog,'gate-locked');e.closeDialog();
 Object.assign(p,{x:27,y:8});e.interact();assert.equal(e.state.dialog,'guarded');e.closeDialog();e.state.enemies.forest.forEach(enemy=>enemy.hp=0);e.interact();e.closeDialog();assert(e.state.flags.key);
 Object.assign(p,{x:16,y:1});e.interact();assert.equal(e.state.area,'temple');Object.assign(p,{x:5,y:12});e.interact();e.closeDialog();assert.equal(p.maxHp,12);
 Object.assign(p,{x:16,y:4});e.interact();assert.equal(e.state.dialog,'seal-locked');e.closeDialog();e.state.enemies.temple.find(enemy=>enemy.type==='boss').hp=0;e.interact();e.closeDialog();assert(e.state.flags.seal);
 Object.assign(p,{x:16,y:22});e.interact();assert.equal(e.state.area,'forest');Object.assign(p,{x:1,y:12});e.interact();assert.equal(e.state.area,'village');Object.assign(p,{x:12,y:10});e.interact();e.closeDialog();assert.equal(e.state.phase,'won','Complete quest reaches its ending');
 e.save();const restored=new Engine({storage:e.storage});assert.equal(restored.state.phase,'won');assert(restored.state.flags.seal);assert.equal(restored.state.player.blade,2);assert.deepEqual(restored.state.opened,e.state.opened);
}
{
 const e=engine();assert(!e.load({version:99}));e.state.player.x=15;e.save();const r=new Engine({storage:e.storage});assert.equal(r.state.player.x,15);assert.equal(r.state.phase,'playing');
 const raw=JSON.parse(e.storage.getItem('osaa601-starfall-save'));raw.player.hp=999;raw.player.coins=-100;raw.player.x=0;raw.player.y=0;r.load(raw);assert(r.state.player.hp<=r.state.player.maxHp);assert.equal(r.state.player.coins,0);assert(r.valid(r.state.player.x,r.state.player.y));
 const noStorage=new Engine({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});noStorage.start();assert.equal(noStorage.state.phase,'playing');assert.equal(noStorage.saveStatus,'unavailable');
}
console.log('PASS Starfall Vale: all three maps and quest locations reachable; continuous movement, collision, sword combat, dash, damage, boss/projectiles, complete quest, upgrades, defeat recovery, save/restore, and blocked storage.');
