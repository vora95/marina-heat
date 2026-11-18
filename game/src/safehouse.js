// safehouse.js — Marina Heat: the safehouse + save system.
// Marina's apartment above the bay: walk in, press E, and the game saves,
// clears your wanted level and heals you. Autosave also runs every 40 s
// while playing. Saves live in localStorage under one versioned key.

import { dist } from './state.js';
import { clearWanted } from './police/wanted.js';

export const SAVE_KEY = 'marina-heat-save-v1';

export function nearSafehouse(S) {
  return dist(S.player.x, S.player.y, S.safehouse.x, S.safehouse.y) < S.safehouse.r;
}

export function useSafehouse(S) {
  clearWanted(S);
  S.player.hp = 100;
  saveGame(S);
  return 'Safehouse: saved, wanted cleared, HP restored.';
}

export function saveGame(S) {
  try {
    const data = {
      v: 1, cash: S.cash, wanted: S.wanted,
      px: S.player.x, py: S.player.y,
      hp: S.player.hp, armor: S.player.armor, ammo: S.player.pistolAmmo,
      nitro: S.player.nitro, upgrades: S.upgrades, garage: S.garage,
      missionsDone: S.missions.done, earned: S.stats.earned,
      time: S.time,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; }
}

export function loadGame(S) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d.v !== 1) return null;
    S.cash = d.cash;
    S.player.x = d.px; S.player.y = d.py;
    S.player.hp = d.hp; S.player.armor = d.armor;
    S.player.pistolAmmo = d.ammo; S.player.nitro = d.nitro;
    S.upgrades = d.upgrades || S.upgrades;
    S.garage = d.garage || [];
    S.missions.done = d.missionsDone || {};
    S.stats.earned = d.earned || 0;
    S.time = d.time || 0;
    return d;
  } catch (e) { return null; }
}

export function drawSafehouse(ctx, S) {
  const sh = S.safehouse;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(sh.x + 8, sh.y + 30, 44, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Apartment block with a lit "H" sign.
  ctx.fillStyle = '#b8456b';
  ctx.fillRect(sh.x - 34, sh.y - 26, 68, 52);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('H', sh.x, sh.y + 8);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('SAFEHOUSE', sh.x, sh.y + 40);
  ctx.textAlign = 'left';
  // Safe radius ring.
  ctx.strokeStyle = 'rgba(255,215,106,0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(sh.x, sh.y, sh.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
