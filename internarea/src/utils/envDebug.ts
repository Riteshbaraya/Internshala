// Environment debugging utility
export const debugEnvironment = () => {
  console.log('🔍 Environment Debug Info');
  console.log('========================');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
  console.log('========================');
};

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

export const logApiCall = (endpoint: string, url: string) => {
  console.log(`🌐 API Call: ${endpoint}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
}; 