
import { InsertDocument } from "@shared/schema";
import { storage } from "../storage";
import { createEmbedding } from "./rag";

// Supported file types
const SUPPORTED_FILE_TYPES = ['pdf', 'txt', 'docx', 'html', 'md'];

// Maximum file size in KB (50MB)
const MAX_FILE_SIZE_KB = 50 * 1024;

// Check if file type is supported
export function isFileTypeSupported(fileType: string): boolean {
  return SUPPORTED_FILE_TYPES.includes(fileType.toLowerCase());
}

// Check if file size is valid
export function isFileSizeValid(fileSizeKb: number): boolean {
  return fileSizeKb <= MAX_FILE_SIZE_KB;
}

// Process document and prepare metadata
export async function processDocument(
  fileName: string,
  fileType: string,
  content: string,
  fileSizeKb: number
): Promise<InsertDocument> {
  // Validate inputs
  if (!fileName || !fileType || !content) {
    throw new Error("Missing required document properties");
  }
  
  // In a real implementation, this would include more processing
  // such as extracting text from PDFs, parsing HTML, etc.
  return {
    fileName,
    fileType: fileType.toLowerCase(),
    fileSizeKb,
    content
  };
}

// Chunk the content of a document for embedding and retrieval
export function chunkDocumentContent(document: { content: string; id: number }): string[] {
  if (!document || !document.content) {
    return [];
  }
  
  const content = document.content;
  const chunks: string[] = [];
  
  // Improved chunking with smarter boundaries
  // This implementation splits by paragraphs first, then by sentences if paragraphs are too large
  
  // Split by paragraphs (double newlines)
  const paragraphs = content.split(/\n\s*\n/);
  
  // Ideal chunk size
  const TARGET_CHUNK_SIZE = 1000; // characters
  const MAX_CHUNK_SIZE = 1500; // maximum size before forced split
  
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    // Skip empty paragraphs
    if (!paragraph.trim()) continue;
    
    // If adding this paragraph would make chunk too large, save current chunk
    if (currentChunk && (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE)) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    
    // If paragraph itself is larger than target size, split into sentences
    if (paragraph.length > TARGET_CHUNK_SIZE) {
      // Split by sentences (period followed by space or newline)
      const sentences = paragraph.split(/\.\s+|\.\n/);
      
      for (const sentence of sentences) {
        if (!sentence.trim()) continue;
        
        // Add period back to the sentence if it was removed during splitting
        const fullSentence = sentence.endsWith('.') ? sentence : sentence + '.';
        
        // If adding this sentence would make chunk too large, save current chunk
        if (currentChunk && (currentChunk.length + fullSentence.length > MAX_CHUNK_SIZE)) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
        
        currentChunk += " " + fullSentence;
      }
    } else {
      // Add the whole paragraph
      currentChunk += " " + paragraph;
      
      // If we've reached target size, save the chunk
      if (currentChunk.length >= TARGET_CHUNK_SIZE) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Store document with its embeddings
export async function storeDocumentWithEmbeddings(
  fileName: string,
  fileType: string,
  content: string,
  fileSizeKb: number
): Promise<number> {
  try {
    // Create and store document
    const documentData = await processDocument(
      fileName,
      fileType,
      content,
      fileSizeKb
    );
    
    const document = await storage.createDocument(documentData);
    
    // Chunk the document content
    const chunks = chunkDocumentContent(document);
    
    // Create and store embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunk = chunks[i];
        const embedding = await createEmbedding(chunk);
        
        await storage.createEmbedding({
          documentId: document.id,
          chunkIndex: i,
          content: chunk,
          embedding: embedding,
        });
      } catch (error) {
        console.error(`Failed to create embedding for chunk ${i}:`, error);
        // Continue with other chunks
      }
    }
    
    return document.id;
  } catch (error) {
    console.error("Error storing document with embeddings:", error);
    throw error;
  }
}
