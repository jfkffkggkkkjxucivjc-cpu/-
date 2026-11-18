const Renderer = {
  draw(g) {
    const c = g.ctx;
    const T = CONFIG.TILE;
    const W = CONFIG.COLS * T;
    const H = CONFIG.ROWS * T + CONFIG.HUD_HEIGHT;

    c.fillStyle = '#05060f';
    c.fillRect(0, 0, W, H);
    this.hud(g, W);

    c.save();
    c.translate(0, CONFIG.HUD_HEIGHT);
    this.maze(g);
    this.gems(g);
    if (g.state !== 'title') {
      g.enemies.forEach(e => this.enemy(g, e));
      this.player(g);
    }
    c.restore();

    this.overlay(g, W);
  },

  hud(g, W) {
    const c = g.ctx;
    c.fillStyle = '#ffffff';
    c.font = 'bold 14px monospace';
    c.textBaseline = 'middle';
    c.textAlign = 'left';
    c.fillText('SCORE ' + Score.score, 10, 14);
    c.textAlign = 'center';
    c.fillText('HIGH ' + Score.high, W / 2, 14);
    c.textAlign = 'right';
    c.fillText('LEVEL ' + Score.level, W - 10, 14);
    c.fillStyle = '#2ee6d6';
    for (let i = 0; i < Score.lives; i++) {
      c.beginPath();
      c.arc(16 + i * 18, 30, 6, 0, Math.PI * 2);
      c.fill();
    }
  },

  maze(g) {
    const c = g.ctx;
    const T = CONFIG.TILE;
    const flash = g.state === 'levelclear' && Math.floor(g.timer * 6) % 2 === 0;
    for (let y = 0; y < CONFIG.ROWS; y++) {
      for (let x = 0; x < CONFIG.COLS; x++) {
        const ch = Maze.grid[y][x];
        if (ch === '#') {
          c.fillStyle = flash ? '#ffffff' : '#13257a';
          c.fillRect(x * T + 1, y * T + 1, T - 2, T - 2);
          c.strokeStyle = flash ? '#99ccff' : '#3d63ff';
          c.lineWidth = 2;
          c.strokeRect(x * T + 4, y * T + 4, T - 8, T - 8);
        } else if (ch === '-') {
          c.fillStyle = '#ff8fd0';
          c.fillRect(x * T, y * T + T / 2 - 2, T, 4);
        }
      }
    }
  },

  diamond(c, x, y, r, color) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x, y - r);
    c.lineTo(x + r, y);
    c.lineTo(x, y + r);
    c.lineTo(x - r, y);
    c.closePath();
    c.fill();
  },

  gems(g) {
    const c = g.ctx;
    const T = CONFIG.TILE;
    for (let y = 0; y < CONFIG.ROWS; y++) {
      for (let x = 0; x < CONFIG.COLS; x++) {
        const ch = Maze.grid[y][x];
        const cx = x * T + T / 2;
        const cy = y * T + T / 2;
        if (ch === '.') {
          this.diamond(c, cx, cy, 3.5, '#ffd166');
        } else if (ch === 'o' && Math.floor(g.clock * 4) % 2 === 0) {
          this.diamond(c, cx, cy, 8, '#7cf5ff');
        }
      }
    }
  },

  player(g) {
    const c = g.ctx;
    const T = CONFIG.TILE;
    const p = g.player;
    const cx = (p.px + 0.5) * T;
    const cy = (p.py + 0.5) * T;
    let r = T * 0.42;
    let spin = 0;
    if (g.state === 'dying') {
      const k = Math.max(0, g.timer / 1.6);
      r *= k;
      spin = (1 - k) * 12;
      if (r < 0.5) return;
    }
    c.save();
    c.translate(cx, cy);
    c.rotate(spin);
    c.fillStyle = '#2ee6d6';
    c.beginPath();
    c.arc(0, 0, r, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#2ee6d6';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, -r);
    c.lineTo(0, -r * 1.3);
    c.stroke();
    c.fillStyle = '#ff4d6d';
    c.beginPath();
    c.arc(0, -r * 1.3, 2, 0, Math.PI * 2);
    c.fill();
    for (const sx of [-1, 1]) {
      const ex = sx * r * 0.38 + p.faceX * r * 0.18;
      const ey = -r * 0.1 + p.faceY * r * 0.18;
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(ex, ey, r * 0.24, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#0a1230';
      c.beginPath();
      c.arc(ex + p.faceX * r * 0.08, ey + p.faceY * r * 0.08, r * 0.11, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  },

  enemy(g, e) {
    const c = g.ctx;
    const T = CONFIG.TILE;
    const cx = (e.px + 0.5) * T;
    const cy = (e.py + 0.5) * T + (e.inHouse ? Math.sin(g.clock * 6 + e.index) * 2 : 0);
    const r = T * 0.4;
    let body = e.color;
    if (e.frightened) {
      const blink = g.frightTimer < 2 && Math.floor(g.clock * 6) % 2 === 0;
      body = blink ? '#f5f5f5' : '#3a56d4';
    }
    c.fillStyle = body;
    c.beginPath();
    c.arc(cx, cy, r, Math.PI, 0);
    c.closePath();
    c.fill();
    c.fillStyle = '#c9cfe6';
    c.beginPath();
    c.ellipse(cx, cy + r * 0.15, r * 1.15, r * 0.3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#ffe066';
    for (const k of [-0.6, 0, 0.6]) {
      c.beginPath();
      c.arc(cx + k * r, cy + r * 0.2, 1.6, 0, Math.PI * 2);
      c.fill();
    }
    if (!e.frightened) {
      for (const sx of [-1, 1]) {
        const ex = cx + sx * r * 0.38;
        const ey = cy - r * 0.35;
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(ex, ey, r * 0.24, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#0a1230';
        c.beginPath();
        c.arc(ex + e.dx * r * 0.1, ey + e.dy * r * 0.1, r * 0.11, 0, Math.PI * 2);
        c.fill();
      }
    } else {
      c.fillStyle = '#ffffff';
      for (const sx of [-1, 1]) {
        c.beginPath();
        c.arc(cx + sx * r * 0.35, cy - r * 0.35, 1.8, 0, Math.PI * 2);
        c.fill();
      }
    }
  },

  banner(g, W, text, sub, color) {
    const c = g.ctx;
    const y = CONFIG.HUD_HEIGHT + 12 * CONFIG.TILE + CONFIG.TILE / 2;
    c.fillStyle = 'rgba(5, 6, 15, 0.85)';
    c.fillRect(0, y - 30, W, 60);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = color;
    c.font = 'bold 26px monospace';
    c.fillText(text, W / 2, y - (sub ? 8 : 0));
    if (sub) {
      c.fillStyle = '#cfd6ff';
      c.font = '13px monospace';
      c.fillText(sub, W / 2, y + 16);
    }
  },

  overlay(g, W) {
    if (g.paused) return this.banner(g, W, 'PAUSED', 'Press P to continue', '#ffd166');
    switch (g.state) {
      case 'title':
        this.banner(g, W, 'GEM RUN', 'Press ENTER or tap to start', '#2ee6d6');
        break;
      case 'ready':
        this.banner(g, W, 'READY!', '', '#ffd166');
        break;
      case 'levelclear':
        this.banner(g, W, 'LEVEL CLEAR!', '', '#7cf5ff');
        break;
      case 'gameover':
        this.banner(g, W, 'GAME OVER', 'Press ENTER or tap to play again', '#ff5c8a');
        break;
    }
  }
};