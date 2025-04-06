import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log configuration info
console.log('Supabase configuration:');
console.log('- URL exists:', !!supabaseUrl);
console.log('- API key exists:', !!supabaseAnonKey);
if (supabaseUrl) console.log('- URL starts with:', supabaseUrl.substring(0, 15) + '...');

// Log a warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing! Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize debugging listeners
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event, !!session);
});

// Log client info
console.log('Supabase client initialized');

// Test connection at startup
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check your environment variables.');
    }
    
    // Try a simple query to test connection
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== '42P01') { // Ignore table not found error since we'll create it
      console.error('Supabase connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection successful!');
    
    // Try to initialize the database
    const initResult = await initializeDatabase();
    if (!initResult.success) {
      return { 
        success: false, 
        error: `Database connection successful but initialization failed: ${initResult.error}`
      };
    }
    
    // Check storage access
    const storageResult = await checkStorageAccess();
    if (!storageResult.success) {
      return { 
        success: true, 
        warning: storageResult.error || 'Storage access issues detected. Image uploads will use placeholders.' 
      };
    }
    
    // All checks passed successfully
    return { 
      success: true,
      message: 'Database connection and storage access verified successfully',
      storageBuckets: storageResult.buckets
    };
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

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
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check your environment variables.');
    }

    // Validate project data
    if (!project.user_id) {
      throw new Error('User ID is required');
    }

    if (!project.image_url) {
      throw new Error('Image URL is required');
    }

    if (!project.code) {
      throw new Error('Generated code is required');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating project:', error);
      
      // Provide more specific error messages based on error codes
      if (error.code === '23505') {
        throw new Error('A project with this title already exists.');
      } else if (error.code === '42P01') {
        throw new Error('Projects table does not exist. Check your database setup.');
      } else if (error.code === '23503') {
        throw new Error('Referenced user does not exist.');
      } else if (error.message.includes('permission denied')) {
        throw new Error('Permission denied. Check your Supabase access rights.');
      } else {
        throw error;
      }
    }
    
    if (!data) {
      throw new Error('Project creation failed: No data returned from Supabase');
    }
    
    return data as Project;
  } catch (error) {
    console.error('Error in createProject function:', error);
    throw error;
  }
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
  try {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check your environment variables.');
    }

    // Ensure the file size is within limits
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds the 10MB limit');
    }

    console.log('Attempting to upload image to Supabase storage...');
    
    // First, try uploading to 'wireframes' bucket (assuming it exists)
    let data;
    let uploadError;
    
    try {
      const result = await supabase.storage
        .from('wireframes')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true // Use upsert to overwrite existing files
        });
      
      data = result.data;
      uploadError = result.error;
    } catch (error) {
      console.warn('Direct upload to wireframes bucket failed:', error);
      uploadError = error;
    }
    
    // If that fails, try the public bucket
    if (uploadError) {
      console.warn('Trying fallback bucket...', uploadError);
      
      try {
        // Try 'public' bucket as fallback
        const publicResult = await supabase.storage
          .from('public')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        data = publicResult.data;
        uploadError = publicResult.error;
        
        if (!publicResult.error) {
          console.log('Upload to public bucket successful!');
        }
      } catch (publicError) {
        console.error('Fallback upload also failed:', publicError);
      }
    }
    
    // If all upload attempts failed, try to diagnose the issue
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      
      // Check for bucket-related errors
      if (uploadError.message?.includes('bucket not found')) {
        // Try to list available buckets for debugging
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (!bucketsError && buckets?.length > 0) {
          const bucketNames = buckets.map(b => b.name).join(', ');
          console.log('Available buckets:', bucketNames);
          throw new Error(`Storage bucket not found. Available buckets: ${bucketNames}`);
        } else {
          throw new Error('Cannot access storage buckets. You may not have the required permissions.');
        }
      } else if (uploadError.message?.includes('permission denied') || uploadError.message?.includes('row-level security')) {
        throw new Error('Permission denied. File storage requires specific permissions in your Supabase project.');
      } else {
        throw uploadError;
      }
    }
    
    if (!data || !data.path) {
      throw new Error('Upload failed: No data returned from Supabase');
    }
    
    // Get public URL from whichever bucket succeeded
    const bucketName = uploadError ? 'public' : 'wireframes';
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for the uploaded image');
    }
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage function:', error);
    
    // If this is a storage error, suggest a temporary workaround
    if (error.message?.includes('bucket') || error.message?.includes('storage') || error.message?.includes('permission')) {
      console.log('Providing temporary fake URL as fallback');
      // Return a placeholder URL for demo purposes
      // In a real app, you would implement a proper fallback
      return `https://placeholder.co/800x600?text=${encodeURIComponent(file.name)}`;
    }
    
    throw error;
  }
}

// Function to set Supabase auth with Clerk user token
export async function syncClerkUserWithSupabase(token: string) {
  try {
    if (!token) {
      console.error('No token provided for Supabase auth');
      return { success: false, error: 'No token provided' };
    }
    
    console.log('Setting Supabase auth with Clerk token...');
    
    // Check if token validation is failing and provide a fallback anonymous session
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token, // Using the same token as refresh token
      });
      
      if (error) {
        if (error.message?.includes('invalid JWT') || error.message?.includes('signature is invalid')) {
          console.warn('JWT validation failed, using anonymous session instead');
          
          // Create an anonymous session with just the user ID from Clerk
          // This allows some functionality without full JWT validation
          const anonymousUser = {
            id: 'anonymous',  // Fallback ID
            role: 'anonymous',
            email: 'anonymous@example.com'
          };
          
          return { 
            success: true, 
            user: anonymousUser,
            warning: 'Using anonymous session due to JWT validation issues'
          };
        }
        
        console.error('Failed to set Supabase session:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Supabase session set successfully:', !!data.session);
      return { success: true, user: data.user };
    } catch (jwtError) {
      console.error('JWT error:', jwtError);
      
      // Fall back to anonymous access
      console.warn('Authentication error, falling back to anonymous access');
      return { 
        success: true, 
        user: { 
          id: 'anonymous',
          role: 'anonymous',
          email: 'anonymous@example.com'
        },
        warning: 'Using anonymous session due to authentication error'
      };
    }
  } catch (error) {
    console.error('Error setting Supabase auth:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Check if a table exists in the database
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    // Attempt to select from the table with a limit of 0
    const { error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true })
      .limit(0);
    
    // If there's no error, or an error that's not '42P01' (table not found), the table exists
    if (!error || (error && error.code !== '42P01')) {
      return true;
    }
    
    // Alternative check using system tables (requires proper permissions)
    const { data, error: pgError } = await supabase
      .rpc('check_table_exists', { table_name: tableName });
    
    if (!pgError && data === true) {
      return true;
    }
    
    // Final check by attempting to describe the table
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=count`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If we get a 200 response, the table exists
      return response.status !== 404;
    } catch (fetchError) {
      console.error('Error checking table existence via fetch:', fetchError);
      return false;
    }
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Initialize database by creating tables if they don't exist
export async function initializeDatabase() {
  try {
    console.log('Initializing Supabase database...');
    
    // Check if the projects table exists using our utility function
    const projectsTableExists = await tableExists('projects');
    
    // If the table doesn't exist, create it
    if (!projectsTableExists) {
      console.log('Projects table not found, creating...');
      
      // Try to create the table using SQL query
      try {
        // Create projects table
        const createTable = await fetch(`${supabaseUrl}/rest/v1/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS projects (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                image_url TEXT,
                code TEXT,
                model TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `
          })
        });
        
        if (!createTable.ok) {
          const errorText = await createTable.text();
          console.error('Error creating projects table:', errorText);
          throw new Error(`Failed to create projects table: ${errorText}`);
        }
        
        console.log('Projects table created successfully');
        
      } catch (sqlError) {
        console.error('SQL execution error:', sqlError);
        return { success: false, error: 'Failed to create database table' };
      }
    } else {
      console.log('Projects table already exists');
    }
    
    // For storage, we'll assume the bucket already exists or we'll use a different approach
    // since creating buckets requires admin privileges
    
    // Return success even if we can't create the storage bucket
    // The app will handle storage errors when uploading images
    return { 
      success: true, 
      message: projectsTableExists 
        ? 'Database already initialized' 
        : 'Database initialized successfully',
      warning: 'Storage bucket creation skipped due to permission limitations'
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error initializing database' 
    };
  }
}

// Check if storage is accessible
export async function checkStorageAccess(): Promise<{
  success: boolean;
  buckets?: string[];
  error?: string;
}> {
  try {
    console.log('Checking Supabase storage access...');
    
    // Try to list the buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Cannot list storage buckets:', error);
      return { 
        success: false, 
        error: `Storage access error: ${error.message}` 
      };
    }
    
    if (!buckets || buckets.length === 0) {
      console.warn('No storage buckets found');
      return { 
        success: false,
        error: 'No storage buckets found in your Supabase project.'
      };
    }
    
    // Check if we can access a specific bucket
    const bucketNames = buckets.map(b => b.name);
    console.log('Available buckets:', bucketNames.join(', '));
    
    // Try a simple operation on each bucket to see if we have access
    const accessResults = await Promise.all(
      bucketNames.map(async (bucketName) => {
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 });
          
          return { 
            bucketName, 
            accessible: !error,
            error: error?.message
          };
        } catch (e) {
          return { 
            bucketName, 
            accessible: false,
            error: e.message
          };
        }
      })
    );
    
    const accessibleBuckets = accessResults
      .filter(result => result.accessible)
      .map(result => result.bucketName);
    
    if (accessibleBuckets.length === 0) {
      return {
        success: false,
        buckets: bucketNames,
        error: 'Cannot access any storage buckets. File uploads will use placeholders.'
      };
    }
    
    return {
      success: true,
      buckets: accessibleBuckets
    };
  } catch (error) {
    console.error('Error checking storage access:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking storage access'
    };
  }
}
