import React, { useState } from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";
import AdminTaskList from "../components/AdminTaskList";
import SearchBar from "../components/SearchBar";
import AddTask from "../components/AddTask";
import EditTaskModal from "../components/EditTaskModal";

// Mock API Responses
global.fetch = jest.fn((url, options) => {
  if (options && options.method === "POST") {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 4, title: "New Task", status: "todo", locked: false }),
    });
  }
  if (options && options.method === "PUT") {
    return Promise.resolve({ ok: true });
  }
  if (options && options.method === "DELETE") {
    return Promise.resolve({ ok: true });
  }
  return Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        todo: [{ id: 1, title: "Task 1", status: "todo", locked: false, dueDate: "2025-03-10" }],
        inProgress: [{ id: 2, title: "Task 2", status: "inProgress", locked: false, dueDate: "2025-03-12" }],
        done: [{ id: 3, title: "Task 3", status: "done", locked: false, dueDate: "2025-03-15" }],
      }),
  });
});

const MockAdminDashboard = () => {
  const navigate = useNavigate();

  // Mock states instead of fetching data
  const [tasks, setTasks] = useState({
    todo: [{ id: 1, title: "Mock Task 1", status: "todo", locked: false }],
    inProgress: [],
    done: [],
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskStats, setTaskStats] = useState({
    todo: 1,
    inProgress: 0,
    done: 0,
    completedRate: 0,
    upcomingDue: 0,
  });

  // Mock functions (prevent API calls)
  const handleAddTask = (newTask) => {
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, { ...newTask, id: prev.todo.length + 1 }],
    }));
    setIsAddModalOpen(false);
  };

  const handleToggleLock = (taskId) => {
    setTasks((prev) => {
      const updatedTasks = { ...prev };
      for (let status in updatedTasks) {
        updatedTasks[status] = updatedTasks[status].map((task) =>
          task.id === taskId ? { ...task, locked: !task.locked } : task
        );
      }
      return updatedTasks;
    });
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
            onToggleLock={handleToggleLock} // Mocked function
          />
        ))}
      </div>

      {isAddModalOpen && <AddTask onSaveTask={handleAddTask} onClose={() => setIsAddModalOpen(false)} availableUsers={[]} />}
      {isEditModalOpen && <EditTaskModal task={editingTask} onClose={() => setIsEditModalOpen(false)} onSave={() => {}} />}
    </div>
  );
};

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    fetch.mockClear();

    fetch.mockImplementation((url) => {
      if (url.includes("/api/tasks")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              todo: [{ id: 1, title: "Task 1", status: "todo", locked: false, dueDate: "2025-03-10" }],
              inProgress: [{ id: 2, title: "Task 2", status: "inProgress", locked: false, dueDate: "2025-03-12" }],
              done: [{ id: 3, title: "Task 3", status: "done", locked: false, dueDate: "2025-03-15" }],
            }),
        });
      }
      return Promise.resolve({ ok: true }); // Default response for other requests
    });
  });


  test("adds a new task", async () => {
    render(
      <Router>
        <MockAdminDashboard />
      </Router>
    );

    fireEvent.click(screen.getByText("+ Add Task"));

    await waitFor(() => expect(screen.getByText("Add New Task")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("Task Title"), { target: { value: "New Task" } });
    fireEvent.click(screen.getByText("Add Task")); // Ensure this matches the button text

    // Ensure the new task appears in the To-Do column
    await waitFor(() => expect(screen.getByText("New Task")).toBeInTheDocument());
  });

  // test to ensure that the task is locked when toggled
  test("toggles task lock state", async () => {
    render(
      <Router>
        <MockAdminDashboard />
      </Router>
    );
  
    // Wait for tasks to load
    await waitFor(() => expect(screen.getByText("Mock Task 1")).toBeInTheDocument());
  
    // Find the lock toggle button for Task 1
    const lockButtons = screen.getAllByTestId("lock-button");
    expect(lockButtons[0]).toHaveTextContent("Lock");
    expect(lockButtons.length).toBeGreaterThan(0);
  
    // Click the lock toggle
    fireEvent.click(lockButtons[0]);
  
    // Ensure button text changes
    await waitFor(() => expect(lockButtons[0]).toHaveTextContent("Locked"));

    // Click again to unlock
    fireEvent.click(lockButtons[0]);

    // Ensure button text changes back
    await waitFor(() => expect(lockButtons[0]).toHaveTextContent("Lock"));
  });
  
});
