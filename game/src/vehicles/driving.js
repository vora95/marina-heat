// vehicles/driving.js — Marina Heat: driving physics.
// Arcade handling: accel/brake/reverse, speed-scaled steering, handbrake
// drift with skid marks + drift score, nitro with flames + speed lines,
// near-miss bonuses, building + car collision.

import { clamp, dist, circleRectPush } from '../state.js';
import { isDown } from '../input.js';
import { buildingAt } from '../world/buildings.js';
import { onPier } from '../world/pier.js';

export function updateDriving(S, dt) {
  const p = S.player;
  if (p.onFoot || !p.carId) return;
  const car = S.cars.find((c) => c.id === p.carId);
  if (!car) { p.onFoot = true; p.carId = null; return; }
  const up = isDown(S, 'up'), dn = isDown(S, 'down');
  const lf = isDown(S, 'left'), rt = isDown(S, 'right');
  const hb = isDown(S, 'handbrake');
  const nitro = isDown(S, 'nitro') && p.nitro > 0 && car.speed > 60;
  const upgrades = S.upgrades || { engine: 0, brakes: 0 };
  const top = car.top * (1 + upgrades.engine * 0.12);
  const accel = car.accel * (1 + upgrades.engine * 0.15);

  if (up) car.speed += accel * dt;
  if (dn) car.speed -= (car.speed > 0 ? 320 : 180) * dt * (1 + upgrades.brakes * 0.2);
  if (!up && !dn) car.speed -= Math.sign(car.speed) * 60 * dt;
  if (nitro) {
    car.speed += 260 * dt;
    p.nitro = Math.max(0, p.nitro - 34 * dt);
    spawnFlame(S, car);
  } else if (car.speed < 40) {
    p.nitro = Math.min(100, p.nitro + 4 * dt);
  }
  car.speed = clamp(car.speed, -90, top * (nitro ? 1.25 : 1));
  if (Math.abs(car.speed) < 4) car.speed = 0;

  // Steering: less at speed, more while drifting.
  const steer = (lf ? -1 : 0) + (rt ? 1 : 0);
  const steerRate = car.grip * (0.55 + 0.45 * (1 - Math.min(1, Math.abs(car.speed) / top)));
  car.angle += steer * steerRate * dt * Math.sign(car.speed || 1) * (hb ? 1.5 : 1);

  // Drift: handbrake at speed slides the car sideways, scores points.
  const sliding = hb && Math.abs(car.speed) > 120;
  p.drifting = sliding;
  const dirX = Math.cos(car.angle), dirY = Math.sin(car.angle);
  let vx = dirX * car.speed, vy = dirY * car.speed;
  if (sliding) {
    const slide = 0.55;
    vx = dirX * car.speed * (1 - slide) + (car.slideX || 0) * slide;
    vy = dirY * car.speed * (1 - slide) + (car.slideY || 0) * slide;
    car.slideX = vx; car.slideY = vy;
    p.driftScore += Math.abs(car.speed) * dt * 0.06;
    if (Math.random() < 0.6) spawnSkid(S, car);
    if (p.driftScore > 0 && Math.floor(p.driftScore / 50) > Math.floor((p.driftScore - Math.abs(car.speed) * dt * 0.06) / 50)) {
      addPopup(S, car.x, car.y - 30, `DRIFT +$${Math.round(p.driftScore)}`, '#ffd76a');
    }
  } else {
    car.slideX = vx; car.slideY = vy;
  }
  car.x += vx * dt;
  car.y += vy * dt;

  // World bounds + sea: cars cannot drive into the sea (sand stops them).
  car.x = clamp(car.x, 330, 3380);
  car.y = clamp(car.y, 40, 2480);
  // Buildings block cars (except when parked inside the garage yard).
  const b = buildingAt(S, car.x, car.y, 0);
  if (b) {
    const push = circleRectPush(car.x, car.y, 22, b);
    if (push) {
      car.x += push.x; car.y += push.y;
      if (Math.abs(car.speed) > 140) crashCar(S, car);
      car.speed *= 0.4;
    }
  }
  // Car vs traffic: bump, damage, near-miss when close but not touching.
  for (const t of S.traffic) {
    const d = dist(car.x, car.y, t.x, t.y);
    if (d < 46) {
      const push = 46 - d;
      const nx = (car.x - t.x) / (d || 1), ny = (car.y - t.y) / (d || 1);
      car.x += nx * push * 0.5; car.y += ny * push * 0.5;
      t.x -= nx * push * 0.5; t.y -= ny * push * 0.5;
      if (Math.abs(car.speed) > 120) { crashCar(S, car); t.speed *= 0.5; }
      car.speed *= 0.7;
    } else if (d < 86 && Math.abs(car.speed) > 200 && !t.nearMissed) {
      t.nearMissed = true;
      S.stats.nearMiss++;
      S.cash += 25; S.stats.earned += 25;
      addPopup(S, car.x, car.y - 34, 'NEAR MISS +$25', '#7ac9a5');
    }
    if (d > 200) t.nearMissed = false;
  }
  // Sync player to the car.
  p.x = car.x; p.y = car.y; p.angle = car.angle; p.speed = car.speed;
  car.brakeLight = dn;
}

function crashCar(S, car) {
  car.condition = Math.max(0, car.condition - 8);
  S.player.hp = Math.max(0, S.player.hp - 2);
  for (let i = 0; i < 8; i++) {
    S.particles.push({
      x: car.x, y: car.y, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160,
      life: 0.5, maxLife: 0.5, size: 4, color: '#ffb03a', alpha: 0.9,
    });
  }
  if (S.audio) S.audio.crash();
}

function spawnSkid(S, car) {
  const bx = car.x - Math.cos(car.angle) * 20, by = car.y - Math.sin(car.angle) * 20;
  S.particles.push({
    x: bx + (Math.random() - 0.5) * 8, y: by + (Math.random() - 0.5) * 8,
    vx: 0, vy: 0, life: 1.4, maxLife: 1.4, size: 5, color: 'rgba(20,20,24,0.55)', alpha: 0.55,
  });
}

function spawnFlame(S, car) {
  const bx = car.x - Math.cos(car.angle) * 26, by = car.y - Math.sin(car.angle) * 26;
  S.particles.push({
    x: bx, y: by, vx: -Math.cos(car.angle) * 120, vy: -Math.sin(car.angle) * 120,
    life: 0.3, maxLife: 0.3, size: 6, color: '#ff7a2f', alpha: 0.9,
  });
}

export function addPopup(S, x, y, text, color) {
  S.popups.push({ x, y, text, color: color || '#fff', life: 1.6, maxLife: 1.6 });
  if (S.popups.length > 12) S.popups.shift();
}

// On-foot movement (WASD), blocked by buildings, free on pier + beach.
export function updateOnFoot(S, dt) {
  const p = S.player;
  if (!p.onFoot) return;
  const up = isDown(S, 'up'), dn = isDown(S, 'down');
  const lf = isDown(S, 'left'), rt = isDown(S, 'right');
  let mx = (rt ? 1 : 0) - (lf ? 1 : 0);
  let my = (dn ? 1 : 0) - (up ? 1 : 0);
  if (!mx && !my) return;
  const len = Math.hypot(mx, my);
  mx /= len; my /= len;
  const sp = 190;
  const nx = p.x + mx * sp * dt, ny = p.y + my * sp * dt;
  if (!buildingAt(S, nx, p.y, 10) && nx > 40 && nx < 3380) p.x = nx;
  if (!buildingAt(S, p.x, ny, 10) && ny > 40 && ny < 2480) p.y = ny;
  if (mx || my) p.angle = Math.atan2(my, mx);
  p.speed = sp;
}
