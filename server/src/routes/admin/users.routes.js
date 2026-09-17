const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../utils/prisma');
const { requireRole } = require('../../middleware/auth');
const { logActivity } = require('../../utils/activityLog');

const router = express.Router();

function serializeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// GET /api/admin/users — list all staff accounts (ADMIN only)
router.get('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { activityLogs: true } } },
    });
    res.json({ users: users.map(serializeUser) });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users — create a new sub-admin or seller account (ADMIN only)
router.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (!['ADMIN', 'SELLER'].includes(role)) {
      return res.status(400).json({ message: 'Role must be ADMIN or SELLER.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, role },
    });

    await logActivity(req.user.id, 'USER_CREATED', {
      entityType: 'User',
      entityId: user.id,
      details: `Created ${role} account for ${user.name} (${user.email})`,
    });

    res.status(201).json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id — update role/active status of a staff account (ADMIN only)
router.put('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (id === req.user.id && req.body.active === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }

    const { name, role, active, password } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) {
      if (!['ADMIN', 'SELLER'].includes(role)) {
        return res.status(400).json({ message: 'Role must be ADMIN or SELLER.' });
      }
      data.role = role;
    }
    if (active !== undefined) data.active = !!active;
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters.' });
      }
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({ where: { id }, data });

    await logActivity(req.user.id, 'USER_UPDATED', {
      entityType: 'User',
      entityId: user.id,
      details: `Updated account for ${user.name} (${user.email})`,
    });

    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id — deactivate a staff account (ADMIN only).
// Accounts are deactivated rather than deleted so their activity history stays intact.
router.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }

    const user = await prisma.user.update({ where: { id }, data: { active: false } });

    await logActivity(req.user.id, 'USER_DEACTIVATED', {
      entityType: 'User',
      entityId: user.id,
      details: `Deactivated account for ${user.name} (${user.email})`,
    });

    res.json({ message: 'Account deactivated.', user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users/activity-log — view recent activity across all staff (ADMIN only)
// Optional ?userId= to filter to one staff member's actions.
router.get('/activity/log', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { userId, page = '1', limit = '30' } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

    const where = {};
    if (userId) where.userId = parseInt(userId, 10);

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);

    res.json({
      logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
