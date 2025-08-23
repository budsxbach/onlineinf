const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {onRequest} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Health check endpoint
exports.health = onRequest({region: 'europe-west3'}, (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'leadgenerator-online-infinity'
  });
});

// Lead validation function triggered on document creation
exports.validateLead = onDocumentCreated({
  document: 'handwerksbetriebe/{leadId}',
  region: 'europe-west3'
}, async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }

  const leadId = event.params.leadId;
  const leadData = snapshot.data();
  
  console.log(`Lead validiert: Processing lead ${leadId}`, leadData);

  // Check for duplicates based on email and telefon
  const email = leadData.email?.stringValue;
  const telefon = leadData.telefon?.stringValue;
  
  if (!email && !telefon) {
    console.log(`Lead validiert: Lead ${leadId} has no email or phone, skipping duplicate check`);
    return;
  }

  try {
    let allMatches = [];
    
    // Query for existing leads with same email
    if (email) {
      const existingLeadsQuery = db.collection('handwerksbetriebe')
        .where('email.stringValue', '==', email);
      
      const existingLeadsSnapshot = await existingLeadsQuery.get();
      allMatches.push(...existingLeadsSnapshot.docs);
    }
    
    // Also check by phone if provided
    if (telefon) {
      const phoneQuery = db.collection('handwerksbetriebe')
        .where('telefon.stringValue', '==', telefon);
      const phoneSnapshot = await phoneQuery.get();
      allMatches.push(...phoneSnapshot.docs);
    }
    
    // Remove duplicates and filter out the current document
    allMatches = allMatches
      .filter((doc, index, self) => 
        doc.id !== leadId && 
        self.findIndex(d => d.id === doc.id) === index
      );

    if (allMatches.length > 0) {
      console.log(`Lead validiert: Duplicate detected for lead ${leadId}, marking as duplicate`);
      
      // Update the current document to mark as duplicate
      await snapshot.ref.update({
        'isDuplicate': {
          booleanValue: true
        },
        'duplicateOf': {
          arrayValue: {
            values: allMatches.map(doc => ({
              stringValue: doc.id
            }))
          }
        },
        'updatedAt': {
          timestampValue: new Date().toISOString()
        }
      });
      
      console.log(`Lead validiert: Successfully marked lead ${leadId} as duplicate`);
    } else {
      console.log(`Lead validiert: No duplicates found for lead ${leadId}`);
      
      // Mark as not duplicate
      await snapshot.ref.update({
        'isDuplicate': {
          booleanValue: false
        },
        'updatedAt': {
          timestampValue: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error(`Lead validiert: Error processing lead ${leadId}:`, error);
  }
});