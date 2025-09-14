import React from 'react';
import CameraStatus from '../../components/camera/CameraStatus';
import './AnalyticsPage.css';

const Analytics = () => {
  return (
    <div className="analytics-page">
      <CameraStatus />
      <div className="analytics-content">
        <h1>Analytics Page</h1>
        <p>Analytics content will go here.</p>
      </div>
    </div>
  );
};

export default Analytics;
