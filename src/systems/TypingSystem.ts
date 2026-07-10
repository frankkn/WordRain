import type { Drop } from '../entities/Drop';

export interface TypeEvent {
  kind: 'advance' | 'complete' | 'miss';
  drop?: Drop;
}

/**
 * ZType-style lock-on typing:
 * - With no locked target, a keypress locks the lowest drop whose word
 *   starts with that letter (and types its first letter).
 * - While locked, only the next letter of the locked word counts.
 * - Wrong letters report a miss; progress is never reset.
 */
export class TypingSystem {
  locked: Drop | null = null;

  reset(): void {
    this.locked = null;
  }

  handleChar(raw: string, drops: Drop[]): TypeEvent {
    const ch = raw.toLowerCase();

    // Drop a stale lock (target already cleared or landed).
    if (this.locked && (this.locked.done || !drops.includes(this.locked))) {
      this.locked = null;
    }

    if (!this.locked) {
      const candidates = drops.filter((d) => d.typed === 0 && d.word[0] === ch);
      if (candidates.length === 0) return { kind: 'miss' };
      this.locked = candidates.reduce((a, b) => (a.y > b.y ? a : b));
    }

    const target = this.locked;
    if (target.word[target.typed] === ch) {
      target.typed++;
      if (target.done) {
        this.locked = null;
        return { kind: 'complete', drop: target };
      }
      return { kind: 'advance', drop: target };
    }
    return { kind: 'miss', drop: target };
  }
}
