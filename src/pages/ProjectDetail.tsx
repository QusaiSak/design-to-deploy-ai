
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, Project as ProjectType } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Code, Edit } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import { format } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState('');

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const projectData = await getProject(id);
        setProject(projectData);
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

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4" />
          <div className="h-48 bg-slate-200 rounded mb-6" />
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

  const modelName = project.model.split('/').pop()?.split(':')[0] || project.model;
  const formattedDate = format(new Date(project.created_at), 'PPP');

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
          <h1 className="text-2xl font-bold">{project.title || 'Untitled Project'}</h1>
        </div>
        <Button asChild variant="outline">
          <Link to={`/projects/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge variant="secondary">{modelName}</Badge>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formattedDate}</span>
        </div>
      </div>
      
      {project.description && (
        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-muted-foreground">{project.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-medium mb-3">Wireframe</h2>
          <div className="bg-white rounded-md overflow-hidden border">
            <img 
              src={project.image_url} 
              alt={project.title || 'Wireframe'} 
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-3">Generated Code</h2>
          <div className="h-[400px]">
            <CodeEditor code={code} onCodeChange={setCode} />
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div>
        <h2 className="text-lg font-medium mb-3">Preview</h2>
        <div className="h-[500px]">
          <Preview code={code} />
        </div>
      </div>
    </div>
  );
}
