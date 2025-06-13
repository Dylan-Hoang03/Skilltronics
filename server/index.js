import express from 'express';
import { sql, pool, poolConnect } from './db.js';
import cors from 'cors'
import bcrypt from 'bcrypt'
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    await poolConnect; // wait for DB connection to be established

    const result = await pool.request().query('SELECT * FROM Employee');

    console.log('Employee table contents:');
    console.table(result.recordset); // nicely formatted in terminal

    res.json({
      message: 'Connected to SQL Server!',
      rows: result.recordset,
    });
  } catch (err) {
    console.error('SQL error:', err.message);
    res.status(500).json({ error: 'Failed to connect or query SQL Server' });
  }
});


// 🔐 Login route
app.post('/login', async (req, res) => {
    
  const { email, password,isAdmin,firstName,lastName } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    await poolConnect;

    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT email, loginpassword, isAdmin AS isAdmin, firstName AS firstName, lastName AS lastName FROM Employee WHERE email = @email
`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.loginpassword);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ message: 'Login successful', email: user.email, isAdmin: user.isAdmin,firstName : user.firstName, lastName: user.lastName });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});


app.listen(5000, () => {
  console.log('Server is running at http://localhost:5000');
});
