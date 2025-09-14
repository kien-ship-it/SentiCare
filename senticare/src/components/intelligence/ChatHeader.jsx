import React from 'react';
import './ChatHeader.css';

const ChatHeader = ({ onTestDataFlow }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-content">
        <div className="chat-title-section">
          <div className="chat-icon">🧠</div>
          <div className="chat-title-text">
            <h1 className="chat-title">SentiCare Intelligence</h1>
            <p className="chat-subtitle">AI-powered insights and assistance</p>
          </div>
        </div>
        <div className="chat-status-section">
          <div className="chat-status">
            <div className="status-indicator online"></div>
            <span className="status-text">AI Assistant Online</span>
          </div>
          <button 
            onClick={onTestDataFlow}
            className="test-data-button"
          >
            🧪 Test Data Flow
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
