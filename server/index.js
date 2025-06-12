import express from 'express';
import { sql, pool, poolConnect } from './db.js';

const app = express();
app.use(express.json());

app.get('/', async (req, res) => {
  try {
    await poolConnect; // wait for DB connection to be established

    const result = await pool.request().query('SELECT * FROM Human');

    console.log('Human table contents:');
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

app.listen(5000, () => {
  console.log('Server is running at http://localhost:5000');
});
