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
// Add new user
app.post('/api/users', async (req, res) => {
    try {
        const { username, email, password } = req.body;
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