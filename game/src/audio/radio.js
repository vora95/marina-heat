// audio/radio.js — Marina Heat: three procedural radio stations.
// Tiny step sequencers over the same WebAudio context: no audio files,
// just scales + tempos. R switches station; the HUD shows what's playing.

export const STATIONS = [
  { name: 'SOL 98.5 — Sunset Drive', scale: [0, 3, 5, 7, 10], base: 220, bpm: 96, wave: 'triangle' },
  { name: 'PALM FM — Night Cruise', scale: [0, 2, 4, 7, 9], base: 196, bpm: 76, wave: 'sine' },
  { name: 'DOCK 107 — Heavy Haul', scale: [0, 3, 5, 6, 10], base: 165, bpm: 122, wave: 'sawtooth' },
];

export class Radio {
  constructor(music) {
    this.music = music;
    this.step = 0;
    this.nextTime = 0;
    this.melody = [0, 2, 4, 2, 3, 4, 1, 0, 2, 4, 3, 1, 0, -1, 2, 4];
  }

  update(S, dt) {
    const m = this.music;
    if (!m.started || !m.ctx || S.muted) return;
    const st = STATIONS[S.station % STATIONS.length];
    const spb = 60 / st.bpm / 2;
    if (m.ctx.currentTime >= this.nextTime) {
      this.nextTime = m.ctx.currentTime + spb;
      const deg = this.melody[this.step % this.melody.length];
      const semis = st.scale[((deg % st.scale.length) + st.scale.length) % st.scale.length] + 12 * Math.floor(deg / st.scale.length);
      const freq = st.base * Math.pow(2, semis / 12);
      try {
        const o = m.ctx.createOscillator();
        const g = m.ctx.createGain();
        o.type = st.wave;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.035, m.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, m.ctx.currentTime + spb * 0.95);
        o.connect(g);
        g.connect(m.ctx.destination);
        o.start();
        o.stop(m.ctx.currentTime + spb);
      } catch (e) { /* silent */ }
      // Kick on the beat.
      if (this.step % 4 === 0) {
        try {
          const o = m.ctx.createOscillator();
          const g = m.ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(120, m.ctx.currentTime);
          o.frequency.exponentialRampToValueAtTime(40, m.ctx.currentTime + 0.12);
          g.gain.setValueAtTime(0.06, m.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, m.ctx.currentTime + 0.14);
          o.connect(g);
          g.connect(m.ctx.destination);
          o.start();
          o.stop(m.ctx.currentTime + 0.15);
        } catch (e) { /* silent */ }
      }
      this.step++;
    }
  }

  stationName(S) {
    return STATIONS[S.station % STATIONS.length].name;
  }
}
