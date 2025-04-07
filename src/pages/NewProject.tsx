
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createProject, uploadImage, syncClerkUserWithSupabase, initializeDatabase } from '@/lib/supabase';
import { generateCode } from '@/lib/openrouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, Save, Code } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import DescriptionInput from '@/components/DescriptionInput';
import ModelSelector from '@/components/ModelSelector';
import Preview from '@/components/Preview';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function NewProject() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-pro-exp-03-25:free');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File, preview: string) => {
    setImage(file);
    setImagePreview(preview);
    // Reset error when uploading a new image
    setError(null);
  };

  const handleGenerate = async () => {
    if (!image) {
      toast.error('Please upload a wireframe image');
      return;
    }

    if (!description) {
      toast.error('Please provide a description');
      return;
    }

    // Reset any previous errors
    setError(null);
    setIsGenerating(true);
    setCode(''); // Clear previous code
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        try {
          // Generate code
          const generatedCode = await generateCode(
            selectedModel,
            base64Image,
            description
          );
          
          // Validate the generated code
          if (!generatedCode || generatedCode.trim() === '') {
            throw new Error('Generated code is empty. Please try again or use a different model.');
          }
          
          // Set the generated code
          setCode(generatedCode);
          toast.success('Code generated successfully');
        } catch (error: any) {
          let errorMessage = error.message || 'Unknown error occurred';
          
          // Handle specific authentication error
          if (errorMessage === 'No auth credentials found') {
            errorMessage = 'API key not configured. Please check your environment variables.';
          } else if (errorMessage.includes('Invalid response format')) {
            errorMessage = 'The AI model returned an unexpected response format. Please try again with a different model.';
          } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
          }
          
          // Set the error state
          setError(errorMessage);
          toast.error(`Failed to generate code: ${errorMessage}`);
        } finally {
          setIsGenerating(false);
        }
      };
      
      // Handle file reading errors
      reader.onerror = (error) => {
        setError('Failed to read the image file. Please try uploading it again.');
        setIsGenerating(false);
        toast.error('Failed to process image');
      };
    } catch (error) {
      setError('Failed to process the image. Please try a different image.');
      toast.error('Failed to process image');
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save a project');
      return;
    }

    if (!image) {
      toast.error('Please upload a wireframe image');
      return;
    }

    if (!code) {
      toast.error('Please generate code first');
      return;
    }

    const projectTitle = title || 'Untitled Project';

    setIsSaving(true);
    setError(null); // Clear any previous errors
    
    try {
      // Ensure authentication with Supabase
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }
      
      const authResult = await syncClerkUserWithSupabase(token);
      if (!authResult.success) {
        throw new Error(`Authentication error: ${authResult.error}`);
      }
      
      // Ensure database is initialized
      const initResult = await initializeDatabase();
      if (!initResult.success) {
        throw new Error(`Database initialization failed: ${initResult.error}`);
      }
      
      // Upload image to Supabase Storage
      const path = `${user.id}/${Date.now()}-${image.name}`;
      let imageUrl;
      try {
        imageUrl = await uploadImage(image, path);
        
        // Check if we got a placeholder URL
        if (imageUrl.includes('placeholder.co')) {
          toast.warning('Using placeholder image due to storage limitations', {
            description: 'Your project will still be saved, but with a placeholder image.'
          });
        }
      } catch (uploadError: any) {
        // If there's a storage permission error, we'll use a placeholder URL
        if (uploadError.message?.includes('bucket') || 
            uploadError.message?.includes('permission') || 
            uploadError.message?.includes('storage')) {
          imageUrl = `https://placeholder.co/800x600?text=${encodeURIComponent('Wireframe: ' + image.name)}`;
          toast.warning('Using placeholder image due to storage limitations', {
            description: 'Your project will still be saved, but with a placeholder image.'
          });
        } else {
          throw new Error(`Failed to upload image: ${uploadError.message || 'Unknown error'}`);
        }
      }
      
      if (!imageUrl) {
        throw new Error('Image upload failed: No URL returned');
      }
      
      // Create project in database
      const projectData = {
        user_id: user.id,
        title: projectTitle,
        description,
        image_url: imageUrl,
        code,
        model: selectedModel,
      };
      
      const project = await createProject(projectData);
      
      if (!project || !project.id) {
        throw new Error('Project creation failed: No project ID returned');
      }
      
      // Success - project saved
      toast.success('Project saved successfully');
      navigate(`/projects/${project.id}`);
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred while saving your project';
      setError(errorMessage);
      toast.error(`Failed to save project: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset any errors when switching models
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setError(null);
  };

  return (
    <div className="container px-4 py-4 mx-auto max-w-7xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Untitled Project"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium max-w-xs border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleGenerate} 
            disabled={!image || !description || isGenerating}
            className="gap-2"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            {isGenerating ? 'Generating...' : 'Generate Website'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={!code || isSaving}
            className="gap-2"
            size="sm"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Configuration Panel */}
        <div className="md:w-1/3 transition-all duration-300 overflow-auto">
          <Card className="h-full">
            <CardContent className="pt-6 h-full overflow-auto">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-6">
                <ImageUpload 
                  onImageUpload={handleImageUpload} 
                  image={image}
                  imagePreview={imagePreview}
                />
                <DescriptionInput 
                  description={description}
                  onChange={setDescription}
                />
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelSelect={handleModelChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Preview/Editor Panel */}
        <div className="md:w-2/3 transition-all duration-300 overflow-hidden">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <Preview code={code} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
