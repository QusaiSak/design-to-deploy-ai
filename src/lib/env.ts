
// Environment variable handling

// Get environment variables with fallbacks
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
  
  console.warn(`Environment variable ${key} not found, using fallback value`);
  return fallback;
};

// Environment variables used in the app
export const ENV = {
  OPENROUTER_API_KEY: getEnv('VITE_OPENROUTER_API_KEY', ''),
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY', ''),
  CLERK_PUBLISHABLE_KEY: getEnv('VITE_CLERK_PUBLISHABLE_KEY', '')
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

// Add environment variables to window for debugging in non-production environments
if (import.meta.env.DEV) {
  // @ts-ignore
  window.__envStatus = validateEnv();
  console.log('Environment validation:', validateEnv());
} 
