#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "  AURONORIGIN STUDIO • UBUNTU KOMPLETT-INSTALLATION"
echo "=========================================================="

echo "[1/4] Installiere benötigte Ubuntu-Systempakete (Python, FFmpeg, Node.js/npm)..."
sudo apt-get update
sudo apt-get install -y git curl ffmpeg python3 python3-venv python3-pip nodejs npm

echo "[2/4] Richte isolierte Python-Umgebung (.venv) ein & installiere Pakete..."
python3 -m venv "$SCRIPT_DIR/.venv"
"$SCRIPT_DIR/.venv/bin/pip" install --upgrade pip
"$SCRIPT_DIR/.venv/bin/pip" install -r "$SCRIPT_DIR/requirements.txt"

echo "[3/4] Installiere lokale WebAssembly-Komponenten (ONNX Runtime für deutsche KI-Stimme)..."
(cd "$SCRIPT_DIR" && npm install --no-audit --no-fund)

chmod +x "$SCRIPT_DIR/start_studio.sh"

# Optional: Desktop-Starter für Ubuntu anlegen, falls ein Desktop-Ordner existiert
for DESK_DIR in "$HOME/Schreibtisch" "$HOME/Desktop"; do
  if [ -d "$DESK_DIR" ]; then
    DESKTOP_FILE="$DESK_DIR/AuronOrigin-Studio.desktop"
    cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=AuronOrigin Studio
Comment=AuronOrigin YouTube Video Generator (Arena Router)
Exec=$SCRIPT_DIR/start_studio.sh
Icon=$SCRIPT_DIR/assets/brand/watermark_clean.png
Terminal=true
Categories=AudioVideo;Video;
EOF
    chmod +x "$DESKTOP_FILE"
    echo "[Info] Desktop-Verknüpfung erstellt: $DESKTOP_FILE"
  fi
done

echo ""
echo "=========================================================="
echo "  ✓ INSTALLATION ERFOLGREICH ABGESCHLOSSEN!"
echo "  Starte jetzt AuronOrigin Studio auf http://localhost:8000 ..."
echo "=========================================================="
exec "$SCRIPT_DIR/start_studio.sh"
