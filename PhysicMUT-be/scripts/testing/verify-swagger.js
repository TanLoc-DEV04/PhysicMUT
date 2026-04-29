const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api-docs/',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200 || res.statusCode === 301) {
        console.log('Swagger UI is accessible.');
        process.exit(0);
    } else {
        console.error('Swagger UI is NOT accessible.');
        process.exit(1);
    }
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.end();
