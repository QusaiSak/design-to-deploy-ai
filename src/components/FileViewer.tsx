
import React, { useState, useEffect } from 'react';
import { Folder, File, Code, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SandpackEditor from './SandpackEditor';

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
  
  // Parse the generated code and create a file structure
  useEffect(() => {
    if (!generatedCode) {
      setFiles([]);
      setSelectedFile(null);
      return;
    }

    try {
      // Standard React project structure files
      const fileStructure: FileItem[] = [
        {
          name: 'src',
          path: 'src',
          type: 'folder',
          children: []
        },
        {
          name: 'public',
          path: 'public',
          type: 'folder',
          children: [
            {
              name: 'index.html',
              path: 'public/index.html',
              type: 'file',
              content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
            }
          ]
        },
        {
          name: 'package.json',
          path: 'package.json',
          type: 'file',
          content: `{
  "name": "react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
        },
        {
          name: 'README.md',
          path: 'README.md',
          type: 'file',
          content: `# React App Generated from Wireframe

This project was generated using AI from a wireframe design. Below is a description of the project structure and components.

## Getting Started

1. Install dependencies: \`npm install\`
2. Run the app: \`npm run dev\`

## Project Structure

- \`/src\` - Main source code
  - \`/components\` - React components
  - \`/styles\` - CSS styles
  - \`App.tsx\` - Main App component
  - \`main.tsx\` - Entry point
- \`/public\` - Static assets
`
        }
      ];

      // Extract code components from generatedCode
      let componentCode = '';
      
      // Clean up the code by removing markdown backticks and language identifiers
      let cleanedCode = generatedCode.replace(/```(jsx|javascript|js|react|tsx|typescript)?|```/g, '').trim();
      
      // Check for import section to detect component code
      if (cleanedCode.includes('import React')) {
        componentCode = cleanedCode;
      } else {
        // Try to find React component in the code
        const appComponentStart = cleanedCode.indexOf('function App()');
        if (appComponentStart !== -1) {
          const appComponentEnd = findClosingBrace(cleanedCode, appComponentStart);
          if (appComponentEnd !== -1) {
            componentCode = cleanedCode.substring(appComponentStart, appComponentEnd + 1);
          }
        } else if (cleanedCode.includes('const App = ()')) {
          const appComponentStart = cleanedCode.indexOf('const App = ()');
          const appComponentEnd = findClosingBrace(cleanedCode, appComponentStart);
          if (appComponentEnd !== -1) {
            componentCode = cleanedCode.substring(appComponentStart, appComponentEnd + 1);
          }
        }
      }

      // If we have component code, add it to the file structure
      if (componentCode) {
        // Set up standard React file structure
        const srcFolderIndex = fileStructure.findIndex(f => f.path === 'src');
        if (srcFolderIndex !== -1) {
          const srcChildren = fileStructure[srcFolderIndex].children || [];
          
          // Components folder
          srcChildren.push({
            name: 'components',
            path: 'src/components',
            type: 'folder',
            children: []
          });
          
          // Main App.tsx file
          srcChildren.push({
            name: 'App.tsx',
            path: 'src/App.tsx',
            type: 'file',
            content: `import React from 'react';
import './App.css';

${componentCode}

export default App;`
          });
          
          // Main.tsx entry point
          srcChildren.push({
            name: 'main.tsx',
            path: 'src/main.tsx',
            type: 'file',
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
          });
          
          // Extract CSS if present
          let cssContent = '';
          const cssStartIndex = cleanedCode.indexOf(':root {') || cleanedCode.indexOf('body {');
          if (cssStartIndex !== -1) {
            const cssEndIndex = findClosingBrace(cleanedCode, cssStartIndex);
            if (cssEndIndex !== -1) {
              cssContent = cleanedCode.substring(cssStartIndex, cssEndIndex + 1);
            }
          }
          
          // Add CSS file
          srcChildren.push({
            name: 'App.css',
            path: 'src/App.css',
            type: 'file',
            content: cssContent || `/* Generated styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
}
`
          });
          
          srcChildren.push({
            name: 'index.css',
            path: 'src/index.css',
            type: 'file',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
          });
          
          // Update src folder children
          fileStructure[srcFolderIndex].children = srcChildren;
        }
      }
      
      setFiles(fileStructure);
      
      // Select the first file by default (App.tsx or README.md)
      const srcFolder = fileStructure.find(f => f.path === 'src');
      if (srcFolder && srcFolder.children) {
        const appFile = srcFolder.children.find(f => f.path === 'src/App.tsx');
        if (appFile) {
          setSelectedFile(appFile);
        } else {
          // Fallback to README
          const readmeFile = fileStructure.find(f => f.path === 'README.md');
          if (readmeFile) {
            setSelectedFile(readmeFile);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing code:', error);
      
      // Fallback - create a basic structure with the raw code
      const fallbackFile = {
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file' as const,
        content: generatedCode || ''
      };
      
      setFiles([
        {
          name: 'src',
          path: 'src',
          type: 'folder' as const,
          children: [fallbackFile]
        },
        {
          name: 'README.md',
          path: 'README.md',
          type: 'file' as const,
          content: '# Generated React App\n\nThis is a React application generated from a wireframe.'
        }
      ]);
      
      setSelectedFile(fallbackFile);
    }
  }, [generatedCode]);

  // Helper function to find the closing brace for a code block
  function findClosingBrace(code: string, startIndex: number): number {
    let braceCount = 0;
    let foundOpening = false;
    
    for (let i = startIndex; i < code.length; i++) {
      if (code[i] === '{') {
        braceCount++;
        foundOpening = true;
      } else if (code[i] === '}') {
        braceCount--;
        if (foundOpening && braceCount === 0) {
          return i;
        }
      }
    }
    
    return -1;
  }

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
          <SandpackEditor
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
            isLoading={isLoading}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-sm text-gray-400 bg-gray-900/50 rounded-lg p-4">
            <Code size={24} className="mb-3 opacity-50" />
            <p>Select a file to view its code</p>
          </div>
        )}
      </div>
    </div>
  );
}
