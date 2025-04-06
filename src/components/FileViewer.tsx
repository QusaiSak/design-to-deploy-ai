import React, { useState, useEffect } from 'react';
import { Folder, File, Code, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Preview from './Preview';
import CodeEditor from './CodeEditor';

// Define file types for the file explorer
export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
}

// File explorer component
interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFile: FileItem | null;
}

function FileNode({ item, depth, onFileClick, isSelected, selectedFile }: { 
  item: FileItem; 
  depth: number; 
  onFileClick: (file: FileItem) => void;
  isSelected: boolean;
  selectedFile: FileItem | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-800/50 cursor-pointer ${isSelected && item.type === 'file' ? 'bg-gray-800/70' : ''}`}
        style={{ paddingLeft: `${(depth * 0.75) + 0.5}rem` }}
        onClick={handleClick}
      >
        <span className="text-gray-400">
          {item.type === 'folder' && (
            isExpanded ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          )}
        </span>
        
        {item.type === 'folder' ? (
          <Folder className="w-4 h-4 text-blue-400" />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}
        
        <span className={`text-sm ${isSelected && item.type === 'file' ? 'text-white font-medium' : 'text-gray-300'}`}>
          {item.name}
        </span>
      </div>
      
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              isSelected={selectedFile?.path === child.path}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileExplorer({ files, onFileSelect, selectedFile }: FileExplorerProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg h-full overflow-auto">
      <div className="p-3 border-b border-gray-800 flex items-center gap-2">
        <Folder className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-medium text-gray-200">Files</h2>
      </div>
      <div className="py-2">
        {files.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={onFileSelect}
            isSelected={selectedFile?.path === file.path}
            selectedFile={selectedFile}
          />
        ))}
      </div>
    </div>
  );
}

// Main component that integrates everything
interface FileViewerProps {
  generatedCode: string | null;
  isLoading?: boolean;
}

export function FileViewer({ generatedCode, isLoading = false }: FileViewerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  
  // Parse the generated code and create a file structure
  useEffect(() => {
    if (!generatedCode) {
      setFiles([]);
      setSelectedFile(null);
      return;
    }

    try {
      // Find App component code
      let appComponentCode = '';
      // Try to find the App component with function declaration
      const appMatch = generatedCode.match(/function App\(\) {[\s\S]*?^}$/m);
      
      if (appMatch) {
        appComponentCode = appMatch[0];
      } else {
        // Try to find the App component with the final "App;" line
        const appBlockStart = generatedCode.indexOf('function App()');
        if (appBlockStart !== -1) {
          const appBlockEnd = generatedCode.indexOf('App;', appBlockStart);
          if (appBlockEnd !== -1) {
            appComponentCode = generatedCode.substring(appBlockStart, appBlockEnd + 4);
          } else {
            appComponentCode = generatedCode;
          }
        } else {
          // Fallback - just use the whole code
          appComponentCode = generatedCode;
        }
      }
      
      // Find CSS code
      let cssCode = '';
      // Look for CSS section using several possible markers
      const cssMarkers = ["corresponding CSS", "App.css", "css\n", ":root {"];
      let cssStartIndex = -1;

      // Check each possible marker
      for (const marker of cssMarkers) {
        cssStartIndex = generatedCode.indexOf(marker);
        if (cssStartIndex !== -1) break;
      }

      if (cssStartIndex !== -1) {
        // Try to find a CSS code block first
        const cssBlockStart = generatedCode.indexOf('```css', cssStartIndex);
        if (cssBlockStart !== -1) {
          const cssBlockEnd = generatedCode.indexOf('```', cssBlockStart + 6);
          if (cssBlockEnd !== -1) {
            cssCode = generatedCode.substring(cssBlockStart + 6, cssBlockEnd).trim();
          }
        } else {
          // Try to capture CSS rules directly
          const rootStart = generatedCode.indexOf(':root {', cssStartIndex);
          if (rootStart !== -1) {
            // Find a reasonable end point
            let cssEnd = generatedCode.length;
            const possibleEndMarkers = ["Key features", "```", "## ", "# "];
            for (const marker of possibleEndMarkers) {
              const markerPos = generatedCode.indexOf(marker, rootStart + 10);
              if (markerPos !== -1 && markerPos < cssEnd) {
                cssEnd = markerPos;
              }
            }
            cssCode = generatedCode.substring(rootStart, cssEnd).trim();
          } else if (generatedCode.includes('body {')) {
            // Last resort - try to find CSS starting with body
            const bodyStart = generatedCode.indexOf('body {', cssStartIndex);
            if (bodyStart !== -1) {
              let cssEnd = generatedCode.length;
              // Try to find a reasonable end marker
              const endMarker = generatedCode.indexOf('```', bodyStart);
              if (endMarker !== -1) {
                cssEnd = endMarker;
              }
              cssCode = generatedCode.substring(bodyStart, cssEnd).trim();
            }
          }
        }
      }
      
      // Create file structure
      const fileStructure: FileItem[] = [
        {
          name: 'src',
          path: 'src',
          type: 'folder',
          children: [
            {
              name: 'App.jsx',
              path: 'src/App.jsx',
              type: 'file',
              content: appComponentCode
            }
          ]
        }
      ];
      
      // Add CSS file if CSS content was found
      if (cssCode) {
        fileStructure[0].children?.push({
          name: 'App.css',
          path: 'src/App.css',
          type: 'file',
          content: cssCode
        });
      }
      
      setFiles(fileStructure);
      
      // Select the App.jsx file by default
      const defaultFile = fileStructure[0].children?.[0];
      if (defaultFile) {
        setSelectedFile(defaultFile);
      }
    } catch (error) {
      console.error('Error parsing code:', error);
      
      // Fallback - just create a single file with all the code
      const fallbackFile = {
        name: 'App.jsx',
        path: 'src/App.jsx',
        type: 'file' as const,
        content: generatedCode
      };
      
      setFiles([
        {
          name: 'src',
          path: 'src',
          type: 'folder' as const,
          children: [fallbackFile]
        }
      ]);
      
      setSelectedFile(fallbackFile);
    }
  }, [generatedCode]);

  // Handle file selection
  const handleFileSelect = (file: FileItem) => {
    if (file.type === 'file') {
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex h-full">
      {/* File explorer */}
      <div className="w-[220px] flex-shrink-0 mr-2">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-900/50 rounded-lg">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-2">Generating code...</p>
          </div>
        ) : files.length > 0 ? (
          <FileExplorer 
            files={files}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-900/50 rounded-lg p-4">
            <Folder className="w-6 h-6 mb-2 opacity-50" />
            <p>No files generated yet</p>
          </div>
        )}
      </div>
      
      {/* Code and Preview Tabs */}
      <div className="flex-1">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'code' | 'preview')}
          className="h-full flex flex-col"
        >
          <TabsList className="w-full border-b rounded-none px-4 pt-2">
            <TabsTrigger value="code" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <Eye className="h-4 w-4" />
              Website Preview
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="code" className="h-full m-0 p-0 overflow-hidden">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-900/50 rounded-lg">
                  <div className="animate-spin">
                    <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="mt-2">Generating code...</p>
                </div>
              ) : selectedFile ? (
                <CodeEditor
                  code={selectedFile.content || ''}
                  onCodeChange={(newCode) => {
                    if (selectedFile) {
                      // Update the selected file's content
                      const updatedFile = { ...selectedFile, content: newCode };
                      setSelectedFile(updatedFile);
                      
                      // Also update the file in the file list
                      const updateFileInTree = (items: FileItem[]): FileItem[] => {
                        return items.map(item => {
                          if (item.path === selectedFile.path) {
                            return updatedFile;
                          } else if (item.children) {
                            return {
                              ...item,
                              children: updateFileInTree(item.children)
                            };
                          }
                          return item;
                        });
                      };
                      
                      setFiles(updateFileInTree(files));
                    }
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-900/50 rounded-lg p-4">
                  <Code size={24} className="mb-3 opacity-50" />
                  <p>Select a file to view its code</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="preview" className="h-full m-0 p-0 overflow-hidden">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-900/50 rounded-lg">
                  <div className="animate-spin">
                    <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <p className="mt-2">Generating preview...</p>
                </div>
              ) : generatedCode ? (
                <Preview code={generatedCode} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-900/50 rounded-lg p-4">
                  <Eye className="w-6 h-6 mb-2 opacity-50" />
                  <p>Generate code to see a preview</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 