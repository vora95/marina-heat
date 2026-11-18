// state.js — Marina Heat: central state, world constants, small helpers.
// Single source of truth: main.js owns the state object S; every system
// receives S and reads/writes its own slice. No module keeps hidden state.

export const WORLD_W = 3400;
export const WORLD_H = 2500;
export const SEA_EDGE = 340; // x < SEA_EDGE is sea; SEA_EDGE..420 is sand
export const SAND_EDGE = 420;
export const ROAD_W = 92;
export const STREET_W = 72;

// Vertical avenues (x) and horizontal streets (y) of the road grid.
export const AVENUES = [620, 1020, 1420, 1820, 2220, 2620, 3020];
export const STREETS = [320, 720, 1120, 1520, 1920, 2220];

export const DISTRICTS = [
  { name: 'Marina Bay', x0: 430, y0: 240, x1: 1000, y1: 1100, tint: '#e8a34c' },
  { name: 'Palm Row', x0: 1000, y0: 240, x1: 2200, y1: 1100, tint: '#d97b4f' },
  { name: 'Old Town', x0: 430, y0: 1100, x1: 1800, y1: 2200, tint: '#c96f5a' },
  { name: 'The Docks', x0: 1800, y0: 1900, x1: 3360, y1: 2460, tint: '#7a6a8a' },
  { name: 'The Hills', x0: 2200, y0: 240, x1: 3360, y1: 1100, tint: '#e07840' },
];

export const SUNSET = {
  skyTop: '#2b1a4e', skyMid: '#b8456b', skyLow: '#ff9a3d', sunCore: '#ffd76a',
  sunGlow: '#ff7a2f', seaDeep: '#1d3a5f', seaShallow: '#2f6d8f', sand: '#e8c184',
  asphalt: '#3a3a44', asphaltLine: '#d8c25a', sidewalk: '#8a7f74', grass: '#5d7a4a',
};

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const angDiff = (a, b) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};
export const angleLerp = (a, b, t) => a + angDiff(a, b) * clamp(t, 0, 1);

// Deterministic RNG (mulberry32) so screenshot scenes are reproducible.
export function makeRng(seed) {
  let s = seed >>> 0;
  return function rng() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];
export const range = (rng, a, b) => a + rng() * (b - a);

// Circle vs axis-aligned rect: push a circle out of a rect, return overlap depth.
export function circleRectPush(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nx, dy = cy - ny;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return null;
  const d = Math.sqrt(d2) || 0.001;
  const push = r - d;
  return { x: (dx / d) * push, y: (dy / d) * push, depth: push };
}

export function createState(seed) {
  return {
    seed,
    rng: makeRng(seed),
    time: 0,
    mode: 'title', // title | playing | paused | dialog | shop | garage | busted
    cash: 150,
    upgrades: { engine: 0, brakes: 0 },
    wanted: 0,
    heat: 0, // 0..100 within a wanted level; fills -> +1 star
    heatCooldown: 0,
    player: {
      x: 1500, y: 900, angle: -Math.PI / 2, speed: 0,
      onFoot: true, carId: null, hp: 100, armor: 0,
      pistolAmmo: 24, hasPistol: true, weapon: 'pistol',
      nitro: 100, driftScore: 0, drifting: false,
    },
    cars: [], // drivable cars parked/stolen in the world
    garage: [], // stored car ids
    traffic: [],
    peds: [],
    police: [],
    heli: { x: 0, y: 0, active: false, angle: 0, rotor: 0 },
    bullets: [],
    particles: [],
    popups: [],
    buildings: [],
    props: [],
    roads: [],
    shops: [],
    safehouse: { x: 780, y: 560, r: 60 },
    garageSpot: { x: 2620, y: 620, r: 70 },
    missions: { active: null, step: 0, done: {}, offered: null },
    side: { race: null, taxi: null, delivery: null },
    camera: { x: 1500, y: 900, zoom: 1 },
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    stats: { earned: 0, nearMiss: 0, drifts: 0, busted: 0, missionsDone: 0 },
    errors: [],
    fireCooldown: 0,
    shotMode: null,
    shotReady: false,
    muted: false,
    station: 0,
    saveTimer: 0,
    message: null,
    messageTimer: 0,
  };
}
