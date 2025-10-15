const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: false },
  avatar: { type: String, required: false },
  description: { type: String, required: false },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  address: { type: String, required: false },
  location: { type: String, required: false },
  followers: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);


