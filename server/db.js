import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

export { sql, pool, poolConnect };
