require("dotenv").config();

const express = require("express");
const cors = require("cors");

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
app.use("/admin", require("./routes/adminRoutes"));

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello from backend");
});

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});