
/**
 * API service for backend requests
 * This service handles communication with the backend API
 */

// Content generation endpoints
const API_BASE_URL = '/api'; // Replace with your actual backend URL

// Function to generate text content
export const generateTextContent = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate text content');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

// Function to generate image content
export const generateImageContent = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate image content');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};
