import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDjWE0I7nMLaUXyA1EiYmom3z1Z0tU05Ig",
  authDomain: "novaesppanel.firebaseapp.com",
  projectId: "novaesppanel",
  storageBucket: "novaesppanel.firebasestorage.app",
  messagingSenderId: "981294173021",
  appId: "1:981294173021:web:4c1860131300dd33de76b4"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
