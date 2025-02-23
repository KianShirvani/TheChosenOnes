import React from "react";

const AdminTaskList = ({ title, tasks, onEditTask, onDeleteTask, onMoveTask }) => {
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

  return (
    <div style={styles.list}>
      <h3>{renderTitle(title)}</h3>
      {tasks.map((task) => (
        <div key={task.id} style={styles.task}>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Due Date:</strong> {task.dueDate}</p>

          <div style={styles.progressBar}>
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
            <div style={styles.dependencies}>
              <strong>Depends on:</strong>
              <ul>
                {task.dependencies.map((dep) => (
                  <li key={dep}>Task {dep}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.actions}>
            <button onClick={() => onEditTask(task)} style={styles.edit}>✏️</button>
            {title !== "To-Do" && (
              <button onClick={() => onMoveTask(task, "left")} style={styles.arrow}>←</button>
            )}
            {title !== "Done" && (
              <button onClick={() => onMoveTask(task, "right")} style={styles.arrow}>→</button>
            )}
            <button onClick={() => onDeleteTask(task.id)} style={styles.delete}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  list: { width: "30%", background: "#e0e0e0", padding: "15px", borderRadius: "10px" },
  task: { background: "#fff", padding: "15px", margin: "10px 0", borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" },
  actions: { display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px" },
  edit: { background: "#007bff", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  delete: { background: "#dc3545", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  arrow: { background: "#6c757d", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },

  progressBar: { width: "100%", height: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px", marginTop: "10px" },
  progressBarFilled: { height: "100%", backgroundColor: "#28a745", borderRadius: "5px" },
  progressText: { fontSize: "0.875rem", marginTop: "5px" },

  timeInfo: { fontSize: "0.875rem", color: "#555", marginTop: "5px" },

  dependencies: { fontSize: "0.875rem", color: "#777", marginTop: "10px" },
};

export default AdminTaskList;
