import { CONFIG, DIFFICULTIES, type DifficultyName } from '../config';
import { Music } from '../audio/Music';
import { Sound } from '../audio/Sound';
import { Drop } from '../entities/Drop';
import { Particle } from '../entities/Particle';
import { Renderer, type RainStreak } from '../render/Renderer';
import { loadHighScore, saveHighScore } from '../storage/highscore';
import { loadSettings, saveSettings, type Settings } from '../storage/settings';
import { MuteButton } from '../ui/MuteButton';
import { Difficulty } from '../systems/Difficulty';
import { Spawner } from '../systems/Spawner';
import { TypingSystem } from '../systems/TypingSystem';
import type { State, StateName } from './states/State';
import { MenuState } from './states/MenuState';
import { PlayingState } from './states/PlayingState';
import { PausedState } from './states/PausedState';
import { GameOverState } from './states/GameOverState';
import { LeaderboardsState } from './states/LeaderboardsState';
import { OptionsState } from './states/OptionsState';
import { ExitState } from './states/ExitState';

export class Game {
  readonly renderer: Renderer;
  readonly sound = new Sound();
  readonly music = new Music();
  readonly typing = new TypingSystem();
  readonly spawner = new Spawner();
  readonly difficulty = new Difficulty();
  readonly settings: Settings = loadSettings();
  private readonly muteButton: MuteButton;

  drops: Drop[] = [];
  particles: Particle[] = [];
  water = 0; // fraction of screen height
  score = 0;
  combo = 0;
  best = loadHighScore();
  newBest = false;
  time = 0; // global clock, drives the water wave
  /** Snapshotted at run start so mid-game option changes can't mislabel the run. */
  runDifficulty: DifficultyName = 'medium';
  /** Countdown for the red flash after the locked target drowns. */
  lockLostFlash = 0;

  private readonly states: Record<StateName, State>;
  private state: State;
  private streaks: RainStreak[] = [];
  private lastT = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.states = {
      menu: new MenuState(this),
      playing: new PlayingState(this),
      paused: new PausedState(this),
      gameover: new GameOverState(this),
      leaderboards: new LeaderboardsState(this),
      options: new OptionsState(this),
      exit: new ExitState(this),
    };
    this.state = this.states.menu;
    this.muteButton = new MuteButton(this.settings.muted, () => this.toggleMute());
    this.applyVolumes();
    window.addEventListener('keydown', (e) => {
      this.sound.unlock();
      this.music.start();
      this.state.onKey(e);
    });
  }

  toggleMute(): void {
    this.settings.muted = !this.settings.muted;
    this.muteButton.sync(this.settings.muted);
    this.applySettings();
  }

  /** Persist the (already mutated) settings and apply the audio volumes. */
  applySettings(): void {
    this.applyVolumes();
    saveSettings(this.settings);
  }

  private applyVolumes(): void {
    const { muted, sound, music } = this.settings;
    this.sound.setVolume(muted ? 0 : sound);
    this.music.setVolume(muted ? 0 : music);
  }

  start(): void {
    requestAnimationFrame((t) => {
      this.lastT = t;
      requestAnimationFrame(this.frame);
    });
  }

  setState(name: StateName): void {
    this.state = this.states[name];
    this.state.enter?.();
  }

  /** Lets async work (leaderboard fetches) check it still owns the screen. */
  isActive(state: State): boolean {
    return this.state === state;
  }

  /** Reset per-run state and begin playing. */
  startRun(): void {
    this.drops = [];
    this.particles = [];
    this.water = 0;
    this.score = 0;
    this.combo = 0;
    this.newBest = false;
    this.lockLostFlash = 0;
    this.runDifficulty = this.settings.difficulty;
    this.difficulty.reset(DIFFICULTIES[this.runDifficulty]);
    this.spawner.reset();
    this.typing.reset();
    this.setState('playing');
  }

  endRun(): void {
    this.newBest = this.score > this.best;
    if (this.newBest) {
      this.best = this.score;
      saveHighScore(this.best);
    }
    this.typing.reset();
    this.sound.gameover();
    this.setState('gameover');
  }

  addScore(word: string): void {
    this.combo++;
    const mult = 1 + CONFIG.score.comboBonus * Math.min(this.combo - 1, CONFIG.score.comboCap);
    this.score += Math.round(word.length * CONFIG.score.perChar * mult);
  }

  /** Y coordinate of the water surface. */
  get waterTop(): number {
    return this.renderer.height * (1 - this.water);
  }

  /** Draws the in-game scene; shared by playing/paused/gameover states. */
  renderScene(): void {
    const r = this.renderer;
    for (const d of this.drops) r.drawDrop(d, d === this.typing.locked);
    r.drawParticles(this.particles);
    r.drawWater(this.water, this.time);
    const locked = this.typing.locked;
    if (locked && !locked.done && this.drops.includes(locked)) {
      r.drawTypingIndicator(locked.word, locked.typed, this.waterTop - 36);
    }
    if (this.lockLostFlash > 0) {
      r.flashRed(this.lockLostFlash / CONFIG.typing.lockLostFlashSeconds);
    }
    r.drawHUD(this.score, this.best, this.combo, this.runDifficulty.toUpperCase());
  }

  private frame = (t: number): void => {
    const dt = Math.min(0.05, (t - this.lastT) / 1000); // clamp tab-switch spikes
    this.lastT = t;
    this.time += dt;
    this.lockLostFlash = Math.max(0, this.lockLostFlash - dt);

    this.updateAmbience(dt);
    this.state.update(dt);

    this.renderer.clear();
    this.renderer.drawRain(this.streaks);
    this.state.render();

    requestAnimationFrame(this.frame);
  };

  private updateAmbience(dt: number): void {
    const { width, height } = this.renderer;
    const target = Math.floor(width / 24);
    while (this.streaks.length < target) {
      this.streaks.push({
        x: Math.random() * width,
        y: Math.random() * height * 2 - height,
        speed: 260 + Math.random() * 240,
        len: 10 + Math.random() * 14,
      });
    }
    if (this.streaks.length > target) this.streaks.length = target;
    for (const s of this.streaks) {
      s.y += s.speed * dt;
      if (s.y > height) {
        s.y = -s.len - Math.random() * 80;
        s.x = Math.random() * width;
      }
    }
  }
}
