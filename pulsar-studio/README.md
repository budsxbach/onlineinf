# Pulsar Studio

A full-stack, browser-native beat lab — step sequencer, piano roll, drum machines, subtractive synths, mixer, offline WAV export and an AI co-writer routed through the **Arena API**.

Pulsar Studio is built for one producer (you): everything runs locally, everything is stored in SQLite, and the only external service is the Arena router you configure with your own API key.

---

## Quick start

```bash
cd pulsar-studio
npm install
npm run build      # builds the React client into dist/
npm start          # serves API + client on http://localhost:4000
```

Or use `npm run dev`, which rebuilds the client and then starts the server.

Open **http://localhost:4000**. The first boot seeds a full studio automatically — 12 projects, 100+ tracks, 16 samples, 12 synth presets and a handful of AI ideas — so the app is alive immediately.

### Connect the Arena router

1. Open **Settings → AI engine**.
2. Paste your Arena API key, keep the default router URL (`https://api.preview.arena.ai/v1`) and model (`coding-router-preview`) or point them at your preferred OpenAI-compatible endpoint.
3. Press **Test connection** — the server lists the models your key can reach.
4. Go to **AI Composer**, describe a track, and compose.

The key is written to the local SQLite database (`settings` table) and is **never returned to the browser** after saving. You can also provide it without touching the UI:

```bash
ARENA_API_KEY=your_key npm start
```

If no key is configured — or the router is unreachable — the composer transparently falls back to the built-in local arrangement engine and tells you what happened. Every feature except router-backed generation works offline.

---

## Control it from your iPhone (or any phone)

Pulsar runs as a normal website, so the iPhone just needs the address of the machine that
runs the server. No app store, no account.

1. Start the studio: `npm start` (or `npm run dev`). The server binds `0.0.0.0`, so it is
   reachable from the local network.
2. Print the link + a scannable QR code in the terminal:

   ```bash
   npm run link
   ```

   ```
     desktop   http://localhost:4000
     iPhone    http://192.168.1.42:4000   (wlp2s0)
   ```
3. Scan the QR with the iPhone camera (same Wi-Fi), or type the address in Safari.
4. Safari → **Share → Add to Home Screen** — Pulsar then starts full-screen from its own
   icon, with no browser chrome.
5. Tap the play button once. iOS only allows audio after a real gesture; the app unlocks
   the Web Audio graph on your first touch and keeps it alive in the background.

The same QR code plus copy button is in **Settings → Control it from your phone**.

### Troubleshooting the phone connection

| Symptom | Fix |
| --- | --- |
| Phone cannot open the address | Both devices must be on the same Wi-Fi (not guest/isolated networks). |
| Still blocked | Open the firewall: `sudo ufw allow 4000/tcp` |
| Wrong address shown | `npm run link` lists every interface; pick the `wlp*/enp*/eth*` one that matches your LAN. |
| No sound | Silent switch is off, volume up, and tap play once (iOS audio unlock). |
| Want access from outside your home | Point a tunnel at the port: `cloudflared tunnel --url http://localhost:4000` or install Tailscale and use `http://<tailscale-ip>:4000`. |

The app is a PWA: `manifest.webmanifest`, Apple touch icons and standalone display mode are
included, and the layout collapses to a five-tab bottom bar on phones with safe-area insets
for the notch and home indicator.

## Features

### Dashboard
- Greeting, live session stats, 14-day activity chart, genre breakdown.
- “Continue where you left off” hero for the most recent project.
- Idea bank, preset shelf with audition buttons, and an Arena connection card.
- Loading skeletons and an offline/error state with retry.

### Projects (full CRUD)
- Search, status filters, genre filter, favourites, sorting and grid/list views.
- Project covers are generated from deterministic SVG/CSS themes.
- Create with template (starter groove / blank canvas / composer sketch), key, scale, tempo, status and cover theme.
- Optimistic favourites and deletes with automatic rollback; duplicate entire sessions; delete with confirmation.

### Studio
- **32-step sequencer** (two bars of 16ths) with four pattern banks (A–D), drag-to-paint, shift-click velocity cycling, per-track mute/solo, colour picker, rename, duplicate and delete.
- **Piano roll** for every synth track: draw/remove notes, note length, velocity, octave shift, scale highlighting, on-key playback preview and a motif generator.
- **Arrangement timeline**: add/remove sections, choose bank and loop count per block, click to jump while playing.
- **Transport**: play/pause/stop, loop, metronome, tap tempo, BPM stepper, song/pattern modes, master meter and volume.
- **Device panel**: real subtractive synth controls (waveform, filter, ADSR, env amount, detune, sub, glide) or drum voice controls (tune/decay/tone/snap), channel strip (volume, pan, drive, reverb/delay sends, filter), preset loading and saving.
- **Mixer** with live meters, faders, pan knobs, sends and a master strip.
- **Offline WAV export** of the full arrangement rendered at 44.1 kHz.
- Autosave with a visual save state, plus keyboard shortcuts (`space`, `L`, `M`, `Esc`).

### AI Composer
- Prompt box with genre/tempo/key/scale guardrails and quick-start prompts.
- Arena router generation (strict JSON arrangement schema) with graceful local fallback.
- Animated composing state, idea bank with filters, engine/status badges, retry, save, delete and “open in studio”.
- Generated ideas keep their full arrangement data, so opening one never requires regenerating.

### Samples, presets and settings
- Sample library: categories, search, favourites, previews, play counts, CRUD.
- Preset rack: audition, filter, favourite, full synth-patch editor, CRUD.
- Settings: producer profile, default tempo, Arena connection + test, autosave/metronome defaults, library statistics and a JSON backup of everything.

### Experience details
- Dark, high-contrast design system with an acid-green accent and a responsive sidebar.
- Command palette (`⌘K` / `Ctrl+K`).
- Toasts, empty states, loading skeletons, optimistic updates everywhere it matters.
- Accessible labels on controls, keyboard-operable knobs and faders.
- Smooth layout from ultrawide down to phones; the sequencer scrolls horizontally with sticky track headers.

---

## Stack

| Layer | Choice |
| --- | --- |
| Client | React 18, TypeScript, Vite, Tailwind CSS |
| State/data | Zustand (studio + transport + toasts), TanStack Query (server data) |
| Audio | Custom Web Audio engine — synthesized drums, subtractive synths, convolution reverb, delay, limiter, offline rendering |
| Server | Node 20+, Express 4 |
| Storage | SQLite via `better-sqlite3` (WAL mode) |
| AI | Arena router (OpenAI-compatible `/chat/completions`), with local composer fallback |

No audio files are shipped: every drum hit and synth note is generated in real time, and exports are rendered offline in the browser.

---

## Project layout

```
pulsar-studio/
├── server/
│   ├── index.mjs      # Express API, CRUD routes, stats, settings, AI endpoints
│   ├── db.mjs         # SQLite schema, hydration helpers and seed data
│   ├── compose.mjs    # deterministic local arrangement generator
│   ├── ai.mjs         # Arena router client, JSON extraction, local fallback
│   └── music.mjs      # shared scales, instruments, kits and defaults
├── src/
│   ├── lib/           # API client, query hooks, audio engine, music helpers
│   ├── store/         # studio editor store, transport store, toasts
│   ├── components/    # UI kit, layout, studio instruments, project cards
│   └── pages/         # Dashboard, Projects, Studio, Composer, Samples, Presets, Settings
├── data/pulsar.db     # runtime database (gitignored, seeded on first boot)
└── dist/              # built client (gitignored)
```

## API

All endpoints are under `/api` and speak JSON.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health`, `/meta`, `/stats` | Service info, musical vocabulary, dashboard aggregates |
| GET/POST | `/projects` | List (filter/search/sort) and create projects |
| GET/PATCH/DELETE | `/projects/:id` | Read with tracks, update, delete |
| POST | `/projects/:id/duplicate` | Deep-copy a session |
| GET/POST | `/projects/:id/tracks` | List and create tracks |
| PATCH/DELETE | `/tracks/:id` | Update (patterns, notes, mixer, synth) and delete |
| POST | `/tracks/:id/duplicate` | Copy a track |
| GET/POST | `/samples` | Sample library |
| PATCH/DELETE | `/samples/:id` | Sample CRUD |
| POST | `/samples/:id/play` | Increment play count |
| GET/POST | `/presets` | Preset rack |
| PATCH/DELETE | `/presets/:id` | Preset CRUD |
| GET/POST | `/ideas` | List and generate ideas |
| PATCH/DELETE | `/ideas/:id` | Rename/set status, delete |
| POST | `/ideas/:id/retry` | Retry generation (optionally local-only) |
| POST | `/ideas/:id/open` | Materialise an idea as a project |
| GET/PATCH | `/settings` | Read (key redacted) and write settings |
| POST | `/settings/test-ai` | Validate the Arena key and list models |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Build the client, then start the server |
| `npm run build` | Production client build |
| `npm start` / `npm run serve` | Start the server on `PORT` (default 4000) |
| `npm run typecheck` | TypeScript project check |
| `npm run link` | Print LAN URLs + QR code for your phone |

## Data & backups

- Database: `pulsar-studio/data/pulsar.db` (override with `PULSAR_DATA_DIR`).
- Delete the database and restart to reseed the demo studio.
- Settings → Data & storage exports a complete JSON backup (projects with tracks, samples, presets, ideas).

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `⌘K` / `Ctrl K` | Command palette |
| `Space` | Play / pause |
| `L` | Loop arrangement |
| `M` | Metronome |
| `Shift` + click step | Cycle velocity |
| `Esc` | Close the current panel |

---

Built to be a better beat lab: instant, local-first, keyboard-friendly, and honest about what the AI is doing.
