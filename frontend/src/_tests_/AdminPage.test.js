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

  
});
