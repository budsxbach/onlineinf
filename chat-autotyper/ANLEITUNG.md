# Chat AutoTyper AI – Dokumentation & Einrichtung

Dieses Tool ermöglicht es, auf **jeder beliebigen Website** automatisiert den Chatverlauf auszulesen, mithilfe einer KI (OpenAI, Anthropic Claude oder Google Gemini) eine passende Antwort zu erstellen und diese **Buchstabe für Buchstabe wie über eine echte Tastatur** in das Chatfeld einzugeben – **ohne sie automatisch abzusenden**.

Am Ende bleibt der fertig getippte Text im Chat-Eingabefeld stehen, sodass du ihn in Ruhe überprüfen, bei Bedarf anpassen und selbst abschicken kannst.

---

## Ordnerstruktur

- `chat-autotyper/extension/` – Komplette **Chrome / Edge / Brave Erweiterung (Manifest V3)**
  - `manifest.json` – Erweiterungs-Konfiguration
  - `background.js` – Hintergrund-Service-Worker für CORS-freie KI-API-Anfragen (OpenAI, Claude, Gemini)
  - `content.js` – Schwebendes Steuer-Panel (im isolierten Shadow-DOM), visueller Element-Picker, `MutationObserver` für den Chatverlauf und die **Human Keyboard Typer Engine**
  - `popup.html` & `popup.js` – Schnellzugriff über das Erweiterungs-Icon in der Browserleiste
- `chat-autotyper/userscript/chat-autotyper.user.js` – **All-in-One Tampermonkey / Violentmonkey Userscript** (für Chrome, Edge, Firefox, Safari, Opera)
- `chat-autotyper/downloads/chat-autotyper-extension.zip` – Fertig gepacktes ZIP-Archiv der Browser-Erweiterung
- `chat-autotyper/demo/` – Interaktive Live-Test-Website zum Ausprobieren in Echtzeit

---

## Installation (Variante 1: Chrome / Edge / Brave Erweiterung)

1. Öffne in deinem Browser die Adresse:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Schalte oben rechts den **Entwicklermodus** (Developer mode) ein.
3. Klicke oben links auf **„Entpackte Erweiterung laden“** (*Load unpacked*).
4. Wähle den Ordner `chat-autotyper/extension` aus (oder entpacke zuvor `chat-autotyper-extension.zip`).
5. Das **Chat AutoTyper AI**-Widget erscheint nun auf jeder geöffneten Website unten rechts (und ist frei verschiebbar sowie minimierbar).

---

## Installation (Variante 2: Tampermonkey Userscript)

1. Installiere die Browser-Erweiterung **Tampermonkey** oder **Violentmonkey**.
2. Öffne das Dashboard von Tampermonkey und klicke auf **„Neues Skript erstellen“** (`+`).
3. Kopiere den gesamten Inhalt der Datei `chat-autotyper/userscript/chat-autotyper.user.js` hinein und speichere mit `Strg + S`.

---

## Bedienung auf jeder Website

1. **Elemente per Klick zuweisen (Einmalig pro Website)**:
   - Klicke im Widget auf **`🎯 Chatverlauf wählen`** und klicke danach auf der Website auf den Container, in dem die Chat-Nachrichten stehen.
   - Klicke im Widget auf **`⌨️ Eingabefeld wählen`** und klicke danach in das Textfeld, in das du normalerweise deine Nachrichten schreibst (`<textarea>`, `<input>` oder `contenteditable`-Feld wie bei WhatsApp Web, Instagram, Intercom, Zendesk etc.).
   - *Hinweis:* Deine Auswahl wird für diese Website automatisch gespeichert. Alternativ kannst du auch auf **`🔍 Auto-Erkennung`** klicken.

2. **KI-API verbinden (`3. KI & API`-Tab)**:
   - Wähle deinen Anbieter:
     - **OpenAI**: z. B. `gpt-4o-mini` oder `gpt-4o`
     - **Anthropic Claude**: z. B. `claude-3-5-sonnet-latest` oder `claude-3-5-haiku-latest`
     - **Google Gemini**: z. B. `gemini-2.5-flash` oder `gemini-1.5-pro`
     - **Lokaler Demo-/Smart-Modus**: Funktioniert sofort ohne API-Key zum Testen.
   - Trage deinen API-Key ein und passe bei Bedarf den **System-Prompt** an (z. B. deinen Namen, deine Firma, ob du duzt oder siezt).

3. **Tastatur-Geschwindigkeit anpassen (`2. Tastatur`-Tab)**:
   - Wähle zwischen **🐢 Langsam**, **🧑 Natürlich** oder **⚡ Schnell** (oder gib die Millisekunden pro Zeichen und die Satzzeichen-Pause individuell an).
   - Optional kannst du **„Seltene Tippfehler + Backspace-Korrektur simulieren“** aktivieren – dann vertippt sich das Programm gelegentlich auf einer echten QWERTZ-Nachbartaste, drückt `Backspace` und tippt den richtigen Buchstaben weiter.

4. **Automatisches Mitlesen & Eintippen (`1. Steuerung`-Tab)**:
   - Wenn **`👁️ Auto-Modus`** aktiviert ist, überwacht das Programm den Chatverlauf in Echtzeit. Sobald der Gesprächspartner eine neue Nachricht schickt, liest es den gesamten Verlauf, generiert die passende Antwort und tippt sie Zeichen für Zeichen in das Chatfeld.
   - Über den Button **`⚡ Jetzt Chat lesen, Antwort erstellen & langsam tippen`** (optional mit eigenem Kurz-Stichwort) kannst du den Vorgang jederzeit auch manuell starten.
   - Mit **`ESC`** oder dem **`⏹️ Stoppen`**-Button kannst du das Tippen jederzeit mitten im Satz anhalten.
   - **Kein Auto-Send:** Sobald der letzte Buchstabe getippt wurde, stoppt das Programm. Du überprüfst den Text im Chatfeld und drückst selbst auf Senden.
