const express = require('express');
const prisma = require('../utils/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;

    const where = {
      timestamp: {
        ...(start_date && { gte: new Date(start_date) }),
        ...(end_date && { lte: new Date(end_date) })
      },
      userId: user_id ? parseInt(user_id) : undefined
    };

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.json(auditLogs);
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
