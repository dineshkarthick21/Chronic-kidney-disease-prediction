import React, { useState, useEffect, useRef } from 'react'
import './AIChatAssistant.css'

const AIChatAssistant = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: 'Hello! 👋 I\'m your CKD Prediction AI Assistant. I can help you understand Chronic Kidney Disease, our prediction system, medical parameters, and much more. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState('dark')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const suggestions = [
    "What is Chronic Kidney Disease?",
    "Explain the symptoms of CKD",
    "How does the prediction system work?",
    "What are the risk factors for CKD?"
  ]

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8001/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: messageText })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: data.answer,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: 'I apologize, but I\'m having trouble connecting to the server. Please make sure the backend is running on port 8001. You can try again in a moment.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`ai-chat-assistant ${theme}-theme`}>
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <div className="chat-logo">
            <span className="logo-icon">🤖</span>
            <div className="logo-text">
              <h2>AI Chat Assistant</h2>
              <p>CKD Prediction Helper</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className="message-avatar">
              {message.type === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !isLoading && (
        <div className="suggestions-container">
          <p className="suggestions-title">Quick questions:</p>
          <div className="suggestions-grid">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about CKD or the prediction system..."
            rows="1"
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="input-hint">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}

export default AIChatAssistant
