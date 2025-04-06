
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DescriptionInputProps {
  description: string;
  onChange: (value: string) => void;
}

export default function DescriptionInput({ description, onChange }: DescriptionInputProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Description</h3>
        <div className="space-y-2">
          <Label htmlFor="description">Describe the wireframe and what you want to generate</Label>
          <Textarea
            id="description"
            placeholder="E.g., A landing page with a hero section, features list, and contact form..."
            value={description}
            onChange={(e) => onChange(e.target.value)}
            className="h-32"
          />
        </div>
      </CardContent>
    </Card>
  );
}
