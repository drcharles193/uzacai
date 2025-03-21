// OpenAI API service with support for both Edge Functions and user-provided API keys

const LOCAL_API_KEY_STORAGE_KEY = 'openai_api_key';

// Helper function to check if API key is available
export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

// Get the API key - either from local storage or return empty string
export const getApiKey = (): string => {
  return localStorage.getItem(LOCAL_API_KEY_STORAGE_KEY) || "";
};

// Store API key in local storage
export const setApiKey = (key: string): void => {
  localStorage.setItem(LOCAL_API_KEY_STORAGE_KEY, key);
  console.log("Saved user-provided API key to local storage");
};

// Remove API key from local storage
export const removeApiKey = (): void => {
  localStorage.removeItem(LOCAL_API_KEY_STORAGE_KEY);
  console.log("Removed user-provided API key from local storage");
};

// Generate text using OpenAI - either directly or via Edge Function
export const generateText = async (prompt: string): Promise<string> => {
  const userApiKey = getApiKey();
  
  try {
    // If user has provided an API key, use it directly
    if (userApiKey) {
      console.log("Using user-provided API key to generate text");
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userApiKey}`
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
    } 
    // Otherwise, use edge function
    else {
      console.log("Calling generate-text edge function with prompt:", prompt);
      
      const response = await fetch("https://gvmiaosmypgxrkjwvtbx.supabase.co/functions/v1/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response from edge function:", error);
        throw new Error(error.error || `Error generating text: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received response from generate-text edge function:", data);
      return data.generatedText || "No content generated";
    }
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

// Generate image using OpenAI (DALL-E) - either directly or via Edge Function
export const generateImage = async (prompt: string): Promise<string> => {
  const userApiKey = getApiKey();
  
  try {
    // If user has provided an API key, use it directly
    if (userApiKey) {
      console.log("Using user-provided API key to generate image");
      
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userApiKey}`
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
    } 
    // Otherwise, use edge function
    else {
      console.log("Calling generate-image edge function with prompt:", prompt);
      
      const response = await fetch("https://gvmiaosmypgxrkjwvtbx.supabase.co/functions/v1/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response from edge function:", error);
        throw new Error(error.error || `Error generating image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received response from generate-image edge function:", data);
      return data.imageUrl || "";
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
