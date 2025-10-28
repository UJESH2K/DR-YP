// Test the exact API calls that work with the new backend fixes
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPostmanStyle() {
  console.log('🧪 POSTMAN-STYLE API TESTS\n');
  console.log('Testing on: http://localhost:5000\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ HEALTH CHECK');
    console.log('GET http://localhost:5000/health');
    
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: User Registration
  try {
    console.log('2️⃣ USER REGISTRATION');
    console.log('POST http://localhost:5000/api/auth/register');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Postman Test User',
        email: 'postman.test@example.com',
        password: 'testpass123'
      })
    });
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Registration failed:', error.message);
  }

  // Test 3: Like Product (FIXED VERSION)
  try {
    console.log('3️⃣ LIKE PRODUCT (FIXED)');
    console.log('POST http://localhost:5000/api/likes/casual_1');
    
    const response = await fetch('http://localhost:5000/api/likes/casual_1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'anonymous_user',
        productId: 'casual_1',
        action: 'like'
      })
    });
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Like failed:', error.message);
  }

  // Test 4: Like Another Product
  try {
    console.log('4️⃣ LIKE ANOTHER PRODUCT');
    console.log('POST http://localhost:5000/api/likes/formal_1');
    
    const response = await fetch('http://localhost:5000/api/likes/formal_1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'anonymous_user',
        productId: 'formal_1',
        action: 'like'
      })
    });
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Like failed:', error.message);
  }

  // Test 5: Unlike Product
  try {
    console.log('5️⃣ UNLIKE PRODUCT');
    console.log('DELETE http://localhost:5000/api/likes/casual_1');
    
    const response = await fetch('http://localhost:5000/api/likes/casual_1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'anonymous_user',
        productId: 'casual_1',
        action: 'dislike'
      })
    });
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    console.log('');
  } catch (error) {
    console.log('❌ Unlike failed:', error.message);
  }

  console.log('🎯 POSTMAN TEST COMPLETE!');
  console.log('\n📋 TO TEST IN POSTMAN:');
  console.log('1. Use base URL: http://localhost:5001');
  console.log('2. Copy the exact requests above');
  console.log('3. Check MongoDB Atlas after each request');
  console.log('4. Look for new documents in "likes" collection');
}

testPostmanStyle();
