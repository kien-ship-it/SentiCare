// src/components/analytics/PatientHeader.jsx
import React from 'react';

function PatientHeader({ patientName = "John D." }) {
  return (
    <div className="patient-header">
      <h2>{patientName}</h2>
      <p className="patient-subtitle">Patient Analytics Dashboard</p>
    </div>
  );
}

export default PatientHeader;
