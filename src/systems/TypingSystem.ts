import type { Drop } from '../entities/Drop';

export interface TypeEvent {
  kind: 'advance' | 'complete' | 'miss' | 'blocked';
  drop?: Drop;
}

/**
 * ZType-style lock-on typing:
 * - With no locked target, a keypress locks the lowest drop whose word
 *   starts with that letter (and types its first letter).
 * - While locked, only the next letter of the locked word counts.
 * - Wrong letters report a miss; progress is never reset.
 * - Right after the locked target drowns, lock-on is briefly blocked so
 *   leftover keystrokes for the lost word don't silently grab a new drop.
 */
export class TypingSystem {
  locked: Drop | null = null;
  private blockedUntil = 0;

  reset(): void {
    this.locked = null;
    this.blockedUntil = 0;
  }

  /** The locked drop drowned: clear the lock and block re-locks briefly. */
  notifyLockLost(now: number, blockSeconds: number): void {
    this.locked = null;
    this.blockedUntil = now + blockSeconds;
  }

  handleChar(raw: string, drops: Drop[], now: number): TypeEvent {
    const ch = raw.toLowerCase();

    // Drop a stale lock (target already cleared or landed).
    if (this.locked && (this.locked.done || !drops.includes(this.locked))) {
      this.locked = null;
    }

    if (!this.locked) {
      if (now < this.blockedUntil) return { kind: 'blocked' };
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
