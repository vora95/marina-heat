// missions/job4.js — "Pier Lights" (Old Sal).
// On foot along the pier: collect three crates of Sal's fishing gear
// that washed up on the planks, then walk them back to the old man.
// No car, no cops — just the sea and the sunset.

export const JOB = {
  id: 4,
  title: 'Pier Lights',
  giver: 'sal',
  giverName: 'Old Sal',
  giverColor: '#5d7a4a',
  giverX: 130,
  giverY: 800,
  reward: 400,
  briefing: [
    'The tide brought my gear up onto the pier — three crates, scattered along the planks. My knees are older than this pier.',
    'Walk out there and fetch them for me. Watch your step near the end; the boards are loose and the sea is cold.',
  ],
  steps: [
    { type: 'collect', points: [{ x: 150, y: 790 }, { x: 260, y: 815 }, { x: 360, y: 785 }], text: 'Collect 3 crates along the pier (on foot)' },
    { type: 'talk', x: 130, y: 800, r: 70, text: 'Bring the crates back to Old Sal' },
  ],
};
