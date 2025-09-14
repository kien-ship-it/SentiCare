// src/components/analytics/SleepAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { PATIENT_ID } from '../../firebase/appConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SleepAnalytics() {
  const [sleepData, setSleepData] = useState([]);
  const [avgSleepTime, setAvgSleepTime] = useState(0);
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
      let totalSleepSeconds = 0;
      let dayCount = 0;

      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const sleepSeconds = docData.roomMetrics?.['Living Room']?.timeInBedSeconds || 0;
        const sleepHours = sleepSeconds / 3600;
        
        data.push({
          date: docData.summaryDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sleepHours: Math.round(sleepHours * 10) / 10,
          sleepSeconds
        });

        totalSleepSeconds += sleepSeconds;
        dayCount++;
      });

      // Sort by date ascending for chart display
      data.reverse();
      setSleepData(data);
      
      if (dayCount > 0) {
        const avgHours = (totalSleepSeconds / dayCount) / 3600;
        setAvgSleepTime(Math.round(avgHours * 10) / 10);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="analytics-card loading">Loading sleep data...</div>;
  }

  return (
    <div className="analytics-card sleep-analytics-wide">
      <div className="card-header">
        <h3>Sleep Analysis</h3>
      </div>
      
      <div className="sleep-average-display">
        <div className="sleep-average-value">{avgSleepTime}<span className="sleep-average-unit">h</span></div>
        <div className="sleep-average-label">7-Day Average</div>
      </div>
      
      <div className="chart-container" style={{ marginTop: '30px' }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sleepData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value}h`, 'Sleep Time']} />
            <Bar dataKey="sleepHours" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SleepAnalytics;
