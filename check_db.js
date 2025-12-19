const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
});

db.connect((err) => {
    if (err) {
        console.error('Connect failed:', err);
        return;
    }
    console.log('Connected.');
    db.query('DESCRIBE users', (err, results) => {
        if (err) {
            console.error('Describe failed:', err);
        } else {
            console.log('Table Structure:', results);
        }
        db.end();
    });
});
