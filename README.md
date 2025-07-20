# OnlineInf Email Agent

Dieses Repository enthält einen einfachen Python-basierten KI-Agenten, der eingehende E-Mails automatisch beantworten kann. Der Agent nutzt IMAP zum Abrufen ungelesener Nachrichten und SMTP zum Senden von Antworten. Optional kann die OpenAI-API verwendet werden, um auf Basis des E-Mail-Inhalts passende Antworten zu erzeugen.

## Voraussetzungen

- Python 3
- Optional: `openai` Python-Paket und ein gültiger OpenAI API-Schlüssel

## Installation

1. Abhängigkeiten installieren (falls Sie die OpenAI-Funktion nutzen möchten):
   ```bash
   pip install openai
   ```
2. Umgebungsvariablen setzen:
   - `IMAP_SERVER` – Adresse des IMAP-Servers
   - `SMTP_SERVER` – Adresse des SMTP-Servers
   - `EMAIL_ADDRESS` – Ihre E‑Mail-Adresse
   - `EMAIL_PASSWORD` – Passwort oder App-Passwort
   - `OPENAI_API_KEY` – API-Schlüssel für OpenAI (optional)

## Verwendung

Den Agenten ausführen:

```bash
python email_agent.py
```

Der Agent durchsucht den Posteingang nach ungelesenen Nachrichten, generiert Antworten und sendet diese automatisch. Ist kein OpenAI-Paket vorhanden oder kein API-Schlüssel gesetzt, wird eine einfache Standardantwort verwendet.

