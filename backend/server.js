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

// Custom logging middleware to track API calls
app.use((req, res, next) => {
  console.log(`\n🔥 API CALL: ${req.method} ${req.path}`);
  console.log(`📱 From: ${req.get('origin') || 'localhost'}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

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

const PORT = process.env.PORT || 5000; // Backend runs on port 5000

// Start server
(async () => {
  try {
    await connectDatabase(process.env.MONGO_URI);
  } catch (error) {
    console.warn('Starting server without database connection:', error.message);
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} and accessible from all interfaces`));
})();

module.exports = app;


