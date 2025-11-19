const express = require('express');
const Product = require('../models/Product');
const Like = require('../models/Like');
const { protect } = require('../middleware/auth');
const Vendor = require('../models/Vendor');
const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Vendor only)
router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden: Only vendors can create products' });
    }

    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found for this user' });
    }

    const { name, description, price, category, stock, images } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images,
      vendor: vendor._id,
      brand: vendor.name, // Assuming vendor name is the brand
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { brand, category, search } = req.query;
    const filter = { isActive: true };
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (search) filter.name = new RegExp(search, 'i');

    const products = await Product.find(filter).populate('vendor').limit(50);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// POST /api/products/:id/like
router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;
    await Like.updateOne({ user: userId, product: productId }, {}, { upsert: true });
    await Product.findByIdAndUpdate(productId, { $inc: { likes: 1 } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id/unlike
router.delete('/:id/unlike', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;
    await Like.deleteOne({ user: userId, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { likes: -1 } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


