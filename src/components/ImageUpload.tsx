
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUpload: (file: File, preview: string) => void;
  image: File | null;
  imagePreview: string | null;
}

export default function ImageUpload({ onImageUpload, image, imagePreview }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!imageTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      onImageUpload(file, previewUrl);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const removeImage = () => {
    onImageUpload(null as any, null as any);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Upload Wireframe</h3>
        
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Uploaded wireframe" className="uploaded-image mb-4" />
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2" 
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={`upload-dropzone mb-4 ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag & drop your wireframe image here, or click to select
              </p>
              <Button type="button" size="sm">Select Image</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
