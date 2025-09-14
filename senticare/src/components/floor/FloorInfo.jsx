import React from 'react';
import './FloorInfo.css';

const FloorInfo = () => {
  // Sample patient data with different colors
  const patients = [
    { id: 1, name: 'John D.', color: '#4CAF50' },
    { id: 2, name: 'Emma S.', color: '#2196F3' },
    { id: 3, name: 'Michael R.', color: '#9C27B0' }
  ];

  return (
    <div className="floor-info">
      <div className="floor-container">
        <div className="floor-number">
          <span>Floor 3</span>
        </div>
        <div className="divider"></div>
        <div className="patients-container">
          {patients.map(patient => (
            <div 
              key={patient.id} 
              className="patient-badge"
              style={{ backgroundColor: patient.color }}
            >
              {patient.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloorInfo;
