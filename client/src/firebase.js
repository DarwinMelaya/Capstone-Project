// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "setup-c7aaa.firebaseapp.com",
  projectId: "setup-c7aaa",
  storageBucket: "setup-c7aaa.appspot.com",
  messagingSenderId: "129126881999",
  appId: "1:129126881999:web:bb816db446d0cd9a7075ba",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
