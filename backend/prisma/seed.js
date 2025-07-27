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
          'https://www.google.com/imgres?q=iphone%2014%20pro&imgurl=https%3A%2F%2Fwww.digitaltrends.com%2Fwp-content%2Fuploads%2F2022%2F09%2FiPhone-14-Pro-Back-Purple-Hand.jpg%3Fp%3D1&imgrefurl=https%3A%2F%2Fwww.digitaltrends.com%2Fmobile%2Fapple-iphone-14-pro-review%2F&docid=OQHHsKC55Xa6fM&tbnid=M3bp1wfo4Tw9dM&vet=12ahUKEwjDh8fEqN2OAxXzhf0HHfh_H4cQM3oECBAQAA..i&w=3000&h=2000&hcb=2&ved=2ahUKEwjDh8fEqN2OAxXzhf0HHfh_H4cQM3oECBAQAA'
        ],
        tags: ['iphone', 'smartphone', 'black', 'cracked'],
        reporterId: user1.id,
        ownerId: user1.id, // ✅ Same user who reported it confirmed ownership
        isClaimed: false
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
          'https://www.google.com/imgres?q=brown%20leather%20wallet&imgurl=http%3A%2F%2Fwww.graphicimage.com%2Fcdn%2Fshop%2Ffiles%2FWLM-HAR-BRN-2_fd9e006c-47ad-4c6e-bb73-716e757542b4.jpg%3Fv%3D1684737127&imgrefurl=https%3A%2F%2Fwww.graphicimage.com%2Fproducts%2Fbi-fold-wallet-brown-leather%3Fsrsltid%3DAfmBOooNf-z9iATLJOnupuRLoV-K4y1ZFiuoQDLM-IztWaWytAGFHEAD&docid=YXn5fC6j8xJEtM&tbnid=rBdk76y9p6jC7M&vet=12ahUKEwiRr43gqN2OAxUBhf0HHb7oLLsQM3oECC4QAA..i&w=1200&h=1200&hcb=2&ved=2ahUKEwiRr43gqN2OAxUBhf0HHb7oLLsQM3oECC4QAA'
        ],
        tags: ['wallet', 'brown', 'leather', 'cards'],
        reporterId: user3.id,
        ownerId: user4.id, // ✅ Paul Smith claimed & admin verified
        isClaimed: false
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
          'https://www.google.com/imgres?q=blue%20denim%20jacket&imgurl=https%3A%2F%2Fstetson.com%2Fcdn%2Fshop%2Fproducts%2F11-098-0202-2010-BU_Blue_1_large.jpg%3Fv%3D1674678050&imgrefurl=https%3A%2F%2Fstetson.com%2Fproducts%2Fstretch-denim-jacket-blue-1%3Fsrsltid%3DAfmBOoqMKmYPcqFwoT--ONvuSRP9zbjNgjVnVsAFsyfKOww2C-scN96z&docid=c9RnZ0fmV-gFvM&tbnid=OWpDxvfkpZ0p1M&vet=12ahUKEwid0vzuqN2OAxXAg_0HHR4RDVQQM3oECC4QAA..i&w=480&h=480&hcb=2&ved=2ahUKEwid0vzuqN2OAxXAg_0HHR4RDVQQM3oECC4QAA'
        ],
        tags: ['jacket', 'denim', 'blue', 'levis'],
        reporterId: user4.id,
        ownerId: null, // ✅ Pending verification, so no owner yet
        isClaimed: false
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
          'https://www.google.com/imgres?q=house%20keys&imgurl=https%3A%2F%2Fas1.ftcdn.net%2Fjpg%2F02%2F42%2F32%2F96%2F1000_F_242329644_7Dy6L5TRCYD8wtzN1geZMF6zLrL5vhBt.jpg&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fimages%2Fhouse-keys-with-house-shaped-keychain-isolated-on-white-background%2F242329644&docid=-l2nwQB3c0svoM&tbnid=sBKFthtDP70QWM&vet=12ahUKEwjrjpKAqd2OAxVr_bsIHaASGlMQM3oECBsQAA..i&w=1000&h=667&hcb=2&ved=2ahUKEwjrjpKAqd2OAxVr_bsIHaASGlMQM3oECBsQAA'
        ],
        tags: ['keys', 'keychain', 'red', 'heart'],
        reporterId: user3.id,
        ownerId: null, // ✅ Not matched yet
        isClaimed: false
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
