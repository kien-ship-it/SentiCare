import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = () => {
  return (
    <div className="profile-header">
      <div className="user-info">
        <button className="icon-button" aria-label="Notifications">
          <span>🔔</span>
        </button>
        <div className="user-details">
          <div className="user-name">Totok Michael</div>
          <div className="user-phone">555-123-456</div>
        </div>
        <div className="avatar">TM</div>
      </div>
    </div>
  );
};

export default ProfileHeader;
