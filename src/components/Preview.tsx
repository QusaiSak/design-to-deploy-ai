
import React from 'react';
import SandpackEditor from './SandpackEditor';

interface PreviewProps {
  code: string;
}

export default function Preview({ code }: PreviewProps) {
  return (
    <div className="h-full">
      <SandpackEditor 
        code={code} 
        isLoading={false} 
      />
    </div>
  );
}
