# WordRain 🌧️⌨️

A typing game where words fall from the sky like rain. Each raindrop carries a word — type it out before it hits the water. Missed drops raise the water level; when the screen floods, the game is over. The rain falls faster (and the words get longer) over time.

## Gameplay

- Words fall as raindrops from the top of the screen.
- Type a word's first letter to lock onto it (the lowest match wins), then finish the word to pop it.
- Wrong letters break your combo but never reset your progress.
- Missed drops raise the water level — at 40% the screen floods and the run ends.
- Score scales with word length and consecutive-word combos. Your best score is saved locally.
- Three difficulties (EASY / MEDIUM / HARD) with separate world leaderboards — make the top 10 and leave your name and country.

**Controls:** `↑↓` navigate menus · `←→` adjust options / switch leaderboard tabs · `Enter` confirm / restart · `Esc` pause / back · letters to type

**Options** (persisted locally): music volume, sound volume, difficulty.

### Background music

Drop a looping track at `public/audio/bgm.mp3` and the game plays it automatically (volume controlled in OPTIONS). No file → no music, everything else works. Suggested Suno prompt:

> Calm ambient instrumental, rainy night atmosphere, soft warm synth pads, gentle piano notes like water droplets, light rain in the background, slow tempo around 70 BPM, no vocals, no drums, meditative and relaxing, background music for a typing game, seamless loop

## Development

```bash
npm install
npm run dev      # dev server with HMR
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

### World leaderboard (optional)

The global top 10 is backed by [Supabase](https://supabase.com) (free tier). Without it the game still works — the leaderboard section just doesn't appear.

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
   (Projects created before the difficulty tiers also need `supabase/migration-002-difficulty.sql`.)
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key (Project Settings → API).
3. When deploying (Vercel/Netlify), set the same `VITE_SUPABASE_*` environment variables in the dashboard.

Each difficulty has its own top-10 board; scores are submitted with the difficulty the run was started on.

Scores are submitted from the client, so the database only enforces sanity checks (name length, ISO country code, score cap) — fine for a casual game, not tamper-proof.

## Architecture

Vite + TypeScript, rendered on a single 2D canvas. See `src/`:

- `core/Game.ts` — rAF game loop (delta-time), owns shared run state
- `core/states/` — state machine: menu / playing / paused / game over
- `systems/` — word spawning, ZType-style lock-on typing, difficulty ramp
- `entities/` — drops and particles
- `render/Renderer.ts` — all canvas drawing (drops, water, HUD, overlays)
- `audio/Sound.ts` — Web Audio synthesized sfx (no asset files)
- `data/words.ts` — word pools by length tier
- `net/leaderboard.ts` — world top-10 client (plain fetch to Supabase PostgREST)
- `ui/SubmitForm.ts` — DOM overlay form for name + country entry
- `storage/highscore.ts` — localStorage best score
- `config.ts` — every gameplay tuning knob in one place

## License

MIT
