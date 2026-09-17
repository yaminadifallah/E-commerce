const express = require('express');
const prisma = require('../utils/prisma');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: { _count: { select: { products: { where: { active: true } } } } },
      orderBy: { name: 'asc' },
    });

    res.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        productCount: c._count.products,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { slug: req.params.slug, active: true },
    });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ category });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
