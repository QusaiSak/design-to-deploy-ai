
import React from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
  SandpackStack,
} from '@codesandbox/sandpack-react';
import { aquaBlue } from '@codesandbox/sandpack-themes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Code, Eye, Terminal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SandpackEditorProps {
  code: string;
  onCodeChange?: (code: string) => void;
  isLoading?: boolean;
}

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

export default function SandpackEditor({ code, onCodeChange, isLoading = false }: SandpackEditorProps) {
  const [activeView, setActiveView] = React.useState<'code' | 'preview' | 'console'>('code');
  
  // Process the code to create a proper React app structure
  const reactSetup = {
    'App.jsx': code,
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
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
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
            <TabsList>
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
            visibleFiles: ['App.jsx', 'styles.css'],
            editorHeight: '100%',
            showNavigator: false,
            showLineNumbers: true,
            showTabs: false,
            recompileMode: "delayed",
            recompileDelay: 500,
          }}
        >
          <SandpackLayout>
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
