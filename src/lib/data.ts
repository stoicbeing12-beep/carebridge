export type Caregiver = {
  id: string;
  name: string;
  photo: string;
  type: string[];
  gender: "Male" | "Female";
  experienceYears: number;
  rating: number;
  reviews: number;
  hourlyRate: number;
  location: string;
  languages: string[];
  bio: string;
  skills: string[];
  certifications: string[];
  verified: boolean;
  availableNow: boolean;
  visaStatus: "Israeli Citizen" | "Work Visa" | "Permanent Resident";
};

export const caregivers: Caregiver[] = [
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
  },
];

export const reviews = [
  {
    id: "r-1",
    author: "Rahul V.",
    rating: 5,
    date: "October 12, 2023",
    text: "Sunita was an absolute blessing for our family. She took wonderful care of my mother after her surgery. Highly recommend!",
  },
  {
    id: "r-2",
    author: "Meera K.",
    rating: 5,
    date: "September 5, 2023",
    text: "CareBridge made it so easy to find a trusted caregiver. Rajesh is patient, kind, and exactly what my father needed.",
  },
];
