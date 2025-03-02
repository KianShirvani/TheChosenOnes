// dependencies
const request = require("supertest");
const express = require("express");
const taskRoutes = require("../routes/taskRoutes");
const { Client } = require("pg");
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


  beforeEach(() => {
    const mockClient = new (require("pg").Client)();
    mockClient.query.mockReset();
  
    mockClient.query.mockImplementation((query, values) => {
      if (query.includes("SELECT * FROM tasks WHERE id")) {
        if (values[0] === "1") {  // Ensure task with id '1' exists
          return Promise.resolve({
            rows: [{
              id: "1", 
              title: "Test Task", 
              status: "todo", 
              description: "Test description",
              dueDate: "2025-12-31", 
              progress: 50, 
              startDate: "2025-01-01", 
              endDate: "2025-12-30"
            }],
          });
        }
        return Promise.resolve({ rows: [] });  // Task not found
      }
      return Promise.resolve({ rows: [] });
    });
  });


describe("POST /api/tasks", () => {
    test("Should create a new task", async () => {
      const newTask = {
        title: "Test Task",
        description: "Test description",
        priority: "High",
        dueDate: "2025-12-31",
        startDate: "2025-01-01",
        endDate: "2025-12-30",
        progress: 50,
        status: "todo",
      };
  
      const res = await request(app)
        .post("/api/tasks")
        .send(newTask);
  
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Task created successfully");
      expect(res.body.task).toHaveProperty("id");
    });
  
    test("Should return error for missing required fields", async () => {
      const newTask = { title: "", description: "", priority: "", dueDate: "" };
  
      const res = await request(app)
        .post("/api/tasks")
        .send(newTask);
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "All fields except status are required");
    });
  });
  
  describe("GET /api/tasks", () => {
    test("Should return all tasks", async () => {
      const res = await request(app).get("/api/tasks");
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("todo");
      expect(res.body.todo.length).toBeGreaterThan(0);
    });
  });
  
  describe("PUT /api/tasks/:taskId", () => {

    test("Should return error if task is not found", async () => {
      const updatedTask = {
        title: "Non-existent Task",
        description: "Non-existent description",
      };
  
      const res = await request(app)
        .put("/api/tasks/999")
        .send(updatedTask);
  
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Task not found");
    });
  });
     
  
  
  describe("PUT /api/tasks/:taskId/lock", () => {
  
    test("Should return error if task not found", async () => {
      const res = await request(app).put("/api/tasks/999/lock");
  
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Task not found");
    });
  });
  
  
  describe("DELETE /api/tasks/:taskId", () => {
  
    test("Should return error if task is not found", async () => {
      const res = await request(app).delete("/api/tasks/999");
  
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Task not found");
    });
  });
