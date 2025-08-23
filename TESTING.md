# Testing Guide

## Voraussetzungen
1. Firebase CLI installiert: `npm install -g firebase-tools`
2. Firebase Emulator Suite verfügbar

## Emulator starten
```bash
# In einem Terminal:
firebase emulators:start --only functions,firestore --project leadgenerator-online-infinity
```

Nach dem Start sollten folgende Services verfügbar sein:
- Functions: http://127.0.0.1:5001
- Firestore: http://127.0.0.1:8080

## PowerShell Tests (wie in der Aufgabenstellung)

### 1. Health-Check
```powershell
# Health endpoint testen
(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).StatusCode
(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).Content
```

Erwartete Antwort:
- StatusCode: 200
- Content: `{"status":"healthy","timestamp":"...","service":"leadgenerator-online-infinity"}`

### 2. Test-Lead posten (triggert Function)
```powershell
$project="leadgenerator-online-infinity"
$body=@{fields=@{name=@{stringValue="Muster-Handwerk GmbH"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}; status=@{stringValue="neu"}; quelle=@{stringValue="manual"}; createdAt=@{timestampValue=(Get-Date).ToString("o")}}} | ConvertTo-Json -Depth 10
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-1" -Body $body -ContentType "application/json"
```

### 3. Duplikat posten (soll isDuplicate:true setzen)
```powershell
$body=@{fields=@{name=@{stringValue="Noch ein Betrieb"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}}} | ConvertTo-Json -Depth 10
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-2" -Body $body -ContentType "application/json"
```

### 4. Logs überprüfen
Im Functions Terminal sollte erscheinen:
```
Lead validiert: Processing document agent-1 ...
Lead validiert: Document agent-1 is not a duplicate

Lead validiert: Processing document agent-2 ...
Lead validiert: Duplicate found by email: agent-1
Lead validiert: Document agent-2 marked as duplicate
```

### 5. isDuplicate Flag überprüfen
```powershell
# agent-2 Dokument abrufen und isDuplicate Flag prüfen
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe/agent-2"
```

Das Dokument sollte `isDuplicate: { booleanValue: true }` enthalten.

## Funktionsweise

### Health Endpoint
- URL: `/leadgenerator-online-infinity/europe-west3/health`
- Method: GET
- Response: JSON mit Status, Timestamp und Service-Name

### Lead Validation Function
- Trigger: Firestore Document Created in Collection `handwerksbetriebe`
- Region: `europe-west3`
- Funktionalität:
  1. Extrahiert email und telefon aus dem neuen Dokument
  2. Sucht nach bestehenden Dokumenten mit gleicher email oder telefon
  3. Wenn Duplikat gefunden: Setzt `isDuplicate.booleanValue = true`
  4. Loggt alle Aktivitäten mit "Lead validiert:" Prefix

### Duplicate Detection Logic
- Vergleicht `email.stringValue` und `telefon.stringValue`
- Markiert das NEUE Dokument als Duplikat (nicht das existierende)
- Unterstützt sowohl Email- als auch Telefon-basierte Duplikaterkennung