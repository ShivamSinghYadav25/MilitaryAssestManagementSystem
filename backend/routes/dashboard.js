const express = require('express');
const prisma = require('../utils/db');
const { authenticate, baseAccess } = require('../middleware/auth');

const router = express.Router();

router.get('/metrics', authenticate, baseAccess, async (req, res) => {
  try {
    const { date, base_id, type } = req.query;

    const baseFilter = req.baseFilter || {};
    const typeFilter = type ? { type: type.toUpperCase() } : {};
    const dateFilter = date ? { date: { gte: new Date(date) } } : {};

    const purchases = await prisma.purchase.findMany({
      where: {
        ...(baseFilter.baseId && { baseId: baseFilter.baseId }),
        ...typeFilter,
        assetType: type ? type.toUpperCase() : undefined,
        ...dateFilter
      }
    });

    const transfersIn = await prisma.transfer.findMany({
      where: {
        ...(baseFilter.baseId && { toBaseId: baseFilter.baseId }),
        assetType: type ? type.toUpperCase() : undefined,
        status: 'COMPLETED',
        timestamp: date ? { gte: new Date(date) } : undefined
      }
    });

    const transfersOut = await prisma.transfer.findMany({
      where: {
        ...(baseFilter.baseId && { fromBaseId: baseFilter.baseId }),
        assetType: type ? type.toUpperCase() : undefined,
        status: 'COMPLETED',
        timestamp: date ? { gte: new Date(date) } : undefined
      }
    });

    const assets = await prisma.asset.findMany({
      where: {
        ...(baseFilter.baseId && { baseId: baseFilter.baseId }),
        ...typeFilter
      },
      include: {
        assignments: {
          where: { status: 'ACTIVE' }
        },
        expenditures: true
      }
    });

    const purchasesTotal = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const transfersInTotal = transfersIn.reduce((sum, t) => sum + t.quantity, 0);
    const transfersOutTotal = transfersOut.reduce((sum, t) => sum + t.quantity, 0);

    const assignedTotal = assets.reduce((sum, asset) => {
      return sum + asset.assignments.length;
    }, 0);

    const expendedTotal = assets.reduce((sum, asset) => {
      return sum + asset.expenditures.reduce((expSum, exp) => expSum + exp.quantityExpended, 0);
    }, 0);

    const openingBalance = assets.filter(a => a.status === 'AVAILABLE').length;
    const netMovement = purchasesTotal + transfersInTotal - transfersOutTotal;
    const closingBalance = openingBalance + netMovement - assignedTotal - expendedTotal;

    res.json({
      openingBalance,
      closingBalance,
      netMovement,
      assigned: assignedTotal,
      expended: expendedTotal,
      breakdown: {
        purchases: purchasesTotal,
        transfersIn: transfersInTotal,
        transfersOut: transfersOutTotal
      }
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

module.exports = router;
