const express = require('express');
const prisma = require('../utils/db');
const { authenticate, baseAccess } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, baseAccess, async (req, res) => {
  try {
    const where = req.baseFilter?.baseId ? { baseId: req.baseFilter.baseId } : {};

    const assets = await prisma.asset.findMany({
      where,
      include: {
        base: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(assets);
  } catch (error) {
    console.error('Assets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

module.exports = router;
