import {
  fetchTop10,
  isConfigured,
  qualifies,
  submitScore,
  type LeaderboardEntry,
} from '../../net/leaderboard';
import { SubmitForm } from '../../ui/SubmitForm';
import type { Game } from '../Game';
import type { State } from './State';

type BoardStatus = 'unconfigured' | 'loading' | 'ready' | 'error';

export class GameOverState implements State {
  private status: BoardStatus = 'unconfigured';
  private entries: LeaderboardEntry[] = [];
  private highlight = -1; // player's row after submitting
  private submitted = false;
  private readonly form = new SubmitForm();

  constructor(private readonly game: Game) {}

  enter(): void {
    this.entries = [];
    this.highlight = -1;
    this.submitted = false;
    if (!isConfigured()) {
      this.status = 'unconfigured';
      return;
    }
    this.status = 'loading';
    void this.loadBoard(true);
  }

  update(dt: number): void {
    // Let splash particles finish playing out behind the overlay.
    for (const p of this.game.particles) p.update(dt);
    this.game.particles = this.game.particles.filter((p) => p.alive);
  }

  render(): void {
    const g = this.game;
    const r = g.renderer;
    g.renderScene();
    r.dim(0.6);

    const titleY = r.height * 0.1;
    r.centerText('Game Over', titleY, Math.min(44, r.width * 0.1), { bold: true, glow: true });
    r.centerText(
      `Score ${g.score}   ·   ${g.newBest ? 'New Best!' : `Best ${g.best}`}`,
      titleY + 42,
      16,
      { color: g.newBest ? '#ffd166' : '#cfe8ff' },
    );

    if (this.status !== 'unconfigured') {
      const boardTop = titleY + 76;
      r.centerText('— World Top 10 —', boardTop, 15, { color: '#8fd0ff' });
      const listTop = boardTop + 22;
      if (this.status === 'loading') {
        r.centerText('Loading…', listTop + 24, 14);
      } else if (this.status === 'error') {
        r.centerText('World top 10 unavailable', listTop + 24, 14, { color: '#ff9f9f' });
      } else if (this.entries.length === 0) {
        r.centerText('No scores yet — be the first!', listTop + 24, 14);
      } else {
        const listBottom = r.height - 60;
        const rowH = Math.max(16, Math.min(26, (listBottom - listTop) / this.entries.length));
        r.drawLeaderboard(this.entries, listTop, rowH, this.highlight);
      }
    }

    if (!this.form.isOpen) {
      r.centerText('Enter play again   ·   Esc menu', r.height - 30, 14);
    }
  }

  onKey(e: KeyboardEvent): void {
    if (this.form.isOpen) return; // typing a name, not a game command
    if (e.key === 'Enter') this.game.startRun();
    if (e.key === 'Escape') this.game.setState('menu');
  }

  private async loadBoard(offerSubmit: boolean): Promise<void> {
    try {
      const entries = await fetchTop10();
      if (!this.game.isActive(this)) return; // player already moved on
      this.entries = entries;
      this.status = 'ready';
      if (offerSubmit && !this.submitted && qualifies(this.game.score, entries)) {
        this.openForm();
      }
    } catch {
      if (this.game.isActive(this)) this.status = 'error';
    }
  }

  private openForm(): void {
    this.form.open(
      async ({ name, country }) => {
        this.form.setBusy(true);
        try {
          await submitScore({ name, country, score: this.game.score });
          this.submitted = true;
          this.form.close();
          this.status = 'loading';
          await this.loadBoard(false);
          this.highlight = this.entries.findIndex(
            (e) => e.name === name && e.country === country && e.score === this.game.score,
          );
        } catch {
          this.form.setBusy(false);
          this.form.showError('Submit failed — try again');
        }
      },
      () => this.form.close(),
    );
  }
}
