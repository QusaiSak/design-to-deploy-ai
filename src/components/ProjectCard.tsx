
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const modelName = project.model.split('/').pop()?.split(':')[0] || project.model;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {modelName}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 mt-auto flex justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to={`/projects/${project.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={`/projects/${project.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(project.id)}>
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
