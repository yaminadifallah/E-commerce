const express = require('express');
const prisma = require('../../utils/prisma');
const upload = require('../../middleware/upload');
const { slugify, toNumber } = require('../../utils/helpers');
const { logActivity } = require('../../utils/activityLog');

const router = express.Router();

const PRODUCT_INCLUDE = {
  category: true,
  colors: { include: { color: true } },
  images: true,
};

function serialize(p) {
  return {
    ...p,
    price: toNumber(p.price),
    promotionPrice: toNumber(p.promotionPrice),
    colors: p.colors.map((pc) => ({ id: pc.color.id, name: pc.color.name, hexCode: pc.color.hexCode })),
    images: p.images.map((img) => ({ id: img.id, url: img.imageUrl, isMain: img.isMain })),
  };
}

// GET /api/admin/products?page=&limit=&q=&category=
router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', q, category, promo } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const where = {};
    if (q) where.name = { contains: q };
    if (category) where.categoryId = parseInt(category, 10);
    if (promo === 'true') where.promotionPrice = { not: null };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);

    res.json({
      products: products.map(serialize),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: PRODUCT_INCLUDE,
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product: serialize(product) });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products  (multipart/form-data, field "images" for files)
router.post('/', upload.array('images', 8), async (req, res, next) => {
  try {
    const { name, description, price, promotionPrice, stock, categoryId, featured, active, colorIds } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, price and category are required.' });
    }

    let slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const parsedColorIds = colorIds
      ? (Array.isArray(colorIds) ? colorIds : JSON.parse(colorIds)).map((id) => parseInt(id, 10))
      : [];

    const files = req.files || [];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        promotionPrice: promotionPrice ? parseFloat(promotionPrice) : null,
        stock: parseInt(stock, 10) || 0,
        categoryId: parseInt(categoryId, 10),
        featured: featured === 'true' || featured === true,
        active: active === undefined ? true : active === 'true' || active === true,
        colors: { create: parsedColorIds.map((colorId) => ({ colorId })) },
        images: {
          create: files.map((f, idx) => ({
            imageUrl: `/uploads/products/${f.filename}`,
            isMain: idx === 0,
          })),
        },
      },
      include: PRODUCT_INCLUDE,
    });

    await logActivity(req.user.id, 'PRODUCT_CREATED', {
      entityType: 'Product',
      entityId: product.id,
      details: `Created product "${product.name}"`,
    });

    res.status(201).json({ product: serialize(product) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id  (multipart/form-data — new images are appended)
router.put('/:id', upload.array('images', 8), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return res.status(404).json({ message: 'Product not found.' });

    const { name, description, price, promotionPrice, stock, categoryId, featured, active, colorIds } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (promotionPrice !== undefined) data.promotionPrice = promotionPrice ? parseFloat(promotionPrice) : null;
    if (stock !== undefined) data.stock = parseInt(stock, 10);
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId, 10);
    if (featured !== undefined) data.featured = featured === 'true' || featured === true;
    if (active !== undefined) data.active = active === 'true' || active === true;

    if (colorIds !== undefined) {
      const parsedColorIds = (Array.isArray(colorIds) ? colorIds : JSON.parse(colorIds)).map((cid) =>
        parseInt(cid, 10)
      );
      await prisma.productColor.deleteMany({ where: { productId: id } });
      data.colors = { create: parsedColorIds.map((colorId) => ({ colorId })) };
    }

    const files = req.files || [];
    if (files.length > 0) {
      data.images = {
        create: files.map((f) => ({ imageUrl: `/uploads/products/${f.filename}`, isMain: false })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: PRODUCT_INCLUDE,
    });

    await logActivity(req.user.id, 'PRODUCT_UPDATED', {
      entityType: 'Product',
      entityId: product.id,
      details: `Updated product "${product.name}"`,
    });

    res.json({ product: serialize(product) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:id/promotion — quick JSON-only endpoint to set or clear
// a product's promotion price, without needing to resend the whole multipart form.
router.put('/:id/promotion', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { promotionPrice } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    if (promotionPrice !== null && promotionPrice !== undefined && promotionPrice !== '') {
      const promoNum = parseFloat(promotionPrice);
      if (isNaN(promoNum) || promoNum <= 0) {
        return res.status(400).json({ message: 'Promotion price must be a positive number.' });
      }
      if (promoNum >= Number(product.price)) {
        return res.status(400).json({ message: 'Promotion price must be lower than the regular price.' });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        promotionPrice:
          promotionPrice === null || promotionPrice === undefined || promotionPrice === ''
            ? null
            : parseFloat(promotionPrice),
      },
      include: PRODUCT_INCLUDE,
    });

    await logActivity(req.user.id, 'PROMOTION_UPDATED', {
      entityType: 'Product',
      entityId: updated.id,
      details:
        updated.promotionPrice !== null
          ? `Set promotion price for "${updated.name}" to ${toNumber(updated.promotionPrice)} DA`
          : `Removed promotion from "${updated.name}"`,
    });

    res.json({ product: serialize(updated) });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products/bulk-import
// Body: { products: [{ name, description, price, promotionPrice, stock, categoryName, colorNames, featured, active }] }
// The frontend parses the admin's CSV file and sends rows as JSON here — this endpoint
// resolves category/color names to IDs and creates every product in one request.
// Rows with errors are skipped and reported back; valid rows are still created.
router.post('/bulk-import', async (req, res, next) => {
  try {
    const { products: rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No product rows were provided.' });
    }

    const categories = await prisma.category.findMany();
    const colors = await prisma.color.findMany();
    const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase().trim(), c]));
    const colorByName = new Map(colors.map((c) => [c.name.toLowerCase().trim(), c]));

    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      try {
        if (!row.name || !row.price || !row.categoryName) {
          errors.push({ row: rowNum, message: 'Missing name, price, or category.' });
          continue;
        }

        const category = categoryByName.get(String(row.categoryName).toLowerCase().trim());
        if (!category) {
          errors.push({ row: rowNum, message: `Category "${row.categoryName}" not found.` });
          continue;
        }

        const colorNames = row.colorNames
          ? String(row.colorNames).split(',').map((c) => c.trim()).filter(Boolean)
          : [];
        const colorIds = colorNames
          .map((name) => colorByName.get(name.toLowerCase()))
          .filter(Boolean)
          .map((c) => c.id);

        let slug = slugify(row.name);
        const existingSlug = await prisma.product.findUnique({ where: { slug } });
        if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}-${rowNum}`;

        const product = await prisma.product.create({
          data: {
            name: row.name,
            slug,
            description: row.description || null,
            price: parseFloat(row.price),
            promotionPrice: row.promotionPrice ? parseFloat(row.promotionPrice) : null,
            stock: row.stock ? parseInt(row.stock, 10) : 0,
            categoryId: category.id,
            featured: row.featured === 'true' || row.featured === true,
            active: row.active === undefined || row.active === '' ? true : row.active === 'true' || row.active === true,
            colors: { create: colorIds.map((colorId) => ({ colorId })) },
          },
        });
        created.push(product);
      } catch (rowErr) {
        errors.push({ row: rowNum, message: rowErr.message });
      }
    }

    await logActivity(req.user.id, 'PRODUCTS_BULK_IMPORTED', {
      details: `Bulk-imported ${created.length} product(s), ${errors.length} row error(s)`,
    });

    res.status(201).json({ createdCount: created.length, errors });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id
// Soft-deletes if the product appears in any historical order (preserves order history).
// Hard-deletes only if it has never been ordered.
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderItemCount > 0) {
      const product = await prisma.product.update({ where: { id }, data: { active: false } });
      await logActivity(req.user.id, 'PRODUCT_DEACTIVATED', {
        entityType: 'Product',
        entityId: product.id,
        details: `Deactivated product "${product.name}" (has past orders)`,
      });
      return res.json({ message: 'Product has past orders, so it was deactivated instead of deleted.', product });
    }

    const deleted = await prisma.product.delete({ where: { id } });
    await logActivity(req.user.id, 'PRODUCT_DELETED', {
      entityType: 'Product',
      entityId: id,
      details: `Deleted product "${deleted.name}"`,
    });
    res.json({ message: 'Product deleted permanently.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:productId/images/:imageId
router.delete('/:productId/images/:imageId', async (req, res, next) => {
  try {
    await prisma.productImage.delete({ where: { id: parseInt(req.params.imageId, 10) } });
    res.json({ message: 'Image removed.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/products/:productId/images/:imageId/main — set as main image
router.put('/:productId/images/:imageId/main', async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId }, data: { isMain: false } }),
      prisma.productImage.update({ where: { id: parseInt(req.params.imageId, 10) }, data: { isMain: true } }),
    ]);
    res.json({ message: 'Main image updated.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
