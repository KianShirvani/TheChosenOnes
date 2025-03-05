const { Pool } = require("pg");
require("dotenv").config(); // Ensure environment variables are loaded

const connectionString = process.env.DATABASE_URL || ""; // Ensure it's not undefined

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false }, // Use SSL only if it's not localhost
});

module.exports = pool;
