import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching distinct types from Model3D...');
    const types = await prisma.model3D.findMany({
      select: { type: true },
      distinct: ['type'],
    });
    console.log('Result:', JSON.stringify(types, null, 2));
    const typeList = types.map(t => t.type).filter(Boolean);
    console.log('Type List:', typeList);
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
