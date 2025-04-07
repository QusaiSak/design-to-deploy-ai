
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check } from 'lucide-react';
import React from 'react';

const models = [
  {
    name: 'Gemini Google',
    icon: '/google.png',
    modelName: 'google/gemini-2.5-pro-exp-03-25:free'
  },
  {
    name: 'llama By Meta',
    icon: '/meta.png',
    modelName: 'meta-llama/llama-3.3-70b-instruct:free'
  },
  {
    name: 'Deepkseek',
    icon: '/deepseek.png',
    modelName: 'deepseek/deepseek-chat-v3-0324:free'
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
              <SelectItem key={model.modelName} value={model.modelName} className="py-3">
                <div className="flex items-center gap-2">
                  <img src={model.icon} alt="model" className='size-5'/>
                  <div>
                    <div className="font-medium">{model.name}</div>
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
