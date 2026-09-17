const express = require('express');
const prisma = require('../../utils/prisma');
const { toNumber } = require('../../utils/helpers');

const wilayasRouter = express.Router();
const officesRouter = express.Router();

// ---------------- WILAYAS ----------------

wilayasRouter.get('/', async (req, res, next) => {
  try {
    const wilayas = await prisma.wilaya.findMany({
      include: { _count: { select: { offices: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ wilayas: wilayas.map((w) => ({ ...w, deliveryPrice: toNumber(w.deliveryPrice) })) });
  } catch (err) {
    next(err);
  }
});

wilayasRouter.post('/', async (req, res, next) => {
  try {
    const { code, name, deliveryPrice, estimatedDays, active } = req.body;
    if (!code || !name || deliveryPrice === undefined) {
      return res.status(400).json({ message: 'Code, name and delivery price are required.' });
    }
    const wilaya = await prisma.wilaya.create({
      data: {
        code,
        name,
        deliveryPrice: parseFloat(deliveryPrice),
        estimatedDays: estimatedDays ? parseInt(estimatedDays, 10) : 3,
        active: active === undefined ? true : !!active,
      },
    });
    res.status(201).json({ wilaya: { ...wilaya, deliveryPrice: toNumber(wilaya.deliveryPrice) } });
  } catch (err) {
    next(err);
  }
});

wilayasRouter.put('/:id', async (req, res, next) => {
  try {
    const { code, name, deliveryPrice, estimatedDays, active } = req.body;
    const data = {};
    if (code !== undefined) data.code = code;
    if (name !== undefined) data.name = name;
    if (deliveryPrice !== undefined) data.deliveryPrice = parseFloat(deliveryPrice);
    if (estimatedDays !== undefined) data.estimatedDays = parseInt(estimatedDays, 10);
    if (active !== undefined) data.active = !!active;

    const wilaya = await prisma.wilaya.update({ where: { id: parseInt(req.params.id, 10) }, data });
    res.json({ wilaya: { ...wilaya, deliveryPrice: toNumber(wilaya.deliveryPrice) } });
  } catch (err) {
    next(err);
  }
});

wilayasRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const orderCount = await prisma.order.count({ where: { wilayaId: id } });
    if (orderCount > 0) {
      const wilaya = await prisma.wilaya.update({ where: { id }, data: { active: false } });
      return res.json({ message: 'Wilaya has past orders, so it was deactivated instead of deleted.', wilaya });
    }
    await prisma.wilaya.delete({ where: { id } });
    res.json({ message: 'Wilaya deleted.' });
  } catch (err) {
    next(err);
  }
});

// ---------------- DELIVERY OFFICES ----------------

officesRouter.get('/', async (req, res, next) => {
  try {
    const { wilayaId } = req.query;
    const where = wilayaId ? { wilayaId: parseInt(wilayaId, 10) } : {};
    const offices = await prisma.deliveryOffice.findMany({
      where,
      include: { wilaya: true },
      orderBy: { name: 'asc' },
    });
    res.json({ offices });
  } catch (err) {
    next(err);
  }
});

officesRouter.post('/', async (req, res, next) => {
  try {
    const { name, address, phone, wilayaId, active } = req.body;
    if (!name || !address || !phone || !wilayaId) {
      return res.status(400).json({ message: 'Name, address, phone and wilaya are required.' });
    }
    const office = await prisma.deliveryOffice.create({
      data: {
        name,
        address,
        phone,
        wilayaId: parseInt(wilayaId, 10),
        active: active === undefined ? true : !!active,
      },
    });
    res.status(201).json({ office });
  } catch (err) {
    next(err);
  }
});

officesRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, address, phone, wilayaId, active } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (wilayaId !== undefined) data.wilayaId = parseInt(wilayaId, 10);
    if (active !== undefined) data.active = !!active;

    const office = await prisma.deliveryOffice.update({ where: { id: parseInt(req.params.id, 10) }, data });
    res.json({ office });
  } catch (err) {
    next(err);
  }
});

officesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const orderCount = await prisma.order.count({ where: { deliveryOfficeId: id } });
    if (orderCount > 0) {
      const office = await prisma.deliveryOffice.update({ where: { id }, data: { active: false } });
      return res.json({ message: 'Office has past orders, so it was deactivated instead of deleted.', office });
    }
    await prisma.deliveryOffice.delete({ where: { id } });
    res.json({ message: 'Delivery office deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = { wilayasRouter, officesRouter };
