
// OpenAI API service that uses localStorage for secure key storage

const OPENAI_API_URL = "https://api.openai.com/v1";
const API_KEY_STORAGE_KEY = "openai_api_key";

// Helper function to check if API key is available
export const hasApiKey = (): boolean => {
  return !!localStorage.getItem(API_KEY_STORAGE_KEY);
};

// Get the API key from localStorage
export const getApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
};

// Set the API key in localStorage
export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

// Remove the API key from localStorage
export const removeApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

// Generate text using OpenAI
export const generateText = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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
