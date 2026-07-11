import type { DifficultyName } from '../config';

export interface Settings {
  music: number; // 0–10
  sound: number; // 0–10
  difficulty: DifficultyName;
  muted: boolean;
}

const KEY = 'wordrain.settings';
const DEFAULTS: Settings = { music: 7, sound: 7, difficulty: 'medium', muted: false };

function clampVolume(v: unknown): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : 7;
  return Math.max(0, Math.min(10, n));
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      music: clampVolume(parsed.music),
      sound: clampVolume(parsed.sound),
      difficulty:
        parsed.difficulty === 'easy' || parsed.difficulty === 'hard'
          ? parsed.difficulty
          : 'medium',
      muted: parsed.muted === true,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable — settings just won't persist.
  }
}
