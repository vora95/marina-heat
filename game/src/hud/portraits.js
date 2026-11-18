// hud/portraits.js — Marina Heat: procedural character portraits.
// Each mission giver gets a deterministic canvas portrait: skin tone,
// hair style + colour, eyes, brows, mouth, shirt and one signature item
// (cap, shades, earring, bandana...). No images, no borrowed art.

export const GIVERS = {
  marina: { name: 'Marina', role: 'Fixer', skin: '#c98a5a', hair: '#1d1a22', hairStyle: 'bob', shirt: '#b8456b', item: 'earring' },
  rico: { name: 'Rico', role: 'Mechanic', skin: '#8a5a3a', hair: '#2a2018', hairStyle: 'cap', shirt: '#2f6d8f', item: 'cap' },
  lena: { name: 'Lena', role: 'Taxi dispatcher', skin: '#ffd9a0', hair: '#e07840', hairStyle: 'bun', shirt: '#f2c14e', item: 'headset' },
  sal: { name: 'Old Sal', role: 'Fisherman', skin: '#c9a06a', hair: '#e8e0d0', hairStyle: 'beard', shirt: '#5d7a4a', item: 'beard' },
  dario: { name: 'Dario', role: 'Street racer', skin: '#f2c9a0', hair: '#111', hairStyle: 'mohawk', shirt: '#ff5a4a', item: 'shades' },
  yara: { name: 'Yara', role: 'Gun shop', skin: '#8a5a3a', hair: '#3a2a1a', hairStyle: 'braids', shirt: '#7a6a8a', item: 'bandana' },
  elmo: { name: 'Elmo', role: 'Dock boss', skin: '#c98a5a', hair: '#1d1a22', hairStyle: 'bald', shirt: '#5a6a7a', item: 'tattoo' },
  nadia: { name: 'Nadia', role: 'Reporter', skin: '#ffd9a0', hair: '#2a1a3a', hairStyle: 'long', shirt: '#e8e0d0', item: 'mic' },
  kiko: { name: 'Kiko', role: 'Courier', skin: '#c9a06a', hair: '#111', hairStyle: 'spiky', shirt: '#7ac9a5', item: 'cap' },
};

export function drawPortrait(canvas, giverId) {
  const g = GIVERS[giverId] || GIVERS.marina;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  // Sunset backdrop.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#2b1a4e');
  bg.addColorStop(1, '#ff9a3d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,215,106,0.8)';
  ctx.beginPath();
  ctx.arc(W * 0.78, H * 0.26, 16, 0, Math.PI * 2);
  ctx.fill();
  const cx = W / 2, cy = H * 0.52, R = W * 0.26;
  // Shirt / shoulders.
  ctx.fillStyle = g.shirt;
  ctx.beginPath();
  ctx.moveTo(cx - R * 1.5, H);
  ctx.quadraticCurveTo(cx - R * 1.4, cy + R * 0.9, cx, cy + R * 0.7);
  ctx.quadraticCurveTo(cx + R * 1.4, cy + R * 0.9, cx + R * 1.5, H);
  ctx.closePath();
  ctx.fill();
  // Neck + face.
  ctx.fillStyle = g.skin;
  ctx.fillRect(cx - R * 0.22, cy + R * 0.55, R * 0.44, R * 0.5);
  ctx.beginPath();
  ctx.ellipse(cx, cy, R * 0.82, R * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair by style.
  ctx.fillStyle = g.hair;
  if (g.hairStyle === 'bob') {
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.28, R * 0.86, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - R * 0.86, cy - R * 0.3, R * 0.2, R * 0.7);
    ctx.fillRect(cx + R * 0.66, cy - R * 0.3, R * 0.2, R * 0.7);
  } else if (g.hairStyle === 'long') {
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.3, R * 0.88, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - R * 0.88, cy - R * 0.3, R * 0.3, R * 1.3);
    ctx.fillRect(cx + R * 0.58, cy - R * 0.3, R * 0.3, R * 1.3);
  } else if (g.hairStyle === 'bun') {
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.28, R * 0.86, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - R * 1.1, R * 0.34, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.hairStyle === 'braids') {
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.28, R * 0.86, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - R * 0.9, cy - R * 0.2, R * 0.22, R * 1.1);
    ctx.fillRect(cx + R * 0.68, cy - R * 0.2, R * 0.22, R * 1.1);
  } else if (g.hairStyle === 'mohawk') {
    ctx.fillRect(cx - R * 0.12, cy - R * 1.5, R * 0.24, R * 0.8);
  } else if (g.hairStyle === 'spiky') {
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * R * 0.3 - R * 0.12, cy - R * 0.6);
      ctx.lineTo(cx + i * R * 0.3, cy - R * 1.25);
      ctx.lineTo(cx + i * R * 0.3 + R * 0.12, cy - R * 0.6);
      ctx.fill();
    }
  } else if (g.hairStyle === 'cap') {
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.3, R * 0.86, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - R * 0.9, cy - R * 0.42, R * 1.8, R * 0.24);
  } else if (g.hairStyle === 'beard') {
    ctx.beginPath();
    ctx.arc(cx, cy + R * 0.35, R * 0.62, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.32, R * 0.8, Math.PI, 0);
    ctx.fill();
  }
  // Eyes + brows + mouth.
  ctx.fillStyle = '#1d1a22';
  ctx.beginPath();
  ctx.arc(cx - R * 0.32, cy - R * 0.05, R * 0.09, 0, Math.PI * 2);
  ctx.arc(cx + R * 0.32, cy - R * 0.05, R * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1d1a22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - R * 0.48, cy - R * 0.28);
  ctx.lineTo(cx - R * 0.16, cy - R * 0.28);
  ctx.moveTo(cx + R * 0.16, cy - R * 0.28);
  ctx.lineTo(cx + R * 0.48, cy - R * 0.28);
  ctx.stroke();
  ctx.strokeStyle = '#7a3a2a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy + R * 0.32, R * 0.3, 0.25, Math.PI - 0.25);
  ctx.stroke();
  // Signature item.
  if (g.item === 'shades') {
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - R * 0.52, cy - R * 0.18, R * 0.42, R * 0.2);
    ctx.fillRect(cx + R * 0.1, cy - R * 0.18, R * 0.42, R * 0.2);
    ctx.fillRect(cx - R * 0.1, cy - R * 0.1, R * 0.2, 3);
  } else if (g.item === 'earring') {
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(cx - R * 0.82, cy + R * 0.15, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (g.item === 'headset') {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.1, R * 0.9, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else if (g.item === 'mic') {
    ctx.fillStyle = '#222';
    ctx.fillRect(cx + R * 0.7, cy + R * 0.3, 5, R * 0.5);
    ctx.beginPath();
    ctx.arc(cx + R * 0.7 + 2, cy + R * 0.28, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}
