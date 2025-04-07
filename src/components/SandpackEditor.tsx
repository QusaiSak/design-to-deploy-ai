
import React, { useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackFileExplorer,
  SandpackStack,
  useSandpack
} from '@codesandbox/sandpack-react';
import { aquaBlue } from '@codesandbox/sandpack-themes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Code, Eye, Terminal, FolderOpen } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// SandpackControls component for refresh functionality
const SandpackControls = () => {
  const { sandpack } = useSandpack();
  const { refresh } = sandpack;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => refresh()}
        className="gap-1"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
    </div>
  );
};

interface SandpackEditorProps {
  code: string;
  onCodeChange?: (code: string) => void;
  isLoading?: boolean;
}

export default function SandpackEditor({ code, onCodeChange, isLoading = false }: SandpackEditorProps) {
  const [activeView, setActiveView] = useState<'code' | 'preview' | 'console' | 'files'>('code');

  // Process the code to create a proper React app structure with Tailwind CSS
  const reactSetup = {
    'App.jsx': code || 'export default function App() { return <div>Enter some code</div> }',
    'index.jsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    'styles.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  background-color: #fff;
}

:root {
  --primary-color: #1EAEDB;
  --secondary-color: #33C3F0;
}`,
    'tailwind.config.js': `
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1EAEDB',
        secondary: '#33C3F0',
        accent: '#0FA0CE',
      },
    },
  },
  plugins: [],
}`,
    'postcss.config.js': `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
  };

  const handleCodeChange = (newCode: string) => {
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden bg-white">
      <div className="border-b p-2">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="files" className="flex items-center gap-1">
                <FolderOpen className="h-4 w-4" />
                <span>Files</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="console" className="flex items-center gap-1">
                <Terminal className="h-4 w-4" />
                <span>Console</span>
              </TabsTrigger>
            </TabsList>
            <SandpackControls />
          </div>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          theme={aquaBlue}
          template="react"
          files={reactSetup}
          options={{
            activeFile: 'App.jsx',
            visibleFiles: ['App.jsx', 'styles.css', 'tailwind.config.js'],
            editorHeight: '100%',
            showNavigator: false,
            showLineNumbers: true,
            showTabs: false,
            recompileMode: "delayed",
            recompileDelay: 300,
          }}
          customSetup={{
            dependencies: {
              "tailwindcss": "^3.3.0",
              "postcss": "^8.4.27",
              "autoprefixer": "^10.4.14"
            }
          }}
        >
          <SandpackLayout>
            <SandpackStack style={{ height: '100%', display: activeView === 'files' ? 'flex' : 'none' }}>
              <SandpackFileExplorer />
            </SandpackStack>
            
            <SandpackStack style={{ height: '100%', display: activeView === 'code' ? 'flex' : 'none' }}>
              <SandpackCodeEditor 
                showLineNumbers={true}
                showInlineErrors={true}
                wrapContent={true}
                readOnly={isLoading}
                onChange={(newCode) => handleCodeChange(newCode)}
              />
            </SandpackStack>
            
            <SandpackStack style={{ height: '100%', display: activeView === 'preview' ? 'flex' : 'none' }}>
              <SandpackPreview showRefreshButton={false} showOpenInCodeSandbox={false} />
            </SandpackStack>
            
            <SandpackStack style={{ height: '100%', display: activeView === 'console' ? 'flex' : 'none' }}>
              <SandpackConsole />
            </SandpackStack>
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </Card>
  );
}
