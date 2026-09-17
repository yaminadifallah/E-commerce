const express = require('express');
const prisma = require('../../utils/prisma');
const { toNumber } = require('../../utils/helpers');
const { logActivity } = require('../../utils/activityLog');

const router = express.Router();

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function serializeOrder(o) {
  return {
    ...o,
    subtotal: toNumber(o.subtotal),
    deliveryPrice: toNumber(o.deliveryPrice),
    total: toNumber(o.total),
    items: o.items ? o.items.map((i) => ({ ...i, unitPrice: toNumber(i.unitPrice), subtotal: toNumber(i.subtotal) })) : undefined,
  };
}

// GET /api/admin/orders?status=&page=&limit=&q=
router.get('/', async (req, res, next) => {
  try {
    const { status, page = '1', limit = '20', q } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const where = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { wilaya: true, deliveryOffice: true },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);

    res.json({
      orders: orders.map(serializeOrder),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { items: true, wilaya: true, deliveryOffice: true },
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/orders/:id/status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id, 10) },
      data: { status },
      include: { items: true, wilaya: true, deliveryOffice: true },
    });

    await logActivity(req.user.id, 'ORDER_STATUS_UPDATED', {
      entityType: 'Order',
      entityId: order.id,
      details: `Changed order ${order.orderNumber} status to ${status}`,
    });

    res.json({ order: serializeOrder(order) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
