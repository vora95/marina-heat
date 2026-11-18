// traffic/pedestrians.js — Marina Heat: pedestrians.
// People stroll the sidewalks, cross at crosswalks and scatter when a
// car comes at them. Hitting one is a crime the police notice.

import { AVENUES, STREETS, clamp, dist } from '../state.js';

const SHIRTS = ['#e07840', '#2f8f8a', '#b8456b', '#f2c14e', '#7ac9a5', '#e8e0d0', '#5a6a8a'];
const SKINS = ['#ffd9a0', '#c98a5a', '#8a5a3a', '#f2c9a0'];

export function spawnPeds(S, n = 24) {
  const rng = S.rng;
  for (let i = 0; i < n; i++) {
    const vertical = rng() < 0.5;
    let x, y;
    if (vertical) {
      x = AVENUES[Math.floor(rng() * AVENUES.length)] + (rng() < 0.5 ? -64 : 64);
      y = 260 + rng() * 2000;
    } else {
      y = STREETS[Math.floor(rng() * STREETS.length)] + (rng() < 0.5 ? -52 : 52);
      x = 500 + rng() * 2700;
    }
    S.peds.push({
      x, y, angle: rng() * Math.PI * 2, speed: 26 + rng() * 26,
      shirt: SHIRTS[i % SHIRTS.length], skin: SKINS[i % SKINS.length],
      walk: rng() * 10, state: 'walk', down: 0, fleeX: 0, fleeY: 0,
    });
  }
}

export function updatePeds(S, dt) {
  const p = S.player;
  for (const pd of S.peds) {
    if (pd.state === 'down') {
      pd.down -= dt;
      if (pd.down <= 0) { pd.state = 'walk'; pd.x = 500 + S.rng() * 2600; pd.y = 300 + S.rng() * 1900; }
      continue;
    }
    // Flee from a fast car nearby.
    let threat = null;
    if (!p.onFoot && p.speed > 60 && dist(pd.x, pd.y, p.x, p.y) < 130) threat = p;
    for (const c of S.traffic) {
      if (c.speed > 60 && dist(pd.x, pd.y, c.x, c.y) < 90) { threat = c; break; }
    }
    if (threat) {
      const a = Math.atan2(pd.y - threat.y, pd.x - threat.x);
      pd.x += Math.cos(a) * 150 * dt;
      pd.y += Math.sin(a) * 150 * dt;
      pd.angle = a;
      pd.walk += dt * 14;
    } else {
      pd.x += Math.cos(pd.angle) * pd.speed * dt;
      pd.y += Math.sin(pd.angle) * pd.speed * dt;
      pd.walk += dt * 6;
      // Turn at random, stay near sidewalks.
      if (S.rng() < dt * 0.12) pd.angle += (S.rng() - 0.5) * 1.6;
      if (pd.x < 430 || pd.x > 3360 || pd.y < 240 || pd.y > 2440) pd.angle += Math.PI;
    }
    pd.x = clamp(pd.x, 420, 3380);
    pd.y = clamp(pd.y, 220, 2470);
    // Hit by the player's car: down, wanted up.
    if (!p.onFoot && Math.abs(p.speed) > 40 && dist(pd.x, pd.y, p.x, p.y) < 30) {
      pd.state = 'down'; pd.down = 6;
      S.heat = Math.min(100, S.heat + 40);
      S.cash = Math.max(0, S.cash - 10);
    }
  }
}

export function drawPed(ctx, pd, time) {
  ctx.save();
  ctx.translate(pd.x, pd.y);
  if (pd.state === 'down') {
    ctx.rotate(1.2);
    ctx.fillStyle = pd.shirt;
    ctx.fillRect(-9, -4, 18, 8);
    ctx.fillStyle = pd.skin;
    ctx.beginPath();
    ctx.arc(11, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const bob = Math.sin(pd.walk) * 2;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(pd.angle + Math.PI / 2);
  ctx.fillStyle = pd.shirt;
  ctx.fillRect(-5, -6 + bob * 0.3, 10, 12);
  ctx.fillStyle = pd.skin;
  ctx.beginPath();
  ctx.arc(0, -9, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.fillRect(-6, 5, 4, 6);
  ctx.fillRect(2, 5, 4, 6);
  ctx.restore();
}
