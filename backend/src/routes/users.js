const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { categories, colors, brands } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (categories && Array.isArray(categories)) {
      user.preferences.categories = categories;
    }
    if (colors && Array.isArray(colors)) {
      user.preferences.colors = colors;
    }
    if (brands && Array.isArray(brands)) {
      user.preferences.brands = brands;
    }

    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
