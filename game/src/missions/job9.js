// missions/job9.js — "Five-Star Escape" (Marina, finale).
// The last job: five stars, the heli, every unit in the city — and one
// quiet road home to the safehouse. Survive it and Marina Verde is yours.

export const JOB = {
  id: 9,
  title: 'Five-Star Escape',
  giver: 'marina',
  giverName: 'Marina',
  giverColor: '#b8456b',
  giverX: 1440,
  giverY: 760,
  reward: 1000,
  briefing: [
    'One last job, and then you are not the new kid anymore. The whole city is going to be looking for you — five stars, heli, everything.',
    'Get to the safehouse. Do not stop, do not get cute, do not get busted. When the stars are gone, the city is yours.',
  ],
  onStart(S) {
    S.wanted = 5;
    S.heat = 100;
  },
  steps: [
    { type: 'drive', x: 780, y: 560, r: 90, text: 'Reach the safehouse with five stars on you' },
    { type: 'escape', text: 'Lose the cops — get wanted to 0' },
  ],
};
