
// OpenAI API service with fixed API key

const OPENAI_API_URL = "https://api.openai.com/v1";

// Your fixed API key - DO NOT share this code publicly
const FIXED_API_KEY = "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";

// Helper function to check if API key is available
export const hasApiKey = (): boolean => {
  return !!FIXED_API_KEY;
};

// Get the API key - now returns your fixed key
export const getApiKey = (): string => {
  return FIXED_API_KEY;
};

// These functions are kept but will no longer be used in the UI
export const setApiKey = (key: string): void => {
  // No-op as we're using a fixed key
  console.log("Using fixed API key, ignoring user-provided key");
};

export const removeApiKey = (): void => {
  // No-op as we're using a fixed key
  console.log("Using fixed API key, cannot remove");
};

// Generate text using OpenAI
export const generateText = async (prompt: string): Promise<string> => {
  if (!FIXED_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIXED_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a social media content assistant. Create engaging, professional content for social media posts. Keep responses concise and ready to use." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Error generating text");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "No content generated";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

// Generate image using OpenAI (DALL-E)
export const generateImage = async (prompt: string): Promise<string> => {
  if (!FIXED_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIXED_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Error generating image");
    }

    const data = await response.json();
    return data.data[0]?.url || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
