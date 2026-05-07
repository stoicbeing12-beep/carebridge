"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface UserData {
  name: string;
  email: string;
  role: "family" | "caregiver";
  onboardingComplete?: boolean;
  photoURL?: string;
  createdAt?: any;
  verified?: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: (role?: "family" | "caregiver") => Promise<void>;
  logOut: () => Promise<void>;
  refreshUserData: (uid?: string) => Promise<any>;
  createInitialProfile: (role: "family" | "caregiver") => Promise<UserData>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
  refreshUserData: async () => {},
  createInitialProfile: async () => ({} as UserData),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error: any) {
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        console.warn("Firestore is offline, using cached data if available.");
        // We could potentially set a flag here or just return null
      }
      console.error("Error fetching user data", error);
      return null;
    }
  };

  const refreshUserData = async (uid?: string) => {
    const targetUid = uid || user?.uid;
    if (targetUid) {
      return await fetchUserData(targetUid);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserData(currentUser.uid);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role: "family" | "caregiver" = "family") => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      
      // Ensure user has a document in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const newData: any = {
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
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logOut = async () => {
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
    if (!user) throw new Error("No authenticated user");
    
    const userRef = doc(db, "users", user.uid);
    const newData: any = {
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
      createInitialProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
