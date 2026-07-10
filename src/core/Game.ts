import { CONFIG } from '../config';
import { Sound } from '../audio/Sound';
import { Drop } from '../entities/Drop';
import { Particle } from '../entities/Particle';
import { Renderer, type RainStreak } from '../render/Renderer';
import { loadHighScore, saveHighScore } from '../storage/highscore';
import { Difficulty } from '../systems/Difficulty';
import { Spawner } from '../systems/Spawner';
import { TypingSystem } from '../systems/TypingSystem';
import type { State, StateName } from './states/State';
import { MenuState } from './states/MenuState';
import { PlayingState } from './states/PlayingState';
import { PausedState } from './states/PausedState';
import { GameOverState } from './states/GameOverState';

export class Game {
  readonly renderer: Renderer;
  readonly sound = new Sound();
  readonly typing = new TypingSystem();
  readonly spawner = new Spawner();
  readonly difficulty = new Difficulty();

  drops: Drop[] = [];
  particles: Particle[] = [];
  water = 0; // fraction of screen height
  score = 0;
  combo = 0;
  best = loadHighScore();
  newBest = false;
  time = 0; // global clock, drives the water wave

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
    };
    this.state = this.states.menu;
    window.addEventListener('keydown', (e) => {
      this.sound.unlock();
      this.state.onKey(e);
    });
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
    this.difficulty.reset();
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
    r.drawHUD(this.score, this.best, this.combo);
  }

  private frame = (t: number): void => {
    const dt = Math.min(0.05, (t - this.lastT) / 1000); // clamp tab-switch spikes
    this.lastT = t;
    this.time += dt;

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
