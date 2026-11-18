// world/districts.js — Marina Heat: city layout.
// Builds the road graph, district blocks and building plots from a fixed
// seed so every load (and every screenshot) sees the same city.

import { WORLD_W, WORLD_H, SEA_EDGE, SAND_EDGE, AVENUES, STREETS, DISTRICTS, makeRng, pick } from '../state.js';

const PALETTES = {
  'Marina Bay': ['#e8a34c', '#d97b4f', '#f2c14e', '#c96f5a', '#e07840'],
  'Palm Row': ['#d97b4f', '#e8a34c', '#b8456b', '#f2c14e', '#8a5a7a'],
  'Old Town': ['#c96f5a', '#a85a4a', '#d98a6a', '#8a5a4a', '#e07840'],
  'The Docks': ['#7a6a8a', '#5a6a7a', '#8a7a6a', '#6a5a7a', '#9a8a7a'],
  'The Hills': ['#e07840', '#f2c14e', '#e8a34c', '#d97b4f', '#c96f5a'],
};

export function buildWorld(S) {
  const rng = makeRng(20261119);
  S.districts = DISTRICTS;
  // Roads: vertical avenues + horizontal streets, as centre-line segments.
  S.roads = [];
  for (const x of AVENUES) S.roads.push({ x1: x, y1: 200, x2: x, y2: WORLD_H - 60, w: 92, vertical: true });
  for (const y of STREETS) S.roads.push({ x1: SAND_EDGE, y1: y, x2: WORLD_W - 40, y2: y, w: 72, vertical: false });
  // Beach road along the sand.
  S.roads.push({ x1: 470, y1: 200, x2: 470, y2: WORLD_H - 60, w: 72, vertical: true });

  // Buildings: fill each city block (between roads) with 1-3 plots.
  S.buildings = [];
  const xs = [SAND_EDGE + 40, ...AVENUES, WORLD_W - 40];
  const ys = [200, ...STREETS, WORLD_H - 60];
  for (let bi = 0; bi < xs.length - 1; bi++) {
    for (let bj = 0; bj < ys.length - 1; bj++) {
      const x0 = xs[bi] + 52, x1 = xs[bi + 1] - 52;
      const y0 = ys[bj] + 46, y1 = ys[bj + 1] - 46;
      const w = x1 - x0, h = y1 - y0;
      if (w < 90 || h < 70) continue;
      // Skip the plaza in Palm Row and the garage yard.
      if (x0 > 1380 && x0 < 1500 && y0 > 680 && y0 < 800) continue;
      if (x0 > 2560 && x0 < 2700 && y0 > 560 && y0 < 720) continue;
      const district = DISTRICTS.find((d) => x0 >= d.x0 && x0 < d.x1 && y0 >= d.y0 && y0 < d.y1) || DISTRICTS[1];
      const palette = PALETTES[district.name];
      const n = w > 260 && h > 200 ? 2 + Math.floor(rng() * 2) : 1;
      for (let k = 0; k < n; k++) {
        const bw = Math.min(w / (n === 1 ? 1 : 2) - 24, 150 + rng() * 90);
        const bh = Math.min(h - 24, 110 + rng() * 90);
        const bx = x0 + 12 + (k % 2) * (w / 2) + rng() * 8;
        const by = y0 + 12 + Math.floor(k / 2) * (h / 2) + rng() * 8;
        if (bx + bw > x1 || by + bh > y1) continue;
        S.buildings.push({
          x: bx, y: by, w: bw, h: bh,
          color: pick(rng, palette),
          roof: pick(rng, ['flat', 'flat', 'gable', 'terrace', 'dome']),
          floors: 1 + Math.floor(rng() * 4),
          district: district.name,
          windows: Math.floor(rng() * 3),
        });
      }
    }
  }

  // Props: palms along Palm Row avenue + beach, lamps on every corner.
  S.props = [];
  for (let y = 260; y < WORLD_H - 100; y += 130) {
    S.props.push({ kind: 'palm', x: 1000 - 62, y: y + 20, s: 0.9 + rng() * 0.5 });
    S.props.push({ kind: 'palm', x: 1020 + 62, y: y + 90, s: 0.9 + rng() * 0.5 });
  }
  for (let y = 300; y < WORLD_H - 100; y += 170) {
    S.props.push({ kind: 'palm', x: 445 + rng() * 20, y, s: 1 + rng() * 0.6 });
  }
  for (const x of AVENUES) for (const y of STREETS) {
    S.props.push({ kind: 'lamp', x: x + 58, y: y - 52 });
    if (rng() < 0.5) S.props.push({ kind: 'bench', x: x - 70, y: y + 58 });
    if (rng() < 0.4) S.props.push({ kind: 'hydrant', x: x + 64, y: y + 60 });
  }
  // Docks containers.
  for (let i = 0; i < 14; i++) {
    S.props.push({
      kind: 'container', x: 1950 + (i % 7) * 190, y: 2050 + Math.floor(i / 7) * 130,
      color: pick(rng, ['#b8456b', '#2f6d8f', '#e07840', '#5d7a4a', '#d8c25a']),
    });
  }
  return S;
}

// Is a point on a road (for traffic / ped spawning)?
export function onRoad(S, x, y) {
  for (const r of S.roads) {
    if (r.vertical) { if (Math.abs(x - r.x1) < r.w / 2 && y > r.y1 && y < r.y2) return true; }
    else if (Math.abs(y - r.y1) < r.w / 2 && x > r.x1 && x < r.x2) return true;
  }
  return false;
}

// Nearest point on the road graph (used by traffic AI to snap back).
export function nearestRoadPoint(S, x, y) {
  let best = null, bd = 1e12;
  for (const r of S.roads) {
    let px, py;
    if (r.vertical) { px = r.x1; py = Math.max(r.y1, Math.min(r.y2, y)); }
    else { py = r.y1; px = Math.max(r.x1, Math.min(r.x2, x)); }
    const d = (px - x) * (px - x) + (py - y) * (py - y);
    if (d < bd) { bd = d; best = { x: px, y: py, vertical: r.vertical, road: r }; }
  }
  return best;
}
