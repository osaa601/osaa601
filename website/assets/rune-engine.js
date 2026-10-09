(function(host){
  const dirs=[[0,-1],[1,0],[0,1],[-1,0]],key=(x,y)=>x+','+y;
  const equal=(a,b)=>a.x===b.x&&a.y===b.y;
  const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
  class Engine{
    constructor(){this.listeners=new Set();this.state={phase:'intro',floor:1,score:0,turn:0,message:'welcome',mode:'walk',player:{x:1,y:5,hp:8,maxHp:8,energy:3,maxEnergy:3},walls:[],runes:[],enemies:[],exit:{x:5,y:3}};}
    subscribe(fn){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
    emit(){for(const fn of this.listeners)fn(this.state);}
    random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
    start(seed=Date.now()){this.seed=Number(seed)>>>0;this.state={phase:'playing',floor:1,score:0,turn:0,message:'entered',mode:'walk',player:{x:1,y:5,hp:8,maxHp:8,energy:3,maxEnergy:3},walls:[],runes:[],enemies:[],exit:{x:5,y:3}};this.room();this.emit();}
    blocked(x,y){return x<0||y<0||x>=7||y>=7||this.state.walls.includes(key(x,y));}
    path(from,to,occupied=new Set()){
      const queue=[{x:from.x,y:from.y,steps:[]}],visited=new Set([key(from.x,from.y)]);
      for(let i=0;i<queue.length;i++)for(const [dx,dy]of dirs){const at={x:queue[i].x+dx,y:queue[i].y+dy};const k=key(at.x,at.y);if(this.blocked(at.x,at.y)||visited.has(k)||occupied.has(k))continue;const steps=queue[i].steps.concat([at]);if(equal(at,to))return steps;visited.add(k);queue.push({...at,steps});}
      return [];
    }
    room(){
      const s=this.state;s.player.x=1;s.player.y=5;s.player.energy=s.player.maxEnergy;s.runes=[{x:1,y:1},{x:5,y:1},{x:5,y:5}];s.exit={x:5,y:3};s.enemies=[];s.walls=[];s.mode='walk';
      for(let x=0;x<7;x++)for(let y=0;y<7;y++)if(x===0||y===0||x===6||y===6)s.walls.push(key(x,y));
      const reserved=[s.player,s.exit,...s.runes];
      for(let n=0;n<5;n++){const x=1+Math.floor(this.random()*5),y=1+Math.floor(this.random()*5),k=key(x,y);if(reserved.some(p=>p.x===x&&p.y===y)||s.walls.includes(k))continue;s.walls.push(k);if([...s.runes,s.exit].some(p=>!this.path(s.player,p).length))s.walls.pop();}
      const spawn=[];for(let x=1;x<=5;x++)for(let y=1;y<=5;y++){const p={x,y};if(!this.blocked(x,y)&&!reserved.some(q=>equal(p,q))&&distance(p,s.player)>=4)spawn.push(p);}
      for(let i=0;i<Math.min(s.floor+1,spawn.length);i++){const at=spawn.splice(Math.floor(this.random()*spawn.length),1)[0];s.enemies.push({...at,hp:s.floor===1?2:3,intent:null});}
    }
    setMode(){if(this.state.phase!=='playing')return;this.state.mode=this.state.mode==='walk'?'dash':'walk';this.state.message=this.state.mode==='dash'?'dash-ready':'walk-ready';this.emit();}
    move(dx,dy){
      const s=this.state;if(s.phase!=='playing'||Math.abs(dx)+Math.abs(dy)!==1)return false;
      const p=s.player,dash=s.mode==='dash',steps=dash?2:1;if(dash&&p.energy<2){s.message='energy';this.emit();return false;}
      const cells=[];for(let i=1;i<=steps;i++){const at={x:p.x+dx*i,y:p.y+dy*i};if(this.blocked(at.x,at.y)){s.message='blocked';this.emit();return false;}cells.push(at);}
      const enemy=s.enemies.find(e=>equal(e,cells[0]));
      if(enemy&&!dash){enemy.hp-=2;s.message='strike';if(enemy.hp<=0){s.enemies=s.enemies.filter(e=>e!==enemy);s.score+=25;s.message='defeated';}this.finishTurn(false);return true;}
      if(cells.some(at=>s.enemies.some(e=>equal(e,at)))){s.message='occupied';this.emit();return false;}
      if(dash)p.energy-=2;s.message=dash?'dashed':'moved';s.mode='walk';
      for(const at of cells){p.x=at.x;p.y=at.y;const rune=s.runes.find(r=>equal(r,p));if(rune){s.runes=s.runes.filter(r=>r!==rune);p.energy=Math.min(p.maxEnergy,p.energy+1);s.score+=40;s.message='rune';}}
      if(equal(p,s.exit)&&s.runes.length===0){s.score+=100;s.turn++;if(s.floor===3){s.phase='won';s.score+=p.hp*20;s.message='won';}else{s.phase='upgrade';s.message='upgrade';}this.emit();return true;}
      if(equal(p,s.exit))s.message='locked';this.finishTurn(false);return true;
    }
    guard(){if(this.state.phase!=='playing')return false;const p=this.state.player;p.energy=Math.min(p.maxEnergy,p.energy+1);this.state.message='guarded';this.finishTurn(true);return true;}
    pulse(){
      const s=this.state;if(s.phase!=='playing')return false;if(s.player.energy<3){s.message='energy';this.emit();return false;}
      s.player.energy-=3;let hits=0;s.enemies=s.enemies.filter(e=>{if(distance(e,s.player)<=1){e.hp-=3;hits++;if(e.hp<=0){s.score+=25;return false;}}return true;});s.message=hits?'pulse':'pulse-empty';this.finishTurn(false);return true;
    }
    finishTurn(guarding){
      const s=this.state;s.turn++;
      for(const e of s.enemies){
        if(e.intent){if(equal(e.intent,s.player)){s.player.hp-=guarding?1:2;s.message=guarding?'blocked-hit':'hit';}e.intent=null;}
        else if(distance(e,s.player)===1)e.intent={x:s.player.x,y:s.player.y};
        else{const occupied=new Set(s.enemies.filter(other=>other!==e).map(other=>key(other.x,other.y)));const next=this.path(e,s.player,occupied)[0];if(next&&!equal(next,s.player)){e.x=next.x;e.y=next.y;}}
      }
      if(s.player.hp<=0){s.player.hp=0;s.phase='lost';s.message='lost';}this.emit();
    }
    upgrade(kind){
      const s=this.state;if(s.phase!=='upgrade'||!['vitality','energy'].includes(kind))return false;
      if(kind==='vitality'){s.player.maxHp+=2;s.player.hp=Math.min(s.player.maxHp,s.player.hp+3);}else{s.player.maxEnergy++;s.player.hp=Math.min(s.player.maxHp,s.player.hp+1);}
      s.floor++;s.phase='playing';s.message='entered';this.room();this.emit();return true;
    }
  }
  const api={Engine};if(typeof module!=='undefined'&&module.exports)module.exports=api;else host.OsaaRuneQuest=api;
})(typeof window==='undefined'?{}:window);
