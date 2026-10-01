const express = require('express');
const prisma = require('../utils/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const bases = await prisma.base.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(bases);
  } catch (error) {
    console.error('Bases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bases' });
  }
});

module.exports = router;
