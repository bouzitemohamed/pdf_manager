const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@archivum.app';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    // If user exists but is not admin, promote them
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
      console.log(`🔑 Promoted existing user ${adminEmail} to ADMIN`);
    } else {
      console.log(`✅ Admin account already exists: ${adminEmail}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║        ADMIN ACCOUNT CREATED             ║');
  console.log(`║  Email:    ${adminEmail.padEnd(30)}║`);
  console.log(`║  Password: ${adminPassword.padEnd(30)}║`);
  console.log('║  ⚠️  Change this password immediately!   ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
};

module.exports = seedAdmin;
