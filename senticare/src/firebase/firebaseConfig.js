// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * This file contains the core configuration for connecting to the Firebase project.
 * It uses the credentials provided by the Firebase Console to initialize the connection.
 * It then exports the Firestore database instance, which will be our primary tool
 * for all database operations throughout the application.
 */

// Your web app's Firebase configuration
// This object is provided by Firebase when you register a new web app.
const firebaseConfig = {
    apiKey: "AIzaSyDZQgcs2vn0JpTsJbYGLvXzpFyKkQlOxJc",
    authDomain: "senticare-wellness-system.firebaseapp.com",
    projectId: "senticare-wellness-system",
    storageBucket: "senticare-wellness-system.firebasestorage.app",
    messagingSenderId: "99869144117",
    appId: "1:99869144117:web:8cd444f72d682157316d7c"
};
    

// Initialize the Firebase app with our configuration.
// This `app` object is the central handle to our Firebase project.
const app = initializeApp(firebaseConfig);

// Get a reference to the Firestore database service and export it.
// Other parts of our application will import `db` to interact with the database.
export const db = getFirestore(app);