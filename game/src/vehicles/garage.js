// vehicles/garage.js — Marina Heat: the garage system.
// Park the car you are driving to store it, swap to any stored car.
// The garage yard is the fenced lot at the Hills edge; cars kept here
// survive busted arrests and save/load.

import { dist } from '../state.js';
import { CAR_DEFS } from './cars.js';

export function nearGarage(S) {
  return dist(S.player.x, S.player.y, S.garageSpot.x, S.garageSpot.y) < S.garageSpot.r;
}

export function storeCurrentCar(S) {
  const p = S.player;
  if (p.onFoot || !p.carId) return 'No car to store — drive one in first.';
  const car = S.cars.find((c) => c.id === p.carId);
  if (!car) return 'Car lost.';
  if (S.garage.length >= 5) return 'Garage full (5 cars). Sell or swap one out.';
  if (S.garage.includes(car.id)) return 'Already stored.';
  S.garage.push(car.id);
  car.x = S.garageSpot.x - 40 + S.garage.length * 30;
  car.y = S.garageSpot.y + 40;
  car.angle = -Math.PI / 2;
  car.speed = 0;
  p.onFoot = true; p.carId = null;
  return `${car.name} stored in the garage.`;
}

export function takeOutCar(S, carId) {
  const car = S.cars.find((c) => c.id === carId);
  if (!car) return 'Car not found.';
  if (!S.garage.includes(carId)) return 'That car is not in the garage.';
  const p = S.player;
  if (!p.onFoot) return 'Get out of your car first.';
  S.garage = S.garage.filter((id) => id !== carId);
  car.x = S.player.x + 30; car.y = S.player.y + 10;
  car.angle = 0; car.speed = 0;
  p.carId = car.id; p.onFoot = false;
  p.angle = car.angle;
  return `Took the ${car.name} out.`;
}

export function garageList(S) {
  return S.garage.map((id) => S.cars.find((c) => c.id === id)).filter(Boolean);
}

export function drawGarageYard(ctx, S) {
  const g = S.garageSpot;
  ctx.strokeStyle = 'rgba(255,215,106,0.8)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(g.x - 90, g.y - 60, 180, 120);
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GARAGE', g.x, g.y - 68);
  // Stored cars are drawn by render.js from S.cars; here only the sign.
}

// Steal / enter the nearest drivable car (E key). Returns a message.
export function tryEnterCar(S) {
  const p = S.player;
  if (!p.onFoot) {
    // Get out.
    const car = S.cars.find((c) => c.id === p.carId);
    if (car) { car.speed = 0; p.x = car.x + 34; p.y = car.y + 10; }
    p.onFoot = true; p.carId = null;
    return 'Out of the car.';
  }
  let best = null, bd = 70;
  for (const c of S.cars) {
    if (c.kind === 'police' || c.kind === 'traffic') continue;
    const d = dist(p.x, p.y, c.x, c.y);
    if (d < bd) { bd = d; best = c; }
  }
  if (!best) return null;
  p.carId = best.id; p.onFoot = false;
  p.angle = best.angle;
  if (best.kind === 'civil') {
    best.kind = 'player';
    S.heat = Math.min(100, S.heat + 55);
    return `Stole the ${best.name}! The cops noticed.`;
  }
  return `Driving the ${best.name}.`;
}
