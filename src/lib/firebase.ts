// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABniGEBLPiNI7pxleHKp7V5CgIJlsiJW4",
  authDomain: "linguavox-c60jj.firebaseapp.com",
  databaseURL: "https://linguavox-c60jj-default-rtdb.firebaseio.com",
  projectId: "linguavox-c60jj",
  storageBucket: "linguavox-c60jj.firebasestorage.app",
  messagingSenderId: "62654468260",
  appId: "1:62654468260:web:c89450054a5205399bd631"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
