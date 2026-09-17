const prisma = require('./prisma');

// Records an action taken by a logged-in admin/seller. Called "fire and forget"
// from routes — a logging failure should never block the actual request.
async function logActivity(userId, action, { entityType = null, entityId = null, details = null } = {}) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entityType, entityId, details },
    });
  } catch (err) {
    console.error('Failed to record activity log:', err.message);
  }
}

module.exports = { logActivity };
