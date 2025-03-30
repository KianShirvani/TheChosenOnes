import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskList = ({ title, tasks, onEditTask, onDeleteTask, onMoveTask, selectedColor, onAssignColor, availableUsers, onAddUser, onRemoveUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const colors = {
    Default: "rgba(224, 224, 224, 0.7)",
    Red: "rgba(255, 0, 0, 0.7)",
    Green: "rgba(0, 128, 0, 0.7)",
    Yellow: "rgba(255, 255, 0, 0.7)",
    Purple: "rgba(128, 0, 128, 0.7)",
    Black: "rgba(0, 0, 0, 0.7)",
    White: "rgba(255, 255, 255, 0.7)",
    Grey: "rgba(128, 128, 128, 0.7)"
  };
  
  const priorityLabelMap = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
    5: "Urgent"
  };
  const priorityColors = {
    1: "green",     // Low
    2: "blue",      // Medium
    3: "orange",    // High
    4: "purple",   // Critical
    5: "red",       // Urgent
  };
  
  const priorityLabels = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
    5: "Urgent",
  };
  
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
  const getSelectedColorName = () => {
    return Object.keys(colors).find((key) => colors[key] === selectedColor) || "Default";
  };

  const TaskUsers = ({ taskId }) => {
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");

    useEffect(() => {
      const fetchAssignedUsers = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/users`, {
            withCredentials: true
          });
          if (response.status === 200) {
            setAssignedUsers(response.data.users);
          }
        } catch (error) {
          console.error("Error fetching users for task:", error);
        }
      };
      fetchAssignedUsers();
    }, [taskId]);

    const handleAddUser = () => {
      if (selectedUser) {
        onAddUser(taskId, selectedUser);
        setSelectedUser("");
        setAssignedUsers(prev => [...prev, availableUsers.find(u => u.id === selectedUser)]);
      }
    };

    const handleRemoveUser = (userId) => {
      onRemoveUser(taskId, userId);
      setAssignedUsers(prev => prev.filter(user => user.id !== userId));
    };

    const availableToAdd = availableUsers.filter(
      user => !assignedUsers.find(assigned => assigned.id === user.id)
    );
  
    return (
      <div style={userStyles.container}>
        <h5>Assigned Users:</h5>
        <ul style={userStyles.userList}>
          {assignedUsers.map(user => (
            <li key={user.id} style={userStyles.userItem}>
              {user.display_name || `${user.first_name} ${user.last_name}`}
              <button onClick={() => handleRemoveUser(user.id)} style={userStyles.removeButton}>Remove</button>
            </li>
          ))}
        </ul>
        <div style={userStyles.addUserContainer}>
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={userStyles.dropdown}
          >
            <option value="">Select user</option>
            {availableToAdd.map(user => (
              <option key={user.id} value={user.id}>
                {user.display_name || `${user.first_name} ${user.last_name}`}
              </option>
            ))}
          </select>
          <button onClick={handleAddUser} style={userStyles.addButton}>Add User</button>
        </div>
      </div>
    );
  };

  const handleMoveTask = async (task, direction) => {
    if (task.locked) {
      window.Toastify({
        text: "This task is locked and cannot be moved.",
        duration: 6000,
        gravity: "bottom",
        position: "center",
        style: {
          background: "#F62424",
        },
      }).showToast();
      return;
    }
    console.log("handleMoveTask is clicked");
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task.task_id}/move`, {
        direction
      }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });

      if (response.status !== 200) throw new Error("Failed to move task");
      console.log("Response data: ", response.data);
      // Refresh the task list after moving the task
      onMoveTask(task, direction);
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  return (
    <div style={{ ...styles.list, background: selectedColor }}>
      <div style={styles.header}>
        <h3>{title}</h3>
        <button onClick={() => setShowDropdown(!showDropdown)} style={styles.assignColorButton}>Assign Color</button>
      </div>

      {showDropdown && (
        <select
          value={getSelectedColorName()}
          onChange={(e) => {
            const selectedOption = e.target.value;
            const newColor = colors[selectedOption] || "#e0e0e0";
            onAssignColor(newColor);
            setShowDropdown(false);
          }}
          style={styles.dropdown}
        >
          {Object.keys(colors).map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      )}

{tasks.map((task) => {
  const color = priorityColors[task.priority] || "#999";
  const label = priorityLabels[task.priority] || task.priority;

  return (
    <div
      key={task.task_id}
      style={{
        ...styles.task,
        borderLeft: `6px solid ${color}`,
      }}
    >
      <strong>{task.title}</strong>
      <p>{task.description}</p>
          {task.assignedUsers?.length > 0 && (
      <p><strong>Assigned To:</strong> {
        task.assignedUsers
          .map(userId => {
            const user = availableUsers.find(u => u.id === userId || u.user_id === userId);
            return user ? (user.display_name || `${user.first_name} ${user.last_name}`) : "Unknown";
          })
          .join(", ")
      }</p>
    )}

      <p style={{ color, fontWeight: "bold" }}>
        Priority: {label}
      </p>
      <p><strong>Due Date:</strong> {task.dueDate}</p>

          <div style={styles.actions}>
            <button onClick={() => onEditTask(task)} style={task.locked ? { ...styles.edit, opacity: 0.5 } : styles.edit} >✏️</button>
            {title !== "To-Do" && (
              <button onClick={() => handleMoveTask(task, "left")} style={task.locked  ? { ...styles.arrow, opacity: 0.5 } : styles.arrow} >←</button>
            )}
            {title !== "Done" && (
              <button onClick={() => handleMoveTask(task, "right")} style={task.locked ? { ...styles.arrow, opacity: 0.5 } : styles.arrow} >→</button>
            )}
            <button onClick={() => onDeleteTask(task.task_id)}  style={task.locked ? { ...styles.delete, opacity: 0.5 } : styles.delete} >🗑</button>
          </div>
        </div>
      );
    })}
  </div>
);
};

const styles = {
  list: { width: "30%", background: "#e0e0e0", padding: "15px", borderRadius: "10px" },
  task: { background: "#fff", padding: "10px", margin: "10px 0", borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" },
  actions: { display: "flex", justifyContent: "center", gap: "50px", marginTop: "10px" },
  edit: { background: "#007bff", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  delete: { background: "#dc3545", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  arrow: { background: "#6c757d", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" }
};

const userStyles = {
  container: { marginTop: "10px", borderTop: "1px solid #ccc", paddingTop: "10px" },
  userList: { listStyleType: "none", paddingLeft: 0 },
  userItem: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" },
  removeButton: { background: "#dc3545", color: "white", border: "none", padding: "2px 5px", cursor: "pointer", borderRadius: "3px" },
  addUserContainer: { display: "flex", gap: "10px", marginTop: "5px" },
  dropdown: { flex: 1 },
  addButton: { padding: "5px", cursor: "pointer" }
};

export default TaskList;