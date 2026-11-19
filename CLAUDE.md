# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StudioFlow V2: an offline, LAN-only workflow system for graduation pictorial studios (Windows). A React 19 + TypeScript + Tailwind v4 SPA (Vite, React Compiler via Babel) talks to a bundled **PocketBase 0.41** server (`pocketbase.exe`), which holds all data, auth, and server-side business logic in JS hooks. There is no separate Node backend. `docs/referrence*.md` are original planning specs (they mention a Node backend that was never built), so don't treat them as describing the current code.

## Commands

```bash
# Backend (dev): uses ./pb_data, ./pb_hooks, ./pb_migrations
./pocketbase.exe serve --http="127.0.0.1:8090"
# Frontend dev server with HMR on :5173 (talks to PocketBase on <hostname>:8090)
npm run dev

npm run build          # tsc --noEmit && vite build -> dist/
npm run lint           # eslint (ts/tsx only; pb_hooks/migrations are not linted)
npm run test:workflow  # PocketBase integration test (needs Node 22.13+ for node:sqlite)
npm run deploy         # build + copy dist/ into pb_public/ (single-port serving on :8090)

run.bat                # production launcher: detects LAN IP, serves on 0.0.0.0:8090
run.bat --build        # scripts/build.bat + scripts/deploy.bat, then serve
```

There is no unit-test framework. `scripts/test-studio-workflow.cjs` is a single `node:test` that starts a throwaway PocketBase instance in a temp dir (its own `--dir`, plus the repo's `pb_hooks` and `pb_migrations`, with `STUDIOFLOW_PHOTOS_ROOT` pointed at a temp photo root) and runs the whole staff workflow against real folders. It first migrates up to the schema before `1793801600` and seeds legacy data, then applies the remaining migrations to test an in-place upgrade. Set `POCKETBASE_TEST_BINARY` to use a different PocketBase binary. When you add a migration that changes existing data, extend this test.

`pb_data/` (the live SQLite DB) and `pb_public/` (deployed build) are gitignored and generated. `pb_data/types.d.ts` provides PocketBase JSVM typings for hooks and migrations.

## Architecture

### Frontend (`src/`)
- **Routing is hash-based with no router library.** `useHashNavigation` sets `currentTab` (`register`, `login`, `cashier`, `photographer`, `mua`, `chooser`, `admin`). `App.tsx` renders one station page per tab, wrapped in `RoleLoginGate allowedRoles=[...]`. `register` is the public kiosk.
- **`src/db/pocketbase.ts`** holds the single `pb` client. With no `VITE_PB_URL` set, it uses `window.location.origin` on port 8090 and otherwise `<hostname>:8090`, so the same build works on any LAN device. Auto-cancellation is disabled globally because many components query at the same time.
- `src/features/<station>/` holds each page, its `components/`, and a state hook (`useCashierState`, `usePhotographerQueue`, `useRegistrationForm`, `useAdminData`).
- There are two data-access styles:
  - Cashier, registration, and most admin views use `pb.collection(...)` directly, relying on collection API rules.
  - MUA, chooser, and some admin views use **custom endpoints under `/api/studioflow/*`** through `useWorkflowData(path)` (`src/hooks/useWorkflowData.ts`). It fetches with `pb.send`, polls every 8s, and also refetches when the `studioflow-workflow` realtime topic fires.
- `src/constants/studio.ts` is the single source for branding, contact info, receipt numbering, and terms clauses. `src/types/index.ts` defines the shared record types.
- **Theme (Night/Day luxury gold), defined in `src/index.css`:**
  - Night is the default. Day is `<html data-theme="light">`, set by `ThemeToggle` in the navbar and stored per device in `localStorage['studioflow-theme']`. A script in `index.html` applies it before first paint.
  - Use the semantic Tailwind colors (`bg-canvas`, `bg-panel`, `bg-obsidian`/`bg-obsidian-2`, `text-ink`, `border-line`, `text-gold`/`gold-soft`/`gold-bright`, `bg-gold-wash`, `text-on-gold` for text on solid gold) and `shadow-lux`/`shadow-lux-gold`, not hex values.
  - "Obsidian" is a black band in Night and champagne in Day. `.theme-night` keeps a region dark in both modes (navbar, footer, photo viewer).
  - The neutral, red, emerald, amber and blue palettes (and `white`) are re-mapped per surface through CSS variables, in three blocks: DARK, INVERTED and ORIGINAL. Their order in the file matters.
  - `.theme-paper` (used on `YellowFormReceipt` and `SignaturePad`) and `@media print` restore the light palette, so printed receipts stay unchanged. `YellowFormReceipt` deliberately keeps literal hex colors.
  - Headings (`h1`–`h3`) use Cinzel from `@fontsource-variable/cinzel`, bundled locally so it works offline.
- Heavy export libraries (exceljs, jspdf, html2canvas) are loaded with dynamic `import()` in `studentExcel.ts`, `muaPerformanceExport.ts`, `downloadBlob.ts`, and `generateSignedPdf.ts`. Keep them lazy.

### Backend (`pb_hooks/`, `pb_migrations/`)
- **The server is authoritative for workflow and money.** `studio_registration.pb.js` resets every workflow/ledger field on kiosk creates. `registration_billing.pb.js` recomputes totals from the catalog. `registration_validation.pb.js` validates input. `job_order.pb.js` assigns the 5-digit job order number and daily queue number and creates photo folders. Never trust client-computed prices or status.
- `*.pb.js` files are auto-loaded by PocketBase and register hooks or routes (`routerAdd`, `onRecordCreateRequest`, ...). Files **without** `.pb` are shared CommonJS modules. Because of the PocketBase JSVM's isolated handler scopes, load them *inside each handler* with `require(__hooks + "/x.js")`:
  - `studio_workflow.js`: state predicates such as `photoQueue`, `photographyComplete`, and `makeupServices`, plus `staff(app, auth, roles)` for role checks.
  - `studio_photo_storage.js`: the photo folder layout under `STUDIOFLOW_PHOTOS_ROOT` (default `C:\StudioFlow_Photos`) and path sanitization.
  - `studio_photo_selection.js`: gallery and selection moves between the `selected/` and `unselected/` folders, using hard links (needs NTFS), with resumable transfers.
  - `studio_mua_reporting.js`: MUA completion logging and daily reports in Asia/Manila time (UTC+8).
  - `studio_station_events.js`: `notify(app)` broadcasts a data-free `studioflow-workflow` invalidation. Call it after any workflow state change so station UIs refresh.
- The registration lifecycle runs through `status`, `payment_status`, `makeup_state`, and `photo_status` on `registrations`. Paid jobs that need makeup (`makeup_service` set) go to the MUA queue, and the rest go straight to the photo queue (see `photoQueue` in `studio_workflow.js`). `makeup_version` and `photo_revision` provide optimistic concurrency.
- **Security model:** collection API rules restrict data by `@request.auth.role` (`admin`, `cashier`, `photographer`, `mua`, `chooser`) and `disabled = false`. Admin-only operations (deletes, pricing, rosters, exports) are enforced both in rules and in custom routes. Schema or rule changes go in a **new** timestamped migration in `pb_migrations/`. Never edit an applied one.
- Timestamps in migration filenames are large (`1793...`). Make new ones sort after the latest existing file.
