import { WidgetConfig } from "@shared/schema";

// Function to query DeepSeek API (or simulate responses for demo)
export async function queryDeepSeek(
  userQuery: string,
  contextChunks: string[],
  config: WidgetConfig
): Promise<string> {
  // In a real implementation, this would call the DeepSeek API
  // For demo purposes, we're simulating a response based on the context

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

  // In a real implementation, you would call the DeepSeek API here with the prompt
  // const deepSeekResponse = await callDeepSeekAPI(prompt, config);

  // For demo, generate a simulated response
  let response;

  if (contextChunks.length > 0) {
    // Extract key phrases from the context to make the response seem more informed
    const contextSample = contextChunks[0].substring(0, 150);
    const keywords = extractKeywords(contextSample);

    // Create a response that appears to be based on the context
    if (userQuery.toLowerCase().includes("how") || userQuery.toLowerCase().includes("what")) {
      response = `Based on our knowledge base, ${keywords.join(", ")} are key elements to consider. ${contextChunks[0].split('.')[0]}.`;
    } else if (userQuery.toLowerCase().includes("why")) {
      response = `The reason involves ${keywords.join(" and ")}. According to our information, ${contextChunks[0].split('.')[0]}.`;
    } else {
      response = `I found information about ${keywords[0] || "your topic"} in our knowledge base. ${contextChunks[0].split('.')[0]}.`;
    }

    // Add a second point from another context chunk if available
    if (contextChunks.length > 1) {
      response += ` Additionally, ${contextChunks[1].split('.')[0]}.`;
    }
  } else {
    // Generic responses when no context is available
    const genericResponses = [
      "I don't have specific information about that in our knowledge base. Could you provide more details or ask something else?",
      "I couldn't find detailed information about that in our current documents. Would you like to know about something else?",
      "That's beyond the scope of our current knowledge base. Can I assist you with something else?",
      "Unfortunately, our documents don't contain information to answer that question accurately. Could you try rephrasing or asking about another topic?"
    ];

    response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  // Adjust response length based on config
  if (config.responseLength <= 2) {
    // Shorter response
    response = response.split('.')[0] + '.';
  } else if (config.responseLength >= 4) {
    // Longer, more detailed response
    if (contextChunks.length > 2) {
      response += ` Furthermore, ${contextChunks[2].split('.')[0]}.`;
    }
    response += "\n\nIs there anything else you'd like to know about this topic?";
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return response;
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