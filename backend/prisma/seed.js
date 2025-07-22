const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@email.com' },
    update: {},
    create: {
      email: 'john@email.com',
      name: 'John Doe',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      name: 'Admin User',
    },
  });

  // Create items
  await prisma.item.createMany({
    data: [
      {
        title: 'iPhone 14 Pro',
        description: 'Black iPhone 14 Pro with cracked screen protector. Has a blue phone case with initials "J.D."',
        category: 'electronics',
        type: 'lost',
        status: 'verified',
        location: 'Central Park, near Bethesda Fountain',
        dateReported: new Date('2024-01-15'),
        dateOccurred: new Date('2024-01-14'),
        images: [
          'https://imgs.search.brave.com/xcz3MjF-i9jSw-tKp9glnh7oEZVMtDOJbN_1mIVaAHM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4y/LmNlbGxwaG9uZXMu/Y29tLnZuL2luc2Vj/dXJlL3JzOmZpbGw6/MDowL3E6OTAvcGxh/aW4vaHR0cHM6Ly9j/ZWxscGhvbmVzLmNv/bS52bi9tZWRpYS93/eXNpd3lnL1Bob25l/L0FwcGxlL2lwaG9u/ZS0xNC9pcGhvbmUt/MTQtcHJvLTEwLmpw/Zw'
        ],
        tags: ['iphone', 'smartphone', 'black', 'cracked'],
        ownerId: user1.id,
      },
      {
        title: 'Brown Leather Wallet',
        description: 'Brown leather wallet with multiple credit cards and cash. Has a small tear on the corner.',
        category: 'accessories',
        type: 'found',
        status: 'verified',
        location: 'Times Square, near TKTS stairs',
        dateReported: new Date('2024-01-16'),
        dateOccurred: new Date('2024-01-16'),
        images: [
          'https://imgs.search.brave.com/DunI5pMVEfC07LA_ZANiVM34G6I4tFRzmm6iSjsEdAE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/ZW5ncmF2ZWRtZW1v/cmllcy5jby51ay9j/ZG4vc2hvcC9wcm9k/dWN0cy9jdXN0b20t/cGhvdG8td2FsbGV0/LWJyb3duLWxlYXRo/ZXItd2FsbGV0LXBo/b3RvLW5hbWUtYXJ0/d29yay1wZXJzb25h/bGlzZWQtd2FsbGV0/LWZhdGhlcnMtZGF5/LWdpZnQtOTg3MTI5_XzEwMjR4MTAyNC5qcGc_dj0xNjYyOTA3/NDcw'
        ],
        tags: ['wallet', 'brown', 'leather', 'cards'],
        ownerId: user2.id,
      },
      {
        title: 'Blue Denim Jacket',
        description: 'Medium-sized blue denim jacket from Levis. Has a small pin on the left lapel.',
        category: 'clothing',
        type: 'lost',
        status: 'pending',
        location: 'Brooklyn Bridge',
        dateReported: new Date('2024-01-17'),
        dateOccurred: new Date('2024-01-16'),
        images: [
          'https://imgs.search.brave.com/i9x5U6I2Di_TD72_1HnT0sOn_Mb46cErojB65yFSOzc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZS5obS5jb20vYXNz/ZXRzL2htLzc3Lzk1/Lzc3OTVjOTlmMDA0/N2FjZWQ3MWJhMTU5/MGY2ZDJkOTgzNWVl/Zjk2ODUuanBnP2lt/d2lkdGg9MTUzNg'
        ],
        tags: ['jacket', 'denim', 'blue', 'levis'],
        ownerId: user1.id,
      },
      {
        title: 'House Keys with Keychain',
        description: 'Set of house keys with a red heart-shaped keychain. About 4-5 keys on a silver ring.',
        category: 'keys',
        type: 'found',
        status: 'verified',
        location: 'Washington Square Park',
        dateReported: new Date('2024-01-18'),
        dateOccurred: new Date('2024-01-18'),
        images: [
          'https://imgs.search.brave.com/JcfKMlBprEa27OaubKDmTcvj_b9wGHn6L9MA4zm0zYk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQ4/Njg4MzIwNS9waG90/by9ob3VzZS1rZXlz/LXdpdGgtYS1rZXlj/aGFpbi1pbi10aGUt/c2hhcGUtb2YtYS1o/b3VzZS1jb21wb3Np/dGlvbi1vbi1hLWdy/YXktbWFyYmxlLWJh/Y2tncm91bmQuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPWc0/R1FxWlJINXRzZl9S/emxXcFhQRnAxRWhI/Q0kwWFgtMkZST2pG/NzVPeGs9'
        ],
        tags: ['keys', 'keychain', 'red', 'heart'],
        ownerId: user2.id,
      }
    ]
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