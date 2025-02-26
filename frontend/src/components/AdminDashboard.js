import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminTaskList from "../components/AdminTaskList";
import SearchBar from "../components/SearchBar";
import EditTaskModal from "../components/EditTaskModal";
import AddTask from "../components/AddTask";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState({
    todo: [
      { 
        id: "1", 
        title: "Design UI", 
        description: "Create homepage layout", 
        priority: "High", 
        dueDate: "2025-03-10", 
        startDate: "2025-03-01", 
        endDate: "2025-03-10", 
        progress: 20, 
        status: "todo",
        dependencies: ["2: Fix login bug"],
        locked: false
      }
    ],
    inProgress: [
      { 
        id: "2", 
        title: "Fix login bug", 
        description: "Debug authentication issue", 
        priority: "Medium", 
        dueDate: "2025-03-12", 
        startDate: "2025-03-05", 
        endDate: "2025-03-12", 
        progress: 70, 
        status: "inProgress", 
        dependencies: [] ,
        locked: false
      }
    ],
    done: [
      { 
        id: "3", 
        title: "Deploy backend", 
        description: "Push backend to production", 
        priority: "Low", 
        dueDate: "2025-03-15", 
        startDate: "2025-03-01", 
        endDate: "2025-03-15", 
        progress: 100, 
        status: "done", 
        dependencies: [] ,
        locked: false
      }
    ]
  });

  const [taskStats, setTaskStats] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
    completedRate: 0,
    upcomingDue: null,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    updateTaskStats();
  }, [tasks]);

  const updateTaskStats = () => {
    const todo = tasks.todo.length;
    const inProgress = tasks.inProgress.length;
    const done = tasks.done.length;
    const total = todo + inProgress + done;
    const completedRate = total > 0 ? ((done / total) * 100).toFixed(1) : 0;

    const today = new Date();
    const upcomingDue = Object.values(tasks)
      .flat()
      .filter(task => new Date(task.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]?.dueDate || "No upcoming tasks";

    setTaskStats({ todo, inProgress, done, completedRate, upcomingDue });
  };
  
  const handleToggleLock = (taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
  
      Object.keys(updatedTasks).forEach((status) => {
        updatedTasks[status] = updatedTasks[status].map((task) =>
          task.id === taskId ? { ...task, locked: !task.locked } : task
        );
      });
  
      return updatedTasks;
    });
  };

  const handleMoveTask = (task, direction) => {
    //first check if task is locked before editing
    if (task.locked) return alert("This task is locked and cannot be edited.");
    //task is NOT locked so allow move
    const columnOrder = ["todo", "inProgress", "done"];
    const currentIndex = columnOrder.findIndex(status => tasks[status].some(t => t.id === task.id));

    if (currentIndex === -1) return;

    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= columnOrder.length) return;

    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[columnOrder[currentIndex]] = updatedTasks[columnOrder[currentIndex]].filter(t => t.id !== task.id);
      updatedTasks[columnOrder[newIndex]] = [...updatedTasks[columnOrder[newIndex]], { ...task, status: columnOrder[newIndex] }];
      return updatedTasks;
    });
  };
  const handleDeleteTask = (taskId) => {
    // Find the task in any of the task categories
    const task = Object.values(tasks).flat().find(task => task.id === taskId);
  
    // If task is locked, prevent deletion
    if (task.locked) return alert("This task is locked and cannot be deleted.");
  
    // Proceed with deletion if not locked
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      Object.keys(updatedTasks).forEach(status => {
        updatedTasks[status] = updatedTasks[status].filter(task => task.id !== taskId);
      });
      return updatedTasks;
    });
  };

  const handleEditTask = (task) => {
    //first check if task is locked before editing
    if (task.locked) return alert("This task is locked and cannot be edited.");
    //task is NOT locked so allow edits
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = (updatedTask) => {
    //first check if task is locked before editing
    if (updatedTask.locked) return alert("This task is locked and cannot be edited.");
    //task is NOT locked so allow update
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      Object.keys(updatedTasks).forEach(status => {
        updatedTasks[status] = updatedTasks[status].filter(task => task.id !== updatedTask.id);
      });
      updatedTasks[updatedTask.status] = [...updatedTasks[updatedTask.status], updatedTask];
      return updatedTasks;
    });
    setIsEditModalOpen(false);
  };

  const handleAddTask = (newTask) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [newTask.status]: [...prevTasks[newTask.status], { ...newTask, id: Date.now().toString() }],
    }));
    setIsAddModalOpen(false);
  };

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="add-task-container" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/adminManagement")}
          className="admin-management-button"
          style={{
            background: "green",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Admin Management
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="add-task-button"
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          + Add Task
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><h3>To-Do</h3><p>{taskStats.todo}</p></div>
        <div className="stat-card"><h3>In Progress</h3><p>{taskStats.inProgress}</p></div>
        <div className="stat-card"><h3>Done</h3><p>{taskStats.done}</p></div>
        <div className="stat-card"><h3>Completion Rate</h3><p>{taskStats.completedRate}%</p></div>
        <div className="stat-card"><h3>Upcoming Due</h3><p>{taskStats.upcomingDue}</p></div>
      </div>

      <SearchBar />

      <div className="task-board">
        {Object.keys(tasks).map((status) => (
          <AdminTaskList
            key={status}
            title={status}
            tasks={tasks[status]}
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleLock={handleToggleLock}
          />
        ))}
      </div>

      {isAddModalOpen && <AddTask onSaveTask={handleAddTask} onClose={() => setIsAddModalOpen(false)} />}
      {isEditModalOpen && <EditTaskModal task={editingTask} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateTask} />}
    </div>
  );
};

export default AdminDashboard;
