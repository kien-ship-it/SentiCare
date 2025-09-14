import React, { useState, useRef, useCallback } from 'react';
import LogoContainer from '../../components/layout/LogoContainer';
import ProfileHeader from '../../components/layout/ProfileHeader';
import CameraStatus from '../../components/camera/CameraStatus';
import QuickAnalytics from '../../components/analytics/QuickAnalytics';
import FloorInfo from '../../components/floor/FloorInfo';
import FloorMap from '../../assets/FloorMap.svg';
import './HomePage.css';

const Home = () => {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  }, [panOffset]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Set limits for panning
    const maxPanX = 200;
    const maxPanY = 200;
    const minPanX = -200;
    const minPanY = -200;

    setPanOffset({
      x: Math.max(minPanX, Math.min(maxPanX, newX)),
      y: Math.max(minPanY, Math.min(maxPanY, newY))
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="home-page">
      <LogoContainer />
      <CameraStatus />
      <ProfileHeader />
      <QuickAnalytics />
      <div 
        className="floor-plan"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          className="floor-canvas"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
          }}
        >
          <img src={FloorMap} alt="Floor Map" className="floor-map-image" />
          <div className="camera-indicator" style={{ top: '20%', left: '30%' }}>[c]</div>
          <div className="camera-indicator" style={{ top: '50%', left: '70%' }}>[c]</div>
          <div className="camera-indicator" style={{ top: '80%', left: '40%' }}>[c]</div>
        </div>
      </div>
      <FloorInfo />
    </div>
  );
};

export default Home;
