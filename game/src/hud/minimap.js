// hud/minimap.js — Marina Heat: the minimap.
// Bottom-right circular minimap: sea + districts + roads, the player
// arrow, mission star, shops, safehouse, garage, police and heli dots.

import { WORLD_W, WORLD_H, SEA_EDGE } from '../state.js';

export function drawMinimap(ctx, S) {
  const R = 92, cx = 1280 - R - 18, cy = 720 - R - 18;
  const scale = (R * 2) / WORLD_W;
  const mx = (x) => cx - R + x * scale;
  const my = (y) => cy - R + (y / WORLD_H) * (R * 2);
  // Disc.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#241a30';
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  // Sea.
  ctx.fillStyle = '#1d3a5f';
  ctx.fillRect(cx - R, cy - R, SEA_EDGE * scale, R * 2);
  // Roads.
  ctx.strokeStyle = 'rgba(232,224,208,0.6)';
  ctx.lineWidth = 2;
  for (const r of S.roads) {
    ctx.beginPath();
    ctx.moveTo(mx(r.x1), my(r.y1));
    ctx.lineTo(mx(r.x2), my(r.y2));
    ctx.stroke();
  }
  // Shops (green $), safehouse (house), garage (wrench), mission (star).
  const dot = (x, y, color, r = 4) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(mx(x), my(y), r, 0, Math.PI * 2);
    ctx.fill();
  };
  for (const sh of S.shops) dot(sh.x, sh.y, '#7ac9a5', 5);
  dot(S.safehouse.x, S.safehouse.y, '#ffd76a', 5);
  dot(S.garageSpot.x, S.garageSpot.y, '#e8e0d0', 5);
  if (S.missions.active) {
    const job = S.missions.active;
    const step = job.steps[S.missions.step];
    if (step && step.x !== undefined) {
      ctx.fillStyle = '#ff5a4a';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', mx(step.x), my(step.y) + 5);
      ctx.textAlign = 'left';
    }
  }
  if (S.side.taxi && S.side.taxi.dest) dot(S.side.taxi.dest.x, S.side.taxi.dest.y, '#f2c14e', 5);
  // Police (blue) + heli (red).
  for (const u of S.police) dot(u.x, u.y, '#2a6aff', 3);
  if (S.heli.active) dot(S.heli.x, S.heli.y, '#ff2a2a', 4);
  // Traffic (grey) + peds skipped for clarity.
  for (const t of S.traffic) dot(t.x, t.y, 'rgba(200,200,200,0.5)', 2);
  // Player arrow.
  ctx.fillStyle = '#fff';
  ctx.save();
  ctx.translate(mx(S.player.x), my(S.player.y));
  ctx.rotate(S.player.angle);
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, -6);
  ctx.lineTo(-6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();
  // Ring + N.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - R + 16);
  ctx.textAlign = 'left';
}
