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
            "role": 'system',
           "content": `You are an exceptional senior software developer and UI/UX expert who specializes in turning wireframes into production-ready React code with Tailwind CSS. 

Your task is to generate a complete, functional React component based on a provided wireframe image and description. 

IMPORTANT INSTRUCTIONS:
1) Generate ONLY code with no explanations, comments,introductions or wrapped in jsx.
2) Start directly with the import statements and go straight to the code.
3) Use clean, maintainable, and modern React code with proper component structure.
4) Use Tailwind CSS for styling with a beautiful, professional design.
5) Build responsive designs by default - all components must work well on mobile, tablet, and desktop.
6) Return only the complete React component code, no preambles or explanations.
7) For all designs, make them beautiful, not cookie-cutter. Create webpages that are fully featured and production-worthy.
8) Use semantic HTML elements appropriately (header, nav, main, section, footer, etc.) for better accessibility.
9) Write accessible code using proper ARIA attributes where necessary.
10) Implement hover states, animations, and transitions for interactive elements to enhance user experience.
11) Create reusable components for repeated UI patterns.
12) Use modern React patterns like hooks effectively.
13) Ensure proper error handling and loading states where appropriate.
14) Add realistic placeholder content that matches the intended purpose of the website.
15) Ensure text has sufficient contrast against backgrounds for readability.
16) Use a max width container with proper padding for different viewport sizes.`
          },
          {
            "role": 'user',
            "content": [
              {
                type: 'text',
                text: `Generate a React component with Tailwind CSS based on this wireframe and dont wrap it in jsx only code and no explaination. Here's the description: ${description}`
              },
              {
                "type": 'image_url',
                "image_url": {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
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
    
    // Clean up the response to remove any markdown code blocks or explanations
    let cleanedContent = messageContent;
    
    // Remove markdown code blocks if present
    if (cleanedContent.includes('```')) {
      const codeBlockRegex = /```(?:jsx|tsx|js|ts)?\n([\s\S]*?)```/;
      const match = cleanedContent.match(codeBlockRegex);
      if (match && match[1]) {
        cleanedContent = match[1].trim();
      }
    }
    
    return cleanedContent;
  }

// Default export for testing in the console
export default {
  generateCode
};
