const express = require('express');
const Product = require('../models/Product');
const Like = require('../models/Like');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Vendor only)
router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden: Only vendors can create products' });
    }
    const productData = { ...req.body, vendor: req.user._id };
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') res.status(400).json({ message: error.message });
    else next(error);
  }
});

// @route   GET /api/products
// @desc    Get all active products with filtering
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { brand, category, search, vendor, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (search) filter.name = new RegExp(search, 'i');
    if (vendor) filter.vendor = vendor;
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate({ path: 'vendor', select: 'name' })
      .limit(50)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/brands
// @desc    Get a unique list of all brands
// @access  Public
router.get('/brands', async (req, res, next) => {
  try {
    const brands = await Product.find({ isActive: true }).distinct('brand');
    res.json(brands);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/categories
// @desc    Get a unique list of all categories
// @access  Public
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Product.find({ isActive: true }).distinct('category');
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Vendor only)
router.put('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden: Only vendors can edit products' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure the user updating the product is the one who created it
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this product' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') res.status(400).json({ message: error.message });
    else next(error);
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Vendor only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden: Only vendors can delete products' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure the user deleting the product is the one who created it
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;