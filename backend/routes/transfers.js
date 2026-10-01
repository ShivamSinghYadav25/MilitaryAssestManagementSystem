const express = require('express');
const prisma = require('../utils/db');
const { authenticate, authorize, baseAccess } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

const ASSET_TYPES = ['VEHICLE', 'WEAPON', 'AMMUNITION'];

// Make an end-date filter inclusive of the whole selected day
const endOfDay = (value) => {
  const d = new Date(value);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

// Record a purchase (Admin / Logistics Officer only)
router.post('/', authenticate, authorize('ADMIN', 'LOGISTICS_OFFICER'), baseAccess, auditLogger('Purchase'), async (req, res) => {
  try {
    const { assetType, quantity, baseId, date } = req.body;

    const type = String(assetType || '').toUpperCase();
    const qty = parseInt(quantity);
    const base = parseInt(baseId);

    if (!ASSET_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid asset type' });
    }
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be a positive whole number' });
    }
    if (!Number.isInteger(base)) {
      return res.status(400).json({ error: 'A base is required' });
    }

    const baseExists = await prisma.base.findUnique({ where: { id: base } });
    if (!baseExists) {
      return res.status(400).json({ error: 'Base not found' });
    }

    const purchase = await prisma.purchase.create({
      data: {
        assetType: type,
        quantity: qty,
        baseId: base,
        date: date ? new Date(date) : new Date(),
        loggedBy: req.user.id
      },
      include: {
        base: true,
        user: { select: { name: true, email: true } }
      }
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Purchase creation error:', error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Purchase history with base / equipment type / date filters
router.get('/', authenticate, baseAccess, async (req, res) => {
  try {
    const { base_id, type, start_date, end_date } = req.query;

    // Commanders are always locked to their own base; others may filter by base
    const baseId = req.baseFilter?.baseId ?? (base_id ? parseInt(base_id) : undefined);

    const where = {
      ...(baseId && { baseId }),
      ...(type && { assetType: type.toUpperCase() }),
      ...((start_date || end_date) && {
        date: {
          ...(start_date && { gte: new Date(start_date) }),
          ...(end_date && { lte: endOfDay(end_date) })
        }
      })
    };

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        base: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.json(purchases);
  } catch (error) {
    console.error('Purchases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

module.exports = router;