import React from 'react';
import './CameraStatus.css';

const CameraStatus = () => {
  return (
    <div className="camera-status">
      <span className="camera-icon">📷</span>
      <span className="camera-text">12/15 Cameras Online</span>
    </div>
  );
};

export default CameraStatus;
