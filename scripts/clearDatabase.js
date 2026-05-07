const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(500);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function clearAll() {
  console.log("⚠️ WARNING: This will delete ALL data in the following collections: users, bookings, reviews, careLogs");
  console.log("Starting deletion in 5 seconds... Press Ctrl+C to cancel.");
  
  await new Promise(r => setTimeout(r, 5000));

  const collections = ["users", "bookings", "reviews", "careLogs"];
  
  for (const col of collections) {
    console.log(`Deleting collection: ${col}...`);
    await deleteCollection(col);
  }

  console.log("✅ All testing data has been removed.");
  process.exit(0);
}

clearAll();
