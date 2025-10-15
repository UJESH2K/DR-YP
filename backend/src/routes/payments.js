const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// POST /api/payments/create-intent (mock)
router.post('/create-intent', async (req, res, next) => {
  try {
    const { amount } = req.body;
    const order = {
      id: `order_${Date.now()}`,
      amount,
      currency: 'INR',
      status: 'created',
    };
    res.json(order);
  } catch (error) { next(error); }
});

// POST /api/payments/verify (signature verify mock)
router.post('/verify', async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret';
    const generated = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    res.json({ verified: generated === signature });
  } catch (error) { next(error); }
});

module.exports = router;


