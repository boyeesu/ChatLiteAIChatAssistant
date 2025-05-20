import {
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument,
  embeddings, type Embedding, type InsertEmbedding,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage,
  widgetConfig, type WidgetConfig, type InsertWidgetConfig,
  analytics, type Analytics, type InsertAnalytics
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Document operations
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Embedding operations
  getEmbeddingsByDocumentId(documentId: number): Promise<Embedding[]>;
  createEmbedding(embedding: InsertEmbedding): Promise<Embedding>;
  deleteEmbeddingsByDocumentId(documentId: number): Promise<boolean>;

  // Conversation operations
  getConversationBySessionId(sessionId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Message operations
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Widget configuration operations
  getWidgetConfig(): Promise<WidgetConfig | undefined>;
  updateWidgetConfig(config: Partial<InsertWidgetConfig>): Promise<WidgetConfig>;

  // Analytics operations
  getAnalytics(days: number): Promise<Analytics[]>;
  updateDailyAnalytics(analytics: Partial<InsertAnalytics>): Promise<Analytics>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private embeddings: Map<number, Embedding>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private widgetConfigs: Map<number, WidgetConfig>;
  private analyticsData: Map<number, Analytics>;

  private currentUserId: number;
  private currentDocumentId: number;
  private currentEmbeddingId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentAnalyticsId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.embeddings = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.widgetConfigs = new Map();
    this.analyticsData = new Map();

    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentEmbeddingId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentAnalyticsId = 1;

    // Initialize with default widget config
    const defaultConfig: WidgetConfig = {
      id: 1,
      chatTitle: "AI Support Chat",
      primaryColor: "#3366FF",
      backgroundColor: "#FFFFFF",
      textColor: "#2D3748",
      accentColor: "#6C63FF",
      iconType: "message",
      position: "bottom-right",
      showAvatar: true,
      aiTone: "professional",
      responseLength: 3,
      greeting: "Hello! I'm your AI assistant powered by DeepSeek. I can help answer questions based on your knowledge base. How can I assist you today?",
      aiInstructions: "Sound like a human and provide helpful, concise answers. Avoid unnecessary jargon or icons.",
      embedCode: `<script src="https://cdn.example.com/chat-widget.js" data-widget-id="default"></script>`,
      deepSeekEnabled: true,
      lastUpdated: new Date(),
    };
    this.widgetConfigs.set(1, defaultConfig);

    // Initialize with a sample analytics entry for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sampleAnalytics: Analytics = {
      id: 1,
      date: today,
      conversationCount: 23,
      messageCount: 156,
      topicCounts: {
        "Pricing Questions": 32,
        "Technical Support": 28,
        "Account Issues": 24,
        "Other Inquiries": 16
      }
    };
    this.analyticsData.set(1, sampleAnalytics);

    // Add sample documents
    const sampleDocs: InsertDocument[] = [
      {
        fileName: "Employee Handbook.pdf",
        fileType: "pdf",
        fileSizeKb: 4200,
        content: "This is a sample employee handbook content.",
      },
      {
        fileName: "Product Documentation.docx",
        fileType: "docx",
        fileSizeKb: 2800,
        content: "This is a sample product documentation content.",
      }
    ];

    for (const doc of sampleDocs) {
      this.createDocument(doc);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Document operations
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;

    const updatedDocument: Document = {
      ...existingDocument,
      ...updateData,
      id,
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const deleted = this.documents.delete(id);
    if (deleted) {
      await this.deleteEmbeddingsByDocumentId(id);
    }
    return deleted;
  }

  // Embedding operations
  async getEmbeddingsByDocumentId(documentId: number): Promise<Embedding[]> {
    return Array.from(this.embeddings.values()).filter(
      (embedding) => embedding.documentId === documentId
    );
  }

  async createEmbedding(insertEmbedding: InsertEmbedding): Promise<Embedding> {
    const id = this.currentEmbeddingId++;
    const embedding: Embedding = {
      ...insertEmbedding,
      id,
    };
    this.embeddings.set(id, embedding);
    return embedding;
  }

  async deleteEmbeddingsByDocumentId(documentId: number): Promise<boolean> {
    const embeddingsToDelete = Array.from(this.embeddings.values()).filter(
      (embedding) => embedding.documentId === documentId
    );
    
    for (const embedding of embeddingsToDelete) {
      this.embeddings.delete(embedding.id);
    }
    
    return true;
  }

  // Conversation operations
  async getConversationBySessionId(sessionId: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(
      (conversation) => conversation.sessionId === sessionId
    );
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      ...insertConversation,
      id,
      startedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    
    // Update analytics
    await this.updateDailyAnalytics({
      conversationCount: 1
    });
    
    return conversation;
  }

  // Message operations
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    
    // Update analytics
    await this.updateDailyAnalytics({
      messageCount: 1
    });
    
    return message;
  }

  // Widget configuration operations
  async getWidgetConfig(): Promise<WidgetConfig | undefined> {
    // Always return the config with ID 1
    return this.widgetConfigs.get(1);
  }

  async updateWidgetConfig(updateData: Partial<InsertWidgetConfig>): Promise<WidgetConfig> {
    const existingConfig = await this.getWidgetConfig() || {
      id: 1,
      chatTitle: "AI Support Chat",
      primaryColor: "#3366FF",
      backgroundColor: "#FFFFFF",
      textColor: "#2D3748",
      accentColor: "#6C63FF",
      iconType: "message",
      position: "bottom-right",
      showAvatar: true,
      aiTone: "professional",
      responseLength: 3,
      greeting: "Hello! I'm your AI assistant. How can I help you today?",
      aiInstructions: "Sound like a human and provide helpful, concise answers.",
      embedCode: `<script src="https://cdn.example.com/chat-widget.js" data-widget-id="default"></script>`,
      deepSeekEnabled: true,
      lastUpdated: new Date(),
    };

    const updatedConfig: WidgetConfig = {
      ...existingConfig,
      ...updateData,
      lastUpdated: new Date(),
    };
    
    this.widgetConfigs.set(1, updatedConfig);
    return updatedConfig;
  }

  // Analytics operations
  async getAnalytics(days: number): Promise<Analytics[]> {
    const now = new Date();
    const oldestDate = new Date(now);
    oldestDate.setDate(oldestDate.getDate() - days);
    
    return Array.from(this.analyticsData.values())
      .filter((analytics) => analytics.date >= oldestDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async updateDailyAnalytics(updateData: Partial<InsertAnalytics>): Promise<Analytics> {
    // Get today's date with time set to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's analytics entry or create a new one
    let todayAnalytics = Array.from(this.analyticsData.values()).find(
      (analytics) => analytics.date.getTime() === today.getTime()
    );
    
    if (!todayAnalytics) {
      const id = this.currentAnalyticsId++;
      todayAnalytics = {
        id,
        date: today,
        conversationCount: 0,
        messageCount: 0,
        topicCounts: {}
      };
      this.analyticsData.set(id, todayAnalytics);
    }
    
    // Update fields
    const updatedAnalytics: Analytics = {
      ...todayAnalytics,
      conversationCount: todayAnalytics.conversationCount + (updateData.conversationCount || 0),
      messageCount: todayAnalytics.messageCount + (updateData.messageCount || 0),
      topicCounts: updateData.topicCounts 
        ? { ...todayAnalytics.topicCounts, ...updateData.topicCounts }
        : todayAnalytics.topicCounts
    };
    
    this.analyticsData.set(todayAnalytics.id, updatedAnalytics);
    return updatedAnalytics;
  }
}

export const storage = new MemStorage();
