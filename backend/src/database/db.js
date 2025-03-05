const pg = require("pg");
require("dotenv").config(); // Ensure environment variables are loaded

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined. Check your .env file.");
  process.exit(1);
}

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false }
});

module.exports = pool;
