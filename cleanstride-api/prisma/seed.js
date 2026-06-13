const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Admin User ───────────────────────────────
  const hashedPassword = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { email: 'admin@cleanstride.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@cleanstride.com',
      password: hashedPassword,
    },
  });
  console.log('✓ Admin user created (admin@cleanstride.com / password)');

  // ── Categories ────────────────────────────────
  const categoryNames = ['Cleaning', 'Restoration', 'Protection', 'Customization'];

  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✓ ${categoryNames.length} categories seeded`);

  const cleaningCategory = await prisma.category.findUnique({ where: { name: 'Cleaning' } });

  // ── Services ─────────────────────────────────
  const services = [
    {
      name: 'Quick Clean',
      description: 'Pembersihan cepat untuk sepatu yang tidak terlalu kotor. Cocok untuk perawatan rutin.',
      price: 25000,
      duration: '1 Day',
      isActive: true,
      categoryId: cleaningCategory?.id || null,
    },
    {
      name: 'Regular Wash',
      description: 'Pencucian standar dengan deep cleaning untuk sepatu sehari-hari. Termasuk pengeringan.',
      price: 45000,
      duration: '2-3 Days',
      isActive: true,
      categoryId: cleaningCategory?.id || null,
    },
    {
      name: 'Deep Clean',
      description: 'Pencucian mendalam untuk noda membandel. Termasuk treatment khusus untuk material sensitif.',
      price: 75000,
      duration: '3-5 Days',
      isActive: true,
      categoryId: cleaningCategory?.id || null,
    },
    {
      name: 'Premium Care',
      description: 'Layanan premium lengkap: deep clean, deodorizing, waterproofing, dan sole restoration.',
      price: 120000,
      duration: '5-7 Days',
      isActive: true,
      categoryId: cleaningCategory?.id || null,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: services.indexOf(service) + 1 },
      update: service,
      create: service,
    });
  }
  console.log(`✓ ${services.length} services seeded`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
