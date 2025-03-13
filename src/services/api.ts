
/**
 * API service for OpenAI requests
 * This service handles communication with OpenAI API
 */

// OpenAI API endpoint
const OPENAI_API_URL = "https://api.openai.com/v1";

// Your OpenAI API key - replace with your actual API key
const OPENAI_API_KEY = "sk-your-openai-api-key-here";

// Function to generate text content using OpenAI
export const generateTextContent = async (prompt: string): Promise<string> => {
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
