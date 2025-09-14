// src/components/analytics/LatestState.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { PATIENT_ID } from '../../firebase/appConfig';

function LatestState() {
  const [lastActivity, setLastActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get latest activity
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('patientId', '==', PATIENT_ID),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribeActivity = onSnapshot(activitiesQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const latestActivity = querySnapshot.docs[0].data();
        setLastActivity({
          type: latestActivity.type,
          timestamp: latestActivity.timestamp.toDate(),
          location: latestActivity.location
        });
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeActivity();
    };
  }, []);

  const getActivityStatus = () => {
    if (!lastActivity) return { text: 'Unknown', color: '#6b7280', icon: '❓' };
    
    const timeDiff = (new Date() - lastActivity.timestamp) / (1000 * 60); // minutes
    
    if (timeDiff < 5) {
      return { 
        text: `Currently ${lastActivity.type}`, 
        color: '#10b981',
        icon: getActivityIcon(lastActivity.type)
      };
    } else if (timeDiff < 30) {
      return { 
        text: `Last seen ${Math.floor(timeDiff)}m ago`, 
        color: '#f59e0b',
        icon: '⏰'
      };
    } else {
      return { 
        text: 'Inactive for 30+ min', 
        color: '#ef4444',
        icon: '⚠️'
      };
    }
  };

  const getActivityIcon = (activityType) => {
    const icons = {
      'walking': '🚶',
      'sitting': '🪑',
      'standing': '🧍',
      'sleeping': '😴',
      'away': '🚪'
    };
    return icons[activityType] || '🏃';
  };

  if (isLoading) {
    return <div className="analytics-card loading">Loading current activity...</div>;
  }

  const activityStatus = getActivityStatus();

  return (
    <div className="analytics-card">
      <div className="card-header">
        <h3>Current Activity</h3>
        <div className="status-timestamp">
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      <div className="activity-status-content">
        <div className="activity-status-main">
          <div className="activity-icon">{activityStatus.icon}</div>
          <div className="activity-info">
            <div className="activity-text" style={{ color: activityStatus.color }}>
              {activityStatus.text}
            </div>
            {lastActivity?.location && (
              <div className="activity-location">📍 {lastActivity.location}</div>
            )}
            {lastActivity && (
              <div className="activity-timestamp">
                Last update: {lastActivity.timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LatestState;
