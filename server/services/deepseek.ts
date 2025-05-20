import { WidgetConfig } from "@shared/schema";

// Define response type from DeepSeek API
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Helper function to construct prompts based on AI tone and response length
export function constructPrompt(
  query: string,
  context: string[],
  config: WidgetConfig
): string {
  // Define tone modifiers based on the selected AI tone
  const toneModifiers: Record<string, string> = {
    professional: "in a professional, business-like manner",
    friendly: "in a friendly, conversational tone",
    technical: "with detailed technical information",
    casual: "in a casual, relaxed way",
    formal: "in a formal, respectful manner",
  };

  // Define response length modifiers
  const lengthModifiers: Record<number, string> = {
    1: "Answer concisely with minimal details.",
    2: "Provide a brief answer with important details.",
    3: "Give a balanced answer with relevant details.",
    4: "Provide a comprehensive answer with examples.",
    5: "Give a thorough, detailed answer with examples and explanations.",
  };

  // Get the appropriate modifiers based on config
  const toneModifier = toneModifiers[config.aiTone] || toneModifiers.professional;
  const lengthModifier = lengthModifiers[config.responseLength] || lengthModifiers[3];

  // Construct the system prompt with context, tone, and length instructions
  let systemPrompt = `You are a helpful AI assistant ${toneModifier}. ${lengthModifier} `;
  
  // Add context information if available
  if (context.length > 0) {
    systemPrompt += `\n\nHere is some relevant information that may help answer the query:\n`;
    context.forEach((piece, index) => {
      systemPrompt += `\nContext ${index + 1}:\n${piece}\n`;
    });
    systemPrompt += `\nUse the above information to answer the query. If the information doesn't contain the answer, say so and provide a general response.`;
  }

  return systemPrompt;
}

// Function to query the DeepSeek API
export async function queryDeepSeek(
  query: string,
  context: string[],
  config: WidgetConfig
): Promise<string> {
  // Get API key from environment variables with fallback
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY || "";
  
  if (!apiKey) {
    throw new Error("DeepSeek API key not found in environment variables");
  }

  // Construct the prompt based on configuration
  const systemPrompt = constructPrompt(query, context, config);

  try {
    // API endpoint
    const endpoint = "https://api.deepseek.com/v1/chat/completions";

    // Request headers
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    // Request body
    const body = {
      model: "deepseek-chat", // or the specific model you want to use
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    };

    // Make the API request
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    // Parse the response
    const data: DeepSeekResponse = await response.json();
    
    // Extract and return the AI's response
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error querying DeepSeek API:", error);
    throw new Error(`Failed to get response from DeepSeek: ${error instanceof Error ? error.message : String(error)}`);
  }
}
