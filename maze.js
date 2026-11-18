const Maze = {
  grid: [],
  gems: 0,
  playerStart: { x: 9, y: 16 },

  load() {
    this.grid = CONFIG.MAZE.map(row => row.split(''));
    this.gems = 0;
    for (let y = 0; y < CONFIG.ROWS; y++) {
      for (let x = 0; x < CONFIG.COLS; x++) {
        const c = this.grid[y][x];
        if (c === '.' || c === 'o') this.gems++;
        if (c === 'P') {
          this.playerStart = { x: x, y: y };
          this.grid[y][x] = '_';
        }
      }
    }
  },

  wrapX(x) {
    return (x + CONFIG.COLS) % CONFIG.COLS;
  },

  get(x, y) {
    if (y < 0 || y >= CONFIG.ROWS) return '#';
    return this.grid[y][this.wrapX(x)];
  },

  isWalkable(x, y) {
    const c = this.get(x, y);
    return c !== '#' && c !== '-';
  },

  eat(x, y) {
    const c = this.get(x, y);
    if (c === '.' || c === 'o') {
      this.grid[y][this.wrapX(x)] = '_';
      this.gems--;
      return c === 'o' ? 'power' : 'gem';
    }
    return null;
  }
};