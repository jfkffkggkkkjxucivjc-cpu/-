const Game = {
  canvas: null,
  ctx: null,
  player: null,
  enemies: [],
  state: 'title',
  timer: 0,
  clock: 0,
  last: 0,
  paused: false,
  mode: 'scatter',
  modeTimer: 7,
  frightTimer: 0,
  combo: 0,

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = CONFIG.COLS * CONFIG.TILE;
    this.canvas.height = CONFIG.ROWS * CONFIG.TILE + CONFIG.HUD_HEIGHT;

    Input.init();
    Sound.init();
    Score.init();
    Maze.load();

    this.player = new Player();
    this.enemies = [0, 1, 2, 3].map(i => new Enemy(i));
    this.resetActors();
    requestAnimationFrame(t => this.loop(t));
  },

  resetActors() {
    Input.reset();
    this.player.reset();
    this.enemies.forEach(e => e.reset());
    this.mode = 'scatter';
    this.modeTimer = 7;
    this.frightTimer = 0;
    this.combo = 0;
  },

  startGame() {
    Score.reset();
    this.loadLevel();
  },

  loadLevel() {
    Maze.load();
    this.resetActors();
    this.state = 'ready';
    this.timer = 2;
    Sound.play('start');
  },

  loop(t) {
    if (!this.last) this.last = t;
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    this.update(dt);
    Renderer.draw(this);
    requestAnimationFrame(n => this.loop(n));
  },

  update(dt) {
    const act = Input.consume('action');
    if (Input.consume('mutePressed')) Sound.muted = !Sound.muted;
    if (Input.consume('pausePressed') && this.state === 'playing') this.paused = !this.paused;
    if (this.paused) return;

    this.clock += dt;

    switch (this.state) {
      case 'title':
      case 'gameover':
        if (act) this.startGame();
        break;
      case 'ready':
        this.timer -= dt;
        if (this.timer <= 0) this.state = 'playing';
        break;
      case 'playing':
        this.updatePlaying(dt);
        break;
      case 'dying':
        this.timer -= dt;
        if (this.timer <= 0) {
          if (Score.lives <= 0) {
            this.state = 'gameover';
          } else {
            this.resetActors();
            this.state = 'ready';
            this.timer = 1.5;
          }
        }
        break;
      case 'levelclear':
        this.timer -= dt;
        if (this.timer <= 0) {
          Score.level++;
          this.loadLevel();
        }
        break;
    }
  },

  updatePlaying(dt) {
    // مؤقت الهروب أو تبديل نمط المطاردة
    if (this.frightTimer > 0) {
      this.frightTimer -= dt;
      if (this.frightTimer <= 0) {
        this.frightTimer = 0;
        this.enemies.forEach(e => { e.frightened = false; });
        this.combo = 0;
      }
    } else {
      this.modeTimer -= dt;
      if (this.modeTimer <= 0) {
        if (this.mode === 'scatter') {
          this.mode = 'chase';
          this.modeTimer = 20;
        } else {
          this.mode = 'scatter';
          this.modeTimer = 7;
        }
        this.enemies.forEach(e => e.forceReverse());
      }
    }

    // اللاعب
    this.player.update(dt);
    const events = this.player.events.splice(0);
    for (const ev of events) {
      if (ev === 'gem') {
        Score.add(CONFIG.GEM_POINTS);
        Sound.play('gem');
      } else if (ev === 'power') {
        Score.add(CONFIG.POWER_POINTS);
        Sound.play('power');
        this.frightTimer = Math.max(2, CONFIG.FRIGHT_TIME - 0.5 * (Score.level - 1));
        this.combo = 0;
        this.enemies.forEach(e => {
          if (!e.inHouse) {
            e.frightened = true;
            e.forceReverse();
          }
        });
      }
    }

    if (Maze.gems <= 0) {
      this.state = 'levelclear';
      this.timer = 2;
      Sound.play('win');
      return;
    }

    // الأعداء
    const ctx = { player: this.player, mode: this.mode };
    this.enemies.forEach(e => e.update(dt, ctx));

    // التصادم
    for (const e of this.enemies) {
      if (e.inHouse) continue;
      const dist = Math.hypot(e.px - this.player.px, e.py - this.player.py);
      if (dist < 0.6) {
        if (e.frightened) {
          Score.add(CONFIG.ENEMY_POINTS * Math.pow(2, this.combo));
          this.combo = Math.min(this.combo + 1, 3);
          e.sendHome();
          Sound.play('eatEnemy');
        } else {
          Score.lives--;
          this.state = 'dying';
          this.timer = 1.6;
          Sound.play('die');
          return;
        }
      }
    }
  }
};

window.addEventListener('load', () => Game.init());