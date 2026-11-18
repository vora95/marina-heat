// world/water.js — Marina Heat: the sea, the beach and the sunset on it.
// The west edge is open water with a low sun disc and a glittering
// reflection path; the sand strip carries foam lines and footprints.

import { SEA_EDGE, SAND_EDGE, SUNSET } from '../state.js';

export function drawWater(ctx, S, cam) {
  const { x: cx, y: cy, zoom } = cam;
  const vw = 1280 / zoom, vh = 720 / zoom;
  const x0 = cx - vw / 2 - 60, y0 = cy - vh / 2 - 60;
  const x1 = cx + vw / 2 + 60, y1 = cy + vh / 2 + 60;
  if (x1 < 0 || x0 > SAND_EDGE + 40) return;
  // Sea gradient: deep indigo west to teal at the shore.
  const g = ctx.createLinearGradient(0, 0, SAND_EDGE, 0);
  g.addColorStop(0, SUNSET.seaDeep);
  g.addColorStop(0.75, '#27607f');
  g.addColorStop(1, SUNSET.seaShallow);
  ctx.fillStyle = g;
  ctx.fillRect(Math.max(x0, -400), y0, Math.min(SEA_EDGE, x1) - Math.max(x0, -400), y1 - y0);
  // Sun disc low over the water + glitter path toward the shore.
  const sunY = cy + Math.sin(S.time * 0.05) * 4;
  const sg = ctx.createRadialGradient(150, sunY, 8, 150, sunY, 190);
  sg.addColorStop(0, 'rgba(255,215,106,0.95)');
  sg.addColorStop(0.35, 'rgba(255,122,47,0.55)');
  sg.addColorStop(1, 'rgba(255,122,47,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(150, sunY, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SUNSET.sunCore;
  ctx.beginPath();
  ctx.arc(150, sunY, 46, 0, Math.PI * 2);
  ctx.fill();
  // Glitter: short horizontal dashes whose phase shimmers with time.
  ctx.fillStyle = 'rgba(255,214,106,0.5)';
  for (let i = 0; i < 26; i++) {
    const gy = sunY - 130 + i * 11 + Math.sin(S.time * 1.3 + i * 2.1) * 3;
    const gw = 26 + ((i * 37) % 60);
    ctx.globalAlpha = 0.25 + 0.3 * Math.abs(Math.sin(S.time + i));
    ctx.fillRect(170 + ((i * 53) % 90), gy, gw, 3);
  }
  ctx.globalAlpha = 1;
  // Wave lines rolling toward the sand.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let w = 0; w < 4; w++) {
    const wx = SEA_EDGE - 26 - w * 34 - ((S.time * 12) % 34);
    ctx.beginPath();
    for (let y = y0; y < y1; y += 46) {
      const xx = wx + Math.sin(y * 0.02 + S.time * 0.8 + w) * 7;
      if (y === y0) ctx.moveTo(xx, y); else ctx.lineTo(xx, y);
    }
    ctx.stroke();
  }
  // Sand strip + foam edge.
  ctx.fillStyle = SUNSET.sand;
  ctx.fillRect(SEA_EDGE, y0, SAND_EDGE - SEA_EDGE, y1 - y0);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(SEA_EDGE - 4 + Math.sin(S.time * 0.8) * 3, y0, 6, y1 - y0);
  // Footprints and shells on the sand.
  ctx.fillStyle = 'rgba(120,80,40,0.35)';
  for (let i = 0; i < 12; i++) {
    const fx = SEA_EDGE + 14 + ((i * 61) % 52);
    const fy = y0 + ((i * 173) % Math.max(1, (y1 - y0)));
    ctx.beginPath();
    ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}
