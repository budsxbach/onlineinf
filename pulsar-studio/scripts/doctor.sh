#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  Pulsar Studio — Selbstdiagnose
#
#    bash scripts/doctor.sh
#
#  Prüft alle Voraussetzungen und startet den Server einmal testweise.
#  Die Ausgabe ist so gebaut, dass sie sich zum Weiterschicken eignet.
# ---------------------------------------------------------------------------
set -uo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4000}"
TEST_PORT="${DOCTOR_PORT:-4711}"

# Pick a free port so the probe can never talk to somebody else's server.
port_free() {
  if command -v ss >/dev/null 2>&1; then
    [[ -z "$(ss -lptnH "sport = :$1" 2>/dev/null)" ]]
  else
    ! (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
  fi
}

if ! port_free "$TEST_PORT"; then
  BASE_PORT="$TEST_PORT"
  while ! port_free "$TEST_PORT"; do
    TEST_PORT=$((TEST_PORT + 1))
    if (( TEST_PORT > BASE_PORT + 50 )); then
      TEST_PORT="$BASE_PORT"
      break
    fi
  done
fi

FAIL=0
WARN=0
ARENA_FAILED=0

ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
bad()  { printf '\033[31m✗\033[0m %s\n' "$*"; FAIL=$((FAIL+1)); }
warn() { printf '\033[33m!\033[0m %s\n' "$*"; WARN=$((WARN+1)); }
head_() { printf '\n\033[1m%s\033[0m\n' "$*"; }

printf '\033[38;5;191mPULSAR STUDIO\033[0m — Diagnose\n'
printf '\033[2m%s\033[0m\n' "$APP_DIR"

# --- System ---------------------------------------------------------------
head_ "1. System"
printf '   %s\n' "$(lsb_release -ds 2>/dev/null || cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '"' || echo unbekannt)"

if command -v node >/dev/null 2>&1; then
  NODE_VER="$(node -v)"
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "$NODE_MAJOR" -ge 20 ]]; then ok "Node.js $NODE_VER"; else bad "Node.js $NODE_VER — benötigt wird ≥ 20"; fi
else
  bad "Node.js fehlt"
fi

if command -v npm >/dev/null 2>&1; then ok "npm $(npm -v)"; else bad "npm fehlt"; fi
command -v git >/dev/null 2>&1 && ok "git $(git --version | awk '{print $3}')" || warn "git fehlt (nur für Updates nötig)"
command -v cc >/dev/null 2>&1 && ok "Compiler vorhanden (cc)" || warn "Compiler (build-essential) fehlt — nur nötig, wenn better-sqlite3 neu gebaut werden muss"
command -v curl >/dev/null 2>&1 && ok "curl vorhanden" || warn "curl fehlt — der Launcher nutzt dann node für den Health-Check (funktioniert trotzdem)"

# --- Projekt --------------------------------------------------------------
head_ "2. Projektdateien"
[[ -f "$APP_DIR/package.json" ]] && ok "package.json" || bad "package.json fehlt — falscher Ordner?"
[[ -d "$APP_DIR/node_modules" ]] && ok "node_modules vorhanden" || bad "node_modules fehlt → 'npm ci' ausführen"

if [[ -d "$APP_DIR/node_modules" ]]; then
  ( cd "$APP_DIR" && node -e "require.resolve('express')" >/dev/null 2>&1 ) && ok "express installiert" || bad "express fehlt → 'npm ci'"
  if ( cd "$APP_DIR" && node -e "const D=require('better-sqlite3'); const d=new D(':memory:'); d.prepare('select 1').get();" >/dev/null 2>&1 ); then
    ok "better-sqlite3 funktioniert"
  else
    bad "better-sqlite3 lässt sich nicht laden → 'rm -rf node_modules && npm ci' (Compiler nötig)"
  fi
fi

if [[ -f "$APP_DIR/dist/index.html" ]]; then
  ok "Oberfläche gebaut (dist/)"
  if grep -q "fonts.googleapis.com" "$APP_DIR/dist/index.html" 2>/dev/null; then
    warn "Gebautes HTML lädt Schriften von Google — ältere Version. Neu bauen: npm run build"
  else
    ok "keine externen Schriften (funktioniert offline)"
  fi
else
  bad "dist/ fehlt → 'npm run build'"
fi

# --- Datenbank ------------------------------------------------------------
head_ "3. Datenbank"
DATA_DIR="${PULSAR_DATA_DIR:-$APP_DIR/data}"
if [[ -d "$DATA_DIR" ]]; then
  if [[ -w "$DATA_DIR" ]]; then ok "Verzeichnis $DATA_DIR beschreibbar"; else bad "$DATA_DIR nicht beschreibbar → sudo chown -R \$USER:\$USER $APP_DIR"; fi
  DB="$DATA_DIR/pulsar.db"
  if [[ -f "$DB" ]]; then
    ok "pulsar.db vorhanden ($(du -h "$DB" | cut -f1))"
    for f in "$DB-wal" "$DB-shm"; do [[ -f "$f" ]] && warn "$(basename "$f") existiert — Rest einer unsauber beendeten Sitzung (harmlos, wird beim Start übernommen)"; done
  else
    ok "noch keine pulsar.db — wird beim ersten Start mit Demo-Daten angelegt"
  fi
else
  ok "data/ wird beim ersten Start angelegt"
fi

# --- Port / Prozesse ------------------------------------------------------
head_ "4. Port und Prozesse"
port_pids() {
  if command -v ss >/dev/null 2>&1; then ss -lptnH "sport = :$1" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u
  elif command -v fuser >/dev/null 2>&1; then fuser -n tcp "$1" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$' | sort -u; fi
}
RUNNING="$(port_pids "$PORT" | head -1)"
if [[ -n "$RUNNING" ]]; then
  CMDLINE="$(tr '\0' ' ' < "/proc/$RUNNING/cmdline" 2>/dev/null | cut -c1-80)"
  if [[ "$CMDLINE" == *"server/index.mjs"* ]]; then
    ok "Server läuft bereits auf Port $PORT (pid $RUNNING)"
    printf '   \033[2m→ http://localhost:%s\033[0m\n' "$PORT"
  else
    warn "Port $PORT ist von einem anderen Programm belegt: $CMDLINE"
    printf '   \033[2m→ beenden mit: sudo kill %s   (oder PORT=4001 npm start)\033[0m\n' "$RUNNING"
  fi
else
  ok "Port $PORT frei"
fi

STALE=0
for PID in $(pgrep -f 'server/index.mjs' 2>/dev/null); do
  # Nur echte node-Prozesse zählen — sonst matchen Shells, die den Pfad in
  # ihrer Kommandozeile tragen (z. B. dieser Aufruf selbst).
  [[ "$(cat "/proc/$PID/comm" 2>/dev/null)" == node* ]] || continue
  [[ "$PID" == "$$" ]] && continue
  STALE=$((STALE+1))
done
[[ "$STALE" == "0" ]] && ok "keine verwaisten Server-Prozesse" || warn "$STALE Server-Prozess(e) laufen — ggf. 'bash scripts/launch.sh --stop'"

# --- Teststart ------------------------------------------------------------
head_ "5. Teststart auf Port $TEST_PORT"
if ( cd "$APP_DIR" && PORT="$TEST_PORT" exec node server/index.mjs >/tmp/pulsar-doctor.log 2>&1 & echo $! >/tmp/pulsar-doctor.pid ); then
  TEST_PID="$(cat /tmp/pulsar-doctor.pid)"
  READY=0
  for _ in $(seq 1 80); do
    if node -e '
      const http=require("http");
      const r=http.get("http://localhost:"+process.argv[1]+"/api/health",{timeout:1000},res=>{res.resume();process.exit(res.statusCode===200?0:1)});
      r.on("error",()=>process.exit(1)); r.on("timeout",()=>{r.destroy();process.exit(1)});
    ' "$TEST_PORT" >/dev/null 2>&1; then READY=1; break; fi
    kill -0 "$TEST_PID" 2>/dev/null || break
    sleep 0.1
  done

  if [[ "$READY" == "1" ]]; then
    ok "Server startet und antwortet (Port $TEST_PORT)"
    STATS="$(curl -s -m 3 "http://localhost:$TEST_PORT/api/stats" 2>/dev/null || true)"
    if [[ -n "$STATS" ]]; then
      printf '   %s\n' "$(printf '%s' "$STATS" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);const t=j.totals||{};console.log(`Projekte ${t.projects}, Tracks ${t.tracks}, Samples ${t.samples}, Presets ${t.presets}`)}catch{console.log("Statistik nicht lesbar")}})' 2>/dev/null)"
    fi
  else
    bad "Server startet nicht — Details:"
    tail -n 12 /tmp/pulsar-doctor.log | sed 's/^/   /'
  fi
  # Der Testserver bleibt bis nach der Arena-Prüfung am Leben (Abschnitt 7).
else
  bad "Teststart konnte nicht ausgeführt werden"
fi

# --- Browser --------------------------------------------------------------
head_ "6. Browser"
if command -v xdg-open >/dev/null 2>&1; then ok "xdg-open vorhanden"; else warn "xdg-open fehlt — Seite manuell im Browser öffnen"; fi
FOUND_BROWSER=0
for b in google-chrome google-chrome-stable chromium chromium-browser brave-browser microsoft-edge vivaldi firefox; do
  if command -v "$b" >/dev/null 2>&1; then
    PATH_B="$(command -v "$b")"
    case "$PATH_B" in
      /snap/*) ok "$b ($PATH_B) — Snap-Paket, daher Kontrollfenster statt App-Fenster" ;;
      *)       ok "$b ($PATH_B)" ;;
    esac
    FOUND_BROWSER=1
  fi
done
[[ "$FOUND_BROWSER" == "1" ]] || warn "kein bekannter Browser gefunden — Standardbrowser wird über xdg-open genutzt"

# --- Arena / Composer -----------------------------------------------------
head_ "7. Arena-Composer"
COMPOSER_OUT="$(node -e '
  const base = "http://localhost:" + process.argv[1];
  const post = async (path, body) => {
    const res = await fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { json = null; }
    return { status: res.status, json };
  };
  (async () => {
    const settings = await (await fetch(base + "/api/settings")).json();
    const hasKey = !!settings["ai.hasKey"] || !!settings["ai.envKey"];
    if (!hasKey) {
      console.log("SKIP|No Arena key configured — the local composer works, the router path is untested.");
      return;
    }
    const models = await post("/api/settings/test-ai", {});
    if (!models.json || !models.json.ok) {
      console.log("FAIL|/models rejected the key|" + (models.json && models.json.error ? models.json.error : "HTTP " + models.status));
      return;
    }
    const avail = models.json.modelAvailable;
    console.log("INFO|key listed, " + models.json.modelCount + " models|model " + models.json.model + " => " + (avail === false ? "NOT available" : avail === true ? "available" : "unknown"));

    const composer = await post("/api/settings/test-composer", {});
    if (composer.json && composer.json.ok) {
      console.log("OK|composer answered via " + composer.json.endpoint + " (" + composer.json.variant + ")|");
      return;
    }
    const d = composer.json || {};
    const detail = (d.code || "error") + (d.status ? " HTTP " + d.status : "");
    console.log("FAIL|composer request rejected|" + detail + " :: " + (d.error || "no message"));
    if (Array.isArray(d.attempts)) {
      for (const a of d.attempts) {
        console.log("ATTEMPT|" + a.label + " " + a.endpoint + " -> " + (a.status === null ? "no response" : a.status) + "|" + (a.detail || ""));
      }
    }
  })().catch((e) => console.log("FAIL|probe crashed|" + e.message));
' "$TEST_PORT" 2>&1)"

if [[ -z "$COMPOSER_OUT" ]]; then
  warn "Composer-Prüfung lieferte keine Ausgabe"
else
  while IFS='|' read -r tag text extra; do
    case "$tag" in
      SKIP)    warn "$text" ;;
      INFO)    ok "$text"; [[ -n "$extra" ]] && printf '   \033[2m%s\033[0m\n' "$extra" ;;
      OK)      ok "$text" ;;
      FAIL)    bad "$text"; ARENA_FAILED=1; [[ -n "$extra" ]] && printf '   \033[2m%s\033[0m\n' "$extra" ;;
      ATTEMPT) printf '   \033[2m· %s\033[0m\n' "$text" ;;
      *)       printf '   %s\n' "$text" ;;
    esac
  done <<< "$COMPOSER_OUT"
fi

if [[ -n "${TEST_PID:-}" ]]; then
  kill "$TEST_PID" 2>/dev/null
  sleep 0.3
  kill -9 "$TEST_PID" 2>/dev/null
fi

# --- Ergebnis -------------------------------------------------------------
printf '\n'
if [[ "$FAIL" -eq 0 && "$WARN" -eq 0 ]]; then
  printf '\033[32mAlles in Ordnung.\033[0m Starten mit: bash scripts/launch.sh --no-browser\n'
elif [[ "$FAIL" -eq 0 ]]; then
  printf '\033[33m%1i Hinweis(e), aber keine blockierenden Fehler.\033[0m\n' "$WARN"
else
  printf '\033[31m%1i Fehler, %1i Hinweis(e).\033[0m\n' "$FAIL" "$WARN"
  if [[ "$ARENA_FAILED" == "1" ]]; then
    printf 'Der lokale Betrieb funktioniert — nur die Arena-Komposition scheitert.\n'
    printf 'Setze unter Settings → AI engine ein Modell, das der Key nutzen darf (siehe Liste oben),\n'
    printf 'oder lass den Composer mit der lokalen Engine arbeiten.\n'
  else
    printf 'Häufigste Lösung:  cd %s && rm -rf node_modules && npm ci && npm run build\n' "$APP_DIR"
  fi
fi
printf '\033[2mLog des Teststarts: /tmp/pulsar-doctor.log\033[0m\n'
