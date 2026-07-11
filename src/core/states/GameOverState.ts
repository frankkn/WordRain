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
  /** Bumped on every enter() so stale fetches from a previous run are discarded. */
  private generation = 0;
  private readonly form = new SubmitForm();

  constructor(private readonly game: Game) {}

  enter(): void {
    this.generation++;
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
      r.centerText(`— World Top 10 · ${g.runDifficulty.toUpperCase()} —`, boardTop, 15, {
        color: '#8fd0ff',
      });
      const listTop = boardTop + 22;
      if (this.status === 'loading') {
        r.centerText('Loading…', listTop + 24, 14);
      } else if (this.status === 'error') {
        // A failed reload right after a successful submit shouldn't read as
        // "your score got lost".
        if (this.submitted) {
          r.centerText('Score submitted! Board unavailable right now', listTop + 24, 14, {
            color: '#ffd166',
          });
        } else {
          r.centerText('World top 10 unavailable', listTop + 24, 14, { color: '#ff9f9f' });
        }
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
    if (this.form.isOpen) {
      // Focus is outside the form (backdrop click) — still let Esc skip it.
      if (e.key === 'Escape') this.form.cancel();
      return;
    }
    if (e.key === 'Enter') this.game.startRun();
    if (e.key === 'Escape') this.game.setState('menu');
  }

  private async loadBoard(offerSubmit: boolean): Promise<void> {
    const gen = this.generation;
    try {
      const entries = await fetchTop10(this.game.runDifficulty);
      // Player already moved on (or died again — this fetch is from an old run).
      if (gen !== this.generation || !this.game.isActive(this)) return;
      this.entries = entries;
      this.status = 'ready';
      if (offerSubmit && !this.submitted && qualifies(this.game.score, entries)) {
        this.openForm();
      }
    } catch {
      if (gen === this.generation && this.game.isActive(this)) this.status = 'error';
    }
  }

  private openForm(): void {
    this.form.open(
      async ({ name, country }) => {
        this.form.setBusy(true);
        const gen = this.generation;
        try {
          const id = await submitScore({
            name,
            country,
            score: this.game.score,
            difficulty: this.game.runDifficulty,
          });
          this.submitted = true;
          this.form.close();
          // Once the form is closed the player can restart; don't let this
          // stale continuation touch the next run's game-over screen.
          if (gen !== this.generation) return;
          this.status = 'loading';
          await this.loadBoard(false);
          if (gen !== this.generation) return;
          this.highlight = id === null ? -1 : this.entries.findIndex((e) => e.id === id);
        } catch {
          this.form.setBusy(false);
          this.form.showError('Submit failed — try again');
        }
      },
      () => this.form.close(),
    );
  }
}
