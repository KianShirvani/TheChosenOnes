import React, { useState } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";

const TaskBoard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({
    todo: [{ id: "1", title: "Design UI", description: "Create homepage layout", priority: "High", dueDate: "2025-02-10" }],
    inProgress: [{ id: "2", title: "Fix login bug", description: "Debug authentication issue", priority: "Medium", dueDate: "2025-02-12" }],
    done: [{ id: "3", title: "Deploy backend", description: "Push backend to production", priority: "Low", dueDate: "2025-02-15" }],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleSaveTask = (taskData) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };

      if (editingTask) {
        Object.keys(updatedTasks).forEach((status) => {
          updatedTasks[status] = updatedTasks[status].filter((task) => task.id !== editingTask.id);
        });
        const newStatus = taskData.status || "todo";
        updatedTasks[newStatus] = [...(updatedTasks[newStatus] || []), { ...taskData, id: editingTask.id }];
      } else {
        const newStatus = taskData.status || "todo";
        updatedTasks[newStatus] = [...(updatedTasks[newStatus] || []), { ...taskData, id: Date.now().toString() }];
      }

      return updatedTasks;
    });

    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      Object.keys(updatedTasks).forEach((status) => {
        updatedTasks[status] = updatedTasks[status].filter((task) => task.id !== taskId);
      });
      return updatedTasks;
    });
  };

  const handleMoveTask = (task, direction) => {
    const columnOrder = ["todo", "inProgress", "done"];
    const currentIndex = columnOrder.indexOf(
      Object.keys(tasks).find((status) => tasks[status].some((t) => t.id === task.id))
    );

    if (currentIndex === -1) return;

    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= columnOrder.length) return;

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[columnOrder[currentIndex]] = updatedTasks[columnOrder[currentIndex]].filter((t) => t.id !== task.id);
      updatedTasks[columnOrder[newIndex]] = [...updatedTasks[columnOrder[newIndex]], task];
      return updatedTasks;
    });
  };

  return (
    <div style={styles.container}>
      <h2>Task Board</h2>
      <SearchBar />
      <div style={styles.buttonContainer}>
          {/* Check the database to verify if the user is an admin before allowing access to the Admin Dashboard */}
        <button onClick={() => navigate("/admindashboard")} style={styles.adminButton}>Admin Dashboard</button>
        <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>+ Add Task</button>
      </div>

      {isModalOpen && <AddTask task={editingTask} onSaveTask={handleSaveTask} onClose={() => setIsModalOpen(false)} />}

      <div style={styles.board}>
        <TaskList title="To-Do" tasks={tasks.todo} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onMoveTask={handleMoveTask} />
        <TaskList title="In Progress" tasks={tasks.inProgress} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onMoveTask={handleMoveTask} />
        <TaskList title="Done" tasks={tasks.done} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onMoveTask={handleMoveTask} />
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
