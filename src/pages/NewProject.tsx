import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createProject, uploadImage, syncClerkUserWithSupabase, initializeDatabase } from '@/lib/supabase';
import { generateCode, onCodeUpdate } from '@/lib/openrouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, Save, Code, Eye, LayoutDashboard, AlertTriangle } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import DescriptionInput from '@/components/DescriptionInput';
import ModelSelector from '@/components/ModelSelector';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import { FileViewer } from '@/components/FileViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [showOutput, setShowOutput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-switch to output section when code is generated
  useEffect(() => {
    if (code) {
      setShowOutput(true);
    }
  }, [code]);

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
          // Start code generation with detailed logging
          console.log('Starting code generation with model:', selectedModel);
          console.log('Image loaded, size:', Math.round((base64Image.length * 3) / 4));
          console.log('Description length:', description.length);
          
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
          
          // Log success
          console.log('Code generation successful, length:', generatedCode.length);
          
          // Switch to preview tab after code generation
          setShowOutput(true);
          toast.success('Code generated successfully');
        } catch (error: any) {
          console.error('Error generating code:', error);
          
          // Extract meaningful error message
          let errorMessage = 'Unknown error occurred';
          
          if (error.message) {
            errorMessage = error.message;
          }
          
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
        console.error('Error reading file:', error);
        setError('Failed to read the image file. Please try uploading it again.');
        setIsGenerating(false);
        toast.error('Failed to process image');
      };
    } catch (error) {
      console.error('Error processing image:', error);
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
      console.log('Starting project save process...');
      
      // Step 0: Ensure authentication is properly set with Supabase
      console.log('Ensuring authentication with Supabase...');
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Failed to get authentication token');
        }
        
        const authResult = await syncClerkUserWithSupabase(token);
        if (!authResult.success) {
          throw new Error(`Authentication error: ${authResult.error}`);
        }
        console.log('Authentication with Supabase confirmed');
      } catch (authError: any) {
        console.error('Authentication error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      // Step 0.5: Ensure database is initialized
      console.log('Ensuring database is initialized...');
      try {
        const initResult = await initializeDatabase();
        if (!initResult.success) {
          throw new Error(`Database initialization failed: ${initResult.error}`);
        }
        console.log('Database initialization confirmed:', initResult.message);
      } catch (initError: any) {
        console.error('Database initialization error:', initError);
        throw new Error(`Database initialization failed: ${initError.message}`);
      }
      
      // Step 1: Upload image to Supabase Storage
      console.log('Uploading image to Supabase storage...');
      const path = `${user.id}/${Date.now()}-${image.name}`;
      let imageUrl;
      try {
        imageUrl = await uploadImage(image, path);
        console.log('Image uploaded successfully:', imageUrl);
        
        // Check if we got a placeholder URL
        if (imageUrl.includes('placeholder.co')) {
          console.warn('Using placeholder image due to storage permission issues');
          toast.warning('Using placeholder image due to storage limitations', {
            description: 'Your project will still be saved, but with a placeholder image.'
          });
        }
      } catch (uploadError: any) {
        console.error('Error uploading image:', uploadError);
        
        // If there's a storage permission error, we'll use a placeholder URL
        if (uploadError.message?.includes('bucket') || 
            uploadError.message?.includes('permission') || 
            uploadError.message?.includes('storage')) {
          console.log('Using placeholder URL due to storage permission issues');
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
      
      // Step 2: Create project in database
      console.log('Creating project in database...');
      const projectData = {
        user_id: user.id,
        title: projectTitle,
        description,
        image_url: imageUrl,
        code,
        model: selectedModel,
      };
      
      let project;
      try {
        project = await createProject(projectData);
        console.log('Project created successfully:', project);
      } catch (createError: any) {
        console.error('Error creating project:', createError);
        throw new Error(`Failed to create project: ${createError.message || 'Unknown error'}`);
      }
      
      if (!project || !project.id) {
        throw new Error('Project creation failed: No project ID returned');
      }
      
      // Success - project saved
      toast.success('Project saved successfully');
      navigate(`/projects/${project.id}`);
    } catch (error: any) {
      console.error('Error saving project:', error);
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
            onClick={() => setShowOutput(!showOutput)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {showOutput ? <LayoutDashboard className="h-4 w-4" /> : <Code className="h-4 w-4" />}
            <span className="hidden sm:inline">{showOutput ? 'Configuration' : 'View Output'}</span>
          </Button>
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
        <div className={`${showOutput ? 'hidden md:block md:w-1/3' : 'w-full'} transition-all duration-300 overflow-auto`}>
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
        
        {/* Output Panel */}
        <div className={`${showOutput ? 'block w-full md:w-2/3' : 'hidden'} transition-all duration-300 overflow-hidden`}>
          <Card className="h-full">
            <CardContent className="p-1 h-full">
              <FileViewer generatedCode={code} isLoading={isGenerating} />
            </CardContent>
          </Card>
        </div>
        
        {/* Empty state when no code is generated yet */}
        {!showOutput && code === '' && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="max-w-md">
              <h2 className="text-2xl font-bold mb-2">Transform Your Wireframe Into a Website</h2>
              <p className="text-muted-foreground mb-6">Upload a wireframe image and add a description to convert it into a polished, professional website ready for production.</p>
              <Button 
                onClick={handleGenerate} 
                disabled={!image || !description || isGenerating}
                className="gap-2"
                size="lg"
              >
                <Sparkles className="h-5 w-5" />
                {isGenerating ? 'Generating...' : 'Generate Website'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {!showOutput && error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="max-w-md">
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {error.includes('authentication') || error.includes('Supabase') 
                    ? 'Project Save Failed' 
                    : 'Generation Failed'}
                </AlertTitle>
                <AlertDescription className="text-left">
                  <p>{error}</p>
                  {error.includes('authentication') && (
                    <p className="mt-2">
                      This may be due to an issue with your login session. Try signing out and signing back in.
                    </p>
                  )}
                  {error.includes('upload image') && (
                    <p className="mt-2">
                      This may be due to an issue with the storage service or the image file. Try a different image or check your connection.
                    </p>
                  )}
                  {error.includes('create project') && (
                    <p className="mt-2">
                      This may be due to an issue with the database service. Try again in a few moments or check your connection.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 justify-center">
                {error.includes('Generation') && (
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!image || !description || isGenerating}
                    className="gap-2"
                    size="lg"
                  >
                    <Sparkles className="h-5 w-5" />
                    Try Again
                  </Button>
                )}
                {error.includes('authentication') || error.includes('Supabase') || error.includes('save') ? (
                  <Button 
                    onClick={handleSave} 
                    disabled={!code || isSaving}
                    className="gap-2"
                    size="lg"
                  >
                    <Save className="h-5 w-5" />
                    Try Saving Again
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
        
        {/* Show intro message when code is generated */}
        {!showOutput && code !== '' && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="max-w-md">
              <h2 className="text-2xl font-bold mb-2">Website Successfully Generated!</h2>
              <p className="text-muted-foreground mb-6">Your wireframe has been transformed into a professional website. View your new website and access the code below.</p>
              <Button 
                onClick={() => setShowOutput(true)}
                className="gap-2"
                size="lg"
              >
                <Eye className="h-5 w-5" />
                View Your Website
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
