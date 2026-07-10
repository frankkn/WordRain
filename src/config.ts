export type DifficultyName = 'easy' | 'medium' | 'hard';

// All gameplay tuning lives here.
export const CONFIG = {
  drop: {
    fontSize: 22,     // px, monospace glyphs
    charWidth: 0.62,  // fraction of fontSize per character
    baseSpeed: 42,    // px/s at difficulty 0
    maxSpeed: 150,    // px/s at full difficulty
  },
  spawn: {
    baseInterval: 2.2, // s between drops at difficulty 0
    minInterval: 0.7,  // s at full difficulty
    firstDelay: 0.8,   // s before the first drop of a run
  },
  difficulty: {
    rampDuration: 150, // s of survival to reach full difficulty
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
