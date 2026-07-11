import type { DifficultyName } from '../../config';
import { fetchTop10, isConfigured, type LeaderboardEntry } from '../../net/leaderboard';
import type { Game } from '../Game';
import type { State } from './State';

type BoardStatus = 'unconfigured' | 'loading' | 'ready' | 'error';

const TABS: DifficultyName[] = ['easy', 'medium', 'hard'];

export class LeaderboardsState implements State {
  private tab = 1;
  private status: BoardStatus = 'unconfigured';
  /** Bumped on every enter() so stale fetches can't repopulate the cleared cache. */
  private generation = 0;
  private readonly cache = new Map<DifficultyName, LeaderboardEntry[]>();

  constructor(private readonly game: Game) {}

  enter(): void {
    this.generation++;
    this.cache.clear();
    this.tab = Math.max(0, TABS.indexOf(this.game.settings.difficulty));
    this.showTab(this.tab);
  }

  update(_dt: number): void {}

  render(): void {
    const r = this.game.renderer;
    r.dim(0.55);
    r.centerText('WORLD TOP 10', r.height * 0.12, 30, { bold: true, glow: true });

    // Difficulty tabs
    const tabY = r.height * 0.12 + 44;
    const spacing = Math.min(130, r.width / 3.4);
    const { ctx } = r;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    TABS.forEach((t, i) => {
      const sel = i === this.tab;
      ctx.font = `${sel ? 'bold ' : ''}15px 'Consolas', 'Courier New', monospace`;
      ctx.fillStyle = sel ? '#ffd166' : '#8fb8dd';
      ctx.fillText(t.toUpperCase(), r.width / 2 + (i - 1) * spacing, tabY);
    });
    ctx.restore();

    const listTop = tabY + 34;
    const entries = this.cache.get(TABS[this.tab]);
    if (this.status === 'unconfigured') {
      r.centerText('Leaderboard not configured', listTop + 24, 14, { color: '#8fb8dd' });
    } else if (this.status === 'loading') {
      r.centerText('Loading…', listTop + 24, 14);
    } else if (this.status === 'error') {
      r.centerText('Leaderboard unavailable', listTop + 24, 14, { color: '#ff9f9f' });
    } else if (!entries || entries.length === 0) {
      r.centerText('No scores yet — be the first!', listTop + 24, 14);
    } else {
      const listBottom = r.height - 60;
      const rowH = Math.max(16, Math.min(26, (listBottom - listTop) / entries.length));
      r.drawLeaderboard(entries, listTop, rowH);
    }

    r.centerText('←→ difficulty   ·   Esc back', r.height - 30, 13, { color: '#8fb8dd' });
  }

  onKey(e: KeyboardEvent): void {
    const g = this.game;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      this.showTab((this.tab + dir + TABS.length) % TABS.length);
      g.sound.menuMove();
    } else if (e.key === 'Escape') {
      g.sound.menuBack();
      g.setState('menu');
    }
  }

  private showTab(index: number): void {
    this.tab = index;
    if (!isConfigured()) {
      this.status = 'unconfigured';
      return;
    }
    const difficulty = TABS[index];
    if (this.cache.has(difficulty)) {
      this.status = 'ready';
      return;
    }
    this.status = 'loading';
    void this.load(difficulty);
  }

  private async load(difficulty: DifficultyName): Promise<void> {
    const gen = this.generation;
    try {
      const entries = await fetchTop10(difficulty);
      if (gen !== this.generation) return;
      this.cache.set(difficulty, entries);
      if (this.game.isActive(this) && TABS[this.tab] === difficulty) this.status = 'ready';
    } catch {
      if (gen === this.generation && this.game.isActive(this) && TABS[this.tab] === difficulty)
        this.status = 'error';
    }
  }
}
