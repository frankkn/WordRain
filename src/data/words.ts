export interface LengthWeights {
  short: number;
  medium: number;
  long: number;
}

const POOLS = {
  short: [
    'rain', 'drop', 'mist', 'dew', 'sky', 'sea', 'wet', 'fog', 'ice', 'wave',
    'pool', 'lake', 'tide', 'hail', 'snow', 'wind', 'leaf', 'fish', 'frog',
    'duck', 'boat', 'sail', 'swim', 'cold', 'blue', 'gray', 'drip', 'damp',
    'gust', 'bay', 'pond', 'mud', 'ebb', 'keel', 'oar', 'net', 'aqua', 'east',
  ],
  medium: [
    'cloud', 'storm', 'river', 'ocean', 'puddle', 'splash', 'stream', 'breeze',
    'window', 'vapor', 'humid', 'flood', 'frost', 'ripple', 'shower', 'meadow',
    'bridge', 'garden', 'autumn', 'winter', 'spring', 'pebble', 'anchor',
    'harbor', 'island', 'jacket', 'kettle', 'lagoon', 'nimbus', 'quench',
    'tundra', 'yonder', 'zephyr', 'billow', 'geyser', 'canals',
  ],
  long: [
    'drizzle', 'thunder', 'monsoon', 'rainbow', 'umbrella', 'downpour',
    'torrent', 'raincoat', 'moisture', 'overcast', 'droplets', 'lightning',
    'waterfall', 'hurricane', 'reservoir', 'blizzard', 'cascades', 'currents',
    'evaporate', 'floodgate', 'galoshes', 'icicles', 'jetstream', 'lakeside',
    'nautical', 'puddling', 'quagmire', 'seashore', 'tsunami', 'wellspring',
  ],
} as const;

/**
 * Pick a word for a new drop. Tier is chosen by weight, then words whose
 * first letter collides with a live drop are avoided so the lock-on rule
 * stays unambiguous (falls back to the full pool if everything collides).
 */
export function pickWord(weights: LengthWeights, excludeInitials: Set<string>): string {
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
  const pool = POOLS[tier];
  const candidates = pool.filter((w) => !excludeInitials.has(w[0]));
  const list = candidates.length > 0 ? candidates : [...pool];
  return list[Math.floor(Math.random() * list.length)];
}
