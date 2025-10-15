const express = require('express');
const Product = require('../models/Product');
const Like = require('../models/Like');
const router = express.Router();

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
router.post('/:id/like', async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId; // Placeholder
    const productId = req.params.id;
    await Like.updateOne({ user: userId, product: productId }, {}, { upsert: true });
    await Product.findByIdAndUpdate(productId, { $inc: { likes: 1 } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id/unlike
router.delete('/:id/unlike', async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId; // Placeholder
    const productId = req.params.id;
    await Like.deleteOne({ user: userId, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { likes: -1 } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


