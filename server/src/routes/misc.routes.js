const express = require('express');
const prisma = require('../utils/prisma');
const { toNumber } = require('../utils/helpers');

const colorsRouter = express.Router();
const promotionsRouter = express.Router();
const wilayasRouter = express.Router();
const settingsRouter = express.Router();

// GET /api/colors
colorsRouter.get('/', async (req, res, next) => {
  try {
    const colors = await prisma.color.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    res.json({ colors });
  } catch (err) {
    next(err);
  }
});

// GET /api/promotions — active promotions only (promotionPrice set and lower than price)
promotionsRouter.get('/', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, promotionPrice: { not: null } },
      include: {
        category: true,
        colors: { include: { color: true } },
        images: { orderBy: { isMain: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const promos = products
      .filter((p) => p.promotionPrice && Number(p.promotionPrice) < Number(p.price))
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: toNumber(p.price),
        promotionPrice: toNumber(p.promotionPrice),
        discountPercent: Math.round((1 - Number(p.promotionPrice) / Number(p.price)) * 100),
        stock: p.stock,
        category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
        colors: p.colors.map((pc) => ({ id: pc.color.id, name: pc.color.name, hexCode: pc.color.hexCode })),
        images: p.images.map((img) => ({ url: img.imageUrl, isMain: img.isMain })),
      }));

    res.json({ products: promos });
  } catch (err) {
    next(err);
  }
});

// GET /api/wilayas
wilayasRouter.get('/', async (req, res, next) => {
  try {
    const wilayas = await prisma.wilaya.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    res.json({
      wilayas: wilayas.map((w) => ({ ...w, deliveryPrice: toNumber(w.deliveryPrice) })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/wilayas/:id/offices
wilayasRouter.get('/:id/offices', async (req, res, next) => {
  try {
    const wilayaId = parseInt(req.params.id, 10);
    const wilaya = await prisma.wilaya.findUnique({ where: { id: wilayaId } });
    if (!wilaya || !wilaya.active) {
      return res.status(404).json({ message: 'Wilaya not found.' });
    }

    const offices = await prisma.deliveryOffice.findMany({
      where: { wilayaId, active: true },
      orderBy: { name: 'asc' },
    });

    res.json({
      wilaya: { ...wilaya, deliveryPrice: toNumber(wilaya.deliveryPrice) },
      offices,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/settings — public store info (used in navbar/footer/contact page)
settingsRouter.get('/', async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1 } });
    }
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

module.exports = { colorsRouter, promotionsRouter, wilayasRouter, settingsRouter };
