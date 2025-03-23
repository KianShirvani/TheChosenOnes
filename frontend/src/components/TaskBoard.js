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

  // Connect front-back filter: added `filters` state to store selected filter values
  const [filters, setFilters] = useState({
    date: "",
    users: [],
    priorities: [],
    status: [],
  });
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/toastify-js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

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
  const formatDate = (isoDate) => {
    if (!isoDate || isoDate === "0001-01-01" || isoDate === "0001-01-01T00:00:00.000Z") {
      return "No upcoming tasks";
    }
  
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
  
    return date.toISOString().split("T")[0]; 
  };
  const formatStatus = (status) => {
    if (!status) return "to do"; 
    const formatted = status.toLowerCase().trim();
    if (formatted === "to do") return "to do";
    if (formatted === "in progress") return "in progress";
    if (formatted === "done") return "done";
    return formatted;
  };
  
  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tasks`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
  
      console.log("Fetched data:", data); 
      const tasks = data.tasks.map(task => ({
        ...task,
        id: task.id || task.task_id,
        progress: task.progress || 0,
        status: formatStatus(task.status ?? "todo"), 
        dueDate: formatDate(task.due_date), 
        startDate: formatDate(task.start_date),
        endDate: formatDate(task.end_date),
      }));

      const filteredTasks = {
        todo: tasks.filter(task => {
          const status = task.status.toLowerCase();
          return status === "todo" || status === "to do";
        }),
        inProgress: tasks.filter(task => {
          const status = task.status.toLowerCase();
          return status === "inprogress" || status === "in progress";
        }),
        done: tasks.filter(task => {
          const status = task.status.toLowerCase();
          return status === "done";
        }),
      };
  
      setTasks(filteredTasks);
      console.log("Updated tasks:", filteredTasks);
      console.log("Todo tasks:", filteredTasks.todo);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
  // Fetch available users from the backend
  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
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
    const priorityMap = {
      "Low": 1,
      "Medium": 2,
      "High": 3,
      "Critical": 4,
      "Urgent": 5
    };
    const priorityValue = priorityMap[taskData.priority] || parseInt(taskData.priority, 10) || null;
    const formattedTaskData = {
      id: taskData.id || null, 
      kanban_id: taskData.kanban_id, 
      user_id: taskData.user_id,
      title: taskData.title,
      description: taskData.description,
      priority: priorityValue,
      due_date: formatDate(taskData.dueDate), 
      start_date: formatDate(taskData.startDate || new Date()), 
      end_date: formatDate(taskData.endDate || taskData.dueDate),
      progress: taskData.progress || 0,
      status: taskData.status || "todo",
      assignedUsers: taskData.assignedUsers || [],
    };
  
    console.log("Final data sent to backend:", formattedTaskData); 
    console.log("Kanban ID: ", formattedTaskData.kanban_id);
    console.log("Assigned users: ", taskData.assignedUsers);
  
    try {
      const url = editingTask
        ? `${process.env.REACT_APP_API_URL}/api/tasks/${taskData.id}`
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
      if (taskData.assignedUsers && taskData.assignedUsers.length > 0) {
        const taskId = editingTask ? taskData.id : responseData.task.task_id;
        await fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/assign-users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userIds: taskData.assignedUsers }),
        });
      }
  
    setTasks(prevTasks => {
      const updatedTask = {
        ...formattedTaskData,
        task_id: editingTask ? taskData.id : responseData.task.task_id,
        id: editingTask ? taskData.id : responseData.task.task_id,
        dueDate: taskData.dueDate,
        startDate: taskData.startDate || formatDate(new Date()),
        endDate: taskData.endDate || taskData.dueDate,
        status: taskData.status || "todo",
      };
      
      const statusKey = updatedTask.status.toLowerCase() === "todo" || updatedTask.status.toLowerCase() === "to do" ? "todo" :
      updatedTask.status.toLowerCase() === "inprogress" || updatedTask.status.toLowerCase() === "in progress" ? "inProgress" :
      "done";

      if (editingTask) {
        const oldStatusKey = prevTasks.todo.some(t => t.task_id === updatedTask.task_id) ? "todo" :
        prevTasks.inProgress.some(t => t.task_id === updatedTask.task_id) ? "inProgress" :
        "done";
       
        return {
          ...prevTasks,
          [oldStatusKey]: prevTasks[oldStatusKey].filter(t => t.task_id !== updatedTask.task_id),
          [statusKey]: [
            ...prevTasks[statusKey].filter(t => t.task_id !== updatedTask.task_id), 
            updatedTask
          ],
        };
      } else {
        return {
          ...prevTasks,
          [statusKey]: [updatedTask, ...prevTasks[statusKey]],
        };
      }
    });

    setIsModalOpen(false);
    setEditingTask(null);
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
        const taskFound = allTasks.find(task => task.task_id === taskId);
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
        const taskFound = allTasks.find(task => task.task_id === taskId);
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
      window.Toastify({
        text: "This task is locked and cannot be edited.",
        duration: 6000,
        gravity: "bottom",
        position: "center",
        style: {
          background: "#F62424", 
        },
      }).showToast();
      return;
    }
    setEditingTask(task);
    setIsModalOpen(true);
  };
  

  // Delete task from the backend
  const handleDeleteTask = async (taskId) => {
    const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.done];
    const task = allTasks.find(t => t.task_id === taskId);
    if (task.locked) {
      window.Toastify({
        text: "This task is locked and cannot be deleted.",
        duration: 6000,
        gravity: "bottom",
        position: "center",
        style: {
          background: "#F62424", 
        },
      }).showToast();
      return;
    }
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to move task: ${errorData.message}`);
      }
  
      const updatedTask = await response.json().then(data => data.task);
      console.log("Moved task:", updatedTask);
  
      // Immediately update the tasks state
      setTasks(prevTasks => {
        const newTasks = {
          todo: prevTasks.todo.filter(t => t.task_id !== task.task_id),
          inProgress: prevTasks.inProgress.filter(t => t.task_id !== task.task_id),
          done: prevTasks.done.filter(t => t.task_id !== task.task_id),
        };
        const formattedTask = {
          ...updatedTask,
          id: updatedTask.task_id,
          status: formatStatus(updatedTask.status),
          dueDate: formatDate(updatedTask.due_date),
          startDate: formatDate(updatedTask.start_date),
          endDate: formatDate(updatedTask.end_date),
          progress: updatedTask.progress || 0,
        };
        if (formattedTask.status.toLowerCase() === "to do") newTasks.todo.push(formattedTask);
        else if (formattedTask.status.toLowerCase() === "in progress") newTasks.inProgress.push(formattedTask);
        else if (formattedTask.status.toLowerCase() === "done") newTasks.done.push(formattedTask);
        return newTasks;
      });
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

  // add a helper function to normalize status strings.
  const normalizeStatus = (status) =>
    status.toLowerCase().replace(/-/g, ' ').trim();

  // Connect front-back filter: function to apply filters dynamically
  const applyFilters = (taskList) => {
    return taskList.filter(task => {
      return (
        (filters.date === "" || task.dueDate === filters.date) &&
        (filters.users.length === 0 ||
          filters.users.some(u =>
            task.assignedUsers 
              ? task.assignedUsers.some(id => String(id) === u)
              : String(task.user_id) === u
          )
        ) &&
        (filters.priorities.length === 0 || filters.priorities.includes(String(task.priority))) &&
        (filters.status.length === 0 ||
          filters.status.some(f => normalizeStatus(f) === normalizeStatus(task.status)))
      );
    });
  };

  return (
    <div style={styles.container}>
      <h2>Task Board</h2>
      <SearchBar filters={filters} setFilters={setFilters} />
      <div style={styles.buttonContainer}>
   
        <button onClick={() => {  setEditingTask(null);  setIsModalOpen(true);}} style={styles.addButton}>+ Add Task</button>
      </div>
      {isModalOpen && <AddTask task={editingTask} onSaveTask={handleSaveTask} onClose={() => setIsModalOpen(false)} availableUsers={availableUsers} />}

      <div style={styles.board}>
        <TaskList
          title="To-Do"
          tasks={applyFilters(tasks.todo)} // Apply Filter changes on the TaskList
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={fetchTasks}
          selectedColor={taskListColors.todo}
          onAssignColor={(color) => handleAssignColor("todo", color)}
          availableUsers={availableUsers}
          onAddUser={handleAddUserToTask}
          onRemoveUser={handleRemoveUserFromTask}
        />
        <TaskList
          title="In Progress"
          tasks={applyFilters(tasks.inProgress)}  // Apply Filter changes on the TaskList
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={fetchTasks}
          selectedColor={taskListColors.inProgress}
          onAssignColor={(color) => handleAssignColor("inProgress", color)}
          availableUsers={availableUsers}
          onAddUser={handleAddUserToTask}
          onRemoveUser={handleRemoveUserFromTask}
        />
        <TaskList
          title="Done"
          tasks={applyFilters(tasks.done)}  // Apply Filter changes on the TaskList
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={fetchTasks}
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
