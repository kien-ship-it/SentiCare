import React from 'react';
import LogoContainer from '../../components/layout/LogoContainer';
import ProfileHeader from '../../components/layout/ProfileHeader';
import CameraStatus from '../../components/camera/CameraStatus';
import QuickAnalytics from '../../components/analytics/QuickAnalytics';

const Analytics = () => {
  return (
    <div style={{ height: '100vh', width: '100vw', background: 'var(--bg-app)' }}>
      <LogoContainer />
      <CameraStatus />
      <ProfileHeader />
      <QuickAnalytics />
      <div style={{ padding: '120px 24px 24px 24px' }}>
        <h1>Analytics Page</h1>
        <p>Analytics content will go here.</p>
      </div>
    </div>
  );
};

export default Analytics;
