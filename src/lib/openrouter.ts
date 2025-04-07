
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

interface GenerateCodeOptions {
  onChunk?: (chunk: string) => void;
}

// Generate code based on an image and description
export const generateCode = async (
  model: string,
  image: string,
  description: string,
  options?: GenerateCodeOptions
): Promise<string> => {
  if (!ENV.OPENROUTER_API_KEY) {
    throw new Error('No auth credentials found');
  }

  try {
    // Handle direct streaming
    if (options?.onChunk) {
      return await streamResponse(model, image, description, options.onChunk);
    }

    // Regular request if no streaming
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
            content: 'You are an expert web developer who specializes in turning wireframes into React code with Tailwind CSS. Your task is to generate a complete, functional React component based on a provided wireframe image and description. Focus on creating clean, maintainable code with proper component structure. Use Tailwind CSS for styling.'
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
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};

// Stream response for real-time updates
const streamResponse = async (
  model: string,
  image: string,
  description: string,
  onChunk: (chunk: string) => void
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
            content: 'You are an expert web developer who specializes in turning wireframes into React code with Tailwind CSS. Your task is to generate a complete, functional React component based on a provided wireframe image and description. Focus on creating clean, maintainable code with proper component structure. Use Tailwind CSS for styling.'
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
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorData}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get reader from response');

    let completeResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              completeResponse += content;
              onChunk(content);
            }
          } catch (e) {
            console.warn('Error parsing chunk:', e);
          }
        }
      }
    }

    return completeResponse;
  } catch (error) {
    console.error('Error streaming response:', error);
    throw error;
  }
};

// This function can be used to handle code updates in real-time
export const onCodeUpdate = (callback: (code: string) => void) => {
  return (chunk: string) => {
    callback(chunk);
  };
};

// Debug environment variables - useful for troubleshooting
export const debugEnvVars = () => {
  return {
    apiKey: ENV.OPENROUTER_API_KEY ? 'Configured' : 'Missing',
    apiUrl: OPENROUTER_API_URL,
    referer: OPENROUTER_REFERER,
    origin: getSafeOrigin()
  };
};

// Default export for testing in the console
export default {
  generateCode,
  onCodeUpdate,
  debugEnvVars
};
