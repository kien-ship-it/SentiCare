import React from 'react';
import PatientHeader from '../../components/analytics/PatientHeader';
import SleepAnalytics from '../../components/analytics/SleepAnalytics';
import ActivityBreakdown from '../../components/analytics/ActivityBreakdown';
import FallWarnings from '../../components/analytics/FallWarnings';
import WellnessScore from '../../components/analytics/WellnessScore';
import LatestState from '../../components/analytics/LatestState';
import '../../components/analytics/Analytics.css';
import './AnalyticsPage.css';

const Analytics = () => {
  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <PatientHeader patientName="John D." />
        
        <div className="analytics-grid">
          <LatestState />
          <WellnessScore />
          <FallWarnings />
          <ActivityBreakdown />
          <SleepAnalytics />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
