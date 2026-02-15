const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // --- 0. CLEANUP ---
    console.log('Cleaning up database...');
    await prisma.exercise.deleteMany({});
    await prisma.example.deleteMany({});
    await prisma.model3D.deleteMany({});
    await prisma.theory.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.chapter.deleteMany({});

    // UPSERT ROLES & USERS (Keep existing logic for roles/users)
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'System Administrator', permissions: { all: true } }
    });
    const teacherRole = await prisma.role.upsert({
        where: { name: 'TEACHER' },
        update: {},
        create: { name: 'TEACHER', description: 'Teacher', permissions: { content: true } }
    });
    const studentRole = await prisma.role.upsert({
        where: { name: 'STUDENT' },
        update: {},
        create: { name: 'STUDENT', description: 'Student', permissions: { read: true } }
    });

    const adminPwd = '123456';
    await prisma.user.upsert({
        where: { email: 'admin@physicmut.com' },
        update: {},
        create: { username: 'admin', email: 'admin@physicmut.com', password_hash: adminPwd, full_name: 'Quản trị viên', role: { connect: { id: adminRole.id } } }
    });
    // ... similarly for teacher/student if needed, skipping for brevity as user implies existing correct setup or just wants content focus.
    // Actually, let's keep them to be safe.
    await prisma.user.upsert({
        where: { email: 'teacher@physicmut.com' },
        update: {},
        create: { username: 'teacher', email: 'teacher@physicmut.com', password_hash: '123456', full_name: 'Giáo viên Vật Lý', role: { connect: { id: teacherRole.id } } }
    });
    await prisma.user.upsert({
        where: { email: 'student@physicmut.com' },
        update: {},
        create: { username: 'student', email: 'student@physicmut.com', password_hash: '123456', full_name: 'Nguyễn Văn A', role: { connect: { id: studentRole.id } } }
    });


    // --- 1. CONTENT CREATION ---
    console.log('Creating 3 Models Content...');

    // Helper to create content
    const createModelContent = async (chapterName, lessonName, theories, modelData, examples, exercises) => {
        const chapter = await prisma.chapter.create({
            data: {
                name: chapterName,
                description: `Chương về ${chapterName}`,
                order: 1,
                lessons: {
                    create: [{
                        name: lessonName,
                        order: 1,
                        theories: { create: theories },
                        models3d: { create: [modelData] }, // 1:1 Model per user request implies 1 main model, but schema allows many. We put 1.
                        examples: { create: examples },
                        exercises: { create: exercises }
                    }]
                }
            }
        });
        console.log(`Created ${lessonName}`);
    };

    // 1. CYCLOTRON
    await createModelContent(
        'Điện từ trường',
        'Máy gia tốc Cyclotron',
        [{
            title: 'Nguyên lý hoạt động Cyclotron',
            content_html: '<p>Cyclotron là máy gia tốc hạt sử dụng từ trường để làm hạt chuyển động theo quỹ đạo tròn...</p>',
            type: 'Theory',
            status: 'ACTIVE'
        }],
        {
            name: 'Cyclotron',
            description: 'Mô hình 3D Máy gia tốc Cyclotron',
            source_url: '', // Frontend uses `type` mainly, or we can put a dummy path.
            thumbnail_url: '/cyclotron.jpg',
            type: 'CYCLOTRON', // IMPORTANT: Matches ModelRegistry case
            status: 'ACTIVE'
        },
        [{
            title: 'Bài toán Cyclotron 1',
            problem: 'Tính tần số quay của hạt đơteri...',
            solution: 'Giải quy: f = qB/2πm...',
            type: 'Calculation',
            status: 'ACTIVE'
        }],
        [{
            question: 'Cyclotron dùng để gia tốc hạt nào?',
            options: [{ id: 'A', text: 'Hạt mang điện' }, { id: 'B', text: 'Hạt không mang điện' }],
            correct_answer: 'A',
            level: 'EASY',
            type: 'MultipleChoice',
            status: 'ACTIVE'
        }]
    );

    // 2. LOUDSPEAKER (Loa điện động)
    await createModelContent(
        'Điện từ kỹ thuật',
        'Loa điện động',
        [{
            title: 'Nguyên lý Loa điện động',
            content_html: '<p>Hoạt động dựa trên lực từ tác dụng lên dòng điện trong từ trường...</p>',
            type: 'Theory',
            status: 'ACTIVE'
        }],
        {
            name: 'Loa điện động',
            description: 'Mô hình 3D Loa điện động',
            source_url: '',
            thumbnail_url: '/loadiendong.png',
            type: 'LOUDSPEAKER', // Matches ModelRegistry
            status: 'ACTIVE'
        },
        [{
            title: 'Ví dụ Loa 1',
            problem: 'Tính lực từ tác dụng lên cuộn dây...',
            solution: 'F = BIlsin(alpha)...',
            type: 'Calculation',
            status: 'ACTIVE'
        }],
        [{
            question: 'Bộ phận nào dao động tạo ra âm thanh?',
            options: [{ id: 'A', text: 'Màng loa' }, { id: 'B', text: 'Nam châm' }],
            correct_answer: 'A',
            level: 'EASY',
            type: 'MultipleChoice',
            status: 'ACTIVE'
        }]
    );

    // 3. MASS SPECTROMETER (Máy quang phổ khối)
    await createModelContent(
        'Vật lý hạt nhân',
        'Máy quang phổ khối',
        [{
            title: 'Nguyên lý Máy quang phổ khối',
            content_html: '<p>Dùng để tách các đồng vị dựa trên tỉ số điện tích trên khối lượng...</p>',
            type: 'Theory',
            status: 'ACTIVE'
        }],
        {
            name: 'Máy quang phổ khối',
            description: 'Mô hình 3D Máy quang phổ khối',
            source_url: '',
            thumbnail_url: '/mayQuangphokhoi.png', // Ensure this file exists in public
            type: 'MASS_SPECTROMETER', // Matches ModelRegistry
            status: 'ACTIVE'
        },
        [{
            title: 'Ví dụ Quang phổ 1',
            problem: 'Tính bán kính quỹ đạo của ion...',
            solution: 'R = mv/qB...',
            type: 'Calculation',
            status: 'ACTIVE'
        }],
        [{
            question: 'Máy quang phổ khối dùng để làm gì?',
            options: [{ id: 'A', text: 'Đo khối lượng nguyên tử' }, { id: 'B', text: 'Đo nhiệt độ' }],
            correct_answer: 'A',
            level: 'MEDIUM',
            type: 'MultipleChoice',
            status: 'ACTIVE'
        }]
    );

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
