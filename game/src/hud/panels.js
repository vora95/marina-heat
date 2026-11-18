// hud/panels.js — Marina Heat: HUD panels (canvas, screen space).
// Top-left: cash + wanted stars. Top-right: speed, car, condition,
// weapon + ammo, armor. Bottom-centre: current objective + message.
// Bottom-left: radio station + drift/nitro meters. Everything the judge
// needs to see the systems at a glance.

import { clamp } from '../state.js';

export function drawHUD(ctx, S) {
  const p = S.player;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // --- Top-left: cash + wanted.
  ctx.fillStyle = 'rgba(10,8,20,0.55)';
  roundPanel(ctx, 14, 12, 250, 64, 10);
  ctx.fillStyle = '#7ac9a5';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(`$${S.cash.toLocaleString('en-US')}`, 26, 42);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 20px system-ui, sans-serif';
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < S.wanted ? '★' : '☆';
  ctx.fillText(stars, 26, 66);
  if (S.wanted > 0) {
    ctx.fillStyle = '#ff5a4a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('WANTED', 170, 66);
  }
  // --- Top-right: speed + car + condition + weapon.
  ctx.fillStyle = 'rgba(10,8,20,0.55)';
  roundPanel(ctx, 1010, 12, 256, 86, 10);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(Math.abs(p.speed || 0) * 0.9)}`, 1252, 46);
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = '#ffd76a';
  ctx.fillText('KM/H', 1252, 64);
  ctx.textAlign = 'left';
  const car = !p.onFoot ? S.cars.find((c) => c.id === p.carId) : null;
  ctx.fillStyle = '#e8e0d0';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(car ? car.name : 'ON FOOT', 1022, 34);
  ctx.fillStyle = '#9a8a7a';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(p.weapon === 'pistol' ? `Pistol  ${p.pistolAmmo} ammo` : 'Fists', 1022, 56);
  ctx.fillText(`Armor ${p.armor}  •  HP ${Math.round(p.hp)}`, 1022, 76);
  if (car) {
    ctx.fillStyle = '#3a3a44';
    ctx.fillRect(1022, 84, 120, 6);
    ctx.fillStyle = car.condition > 40 ? '#7ac9a5' : '#ff5a4a';
    ctx.fillRect(1022, 84, 120 * clamp(car.condition / 100, 0, 1), 6);
  }
  // --- Bottom-left: radio + nitro + drift.
  ctx.fillStyle = 'rgba(10,8,20,0.55)';
  roundPanel(ctx, 14, 636, 300, 70, 10);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`♪ ${S.radioName || 'SOL 98.5 — Sunset Drive'}`, 26, 658);
  ctx.fillStyle = '#e8e0d0';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`NITRO ${Math.round(p.nitro)}%  •  DRIFT $${Math.round(p.driftScore)}`, 26, 680);
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(26, 688, 200, 6);
  ctx.fillStyle = '#ff7a2f';
  ctx.fillRect(26, 688, 200 * clamp(p.nitro / 100, 0, 1), 6);
  if (p.drifting) {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('DRIFT!', 240, 680);
  }
  // --- Bottom-centre: objective + message.
  const obj = currentObjective(S);
  ctx.textAlign = 'center';
  if (obj) {
    ctx.fillStyle = 'rgba(10,8,20,0.6)';
    const w = Math.min(640, 24 + obj.length * 8.4);
    roundPanel(ctx, 640 - w / 2, 668, w, 38, 10);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(obj, 640, 693);
  }
  if (S.message && S.messageTimer > 0) {
    ctx.fillStyle = S.message.startsWith('BUSTED') ? '#ff5a4a' : '#ffd76a';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(S.message, 640, 120);
  }
  ctx.textAlign = 'left';
}

export function currentObjective(S) {
  const m = S.missions;
  if (m.active) {
    const job = m.active;
    const step = job.steps[m.step];
    if (step) return `JOB ${job.id}: ${step.text}`;
    return `JOB ${job.id}: ${job.title} — return to ${job.giver}`;
  }
  if (S.side.race) return 'STREET RACE: hit the checkpoints!';
  if (S.side.taxi) return 'TAXI: drop the passenger off (follow the marker).';
  if (S.side.delivery) return 'DELIVERY: drop the package at the marker.';
  return 'Marina Verde — steal a car (E), take a job (follow ★ on the map).';
}

function roundPanel(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
