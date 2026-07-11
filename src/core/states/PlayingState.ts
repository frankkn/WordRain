import { CONFIG } from '../../config';
import { burst, splash } from '../../entities/Particle';
import type { Game } from '../Game';
import type { State } from './State';

export class PlayingState implements State {
  constructor(private readonly game: Game) {}

  update(dt: number): void {
    const g = this.game;
    g.difficulty.update(dt);

    const spawned = g.spawner.update(dt, g.difficulty, g.drops, g.renderer.width, g.runTheme);
    if (spawned) g.drops.push(spawned);

    for (const d of g.drops) d.update(dt);

    const waterTop = g.waterTop;
    const landed = g.drops.filter((d) => d.y >= waterTop);
    if (landed.length > 0) {
      const lostLock = g.typing.locked !== null && landed.includes(g.typing.locked);
      g.drops = g.drops.filter((d) => d.y < waterTop);
      g.combo = 0;
      for (const d of landed) {
        g.water = Math.min(1, g.water + CONFIG.water.risePerMiss);
        g.particles.push(...splash(d.x, waterTop));
        g.sound.splash();
      }
      if (lostLock) {
        g.typing.notifyLockLost(g.time, CONFIG.typing.lockLostBlockSeconds);
        g.lockLostFlash = CONFIG.typing.lockLostFlashSeconds;
        g.sound.lockLost();
      }
    }

    for (const p of g.particles) p.update(dt);
    g.particles = g.particles.filter((p) => p.alive);

    if (g.water >= CONFIG.water.gameOverFraction) g.endRun();
  }

  render(): void {
    this.game.renderScene();
  }

  onKey(e: KeyboardEvent): void {
    const g = this.game;
    // Held-key auto-repeat and shortcut chords (Ctrl+C etc.) are not typing.
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') {
      g.setState('paused');
      return;
    }
    if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;

    const ev = g.typing.handleChar(e.key, g.drops, g.time);
    switch (ev.kind) {
      case 'complete': {
        const drop = ev.drop!;
        g.drops = g.drops.filter((d) => d !== drop);
        g.addScore(drop.word);
        g.particles.push(...burst(drop.x, drop.y));
        g.sound.complete();
        break;
      }
      case 'advance':
        g.sound.hit();
        break;
      case 'miss':
        g.combo = 0;
        g.sound.miss();
        break;
      case 'blocked':
        // Leftover keystrokes for the drowned word — swallowed silently.
        break;
    }
  }
}
