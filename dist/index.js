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
app.use(cors());
// Display all Goals
app.get('/api/goals', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM goals');
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
        res.json(rows);
    }
    catch (error) {
        console.error('Error querying the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/api/goals', async (req, res) => {
    try {
        const { goalName, category, description, endDate, repetition, dateOfRepetition, goalType, steps, completed } = req.body;
        const [result] = await pool.query('INSERT INTO goals (goalName, category, description, endDate, repetition, dateOfRepetition, goalType, completed, steps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [goalName, category, description, endDate, repetition, dateOfRepetition, goalType, completed, steps]);
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
app.put('/api/goals', async (req, res) => {
    try {
        const { id, goalName, category, description, endDate, repetition, dateOfRepetition, goalType, steps, completed } = req.body;
        // Update the goal in the database
        const [result] = await pool.query('UPDATE goals SET goalName = ?, category = ?, description = ?, endDate = ?, repetition = ?, dateOfRepetition = ?, goalType = ?, steps = ?, completed = ? WHERE id = ?', [goalName, category, description, endDate, repetition, dateOfRepetition, goalType, steps, completed, id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Goal updated successfully' });
        }
        else {
            res.status(500).json({ error: 'Failed to update goal' });
        }
    }
    catch (error) {
        console.error('Error updating the goal in the database:', error);
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
// Endpoint to add a new contact
app.post('/api/contacts', async (req, res) => {
    try {
        const { firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links } = req.body;
        let photoPath = null;
        const [result] = await pool.query('INSERT INTO contacts (firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links, photoPath]);
        if (result && 'insertId' in result) {
            res.status(201).json({ message: 'Contact added successfully', contactId: result.insertId });
        }
        else {
            res.status(500).json({ error: 'Failed to add contact' });
        }
    }
    catch (error) {
        console.error('Error adding contact to the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Endpoint to get all contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contacts');
        res.json(rows);
    }
    catch (error) {
        console.error('Error querying the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Endpoint to get upcoming birthdays
app.get('/api/contacts/upcoming-birthdays', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT * FROM contacts 
      WHERE MONTH(birthday) = MONTH(CURDATE()) 
      AND DAY(birthday) >= DAY(CURDATE())
      ORDER BY DAY(birthday) ASC
    `);
        res.json(rows);
    }
    catch (error) {
        console.error('Error querying the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a contact
app.put('/api/contacts/:contactId', async (req, res) => {
    const contactId = req.params.contactId;
    const { firstName, lastName, relationship, birthday, email, phoneNumber, notes, links } = req.body;
    let photoPath = null;
    try {
        const [result] = await pool.query('UPDATE contacts SET firstName = ?, lastName = ?, relationship = ?, birthday = ?, email = ?, phoneNumber = ?, notes = ?, links = ?, photo = COALESCE(?, photo) WHERE id = ?', [firstName, lastName, relationship, birthday, email, phoneNumber, notes, links, photoPath, contactId]);
        if (result && 'affectedRows' in result && result.affectedRows === 1) {
            res.json({ message: 'Contact updated successfully' });
        }
        else {
            res.status(404).json({ error: 'Contact not found' });
        }
    }
    catch (error) {
        console.error('Error updating contact in the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a contact
app.delete('/api/contacts/:contactId', async (req, res) => {
    const contactId = req.params.contactId;
    try {
        const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [contactId]);
        if (result && 'affectedRows' in result && result.affectedRows === 1) {
            res.json({ message: 'Contact deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Contact not found' });
        }
    }
    catch (error) {
        console.error('Error removing contact from the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Search contacts by firstName, lastName, or email
app.get('/api/contacts/search', async (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM contacts WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?', [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]);
        res.json(rows);
    }
    catch (error) {
        console.error('Error querying the database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add a new password for Password Manager
app.post('/api/password-obj', async (req, res) => {
    try {
        const { url, username, password, desc } = req.body;
        const [result] = await pool.query('INSERT INTO passwords (url, username, password, description) VALUES (?, ?, ?, ?)', [url, username, password, desc]);
        if (result && 'insertId' in result) {
            res.status(201).json({ message: 'Password added successfully', passwordId: result.insertId });
        }
        else {
            res.status(500).json({ error: 'Failed to add password' });
        }
    }
    catch (error) {
        console.error('Error adding password to the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Retrieves passwords for Password Manager
app.post('/api/get-password-objs', async (req, res) => {
    try {
        const { userId } = req.body; // For future use
        const [rows] = await pool.query('SELECT * FROM passwords');
        if (rows.length > 0) {
            res.status(201).json({ message: "Passwords fetched successfully", passwords: rows });
        }
        else {
            res.status(500).json({ error: 'Failed to retrieve passwords' });
        }
    }
    catch (error) {
        console.error('Error querying the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Edits a password for Password Manager
app.put('/api/edit-password-obj', async (req, res) => {
    try {
        const { id, url, username, password, desc } = req.body;
        // Update the goal in the database
        const [result] = await pool.query('UPDATE passwords SET url = ?, username = ?, password = ?, description = ? WHERE id = ?', [url, username, password, desc, id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Password updated successfully' });
        }
        else {
            res.status(500).json({ error: 'Failed to update password' });
        }
    }
    catch (error) {
        console.error('Error updating the password in the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Deletes a password for Password Manager
app.delete('/api/delete-password-obj', async (req, res) => {
    const { passwordId } = req.body;
    try {
        const [result] = await pool.query('DELETE FROM passwords WHERE id = ?', [passwordId]);
        if (result && 'affectedRows' in result && result.affectedRows === 1) {
            res.json({ message: 'Password deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Password not found' });
        }
    }
    catch (error) {
        console.error('Error deleting password from database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Retrieves PIN for given user
app.post('/api/get-PIN', async (req, res) => {
    try {
        const { userId } = req.body;
        const [rows] = await pool.query('SELECT * FROM pins WHERE userId = ?', userId);
        if (rows.length > 0) {
            res.status(201).json({ hasPIN: true, PIN: rows[0].PIN });
        }
        else {
            res.status(500).json({ hasPIN: false, error: 'Failed to retrieve PIN' });
        }
    }
    catch (error) {
        console.error('Error querying the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Adds new PIN for given user
app.post('/api/new-PIN', async (req, res) => {
    try {
        const { userId, PIN } = req.body;
        const [result] = await pool.query('INSERT INTO pins (userId, PIN) VALUES (?, ?)', [userId, PIN]);
        if (result) {
            res.status(201).json({ message: 'PIN created' });
        }
        else {
            res.status(500).json({ error: 'Failed to create new PIN' });
        }
    }
    catch (error) {
        console.error('Error:', error);
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