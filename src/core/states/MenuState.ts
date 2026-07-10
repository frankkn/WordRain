import type { Game } from '../Game';
import type { State } from './State';

export class MenuState implements State {
  constructor(private readonly game: Game) {}

  update(_dt: number): void {}

  render(): void {
    this.game.renderer.overlay(
      'WordRain',
      [
        'Type the falling words before they reach the water',
        '',
        'Press Enter to start',
        `Best ${this.game.best}`,
      ],
      0.3,
    );
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.game.startRun();
  }
}
