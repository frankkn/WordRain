import { Game } from './core/Game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game(canvas);
game.start();

// Dev hook so the game can be inspected/driven from the console during development.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__game = game;
}
