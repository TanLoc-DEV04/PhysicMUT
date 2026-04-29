const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/content/chapters',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const chapters = JSON.parse(data);
            console.log('Chapters:', chapters);
            if (res.statusCode === 200 && Array.isArray(chapters)) {
                console.log('Content API is working.');
            } else {
                console.error('Content API verification failed.');
            }
        } catch (e) {
            console.error('Failed to parse response:', e);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
