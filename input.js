const Input = {
  dir: { x: 0, y: 0 },
  action: false,
  pausePressed: false,
  mutePressed: false,
  touchStart: null,

  init() {
    window.addEventListener('keydown', e => {
      let handled = true;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': this.dir = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': case 'S': this.dir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': case 'A': this.dir = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': case 'D': this.dir = { x: 1, y: 0 }; break;
        case 'Enter': case ' ': this.action = true; break;
        case 'p': case 'P': this.pausePressed = true; break;
        case 'm': case 'M': this.mutePressed = true; break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        Sound.resume();
      }
    });

    window.addEventListener('touchstart', e => {
      const t = e.touches[0];
      this.touchStart = { x: t.clientX, y: t.clientY };
      Sound.resume();
    }, { passive: true });

    window.addEventListener('touchend', e => {
      if (!this.touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - this.touchStart.x;
      const dy = t.clientY - this.touchStart.y;
      this.touchStart = null;
      
      // إذا كانت الضغطة خفيفة (نقرة) -> تفعيل زر البدء
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        this.action = true;
        return;
      }
      // إذا كانت سحب -> تغيير الاتجاه
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dir = { x: dx > 0 ? 1 : -1, y: 0 };
      } else {
        this.dir = { x: 0, y: dy > 0 ? 1 : -1 };
      }
    }, { passive: true });
  },

  reset() {
    this.dir = { x: 0, y: 0 };
  },

  consume(name) {
    const v = this[name];
    this[name] = false;
    return v;
  }
};