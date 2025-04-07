
import React from 'react';
import SandpackEditor from './SandpackEditor';

interface CodeEditorProps {
  code: string;
  onCodeChange?: (code: string) => void;
  isLoading?: boolean;
}

export default function CodeEditor({ code, onCodeChange, isLoading = false }: CodeEditorProps) {
  return (
    <div className="h-full">
      <SandpackEditor 
        code={code} 
        onCodeChange={onCodeChange}
        isLoading={isLoading}
      />
    </div>
  );
}
