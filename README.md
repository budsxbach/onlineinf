# Lead Generator Online Infinity

Firebase Functions project for lead generation and validation with duplicate detection.

## Features

- Health check endpoint
- Automatic lead validation and duplicate detection
- Firestore integration for lead storage
- Real-time duplicate detection based on email and phone number

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Install Firebase CLI (if not installed):
```bash
npm install -g firebase-tools
```

3. Start the emulators:
```bash
cd functions
npm run serve
```

This will start:
- Functions emulator on http://127.0.0.1:5001
- Firestore emulator on http://127.0.0.1:8080

## Testing

Use the PowerShell commands provided in the problem statement to test the functionality:

### Health Check
```powershell
(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).StatusCode
(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).Content
```

### Create Test Lead
```powershell
$project="leadgenerator-online-infinity"; $body=@{fields=@{name=@{stringValue="Muster-Handwerk GmbH"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}; status=@{stringValue="neu"}; quelle=@{stringValue="manual"}; createdAt=@{timestampValue=(Get-Date).ToString("o")}}} | ConvertTo-Json -Depth 10; Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-1" -Body $body -ContentType "application/json"
```

### Create Duplicate Lead
```powershell
$body=@{fields=@{name=@{stringValue="Noch ein Betrieb"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}}} | ConvertTo-Json -Depth 10; Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-2" -Body $body -ContentType "application/json"
```

## Project Structure

```
├── functions/
│   ├── index.js          # Main Functions code
│   └── package.json      # Dependencies
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json # Firestore indexes
└── README.md            # This file
```

## Function Details

### Health Endpoint
- **URL**: `/leadgenerator-online-infinity/europe-west3/health`
- **Method**: GET
- **Response**: JSON with status and timestamp

### Lead Validation Function
- **Trigger**: Document creation in `handwerksbetriebe` collection
- **Functionality**: 
  - Checks for duplicates based on email and phone number
  - Sets `isDuplicate: true` for duplicates
  - Logs validation results with "Lead validiert:" prefix