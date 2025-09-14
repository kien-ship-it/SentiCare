import React from 'react';
import { NavLink } from 'react-router-dom';
import './LogoContainer.css';

const LogoContainer = () => {
  return (
    <div className="logo-container-wrapper">
      <h1 className="logo">SentiCare</h1>
      <nav className="nav-menu">
        <NavLink to="/home" className="nav-item">
          <span className="nav-label">Home</span>
          <span className="nav-dot"></span>
        </NavLink>
        <NavLink to="/analytics" className="nav-item">
          <span className="nav-label">Analytics</span>
          <span className="nav-dot"></span>
        </NavLink>
      </nav>
    </div>
  );
};

export default LogoContainer;
