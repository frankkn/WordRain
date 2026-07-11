/** Fixed mute toggle in the top-right corner (DOM, like SubmitForm). */
export class MuteButton {
  private readonly button: HTMLButtonElement;

  constructor(initialMuted: boolean, onToggle: () => void) {
    const button = document.createElement('button');
    button.id = 'mute-button';
    button.type = 'button';
    button.addEventListener('click', () => {
      onToggle();
      button.blur(); // keep Enter/Space for the game, not the button
    });
    document.body.appendChild(button);
    this.button = button;
    this.sync(initialMuted);
  }

  sync(muted: boolean): void {
    this.button.textContent = muted ? '🔇' : '🔊';
    this.button.title = muted ? 'Unmute' : 'Mute';
    this.button.setAttribute('aria-label', this.button.title);
    this.button.classList.toggle('muted', muted);
  }
}
