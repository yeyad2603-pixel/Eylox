# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

EYLOX is a browser gaming platform: a static, no-build-step multi-page frontend (root of this repo) served by a
TypeScript/Express/Firebase backend (`backend/`). There is no frontend bundler, no npm project at the repo root,
and no framework (React/Vue/etc.) — every page is a plain `.html` file that loads a long chain of `<script>` tags.

## Commands

All commands run from `backend/`:

```bash
cd backend
npm install
npm run dev          # tsx watch mode — hot reloads src/server.ts, serves API + static frontend on :3001
npm run build         # tsc -p tsconfig.json -> dist/
npm start             # run compiled dist/server.js (production)
npm run typecheck     # tsc --noEmit
npm test              # node --import tsx --test tests/**/*.test.ts — NOTE: no tests/ dir exists yet, this currently fails
```

There is no build/lint/test tooling for the frontend — it's plain HTML/CSS/JS, edited and reloaded directly in the
browser. Open `http://localhost:3001` after `npm run dev`/`npm start` in `backend/`; the Express server serves the
whole parent directory as static files (see `backend/src/app.ts`, `STATIC_ROOT = path.join(__dirname, '..', '..')`)
plus the API under `/api`, so frontend and backend are always served from the same origin/port in local dev.

Backend requires a real Firebase project: `backend/config/serviceAccountKey.json` (gitignored) and `backend/.env`
(copy from `backend/.env.example`) with `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_WEB_API_KEY`,
`OWNER_USERNAME`/`OWNER_PASSWORD`. Full setup steps are in `backend/README.md`.

## Architecture

### Backend (`backend/src/`)

Firebase-backed (Firestore + Authentication + Storage via `firebase-admin`), not a JSON-file or SQL backend.
Every feature follows one pipeline: **Route → Middleware → Validation → Controller → Service → Firestore.**

```
config/        env loader, Firebase Admin SDK init, pino logger
middleware/    auth, error handling, rate limiting, zod validation, security headers (helmet)
routes/        Express routers — no business logic, just wiring
controllers/   thin request/response glue, calls into services
services/      business logic + Firestore/Storage/Stripe/PayPal calls
models/        Firestore document TypeScript interfaces
validation/    zod schemas
realtime/      WebSocket server (ws) + in-memory presence registry, mirrored to Firestore
storage/       Firebase Storage upload helper
app.ts         Express app assembly (security, static serving, /api mount, SPA fallback)
server.ts      HTTP + WebSocket bootstrap, graceful shutdown
```

Key backend design points (see `backend/README.md` for the full API table and WebSocket message shapes):

- **Auth is not a Firebase ID-token flow.** Passwords are verified via the Identity Toolkit REST API (the Admin SDK
  has no password-check call), but session tokens returned to the client are opaque, server-generated bearer tokens
  hashed and stored in Firestore (`sessionIndex/{hash}`, `users/{uid}/sessions/{hash}`) — up to 10 concurrent
  sessions per account, instant revocation on ban/password-reset, no forced expiry. This intentionally matches the
  old token-based session model so the frontend's `api.js`/`localStorage` token storage works unmodified.
- **Owner account**: whoever registers/logs in with `OWNER_USERNAME`/`OWNER_PASSWORD` from `.env` gets `isOwner: true`
  plus a custom Firebase Auth claim (`owner: true`), unlocking `/api/admin/*`.
- **`backend/server.legacy.js.bak`** is the archived pre-Firebase single-file JSON server — reference only, never run.
- There is currently **no project-delete endpoint** and deleting a user (`DELETE /api/admin/users/:id`) does not
  cascade-delete that user's projects, leaving orphaned Firestore docs. Be aware of this if working on account/project
  deletion.

### Frontend (repo root)

Each top-level `.html` file (`index.html`, `game.html`, `profile.html`, `admin.html`, `eylox-studio.html`, etc.) is
an independent page that pulls in a large, order-dependent chain of global-scope `.js` files via plain `<script>`
tags (no modules, no imports, no bundler) — see the `<script>` list in `index.html` for the canonical load order.
Cross-file communication happens through `window` globals and DOM/`CustomEvent`s, not ES module imports. When adding
a new frontend feature, follow this pattern: a self-contained `.js` file (often an IIFE) exposing a small
`window.SomeName = { ... }` API, plus a `<script src="...">` tag added to whichever `.html` page(s) need it, in the
existing tag order.

- **`api.js`** is the HTTP client for the backend: wraps `fetch` to `http://localhost:3001/api`, manages the
  `eylox_token`/`eylox_user` localStorage keys, attaches `Authorization: Bearer <token>` when `auth: true` is passed,
  and returns `null` (not a thrown error) on network-level failure so callers fall back to cached/local data —
  use `request.lastError()` to distinguish "server offline" from other failures.
- **`firebase.js`** is vestigial: it initializes a Firebase client SDK app but is not loaded by any `.html` page and
  uses bare ES `import` syntax that would not run unbundled. The real Firebase integration is entirely server-side
  (`firebase-admin` in `backend/`). Don't assume this file does anything at runtime.
- **`sw.js`** is the service worker (registered by `sw-register.js`); it caches frontend assets for offline use.
  When adding new frontend files that should work offline, add them to `sw.js`'s cache list.
- **`eylox-dash.js`** + `eylox-dash.css` implement "Eylox Dash," a full-screen Canvas 2D endless-runner game that
  auto-launches when the platform goes offline (listens for a `window` `eylox-offline` event, dispatched by
  `offline.js`) as a replacement for a dead-network error screen. Self-contained, ~1900 lines, exposes
  `window.EyloxDash = { launch, hide, handleReconnect, isActive, getStats }`. Has its own localStorage save
  (`eylox_dash_save`) and settings (`eylox_dash_settings`) keys, independent of the rest of the platform's state.

### Real vs. localStorage-only features

Not everything that looks server-backed actually is — many features currently read/write `localStorage` directly
and were never wired to `backend/`'s API, despite having matching-looking endpoints or UI. Before assuming a feature
is "real," check whether the relevant `.js` file calls into `api.js`/`Auth`/`fetch` or just touches
`localStorage.getItem/setItem` directly:

- **Real (backend-wired)**: auth, friends (`friends-local.js`, despite the filename), leaderboards, Studio
  save/publish (`eylox-studio.html`), the AI-generated-game pipeline (`ai-builder.js` → `ai.html` → `game.html`).
- **Still local-only**: currency/Eylux coin balance, achievements/badges, notifications, marketplace/inventory
  (`creator-economy.js`), clans/communities/parties, missions, moderation/anticheat client-side detection (never
  reported to the server). Several of these have divergent duplicate localStorage keys across files (e.g. clan
  state lives in both `clan-system.js` and `communities.html` under different keys) — check both before changing
  clan/community logic.
- `dailyrewards.js` (no hyphen, distinct from `daily-rewards.js`) is dead/orphaned code.

When extending a currently-local-only feature to talk to the real backend, follow the existing TS backend pattern
(`routes/*.routes.ts` → `controllers/*.controller.ts` → `services/*.service.ts` → `validation/*.validation.ts`),
not the old single-file style.
