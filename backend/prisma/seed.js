const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // =========================
  // BASES
  // =========================

  const base1 = await prisma.base.upsert({
    where: { name: 'Alpha Base' },
    update: {},
    create: {
      name: 'Alpha Base',
      location: 'North Sector'
    }
  });

  const base2 = await prisma.base.upsert({
    where: { name: 'Bravo Base' },
    update: {},
    create: {
      name: 'Bravo Base',
      location: 'South Sector'
    }
  });

  const base3 = await prisma.base.upsert({
    where: { name: 'Charlie Base' },
    update: {},
    create: {
      name: 'Charlie Base',
      location: 'East Sector'
    }
  });

  // =========================
  // ADMIN USER
  // =========================

  const admin = await prisma.user.upsert({
    where: { email: 'admin@military.gov' },

    update: {
      name: 'System Administrator',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      baseId: null
    },

    create: {
      name: 'System Administrator',
      email: 'admin@military.gov',
      passwordHash: hashedPassword,
      role: 'ADMIN'
    }
  });

  // =========================
  // COMMANDER 1
  // =========================

  const commander1 = await prisma.user.upsert({
    where: { email: 'commander1@military.gov' },

    update: {
      name: 'John Commander',
      passwordHash: hashedPassword,
      role: 'BASE_COMMANDER',
      baseId: base1.id
    },

    create: {
      name: 'John Commander',
      email: 'commander1@military.gov',
      passwordHash: hashedPassword,
      role: 'BASE_COMMANDER',
      baseId: base1.id
    }
  });

  // =========================
  // COMMANDER 2
  // =========================

  const commander2 = await prisma.user.upsert({
    where: { email: 'commander2@military.gov' },

    update: {
      name: 'Jane Commander',
      passwordHash: hashedPassword,
      role: 'BASE_COMMANDER',
      baseId: base2.id
    },

    create: {
      name: 'Jane Commander',
      email: 'commander2@military.gov',
      passwordHash: hashedPassword,
      role: 'BASE_COMMANDER',
      baseId: base2.id
    }
  });

  // =========================
  // LOGISTICS OFFICER
  // =========================

  const logistics = await prisma.user.upsert({
    where: { email: 'logistics@military.gov' },

    update: {
      name: 'Logistics Officer',
      passwordHash: hashedPassword,
      role: 'LOGISTICS_OFFICER',
      baseId: null
    },

    create: {
      name: 'Logistics Officer',
      email: 'logistics@military.gov',
      passwordHash: hashedPassword,
      role: 'LOGISTICS_OFFICER'
    }
  });

  // =========================
  // ASSETS
  // =========================

  const vehicle1 = await prisma.asset.create({
    data: {
      name: 'Humvee Alpha-1',
      type: 'VEHICLE',
      baseId: base1.id,
      status: 'AVAILABLE'
    }
  });

  const vehicle2 = await prisma.asset.create({
    data: {
      name: 'Truck Bravo-1',
      type: 'VEHICLE',
      baseId: base2.id,
      status: 'AVAILABLE'
    }
  });

  const weapon1 = await prisma.asset.create({
    data: {
      name: 'Rifle M4-001',
      type: 'WEAPON',
      baseId: base1.id,
      status: 'AVAILABLE'
    }
  });

  const weapon2 = await prisma.asset.create({
    data: {
      name: 'Rifle M4-002',
      type: 'WEAPON',
      baseId: base1.id,
      status: 'AVAILABLE'
    }
  });

  const ammo1 = await prisma.asset.create({
    data: {
      name: '5.56mm Ammo Batch-1',
      type: 'AMMUNITION',
      baseId: base1.id,
      status: 'AVAILABLE'
    }
  });

  const ammo2 = await prisma.asset.create({
    data: {
      name: '5.56mm Ammo Batch-2',
      type: 'AMMUNITION',
      baseId: base2.id,
      status: 'AVAILABLE'
    }
  });

  // =========================
  // PURCHASES
  // =========================

  await prisma.purchase.create({
    data: {
      assetType: 'VEHICLE',
      quantity: 5,
      baseId: base1.id,
      loggedBy: admin.id,
      date: new Date('2024-01-15')
    }
  });

  await prisma.purchase.create({
    data: {
      assetType: 'WEAPON',
      quantity: 20,
      baseId: base1.id,
      loggedBy: admin.id,
      date: new Date('2024-02-10')
    }
  });

  await prisma.purchase.create({
    data: {
      assetType: 'AMMUNITION',
      quantity: 1000,
      baseId: base2.id,
      loggedBy: logistics.id,
      date: new Date('2024-03-05')
    }
  });

  // =========================
  // TRANSFERS
  // =========================

  await prisma.transfer.create({
    data: {
      assetType: 'WEAPON',
      quantity: 5,
      fromBaseId: base1.id,
      toBaseId: base2.id,
      status: 'COMPLETED'
    }
  });

  await prisma.transfer.create({
    data: {
      assetType: 'AMMUNITION',
      quantity: 200,
      fromBaseId: base2.id,
      toBaseId: base3.id,
      status: 'PENDING'
    }
  });

  // =========================
  // ASSIGNMENT
  // =========================

  await prisma.assignment.create({
    data: {
      assetId: vehicle1.id,
      personnelName: 'Sergeant Smith',
      status: 'ACTIVE'
    }
  });

  // =========================
  // EXPENDITURE
  // =========================

  await prisma.expenditure.create({
    data: {
      assetId: ammo1.id,
      quantityExpended: 50,
      reason: 'Training exercise',
      date: new Date('2024-04-01')
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });