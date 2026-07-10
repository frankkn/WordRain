import { CONFIG } from '../config';
import type { Drop } from '../entities/Drop';
import type { Particle } from '../entities/Particle';
import type { LeaderboardEntry } from '../net/leaderboard';

export interface RainStreak {
  x: number;
  y: number;
  speed: number;
  len: number;
}

const FONT = "Consolas, 'Courier New', monospace";

export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clear(): void {
    const g = this.ctx.createLinearGradient(0, 0, 0, this.height);
    g.addColorStop(0, '#081420');
    g.addColorStop(1, '#0d2136');
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /** Decorative background rain. */
  drawRain(streaks: RainStreak[]): void {
    const { ctx } = this;
    ctx.strokeStyle = 'rgba(120, 180, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const s of streaks) {
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.len * 0.15, s.y + s.len);
    }
    ctx.stroke();
  }

  drawDrop(drop: Drop, locked: boolean): void {
    const { ctx } = this;
    const fs = CONFIG.drop.fontSize;
    const charW = fs * CONFIG.drop.charWidth;
    const w = drop.word.length * charW;
    const x0 = drop.x - w / 2;

    ctx.save();
    if (locked) {
      ctx.shadowColor = '#4aa3ff';
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = locked ? 'rgba(74, 163, 255, 0.28)' : 'rgba(20, 50, 80, 0.55)';
    ctx.beginPath();
    ctx.roundRect(x0 - 8, drop.y - fs * 0.8, w + 16, fs * 1.6, fs * 0.8);
    ctx.fill();

    ctx.font = `bold ${fs}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = locked ? 8 : 0;
    for (let i = 0; i < drop.word.length; i++) {
      ctx.fillStyle = i < drop.typed ? '#57e389' : '#cfe8ff';
      ctx.fillText(drop.word[i], x0 + charW * (i + 0.5), drop.y);
    }
    ctx.restore();
  }

  drawParticles(particles: Particle[]): void {
    const { ctx } = this;
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawWater(level: number, time: number): void {
    if (level <= 0) return;
    const { ctx } = this;
    const top = this.height * (1 - level);
    const amp = 4;
    const waveLen = 90;

    const wave = (x: number) => top + Math.sin(x / waveLen + time * 2.2) * amp;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width; x += 8) ctx.lineTo(x, wave(x));
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(74, 163, 255, 0.3)';
    ctx.fill();

    ctx.beginPath();
    for (let x = 0; x <= this.width; x += 8) {
      if (x === 0) ctx.moveTo(x, wave(x));
      else ctx.lineTo(x, wave(x));
    }
    ctx.strokeStyle = 'rgba(150, 210, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  drawHUD(score: number, best: number, combo: number, difficulty: string): void {
    const { ctx } = this;
    ctx.save();
    ctx.font = `16px ${FONT}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8fb8dd';
    ctx.fillText(difficulty, this.width / 2, 26);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cfe8ff';
    ctx.fillText(`Score ${score}`, 14, 26);
    if (combo > 1) {
      ctx.fillStyle = '#ffd166';
      ctx.fillText(`Combo x${combo}`, 14, 48);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = '#cfe8ff';
    ctx.fillText(`Best ${best}`, this.width - 14, 26);
    ctx.restore();
  }

  /** Full-screen dimming layer under menus and results. */
  dim(alpha = 0.55): void {
    this.ctx.fillStyle = `rgba(4, 10, 18, ${alpha})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /** One horizontally centered line of text. */
  centerText(
    text: string,
    y: number,
    size: number,
    opts: { bold?: boolean; glow?: boolean; color?: string } = {},
  ): void {
    const { ctx } = this;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (opts.glow) {
      ctx.shadowColor = '#4aa3ff';
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = opts.color ?? '#e8f4ff';
    ctx.font = `${opts.bold ? 'bold ' : ''}${size}px ${FONT}`;
    ctx.fillText(text, this.width / 2, y);
    ctx.restore();
  }

  /**
   * Top-10 table. Country is shown as its two-letter code — flag emoji
   * are unavailable on Windows Chrome, where they fall back to letters.
   */
  drawLeaderboard(entries: LeaderboardEntry[], yTop: number, rowH: number, highlight = -1): void {
    const { ctx } = this;
    const boardW = Math.min(480, this.width * 0.92);
    const x0 = (this.width - boardW) / 2;
    const fontSize = Math.max(11, Math.min(16, rowH * 0.62));

    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px ${FONT}`;
    entries.forEach((e, i) => {
      const y = yTop + i * rowH + rowH / 2;
      if (i === highlight) {
        ctx.fillStyle = 'rgba(255, 209, 102, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x0 - 8, yTop + i * rowH, boardW + 16, rowH, 6);
        ctx.fill();
      }
      ctx.fillStyle = i === highlight ? '#ffd166' : '#cfe8ff';
      ctx.textAlign = 'right';
      ctx.fillText(`${i + 1}.`, x0 + 28, y);
      ctx.textAlign = 'left';
      ctx.fillStyle = i === highlight ? '#ffd166' : '#8fb8dd';
      ctx.fillText(e.country, x0 + 44, y);
      ctx.fillStyle = i === highlight ? '#ffd166' : '#cfe8ff';
      ctx.fillText(e.name, x0 + 84, y);
      ctx.textAlign = 'right';
      ctx.fillText(String(e.score), x0 + boardW, y);
    });
    ctx.restore();
  }

  /** Dimmed full-screen overlay with a title and info lines (menus). */
  overlay(title: string, lines: string[], dim = 0.55): void {
    const { ctx } = this;
    ctx.save();
    this.dim(dim);

    // Scale type down on narrow viewports so nothing overflows.
    const titleSize = Math.min(54, (this.width * 0.9) / (title.length * 0.62));
    const maxLen = Math.max(1, ...lines.map((l) => l.length));
    const lineSize = Math.min(18, (this.width * 0.94) / (maxLen * 0.62));

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#4aa3ff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#e8f4ff';
    ctx.font = `bold ${titleSize}px ${FONT}`;
    ctx.fillText(title, this.width / 2, this.height * 0.36);

    ctx.shadowBlur = 0;
    ctx.font = `${lineSize}px ${FONT}`;
    ctx.fillStyle = '#cfe8ff';
    lines.forEach((line, i) => {
      ctx.fillText(line, this.width / 2, this.height * 0.36 + 64 + i * 32);
    });
    ctx.restore();
  }
}
