const axios = require('axios');

console.log('🔍 Quick API Test');
console.log('==================');

const BASE_URL = 'http://localhost:5000';

async function testHealth() {
  try {
    console.log('📡 Testing health endpoint...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log('📊 Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed');
    console.log('🔧 Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Start it with: npm start');
    }
    return false;
  }
}

async function testEndpoints() {
  const endpoints = ['/api/internship', '/api/job'];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      console.log(`📊 Data length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
    }
  }
}

async function runTest() {
  const healthOk = await testHealth();
  
  if (healthOk) {
    await testEndpoints();
  } else {
    console.log('\n🚨 Backend server needs to be started first!');
    console.log('💡 Run: cd backend && npm start');
  }
}

runTest().catch(console.error); 