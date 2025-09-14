// src/components/AlertsBanner.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { PATIENT_ID, DEMO_USER_ID } from '../firebase/appConfig';

function AlertsBanner() {
  const [activeAlerts, setActiveAlerts] = useState([]);

  // This effect sets up the listener for active alerts
  useEffect(() => {
    // 1. Define the query. We're filtering the 'alerts' collection.
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('patientId', '==', PATIENT_ID),      // Rule 1: Must be for our patient
      where('acknowledged', '==', false) // Rule 2: Must be unacknowledged
    );

    // 2. Set up the real-time listener on the query
    const unsubscribe = onSnapshot(alertsQuery, (querySnapshot) => {
      const alerts = [];
      // querySnapshot contains all the documents that match our rules.
      querySnapshot.forEach((doc) => {
        // We push the document data, AND its unique ID, into our alerts array.
        alerts.push({ id: doc.id, ...doc.data() });
      });
      // Update the component's state with the list of matching alerts.
      setActiveAlerts(alerts);
    });

    // 3. Cleanup function to stop listening when the component is unmounted.
    return () => {
      console.log("Unsubscribing from alerts listener.");
      unsubscribe();
    };
  }, []); // Empty array ensures this runs only once.

  // 3. This function is called when the user clicks the "Acknowledge" button.
  const handleAcknowledge = async (alertId) => {
    console.log(`Acknowledging alert: ${alertId}`);
    // Create a reference to the specific alert document by its ID
    const alertRef = doc(db, 'alerts', alertId);
    try {
      // Update the document in Firestore
      await updateDoc(alertRef, {
        acknowledged: true,
        acknowledgedBy: DEMO_USER_ID // Use the hardcoded user ID from appConfig
      });
    } catch (error) {
      console.error("Error acknowledging alert: ", error);
    }
  };

  // This function is called for confirming a fall alert (marks it acknowledged as well)
  const handleConfirmFall = async (alertId) => {
    console.log(`Confirming fall alert: ${alertId}`);
    const alertRef = doc(db, 'alerts', alertId);
    try {
      await updateDoc(alertRef, {
        acknowledged: true,
        acknowledgedBy: DEMO_USER_ID
      });
    } catch (error) {
      console.error("Error confirming fall alert: ", error);
    }
  };

  // If there are no active alerts, we render nothing.
  if (activeAlerts.length === 0) {
    return null;
  }

  // If there are alerts, we map over them and display each one.
  return (
    <div className="alerts-banner" style={{ border: '2px solid red', padding: '10px', margin: '20px 0', backgroundColor: '#fff0f0' }}>
      {activeAlerts.map((alert) => (
        <div key={alert.id} className="alert-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>
            <strong>ALERT:</strong> {alert.alertType} detected at{' '}
            {new Date(alert.timestamp.toDate()).toLocaleTimeString()}
          </p>
          {String(alert.alertType || '').toLowerCase().includes('fall') ? (
            <button
              onClick={() => handleConfirmFall(alert.id)}
              style={{ fontSize: '12px', padding: '4px 8px' }}
              aria-label="Confirm fall alert"
              title="Confirm fall alert"
            >
              Acknowledge
            </button>
          ) : (
            <button onClick={() => handleAcknowledge(alert.id)}>
              Acknowledge
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AlertsBanner;