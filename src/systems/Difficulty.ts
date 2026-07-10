import { DIFFICULTIES, type DifficultyProfile } from '../config';
import type { LengthWeights } from '../data/words';

/** Smoothly ramps the challenge over survival time, per difficulty profile. */
export class Difficulty {
  private elapsed = 0;
  private profile: DifficultyProfile = DIFFICULTIES.medium;

  reset(profile: DifficultyProfile): void {
    this.elapsed = 0;
    this.profile = profile;
  }

  update(dt: number): void {
    this.elapsed += dt;
  }

  /** 0 at run start → 1 at full difficulty. */
  get t(): number {
    return Math.min(1, this.elapsed / this.profile.rampDuration);
  }

  get fallSpeed(): number {
    const { baseSpeed, maxSpeed } = this.profile;
    return baseSpeed + (maxSpeed - baseSpeed) * this.t;
  }

  get spawnInterval(): number {
    const { baseInterval, minInterval } = this.profile;
    return baseInterval - (baseInterval - minInterval) * this.t;
  }

  /** Word-length mix shifts toward longer words as difficulty rises. */
  get lengthWeights(): LengthWeights {
    const bias = this.profile.lengthBias;
    return {
      short: (1 - 0.5 * this.t) / bias,
      medium: 0.8 + 0.2 * this.t,
      long: (0.2 + 0.8 * this.t) * bias,
    };
  }
}
