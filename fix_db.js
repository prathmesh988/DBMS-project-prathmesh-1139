const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
});

db.connect((err) => {
    if (err) { console.error(err); return; }

    // Check if email column exists
    db.query("SHOW COLUMNS FROM users LIKE 'email'", (err, results) => {
        if (err) { console.error(err); return; }

        if (results.length === 0) {
            console.log('Email column missing. Adding it...');
            db.query("ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL AFTER username", (err) => {
                if (err) { console.error('Failed to add column:', err); }
                else { console.log('Email column added successfully!'); }
                db.end();
            });
        } else {
            console.log('Email column already exists.');
            db.end();
        }
    });
});
