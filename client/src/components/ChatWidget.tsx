import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWidgetContext } from '@/context/WidgetContext';
import { useConversation } from '@/hooks/useConversation';

export default function ChatWidget() {
  const { config, isOpen, toggleChat } = useWidgetContext();
  const { messages, isTyping, sendUserMessage } = useConversation();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages when messages change or chat opens
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle sending message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendUserMessage(inputMessage);
      setInputMessage('');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If no config, don't render anything
  if (!config) return null;

  const styles = {
    // CSS variables for dynamic styling
    '--primary-color': config.primaryColor,
    '--background-color': config.backgroundColor,
    '--text-color': config.textColor,
    '--accent-color': config.accentColor,
  } as React.CSSProperties;

  // Get position classes
  const getPositionClasses = () => {
    switch (config.position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  // Get icon component
  const renderIcon = () => {
    switch (config.iconType) {
      case 'customer-service':
        return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>;
      case 'robot':
        return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
      case 'question-answer':
        return <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
      case 'message':
      default:
        return <MessageCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`} style={styles}>
      {/* Chat Button (collapsed state) */}
      <Button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ backgroundColor: config.primaryColor, color: 'white' }}
      >
        {isOpen ? <X className="w-6 h-6" /> : renderIcon()}
        {!isOpen && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#E53E3E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            •
          </span>
        )}
      </Button>
      
      {/* Chat Window (expanded state) */}
      {isOpen && (
        <div
          className="slide-up absolute bottom-16 right-0 bg-white rounded-lg shadow-lg w-80 sm:w-96 overflow-hidden"
          style={{ 
            height: '500px', 
            maxHeight: '80vh',
            backgroundColor: config.backgroundColor,
            color: config.textColor
          }}
        >
          {/* Chat Header */}
          <div 
            className="p-4 flex justify-between items-center"
            style={{ backgroundColor: config.primaryColor, color: 'white' }}
          >
            <div className="flex items-center">
              {config.showAvatar && (
                <div className="w-8 h-8 rounded-full bg-white mr-2 flex items-center justify-center">
                  {renderIcon()}
                </div>
              )}
              <div>
                <h3 className="font-medium">{config.chatTitle}</h3>
                <p className="text-xs text-white text-opacity-80">Powered by DeepSeek</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleChat}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Chat Messages */}
          <div 
            className="p-4 overflow-y-auto"
            style={{ height: 'calc(100% - 130px)' }}
          >
            {/* Initial greeting if no messages */}
            {messages.length === 0 && (
              <div className="flex mb-4">
                {config.showAvatar && (
                  <div 
                    className="w-8 h-8 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: config.primaryColor, color: 'white' }}
                  >
                    {renderIcon()}
                  </div>
                )}
                <div 
                  className="chat-message bg-gray-100 rounded-lg p-3 text-sm"
                  style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                >
                  {config.greeting}
                </div>
              </div>
            )}
            
            {/* Render messages */}
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : ''} mb-4`}
              >
                {!message.isUser && config.showAvatar && (
                  <div 
                    className="w-8 h-8 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: config.primaryColor, color: 'white' }}
                  >
                    {renderIcon()}
                  </div>
                )}
                <div 
                  className={`chat-message rounded-lg p-3 text-sm ${
                    message.isUser 
                      ? 'text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  style={
                    message.isUser 
                      ? { backgroundColor: config.primaryColor } 
                      : { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex mb-4">
                {config.showAvatar && (
                  <div 
                    className="w-8 h-8 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: config.primaryColor, color: 'white' }}
                  >
                    {renderIcon()}
                  </div>
                )}
                <div 
                  className="chat-message bg-gray-100 rounded-lg p-2 text-sm typing-indicator"
                  style={{ backgroundColor: 'hsl(var(--muted))' }}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            {/* Empty div for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="border-t p-3">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:text-primary mr-2"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
              />
              <Button 
                onClick={handleSendMessage}
                className="ml-2 p-2 rounded-md"
                style={{ backgroundColor: config.primaryColor, color: 'white' }}
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Powered by DeepSeek AI · <a href="#" className="text-primary">Privacy Policy</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
