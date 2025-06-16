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

app.post('/delete', async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.endsWith("@spartronics.com")) {
      return res.status(400).json({ error: "Email must end with @spartronics.com" });
    }

    await poolConnect;

    const result = await pool.request()
      .input('email', sql.VarChar, normalizedEmail)
      .query('DELETE FROM Employee WHERE email = @email');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Server error during deletion' });
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
app.post('/createaccount', async (req, res) => {
  const { employeeId, firstName, lastName, password, email, isAdmin } = req.body;

  if (!employeeId || !firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    await poolConnect;            

    const exists = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT 1 FROM Employee WHERE Email = @email');

    if (exists.recordset.length) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const normalizedEmail = email.toLowerCase().trim();

if (!normalizedEmail.endsWith("@spartronics.com")) {
  return res.status(400).json({ error: "Email must end with @spartronics.com" });
}

    // 3️⃣ hash + insert
    const hash = await bcrypt.hash(password, 10);

  await pool.request()
  .input('employeeId', sql.VarChar(20), employeeId)
  .input('firstName',  sql.NVarChar(50), firstName)
  .input('lastName',   sql.NVarChar(50), lastName)
  .input('email',      sql.NVarChar(100), normalizedEmail)
  .input('hash',       sql.VarChar(255), hash)
  .input('admin',      sql.Bit, isAdmin ? 1 : 0)
  .query(`
    INSERT INTO Employee (EmployeeID, FirstName, LastName, Email, loginpassword, IsAdmin)
    VALUES (@employeeId, @firstName, @lastName, @email, @hash, @admin)
  `);


    return res.json({ firstName, normalizedEmail, lastName });           
  } catch (err) {
    console.error('Create-account error:', err.message);
    return res.status(500).json({ error: 'Server error during account creation' });
  }
});



app.listen(5000, () => {
  console.log('Server is running at http://localhost:5000');
});
