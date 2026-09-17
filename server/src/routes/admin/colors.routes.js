const express = require('express');
const prisma = require('../../utils/prisma');

const router = express.Router();

// GET /api/admin/colors
router.get('/', async (req, res, next) => {
  try {
    const colors = await prisma.color.findMany({ orderBy: { name: 'asc' } });
    res.json({ colors });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/colors
router.post('/', async (req, res, next) => {
  try {
    const { name, hexCode } = req.body;
    if (!name || !hexCode) return res.status(400).json({ message: 'Name and hex code are required.' });
    const color = await prisma.color.create({ data: { name, hexCode } });
    res.status(201).json({ color });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/colors/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, hexCode, active } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (hexCode !== undefined) data.hexCode = hexCode;
    if (active !== undefined) data.active = active === true || active === 'true';
    const color = await prisma.color.update({ where: { id: parseInt(req.params.id, 10) }, data });
    res.json({ color });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/colors/:id — deactivates if used by products, else deletes.
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const usageCount = await prisma.productColor.count({ where: { colorId: id } });
    if (usageCount > 0) {
      const color = await prisma.color.update({ where: { id }, data: { active: false } });
      return res.json({ message: 'Color is in use, so it was deactivated instead of deleted.', color });
    }
    await prisma.color.delete({ where: { id } });
    res.json({ message: 'Color deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
