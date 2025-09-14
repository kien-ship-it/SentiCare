import React, { useState, useRef } from 'react';
import './ChatInput.css';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const quickPrompts = [
    "Generate a comprehensive health report for John D.",
    "Analyze recent wellness trends and patterns",
    "What's John's current activity status?",
    "Review fall history and risk assessment",
    "How has sleep quality been this week?",
    "Show today's activity breakdown"
  ];

  const handleQuickPrompt = (prompt) => {
    onSendMessage(prompt);
  };

  return (
    <div className="chat-input-container">
      <div className="quick-prompts">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            className="quick-prompt-btn"
            onClick={() => handleQuickPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your SentiCare data..."
            className="chat-textarea"
            rows="1"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
