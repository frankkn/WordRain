const KEY = 'wordrain.highscore';

export function loadHighScore(): number {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(value: number): void {
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    // Storage unavailable (private mode etc.) — high score just won't persist.
  }
}
