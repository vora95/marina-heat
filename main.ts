// main.ts — Marina Heat entrypoint.
// Copies game/ and screenshots/ from this repository into the output
// directory and writes dossier.json with the kit's buildDossier library.
// Node 22 standard library only; deterministic: two runs write the same
// bytes. Run: MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

function copyTree(src: string, dest: string): void {
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const gameSrc = join(REPO_ROOT, 'game');
  const shotsSrc = join(REPO_ROOT, 'screenshots');
  if (!existsSync(gameSrc)) throw new Error('game/ is missing from the repository');
  if (!existsSync(shotsSrc)) throw new Error('screenshots/ is missing from the repository');
  // Fail fast on a bad shot set: the kit caps screenshots at 4 × 256 KiB,
  // and a stale starter frame must never reach the dossier.
  const shotNames = ['1-cover.jpg', '2-city.jpg', '3-mission.jpg', '4-shop.jpg'];
  for (const name of shotNames) {
    const p = join(shotsSrc, name);
    if (!existsSync(p)) throw new Error(`missing screenshot ${name}`);
    const size = statSync(p).size;
    if (size > 262144) throw new Error(`screenshot ${name} is ${size} bytes (cap 262144)`);
  }
  copyTree(gameSrc, join(OUT_DIR, 'game'));
  copyTree(shotsSrc, join(OUT_DIR, 'screenshots'));
  const dossier = buildDossier(OUT_DIR, CAPS);
  writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);
  console.log(`Marina Heat: wrote ${OUT_DIR} (dossier ${dossier.length} bytes)`);
}

main();
