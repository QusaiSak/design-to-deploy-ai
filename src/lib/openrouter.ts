import { ENV, OPENROUTER_API_URL, OPENROUTER_REFERER } from './env';

// Base prompts for different project types
const BASE_PROMPT = "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n\n";

// React template base prompt
const REACT_BASE_PROMPT = `<boltArtifact id="project-import" title="Project Files"><boltAction type="file" filePath="eslint.config.js">import js from '@eslint/js';
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
</boltAction><boltAction type="file" filePath="index.html"><!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
</boltAction><boltAction type="file" filePath="package.json">{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}</boltAction><boltAction type="file" filePath="postcss.config.js">export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};</boltAction><boltAction type="file" filePath="tailwind.config.js">/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};</boltAction><boltAction type="file" filePath="tsconfig.app.json">{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}</boltAction><boltAction type="file" filePath="tsconfig.json">{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}</boltAction><boltAction type="file" filePath="tsconfig.node.json">{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}</boltAction><boltAction type="file" filePath="vite.config.ts">import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});</boltAction><boltAction type="file" filePath="src/App.tsx">import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p>Start prompting (or editing) to see magic happen :)</p>
    </div>
  );
}

export default App;</boltAction><boltAction type="file" filePath="src/index.css">@tailwind base;
@tailwind components;
@tailwind utilities;</boltAction><boltAction type="file" filePath="src/main.tsx">import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);</boltAction><boltAction type="file" filePath="src/vite-env.d.ts">/// <reference types="vite/client" />
</boltAction></boltArtifact>`;

// Node.js template base prompt
const NODE_BASE_PROMPT = `<boltArtifact id="project-import" title="Project Files"><boltAction type="file" filePath="index.js">// run \`node index.js\` in the terminal

console.log(\`Hello Node.js v\${process.versions.node}!\`);
</boltAction><boltAction type="file" filePath="package.json">{
  "name": "node-starter",
  "private": true,
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  }
}
</boltAction></boltArtifact>`;

// Type definitions for OpenRouter API requests and responses
interface OpenRouterCompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{type: string, [key: string]: any}>;
  }>;
  model: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface OpenRouterCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

// Debug function to check environment variables
export function debugEnvVars() {
  console.log('Checking environment variables...');
  const apiKey = ENV.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('ERROR: OPENROUTER_API_KEY is not set in environment variables');
    return false;
  }
  
  if (apiKey.startsWith('sk-') && apiKey.length > 20) {
    console.log('✅ OPENROUTER_API_KEY appears to be properly configured');
  } else {
    console.warn('⚠️ OPENROUTER_API_KEY does not have the expected format (should start with sk-)');
  }
  
  console.log('API URL:', OPENROUTER_API_URL || 'Using default: https://openrouter.ai/api/v1');
  console.log('Referer:', OPENROUTER_REFERER || 'Not configured');
  
  return true;
}

// Constants for API configuration
export const API_CONFIG = {
  OPENROUTER_MODELS: {
    DEEPSEEK: 'deepseek/deepseek-chat-v3-0324:free',
    META_LLAMA_3: 'meta-llama/llama-3-70b-instruct:free',
    GOOGLE_GEMINI_PRO_VISION: 'google/gemini-2.5-pro-exp-03-25:free'
  },
  MAX_TOKENS: {
    DEFAULT: 4096,
    EXTENDED: 8000
  }
};

// Helper to process and clean generated code
export function processGeneratedCode(code: string): string {
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

// Get CORS-safe origin for API requests
function getSafeOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return OPENROUTER_REFERER || 'https://example.com';
}

// Generate code from an image and description
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
    "meta-llama/llama-3-70b-instruct:free",
    "anthropic/claude-3-haiku:free"
  ];
  
  // Try selected model first, then fallbacks if needed
  let currentModel = model || fallbackModels[0];
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Generating code with model: ${currentModel}`);
      
      // Check API key before proceeding
      const apiKey = ENV.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenRouter API key is not configured');
      }
      
      // Prepare headers with proper CORS settings
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": getSafeOrigin(),
        "X-Title": "Design-to-Deploy",
        "Origin": getSafeOrigin()
      };
      
      // Construct messages with proper format for image
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
        headers,
        body: JSON.stringify({
          model: currentModel,
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7
        }),
        mode: 'cors' as RequestMode
      };
      
      // Determine API endpoint, using the direct endpoint for reliability
      const apiEndpoint = "https://openrouter.ai/api/v1/chat/completions";
      console.log(`Using API endpoint: ${apiEndpoint}`);
      
      // Make the API request
      const response = await fetch(apiEndpoint, requestOptions);
      
      // Get the response text
      const responseText = await response.text();
      console.log('Raw API response status:', response.status);
      console.log('Raw API response sample:', responseText.substring(0, 100));
      
      // Handle HTTP errors first
      if (!response.ok) {
        console.error('HTTP error:', response.status, responseText);
        
        // Handle HTML responses (typically indicate CORS or network issues)
        if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
          console.error('Received HTML response instead of JSON. This indicates a CORS or network issue.');
          
          if (responseText.includes('login') || responseText.includes('auth')) {
            throw new Error('Authentication error: Redirected to login page. Check API key.');
          }
          
          throw new Error(`API returned HTML instead of JSON (status: ${response.status}). Trying fallback model.`);
        }
        
        // Handle specific HTTP errors
        if (response.status === 429) {
          // Rate limit exceeded, retry with backoff or try fallback model
          console.warn('Rate limit exceeded. Retrying with backoff or fallback model...');
          throw new Error('Rate limit exceeded. Trying fallback model.');
        } else if (response.status === 400) {
          throw new Error('Bad request to API. The image may be too large or in an unsupported format.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication error. Please check your API key.');
        }
        
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Check for HTML response even if status is 200
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        console.error('Received HTML response with 200 status. This indicates a network/CORS issue or redirect.');
        throw new Error('API returned HTML instead of JSON. Trying fallback model.');
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
      
    } catch (error: any) {
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
  
  // If we've gone through all retries without success or error
  throw new Error('Failed to generate code after maximum retry attempts');
}

/**
 * Generate chat completion using OpenRouter API
 * @param messages Array of messages
 * @param model The model to use
 * @returns Promise with the completion response
 */
export const generateChatCompletion = async (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: string = 'google/gemini-2.5-pro-exp-03-25:free'
): Promise<string> => {
  try {
    const apiKey = ENV.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    // Add system prompt as the first message if not present
    if (!messages.some(msg => msg.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: "You are a helpful AI assistant."
      });
    }

    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': OPENROUTER_REFERER,
        'X-Title': 'Design-to-Deploy'
      },
      body: JSON.stringify({
        messages,
        model,
        max_tokens: 8000,
        temperature: 0.7,
      } as OpenRouterCompletionRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data: OpenRouterCompletionResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
};