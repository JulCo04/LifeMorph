import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import mysql, { FieldPacket, Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import cors from 'cors';
import nodemailer, { Transporter } from 'nodemailer';
import { google } from 'googleapis';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

dotenv.config();

console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);

const OAuth2 = google.auth.OAuth2;

const app = express();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

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

// const corsOptions = {
//   origin: process.env.PRODUCTION_ENVIRONMENT || 'http://localhost:3000', // React app URL or other allowed origins
//   methods: 'GET,POST,PUT,DELETE', // Specify the methods allowed
//   credentials: true, // Set to true if you're using cookies or other credentials
//   optionsSuccessStatus: 200
// };

const corsOptions = {
  origin: '*', // React app URL or other allowed origins
  methods: 'GET,POST,PUT,DELETE', // Specify the methods allowed
  credentials: true, // Set to true if you're using cookies or other credentials
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const oauth2Client = new OAuth2(
  "36696501036-kcinmdfdcbk58l1snuo4csko4lu1qnc3.apps.googleusercontent.com",
  "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", 
  "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: "1//044FyXPFvux1_CgYIARAAGAQSNwF-L9IrHTTWZ_zatyQUHsYAQz7lPNi1e6UYcUDPrZo1KEms7MNbhzYOQULKsF_m9RZxXvnKwtg"
});
const accessToken = oauth2Client.getAccessToken()

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: "OAuth2",
    clientId: "36696501036-kcinmdfdcbk58l1snuo4csko4lu1qnc3.apps.googleusercontent.com",
    clientSecret: "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",
    refreshToken: "1//044FyXPFvux1_CgYIARAAGAQSNwF-L9IrHTTWZ_zatyQUHsYAQz7lPNi1e6UYcUDPrZo1KEms7MNbhzYOQULKsF_m9RZxXvnKwtg",
    user: 'adulteasemail@gmail.com',
    accessToken: accessToken as any
  },
  tls: {
    rejectUnauthorized: false
  }
});

function generateVerificationToken() {
  return crypto.randomBytes(20).toString('hex');
}

async function sendVerificationEmail(email: string, verification_token: string): Promise<void> {
  const mailOptions: nodemailer.SendMailOptions = {
      from: 'adulteasemail@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: `<p>Click the following link to verify your account: <a href="http://localhost:3001/api/verify?token=${verification_token}">Verify Email</a></p>`
  };

  try {
      await transporter.sendMail(mailOptions);
  } catch (error: any) { 
      console.error('Error sending verification email:', error);
  }
}

// Fetch Goals
app.get('/api/goals/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
      const [rows] = await pool.query('SELECT * FROM goals WHERE userId = ?', [userId]);
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
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
      const { goalName, category, description, endDate, repetition, dateOfRepetition, goalType, steps, completed, userId } = req.body;
      const [result] = await pool.query('INSERT INTO goals (goalName, category, description, endDate, repetition, dateOfRepetition, goalType, completed, steps, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [goalName, category, description, endDate, repetition, dateOfRepetition, goalType, completed, steps, userId]);
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


app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const verification_token = generateVerificationToken();

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    if(rows.length > 0) {
      return res.status(400).json({message: "Email is already in use"});
    }

    // Insert user into the database
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)', [username, email, password, verification_token]);

    if (result && 'insertId' in result) {

      await setupFinanceForUser(result.insertId);
      res.status(201).json({ message: 'User added successfully', userId: result.insertId });
      await sendVerificationEmail(email, verification_token);

    } else {
      res.status(500).json({ error: 'Failed to add user' });
    }
  } catch (error) {
    console.error('Error adding user to the database:', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/verify', async (req: Request, res: Response) => {
  const { token } = req.query;
  console.log('Token received:', token);

  try {
    if (!token) {
      return res.status(400).send('Verification token is required.');
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE verification_token = ?', [token]);
    console.log('Database response:', rows);

    if (rows.length > 0) {
      const user = rows[0];
      console.log('Verifying user:', user);

      await pool.query('UPDATE users SET verified = ?, verification_token = NULL WHERE id = ?', [true, user.id]);
      res.send('Account verified successfully. You can now login.');
    } else {
      res.status(404).send('Invalid or expired verification token.');
    }
  } catch (error) {
    console.error('Error verifying account:', error);
    res.status(500).send('Internal server error');
  }
});
 /*Login User
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
});*/

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

      // Check if the user is verified
      if (!user.verified) {
        return res.status(401).json({ message: 'Please verify your email before logging in.' });
      }

      console.log('User logged in:', user);

      // Optionally, you can send back some data or a success message
      res.status(200).json({ message: 'Logged in successfully', user });
    } else {
      // If no user is found with the given credentials
      res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (err) {
    console.error('Error while logging in:', err);
    res.status(500).json({ message: 'Server error' });
  }
});





// Function to generate a unique token for password reset
function generateResetToken(email: any) {
    return jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

// Function to verify the reset token
function verifyResetToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return (decoded as any).email;
    } catch (error) {
        return null;
    }
}


app.post('/api/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    // Generate a reset token
    const resetToken = generateResetToken(email);
    await pool.query('UPDATE users SET resetToken = ? WHERE email = ?', [resetToken, email]);

    // Send reset password email
    const resetPasswordUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'adulteasemail@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the following link to reset your password: <a href="${resetPasswordUrl}">Reset Password</a></p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Verify the token
    const email = verifyResetToken(token);
    if (!email) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Update the user's password
    const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);

    // Log the result to inspect its structure
    console.log('Update Result:', result);

    // Check the affectedRows property to see if any rows were updated
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Password reset successfully.' });
    } else {
      res.status(500).json({ message: 'Failed to reset password.' });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
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

// Endpoint to add a new contact
app.post('/api/contacts', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links } = req.body;
    let photoPath = null;

    const [result] = await pool.query(
      'INSERT INTO contacts (firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, relationship, userId, birthday, email, phoneNumber, notes, links, photoPath]
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
app.get('/api/contacts/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query('SELECT * FROM contacts WHERE userId = ?', [userId]);
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get upcoming birthdays
app.get('/api/contacts/upcoming-birthdays/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(`
      SELECT * FROM contacts 
      WHERE userId = ? AND 
      (
        (MONTH(birthday) = MONTH(CURDATE()) AND DAY(birthday) >= DAY(CURDATE())) 
        OR 
        (MONTH(birthday) = MONTH(CURDATE() + INTERVAL 1 MONTH))
      )
      ORDER BY MONTH(birthday) ASC, DAY(birthday) ASC
    `, [userId]);
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a contact
app.put('/api/contacts/:contactId', async (req: Request, res: Response) => {
  const contactId = req.params.contactId;
  const { firstName, lastName, relationship, birthday, email, phoneNumber, notes, links } = req.body;
  let photoPath = null;

  try {

    const [result] = await pool.query(
      'UPDATE contacts SET firstName = ?, lastName = ?, relationship = ?, birthday = ?, email = ?, phoneNumber = ?, notes = ?, links = ?, photo = COALESCE(?, photo) WHERE id = ?',
      [firstName, lastName, relationship, birthday, email, phoneNumber, notes, links, photoPath, contactId]
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

// Delete a contact
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

// Search contacts by firstName, lastName, or email
app.get('/api/contacts/search', async (req: Request, res: Response) => {
  const searchQuery = req.query.q as string;
  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM contacts WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?',
      [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Error querying the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new password for Password Manager
app.post('/api/password-obj', async (req: Request, res: Response) => {
  try {
    const { url, username, password, desc, userId } = req.body;

    const [result] = await pool.query(
      'INSERT INTO passwords (url, username, password, description, userId) VALUES (?, ?, ?, ?, ?)',
      [url, username, password, desc, userId]
    );

    if (result && 'insertId' in result) {
      res.status(201).json({ message: 'Password added successfully', passwordId: result.insertId });
    } else {
      res.status(500).json({ error: 'Failed to add password' });
    }
  } catch (error) {
    console.error('Error adding password to the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieves passwords for Password Manager
app.post('/api/get-password-objs', async (req, res) => {
  try {
      const { userId } = req.body; // For future use
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM passwords WHERE userId = ?', [userId]);
      if (rows.length > 0) {
        res.status(201).json({message: "Passwords fetched successfully", passwords: rows});
      }
      else {
        res.status(201).json({message: 'No passwords created yet', passwords: [] });
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
    const [result] : [ResultSetHeader, FieldPacket[]] = await pool.query(
      'UPDATE passwords SET url = ?, username = ?, password = ?, description = ? WHERE id = ?',
      [url, username, password, desc, id]
    );

    if (result.affectedRows > 0) {

        res.status(200).json({ message: 'Password updated successfully'});

    } else {
      res.status(500).json({ error: 'Failed to update password' });
    }
  } catch (error) {
    console.error('Error updating the password in the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deletes a password for Password Manager
app.delete('/api/delete-password-obj', async (req: Request, res: Response) => {
  const { passwordId } = req.body;

  try {
    const [result] = await pool.query('DELETE FROM passwords WHERE id = ?', [passwordId]);

    if (result && 'affectedRows' in result && result.affectedRows === 1) {
      res.json({ message: 'Password deleted successfully' });
    } 
    else {
      res.status(404).json({ error: 'Password not found' });
    }

  } catch (error) {
    console.error('Error deleting password from database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieves PIN for given user
app.post('/api/get-PIN', async (req, res) => {
  try {
      const { userId } = req.body;
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM pins WHERE userId = ?', userId);
      if (rows.length > 0) {
        res.status(201).json({hasPIN: true, PIN: rows[0].PIN});
      }
      else {
        res.status(500).json({hasPIN: false, error: 'Failed to retrieve PIN' });
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
      const [result] = await pool.query<RowDataPacket[]>('INSERT INTO pins (userId, PIN) VALUES (?, ?)', [userId, PIN]);
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

// Changes username for a user
app.put('/api/change-account-username', async (req, res) => {
  try {
    const { userId, username } = req.body;

    // Check if the username already exists
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists', success: false});
    }

    // Update the goal in the database
    const [result] : [ResultSetHeader, FieldPacket[]] = await pool.query(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, userId]
    );

    if (result.affectedRows > 0) {

        res.status(200).json({ message: 'Username updated successfully', success: true});

    } else {
      res.status(500).json({ message: 'Failed to change username', success: false });
    }
  } catch (error) {
    console.error('Error updating the username in the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Changes email for a user
app.put('/api/change-account-email', async (req, res) => {
  try {
    const { userId, email } = req.body;

    // Check if the username already exists
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Email in use', success: false});
    }

    // Add email verification here

    // Update the goal in the database
    const [result] : [ResultSetHeader, FieldPacket[]] = await pool.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, userId]
    );

    if (result.affectedRows > 0) {

        res.status(200).json({ message: 'Email updated successfully', success: true});

    } else {
      res.status(500).json({ message: 'Failed to update email', succuess: false });
    }
  } catch (error) {
    console.error('Error updating the email in the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Changes password for a user
app.put('/api/change-account-password', async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Update the goal in the database
    const [result] : [ResultSetHeader, FieldPacket[]] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [password, userId]
    );

    if (result.affectedRows > 0) {

        res.status(200).json({ message: 'Password updated successfully' });

    } else {
      res.status(500).json({ error: 'Failed to update password' });
    }
  } catch (error) {
    console.error('Error updating the password in the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Changes PIN for a user
app.put('/api/change-account-PIN', async (req, res) => {
  try {
    const { userId, PIN } = req.body;

    // Check if user has a PIN
    const [rows] = await pool.query<RowDataPacket[]>('SELECT PIN FROM pins WHERE userId = ?', [userId]);

    if (rows.length < 0) {
      const [result] = await pool.query<RowDataPacket[]>('INSERT INTO pins (userId, PIN) VALUES (?, ?)', [userId, PIN]);
      if (result) {
        res.status(201).json({ message: 'PIN created' });
      }
      else {
        res.status(500).json({ error: 'Failed to create new PIN' });
      }
      return;
    }

    // Update the goal in the database
    const [result] : [ResultSetHeader, FieldPacket[]] = await pool.query(
      'UPDATE pins SET PIN = ? WHERE userId = ?',
      [PIN, userId]
    );

    if (result.affectedRows > 0) {

        res.status(200).json({ message: 'PIN updated successfully' });

    } else {
      res.status(500).json({ error: 'Failed to update PIN' });
    }
  } catch (error) {
    console.error('Error updating the PIN in the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deletes a user
app.delete('/api/delete-account', async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result && 'affectedRows' in result && result.affectedRows === 1) {
      res.json({ message: 'User deleted successfully' });
    } 
    else {
      res.status(404).json({ error: 'User not found' });
    }

  } catch (error) {
    console.error('Error deleting User from database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/todos/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const [rows] = await pool.query('SELECT * FROM todos WHERE userId = ?',[userId]);
      console.log(rows);
      res.json(rows);
  }
  catch (error) {
      console.error('Error querying the database:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/todos', async (req, res) => {
  try {
    const { todo_title, todo_type, due_date, notes = null,userId} = req.body;
    
    const [result] = await pool.query('INSERT INTO todos (todo_title, todo_type, due_date, completed, notes,userId) VALUES (?, ?, ?, ?, ?, ?)', [todo_title, todo_type, due_date, 0, notes,userId]);
    
    if (result && 'insertId' in result) {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM todos WHERE id = ?', [result.insertId]);
      
      if (rows.length > 0) {
        res.status(201).json({ message: 'Todo added successfully', todo: rows[0] });
      } else {
        res.status(500).json({ error: 'Failed to retrieve the added todo' });
      }
    } else {
      res.status(500).json({ error: 'Failed to add todo' });
    }
  } catch (error) {
    console.error('Error adding user to the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/todos/:todoId', async (req: Request, res: Response) => {
  const todoId = req.params.todoId;
  try {
    const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [todoId]);
    if (result && 'affectedRows' in result && result.affectedRows === 1) {
      res.json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error: any) {
    console.error('Error removing task from the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.put('/api/todos/:todoId', async (req: Request, res: Response) => {
  const todoId = req.params.todoId;
  const { todo_title, todo_type, due_date, notes, completed } = req.body;

  console.log('Received data:', req.body); // Log the incoming data

  try {
    // Check if due_date is valid
    if (isNaN(new Date(due_date).getTime())) {
      throw new Error('Invalid date format');
    }

    const formattedDate = new Date(due_date).toISOString().split('T')[0];
    console.log('Updating todo with due_date:', formattedDate);

    const [result] = await pool.query(
      'UPDATE todos SET todo_title = ?, todo_type = ?, due_date = ?, notes = ?, completed = ? WHERE id = ?',
      [todo_title, todo_type, formattedDate, notes, completed, todoId]
    );

    if (result && 'affectedRows' in result && result.affectedRows === 1) {
      res.json({ message: 'Task updated successfully' });
    } else {
      res.status(404).json({ error: 'Task not found or no changes made' });
    }
  } catch (error: any) {
    console.error('Error updating task in the database:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke 💩');
});


