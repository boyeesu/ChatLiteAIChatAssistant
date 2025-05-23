import { InsertDocument, Document } from "@shared/schema";

// Function to create embeddings for a document
export async function processDocument(
  fileName: string,
  fileType: string,
  content: string,
  fileSizeKb: number
): Promise<InsertDocument> {
  // In a real implementation, this would parse different document types
  // such as PDF, DOCX, TXT, etc. using appropriate libraries
  
  // For simplicity in this implementation, we'll just use the raw content
  // and extract basic text content

  let extractedContent = content;

  // Process different file types (in a real app, use specific libraries)
  switch (fileType.toLowerCase()) {
    case 'pdf':
      // Using pdf.js would be implemented here in a real application
      // For now, we'll just use the provided content
      break;
      
    case 'docx':
      // Using docx parser would be implemented here in a real application
      break;
      
    case 'txt':
      // Plain text can be used directly
      break;
      
    case 'html':
      // Extract text from HTML
      extractedContent = stripHtmlTags(content);
      break;
      
    default:
      // Default handling for other file types
      break;
  }

  // Create the document object to be stored
  const document: InsertDocument = {
    fileName,
    fileType,
    fileSizeKb,
    content: extractedContent,
  };

  return document;
}

// Function to chunk the document content for RAG
export function chunkDocumentContent(
  document: Document,
  chunkSize: number = 500,
  chunkOverlap: number = 100
): string[] {
  const content = document.content;
  const chunks: string[] = [];
  
  // Improved chunking strategy that tries to respect sentence boundaries
  // This helps create more meaningful chunks for RAG
  
  // Split content into sentences
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    // Fallback to character-based chunking if sentence splitting fails
    for (let i = 0; i < content.length; i += chunkSize - chunkOverlap) {
      const chunk = content.substring(i, i + chunkSize);
      if (chunk.trim()) {
        chunks.push(chunk);
      }
    }
    return chunks;
  }
  
  // Group sentences into chunks that are approximately chunkSize characters
  let currentChunk = "";
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed the chunk size and we already have content,
    // save the current chunk and start a new one
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap - include the last few sentences from previous chunk
      const sentencesInCurrentChunk = currentChunk.match(/[^.!?]+[.!?]+/g) || [];
      const overlapSentences = sentencesInCurrentChunk.slice(-2).join(" "); // Last 2 sentences
      
      currentChunk = overlapSentences + " " + sentence;
    } else {
      // Add sentence to current chunk
      currentChunk += " " + sentence;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Helper function to strip HTML tags
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Function to verify file type is supported
export function isFileTypeSupported(fileType: string): boolean {
  const supportedTypes = ['pdf', 'txt', 'docx', 'html'];
  return supportedTypes.includes(fileType.toLowerCase());
}

// Function to verify file size is within limits
export function isFileSizeValid(fileSizeKb: number): boolean {
  const maxSizeKb = 50 * 1024; // 50MB in KB
  return fileSizeKb <= maxSizeKb;
}
