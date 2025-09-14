import React from 'react';
import { Outlet } from 'react-router-dom';
import './Dashboard.css';
import LogoContainer from '../components/layout/LogoContainer';
import ProfileHeader from '../components/layout/ProfileHeader';
import QuickAnalytics from '../components/analytics/QuickAnalytics';

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <main className="content-area">
        <Outlet />
      </main>
      <aside className="sidebar-glass">
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
