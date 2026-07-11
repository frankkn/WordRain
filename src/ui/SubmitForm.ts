import { CONFIG } from '../config';
import { COUNTRIES, flagEmoji, guessCountry } from '../data/countries';

export interface SubmitPayload {
  name: string;
  country: string;
}

/**
 * DOM overlay (not canvas) so the name field gets native IME support
 * and the country picker is a real <select>.
 */
export class SubmitForm {
  private root: HTMLDivElement | null = null;
  private errorEl: HTMLParagraphElement | null = null;
  private buttons: HTMLButtonElement[] = [];
  /** Blocks Enter-key resubmits while a submit is in flight (buttons are
   *  disabled by setBusy, but the input's Enter handler bypasses them). */
  private busy = false;

  get isOpen(): boolean {
    return this.root !== null;
  }

  open(onSubmit: (payload: SubmitPayload) => void, onSkip: () => void): void {
    if (this.root) return;

    const root = document.createElement('div');
    root.id = 'submit-form';
    const panel = document.createElement('div');
    panel.className = 'panel';

    const title = document.createElement('h2');
    title.textContent = 'World Top 10!';
    const hint = document.createElement('p');
    hint.textContent = 'Leave your name on the board';

    const nameInput = document.createElement('input');
    nameInput.maxLength = CONFIG.leaderboard.nameMaxLength;
    nameInput.placeholder = 'Your name';
    nameInput.autocomplete = 'off';
    nameInput.spellcheck = false;

    const countrySelect = document.createElement('select');
    for (const [code, name] of COUNTRIES) {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${flagEmoji(code)} ${name}`;
      countrySelect.appendChild(opt);
    }
    countrySelect.value = guessCountry();

    const row = document.createElement('div');
    row.className = 'row';
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip';
    skipBtn.className = 'secondary';
    row.append(submitBtn, skipBtn);

    const error = document.createElement('p');
    error.className = 'error';

    panel.append(title, hint, nameInput, countrySelect, row, error);
    root.appendChild(panel);
    document.body.appendChild(root);

    // Keys typed here are form input, not game commands.
    root.addEventListener('keydown', (e) => e.stopPropagation());

    const trySubmit = () => {
      if (this.busy) return;
      const name = nameInput.value.trim();
      if (!name) {
        this.showError('Please enter a name');
        nameInput.focus();
        return;
      }
      this.showError('');
      onSubmit({ name, country: countrySelect.value });
    };
    submitBtn.addEventListener('click', trySubmit);
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') trySubmit();
    });
    skipBtn.addEventListener('click', onSkip);

    this.root = root;
    this.errorEl = error;
    this.buttons = [submitBtn, skipBtn];
    nameInput.focus();
  }

  setBusy(busy: boolean): void {
    this.busy = busy;
    for (const b of this.buttons) b.disabled = busy;
  }

  showError(message: string): void {
    if (this.errorEl) this.errorEl.textContent = message;
  }

  close(): void {
    this.root?.remove();
    this.root = null;
    this.errorEl = null;
    this.buttons = [];
    this.busy = false;
  }
}
