#!/bin/bash

# Test script for the Firebase Functions setup
echo "Testing Firebase Functions Lead Generation System"
echo "================================================"

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "Warning: Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

echo "1. Starting Firebase emulators..."
echo "   Functions: http://127.0.0.1:5001"
echo "   Firestore: http://127.0.0.1:8080"
echo ""
echo "Run the following PowerShell commands to test:"
echo ""
echo "# Health-Check"
echo '(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).StatusCode'
echo '(Invoke-WebRequest http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health).Content'
echo ""
echo "# Test-Lead posten (triggert Function)"
echo '$project="leadgenerator-online-infinity"; $body=@{fields=@{name=@{stringValue="Muster-Handwerk GmbH"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}; status=@{stringValue="neu"}; quelle=@{stringValue="manual"}; createdAt=@{timestampValue=(Get-Date).ToString("o")}}} | ConvertTo-Json -Depth 10; Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-1" -Body $body -ContentType "application/json"'
echo ""
echo "# Duplikat posten (soll isDuplicate:true setzen)"
echo '$body=@{fields=@{name=@{stringValue="Noch ein Betrieb"}; email=@{stringValue="info@muster-handwerk.de"}; telefon=@{stringValue="+49 30 123456"}}} | ConvertTo-Json -Depth 10; Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/v1/projects/$project/databases/(default)/documents/handwerksbetriebe?documentId=agent-2" -Body $body -ContentType "application/json"'
echo ""
echo "To start emulators, run: cd functions && npm run serve"