# CLAUDE.md

WordRain — 打字遊戲:單字像雨滴落下,在碰到水面前打完整個字消除它;漏接會讓水位上升,水位達 40% 即 Game Over,雨勢隨時間變快。

## 技術棧

Vite + TypeScript,單一 Canvas 2D 渲染,無 runtime 依賴(音效用 Web Audio 合成,不需素材檔)。

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
├── render/Renderer.ts   # 全部 canvas 繪製(雨滴、水面、粒子、HUD、overlay)、DPR 縮放
├── audio/Sound.ts       # Web Audio 合成音效(需使用者手勢後 unlock)
├── data/words.ts        # 字表,依長度分 short/medium/long 三級
└── storage/highscore.ts # localStorage 最高分
```

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

### 未來可能的方向(未排程)

- 行動裝置輸入(虛擬鍵盤 / 觸控)
- 多字表主題包或難度選擇(單字母模式)
- 本地排行榜(多筆紀錄,不只最高分)

## 驗證方式

- `npm run build` 必須通過(含 tsc 型別檢查)。
- `npm run dev` 後實際遊玩,或用 `window.__game` + `KeyboardEvent` 驅動驗證:鎖定規則、消除計分、漏接水位上升、Game Over、暫停/重開、最高分持久化。
