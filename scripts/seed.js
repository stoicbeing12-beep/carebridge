const admin = require("firebase-admin");
const path = require("path");

// 1. Load the service account key
// Make sure you have downloaded this from Firebase and placed it in the root folder
const serviceAccount = require("../serviceAccountKey.json");

// 2. Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 3. Mock Data (Copied from src/lib/data.ts)
const caregivers = [
  {
    id: "cg-1",
    name: "Sarah Levi",
    photo: "https://i.pravatar.cc/150?u=sarah",
    type: ["Elder Care", "Post-Hospital Recovery"],
    gender: "Female",
    experienceYears: 8,
    rating: 4.9,
    reviews: 124,
    hourlyRate: 60,
    location: "Tel Aviv-Yafo",
    languages: ["Hebrew", "English", "Russian"],
    bio: "Compassionate and dedicated caregiver with over 8 years of experience in elder care and post-hospital recovery in central Israel. I believe in treating everyone with dignity and respect.",
    skills: ["Mobility Assistance", "Medication Management", "Meal Preparation", "Companionship"],
    certifications: ["Certified Nursing Assistant (CNA)", "First Aid & CPR"],
    verified: true,
    availableNow: true,
    visaStatus: "Israeli Citizen",
    phone: "+972 50 123 4567",
  },
  {
    id: "cg-2",
    name: "David Cohen",
    photo: "https://i.pravatar.cc/150?u=david",
    type: ["Elder Care", "Dementia Care"],
    gender: "Male",
    experienceYears: 12,
    rating: 4.8,
    reviews: 89,
    hourlyRate: 75,
    location: "Jerusalem",
    languages: ["Hebrew", "English", "Arabic"],
    bio: "Experienced in managing patients with Alzheimer's and Dementia. I provide a calm and safe environment for seniors requiring specialized attention in the Jerusalem area.",
    skills: ["Dementia Care", "Personal Hygiene", "Feeding", "Physical Therapy Support"],
    certifications: ["Advanced Dementia Care Training", "CPR Certified"],
    verified: true,
    availableNow: false,
    visaStatus: "Israeli Citizen",
    phone: "+972 52 987 6543",
  },
  {
    id: "cg-3",
    name: "Elena Popova",
    photo: "https://i.pravatar.cc/150?u=elena",
    type: ["Childcare", "Special Needs"],
    gender: "Female",
    experienceYears: 5,
    rating: 4.7,
    reviews: 56,
    hourlyRate: 50,
    location: "Haifa",
    languages: ["Russian", "Hebrew", "English"],
    bio: "Energetic and patient caregiver specializing in childcare and special needs. I focus on engaging activities and ensuring a safe space for children in northern Israel.",
    skills: ["Childcare", "Special Needs Support", "Tutoring", "Engaging Activities"],
    certifications: ["Early Childhood Education Certificate", "Pediatric First Aid"],
    verified: true,
    availableNow: true,
    visaStatus: "Permanent Resident",
    phone: "+972 54 111 2222",
  },
  {
    id: "cg-4",
    name: "Yosef Abraham",
    photo: "https://i.pravatar.cc/150?u=yosef",
    type: ["Post-Hospital Recovery", "Elder Care"],
    gender: "Male",
    experienceYears: 15,
    rating: 5.0,
    reviews: 210,
    hourlyRate: 85,
    location: "Beersheba",
    languages: ["Hebrew", "English", "French"],
    bio: "Former nurse turned dedicated caregiver. I specialize in post-surgical recovery and complex medical needs at home in the Negev region.",
    skills: ["Wound Care", "Vitals Monitoring", "Mobility Support", "Elder Care"],
    certifications: ["Registered Nurse (RN) - Inactive", "Advanced First Aid"],
    verified: true,
    availableNow: true,
    visaStatus: "Israeli Citizen",
    phone: "+972 53 444 5555",
  }
];

// 4. Seeding Function
async function seedDatabase() {
  console.log("🚀 Starting database seeding...");
  
  const usersRef = db.collection("users");
  const reviewsRef = db.collection("reviews");

  // Create a mapping of caregivers for reviews
  const caregiverIds = caregivers.map(c => c.id);

  for (const caregiver of caregivers) {
    const { id, ...data } = caregiver;
    await usersRef.doc(id).set({
      ...data,
      role: "caregiver",
      onboardingComplete: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Seeded: ${caregiver.name} (${id})`);

    // Seed 2 reviews for each caregiver
    for (let i = 1; i <= 2; i++) {
      await reviewsRef.add({
        caregiverId: id,
        author: ["Amit K.", "Priya S.", "Vikram R.", "Anjali M."][Math.floor(Math.random() * 4)],
        rating: 4 + Math.random(),
        date: "Oct " + (10 + i) + ", 2023",
        text: "Excellent service! Very professional and caring approach. Highly recommended for families in need of support.",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Seed a care log for each caregiver
    await db.collection("careLogs").add({
      caregiverId: id,
      caregiverName: caregiver.name,
      patientName: "Family Member",
      vitals: "BP 120/80, Temp 98.6°F",
      meals: "Ate full breakfast and lunch.",
      activities: "15-minute walk in the evening.",
      notes: "Patient was in good spirits today.",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      submittedAt: "Yesterday, 8:15 PM"
    });
  }

  console.log("✨ Seeding completed successfully!");
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
