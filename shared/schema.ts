import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Knowledge base documents schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSizeKb: integer("file_size_kb").notNull(),
  content: text("content").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Embeddings schema
export const embeddings = pgTable("embeddings", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  embedding: jsonb("embedding").notNull(),
});

export const insertEmbeddingSchema = createInsertSchema(embeddings).omit({
  id: true,
});

export type InsertEmbedding = z.infer<typeof insertEmbeddingSchema>;
export type Embedding = typeof embeddings.$inferSelect;

// Conversations schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  startedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  isUser: boolean("is_user").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Widget configuration schema
export const widgetConfig = pgTable("widget_config", {
  id: serial("id").primaryKey(),
  chatTitle: text("chat_title").notNull().default("AI Support Chat"),
  primaryColor: text("primary_color").notNull().default("#3366FF"),
  backgroundColor: text("background_color").notNull().default("#FFFFFF"),
  textColor: text("text_color").notNull().default("#2D3748"),
  accentColor: text("accent_color").notNull().default("#6C63FF"),
  iconType: text("icon_type").notNull().default("message"),
  position: text("position").notNull().default("bottom-right"),
  showAvatar: boolean("show_avatar").notNull().default(true),
  aiTone: text("ai_tone").notNull().default("professional"),
  responseLength: integer("response_length").notNull().default(3),
  greeting: text("greeting").notNull().default("Hello! I'm your AI assistant. How can I help you today?"),
  aiInstructions: text("ai_instructions"),
  embedCode: text("embed_code"),
  deepSeekEnabled: boolean("deepseek_enabled").notNull().default(true),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertWidgetConfigSchema = createInsertSchema(widgetConfig).omit({
  id: true,
  lastUpdated: true,
});

export type InsertWidgetConfig = z.infer<typeof insertWidgetConfigSchema>;
export type WidgetConfig = typeof widgetConfig.$inferSelect;

// Analytics schema
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  conversationCount: integer("conversation_count").notNull().default(0),
  messageCount: integer("message_count").notNull().default(0),
  topicCounts: jsonb("topic_counts").notNull().default({}),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
