import React from 'react';
import './QuickAnalytics.css';

const QuickAnalytics = () => {
  return (
    <div className="quick-analytics">
      <div className="analytics-item live-status">
        <span className="live-dot"></span>
        <span className="analytics-label">Live</span>
      </div>
      <div className="divider"></div>
      <div className="analytics-item">
        <span className="analytics-icon">🚨</span>
        <span className="analytics-value">2</span>
      </div>
      <div className="divider"></div>
      <div className="analytics-item">
        <span className="analytics-icon">👥</span>
        <span className="analytics-value">87%</span>
      </div>
      <div className="divider"></div>
      <div className="analytics-item">
        <span className="analytics-icon">🔔</span>
      </div>
    </div>
  );
};

export default QuickAnalytics;
