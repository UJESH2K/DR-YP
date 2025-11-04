const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.Mixed, required: true, index: true }, // Allow both ObjectId and string for anonymous users
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
}, { timestamps: true });

LikeSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);


