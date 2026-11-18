// missions/job3.js — "Sunset Taxi" (Lena).
// Lena's dispatcher job: pick up a passenger at the Old Town corner and
// drop them at the Hills villa before the meter runs out of patience.

export const JOB = {
  id: 3,
  title: 'Sunset Taxi',
  giver: 'lena',
  giverName: 'Lena',
  giverColor: '#f2c14e',
  giverX: 1050,
  giverY: 1180,
  reward: 350,
  briefing: [
    'My best driver called in sick and the evening rush is coming. One passenger is waiting at the Old Town corner.',
    'Pick them up, take them to the villa up in the Hills. Drive smooth — they tip for smooth, and they complain for dents.',
  ],
  steps: [
    { type: 'drive', x: 620, y: 1520, r: 80, text: 'Pick up the passenger at Old Town' },
    { type: 'drive', x: 3000, y: 500, r: 80, text: 'Drop the passenger at the Hills villa' },
  ],
};
