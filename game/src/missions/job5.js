// missions/job5.js — "Street King" (Dario).
// A five-checkpoint street race across Marina Verde against the clock.
// Drift, nitro and clean lines beat raw speed here.

export const JOB = {
  id: 5,
  title: 'Street King',
  giver: 'dario',
  giverName: 'Dario',
  giverColor: '#ff5a4a',
  giverX: 3020,
  giverY: 760,
  reward: 600,
  briefing: [
    'Every Friday the fast kids run the city. Five checkpoints, ninety seconds, no excuses.',
    'Beat the clock and the crown is yours — and so is my money. Use the nitro on the long avenue, drift the corners.',
  ],
  steps: [
    {
      type: 'race', timeLimit: 90, cp: 0,
      checkpoints: [
        { x: 2620, y: 720 }, { x: 2620, y: 1920 }, { x: 1020, y: 1920 },
        { x: 1020, y: 320 }, { x: 3020, y: 320 },
      ],
      text: 'Race: hit all 5 checkpoints in 90 seconds!',
    },
  ],
};
