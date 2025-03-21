
// OpenAI API service using Supabase Edge Function

// Helper function to check if API key is available (always returns true now, as we're using edge functions)
export const hasApiKey = (): boolean => {
  return true;
};

// Get the API key - not needed anymore as we use edge functions
export const getApiKey = (): string => {
  return ""; // No longer needed as we use edge functions
};

// These functions are kept but will no longer be used in the UI
export const setApiKey = (key: string): void => {
  // No-op as we're using edge functions
  console.log("Using Edge Functions, ignoring user-provided key");
};

export const removeApiKey = (): void => {
  // No-op as we're using edge functions
  console.log("Using Edge Functions, cannot remove");
};

// Generate text using OpenAI via Supabase Edge Function
export const generateText = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch("https://gvmiaosmypgxrkjwvtbx.supabase.co/functions/v1/generate-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error generating text");
    }

    const data = await response.json();
    return data.generatedText || "No content generated";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

// Generate image using OpenAI (DALL-E) via Supabase Edge Function
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch("https://gvmiaosmypgxrkjwvtbx.supabase.co/functions/v1/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error generating image");
    }

    const data = await response.json();
    return data.imageUrl || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
