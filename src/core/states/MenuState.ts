import type { Game } from '../Game';
import type { State } from './State';

const ITEMS = ['NEW GAME', 'LEADERBOARDS', 'OPTIONS', 'EXIT'];

export class MenuState implements State {
  private selected = 0;

  constructor(private readonly game: Game) {}

  update(_dt: number): void {}

  render(): void {
    const g = this.game;
    const r = g.renderer;
    r.dim(0.3);
    const titleSize = Math.min(54, (r.width * 0.9) / ('WordRain'.length * 0.62));
    r.centerText('WordRain', r.height * 0.18, titleSize, { bold: true, glow: true });
    r.centerText(`Best ${g.best}`, r.height * 0.18 + titleSize * 0.8 + 8, 15, {
      color: '#8fb8dd',
    });
    r.drawMenu(ITEMS, this.selected, r.height * 0.38, 44);
    r.centerText('↑↓ select   ·   Enter confirm', r.height - 30, 13, { color: '#8fb8dd' });
  }

  onKey(e: KeyboardEvent): void {
    const g = this.game;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.selected = (this.selected + ITEMS.length - 1) % ITEMS.length;
        g.sound.menuMove();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.selected = (this.selected + 1) % ITEMS.length;
        g.sound.menuMove();
        break;
      case 'Enter':
        g.sound.menuSelect();
        if (ITEMS[this.selected] === 'NEW GAME') g.startRun();
        else if (ITEMS[this.selected] === 'LEADERBOARDS') g.setState('leaderboards');
        else if (ITEMS[this.selected] === 'OPTIONS') g.setState('options');
        else g.setState('exit');
        break;
    }
  }
}
