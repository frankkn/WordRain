/** All sfx are synthesized with Web Audio — no asset files. */
export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume = 0.5; // 0–1, set via setVolume

  /** level 0–10, perceptual curve. Applies live to all sfx. */
  setVolume(level: number): void {
    this.volume = (level / 10) ** 2;
    if (this.master) this.master.gain.value = this.volume;
  }

  /** Must be called from a user gesture before anything can play. */
  unlock(): void {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.ctx.destination);
      } catch {
        return; // No audio support; game stays silent.
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  hit(): void {
    this.tone(760, 0.06, 'square', 0.05, 980);
  }

  complete(): void {
    this.tone(620, 0.09, 'triangle', 0.12, 930);
    this.tone(930, 0.14, 'triangle', 0.1, 1240, 0.07);
  }

  miss(): void {
    this.tone(180, 0.12, 'sawtooth', 0.07, 120);
  }

  splash(): void {
    this.noise(0.25, 0.18, 900);
  }

  gameover(): void {
    this.tone(440, 0.7, 'triangle', 0.12, 110);
    this.noise(0.8, 0.1, 500);
  }

  menuMove(): void {
    this.tone(500, 0.045, 'square', 0.05);
  }

  menuSelect(): void {
    this.tone(660, 0.09, 'triangle', 0.1, 880);
  }

  menuBack(): void {
    this.tone(440, 0.07, 'triangle', 0.08, 330);
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    slideTo?: number,
    delay = 0,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || ctx.state !== 'running') return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur);
  }

  private noise(dur: number, gain: number, cutoff: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || ctx.state !== 'running') return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
  }
}
