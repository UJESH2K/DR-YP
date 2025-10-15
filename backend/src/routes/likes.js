const express = require('express');
const Like = require('../models/Like');
const Product = require('../models/Product');
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
    const userId = req.user?._id || req.body.userId; // Placeholder
    const productId = req.params.productId;
    await Like.updateOne({ user: userId, product: productId }, {}, { upsert: true });
    await Product.findByIdAndUpdate(productId, { $inc: { likes: 1 } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

// DELETE /api/likes/:productId
router.delete('/:productId', async (req, res, next) => {
  try {
    const userId = req.user?._id || req.body.userId; // Placeholder
    const productId = req.params.productId;
    await Like.deleteOne({ user: userId, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { likes: -1 } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;


