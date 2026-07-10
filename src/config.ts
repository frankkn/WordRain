export type DifficultyName = 'easy' | 'medium' | 'hard';

export interface DifficultyProfile {
  baseSpeed: number;    // px/s at ramp start
  maxSpeed: number;     // px/s at full ramp
  baseInterval: number; // s between drops at ramp start
  minInterval: number;  // s at full ramp
  rampDuration: number; // s of survival to reach full ramp
  lengthBias: number;   // >1 favors long words, <1 favors short (1 = medium)
}

export const DIFFICULTIES: Record<DifficultyName, DifficultyProfile> = {
  easy: {
    baseSpeed: 32,
    maxSpeed: 100,
    baseInterval: 2.6,
    minInterval: 1.0,
    rampDuration: 180,
    lengthBias: 0.6,
  },
  medium: {
    baseSpeed: 42,
    maxSpeed: 150,
    baseInterval: 2.2,
    minInterval: 0.7,
    rampDuration: 150,
    lengthBias: 1,
  },
  hard: {
    baseSpeed: 55,
    maxSpeed: 200,
    baseInterval: 1.8,
    minInterval: 0.55,
    rampDuration: 120,
    lengthBias: 1.6,
  },
};

// All non-difficulty gameplay tuning lives here.
export const CONFIG = {
  drop: {
    fontSize: 22,     // px, monospace glyphs
    charWidth: 0.62,  // fraction of fontSize per character
  },
  spawn: {
    firstDelay: 0.8, // s before the first drop of a run
  },
  water: {
    risePerMiss: 0.045,     // screen-height fraction added per missed drop
    gameOverFraction: 0.4,  // water level that ends the run
  },
  score: {
    perChar: 10,
    comboBonus: 0.1, // +10% per consecutive word, capped below
    comboCap: 10,
  },
  leaderboard: {
    size: 10,
    nameMaxLength: 12,
    timeoutMs: 5000,
  },
} as const;
