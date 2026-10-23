# AuronOrigin YouTube Video Studio (`Arena Router Edition`)

Vollautomatisches YouTube-Produktionsstudio für deine Marke **AuronOrigin** – exakt abgestimmt auf dein offizielles Brand Identity Kit, deine bestehende Kanal-Ästhetik und deine **Arena API / Arena Router Credits**.

---

## Was das Programm automatisch erledigt

1. **Arena API & Arena Router Integration (`coding-router-preview`)**
   - Nutzt deinen vorhandenen Arena API-Key über `https://api.preview.arena.ai` (Early Access / `$1.000` Router-Credits) oder `https://api.arena.ai`.
   - Verifiziert deinen Key, lädt automatisch alle freigeschalteten Modelle und zählt deine Router-Anfragen & Tokens live mit.
2. **Automatische Themen-Recherche bei Neueingabe**
   - Du gibst lediglich ein Stichwort oder eine Frage ein.
   - Das Studio recherchiert automatisch über Wikipedia (DE/EN), Google News DE, arXiv, Crossref-Fachstudien sowie die integrierte AuronOrigin-Wissensmatrix und trennt sauber zwischen **`[FAKT]`** und **`[MYSTERY-DEUTUNG]`**.
3. **Markentreue AuronOrigin-Videoproduktion (Wiedererkennungswert)**
   - **Farbwelt (60-20-15-5 Regel)**: Deep Space `#0B0C10`, Cosmic Steel `#1F2833`, Auron-Gold `#D4AF37` und Mystic Violet `#4A235A`.
   - **Typografie**: Monumentale `Cinzel`-Versalien-Headlines & klare `Inter`-Faktentypografie inkl. eingebrannter Untertitel mit Gold-Keyword-Highlighting.
   - **Original-Assets integriert**: Offizielles **5s Intro**, **7s Outro**, bereinigtes **Ouroboros-Wasserzeichen**, **Auge-des-Horus-Hologramm**, **RGB-Slice-Glitch-VFX** und Ken-Burns-Kamerafahrten.
   - **Deutsche Tonstimme (Voiceover)**: `de-DE-ConradNeural` (`-15%` Tempo, `-3Hz` Tiefe) + lokale KI-Stimme (`Thorsten Neural VITS` im Browser) inkl. kosmischem Auron-Raumhall (`aecho=0.8:0.88:60:0.28`).
   - **Hintergrundmusik mit Auto-Ducking**: Dein Original-Soundtrack **„Glitch Horizon“ (60 BPM)** sowie prozedurale 432-Hz-Tempel- & Quanten-Puls-Soundtracks, automatisch sanft abgesenkt während gesprochen wird.
4. **Abonnenten- & Klickraten-Booster (YouTube SEO Paket)**
   - Generiert automatisch ein **1280×720 High-CTR Thumbnail (.PNG)** (2–3 Worte in Gold-Versalien), `.SRT`-Untertitel, 3 alternative Klickraten-Titel, Beschreibung, Tags, den angepinnten **`[FAKT / DEUTUNG]`-Kommentar** und eine Community-Umfrage – alles per 1-Klick kopierbar oder als `.ZIP` herunterladbar.

---

## Schnellstart (Lokal auf Windows / Mac / Linux)

### Windows
Doppelklick auf **`START_AURON_STUDIO.bat`** im Ordner `auronorigin-studio`.  
Das Browserfenster öffnet sich automatisch unter `http://localhost:8000`.

### Ubuntu / Debian Linux (1-Befehl Komplett-Installation)
Öffne ein Terminal (`STRG + ALT + T`) und füge diesen kompletten Befehl per Copy-Paste ein:
```bash
sudo apt-get update && sudo apt-get install -y git curl && \
if [ ! -d "$HOME/onlineinf/.git" ]; then \
  git clone -b arena/6b00fd95-onlineinf https://github.com/budsxbach/onlineinf.git "$HOME/onlineinf"; \
else \
  git -C "$HOME/onlineinf" fetch origin arena/6b00fd95-onlineinf && \
  git -C "$HOME/onlineinf" checkout arena/6b00fd95-onlineinf && \
  git -C "$HOME/onlineinf" pull origin arena/6b00fd95-onlineinf; \
fi && \
bash "$HOME/onlineinf/auronorigin-studio/install_ubuntu.sh"
```

Später jederzeit wieder starten mit:
```bash
~/onlineinf/auronorigin-studio/start_studio.sh
```

---

## Bedienung in 3 Schritten

1. **Arena API-Key eintragen**: Oben deinen Arena API-Key einfügen und auf **„Key prüfen & speichern“** klicken (wird geschützt lokal unter `.output/auronorigin/settings.json` gespeichert, niemals in Git).
2. **Thema eingeben**: Im großen Themenfeld ein neues Thema eintippen (oder einen der Schnellauswahl-Impulse aus *Simulations-News*, *Alte Codes* oder *Bewusstseins-Hacks* anklicken).
3. **1-Klick Produktion starten**: Auf **„⚡ Komplettes YouTube-Video in 1 Klick erstellen“** klicken – oder zuerst das Skript entwerfen, einzelne Szenen/Texte/Bilder anpassen und danach auf **„🎬 Fertiges AuronOrigin YouTube-Video (MP4) jetzt rendern“** klicken.
