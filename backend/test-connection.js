const axios = require('axios');

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health', {
      timeout: 5000
    });
    console.log('✅ Backend health check passed:', healthResponse.data);
    
    // Test API endpoint
    const apiResponse = await axios.get('http://localhost:5000/api/user/profile', {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 5000
    });
    console.log('✅ API endpoint accessible');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 5000');
      console.log('💡 Please start the backend server with: npm start');
    } else if (error.code === 'ECONNABORTED') {
      console.log('❌ Request timeout - server might be slow to respond');
    } else if (error.response) {
      console.log('⚠️ Server responded with status:', error.response.status);
      console.log('📝 This might be expected for unauthorized requests');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Run the test
testBackendConnection(); 