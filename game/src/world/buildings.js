// world/buildings.js — Marina Heat: building rendering.
// Top-down with a small south wall face so blocks read as volumes, not
// flat boxes: varied footprints, window grids, roof furniture, long
// sunset shadows thrown to the north-east.

export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)));
  return `rgb(${r},${g},${b})`;
}

export function drawBuildings(ctx, S, cam) {
  const { x: cx, y: cy, zoom } = cam;
  const vw = 1280 / zoom, vh = 720 / zoom;
  for (const b of S.buildings) {
    if (b.x > cx + vw / 2 + 80 || b.x + b.w < cx - vw / 2 - 80) continue;
    if (b.y > cy + vh / 2 + 80 || b.y + b.h < cy - vh / 2 - 80) continue;
    const hgt = 10 + b.floors * 7;
    // Long sunset shadow to the north-east.
    ctx.fillStyle = 'rgba(40,16,50,0.28)';
    ctx.beginPath();
    ctx.moveTo(b.x + 6, b.y + b.h);
    ctx.lineTo(b.x + b.w + hgt * 1.6, b.y + b.h - hgt * 0.9);
    ctx.lineTo(b.x + b.w + hgt * 1.6, b.y - hgt * 0.9);
    ctx.lineTo(b.x + 6, b.y);
    ctx.closePath();
    ctx.fill();
    // South wall face (pseudo-depth).
    ctx.fillStyle = shade(b.color, 0.62);
    ctx.fillRect(b.x, b.y + b.h, b.w, hgt * 0.55);
    // Roof.
    ctx.fillStyle = shade(b.color, 1.12);
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    // Roof furniture by type.
    if (b.roof === 'terrace') {
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
      ctx.fillStyle = shade(b.color, 0.8);
      ctx.fillRect(b.x + b.w / 2 - 14, b.y + b.h / 2 - 10, 28, 20);
    } else if (b.roof === 'gable') {
      ctx.fillStyle = shade(b.color, 0.75);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.h / 2);
      ctx.lineTo(b.x + b.w / 2, b.y + 6);
      ctx.lineTo(b.x + b.w, b.y + b.h / 2);
      ctx.closePath();
      ctx.fill();
    } else if (b.roof === 'dome') {
      ctx.fillStyle = shade(b.color, 1.3);
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, Math.min(b.w, b.h) * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    // Lit windows on the wall face (sunset gold).
    ctx.fillStyle = 'rgba(255,214,106,0.85)';
    const cols = Math.max(1, Math.floor(b.w / 34));
    const rows = Math.max(1, Math.floor(hgt * 0.55 / 16));
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if ((i * 7 + j * 3 + b.floors) % 4 === 0) continue;
        ctx.fillRect(b.x + 8 + i * 34, b.y + b.h + 4 + j * 15, 14, 9);
      }
    }
  }
}

// Point-in-building test (for collision + spawning).
export function buildingAt(S, x, y, pad = 0) {
  for (const b of S.buildings) {
    if (x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad) return b;
  }
  return null;
}
