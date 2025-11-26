const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  line1: { type: String, required: false, trim: true },
  line2: { type: String, required: false, trim: true },
  city: { type: String, required: false, trim: true },
  state: { type: String, required: false, trim: true },
  pincode: { type: String, required: false, trim: true },
  country: { type: String, default: 'India' },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: false },
  avatar: { type: String, required: false },
  addresses: { type: [AddressSchema], default: [] },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  preferences: {
    currency: { type: String, default: 'USD' },
    categories: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    brands: { type: [String], default: [] },
  },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);


