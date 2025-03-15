const request = require("supertest");
const express = require("express");
const { getUsers, updateUser, deleteUser } = require("../controllers/adminController");
const { authenticatedUser } = require("../middlewares/authMiddleware");
const { validateAdmin } = require("../middlewares/validateAdmin");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env.test" });

// Mock JWT so that token verification always returns a valid user.
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mocked-token"),
  verify: jest.fn(() => ({ userId: 1 })),
}));

// Mock the pg client
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

// Get instance of the mocked pg client.
const { Client } = require("pg");
const mockClient = new Client();

// Set up a minimal Express app mounting our admin endpoints.
const app = express();
app.use(express.json());
app.get("/api/admin/users", authenticatedUser, validateAdmin, getUsers);
app.put("/api/admin/update/:id", authenticatedUser, validateAdmin, updateUser);
app.delete("/api/admin/delete/:id", authenticatedUser, validateAdmin, deleteUser);

describe("Admin Controller Tests", () => {
  let mockToken;

  beforeAll(() => {
    // Generate a dummy token using our mocked jwt.sign.
    const mockToken = jwt.sign({ user_id: 1 }, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  beforeEach(() => {
    // Reset the query mock before each test.
    mockClient.query.mockReset();
  });

  test("GET /api/admin/users should return a list of users", async () => {
    // Setup dummy users to be returned.
    const dummyUsers = [
      {
        user_id: 2,
        first_name: "Test",
        last_name: "User",
        display_name: "testuser",
        email: "test@example.com",
        is_admin: false,
      },
    ];
    mockClient.query.mockResolvedValue({
      rows: dummyUsers,
      rowCount: dummyUsers.length,
    });

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(dummyUsers);
  });

  test("PUT /api/admin/update/:id should update user details", async () => {
    // Setup dummy updated user data.
    const updatedUser = {
      user_id: 2,
      first_name: "UpdatedName",
      last_name: "UpdatedLast",
      email: "updated@example.com",
    };
    mockClient.query.mockResolvedValue({
      rows: [updatedUser],
      rowCount: 1,
    });

    const res = await request(app)
      .put("/api/admin/update/2")
      .set("Authorization", `Bearer ${mockToken}`)
      .send({
        firstName: "UpdatedName",
        lastName: "UpdatedLast",
        email: "updated@example.com",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User details updated successfully");
    expect(res.body.user).toEqual(updatedUser);
  });

  test("DELETE /api/admin/delete/:id should delete a user", async () => {
    // Setup the dummy deletion response.
    const deletedUser = { user_id: 2 };
    mockClient.query.mockResolvedValue({
      rows: [deletedUser],
      rowCount: 1,
    });

    const res = await request(app)
      .delete("/api/admin/delete/2")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });
});
