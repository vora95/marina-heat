// police/heli.js — Marina Heat: the police helicopter.
// Active at wanted 3+. It circles above the player, its searchlight cone
// sweeping the ground — a soft pool of light, deliberately narrow so it
// never bleaches the buildings out.

import { clamp, dist, angDiff } from '../state.js';

export function updateHeli(S, dt) {
  const h = S.heli;
  if (S.wanted < 3) { h.active = false; return; }
  h.active = true;
  h.rotor += dt * 22;
  const p = S.player;
  // Orbit the player at ~260px, slowly circling.
  const orbit = S.time * 0.35;
  const tx = p.x + Math.cos(orbit) * 240;
  const ty = p.y + Math.sin(orbit) * 240 - 60;
  h.x += clamp(tx - h.x, -1, 1) * 200 * dt;
  h.y += clamp(ty - h.y, -1, 1) * 200 * dt;
  h.x = clamp(h.x, 100, 3380);
  h.y = clamp(h.y, 60, 2470);
  h.angle += angDiff(h.angle, Math.atan2(p.y - h.y, p.x - h.x)) * dt * 2;
}

export function drawHeli(ctx, S) {
  const h = S.heli;
  if (!h.active) return;
  const p = S.player;
  // Ground shadow + searchlight cone (narrow, low alpha).
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(h.x + 26, h.y + 34, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const la = Math.atan2(p.y - h.y, p.x - h.x);
  const cone = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, 190);
  cone.addColorStop(0, 'rgba(255,240,180,0.30)');
  cone.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(h.x, h.y);
  ctx.arc(p.x, p.y, 190, la - 0.22, la + 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,240,180,0.16)';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 52, 0, Math.PI * 2);
  ctx.fill();
  // Heli body (top-down): dark fuselage, tail, spinning rotor blur.
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.rotate(h.angle);
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#20242e';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-44, -3, 22, 6);
  ctx.fillStyle = '#c23a2e';
  ctx.fillRect(-46, -6, 6, 12);
  ctx.fillStyle = 'rgba(180,220,255,0.8)';
  ctx.beginPath();
  ctx.arc(12, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Rotor disc (screen-space shimmer, drawn unrotated).
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(h.x, h.y, 40 + Math.sin(h.rotor) * 3, 8, h.rotor * 0.1, 0, Math.PI * 2);
  ctx.stroke();
}
