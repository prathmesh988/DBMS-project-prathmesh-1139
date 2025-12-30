const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies for API requests

// Create MySQL connection (initially without database to create it if needed)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root' // User provided password
});

// Connect and initialize database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL server:', err);
        return;
    }
    console.log('Connected to MySQL server!');

    // Create database if not exists
    db.query('CREATE DATABASE IF NOT EXISTS test', (err) => {
        if (err) throw err;
        console.log('Database "test" checked/created');

        // Use the database
        db.changeUser({ database: 'test' }, (err) => {
            if (err) throw err;
            console.log('Switched to database "test"');

            // Create users table
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL
                )
            `;
            db.query(createTableQuery, (err) => {
                if (err) throw err;
                console.log('Table "users" checked/created');

                // Create todos table
                const createTodosTableQuery = `
                    CREATE TABLE IF NOT EXISTS todos (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(255) NOT NULL,
                        task VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `;
                db.query(createTodosTableQuery, (err) => {
                    if (err) throw err;
                    console.log('Table "todos" checked/created');
                });
            });
        });
    });
});

// Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password }); // Debug log

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) throw err;

        console.log('DB Results:', results); // Debug log

        if (results.length > 0) {
            // Redirect to todo page with username
            res.redirect(`/todo.html?username=${encodeURIComponent(results[0].username)}`);
        } else {
            res.send('<h1>Login Failed</h1><p>Invalid email or password. <a href="/login">Try again</a></p>');
        }
    });
});

// Handle Register
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

    // Simple check if user exists could be added here, but for now just insert
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error(err);
            res.send('<h1>Registration Failed</h1><p>Error occurred. <a href="/register">Try again</a></p>');
            return;
        }
        res.send('<h1>Registration Successful!</h1><p>Please <a href="/login">Login</a></p>');
    });
});


// API Routes for Todos
app.get('/api/todos', (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username required' });

    db.query('SELECT * FROM todos WHERE username = ? ORDER BY created_at DESC', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/todos', (req, res) => {
    const { username, task } = req.body;
    if (!username || !task) return res.status(400).json({ error: 'Missing fields' });

    db.query('INSERT INTO todos (username, task) VALUES (?, ?)', [username, task], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: result.insertId, username, task });
    });
});

app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task content required' });

    db.query('UPDATE todos SET task = ? WHERE id = ?', [task, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id, task });
    });
});

app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.sendStatus(200);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
