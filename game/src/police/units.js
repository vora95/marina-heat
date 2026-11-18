// police/units.js — Marina Heat: police pursuit cars.
// Spawn count scales with wanted stars. Units steer toward the player,
// ram to damage the car, and try to bust the player on foot. They despawn
// when the heat dies.

import { clamp, dist, angDiff } from '../state.js';
import { makeCar } from '../vehicles/cars.js';
import { buildingAt } from '../world/buildings.js';
import { circleRectPush } from '../state.js';
import { bustPlayer } from './wanted.js';

export function updatePolice(S, dt) {
  const want = S.wanted >= 1 ? Math.min(4, 1 + Math.floor(S.wanted / 2)) : 0;
  // Spawn to the wanted count, just off-screen from the player.
  while (S.police.length < want) {
    const a = S.rng() * Math.PI * 2;
    const x = clamp(S.player.x + Math.cos(a) * 900, 440, 3360);
    const y = clamp(S.player.y + Math.sin(a) * 700, 240, 2440);
    const c = makeCar(
      { name: 'PD Interceptor', top: 300, accel: 300, grip: 3.2, color: '#e8e8e8' },
      x, y, 0, 'police',
    );
    c.hp = 60;
    S.police.push(c);
  }
  while (S.police.length > want) S.police.pop();

  const p = S.player;
  for (const c of S.police) {
    const d = dist(c.x, c.y, p.x, p.y);
    const targetAngle = Math.atan2(p.y - c.y, p.x - c.x);
    const turn = clamp(angDiff(c.angle, targetAngle), -1, 1);
    c.angle += turn * 3.4 * dt;
    const want_speed = d > 320 ? 300 : 250;
    c.speed += clamp(want_speed - c.speed, -300 * dt, 300 * dt);
    c.x += Math.cos(c.angle) * c.speed * dt;
    c.y += Math.sin(c.angle) * c.speed * dt;
    c.x = clamp(c.x, 380, 3380);
    c.y = clamp(c.y, 60, 2470);
    const b = buildingAt(S, c.x, c.y, 0);
    if (b) {
      const push = circleRectPush(c.x, c.y, 22, b);
      if (push) { c.x += push.x; c.y += push.y; c.speed *= 0.5; }
    }
    // Ram the player's car.
    if (!p.onFoot && d < 48) {
      const car = S.cars.find((cc) => cc.id === p.carId);
      if (car) {
        car.condition = Math.max(0, car.condition - 6 * dt * 10);
        car.speed *= 0.92;
        if (car.condition <= 0) {
          p.hp = Math.max(0, p.hp - 25);
          if (p.hp <= 0) bustPlayer(S);
        }
      }
    }
    // Bust on foot: close + slow player.
    if (p.onFoot && d < 34 && Math.abs(p.speed || 0) < 60) {
      bustPlayer(S);
      return;
    }
    // Shot by the player: police cars take damage.
    for (const bl of S.bullets) {
      if (dist(bl.x, bl.y, c.x, c.y) < 26) {
        c.hp -= 20;
        bl.dead = true;
        if (c.hp <= 0) {
          explode(S, c);
          S.police = S.police.filter((u) => u !== c);
          S.heat = Math.min(100, S.heat + 30);
        }
      }
    }
  }
}

export function explode(S, c) {
  for (let i = 0; i < 22; i++) {
    S.particles.push({
      x: c.x, y: c.y,
      vx: (Math.random() - 0.5) * 320, vy: (Math.random() - 0.5) * 320,
      life: 0.7, maxLife: 0.7, size: 5 + Math.random() * 4,
      color: ['#ff7a2f', '#ffd76a', '#3a3a44'][i % 3], alpha: 0.95,
    });
  }
  if (S.audio) S.audio.crash();
}
