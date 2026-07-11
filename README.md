<div align="right">

**English** | [繁體中文](README.zh-TW.md)

</div>

# WordRain 🌧️⌨️

**Words fall like rain. Type them before they touch the water — let too many slip, and the flood takes the screen.**

🔗 Play: **https://word-rain-mu.vercel.app**

## How to play

Open the page, pick **NEW GAME**, and type.

- Each raindrop carries a word. Type its first letter to lock on — when several words match, the drop closest to the water wins — then finish the word to burst it.
- Wrong letters break your combo, never your progress. The word you're typing is always shown big above the waterline, so you can't lose track of it even when things get frantic.
- Every missed drop raises the water, and the rain keeps getting faster. At 40% the screen floods and the run ends.
- Longer words are worth more; clearing words back-to-back without a miss builds a combo multiplier.

### Controls

| Key | Action |
|-----|--------|
| `↑` `↓` | navigate menus |
| `←` `→` | adjust options · switch leaderboard tabs |
| `Enter` | confirm · play again |
| `Esc` | pause · back |
| `A`–`Z` | type! |

The 🔊 button in the top-right corner mutes everything in one click.

## Difficulty & the world top 10

**EASY / MEDIUM / HARD** change how fast the rain falls, how often it spawns, and how long the words get. Each difficulty keeps its **own world top-10 leaderboard** — finish a run in the top 10 and you can leave your name and country on the board for the whole world to see. Browse all three boards anytime from **LEADERBOARDS** in the main menu.

## Options

**MUSIC** volume, **SOUND** volume, **DIFFICULTY**, and **THEME** — adjusted with arrow keys, applied instantly, and remembered between visits. Your best score is saved locally too.

### Word themes

Six word packs to type through: **CLASSIC** (rainy-night mix), **ANIMALS**, **FOOD**, **CODE** (yes, `npm` and `refactor` count), **SPACE**, and **FANTASY**. Themes only change the words — difficulty and leaderboards stay the same.

## Tech

Vite + TypeScript on a single Canvas 2D — no game engine, zero runtime dependencies. Sound effects are synthesized live with Web Audio. World leaderboards are backed by Supabase.

## License

MIT
