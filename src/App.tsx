import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import AppLayout from "./components/AppLayout";
import { useEffect } from "react";
import { validateEnv, ENV } from "./lib/env";
import { testSupabaseConnection } from "./lib/supabase";

// Pages
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectEdit from "./pages/ProjectEdit";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const CLERK_PUBLISHABLE_KEY = ENV.CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

// Environment check component
const EnvironmentCheck = () => {
  useEffect(() => {
    // Check environment variables
    const { valid, missing } = validateEnv();
    
    if (!valid) {
      console.error('Missing environment variables:', missing);
      
      if (missing.includes('OPENROUTER_API_KEY')) {
        toast.error(
          'OpenRouter API key is missing. Features requiring AI will not work.',
          {
            description: 'Please check your .env file and restart the application.',
            duration: 10000,
          }
        );
      }

      if (missing.includes('SUPABASE_URL') || missing.includes('SUPABASE_ANON_KEY')) {
        toast.error(
          'Supabase configuration is missing. Project saving will not work.',
          {
            description: 'Please check your .env file and restart the application.',
            duration: 10000,
          }
        );
      }
    }

    // Test Supabase connection
    const checkSupabaseConnection = async () => {
      try {
        const result = await testSupabaseConnection();
        
        if (!result.success) {
          toast.error(
            'Failed to connect to Supabase. Project saving will not work.',
            {
              description: result.error || 'Please check your Supabase configuration.',
              duration: 10000,
            }
          );
        } else if (result.warning) {
          toast.warning(
            'Supabase connection issue detected.',
            {
              description: result.warning,
              duration: 8000,
            }
          );
        }
      } catch (error) {
        console.error('Error testing Supabase connection:', error);
        toast.error(
          'Failed to test Supabase connection.',
          {
            description: 'Project saving may not work correctly.',
            duration: 8000,
          }
        );
      }
    };

    // Only run the test if required environment variables are present
    if (!missing.includes('SUPABASE_URL') && !missing.includes('SUPABASE_ANON_KEY')) {
      checkSupabaseConnection();
    }
  }, []);
  
  return null;
};

const ClerkProviderWithRoutes = () => (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <Routes>
      <Route
        path="/sign-in/*"
        element={<SignIn routing="path" path="/sign-in" />}
      />
      <Route
        path="/sign-up/*"
        element={<SignUp routing="path" path="/sign-up" />}
      />
      <Route
        element={
          <>
            <SignedIn>
              <AppLayout />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewProject />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/edit" element={<ProjectEdit />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ClerkProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <EnvironmentCheck />
      <BrowserRouter>
        <ClerkProviderWithRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
