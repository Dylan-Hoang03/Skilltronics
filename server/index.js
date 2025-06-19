import express from 'express';
import { sql, pool, poolConnect } from './db.js';
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('generateToken', (req,res) => {

const secretkey = process.env.JWTSECRET;





})


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

    const payload = {
  sub: user.email,        // “subject” of the token
  isAdmin: user.isAdmin,
  firstName: user.firstName,
  lastName: user.lastName,
};

const expires = process.env.JWT_EXPIRES || '1h';   // default to 1 hour

const token = jwt.sign(payload, process.env.JWT_GIGASECRET, {
  expiresIn: expires
});

res.json({
  message: 'Login successful',
  token,                     
  user: {                     
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin,
  },
});

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }

});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, process.env.JWT_GIGASECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded; 
  });
}

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

// POST  /createquestion
app.post('/createquestion', async (req, res) => {
  const { courseTitle,courseBlurb, questionText, options, correct } = req.body;
  const labels = ['A', 'B', 'C', 'D', 'E'];

  // Validation
  if (
    !courseTitle || courseBlurb ||
    !questionText ||
    !Array.isArray(options) ||
    options.length !== 5 ||
    !labels.includes(correct)
  ) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  let tx;
  try {
    await poolConnect;
    tx = new sql.Transaction(pool);
    await tx.begin();

    // Get or create Course
    const courseReq = new sql.Request(tx).input('title', sql.NVarChar(100), courseTitle);
    let { recordset } = await courseReq.query(
      'SELECT CourseID FROM Course WHERE Title = @title'
    );
    let courseId;
    if (recordset.length) {
      courseId = recordset[0].CourseID;
    } else {
      ({ recordset } = await courseReq.query(
        'INSERT INTO Course (Title) OUTPUT INSERTED.CourseID VALUES (@title)'
      ));
      courseId = recordset[0].CourseID;
    }

    // Get next QuestionNumber
    ({ recordset } = await new sql.Request(tx)
      .input('cid', sql.Int, courseId)
      .query('SELECT ISNULL(MAX(QuestionNumber), 0) + 1 AS NextQ FROM Question WHERE CourseID = @cid'));
    const questionNumber = recordset[0].NextQ;

    // Insert Question
    ({ recordset } = await new sql.Request(tx)
      .input('cid',   sql.Int, courseId)
      .input('qtxt',  sql.NVarChar(sql.MAX), questionText)
      .input('corr',  sql.Char(1), correct)
      .input('qnum',  sql.Int, questionNumber)
      .query(`
        INSERT INTO Question
          (CourseID, QuestionText, correctAnswer, QuestionNumber)
        OUTPUT INSERTED.QuestionID
        VALUES (@cid, @qtxt, @corr, @qnum)
      `));
    const questionId = recordset[0].QuestionID;

    // Insert five AnswerDisplay rows (auto-ID)
    for (let i = 0; i < 5; i++) {
      await new sql.Request(tx)
        .input('qid',   sql.Int, questionId)
        .input('label', sql.Char(1), labels[i])
        .input('ans',   sql.NVarChar(sql.MAX), options[i])
        .query(`
          INSERT INTO AnswerDisplay
            (QuestionID, optionChoice, answerText)
          VALUES (@qid, @label, @ans)
        `);
    }

    await tx.commit();
    return res.json({
      message: 'Question and answers saved',
      courseId,
      questionId,
    });
  } catch (err) {
    if (tx) await tx.rollback();
    console.error('Create-question error:', err.message);
    return res.status(500).json({ error: 'Server error during question creation' });
  }
});




app.listen(5000, () => {
  console.log('Server is running at http://localhost:5000');
});
