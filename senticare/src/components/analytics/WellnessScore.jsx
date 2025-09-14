// src/components/analytics/WellnessScore.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { PATIENT_ID } from '../../firebase/appConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      setCurrentScore(latestScore?.score || null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
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
    <div className="analytics-card">
      <div className="card-header">
        <h3>Wellness Score</h3>
        {currentScore !== null && (
          <div className="current-score">
            <span 
              className="score-value" 
              style={{ color: getScoreColor(currentScore) }}
            >
              {currentScore}/100
            </span>
            <span className="score-label">{getScoreLabel(currentScore)}</span>
          </div>
        )}
      </div>
      
      {wellnessData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wellnessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}/100`, 'Wellness Score']} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="no-data">
          <p>No wellness scores available yet</p>
          <small>Scores are generated through AI analysis</small>
        </div>
      )}
    </div>
  );
}

export default WellnessScore;
