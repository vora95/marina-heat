// missions/job8.js — "Hot Pursuit" (Nadia).
// Nadia wants the shot of her career: you, at wanted 3, with the heli
// overhead. Get the heat, then lose it — alive, with the footage.

export const JOB = {
  id: 8,
  title: 'Hot Pursuit',
  giver: 'nadia',
  giverName: 'Nadia',
  giverColor: '#e8e0d0',
  giverX: 900,
  giverY: 1600,
  reward: 550,
  briefing: [
    'I need the shot: a three-star chase with the heli over Palm Row. My readers eat that up. You are the star.',
    'I will make sure the cops notice you. Then you vanish — safehouse, side streets, whatever it takes. Do not get busted on camera.',
  ],
  onStart(S) {
    S.wanted = 3;
    S.heat = 60;
  },
  steps: [
    { type: 'escape', text: 'Escape the three-star chase — get wanted to 0' },
  ],
};
