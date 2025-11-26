
require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('./src/config/database');
const Product = require('./src/models/Product');

const VENDOR_ID = '691dfd25d9164020524efb23'; // From user log
const existingImages = [
  '/uploads/image-1763580295187-730158269.png',
  '/uploads/image-1763580295587-919170781.png',
  '/uploads/image-1763580295668-928245632.png',
  '/uploads/image-1763580295900-146606462.png',
];

const sampleProducts = [
  {
    name: 'Classic Denim Jacket',
    description: 'A timeless denim jacket for all seasons. Made with 100% organic cotton.',
    brand: 'Urban Threads',
    category: 'Jackets',
    tags: ['Outerwear', 'Denim', 'Casual'],
    basePrice: 899,
    stock: 50,
    images: [existingImages[0], existingImages[1]],
    vendor: VENDOR_ID,
    isActive: true,
  },
  {
    name: 'Graphic Print Hoodie',
    description: 'Comfortable and stylish hoodie with a unique front print.',
    brand: 'Street Vibe',
    category: 'Hoodies',
    tags: ['Streetwear', 'Comfort', 'Printed'],
    basePrice: 749,
    stock: 80,
    images: [existingImages[2], existingImages[3]],
    vendor: VENDOR_ID,
    isActive: true,
  },
  {
    name: 'Striped Linen Shirt',
    description: 'Light and breezy linen shirt, perfect for summer.',
    brand: 'Breezy Wear',
    category: 'Shirts',
    tags: ['Summer', 'Linen', 'Smart Casual'],
    basePrice: 699,
    stock: 65,
    images: [existingImages[1], existingImages[2]],
    vendor: VENDOR_ID,
    isActive: true,
  },
  {
    name: 'Cargo Trousers',
    description: 'Utility-style cargo trousers with multiple pockets.',
    brand: 'Urban Threads',
    category: 'Trousers',
    tags: ['Utility', 'Cargo', 'Streetwear'],
    basePrice: 999,
    stock: 40,
    images: [existingImages[3], existingImages[0]],
    vendor: VENDOR_ID,
    isActive: true,
  },
  {
    name: 'Vintage Wash Jeans',
    description: 'Relaxed fit jeans with a vintage wash effect.',
    brand: 'Denim Co.',
    category: 'Jeans',
    tags: ['Denim', 'Vintage', 'Relaxed Fit'],
    basePrice: 1199,
    options: [
      { name: 'Size', values: ['S', 'M', 'L'] },
      { name: 'Color', values: ['Light Wash', 'Dark Wash'] }
    ],
    variants: [
      { options: { Size: 'S', Color: 'Light Wash' }, stock: 10, price: 1199 },
      { options: { Size: 'M', Color: 'Light Wash' }, stock: 15, price: 1199 },
      { options: { Size: 'L', Color: 'Light Wash' }, stock: 12, price: 1199 },
      { options: { Size: 'S', Color: 'Dark Wash' }, stock: 8, price: 1249 },
      { options: { Size: 'M', Color: 'Dark Wash' }, stock: 18, price: 1249 },
      { options: { Size: 'L', Color: 'Dark Wash' }, stock: 10, price: 1249 },
    ],
    images: [existingImages[0], existingImages[3], existingImages[1]],
    vendor: VENDOR_ID,
    isActive: true,
  },
  {
    name: 'Leather Biker Jacket',
    description: 'Classic biker jacket made from high-quality faux leather.',
    brand: 'Street Vibe',
    category: 'Jackets',
    tags: ['Leather', 'Biker', 'Outerwear'],
    basePrice: 2499,
    stock: 25,
    images: [existingImages[2]],
    vendor: VENDOR_ID,
    isActive: true,
  }
];

const seedDB = async () => {
  try {
    await connectDatabase(process.env.MONGO_URI);
    console.log('Database connected for seeding...');

    // Clear existing products for this vendor to avoid duplicates
    await Product.deleteMany({ vendor: VENDOR_ID });
    console.log('Cleared old products for the vendor.');

    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} products have been successfully created!`);

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

seedDB();
