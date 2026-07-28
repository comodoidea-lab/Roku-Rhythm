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
