// traffic/cars.js — Marina Heat: ambient traffic.
// Cars cruise the road grid, turn at intersections, brake for the car
// ahead and for the player. They keep the city alive behind the action.

import { AVENUES, STREETS, clamp, dist } from '../state.js';
import { nearestRoadPoint } from '../world/districts.js';
import { makeCar, drawCar } from '../vehicles/cars.js';

const TRAFFIC_COLORS = ['#8a8f9a', '#5a6a7a', '#a85a4a', '#4a5a3a', '#7a6a8a', '#b8b0a0', '#3a4a5a'];
const TRAFFIC_NAMES = ['Hatch', 'Sedan', 'Van', 'Coupe', 'Wagon'];

export function spawnTraffic(S, n = 14) {
  const rng = S.rng;
  for (let i = 0; i < n; i++) {
    const vertical = rng() < 0.5;
    let x, y, angle;
    if (vertical) {
      x = AVENUES[Math.floor(rng() * AVENUES.length)] + (rng() < 0.5 ? -20 : 20);
      y = 300 + rng() * 1900;
      angle = rng() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      y = STREETS[Math.floor(rng() * STREETS.length)] + (rng() < 0.5 ? -16 : 16);
      x = 500 + rng() * 2700;
      angle = rng() < 0.5 ? 0 : Math.PI;
    }
    const c = makeCar(
      { name: TRAFFIC_NAMES[i % TRAFFIC_NAMES.length], top: 150, accel: 120, grip: 2.4, color: TRAFFIC_COLORS[i % TRAFFIC_COLORS.length] },
      x, y, angle, 'traffic',
    );
    c.cruise = 110 + rng() * 50;
    c.nearMissed = false;
    S.traffic.push(c);
  }
}

export function updateTraffic(S, dt) {
  for (const c of S.traffic) {
    // Brake if something is right ahead.
    let blocked = false;
    const ax = c.x + Math.cos(c.angle) * 70, ay = c.y + Math.sin(c.angle) * 70;
    for (const o of [...S.traffic, ...S.cars, ...S.police]) {
      if (o === c) continue;
      if (dist(ax, ay, o.x, o.y) < 34) { blocked = true; break; }
    }
    const p = S.player;
    if (!p.onFoot && dist(ax, ay, p.x, p.y) < 40) blocked = true;
    const target = blocked ? 0 : c.cruise;
    c.speed += clamp(target - c.speed, -260 * dt, 140 * dt);
    c.speed = clamp(c.speed, 0, 200);
    c.x += Math.cos(c.angle) * c.speed * dt;
    c.y += Math.sin(c.angle) * c.speed * dt;
    // At an intersection, sometimes turn onto the crossing road.
    const nearV = AVENUES.find((ax2) => Math.abs(c.x - ax2) < 26);
    const nearH = STREETS.find((sy) => Math.abs(c.y - sy) < 22);
    if (nearV !== undefined && nearH !== undefined && S.rng() < dt * 0.5) {
      if (Math.abs(Math.cos(c.angle)) > 0.5) c.angle = S.rng() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
      else c.angle = S.rng() < 0.5 ? 0 : Math.PI;
    }
    // Snap back to the grid if pushed off-road.
    if (Math.abs(c.x - (nearV ?? c.x)) > 60 && !nearV) {
      const np = nearestRoadPoint(S, c.x, c.y);
      if (np) { c.x = np.x; c.y = np.y; c.angle = np.vertical ? (c.angle > 0 ? Math.PI / 2 : -Math.PI / 2) : (Math.abs(c.angle) < Math.PI / 2 ? 0 : Math.PI); }
    }
    c.x = clamp(c.x, 380, 3380);
    c.y = clamp(c.y, 60, 2470);
  }
}

export { drawCar };
