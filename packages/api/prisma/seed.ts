import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'mojo-institut' },
    update: {},
    create: {
      name: 'MOJO Institut',
      slug: 'mojo-institut',
    },
  });
  console.log('✅ Tenant created:', tenant.name);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mojo-institut.de' },
    update: {},
    create: {
      email: 'admin@mojo-institut.de',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      tenantId: tenant.id,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create admin membership
  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: {
        userId: admin.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      tenantId: tenant.id,
      role: 'admin',
    },
  });

  // Create test user
  const testPassword = await bcrypt.hash('Test1234!', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@mojo-institut.de' },
    update: {},
    create: {
      email: 'test@mojo-institut.de',
      passwordHash: testPassword,
      firstName: 'Test',
      lastName: 'User',
      tenantId: tenant.id,
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // Create test user membership
  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: {
        userId: testUser.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      tenantId: tenant.id,
      role: 'member',
    },
  });

  // Create entitlement for sample course
  const sampleCourseId = '550e8400-e29b-41d4-a716-446655440001';
  await prisma.entitlement.upsert({
    where: {
      userId_courseId: {
        userId: testUser.id,
        courseId: sampleCourseId,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      tenantId: tenant.id,
      courseId: sampleCourseId,
      source: 'manual',
    },
  });
  console.log('✅ Entitlement created for test user');

  console.log('\n✨ Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin: admin@mojo-institut.de / Admin1234!');
  console.log('   User:  test@mojo-institut.de / Test1234!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });








