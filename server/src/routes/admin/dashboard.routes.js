const express = require('express');
const prisma = require('../../utils/prisma');
const { toNumber } = require('../../utils/helpers');

const router = express.Router();

// GET /api/admin/dashboard/alerts — lightweight endpoint for the notification bell.
// Returns categories that have run out of stock (every active product has 0 stock)
// and a low-stock product count, without the cost of the full dashboard query.
router.get('/alerts', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: { products: { where: { active: true }, select: { stock: true } } },
    });

    const categoriesOutOfStock = categories
      .filter((c) => c.products.length > 0 && c.products.every((p) => p.stock === 0))
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

    const lowStockProducts = await prisma.product.count({
      where: { active: true, stock: { gt: 0, lte: 5 } },
    });

    res.json({ categoriesOutOfStock, lowStockProducts });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/dashboard
router.get('/', async (req, res, next) => {
  try {
    const [
      totalProducts,
      activeProducts,
      lowStock,
      outOfStock,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      salesAgg,
      recentOrders,
      ordersByStatusRaw,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { active: true, stock: 0 } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { wilaya: true },
      }),
      prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    // Sales over last 14 days
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const recentForChart = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, total: true },
    });
    const salesByDay = {};
    for (const o of recentForChart) {
      const day = o.createdAt.toISOString().slice(0, 10);
      salesByDay[day] = (salesByDay[day] || 0) + Number(o.total);
    }
    const salesOverTime = Object.entries(salesByDay)
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, total]) => ({ date, total }));

    // Best-selling products
    const bestSellingRaw = await prisma.orderItem.groupBy({
      by: ['productNameSnapshot'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // ---- Category stock alerts ----
    // Flag any category where every active product is out of stock (stock = 0).
    // This lets the admin know an entire category has "run out" and needs restocking.
    const categoriesWithStock = await prisma.category.findMany({
      where: { active: true },
      include: {
        products: { where: { active: true }, select: { stock: true } },
      },
    });

    const categoryAlerts = categoriesWithStock
      .filter((c) => c.products.length > 0 && c.products.every((p) => p.stock === 0))
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug, productCount: c.products.length }));

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        lowStock,
        outOfStock,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalSales: toNumber(salesAgg._sum.total) || 0,
      },
      charts: {
        salesOverTime,
        ordersByStatus: ordersByStatusRaw.map((r) => ({ status: r.status, count: r._count.status })),
        bestSellingProducts: bestSellingRaw.map((r) => ({
          name: r.productNameSnapshot,
          quantity: r._sum.quantity,
        })),
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        wilaya: o.wilaya.name,
        total: toNumber(o.total),
        status: o.status,
        createdAt: o.createdAt,
      })),
      alerts: {
        categoriesOutOfStock: categoryAlerts,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
