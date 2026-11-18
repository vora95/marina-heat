// dialog.js — Marina Heat: mission dialog UI.
// DOM overlay: giver portrait (procedural canvas) + name/role + briefing
// lines + Accept/Decline buttons. While a dialog is open the world
// pauses (mode 'dialog'); accepting starts the job.

import { GIVERS, drawPortrait } from './hud/portraits.js';

let els = null;

export function initDialog() {
  els = {
    root: document.getElementById('dialog'),
    portrait: document.getElementById('dialog-portrait'),
    name: document.getElementById('dialog-name'),
    role: document.getElementById('dialog-role'),
    text: document.getElementById('dialog-text'),
    accept: document.getElementById('dialog-accept'),
    decline: document.getElementById('dialog-decline'),
  };
}

export function openDialog(S, job, onAccept) {
  if (!els) return;
  const g = GIVERS[job.giver] || GIVERS.marina;
  drawPortrait(els.portrait, job.giver);
  els.name.textContent = g.name;
  els.role.textContent = g.role;
  els.text.innerHTML = '';
  for (const line of job.briefing) {
    const p = document.createElement('p');
    p.textContent = line;
    els.text.appendChild(p);
  }
  els.accept.textContent = `Accept — $${job.reward}`;
  els.root.classList.add('open');
  S.mode = 'dialog';
  els.accept.onclick = () => {
    closeDialog(S);
    onAccept();
  };
  els.decline.onclick = () => {
    closeDialog(S);
    S.missions.offered = null;
  };
}

export function closeDialog(S) {
  if (!els) return;
  els.root.classList.remove('open');
  if (S.mode === 'dialog') S.mode = 'playing';
}

export function showToast(text, ms = 2600) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), ms);
}
