// src/firebase/appConfig.js

/**
 * This file centralizes the configuration constants for the SentiCare demo application.
 * By storing these IDs here, we can easily change the demo's target patient
 * without modifying component logic.
 */

// This ID represents the specific patient whose data we are monitoring in this demo.
// It must exactly match the Document ID we will create in the `patientStatus` collection.
export const PATIENT_ID = "pXT5aC3gQd9F8hJ2kL5n";

// This ID is a placeholder for a logged-in caregiver. In a full application,
// this would be dynamically retrieved from the Firebase Authentication service after login.
export const DEMO_USER_ID = "demo_caregiver_01";