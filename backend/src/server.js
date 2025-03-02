require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

let tasks = {
    todo: [],
    inProgress: [],
    done: []
};

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

const corsOptions = {
    origin:  "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,  
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


app.use((req, res, next) => {
    console.log("Middleware Check - Request Body:", req.body);
    next();
});

app.post("/api/tasks", (req, res) => {
  const { title, description, priority, dueDate, status } = req.body;

  if (!title || !description || !priority || !dueDate) {
    return res.status(400).json({ message: "All fields except status are required" });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    priority,
    dueDate,
    status,
  };

  tasks[status] = tasks[status] || [];
  tasks[status].push(newTask);

  console.log("New task added:", newTask); 
  return res.status(201).json({ message: "Task created successfully", task: newTask });
});




app.put("/api/tasks/:taskId", (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, dueDate, status } = req.body;

  console.log("🔍 PUT Request Body:", req.body);
  console.log("🔍 Searching for task with ID:", taskId);

  let task = null;
  let currentCategory = null;


  Object.keys(tasks).forEach((category) => {
    let foundTask = tasks[category].find(t => String(t.id) === String(taskId));
    if (foundTask) {
      task = foundTask;
      currentCategory = category;
    }
  });

  if (!task) {
    console.error("❌ Task not found:", taskId);
    return res.status(404).json({ message: "Task not found" });
  }


  if (currentCategory) {
    tasks[currentCategory] = tasks[currentCategory].filter(t => String(t.id) !== String(taskId));
  }

  task.title = title || task.title;
  task.description = description || task.description;
  task.priority = priority || task.priority;
  task.dueDate = dueDate || task.dueDate;
  task.status = status || task.status;

  tasks[status] = tasks[status] || [];
  tasks[status].push(task);

  console.log("✅ Updated task:", task);
  return res.status(200).json({ message: "Task updated successfully", task });
});





app.delete("/api/tasks/:taskId", (req, res) => {
  const taskId = req.params.taskId.toString();

  console.log(`Deleting task with ID: ${taskId}`); 

  let taskFound = false;

  Object.keys(tasks).forEach((status) => {
      const initialLength = tasks[status].length;
      tasks[status] = tasks[status].filter(task => task.id !== taskId);
      if (tasks[status].length < initialLength) {
          taskFound = true;
      }
  });

  if (!taskFound) {
      return res.status(404).json({ message: "Task not found" });
  }

  return res.status(200).json({ message: "Task deleted successfully" });
});



app.get("/api/tasks", (req, res) => {
  console.log("Current tasks in memory:", tasks);
    return res.status(200).json(tasks);
});


const PORT = 5001;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
