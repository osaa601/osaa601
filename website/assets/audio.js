(function(host){
  const tracks=[
    {name:'Blue Hour',arabic:'الساعة الزرقاء',mood:'Daylight lo-fi',arabicMood:'لوفاي النهار',bpm:72,chords:[[62,65,69,72],[58,62,65,69],[53,57,60,64],[60,64,67,69]]},
    {name:'Moonlit Quest',arabic:'رحلة تحت القمر',mood:'Nighttime fantasy',arabicMood:'خيال ليلي',bpm:66,chords:[[52,55,59,62],[48,52,55,59],[55,59,62,66],[50,54,57,64]]}
  ];
  const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,Number(n)||0));
  class DeskAudio{
    constructor(options={}){
      this.factory=options.contextFactory||(()=>{const C=host.AudioContext||host.webkitAudioContext;if(!C)throw new Error('Audio is unavailable');return new C();});
      this.storage=options.storage;this.listeners=new Set();this.nodes=new Set();this.context=null;this.timer=null;this.track=0;this.offset=0;this.started=0;this.playing=false;this.pending=false;this.muted=false;this.version=0;this.message='';
      this.setTimer=options.setInterval||host.setInterval?.bind(host);this.clearTimer=options.clearInterval||host.clearInterval?.bind(host);
      this.volume=.45;this.sounds=true;
      try{const v=this.storage?.getItem('osaa601-music-volume');if(v!==null&&v!==undefined)this.volume=clamp(v,0,1);this.sounds=this.storage?.getItem('osaa601-interface-sounds')!=='off';}catch(_){}
    }
    get duration(){return 32*60/tracks[this.track].bpm;}
    get position(){return (this.offset+(this.playing?Math.max(0,this.context.currentTime-this.started):0))%this.duration;}
    get state(){return {track:this.track,tracks,playing:this.playing,pending:this.pending,position:this.position,duration:this.duration,volume:this.volume,muted:this.muted,sounds:this.sounds,message:this.message};}
    subscribe(fn){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
    emit(){for(const fn of this.listeners)fn(this.state);}
    ensure(){
      if(this.context)return this.context;
      const c=this.factory();this.context=c;this.musicGain=c.createGain();this.musicGain.gain.value=this.muted?0:this.volume;this.musicGain.connect(c.destination);
      this.soundGain=c.createGain();this.soundGain.gain.value=.16;this.soundGain.connect(c.destination);return c;
    }
    async play(){
      if(this.playing||this.pending)return;
      const version=++this.version;this.pending=true;this.message='';this.emit();
      try{
        const c=this.ensure();await c.resume();if(version!==this.version)return;
        this.pending=false;this.playing=true;this.started=c.currentTime;
        const beat=60/tracks[this.track].bpm;this.nextBeat=Math.ceil(this.offset/beat);this.schedule();
        this.timer=this.setTimer?.(()=>{this.schedule();this.emit();},100);this.emit();
      }catch(_){if(version===this.version){this.pending=false;this.playing=false;this.message='unavailable';this.emit();}}
    }
    pause(){
      this.offset=this.position;this.playing=false;this.pending=false;++this.version;
      if(this.timer!==null)this.clearTimer?.(this.timer);this.timer=null;
      for(const item of [...this.nodes])if(item.music){try{item.node.stop();}catch(_){}this.nodes.delete(item);}
      this.emit();
    }
    toggle(){if(this.playing||this.pending)this.pause();else return this.play();}
    choose(index){const resume=this.playing||this.pending;this.pause();this.track=((Number(index)||0)%tracks.length+tracks.length)%tracks.length;this.offset=0;this.message='';this.emit();if(resume)return this.play();}
    next(step=1){return this.choose(this.track+step);}
    seek(seconds){const resume=this.playing||this.pending;this.pause();this.offset=clamp(seconds,0,this.duration-.001);this.emit();if(resume)return this.play();}
    setVolume(value){this.volume=clamp(value,0,1);if(this.musicGain)this.musicGain.gain.value=this.muted?0:this.volume;try{this.storage?.setItem('osaa601-music-volume',String(this.volume));}catch(_){}this.emit();}
    toggleMute(){this.muted=!this.muted;if(this.musicGain)this.musicGain.gain.value=this.muted?0:this.volume;this.emit();}
    toggleSounds(){this.sounds=!this.sounds;try{this.storage?.setItem('osaa601-interface-sounds',this.sounds?'on':'off');}catch(_){}this.emit();}
    voice(frequency,time,length,volume,type='sine',music=true,endFrequency){
      const c=this.context,node=c.createOscillator(),gain=c.createGain();node.type=type;node.frequency.setValueAtTime(frequency,time);
      if(endFrequency)node.frequency.exponentialRampToValueAtTime(endFrequency,time+length*.8);
      gain.gain.setValueAtTime(.0001,time);gain.gain.linearRampToValueAtTime(volume,time+.012);gain.gain.exponentialRampToValueAtTime(.0001,time+length);
      node.connect(gain);gain.connect(music?this.musicGain:this.soundGain);
      const item={node,music};this.nodes.add(item);node.onended=()=>{this.nodes.delete(item);node.disconnect();gain.disconnect();};node.start(time);node.stop(time+length+.03);
    }
    noise(time,length,volume,highpass=4500){
      const c=this.context,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*length),c.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
      const node=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();node.buffer=buffer;filter.type='highpass';filter.frequency.value=highpass;gain.gain.value=volume;
      node.connect(filter);filter.connect(gain);gain.connect(this.musicGain);const item={node,music:true};this.nodes.add(item);
      node.onended=()=>{this.nodes.delete(item);node.disconnect();filter.disconnect();gain.disconnect();};node.start(time);node.stop(time+length);
    }
    schedule(){
      if(!this.playing)return;const c=this.context,t=tracks[this.track],beat=60/t.bpm;
      let at=this.started+this.nextBeat*beat-this.offset;
      while(at<c.currentTime+.2){
        if(at>=c.currentTime-.02){
          const tick=this.nextBeat%32,chord=t.chords[Math.floor(tick/8)],barBeat=tick%4;
          const hz=m=>440*Math.pow(2,(m-69)/12);
          if(barBeat===0)for(const note of chord)this.voice(hz(note),at,beat*3.8,.035,'sine');
          if(barBeat===0||barBeat===2){this.voice(hz(chord[0]-12),at,beat*1.6,.07,'sine');this.voice(90,at,.13,.075,'sine',true,40);}
          const melody=chord[(tick+Math.floor(tick/4))%4]+12;this.voice(hz(melody),at+beat*.48,beat*.7,.038,'triangle');
          this.noise(at,.04,.023);if(barBeat===1||barBeat===3)this.noise(at,.1,.034,1200);
        }
        this.nextBeat++;at=this.started+this.nextBeat*beat-this.offset;
      }
    }
    sfx(kind='click'){
      if(!this.sounds)return;
      try{const c=this.ensure();c.resume().catch(()=>{});const at=c.currentTime;
        if(kind==='open'){this.voice(392,at,.1,.25,'triangle',false);this.voice(587.33,at+.055,.15,.22,'triangle',false);}
        else if(kind==='close'){this.voice(523.25,at,.09,.22,'triangle',false);this.voice(261.63,at+.04,.14,.2,'triangle',false);}
        else this.voice(740,at,.035,.18,'sine',false);
      }catch(_){}
    }
    destroy(){this.pause();this.listeners.clear();for(const item of this.nodes){try{item.node.stop();}catch(_){}}this.nodes.clear();this.context?.close().catch(()=>{});}
  }
  const api={DeskAudio,tracks};if(typeof module!=='undefined'&&module.exports)module.exports=api;else host.OsaaAudio=api;
})(typeof window==='undefined'?{}:window);
