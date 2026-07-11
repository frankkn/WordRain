/** Looping BGM track under public/, user-provided (generated with Suno). */
const BGM_FILE = 'audio/RainyNightTyping.mp3';

/**
 * Background music player. If the track file is missing the whole
 * feature silently no-ops — the game runs fine without music.
 */
export class Music {
  private audio: HTMLAudioElement | null;
  private volume = 0.5;
  /** A user gesture has happened, so play() is allowed to succeed. */
  private unlocked = false;

  constructor() {
    const audio = new Audio(`${import.meta.env.BASE_URL}${BGM_FILE}`);
    audio.loop = true;
    audio.preload = 'auto';
    audio.addEventListener('error', () => {
      this.audio = null; // no bgm file — stay silent
    });
    this.audio = audio;
  }

  /**
   * level 0–10, perceptual curve. Applies live. Zero pauses playback
   * outright: iOS Safari ignores element volume, so a real pause is the
   * only mute that works there (and it stops decode work everywhere).
   */
  setVolume(level: number): void {
    this.volume = (level / 10) ** 2;
    const audio = this.audio;
    if (!audio) return;
    audio.volume = this.volume;
    if (this.volume === 0) audio.pause();
    else if (this.unlocked && audio.paused) this.tryPlay();
  }

  /** Call from a user gesture (autoplay policy). Safe to call repeatedly. */
  start(): void {
    this.unlocked = true;
    if (this.audio && this.volume > 0 && this.audio.paused) this.tryPlay();
  }

  private tryPlay(): void {
    const audio = this.audio;
    if (!audio) return;
    audio.volume = this.volume;
    void audio.play().catch(() => {
      // Autoplay blocked — will retry on the next gesture.
    });
  }
}
