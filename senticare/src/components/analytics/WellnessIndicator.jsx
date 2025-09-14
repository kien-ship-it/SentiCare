// src/components/analytics/WellnessIndicator.jsx
import React from 'react';

const WellnessIndicator = ({ score, size = 80, strokeWidth = 10 }) => {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score || 0));
  
  // Calculate the circumference and stroke dash array for the progress circle
  const radius = (size - strokeWidth) / 2; // Account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };
  
  const color = getColor(normalizedScore);
  const numberFontSize = Math.max(18, Math.round(size * 0.42));
  const subLabelFontSize = Math.max(10, Math.round(size * 0.16));
  
  return (
    <div 
      style={{ 
        position: 'relative', 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      
      {/* Score text in the center */}
      <div
        style={{
          fontSize: `${numberFontSize}px`,
          fontWeight: '700',
          color: color,
          textAlign: 'center',
          lineHeight: '1'
        }}
      >
        {normalizedScore}
        <div 
          style={{ 
            fontSize: `${subLabelFontSize}px`, 
            fontWeight: '500', 
            color: '#6b7280',
            marginTop: '2px'
          }}
        >
          /100
        </div>
      </div>
    </div>
  );
};

export default WellnessIndicator;
