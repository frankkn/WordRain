import type { Game } from '../Game';
import type { State } from './State';

export class GameOverState implements State {
  constructor(private readonly game: Game) {}

  update(dt: number): void {
    // Let splash particles finish playing out behind the overlay.
    for (const p of this.game.particles) p.update(dt);
    this.game.particles = this.game.particles.filter((p) => p.alive);
  }

  render(): void {
    const g = this.game;
    g.renderScene();
    g.renderer.overlay('Game Over', [
      `Score ${g.score}`,
      g.newBest ? 'New Best!' : `Best ${g.best}`,
      '',
      'Press Enter to play again',
      'Press Esc for menu',
    ]);
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.game.startRun();
    if (e.key === 'Escape') this.game.setState('menu');
  }
}
