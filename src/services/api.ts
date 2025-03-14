
/**
 * API service for OpenAI requests
 * This service handles communication with OpenAI API
 */

// OpenAI API endpoint
const OPENAI_API_URL = "https://api.openai.com/v1";

// Fixed OpenAI API key - Replace this with your actual API key
const OPENAI_API_KEY = "your-openai-api-key-here";

// Function to generate text content using OpenAI
export const generateTextContent = async (prompt: string): Promise<string> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "your-openai-api-key-here") {
    throw new Error('Please replace the placeholder API key in the api.ts file with your actual OpenAI API key.');
  }
  
  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a supported model
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates engaging social media content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate text content');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

// Function to generate image content using OpenAI
export const generateImageContent = async (prompt: string): Promise<string> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "your-openai-api-key-here") {
    throw new Error('Please replace the placeholder API key in the api.ts file with your actual OpenAI API key.');
  }
  
  try {
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate image content');
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

// These functions are no longer needed since we're using a fixed API key
export const isAPIKeySet = (): boolean => true;
export const setAPIKey = (key: string): void => {}; 
export const clearAPIKey = (): void => {};
