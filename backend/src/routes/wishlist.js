const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const WishlistItem = require('../models/WishlistItem');
const Product = require('../models/Product');

// @route   GET /api/wishlist
// @desc    Get all products in the current user's wishlist
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const wishlistItems = await WishlistItem.find({ user: req.user._id }).populate('product');
    res.json(wishlistItems.map(item => item.product));
  } catch (error) { 
    next(error); 
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add a product to the user's wishlist
// @access  Private
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: `Invalid product ID: ${productId}` });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingItem = await WishlistItem.findOne({ user: userId, product: productId });
    if (existingItem) {
      return res.status(200).json({ success: true, message: 'Product already in wishlist.' });
    }

    await WishlistItem.create({ user: userId, product: productId });
    
    res.status(201).json({ success: true, message: `Successfully added ${productId} to wishlist.` });
  } catch (error) { 
    next(error); 
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove a product from the user's wishlist
// @access  Private
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: `Invalid product ID: ${productId}` });
    }

    await WishlistItem.findOneAndDelete({ user: userId, product: productId });
    
    res.json({ success: true, message: `Successfully removed ${productId} from wishlist.` });
  } catch (error) { 
    next(error); 
  }
});

module.exports = router;
