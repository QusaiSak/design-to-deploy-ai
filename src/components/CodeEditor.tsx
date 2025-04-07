import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';
import { aquaBlue } from '@codesandbox/sandpack-themes';
import React, { useEffect, useRef, useState } from 'react';
import Constants from '../data/Constants';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface CodeEditorProps {
  codeResp: string;
  isReady?: boolean;
}

export default function CodeEditor({ codeResp, isReady = false }: CodeEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(14);
  const [previewWidth, setPreviewWidth] = useState('100%');
  const [splitPosition, setSplitPosition] = useState(50);
  const isDraggingRef = useRef(false);
  const dragStartX = useRef(0);
  const containerWidth = useRef(0);

  // Process the code to create a proper React app structure with Tailwind CSS
  const reactSetup = {
    'App.js': codeResp || 'export default function App() { return <div>Enter some code</div>; }',
    ...Constants.FILES
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        containerWidth.current = containerRef.current.clientWidth;
      }
    };

    // Set initial container width
    if (containerRef.current) {
      containerWidth.current = containerRef.current.clientWidth;
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle drag to resize panels
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const delta = e.clientX - dragStartX.current;
      const newPosition = (dragStartX.current / containerWidth.current) * 100 + 
                         (delta / containerWidth.current) * 100;
      
      // Limit between 20% and 80%
      const clampedPosition = Math.min(Math.max(newPosition, 20), 80);
      setSplitPosition(clampedPosition);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDragging = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleRefresh = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      // Add timestamp to force refresh
      const currentSrc = iframe.src.split('?')[0];
      iframe.src = `${currentSrc}?refresh=${Date.now()}`;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const handleWidthChange = (width: string) => {
    setPreviewWidth(width);
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 10));
  };

  if (!isReady) {
    return (
      <SandpackProvider
        theme={aquaBlue}
        template="react"
        files={{
          ...Constants.FILES
        }}
        customSetup={{
          dependencies: {
            ...Constants.DEPENDANCY
          }
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
      >
        <div className="h-[70vh] border rounded-lg overflow-hidden">
          <SandpackCodeEditor 
            style={{ height: '100%' }}
            showLineNumbers
            showInlineErrors
            wrapContent={false}
          />
        </div>
      </SandpackProvider>
    );
  }

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full w-full'} flex flex-col`}
      ref={containerRef}
    >
      <Card className="flex-1 flex flex-col overflow-hidden bg-white border-none">
        <div className="border-b bg-[#1e1e1e] text-white flex items-center justify-between p-2">
          <div className="flex items-center gap-4">
            <div className="font-medium text-sm">Editor</div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={decreaseFontSize}
              className="px-2 h-8 text-white hover:bg-white/10"
            >
              A-
            </Button>
            <span className="text-xs">{fontSize}px</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={increaseFontSize}
              className="px-2 h-8 text-white hover:bg-white/10"
            >
              A+
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              className="text-white hover:bg-white/10"
            >
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10"
            >
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <SandpackProvider
            theme="dark"
            template="react"
            files={reactSetup}
            options={{
              externalResources: ["https://cdn.tailwindcss.com"],
              visibleFiles: ['App.js'],
            }}
            customSetup={{
              dependencies: {
                ...Constants.DEPENDANCY
              }
            }}
          >
            <div className="flex h-full relative">
              {/* Code editor panel */}
              <div 
                className="h-full bg-[#1e1e1e]"
                style={{ width: `${splitPosition}%` }}
              >
                <div className="flex items-center px-4 py-1 bg-[#252526] border-b border-gray-800">
                  <div className="text-white text-sm px-3 py-1 bg-[#1e1e1e] rounded-t border-t border-l border-r border-gray-700">App.js</div>
                </div>
                <div className="w-full h-[calc(100%-32px)] relative overflow-hidden">
                  <div className="absolute inset-0 overflow-auto">
                    <div style={{ minWidth: '800px', height: '100%' }}>
                      <SandpackCodeEditor 
                        showLineNumbers
                        showInlineErrors
                        wrapContent={false}
                        readOnly={false}
                        style={{ 
                          fontSize: `${fontSize}px`, 
                          height: '100%',
                          minWidth: '100%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Resizer */}
              <div 
                className="w-[6px] h-full bg-gray-700 hover:bg-blue-500 transition-colors cursor-col-resize z-10"
                onMouseDown={startDragging}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-1 bg-gray-400 rounded"></div>
              </div>
              
              {/* Preview panel */}
              <div 
                className="h-full flex flex-col bg-gray-100"
                style={{ width: `${100 - splitPosition}%` }}
              >
                <div className="flex p-2 bg-[#252526] border-b border-gray-800 justify-between items-center">
                  <div className="text-white text-sm">Preview</div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleWidthChange('320px')} 
                      className="whitespace-nowrap text-white hover:bg-white/10 h-7 px-2 text-xs"
                    >
                      Mobile
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleWidthChange('768px')} 
                      className="whitespace-nowrap text-white hover:bg-white/10 h-7 px-2 text-xs"
                    >
                      Tablet
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleWidthChange('1024px')} 
                      className="whitespace-nowrap text-white hover:bg-white/10 h-7 px-2 text-xs"
                    >
                      Laptop
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleWidthChange('100%')} 
                      className="whitespace-nowrap text-white hover:bg-white/10 h-7 px-2 text-xs"
                    >
                      Full
                    </Button>
                  </div>
                </div>
                <div className="w-full h-[calc(100%-40px)] flex justify-center bg-gray-50 overflow-auto">
                  <div style={{ width: previewWidth, transition: 'width 0.3s ease' }} className="h-full">
                    <SandpackPreview 
                      showRefreshButton={false} 
                      showOpenInCodeSandbox={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SandpackProvider>
        </div>
      </Card>
    </div>
  );
}
