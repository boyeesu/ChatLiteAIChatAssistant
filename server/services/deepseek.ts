
import { WidgetConfig } from "@shared/schema";
import axios from "axios";

// Initialize DeepSeek client
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.HUGGING_FACE_TOKEN || ""; // Try dedicated key first, fall back to HF token
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Function to query DeepSeek API
export async function queryDeepSeek(
  userQuery: string,
  contextChunks: string[],
  config: WidgetConfig
): Promise<string> {
  try {
    // Skip API call if no token is provided (for development)
    if (!DEEPSEEK_API_KEY) {
      console.warn("No DeepSeek API key provided. Using simulated response.");
      return simulateResponse(userQuery, contextChunks, config);
    }

    // Formulate a prompt that incorporates retrieved context
    let systemMessage = "";
    
    if (contextChunks.length > 0) {
      systemMessage = `You are an AI assistant powered by DeepSeek. Your task is to provide helpful, accurate responses based on the context provided.
Use the following context information to answer the user's query.
If the context doesn't contain relevant information, acknowledge that and provide a general response.

RELEVANT CONTEXT:
${contextChunks.join('\n\n---\n\n')}`;
    } else {
      systemMessage = `You are an AI assistant powered by DeepSeek. Your task is to provide helpful, accurate responses based on your knowledge.
If you don't know the answer to a question, acknowledge that and provide a general response.`;
    }

    // Call DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: config.responseLength <= 2 ? 100 : config.responseLength >= 4 ? 300 : 200,
        top_p: 0.9
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    // Extract the response content
    const result = response.data.choices[0].message.content || 
      "I apologize, but I couldn't generate a response. Please try asking your question differently.";

    return result.trim();
  } catch (error) {
    console.error("Error generating response with DeepSeek API:", error);
    return simulateResponse(userQuery, contextChunks, config);
  }
}

// Fallback function for when API calls fail or during development
function simulateResponse(
  userQuery: string,
  contextChunks: string[],
  config: WidgetConfig
): string {
  console.log("Using fallback response generator with context chunks:", 
              contextChunks.length > 0 ? contextChunks.length : "none");
  
  // If we have context chunks, use them directly in the response
  if (contextChunks.length > 0) {
    // Join the first 2-3 most relevant chunks
    const relevantInfo = contextChunks.slice(0, 3).join("\n\n");
    
    return `Based on the information in our knowledge base:\n\n${relevantInfo}\n\nThis is the most relevant information I could find for your query. The DeepSeek AI model is currently unavailable, so I'm showing you the raw context chunks instead of a synthesized answer.`;
  } else {
    return "I couldn't find specific information about that in our knowledge base. Please try adding some text or documents to the knowledge base first, then ask again. (Note: The DeepSeek AI model is currently unavailable, so responses are using a fallback method.)";
  }
}

// Helper function to extract potential keywords from text
function extractKeywords(text: string): string[] {
  // A simple implementation - in reality would use NLP techniques
  const words = text.split(' ');
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];

  // Filter out common words and short words, keep only potential keywords
  return words
    .filter(word => 
      word.length > 4 && 
      !stopWords.includes(word.toLowerCase()) &&
      /^[a-zA-Z]+$/.test(word) // only alphabetic words
    )
    .slice(0, 3) // Take just a few keywords
    .map(word => word.replace(/[^a-zA-Z]/g, '')); // Clean up any remaining punctuation
}
