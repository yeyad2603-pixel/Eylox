// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7HRlqESrGx9L9a4DFgkxKml8ACBMShoY",
  authDomain: "eylox-c5865.firebaseapp.com",
  projectId: "eylox-c5865",
  storageBucket: "eylox-c5865.firebasestorage.app",
  messagingSenderId: "1001968221079",
  appId: "1:1001968221079:web:acceee47a2e9db91b1a2d2",
  measurementId: "G-T4TZCBL8YQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);