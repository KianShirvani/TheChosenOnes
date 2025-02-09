import React from "react";

const TaskList = ({ title, tasks, onEditTask, onDeleteTask }) => {
  return (
    <div style={styles.column}>
      <h3>{title}</h3>
      {tasks.map((task) => (
        <div key={task.id} style={styles.task}>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Due Date:</strong> {task.dueDate}</p>
          <div style={styles.buttonContainer}>
            <button onClick={() => onEditTask(task)} style={styles.editButton}>Edit</button>
            <button onClick={() => onDeleteTask(task.id, title.toLowerCase().replace(" ", ""))} style={styles.deleteButton}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  column: { background: "#ddd", padding: "10px", width: "30%", borderRadius: "8px" },
  task: { background: "white", padding: "10px", margin: "10px 0", borderRadius: "5px" },
  buttonContainer: { display: "flex", justifyContent: "space-between", marginTop: "10px" },
  editButton: { background: "#007bff", color: "white", border: "none", padding: "5px", cursor: "pointer", borderRadius: "5px" },
  deleteButton: { background: "#dc3545", color: "white", border: "none", padding: "5px", cursor: "pointer", borderRadius: "5px" }
};

export default TaskList;
