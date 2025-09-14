// src/components/analytics/ActivityBreakdown.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { PATIENT_ID } from '../../firebase/appConfig';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  'Sleep': '#4f46e5',
  'Sitting': '#06b6d4',
  'Walking': '#10b981',
  'Standing': '#f59e0b',
  'Away': '#ef4444'
};

function ActivityBreakdown() {
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const summariesQuery = query(
      collection(db, 'dailySummaries'),
      where('patientId', '==', PATIENT_ID),
      orderBy('summaryDate', 'desc'),
      limit(1) // Most recent day
    );

    const unsubscribe = onSnapshot(summariesQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const docData = doc.data();
        const roomMetrics = docData.roomMetrics?.['Living Room'] || {};

        const data = [
          {
            name: 'Sleep',
            value: Math.round((roomMetrics.timeInBedSeconds || 0) / 3600 * 10) / 10,
            seconds: roomMetrics.timeInBedSeconds || 0
          },
          {
            name: 'Sitting',
            value: Math.round((roomMetrics.sittingTimeSeconds || 0) / 3600 * 10) / 10,
            seconds: roomMetrics.sittingTimeSeconds || 0
          },
          {
            name: 'Walking',
            value: Math.round((roomMetrics.walkingTimeSeconds || 0) / 3600 * 10) / 10,
            seconds: roomMetrics.walkingTimeSeconds || 0
          },
          {
            name: 'Standing',
            value: Math.round((roomMetrics.standingTimeSeconds || 0) / 3600 * 10) / 10,
            seconds: roomMetrics.standingTimeSeconds || 0
          },
          {
            name: 'Away',
            value: Math.round((roomMetrics.notPresentTimeSeconds || 0) / 3600 * 10) / 10,
            seconds: roomMetrics.notPresentTimeSeconds || 0
          }
        ].filter(item => item.value > 0);

        setActivityData(data);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p>{`${data.name}: ${data.value}h`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <div className="analytics-card loading">Loading activity data...</div>;
  }

  return (
    <div className="analytics-card activity-breakdown-wide">
      <div className="card-header">
        <h3>Today's Activity Breakdown</h3>
      </div>
      
      <div className="chart-container" style={{ marginTop: '0', paddingTop: '0' }}>
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={activityData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {activityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="activity-summary">
        {activityData.map((item) => (
          <div key={item.name} className="activity-item">
            <div 
              className="activity-color" 
              style={{ backgroundColor: COLORS[item.name] }}
            ></div>
            <span className="activity-name">{item.name}</span>
            <span className="activity-value">{item.value}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityBreakdown;
