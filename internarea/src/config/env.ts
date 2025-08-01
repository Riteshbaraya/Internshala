// Environment configuration
export const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'your_actual_google_maps_api_key_here',
  WEATHER_API_KEY: process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'your_actual_weather_api_key_here',
};

// Debug function
export const debugConfig = () => {
  console.log('🔍 Config Debug:');
  console.log('================================');
  console.log(`✅ API_URL: ${config.API_URL}`);
  console.log(`✅ GOOGLE_MAPS_API_KEY: ${config.GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`✅ WEATHER_API_KEY: ${config.WEATHER_API_KEY ? 'SET' : 'NOT SET'}`);
  console.log('================================');
}; 