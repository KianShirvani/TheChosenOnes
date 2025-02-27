import React, { useState } from "react"; 

const TaskList = ({ title, tasks, onEditTask, onDeleteTask, onMoveTask, selectedColor, onAssignColor }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const colors = {
    Default: "#e0e0e0",
    Red: "red",
    Green: "green",
    Yellow: "yellow",
    Purple: "purple",
    Black: "black",
    White: "white",
    Grey: "grey"
  };

  // Find the color name from the colors object based on the current selectedColor
  const getSelectedColorName = () => {
    return Object.keys(colors).find((key) => colors[key] === selectedColor) || "Default";
  };

  return (
    <div style={{ ...styles.list, background: selectedColor }}>
      <div style={styles.header}>
        <h3>{title}</h3>
        <button onClick={() => setShowDropdown(!showDropdown)} style={styles.assignColorButton}>Assign Color</button>
      </div>

      {showDropdown && (
        <select
          value={getSelectedColorName()}  // Set value dynamically to match the selected color
          onChange={(e) => {
            const selectedOption = e.target.value;
            const newColor = colors[selectedOption] || "#e0e0e0"; // Ensure it resets to default grey
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

      {tasks.map((task) => (
        <div key={task.id} style={styles.task}>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Due Date:</strong> {task.dueDate}</p>

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
