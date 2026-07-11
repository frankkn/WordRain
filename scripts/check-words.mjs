// Validates every theme pack in src/data/themes/ against the quality bar:
// 100+ words per tier, correct tier lengths (3-4 / 5-6 / 7-12), lowercase
// a-z only, no duplicates within a pack, wide first-letter spread.
// Run: node scripts/check-words.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const THEMES_DIR = 'src/data/themes';
const MIN_WORDS = 100;
const TIERS = {
  short: { min: 3, max: 4 },
  medium: { min: 5, max: 6 },
  long: { min: 7, max: 12 },
};

let ok = true;
const fail = (msg) => {
  ok = false;
  console.log(`  ✗ ${msg}`);
};

for (const file of readdirSync(THEMES_DIR).filter((f) => f.endsWith('.ts'))) {
  const src = readFileSync(join(THEMES_DIR, file), 'utf8');
  console.log(file);
  const packWords = [];
  for (const [tier, { min, max }] of Object.entries(TIERS)) {
    const m = src.match(new RegExp(`${tier}: \\[([\\s\\S]*?)\\]`));
    if (!m) {
      fail(`${tier}: tier not found`);
      continue;
    }
    const words = [...m[1].matchAll(/'([a-z]*)'/g)].map((x) => x[1]);
    packWords.push(...words);
    const badLen = words.filter((w) => w.length < min || w.length > max);
    const badChar = words.filter((w) => !/^[a-z]+$/.test(w));
    const initials = new Set(words.map((w) => w[0]));
    console.log(`  ${tier}: ${words.length} words, ${initials.size} initials`);
    if (words.length < MIN_WORDS) fail(`${tier}: only ${words.length} words (< ${MIN_WORDS})`);
    if (badLen.length) fail(`${tier} bad length: ${badLen.join(', ')}`);
    if (badChar.length) fail(`${tier} bad chars: ${badChar.join(', ')}`);
    if (initials.size < 15) fail(`${tier}: initials too concentrated (${initials.size})`);
  }
  const dupes = [...new Set(packWords.filter((w, i) => packWords.indexOf(w) !== i))];
  if (dupes.length) fail(`duplicates in pack: ${dupes.join(', ')}`);
}

console.log(ok ? 'ALL PACKS PASSED' : 'FAILED');
process.exit(ok ? 0 : 1);
