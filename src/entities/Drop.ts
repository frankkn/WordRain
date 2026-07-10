export class Drop {
  typed = 0;

  constructor(
    public readonly word: string,
    public x: number,
    public y: number,
    public speed: number,
  ) {}

  get done(): boolean {
    return this.typed >= this.word.length;
  }

  update(dt: number): void {
    this.y += this.speed * dt;
  }
}
