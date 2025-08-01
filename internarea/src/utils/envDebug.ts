// Environment variable debugging utility
// Removed debugEnvVars and related debug code as requested

// Check if we're in development mode
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Get API URL with fallback
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}; 