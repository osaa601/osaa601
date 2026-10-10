(function (host) {
  const deviceForWidth = width => width < 700 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop';
  const bounds = (device, width, height, position = {x: 0, y: 0}) => {
    const margin = device === 'desktop' ? 12 : 8;
    const dock = device === 'tablet' ? 90 : 0;
    const availableHeight = Math.max(1, height - dock - margin * 2);
    const defaultWidth = device === 'mobile' ? width - 16 : device === 'tablet' ? Math.min(760, width * .84) : Math.min(1200, Math.max(840,width*.72),width-260);
    const defaultHeight = Math.max(1, Math.floor(device === 'desktop' ? Math.min(800, availableHeight * .9) : availableHeight * (device === 'tablet' ? .86 : .92)));
    const maxWidth=Math.max(100,width-margin*2),minWidth=Math.min(maxWidth,device==='mobile'?220:320),minHeight=Math.min(availableHeight,220);
    const w=Number.isFinite(position.width)?Math.max(minWidth,Math.min(position.width,maxWidth)):defaultWidth;
    const h=Number.isFinite(position.height)?Math.max(minHeight,Math.min(position.height,availableHeight)):defaultHeight;
    const x = Math.max(margin, Math.min(position.x, width - w - margin));
    const y = Math.max(margin, Math.min(position.y, height - dock - h - margin));
    return {x, y, width: Math.max(100, w), height: h};
  };
  const snap=(device,width,height,mode)=>{
    const margin=device==='desktop'?12:8,dock=device==='tablet'?90:0,w=width-margin*2,h=height-dock-margin*2,gap=8;
    if(device==='mobile')return{x:margin,y:margin,width:w,height:h};
    if(mode==='left'||mode==='right'){const half=(w-gap)/2;return{x:mode==='left'?margin:margin+half+gap,y:margin,width:half,height:h};}
    const half=(h-gap)/2;return{x:margin,y:mode==='upper'?margin:margin+half+gap,width:w,height:half};
  };
  class Trail {
    constructor(screen) { this.screens = [screen]; this.index = 0; }
    visit(screen) {
      if (screen === this.current) return false;
      this.screens = this.screens.slice(0, this.index + 1);
      this.screens.push(screen); this.index++; if(this.screens.length>100){this.screens.shift();this.index--;} return true;
    }
    restore(index, screen) {
      if (this.screens[index] === screen) this.index = index;
      else this.visit(screen);
    }
    move(step) {
      this.index = Math.max(0, Math.min(this.screens.length - 1, this.index + step));
      return this.current;
    }
    get current() { return this.screens[this.index]; }
    get canBack() { return this.index > 0; }
    get canForward() { return this.index < this.screens.length - 1; }
  }
  const api = {deviceForWidth, bounds, snap, Trail};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else host.OsaaDesktopState = api;
})(typeof window === 'undefined' ? {} : window);
