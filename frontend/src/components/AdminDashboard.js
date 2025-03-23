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

  // Connect front-back filter: added `filters` state to store selected filter values
  const [filters, setFilters] = useState({
    date: "",
    users: [],
    priorities: [],
    status: [],
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
    const savedColors = localStorage.getItem("taskListColors");
    if (savedColors) {
      setTaskListColors(JSON.parse(savedColors));
    }
  }, []); // for persisting TaskList color (bug fix)

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
      console.log("Raw data from backend:", data);
      const priorityMapReverse = {
        1: "Low",
        2: "Medium",
        3: "High",
        4: "Critical",
        5: "Urgent",
      };
     
      const tasks = data.tasks.map(task => ({
        ...task,
        id: task.task_id, 
        task_id: task.task_id,
        progress: task.progress || 0,
        status: formatStatus(task.status ?? "todo"), 
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "N/A",
        startDate: task.start_date ? new Date(task.start_date).toISOString().split("T")[0] : "N/A",
        endDate: task.end_date ? new Date(task.end_date).toISOString().split("T")[0] : "N/A",
        priority: priorityMapReverse[task.priority] || "Medium",
      }));
  
      console.log("Processed Tasks:", tasks);
      const filteredTasks = {
        todo: tasks.filter(task => {
          const status = task.status.toLowerCase();
          return status === "todo" || status.includes("to do");
        }),
        inProgress: tasks.filter(task => {
          const status = task.status.toLowerCase();
          return status === "inprogress" || status.includes("in progress");
        }),
        done: tasks.filter(task => {
          const status = task.status.toLowerCase();
          return status === "done" || status.includes("done");
        }),
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
      console.log("Raw availableUsers:", data.users);
    const seenIds = new Set();
    const validUsers = (data.users || []).filter(user => {
      if (!user.user_id || seenIds.has(user.user_id)) {
        console.warn("Invalid or duplicate user:", user);
        return false;
      }
      seenIds.add(user.user_id);
      return true;
    });
    console.log("Filtered availableUsers:", validUsers);
    setAvailableUsers(validUsers);
  } catch (error) {
    console.error("Error fetching available users:", error);
    setAvailableUsers([]);
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
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${task.task_id}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to move task: ${response.statusText}`);
      }
        const updatedTask = await response.json().then(data => data.task);
        const priorityMapReverse = {
          1: "Low",
          2: "Medium",
          3: "High",
          4: "Critical",
          5: "Urgent",
        };
        const formattedTask = {
          ...task,
          ...updatedTask, 
          id: updatedTask.task_id,
          task_id: updatedTask.task_id,
          progress: updatedTask.progress || 0,
          status: formatStatus(updatedTask.status ?? "todo"),
          dueDate: updatedTask.due_date ? new Date(updatedTask.due_date).toISOString().split("T")[0] : "N/A",
          startDate: updatedTask.start_date ? new Date(updatedTask.start_date).toISOString().split("T")[0] : "N/A",
          endDate: updatedTask.end_date ? new Date(updatedTask.end_date).toISOString().split("T")[0] : "N/A",
          priority: priorityMapReverse[updatedTask.priority] || "Medium",
        };
      setTasks(prevTasks => {
        const newTasks = {
          todo: prevTasks.todo.filter(t => t.task_id !== task.task_id),
          inProgress: prevTasks.inProgress.filter(t => t.task_id !== task.task_id),
          done: prevTasks.done.filter(t => t.task_id !== task.task_id),
        };
  
        if (updatedTask.status.toLowerCase() === "to do") {
          newTasks.todo.push(formattedTask);
        } else if (updatedTask.status.toLowerCase() === "in progress") {
          newTasks.inProgress.push(formattedTask);
        } else if (updatedTask.status.toLowerCase() === "done") {
          newTasks.done.push(formattedTask);
        }
  
        return newTasks;
      });
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
  
      setTasks((prevTasks) => ({
        todo: prevTasks.todo.map(task => task.task_id === taskId ? { ...task, locked: !task.locked } : task),
        inProgress: prevTasks.inProgress.map(task => task.task_id === taskId ? { ...task, locked: !task.locked } : task),
        done: prevTasks.done.map(task => task.task_id === taskId ? { ...task, locked: !task.locked } : task),
      }));
  
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
    console.log("Updated Task Before Sending:", updatedTask);
  
    try {
      const priorityMap = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
        "Critical": 4,
        "Urgent": 5,
      };
      const taskToSend = {
        ...updatedTask,
        priority: priorityMap[updatedTask.priority] || updatedTask.priority,
        dueDate: updatedTask.due_date ? new Date(updatedTask.due_date).toISOString().split("T")[0] : "N/A",
          startDate: updatedTask.start_date ? new Date(updatedTask.start_date).toISOString().split("T")[0] : "N/A",
          endDate: updatedTask.end_date ? new Date(updatedTask.end_date).toISOString().split("T")[0] : "N/A",
          status: formatStatus(updatedTask.status),
      };
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${updatedTask.task_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToSend),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
  
      const responseData = await response.json();
      console.log("Updated task from backend:", JSON.stringify(responseData, null, 2));
  
      const priorityMapReverse = {
        1: "Low",
        2: "Medium",
        3: "High",
        4: "Critical",
        5: "Urgent",
      };

      setTasks((prevTasks) => {
        const updatedTaskWithStringPriority = {
          ...updatedTask,
          priority: priorityMapReverse[updatedTask.priority] || "Medium",
          dueDate: updatedTask.due_date ? new Date(updatedTask.due_date).toISOString().split("T")[0] : "N/A",
          startDate: updatedTask.start_date ? new Date(updatedTask.start_date).toISOString().split("T")[0] : "N/A",
          endDate: updatedTask.end_date ? new Date(updatedTask.end_date).toISOString().split("T")[0] : "N/A",
          status: formatStatus(updatedTask.status),
        };
        const newStatusKey = updatedTask.status.toLowerCase().includes("to do") ? "todo" :
                             updatedTask.status.toLowerCase().includes("in progress") ? "inProgress" :
                             "done";
  
        const oldStatusKey = prevTasks.todo.some(t => t.task_id === updatedTask.task_id) ? "todo" :
                             prevTasks.inProgress.some(t => t.task_id === updatedTask.task_id) ? "inProgress" :
                             "done";
  
        const oldTaskIndex = prevTasks[oldStatusKey].findIndex(t => t.task_id === updatedTask.task_id);

        // If the status hasn't changed, update the task in place
        if (oldStatusKey === newStatusKey) {
          const updatedList = [...prevTasks[oldStatusKey]];
          updatedList[oldTaskIndex] = updatedTaskWithStringPriority; // Replace at the original index
          return {
            ...prevTasks,
            [oldStatusKey]: updatedList,
          };
        }
  
        // If the status has changed, remove from old list and insert into new list at a preserved position
        const oldList = prevTasks[oldStatusKey].filter(t => t.task_id !== updatedTask.task_id);
        const newList = [...prevTasks[newStatusKey]];
        newList.splice(oldTaskIndex < newList.length ? oldTaskIndex : newList.length, 0, updatedTaskWithStringPriority); // Insert at original index or end if out of bounds
  
        return {
          ...prevTasks,
          [oldStatusKey]: oldList,
          [newStatusKey]: newList,
        };
      });setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  const handleAddTask = async (newTask) => {
    try {
      console.log("New Task Before Sending:", newTask);
      const priorityMap = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
        "Critical": 4,
        "Urgent": 5,
      };
      
      const newTaskWithNumericPriority = {
        ...newTask,
        priority: priorityMap[newTask.priority] || 2,
      due_date: newTask.dueDate,       
      start_date: newTask.startDate,   
      end_date: newTask.endDate,       
      progress: Number(newTask.progress), 
      user_id: newTask.userId,
      };
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTaskWithNumericPriority),
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
        const userFound = availableUsers.find(user => user.user_id === userId);
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
        const userFound = availableUsers.find(user => user.user_id === userId);
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

  // Add additional useEffect hook to recalculate the admin dashboard-stats given filtering.
  useEffect(() => {
    // Apply filters to each category
    const filteredTodo = applyFilters(tasks.todo);
    const filteredInProgress = applyFilters(tasks.inProgress);
    const filteredDone = applyFilters(tasks.done);
  
    // Calculate total tasks and overall progress for completion rate
    const allFilteredTasks = [...filteredTodo, ...filteredInProgress, ...filteredDone];
    const totalTasks = allFilteredTasks.length;
    const totalProgress = allFilteredTasks.reduce((sum, task) => {
      return sum + (task.progress || 0);
    }, 0);
    const completedRate = totalTasks > 0 ? (totalProgress / totalTasks).toFixed(1) : "0";
  
    // Compute upcoming due date: get the earliest due date from filtered tasks
    const upcomingDueRaw = allFilteredTasks
      .filter(task => new Date(task.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]?.due_date || "No upcoming tasks";
    let upcomingDue;
    if (upcomingDueRaw === "No upcoming tasks") {
      upcomingDue = upcomingDueRaw;
    } else {
      upcomingDue = new Date(upcomingDueRaw).toISOString().split("T")[0];
    }
  
    setTaskStats({
      todo: filteredTodo.length,
      inProgress: filteredInProgress.length,
      done: filteredDone.length,
      completedRate,
      upcomingDue,
    });
  }, [tasks, filters]); // This effect runs whenever tasks or filters change.
  

  // add a helper function to normalize status strings.
  const normalizeStatus = (status) =>
    status.toLowerCase().replace(/-/g, ' ').trim();

  // Connect front-back filter: function to apply filters dynamically
  const applyFilters = (taskList) => {
    const priorityMap = {
      "Low": 1,
      "Medium": 2,
      "High": 3,
      "Critical": 4,
      "Urgent": 5,
    };
    return taskList.filter(task => {
      const taskPriorityValue = priorityMap[task.priority] || 2;
      return (
        (filters.date === "" || task.dueDate === filters.date) &&
        (filters.users.length === 0 ||
          filters.users.some(u =>
            task.assignedUsers 
              ? task.assignedUsers.some(id => String(id) === u)
              : String(task.user_id) === u
          )
        ) &&
        (filters.priorities.length === 0 || filters.priorities.includes(String(taskPriorityValue)) /* 修复：将 taskPriorityValue 转换为字符串 */) &&
        (filters.status.length === 0 ||
          filters.status.some(f => normalizeStatus(f) === normalizeStatus(task.status)))
      );
    });
  };

  // TaskList color state
  const [taskListColors, setTaskListColors] = useState({
    todo: "#e0e0e0",
    inProgress: "#e0e0e0",
    done: "#e0e0e0",
  }); 

  // Optional: control dropdown toggle per column if needed
  const [colorDropdowns, setColorDropdowns] = useState({
    todo: false,
    inProgress: false,
    done: false,
  }); 

  // Handle Assign Color function
  const handleAssignColor = (status, color) => {
    setTaskListColors((prevColors) => {
      const updated = { ...prevColors, [status]: color };
      localStorage.setItem("taskListColors", JSON.stringify(updated));
      return updated;
    });
    setColorDropdowns(prev => ({ ...prev, [status]: false }));
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

      <SearchBar filters={filters} setFilters={setFilters} />

      <div className="task-board">
        {Object.keys(tasks).map((status) => (
          <AdminTaskList
            key={status}
            title={status}
            tasks={applyFilters(tasks[status])} // Apply the Task Filter to tasks.
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleLock={handleToggleLock}
            // Notification: If needed, you can pass handleAddUserToTask and handleRemoveUserFromTask as props here.
            onAddUser={handleAddUserToTask} // Notification:
            onRemoveUser={handleRemoveUserFromTask} // Notification:
            selectedColor={taskListColors[status]}
            onAssignColor={(color) => handleAssignColor(status, color)}
          />
        ))}
      </div>

      {isAddModalOpen && <AddTask onSaveTask={handleAddTask} onClose={() => setIsAddModalOpen(false)} availableUsers={availableUsers} />}
      {isEditModalOpen && <EditTaskModal task={editingTask} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateTask} />}
    </div>
  );
};

export default AdminDashboard;
