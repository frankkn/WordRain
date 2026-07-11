import type { Game } from '../Game';
import type { State } from './State';

export class ExitState implements State {
  constructor(private readonly game: Game) {}

  enter(): void {
    // Browsers only let scripts close tabs they opened; usually a no-op,
    // in which case the farewell screen below stays visible.
    window.close();
  }

  update(_dt: number): void {}

  render(): void {
    const r = this.game.renderer;
    r.dim(0.7);
    r.centerText('Thanks for playing!', r.height * 0.4, 30, { bold: true, glow: true });
    r.centerText('You can close this tab now', r.height * 0.4 + 44, 15);
    r.centerText('Press any key to return to the menu', r.height * 0.4 + 74, 13, {
      color: '#8fb8dd',
    });
  }

  onKey(e: KeyboardEvent): void {
    // Key repeat from the held Enter that picked EXIT must not dismiss the
    // screen instantly, and a lone modifier press isn't "any key" either.
    if (e.repeat || ['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
    this.game.sound.menuBack();
    this.game.setState('menu');
  }
}
