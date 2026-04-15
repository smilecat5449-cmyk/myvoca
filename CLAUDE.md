# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server (opens QR code / menu for device/emulator)
npm run android      # Start with Android emulator
npm run ios          # Start with iOS simulator
npm run web          # Start in web browser
npm run lint         # Run ESLint via expo lint
npm run reset-project  # Move starter code to app-example/, reset app/ to blank
```

## Architecture

**MyVocab** is a React Native / Expo vocabulary learning app. It is a **single-file app** — all application logic lives in [App.js](App.js). The `app/`, `components/`, `hooks/`, and `constants/` directories contain Expo Router scaffolding that is currently unused by the app; the real entry point is `"main": "App.js"` in `package.json`.

### App.js structure (top-to-bottom)

| Section | Description |
|---|---|
| `LIGHT` / `DARK` constants | Inline theme palettes (not from `constants/theme.ts`) |
| `AppCtx` / `useApp()` | React Context providing theme, words, and actions to all screens |
| `STORAGE_KEY`, `THEME_KEY`, `GEMINI_KEY` | AsyncStorage keys for persistence |
| `callGemini` / `generateWords` | Gemini API integration for AI-powered word generation |
| `App` (root) | Loads persisted data, owns all state, renders `TopBar` → screen → `BottomNav` |
| `TopBar` | Header with app name and light/dark toggle |
| `BottomNav` | 4-tab nav: 추가 (add) / 단어장 (list) / 퀴즈 (quiz) / 설정 (settings) |
| Screen components | `AddScreen`, `ListScreen`, `QuizScreen`, `SettingsScreen` |

### Data model

Each word entry stored in AsyncStorage (`myvocab_v3`):
```js
{ id, word, pronunciation, type, meaning_ko, meaning_en, example, date, memorized }
```
`type` is one of: `n.` `v.` `adj.` `adv.` `phr.`

### State & persistence

- All state lives in the root `App` component, passed via `AppCtx`.
- Words, theme, and Gemini API key are persisted to AsyncStorage on every change.
- No backend or database — fully offline-capable.

### AI feature

`generateWords(input, apiKey)` sends user input to the Gemini API (`gemini-pro`) and parses back a JSON array of word objects. The Gemini API key is entered by the user in Settings and stored locally.

### Theme system

`App.js` defines its own `LIGHT`/`DARK` palettes inline. The `constants/theme.ts` file (`Colors`, `Fonts`) is part of the unused Expo Router scaffolding and is not consumed by the app.

### Path aliases

`@/*` resolves to the project root (configured in `tsconfig.json`). Use `@/components/...`, `@/hooks/...`, etc. for imports within the scaffolding files.
