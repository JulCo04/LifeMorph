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
// Endpoint to add a new contact
app.post('/api/contacts', async (req, res) => {
    try {
        const { firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links } = req.body;
        const [result] = await pool.query('INSERT INTO contacts (firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links]);
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
app.put('/api/contacts/:contactId', async (req, res) => {
    const contactId = req.params.contactId;
    const { firstName, lastName, relationship, birthday, email, phoneNumber, notes, links } = req.body;
    try {
        const [result] = await pool.query('UPDATE contacts SET firstName = ?, lastName = ?, relationship = ?, birthday = ?, email = ?, phoneNumber = ?, notes = ?, links = ? WHERE id = ?', [firstName, lastName, relationship, birthday, email, phoneNumber, notes, links, contactId]);
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
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke 💩');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
/*import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001;

const pool: Pool = mysql.createPool({
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string
});

pool.getConnection()
  .then((connection: PoolConnection) => {
    console.log('Connected to the database');
    connection.release();
  })
  .catch((error: any) => {
    console.error('Error connecting to the database:', error.message);
    process.exit(1);
  });

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Display all Users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new user
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    if (result && 'insertId' in result) {
      res.status(201).json({ message: 'User added successfully', userId: (result as any).insertId });
    } else {
      res.status(500).json({ error: 'Failed to add user' });
    }
  } catch (error: any) {
    console.error('Error adding user to the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a user
app.delete('/api/users/:userId', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    if (result && 'affectedRows' in result && (result as any).affectedRows === 1) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    console.error('Error removing user from the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to add a new contact
app.post('/api/contacts', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, relationship, userId, birthday } = req.body;
    const [result] = await pool.query(
      'INSERT INTO contacts (FirstName, LastName, Relationship, userId, birthday) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, relationship, userId, birthday]
    );

    if (result && 'insertId' in result) {
      res.status(201).json({ message: 'Contact added successfully', contactId: (result as any).insertId });
    } else {
      res.status(500).json({ error: 'Failed to add contact' });
    }
  } catch (error: any) {
    console.error('Error adding contact to the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get all contacts
app.get('/api/contacts', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contacts');
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get upcoming birthdays
app.get('/api/contacts/upcoming-birthdays', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM contacts
      WHERE MONTH(birthday) = MONTH(CURDATE())
      AND DAY(birthday) >= DAY(CURDATE())
      ORDER BY DAY(birthday) ASC
    `);
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contacts/:contactId', async (req: Request, res: Response) => {
  const contactId = req.params.contactId;
  const { firstName, lastName, relationship, birthday } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE contacts SET FirstName = ?, LastName = ?, Relationship = ?, birthday = ? WHERE id = ?',
      [firstName, lastName, relationship, birthday, contactId]
    );

    if (result && 'affectedRows' in result && result.affectedRows === 1) {
      res.json({ message: 'Contact updated successfully' });
    } else {
      res.status(404).json({ error: 'Contact not found' });
    }
  } catch (error: any) {
    console.error('Error updating contact in the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/contacts/:contactId', async (req: Request, res: Response) => {
  const contactId = req.params.contactId;
  try {
    const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [contactId]);
    if (result && 'affectedRows' in result && result.affectedRows === 1) {
      res.json({ message: 'Contact deleted successfully' });
    } else {
      res.status(404).json({ error: 'Contact not found' });
    }
  } catch (error: any) {
    console.error('Error removing contact from the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke 💩');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});*/ 
//# sourceMappingURL=index.js.map