// missions/jobs.js — Marina Heat: mission registry + state machine.
// Nine story jobs (job1..job9) plus three repeatable side activities
// (street race, taxi fares, deliveries). Steps complete by proximity,
// driving, collecting, escaping the law, or racing checkpoints.

import { dist } from '../state.js';
import { showMessage, addHeat } from '../police/wanted.js';
import { JOB as JOB1 } from './job1.js';
import { JOB as JOB2 } from './job2.js';
import { JOB as JOB3 } from './job3.js';
import { JOB as JOB4 } from './job4.js';
import { JOB as JOB5 } from './job5.js';
import { JOB as JOB6 } from './job6.js';
import { JOB as JOB7 } from './job7.js';
import { JOB as JOB8 } from './job8.js';
import { JOB as JOB9 } from './job9.js';

export const JOB_DEFS = [JOB1, JOB2, JOB3, JOB4, JOB5, JOB6, JOB7, JOB8, JOB9];

export const SIDE_SPOTS = [
  { id: 'race', name: 'Street Race', x: 3020, y: 760, giver: 'dario', desc: 'Race the checkpoints — $200 a win' },
  { id: 'taxi', name: 'Taxi Fare', x: 1050, y: 1180, giver: 'lena', desc: 'Pick up fares around town — $80 a ride' },
  { id: 'delivery', name: 'Courier Run', x: 1820, y: 1120, giver: 'kiko', desc: 'Deliver 3 packages — $150 a run' },
];

export function doneCount(S) {
  return Object.keys(S.missions.done).length;
}

export function availableJobs(S) {
  return JOB_DEFS.filter((j) => !S.missions.done[j.id] && (j.id !== 9 || doneCount(S) >= 5));
}

export function nearestOffer(S) {
  if (S.missions.active) return null;
  let best = null, bd = 80;
  for (const j of availableJobs(S)) {
    const d = dist(S.player.x, S.player.y, j.giverX, j.giverY);
    if (d < bd) { bd = d; best = j; }
  }
  return best;
}

export function startJob(S, job) {
  S.missions.active = { ...job, steps: job.steps.map((s) => ({ ...s, collected: [] })) };
  S.missions.step = 0;
  if (job.onStart) job.onStart(S);
  showMessage(S, `JOB ${job.id}: ${job.title} — ${job.steps[0].text}`);
  if (S.audio) S.audio.pickup();
}

export function failJob(S, why) {
  if (!S.missions.active) return;
  showMessage(S, `JOB FAILED: ${why}`);
  S.missions.active = null;
  S.missions.step = 0;
}

export function completeJob(S) {
  const job = S.missions.active;
  if (!job) return;
  S.cash += job.reward;
  S.stats.earned += job.reward;
  S.stats.missionsDone++;
  S.missions.done[job.id] = true;
  S.missions.active = null;
  S.missions.step = 0;
  showMessage(S, `JOB DONE: ${job.title} — +$${job.reward}`);
  if (S.audio) S.audio.cash();
}

function stepDone(S, step) {
  const p = S.player;
  switch (step.type) {
    case 'goto': return dist(p.x, p.y, step.x, step.y) < (step.r || 60);
    case 'drive': return !p.onFoot && dist(p.x, p.y, step.x, step.y) < (step.r || 70);
    case 'steal': return !p.onFoot;
    case 'pickup': case 'deliver': case 'talk':
      return dist(p.x, p.y, step.x, step.y) < (step.r || 60);
    case 'collect': {
      for (const pt of step.points) {
        if (!step.collected.includes(pt) && dist(p.x, p.y, pt.x, pt.y) < 46) {
          step.collected.push(pt);
          if (S.audio) S.audio.pickup();
        }
      }
      return step.collected.length >= step.points.length;
    }
    case 'escape': return S.wanted === 0;
    case 'shop': return !!S.shoppedOnce;
    case 'race': {
      const cp = step.checkpoints[step.cp || 0];
      if (cp && dist(p.x, p.y, cp.x, cp.y) < 80) {
        step.cp = (step.cp || 0) + 1;
        if (S.audio) S.audio.pickup();
      }
      return (step.cp || 0) >= step.checkpoints.length;
    }
    default: return false;
  }
}

export function updateJobs(S, dt) {
  const m = S.missions;
  if (!m.active) return;
  const job = m.active;
  const step = job.steps[m.step];
  if (!step) { completeJob(S); return; }
  if (step.type === 'race') {
    step.timer = (step.timer ?? step.timeLimit) - dt;
    if (step.timer <= 0) { failJob(S, 'Out of time on the race.'); return; }
  }
  if (stepDone(S, step)) {
    m.step++;
    if (m.step >= job.steps.length) { completeJob(S); return; }
    const next = job.steps[m.step];
    showMessage(S, `JOB ${job.id}: ${next.text}`);
  }
}

// --- Side activities (repeatable) ---------------------------------------

export function nearestSideSpot(S) {
  let best = null, bd = 80;
  for (const sp of SIDE_SPOTS) {
    const d = dist(S.player.x, S.player.y, sp.x, sp.y);
    if (d < bd) { bd = d; best = sp; }
  }
  return best;
}

const RACE_CPS = [
  { x: 2620, y: 720 }, { x: 2620, y: 1920 }, { x: 1020, y: 1920 },
  { x: 1020, y: 320 }, { x: 3020, y: 320 },
];

export function startSide(S, id) {
  const p = S.player;
  if (id === 'race') {
    if (p.onFoot) { showMessage(S, 'You need a car for the race.'); return; }
    S.side.race = { cps: RACE_CPS, cp: 0, timer: 75 };
    showMessage(S, 'STREET RACE: hit all 5 checkpoints in 75s — $200!');
  } else if (id === 'taxi') {
    if (p.onFoot) { showMessage(S, 'You need a car to take fares.'); return; }
    const dests = [{ x: 3000, y: 500 }, { x: 620, y: 2200 }, { x: 2400, y: 1330 }, { x: 900, y: 1600 }];
    const dest = dests[Math.floor(S.rng() * dests.length)];
    S.side.taxi = { dest, fare: 80 };
    showMessage(S, 'TAXI: passenger aboard — follow the yellow marker.');
    if (S.audio) S.audio.pickup();
  } else if (id === 'delivery') {
    S.side.delivery = {
      points: [{ x: 620, y: 720 }, { x: 2220, y: 1520 }, { x: 3020, y: 1120 }],
      got: [], pay: 150,
    };
    showMessage(S, 'COURIER: deliver 3 packages — $150.');
  }
}

export function updateSide(S, dt) {
  const p = S.player;
  if (S.side.race) {
    const r = S.side.race;
    r.timer -= dt;
    const cp = r.cps[r.cp];
    if (cp && dist(p.x, p.y, cp.x, cp.y) < 80) {
      r.cp++;
      if (S.audio) S.audio.pickup();
      if (r.cp >= r.cps.length) {
        S.cash += 200; S.stats.earned += 200;
        showMessage(S, 'RACE WON — +$200!');
        if (S.audio) S.audio.cash();
        S.side.race = null;
        return;
      }
    }
    if (r.timer <= 0) { showMessage(S, 'Race lost — out of time.'); S.side.race = null; }
  }
  if (S.side.taxi) {
    const t = S.side.taxi;
    if (dist(p.x, p.y, t.dest.x, t.dest.y) < 70) {
      S.cash += t.fare; S.stats.earned += t.fare;
      showMessage(S, `Fare complete — +$${t.fare}`);
      if (S.audio) S.audio.cash();
      S.side.taxi = null;
    }
  }
  if (S.side.delivery) {
    const d = S.side.delivery;
    for (const pt of d.points) {
      if (!d.got.includes(pt) && dist(p.x, p.y, pt.x, pt.y) < 60) {
        d.got.push(pt);
        if (S.audio) S.audio.pickup();
      }
    }
    if (d.got.length >= d.points.length) {
      S.cash += d.pay; S.stats.earned += d.pay;
      showMessage(S, `Deliveries done — +$${d.pay}`);
      if (S.audio) S.audio.cash();
      S.side.delivery = null;
    }
  }
}

// Draw job giver markers + active step marker in world space.
export function drawJobMarkers(ctx, S) {
  for (const j of availableJobs(S)) {
    if (S.missions.active) break;
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const bob = Math.sin(S.time * 2 + j.id) * 5;
    ctx.fillText('★', j.giverX, j.giverY - 18 + bob);
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(j.giverName, j.giverX, j.giverY - 30 + bob);
    ctx.textAlign = 'left';
  }
  for (const sp of SIDE_SPOTS) {
    ctx.fillStyle = '#7ac9a5';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◆', sp.x, sp.y - 16 + Math.sin(S.time * 2 + sp.x) * 4);
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(sp.name, sp.x, sp.y - 28);
    ctx.textAlign = 'left';
  }
  const job = S.missions.active;
  if (job) {
    const step = job.steps[S.missions.step];
    if (step) {
      if (step.type === 'collect') {
        for (const pt of step.points) {
          if (step.collected.includes(pt)) continue;
          ctx.strokeStyle = '#ff5a4a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 26 + Math.sin(S.time * 3) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (step.x !== undefined) {
        const pulse = 30 + Math.sin(S.time * 4) * 8;
        ctx.strokeStyle = '#ff5a4a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(step.x, step.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ff5a4a';
        ctx.beginPath();
        ctx.arc(step.x, step.y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (step.type === 'race') {
        const cp = step.checkpoints[step.cp || 0];
        if (cp) {
          ctx.strokeStyle = '#ffd76a';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, 40, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }
  if (S.side.race) {
    const cp = S.side.race.cps[S.side.race.cp];
    if (cp) {
      ctx.strokeStyle = '#ffd76a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 40, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (S.side.taxi) {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(S.side.taxi.dest.x, S.side.taxi.dest.y, 34, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (S.side.delivery) {
    for (const pt of S.side.delivery.points) {
      if (S.side.delivery.got.includes(pt)) continue;
      ctx.strokeStyle = '#7ac9a5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 26, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawGivers(ctx, S) {
  // Givers stand at their spots (simple figures with a name tag).
  for (const j of JOB_DEFS) {
    if (S.missions.done[j.id]) continue;
    const x = j.giverX, y = j.giverY;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = j.giverColor || '#e8a34c';
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(j.giverName[0], x, y + 4);
    ctx.textAlign = 'left';
  }
}
