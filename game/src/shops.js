// shops.js — Marina Heat: the shop system.
// Two shops on the map: Yara's Ammo & Armor and Rico's Parts. Walk up,
// press E, buy with cash in a DOM overlay. Every purchase is real state:
// ammo, armor, nitro capacity and car upgrades change how the game plays.

import { dist } from './state.js';

export const SHOP_ITEMS = {
  yara: [
    { id: 'ammo', name: 'Pistol ammo ×12', price: 50, desc: '+12 pistol rounds' },
    { id: 'armor', name: 'Body armor', price: 120, desc: '+50 armor (absorbs damage first)' },
    { id: 'medkit', name: 'Medkit', price: 80, desc: 'Restore 50 HP' },
  ],
  rico: [
    { id: 'nitro', name: 'Nitro refill', price: 40, desc: 'Refill nitro tank to 100%' },
    { id: 'engine', name: 'Engine Mk II', price: 600, desc: '+12% top speed, +15% accel' },
    { id: 'brakes', name: 'Race brakes', price: 350, desc: '+20% braking power' },
    { id: 'repair', name: 'Full repair', price: 150, desc: 'Restore current car to 100%' },
  ],
};

export const SHOP_DEFS = [
  { id: 'yara', name: "Yara's Ammo & Armor", x: 1180, y: 960, color: '#7a6a8a' },
  { id: 'rico', name: "Rico's Parts", x: 2400, y: 1330, color: '#2f6d8f' },
];

export function buildShops(S) {
  S.shops = SHOP_DEFS.map((d) => ({ ...d }));
}

export function nearestShop(S) {
  let best = null, bd = 90;
  for (const sh of S.shops) {
    const d = dist(S.player.x, S.player.y, sh.x, sh.y);
    if (d < bd) { bd = d; best = sh; }
  }
  return best;
}

export function buyItem(S, shopId, itemId) {
  const item = (SHOP_ITEMS[shopId] || []).find((i) => i.id === itemId);
  if (!item) return 'No such item.';
  if (S.cash < item.price) {
    if (S.audio) S.audio.denied();
    return `Need $${item.price} — you have $${S.cash}.`;
  }
  const p = S.player;
  if (itemId === 'engine' && S.upgrades.engine >= 1) return 'Engine Mk II already installed.';
  if (itemId === 'brakes' && S.upgrades.brakes >= 1) return 'Race brakes already installed.';
  S.cash -= item.price;
  S.shoppedOnce = true;
  if (itemId === 'ammo') p.pistolAmmo += 12;
  else if (itemId === 'armor') p.armor = Math.min(100, p.armor + 50);
  else if (itemId === 'medkit') p.hp = Math.min(100, p.hp + 50);
  else if (itemId === 'nitro') p.nitro = 100;
  else if (itemId === 'engine') S.upgrades.engine = 1;
  else if (itemId === 'brakes') S.upgrades.brakes = 1;
  else if (itemId === 'repair') {
    const car = S.cars.find((c) => c.id === p.carId);
    if (car) car.condition = 100;
  }
  if (S.audio) S.audio.cash();
  return `Bought ${item.name} for $${item.price}.`;
}

export function drawShops(ctx, S) {
  for (const sh of S.shops) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(sh.x + 6, sh.y + 26, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sh.color;
    ctx.fillRect(sh.x - 26, sh.y - 20, 52, 40);
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', sh.x, sh.y + 6);
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(sh.name, sh.x, sh.y + 38);
    ctx.textAlign = 'left';
  }
}

// DOM shop overlay wiring (called once from main.js).
export function initShopUI(S) {
  const root = document.getElementById('shop');
  const title = document.getElementById('shop-title');
  const list = document.getElementById('shop-list');
  const close = document.getElementById('shop-close');
  const cash = document.getElementById('shop-cash');
  close.onclick = () => { root.classList.remove('open'); if (S.mode === 'shop') S.mode = 'playing'; };
  S._openShop = (shop) => {
    title.textContent = shop.name;
    cash.textContent = `$${S.cash}`;
    list.innerHTML = '';
    for (const item of SHOP_ITEMS[shop.id]) {
      const row = document.createElement('div');
      row.className = 'shop-row';
      row.innerHTML = `<span><b>${item.name}</b><i>${item.desc}</i></span><button>$${item.price}</button>`;
      row.querySelector('button').onclick = () => {
        const msg = buyItem(S, shop.id, item.id);
        document.getElementById('shop-msg').textContent = msg;
        cash.textContent = `$${S.cash}`;
      };
      list.appendChild(row);
    }
    document.getElementById('shop-msg').textContent = '';
    root.classList.add('open');
    S.mode = 'shop';
  };
}

export function openShop(S, shop) {
  if (S._openShop) S._openShop(shop);
}
