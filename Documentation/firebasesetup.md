Of course. Here is a detailed, step-by-step development plan in a markdown file format, focused on the core Firebase functionalities for the SentiCare application. This plan is tailored for the simplified (no-auth, hardcoded ID) version.

---

# SentiCare SWE Development Plan: Core Firebase Functionality

**Objective:** This document provides a detailed, step-by-step guide for the Software Engineer to implement the core data interactions with Google Firestore for the SentiCare dashboard. It covers project setup, fetching real-time data for display, and sending data back to the database based on user interaction.

**Guiding Principles:**
-   **No Authentication:** User/patient IDs are hardcoded for simplicity.
-   **Real-time First:** All data display will use real-time listeners (`onSnapshot`) for a live-dashboard experience.
-   **Clear Separation:** Frontend components are responsible for presentation and user-triggered writes. Cloud Functions handle reactive logic and data aggregation.

---

## ✅ Prerequisites: Initial Setup

Before writing any application code, ensure the following are complete:

1.  **Firebase Project:**
    -   A Firebase project is created.
    -   Firestore and Cloud Functions are enabled.
2.  **Local Environment:**
    -   A React project is initialized (e.g., `npm create vite@latest senticare-dashboard -- --template react`).
    -   Firebase SDK is installed in the React project: `npm install firebase`.
    -   Firebase CLI is installed globally (`npm install -g firebase-tools`) and you are logged in (`firebase login`).
    -   Firebase is initialized in your project root: `firebase init` (select Firestore and Functions).
3.  **Manual Firestore Seeding:**
    -   In the Firebase Console, manually create the following to have data to test against:
        -   **Collection:** `patientStatus`
        -   **Document ID:** `pXT5aC3gQd9F8hJ2kL5n` (This *must* match your hardcoded Patient ID).
        -   **Fields:**
            -   `currentState`: (String) `SITTING`
            -   `stateStartTime`: (Timestamp) A recent time
            -   `lastSeen`: (Timestamp) The current time
            -   `confidenceScore`: (Number) `0.92`
        -   **Collection:** `alerts`
        -   **Document (Auto-ID):**
        -   **Fields:**
            -   `patientId`: (String) `pXT5aC3gQd9F8hJ2kL5n`
            -   `alertType`: (String) `FALL_DETECTED`
            -   `acknowledged`: (Boolean) `false`
            -   `timestamp`: (Timestamp) The current time
            -   `confidenceScore`: (Number) `0.98`

---

## 📋 Task 1: Firebase Configuration in React

**Goal:** Configure the React application to connect to your Firebase project using hardcoded IDs.

1.  **Create a `firebaseConfig.js` file:** This file will initialize your connection to Firebase.
    ```javascript
    // src/firebaseConfig.js
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";

    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "...",
      appId: "..."
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Get a Firestore instance
    export const db = getFirestore(app);
    ```

2.  **Create an `appConfig.js` file:** This file will store your hardcoded demo IDs.
    ```javascript
    // src/appConfig.js
    export const PATIENT_ID = "pXT5aC3gQd9F8hJ2kL5n";
    export const DEMO_USER_ID = "demo_caregiver_01";
    ```
    *Note: The AI Engineer must also use this exact `PATIENT_ID` in their client configuration.*

---

## 📋 Task 2: Fetching & Displaying Live Data (`onSnapshot`)

**Goal:** Implement the "Live Status" card on the dashboard, which updates in real-time as data changes in Firestore.

1.  **Component:** `LiveStatusCard.jsx`
2.  **Logic:** Use the `useEffect` hook to set up a real-time listener when the component mounts. This listener will update the component's state whenever the source document in Firestore changes.

**Implementation (`src/components/LiveStatusCard.jsx`):**

```jsx
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { PATIENT_ID } from '../appConfig';

function LiveStatusCard() {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Create a reference to the specific document
    const patientStatusRef = doc(db, 'patientStatus', PATIENT_ID);

    // 2. Set up the real-time listener. onSnapshot returns an unsubscribe function.
    const unsubscribe = onSnapshot(patientStatusRef, (docSnap) => {
      if (docSnap.exists()) {
        // 3. If the document exists, update our state
        setStatusData(docSnap.data());
      } else {
        // Handle the case where the document doesn't exist
        console.error("Patient status document not found!");
        setStatusData(null);
      }
      setIsLoading(false);
    });

    // 4. Return the unsubscribe function to be called when the component unmounts.
    // This prevents memory leaks.
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  if (isLoading) {
    return <div>Loading Live Status...</div>;
  }

  if (!statusData) {
    return <div>Error: Could not load patient status.</div>;
  }

  return (
    <div className="status-card">
      <h2>Live Status</h2>
      <p>Current State: <strong>{statusData.currentState}</strong></p>
      <p>Confidence: {Math.round(statusData.confidenceScore * 100)}%</p>
      <p>Last Seen: {new Date(statusData.lastSeen.toDate()).toLocaleTimeString()}</p>
    </div>
  );
}

export default LiveStatusCard;
```

### **Verification:**
-   Run the React app and view the dashboard. The `LiveStatusCard` should display the data you manually entered in Firestore.
-   Go to the Firestore console and manually change the `currentState` field for your patient's status document. **The UI in your browser should update instantly without a page refresh.**

---

## 📋 Task 3: Sending Data to Firestore (`updateDoc`)

**Goal:** Implement the "Acknowledge" button for alerts. When clicked, it will update the corresponding alert document in Firestore.

1.  **Component:** `AlertsBanner.jsx`
2.  **Logic:** First, fetch all unacknowledged alerts for the patient using `onSnapshot` with a query. Then, create a handler function that uses `updateDoc` to change the `acknowledged` field of a specific alert.

**Implementation (`src/components/AlertsBanner.jsx`):**
```jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { PATIENT_ID, DEMO_USER_ID } from '../appConfig';

function AlertsBanner() {
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    // 1. Define the query to get active alerts for our patient
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('patientId', '==', PATIENT_ID),
      where('acknowledged', '==', false)
    );

    // 2. Set up the listener
    const unsubscribe = onSnapshot(alertsQuery, (querySnapshot) => {
      const alerts = [];
      querySnapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() });
      });
      setActiveAlerts(alerts);
    });

    return () => unsubscribe();
  }, []);

  // 3. Handler function to update the document in Firestore
  const handleAcknowledge = async (alertId) => {
    console.log(`Acknowledging alert: ${alertId}`);
    const alertRef = doc(db, 'alerts', alertId);
    try {
      await updateDoc(alertRef, {
        acknowledged: true,
        acknowledgedBy: DEMO_USER_ID // Use the hardcoded user ID
      });
    } catch (error) {
      console.error("Error acknowledging alert: ", error);
    }
  };

  if (activeAlerts.length === 0) {
    return null; // Don't render anything if there are no active alerts
  }

  return (
    <div className="alerts-banner">
      {activeAlerts.map((alert) => (
        <div key={alert.id} className="alert-item">
          <p>
            <strong>ALERT:</strong> {alert.alertType} detected at{' '}
            {new Date(alert.timestamp.toDate()).toLocaleTimeString()}
          </p>
          <button onClick={() => handleAcknowledge(alert.id)}>
            Acknowledge
          </button>
        </div>
      ))}
    </div>
  );
}

export default AlertsBanner;
```

### **Verification:**
-   The dashboard should show the unacknowledged alert you created manually.
-   Click the "Acknowledge" button. **The alert should immediately disappear from the banner.**
-   In the Firestore console, verify that the alert document's `acknowledged` field is now `true` and `acknowledgedBy` is set to `demo_caregiver_01`.

---

This plan covers the fundamental "read" and "write" operations that form the backbone of the SentiCare dashboard's interactivity with Firestore.