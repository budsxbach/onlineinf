#!/bin/bash
# Test script for Firebase Functions
# Run this after starting the emulator with: firebase emulators:start --only functions,firestore --project leadgenerator-online-infinity

echo "=== Testing Firebase Functions ==="
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
echo "GET http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health"
curl -s http://127.0.0.1:5001/leadgenerator-online-infinity/europe-west3/health | python3 -m json.tool
echo ""
echo ""

# Test first lead (should not be duplicate)
echo "2. Adding first lead (agent-1)..."
curl -X POST \
  "http://127.0.0.1:8080/v1/projects/leadgenerator-online-infinity/databases/(default)/documents/handwerksbetriebe?documentId=agent-1" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "name": {"stringValue": "Muster-Handwerk GmbH"},
      "email": {"stringValue": "info@muster-handwerk.de"},
      "telefon": {"stringValue": "+49 30 123456"},
      "status": {"stringValue": "neu"},
      "quelle": {"stringValue": "manual"},
      "createdAt": {"timestampValue": "'$(date -Iseconds)'"}
    }
  }' | python3 -m json.tool
echo ""
echo ""

# Wait a moment for function to process
echo "Waiting 2 seconds for function to process..."
sleep 2

# Test duplicate lead (should set isDuplicate: true)
echo "3. Adding duplicate lead (agent-2)..."
curl -X POST \
  "http://127.0.0.1:8080/v1/projects/leadgenerator-online-infinity/databases/(default)/documents/handwerksbetriebe?documentId=agent-2" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "name": {"stringValue": "Noch ein Betrieb"},
      "email": {"stringValue": "info@muster-handwerk.de"},
      "telefon": {"stringValue": "+49 30 123456"}
    }
  }' | python3 -m json.tool
echo ""
echo ""

# Wait a moment for function to process
echo "Waiting 2 seconds for function to process..."
sleep 2

# Check if duplicate was marked
echo "4. Checking if agent-2 was marked as duplicate..."
curl -s "http://127.0.0.1:8080/v1/projects/leadgenerator-online-infinity/databases/(default)/documents/handwerksbetriebe/agent-2" | python3 -m json.tool
echo ""
echo ""

echo "=== Test completed ==="
echo "Check the Firebase Functions logs for 'Lead validiert:' messages"
echo "agent-2 should have isDuplicate.booleanValue: true"