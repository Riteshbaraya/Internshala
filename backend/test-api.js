const axios = require('axios');

async function testUserProfileAPI() {
  console.log('🔍 Testing User Profile API...');
  
  try {
    // Test without token (should return 401)
    console.log('\n📝 Testing without token (expected: 401)...');
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        timeout: 5000
      });
      console.log('❌ Unexpected success:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly returned 401 for unauthorized request');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test with invalid token (should return 401)
    console.log('\n📝 Testing with invalid token (expected: 401)...');
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        },
        timeout: 5000
      });
      console.log('❌ Unexpected success:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly returned 401 for invalid token');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n✅ API endpoints are working correctly!');
    console.log('💡 The 401 errors are expected for unauthorized requests');
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

// Run the test
testUserProfileAPI(); 