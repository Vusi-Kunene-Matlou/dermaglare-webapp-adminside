// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHyhsDtZABqCEgmPdVHsA8r4vqTQIBJSs",
  authDomain: "dermaglareapp.firebaseapp.com",
  projectId: "dermaglareapp",
  storageBucket: "dermaglareapp.firebasestorage.app",
  messagingSenderId: "462818904186",
  appId: "1:462818904186:web:2040dcd437664d563bd3c3",
  measurementId: "G-3XLGD4G27R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
export { app, analytics, db, auth };
