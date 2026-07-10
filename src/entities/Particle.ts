const GRAVITY = 500; // px/s^2

export class Particle {
  private readonly maxLife: number;

  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public life: number,
    public readonly color: string,
    public readonly size: number,
  ) {
    this.maxLife = life;
  }

  get alive(): boolean {
    return this.life > 0;
  }

  get alpha(): number {
    return Math.max(0, this.life / this.maxLife);
  }

  update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += GRAVITY * dt;
    this.life -= dt;
  }
}

/** Radial burst when a word is cleared. */
export function burst(x: number, y: number, color = '#8fd0ff', count = 18): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 220;
    return new Particle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 60,
      0.4 + Math.random() * 0.4,
      color,
      1.5 + Math.random() * 2.5,
    );
  });
}

/** Upward splash when a drop lands in the water. */
export function splash(x: number, y: number, count = 12): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    const speed = 120 + Math.random() * 180;
    return new Particle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      0.35 + Math.random() * 0.3,
      '#9fd8ff',
      1 + Math.random() * 2,
    );
  });
}
