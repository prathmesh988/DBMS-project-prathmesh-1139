const http = require('http');
const querystring = require('querystring');

function postRequest(path, data, callback) {
    const postData = querystring.stringify(data);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => callback(res.statusCode, body));
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

console.log('1. Attempting Registration...');
const testUser = {
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'password123'
};

postRequest('/register', testUser, (status, body) => {
    console.log(`Registration Status: ${status}`);
    console.log(`Registration Body: ${body}`);

    if (body.includes('Registration Failed')) {
        console.error('Registration failed, aborting login test.');
        return;
    }

    console.log('\n2. Attempting Login with correct credentials...');
    postRequest('/login', { email: testUser.email, password: testUser.password }, (status, loginBody) => {
        console.log(`Login Status: ${status}`);
        console.log(`Login Body: ${loginBody}`);

        if (loginBody.includes('Login Successful')) {
            console.log('\nSUCCESS: Login logic is working correctly.');
        } else {
            console.error('\nFAILURE: Login failed despite successful registration.');
        }
    });
});
