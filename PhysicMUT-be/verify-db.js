const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Attempt to connect
    await prisma.$connect();
    console.log('Successfully connected to the database.');

    // Creating a test user just to be sure (optional, or just count)
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
    
    // Check if other tables exist by counting
    const lessonCount = await prisma.lesson.count();
    console.log(`Current lesson count: ${lessonCount}`);

  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
