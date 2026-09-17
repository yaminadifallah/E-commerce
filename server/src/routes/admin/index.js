const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');

const dashboardRoutes = require('./dashboard.routes');
const productsRoutes = require('./products.routes');
const categoriesRoutes = require('./categories.routes');
const colorsRoutes = require('./colors.routes');
const ordersRoutes = require('./orders.routes');
const { wilayasRouter, officesRouter } = require('./delivery.routes');
const settingsRoutes = require('./settings.routes');
const usersRoutes = require('./users.routes');

const router = express.Router();

// Every route below requires a valid JWT belonging to an ADMIN or SELLER.
router.use(requireAuth, requireRole('ADMIN', 'SELLER'));

router.use('/dashboard', dashboardRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/colors', colorsRoutes);
router.use('/orders', ordersRoutes);
router.use('/wilayas', wilayasRouter);
router.use('/delivery-offices', officesRouter);
router.use('/settings', settingsRoutes);
router.use('/users', usersRoutes); // further restricted to ADMIN role inside users.routes.js

module.exports = router;
