const BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterOptions {
  apiKey: string;
}

interface Message {
  role: string;
  content: Array<{
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

interface CompletionOptions {
  model: string;
  messages: Message[];
  stream?: boolean;
}

export class OpenRouter {
  private apiKey: string;
  
  constructor(options: OpenRouterOptions) {
    this.apiKey = options.apiKey;
  }

  async createChatCompletion(options: CompletionOptions) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://design-to-deploy-ai.vercel.app',
        'X-Title': 'Design to Deploy AI'
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: options.stream
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.message || response.statusText}`);
    }

    if (options.stream) {
      return this.handleStreamResponse(response);
    } else {
      return response.json();
    }
  }

  private async *handleStreamResponse(response: Response) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      
      // Split the chunk by lines and parse each line
      const lines = chunk
        .split('\n')
        .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
      
      for (const line of lines) {
        try {
          // Each line starts with "data: " so we need to remove that prefix
          if (line.startsWith('data: ')) {
            const jsonData = JSON.parse(line.slice(6));
            yield jsonData;
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      }
    }
  }
} 