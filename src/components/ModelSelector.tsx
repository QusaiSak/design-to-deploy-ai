import React from 'react';
import { Check, CpuIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const models = [
  {
    id: 'google/gemini-2.5-pro-exp-03-25:free',
    name: 'Gemini 2.5 Pro',
    description: 'High performance model with excellent design capabilities (recommended)'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B',
    description: 'Advanced model with strong visual understanding'
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek Chat v3',
    description: 'Specialized model for detailed implementation'
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export default function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Select AI Model</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Try different models if you encounter errors. Gemini and Llama models are currently recommended.
        </p>
        <RadioGroup value={selectedModel} onValueChange={onModelSelect} className="space-y-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onModelSelect(model.id)}
            >
              <RadioGroupItem value={model.id} id={model.id} />
              <Label htmlFor={model.id} className="flex flex-col cursor-pointer">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </Label>
              {selectedModel === model.id && (
                <Check className="ml-auto h-4 w-4 text-primary" />
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
