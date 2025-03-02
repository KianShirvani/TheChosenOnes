import React, { useState, useEffect } from "react";
import TaskList from "./TaskList";
import AddTask from "./AddTask";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";

const TaskBoard = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [taskListColors, setTaskListColors] = useState({
    todo: "#e0e0e0",
    inProgress: "#e0e0e0",
    done: "#e0e0e0",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  
  const fetchTasks = async () => {
    try {
      console.log("Fetching tasks...");
      const response = await fetch("http://localhost:5001/api/tasks");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Fetched tasks:", data);
      setTasks({
        todo: data.todo || [],
        inProgress: data.inProgress || [],
        done: data.done || [],
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSaveTask = async (taskData) => {
    console.log("🔍 Sending Task Data:", JSON.stringify(taskData));
  
  
    if (!taskData.title.trim() || !taskData.description.trim() || !taskData.priority || !taskData.dueDate) {
      console.error("❌ Missing fields:", taskData);
      console.log("🔍 Sending Task Data:", JSON.stringify(updatedTaskData));
      return;
    }
  

    const updatedTaskData = {
      ...taskData,
      id: editingTask ? editingTask.id : undefined, 
    };
  
    try {
      let response;
  
      if (editingTask) {
        console.log("Updating task with ID:", editingTask.id);
        response = await fetch(`http://localhost:5001/api/tasks/${updatedTaskData.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json" 
          },
          credentials: "include",
          body: JSON.stringify(updatedTaskData)
          
        });
      } else {
        response = await fetch("http://localhost:5001/api/tasks", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json" 
          },
          credentials: "include",
          body: JSON.stringify(updatedTaskData)
        });
      }
  
      const result = await response.json();
      console.log("📩 Response from server:", result);
      
      if (response.ok) {
        console.log("✅ Task saved successfully:", result.task);
        setIsModalOpen(false);
        setEditingTask(null);
        fetchTasks(); 
      } else {
        console.error("❌ Error saving task:", result.message);
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
    }
  };
  
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    console.log("Trying to delete task with ID:", taskId); 
    if (!taskId) {
      console.error("Error: taskId is undefined or null!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        console.log("Task deleted successfully");

        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          Object.keys(updatedTasks).forEach((status) => {
            updatedTasks[status] = updatedTasks[status].filter((task) => task.id !== taskId);
          });
          console.log("Updated tasks:", updatedTasks);
          return updatedTasks;
        });
      } else {
        const result = await response.json();
        console.error("Error deleting task:", result.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
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

  const handleAssignColor = (status, color) => {
    setTaskListColors((prevColors) => ({
      ...prevColors,
      [status]: color,
    }));
  };

  return (
    <div style={styles.container}>
      <h2>Task Board</h2>
      <SearchBar />
      <div style={styles.buttonContainer}>
        <button onClick={() => navigate("/admindashboard")} style={styles.adminButton}>Admin Dashboard</button>
        <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>+ Add Task</button>
      </div>

      {isModalOpen && <AddTask task={editingTask} onSaveTask={handleSaveTask} onClose={() => setIsModalOpen(false)} />}

      <div style={styles.board}>
        <TaskList
          title="To-Do"
          tasks={tasks.todo}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.todo}
          onAssignColor={(color) => handleAssignColor("todo", color)}
        />
        <TaskList
          title="In Progress"
          tasks={tasks.inProgress}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.inProgress}
          onAssignColor={(color) => handleAssignColor("inProgress", color)}
        />
        <TaskList
          title="Done"
          tasks={tasks.done}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
          selectedColor={taskListColors.done}
          onAssignColor={(color) => handleAssignColor("done", color)}
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
