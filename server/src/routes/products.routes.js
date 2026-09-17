const express = require('express');
const prisma = require('../utils/prisma');
const { toNumber } = require('../utils/helpers');

const router = express.Router();

function serializeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: toNumber(p.price),
    promotionPrice: toNumber(p.promotionPrice),
    discountPercent:
      p.promotionPrice && p.price
        ? Math.round((1 - Number(p.promotionPrice) / Number(p.price)) * 100)
        : null,
    stock: p.stock,
    inStock: p.stock > 0,
    featured: p.featured,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
    colors: p.colors ? p.colors.map((pc) => ({ id: pc.color.id, name: pc.color.name, hexCode: pc.color.hexCode })) : [],
    images: p.images ? p.images.map((img) => ({ id: img.id, url: img.imageUrl, isMain: img.isMain })) : [],
    createdAt: p.createdAt,
  };
}

const PRODUCT_INCLUDE = {
  category: true,
  colors: { include: { color: true } },
  images: { orderBy: { isMain: 'desc' } },
};

// GET /api/products
// Supports: search(q), category(slug), minPrice, maxPrice, color(id), inStock, promo, sort, page, limit
router.get('/', async (req, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      color,
      inStock,
      promo,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 60);

    const where = { active: true };

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (color) {
      where.colors = { some: { colorId: parseInt(color, 10) } };
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    if (promo === 'true') {
      where.promotionPrice = { not: null };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { orderItems: { _count: 'desc' } };
    if (sort === 'promotions') orderBy = { promotionPrice: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);

    res.json({
      products: products.map(serializeProduct),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, featured: true },
      include: PRODUCT_INCLUDE,
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products: products.map(serializeProduct) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, active: true },
      include: PRODUCT_INCLUDE,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
      include: PRODUCT_INCLUDE,
      take: 4,
    });

    res.json({
      product: serializeProduct(product),
      related: related.map(serializeProduct),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
