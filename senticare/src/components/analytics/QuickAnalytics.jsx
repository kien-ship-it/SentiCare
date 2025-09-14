import React from 'react';
import { FaExclamationTriangle, FaUsers, FaBell } from 'react-icons/fa';
import { BsCircleFill } from 'react-icons/bs';
import './QuickAnalytics.css';

const QuickAnalytics = () => {
  return (
    <div className="quick-analytics">
      <div className="analytics-item live-status">
        <BsCircleFill className="live-dot" />
        <span className="analytics-label">Live</span>
      </div>
      <div className="divider"></div>
      <div className="analytics-item">
        <FaExclamationTriangle />
        <span className="analytics-value">2</span>
      </div>
      <div className="divider"></div>
      <div className="analytics-item">
        <FaUsers className="analytics-icon" />
        <span className="analytics-value">50%</span>
      </div>
      <div className="divider"></div>
      <div className="analytics-item">
        <FaBell className="analytics-icon" />
      </div>
    </div>
  );
};

export default QuickAnalytics;
