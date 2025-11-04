const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const router = express.Router();

// POST /api/orders
router.post('/', async (req, res, next) => {
  try {
    const { userId, productId, action, items, status } = req.body;
    
    // Handle cart actions from frontend
    if (action === 'cart' && productId) {
      const { mapProductId, isValidProductId } = require('../utils/productMapping');
      
      if (!isValidProductId(productId)) {
        return res.status(400).json({ message: `Invalid product ID: ${productId}` });
      }
      
      const mongoProductId = mapProductId(productId);
      
      // Create a simplified cart entry (not a full order)
      const cartEntry = {
        user: userId || 'anonymous_user',
        vendor: new mongoose.Types.ObjectId('507f1f77bcf86cd799439999'), // Default vendor for cart items
        items: [{
          product: mongoProductId,
          quantity: 1,
          price: 29.99, // Default price for cart items
          size: 'M' // Default size
        }],
        totalAmount: 29.99,
        status: 'cart',
        shippingAddress: 'TBD', // To be determined when converting cart to order
        orderNumber: `CART_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Unique cart identifier
      };
      
      const order = await Order.create(cartEntry);
      console.log(`🛒 User ${userId} added product ${productId} to cart (${mongoProductId})`);
      res.status(201).json({ 
        success: true, 
        message: `Successfully added ${productId} to cart`,
        order: order 
      });
    } else {
      // Handle regular order creation
      const order = await Order.create(req.body);
      res.status(201).json(order);
    }
  } catch (error) { 
    console.error('Order creation error:', error);
    next(error); 
  }
});

// GET /api/orders
router.get('/', async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { next(error); }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) { next(error); }
});

module.exports = router;


