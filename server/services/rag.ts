
import { Embedding, WidgetConfig } from "@shared/schema";
import { storage } from "../storage";
import { queryDeepSeek } from "./deepseek";

// In a production system, this would use a proper embedding model or API
// This is a better simulation for demo purposes, though still not production-ready
export function createSimpleEmbedding(text: string): number[] {
  if (!text || typeof text !== 'string') {
    throw new Error("Invalid input: Text must be a non-empty string");
  }
  
  // Normalize text for consistency
  const normalizedText = text.toLowerCase().trim();
  
  // Fixed dimensions for consistency
  const EMBEDDING_DIMENSION = 1536;
  const vector: number[] = new Array(EMBEDDING_DIMENSION).fill(0);
  
  // Better distribution of values using word-level features
  const words = normalizedText.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Create a more stable hash for each word
    const wordHash = hashString(word);
    
    // Distribute word influence across different dimensions
    for (let d = 0; d < EMBEDDING_DIMENSION; d++) {
      // Different formula for each dimension to reduce collisions
      vector[d] += Math.sin((wordHash * (d + 1)) % 100) / (2 * words.length);
    }
  }
  
  // Normalize the vector to unit length for consistent cosine similarity
  return normalizeVector(vector);
}

// More robust string hash function
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Normalize vector to unit length
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  
  // Prevent division by zero
  if (magnitude === 0) {
    // Return a default unit vector if input produces a zero vector
    const result = new Array(vector.length).fill(0);
    result[0] = 1;
    return result;
  }
  
  return vector.map(val => val / magnitude);
}

// Improved cosine similarity with validation
function cosineSimilarity(a: number[], b: number[]): number {
  // Validate inputs
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new Error("Both inputs must be arrays");
  }
  
  if (a.length !== b.length) {
    throw new Error(`Vector dimensions don't match: ${a.length} vs ${b.length}`);
  }
  
  // Efficient computation
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    if (typeof a[i] !== 'number' || typeof b[i] !== 'number') {
      throw new Error("Vectors must contain only numbers");
    }
    
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  // Prevent division by zero
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Type guard to verify embedding array
function isNumberArray(arr: any): arr is number[] {
  return Array.isArray(arr) && arr.every(item => typeof item === 'number');
}

// Function to find the most similar chunks to a query with better error handling and deduplication
export async function findSimilarChunks(
  query: string,
  topK: number = 3
): Promise<string[]> {
  try {
    // Input validation
    if (!query || typeof query !== 'string') {
      throw new Error("Invalid query: Must be a non-empty string");
    }
    
    if (typeof topK !== 'number' || topK < 1) {
      topK = 3; // Default to 3 if invalid
    }
    
    // Get all documents to search through their embeddings
    const documents = await storage.getAllDocuments();
    
    // If no documents, return empty array
    if (documents.length === 0) {
      return [];
    }
    
    // Create a query embedding
    const queryEmbedding = createSimpleEmbedding(query);
    
    // Array to store embeddings with similarity scores
    const embeddingsWithScores: { 
      embedding: Embedding; 
      similarity: number;
      documentId: number;
    }[] = [];
    
    // For each document, get its embeddings and calculate similarity
    for (const document of documents) {
      try {
        const documentEmbeddings = await storage.getEmbeddingsByDocumentId(document.id);
        
        for (const embedding of documentEmbeddings) {
          // Safely extract and validate the embedding
          const embeddingVector = embedding.embedding;
          
          if (!embeddingVector || !isNumberArray(embeddingVector)) {
            console.warn(`Invalid embedding format for document ${document.id}, chunk ${embedding.chunkIndex}`);
            continue;
          }
          
          // Verify dimensions match
          if (embeddingVector.length !== queryEmbedding.length) {
            console.warn(`Embedding dimension mismatch: ${embeddingVector.length} vs expected ${queryEmbedding.length}`);
            continue;
          }
          
          try {
            const similarity = cosineSimilarity(queryEmbedding, embeddingVector);
            
            embeddingsWithScores.push({
              embedding,
              similarity,
              documentId: document.id
            });
          } catch (error) {
            console.warn(`Similarity calculation failed: ${error}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to process document ${document.id}: ${error}`);
        continue;
      }
    }
    
    // Sort by similarity (highest first)
    embeddingsWithScores.sort((a, b) => b.similarity - a.similarity);
    
    // Deduplication logic - prefer higher similarity when chunks are from same document
    const seenDocIds = new Set<number>();
    const dedupedResults: {embedding: Embedding; similarity: number}[] = [];
    
    for (const item of embeddingsWithScores) {
      // If we want one chunk per document for diversity:
      // Uncomment below for document-level deduplication
      /*
      if (seenDocIds.has(item.documentId)) {
        continue;
      }
      seenDocIds.add(item.documentId);
      */
      
      dedupedResults.push({
        embedding: item.embedding,
        similarity: item.similarity
      });
      
      if (dedupedResults.length >= topK) {
        break;
      }
    }
    
    // Return top K chunks
    return dedupedResults.map((item) => item.embedding.content);
  } catch (error) {
    console.error("Error in findSimilarChunks:", error);
    return []; // Return empty array on error
  }
}

// Improved RAG function with better error handling and logging
export async function generateRAGResponse(
  query: string,
  config: WidgetConfig
): Promise<string> {
  if (!query || typeof query !== 'string') {
    return "I'm sorry, I need a valid question to search for information.";
  }
  
  try {
    // Find relevant chunks for the query
    const contextChunks = await findSimilarChunks(query, 5);
    
    if (contextChunks.length === 0) {
      // Use structured logging instead of console.log
      console.info({
        message: "No context chunks found for query",
        query,
        timestamp: new Date().toISOString()
      });
      
      // If no context is found, still attempt to answer with DeepSeek's knowledge
      return await queryDeepSeek(query, [], config);
    }
    
    console.info({
      message: "Found relevant context chunks",
      count: contextChunks.length,
      query,
      timestamp: new Date().toISOString()
    });
    
    // Generate response using DeepSeek with context
    const response = await queryDeepSeek(query, contextChunks, config);
    return response;
  } catch (error) {
    console.error({
      message: "Error in RAG response generation",
      error: error instanceof Error ? error.message : String(error),
      query,
      timestamp: new Date().toISOString()
    });
    
    return "I'm sorry, I encountered an error while searching for information. Please try again later.";
  }
}
