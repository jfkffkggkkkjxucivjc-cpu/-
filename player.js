class Player extends Entity {
  constructor() {
    super(CONFIG.PLAYER_SPEED);
    this.faceX = -1;
    this.faceY = 0;
    this.events = [];
  }

  reset() {
    const s = Maze.playerStart;
    this.placeAt(s.x, s.y);
    this.faceX = -1;
    this.faceY = 0;
    this.events = [];
  }

  choose() {
    const w = Input.dir;
    if ((w.x !== 0 || w.y !== 0) && Maze.isWalkable(this.x + w.x, this.y + w.y)) {
      this.dx = w.x;
      this.dy = w.y;
    } else if (!Maze.isWalkable(this.x + this.dx, this.y + this.dy)) {
      this.dx = 0;
      this.dy = 0;
    }
    if (this.dx !== 0 || this.dy !== 0) {
      this.faceX = this.dx;
      this.faceY = this.dy;
    }
  }

  onArrive() {
    const kind = Maze.eat(this.x, this.y);
    if (kind) this.events.push(kind);
  }

  update(dt) {
    const w = Input.dir;
    if (this.left > 0 && (w.x !== 0 || w.y !== 0) && w.x === -this.dx && w.y === -this.dy) {
      this.reverse();
    }
    super.update(dt, () => this.choose());
  }
}