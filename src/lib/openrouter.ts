
import { ENV, OPENROUTER_API_URL, OPENROUTER_REFERER, getSafeOrigin } from './env';

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  created: number;
  model: string;
  object: string;
}

// Generate code based on an image and description
export const generateCode = async (
  model: string,
  image: string,
  description: string
): Promise<string> => {
  if (!ENV.OPENROUTER_API_KEY) {
    throw new Error('No auth credentials found');
  }

  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_REFERER,
        'X-Title': 'Lovable Code Generator',
        'Origin': getSafeOrigin()
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert web developer who specializes in turning wireframes into React code with Tailwind CSS. Your task is to generate a complete, functional React component based on a provided wireframe image and description. Focus on creating clean, maintainable code with proper component structure. Use Tailwind CSS for styling with a blue and white theme.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Generate a React component with Tailwind CSS based on this wireframe. Here's the description: ${description}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json() as OpenRouterResponse;
    
    // Check if choices array is defined and has at least one item
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response content was generated');
    }
    
    // Safely access the message content
    const messageContent = data.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error('Generated content is empty');
    }
    
    return messageContent;
  } catch (error) {
    // Re-throw any errors to be handled by the caller
    throw error;
  }
};

// Default export for testing in the console
export default {
  generateCode
};
