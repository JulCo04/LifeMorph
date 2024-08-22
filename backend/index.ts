import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import mysql, { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
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
      const { goalName, category, endDate } = req.body;
      const [result] = await pool.query('INSERT INTO goals (goalName, category, endDate, repetition, goalType, completed) VALUES (?, ?, ?, ?, ?, ?)', [goalName, category, endDate, 0, 0, 0]);
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
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{12,}$/;

    let warnings: any = {
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
    } else if (username === '') {
      warnings.showUserWarning = true;
      warnings.userWarningMessage = 'Please provide a username';
    }

    if (email === '') {
      warnings.showEmailWarning = true;
      warnings.emailWarningMessage = 'Please provide an email';
    } else if (!email.match(emailRegex)) {
      warnings.showEmailWarning = true;
      warnings.emailWarningMessage = 'Please provide a valid email';
    }

    if (password === '') {
      warnings.showPassWarning = true;
      warnings.passWarningMessage = 'Please provide a password';
    } else if (!password.match(passwordRegex)) {
      warnings.showPassWarning = true;
      warnings.passWarningMessage = 'Password must be at least 12 characters long, include at least one uppercase letter, one number, and one special character.';
    }

    if (warnings.showUserWarning || warnings.showEmailWarning || warnings.showPassWarning) {
      console.log('Validation warnings:', warnings);
      return res.status(400).json({ warnings });
    }

    const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    if (result && 'insertId' in result) {

      await setupFinanceForUser(result.insertId);
      res.status(201).json({ message: 'User added successfully', userId: result.insertId });

    } else {
      res.status(500).json({ error: 'Failed to add user' });
    }
  } catch (error: any) {
    console.error('Error adding user to the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login User
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Query to find the user by email and password
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    const values = [email, password];

    // Execute the query using the pool
    const [results, fields] = await pool.query<RowDataPacket[]>(sql, values);

    // If a user with the given email and password exists
    if (results.length > 0) {
      const user = results[0];
      console.log('User logged in:', user);

      // Optionally, you can send back some data or a success message
      res.status(200).json({ message: 'Logged in successfully', user });
    } else {
      // If no user found with the given credentials
      res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (err) {
    console.error('Error while logging in:', err);
    res.status(500).json({ message: 'Server error' });
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


// Setup finance defautlts
async function setupFinanceForUser(userId: number) {

  const categoriesValues = Array(16).fill(userId);

  const sums = [
    'Income', 'Expense', 'Fixed', 'Variable', 'UserTotal'
  ];

  const sumsValues = sums.flatMap(category => [category, userId]);
  
  const categoriesQuery = `
      INSERT INTO FinCategories (name, term, total, budgetTotal, userId) 
      VALUES 
        ('Wage', TRUE, 0, 0, ?),
        ('Rent', TRUE, 0, 0, ?),
        ('Insurance', TRUE, 0, 0, ?),
        ('Loans', TRUE, 0, 0, ?),
        ('Savings', TRUE, 0, 0, ?),
        ('Food', FALSE, 0, 0, ?),
        ('Entertainment', FALSE, 0, 0, ?),
        ('Utilities', TRUE, 0, 0, ?),
        ('Telephone', TRUE, 0, 0, ?),
        ('Medical', FALSE, 0, 0, ?),
        ('Clothing', FALSE, 0, 0, ?),
        ('Gifts', FALSE, 0, 0, ?),
        ('Personal Care', FALSE, 0, 0, ?),
        ('Transportation', FALSE, 0, 0, ?),
        ('Other Fixed', TRUE, 0, 0, ?),
        ('Other Variable', FALSE, 0, 0, ?);
  `;

  const sumsQuery = `
    INSERT INTO FinSums (name, total, userId) 
    VALUES 
    (?, 0, ?),
    (?, 0, ?),
    (?, 0, ?),
    (?, 0, ?),
    (?, 0, ?)
  `;

  // // Insert 10 empty tracking rows with NULL values
  // const rowQuery = `
  //   INSERT INTO FinRows (name, categoryId, term, date, flow, total, userId) 
  //   VALUES 
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?),
  //     (NULL, NULL, 1, NULL, NULL, 0, ?)
  // `;

  // const rowValues = Array(12).fill(userId);

  // Create Budget Summary Table

  const budgetSummaryTableQuery = `
    INSERT INTO BudgetSummaryTable (userId, totalBudgetIncome, totalActualIncome, totalBudgetFixedExpense, totalActualFixedExpense, totalBudgetVariableExpense, 
              totalActualVariableExpense, totalBudgetExpense, totalActualExpense)
    VALUES
    (?, 0, 0, 0, 0, 0, 0, 0, 0);
  `

  // Create income table
  const incomeTableQuery = `
    INSERT INTO FinIncomeTable (userId, categoryName, budgetIncome, actualIncome)
      VALUES
      (?, "Wage", 0, 0),
      (?, "Other Income", 0, 0);
  `;

  const incomeTableValues = Array(2).fill(userId);

  // Execute the query using the pool
  await pool.query(budgetSummaryTableQuery, userId);
  await pool.query(categoriesQuery, categoriesValues);
  await pool.query(sumsQuery, sumsValues);
  // await pool.query(rowQuery, rowValues);
  await pool.query(incomeTableQuery, incomeTableValues);

  console.log('Successfully setup finance', [userId]);
};

// Insert tracking row
app.post('/api/insert-tracking-row', async (req: Request, res: Response) => {
  try {
    const { name, categoryId, term, date, flow, total, userId } = req.body;

    const rowQuery = `
    INSERT INTO FinRows (name, categoryId, term, date, flow, total, userId) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const rowValues = [name, categoryId, term, date, flow, total, userId];

    // Execute the insertion query and get the last inserted ID
    const [result] = await pool.query<mysql.ResultSetHeader>(rowQuery, rowValues);
    const insertedId = result.insertId;
    console.log(insertedId);

    // Fetch the newly inserted row using the last inserted ID
    const fetchRowQuery = `
    SELECT * FROM FinRows WHERE rowId = ?
    `;
    const [rows] = await pool.query<mysql.RowDataPacket[]>(fetchRowQuery, [insertedId]);

    if (rows.length > 0) {
      console.log("Successfully added tracking row");
      res.status(200).json({ message: 'Successfully added tracking row', row: rows[0] });
    } else {
      res.status(404).json({ message: 'Row not found' });
    }
  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete tracking row
app.post('/api/delete-tracking-row', async (req:Request, res: Response) => {
  
  try {

    const rowId = req.body.rowId;

    const rowQuery = "DELETE FROM FinRows WHERE rowId = ?";

    await pool.query(rowQuery, rowId);

    console.log(`Successfully deleted tracking row [${rowId}]`);
    res.status(200).json({ message: `Successfully deleted tracking row [${rowId}]` });

  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
  }

});

// Update tracking row
app.post('/api/update-tracking-row', async (req:Request, res: Response) => {
  
  try {

    const {name, categoryId, term, date, flow, total, rowId, userId} = req.body;

    const rowQuery = `
      UPDATE FinRows
      SET
      name = ?, 
      categoryId = ?,
      term = ?,
      date = ?,
      flow = ?,
      total = ?
      WHERE rowId = ? AND userId = ?;
    `;

    const rowValues = [name, categoryId, term, date, flow, total, rowId, userId]

    await pool.query(rowQuery, rowValues);

    console.log(`Successfully updated tracking row [${rowId}]`);
    res.status(200).json({ message: `Successfully updatestracking row [${rowId}]` });

  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
  }

});

// Insert new category
app.post('/api/insert-category', async (req:Request, res: Response) => {
  
  try {

    const { name, userId } = req.body;

    const categoryQuery = `
      INSERT INTO FinCategories (name, total, userId) 
        VALUES 
            (?, 0, ?);
    `;

    const categoryValues = [name, userId]

    await pool.query(categoryQuery, categoryValues);

    console.log(`Successfully inserted category [${name}]`);
    res.status(200).json({ message: `Successfully inserted category [${name}]` });

  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate entry error', err);
      res.status(409).json({ message: 'Duplicate entry error: Category already exists' });
    } else {
      console.error('Server error', err);
      res.status(500).json({ message: 'Server error' });
    }
  }

});

// Delete a category
app.post('/api/delete-category', async (req:Request, res: Response) => {
  
  try {

    const { categoryId, userId } = req.body;

    const rowsQuery = `
      UPDATE FinRows
      SET categoryId = NULL
      WHERE categoryId = ?;
    `;

    await pool.query(rowsQuery, categoryId);

    const categoryQuery = `
      DELETE FROM fincategories WHERE categoryId = ? and userId = ?;
    `;

    const categoryValues = [categoryId, userId]

    await pool.query(categoryQuery, categoryValues);

    console.log(`Successfully deleted category`);
    res.status(200).json({ message: `Successfully deleted category` });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});

// Get Categories
app.get('/api/finance-categories/:userId', async (req:Request, res: Response) => {
  
  try {

    const userId = req.params.userId;

    const categoriesQuery = 'SELECT * FROM FinCategories WHERE userId = ?';

    const [results] = await pool.query<RowDataPacket[]>(categoriesQuery, userId);

    console.log(`Successfully fetched categories`);
    console.log(results);
    res.status(200).json({
      message: 'Successfully fetched categories',
      data: results
    });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});

// Get Sums
app.get('/api/finance-sums/:userId', async (req:Request, res: Response) => {
  
  try {

    const userId = req.params.userId;

    const sumsQuery = 'SELECT * FROM FinSums WHERE userId = ?';

    const [results] = await pool.query<RowDataPacket[]>(sumsQuery, userId);

    console.log(`Successfully fetched sums`);
    console.log(results);
    res.status(200).json({
      message: 'Successfully fetched sums',
      data: results
    });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});

// Get Rows
app.get('/api/finance-rows/:userId', async (req:Request, res: Response) => {
  
  try {

    const userId = req.params.userId;

    const rowQuery = 'SELECT * FROM FinRows WHERE userId = ?';

    const [results] = await pool.query<RowDataPacket[]>(rowQuery, userId);

    const formattedResults = results.map(result => {
      if (result.date) {
        const date = new Date(result.date);
        result.date = date.toISOString().split('T')[0];
      }
      return result;
    });
    
    console.log(`Successfully fetched rows`);
    console.log(formattedResults);
    res.status(200).json({
      message: 'Successfully fetched rows',
      data: formattedResults
    });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});

// Get Income Table
app.get('/api/finance-income-table/:userId', async (req:Request, res: Response) => {
  
  try {

    const userId = req.params.userId;

    const rowQuery = 'SELECT * FROM FinIncomeTable WHERE userId = ?';

    const [results] = await pool.query<RowDataPacket[]>(rowQuery, userId);

    const formattedResults = results.map(result => {
      if (result.date) {
        const date = new Date(result.date);
        result.date = date.toISOString().split('T')[0];
      }
      return result;
    });
    
    console.log(`Successfully fetched income table`);
    console.log(formattedResults);
    res.status(200).json({
      message: 'Successfully fetched income table',
      data: formattedResults
    });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});

// Get Fixed Expenses Table
app.get('/api/finance-fixed-expenses/:userId', async (req:Request, res: Response) => {
  
  try {

    const userId = req.params.userId;

    const rowQuery = 'SELECT * FROM FinFixedExpensesTable WHERE userId = ?';

    const [results] = await pool.query<RowDataPacket[]>(rowQuery, userId);

    const formattedResults = results.map(result => {
      if (result.date) {
        const date = new Date(result.date);
        result.date = date.toISOString().split('T')[0];
      }
      return result;
    });
    
    console.log(`Successfully fetched income table`);
    console.log(formattedResults);
    res.status(200).json({
      message: 'Successfully fetched income table',
      data: formattedResults
    });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});

// Get Variable Expenses Table
app.get('/api/finance-variable-expenses/:userId', async (req:Request, res: Response) => {
  
  try {

    const userId = req.params.userId;

    const rowQuery = 'SELECT * FROM FinVariableExpensesTable WHERE userId = ?';

    const [results] = await pool.query<RowDataPacket[]>(rowQuery, userId);

    const formattedResults = results.map(result => {
      if (result.date) {
        const date = new Date(result.date);
        result.date = date.toISOString().split('T')[0];
      }
      return result;
    });
    
    console.log(`Successfully fetched variable expenses table`);
    console.log(formattedResults);
    res.status(200).json({
      message: 'Successfully fetched variable expenses income table',
      data: formattedResults
    });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});

// Update Budget Income Table
app.post('/api/update-budget-income-table', async (req:Request, res: Response) => {
  
  try {

    const {budgetIncome, categoryName, userId} = req.body;

    const rowQuery = `
      UPDATE FinIncomeTable
      SET
      budgetIncome = ?
      WHERE categoryName = ? AND userId = ?;
    `;

    const rowValues = [budgetIncome, categoryName, userId]

    await pool.query(rowQuery, rowValues);

    console.log(`Successfully updated income table`);
    res.status(200).json({ message: `Successfully updated income table` });

  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
  }

});

// Update Budget Fixed Expenses Table
app.post('/api/update-budget-fixed-table', async (req:Request, res: Response) => {
  
  try {

    const {budgetExpense, categoryId, userId} = req.body;

    const rowQuery = `
      UPDATE FinFixedExpensesTable
      SET
      budgetExpense = ?
      WHERE categoryId = ? AND userId = ?;
    `;

    const rowValues = [budgetExpense, categoryId, userId]

    await pool.query(rowQuery, rowValues);

    console.log(`Successfully updated budget fixed expense`);
    res.status(200).json({ message: `Successfully updated budget fixed expense` });

  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
  }

});

// Update Budget Variable Expenses Table
app.post('/api/update-budget-variable-table', async (req:Request, res: Response) => {
  
  try {

    const {budgetExpense, categoryId, userId} = req.body;

    const rowQuery = `
      UPDATE FinVariableExpensesTable
      SET
      budgetExpense = ?
      WHERE categoryId = ? AND userId = ?;
    `;

    const rowValues = [budgetExpense, categoryId, userId]

    await pool.query(rowQuery, rowValues);

    console.log(`Successfully updated budget variable expense`);
    res.status(200).json({ message: `Successfully updated budget variable expense` });

  } catch (err) {
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
  }

});

// Get Budget Summary Table
app.get('/api/finance-budget-summary/:userId', async (req:Request, res: Response) => {
  
  try {

    const userId = req.params.userId;

    const rowQuery = 'SELECT * FROM BudgetSummaryTable WHERE userId = ?';

    const [results] = await pool.query<RowDataPacket[]>(rowQuery, userId);

    const formattedResults = results.map(result => {
      if (result.date) {
        const date = new Date(result.date);
        result.date = date.toISOString().split('T')[0];
      }
      return result;
    });
    
    console.log(`Successfully fetched budget summary table`);
    console.log(formattedResults);
    res.status(200).json({
      message: 'Successfully fetched  budget summary table',
      data: formattedResults
    });

  } catch (err: any) {
    
    console.error('Server error', err);
    res.status(500).json({ message: 'Server error' });
    
  }

});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke 💩');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


