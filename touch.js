const Touch = {
  init() {
    const isTouch = ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if (!isTouch) return;

    const style = document.createElement('style');
    style.textContent = `
      body { padding-bottom: 220px; }
      #pad {
        position: fixed; left: 50%; bottom: 15px;
        transform: translateX(-50%);
        display: grid; grid-template-columns: repeat(3, 65px);
        grid-template-rows: repeat(3, 65px); gap: 8px;
        user-select: none; -webkit-user-select: none;
        touch-action: manipulation; z-index: 10;
      }
      #pad button {
        border: 2px solid #3d63ff; border-radius: 14px;
        background: rgba(19, 37, 122, 0.85); color: #cfd6ff;
        font-size: 24px; padding: 0; touch-action: manipulation;
        display: flex; align-items: center; justify-content: center;
      }
      #pad button:active { background: #3d63ff; }
    `;
    document.head.appendChild(style);

    const pad = document.createElement('div');
    pad.id = 'pad';
    document.body.appendChild(pad);

    const buttons = [
      null, { t: '▲', f: () => { Input.dir = { x: 0, y: -1 }; } }, null,
      { t: '◀', f: () => { Input.dir = { x: -1, y: 0 }; } },
      { t: '▶', f: () => { Input.action = true; } }, // زر البدء
      { t: '▶', f: () => { Input.dir = { x: 1, y: 0 }; } },
      null, { t: '▼', f: () => { Input.dir = { x: 0, y: 1 }; } }, null
    ];

    buttons.forEach(b => {
      if (!b) {
        pad.appendChild(document.createElement('span'));
        return;
      }
      const el = document.createElement('button');
      el.textContent = b.t;
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        Sound.resume();
        b.f();
      });
      el.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
      el.addEventListener('touchend', e => e.stopPropagation(), { passive: true });
      el.addEventListener('contextmenu', e => e.preventDefault());
      pad.appendChild(el);
    });
  }
};

window.addEventListener('load', () => Touch.init());