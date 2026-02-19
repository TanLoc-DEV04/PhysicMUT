
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('Verifying seeded data...');

    // Check Chapters
    const chapters = await prisma.chapter.findMany({
        include: {
            lessons: {
                include: {
                    theories: true,
                    models3d: true,
                    examples: true,
                    exercises: true
                }
            }
        }
    });

    console.log(`Found ${chapters.length} chapters.`);

    for (const chapter of chapters) {
        console.log(`Chapter: ${chapter.name}`);
        for (const lesson of chapter.lessons) {
            console.log(`  Lesson: ${lesson.name}`);
            console.log(`    Theories: ${lesson.theories.length}`);
            console.log(`    Models3D: ${lesson.models3d.length}`);
            console.log(`    Examples: ${lesson.examples.length}`);
            console.log(`    Exercises: ${lesson.exercises.length}`);

            // Check specific content presence
            if (lesson.exercises.length > 0) {
                console.log(`    First Exercise Question Preview: ${lesson.exercises[0].question.substring(0, 50)}...`);
            }
        }
    }
}

verify()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
