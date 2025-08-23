const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { onRequest, onDocumentCreated } = require('firebase-functions/v2/https');
const { onDocumentCreated: firestoreOnDocumentCreated } = require('firebase-functions/v2/firestore');

initializeApp();

// Health check endpoint
exports.health = onRequest({
  region: 'europe-west3'
}, (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'leadgenerator-online-infinity'
  });
});

// Lead validation and duplicate detection
exports.validateLead = firestoreOnDocumentCreated({
  region: 'europe-west3',
  document: 'handwerksbetriebe/{docId}'
}, async (event) => {
  const db = getFirestore();
  const docData = event.data.data();
  const docId = event.params.docId;
  
  console.log(`Lead validiert: Processing document ${docId}`, docData);
  
  if (!docData) {
    console.log('No document data found');
    return;
  }
  
  const email = docData.email?.stringValue;
  const telefon = docData.telefon?.stringValue;
  
  if (!email && !telefon) {
    console.log('No email or telefon found for duplicate check');
    return;
  }
  
  try {
    // Check for duplicates based on email or telefon
    const handwerksbetriebeRef = db.collection('handwerksbetriebe');
    let query = handwerksbetriebeRef;
    
    // Build query to find existing documents with same email or telefon
    const orConditions = [];
    if (email) {
      orConditions.push(handwerksbetriebeRef.where('email.stringValue', '==', email));
    }
    if (telefon) {
      orConditions.push(handwerksbetriebeRef.where('telefon.stringValue', '==', telefon));
    }
    
    // For now, we'll check both conditions separately
    // In a production environment, you might want to use a composite query
    let duplicateFound = false;
    
    if (email) {
      const emailQuery = await handwerksbetriebeRef.where('email.stringValue', '==', email).get();
      emailQuery.forEach(doc => {
        if (doc.id !== docId) {
          duplicateFound = true;
          console.log(`Lead validiert: Duplicate found by email: ${doc.id}`);
        }
      });
    }
    
    if (telefon && !duplicateFound) {
      const telefonQuery = await handwerksbetriebeRef.where('telefon.stringValue', '==', telefon).get();
      telefonQuery.forEach(doc => {
        if (doc.id !== docId) {
          duplicateFound = true;
          console.log(`Lead validiert: Duplicate found by telefon: ${doc.id}`);
        }
      });
    }
    
    if (duplicateFound) {
      // Update the current document to mark it as duplicate
      const docRef = db.collection('handwerksbetriebe').doc(docId);
      await docRef.update({
        'isDuplicate.booleanValue': true
      });
      console.log(`Lead validiert: Document ${docId} marked as duplicate`);
    } else {
      console.log(`Lead validiert: Document ${docId} is not a duplicate`);
    }
    
  } catch (error) {
    console.error(`Lead validiert: Error processing document ${docId}:`, error);
  }
});