require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDatabase = require('./src/config/database');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id'],
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Log middleware
app.use((req, res, next) => {
  console.log(`🔥 API CALL: ${req.method} ${req.path}`);
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

const PORT = process.env.PORT || 5000;

// ⬇️ START SERVER ONLY AFTER DB CONNECTS
(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDatabase(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected!");

    // ⬇️ ROUTES MUST BE LOADED AFTER DB CONNECTS
    app.use('/api/auth', require('./src/routes/auth'));
    app.use('/api/products', require('./src/routes/products'));
    app.use('/api/vendors', require('./src/routes/vendors'));
    app.use('/api/orders', require('./src/routes/orders'));
    app.use('/api/likes', require('./src/routes/likes'));
    app.use('/api/wishlist', require('./src/routes/wishlist'));
    app.use('/api/payments', require('./src/routes/payments'));
    app.use('/api/users', require('./src/routes/users'));
    app.use('/api/upload', require('./src/routes/upload'));
    app.use('/api/analytics', require('./src/routes/analytics'));
    app.use('/api/analytics', require('./src/routes/analytics/vendor'));

    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
  }
})();
