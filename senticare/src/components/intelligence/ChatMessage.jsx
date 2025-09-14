import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`chat-message ${message.type}`}>
      <div className="message-content">
        <div className="message-avatar">
          {message.type === 'user' ? '👤' : '🤖'}
        </div>
        <div className="message-bubble">
          <div className="message-text">
            {message.type === 'assistant' ? (
              <ReactMarkdown
                components={{
                  // Custom components for better styling
                  h1: ({children}) => <h1 className="markdown-h1">{children}</h1>,
                  h2: ({children}) => <h2 className="markdown-h2">{children}</h2>,
                  h3: ({children}) => <h3 className="markdown-h3">{children}</h3>,
                  p: ({children}) => <p className="markdown-p">{children}</p>,
                  ul: ({children}) => <ul className="markdown-ul">{children}</ul>,
                  ol: ({children}) => <ol className="markdown-ol">{children}</ol>,
                  li: ({children}) => <li className="markdown-li">{children}</li>,
                  code: ({inline, children}) => 
                    inline ? (
                      <code className="markdown-code-inline">{children}</code>
                    ) : (
                      <pre className="markdown-code-block">
                        <code>{children}</code>
                      </pre>
                    ),
                  blockquote: ({children}) => <blockquote className="markdown-blockquote">{children}</blockquote>,
                  strong: ({children}) => <strong className="markdown-strong">{children}</strong>,
                  em: ({children}) => <em className="markdown-em">{children}</em>
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              message.content
            )}
          </div>
          <div className="message-timestamp">{formatTime(message.timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
