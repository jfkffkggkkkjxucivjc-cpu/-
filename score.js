const Score = {
  score: 0,
  high: 0,
  lives: 3,
  level: 1,
  nextLife: 5000,

  init() {
    try {
      this.high = parseInt(localStorage.getItem('gemrun_high') || '0', 10) || 0;
    } catch (e) {
      this.high = 0;
    }
  },

  reset() {
    this.score = 0;
    this.lives = CONFIG.START_LIVES;
    this.level = 1;
    this.nextLife = 5000;
  },

  add(n) {
    this.score += n;
    while (this.score >= this.nextLife) {
      this.lives++;
      this.nextLife += 5000;
    }
    if (this.score > this.high) {
      this.high = this.score;
      try { localStorage.setItem('gemrun_high', String(this.high)); } catch (e) {}
    }
  }
};