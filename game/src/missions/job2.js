// missions/job2.js — "Harbor Run" (Rico).
// Pick up a crate at the docks and deliver it to Yara's shop. A simple
// courier loop that crosses the whole city.

export const JOB = {
  id: 2,
  title: 'Harbor Run',
  giver: 'rico',
  giverName: 'Rico',
  giverColor: '#2f6d8f',
  giverX: 2400,
  giverY: 1330,
  reward: 450,
  briefing: [
    'A crate came off the night ferry and it is sitting at the docks, unguarded. My name is on it. Yara paid for it already.',
    'Drive down, pick it up, bring it to Yara\'s shop on Palm Row. Easy money, if the cops are asleep.',
  ],
  steps: [
    { type: 'drive', x: 2100, y: 2100, r: 80, text: 'Drive to the docks and pick up the crate' },
    { type: 'drive', x: 1180, y: 960, r: 80, text: 'Deliver the crate to Yara\'s shop' },
  ],
};
