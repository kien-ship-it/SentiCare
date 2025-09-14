import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
