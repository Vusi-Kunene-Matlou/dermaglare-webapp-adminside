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
  apiKey: "AIzaSyBWw_FjAs09WYaP-dIeNUE6SNaDOXgY_Tk",
  authDomain: "dermaglare-web-app.firebaseapp.com",
  projectId: "dermaglare-web-app",
  storageBucket: "dermaglare-web-app.firebasestorage.app",
  messagingSenderId: "67529503663",
  appId: "1:67529503663:web:f5080744b553ac9ff0b55a",
  measurementId: "G-QRJFW9XB4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
export { app, analytics, db, auth };
