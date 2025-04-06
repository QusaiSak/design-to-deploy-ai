
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, ExternalLink } from 'lucide-react';
import { validateEnv, ENV } from '@/lib/env';
import { debugEnvVars } from '@/lib/openrouter';
import { useToast } from '@/hooks/use-toast';

export function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState(validateEnv());
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check environment variables on mount
    debugEnvVars();
    setEnvStatus(validateEnv());
  }, []);

  const handleRefreshCheck = () => {
    // Re-validate environment variables
    setEnvStatus(validateEnv());
    debugEnvVars();
    
    toast({
      title: "Environment Checked",
      description: "The environment variables have been checked",
    });
  };

  if (envStatus.valid) {
    return null; // Don't show anything if all required environment variables are set
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Environment Configuration Required</AlertTitle>
      <AlertDescription>
        <div>
          <p className="mb-2">
            Some required environment variables are missing. Your app will not function correctly until these are configured.
          </p>
          
          {expanded ? (
            <div className="mt-2 space-y-2">
              <p>The following environment variables need to be set:</p>
              <ul className="list-disc pl-5">
                {envStatus.missing.map(variable => (
                  <li key={variable}>{variable}</li>
                ))}
              </ul>
              
              <p className="mt-3">To fix this:</p>
              <ol className="list-decimal pl-5">
                <li>Create a <code>.env</code> file in the root of your project</li>
                <li>Add the missing variables with their values</li>
                <li>Restart your development server</li>
              </ol>
              
              <div className="mt-4 flex space-x-2">
                <Button onClick={handleRefreshCheck} size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Refresh Check
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpanded(false)}
                >
                  Hide Details
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setExpanded(true)}
            >
              Show Details
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
