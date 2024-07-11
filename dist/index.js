import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
dotenv.config();
const app = express();
const port = 3001;
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});
pool.getConnection()
    .then((connection) => {
    console.log('Connected to the database');
    connection.release();
})
    .catch((error) => {
    console.error('Error connecting to the database:', error.message);
    process.exit(1);
});
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
// Display all Goals
app.get('/api/goals', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM goals');
        console.log(rows);
        res.json(rows);
    }
    catch (error) {
        console.error('Error querying the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Display all Users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        console.log(rows);
        res.json(rows);
    }
    catch (error) {
        console.error('Error querying the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/api/goals', async (req, res) => {
    try {
        const { goalName, category, endDate } = req.body;
        const [result] = await pool.query('INSERT INTO goals (goalName, category, endDate, repetition, goalType, completed) VALUES (?, ?, ?, ?, ?, ?)', [goalName, category, endDate, 0, 0, 0]);
        if (result && 'insertId' in result) {
            const [rows] = await pool.query('SELECT * FROM goals WHERE id = ?', [result.insertId]);
            if (rows.length > 0) {
                res.status(201).json({ message: 'Goal added successfully', goal: rows[0] });
            }
            else {
                res.status(500).json({ error: 'Failed to retrieve the added goal' });
            }
        }
        else {
            res.status(500).json({ error: 'Failed to add goal' });
        }
    }
    catch (error) {
        console.error('Error adding user to the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a goal
app.delete('/api/goals/:goalId', async (req, res) => {
    const goalId = req.params.goalId;
    try {
        const [result] = await pool.query('DELETE FROM goals WHERE id = ?', [goalId]);
        if (result && 'affectedRows' in result && result.affectedRows === 1) {
            res.json({ message: 'Goal deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Goal not found' });
        }
    }
    catch (error) {
        console.error('Error removing goal from the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Register user
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{12,}$/;
        let warnings = {
            showUserWarning: false,
            userWarningMessage: '',
            showEmailWarning: false,
            emailWarningMessage: '',
            showPassWarning: false,
            passWarningMessage: '',
        };
        if (username.length > 20) {
            warnings.showUserWarning = true;
            warnings.userWarningMessage = "Name can't be over 20 characters";
        }
        else if (username === '') {
            warnings.showUserWarning = true;
            warnings.userWarningMessage = 'Please provide a username';
        }
        if (email === '') {
            warnings.showEmailWarning = true;
            warnings.emailWarningMessage = 'Please provide an email';
        }
        else if (!email.match(emailRegex)) {
            warnings.showEmailWarning = true;
            warnings.emailWarningMessage = 'Please provide a valid email';
        }
        if (password === '') {
            warnings.showPassWarning = true;
            warnings.passWarningMessage = 'Please provide a password';
        }
        else if (!password.match(passwordRegex)) {
            warnings.showPassWarning = true;
            warnings.passWarningMessage = 'Password must be at least 12 characters long, include at least one uppercase letter, one number, and one special character.';
        }
        if (warnings.showUserWarning || warnings.showEmailWarning || warnings.showPassWarning) {
            console.log('Validation warnings:', warnings);
            return res.status(400).json({ warnings });
        }
        const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        if (result && 'insertId' in result) {
            res.status(201).json({ message: 'User added successfully', userId: result.insertId });
        }
        else {
            res.status(500).json({ error: 'Failed to add user' });
        }
    }
    catch (error) {
        console.error('Error adding user to the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login User
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Query to find the user by email and password
        const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
        const values = [email, password];
        // Execute the query using the pool
        const [results, fields] = await pool.query(sql, values);
        // If a user with the given email and password exists
        if (results.length > 0) {
            const user = results[0];
            console.log('User logged in:', user);
            // Optionally, you can send back some data or a success message
            res.status(200).json({ message: 'Logged in successfully', user });
        }
        else {
            // If no user found with the given credentials
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (err) {
        console.error('Error while logging in:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Remove a user
app.delete('/api/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        if (result && 'affectedRows' in result && result.affectedRows === 1) {
            res.json({ message: 'User deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error('Error removing user from the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke 💩');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map