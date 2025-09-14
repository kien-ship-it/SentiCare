import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = () => {
  return (
    <div className="profile-header">
      <div className="user-info">
        <div className="user-details">
          <div className="user-name">Johns Hopkins</div>
          <div className="user-phone">555-123-456</div>
        </div>
        <div className="avatar">JH</div>
      </div>
    </div>
  );
};

export default ProfileHeader;
