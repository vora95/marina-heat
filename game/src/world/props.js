// world/props.js — Marina Heat: street props.
// Palms (leaning trunks + fronds + sunset shadow), lamps that glow at
// dusk, benches, hydrants and dock containers. All drawn top-down.

export function drawProps(ctx, S, cam) {
  const { x: cx, y: cy, zoom } = cam;
  const vw = 1280 / zoom, vh = 720 / zoom;
  for (const p of S.props) {
    if (p.x < cx - vw / 2 - 60 || p.x > cx + vw / 2 + 60) continue;
    if (p.y < cy - vh / 2 - 60 || p.y > cy + vh / 2 + 60) continue;
    if (p.kind === 'palm') drawPalm(ctx, p, S.time);
    else if (p.kind === 'lamp') drawLamp(ctx, p, S.time);
    else if (p.kind === 'bench') {
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(p.x - 16, p.y - 6, 32, 12);
      ctx.fillStyle = '#5a4028';
      ctx.fillRect(p.x - 16, p.y - 10, 32, 4);
    } else if (p.kind === 'hydrant') {
      ctx.fillStyle = '#c23a2e';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8e0d0';
      ctx.fillRect(p.x - 2, p.y - 9, 4, 4);
    } else if (p.kind === 'container') {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 150, 58);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(p.x + i * 25, p.y);
        ctx.lineTo(p.x + i * 25, p.y + 58);
        ctx.stroke();
      }
      ctx.strokeRect(p.x, p.y, 150, 58);
    }
  }
}

function drawPalm(ctx, p, t) {
  const s = p.s || 1;
  // Shadow stretches north-east in the low sun.
  ctx.fillStyle = 'rgba(40,16,50,0.25)';
  ctx.beginPath();
  ctx.ellipse(p.x + 26 * s, p.y - 20 * s, 30 * s, 10 * s, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Leaning trunk.
  ctx.strokeStyle = '#8a6a44';
  ctx.lineWidth = 7 * s;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + 8 * s, p.y - 18 * s, p.x + 16 * s, p.y - 30 * s);
  ctx.stroke();
  // Fronds, swaying gently.
  const sway = Math.sin(t * 0.9 + p.x * 0.01) * 0.08;
  ctx.strokeStyle = '#3f7a34';
  ctx.lineWidth = 4 * s;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.5 + sway;
    ctx.beginPath();
    ctx.moveTo(p.x + 16 * s, p.y - 30 * s);
    ctx.quadraticCurveTo(
      p.x + 16 * s + Math.cos(a) * 22 * s, p.y - 30 * s + Math.sin(a) * 22 * s,
      p.x + 16 * s + Math.cos(a) * 34 * s, p.y - 30 * s + Math.sin(a) * 34 * s + 8 * s,
    );
    ctx.stroke();
  }
  // Coconuts.
  ctx.fillStyle = '#6a4a28';
  ctx.beginPath();
  ctx.arc(p.x + 14 * s, p.y - 26 * s, 3.4 * s, 0, Math.PI * 2);
  ctx.arc(p.x + 20 * s, p.y - 24 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawLamp(ctx, p, t) {
  // Pole + warm pool of light on the asphalt.
  ctx.fillStyle = 'rgba(255,190,90,0.10)';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 34 + Math.sin(t * 2 + p.x) * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(p.x - 2, p.y - 4, 4, 22);
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 6, 5, 0, Math.PI * 2);
  ctx.fill();
}
