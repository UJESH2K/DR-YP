// Test with real user IDs from the database
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testWorkingLikes() {
  console.log('🎯 TESTING LIKES WITH REAL USER IDs\n');

  let userId = null;

  // Step 1: Create a user first
  try {
    console.log('1️⃣ CREATING USER');
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Like Test User',
        email: `liketest${Date.now()}@example.com`,
        password: 'testpass123'
      })
    });
    const data = await response.json();
    
    if (data.user && data.user._id) {
      userId = data.user._id;
      console.log('✅ User created with ID:', userId);
    } else {
      console.log('❌ Failed to get user ID:', data);
      return;
    }
  } catch (error) {
    console.log('❌ User creation failed:', error.message);
    return;
  }

  // Step 2: Like a product with real user ID
  try {
    console.log('\n2️⃣ LIKING PRODUCT WITH REAL USER ID');
    console.log('POST http://localhost:5000/api/likes/casual_1');
    
    const response = await fetch('http://localhost:5000/api/likes/casual_1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,  // Use real MongoDB ObjectId
        productId: 'casual_1',
        action: 'like'
      })
    });
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('🎉 SUCCESS! Like was stored in MongoDB!');
    }
  } catch (error) {
    console.log('❌ Like failed:', error.message);
  }

  // Step 3: Like another product
  try {
    console.log('\n3️⃣ LIKING ANOTHER PRODUCT');
    console.log('POST http://localhost:5000/api/likes/formal_1');
    
    const response = await fetch('http://localhost:5000/api/likes/formal_1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        productId: 'formal_1',
        action: 'like'
      })
    });
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Like failed:', error.message);
  }

  // Step 4: Unlike a product
  try {
    console.log('\n4️⃣ UNLIKING PRODUCT');
    console.log('DELETE http://localhost:5000/api/likes/casual_1');
    
    const response = await fetch('http://localhost:5000/api/likes/casual_1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        productId: 'casual_1',
        action: 'dislike'
      })
    });
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Unlike failed:', error.message);
  }

  console.log('\n🎯 TEST COMPLETE!');
  console.log('\n📊 NOW CHECK MONGODB ATLAS:');
  console.log('1. Go to https://cloud.mongodb.com/');
  console.log('2. Browse Collections → likes');
  console.log('3. You should see new like documents!');
  console.log('4. User ID:', userId);
}

testWorkingLikes();
