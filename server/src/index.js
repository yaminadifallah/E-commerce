require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const categoriesRoutes = require('./routes/categories.routes');
const ordersRoutes = require('./routes/orders.routes');
const { colorsRouter, promotionsRouter, wilayasRouter, settingsRouter } = require('./routes/misc.routes');
const adminRoutes = require('./routes/admin');

const app = express();

// ---- Security & core middleware ----
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images to be requested from the frontend origin
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Static file serving for uploaded product images ----
// Example: http://localhost:5000/uploads/products/167-abc.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---- Health check ----
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ---- Public API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/colors', colorsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/wilayas', wilayasRouter);
app.use('/api/orders', ordersRoutes);
app.use('/api/settings', settingsRouter);

// ---- Admin API routes (JWT protected) ----
app.use('/api/admin', adminRoutes);

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
