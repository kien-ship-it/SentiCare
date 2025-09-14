import React from 'react';
import { NavLink } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import CameraStatus from '../camera/CameraStatus';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1 className="logo">SentiCare</h1>
      </div>
      <div className="header-center">
        <CameraStatus />
      </div>
      <div className="header-right">
        <nav className="nav-menu">
          <NavLink to="/home" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink to="/analytics" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-label">Analytics</span>
          </NavLink>
        </nav>
        <ProfileHeader />
      </div>
    </div>
  );
};

export default Sidebar;
