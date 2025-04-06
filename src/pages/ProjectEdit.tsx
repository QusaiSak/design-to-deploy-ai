
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, updateProject, Project as ProjectType } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';

export default function ProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const projectData = await getProject(id);
        setProject(projectData);
        setTitle(projectData.title || '');
        setDescription(projectData.description || '');
        setCode(projectData.code || '');
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateProject(id, {
        title,
        description,
        code
      });
      
      toast.success('Project updated successfully');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4" />
          <div className="h-12 bg-slate-200 rounded mb-4" />
          <div className="h-32 bg-slate-200 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-slate-200 rounded" />
            <div className="h-96 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

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
          <h1 className="text-2xl font-bold">Edit Project</h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      
      <div className="space-y-6 mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Project Title
          </label>
          <Input
            id="title"
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-32"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <img 
          src={project.image_url} 
          alt={title || 'Wireframe'} 
          className="w-10 h-10 object-cover rounded"
        />
        <div>
          <p className="text-sm font-medium">Wireframe Image</p>
          <p className="text-xs text-muted-foreground">
            The wireframe image cannot be changed
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        <CodeEditor code={code} onCodeChange={setCode} />
        <Preview code={code} />
      </div>
    </div>
  );
}
