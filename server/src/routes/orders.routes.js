const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { generateOrderNumber, isValidAlgerianPhone, toNumber } = require('../utils/helpers');

const router = express.Router();

// POST /api/orders
// Body: { customerName, customerPhone, wilayaId, deliveryOfficeId, address, note,
//         items: [{ productId, colorName, quantity }] }
//
// SECURITY: prices and totals are NEVER trusted from the client.
// Everything is recalculated from the database inside a transaction.
router.post(
  '/',
  [
    body('customerName').trim().notEmpty().withMessage('Full name is required.'),
    body('customerPhone')
      .trim()
      .custom((val) => isValidAlgerianPhone(val))
      .withMessage('Please provide a valid Algerian phone number.'),
    body('wilayaId').isInt({ min: 1 }).withMessage('A wilaya must be selected.'),
    body('address').trim().notEmpty().withMessage('Delivery address is required.'),
    body('items').isArray({ min: 1 }).withMessage('Your cart is empty.'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { customerName, customerPhone, wilayaId, deliveryOfficeId, address, note, items } = req.body;

      const wilaya = await prisma.wilaya.findUnique({ where: { id: parseInt(wilayaId, 10) } });
      if (!wilaya || !wilaya.active) {
        return res.status(400).json({ message: 'Selected wilaya is not available.' });
      }

      if (deliveryOfficeId) {
        const office = await prisma.deliveryOffice.findUnique({ where: { id: parseInt(deliveryOfficeId, 10) } });
        if (!office || !office.active || office.wilayaId !== wilaya.id) {
          return res.status(400).json({ message: 'Selected delivery office is not valid for this wilaya.' });
        }
      }

      // Run everything inside a single transaction so stock updates and
      // order creation either all succeed or all fail together.
      const order = await prisma.$transaction(async (tx) => {
        let subtotal = 0;
        const orderItemsData = [];

        for (const item of items) {
          const productId = parseInt(item.productId, 10);
          const quantity = parseInt(item.quantity, 10);

          if (!productId || !quantity || quantity < 1) {
            throw Object.assign(new Error('Invalid item in cart.'), { status: 400 });
          }

          const product = await tx.product.findUnique({ where: { id: productId } });

          if (!product || !product.active) {
            throw Object.assign(new Error(`Product not available.`), { status: 400 });
          }

          if (product.stock < quantity) {
            throw Object.assign(
              new Error(`Not enough stock for "${product.name}". Only ${product.stock} left.`),
              { status: 400 }
            );
          }

          // Server-side price: use promotion price if active, else regular price.
          const unitPrice =
            product.promotionPrice && Number(product.promotionPrice) < Number(product.price)
              ? Number(product.promotionPrice)
              : Number(product.price);

          const lineSubtotal = unitPrice * quantity;
          subtotal += lineSubtotal;

          orderItemsData.push({
            productId: product.id,
            productNameSnapshot: product.name,
            selectedColor: item.colorName || null,
            quantity,
            unitPrice,
            subtotal: lineSubtotal,
          });

          // Safely decrement stock — this only succeeds if run inside the transaction.
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: quantity } },
          });
        }

        const deliveryPrice = Number(wilaya.deliveryPrice);
        const total = subtotal + deliveryPrice;

        const newOrder = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            customerName,
            customerPhone,
            wilayaId: wilaya.id,
            deliveryOfficeId: deliveryOfficeId ? parseInt(deliveryOfficeId, 10) : null,
            address,
            note: note || null,
            subtotal,
            deliveryPrice,
            total,
            items: { create: orderItemsData },
          },
          include: { items: true, wilaya: true, deliveryOffice: true },
        });

        return newOrder;
      });

      res.status(201).json({
        message: 'Order placed successfully.',
        orderNumber: order.orderNumber,
        order: {
          ...order,
          subtotal: toNumber(order.subtotal),
          deliveryPrice: toNumber(order.deliveryPrice),
          total: toNumber(order.total),
          items: order.items.map((i) => ({ ...i, unitPrice: toNumber(i.unitPrice), subtotal: toNumber(i.subtotal) })),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/orders/:orderNumber — order confirmation lookup (public, by order number)
router.get('/:orderNumber', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true, wilaya: true, deliveryOffice: true },
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    res.json({
      order: {
        ...order,
        subtotal: toNumber(order.subtotal),
        deliveryPrice: toNumber(order.deliveryPrice),
        total: toNumber(order.total),
        items: order.items.map((i) => ({ ...i, unitPrice: toNumber(i.unitPrice), subtotal: toNumber(i.subtotal) })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
