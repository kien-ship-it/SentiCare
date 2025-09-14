import React, { useState, useRef, useCallback } from 'react';
import CameraStatus from '../../components/camera/CameraStatus';
import FloorInfo from '../../components/floor/FloorInfo';
import FloorMap from '../../assets/FloorMap.svg';
import './HomePage.css';

const Home = () => {
  const [panOffset, setPanOffset] = useState({ x: 130, y: 0 });
  const [zoom, setZoom] = useState(0.9);
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
      <CameraStatus />
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
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`
          }}
        >
          <img src={FloorMap} alt="Floor Map" className="floor-map-image" />
          <div className="camera-indicator" style={{ top: '33%', left: '23%' }}>CAM 1</div>
          <div className="camera-indicator" style={{ top: '66%', left: '66.5%' }}>CAM 2</div>
          <div className="camera-indicator" style={{ top: '66%', left: '36.5%' }}>CAM 3</div>
        </div>
      </div>
      <FloorInfo />
    </div>
  );
};

export default Home;
