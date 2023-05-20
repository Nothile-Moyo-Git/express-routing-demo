// Connect to SQL
import mysql from "mysql2";

// Create connection pool
// Connection pools remain by reusing a previous connection instead of closing it
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Vape8634",
    database: "node-complete",
});

export default pool.promise();