
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw, Smartphone, Tablet, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface PreviewProps {
  code: string;
}

const baseHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #root { height: 100%; }
    .error-container { 
      padding: 1rem; 
      color: #ef4444; 
      border: 1px solid #ef4444; 
      border-radius: 0.25rem; 
      margin: 1rem;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    try {
      // React Component
      %COMPONENT%
      
      // Render
      const rootElement = document.getElementById('root');
      const root = ReactDOM.createRoot(rootElement);
      root.render(<App />);
    } catch (error) {
      document.getElementById('root').innerHTML = \`
        <div class="error-container">
          <strong>Error:</strong>\\n\${error.message}
        </div>
      \`;
      console.error(error);
    }
  </script>
</body>
</html>
`;

export default function Preview({ code }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  
  const refreshPreview = () => {
    setIsLoading(true);
    
    try {
      if (!iframeRef.current?.contentWindow) return;
      
      // Prepare HTML content
      const htmlContent = baseHTML.replace('%COMPONENT%', code);
      
      // Write to iframe
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      iframeRef.current.onload = () => {
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to render preview');
      setIsLoading(false);
    }
  };
  
  // Update preview when code changes
  useEffect(() => {
    if (code) {
      refreshPreview();
    }
  }, [code]);
  
  // Set viewport width based on selected mode
  const getViewportStyles = () => {
    switch (viewportMode) {
      case 'mobile':
        return { maxWidth: '375px' };
      case 'tablet':
        return { maxWidth: '768px' };
      case 'desktop':
      default:
        return { width: '100%' };
    }
  };
  
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-md p-1">
            <Button 
              variant={viewportMode === 'mobile' ? "secondary" : "ghost"} 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setViewportMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewportMode === 'tablet' ? "secondary" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewportMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewportMode === 'desktop' ? "secondary" : "ghost"} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewportMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={refreshPreview}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex items-center justify-center bg-white">
        <div 
          className="preview-container transition-all duration-200 h-full mx-auto border bg-slate-50"
          style={getViewportStyles()}
        >
          <iframe
            ref={iframeRef}
            title="Preview"
            sandbox="allow-scripts"
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
