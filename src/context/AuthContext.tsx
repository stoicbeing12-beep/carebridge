"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth, db, firebaseInitializationError } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AlertTriangle, ShieldAlert, ArrowRight, BookOpen } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  role: "family" | "caregiver";
  onboardingComplete?: boolean;
  photoURL?: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  verified?: boolean;
  phone?: string;
  location?: string;
  hourlyRate?: number;
  experienceYears?: number;
  languages?: string[];
  bio?: string;
  skills?: string[];
  certifications?: string[];
  visaStatus?: "Israeli Citizen" | "Work Visa" | "Permanent Resident";
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: (role?: "family" | "caregiver") => Promise<void>;
  logOut: () => Promise<void>;
  refreshUserData: (uid?: string) => Promise<UserData | null>;
  createInitialProfile: (role: "family" | "caregiver") => Promise<UserData>;
  isDemoMode: boolean;
  firebaseError: string | null;
  setDemoRole: (role: "family" | "caregiver") => void;
  dismissErrorOverlay: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
  refreshUserData: async () => null,
  createInitialProfile: async () => ({} as UserData),
  isDemoMode: false,
  firebaseError: null,
  setDemoRole: () => {},
  dismissErrorOverlay: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Demo Mode States
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(firebaseInitializationError);
  const [showErrorOverlay, setShowErrorOverlay] = useState(!!firebaseInitializationError);
  const [demoRole, _setDemoRole] = useState<"family" | "caregiver">("family");
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Helper to construct mock user profile objects
  const getMockProfile = (role: "family" | "caregiver"): UserData => {
    if (role === "family") {
      return {
        name: "Jane Doe (Family Demo)",
        email: "jane.doe@example.com",
        role: "family",
        onboardingComplete: true,
        phone: "+972 50 123 4567",
        photoURL: "https://i.pravatar.cc/150?u=jane",
        verified: true,
      };
    } else {
      return {
        name: "Sarah Levi (Caregiver Demo)",
        email: "sarah.levi@example.com",
        role: "caregiver",
        onboardingComplete: true,
        phone: "+972 50 987 6543",
        photoURL: "https://i.pravatar.cc/150?u=sarah",
        location: "Tel Aviv-Yafo",
        hourlyRate: 60,
        experienceYears: 8,
        languages: ["Hebrew", "English", "Russian"],
        bio: "Dedicated caregiver with over 8 years of experience in elder care and post-hospital recovery in central Israel. I believe in treating seniors with warmth and dignity.",
        skills: ["Mobility Assistance", "Medication Management", "Meal Preparation", "Companionship"],
        certifications: ["Certified Nursing Assistant (CNA)", "First Aid & CPR"],
        verified: true,
        visaStatus: "Israeli Citizen",
      };
    }
  };

  // Helper to construct mock user auth object
  const getMockUser = (role: "family" | "caregiver") => {
    return {
      uid: role === "family" ? "demo-family-123" : "demo-caregiver-123",
      displayName: role === "family" ? "Jane Doe (Demo)" : "Sarah Levi (Demo)",
      email: role === "family" ? "jane.doe@example.com" : "sarah.levi@example.com",
      photoURL: role === "family" ? "https://i.pravatar.cc/150?u=jane" : "https://i.pravatar.cc/150?u=sarah",
      emailVerified: true,
    } as unknown as User;
  };

  const setDemoRole = (role: "family" | "caregiver") => {
    _setDemoRole(role);
    if (isDemoMode) {
      setUser(getMockUser(role));
      setUserData(getMockProfile(role));
    }
  };

  const dismissErrorOverlay = () => {
    setIsDemoMode(true);
    setShowErrorOverlay(false);
    setUser(getMockUser(demoRole));
    setUserData(getMockProfile(demoRole));
    setLoading(false);
  };

  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserData;
        setUserData(data);
        return data;
      }
      return null;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'unavailable' || err.message?.includes('offline')) {
        console.warn("Firestore is offline, using cached data if available.");
      }
      console.error("Error fetching user data", error);
      return null;
    }
  };

  const refreshUserData = async (uid?: string) => {
    if (isDemoMode) {
      return getMockProfile(demoRole);
    }
    const targetUid = uid || user?.uid;
    if (targetUid) {
      return await fetchUserData(targetUid);
    }
    return null;
  };

  useEffect(() => {
    if (isDemoMode) return;

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            await fetchUserData(currentUser.uid);
          } else {
            setUserData(null);
          }
          setLoading(false);
        },
        (error: Error) => {
          console.error("Auth state observer error:", error);
          setFirebaseError(error.message || "Firebase Auth state change error");
          setShowErrorOverlay(true);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Auth state subscription exception:", err);
      // Defer state updates to avoid synchronous setState inside useEffect body
      setTimeout(() => {
        setFirebaseError(errorMsg || "Failed to initialize auth observer");
        setShowErrorOverlay(true);
        setLoading(false);
      }, 0);
    }
  }, [isDemoMode]);

  const signInWithGoogle = async (role: "family" | "caregiver" = "family") => {
    if (isDemoMode) {
      setLoading(true);
      setTimeout(() => {
        _setDemoRole(role);
        setUser(getMockUser(role));
        setUserData(getMockProfile(role));
        setLoading(false);
      }, 500);
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const newData: Partial<UserData> = {
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          role: role,
          onboardingComplete: role === "family", 
        };
        if (currentUser.photoURL) newData.photoURL = currentUser.photoURL;
        
        await setDoc(userRef, { ...newData, createdAt: new Date() });
        setUserData(newData as UserData);
      } else {
        setUserData(userSnap.data() as UserData);
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("Error signing in with Google", error);
      if (err.code === "auth/api-key-not-valid" || err.message?.includes("API key")) {
        setFirebaseError(err.message || "Firebase API Key is invalid.");
        setShowErrorOverlay(true);
      }
      throw error;
    }
  };

  const logOut = async () => {
    if (isDemoMode) {
      setUserData(null);
      setUser(null);
      return;
    }

    try {
      setUserData(null);
      setUser(null);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  const createInitialProfile = async (role: "family" | "caregiver") => {
    if (isDemoMode) {
      const p = getMockProfile(role);
      setUserData(p);
      return p;
    }

    if (!user) throw new Error("No authenticated user");
    
    const userRef = doc(db, "users", user.uid);
    const newData: Partial<UserData> = {
      name: user.displayName || "User",
      email: user.email || "",
      role: role,
      onboardingComplete: false,
    };
    if (user.photoURL) newData.photoURL = user.photoURL;
    
    await setDoc(userRef, { ...newData, createdAt: new Date() });
    setUserData(newData as UserData);
    return newData as UserData;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      signInWithGoogle, 
      logOut, 
      refreshUserData,
      createInitialProfile,
      isDemoMode,
      firebaseError,
      setDemoRole,
      dismissErrorOverlay
    }}>
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[30%] w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[80px]" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 text-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full text-center relative overflow-hidden ring-1 ring-amber-500/20">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-amber-500/10">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight mb-3">Firebase Setup Required</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We detected an issue with the Firebase configuration keys in your environment (e.g. invalid or unactivated API key). You can fix this or proceed in a high-fidelity **Mock/Demo Mode**.
            </p>

            {firebaseError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-left text-xs font-mono text-red-300 mb-6 max-h-24 overflow-y-auto break-all">
                <span className="font-semibold block text-red-400 mb-1">Diagnostic Log:</span>
                {firebaseError}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-center gap-4 text-xs font-medium text-slate-400">
                <span>Select Demo Persona:</span>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input 
                    type="radio" 
                    name="demoRole" 
                    checked={demoRole === "family"}
                    onChange={() => _setDemoRole("family")}
                    className="accent-amber-500"
                  />
                  Family
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input 
                    type="radio" 
                    name="demoRole" 
                    checked={demoRole === "caregiver"}
                    onChange={() => _setDemoRole("caregiver")}
                    className="accent-amber-500"
                  />
                  Caregiver
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={dismissErrorOverlay}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 border-t border-amber-300/20 cursor-pointer"
              >
                Proceed in Demo Mode
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                {showSetupGuide ? "Hide Setup Info" : "Setup Instructions"}
              </button>
            </div>

            {showSetupGuide && (
              <div className="mt-6 pt-6 border-t border-slate-800 text-left text-xs text-slate-400 space-y-3 max-h-48 overflow-y-auto animate-in slide-in-from-top-4 duration-300">
                <p className="font-semibold text-slate-200">How to fix your environment keys:</p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Create a file named <code className="text-amber-400">.env.local</code> in the root directory.</li>
                  <li>Copy your credentials exactly from the Firebase Console (Gear Icon &gt; Project Settings &gt; General &gt; Your Apps).</li>
                  <li>Set the following keys exactly:
                    <pre className="mt-1 bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] overflow-x-auto text-slate-300">
{`NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=care-bridge-375c8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=care-bridge-375c8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=care-bridge-375c8.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=820762084961
NEXT_PUBLIC_FIREBASE_APP_ID=1:820762084961:web:3c6c201ccbe683466fcc20`}
                    </pre>
                  </li>
                  <li>Restart the server. For Vercel deployments, add these key-value pairs in the **Environment Variables** panel in Vercel settings and redeploy.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Banner indicating Demo Mode */}
      {isDemoMode && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-center gap-2 border-b border-amber-600 z-[999]">
          <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
          <span>CareBridge is running in Demo Mode using offline mock data because no Firebase connection was established.</span>
          <button 
            onClick={() => setShowErrorOverlay(true)} 
            className="underline ml-2 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Show setup guide
          </button>
        </div>
      )}

      {children}
    </AuthContext.Provider>
  );
};
