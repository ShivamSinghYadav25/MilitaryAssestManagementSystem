const express = require('express');
const prisma = require('../utils/db');
const { authenticate, authorize, baseAccess } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'BASE_COMMANDER'), baseAccess, auditLogger('Assignment'), async (req, res) => {
  try {
    const { assetId, personnelName } = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        assetId: parseInt(assetId),
        personnelName,
        status: 'ACTIVE'
      },
      include: {
        asset: {
          include: {
            base: true
          }
        }
      }
    });

    await prisma.asset.update({
      where: { id: parseInt(assetId) },
      data: { status: 'ASSIGNED' }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Assignment creation error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

router.patch('/:id/return', authenticate, authorize('ADMIN', 'BASE_COMMANDER'), baseAccess, auditLogger('Assignment Return'), async (req, res) => {
  try {
    const assignment = await prisma.assignment.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'RETURNED' },
      include: {
        asset: true
      }
    });

    await prisma.asset.update({
      where: { id: assignment.assetId },
      data: { status: 'AVAILABLE' }
    });

    res.json(assignment);
  } catch (error) {
    console.error('Assignment return error:', error);
    res.status(500).json({ error: 'Failed to return assignment' });
  }
});

router.get('/', authenticate, baseAccess, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      ...(req.baseFilter?.baseId && {
        asset: {
          baseId: req.baseFilter.baseId
        }
      }),
      status: status ? status.toUpperCase() : undefined
    };

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        asset: {
          include: {
            base: true
          }
        }
      },
      orderBy: { assignedDate: 'desc' }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Assignments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

module.exports = router;
