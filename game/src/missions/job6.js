// missions/job6.js — "Smoke & Mirrors" (Yara).
// Buy gear at Yara's, then get noticed: the job heats you to wanted 2
// on purpose, and you have to shake the Marina PD the clean way.

export const JOB = {
  id: 6,
  title: 'Smoke & Mirrors',
  giver: 'yara',
  giverName: 'Yara',
  giverColor: '#7a6a8a',
  giverX: 1180,
  giverY: 960,
  reward: 500,
  briefing: [
    'You look unprepared, and unprepared gets caught. Buy yourself some armor and ammo from my shop — on the house, almost.',
    'Then make some noise downtown so the cops look at you, not at my delivery van. After that, disappear. Lay low till the stars fade.',
  ],
  onStart(S) {
    S.heat = 100;
    S.wanted = 1;
  },
  steps: [
    { type: 'shop', text: 'Buy something at Yara\'s shop (press E at the $ sign)' },
    { type: 'escape', text: 'Lose the cops — get your wanted level to 0' },
  ],
};
