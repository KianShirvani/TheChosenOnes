// dependencies
const request = require("supertest");
const express = require("express");
const taskRoutes = require("../routes/taskRoutes");
require('dotenv').config();

// setup for testing
const app = express();
app.use(express.json());
app.use("/api/tasks", taskRoutes);

jest.mock("pg", () => {
  const mockClient = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  return {
    Client: jest.fn(() => mockClient),
  };
});

// Declare mockClient and a variable to hold our mock database
const mockClient = require("../database/db");
let mockDatabase;

beforeEach(() => {
  // Initialize the mock database before each test
  mockDatabase = {
    tasks: [
      {
        task_id: "1",
        kanban_id: 1,
        user_id: 1,
        title: "Test Task",
        status: "todo",
        priority: 5,
        description: "Test description",
        due_date: "2025-12-31",
        progress: 50,
        startDate: "2025-01-01",
        endDate: "2025-12-30",
        locked: false,
      },
    ],
  };

  mockClient.query.mockReset();

  mockClient.query.mockImplementation((query, values) => {
    // Normalize query string to uppercase for case-insensitive matching.
    const q = query.toUpperCase();

    // 1. INSERT: catch any INSERT query into tasks.
    if (q.includes("INSERT INTO TASKS")) {
      const newTask = {
        id: (mockDatabase.tasks.length + 1).toString(),
        kanban_id: values[0],
        user_id: values[1],
        title: values[2],
        description: values[3],
        priority: values[4],
        due_date: values[5],
        status: values[6] || "todo",
        locked: false,
        start_date: values[6] || null,
        end_date: values[7] || null,
        progress: values[8] || 0,
      };
      mockDatabase.tasks.push(newTask);
      return Promise.resolve({ rows: [newTask], rowCount: 1 });
    }
  
    // 2. SELECT ALL: when the query is exactly "SELECT * FROM TASKS"
    if (q.trim() === "SELECT * FROM TASKS") {
      return Promise.resolve({
        rows: mockDatabase.tasks,
        rowCount: mockDatabase.tasks.length,
      });
    }
  
    // 3. DELETE: for queries starting with "DELETE FROM TASKS"
    if (q.startsWith("DELETE FROM TASKS")) {
      const index = mockDatabase.tasks.findIndex(
        (t) => String(t.id) === String(values[0])
      );
      if (index === -1) {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      mockDatabase.tasks.splice(index, 1);
      return Promise.resolve({ rows: [], rowCount: 1 });
    }
  
    // 4. SELECT by user_id: for queries like "SELECT * FROM TASKS WHERE USER_ID = $1"
    if (q.startsWith("SELECT") && q.includes("USER_ID =")) {
      const userVal = values && values[0] != null ? String(values[0]) : "";
      // Use a safe check so that if a task is missing user_id, it won’t cause an error.
      const tasksForUser = mockDatabase.tasks.filter(
        (t) => t && t.user_id != null && String(t.user_id) === userVal
      );
      return Promise.resolve({
        rows: tasksForUser,
        rowCount: tasksForUser.length,
      });
    }
  
    // 5. SELECT by id or task_id: for queries like "SELECT * FROM tasks WHERE ID = $1" or "WHERE TASK_ID = $1"
    if (q.startsWith("SELECT") && (q.includes("WHERE ID =") || q.includes("WHERE TASK_ID ="))) {
      const field = q.includes("WHERE TASK_ID =") ? "task_id" : "id";
      const task = mockDatabase.tasks.find((t) => String(t[field]) === String(values[0]));
      return Promise.resolve({
        rows: task ? [task] : [],
        rowCount: task ? 1 : 0,
      });
    }

    // 6. UPDATE locked status (for toggleLock)
    if (q.includes("UPDATE TASKS SET LOCKED")) {
      const task = mockDatabase.tasks.find(
        (t) => String(t.id) === String(values[1])
      );
      if (task) {
        task.locked = values[0];
        return Promise.resolve({ rows: [task], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }
  
    // 7. UPDATE task (updateTask and updateAssignedTask) that updates multiple fields (includes "TITLE =")
    if (q.includes("UPDATE TASKS SET TITLE =")) {
      const task = mockDatabase.tasks.find((t) => String(t.task_id) === String(values[5]));

      if (task) {
        task.title = values[0];
        task.description = values[1];
        task.priority = values[2];
        task.due_date = values[3];
        task.status = values[4];
        task.start_date = values[4] || null;
        task.end_date = values[5] || null;
        task.progress = values[6] || 0;
        return Promise.resolve({ rows: [task], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }
  
    // 8. UPDATE task for moveTask: update only the status (and does not include "TITLE =")
    if (q.includes("UPDATE TASKS SET STATUS =") && !q.includes("TITLE =")) {
      const task = mockDatabase.tasks.find(
        (t) => String(t.id) === String(values[1])
      );
      if (task) {
        task.status = values[0];
        return Promise.resolve({ rows: [task], rowCount: 1 });
      }
      return Promise.resolve({ rows: [], rowCount: 0 });
    }
  
    // 9. Default: return an empty result
    return Promise.resolve({ rows: [], rowCount: 0 });
  });
});

// Test POST /api/tasks
describe("POST /api/tasks", () => {
  test("Should create a new task", async () => {
    const newTask = {
      kanban_id: 1,
      user_id: 1,
      title: "Test Task",
      description: "Test description",
      priority: "5",
      due_date: "2025-12-31",
      start_date: "2025-01-01",
      end_date: "2025-12-30",
      progress: 50,
      status: "todo",
      locked: true,
    };    

    const res = await request(app)
      .post("/api/tasks")
      .send(newTask);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Task created successfully");
    expect(res.body.task).toHaveProperty("id");
  });

    test("Should return error for missing required fields", async () => {
      const newTask = { title: "", description: "", priority: "", due_date: "" };

    const res = await request(app)
      .post("/api/tasks")
      .send(newTask);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "All fields except status are required");
  });
});

// Test GET /api/tasks
describe("GET /api/tasks", () => {
  test("Should return all tasks", async () => {
    const res = await request(app).get("/api/tasks");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("tasks");
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });
});

// Test PUT /api/tasks/:taskId
describe("PUT /api/tasks/:taskId", () => {
  test("Should return error if task is not found", async () => {
    const updatedTask = {
      title: "Non-existent Task",
      description: "Non-existent description",
      priority: "1",
      due_date: "2025-10-10",
      status: "todo"
    };

    const res = await request(app)
      .put("/api/tasks/999")
      .send(updatedTask);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Task not found");
  });
});

// Test PUT /api/tasks/:taskId/lock
describe("PUT /api/tasks/:taskId/lock", () => {
  test("Should return error if task not found", async () => {
    const res = await request(app).put("/api/tasks/999/lock");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Task not found");
  });
});

// Test GET /api/tasks/assigned/:userId
describe("GET /api/tasks/assigned/:userId", () => {
  test("Should return assigned tasks for a user", async () => {
    const res = await request(app).get("/api/tasks/assigned/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("assignedTasks");
  });

  test("Should return 404 if user has no assigned tasks", async () => {
    const res = await request(app).get("/api/tasks/assigned/999");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No assigned tasks found for this user.");
  });
});

// Test PUT /api/tasks/assigned/:taskId
describe("PUT /api/tasks/assigned/:taskId", () => {
  test("Should update an assigned task", async () => {
    const updatedTask = {
      title: "Updated Task Title",
      description: "Updated Task Description",
      priority: "3",
      due_date: "2025-11-30",
      status: "inProgress"
    };

    const res = await request(app)
      .put("/api/tasks/assigned/1")
      .send(updatedTask);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task updated successfully");
    expect(res.body.task).toHaveProperty("title", "Updated Task Title");
  });

  test("Should return 404 if task is not found", async () => {
    const res = await request(app)
      .put("/api/tasks/assigned/999")
      .send({ title: "Non-existent Task", description: "desc", priority: "1", due_date: "2025-10-10", status: "todo" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Task not found");
  });

  test("Should return 403 if task is locked", async () => {
    // Set the task to locked before sending the update request
    mockDatabase.tasks[0].locked = true;

    const res = await request(app)
      .put("/api/tasks/assigned/1")
      .send({ 
        title: "Locked Task", 
        description: "Should not update", 
        priority: "Low", 
        due_date: "2025-10-10", 
        status: "todo" 
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Task is locked and cannot be updated.");
  });
});

// Test DELETE /api/tasks/:taskId
describe("DELETE /api/tasks/:taskId", () => {
  test("Should return error if task is not found", async () => {
    const res = await request(app).delete("/api/tasks/999");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Task not found");
  });
});

// Unit testing for assigning users, getting users, and removing users from tasks
describe("POST /api/tasks/:taskId/assign-users", () => {
  test("Should assign users to a task", async () => {
    const res = await request(app)
      .post("/api/tasks/1/assign-users")
      .send({ userIds: [1, 2] });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Users assigned to task successfully");
  });

  test("Should return error for missing userIds", async () => {
    const res = await request(app)
      .post("/api/tasks/1/assign-users")
      .send({ userIds: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User IDs must be a non-empty array");
  });
});

describe("GET /api/tasks/:taskId/users", () => {
  test("Should return assigned users for a task", async () => {
    const res = await request(app).get("/api/tasks/1/users");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("assignedUsers");
  });
});

describe("DELETE /api/tasks/:taskId/remove-users", () => {
  test("Should remove users from a task", async () => {
    const res = await request(app)
      .delete("/api/tasks/1/remove-users")
      .send({ userIds: [1] });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Users removed from task successfully");
  });

  test("Should return error for missing userIds", async () => {
    const res = await request(app)
      .delete("/api/tasks/1/remove-users")
      .send({ userIds: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User IDs must be a non-empty array");
  });
});

// Unit testing for the Task Filtering functionality
describe("GET /api/tasks/filter", () => {
  test("Should return all tasks when no filters are applied", async () => {
    const res = await request(app).get("/api/tasks");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("tasks");
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  test("Should filter tasks by user", async () => {
    const res = await request(app).get("/api/tasks/filter").query({ userId: "1" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("tasks");
    expect(res.body.tasks.length).toBeGreaterThan(0);
    res.body.tasks.forEach(task => {
      expect(task.user_id).toBe(1);
    });
  });

  test("Should return no tasks if no tasks match the filters", async () => {
    const res = await request(app).get("/api/tasks/filter").query({ dueDate: "2025-01-01", user: "999", priority: "1" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({"tasks": [] });
  });
});