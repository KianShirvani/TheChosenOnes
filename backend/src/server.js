require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // Logs HTTP requests
const axios = require("axios");
const { Client } = require("pg");
const { insertData } = require("../database/insertData");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logging requests

// Routes (Import Route Files)
app.use("/api/tasks", require("./routes/taskRoutes")); 
app.use("/auth", require("./routes/auth"));       
app.use("/register", require("./routes/userRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/messages", require("./routes/messageRoutes")); 
// Global Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal Server Error" });
});

app.get("/load-data", async (req, res) => {
  const result = await insertData();
  res.json(result);
});

app.get("/", (req, res) => {
  res.send("Hello from backend");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});