#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -x "$REPO_ROOT/.venv/bin/python" ]; then
  PY_BIN="$REPO_ROOT/.venv/bin/python"
else
  if [ ! -x "$SCRIPT_DIR/.venv/bin/python" ]; then
    echo "[AuronOrigin Studio] Erstelle virtuelle Python-Umgebung (.venv)..."
    python3 -m venv "$SCRIPT_DIR/.venv"
    "$SCRIPT_DIR/.venv/bin/pip" install --upgrade pip
    "$SCRIPT_DIR/.venv/bin/pip" install -r "$SCRIPT_DIR/requirements.txt"
  fi
  PY_BIN="$SCRIPT_DIR/.venv/bin/python"
fi

if [ ! -d "$SCRIPT_DIR/node_modules/onnxruntime-web/dist" ] && command -v npm >/dev/null 2>&1; then
  echo "[AuronOrigin Studio] Installiere WebAssembly-Module für lokale KI-Sprachsynthese..."
  (cd "$SCRIPT_DIR" && npm install --no-audit --no-fund)
fi

PORT="${PORT:-8000}"
echo "=========================================================="
echo "  AURONORIGIN YOUTUBE VIDEO STUDIO"
echo "  Öffne im Browser: http://localhost:${PORT}"
echo "  Beenden jederzeit mit: STRG + C"
echo "=========================================================="

# Auf Ubuntu Desktop automatisch den Standardbrowser öffnen
if [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ] && command -v xdg-open >/dev/null 2>&1; then
  (sleep 2 && xdg-open "http://localhost:${PORT}" >/dev/null 2>&1 || true) &
fi

cd "$SCRIPT_DIR"
exec "$PY_BIN" -m uvicorn backend.app:app --host 0.0.0.0 --port "$PORT"
