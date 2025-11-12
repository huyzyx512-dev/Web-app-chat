import mysql from "mysql2/promise";

const pool = await mysql.createPool({
  host: "localhost",
  user: "root",
  database: "test",
  password: "123",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
