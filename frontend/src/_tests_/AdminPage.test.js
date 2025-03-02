import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";

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
        <AdminDashboard />
      </Router>
    );

    fireEvent.click(screen.getByText("+ Add Task"));

    await waitFor(() => expect(screen.getByText("Add New Task")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("Task Title"), { target: { value: "New Task" } });
    fireEvent.click(screen.getByText("Add Task")); // Ensure this matches the button text

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  // test to ensure that the task is locked when toggled
  test("toggles task lock state", async () => {
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
  
    // Wait for tasks to load
    await waitFor(() => expect(screen.getByText("Task 1")).toBeInTheDocument());
  
    // Find the lock toggle button for Task 1
    const lockButtons = screen.getAllByTestId("lock-button");
    expect(lockButtons.length).toBeGreaterThan(0);
  
    // Click the lock toggle
    fireEvent.click(lockButtons[0]);
  
    // Wait for state to update
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:5001/api/tasks",);
    });

    await waitFor(() => {
      expect(lockButtons[0]).toHaveTextContent("🔒");
    });
  });
  
});
