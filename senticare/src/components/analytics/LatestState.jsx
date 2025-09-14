// src/components/analytics/LatestState.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { PATIENT_ID } from '../../firebase/appConfig';

function LatestState() {
  const [currentState, setCurrentState] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current state from patientStatus collection
    const patientStatusRef = doc(db, 'patientStatus', 'pXT5aC3gQd9F8hJ2kL5n');

    const unsubscribeStatus = onSnapshot(patientStatusRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('PatientStatus data:', data); // Debug log
        if (data.currentState) {
          console.log('CurrentState:', data.currentState); // Debug log
          setCurrentState({
            type: data.currentState.activity || data.currentState.state || data.currentState.eventType || data.currentState,
            timestamp: data.currentState.timestamp?.toDate() || new Date(),
            location: data.currentState.location || data.currentState.roomId || data.currentState.room
          });
        }
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeStatus();
    };
  }, []);

  // Set up listener for today's daily summary
  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const dailySummaryId = `${PATIENT_ID}_${today}`;
    
    // Create reference to today's daily summary document
    const dailySummaryRef = doc(db, 'dailySummaries', dailySummaryId);
    
    // Set up real-time listener for daily summary
    const unsubscribe = onSnapshot(dailySummaryRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailySummary(docSnap.data());
      } else {
        // Document doesn't exist yet (no data for today)
        setDailySummary(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getActivityStatus = () => {
    if (!currentState) return { text: 'Unknown', color: '#6b7280', icon: '❓' };
    
    const timeDiff = (new Date() - currentState.timestamp) / (1000 * 60); // minutes
    
    if (timeDiff < 5) {
      return { 
        text: `Currently ${currentState.type}`, 
        color: '#10b981',
        icon: getActivityIcon(currentState.type)
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
      'WALKING': '🚶',
      'SITTING': '🪑',
      'STANDING': '🧍',
      'IN_BED': '😴',
      'NOT_PRESENT': '🚪'
    };
    return icons[activityType] || '🏃';
  };

  // Helper function to format time from seconds to hours and minutes
  const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to get room metrics (assuming single room for now)
  const getRoomMetrics = () => {
    if (!dailySummary?.roomMetrics) return null;
    // Get the first room's metrics (or you could specify a specific roomId)
    const roomIds = Object.keys(dailySummary.roomMetrics);
    if (roomIds.length === 0) return null;
    return dailySummary.roomMetrics[roomIds[0]];
  };

  if (isLoading) {
    return <div className="analytics-card loading">Loading current activity...</div>;
  }

  const activityStatus = getActivityStatus();
  const roomMetrics = getRoomMetrics();

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
            {currentState?.location && (
              <div className="activity-location">📍 {currentState.location}</div>
            )}
            {currentState && (
              <div className="activity-timestamp">
                Last update: {currentState.timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Horizontal line separator */}
        <hr style={{ 
          margin: '13px 0', 
          border: 'none', 
          borderTop: '1px solid #e5e7eb' 
        }} />
        
        {/* Daily Summary Section */}
          <h4 style={{ marginTop: '-10px', marginBottom: '4px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Today's Summary
          </h4>
          
          {dailySummary && roomMetrics ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Sleep:</span>
                <span style={{ fontWeight: '500' }}>{formatTime(roomMetrics.timeInBedSeconds)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Sitting:</span>
                <span style={{ fontWeight: '500' }}>{formatTime(roomMetrics.sittingTimeSeconds)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Standing:</span>
                <span style={{ fontWeight: '500' }}>{formatTime(roomMetrics.standingTimeSeconds)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Walking:</span>
                <span style={{ fontWeight: '500' }}>{formatTime(roomMetrics.walkingTimeSeconds)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Away:</span>
                <span style={{ fontWeight: '500' }}>{formatTime(roomMetrics.notPresentTimeSeconds)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Idle:</span>
                <span style={{ fontWeight: '500' }}>{formatTime(roomMetrics.idleTimeSeconds)}</span>
              </div>
              
              {/* Alert counts */}
              <div style={{ gridColumn: '1 / -1', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#6b7280' }}>Falls: <strong>{roomMetrics.fallCount || 0}</strong></span>
                  <span style={{ color: '#6b7280' }}>Help Signals: <strong>{roomMetrics.helpSignalCount || 0}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
              No summary data available for today yet.
            </p>
          )}
        </div>
      </div>
  );
}

export default LatestState;
