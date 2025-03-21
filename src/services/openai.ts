
// OpenAI API service

// We'll use the server-side API instead of client-side keys
const SERVER_API_ENDPOINT_TEXT = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-text`
  : 'http://localhost:54321/functions/v1/generate-text';

const SERVER_API_ENDPOINT_IMAGE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`
  : 'http://localhost:54321/functions/v1/generate-image';

// Generate text using OpenAI through our server-side function
export const generateText = async (prompt: string): Promise<string> => {
  try {
    console.log("Generating text using server-side API");
    
    const response = await fetch(SERVER_API_ENDPOINT_TEXT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error || `Error generating text: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.generatedText || "No content generated";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

// Generate image using OpenAI (DALL-E) through our server-side function
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    console.log("Generating image using server-side API");
    
    const response = await fetch(SERVER_API_ENDPOINT_IMAGE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error || `Error generating image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// These functions remain for backward compatibility but aren't used in main flow
const LOCAL_API_KEY_STORAGE_KEY = 'openai_api_key';

export const hasApiKey = (): boolean => {
  return true; // Always return true since we're using server-side key
};

export const getApiKey = (): string => {
  return localStorage.getItem(LOCAL_API_KEY_STORAGE_KEY) || '';
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(LOCAL_API_KEY_STORAGE_KEY, key);
  console.log("Saved user-provided API key to local storage");
};

export const removeApiKey = (): void => {
  localStorage.removeItem(LOCAL_API_KEY_STORAGE_KEY);
  console.log("Removed user-provided API key from local storage");
};
