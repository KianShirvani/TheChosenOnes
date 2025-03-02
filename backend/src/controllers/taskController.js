const tasks = {
    todo: [],
    inProgress: [],
    done: []
};

// Get all tasks
exports.getTasks = (req, res) => {
  console.log("Current tasks in memory:", tasks);
  return res.status(200).json(tasks);
};

// Create a new task
exports.createTask = (req, res) => {
  const { title, description, priority, dueDate, startDate, endDate, progress, status } = req.body;

  if (!title || !description || !priority || !dueDate) {
    return res.status(400).json({ message: "All fields except status are required" });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    priority,
    dueDate,
    startDate: startDate || "",  
    endDate: endDate || "",      
    progress: progress || 0,     
    status,
  };

  tasks[status] = tasks[status] || [];
  tasks[status].push(newTask);

  console.log("New task added:", newTask);
  return res.status(201).json({ message: "Task created successfully", task: newTask });
};

// Move a task
exports.moveTask = (req, res) => {
  const { taskId } = req.params;
  const { direction } = req.body; // "left" or "right"

  const columnOrder = ["todo", "inProgress", "done"];
  let task = null;
  let currentStatus = null;

  Object.keys(tasks).forEach((status) => {
    let foundTask = tasks[status].find(t => String(t.id) === String(taskId));
    if (foundTask) {
      task = foundTask;
      currentStatus = status;
    }
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.locked) {
    return res.status(403).json({ message: "Task is locked and cannot be moved" });
  }

  const currentIndex = columnOrder.indexOf(currentStatus);
  const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

  if (newIndex < 0 || newIndex >= columnOrder.length) {
    return res.status(400).json({ message: "Cannot move task further" });
  }

  tasks[currentStatus] = tasks[currentStatus].filter(t => t.id !== taskId);
  task.status = columnOrder[newIndex];
  tasks[columnOrder[newIndex]].push(task);

  return res.status(200).json({ message: "Task moved successfully", task });
};

// Lock a task
exports.toggleLock = (req, res) => {
  const { taskId } = req.params;

  let task = null;
  Object.keys(tasks).forEach((status) => {
    let foundTask = tasks[status].find(t => String(t.id) === String(taskId));
    if (foundTask) {
      task = foundTask;
    }
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.locked = !task.locked;
  return res.status(200).json({ message: `Task lock status updated to ${task.locked}`, task });
};

// Update a task
exports.updateTask = (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, dueDate, startDate, endDate, progress, status } = req.body;

  let task = null;
  let currentStatus = null;

  Object.keys(tasks).forEach((category) => {
    let foundTask = tasks[category].find(t => String(t.id) === String(taskId));
    if (foundTask) {
      task = foundTask;
      currentStatus = category;
    }
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.locked) {
    return res.status(403).json({ message: "Task is locked and cannot be edited" });
  }

  if (currentStatus) {
    tasks[currentStatus] = tasks[currentStatus].filter(t => String(t.id) !== String(taskId));
  }

  task.title = title || task.title;
  task.description = description || task.description;
  task.priority = priority || task.priority;
  task.dueDate = dueDate || task.dueDate;
  task.startDate = startDate || task.startDate;
  task.endDate = endDate || task.endDate;
  task.progress = progress !== undefined ? progress : task.progress;
  task.status = status || task.status;

  tasks[status] = tasks[status] || [];
  tasks[status].push(task);

  return res.status(200).json({ message: "Task updated successfully", task });
};

// Delete a task
exports.deleteTask = (req, res) => {
  const { taskId } = req.params;

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
};
