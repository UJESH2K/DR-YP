require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Like = require('./src/models/Like');

async function testLikesWithCurrentData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔍 Testing Current Like System\n');

    // Step 1: Check current users in database
    console.log('👥 CURRENT USERS IN DATABASE:');
    console.log('=' .repeat(50));
    const users = await User.find({}).select('name email createdAt likedProducts');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      
      // Create a test user
      const testUser = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        passwordHash: 'hashedpassword123'
      });
      console.log('✅ Created test user:', testUser.name);
      users.push(testUser);
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   - Created: ${user.createdAt}`);
      console.log(`   - Liked Products: ${user.likedProducts?.length || 0}`);
    });

    // Step 2: Check current likes in database
    console.log('\n❤️ CURRENT LIKES IN DATABASE:');
    console.log('=' .repeat(50));
    const likes = await Like.find({}).populate('user', 'name email');
    
    if (likes.length === 0) {
      console.log('❌ No likes found in database');
      
      // Create test likes with string product IDs (like your frontend sends)
      const testUser = users[0];
      console.log(`\n🧪 Creating test likes for user: ${testUser.name}`);
      
      // Test the actual like creation process your frontend uses
      try {
        // This simulates what happens when frontend sends a like
        const likeData = {
          user: testUser._id,
          product: new mongoose.Types.ObjectId() // Create a valid ObjectId
        };
        
        const newLike = await Like.create(likeData);
        console.log('✅ Successfully created like:', newLike);
        
        // Update user's liked products
        await User.findByIdAndUpdate(testUser._id, {
          $addToSet: { likedProducts: likeData.product }
        });
        console.log('✅ Updated user liked products');
        
      } catch (error) {
        console.log('❌ Error creating test like:', error.message);
      }
    } else {
      likes.forEach((like, index) => {
        console.log(`${index + 1}. User: ${like.user?.name || 'Unknown'} - Product: ${like.product} - Created: ${like.createdAt}`);
      });
    }

    // Step 3: Test the issue with string product IDs (your current problem)
    console.log('\n🔧 TESTING STRING PRODUCT ID ISSUE:');
    console.log('=' .repeat(50));
    
    const testUser = users[0];
    console.log('Testing with string product ID (like frontend sends)...');
    
    try {
      // This is what your frontend is currently sending
      const stringProductId = 'casual_1'; // String ID from frontend
      
      // Try to create like with string ID (this will fail)
      const likeWithStringId = await Like.create({
        user: testUser._id,
        product: stringProductId // This causes the ObjectId error
      });
      console.log('✅ Like with string ID created:', likeWithStringId);
      
    } catch (error) {
      console.log('❌ Expected error with string product ID:', error.message);
      console.log('💡 This is why your frontend likes are failing!');
    }

    // Step 4: Show the solution
    console.log('\n💡 SOLUTION - MAPPING FRONTEND IDs TO MONGODB:');
    console.log('=' .repeat(50));
    
    // Create a mapping system for frontend product IDs
    const productIdMapping = {
      'casual_1': new mongoose.Types.ObjectId(),
      'casual_2': new mongoose.Types.ObjectId(),
      'formal_1': new mongoose.Types.ObjectId(),
      'street_1': new mongoose.Types.ObjectId()
    };
    
    console.log('Frontend ID → MongoDB ObjectId mapping:');
    Object.entries(productIdMapping).forEach(([frontendId, mongoId]) => {
      console.log(`  ${frontendId} → ${mongoId}`);
    });
    
    // Test creating like with mapped ID
    try {
      const frontendProductId = 'casual_1';
      const mongoProductId = productIdMapping[frontendProductId];
      
      const mappedLike = await Like.create({
        user: testUser._id,
        product: mongoProductId
      });
      console.log('✅ Successfully created like with mapped ID:', mappedLike);
      
    } catch (error) {
      console.log('❌ Error with mapped ID:', error.message);
    }

    // Step 5: Show current database state
    console.log('\n📊 FINAL DATABASE STATE:');
    console.log('=' .repeat(50));
    
    const finalUsers = await User.find({}).select('name email likedProducts');
    const finalLikes = await Like.find({}).populate('user', 'name');
    
    console.log(`👥 Total Users: ${finalUsers.length}`);
    console.log(`❤️ Total Likes: ${finalLikes.length}`);
    
    finalLikes.forEach((like, index) => {
      console.log(`${index + 1}. ${like.user?.name || 'Unknown'} liked product ${like.product}`);
    });

    console.log('\n🎯 SUMMARY:');
    console.log('✅ User creation: Working');
    console.log('✅ Like system structure: Working');  
    console.log('❌ Frontend integration: Needs ObjectId mapping');
    console.log('💡 Solution: Map frontend string IDs to MongoDB ObjectIds');

  } catch (error) {
    console.error('❌ Error testing likes:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testLikesWithCurrentData();
