# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Firebase CLI installed globally: `npm install -g firebase-tools`

## Setup Steps

1. **Install dependencies:**
```bash
cd functions
npm install
```

2. **Start emulators:**
```bash
cd functions
npm run serve
```

3. **Test with PowerShell commands:**

### Health Check
```powershell
(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).StatusCode
(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).Content
```

### Create First Lead
```powershell
$project="leadgenerator-online-infinity"; $body=@{fields=@{name=@{stringValue="Muster-Handwerk GmbH"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}; status=@{stringValue="neu"}; quelle=@{stringValue="manual"}; createdAt=@{timestampValue=(Get-Date).ToString("o")}}} | ConvertTo-Json -Depth 10; Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-1" -Body $body -ContentType "application/json"
```

### Create Duplicate Lead
```powershell
$body=@{fields=@{name=@{stringValue="Noch ein Betrieb"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}}} | ConvertTo-Json -Depth 10; Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-2" -Body $body -ContentType "application/json"
```

### Verify Results
- Check the Functions console output for "Lead validiert:" messages
- Verify agent-2 document has `isDuplicate: true`