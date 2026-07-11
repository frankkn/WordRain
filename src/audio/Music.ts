/** Looping BGM track under public/, user-provided (generated with Suno). */
const BGM_FILE = 'audio/RainyNightTyping.mp3';

/**
 * Background music player. If the track file is missing the whole
 * feature silently no-ops — the game runs fine without music.
 */
export class Music {
  private audio: HTMLAudioElement | null;
  private volume = 0.5;
  private started = false;

  constructor() {
    const audio = new Audio(`${import.meta.env.BASE_URL}${BGM_FILE}`);
    audio.loop = true;
    audio.preload = 'auto';
    audio.addEventListener('error', () => {
      this.audio = null; // no bgm file — stay silent
    });
    this.audio = audio;
  }

  /** level 0–10, perceptual curve. Applies live. */
  setVolume(level: number): void {
    this.volume = (level / 10) ** 2;
    if (this.audio) this.audio.volume = this.volume;
  }

  /** Call from a user gesture (autoplay policy). Safe to call repeatedly. */
  start(): void {
    if (!this.audio || this.started) return;
    this.audio.volume = this.volume;
    void this.audio
      .play()
      .then(() => {
        this.started = true;
      })
      .catch(() => {
        // Autoplay blocked — will retry on the next gesture.
      });
  }
}
