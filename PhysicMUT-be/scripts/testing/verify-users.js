const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/users',
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
            const users = JSON.parse(data);
            console.log('Users:', users);
            if (res.statusCode === 200 && Array.isArray(users)) {
                console.log('User API is working.');
            } else {
                console.error('User API verification failed.');
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
