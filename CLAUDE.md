# CLAUDE.md

WordRain — 打字遊戲:單字像雨滴落下,在碰到水面前打完整個字消除它;漏接會讓水位上升,水位達 40% 即 Game Over,雨勢隨時間變快。

## 技術棧

Vite + TypeScript,單一 Canvas 2D 渲染,無 runtime 依賴(音效用 Web Audio 合成,不需素材檔)。

正式站(Vercel):**https://word-rain-mu.vercel.app**

## 常用指令

```bash
npm run dev      # 開發伺服器(HMR);讀 PORT 環境變數,預設 5173
npm run build    # tsc 型別檢查 + production build 到 dist/
npm run preview  # 預覽 production build
```

## 工作流程規範

- **每完成一個部分(phase / 功能 / 修正)就先 commit**,不要累積大量變更才一次提交。
- 所有遊戲數值調參都放在 `src/config.ts`,不要散落在各模組。
- 開發時 `window.__game` 是 dev-only hook(見 `src/main.ts`),可在 console 驅動與檢查遊戲狀態。

## 架構

```
src/
├── main.ts              # 進入點:建 Game、掛 dev hook
├── config.ts            # 所有可調參數(生成、落速、難度、水位、計分)
├── core/
│   ├── Game.ts          # rAF 迴圈(delta-time)、共享狀態、背景雨絲
│   └── states/          # 狀態機:State 介面 + Menu/Playing/Paused/GameOver
├── entities/            # Drop(雨滴)、Particle(burst/splash 粒子)
├── systems/
│   ├── TypingSystem.ts  # ZType 式鎖定:字首鎖最低的雨滴,錯字不重置進度只斷 combo
│   ├── Spawner.ts       # 選字 + 生成節奏,避免與場上雨滴同字首(鎖定歧義)
│   └── Difficulty.ts    # 隨存活時間提升落速/縮短間隔/偏向長字
├── render/Renderer.ts   # 全部 canvas 繪製(雨滴、水面、粒子、HUD、overlay、排行榜)、DPR 縮放
├── audio/Sound.ts       # Web Audio 合成音效(需使用者手勢後 unlock)
├── data/words.ts        # 字表,依長度分 short/medium/long 三級
├── data/countries.ts    # ISO 3166 國家清單 + 國旗 emoji 換算 + 語系猜測
├── net/leaderboard.ts   # 世界前 10 API client(純 fetch 打 Supabase PostgREST,無 SDK)
├── ui/SubmitForm.ts     # 上榜留名 DOM 表單(原生 IME 輸入 + <select> 國家)
└── storage/highscore.ts # localStorage 最高分
```

世界排行榜:後端是 Supabase(schema 在 `supabase/schema.sql`),金鑰放 `.env.local`(樣板 `.env.example`,變數 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`);env 沒設時功能整個優雅降級。結算畫面 fetch 前 10,夠格(不足 10 筆或嚴格大於第 10 名)才彈表單;表單開啟時鍵盤事件不進遊戲。注意:canvas 榜單只畫國家代碼不畫國旗 emoji — Windows Chrome 不支援國旗 emoji。分數由 client 提交,只有 DB sanity check,無防作弊。

狀態流程:`Menu →(Enter)→ Playing ⇄(Esc)⇄ Paused;Playing →(水位滿)→ GameOver →(Enter)→ 重開 /(Esc)→ Menu`

## 開發 Phases(完整記錄)

依 2026-07 核准的架構計畫執行,全數完成:

| Phase | 內容 | 狀態 |
|-------|------|------|
| 1 | 建置環境:package.json、tsconfig、vite.config、index.html canvas shell | ✅ |
| 2 | 核心迴圈與渲染:Game.ts、Renderer.ts、Drop.ts、config.ts | ✅ |
| 3 | 單字模式:words.ts、TypingSystem 鎖定邏輯、Spawner 字首去重、雙色渲染 | ✅ |
| 4 | 狀態機:Menu / Playing / Paused / GameOver 四狀態與切換 | ✅ |
| 5 | 水位、難度曲線、計分(字長 × 10 × combo 加成) | ✅ |
| 6 | 音效:Web Audio 合成(命中/消除/失誤/落水/game over) | ✅ |
| 7 | 最高分:localStorage 存取 + GameOver 畫面顯示 | ✅ |
| 8 | 粒子特效與潤飾:消除爆散、落水水花、背景雨絲、窄視窗 overlay 縮放 | ✅ |
| 9 | 文件:README 更新(玩法、指令、架構) | ✅ |
| 10 | 世界排行榜前 10:Supabase 後端、結算留名(名字+國家)、榜單渲染、優雅降級 | ✅(已接真實後端驗證;金鑰在 .env.local,不進 git) |
| 11 | 設定持久化與雙路音訊:settings.ts、Sound master gain、Music.ts(BGM 播放系統) | ✅(BGM 已放入:public/audio/RainyNightTyping.mp3,Suno 生成) |
| 12 | 難度系統:EASY/MEDIUM/HARD 三組參數、runDifficulty 快照、HUD 顯示 | ✅ |
| 13 | 主選單系統:↑↓ 選單(NEW GAME/LEADERBOARDS/OPTIONS/EXIT)、OPTIONS 頁、EXIT 告別畫面 | ✅ |
| 14 | 分難度排行榜:DB migration、API 帶 difficulty、LEADERBOARDS 頁(←/→ 切 EASY/MEDIUM/HARD) | ✅(migration-002 已執行,正式站分榜驗證通過) |
| 15 | 手感改善:水面上方固定打字指示器、鎖定目標落水回饋(紅閃+音效)與 0.35s 誤鎖保護 | ✅ |
| 16 | 字表擴充:三級各 100+(short 170 / medium 199 / long 189),雨夜主題混高頻詞,降低重複感 | ✅ |
| 17 | 主題包:themes/ 資料層(CLASSIC/ANIMALS/FOOD/CODE/SPACE/FANTASY)、OPTIONS THEME 列、runTheme 快照、驗證腳本 `scripts/check-words.mjs` 進 repo | ✅ |

### Phase 11–14 需求細節(2026-07-11 使用者提出)

- **主選單**:首頁改成選單式,↑/↓(含 W/S)選擇、Enter 確認,四個項目:
  `NEW GAME / LEADERBOARDS / OPTIONS / EXIT`
- **OPTIONS**:MUSIC 音量(+/−,0–10)、SOUND 音量(+/−,0–10)、DIFFICULTY(EASY/MEDIUM/HARD)
  → 音訊分成音樂、音效兩路,各自獨立音量;設定存 localStorage(`wordrain.settings`)
- **BGM**:使用者用 Suno AI 生成,放 **`public/audio/RainyNightTyping.mp3`**(路徑在 `src/audio/Music.ts` 頂部的 `BGM_FILE` 常數);檔案不存在時音樂功能靜默降級,遊戲照常
- **難度**:影響落速、生成間隔、難度曲線速度、長字權重(參數在 config.ts,現行數值 = MEDIUM);
  開局時快照到 `Game.runDifficulty`,結算送榜用快照值(避免中途改設定送錯榜)
- **排行榜分難度**:leaderboard 表加 `difficulty` 欄位(migration 在 `supabase/migration-002-difficulty.sql`,
  需在 Supabase SQL Editor 手動跑);EASY/MEDIUM/HARD 三張榜互不相干;舊資料自動歸 medium
- **EXIT**:先試 `window.close()`(瀏覽器多半會擋),fallback 顯示告別畫面,按任意鍵回選單

主題包(phase 17)備忘:字表在 `src/data/themes/`(一包一檔),新增主題 = 新檔案 + `words.ts` 註冊(ThemeName / THEMES / THEME_ORDER);品質標準「各級 100+、字首分散、全小寫 a–z」由 `node scripts/check-words.mjs` 把關(CODE 包短字接受縮寫為特例,使用者核可)。**排行榜不分主題**(定案):主題只影響字面不影響難度。

### 未來可能的方向(未排程)
- 行動裝置輸入(虛擬鍵盤 / 觸控)
- 單字母模式(初學者用)

## 驗證方式

- `npm run build` 必須通過(含 tsc 型別檢查)。
- `npm run dev` 後實際遊玩,或用 `window.__game` + `KeyboardEvent` 驅動驗證:鎖定規則、消除計分、漏接水位上升、Game Over、暫停/重開、最高分持久化。
