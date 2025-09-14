import React from 'react';
import './QuickAnalytics.css';

const QuickAnalytics = () => {
  return (
    <div className="quick-analytics">
      <h3 className="analytics-title">Quick Analytics</h3>
      <div className="analytics-item">
        <span className="analytics-label">Alerts:</span>
        <span className="analytics-value">2</span>
      </div>
      <div className="analytics-item">
        <span className="analytics-label">Occupancy:</span>
        <span className="analytics-value">87%</span>
      </div>
    </div>
  );
};

export default QuickAnalytics;
