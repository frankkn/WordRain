export type StateName = 'menu' | 'playing' | 'paused' | 'gameover';

export interface State {
  enter?(): void;
  update(dt: number): void;
  render(): void;
  onKey(e: KeyboardEvent): void;
}
