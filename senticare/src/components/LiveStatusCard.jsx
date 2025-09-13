// src/components/LiveStatusCard.jsx
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { PATIENT_ID } from '../firebase/appConfig';

function LiveStatusCard() {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once when the component is first rendered.
  useEffect(() => {
    // 1. Create a reference to the specific document we want to listen to.
    // It's like telling Firestore the exact location of the announcement on the board.
    const patientStatusRef = doc(db, 'patientStatus', PATIENT_ID);

    // 2. Set up the real-time listener. 
    // This function returns an 'unsubscribe' function which we'll use for cleanup.
    const unsubscribe = onSnapshot(patientStatusRef, (docSnap) => {
      // This part runs every time the data in Firestore changes.
      if (docSnap.exists()) {
        // 3. If the document exists, we take its data and update our component's state.
        setStatusData(docSnap.data());
      } else {
        // Handle the case where the document might be deleted or doesn't exist.
        console.error("Patient status document not found!");
        setStatusData(null);
      }
      setIsLoading(false); // We're done loading, whether we found data or not.
    });

    // 4. This is the cleanup function. 
    // React runs this when the component is removed from the screen to prevent memory leaks.
    return () => {
      console.log("Unsubscribing from patient status listener.");
      unsubscribe();
    };
  }, []); // The empty array [] tells React to run this effect only once on mount.

  if (isLoading) {
    return <div>Loading Live Status...</div>;
  }

  if (!statusData) {
    return <div>Error: Could not load patient status. The document may not exist.</div>;
  }

  return (
    <div className="status-card" style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
      <h2>Live Status</h2>
      <p>Current State: <strong>{statusData.currentState}</strong></p>
      {/* We check if confidenceScore exists before trying to display it */}
      {statusData.confidenceScore && (
          <p>Confidence: {Math.round(statusData.confidenceScore * 100)}%</p>
      )}
      {/* We check if lastSeen exists before trying to display it */}
      {statusData.lastSeen && (
          <p>Last Seen: {new Date(statusData.lastSeen.toDate()).toLocaleTimeString()}</p>
      )}
    </div>
  );
}

export default LiveStatusCard;