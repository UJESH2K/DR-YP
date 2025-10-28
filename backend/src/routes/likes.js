const express = require('express');
const Like = require('../models/Like');
const Product = require('../models/Product');
const { mapProductId, isValidProductId } = require('../utils/productMapping');
const router = express.Router();

// GET /api/likes
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?._id || req.query.userId; // Placeholder
    const likes = await Like.find({ user: userId }).populate('product');
    res.json(likes.map(l => l.product));
  } catch (error) { next(error); }
});

// POST /api/likes/:productId
router.post('/:productId', async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId || 'anonymous_user';
    const frontendProductId = req.params.productId;
    
    // Map frontend product ID to MongoDB ObjectId
    if (!isValidProductId(frontendProductId)) {
      return res.status(400).json({ message: `Invalid product ID: ${frontendProductId}` });
    }
    
    const mongoProductId = mapProductId(frontendProductId);
    
    // Create or update like
    await Like.updateOne(
      { user: userId, product: mongoProductId }, 
      { user: userId, product: mongoProductId }, 
      { upsert: true }
    );
    
    console.log(`✅ User ${userId} liked product ${frontendProductId} (${mongoProductId})`);
    res.json({ 
      success: true, 
      message: `Successfully liked ${frontendProductId}`,
      productId: frontendProductId,
      mongoId: mongoProductId
    });
  } catch (error) { next(error); }
});

// DELETE /api/likes/:productId
router.delete('/:productId', async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId || 'anonymous_user';
    const frontendProductId = req.params.productId;
    
    // Map frontend product ID to MongoDB ObjectId
    if (!isValidProductId(frontendProductId)) {
      return res.status(400).json({ message: `Invalid product ID: ${frontendProductId}` });
    }
    
    const mongoProductId = mapProductId(frontendProductId);
    
    // Remove like
    await Like.deleteOne({ user: userId, product: mongoProductId });
    
    console.log(`❌ User ${userId} unliked product ${frontendProductId} (${mongoProductId})`);
    res.json({ 
      success: true, 
      message: `Successfully unliked ${frontendProductId}`,
      productId: frontendProductId,
      mongoId: mongoProductId
    });
  } catch (error) { next(error); }
});

module.exports = router;


