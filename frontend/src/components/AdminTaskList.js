import React, { useEffect } from "react";
const AdminTaskList = ({ title, tasks, onEditTask, onDeleteTask, onMoveTask, onToggleLock }) => {
  const renderTitle = (status) => {
    switch (status) {
      case "todo":
        return "To-Do";
      case "inProgress":
        return "In Progress";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const priorityLabelMap = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Critical",
    5: "Urgent"
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
  const handleDeleteClick = (task) => {
    if (task.locked) {
      window.Toastify({
        text: "This task has been locked, can not deleted",
        duration: 6000, 
        gravity: "bottom", 
        position: "center",
        style: {
          background: "#F62424", 
        },
      }).showToast();
      return;
    }
    onDeleteTask(task.task_id);
  };
  const handleEditClick = (task) => {
    if (task.locked) {
      window.Toastify({
        text: "This task has been locked, cannot be edited",
        duration: 6000,
        gravity: "bottom",
        position: "center",
        style: {
          background: "#F62424",
        },
      }).showToast();
      return;
    }
    onEditTask(task);
  };
  return (
    <div style={styles.list}>
      <h3>{renderTitle(title)}</h3>
      {tasks.map((task) => (
        <div key={task.task_id} style={styles.task} data-testid="task-card">
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <p><strong>Priority:</strong> {priorityLabelMap[task.priority]}</p>
          <p><strong>Due Date:</strong> {task.dueDate}</p>

          <div style={styles.progressBar} data-testid="progress-bar">
            <div
              style={{
                ...styles.progressBarFilled,
                width: `${task.progress}%`,
              }}
            ></div>
          </div>
          <p style={styles.progressText}>{task.progress}% Complete</p>

          <p style={styles.timeInfo}>
            <strong>Start Date:</strong> {task.startDate} | <strong>End Date:</strong> {task.endDate}
          </p>

          {task.dependencies && task.dependencies.length > 0 && (
            <div style={styles.dependencies} data-testid="dependencies">
              <strong>Depends on:</strong>
              <ul>
                {task.dependencies.map((dep) => (
                  <li key={dep}>Task {dep}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.actions}>
          <button
              onClick={() => handleEditClick(task)} 
              style={task.locked ? { ...styles.edit, opacity: 0.5 } : styles.edit} 
              data-testid="edit-button"

            >
              ✏️
            </button>
            {title !== "To-Do" && !task.locked && (
  <button
    onClick={() => onMoveTask(task, "left")}
    style={styles.arrow}
    data-testid="move-left-button"
  >
 ←
  </button>
)}

{title !== "Done" && !task.locked && (
  <button
    onClick={() => onMoveTask(task, "right")}
    style={styles.arrow}
    data-testid="move-right-button"
  >
    →
  </button>
)}

           
  <button 
    onClick={() => onToggleLock(task.task_id)} 
    style={task.locked ? styles.locked : styles.unlock} 
    data-testid="lock-button"
  >
    {task.locked ? "Locked" : "Lock"}
  </button>

  <button
              onClick={() => handleDeleteClick(task)}
              style={task.locked ? { ...styles.delete, opacity: 0.5 } : styles.delete} 
              data-testid="delete-button"         
  >
  🗑
  </button>

          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  list: { width: "30%", background: "#e0e0e0", padding: "15px", borderRadius: "10px", marginBottom: "20px" },
  task: { background: "#fff", padding: "15px", margin: "10px 0", borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" },
  actions: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" },
  edit: { background: "#007bff", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  delete: { background: "#dc3545", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  arrow: { background: "#6c757d", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  
  locked: { background: "#343a40", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  unlock: { background: "#ffc107", color: "black", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },

  progressBar: { width: "100%", height: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px", marginTop: "10px" },
  progressBarFilled: { height: "100%", backgroundColor: "#28a745", borderRadius: "5px" },
  progressText: { fontSize: "0.875rem", marginTop: "5px" },

  timeInfo: { fontSize: "0.875rem", color: "#555", marginTop: "5px" },
  dependencies: { fontSize: "0.875rem", color: "#777", marginTop: "10px" },
};

export default AdminTaskList;
