// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ozalwar-estate.firebaseapp.com",
  projectId: "ozalwar-estate",
  storageBucket: "ozalwar-estate.appspot.com",
  messagingSenderId: "444593210332",
  appId: "1:444593210332:web:1ad1a0be40682973de4519"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);