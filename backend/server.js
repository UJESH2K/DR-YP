require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDatabase = require('./src/config/database');

// Route imports
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const vendorRoutes = require('./src/routes/vendors');
const orderRoutes = require('./src/routes/orders');
const likeRoutes = require('./src/routes/likes');
const paymentRoutes = require('./src/routes/payments');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/payments', paymentRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;

// Start server
(async () => {
  await connectDatabase(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();

module.exports = app;


