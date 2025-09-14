import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../../components/intelligence/ChatMessage';
import ChatInput from '../../components/intelligence/ChatInput';
import ChatHeader from '../../components/intelligence/ChatHeader';
import geminiService from '../../services/geminiService';
import analyticsDataService from '../../services/analyticsDataService';
import './IntelligencePage.css';

const IntelligencePage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your SentiCare Patient Intelligence Agent. I have access to John D.\'s comprehensive health data including current activity state, sleep patterns, wellness scores, and fall history. I can analyze trends, provide health insights, and answer questions about patient care. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const testDataFlow = async () => {
    console.log('🧪 Testing data flow...');
    
    try {
      // Test analytics data service
      const analyticsData = await analyticsDataService.getComprehensiveAnalytics();
      console.log('📊 Raw analytics data:', analyticsData);
      
      const formattedData = analyticsDataService.formatDataForAI(analyticsData);
      console.log('🤖 Formatted data for AI:', formattedData);
      
      // Add test message to chat
      const testMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `**Data Flow Test Results:**\n\n**Analytics Data Available:** ${!!analyticsData}\n\n**Formatted Data Preview:**\n\`\`\`\n${formattedData.substring(0, 500)}...\n\`\`\`\n\nCheck console for full data details.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, testMessage]);
    } catch (error) {
      console.error('❌ Data flow test failed:', error);
      
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `**Data Flow Test Failed:**\n\nError: ${error.message}\n\nCheck console for details.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async (content) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Generate AI response using Gemini service
      const aiResponseContent = await geminiService.generateResponse(content);
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiResponseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorResponse = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please ensure your Gemini API key is properly configured in the .env file.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      setError(error.message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="intelligence-page">
      <div className="intelligence-content">
        <ChatHeader onTestDataFlow={testDataFlow} />
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default IntelligencePage;
