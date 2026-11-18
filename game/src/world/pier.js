// world/pier.js — Marina Heat: the pier.
// A wooden pier jutting west from the sand into the sea: plank deck with
// gaps, rail posts, a bait shack at the end and a lamp. It reads as a pier
// (planks + posts + water on both sides), never as a solid block.

export const PIER = { x0: 60, x1: 430, y0: 760, y1: 840 };

export function drawPier(ctx, S, cam) {
  const { x: cx, y: cy, zoom } = cam;
  if (PIER.x1 < cx - 1280 / zoom / 2 - 80 || PIER.x0 > cx + 1280 / zoom / 2 + 80) return;
  if (PIER.y1 < cy - 720 / zoom / 2 - 80 || PIER.y0 > cy + 720 / zoom / 2 + 80) return;
  // Support piles under the deck (visible in the water).
  ctx.fillStyle = '#4a3626';
  for (let x = PIER.x0 + 30; x < PIER.x1; x += 46) {
    for (const y of [PIER.y0 + 8, PIER.y1 - 8]) {
      ctx.beginPath();
      ctx.arc(x, y + 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Deck: individual planks with gaps so the water shows through.
  for (let x = PIER.x0; x < PIER.x1; x += 14) {
    const tone = 0.85 + ((x * 7) % 10) / 50;
    ctx.fillStyle = `rgb(${Math.round(150 * tone)},${Math.round(110 * tone)},${Math.round(70 * tone)})`;
    ctx.fillRect(x, PIER.y0, 11, PIER.y1 - PIER.y0);
  }
  // Edge rails + posts.
  ctx.fillStyle = '#6a4a28';
  ctx.fillRect(PIER.x0, PIER.y0 - 3, PIER.x1 - PIER.x0, 5);
  ctx.fillRect(PIER.x0, PIER.y1 - 2, PIER.x1 - PIER.x0, 5);
  for (let x = PIER.x0 + 10; x < PIER.x1; x += 34) {
    ctx.fillRect(x, PIER.y0 - 8, 5, 8);
    ctx.fillRect(x, PIER.y1, 5, 8);
  }
  // Bait shack at the pier end + its lamp.
  ctx.fillStyle = '#8a5a3a';
  ctx.fillRect(PIER.x0 + 16, PIER.y0 + 12, 52, 56);
  ctx.fillStyle = '#a85a4a';
  ctx.beginPath();
  ctx.moveTo(PIER.x0 + 10, PIER.y0 + 14);
  ctx.lineTo(PIER.x0 + 42, PIER.y0 - 6);
  ctx.lineTo(PIER.x0 + 74, PIER.y0 + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(PIER.x0 + 42, PIER.y0 + 40, 4, 0, Math.PI * 2);
  ctx.fill();
  // Fishing rods leaning on the rail.
  ctx.strokeStyle = '#3a3a44';
  ctx.lineWidth = 2;
  for (const ry of [PIER.y0 + 26, PIER.y0 + 52]) {
    ctx.beginPath();
    ctx.moveTo(PIER.x0 + 150, ry);
    ctx.lineTo(PIER.x0 + 178, ry - 22);
    ctx.stroke();
  }
}

// Is a point on the pier deck (walkable)?
export function onPier(x, y) {
  return x >= PIER.x0 && x <= PIER.x1 && y >= PIER.y0 && y <= PIER.y1;
}
