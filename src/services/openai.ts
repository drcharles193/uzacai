
// OpenAI API service with a preset API key for all users

const PRESET_API_KEY = "sk-yourkeyhere"; // Replace with your actual OpenAI API key
const LOCAL_API_KEY_STORAGE_KEY = 'openai_api_key';

// Helper function to check if API key is available
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

// Get the API key - either from local storage or return the preset key
export const getApiKey = (): string => {
  return localStorage.getItem(LOCAL_API_KEY_STORAGE_KEY) || PRESET_API_KEY;
};

// Store API key in local storage (for users who want to use their own)
export const setApiKey = (key: string): void => {
  localStorage.setItem(LOCAL_API_KEY_STORAGE_KEY, key);
  console.log("Saved user-provided API key to local storage");
};

// Remove API key from local storage (revert to preset key)
export const removeApiKey = (): void => {
  localStorage.removeItem(LOCAL_API_KEY_STORAGE_KEY);
  console.log("Removed user-provided API key from local storage");
};

// Generate text using OpenAI directly with the preset or user API key
export const generateText = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  try {
    console.log("Using API key to generate text");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
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
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error?.message || `Error generating text: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim() || "No content generated";
    return generatedText;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

// Generate image using OpenAI (DALL-E) directly with the preset or user API key
export const generateImage = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  try {
    console.log("Using API key to generate image");
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error?.message || `Error generating image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0]?.url || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
