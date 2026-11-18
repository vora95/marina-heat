// vehicles/cars.js — Marina Heat: the five stealable cars + car drawing.
// Each car is a plain object {id,name,x,y,angle,speed,color,top,accel,
// grip,condition,kind,owner}. drawCar renders any car-like object.

export const CAR_DEFS = [
  { name: 'Marea GT', top: 330, accel: 260, grip: 3.4, color: '#e07840', desc: 'Sport coupe, sunset orange' },
  { name: 'Vela Sedan', top: 265, accel: 210, grip: 3.0, color: '#2f8f8a', desc: 'Balanced four-door' },
  { name: 'Duna Pickup', top: 245, accel: 180, grip: 2.6, color: '#c9a35a', desc: 'Rugged work truck' },
  { name: 'Coral Cab', top: 255, accel: 200, grip: 2.9, color: '#f2c14e', desc: 'City taxi, always working' },
  { name: 'Brisa Compact', top: 235, accel: 230, grip: 3.6, color: '#7ac9a5', desc: 'Nimble little hatch' },
];

let nextId = 1;

export function makeCar(def, x, y, angle, kind = 'civil') {
  return {
    id: 'car' + (nextId++),
    name: def.name, x, y, angle, speed: 0,
    color: def.color, top: def.top, accel: def.accel, grip: def.grip,
    condition: 100, kind, // civil | player | police | traffic
    w: 46, h: 22, drift: 0, nitro: 0, lightBar: kind === 'police',
    brakeLight: false, hornTimer: 0,
  };
}

// Spawn the five stealable cars at fixed city spots.
export function spawnStealableCars(S) {
  const spots = [
    [CAR_DEFS[0], 1450, 760, 0],
    [CAR_DEFS[1], 1050, 1180, Math.PI / 2],
    [CAR_DEFS[2], 2300, 1980, Math.PI],
    [CAR_DEFS[3], 620, 1520, -Math.PI / 2],
    [CAR_DEFS[4], 2620, 700, Math.PI / 2],
  ];
  for (const [def, x, y, a] of spots) {
    const c = makeCar(def, x, y, a, 'civil');
    S.cars.push(c);
  }
}

export function drawCar(ctx, c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  // Soft shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(3, 5, 26, 13, c.angle, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(c.angle);
  // Body.
  ctx.fillStyle = c.color;
  roundRect(ctx, -23, -11, 46, 22, 7);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(-23, 8, 46, 3);
  // Cabin + windshield.
  ctx.fillStyle = '#1d2a3a';
  roundRect(ctx, -6, -9, 16, 18, 4);
  ctx.fill();
  ctx.fillStyle = 'rgba(180,220,255,0.5)';
  ctx.fillRect(6, -8, 4, 16);
  // Headlights / taillights.
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(21, -9, 3, 4);
  ctx.fillRect(21, 5, 3, 4);
  ctx.fillStyle = c.brakeLight ? '#ff2a1a' : '#a02020';
  ctx.fillRect(-24, -9, 3, 4);
  ctx.fillRect(-24, 5, 3, 4);
  // Police light bar.
  if (c.lightBar) {
    const t = (Date.now() / 240) % 2 < 1;
    ctx.fillStyle = t ? '#ff2a2a' : '#2a6aff';
    ctx.fillRect(-3, -11, 6, 4);
    ctx.fillStyle = t ? '#2a6aff' : '#ff2a2a';
    ctx.fillRect(-3, 7, 6, 4);
  }
  // Taxi checker for the Coral Cab.
  if (c.name === 'Coral Cab') {
    ctx.fillStyle = '#222';
    for (let i = 0; i < 5; i++) ctx.fillRect(-18 + i * 8, -2, 4, 4);
  }
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
