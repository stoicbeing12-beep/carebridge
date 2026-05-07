import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { caregivers } from "../src/lib/data";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedCaregivers() {
  for (const cg of caregivers) {
    const docRef = doc(collection(db, "caregivers"), cg.id);
    await setDoc(docRef, cg);
    console.log(`Seeded ${cg.id}`);
  }
}

seedCaregivers().then(() => {
  console.log("Seeding complete");
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
