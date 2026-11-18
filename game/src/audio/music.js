// audio/music.js — Marina Heat: WebAudio synth, no audio files.
// Engine hum follows speed, plus tiny synth SFX (cash, crash, shot,
// pickup, siren wail when police are near). Everything is guarded so the
// game runs silent (never throws) in headless browsers.

export class Music {
  constructor() {
    this.ctx = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.started = false;
  }

  ensure() {
    if (this.started) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.started = true;
      // Engine: two detuned saws through a lowpass, gain by speed.
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 50;
      const o2 = this.ctx.createOscillator();
      o2.type = 'square';
      o2.frequency.value = 25;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.0;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      this.engineOsc.connect(lp);
      o2.connect(lp);
      lp.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
      o2.start();
      this.engineOsc2 = o2;
      // Siren: sine that wails up/down when police chase.
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenOsc.type = 'sine';
      this.sirenOsc.frequency.value = 700;
      this.sirenGain = this.ctx.createGain();
      this.sirenGain.gain.value = 0.0;
      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);
      this.sirenOsc.start();
    } catch (e) { /* silent in headless */ }
  }

  update(S, dt) {
    if (!this.started || !this.ctx) return;
    const p = S.player;
    const speed = Math.abs(p.speed || 0);
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (this.engineOsc) {
      this.engineOsc.frequency.value = 46 + speed * 0.55;
      if (this.engineOsc2) this.engineOsc2.frequency.value = 23 + speed * 0.28;
      this.engineGain.gain.value = p.onFoot ? 0.0 : 0.028 + Math.min(0.05, speed * 0.00012);
    }
    if (this.sirenOsc) {
      const chasing = S.police.length > 0 && S.wanted > 0;
      const t = S.time;
      this.sirenOsc.frequency.value = 660 + Math.sin(t * 4.4) * 190;
      this.sirenGain.gain.value = chasing ? 0.016 : 0.0;
    }
  }

  blip(freq, dur, type = 'sine', vol = 0.08) {
    if (!this.started || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + dur);
    } catch (e) { /* silent */ }
  }

  cash() { this.blip(880, 0.12); setTimeout(() => this.blip(1318, 0.16), 70); }
  pickup() { this.blip(660, 0.1, 'triangle'); setTimeout(() => this.blip(990, 0.12, 'triangle'), 60); }
  shot() { this.blip(220, 0.09, 'square', 0.1); }
  crash() { this.blip(90, 0.25, 'sawtooth', 0.12); }
  denied() { this.blip(160, 0.15, 'square', 0.07); }
}
