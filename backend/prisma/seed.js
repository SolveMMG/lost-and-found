const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Hash passwords for users
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('adminpass456', 10);
  const password3 = await bcrypt.hash('pass789', 10);
  const password4 = await bcrypt.hash('userpass321', 10);

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@email.com' },
    update: {},
    create: {
      email: 'john@email.com',
      name: 'John Doe',
      password: password1,
      isAdmin: false,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      name: 'Admin User',
      password: password2,
      isAdmin: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'mary@email.com' },
    update: {},
    create: {
      email: 'mary@email.com',
      name: 'Mary Jane',
      password: password3,
      isAdmin: false,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'paul@email.com' },
    update: {},
    create: {
      email: 'paul@email.com',
      name: 'Paul Smith',
      password: password4,
      isAdmin: false,
    },
  });

  // Delete all items before reseeding (optional but useful during dev)
  await prisma.item.deleteMany();

  // Create Items
  await prisma.item.createMany({
    data: [
      {
        title: 'iPhone 14 Pro',
        description: 'Black iPhone 14 Pro with cracked screen protector. Has a blue phone case with initials "J.D."',
        category: 'electronics',
        type: 'lost',
        status: 'verified', // ✅ Verified & Matched
        location: 'Central Park, near Bethesda Fountain',
        dateReported: new Date('2024-01-15'),
        dateOccurred: new Date('2024-01-14'),
        images: [
          'https://example.com/iphone.jpg'
        ],
        tags: ['iphone', 'smartphone', 'black', 'cracked'],
        reporterId: user1.id,
        ownerId: user1.id // ✅ Same user who reported it confirmed ownership
      },
      {
        title: 'Brown Leather Wallet',
        description: 'Brown leather wallet with multiple credit cards and cash. Has a small tear on the corner.',
        category: 'accessories',
        type: 'found',
        status: 'verified', // ✅ Verified & Returned
        location: 'Times Square, near TKTS stairs',
        dateReported: new Date('2024-01-16'),
        dateOccurred: new Date('2024-01-16'),
        images: [
          'https://example.com/wallet.jpg'
        ],
        tags: ['wallet', 'brown', 'leather', 'cards'],
        reporterId: user3.id,
        ownerId: user4.id // ✅ Paul Smith claimed & admin verified
      },
      {
        title: 'Blue Denim Jacket',
        description: 'Medium-sized blue denim jacket from Levis. Has a small pin on the left lapel.',
        category: 'clothing',
        type: 'lost',
        status: 'pending', // ❌ Not verified yet
        location: 'Brooklyn Bridge',
        dateReported: new Date('2024-01-17'),
        dateOccurred: new Date('2024-01-16'),
        images: [
          'https://example.com/denimjacket.jpg'
        ],
        tags: ['jacket', 'denim', 'blue', 'levis'],
        reporterId: user4.id,
        ownerId: null // ✅ Pending verification, so no owner yet
      },
      {
        title: 'House Keys with Keychain',
        description: 'Set of house keys with a red heart-shaped keychain. About 4-5 keys on a silver ring.',
        category: 'keys',
        type: 'found',
        status: 'pending', // ❌ Not verified yet
        location: 'Washington Square Park',
        dateReported: new Date('2024-01-18'),
        dateOccurred: new Date('2024-01-18'),
        images: [
          'https://example.com/housekeys.jpg'
        ],
        tags: ['keys', 'keychain', 'red', 'heart'],
        reporterId: user3.id,
        ownerId: null // ✅ Not matched yet
      }
    ]
  });

  console.log('✅ Database seeded with updated logic!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
