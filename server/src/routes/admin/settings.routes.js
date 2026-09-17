const express = require('express');
const upload = require('../../middleware/upload');
const prisma = require('../../utils/prisma');

const router = express.Router();

// GET /api/admin/settings
router.get('/', async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) settings = await prisma.settings.create({ data: { id: 1 } });
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/settings
router.put('/', upload.single('logo'), async (req, res, next) => {
  try {
    const { storeName, phone, email, address, facebook, instagram, tiktok, whatsapp, description } = req.body;

    const data = {};
    if (storeName !== undefined) data.storeName = storeName;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;
    if (facebook !== undefined) data.facebook = facebook;
    if (instagram !== undefined) data.instagram = instagram;
    if (tiktok !== undefined) data.tiktok = tiktok;
    if (whatsapp !== undefined) data.whatsapp = whatsapp;
    if (description !== undefined) data.description = description;
    if (req.file) data.logo = `/uploads/products/${req.file.filename}`;

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
