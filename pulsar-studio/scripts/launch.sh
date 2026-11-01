#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  Pulsar Studio — windowed launcher
#
#  Starts the local server, opens the studio, and stops the server again as
#  soon as you close the window. Nothing keeps running in the background.
#
#  usage:
#    ./launch.sh                 auto: app window if a Chromium browser exists,
#                                otherwise a terminal control window
#    ./launch.sh --app-window    dedicated browser app window (= closing it quits)
#    ./launch.sh --terminal      terminal control window (= closing it quits)
#    ./launch.sh --no-browser    start the server only (debugging)
#    ./launch.sh --stop          stop a leftover server on the port
# ---------------------------------------------------------------------------
set -uo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4000}"
URL="http://localhost:${PORT}"
LOG_DIR="$APP_DIR/data"
LOG="$LOG_DIR/launch.log"
PROFILE_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/pulsar-studio/browser-profile"

MODE="auto"
case "${1:-}" in
  --app-window) MODE="app-window" ;;
  --terminal) MODE="terminal" ;;
  --no-browser) MODE="none" ;;
  --stop) MODE="stop" ;;
  -h|--help) sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; exit 2 ;;
esac

SERVER_PID=""
TAIL_PID=""
BROWSER_PID=""
STARTED_SERVER=0

# --- output helpers --------------------------------------------------------
say()  { printf '\033[38;5;191m%s\033[0m\n' "$*" 2>/dev/null || printf '%s\n' "$*"; }
dim()  { printf '\033[2m%s\033[0m\n' "$*" 2>/dev/null || printf '%s\n' "$*"; }
warn() { printf '\033[33m%s\033[0m\n' "$*" >&2 2>/dev/null || printf '%s\n' "$*" >&2; }

notify() { # notify <summary> <body> [icon]
  command -v notify-send >/dev/null 2>&1 && notify-send -a "Pulsar Studio" "$1" "${2:-}" >/dev/null 2>&1 || true
}

# --- server lifecycle ------------------------------------------------------
is_up() {
  # curl is not guaranteed on a fresh install — node always is.
  if command -v curl >/dev/null 2>&1; then
    curl -fsS --max-time 2 "$URL/api/health" >/dev/null 2>&1
    return $?
  fi
  node -e '
    const http = require("http");
    const req = http.get(process.argv[1] + "/api/health", { timeout: 2000 }, (res) => {
      res.resume();
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
    req.on("error", () => process.exit(1));
    req.on("timeout", () => { req.destroy(); process.exit(1); });
  ' "$URL" >/dev/null 2>&1
}

port_pids() {
  if command -v ss >/dev/null 2>&1; then
    ss -lptnH "sport = :$PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u
  elif command -v fuser >/dev/null 2>&1; then
    fuser -n tcp "$PORT" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$' | sort -u
  fi
}

cleanup() {
  local pid
  if [[ -n "${TAIL_PID:-}" ]] && kill -0 "$TAIL_PID" 2>/dev/null; then
    kill "$TAIL_PID" 2>/dev/null
  fi

  # Only ever stop a server that this very launcher started. If we merely
  # detected an already-running instance, it belongs to another window and
  # must keep running.
  [[ "${STARTED_SERVER:-0}" == "1" ]] || return 0

  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null
    for _ in $(seq 1 40); do
      kill -0 "$SERVER_PID" 2>/dev/null || break
      sleep 0.05
    done
    kill -9 "$SERVER_PID" 2>/dev/null
  fi
  # Belt and braces for any helper the server may have left on our port.
  for pid in $(port_pids); do
    if grep -qa "server/index.mjs" "/proc/$pid/cmdline" 2>/dev/null; then
      kill "$pid" 2>/dev/null
    fi
  done
  return 0
}

trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# --- stop mode -------------------------------------------------------------
if [[ "$MODE" == "stop" ]]; then
  found=0
  for pid in $(port_pids); do
    if grep -qa "server/index.mjs" "/proc/$pid/cmdline" 2>/dev/null; then
      kill "$pid" 2>/dev/null && found=1 && echo "Stopped Pulsar Studio (pid $pid)."
    fi
  done
  [[ $found -eq 1 ]] || echo "Pulsar Studio is not running on port $PORT."
  STARTED_SERVER=0
  SERVER_PID=""
  exit 0
fi

# --- already running? ------------------------------------------------------
if is_up; then
  say "Pulsar Studio läuft bereits auf $URL"
  if [[ "$MODE" != "none" ]]; then
    if command -v xdg-open >/dev/null 2>&1; then
      dim "Öffne das Fenster …"
      xdg-open "$URL" >/dev/null 2>&1 &
    else
      dim "Adresse im Browser öffnen: $URL"
    fi
  fi
  exit 0
fi

# A stale process holding the port without answering health checks.
for pid in $(port_pids); do
  if grep -qa "server/index.mjs" "/proc/$pid/cmdline" 2>/dev/null; then
    warn "Räume hängenden Prozess auf (pid $pid) …"
    kill "$pid" 2>/dev/null
    sleep 0.5
    kill -9 "$pid" 2>/dev/null
  fi
done

# --- dependencies / build --------------------------------------------------
if [[ ! -d "$APP_DIR/node_modules" ]]; then
  say "Installiere Abhängigkeiten (einmalig) …"
  ( cd "$APP_DIR" && npm ci --no-audit --no-fund ) || { warn "npm ci ist fehlgeschlagen."; notify "Pulsar konnte nicht starten" "npm ci fehlgeschlagen – Log ansehen: $LOG"; exit 1; }
fi

NEEDS_BUILD=0
if [[ ! -f "$APP_DIR/dist/index.html" ]]; then
  NEEDS_BUILD=1
elif [[ -n "$(find "$APP_DIR/src" "$APP_DIR/index.html" "$APP_DIR/tailwind.config.js" -newer "$APP_DIR/dist/index.html" -print -quit 2>/dev/null)" ]]; then
  # Quellcode ist neuer als der Build (z. B. nach einem git pull) …
  NEEDS_BUILD=1
fi

if [[ "$NEEDS_BUILD" == "1" ]]; then
  say "Baue die Oberfläche …"
  ( cd "$APP_DIR" && npm run build ) || { warn "Build fehlgeschlagen."; notify "Pulsar konnte nicht starten" "npm run build fehlgeschlagen"; exit 1; }
fi

# --- start server ----------------------------------------------------------
mkdir -p "$LOG_DIR"
: > "$LOG"

say "Pulsar Studio startet …"
( cd "$APP_DIR" && exec node server/index.mjs ) >>"$LOG" 2>&1 &
SERVER_PID=$!
STARTED_SERVER=1

for _ in $(seq 1 120); do
  if is_up; then break; fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    warn "Der Server ist abgebrochen:"
    tail -n 20 "$LOG" >&2
    notify "Pulsar konnte nicht starten" "Server abgebrochen – $LOG"
    exit 1
  fi
  sleep 0.25
done

if ! is_up; then
  warn "Zeitüberschreitung beim Start. Log: $LOG"
  notify "Pulsar konnte nicht starten" "Zeitüberschreitung – $LOG"
  exit 1
fi

# --- browser ---------------------------------------------------------------
# Snap-packaged browsers are confined: they cannot use a custom profile inside
# a hidden directory such as ~/.local/share, which is exactly what the app
# window mode needs. Detect them and fall back to the control window instead
# of leaving the user with a browser that never finishes starting.
is_snapped() {
  local bin="$1" resolved
  resolved="$(command -v "$bin" 2>/dev/null || echo "$bin")"
  case "$resolved" in
    /snap/*) return 0 ;;
  esac
  [[ -n "${SNAP:-}" ]] && return 0
  return 1
}

find_browser() {
  local candidate
  for candidate in google-chrome google-chrome-stable chromium chromium-browser brave-browser microsoft-edge vivaldi; do
    if command -v "$candidate" >/dev/null 2>&1; then
      if is_snapped "$candidate"; then
        dim "  ($candidate ist ein Snap-Paket – App-Fenster wird übersprungen)"
        continue
      fi
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

BROWSER_BIN="$(find_browser || true)"

if [[ "$MODE" == "auto" ]]; then
  if [[ -n "$BROWSER_BIN" ]]; then MODE="app-window"; else MODE="terminal"; fi
fi

if [[ "$MODE" == "app-window" ]]; then
  if [[ -z "$BROWSER_BIN" ]]; then
    warn "Kein Chromium-basierter Browser gefunden – nutze das Kontrollfenster."
    MODE="terminal"
  else
    mkdir -p "$PROFILE_DIR"
    # The isolated profile guarantees a dedicated process we can wait for, so
    # closing *this* window is what shuts the server down.
    "$BROWSER_BIN" \
      --app="$URL" \
      --user-data-dir="$PROFILE_DIR" \
      --no-first-run \
      --no-default-browser-check \
      --disable-features=Translate \
      >/dev/null 2>&1 &
    BROWSER_PID=$!
    sleep 1
    if ! kill -0 "$BROWSER_PID" 2>/dev/null; then
      warn "App-Fenster ließ sich nicht öffnen – nutze das Kontrollfenster."
      MODE="terminal"
    fi
  fi
fi

if [[ "$MODE" == "app-window" ]]; then
  # Wait for the app window; when it closes, cleanup() stops the server.
  wait "$BROWSER_PID" 2>/dev/null
  exit 0
fi

# --- terminal control window ----------------------------------------------
if [[ "$MODE" == "terminal" ]]; then
  if [[ "$MODE" != "none" ]] && command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  fi

  echo
  say  "┌─ Pulsar Studio ──────────────────────────────┐"
  say  "│  läuft auf  $URL"
  say  "│  Fenster schließen = App beenden             │"
  say  "└──────────────────────────────────────────────┘"
  echo
  dim "Log: $LOG"
  dim "Strg+C oder Fenster schließen beendet den Server."
  echo

  tail -n 0 -f "$LOG" &
  TAIL_PID=$!
  wait "$SERVER_PID" 2>/dev/null
  exit 0
fi

# --- headless (debugging) --------------------------------------------------
say "Server läuft auf $URL (kein Browser gestartet, Strg+C beendet)."
tail -n 0 -f "$LOG" &
TAIL_PID=$!
wait "$SERVER_PID" 2>/dev/null
exit 0
