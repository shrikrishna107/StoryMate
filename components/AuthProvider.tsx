// components/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseApp, getApps, getApp, initializeApp } from 'firebase/app';
import { Auth, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase'; // Your config import

// Define the shape of our Firebase services and auth state
interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User | null;
  loading: boolean;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextValue | null>(null);

let services: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

// Singleton Firebase initialization
const initializeServices = () => {
  if (services) return services;
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  services = { app, auth, db };
  return services;
};

// The provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { app, auth, db } = initializeServices();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <FirebaseContext.Provider value={{ app, auth, db, user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// The hook to consume the context
export const useAuthContext = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
