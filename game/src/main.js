// main.js — Marina Heat: bootstrap, game loop, interactions, scenes.
// Wires every system together. Runs the loop, handles the E-key
// interactions (jobs, shops, safehouse, garage, side spots, cars), the
// title/pause/busted screens, autosave, and the ?shot= scene setups that
// the screenshot runs use (deterministic, seeded).

import { createState, WORLD_W, WORLD_H } from './state.js';
import { initInput, isDown, wasPressed, endFrameInput } from './input.js';
import { buildWorld } from './world/districts.js';
import { spawnStealableCars } from './vehicles/cars.js';
import { spawnTraffic, updateTraffic } from './traffic/cars.js';
import { spawnPeds, updatePeds } from './traffic/pedestrians.js';
import { updateDriving, updateOnFoot, addPopup } from './vehicles/driving.js';
import { tryEnterCar, nearGarage, storeCurrentCar, takeOutCar } from './vehicles/garage.js';
import { updatePolice } from './police/units.js';
import { updateHeli } from './police/heli.js';
import { updateWanted } from './police/wanted.js';
import { updateWeapons, switchWeapon } from './combat/weapons.js';
import { Music } from './audio/music.js';
import { Radio } from './audio/radio.js';
import { buildShops, nearestShop, openShop, initShopUI } from './shops.js';
import { nearSafehouse, useSafehouse, saveGame, loadGame } from './safehouse.js';
import { initDialog, openDialog, showToast } from './dialog.js';
import {
  availableJobs, nearestOffer, startJob, updateJobs, updateSide,
  nearestSideSpot, startSide,
} from './missions/jobs.js';
import { drawGame, updateCamera } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const SHOT = params.get('shot');
const SEED = SHOT ? 7 : (Date.now() % 100000);

const S = createState(SEED);
S.shotMode = SHOT;
window.__game = S;

buildWorld(S);
buildShops(S);
spawnStealableCars(S);
spawnTraffic(S, 14);
spawnPeds(S, 24);
S.audio = new Music();
S.radio = new Radio(S.audio);
initInput(S, canvas);
initDialog();
initShopUI(S);
// Audio starts only after a user gesture (menu click / first key press):
// Music.ensure() is called from the loop and the menu handlers, so no
// AudioContext is created here — headless runs stay console-clean.

window.addEventListener('error', (e) => {
  S.errors.push(String(e.message || e.error));
  const el = document.getElementById('shot-errors');
  if (el) el.textContent = JSON.stringify(S.errors);
});

// --- Scene setups for screenshots (deterministic) -------------------------
function sceneCover() {
  // Chase down the beach road (x=470) so the sea + sunset stay in frame.
  const car = S.cars[0];
  S.player.onFoot = false;
  S.player.carId = car.id;
  car.x = 470; car.y = 900; car.angle = Math.PI / 2; car.speed = 230;
  S.player.x = car.x; S.player.y = car.y; S.player.angle = car.angle;
  S.wanted = 3; S.heat = 55;
  S.cash = 2450;
  // Two police in pursuit behind on the same road, one traffic car ahead.
  S.police = [];
  for (const [dx, dy] of [[0, -220], [0, -360]]) {
    S.police.push({
      id: 'pd' + dy, name: 'PD Interceptor', x: car.x + dx, y: car.y + dy,
      angle: Math.PI / 2, speed: 235, color: '#e8e8e8', top: 300, accel: 300,
      grip: 3.2, condition: 100, kind: 'police', w: 46, h: 22, drift: 0,
      nitro: 0, lightBar: true, brakeLight: false, hp: 60,
    });
  }
  S.heli.active = true;
  S.heli.x = car.x + 100; S.heli.y = car.y - 220;
  S.traffic[0].x = 470; S.traffic[0].y = 1400; S.traffic[0].angle = Math.PI / 2; S.traffic[0].speed = 120;
  S.traffic[1].x = 1020; S.traffic[1].y = 700; S.traffic[1].angle = 0; S.traffic[1].speed = 120;
  S.traffic[2].x = 2620; S.traffic[2].y = 1500; S.traffic[2].angle = -Math.PI / 2; S.traffic[2].speed = 120;
  S.traffic[3].x = 1820; S.traffic[3].y = 1900; S.traffic[3].angle = Math.PI; S.traffic[3].speed = 120;
  // Active mission so the objective bar shows; clear the stale step-0
  // toast (startJob announces step 0, but the player is already in a car).
  startJob(S, availableJobs(S)[0]);
  S.missions.step = 1;
  S.message = '';
  S.messageTimer = 0;
  S.camera.x = car.x;
  S.camera.y = car.y;
}

function sceneCity() {
  const car = S.cars[1];
  S.player.onFoot = false;
  S.player.carId = car.id;
  car.x = 1420; car.y = 1120; car.angle = 0; car.speed = 170;
  S.player.x = car.x; S.player.y = car.y; S.player.angle = 0;
  S.wanted = 0; S.heat = 0;
  S.cash = 1180;
  for (let i = 0; i < 6; i++) {
    S.traffic[i].x = 1420 + (i % 2 ? -24 : 24);
    S.traffic[i].y = 900 + i * 130;
    S.traffic[i].angle = i % 2 ? -Math.PI / 2 : Math.PI / 2;
    S.traffic[i].speed = 120;
  }
  S.camera.x = car.x;
  S.camera.y = car.y;
}

function sceneMission() {
  S.player.x = 1440; S.player.y = 800;
  S.player.onFoot = true;
  S.player.angle = -Math.PI / 2;
  S.wanted = 1; S.heat = 40;
  S.cash = 640;
  const job = availableJobs(S)[0];
  openDialog(S, job, () => startJob(S, job));
  S.camera.x = 1440;
  S.camera.y = 820;
}

function sceneShop() {
  S.player.x = 1180; S.player.y = 1010;
  S.player.onFoot = true;
  S.player.angle = -Math.PI / 2;
  S.wanted = 1; S.heat = 30;
  S.cash = 980;
  S.player.pistolAmmo = 6;
  const shop = S.shops[0];
  openShop(S, shop);
  S.camera.x = 1180;
  S.camera.y = 1000;
}

if (SHOT === 'cover') sceneCover();
else if (SHOT === 'city') sceneCity();
else if (SHOT === 'mission') sceneMission();
else if (SHOT === 'shop') sceneShop();

// --- Menu / pause / busted overlays ---------------------------------------
const menuEl = document.getElementById('menu');
const pauseEl = document.getElementById('pause');
const bustedEl = document.getElementById('busted');

function showMenu() {
  S.mode = 'title';
  menuEl.classList.add('open');
  const cont = document.getElementById('menu-continue');
  cont.style.display = localStorage.getItem('marina-heat-save-v1') ? '' : 'none';
}
document.getElementById('menu-start').onclick = () => {
  menuEl.classList.remove('open');
  S.mode = 'playing';
  S.audio.ensure();
};
document.getElementById('menu-continue').onclick = () => {
  const d = loadGame(S);
  menuEl.classList.remove('open');
  S.mode = 'playing';
  S.audio.ensure();
  if (d) showToast('Save loaded — welcome back to Marina Verde.');
};
document.getElementById('menu-how').onclick = () => {
  document.getElementById('howto').classList.toggle('open');
};
document.getElementById('pause-resume').onclick = () => {
  pauseEl.classList.remove('open');
  S.mode = 'playing';
};
document.getElementById('pause-quit').onclick = () => {
  pauseEl.classList.remove('open');
  saveGame(S);
  showMenu();
};
document.getElementById('busted-continue').onclick = () => {
  bustedEl.classList.remove('open');
  S.mode = 'playing';
};

if (!SHOT) showMenu();
else S.mode = 'playing';

// --- Interactions ----------------------------------------------------------
function interact(S) {
  const offer = nearestOffer(S);
  if (offer) { openDialog(S, offer, () => startJob(S, offer)); return; }
  const shop = nearestShop(S);
  if (shop) { openShop(S, shop); return; }
  if (nearSafehouse(S)) { showToast(useSafehouse(S)); return; }
  if (nearGarage(S)) {
    const msg = S.player.onFoot
      ? (S.garage.length ? takeOutCar(S, S.garage[S.garage.length - 1]) : 'Garage is empty — park a car here first.')
      : storeCurrentCar(S);
    showToast(msg);
    return;
  }
  const spot = nearestSideSpot(S);
  if (spot) { startSide(S, spot.id); return; }
  const msg = tryEnterCar(S);
  if (msg) showToast(msg);
}

// --- Main loop -------------------------------------------------------------
let last = performance.now();
let frames = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  S.time += dt;
  frames++;

  if (S.mode === 'playing') {
    if (wasPressed(S, 'pause')) {
      S.mode = 'paused';
      pauseEl.classList.add('open');
    } else {
      if (wasPressed(S, 'enter')) interact(S);
      if (wasPressed(S, 'radio')) {
        S.station = (S.station + 1) % 3;
        showToast(`Radio: ${S.radio.stationName(S)}`);
      }
      if (S.justPressed && S.justPressed.Digit1) switchWeapon(S, 1);
      if (S.justPressed && S.justPressed.Digit2) switchWeapon(S, 2);
      updateOnFoot(S, dt);
      updateDriving(S, dt);
      updateTraffic(S, dt);
      updatePeds(S, dt);
      updatePolice(S, dt);
      updateHeli(S, dt);
      updateWanted(S, dt);
      updateWeapons(S, dt);
      updateJobs(S, dt);
      updateSide(S, dt);
      // Particles + popups.
      for (const pt of S.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt; }
      S.particles = S.particles.filter((pt) => pt.life > 0);
      for (const pp of S.popups) pp.life -= dt;
      S.popups = S.popups.filter((pp) => pp.life > 0);
      if (S.messageTimer > 0) S.messageTimer -= dt;
      // Autosave.
      S.saveTimer += dt;
      if (S.saveTimer > 40) { S.saveTimer = 0; saveGame(S); }
      S.radioName = S.radio.stationName(S);
      S.audio.update(S, dt);
      S.radio.update(S, dt);
      if (S.audio) S.audio.ensure();
    }
  } else if (S.mode === 'busted') {
    bustedEl.classList.add('open');
  }
  updateCamera(S, dt);
  drawGame(ctx, S);
  endFrameInput(S);

  // Screenshot readiness: after ~150 frames the scene has settled.
  if (SHOT && frames === 150 && !S.shotReady) {
    S.shotReady = true;
    document.title = 'SHOT-READY:' + SHOT;
    document.documentElement.setAttribute('data-shot-ready', '1');
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
