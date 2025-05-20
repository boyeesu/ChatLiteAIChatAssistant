import { apiRequest } from './queryClient';
import { Message, Conversation, MessageResponse } from './types';

// Function to create or retrieve a conversation
export async function getConversation(sessionId?: string): Promise<Conversation> {
  const response = await apiRequest('POST', '/api/conversations', { sessionId });
  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }
  return response.json();
}

// Function to get messages in a conversation
export async function getMessages(sessionId: string): Promise<Message[]> {
  const response = await apiRequest('GET', `/api/conversations/${sessionId}/messages`);
  if (!response.ok) {
    throw new Error('Failed to get messages');
  }
  return response.json();
}

// Function to send a message and get AI response
export async function sendMessage(
  sessionId: string,
  content: string
): Promise<MessageResponse> {
  const response = await apiRequest(
    'POST',
    `/api/conversations/${sessionId}/messages`,
    { content }
  );
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}
