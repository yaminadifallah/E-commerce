const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Verifies the JWT sent in the Authorization header ("Bearer <token>").
// Attaches the authenticated user to req.user.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
}

// Restricts access to specific roles, e.g. requireRole('ADMIN')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
