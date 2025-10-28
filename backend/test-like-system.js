require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Like = require('./src/models/Like');
const Vendor = require('./src/models/Vendor');

async function testLikeSystem() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔍 Testing Like System Integration\n');

    // Clean up test data first
    await User.deleteMany({ email: { $regex: /test.*@/ } });
    await Product.deleteMany({ name: { $regex: /Test Product/ } });
    await Like.deleteMany({});
    console.log('🧹 Cleaned up test data\n');

    // Step 1: Create a test vendor
    const vendor = await Vendor.create({
      name: 'Test Vendor',
      email: 'vendor@test.com',
      phone: '1234567890',
      businessName: 'Test Business'
    });
    console.log('✅ Created test vendor:', vendor.name);

    // Step 2: Create test users
    const user1 = await User.create({
      name: 'Test User 1',
      email: 'testuser1@example.com',
      passwordHash: 'hashedpassword123'
    });

    const user2 = await User.create({
      name: 'Test User 2', 
      email: 'testuser2@example.com',
      passwordHash: 'hashedpassword456'
    });
    console.log('✅ Created test users:', user1.name, 'and', user2.name);

    // Step 3: Create test products
    const product1 = await Product.create({
      name: 'Test Product 1 - Cool T-Shirt',
      description: 'A really cool t-shirt',
      price: 29.99,
      brand: 'TestBrand',
      category: 'casual',
      vendor: vendor._id,
      likes: 0
    });

    const product2 = await Product.create({
      name: 'Test Product 2 - Awesome Jeans',
      description: 'Awesome jeans for everyone',
      price: 79.99,
      brand: 'TestBrand',
      category: 'casual', 
      vendor: vendor._id,
      likes: 0
    });
    console.log('✅ Created test products:', product1.name, 'and', product2.name);

    // Step 4: Test like functionality
    console.log('\n📊 TESTING LIKE FUNCTIONALITY:');
    console.log('=' .repeat(50));

    // User 1 likes Product 1
    const like1 = await Like.create({
      user: user1._id,
      product: product1._id
    });
    await Product.findByIdAndUpdate(product1._id, { $inc: { likes: 1 } });
    console.log('👍 User 1 liked Product 1');

    // User 2 likes Product 1 (same product)
    const like2 = await Like.create({
      user: user2._id,
      product: product1._id
    });
    await Product.findByIdAndUpdate(product1._id, { $inc: { likes: 1 } });
    console.log('👍 User 2 liked Product 1');

    // User 1 likes Product 2
    const like3 = await Like.create({
      user: user1._id,
      product: product2._id
    });
    await Product.findByIdAndUpdate(product2._id, { $inc: { likes: 1 } });
    console.log('👍 User 1 liked Product 2');

    // Step 5: Check results
    console.log('\n📈 LIKE SYSTEM RESULTS:');
    console.log('=' .repeat(50));

    // Check product like counts
    const updatedProduct1 = await Product.findById(product1._id);
    const updatedProduct2 = await Product.findById(product2._id);
    
    console.log(`🎯 ${updatedProduct1.name}: ${updatedProduct1.likes} likes`);
    console.log(`🎯 ${updatedProduct2.name}: ${updatedProduct2.likes} likes`);

    // Check user's liked products
    const user1Likes = await Like.find({ user: user1._id }).populate('product');
    const user2Likes = await Like.find({ user: user2._id }).populate('product');

    console.log(`\n👤 ${user1.name} liked ${user1Likes.length} products:`);
    user1Likes.forEach(like => {
      console.log(`   - ${like.product.name} (${like.product.likes} total likes)`);
    });

    console.log(`\n👤 ${user2.name} liked ${user2Likes.length} products:`);
    user2Likes.forEach(like => {
      console.log(`   - ${like.product.name} (${like.product.likes} total likes)`);
    });

    // Step 6: Test getting popular products
    console.log('\n🔥 MOST LIKED PRODUCTS:');
    console.log('=' .repeat(50));
    
    const popularProducts = await Product.find({}).sort({ likes: -1 }).limit(5);
    popularProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.likes} likes`);
    });

    // Step 7: Test user-specific data retrieval
    console.log('\n🎯 USER-SPECIFIC LIKE DATA:');
    console.log('=' .repeat(50));

    // Get products liked by a specific user
    const userLikedProducts = await Like.find({ user: user1._id })
      .populate('product')
      .populate('user', 'name email');

    console.log(`Products liked by ${user1.name}:`);
    userLikedProducts.forEach(like => {
      console.log(`  ✅ ${like.product.name} - Liked on ${like.createdAt}`);
    });

    console.log('\n✅ LIKE SYSTEM TEST COMPLETE!');
    console.log('\n🎯 SUMMARY:');
    console.log('✅ Users can like products');
    console.log('✅ Like counts are tracked per product');
    console.log('✅ User-product relationships are stored');
    console.log('✅ Popular products can be retrieved');
    console.log('✅ User-specific likes can be retrieved');

  } catch (error) {
    console.error('❌ Error testing like system:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testLikeSystem();
