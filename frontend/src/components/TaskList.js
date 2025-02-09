import React from "react";

const TaskList = ({ title, tasks, onEditTask, onDeleteTask, onMoveTask }) => {
  return (
    <div style={styles.list}>
      <h3>{title}</h3>
      {tasks.map((task) => (
        <div key={task.id} style={styles.task}>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Due Date:</strong> {task.dueDate}</p>

          {/* buttons: edit (first), move left/right (middle), delete (last) */}
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
  task: { background: "#fff", padding: "10px", margin: "10px 0", borderRadius: "5px", boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" },
  actions: { display: "flex", justifyContent: "center", gap: "50px", marginTop: "10px" },
  edit: { background: "#007bff", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  delete: { background: "#dc3545", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" },
  arrow: { background: "#6c757d", color: "white", border: "none", padding: "10px 10px", cursor: "pointer", borderRadius: "5px" }
};

export default TaskList;
