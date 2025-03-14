
// OpenAI API service

const OPENAI_API_KEY = ""; // Your OpenAI API key goes here
const OPENAI_API_URL = "https://api.openai.com/v1";

// Helper function to check if API key is available
export const hasApiKey = (): boolean => {
  return !!OPENAI_API_KEY;
};

// Generate text using OpenAI
export const generateText = async (prompt: string): Promise<string> => {
  if (!hasApiKey()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
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
  if (!hasApiKey()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
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
