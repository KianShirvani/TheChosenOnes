const { Pool } = require("pg"); // PostgreSQL client
require("dotenv").config(); // Load environment variables

// ✅ Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Get database URL from .env
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false }, // Use SSL only if it's not localhost
});

// ✅ Test database connection
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error", err));

module.exports = pool; // Export database connection
