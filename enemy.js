class Enemy extends Entity {
  constructor(index) {
    super(CONFIG.ENEMY_SPEED);
    this.index = index;
    this.color = CONFIG.ENEMY_COLORS[index];
    this.inHouse = false;
    this.frightened = false;
    this.releaseTimer = 0;
  }

  reset() {
    const s = CONFIG.ENEMY_STARTS[this.index];
    this.placeAt(s.x, s.y);
    this.frightened = false;
    this.inHouse = this.index !== 0;
    this.releaseTimer = CONFIG.RELEASE_DELAY[this.index];
    this.dx = this.inHouse ? 0 : -1;
    this.dy = 0;
  }

  release() {
    this.inHouse = false;
    this.placeAt(9, 7);
    this.dx = -1;
    this.dy = 0;
  }

  sendHome() {
    this.placeAt(9, 9);
    this.inHouse = true;
    this.frightened = false;
    this.releaseTimer = 2;
  }

  forceReverse() {
    if (!this.inHouse) this.reverse();
  }

  update(dt, ctx) {
    if (this.inHouse) {
      this.releaseTimer -= dt;
      if (this.releaseTimer <= 0) this.release();
      return;
    }
    const lvl = Score.level - 1;
    this.speed = this.frightened
      ? CONFIG.FRIGHT_SPEED
      : Math.min(CONFIG.ENEMY_SPEED + 0.25 * lvl, 6.3);
    super.update(dt, () => this.choose(ctx));
  }

  target(ctx) {
    const p = ctx.player;
    if (ctx.mode === 'scatter') return CONFIG.CORNERS[this.index];
    switch (this.index) {
      case 1:
        return { x: p.x + 4 * p.dx, y: p.y + 4 * p.dy };
      case 2: {
        const d = Math.hypot(this.x - p.x, this.y - p.y);
        return d > 8 ? { x: p.x, y: p.y } : CONFIG.CORNERS[2];
      }
      case 3:
        if (Math.random() < 0.3) {
          return { x: Math.random() * CONFIG.COLS, y: Math.random() * CONFIG.ROWS };
        }
        return { x: p.x, y: p.y };
      default:
        return { x: p.x, y: p.y };
    }
  }

  choose(ctx) {
    const dirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }];
    let opts = dirs.filter(d => Maze.isWalkable(this.x + d.x, this.y + d.y));
    const fwd = opts.filter(d => !(d.x === -this.dx && d.y === -this.dy));
    if (fwd.length > 0) opts = fwd;
    if (opts.length === 0) {
      this.dx = 0;
      this.dy = 0;
      return;
    }
    let pick = opts[0];
    if (this.frightened) {
      pick = opts[Math.floor(Math.random() * opts.length)];
    } else {
      const t = this.target(ctx);
      let best = Infinity;
      for (const d of opts) {
        const nx = this.x + d.x, ny = this.y + d.y;
        const dist = (nx - t.x) * (nx - t.x) + (ny - t.y) * (ny - t.y);
        if (dist < best) {
          best = dist;
          pick = d;
        }
      }
    }
    this.dx = pick.x;
    this.dy = pick.y;
  }
}