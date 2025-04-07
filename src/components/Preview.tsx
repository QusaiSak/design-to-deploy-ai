
import React, { useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  SandpackStack,
} from '@codesandbox/sandpack-react';
import { aquaBlue } from '@codesandbox/sandpack-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Code, Eye, Terminal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewProps {
  code: string;
}

export default function Preview({ code }: PreviewProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'console'>('code');

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
  --primary-color: #1E90FF;
  --secondary-color: #3399FF;
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
        primary: '#1E90FF',
        secondary: '#3399FF',
        accent: '#0078D7',
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

  const handleRefresh = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="border-b p-2">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-100">
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
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
              visibleFiles: ['App.jsx', 'styles.css'],
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
              <SandpackStack style={{ height: '100%', display: activeTab === 'code' ? 'flex' : 'none' }}>
                <SandpackCodeEditor 
                  showLineNumbers={true}
                  showInlineErrors={true}
                  wrapContent={true}
                />
              </SandpackStack>
              
              <SandpackStack style={{ height: '100%', display: activeTab === 'preview' ? 'flex' : 'none' }}>
                <SandpackPreview showRefreshButton={false} showOpenInCodeSandbox={false} />
              </SandpackStack>
              
              <SandpackStack style={{ height: '100%', display: activeTab === 'console' ? 'flex' : 'none' }}>
                <SandpackConsole />
              </SandpackStack>
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </Card>
    </div>
  );
}
