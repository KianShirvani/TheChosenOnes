import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";

const TaskBoard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });

  const [taskListColors, setTaskListColors] = useState({
    todo: "#e0e0e0",
    inProgress: "#e0e0e0",
    done: "#e0e0e0",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
  
      console.log("Fetched data:", data); 
      const tasks = data.tasks || [];
  
      setTasks({
        todo: data.tasks.filter(task => task.status === "todo"),
        inProgress: data.tasks.filter(task => task.status === "inProgress"),
        done: data.tasks.filter(task => task.status === "done"),
      });
  
      console.log("Updated tasks:", {
        todo: data.tasks.filter(task => task.status === "todo"),
        inProgress: data.tasks.filter(task => task.status === "inProgress"),
        done: data.tasks.filter(task => task.status === "done"),
      });
  
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
  useEffect(() => {
    fetchTasks(); // Fetch tasks on initial load
  }, []);

  const handleSaveTask = async (taskData) => {
    console.log("Raw taskData before sending:", taskData); 
  
    if (!taskData.title?.trim() || !taskData.description?.trim() || !taskData.priority || !taskData.dueDate) {
      console.error("Missing fields:", taskData);
      return;
    }
  
    const formattedTaskData = {
      id: taskData.id || null, 
      kanban_id: taskData.kanbanId, 
      user_id: taskData.userId, 
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      due_date: new Date(taskData.dueDate).toISOString().split("T")[0],
      start_date: new Date(taskData.startDate).toISOString().split("T")[0],
      end_date: new Date(taskData.endDate).toISOString().split("T")[0],
      progress: taskData.progress || 0,
      status: taskData.status || "todo",
    };
  
    console.log("Final data sent to backend:", formattedTaskData); 
  
    try {
      const url = editingTask
        ? `${process.env.REACT_APP_API_URL}/api/tasks/${formattedTaskData.id}`
        : `${process.env.REACT_APP_API_URL}/api/tasks`;
      const method = editingTask ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formattedTaskData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving task:", errorData);
        return;
      }
  
      console.log("Task saved successfully");
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks(); 
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  
  
  

  // Edit task
  const handleEditTask = (task) => {
    if (task.locked) {
      alert("This task is locked and cannot be edited.");
      return;
    }
    setEditingTask(task);
    setIsModalOpen(true);
  };
  

  // Delete task from the backend
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        fetchTasks(); // Refresh task list after delete
      } else {
        const result = await response.json();
        console.error("Error deleting task:", result.message);
      }
    } catch (error) {
      console.error(" Fetch error:", error);
    }
  };

  // Move task between columns (todo, inProgress, done)
  const handleMoveTask = async (task, direction) => {
    if (task.locked) {
      alert("This task is locked and cannot be moved.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${task.id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) throw new Error("Failed to move task");

      fetchTasks(); // Refresh UI
    } catch (error) {
      console.error(" Error moving task:", error);
    }
  };
  const handleAssignColor = (status, color) => {
    setTaskListColors((prevColors) => ({
      ...prevColors,
      [status]: color,
    }));
  };

  return (
    <div style={styles.container}>
      <h2>Task Board</h2>
      <SearchBar />
      <div style={styles.buttonContainer}>
        <button onClick={() => navigate("/admindashboard")} style={styles.adminButton}>Admin Dashboard</button>
        <button onClick={() => {  setEditingTask(null);  setIsModalOpen(true);}} style={styles.addButton}>+ Add Task</button>
      </div>

      {isModalOpen && <AddTask task={editingTask} onSaveTask={handleSaveTask} onClose={() => setIsModalOpen(false)} />}

      <div style={styles.board}>
        <TaskList
          title="To-Do"
          tasks={tasks.todo}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.todo}
          onAssignColor={(color) => handleAssignColor("todo", color)}
        />
        <TaskList
          title="In Progress"
          tasks={tasks.inProgress}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.inProgress}
          onAssignColor={(color) => handleAssignColor("inProgress", color)}
        />
        <TaskList
          title="Done"
          tasks={tasks.done}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.done}
          onAssignColor={(color) => handleAssignColor("done", color)}
        />
      </div>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "20px", position: "relative" },
  board: { display: "flex", justifyContent: "space-around", padding: "20px", background: "#f4f5f7" },
  buttonContainer: { position: "absolute", right: "20px", top: "20px", display: "flex", gap: "10px" },
  adminButton: { padding: "10px 20px", fontSize: "16px", background: "green", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
  addButton: { padding: "10px 20px", fontSize: "16px", background: "#007bff", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }
};

export default TaskBoard;
