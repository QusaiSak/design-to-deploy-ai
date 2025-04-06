import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, ImageIcon, X, FileImage, Info } from 'lucide-react';
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
        
        <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-md text-sm flex gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>Upload a wireframe, mockup, or sketch of your website design. The AI will transform it into a fully functional, professionally styled website with modern UI components and responsive design.</p>
          </div>
        </div>
        
        {imagePreview ? (
          <div className="relative border rounded-lg overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Uploaded wireframe" 
              className="uploaded-image w-full object-contain max-h-[300px]" 
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center">
              This wireframe will be transformed into a professional website
            </div>
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
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3 text-center">
              <FileImage className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">
                  {isDragActive ? 'Drop your wireframe here' : 'Upload your wireframe image'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  JPEG, PNG, GIF or WEBP (max 5MB)
                </p>
                <Button type="button" size="sm">Select Image</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
