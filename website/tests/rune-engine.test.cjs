const assert=require('assert/strict'),{Engine}=require('../assets/rune-engine.js');
for(let seed=1;seed<=500;seed++){
 const a=new Engine(),b=new Engine();a.start(seed);b.start(seed);assert.deepEqual(a.state,b.state,'Seed determinism');
 for(const target of [...a.state.runes,a.state.exit])assert(a.path(a.state.player,target).length,'All runes and gate remain reachable');
 assert.equal(new Set(a.state.enemies.map(e=>e.x+','+e.y)).size,a.state.enemies.length);
}
const e=new Engine();e.start(2);e.state.walls=[];e.state.enemies=[{x:2,y:5,hp:3,intent:null}];
e.guard();assert.deepEqual(e.state.enemies[0].intent,{x:1,y:5});assert.equal(e.state.player.hp,8,'Attack is telegraphed before damage');
e.move(0,-1);assert.equal(e.state.player.hp,8,'Moving off the marked tile dodges');
e.state.enemies=[{x:2,y:4,hp:3,intent:{x:1,y:4}}];e.guard();assert.equal(e.state.player.hp,7,'Guard reduces damage');
e.state.player.energy=3;e.pulse();assert.equal(e.state.enemies.length,0,'Pulse defeats adjacent sentinel');assert.equal(e.state.player.energy,0);
const turn=e.state.turn;e.setMode();assert.equal(e.move(1,0),false);assert.equal(e.state.turn,turn,'Insufficient energy does not advance enemies');
e.guard();e.guard();if(e.state.mode!=='dash')e.setMode();assert(e.move(1,0));assert.equal(e.state.player.x,3);assert.equal(e.state.player.energy,0);
e.state.walls=['3,3'];const blockedTurn=e.state.turn;e.move(0,-1);assert.equal(e.state.turn,blockedTurn,'Blocked movement does not spend a turn');
const run=new Engine();run.start(11);run.state.enemies=[];
for(let floor=1;floor<=3;floor++){
 for(const rune of [...run.state.runes]){const steps=run.path(run.state.player,rune);for(const step of steps)run.move(step.x-run.state.player.x,step.y-run.state.player.y);}
 assert.equal(run.state.runes.length,0);
 for(const step of run.path(run.state.player,run.state.exit))run.move(step.x-run.state.player.x,step.y-run.state.player.y);
 if(floor<3){assert.equal(run.state.phase,'upgrade');const max=run.state.player.maxHp;run.upgrade('vitality');assert.equal(run.state.player.maxHp,max+2);run.state.enemies=[];}else assert.equal(run.state.phase,'won');
}
const score=run.state.score;assert.equal(run.move(0,-1),false);assert.equal(run.state.score,score,'Winning ends the run');
const lost=new Engine();lost.start(1);lost.state.player.hp=1;lost.state.enemies=[{x:2,y:5,hp:3,intent:{x:1,y:5}}];lost.guard();assert.equal(lost.state.phase,'lost');assert.equal(lost.state.player.hp,0);
console.log('PASS Rune Quest: 500 solvable seeded maps, telegraphed attacks, dodge, guard, pulse, energy, dash, blocked actions, relic upgrades, win and loss.');
