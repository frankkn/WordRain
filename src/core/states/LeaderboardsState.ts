import { fetchTop10, isConfigured, type LeaderboardEntry } from '../../net/leaderboard';
import type { Game } from '../Game';
import type { State } from './State';

type BoardStatus = 'unconfigured' | 'loading' | 'ready' | 'error';

export class LeaderboardsState implements State {
  private status: BoardStatus = 'unconfigured';
  private entries: LeaderboardEntry[] = [];

  constructor(private readonly game: Game) {}

  enter(): void {
    this.entries = [];
    if (!isConfigured()) {
      this.status = 'unconfigured';
      return;
    }
    this.status = 'loading';
    void this.load();
  }

  update(_dt: number): void {}

  render(): void {
    const r = this.game.renderer;
    r.dim(0.55);
    r.centerText('WORLD TOP 10', r.height * 0.14, 30, { bold: true, glow: true });

    const listTop = r.height * 0.28;
    if (this.status === 'unconfigured') {
      r.centerText('Leaderboard not configured', listTop + 24, 14, { color: '#8fb8dd' });
    } else if (this.status === 'loading') {
      r.centerText('Loading…', listTop + 24, 14);
    } else if (this.status === 'error') {
      r.centerText('Leaderboard unavailable', listTop + 24, 14, { color: '#ff9f9f' });
    } else if (this.entries.length === 0) {
      r.centerText('No scores yet — be the first!', listTop + 24, 14);
    } else {
      const listBottom = r.height - 60;
      const rowH = Math.max(16, Math.min(26, (listBottom - listTop) / this.entries.length));
      r.drawLeaderboard(this.entries, listTop, rowH);
    }

    r.centerText('Esc back', r.height - 30, 13, { color: '#8fb8dd' });
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.game.sound.menuBack();
      this.game.setState('menu');
    }
  }

  private async load(): Promise<void> {
    try {
      const entries = await fetchTop10();
      if (!this.game.isActive(this)) return;
      this.entries = entries;
      this.status = 'ready';
    } catch {
      if (this.game.isActive(this)) this.status = 'error';
    }
  }
}
