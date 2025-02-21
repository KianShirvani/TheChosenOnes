require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);
const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  
  };

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// routes
app.use("/auth", require("./routes/auth"));
app.use("/register", require("./routes/userRoutes"));

// Route to check database connection
app.get("/db-version", async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.status(200).json({ version });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello from backend");
});

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});