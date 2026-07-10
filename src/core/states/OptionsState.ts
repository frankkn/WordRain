import type { DifficultyName } from '../../config';
import type { Game } from '../Game';
import type { State } from './State';

const ROWS = ['MUSIC', 'SOUND', 'DIFFICULTY'];
const DIFF_ORDER: DifficultyName[] = ['easy', 'medium', 'hard'];

export class OptionsState implements State {
  private selected = 0;

  constructor(private readonly game: Game) {}

  update(_dt: number): void {}

  render(): void {
    const g = this.game;
    const r = g.renderer;
    r.dim(0.55);
    r.centerText('OPTIONS', r.height * 0.16, 34, { bold: true, glow: true });

    const values = [
      `${g.settings.music}/10`,
      `${g.settings.sound}/10`,
      g.settings.difficulty.toUpperCase(),
    ];
    const yTop = r.height * 0.34;
    const rowH = 52;
    const { ctx } = r;
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.font = `18px 'Consolas', 'Courier New', monospace`;
    ROWS.forEach((label, i) => {
      const y = yTop + i * rowH + rowH / 2;
      const sel = i === this.selected;
      ctx.fillStyle = sel ? '#ffd166' : '#cfe8ff';
      ctx.textAlign = 'right';
      ctx.fillText(`${sel ? '▶ ' : ''}${label}`, r.width / 2 - 16, y);
      ctx.textAlign = 'left';
      ctx.fillText(sel ? `◀ ${values[i]} ▶` : values[i], r.width / 2 + 16, y);
    });
    ctx.restore();

    r.centerText('↑↓ select   ·   ←→ adjust   ·   Esc back', r.height - 30, 13, {
      color: '#8fb8dd',
    });
  }

  onKey(e: KeyboardEvent): void {
    const g = this.game;
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.selected = (this.selected + ROWS.length - 1) % ROWS.length;
        g.sound.menuMove();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.selected = (this.selected + 1) % ROWS.length;
        g.sound.menuMove();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (this.selected === 0) {
          g.settings.music = Math.max(0, Math.min(10, g.settings.music + dir));
          g.applySettings(); // BGM volume changes audibly right away
        } else if (this.selected === 1) {
          g.settings.sound = Math.max(0, Math.min(10, g.settings.sound + dir));
          g.applySettings();
          g.sound.hit(); // preview blip at the new level
        } else {
          const idx = DIFF_ORDER.indexOf(g.settings.difficulty);
          g.settings.difficulty =
            DIFF_ORDER[(idx + dir + DIFF_ORDER.length) % DIFF_ORDER.length];
          g.applySettings();
          g.sound.menuMove();
        }
        break;
      case 'Escape':
        g.sound.menuBack();
        g.setState('menu');
        break;
    }
  }
}
