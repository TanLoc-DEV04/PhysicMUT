"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const lessons = await prisma.lesson.findMany();
    console.log('--- LESSONS ---');
    lessons.forEach(l => {
        console.log(`ID: ${l.id} | Name: ${l.name}`);
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check_data.js.map