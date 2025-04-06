
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, Download, Code as CodeIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
}

export default function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const [editor, setEditor] = useState<EditorView | null>(null);
  const [fileType, setFileType] = useState("jsx");
  
  // Initialize CodeMirror editor
  useEffect(() => {
    const container = document.getElementById('code-editor');
    
    if (container && !editor) {
      const state = EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          javascript({ jsx: true, typescript: fileType === "tsx" }),
          oneDark,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              onCodeChange(update.state.doc.toString());
            }
          })
        ]
      });
      
      const view = new EditorView({
        state,
        parent: container
      });
      
      setEditor(view);
      
      return () => {
        view.destroy();
      };
    }
    
    return undefined;
  }, [fileType]);
  
  // Update editor content when code prop changes
  useEffect(() => {
    if (editor && code !== editor.state.doc.toString()) {
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: code }
      });
    }
  }, [code, editor]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };
  
  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-component.${fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };
  
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <CodeIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Editor</h3>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue placeholder="File type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jsx">JSX</SelectItem>
              <SelectItem value="tsx">TSX</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div id="code-editor" className="h-full w-full" />
      </CardContent>
    </Card>
  );
}
