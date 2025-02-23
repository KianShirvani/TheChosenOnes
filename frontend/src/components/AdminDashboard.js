import React, { useState, useEffect } from "react";
import AdminTaskList from "../components/AdminTaskList";
import SearchBar from "../components/SearchBar";
import EditTaskModal from "../components/EditTaskModal";
import AddTask from "../components/AddTask";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
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
        dependencies: ["2: Fix login bug"]
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
        dependencies: [] 
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
        dependencies: [] 
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

  const handleMoveTask = (task, direction) => {
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
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      Object.keys(updatedTasks).forEach(status => {
        updatedTasks[status] = updatedTasks[status].filter(task => task.id !== taskId);
      });
      return updatedTasks;
    });
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = (updatedTask) => {
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
    setTasks(prevTasks => {
      return {
        ...prevTasks,
        [newTask.status]: [...prevTasks[newTask.status], { ...newTask, id: Date.now().toString() }],
      };
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      <div className="add-task-container" style={{ position: "relative" }}>
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
            position: "absolute",
            top: "-70px", 
            right: "-5px",
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
          />
        ))}
      </div>

      {isAddModalOpen && <AddTask onSaveTask={handleAddTask} onClose={() => setIsAddModalOpen(false)} />}
      {isEditModalOpen && <EditTaskModal task={editingTask} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateTask} />}
    </div>
  );
};

export default AdminDashboard;
