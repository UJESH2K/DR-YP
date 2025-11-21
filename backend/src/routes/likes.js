const express = require('express');
const Like = require('../models/Like');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth'); // Ensure protect is imported for auth
const mongoose = require('mongoose');
const router = express.Router();

// @route   GET /api/likes
// @desc    Get all products liked by the current user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const likes = await Like.find({ user: req.user._id }).populate('product');
    res.json(likes.map(l => l.product));
  } catch (error) { 
    next(error); 
  }
});

// @route   POST /api/likes/:productId
// @desc    Like a product
// @access  Private
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { _id: userId } = req.user;

    // Validate the product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: `Invalid product ID: ${productId}` });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the like already exists
    const existingLike = await Like.findOne({ user: userId, product: productId });
    if (existingLike) {
      return res.status(200).json({ success: true, message: 'Product already liked.' });
    }

    // Create the like and update the product's like count
    await Like.create({ user: userId, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { likes: 1 } });
    
    res.status(201).json({ success: true, message: `Successfully liked ${productId}` });
  } catch (error) { 
    next(error); 
  }
});

// @route   DELETE /api/likes/:productId
// @desc    Unlike a product
// @access  Private
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { _id: userId } = req.user;

    // Validate the product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: `Invalid product ID: ${productId}` });
    }

    // Find and delete the like
    const like = await Like.findOneAndDelete({ user: userId, product: productId });

    // If a like was deleted, decrement the product's like count
    if (like) {
      await Product.findByIdAndUpdate(productId, { $inc: { likes: -1 } });
    }
    
    res.json({ success: true, message: `Successfully unliked ${productId}` });
  } catch (error) { 
    next(error); 
  }
});

module.exports = router;