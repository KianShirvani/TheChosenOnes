import React, { useState } from "react";

const TaskMenu = ({ task, status, onDeleteTask, onEditTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleEdit = () => {
    onEditTask(status, task.task_id, editedTask);
    setIsEditing(false);
    setIsOpen(false);
  };

  return (
    <div style={styles.menuContainer}>
      {/* 3-dot button */}
      <button onClick={() => setIsOpen(!isOpen)} style={styles.menuButton}>⋮</button>

      {isOpen && (
        <div style={styles.menu}>
          {isEditing ? (
            <div>
              <input type="text" value={editedTask.title} onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })} />
              <textarea value={editedTask.description} onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })} />
              <select value={editedTask.priority} onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}>
              <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
           <option value="Critical">Critical</option>
           <option value="Urgent">Urgent</option>
              </select>
              <input type="date" value={editedTask.date} onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })} />
              <button onClick={handleEdit} style={styles.saveButton}>Save</button>
            </div>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} style={styles.option}>Edit</button>
              <button onClick={() => onDeleteTask(status, task.task_id)} style={styles.deleteButton}>Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  menuContainer: { position: "absolute", right: "10px", top: "10px" },
  menuButton: { background: "none", border: "none", fontSize: "18px", cursor: "pointer" },
  menu: { background: "white", border: "1px solid #ccc", borderRadius: "5px", position: "absolute", right: "0", top: "30px", padding: "5px" },
  option: { display: "block", padding: "5px", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" },
  deleteButton: { background: "red", color: "white", padding: "5px", width: "100%", border: "none", cursor: "pointer", marginTop: "5px" },
  saveButton: { background: "green", color: "white", padding: "5px", width: "100%", border: "none", cursor: "pointer", marginTop: "5px" }
};

export default TaskMenu;
