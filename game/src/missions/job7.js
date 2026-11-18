// missions/job7.js — "Dockside" (Elmo).
// Three container checkpoints around the docks, in the work truck's
// backyard. Slow streets, tight turns, heavy traffic.

export const JOB = {
  id: 7,
  title: 'Dockside',
  giver: 'elmo',
  giverName: 'Elmo',
  giverColor: '#5a6a7a',
  giverX: 2100,
  giverY: 2050,
  reward: 450,
  briefing: [
    'Three containers need eyes on them before the night shift: north row, middle row, south row. The yard is a maze of steel.',
    'Drive the route, check each one, come back here. Do not hit the containers — the last driver did, and he does not work here anymore.',
  ],
  steps: [
    { type: 'drive', x: 2050, y: 2050, r: 80, text: 'Check the north-row container' },
    { type: 'drive', x: 2400, y: 2180, r: 80, text: 'Check the middle-row container' },
    { type: 'drive', x: 2750, y: 2050, r: 80, text: 'Check the south-row container' },
    { type: 'talk', x: 2100, y: 2050, r: 70, text: 'Report back to Elmo' },
  ],
};
