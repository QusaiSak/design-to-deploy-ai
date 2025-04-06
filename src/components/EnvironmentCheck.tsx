import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { testSupabaseConnection, initializeDatabase } from '@/lib/supabase';
import { useUser, useAuth } from '@clerk/clerk-react';
import { syncClerkUserWithSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function EnvironmentCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    checked: boolean;
    connected: boolean;
    error?: string;
    warning?: string;
  }>({ checked: false, connected: false });
  
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useAuth();

  // Check environment variables
  useEffect(() => {
    const requiredVars = [
      { name: 'VITE_OPENROUTER_API_KEY', value: import.meta.env.VITE_OPENROUTER_API_KEY },
      { name: 'VITE_SUPABASE_URL', value: import.meta.env.VITE_SUPABASE_URL },
      { name: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env.VITE_SUPABASE_ANON_KEY }
    ];

    const missing = requiredVars
      .filter(v => !v.value)
      .map(v => v.name);

    setMissingVars(missing);
    
    // Only check Supabase if the required variables are present
    if (!missing.includes('VITE_SUPABASE_URL') && !missing.includes('VITE_SUPABASE_ANON_KEY')) {
      checkSupabaseConnection();
    }
  }, []);
  
  // Sync Clerk user with Supabase when user is loaded
  useEffect(() => {
    if (isUserLoaded && user && supabaseStatus.connected) {
      const syncUserAuth = async () => {
        try {
          const token = await getToken();
          if (token) {
            console.log('Got Clerk token, syncing with Supabase...');
            const result = await syncClerkUserWithSupabase(token);
            
            if (!result.success) {
              console.error('Failed to sync Clerk user with Supabase:', result.error);
              setSupabaseStatus(prev => ({
                ...prev,
                warning: 'Authentication sync failed. Project saving may not work correctly.'
              }));
            } else {
              console.log('Successfully synced Clerk user with Supabase');
              
              // Show warning if using anonymous session
              if (result.warning && result.warning.includes('anonymous')) {
                setSupabaseStatus(prev => ({
                  ...prev,
                  warning: 'Using anonymous authentication mode. Some features may be limited.'
                }));
                
                toast.warning('Using anonymous mode due to authentication issues', {
                  duration: 6000,
                });
              }
              
              // Now that we're authenticated, ensure database is set up
              try {
                console.log('Checking database initialization...');
                const initResult = await initializeDatabase();
                
                if (!initResult.success) {
                  console.error('Database initialization failed:', initResult.error);
                  setSupabaseStatus(prev => ({
                    ...prev,
                    warning: `Database initialization failed: ${initResult.error}`
                  }));
                  toast.error('Failed to initialize database. Project saving may not work correctly.');
                } else if (initResult.warning) {
                  console.warn('Database initialization warning:', initResult.warning);
                  setSupabaseStatus(prev => ({
                    ...prev,
                    warning: initResult.warning
                  }));
                  
                  // Show a more user-friendly message about storage permissions
                  if (initResult.warning.includes('storage') || initResult.warning.includes('bucket') || initResult.warning.includes('permission')) {
                    toast.warning('Storage features may have limited functionality. Images will be replaced with placeholders.', {
                      duration: 8000,
                    });
                  }
                } else {
                  console.log('Database successfully initialized:', initResult.message);
                  toast.success('Database initialized successfully');
                }
              } catch (initError) {
                console.error('Error during database initialization:', initError);
                setSupabaseStatus(prev => ({
                  ...prev,
                  warning: 'Error during database initialization. Project saving may not work correctly.'
                }));
              }
            }
          }
        } catch (error) {
          console.error('Error getting Clerk token:', error);
          setSupabaseStatus(prev => ({
            ...prev,
            warning: 'Failed to get authentication token. Project saving may not work correctly.'
          }));
        }
      };
      
      syncUserAuth();
    }
  }, [isUserLoaded, user, supabaseStatus.connected, getToken]);
  
  // Function to check Supabase connection
  const checkSupabaseConnection = async () => {
    try {
      const result = await testSupabaseConnection();
      
      setSupabaseStatus({
        checked: true,
        connected: result.success,
        error: result.success ? undefined : result.error,
        warning: result.warning
      });
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      setSupabaseStatus({
        checked: true,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error checking Supabase connection'
      });
    }
  };

  // If everything is OK, don't render anything
  if (missingVars.length === 0 && (!supabaseStatus.checked || (supabaseStatus.connected && !supabaseStatus.warning))) {
    return null;
  }

  return (
    <div className="space-y-4 mb-4">
      {missingVars.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Environment Variables</AlertTitle>
          <AlertDescription>
            <p>The following environment variables are missing:</p>
            <ul className="list-disc pl-5 mt-2">
              {missingVars.map(v => (
                <li key={v}>{v}</li>
              ))}
            </ul>
            <p className="mt-2">
              Please ensure these variables are defined in your .env file and restart the application.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {supabaseStatus.checked && !supabaseStatus.connected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supabase Connection Error</AlertTitle>
          <AlertDescription>
            <p>Failed to connect to Supabase. Project saving will not work.</p>
            {supabaseStatus.error && <p className="mt-1">{supabaseStatus.error}</p>}
            <p className="mt-2">
              Please check your Supabase configuration and ensure the service is running.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {supabaseStatus.checked && supabaseStatus.connected && supabaseStatus.warning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {supabaseStatus.warning.includes('storage') || supabaseStatus.warning.includes('bucket') 
              ? 'Storage Access Limited' 
              : supabaseStatus.warning.includes('anonymous')
                ? 'Limited Authentication Mode'
                : 'Supabase Warning'}
          </AlertTitle>
          <AlertDescription>
            <p>{supabaseStatus.warning}</p>
            {(supabaseStatus.warning.includes('storage') || supabaseStatus.warning.includes('bucket')) && (
              <div className="mt-2">
                <p className="font-medium">Project saving will still work with the following limitations:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Uploaded wireframe images will be replaced with placeholders</li>
                  <li>Your code and other project data will still be saved normally</li>
                </ul>
                <p className="mt-2 text-sm">
                  This is typically due to Row-Level Security (RLS) settings in your Supabase project.
                </p>
              </div>
            )}
            {supabaseStatus.warning.includes('anonymous') && (
              <div className="mt-2">
                <p className="font-medium">Using anonymous authentication mode with these limitations:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Projects will be saved with an anonymous user ID</li>
                  <li>You may not be able to access your saved projects in future sessions</li>
                  <li>This is a temporary workaround for JWT validation issues</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 