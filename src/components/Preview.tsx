import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw, Smartphone, Tablet, Monitor, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Process code to make it work in the browser environment
const processCodeForBrowser = (code: string): string => {
  if (!code) return '';
  
  // Remove markdown code blocks
  let processedCode = code.replace(/```(jsx|javascript|js|react|tsx|typescript|html)?|```/g, '').trim();
  
  // Replace import statements with comments
  processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, 
    '// Import removed');
  
  // Replace export statements
  processedCode = processedCode.replace(/export\s+default\s+/g, '');
  processedCode = processedCode.replace(/export\s+/g, '');
  
  // Simple fix for hooks
  processedCode = processedCode.replace(/\bconst\s+\[\s*(\w+)[^\]]*\]\s*=\s*useState/g, 
    'const [$1, set$1] = React.useState');
  
  return processedCode;
};

// Create HTML content for the iframe
const createHTMLContent = (code: string) => {
  // Process the code
  const processedCode = code ? processCodeForBrowser(code) : '';
  
  // Extract CSS content if present
  let cssContent = '';
  if (code) {
    // Try to find CSS section with a marker like "corresponding CSS"
    const cssStartIndex = code.indexOf("corresponding CSS");
    if (cssStartIndex !== -1) {
      // Look for CSS after the marker - could be in code blocks or just text
      const cssBlockStart = code.indexOf('```css', cssStartIndex);
      if (cssBlockStart !== -1) {
        const cssBlockEnd = code.indexOf('```', cssBlockStart + 6);
        if (cssBlockEnd !== -1) {
          cssContent = code.substring(cssBlockStart + 6, cssBlockEnd).trim();
        }
      } else {
        // Try to extract CSS without markdown markers
        const cssStart = code.indexOf(':root {', cssStartIndex);
        if (cssStart !== -1) {
          // Find a good ending point - could be end of file or next major section
          let cssEnd = code.length;
          const possibleEndMarkers = ["Key features", "```", "## ", "# "];
          for (const marker of possibleEndMarkers) {
            const markerPos = code.indexOf(marker, cssStart + 10); // Start a bit after CSS start
            if (markerPos !== -1 && markerPos < cssEnd) {
              cssEnd = markerPos;
            }
          }
          cssContent = code.substring(cssStart, cssEnd).trim();
        }
      }
    } else {
      // Alternative: look for css keyword or :root pattern
      if (code.includes(':root {')) {
        const rootStart = code.indexOf(':root {');
        let cssEnd = code.length;
        const nextSection = code.indexOf("```\n\n", rootStart);
        if (nextSection !== -1) {
          cssEnd = nextSection;
        }
        cssContent = code.substring(rootStart, cssEnd).trim();
      } else if (code.includes('body {')) {
        // Last resort - find CSS-like patterns
        const bodyStart = code.indexOf('body {');
        const cssChunk = code.substring(bodyStart);
        // Try to capture a reasonable amount of CSS
        const endMarker = cssChunk.indexOf('```');
        cssContent = endMarker !== -1 ? 
          cssChunk.substring(0, endMarker).trim() : 
          cssChunk.trim();
      }
    }
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.js"></script>
    <style>
      body { 
        margin: 0; 
        padding: 0; 
        font-family: system-ui, -apple-system, sans-serif; 
      }
      #root { 
        height: 100%; 
      }
      .error-container { 
        padding: 1rem; 
        color: #ef4444; 
        background-color: #fef2f2;
        border: 1px solid #fee2e2; 
        border-radius: 0.375rem; 
        margin: 1rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        white-space: pre-wrap;
        font-size: 0.875rem;
        line-height: 1.5;
      }
      ${cssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    ${processedCode ? `
    <script>
      // Make React available in the global scope
      const { useState, useEffect, useRef, useCallback, useMemo, useContext, createContext } = React;
      
      try {
        // Component code
        ${processedCode}
        
        // Render the component
        const rootElement = document.getElementById('root');
        const root = ReactDOM.createRoot(rootElement);
        
        // Detect if there's an App component
        if (typeof App !== 'undefined') {
          root.render(React.createElement(App));
        } else {
          // Find any component in the global scope
          const components = Object.keys(window).filter(key => 
            typeof window[key] === 'function' && 
            /^[A-Z]/.test(key[0])
          );
          
          if (components.length > 0) {
            const MainComponent = window[components[0]];
            root.render(React.createElement(MainComponent));
          } else {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-container';
            errorDiv.textContent = 'No React component found';
            document.getElementById('root').appendChild(errorDiv);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-container';
        const errorTitle = document.createElement('strong');
        errorTitle.textContent = 'Error: ';
        errorDiv.appendChild(errorTitle);
        errorDiv.appendChild(document.createTextNode(error.message));
        document.getElementById('root').appendChild(errorDiv);
      }
    </script>
    ` : `
    <div class="error-container">
      <strong>Preview Mode:</strong> No code to preview.
      <br><br>
      <em>Waiting for code to be generated...</em>
    </div>
    `}
  </body>
  </html>
  `;
};

interface PreviewProps {
  code: string;
}

export default function Preview({ code }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const viewportSizes = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '100%' },
  };
  
  // Update the iframe content when code changes
  useEffect(() => {
    if (!iframeRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create HTML content for the iframe
      const htmlContent = createHTMLContent(code);
      
      // Set iframe content
      iframeRef.current.srcdoc = htmlContent;
      
      // Handle iframe load events
      const handleLoad = () => {
        setIsLoading(false);
      };
      
      const handleError = (error: any) => {
        console.error('Iframe error:', error);
        setError('Failed to load preview');
        setIsLoading(false);
      };
      
      iframeRef.current.onload = handleLoad;
      iframeRef.current.onerror = handleError;
      
      return () => {
        if (iframeRef.current) {
          iframeRef.current.onload = null;
          iframeRef.current.onerror = null;
        }
      };
    } catch (error) {
      console.error('Preview error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create preview');
      setIsLoading(false);
    }
  }, [code]);
  
  // Get icon for current viewport mode
  const getViewportIcon = () => {
    switch (viewportMode) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
    }
  };
  
  // Manual refresh function
  const refreshPreview = () => {
    if (!iframeRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Re-create and set HTML content
      const htmlContent = createHTMLContent(code);
      iframeRef.current.srcdoc = htmlContent;
    } catch (error) {
      console.error('Refresh error:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh preview');
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2 pl-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-medium text-muted-foreground">Generated Website Preview</div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                {getViewportIcon()}
                <span className="text-xs capitalize hidden sm:inline">{viewportMode}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewportMode('mobile')}>
                <Smartphone className="h-4 w-4 mr-2" />
                <span>Mobile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewportMode('tablet')}>
                <Tablet className="h-4 w-4 mr-2" />
                <span>Tablet</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewportMode('desktop')}>
                <Monitor className="h-4 w-4 mr-2" />
                <span>Desktop</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={refreshPreview}
            disabled={isLoading || !code}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md max-w-md">
            <h3 className="font-medium mb-2">Error rendering preview</h3>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        ) : (
          <div 
            className={`preview-container transition-all duration-200 bg-white border shadow-sm ${viewportMode !== 'desktop' ? 'rounded-lg overflow-hidden' : 'w-full h-full'}`}
            style={{
              width: viewportSizes[viewportMode].width,
              height: viewportSizes[viewportMode].height,
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
