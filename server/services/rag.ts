import { Embedding, WidgetConfig } from "@shared/schema";
import { storage } from "../storage";
import { queryDeepSeek } from "./deepseek";

/**
 * Create a simple embedding for the given text.
 * @param text The input text to embed.
 * @returns The embedding vector.
 */
export function createSimpleEmbedding(text: string): number[] {
  if (!isValidString(text)) {
    throw new Error("Invalid input: Text must be a non-empty string");
  }

  const normalizedText = text.toLowerCase().trim();
  const EMBEDDING_DIMENSION = 1536;
  const vector: number[] = new Array(EMBEDDING_DIMENSION).fill(0);

  const words = normalizedText.split(/\s+/);

  for (const [i, word] of words.entries()) {
    const wordHash = hashString(word);
    for (let d = 0; d < EMBEDDING_DIMENSION; d++) {
      vector[d] += Math.sin((wordHash * (d + 1)) % 100) / (2 * words.length);
    }
  }

  return normalizeVector(vector);
}

/**
 * Robust string hash function for embedding.
 */
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Normalize a vector to unit length.
 */
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    const result = new Array(vector.length).fill(0);
    result[0] = 1;
    return result;
  }
  return vector.map(val => val / magnitude);
}

/**
 * Calculate cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (!isNumberArray(a) || !isNumberArray(b)) {
    throw new Error("Both inputs must be arrays of numbers");
  }
  if (a.length !== b.length) {
    throw new Error(`Vector dimensions don't match: ${a.length} vs ${b.length}`);
  }
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Type guard to verify an array of numbers.
 */
function isNumberArray(arr: any): arr is number[] {
  return Array.isArray(arr) && arr.every(item => typeof item === 'number');
}

/**
 * Validate that input is a non-empty string.
 */
function isValidString(val: any): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Centralized log helper.
 */
function logInfo(message: string, data?: object) {
  console.info({ message, ...data, timestamp: new Date().toISOString() });
}

function logWarn(message: string, data?: object) {
  console.warn({ message, ...data, timestamp: new Date().toISOString() });
}

function logError(message: string, error: unknown, data?: object) {
  console.error({
    message,
    error: error instanceof Error ? error.message : String(error),
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Find the most similar document chunks to a query.
 * @param query Input query string.
 * @param topK Number of top results.
 * @returns Array of chunk contents.
 */
export async function findSimilarChunks(
  query: string,
  topK: number = 3
): Promise<string[]> {
  try {
    if (!isValidString(query)) {
      throw new Error("Invalid query: Must be a non-empty string");
    }
    if (typeof topK !== 'number' || topK < 1) topK = 3;

    const documents = await storage.getAllDocuments();
    if (documents.length === 0) return [];

    const queryEmbedding = createSimpleEmbedding(query);
    const embeddingsWithScores: Array<{
      embedding: Embedding;
      similarity: number;
      documentId: number;
    }> = [];

    for (const document of documents) {
      try {
        const documentEmbeddings = await storage.getEmbeddingsByDocumentId(document.id);

        for (const embedding of documentEmbeddings) {
          const embeddingVector = embedding.embedding;
          if (!isNumberArray(embeddingVector)) {
            logWarn(`Invalid embedding format`, { documentId: document.id, chunkIndex: embedding.chunkIndex });
            continue;
          }
          if (embeddingVector.length !== queryEmbedding.length) {
            logWarn(`Embedding dimension mismatch`, { got: embeddingVector.length, expected: queryEmbedding.length });
            continue;
          }
          try {
            const similarity = cosineSimilarity(queryEmbedding, embeddingVector);
            embeddingsWithScores.push({ embedding, similarity, documentId: document.id });
          } catch (e) {
            logWarn("Similarity calculation failed", { error: e, documentId: document.id });
          }
        }
      } catch (e) {
        logWarn(`Failed to process document`, { error: e, documentId: document.id });
        continue;
      }
    }

    // Sort by similarity descending
    embeddingsWithScores.sort((a, b) => b.similarity - a.similarity);

    // Deduplication: uncomment for one chunk per document
    // const seenDocIds = new Set<number>();
    const dedupedResults: { embedding: Embedding; similarity: number }[] = [];
    for (const item of embeddingsWithScores) {
      // if (seenDocIds.has(item.documentId)) continue;
      // seenDocIds.add(item.documentId);
      dedupedResults.push({ embedding: item.embedding, similarity: item.similarity });
      if (dedupedResults.length >= topK) break;
    }

    return dedupedResults.map(item => item.embedding.content);
  } catch (error) {
    logError("Error in findSimilarChunks", error);
    return [];
  }
}

/**
 * Generate a RAG response for a query using the knowledge base and DeepSeek.
 * @param query User's question.
 * @param config Widget configuration.
 * @returns String response.
 */
export async function generateRAGResponse(
  query: string,
  config: WidgetConfig
): Promise<string> {
  if (!isValidString(query)) {
    return "I'm sorry, I need a valid question to search for information.";
  }

  try {
    const contextChunks = await findSimilarChunks(query, 5);

    if (contextChunks.length === 0) {
      logInfo("No context chunks found for query", { query });
      return await queryDeepSeek(query, [], config);
    }
    logInfo("Found relevant context chunks", { count: contextChunks.length, query });
    // TODO: For large numbers of documents, consider parallelizing findSimilarChunks and caching embeddings.
    return await queryDeepSeek(query, contextChunks, config);

  } catch (error) {
    console.error("Error in RAG response generation", error, { query });
    return "I'm sorry, I encountered an error while searching for information. Please try again later.";
  }
}
