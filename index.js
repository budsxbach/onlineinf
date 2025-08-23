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
    let duplicateFound = false;
    
    // Get all documents and check manually since Firestore queries can be complex with nested fields
    const allDocs = await handwerksbetriebeRef.get();
    
    allDocs.forEach(doc => {
      if (doc.id === docId) {
        return; // Skip self
      }
      
      const data = doc.data();
      const docEmail = data.email?.stringValue;
      const docTelefon = data.telefon?.stringValue;
      
      if ((email && docEmail === email) || (telefon && docTelefon === telefon)) {
        duplicateFound = true;
        const matchType = (email && docEmail === email) ? 'email' : 'telefon';
        console.log(`Lead validiert: Duplicate found by ${matchType}: ${doc.id}`);
      }
    });
    
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