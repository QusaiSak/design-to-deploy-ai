import ImageUpload from '@/components/ImageUpload';
import ModelSelector from '@/components/ModelSelector';
import Preview from '@/components/Preview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateCode } from '@/lib/openrouter';
import { createProject, initializeDatabase, syncClerkUserWithSupabase, uploadImage } from '@/lib/supabase';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronUp, MessageSquare, RefreshCw, Save, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Custom hook for responsive design
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export default function NewProject() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('Design a modern responsive website');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-pro-exp-03-25:free');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [expandedTextarea, setExpandedTextarea] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-adjust the height of the textarea based on content
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [description, expandedTextarea]);

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
          setShowChat(false);
          setShowCodePanel(true);
          toast.success('Code generated successfully');
        } catch (error: unknown) {
          let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
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
    } catch (error: unknown) {
      setError('Failed to process the image. Please try a different image.');
      toast.error('Failed to process image');
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (image) {
      await handleGenerate();
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
      } catch (uploadError: unknown) {
        // If there's a storage permission error, we'll use a placeholder URL
        const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
        if (errorMessage.includes('bucket') || 
            errorMessage.includes('permission') || 
            errorMessage.includes('storage')) {
          imageUrl = `https://placeholder.co/800x600?text=${encodeURIComponent('Wireframe: ' + image.name)}`;
          toast.warning('Using placeholder image due to storage limitations', {
            description: 'Your project will still be saved, but with a placeholder image.'
          });
        } else {
          throw new Error(`Failed to upload image: ${errorMessage}`);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while saving your project';
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

  // Toggle between chat and code panels
  const toggleLayout = () => {
    setShowChat(!showChat);
  };

  const toggleTextareaSize = () => {
    setExpandedTextarea(!expandedTextarea);
  };

  return (
    <div className="container px-4 py-4 mx-auto max-w-7xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 flex-shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Untitled Project"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium sm:max-w-xs border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!showCodePanel ? (
            <Button 
              onClick={handleGenerate} 
              disabled={!image || isGenerating}
              className="gap-2 w-full sm:w-auto"
              size={isMobile ? "default" : "lg"}
            >
              <Sparkles className="h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Generate Website'}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleRegenerate}
                disabled={isGenerating}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSave}
                disabled={!code || isSaving}
                className="gap-2"
                size="sm"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={toggleLayout}
                className="gap-2"
                size="sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Configuration Panel - only shown when in chat mode or when window is wide enough */}
        {(showChat || window.innerWidth >= 768) && (
          <div className={`transition-all duration-300 overflow-auto ${showCodePanel ? 'md:w-1/3' : 'w-full'}`}>
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
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Describe what the project should be
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleTextareaSize}
                        className="h-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        {expandedTextarea ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      ref={descriptionRef}
                      placeholder="Describe what you want the website to do or look like"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`resize-none transition-all duration-300 ${expandedTextarea ? 'h-60' : 'h-24'}`}
                    />
                  </div>
                  <ModelSelector 
                    selectedModel={selectedModel}
                    onModelSelect={handleModelChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Preview/Editor Panel - only shown after code generation */}
        {showCodePanel && (
          <div className={`md:${showChat ? 'w-2/3' : 'w-full'} transition-all duration-300 overflow-hidden`}>
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <Preview code={code} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
