import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

interface DescriptionInputProps {
  description: string;
  onChange: (value: string) => void;
}

export default function DescriptionInput({ description, onChange }: DescriptionInputProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Description</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">How to get the best results:</p>
              <p className="text-blue-700">
                Describe the purpose and style of the website (e.g., "modern e-commerce site for furniture", "professional portfolio for a photographer"). 
                Include color preferences, branding elements, and any specific UI features you want.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Describe your website vision in detail</Label>
            <Textarea
              id="description"
              placeholder="E.g., Create a modern e-commerce landing page with a blue and white color scheme. The site should have a hero section with a large product image, a features grid showcasing 3 benefits, a product listing section, and a newsletter signup form at the bottom."
              value={description}
              onChange={(e) => onChange(e.target.value)}
              className="h-32"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
