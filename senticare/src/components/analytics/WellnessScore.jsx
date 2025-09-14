// src/components/analytics/WellnessScore.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { PATIENT_ID } from '../../firebase/appConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WellnessIndicator from './WellnessIndicator';

function WellnessScore() {
  const [wellnessData, setWellnessData] = useState([]);
  const [currentScore, setCurrentScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const summariesQuery = query(
      collection(db, 'dailySummaries'),
      where('patientId', '==', PATIENT_ID),
      orderBy('summaryDate', 'desc'),
      limit(7) // Last 7 days
    );

    const unsubscribe = onSnapshot(summariesQuery, (querySnapshot) => {
      const data = [];
      let latestScore = null;

      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const score = docData.wellnessScore;
        
        if (score !== null && score !== undefined) {
          data.push({
            date: docData.summaryDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: score,
            fullDate: docData.summaryDate.toDate()
          });
          
          if (!latestScore || docData.summaryDate.toDate() > latestScore.date) {
            latestScore = { score, date: docData.summaryDate.toDate() };
          }
        }
      });

      // Sort by date ascending for chart display
      data.sort((a, b) => a.fullDate - b.fullDate);
      setWellnessData(data);
      setCurrentScore(latestScore?.score || 93); // Hardcoded for testing
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#4f46e5'; // Indigo
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  if (isLoading) {
    return <div className="analytics-card loading">Loading wellness data...</div>;
  }

  return (
    <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header" style={{ flexShrink: 0 }}>
        <h3>Wellness Score</h3>
      </div>
      
      {currentScore !== null ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '24px',
          flex: 1,
          padding: '20px 0' 
        }}>
          {/* Circular Wellness Indicator */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '10px',
            width: '100%',
            maxWidth: '240px',
            margin: '0 auto'
          }}>
            <WellnessIndicator score={currentScore} size={160} strokeWidth={14} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: getScoreColor(currentScore) }}>
                {getScoreLabel(currentScore)}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                Current wellness level
              </div>
            </div>
          </div>
          
          {/* Chart Section */}
          {wellnessData.length > 1 && (
            <div className="chart-container" style={{ width: '100%', marginTop: 'auto' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', textAlign: 'center' }}>
                7-Day Trend
              </h4>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={wellnessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis domain={[0, 100]} fontSize={10} />
                  <Tooltip formatter={(value) => [`${value}/100`, 'Wellness Score']} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={getScoreColor(currentScore)} 
                    strokeWidth={2}
                    dot={{ fill: getScoreColor(currentScore), strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📊</div>
          <p style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            No wellness scores available yet
          </p>
          <small style={{ color: '#6b7280' }}>
            Scores are generated through AI analysis of daily activities
          </small>
        </div>
      )}
    </div>
  );
}

export default WellnessScore;
