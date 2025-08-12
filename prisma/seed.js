const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password123';
  
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      { name: 'Test User', email: 'user@example.com', password: passwordHash, role: 'user' },
      { name: 'Admin', email: adminEmail, password: passwordHash, role: 'admin' },
    ],
  });

  console.log('✅ Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
