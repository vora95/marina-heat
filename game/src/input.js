// input.js — Marina Heat: keyboard + mouse input, edge detection.
// Keys are tracked in S.keys; justPressed is rebuilt every frame by main.js.

export const KEYMAP = {
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  handbrake: ['Space'],
  nitro: ['ShiftLeft', 'ShiftRight'],
  enter: ['KeyE'],
  shoot: ['KeyF'],
  pause: ['Escape', 'KeyP'],
  radio: ['KeyR'],
  horn: ['KeyH'],
};

export function initInput(S, canvas) {
  const down = (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (!e.repeat) {
      S.keys[e.code] = true;
      S.justPressed = S.justPressed || {};
      S.justPressed[e.code] = true;
    }
  };
  const up = (e) => { S.keys[e.code] = false; };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', () => { S.keys = {}; });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    S.mouse.x = e.clientX - r.left;
    S.mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mousedown', (e) => { if (e.button === 0) S.mouse.down = true; });
  window.addEventListener('mouseup', () => { S.mouse.down = false; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function isDown(S, action) {
  return KEYMAP[action].some((c) => S.keys[c]);
}

export function wasPressed(S, action) {
  if (!S.justPressed) return false;
  return KEYMAP[action].some((c) => S.justPressed[c]);
}

// Call once per frame after update: clears edge triggers.
export function endFrameInput(S) {
  S.justPressed = {};
}
