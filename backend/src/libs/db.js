import mysql from "mysql2/promise";

const pool = await mysql.createPool({
  host: "localhost",
  user: "root",
  database: "chat_app_db",
  password: "123456",
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
