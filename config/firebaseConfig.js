// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChnbWVmnTjqzO1OqI-c6-BXmmya0It0LY",
  authDomain: "ethel-trust-test.firebaseapp.com",
  projectId: "ethel-trust-test",
  storageBucket: "ethel-trust-test.appspot.com",
  messagingSenderId: "647243647895",
  appId: "1:647243647895:web:fc67ee8b5ee058965cd2d2",
  measurementId: "G-T1Z4C7SL2E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);