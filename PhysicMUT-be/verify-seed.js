const http = require('http');

function get(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: path,
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        reject(new Error(`Status Code: ${res.statusCode} for ${path}`));
                        return;
                    }
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function verifyFrontendFlow() {
    try {
        console.log('--- 1. Fetching Chapters (Menu) ---');
        const chapters = await get('/content/chapters');
        console.log(`Success! Found ${chapters.length} chapters.`);

        // Find Chapter 3
        const ch3 = chapters.find(c => c.name.includes('Chương 3'));
        if (!ch3) throw new Error('Chapter 3 not found');
        console.log(`Checked Chapter 3: "${ch3.name}" has ${ch3.lessons.length} lessons.`);

        // Find Cyclotron Lesson
        const cyclotronLesson = ch3.lessons.find(l => l.name.includes('Cyclotron'));
        if (!cyclotronLesson) throw new Error('Cyclotron lesson not found in Chapter 3');

        console.log(`\n--- 2. Fetching Lesson Details (simulating user click on "${cyclotronLesson.name}") ---`);
        const lessonDetails = await get(`/content/lessons/${cyclotronLesson.id}`);

        console.log('Checking Content...');
        console.log(`- Theories: ${lessonDetails.theories.length}`);
        console.log(`- Models3D: ${lessonDetails.models3d.length}`);
        if (lessonDetails.models3d.length > 0) {
            console.log(`  > Model Name: ${lessonDetails.models3d[0].name}`);
            console.log(`  > Source URL: ${lessonDetails.models3d[0].source_url}`);
        }
        console.log(`- Examples: ${lessonDetails.examples.length}`);
        if (lessonDetails.examples.length > 0) {
            console.log(`  > Example: ${lessonDetails.examples[0].title}`);
            const solution = JSON.parse(lessonDetails.examples[0].solution);
            console.log(`  > Solution Steps: ${solution.steps.length}`);
        }
        console.log(`- Exercises: ${lessonDetails.exercises.length}`);

        console.log('\n--- VERIFICATION RESULT ---');
        if (lessonDetails.models3d.length > 0 && lessonDetails.examples.length > 0) {
            console.log('✅ READY FOR FRONTEND INTEGRATION');
        } else {
            console.log('❌ MISSING DATA');
        }

    } catch (error) {
        console.error('Frontend Flow Verification Failed:', error.message);
    }
}

verifyFrontendFlow();
