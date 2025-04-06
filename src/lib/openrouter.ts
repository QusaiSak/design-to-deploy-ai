import { ENV } from './env';

// Use our ENV utility instead of directly accessing import.meta.env
const OPENROUTER_API_KEY = ENV.OPENROUTER_API_KEY;
const CLAUDE_API_KEY = ENV.CLAUDE_API_KEY;

// Debug function to check environment variables
export function debugEnvVars() {
  console.log('Environment Variables Check:');
  console.log('OPENROUTER_API_KEY exists:', !!OPENROUTER_API_KEY);
  console.log('CLAUDE_API_KEY exists:', !!CLAUDE_API_KEY);
  
  // Only log the first few characters if it exists for security
  if (OPENROUTER_API_KEY) {
    console.log('OpenRouter key starts with:', OPENROUTER_API_KEY.substring(0, 10) + '...');
  } else {
    console.error('OpenRouter API key is missing or empty!');
    console.log('Please make sure the VITE_OPENROUTER_API_KEY is correctly set in your .env file');
  }
  
  if (CLAUDE_API_KEY) {
    console.log('Claude key starts with:', CLAUDE_API_KEY.substring(0, 10) + '...');
  } else {
    console.warn('Claude API key is missing or empty!'); 
    console.log('Set VITE_CLAUDE_API_KEY in your .env file if you want to use Claude directly');
  }
}

// Constants for API configuration
export const API_CONFIG = {
  CLAUDE_MODELS: {
    CLAUDE_3_5_SONNET: 'claude-3-5-sonnet-20241022',
    CLAUDE_3_OPUS: 'claude-3-opus-20240229',
    CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
    CLAUDE_3_HAIKU: 'claude-3-haiku-20240307'
  },
  OPENROUTER_MODELS: {
    GOOGLE_GEMINI_PRO: 'google/gemini-pro',
    META_LLAMA_3: 'meta-llama/llama-3-70b-instruct',
    ANTHROPIC_CLAUDE_3_5: 'anthropic/claude-3-5-sonnet',
    ANTHROPIC_CLAUDE_3_OPUS: 'anthropic/claude-3-opus'
  },
  MAX_TOKENS: {
    DEFAULT: 4096,
    EXTENDED: 8000
  }
};

// Always call this on module load
debugEnvVars();

// Event emitter for streaming code updates
type CodeUpdateListener = (code: string) => void;
const codeUpdateListeners: CodeUpdateListener[] = [];

export function onCodeUpdate(listener: CodeUpdateListener) {
  codeUpdateListeners.push(listener);
  // Return a function to remove the listener
  return () => {
    const index = codeUpdateListeners.indexOf(listener);
    if (index !== -1) {
      codeUpdateListeners.splice(index, 1);
    }
  };
}

function emitCodeUpdate(code: string) {
  for (const listener of codeUpdateListeners) {
    listener(code);
  }
}

// Claude API Service
export const claudeApiService = {
  async generateWithTemplate(prompt: string): Promise<{ prompts: string[], uiPrompts: string[] }> {
    try {
      if (!CLAUDE_API_KEY) {
        throw new Error('Claude API key is missing. Please set VITE_CLAUDE_API_KEY in your .env file.');
      }
      
      // Base prompts for React and Node
      const reactBasePrompt = `<boltArtifact id="project-import" title="Project Files"><boltAction type="file" filePath="eslint.config.js">import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
</boltAction></boltArtifact>`;

      const nodeBasePrompt = '<boltArtifact id="project-import" title="Project Files"><boltAction type="file" filePath="index.js">// run `node index.js` in the terminal\n\nconsole.log(`Hello Node.js v${process.versions.node}!`);\n</boltAction><boltAction type="file" filePath="package.json">{\n  "name": "node-starter",\n  "private": true,\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  }\n}\n</boltAction></boltArtifact>';
      
      const basePrompt = "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n\n";
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: API_CONFIG.CLAUDE_MODELS.CLAUDE_3_5_SONNET,
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }],
          system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.content[0].text.trim().toLowerCase();
      
      if (answer === 'react') {
        return {
          prompts: [basePrompt, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [reactBasePrompt]
        };
      } else if (answer === 'node') {
        return {
          prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [nodeBasePrompt]
        };
      } else {
        throw new Error(`Unexpected response from Claude: ${answer}`);
      }
    } catch (error) {
      console.error('Claude API template error:', error);
      throw error;
    }
  },
  
  async chat(messages: any[]): Promise<string> {
    try {
      if (!CLAUDE_API_KEY) {
        throw new Error('Claude API key is missing. Please set VITE_CLAUDE_API_KEY in your .env file.');
      }
      
      // Define system prompt
      const systemPrompt = `
You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

You operate in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser.

Use best coding practices. When writing code:
- Use 2 spaces for code indentation
- Split functionality into smaller modules instead of putting everything in a single gigantic file
- Keep files as small as possible, extracting related functionalities into separate modules
- Files should be clean, readable, and maintainable
`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: API_CONFIG.CLAUDE_MODELS.CLAUDE_3_5_SONNET,
          max_tokens: API_CONFIG.MAX_TOKENS.EXTENDED,
          messages: messages,
          system: systemPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API chat error:', error);
      throw error;
    }
  }
};

// Helper to process and clean generated code
function processGeneratedCode(code: string): string {
  // Remove markdown code blocks
  code = code.replace(/```(jsx|javascript|js|react|tsx|typescript|html)?|```/g, '');
  
  // Remove import statements
  code = code.replace(/import\s+.*?from\s+['"].*?['"];?/g, '// Import removed');
  code = code.replace(/import\s+{.*?}\s+from\s+['"].*?['"];?/g, '// Import removed');
  
  // Remove export statements but keep the component definition
  code = code.replace(/export\s+default\s+/g, '');
  code = code.replace(/export\s+/g, '');
  
  // Make sure we have an App component
  if (!code.includes('function App') && !code.includes('const App =')) {
    const functionMatch = code.match(/function\s+([A-Z]\w+)/);
    if (functionMatch) {
      const name = functionMatch[1];
      code = code.replace(new RegExp(`function\\s+${name}`, 'g'), 'function App');
    }
  }
  
  // Fix hooks that might be using destructuring
  const hookPattern = /const\s+\[\s*(\w+)\s*,\s*set(\w+)\s*\]\s*=\s*useState/g;
  code = code.replace(hookPattern, (match, stateName, setterName) => {
    return `const [${stateName}, set${setterName}] = React.useState`;
  });
  
  return code.trim();
}

export async function generateCode(
  model: string | undefined,
  image: string,
  description: string
): Promise<string> {
  // Track retry attempts
  let retryCount = 0;
  const maxRetries = 3;
  const fallbackModels = [
    "google/gemini-2.5-pro-exp-03-25:free",
    "meta-llama/llama-3-70b-instruct"
  ];
  
  // Try selected model first, then fallbacks if needed
  let currentModel = model || fallbackModels[0];
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Generating code with model: ${currentModel}`);
      
      const messages = [
        {
          role: "user", 
          content: [
            { type: "text", text: `Create a professional website based on this wireframe. 

Include:
- Good colors and design
- Responsive layout
- Similar structure to the wireframe

Description: ${description}

IMPORTANT: Name your component "App" and use React.useState instead of {useState}` },
            { type: "image_url", image_url: { url: image } }
          ]
        }
      ];
      
      // API request configuration
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": getSafeOrigin(),
          "X-Title": "Design-to-Deploy"
        },
        body: JSON.stringify({
          model: currentModel,
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7
        })
      };
      
      // Make the API request
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOptions);
      
      // Get the response text
      const responseText = await response.text();
      console.log('Raw API response status:', response.status);
      console.log('Raw API response sample:', responseText.substring(0, 100));
      
      // Handle HTTP errors first
      if (!response.ok) {
        console.error('HTTP error:', response.status, responseText);
        
        // Handle specific HTTP errors
        if (response.status === 429) {
          // Rate limit exceeded, retry with backoff or try fallback model
          console.warn('Rate limit exceeded. Retrying with backoff or fallback model...');
          
          retryCount++;
          
          if (retryCount <= maxRetries) {
            // Try a fallback model if available
            const fallbackIndex = retryCount % fallbackModels.length;
            const newModel = fallbackModels[fallbackIndex];
            
            if (newModel !== currentModel) {
              console.log(`Switching to fallback model: ${newModel}`);
              currentModel = newModel;
              
              // No delay needed when switching models
              continue;
            }
            
            // Exponential backoff when retrying the same model
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Retrying same model in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error('Rate limit exceeded. Maximum retries reached.');
        } else if (response.status === 400) {
          throw new Error('Bad request to API. The image may be too large or in an unsupported format.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication error. Please check your API key.');
        }
        
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse API response as JSON:', e);
        
        // If we can't parse as JSON but have text, try to extract code directly
        if (responseText.includes('function App') || responseText.includes('const App')) {
          console.log('Found App component in raw text response, attempting to extract...');
          return processGeneratedCode(responseText);
        }
        
        throw new Error('Invalid API response: not valid JSON');
      }
      
      // Check if the response contains an error object
      if (data.error) {
        console.error('API returned an error:', data.error);
        throw new Error(data.error.message || 'API returned an error');
      }
      
      console.log('API response data keys:', Object.keys(data).join(', '));
      
      // Extract the generated code from the response
      const message = data.choices?.[0]?.message;
      if (!message) {
        throw new Error('Invalid response format from OpenRouter API');
      }
      
      const content = message.content;
      if (!content) {
        throw new Error('No content in API response');
      }
      
      // Process the generated code to clean it up
      return processGeneratedCode(content);
      
    } catch (error) {
      console.error('Error generating code:', error);
      
      retryCount++;
      
      // If we've exhausted all retries, throw the error
      if (retryCount > maxRetries) {
        // If all models failed, throw the last error
        throw error;
      }
      
      // Try a different model if possible
      const fallbackIndex = retryCount % fallbackModels.length;
      currentModel = fallbackModels[fallbackIndex];
      console.log(`Switching to fallback model: ${currentModel}`);
    }
  }
  
  throw new Error('Failed to generate code after multiple attempts');
}

// Safely get origin for HTTP-Referer header
function getSafeOrigin(): string {
  try {
    return window.location.origin;
  } catch (e) {
    console.warn('Could not access window.location.origin, using default origin');
    return 'https://wireframe-ai.app'; // Fallback origin
  }
}
