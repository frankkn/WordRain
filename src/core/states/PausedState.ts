import type { Game } from '../Game';
import type { State } from './State';

export class PausedState implements State {
  constructor(private readonly game: Game) {}

  update(_dt: number): void {}

  render(): void {
    this.game.renderScene();
    this.game.renderer.overlay('Paused', ['Press Esc to resume']);
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.game.setState('playing');
  }
}
