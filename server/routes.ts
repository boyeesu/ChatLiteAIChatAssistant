import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  insertDocumentSchema,
  insertWidgetConfigSchema,
  insertConversationSchema,
  insertMessageSchema
} from "@shared/schema";
import { storage } from "./storage";
import { processDocument, chunkDocumentContent, isFileTypeSupported, isFileSizeValid } from "./services/documentProcessor";
import { createSimpleEmbedding } from "./services/rag";
import { generateRAGResponse } from "./services/rag";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // API route for getting all documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: `Error fetching documents: ${error}` });
    }
  });

  // API route for uploading a document
  app.post("/api/documents/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const fileType = file.originalname.split('.').pop() || "";
      
      // Check if file type is supported
      if (!isFileTypeSupported(fileType)) {
        return res.status(400).json({ message: "Unsupported file type. Supported types: PDF, TXT, DOCX, HTML" });
      }
      
      // Check file size
      const fileSizeKb = Math.round(file.size / 1024);
      if (!isFileSizeValid(fileSizeKb)) {
        return res.status(400).json({ message: "File too large. Maximum size is 50MB" });
      }
      
      // Convert buffer to string (in a real app, would use proper parsers)
      const content = file.buffer.toString("utf-8");
      
      // Process the document
      const documentData = await processDocument(
        file.originalname,
        fileType,
        content,
        fileSizeKb
      );
      
      // Validate document data
      const validatedData = insertDocumentSchema.parse(documentData);
      
      // Store the document
      const document = await storage.createDocument(validatedData);
      
      // Chunk the document for RAG
      const chunks = chunkDocumentContent(document);
      
      // Create and store embeddings for each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = createSimpleEmbedding(chunk);
        
        await storage.createEmbedding({
          documentId: document.id,
          chunkIndex: i,
          content: chunk,
          embedding: embedding,
        });
      }
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: `Error uploading document: ${error}` });
    }
  });

  // API route for deleting a document
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const documentId = Number(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const deleted = await storage.deleteDocument(documentId);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: `Error deleting document: ${error}` });
    }
  });

  // API route for getting widget configuration
  app.get("/api/widget/config", async (req: Request, res: Response) => {
    try {
      const config = await storage.getWidgetConfig();
      if (!config) {
        return res.status(404).json({ message: "Widget configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: `Error fetching widget configuration: ${error}` });
    }
  });

  // API route for updating widget configuration
  app.patch("/api/widget/config", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const updateSchema = insertWidgetConfigSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      // Update the configuration
      const updatedConfig = await storage.updateWidgetConfig(validatedData);
      
      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ message: `Error updating widget configuration: ${error}` });
    }
  });

  // API route for getting analytics
  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const days = Number(req.query.days) || 7;
      const analytics = await storage.getAnalytics(days);
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: `Error fetching analytics: ${error}` });
    }
  });

  // API route for creating/retrieving a conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      // Get session ID from request, or generate a new one
      const sessionIdSchema = z.object({ sessionId: z.string().optional() });
      const { sessionId = randomUUID() } = sessionIdSchema.parse(req.body);
      
      // Check if conversation already exists
      let conversation = await storage.getConversationBySessionId(sessionId);
      
      // If not, create a new one
      if (!conversation) {
        const validatedData = insertConversationSchema.parse({ sessionId });
        conversation = await storage.createConversation(validatedData);
      }
      
      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ message: `Error creating conversation: ${error}` });
    }
  });

  // API route for getting messages in a conversation
  app.get("/api/conversations/:sessionId/messages", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      // Get the conversation
      const conversation = await storage.getConversationBySessionId(sessionId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Get messages for the conversation
      const messages = await storage.getMessagesByConversationId(conversation.id);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: `Error fetching messages: ${error}` });
    }
  });

  // API route for sending a message and getting AI response
  app.post("/api/conversations/:sessionId/messages", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      // Validate the message content
      const messageSchema = z.object({ content: z.string() });
      const { content } = messageSchema.parse(req.body);
      
      // Get the conversation
      const conversation = await storage.getConversationBySessionId(sessionId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Save the user message
      const userMessage = await storage.createMessage({
        conversationId: conversation.id,
        isUser: true,
        content,
      });
      
      // Get widget configuration for AI settings
      const config = await storage.getWidgetConfig();
      if (!config) {
        return res.status(500).json({ message: "Widget configuration not found" });
      }
      
      // Generate AI response using RAG
      const aiResponseContent = await generateRAGResponse(content, config);
      
      // Save the AI response
      const aiMessage = await storage.createMessage({
        conversationId: conversation.id,
        isUser: false,
        content: aiResponseContent,
      });
      
      // Return both messages
      res.status(200).json({
        userMessage,
        aiMessage,
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: `Error processing message: ${error}` });
    }
  });

  return httpServer;
}
