import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';
import LogoContainer from '../components/layout/LogoContainer';
import ProfileHeader from '../components/layout/ProfileHeader';
import QuickAnalytics from '../components/analytics/QuickAnalytics';

const Dashboard = () => {
  const location = useLocation();
  
  // Determine sidebar color based on current route
  const getSidebarClass = () => {
    if (location.pathname.includes('/analytics')) {
      return 'sidebar-glass sidebar-analytics';
    } else if (location.pathname.includes('/intelligence')) {
      return 'sidebar-glass sidebar-intelligence';
    }
    return 'sidebar-glass sidebar-home';
  };

  return (
    <div className="dashboard-layout">
      <main className="content-area">
        <Outlet />
      </main>
      <aside className={getSidebarClass()}>
        <div className="sidebar-content">
          <LogoContainer />
          <div className="sidebar-bottom">
            <ProfileHeader />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;
