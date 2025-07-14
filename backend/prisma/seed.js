const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      image: null,
    },
  });

  // Create items for the user
  await prisma.item.createMany({
    data: [
      {
        name: 'Sample Item 1',
        description: 'First sample item',
        ownerId: user.id,
      },
      {
        name: 'Sample Item 2',
        description: 'Second sample item',
        ownerId: user.id,
      },
    ],
  });

  console.log('Database seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });