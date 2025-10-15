const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: false },
  price: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  brand: { type: String, required: false, index: true },
  category: { type: String, required: false, index: true },
  sizes: { type: [String], default: [] },
  specifications: { type: [{ label: String, value: String }], default: [] },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);


