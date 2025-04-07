
export const getEnv = (key: string, fallback: string = ''): string => {
  if (import.meta.env[key] !== undefined) {
    return import.meta.env[key] as string;
  }
  
  // Try window.__env as an alternative source (useful for runtime environment variables)
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__env && window.__env[key]) {
    // @ts-ignore
    return window.__env[key];
  }
  
  return fallback;
};

// Environment variables used in the app
export const ENV = {
  OPENROUTER_API_KEY: getEnv('VITE_OPENROUTER_API_KEY', ''),
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY', ''),
  CLERK_PUBLISHABLE_KEY: getEnv('VITE_CLERK_PUBLISHABLE_KEY', '')
};

// Constants for the OpenRouter API
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_REFERER = typeof window !== 'undefined' ? window.location.origin : 'https://lovable.dev/';

// Function to get safe origin for CORS headers
export const getSafeOrigin = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return OPENROUTER_REFERER;
};

// Validate required environment variables
export const validateEnv = (): { valid: boolean; missing: string[] } => {
  const requiredVars = [
    'OPENROUTER_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredVars.filter(key => !ENV[key as keyof typeof ENV]);
  
  return {
    valid: missing.length === 0,
    missing
  };
};
