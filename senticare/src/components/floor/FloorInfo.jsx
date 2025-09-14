import React from 'react';
import './FloorInfo.css';

const FloorInfo = () => {
  // Sample patient data with gradient colors aligned with app design
  const patients = [
    { 
      id: 1, 
      name: 'John D.', 
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald gradient
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    { 
      id: 2, 
      name: 'Emma S.', 
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue gradient  
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    { 
      id: 3, 
      name: 'Michael R.', 
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', // Purple gradient
      shadowColor: 'rgba(168, 85, 247, 0.3)'
    }
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
              style={{ 
                background: patient.gradient,
                boxShadow: `0 2px 10px ${patient.shadowColor}`
              }}
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
