#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$DIR/.venv"

echo "=== ODT-zu-PDF Konverter ==="
echo ""

# Python prüfen
if command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    echo "FEHLER: Python ist nicht installiert."
    echo "Bitte installiere Python 3.9+ von https://www.python.org"
    exit 1
fi

echo "Python gefunden: $($PYTHON --version)"

# Virtuelle Umgebung erstellen (einmalig)
if [ ! -d "$VENV_DIR" ]; then
    echo "Erstelle virtuelle Umgebung..."
    $PYTHON -m venv "$VENV_DIR"
fi

# Virtuelle Umgebung aktivieren
source "$VENV_DIR/bin/activate"

# Abhängigkeiten installieren (nur wenn nötig)
if [ ! -f "$VENV_DIR/.deps_installed" ]; then
    echo "Installiere Abhängigkeiten..."
    pip install --upgrade pip -q
    pip install -r "$DIR/requirements.txt" -q
    touch "$VENV_DIR/.deps_installed"
    echo "Abhängigkeiten installiert."
fi

echo ""
echo "Starte Server auf http://localhost:5000"
echo "Zum Beenden: Strg+C"
echo ""

$PYTHON "$DIR/app.py"
