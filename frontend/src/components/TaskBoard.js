import React, { useState } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";

const TaskBoard = () => {
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

  // ✅ allow users to delete tasks from **any** column
  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };

      // remove task from whichever column it belongs to
      Object.keys(updatedTasks).forEach((status) => {
        updatedTasks[status] = updatedTasks[status].filter((task) => task.id !== taskId);
      });

      return updatedTasks;
    });
  };

  return (
    <div style={styles.container}>
      <h2>Task Board</h2>
      <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>+ Add Task</button>

      {isModalOpen && <AddTask task={editingTask} onSaveTask={handleSaveTask} onClose={() => setIsModalOpen(false)} />}

      <div style={styles.board}>
        <TaskList title="To-Do" tasks={tasks.todo} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
        <TaskList title="In Progress" tasks={tasks.inProgress} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
        <TaskList title="Done" tasks={tasks.done} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
      </div>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "20px", position: "relative" },
  board: { display: "flex", justifyContent: "space-around", padding: "20px", background: "#f4f5f7" },
  addButton: { position: "absolute", right: "20px", top: "20px", padding: "10px 20px", fontSize: "16px", background: "#007bff", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }
};

export default TaskBoard;
