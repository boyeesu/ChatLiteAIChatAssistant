
import { WidgetConfig } from "@shared/schema";
import { HfInference } from "@huggingface/inference";

// Initialize Hugging Face client
// For production use, this should be stored in an environment variable
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN || ""; // Set this through Secrets
const inference = new HfInference(HF_TOKEN);
const MODEL_ID = "deepseek-ai/DeepSeek-V3-Base";

// Function to query DeepSeek API via Hugging Face
export async function queryDeepSeek(
  userQuery: string,
  contextChunks: string[],
  config: WidgetConfig
): Promise<string> {
  try {
    // Skip API call if no token is provided (for development)
    if (!HF_TOKEN) {
      console.warn("No Hugging Face token provided. Using simulated response.");
      return simulateResponse(userQuery, contextChunks, config);
    }

    // Formulate a prompt that incorporates retrieved context
    let prompt = "";

    if (contextChunks.length > 0) {
      prompt = `
I need to answer the following user query using the provided context information:

USER QUERY: ${userQuery}

RELEVANT CONTEXT:
${contextChunks.join('\n\n---\n\n')}

Based on the above context information, provide a comprehensive and helpful response to the user's query.
If the context doesn't contain relevant information to answer the query, acknowledge that and provide a general response.
`;
    } else {
      prompt = `
I need to answer the following user query:

USER QUERY: ${userQuery}

I don't have specific context from our knowledge base for this query, but please provide a helpful general response.
`;
    }

    // Call DeepSeek via Hugging Face
    const response = await inference.textGeneration({
      model: MODEL_ID,
      inputs: prompt,
      parameters: {
        max_new_tokens: config.responseLength <= 2 ? 100 : config.responseLength >= 4 ? 300 : 200,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
      }
    });

    let result = response.generated_text || 
      "I apologize, but I couldn't generate a response. Please try asking your question differently.";

    // Clean up the response if needed
    if (result.includes("USER QUERY:") || result.includes("RELEVANT CONTEXT:")) {
      // Extract only the answer part if the model repeats the prompt
      result = result.split("Based on the above context information,").pop() || result;
      result = result.split("USER QUERY:").shift() || result;
    }

    return result.trim();
  } catch (error) {
    console.error("Error generating response:", error);
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
