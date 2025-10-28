// Test the exact API calls that the frontend will make
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFrontendAPIs() {
  console.log('🎯 Testing Frontend API Integration...\n');

  // Test 1: User likes a product (from home screen)
  try {
    console.log('1️⃣ Testing LIKE interaction (from home screen swipe)...');
    const response = await fetch('http://localhost:5000/api/likes/casual_1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_12345',
        productId: 'casual_1',
        action: 'like',
        timestamp: new Date().toISOString()
      })
    });
    const data = await response.json();
    console.log('✅ Like Response:', data);
  } catch (error) {
    console.log('❌ Like Failed:', error.message);
  }

  // Test 2: User adds to cart (from home screen swipe down)
  try {
    console.log('\n2️⃣ Testing CART interaction (from home screen swipe down)...');
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_12345',
        productId: 'casual_1',
        action: 'cart',
        items: [{ productId: 'casual_1', quantity: 1 }],
        status: 'cart',
        timestamp: new Date().toISOString()
      })
    });
    const data = await response.json();
    console.log('✅ Cart Response:', data);
  } catch (error) {
    console.log('❌ Cart Failed:', error.message);
  }

  // Test 3: User dislikes a product (from home screen swipe left)
  try {
    console.log('\n3️⃣ Testing DISLIKE interaction (from home screen swipe left)...');
    const response = await fetch('http://localhost:5000/api/likes/casual_2', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_12345',
        productId: 'casual_2',
        action: 'dislike',
        timestamp: new Date().toISOString()
      })
    });
    const data = await response.json();
    console.log('✅ Dislike Response:', data);
  } catch (error) {
    console.log('❌ Dislike Failed:', error.message);
  }

  // Test 4: User registration (from auth screen)
  try {
    console.log('\n4️⃣ Testing USER REGISTRATION (from auth screen)...');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'temp_password'
      })
    });
    const data = await response.json();
    console.log('✅ Registration Response:', data);
  } catch (error) {
    console.log('❌ Registration Failed:', error.message);
  }

  console.log('\n🚀 Frontend Integration Test Complete!');
  console.log('\n📱 Your frontend will now send these exact API calls when users:');
  console.log('   • Swipe right (like) → POST /api/likes/{productId}');
  console.log('   • Swipe left (dislike) → DELETE /api/likes/{productId}');
  console.log('   • Swipe down (cart) → POST /api/orders');
  console.log('   • Login/Register → POST /api/auth/register');
}

testFrontendAPIs();
