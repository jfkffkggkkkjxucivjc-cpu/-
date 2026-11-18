const Sound = {
  ctx: null,
  muted: false,
  flip: false,

  init() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  beep(freq, dur, type, vol, delay) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur);
  },

  play(name) {
    switch (name) {
      case 'gem':
        this.flip = !this.flip;
        this.beep(this.flip ? 520 : 620, 0.06, 'square', 0.04);
        break;
      case 'power':
        this.beep(300, 0.15, 'sawtooth', 0.06);
        this.beep(450, 0.15, 'sawtooth', 0.06, 0.12);
        break;
      case 'eatEnemy':
        this.beep(500, 0.08, 'square', 0.06);
        this.beep(800, 0.12, 'square', 0.06, 0.08);
        break;
      case 'die':
        for (let i = 0; i < 8; i++) this.beep(500 - i * 50, 0.14, 'triangle', 0.07, i * 0.12);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.beep(f, 0.15, 'square', 0.05, i * 0.13));
        break;
      case 'start':
        [392, 523, 659].forEach((f, i) => this.beep(f, 0.18, 'square', 0.05, i * 0.2));
        break;
    }
  }
};