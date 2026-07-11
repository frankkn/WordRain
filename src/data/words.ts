import CLASSIC from './themes/classic';
import ANIMALS from './themes/animals';

export interface LengthWeights {
  short: number;
  medium: number;
  long: number;
}

/** One theme pack. Quality bar (enforced by scripts/check-words.mjs):
 *  100+ words per tier, lowercase a–z, wide first-letter spread. */
export interface WordPools {
  short: readonly string[];  // 3–4 letters
  medium: readonly string[]; // 5–6 letters
  long: readonly string[];   // 7+ letters
}

/** Grows as packs land: food / code / space / fantasy still to come. */
export type ThemeName = 'classic' | 'animals';

export const THEMES: Record<ThemeName, WordPools> = {
  classic: CLASSIC,
  animals: ANIMALS,
};

/** Cycle order for the OPTIONS row. */
export const THEME_ORDER: readonly ThemeName[] = ['classic', 'animals'];

/**
 * Pick a word for a new drop. Tier is chosen by weight, then words whose
 * first letter collides with a live drop are avoided so the lock-on rule
 * stays unambiguous (falls back to the full pool if everything collides).
 */
export function pickWord(
  theme: ThemeName,
  weights: LengthWeights,
  excludeInitials: Set<string>,
): string {
  const tiers = ['short', 'medium', 'long'] as const;
  const total = weights.short + weights.medium + weights.long;
  let r = Math.random() * total;
  let tier: (typeof tiers)[number] = 'short';
  for (const t of tiers) {
    r -= weights[t];
    if (r <= 0) {
      tier = t;
      break;
    }
  }
  const pool = THEMES[theme][tier];
  const candidates = pool.filter((w) => !excludeInitials.has(w[0]));
  const list = candidates.length > 0 ? candidates : [...pool];
  return list[Math.floor(Math.random() * list.length)];
}
