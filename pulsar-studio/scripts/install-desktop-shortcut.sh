#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  Installs a desktop shortcut for Pulsar Studio.
#
#    bash scripts/install-desktop-shortcut.sh              # auto-detect mode
#    bash scripts/install-desktop-shortcut.sh --terminal   # force control window
#    bash scripts/install-desktop-shortcut.sh --app-window # force app window
#    bash scripts/install-desktop-shortcut.sh --remove
#
#  The shortcut starts the server on double-click and stops it again when the
#  window is closed. Nothing runs permanently in the background.
# ---------------------------------------------------------------------------
set -uo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
LAUNCHER="$APP_DIR/scripts/launch.sh"
ICON="$APP_DIR/public/icons/icon-512.png"
FALLBACK_ICON="$APP_DIR/public/favicon.svg"
DESKTOP_DIR="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
APPS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
DESKTOP_FILE_NAME="pulsar-studio.desktop"

MODE="auto"
ACTION="install"
case "${1:-}" in
  --terminal) MODE="terminal" ;;
  --app-window) MODE="app-window" ;;
  --remove) ACTION="remove" ;;
  -h|--help) sed -n '2,14p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; exit 2 ;;
esac

ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
info() { printf '\033[2m· %s\033[0m\n' "$*"; }
fail() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; }

# --- remove ---------------------------------------------------------------
if [[ "$ACTION" == "remove" ]]; then
  removed=0
  for f in "$DESKTOP_DIR/$DESKTOP_FILE_NAME" "$APPS_DIR/$DESKTOP_FILE_NAME"; do
    [[ -f "$f" ]] && rm -f "$f" && ok "entfernt: $f" && removed=1
  done
  command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS_DIR" >/dev/null 2>&1
  [[ $removed -eq 1 ]] || info "Es war keine Verknüpfung installiert."
  exit 0
fi

# --- checks ---------------------------------------------------------------
command -v node >/dev/null 2>&1 || { fail "Node.js fehlt. Installiere es zuerst (siehe README)."; exit 1; }
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
[[ "$NODE_MAJOR" -ge 20 ]] || { fail "Node.js $NODE_MAJOR ist zu alt – benötigt wird 20 oder neuer."; exit 1; }
ok "Node.js $(node -v)"

[[ -d "$APP_DIR/node_modules" ]] || { info "Installiere Abhängigkeiten …"; ( cd "$APP_DIR" && npm ci --no-audit --no-fund ) || { fail "npm ci fehlgeschlagen."; exit 1; }; }
ok "Abhängigkeiten vorhanden"

[[ -f "$APP_DIR/dist/index.html" ]] || { info "Baue die Oberfläche …"; ( cd "$APP_DIR" && npm run build ) || { fail "Build fehlgeschlagen."; exit 1; }; }
ok "Oberfläche gebaut"

chmod +x "$LAUNCHER"
ok "Launcher ausführbar"

# --- pick the launch mode -------------------------------------------------
find_browser() {
  local candidate
  for candidate in google-chrome google-chrome-stable chromium chromium-browser brave-browser microsoft-edge vivaldi; do
    command -v "$candidate" >/dev/null 2>&1 && { echo "$candidate"; return 0; }
  done
  return 1
}

BROWSER_BIN="$(find_browser || true)"

if [[ "$MODE" == "auto" ]]; then
  if [[ -n "$BROWSER_BIN" ]]; then MODE="app-window"; else MODE="terminal"; fi
fi

if [[ "$MODE" == "app-window" ]]; then
  if [[ -z "$BROWSER_BIN" ]]; then
    info "Kein Chromium-basierter Browser gefunden – verwende das Kontrollfenster."
    MODE="terminal"
  else
    ok "App-Fenster über ${BROWSER_BIN} (Schließen beendet die App)"
  fi
fi

if [[ "$MODE" == "terminal" ]]; then
  ok "Kontrollfenster im Terminal (Fenster schließen beendet die App)"
fi

[[ -f "$ICON" ]] || ICON="$FALLBACK_ICON"

# --- write the .desktop file ---------------------------------------------
if [[ "$MODE" == "app-window" ]]; then
  EXEC_LINE="\"$LAUNCHER\" --app-window"
  TERMINAL_FLAG="false"
else
  EXEC_LINE="\"$LAUNCHER\" --terminal"
  TERMINAL_FLAG="true"
fi

desktop_entry() {
  cat <<EOF
[Desktop Entry]
Type=Application
Version=1.1
Name=Pulsar Studio
GenericName=Beat Lab
Comment=Beat-Lab im Browser – Schritt-Sequencer, Piano-Roll, Mixer und Arena-Composer
Exec=$EXEC_LINE
TryExec=$LAUNCHER
Path=$APP_DIR
Icon=$ICON
Terminal=$TERMINAL_FLAG
Categories=AudioVideo;Audio;Development;
Keywords=music;beat;daw;studio;sequencer;pulsar;
StartupNotify=true
StartupWMClass=pulsar-studio
Actions=Stop;

[Desktop Action Stop]
Name=Pulsar Studio beenden
Exec="$LAUNCHER" --stop
EOF
}

install_one() {
  local target="$1"
  mkdir -p "$(dirname "$target")"
  desktop_entry > "$target"
  chmod +x "$target"
  # GNOME 42+: files on the desktop must be explicitly trusted to be runnable.
  if command -v gio >/dev/null 2>&1; then
    gio set "$target" metadata::trusted true >/dev/null 2>&1 || true
  fi
  ok "Verknüpfung: $target"
}

install_one "$APPS_DIR/$DESKTOP_FILE_NAME"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS_DIR" >/dev/null 2>&1

if [[ -d "$DESKTOP_DIR" ]]; then
  install_one "$DESKTOP_DIR/$DESKTOP_FILE_NAME"
else
  info "Kein Schreibtisch-Ordner gefunden ($DESKTOP_DIR) – Eintrag nur im Anwendungsmenü."
fi

echo
ok "Fertig."
echo '  Doppelklick auf "Pulsar Studio" startet die App.'
echo '  Fenster schließen beendet sie wieder vollständig.'
if [[ "$MODE" == "terminal" ]]; then
  echo
  info 'Damit das Kontrollfenster ohne Rückfrage startet: Rechtsklick auf das Symbol → "Starten erlauben".'
fi
