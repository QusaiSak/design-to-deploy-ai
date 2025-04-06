
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { getProjects, Project as ProjectType } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/ProjectCard';
import { Plus, Code, FileCode } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useUser();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userProjects = await getProjects(user.id);
        setProjects(userProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [user]);

  const handleDeleteProject = async (id: string) => {
    // This will be implemented in the ProjectsPage
    toast.success('Project deleted');
    setProjects(projects.filter(project => project.id !== id));
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Generate Code</CardTitle>
            <CardDescription>
              Upload a wireframe image and generate React code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/new">
                <Code className="h-5 w-5 mr-2" />
                Start New Project
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>
              View and manage your saved projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link to="/projects">
                <FileCode className="h-5 w-5 mr-2" />
                Browse Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-slate-200" />
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full mt-2" />
              </CardHeader>
              <CardContent className="flex justify-between">
                <div className="h-10 bg-slate-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {projects.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Projects</h2>
                <Button variant="ghost" asChild>
                  <Link to="/projects">View all</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 3).map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={{
                      id: project.id,
                      title: project.title || 'Untitled Project',
                      description: project.description || 'No description',
                      imageUrl: project.image_url,
                      model: project.model,
                      createdAt: project.created_at,
                      updatedAt: project.updated_at
                    }} 
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project by uploading a wireframe and generating code.
                </p>
                <Button asChild>
                  <Link to="/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
