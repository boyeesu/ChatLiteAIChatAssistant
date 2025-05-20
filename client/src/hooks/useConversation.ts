import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Message, Conversation } from '@/lib/types';
import { getConversation, getMessages, sendMessage } from '@/lib/deepseek';

export function useConversation() {
  const queryClient = useQueryClient();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize conversation on component mount
  useEffect(() => {
    const sessionId = localStorage.getItem('chatSessionId');
    initConversation(sessionId);
  }, []);

  // Initialize a conversation
  const initConversation = useCallback(async (sessionId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create or retrieve a conversation
      const conv = await getConversation(sessionId);
      setConversation(conv);
      
      // Store session ID in localStorage
      localStorage.setItem('chatSessionId', conv.sessionId);
      
      // Fetch existing messages for this conversation
      const msgs = await getMessages(conv.sessionId);
      setMessages(msgs);
      
    } catch (err) {
      console.error('Error initializing conversation:', err);
      setError('Failed to initialize conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message and get AI response
  const sendUserMessage = useCallback(async (content: string) => {
    if (!conversation) {
      setError('No active conversation');
      return;
    }

    try {
      // Add user message immediately for UI feedback
      const tempUserMessage: Message = {
        id: -Date.now(), // Temporary negative ID
        conversationId: conversation.id,
        isUser: true,
        content,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      setIsTyping(true);
      
      // Send to API and get response
      const response = await sendMessage(conversation.sessionId, content);
      
      // Update messages with the real messages from the server
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMessage.id), // Remove temp message
        response.userMessage,
        response.aiMessage
      ]);
      
      // Invalidate query cache if needed
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversation.sessionId}/messages`] });
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      
      // Remove the temporary message if there was an error
      setMessages(prev => prev.filter(m => m.id >= 0));
    } finally {
      setIsTyping(false);
    }
  }, [conversation, queryClient]);

  return {
    conversation,
    messages,
    isLoading,
    isTyping,
    error,
    sendUserMessage,
    initConversation,
  };
}
