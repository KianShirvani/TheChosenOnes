import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AdminTaskList from "../components/AdminTaskList";
import SearchBar from "../components/SearchBar";
import EditTaskModal from "../components/EditTaskModal";
import AddTask from "../components/AddTask";
import "../css/AdminDashboard.css";
import { NotificationContext } from "../components/NotificationContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });

  const [taskStats, setTaskStats] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
    completedRate: 0,
    upcomingDue: null,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // availableUsers state
  const [availableUsers, setAvailableUsers] = useState([]);

  // Notification: Get setNotification from NotificationContext
  const { setNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchTasks();
    fetchAvailableUsers(); // Fetch users from database
  }, []);
  const formatDate = (isoDate) => {
    if (!isoDate || isoDate === "0001-01-01") {
      return "No upcoming tasks";  
    }
    return new Date(isoDate).toISOString().split("T")[0];
  };
  const formatStatus = (status) => {
    if (!status) return "to do"; 
    const formatted = status.toLowerCase().trim();
    if (formatted === "to do") return "to do";
    if (formatted === "in progress") return "in progress";
    if (formatted === "done") return "done";
    return formatted;
  };
  
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`);
      if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      const data = await response.json();
      console.log("Fetched Tasks:", data.task);
  
     
      const tasks = data.tasks.map(task => ({
        ...task,
        id: task.id || task.task_id,
        progress: task.progress || 0,
        status: formatStatus(task.status ?? "todo"), 
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "N/A",
        startDate: task.start_date ? new Date(task.start_date).toISOString().split("T")[0] : "N/A",
        endDate: task.end_date ? new Date(task.end_date).toISOString().split("T")[0] : "N/A",
      }));
  
      console.log("Processed Tasks:", tasks);
      const filteredTasks = {
        todo: tasks.filter(task => task.status.toLowerCase().includes("to do")),
        inProgress: tasks.filter(task => task.status.toLowerCase().includes("in progress")),
        done: tasks.filter(task => task.status.toLowerCase().includes("done")),
      };
  
      setTasks(filteredTasks); 
      console.log("Updated tasks:", filteredTasks);
  
      updateTaskStats(filteredTasks); 
      return filteredTasks;
    } catch (error) {
      console.error(" Error fetching tasks:", error);
      return null;
    }
  };

  // Fetch available users from the backend
  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setAvailableUsers(data.users);
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  const updateTaskStats = (taskData) => {
    const todo = taskData.todo.length;
    const inProgress = taskData.inProgress.length;
    const done = taskData.done.length;
    const totalTasks = [...taskData.todo, ...taskData.inProgress, ...taskData.done].length;
    const totalProgress = [...taskData.todo, ...taskData.inProgress, ...taskData.done].reduce((sum, task) => {
      const progress = task.progress;
      console.log(`Task ${task.title}: Inferred Progress = ${progress}`);
      return sum + progress;
    }, 0); 
    
    const completedRate = totalTasks > 0 ? (totalProgress / totalTasks).toFixed(1) : "0";
  
    const today = new Date();
    const upcomingDueRaw = [...taskData.todo, ...taskData.inProgress, ...taskData.done]
      .filter(task => new Date(task.due_date) >= today)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]?.due_date || "No upcoming tasks";
      let upcomingDue;
      if (upcomingDueRaw === "No upcoming tasks") {
        upcomingDue = upcomingDueRaw;
      } else {
        const date = new Date(upcomingDueRaw);
        upcomingDue = date.toISOString().split("T")[0]; 
      }
    setTaskStats(prevStats => ({
    ...prevStats,
    todo,
    inProgress,
    done,
    completedRate,
    upcomingDue,
  }));
  };
  
  const handleMoveTask = async (task, direction) => {
    if (task.locked) return alert("This task is locked and cannot be moved.");
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${task.task_id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to move task: ${response.statusText}`);
      }
  
      fetchTasks();
    } catch (error) {
      console.error("Error moving task:", error);
    }
  }
  
  const handleToggleLock = async (taskId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/lock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to toggle lock: ${response.statusText}`);
      }
  
      fetchTasks();
    } catch (error) {
      console.error(" Error toggling lock:", error);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
  
      const updatedData = await fetchTasks(); 
      updateTaskStats(updatedData); 
    } catch (error) {
      console.error(" Error deleting task:", error);
    }
  };
  
  const handleEditTask = (task) => {
    //first check if task is locked before editing
    if (task.locked) return alert("This task is locked and cannot be edited.");
    //task is NOT locked so allow edits
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask) => {
    console.log("Updated Task Before Sending:", updatedTask); // 检查是否有 progress
    if (updatedTask.locked) return alert("This task is locked and cannot be edited.");
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${updatedTask.task_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
      
      fetchTasks();
    } catch (error) {
      console.error(" Error updating task:", error);
    }
    setIsEditModalOpen(false);
  };
  const handleAddTask = async (newTask) => {
    try {
      console.log("New Task Before Sending:", newTask);
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to add task: ${response.statusText}`);
      }
  
      setIsAddModalOpen(false);

      const updatedData = await fetchTasks(); 
      updateTaskStats(updatedData);
  
    } catch (error) {
      console.error(" Error adding task:", error);
    }
  };

  // Notification: Function to add a user to an existing task from AdminDashboard
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
        // Notification: Trigger notification on successful user addition
        const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.done];
        const taskFound = allTasks.find(task => task.task_id === taskId);
        const userFound = availableUsers.find(user => user.id === userId);
        setNotification({
          message: `User ID: ${userFound ? userFound.id : userId} User Name: ${userFound ? userFound.first_name + " " + userFound.last_name : ""} is added to Task ID: ${taskId} Task Title: ${taskFound ? taskFound.title : "Unknown"}`,
          color: "green"
        }); // Notification:
      }
      fetchTasks();
    } catch (error) {
      console.error("Error assigning user:", error);
    }
  };

  // Notification: Function to remove a user from an existing task from AdminDashboard
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
        // Notification: Trigger notification on successful user removal
        const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.done];
        const taskFound = allTasks.find(task => task.task_id=== taskId);
        const userFound = availableUsers.find(user => user.id === userId);
        setNotification({
          message: `User ID: ${userFound ? userFound.id : userId} User Name: ${userFound ? userFound.first_name + " " + userFound.last_name : ""} is removed from Task ID: ${taskId} Task Title: ${taskFound ? taskFound.title : "Unknown"}`,
          color: "red"
        }); // Notification:
      }
      fetchTasks();
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="add-task-container" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/adminManagement")}
          className="admin-management-button"
          style={{
            background: "green",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Admin Management
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="add-task-button"
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          + Add Task
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><h3>To-Do</h3><p>{taskStats.todo}</p></div>
        <div className="stat-card"><h3>In Progress</h3><p>{taskStats.inProgress}</p></div>
        <div className="stat-card"><h3>Done</h3><p>{taskStats.done}</p></div>
        <div className="stat-card"><h3>Completion Rate</h3><p>{taskStats.completedRate}%</p></div>
        <div className="stat-card"><h3>Upcoming Due</h3><p>{taskStats.upcomingDue}</p></div>
      </div>

      <SearchBar />

      <div className="task-board">
        {Object.keys(tasks).map((status) => (
          <AdminTaskList
            key={status}
            title={status}
            tasks={tasks[status]}
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleLock={handleToggleLock}
            // Notification: If needed, you can pass handleAddUserToTask and handleRemoveUserFromTask as props here.
            onAddUser={handleAddUserToTask} // Notification:
            onRemoveUser={handleRemoveUserFromTask} // Notification:
          />
        ))}
      </div>

      {isAddModalOpen && <AddTask onSaveTask={handleAddTask} onClose={() => setIsAddModalOpen(false)} availableUsers={availableUsers} />}
      {isEditModalOpen && <EditTaskModal task={editingTask} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateTask} />}
    </div>
  );
};

export default AdminDashboard;
