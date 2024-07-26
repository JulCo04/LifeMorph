import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import mysql, { FieldPacket, Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
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
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    console.log(rows);
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
      const { goalName, category, description, endDate, repetition, dateOfRepetition, goalType, steps } = req.body;
      const [result] = await pool.query('INSERT INTO goals (goalName, category, description, endDate, repetition, dateOfRepetition, goalType, completed, steps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [goalName, category, description, endDate, repetition, dateOfRepetition, goalType, 0, steps]);
      if (result && 'insertId' in result) {
          const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM goals WHERE id = ?', [result.insertId]);
          if (rows.length > 0) {
              res.status(201).json({ message: 'Goal added successfully', goal: rows[0] });
          } else {
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
    const [result] : [ResultSetHeader, FieldPacket[]] = await pool.query(
      'UPDATE goals SET goalName = ?, category = ?, description = ?, endDate = ?, repetition = ?, dateOfRepetition = ?, goalType = ?, steps = ?, completed = ? WHERE id = ?',
      [goalName, category, description, endDate, repetition, dateOfRepetition, goalType, steps, completed, id]
    );

    if (result.affectedRows > 0) {

        res.status(200).json({ message: 'Goal updated successfully'});

    } else {
      res.status(500).json({ error: 'Failed to update goal' });
    }
  } catch (error) {
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
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    if (result && 'insertId' in result) {
      res.status(201).json({ message: 'User added successfully', userId: result.insertId });
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
    if (result && 'affectedRows' in result && result.affectedRows === 1) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    console.error('Error removing user from the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke 💩');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



