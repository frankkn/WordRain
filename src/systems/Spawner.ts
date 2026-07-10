import { CONFIG } from '../config';
import { Drop } from '../entities/Drop';
import { pickWord } from '../data/words';
import type { Difficulty } from './Difficulty';

export class Spawner {
  private timer: number = CONFIG.spawn.firstDelay;

  reset(): void {
    this.timer = CONFIG.spawn.firstDelay;
  }

  update(dt: number, difficulty: Difficulty, drops: Drop[], width: number): Drop | null {
    this.timer -= dt;
    if (this.timer > 0) return null;
    this.timer = difficulty.spawnInterval * (0.8 + Math.random() * 0.4);

    const excludeInitials = new Set(drops.map((d) => d.word[0]));
    const word = pickWord(difficulty.lengthWeights, excludeInitials);

    const wordWidth = word.length * CONFIG.drop.fontSize * CONFIG.drop.charWidth;
    const margin = wordWidth / 2 + 16;
    const x = margin + Math.random() * Math.max(1, width - margin * 2);
    const speed = difficulty.fallSpeed * (0.85 + Math.random() * 0.3);

    return new Drop(word, x, -CONFIG.drop.fontSize, speed);
  }
}
