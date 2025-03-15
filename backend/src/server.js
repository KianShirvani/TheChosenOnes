require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // Logs HTTP requests

const app = express();

const corsOptions = {
  origin: "http://localhost:3000", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  
};

const axios = require("axios");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/mydatabase",
  ssl: false,
});

if (process.env.NODE_ENV !== 'test') {
  client.connect();
}

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const insertData = async () => {
  console.log('Inserting data...');
  console.log("API URL:", apiUrl);

  try {
    // INSERT SAMPLE USERS
    const users = [
      { firstName: "Arnold", lastName: "Arnold", email: "arnold@example.com", phoneNum: "250-500-5000", country: "Canada", displayName: "arnold", password: "Password123" },
      { firstName: "Bob", lastName: "Bob", email: "bob@example.com", phoneNum: "250-500-5001", country: "Canada", displayName: "bob", password: "Password123" }
    ];
    
    //REGISTER SAMPLE USERS
    for (const user of users) {
      let userExists = await client.query(`SELECT * FROM users WHERE email = $1`, [user.email]);
      if (userExists.rows.length === 0) {
        await axios.post(`${apiUrl}/register`, { ...user, confirmPassword: user.password });
      }
    }

    //GENERATE ADMINS
    // First check if arnold can be promoted to admin
    const adminUser = await client.query(`SELECT user_id FROM users WHERE email = $1`, ["arnold@example.com"]);
    if (adminUser.rows.length > 0) {
      // check if user is already admin
      let adminExists = await client.query(`SELECT * FROM admins WHERE admin_id = $1`, [adminUser.rows[0].user_id]);
      if (adminExists.rows.length === 0) {
      // user is not an admin so insert into admin table
        await client.query(`INSERT INTO admins (admin_id) VALUES ($1)`, [adminUser.rows[0].user_id]);
      }
    }


    console.log('Data inserted successfully.');
    return { success: true };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { success: false, error: error.message };
  }
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
app.use("/api/admin", require("./routes/adminRoutes"));
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