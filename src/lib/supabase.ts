
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  code: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
  
  return data as Project[];
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
  
  return data as Project;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }
  
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
  
  return data as Project;
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
  
  return true;
}

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('wireframes')
    .upload(path, file);
    
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('wireframes')
    .getPublicUrl(path);
    
  return publicUrl;
}
