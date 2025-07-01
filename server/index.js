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
import stream from 'stream'
import multer from "multer";

import libre from "libreoffice-convert";
import path from "path";
import fs from "fs";
export async function convertPptxToPdf(buffer) {
  return new Promise((resolve, reject) => {
    libre.convert(buffer, ".pdf", undefined, (err, pdfBuffer) => {
      if (err) return reject(err);
      resolve(pdfBuffer);
    });
  });
}

app.post('generateToken', (req,res) => {

const secretkey = process.env.JWTSECRET;





})



app.get("/lessons/:id/pdf", async (req, res) => {
  const id = +req.params.id;
  if (!Number.isInteger(id)) return res.status(400).end();

  await poolConnect;

  const r = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT FileName, MimeType, FileData, PdfData, PdfReady
      FROM   dbo.Lesson
      WHERE  LessonID = @id;
    `);
  if (!r.recordset.length) return res.status(404).end();
  const lesson = r.recordset[0];

  // ✅ If the file is already a PDF, just return it directly
  if (lesson.MimeType === "application/pdf") {
    res.set("Content-Type", "application/pdf");
    return res.end(lesson.FileData);
  }

  // ✅ If a converted PDF is cached, return that
  if (lesson.PdfReady) {
    res.set("Content-Type", "application/pdf");
    return res.end(lesson.PdfData);
  }

  // ✅ Only convert if it's a PowerPoint file
  try {
    const pdfBuf = await convertPptxToPdf(lesson.FileData);

    pool.request()
      .input("id", sql.Int, id)
      .input("pdf", sql.VarBinary(sql.MAX), pdfBuf)
      .query(`
        UPDATE dbo.Lesson
        SET PdfData = @pdf, PdfReady = 1
        WHERE LessonID = @id;
      `).catch(console.error);

    res.set("Content-Type", "application/pdf");
    res.end(pdfBuf);
  } catch (e) {
    console.error("PDF conversion failed:", e);
    res.status(500).json({
      error: "Conversion error",
      details: String(e),
    });
  }
});



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
      const trueemail = email.toLowerCase().trim()


    const result = await pool
      .request()
      .input('trueemail', sql.NVarChar, trueemail)
      .query(`SELECT EmployeeID as employeeID,email, loginpassword, isAdmin AS isAdmin, firstName AS firstName, lastName AS lastName FROM Employee WHERE email = @trueemail
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
  employeeID : user.employeeID
};

const expires = process.env.JWT_EXPIRES || '168h';   // default to 1 week

const token = jwt.sign(payload, process.env.JWT_SECRET, {
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
    employeeID :user.employeeID
  },
});

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }

});


export default function authenticateToken(req, res, next) {

  const auth = req.headers['authorization'];
  if (!auth) {
    console.warn(" No Authorization header");
    return res.status(401).json({ error: "Missing token" });
  }

  const token = auth.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.warn("Token rejected:", err.name);
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
    console.log(employeeId)

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
      if (scorePct*100 < 70) {
  await pool
    .request()
    .input("uid", sql.Int, employeeId)
    .input("cid", sql.Int, courseId)
    .query(`
      UPDATE Progress
      SET Viewed = 0
      WHERE employeeID = @uid AND CourseID = @cid
    `);
}

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


app.get("/queryuser", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Missing ?email= parameter" });
  }

  const normalized = email.toLowerCase().trim();
  if (!normalized.endsWith("@spartronics.com")) {
    return res.status(400).json({ error: "E-mail must end with @spartronics.com" });
  }

  try {
    await poolConnect;

    const result = await pool
      .request()
      .input("email", sql.VarChar, normalized)
      .query(`
      SELECT
      a.AttemptID    AS attemptID,
      a.AttemptedAt  AS attemptDate,
      a.Score        AS score,
      a.Passed       AS isPassed,
      a.CourseID     AS courseID,
      c.Title        AS courseTitle,
      ISNULL(s.totalSeconds, 0) AS totalSeconds
    FROM Attempt a
    JOIN Employee e ON e.EmployeeID = a.EmployeeID
    JOIN Course   c ON c.CourseID   = a.CourseID
    LEFT JOIN CourseTimeSummary s ON s.employeeID = e.EmployeeID AND s.courseID = a.CourseID
    WHERE e.Email = @email
    ORDER BY a.AttemptedAt DESC;

      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "No attempts found for that e-mail." });
    }

    return res.json({ attempts: result.recordset });
  } catch (err) {
    console.error("SQL error on /queryuser:", err);
    return res.status(500).json({ error: "Server error while fetching attempts." });
  }
});


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

/* ── POST /lessons  (upload) ────────────────────────────────────────────────── */
app.post("/lessons", upload.single("file"), async (req, res) => {
  try {
    const { courseName = "", lessonTitle = "" } = req.body;
    if (!req.file) return res.status(400).json({ error: "File is required." });

    const ok = [
      "video/mp4",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",'application/pdf'
    ].includes(req.file.mimetype);
    if (!ok) return res.status(415).json({ error: "Unsupported file type." });

    await poolConnect;

    /* 1. Get or create CourseID */
    let courseID;
    const courseQ = await pool
      .request()
      .input("title", sql.NVarChar, courseName.trim())
      .query("SELECT CourseID FROM dbo.Course WHERE Title = @title");
   if (courseQ.recordset.length === 0) {
  return res.status(400).json({ error: "Course does not exist." });
}
courseID = courseQ.recordset[0].CourseID;

    /* 2. Insert Lesson */
    const newL = await pool
      .request()
      .input("cid",  sql.Int,           courseID)
      .input("lt",   sql.NVarChar,      lessonTitle.trim())
      .input("fn",   sql.NVarChar,      req.file.originalname)
      .input("mt",   sql.NVarChar,      req.file.mimetype)
      .input("data", sql.VarBinary(sql.MAX), req.file.buffer)
      .query(`
        INSERT INTO dbo.Lesson (CourseID, LessonTitle, FileName, MimeType, FileData)
        OUTPUT inserted.LessonID AS id
        VALUES (@cid, @lt, @fn, @mt, @data);
      `);

    res.status(201).json({ lessonID: newL.recordset[0].id, message: "Lesson uploaded." });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Server error during upload." });
  }
});app.get("/my-attempts", authenticateToken, async (req, res) => {
  const email = req.user?.sub;

  if (!email || !email.endsWith("@spartronics.com")) {
    return res.status(400).json({ error: "Invalid or missing user email." });
  }

  try {
    await poolConnect;

    const result = await pool
      .request()
      .input("email", sql.VarChar, email.toLowerCase().trim())
      .query(`
        SELECT
          a.AttemptID    AS attemptID,
          a.AttemptedAt  AS attemptDate,
          a.Score        AS score,
          a.Passed       AS isPassed,
          a.CourseID     AS courseID,
          c.Title        AS courseTitle,
          ISNULL(s.totalSeconds, 0) AS totalSeconds
        FROM Attempt a
        JOIN Employee e ON e.EmployeeID = a.EmployeeID
        JOIN Course   c ON c.CourseID   = a.CourseID
        LEFT JOIN CourseTimeSummary s ON s.employeeID = e.EmployeeID AND s.courseID = a.CourseID
        WHERE e.Email = @email
        ORDER BY a.AttemptedAt DESC
      `);

    return res.json({ attempts: result.recordset });
  } catch (err) {
    console.error("SQL error on /my-attempts:", err);
    return res.status(500).json({ error: "Server error while fetching attempts." });
  }
});



app.get("/lessons", authenticateToken, async (req, res) => {
  try {
    const { courseID } = req.query;
    const employeeID = req.user?.employeeID;

    if (!courseID || !employeeID) {
      return res.status(400).json({ error: "Missing courseID or employeeID" });
    }

    await poolConnect;

    const query = `
      SELECT 
        l.LessonID,
        l.LessonTitle,
        l.CourseID,
        l.FileName,
        l.MimeType,
        l.UploadedOn,
        ISNULL(p.Viewed, 0) AS Viewed
      FROM dbo.Lesson l
      LEFT JOIN dbo.Progress p
        ON p.LessonID = l.LessonID
       AND p.CourseID = l.CourseID
       AND p.employeeID = @employeeID
      WHERE l.CourseID = @courseID
      ORDER BY l.UploadedOn DESC
    `;

    const result = await pool
      .request()
      .input("employeeID", sql.Int, employeeID)
      .input("courseID", sql.Int, courseID)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error("List failed:", err);
    res.status(500).json({ error: "Server error while listing lessons." });
  }
});


/* ── GET /lessons/:id/file  (stream) ────────────────────────────────────────── */
app.get("/lessons/:id/file", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid ID." });

    await poolConnect;

    const { recordset } = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT FileName, MimeType, FileData FROM dbo.Lesson WHERE LessonID = @id");

    if (!recordset.length) return res.status(404).json({ error: "Lesson not found." });

    const { FileName, MimeType, FileData } = recordset[0];

    // Reconstruct file from buffer
    const buffer = Buffer.from(FileData);

    // Set headers
    res.set({
      "Content-Type": MimeType,
      "Content-Disposition": `inline; filename="${FileName}"`,
      "Content-Length": buffer.length
    });

    // Stream via PassThrough
    const readStream = new stream.PassThrough();
    readStream.end(buffer);
    readStream.pipe(res);

    // Optional debug: write file to disk for inspection
    // fs.writeFileSync("debug_downloaded.pptx", buffer);
  } catch (err) {
    console.error("Stream failed:", err);
    res.status(500).json({ error: "Server error while streaming file." });
  }
});
app.post("/course/view", authenticateToken, async (req, res) => {
  const { courseID, lessonID } = req.body;
  
  const employeeEmail = req.user.sub;
  try {
    await poolConnect;

    const { recordset: empRS } = await pool.request()
      .input('email', sql.NVarChar, employeeEmail)
      .query('SELECT employeeID FROM Employee WHERE Email = @email');
    if (!empRS.length)
      return res.status(401).json({ error: "Employee not found" });

    const employeeID = empRS[0].employeeID;


  
  if (!employeeID || !courseID || !lessonID)
    return res.status(400).json({ error: "Missing required data." });


    await poolConnect;


    
    await pool
      .request()
      .input("uid", sql.Int, employeeID)
      .input("cid", sql.Int, courseID)
      .input("lid", sql.Int, lessonID)
      .query(`
        MERGE Progress AS target
        USING (SELECT @uid AS employeeID, @cid AS CourseID, @lid AS LessonID) AS src
        ON target.employeeID = src.employeeID AND target.CourseID = src.CourseID AND target.LessonID = src.LessonID
        WHEN MATCHED THEN
          UPDATE SET Viewed = 1, LastViewed = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (employeeID, CourseID, LessonID, Viewed, LastViewed)
          VALUES (@uid, @cid, @lid, 1, GETDATE());
      `);

    res.status(200).json({ message: "Lesson view recorded." });
  } catch (err) {
    console.error("Database error:", err); // log actual error
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

app.get("/progress/status",authenticateToken, async (req, res) => {
  try{
      const employeeEmail = req.user.sub;

   await poolConnect;

    const { recordset: empRS } = await pool.request()
      .input('email', sql.NVarChar, employeeEmail)
      .query('SELECT employeeID FROM Employee WHERE Email = @email');
    
    if (!empRS.length)
      return res.status(401).json({ error: "Employee not found" });

    const employeeID = empRS[0].employeeID;
  const courseID = Number(req.query.courseID);

  if (!employeeID || !courseID) return res.status(400).json({ error: "Missing input" });

  await poolConnect;

  // Check if user failed last attempt
  const lastAttempt = await pool
    .request()
    .input("uid", sql.Int, employeeID)
    .input("cid", sql.Int, courseID)
    .query(`
      SELECT TOP 1 Passed
      FROM Attempt
      WHERE employeeID = @uid AND CourseID = @cid
      ORDER BY AttemptedAt DESC
    `);

  const failedLast = lastAttempt.recordset[0]?.Passed === false;

  // Count total lessons
  const totalLessons = await pool
    .request()
    .input("cid", sql.Int, courseID)
    .query("SELECT COUNT(*) AS count FROM Lesson WHERE CourseID = @cid");

  // Count lessons viewed
  const viewedLessons = await pool
    .request()
    .input("uid", sql.Int, employeeID)
    .input("cid", sql.Int, courseID)
    .query("SELECT COUNT(*) AS count FROM Progress WHERE employeeID = @uid AND CourseID = @cid AND Viewed = 1");

  const canTakeTest = 
    viewedLessons.recordset[0].count === totalLessons.recordset[0].count;
  const hasPassed = await pool
  .request()
  .input("employeeID", sql.Int,employeeID)
  .input("cid",sql.Int,courseID)
  .query("SELECT * from ATTEMPT where PASSED = 1");


  res.json({
    canTakeTest,
    failedLast,
    totalLessons: totalLessons.recordset[0].count,
    viewedLessons: viewedLessons.recordset[0].count,
    haspassed: !failedLast
  })
  
  ;}
  catch(err){
     console.error("Database error:", err); // log actual error
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});
app.post('/changepassword', authenticateToken, async (req, res) => {
  console.log("pressed")
  const { password, confirmPassword } = req.body;
  const employeeID = req.user?.employeeID;
  console.log(req.user);

  if (!employeeID || !password || !confirmPassword)
    return res.status(400).json({ error: "Missing required fields." });

  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match." });

  try {
    const hashed = await bcrypt.hash(password, 10);

    await poolConnect;
    await pool.request()
      .input('eid', sql.Int, employeeID)
      .input('pw', sql.NVarChar, hashed)
      .query(`
        UPDATE Employee SET loginPassword = @pw WHERE employeeID = @eid
      `);

    res.json({ message: "Password changed successfully." });
    console.log("worked")
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// courseTime.js
app.post("/course/enter", authenticateToken, async (req, res) => {
  const { courseID } = req.body;
  const employeeID = req.user?.employeeID;
  if (!employeeID || !courseID) return res.status(400).json({ error: "Missing data" });

  await poolConnect;
  await pool.request()
    .input("eid", sql.Int, employeeID)
    .input("cid", sql.Int, courseID)
    .query(`
      -- Initialize CourseTimeSummary if needed
      MERGE CourseTimeSummary AS target
      USING (SELECT @eid AS employeeID, @cid AS courseID) AS src
      ON target.employeeID = src.employeeID AND target.courseID = src.courseID
      WHEN NOT MATCHED THEN
        INSERT (employeeID, courseID, totalSeconds)
        VALUES (@eid, @cid, 0);

      -- Start tracking session
      DELETE FROM CourseTimeSession WHERE employeeID = @eid AND courseID = @cid;
      INSERT INTO CourseTimeSession (employeeID, courseID, timeEntered)
      VALUES (@eid, @cid, GETDATE());
    `);

  res.json({ message: "Started course session" });
});

app.post("/course/exit", authenticateToken, async (req, res) => {
  const { courseID } = req.body;
  const employeeID = req.user?.employeeID;
  if (!employeeID || !courseID) return res.status(400).json({ error: "Missing data" });

  await poolConnect;
  await pool.request()
    .input("eid", sql.Int, employeeID)
    .input("cid", sql.Int, courseID)
    .query(`
      DECLARE @entered DATETIME;
      SELECT @entered = timeEntered
      FROM CourseTimeSession
      WHERE employeeID = @eid AND courseID = @cid;

      IF @entered IS NOT NULL
      BEGIN
        DECLARE @duration INT = DATEDIFF(SECOND, @entered, GETDATE());

        UPDATE CourseTimeSummary
        SET totalSeconds = totalSeconds + @duration
        WHERE employeeID = @eid AND courseID = @cid;

        DELETE FROM CourseTimeSession
        WHERE employeeID = @eid AND courseID = @cid;
      END
    `);

  res.json({ message: "Ended course session" });
});


app.get("/all-users", async (req, res) => {
  await poolConnect;
  const result = await pool.request().query("SELECT email FROM Employee");
  const emails = result.recordset.map((row) => row.email);
  res.json({ emails });
});

app.get("/all-courses", async (req,res)=> {
await poolConnect;
const result = await pool.request().query("SELECT title from Course");
const titles = result.recordset.map((row)=> row.title)
res.json({courses : titles})



})



app.listen(5000, () => {
  console.log('Server is running at http://localhost:5000');
});
