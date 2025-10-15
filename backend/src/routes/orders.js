const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// POST /api/orders
router.post('/', async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) { next(error); }
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


