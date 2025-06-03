// Import the functions you need from the SDKs you need
import { initializeApp ,getApps , getApp} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1O-neRwifaYWBIAhv3neIxo3Km3YzNSo",
  authDomain: "ai-interview-6136c.firebaseapp.com",
  projectId: "ai-interview-6136c",
  storageBucket: "ai-interview-6136c.firebasestorage.app",
  messagingSenderId: "598969324622",
  appId: "1:598969324622:web:d5f81fb242fcffa4f7df1f",
  measurementId: "G-GQM5L12KY9"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
