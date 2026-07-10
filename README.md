# WordRain 🌧️⌨️

A typing game where words fall from the sky like rain. Each raindrop carries a word — type it out before it hits the water. Missed drops raise the water level; when the screen floods, the game is over. The rain falls faster (and the words get longer) over time.

## Gameplay

- Words fall as raindrops from the top of the screen.
- Type a word's first letter to lock onto it (the lowest match wins), then finish the word to pop it.
- Wrong letters break your combo but never reset your progress.
- Missed drops raise the water level — at 40% the screen floods and the run ends.
- Score scales with word length and consecutive-word combos. Your best score is saved locally.

**Controls:** letters to type · `Enter` start / restart · `Esc` pause / menu

## Development

```bash
npm install
npm run dev      # dev server with HMR
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Architecture

Vite + TypeScript, rendered on a single 2D canvas. See `src/`:

- `core/Game.ts` — rAF game loop (delta-time), owns shared run state
- `core/states/` — state machine: menu / playing / paused / game over
- `systems/` — word spawning, ZType-style lock-on typing, difficulty ramp
- `entities/` — drops and particles
- `render/Renderer.ts` — all canvas drawing (drops, water, HUD, overlays)
- `audio/Sound.ts` — Web Audio synthesized sfx (no asset files)
- `data/words.ts` — word pools by length tier
- `storage/highscore.ts` — localStorage best score
- `config.ts` — every gameplay tuning knob in one place

## License

MIT
