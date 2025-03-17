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
const client = require('./database/db');

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

    //GENERATE KANBAN BOARD
    // first check database if 'Sample Kanban' board already exists
    const kanbanExists = await client.query(`SELECT * FROM kanbans WHERE title = 'Sample Kanban'`);
    // If 'Sample Kanban' doesn't exist add to database
    if (kanbanExists.rows.length === 0) {
      await client.query(`INSERT INTO kanbans (user_id, title) VALUES ($1, $2)`, [adminUser.rows[0].user_id, "Sample Kanban"]);
    }

    // GENERATE TASKS IN 'Sample Kanban' BOARD

    // Query the database to get the kanban_id of the Kanban board with the title "Sample Kanban"
    const kanban = await client.query(
      `SELECT kanban_id FROM kanbans WHERE title = 'Sample Kanban'`
    );

    // Check if the Kanban board exists
    if (kanban.rows.length > 0) {
      const kanbanId = kanban.rows[0].kanban_id;

      // Query the database to check if tasks already exist in this Kanban board
      const taskExists = await client.query(
        `SELECT * FROM tasks WHERE kanban_id = $1`, [kanbanId]
      );

      // If no tasks exist, insert multiple tasks
      if (taskExists.rows.length === 0) {
        const sampleTasks = [
          // Tasks in "To Do" Column
          { title: "Task 1", description: "Planning phase", due_date: "2025-12-31", status: "To Do", priority: 3, progress: 10,start_date:"2025-12-05" ,end_date:"2025-12-20" },
          { title: "Task 2", description: "Gathering resources", due_date: "2025-12-30", status: "To Do", priority: 2 , progress: 20,start_date:"2025-12-07" ,end_date:"2025-12-21" },

          // Tasks in "In Progress" Column
          { title: "Task 3", description: "Developing backend", due_date: "2025-12-20", status: "In Progress", priority: 4, progress: 40 ,start_date:"2025-11-23" ,end_date:"2025-12-20"},
          { title: "Task 4", description: "Building frontend", due_date: "2025-12-18", status: "In Progress", priority: 2 , progress: 50,start_date:"2025-11-05" ,end_date:"2025-12-15"},

          // Tasks in "Done" Column
          { title: "Task 5", description: "Initial setup completed", due_date: "2025-12-10", status: "Done", priority: 5 , progress: 80,start_date:"2025-11-20" ,end_date:"2025-12-08"},
          { title: "Task 6", description: "Testing phase completed", due_date: "2025-12-05", status: "Done", priority: 3 , progress: 90,start_date:"2025-11-12" ,end_date:"2025-12-03"}
        ];

        for (const task of sampleTasks) {
          await client.query(
            `INSERT INTO tasks (kanban_id, user_id, title, description, due_date, status, priority, locked, progress,start_date,end_date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11)`,
            [kanbanId, adminUser.rows[0].user_id, task.title, task.description, task.due_date, task.status, task.priority,false, task.progress,task.start_date,task.end_date]
          );
        }

        console.log("Successfully inserted 6 sample tasks into 'Sample Kanban' board.");
      } else {
        console.log("ℹTasks already exist in 'Sample Kanban', skipping insert.");
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
app.use("/api/users", require("./routes/userRoutes"));
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