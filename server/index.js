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
    await poolConnect; 

    const result = await pool.request().query('SELECT * FROM Employee');

    console.log('Employee table contents:');
    console.table(result.recordset); 

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

const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: expires
});
console.log("🔑 NEW TOKEN ISSUED:", token.slice(0, 30), "...");  // <-- add


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


export default function authenticateToken(req, res, next) {
  console.log("🔐 auth MW hit, path:", req.path);

  const auth = req.headers['authorization'];
  if (!auth) {
    console.warn("🛑 No Authorization header");
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.split(' ')[1];
  console.log("🔑 Token snippet:", token?.slice(0, 12), "...");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.warn("🚫 Token rejected:", err.name);
      return res.status(401).json({ error: "Token invalid or expired" });
    }
    req.user = user;
    next();
  });
}
app.post('/submit', authenticateToken, async (req, res) => {
  const { courseId, answers } = req.body;

  if (!courseId || typeof answers !== 'object')
    return res.status(400).json({ error: "Missing courseId or answers" });

  const employeeEmail = req.user.sub;          
  try {
    await poolConnect;

    const { recordset: empRS } = await pool.request()
      .input('email', sql.NVarChar, employeeEmail)
      .query('SELECT EmployeeID FROM Employee WHERE Email = @email');

    if (!empRS.length)
      return res.status(401).json({ error: "Employee not found" });

    const employeeId = empRS[0].EmployeeID;

    const passMark = 0.8;                
    const attemptRS = await pool.request()
      .input('cid',  sql.Int,  courseId)
      .input('eid',  sql.Int,  employeeId)
      .input('now',  sql.DateTime, new Date())
      .query(`
        INSERT INTO Attempt (CourseID, EmployeeID, Score, Passed, AttemptedAt)
        OUTPUT INSERTED.AttemptID
        VALUES (@cid, @eid, 0, 0, @now)
      `);
    const attemptId = attemptRS.recordset[0].AttemptID;

    const { recordset: qRS } = await pool.request()
      .input('cid', sql.Int, courseId)
      .query(`
        SELECT QuestionID, correctAnswer
        FROM   Question
        WHERE  CourseID = @cid
      `);

    let correct = 0;
    for (const q of qRS) {
      const choice = (answers[q.QuestionID] || "").toUpperCase();
      const isCorrect = choice === q.correctAnswer.toUpperCase() ? 1 : 0;
      if (isCorrect) correct++;

      await pool.request()
        .input('aid',  sql.Int, attemptId)
        .input('qid',  sql.Int, q.QuestionID)
        .input('guess', sql.Char(1), choice)
        .input('isc',  sql.Bit, isCorrect)
        .query(`
          INSERT INTO Answer
            (AttemptID, QuestionID, Guess, IsCorrect)
          VALUES
            (@aid, @qid, @guess, @isc)
        `);
    }

    const total = qRS.length;
    const scorePct = total ? correct / total : 0;
    const passed = scorePct >= passMark;

    await pool.request()
      .input('aid',   sql.Int, attemptId)
      .input('score', sql.Decimal(5,2), scorePct * 100)
      .input('pass',  sql.Bit, passed)
      .query(`
        UPDATE Attempt
        SET Score = @score,
            Passed = @pass
        WHERE AttemptID = @aid
      `);

    res.json({
      message: "Test graded",
      attemptId,
      correct,
      total,
      passed,
    });

  } catch (err) {
    console.error("Submit route error:", err.message);
    res.status(500).json({ error: "Server error during submission" });
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
}    const hash = await bcrypt.hash(password, 10);
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
app.get('/courses', async (req, res) => {
  try {
    await poolConnect;                            

    const { recordset } = await pool
      .request()
      .query('SELECT * FROM Course');

    return res.json(recordset);                   
  } catch (err) {
    console.error('Course fetch error:', err.message);
    return res.status(500).json({ error: 'Server error during course fetch' });
  }
});
app.get('/questions/:courseId', authenticateToken, async (req, res) => {
  
  try {
    await poolConnect;

    const courseId = req.params.courseId;

    const qResult = await pool.request()
      .input('cid', sql.Int, courseId)
      .query(`
        SELECT QuestionID, QuestionText, QuestionNumber
        FROM Question
        WHERE CourseID = @cid
        ORDER BY QuestionNumber
      `);

    const questions = qResult.recordset;

    for (const q of questions) {
      const aResult = await pool.request()
        .input('qid', sql.Int, q.QuestionID)
        .query(`
          SELECT optionChoice, answerText
          FROM AnswerDisplay
          WHERE QuestionID = @qid
          ORDER BY optionChoice
        `);
      q.options = aResult.recordset;
    }

    res.json(questions);
  } catch (err) {
    console.error('Fetch questions error:', err.message);
    res.status(500).json({ error: 'Server error during question fetch' });
  }
});




app.post('/createquestion', async (req, res) => {
  const { courseTitle, questionText, options, correct } = req.body;
  const labels = ['A', 'B', 'C', 'D', 'E'];

  if (
    !courseTitle  ||
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

    ({ recordset } = await new sql.Request(tx)
      .input('cid', sql.Int, courseId)
      .query('SELECT ISNULL(MAX(QuestionNumber), 0) + 1 AS NextQ FROM Question WHERE CourseID = @cid'));
    const questionNumber = recordset[0].NextQ;

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
