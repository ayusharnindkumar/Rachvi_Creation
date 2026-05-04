require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'null'], credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/products',require('./routes/products'));
app.use('/api/orders',  require('./routes/orders'));

// Health check
app.get('/', (req, res) => res.json({ brand: 'Veloura Candles', status: 'API running ✦' }));

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// Connect DB & start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✦ MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`✦ Veloura API running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => { console.error('DB Error:', err.message); process.exit(1); });
