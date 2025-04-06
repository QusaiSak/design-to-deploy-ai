
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { createProject, uploadImage } from '@/lib/supabase';
import { generateCode } from '@/lib/openrouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, Save } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import DescriptionInput from '@/components/DescriptionInput';
import ModelSelector from '@/components/ModelSelector';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';

export default function NewProject() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-chat-v3-0324:free');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (file: File, preview: string) => {
    setImage(file);
    setImagePreview(preview);
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

    setIsGenerating(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        // Generate code
        const generatedCode = await generateCode(
          selectedModel,
          base64Image,
          description
        );
        
        setCode(generatedCode);
        toast.success('Code generated successfully');
      };
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate code');
    } finally {
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
    try {
      // Upload image to Supabase Storage
      const path = `${user.id}/${Date.now()}-${image.name}`;
      const imageUrl = await uploadImage(image, path);
      
      // Create project in database
      const project = await createProject({
        user_id: user.id,
        title: projectTitle,
        description,
        image_url: imageUrl,
        code,
        model: selectedModel,
      });
      
      toast.success('Project saved successfully');
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-6 mx-auto">
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
          <h1 className="text-2xl font-bold">New Project</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleGenerate} 
            disabled={!image || !description || isGenerating}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Code'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={!code || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <Input
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-6 text-lg font-medium"
          />
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
              onModelSelect={setSelectedModel}
            />
          </div>
        </div>
        
        <div className="md:col-span-2 flex flex-col space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
            <CodeEditor code={code} onCodeChange={setCode} />
            <Preview code={code} />
          </div>
        </div>
      </div>
    </div>
  );
}
