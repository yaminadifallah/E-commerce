const express = require('express');
const prisma = require('../../utils/prisma');
const upload = require('../../middleware/upload');
const { slugify } = require('../../utils/helpers');

const router = express.Router();

// GET /api/admin/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/categories
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { name, description, active } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    let slug = slugify(name);
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: req.file ? `/uploads/products/${req.file.filename}` : null,
        active: active === undefined ? true : active === 'true' || active === true,
      },
    });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/categories/:id
router.put('/:id', upload.single('image'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, active } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (active !== undefined) data.active = active === 'true' || active === true;
    if (req.file) data.image = `/uploads/products/${req.file.filename}`;

    const category = await prisma.category.update({ where: { id }, data });
    res.json({ category });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/categories/:id — deactivates if it has products, else deletes.
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const productCount = await prisma.product.count({ where: { categoryId: id } });

    if (productCount > 0) {
      const category = await prisma.category.update({ where: { id }, data: { active: false } });
      return res.json({ message: 'Category has products, so it was deactivated instead of deleted.', category });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
