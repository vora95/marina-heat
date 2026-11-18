// missions/job1.js — "First Keys" (Marina).
// Steal the orange Marea GT parked on Palm Row, then bring it to the
// garage. Teaches stealing, driving and the garage in one loop.

export const JOB = {
  id: 1,
  title: 'First Keys',
  giver: 'marina',
  giverName: 'Marina',
  giverColor: '#b8456b',
  giverX: 1440,
  giverY: 760,
  reward: 300,
  briefing: [
    'You are new in Marina Verde, and new people walk. That orange Marea GT over on Palm Row has been sitting there all afternoon.',
    'Take it. Drive it to my garage on the Hills edge. Do not scratch it — the buyer pays for clean paint.',
  ],
  steps: [
    { type: 'steal', text: 'Steal a car (walk up to one and press E)' },
    { type: 'drive', x: 2620, y: 620, r: 80, text: 'Drive the Marea GT to the garage' },
  ],
};
