const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/mydatabase",
  ssl: false,
});

if (process.env.NODE_ENV !== 'test') {
  client.connect()
    .then(() => console.log("Connected to the database"))
    .catch(err => console.error("Database connection error:", err));
}

module.exports = client;