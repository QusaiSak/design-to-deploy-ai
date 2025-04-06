
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
    content: string;
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

/**
 * Determine project type based on prompt
 * @param prompt The user prompt
 * @returns Promise resolving to "react" or "node"
 */
export const determineProjectType = async (prompt: string): Promise<'react' | 'node'> => {
  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_REFERER,
        'X-Title': 'Lovable'
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: prompt
        }],
        model: 'google/gemini-2.5-pro-exp-03-25:free',
        max_tokens: 200,
        temperature: 0.2,
      } as OpenRouterCompletionRequest)
    });

    if (!response.ok) {
      console.error('Failed to determine project type:', await response.text());
      return 'react'; // Default to React if we can't determine
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.toLowerCase().trim();
    
    if (answer.includes('node')) {
      return 'node';
    }
    
    // Default to React
    return 'react';
  } catch (error) {
    console.error('Error determining project type:', error);
    return 'react'; // Default to React
  }
};

/**
 * Get template based on project type
 * @param prompt The user prompt
 * @returns Promise with prompts array and UI prompts array
 */
export const getTemplate = async (prompt: string): Promise<{ 
  prompts: string[], 
  uiPrompts: string[] 
}> => {
  const projectType = await determineProjectType(prompt);
  
  if (projectType === 'node') {
    return {
      prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${NODE_BASE_PROMPT}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
      uiPrompts: [NODE_BASE_PROMPT]
    };
  }
  
  // Default React
  return {
    prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${REACT_BASE_PROMPT}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
    uiPrompts: [REACT_BASE_PROMPT]
  };
};

/**
 * Get system prompt
 * @returns The system prompt
 */
const getSystemPrompt = (): string => {
  // This is a simplified version of the system prompt
  return `
You are an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

You create a single, comprehensive artifact for each project, containing all necessary steps and components including:
- File paths and contents
- Shell commands to run 
- Dependencies to install

Think holistically and comprehensively and wrap your response in <boltArtifact> tags.

Use valid markdown for responses and be concise unless asked for more details. 

Use best practices and split functionality into smaller files when appropriate.
`;
};

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
        content: getSystemPrompt()
      });
    }

    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': OPENROUTER_REFERER,
        'X-Title': 'Lovable'
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
