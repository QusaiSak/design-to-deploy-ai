
import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const models = [
  {
    id: 'google/gemini-2.5-pro-exp-03-25:free',
    name: 'Gemini Google',
    description: 'High performance model with excellent design capabilities',
    logo: '🔵'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama by Meta',
    description: 'Advanced model with strong visual understanding',
    logo: '💠'
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'Deepseek',
    description: 'Specialized model for detailed implementation',
    logo: '🔍'
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
        <Select value={selectedModel} onValueChange={onModelSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{model.logo}</span>
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
