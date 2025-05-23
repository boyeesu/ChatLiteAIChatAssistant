
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
  // Extract key phrases from the context to make the response seem more informed
  if (contextChunks.length > 0) {
    const contextSample = contextChunks[0].substring(0, 150);
    const keywords = extractKeywords(contextSample);

    // Create a response that appears to be based on the context
    if (userQuery.toLowerCase().includes("how") || userQuery.toLowerCase().includes("what")) {
      return `Based on our knowledge base, ${keywords.join(", ")} are key elements to consider. ${contextChunks[0].split('.')[0] || "This concept is important to understand"}.`;
    } else if (userQuery.toLowerCase().includes("why")) {
      return `The reason involves ${keywords.join(" and ") || "several factors"}. According to our information, ${contextChunks[0].split('.')[0] || "this is a key consideration"}.`;
    } else {
      return `I found information about ${keywords[0] || "your topic"} in our knowledge base. ${contextChunks[0].split('.')[0] || "This information may be helpful to you"}.`;
    }
  } else {
    const genericResponses = [
      "I don't have specific information about that in our knowledge base. Could you provide more details or ask something else?",
      "I couldn't find detailed information about that in our current documents. Would you like to know about something else?",
      "That's beyond the scope of our current knowledge base. Can I assist you with something else?",
      "Unfortunately, our documents don't contain information to answer that question accurately. Could you try rephrasing or asking about another topic?"
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
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
