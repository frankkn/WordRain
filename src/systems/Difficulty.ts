import { CONFIG } from '../config';
import type { LengthWeights } from '../data/words';

/** Smoothly ramps the challenge over survival time. */
export class Difficulty {
  private elapsed = 0;

  reset(): void {
    this.elapsed = 0;
  }

  update(dt: number): void {
    this.elapsed += dt;
  }

  /** 0 at run start → 1 at full difficulty. */
  get t(): number {
    return Math.min(1, this.elapsed / CONFIG.difficulty.rampDuration);
  }

  get fallSpeed(): number {
    const { baseSpeed, maxSpeed } = CONFIG.drop;
    return baseSpeed + (maxSpeed - baseSpeed) * this.t;
  }

  get spawnInterval(): number {
    const { baseInterval, minInterval } = CONFIG.spawn;
    return baseInterval - (baseInterval - minInterval) * this.t;
  }

  /** Word-length mix shifts toward longer words as difficulty rises. */
  get lengthWeights(): LengthWeights {
    return {
      short: 1 - 0.5 * this.t,
      medium: 0.8 + 0.2 * this.t,
      long: 0.2 + 0.8 * this.t,
    };
  }
}
