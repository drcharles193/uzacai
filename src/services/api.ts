
/**
 * API service for OpenAI requests
 * This service handles communication with OpenAI API
 */

// OpenAI API endpoint
const OPENAI_API_URL = "https://api.openai.com/v1";

// Function to get the OpenAI API key from local storage
const getOpenAIApiKey = (): string | null => {
  return localStorage.getItem('openai_api_key');
};

// Function to save the OpenAI API key to local storage
export const saveOpenAIApiKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
};

// Function to generate text content using OpenAI
export const generateTextContent = async (prompt: string): Promise<string> => {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required. Please add your API key in the settings.");
  }
  
  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API key is required. Please add your API key in the settings.");
  }
  
  try {
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
