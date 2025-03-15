import React, { useState, useEffect, useContext } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "./NotificationContext";

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

  // State to store available users fetched from the database
  const [availableUsers, setAvailableUsers] = useState([]);

  // Get setNotification from NotificationContext
  const { setNotification } = useContext(NotificationContext);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
  
      console.log("Fetched data:", data); 
      const tasks = data.tasks || [];
  
      setTasks({
        todo: tasks.filter(task => task.status.toLowerCase() === "to do"),
        inProgress: tasks.filter(task => task.status.toLowerCase() === "in progress"),
        done: tasks.filter(task => task.status.toLowerCase() === "done"),
      });
      
  
      console.log("Updated tasks:", {
        todo: tasks.filter(task => task.status.toLowerCase() === "to do"),
        inProgress: tasks.filter(task => task.status.toLowerCase() === "in progress"),
        done: tasks.filter(task => task.status.toLowerCase() === "done"),
      });
  
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
  // Fetch available users from the backend
  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setAvailableUsers(data.users);
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };
  
  useEffect(() => {
    fetchTasks(); // Fetch tasks on initial load
    fetchAvailableUsers(); // Fetch users from database
  }, []);

  // Modified handleSaveTask to also handle assigned users for new tasks.
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
      
      // Add this line to get the response data
      const responseData = await response.json();

      console.log("Task saved successfully");

      // If adding a new task with assignedUsers, call assignUsersToTask endpoint.
      if (!editingTask && taskData.assignedUsers && taskData.assignedUsers.length > 0) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${responseData.task.id}/assign-users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userIds: taskData.assignedUsers }),
        });
      }

      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks(); 
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  

  // Function to add a user to an existing task from TaskList
  const handleAddUserToTask = async (taskId, userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/assign-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userIds: [userId] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error assigning user:", errorData);
      } else {
        // Trigger notification on successful user addition
        const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.done];
        const taskFound = allTasks.find(task => task.id === taskId);
        const userFound = availableUsers.find(user => user.id === userId);
        setNotification({
          message: `User ID: ${userFound ? userFound.id : userId} User Name: ${userFound ? userFound.first_name + " " + userFound.last_name : ""} is added to Task ID: ${taskId} Task Title: ${taskFound ? taskFound.title : "Unknown"}`,
          color: "green"
        }); // NEW:
      }
      fetchTasks();
    } catch (error) {
      console.error("Error assigning user:", error);
    }
  };

  // Function to remove a user from an existing task from TaskList
  const handleRemoveUserFromTask = async (taskId, userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/remove-users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userIds: [userId] }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error removing user:", errorData);
      } else {
        // Trigger notification on successful user removal
        const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.done];
        const taskFound = allTasks.find(task => task.id === taskId);
        const userFound = availableUsers.find(user => user.id === userId);
        setNotification({
          message: `User ID: ${userFound ? userFound.id : userId} User Name: ${userFound ? userFound.first_name + " " + userFound.last_name : ""} is removed from Task ID: ${taskId} Task Title: ${taskFound ? taskFound.title : "Unknown"}`,
          color: "red"
        });
      }
      fetchTasks();
    } catch (error) {
      console.error("Error removing user:", error);
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

      {isModalOpen && <AddTask task={editingTask} onSaveTask={handleSaveTask} onClose={() => setIsModalOpen(false)} availableUsers={availableUsers} />}

      <div style={styles.board}>
        <TaskList
          title="To-Do"
          tasks={tasks.todo}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.todo}
          onAssignColor={(color) => handleAssignColor("todo", color)}
          availableUsers={availableUsers}
          onAddUser={handleAddUserToTask}
          onRemoveUser={handleRemoveUserFromTask}
        />
        <TaskList
          title="In Progress"
          tasks={tasks.inProgress}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.inProgress}
          onAssignColor={(color) => handleAssignColor("inProgress", color)}
          availableUsers={availableUsers}
          onAddUser={handleAddUserToTask}
          onRemoveUser={handleRemoveUserFromTask}
        />
        <TaskList
          title="Done"
          tasks={tasks.done}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.done}
          onAssignColor={(color) => handleAssignColor("done", color)}
          availableUsers={availableUsers}
          onAddUser={handleAddUserToTask}
          onRemoveUser={handleRemoveUserFromTask}
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
