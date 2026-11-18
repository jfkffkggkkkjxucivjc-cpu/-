class Entity {
  constructor(speed) {
    this.speed = speed;
    this.placeAt(0, 0);
  }

  placeAt(x, y) {
    this.x = x; this.y = y;
    this.px = x; this.py = y;
    this.tx = x; this.ty = y;
    this.dx = 0; this.dy = 0;
    this.left = 0;
  }

  reverse() {
    if (this.left > 0) {
      const ox = this.x, oy = this.y;
      this.x = this.tx; this.y = this.ty;
      this.tx = ox; this.ty = oy;
      this.left = 1 - this.left;
    }
    this.dx = -this.dx;
    this.dy = -this.dy;
  }

  update(dt, choose) {
    let remaining = this.speed * dt;
    let guard = 0;
    while (remaining > 1e-9 && guard++ < 8) {
      if (this.left <= 0) {
        choose(this);
        if ((this.dx === 0 && this.dy === 0) ||
            !Maze.isWalkable(this.x + this.dx, this.y + this.dy)) {
          this.dx = 0;
          this.dy = 0;
          break;
        }
        this.tx = Maze.wrapX(this.x + this.dx);
        this.ty = this.y + this.dy;
        this.left = 1;
      }
      const step = Math.min(remaining, this.left);
      this.px += this.dx * step;
      this.py += this.dy * step;
      this.left -= step;
      remaining -= step;
      if (this.left <= 1e-9) {
        this.left = 0;
        this.x = this.tx;
        this.y = this.ty;
        this.px = this.x;
        this.py = this.y;
        if (typeof this.onArrive === 'function') this.onArrive();
      }
    }
  }
}