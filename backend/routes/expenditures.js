const express = require('express');
const prisma = require('../utils/db');
const { authenticate, authorize, baseAccess } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'BASE_COMMANDER'), baseAccess, auditLogger('Expenditure'), async (req, res) => {
  try {
    const { assetId, quantityExpended, reason } = req.body;

    const expenditure = await prisma.expenditure.create({
      data: {
        assetId: parseInt(assetId),
        quantityExpended: parseInt(quantityExpended),
        reason,
        date: new Date()
      },
      include: {
        asset: {
          include: {
            base: true
          }
        }
      }
    });

    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(assetId) }
    });

    if (asset.type === 'AMMUNITION') {
      const totalExpended = await prisma.expenditure.aggregate({
        where: { assetId: parseInt(assetId) },
        _sum: { quantityExpended: true }
      });

      if (totalExpended._sum.quantityExpended >= 100) {
        await prisma.asset.update({
          where: { id: parseInt(assetId) },
          data: { status: 'EXPENDED' }
        });
      }
    }

    res.status(201).json(expenditure);
  } catch (error) {
    console.error('Expenditure creation error:', error);
    res.status(500).json({ error: 'Failed to create expenditure' });
  }
});

router.get('/', authenticate, baseAccess, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {
      ...(req.baseFilter?.baseId && {
        asset: {
          baseId: req.baseFilter.baseId
        }
      }),
      date: {
        ...(start_date && { gte: new Date(start_date) }),
        ...(end_date && { lte: new Date(end_date) })
      }
    };

    const expenditures = await prisma.expenditure.findMany({
      where,
      include: {
        asset: {
          include: {
            base: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(expenditures);
  } catch (error) {
    console.error('Expenditures fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch expenditures' });
  }
});

module.exports = router;
