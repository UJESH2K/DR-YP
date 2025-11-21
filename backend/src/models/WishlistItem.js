const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
}, {
  timestamps: true,
});

// Add a unique compound index to prevent duplicate wishlist items for the same user and product
WishlistItemSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', WishlistItemSchema);
