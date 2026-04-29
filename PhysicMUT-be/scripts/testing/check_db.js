const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const exercises = await prisma.exercise.findMany({
        select: {
            id: true,
            reference: true
        }
    });
    console.log('Total exercises:', exercises.length);
    let updatedCount = 0;
    for (const ex of exercises) {
        if (ex.reference && !ex.reference.includes('Đáp án đang được cập nhật')) {
            updatedCount++;
            console.log(`UPDATED: ${ex.id} -> ${ex.reference.substring(0, 40)}...`);
        } else {
            console.log(`OLD/EMPTY: ${ex.id}`);
        }
    }
    console.log(`Total updated references: ${updatedCount}`);
}

main().finally(() => prisma.$disconnect());
