// render.js — Marina Heat: camera + draw orchestration + sunset sky.
// Draw order: sunset gradient frame -> ground -> water/sand -> roads ->
// pier -> props -> buildings -> entities (y-sorted) -> heli -> particles
// -> popups -> warm tint + vignette -> HUD.

import { WORLD_W, WORLD_H, SEA_EDGE, SAND_EDGE, SUNSET, clamp, lerp } from './state.js';
import { drawWater } from './world/water.js';
import { drawPier } from './world/pier.js';
import { drawProps } from './world/props.js';
import { drawBuildings } from './world/buildings.js';
import { drawCar } from './vehicles/cars.js';
import { drawPed } from './traffic/pedestrians.js';
import { drawHeli } from './police/heli.js';
import { drawHUD } from './hud/panels.js';
import { drawMinimap } from './hud/minimap.js';
import { drawShops } from './shops.js';
import { drawSafehouse } from './safehouse.js';
import { drawGarageYard } from './vehicles/garage.js';
import { drawJobMarkers, drawGivers } from './missions/jobs.js';

export function updateCamera(S, dt) {
  const p = S.player;
  const look = p.onFoot ? 0 : 90;
  const tx = clamp(p.x + Math.cos(p.angle) * look, 640, WORLD_W - 640);
  const ty = clamp(p.y + Math.sin(p.angle) * look, 360, WORLD_H - 360);
  const k = 1 - Math.pow(0.0015, dt);
  S.camera.x = lerp(S.camera.x, tx, k);
  S.camera.y = lerp(S.camera.y, ty, k);
  S.camera.zoom = p.onFoot ? 1.05 : 0.92;
}

function drawGround(ctx, S, cam) {
  const { x: cx, y: cy, zoom } = cam;
  const vw = 1280 / zoom, vh = 720 / zoom;
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  // City base: warm dusk pavement.
  ctx.fillStyle = '#5d4a44';
  ctx.fillRect(x0, y0, vw, vh);
  // District tints.
  for (const d of S.districts || []) {
    ctx.fillStyle = d.tint + '22';
    ctx.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0);
  }
  // Roads.
  for (const r of S.roads) {
    ctx.fillStyle = SUNSET.asphalt;
    if (r.vertical) ctx.fillRect(r.x1 - r.w / 2, r.y1, r.w, r.y2 - r.y1);
    else ctx.fillRect(r.x1, r.y1 - r.w / 2, r.x2 - r.x1, r.w);
  }
  // Sidewalk edges.
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 3;
  for (const r of S.roads) {
    if (r.vertical) {
      ctx.beginPath();
      ctx.moveTo(r.x1 - r.w / 2, r.y1); ctx.lineTo(r.x1 - r.w / 2, r.y2);
      ctx.moveTo(r.x1 + r.w / 2, r.y1); ctx.lineTo(r.x1 + r.w / 2, r.y2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1 - r.w / 2); ctx.lineTo(r.x2, r.y1 - r.w / 2);
      ctx.moveTo(r.x1, r.y1 + r.w / 2); ctx.lineTo(r.x2, r.y1 + r.w / 2);
      ctx.stroke();
    }
  }
  // Centre dashes.
  ctx.strokeStyle = SUNSET.asphaltLine;
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 22]);
  for (const r of S.roads) {
    ctx.beginPath();
    if (r.vertical) { ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x1, r.y2); }
    else { ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y1); }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // Crosswalks at avenue x street crossings.
  ctx.fillStyle = 'rgba(232,224,208,0.75)';
  for (const ax of [620, 1020, 1420, 1820, 2220, 2620, 3020]) {
    for (const sy of [320, 720, 1120, 1520, 1920, 2220]) {
      for (let i = -2; i <= 2; i++) ctx.fillRect(ax - 40 + i * 17, sy - 40, 9, 80);
    }
  }
}

function drawPlayer(ctx, S) {
  const p = S.player;
  if (!p.onFoot) return;
  // On-foot Marina: dark jacket, sunset hair, small shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 8, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle + Math.PI / 2);
  ctx.fillStyle = '#2b2b33';
  ctx.fillRect(-7, -9, 14, 18);
  ctx.fillStyle = '#e8a34c';
  ctx.fillRect(-7, -13, 14, 7);
  ctx.fillStyle = '#ffd9a0';
  ctx.beginPath();
  ctx.arc(0, -15, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGame(ctx, S) {
  const cam = S.camera;
  // Sunset frame behind everything (visible past the world edge).
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, SUNSET.skyTop);
  sky.addColorStop(0.55, SUNSET.skyMid);
  sky.addColorStop(1, SUNSET.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.save();
  ctx.translate(640, 360);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);
  drawGround(ctx, S, cam);
  drawWater(ctx, S, cam);
  drawPier(ctx, S, cam);
  drawProps(ctx, S, cam);
  drawBuildings(ctx, S, cam);
  drawShops(ctx, S);
  drawSafehouse(ctx, S);
  drawGarageYard(ctx, S);
  drawJobMarkers(ctx, S);
  drawGivers(ctx, S);
  // Entities y-sorted so nearer ones overlap correctly.
  const ents = [];
  for (const c of S.traffic) ents.push({ y: c.y, f: () => drawCar(ctx, c) });
  for (const c of S.cars) {
    if (c.id === S.player.carId) continue; // player car drawn below, once
    ents.push({ y: c.y, f: () => drawCar(ctx, c) });
  }
  for (const c of S.police) ents.push({ y: c.y, f: () => drawCar(ctx, c) });
  for (const pd of S.peds) ents.push({ y: pd.y, f: () => drawPed(ctx, pd, S.time) });
  if (!S.player.onFoot && S.player.carId) {
    const car = S.cars.find((c) => c.id === S.player.carId);
    if (car) ents.push({ y: car.y, f: () => drawCar(ctx, car) });
  }
  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) e.f();
  drawPlayer(ctx, S);
  // Bullets.
  ctx.fillStyle = '#ffd76a';
  for (const b of S.bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Heli + its searchlight cone (soft, never washes the buildings out).
  if (S.heli.active) drawHeli(ctx, S);
  // Particles.
  for (const pt of S.particles) {
    const a = Math.max(0, pt.life / pt.maxLife);
    ctx.globalAlpha = a * (pt.alpha || 0.8);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size * (0.5 + a * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Floating popups.
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px system-ui, sans-serif';
  for (const pp of S.popups) {
    const a = Math.max(0, pp.life / pp.maxLife);
    ctx.globalAlpha = a;
    ctx.fillStyle = pp.color;
    ctx.fillText(pp.text, pp.x, pp.y - (1 - a) * 30);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  // Warm sunset tint + vignette over the whole frame.
  const tint = ctx.createLinearGradient(0, 0, 0, 720);
  tint.addColorStop(0, 'rgba(255,122,47,0.05)');
  tint.addColorStop(1, 'rgba(184,69,107,0.10)');
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 1280, 720);
  const vg = ctx.createRadialGradient(640, 360, 320, 640, 360, 720);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(20,8,30,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, 1280, 720);
  // HUD (screen space).
  if (S.mode !== 'title') {
    drawHUD(ctx, S);
    drawMinimap(ctx, S);
  }
}
