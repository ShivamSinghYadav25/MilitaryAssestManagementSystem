const express = require('express');
const prisma = require('../utils/db');
const { authenticate, authorize, baseAccess } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

const ASSET_TYPES = ['VEHICLE', 'WEAPON', 'AMMUNITION'];

const endOfDay = (value) => {
  const d = new Date(value);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

// Initiate a transfer between two bases (Admin / Logistics Officer only)
router.post('/', authenticate, authorize('ADMIN', 'LOGISTICS_OFFICER'), auditLogger('Transfer'), async (req, res) => {
  try {
    const { assetType, quantity, fromBaseId, toBaseId } = req.body;

    const type = String(assetType || '').toUpperCase();
    const qty = parseInt(quantity);
    const from = parseInt(fromBaseId);
    const to = parseInt(toBaseId);

    if (!ASSET_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid asset type' });
    }
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be a positive whole number' });
    }
    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      return res.status(400).json({ error: 'Source and destination bases are required' });
    }
    if (from === to) {
      return res.status(400).json({ error: 'Source and destination base must be different' });
    }

    const found = await prisma.base.count({ where: { id: { in: [from, to] } } });
    if (found !== 2) {
      return res.status(400).json({ error: 'Base not found' });
    }

    const transfer = await prisma.transfer.create({
      data: {
        assetType: type,
        quantity: qty,
        fromBaseId: from,
        toBaseId: to,
        status: 'PENDING'
      },
      include: { fromBase: true, toBase: true }
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Transfer creation error:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

// Complete or cancel a pending transfer
router.patch('/:id/status', authenticate, authorize('ADMIN', 'LOGISTICS_OFFICER'), auditLogger('Transfer Status'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const status = String(req.body.status || '').toUpperCase();

    if (!['COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be COMPLETED or CANCELLED' });
    }

    const existing = await prisma.transfer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    if (existing.status !== 'PENDING') {
      return res.status(409).json({ error: `Transfer is already ${existing.status.toLowerCase()}` });
    }

    const transfer = await prisma.transfer.update({
      where: { id },
      data: { status },
      include: { fromBase: true, toBase: true }
    });

    res.json(transfer);
  } catch (error) {
    console.error('Transfer status update error:', error);
    res.status(500).json({ error: 'Failed to update transfer status' });
  }
});

// Transfer history with base / equipment type / status / date filters
router.get('/', authenticate, baseAccess, async (req, res) => {
  try {
    const { base_id, type, status, start_date, end_date } = req.query;

    const ownBase = req.baseFilter?.baseId;
    const filterBase = ownBase ?? (base_id ? parseInt(base_id) : undefined);

    const where = {
      // A base's history includes transfers both into and out of it
      ...(filterBase && {
        OR: [{ fromBaseId: filterBase }, { toBaseId: filterBase }]
      }),
      ...(type && { assetType: type.toUpperCase() }),
      ...(status && { status: status.toUpperCase() }),
      ...((start_date || end_date) && {
        timestamp: {
          ...(start_date && { gte: new Date(start_date) }),
          ...(end_date && { lte: endOfDay(end_date) })
        }
      })
    };

    const transfers = await prisma.transfer.findMany({
      where,
      include: { fromBase: true, toBase: true },
      orderBy: { timestamp: 'desc' }
    });

    res.json(transfers);
  } catch (error) {
    console.error('Transfers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

module.exports = router;