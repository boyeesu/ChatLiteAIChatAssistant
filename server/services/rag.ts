import { Embedding, WidgetConfig } from "@shared/schema";
import { storage } from "../storage";
import { queryDeepSeek } from "./deepseek";

// Simulated vector operations for in-memory RAG
// In a production system, this would use a vector database

// Function to create a simple vector embedding
// In a real implementation, this would call an embedding API like OpenAI
export function createSimpleEmbedding(text: string): number[] {
  // This is a simplified hash-based embedding for demonstration
  // Real systems would use proper embeddings from an API
  const hash = simpleHash(text);
  // Create a 1536-dimension vector (common in embedding models)
  const vector: number[] = [];
  for (let i = 0; i < 1536; i++) {
    vector[i] = Math.sin((hash + i) % 100) / 2 + 0.5;
  }
  return vector;
}

// Simple hash function for demo purposes
function simpleHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// Function to find the most similar chunks to a query
export async function findSimilarChunks(
  query: string,
  topK: number = 3
): Promise<string[]> {
  // Get all documents to search through their embeddings
  const documents = await storage.getAllDocuments();
  
  // If no documents, return empty array
  if (documents.length === 0) {
    return [];
  }
  
  // Create a query embedding
  const queryEmbedding = createSimpleEmbedding(query);
  
  // Array to store embeddings with similarity scores
  const embeddingsWithScores: { embedding: Embedding; similarity: number }[] = [];
  
  // For each document, get its embeddings and calculate similarity
  for (const document of documents) {
    const documentEmbeddings = await storage.getEmbeddingsByDocumentId(document.id);
    
    for (const embedding of documentEmbeddings) {
      const similarity = cosineSimilarity(
        queryEmbedding,
        embedding.embedding as number[]
      );
      
      embeddingsWithScores.push({
        embedding,
        similarity,
      });
    }
  }
  
  // Sort by similarity (highest first)
  embeddingsWithScores.sort((a, b) => b.similarity - a.similarity);
  
  // Return top K chunks
  return embeddingsWithScores
    .slice(0, topK)
    .map((item) => item.embedding.content);
}

// RAG function to generate response based on query and context
export async function generateRAGResponse(
  query: string,
  config: WidgetConfig
): Promise<string> {
  try {
    // Find relevant chunks for the query
    const contextChunks = await findSimilarChunks(query, 5); // Increased from default 3 to 5 chunks for better context
    
    if (contextChunks.length === 0) {
      console.log("No context chunks found for query:", query);
      // If no context is found, still attempt to answer with DeepSeek's knowledge
      return await queryDeepSeek(query, [], config);
    }
    
    console.log(`Found ${contextChunks.length} relevant context chunks for query:`, query);
    
    // Generate response using DeepSeek with context
    const response = await queryDeepSeek(query, contextChunks, config);
    
    return response;
  } catch (error) {
    console.error("Error in RAG response generation:", error);
    return "I'm sorry, I encountered an error while searching for information. Please try again later.";
  }
}
