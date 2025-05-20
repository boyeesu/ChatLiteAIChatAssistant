// Widget configuration type
export interface WidgetConfig {
  id: number;
  chatTitle: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  iconType: string;
  position: string;
  showAvatar: boolean;
  aiTone: string;
  responseLength: number;
  greeting: string;
  aiInstructions?: string;
  embedCode?: string;
  deepSeekEnabled: boolean;
  lastUpdated: Date;
}

// Document type
export interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  content: string;
  uploadedAt: Date;
}

// Message type
export interface Message {
  id: number;
  conversationId: number;
  isUser: boolean;
  content: string;
  timestamp: Date;
}

// Conversation type
export interface Conversation {
  id: number;
  sessionId: string;
  startedAt: Date;
}

// Analytics type
export interface Analytics {
  id: number;
  date: Date;
  conversationCount: number;
  messageCount: number;
  topicCounts: Record<string, number>;
}

// Analytics chart data type
export interface AnalyticsChartData {
  name: string;
  value: number;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface MessageResponse {
  userMessage: Message;
  aiMessage: Message;
}
