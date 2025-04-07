import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';
import React from 'react';

interface DescriptionInputProps {
  description: string;
  onChange: (value: string) => void;
}

export default function DescriptionInput({ description, onChange }: DescriptionInputProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Description</h3>
      </CardContent>
    </Card>
  );
}
