(function (host) {
  const deviceForWidth = width => width < 700 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop';
  const bounds = (device, width, height, position = {x: 0, y: 0}) => {
    const margin = device === 'desktop' ? 12 : 8;
    const dock = device === 'tablet' ? 90 : 0;
    const availableHeight = Math.max(1, height - dock - margin * 2);
    const w = device === 'mobile' ? width - 32 : device === 'tablet' ? Math.min(760, width * .84) : Math.min(700, width - 150);
    const h = Math.max(1, Math.floor(device === 'desktop' ? Math.min(570, availableHeight * .88) : availableHeight * (device === 'tablet' ? .86 : .92)));
    const x = Math.max(margin, Math.min(position.x, width - w - margin));
    const y = Math.max(margin, Math.min(position.y, height - dock - h - margin));
    return {x, y, width: Math.max(100, w), height: h};
  };
  class Trail {
    constructor(screen) { this.screens = [screen]; this.index = 0; }
    visit(screen) {
      if (screen === this.current) return false;
      this.screens = this.screens.slice(0, this.index + 1);
      this.screens.push(screen); this.index++; return true;
    }
    restore(index, screen) {
      if (this.screens[index] === screen) this.index = index;
      else this.visit(screen);
    }
    get current() { return this.screens[this.index]; }
    get canBack() { return this.index > 0; }
    get canForward() { return this.index < this.screens.length - 1; }
  }
  const api = {deviceForWidth, bounds, Trail};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else host.OsaaDesktopState = api;
})(typeof window === 'undefined' ? {} : window);
