// combat/weapons.js — Marina Heat: fists + pistol.
// Pistol fires toward the mouse (or facing on keyboard-only play). Ammo
// comes from Yara's shop. Bullets are simple fast projectiles that can
// wreck police cars; fists are a short-range shove for peds that block you.

import { dist } from '../state.js';
import { showMessage } from '../police/wanted.js';

export function updateWeapons(S, dt) {
  const p = S.player;
  // Fire with F or left mouse click (hold to keep firing).
  const wantFire = S.mouse.down || (S.justPressed && S.justPressed.KeyF);
  if (p.weapon === 'pistol' && p.hasPistol && wantFire && (S.fireCooldown || 0) <= 0) {
    if (p.pistolAmmo <= 0) {
      showMessage(S, 'Out of ammo — buy more at Yara\'s.');
      S.fireCooldown = 0.4;
      return;
    }
    p.pistolAmmo--;
    S.fireCooldown = 0.28;
    // Aim: mouse in world space when the pointer moved recently, else facing.
    const cam = S.camera;
    const wx = cam.x + (S.mouse.x - 640) / cam.zoom;
    const wy = cam.y + (S.mouse.y - 360) / cam.zoom;
    const aim = dist(wx, wy, p.x, p.y) > 40 ? Math.atan2(wy - p.y, wx - p.x) : p.angle;
    S.bullets.push({
      x: p.x + Math.cos(aim) * 20, y: p.y + Math.sin(aim) * 20,
      vx: Math.cos(aim) * 900, vy: Math.sin(aim) * 900, life: 0.7, dead: false,
    });
    if (S.audio) S.audio.shot();
  }
  S.fireCooldown = Math.max(0, (S.fireCooldown || 0) - dt);
  for (const b of S.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) b.dead = true;
    // Bullets stop at buildings.
    for (const bd of S.buildings) {
      if (b.x > bd.x && b.x < bd.x + bd.w && b.y > bd.y && b.y < bd.y + bd.h) { b.dead = true; break; }
    }
  }
  S.bullets = S.bullets.filter((b) => !b.dead);
}

// Switch weapon (1 = fists, 2 = pistol).
export function switchWeapon(S, n) {
  const p = S.player;
  if (n === 1) p.weapon = 'fists';
  if (n === 2 && p.hasPistol) p.weapon = 'pistol';
}
