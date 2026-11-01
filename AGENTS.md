# AGENTS.md

Hinweise für KI-Agenten, die in diesem Repository arbeiten.

## Kommunikation

- **Sprache: Deutsch.** Antworten, Erklärungen, Zusammenfassungen und Rückfragen
  immer auf Deutsch — unabhängig davon, in welcher Sprache die Aufgabe gestellt wurde.
- **Code bleibt englisch.** Variablen, Funktionsnamen, Kommentare im Quelltext,
  Commit-Messages, Branchnamen und PR-Titel/Bodies werden auf Englisch verfasst.
- **Fachbegriffe** dürfen englisch bleiben, wenn die deutsche Entsprechung unüblich ist
  (z. B. Step Sequencer, Piano Roll, Mixer, Pull Request, Build, Commit).
- **Fehlermeldungen und Logs** werden im Original zitiert, nicht übersetzt — danach folgt
  eine deutsche Erklärung.
- Bei mehrdeutigen Anforderungen: kurz auf Deutsch nachfragen, statt zu raten.

## Stack

Node.js ≥ 20, TypeScript, React 18 + Vite, Tailwind, Express, SQLite
(`better-sqlite3`). Kein Docker, keine externen Dienste außer der optionalen
Arena-API.

## Projekte im Repo

| Ordner | Inhalt |
| --- | --- |
| `pulsar-studio/` | Vollständige Beat-Lab-Web-App (React + Express + SQLite). Hauptprojekt. |
| `powerpack/` | Konfigurator für ein 48-V-LiFePO4-System. |
| `auronorigin-studio/` | Python/Gradio-Video-Studio. |
| `chat-autotyper/` | Chat-Automatisierung. |
| `functions/` | Firebase-Cloud-Functions. |

## Pulsar Studio — Schnellstart

```bash
cd pulsar-studio
npm ci            # Abhängigkeiten
npm run build     # Client nach dist/
npm start         # Server auf http://localhost:4000
```

- Desktop-Verknüpfung (Start bei Doppelklick, Ende beim Schließen):
  `bash scripts/install-desktop-shortcut.sh`
- Handy-Link + QR-Code: `npm run link`
- Prüfungen vor dem Commit: `npx tsc --noEmit` und `npm run build`
- Laufzeitdaten liegen in `pulsar-studio/data/` (gitignored) — nicht committen.
- Der Arena-API-Key wird **nie** im Code hinterlegt, sondern über
  `ARENA_API_KEY` oder die Settings-Seite gesetzt.

## Arbeitsweise

- Änderungen immer auf dem aktuellen Arena-Branch, nie direkt auf `main`.
- Vor dem Merge: Typecheck und Build laufen lassen, Ergebnis im PR nennen.
- Keine generierten Artefakte (`node_modules/`, `dist/`, `data/`, `*.db`) committen.
- Bestehende Projekte nicht umbauen, wenn die Aufgabe ein anderes betrifft.
