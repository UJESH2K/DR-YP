const express = require('express');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const router = express.Router();

// GET /api/vendors/:id
router.get('/:id', async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) { next(error); }
});

// GET /api/vendors/:id/products
router.get('/:id/products', async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.params.id, isActive: true });
    res.json(products);
  } catch (error) { next(error); }
});

module.exports = router;


