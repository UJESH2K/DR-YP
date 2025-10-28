require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoDB() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set ✅' : 'Missing ❌');
  
  if (!process.env.MONGO_URI) {
    console.log('❌ MONGO_URI is not set in .env file');
    return;
  }

  try {
    console.log('🔌 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const doc = new TestModel({ test: 'Connection successful' });
    await doc.save();
    console.log('✅ Test document created successfully!');
    
    await TestModel.deleteOne({ test: 'Connection successful' });
    console.log('✅ Test document deleted successfully!');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n💡 Solution: Add your IP to MongoDB Atlas whitelist');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Select your cluster');
      console.log('3. Click "Network Access"');
      console.log('4. Click "Add IP Address"');
      console.log('5. Add your current IP or use 0.0.0.0/0 for all IPs');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testMongoDB();
