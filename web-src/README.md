# Roku Rhythm web source

This directory reconstructs the React/Vite source for the existing Roku Rhythm
PWA. It is intentionally isolated from the static files and `vercel.json` in
the repository root.

## Commands

```bash
npm ci
npm test
npm run build
npm run dev
```

`npm run build` writes only to `web-src/dist/`. It does not overwrite or deploy
the existing PWA in the repository root.

## App Store review preparation

- `PRIVACY.md` contains the public privacy policy source.
- `APP_STORE_REVIEW.md` contains the App Store Connect answers and review notes.
- Profile data stays on device and can be deleted from Settings.
- Native builds can share the selected result and optionally schedule an 8:00
  daily local reminder.

After adding or updating native plugins, run:

```bash
npx cap sync
```

## Android icon and splash screen

The reusable source image is `assets/logo.png`. Regenerate the Android assets
from inside `web-src/` with:

```bash
npx --yes @capacitor/assets@3.0.5 generate --android \
  --assetPath assets \
  --iconBackgroundColor '#4338ca' \
  --iconBackgroundColorDark '#4338ca' \
  --splashBackgroundColor '#ffffff' \
  --splashBackgroundColorDark '#ffffff' \
  --logoSplashScale 0.2
```
