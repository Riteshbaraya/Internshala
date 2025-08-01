const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

console.log('🧪 Testing API Endpoints...');
console.log('=====================================');
console.log(`🔗 Base URL: ${BASE_URL}`);

const endpoints = [
  '/health',
  '/api/internship',
  '/api/job',
  '/api/auth/login',
  '/api/user/profile'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n📡 Testing: ${endpoint}`);
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status || error.code}`);
    if (error.response) {
      console.log(`📝 Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Starting API tests...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    results.push({ endpoint, success });
  }
  
  console.log('\n📋 Test Results:');
  console.log('=====================================');
  
  results.forEach(({ endpoint, success }) => {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${endpoint}`);
  });
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n🎯 Summary: ${passed}/${total} endpoints working`);
  
  if (passed === total) {
    console.log('🎉 All endpoints are working correctly!');
  } else {
    console.log('⚠️  Some endpoints are not working. Check your server.');
  }
}

runTests().catch(console.error); 