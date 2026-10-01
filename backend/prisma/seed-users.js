const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  console.log('Starting production user seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // =========================
  // BASES
  // =========================

  const base1 = await prisma.base.upsert({
    where: {
      name: 'Alpha Base'
    },
    update: {},
    create: {
      name: 'Alpha Base',
      location: 'North Sector'
    }
  });

  const base2 = await prisma.base.upsert({
    where: {
      name: 'Bravo Base'
    },
    update: {},
    create: {
      name: 'Bravo Base',
      location: 'South Sector'
    }
  });

  const base3 = await prisma.base.upsert({
    where: {
      name: 'Charlie Base'
    },
    update: {},
    create: {
      name: 'Charlie Base',
      location: 'East Sector'
    }
  });

  // =========================
  // ADMIN
  // =========================

  await prisma.user.upsert({
    where: {
      email: 'admin@military.gov'
    },
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
      role: 'ADMIN',
      baseId: null
    }
  });

  // =========================
  // COMMANDER 1
  // =========================

  await prisma.user.upsert({
    where: {
      email: 'commander1@military.gov'
    },
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

  await prisma.user.upsert({
    where: {
      email: 'commander2@military.gov'
    },
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

  await prisma.user.upsert({
    where: {
      email: 'logistics@military.gov'
    },
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
      role: 'LOGISTICS_OFFICER',
      baseId: null
    }
  });

  console.log('Production users and bases created successfully!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });