// src/components/analytics/FallWarnings.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { PATIENT_ID } from '../../firebase/appConfig';

function FallWarnings() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('patientId', '==', PATIENT_ID),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(alertsQuery, (querySnapshot) => {
      const alertsData = [];
      querySnapshot.forEach((doc) => {
        alertsData.push({ id: doc.id, ...doc.data() });
      });
      setAlerts(alertsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp) => {
    return timestamp.toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlertTypeDisplay = (alertType) => {
    switch (alertType) {
      case 'FALL_DETECTED':
        return { text: 'Fall Detected', icon: '⚠️', severity: 'high' };
      case 'HELP_SIGNAL_DETECTED':
        return { text: 'Help Signal', icon: '🆘', severity: 'medium' };
      default:
        return { text: alertType, icon: '⚠️', severity: 'low' };
    }
  };

  if (isLoading) {
    return <div className="analytics-card loading">Loading alerts...</div>;
  }

  return (
    <div className="analytics-card alert-history-wide">
      <div className="card-header">
        <h3>Alert History</h3>
        <span className="alert-count">{alerts.length} total alerts</span>
      </div>
      
      <div className="alerts-log">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <span className="no-alerts-icon">✅</span>
            <p>No alerts recorded</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const alertDisplay = getAlertTypeDisplay(alert.alertType);
            return (
              <div 
                key={alert.id} 
                className={`alert-log-item ${alertDisplay.severity} ${alert.acknowledged ? 'acknowledged' : 'unacknowledged'}`}
              >
                <div className="alert-icon">{alertDisplay.icon}</div>
                <div className="alert-details">
                  <div className="alert-type">{alertDisplay.text}</div>
                  <div className="alert-time">{formatTimestamp(alert.timestamp)}</div>
                  <div className="alert-location">Room: {alert.roomId}</div>
                  {alert.confidenceScore && (
                    <div className="alert-confidence">
                      Confidence: {Math.round(alert.confidenceScore * 100)}%
                    </div>
                  )}
                </div>
                <div className="alert-status">
                  {alert.acknowledged ? (
                    <span className="status-acknowledged">✓ Acknowledged</span>
                  ) : (
                    <span className="status-pending">⏳ Pending</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default FallWarnings;
