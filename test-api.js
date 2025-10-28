// Simple test script to check if APIs are working
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  console.log('🧪 Testing Backend APIs...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Endpoint...');
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: Products Endpoint
  try {
    console.log('\n2️⃣ Testing Products Endpoint...');
    const response = await fetch('http://localhost:5000/api/products');
    const data = await response.json();
    console.log('✅ Products:', data.length ? `Found ${data.length} products` : 'No products found');
  } catch (error) {
    console.log('❌ Products Failed:', error.message);
  }

  // Test 3: Like Endpoint (POST)
  try {
    console.log('\n3️⃣ Testing Like Endpoint...');
    const response = await fetch('http://localhost:5000/api/likes/test-product-123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user' })
    });
    const data = await response.json();
    console.log('✅ Like API:', data);
  } catch (error) {
    console.log('❌ Like Failed:', error.message);
  }

  // Test 4: Auth Endpoint
  try {
    console.log('\n4️⃣ Testing Auth Endpoint...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123'
      })
    });
    const data = await response.json();
    console.log('✅ Auth API:', data);
  } catch (error) {
    console.log('❌ Auth Failed:', error.message);
  }

  console.log('\n🏁 API Testing Complete!');
}

testAPI();
