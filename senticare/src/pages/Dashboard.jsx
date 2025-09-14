import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';
import LogoContainer from '../components/layout/LogoContainer';
import ProfileHeader from '../components/layout/ProfileHeader';
import QuickAnalytics from '../components/analytics/QuickAnalytics';

const Dashboard = () => {
  const location = useLocation();
  const [bgColor, setBgColor] = useState('rgba(100, 149, 237, 0.1)');
  const [gridColor, setGridColor] = useState('rgba(100, 149, 237, 0.25)');

  useEffect(() => {
    if (location.pathname === '/analytics') {
      setBgColor('rgba(255, 152, 0, 0.1)');
      setGridColor('rgba(255, 193, 7, 0.25)');
    } else {
      setBgColor('rgba(100, 149, 237, 0.1)');
      setGridColor('rgba(100, 149, 237, 0.25)');
    }
  }, [location]);

  return (
    <div className="dashboard-layout">
      <motion.div 
        className="color-transition"
        initial={false}
        animate={{
          '--bg-color': bgColor,
          '--grid-color': gridColor
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, var(--grid-color) 2px, transparent 0),
            radial-gradient(circle at 1px 1px, var(--grid-color) 2px, transparent 0)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, var(--bg-color) 0%, transparent 70%)',
        }} />
      </motion.div>
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
      <div className="top-right-widgets">
        <QuickAnalytics />
      </div>
    </div>
  );
};

export default Dashboard;
