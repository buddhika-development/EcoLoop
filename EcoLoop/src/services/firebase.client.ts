// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB1e7VrwFJbm0rERFL5Ketsfs8cYE1tlXo",
    authDomain: "ecoloop-da082.firebaseapp.com",
    projectId: "ecoloop-da082",
    storageBucket: "ecoloop-da082.firebasestorage.app",
    messagingSenderId: "478671371979",
    appId: "1:478671371979:web:c9973171a9bc4a2d4e254e",
    measurementId: "G-WY2S5L1MZR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);