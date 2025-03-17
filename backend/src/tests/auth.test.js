// test the auth functionality

// dependencies
const request = require("supertest");
const express = require("express");
const { loginUser, resetPassword } = require("../controllers/authController");
const bcrypt = require("bcryptjs");
require('dotenv').config();

// setup for testing
const app = express();
app.use(express.json());
app.post("/auth/login", loginUser);
app.post("/auth/reset-password", resetPassword);
// Set the JWT_SECRET for testing
process.env.JWT_SECRET = 'your_secret_key';

// mock pg client (to not use the real database)
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

// mock the encryption and other dependencies
jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
    genSalt: jest.fn(),
    hash: jest.fn(),
}));

beforeEach(() => {
    // setup mock implementation for the query method
    const mockClient = require("../database/db"); // mock Client instance
    mockClient.query.mockReset(); // reset before each query

    // mock database query to return a user
    mockClient.query.mockImplementation((query, values) => {
    if (query.includes("SELECT * FROM users WHERE email")) {
        if (values[0] === "valid@email.com") {
            return Promise.resolve({
                rows: [{ id: 1, email: "valid@email.com", password: "hashed_password" }]
            });
            } else {
            // no user found
            return Promise.resolve({ rows: [] });
            }
        }
        if (query.includes("SELECT * FROM password_resets WHERE token")) {
            if (values[0] === "valid_token") {
                return Promise.resolve({
                    rows: [{ user_id: 1 }]
                });
            } else {
                // no token found
                return Promise.resolve({ rows: [] });
            }
        }
        return Promise.resolve({ rows: [] });
    });

    // mock password comparison
    bcrypt.compare.mockImplementation((password, hashedPassword) => {
        if (
            (password === "valid_password" && hashedPassword === "hashed_password")
        ) { return Promise.resolve(true);
        }
        return Promise.resolve(false);
    });

    // mock password hashing
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashed_new_password");
});

// the tests
describe("POST /auth/login", () => {
    // test for valid credentials
    test("Should return a token for valid credentials", async () => {
        const res = await request(app).post("/auth/login").send({email: "valid@email.com", password: "valid_password"});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    // test for invalid email
    test("Should return error for invalid email", async () => {
        const res = await request(app).post("/auth/login").send({email: "invalid@email.com", password: "valid_password"});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid Credentials");
    });

    // test for wrong password
    test("Should return error for wrong password", async () => {
        const res = await request(app).post("/auth/login").send({email: "valid@email.com", password: "wrong_password"});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid Credentials");
    });

    // test for missing fields
    test("Should return validation error for missing fields", async () => {
        const res = await request(app).post("/auth/login").send({email: "" });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error");
    });
});

describe("POST /auth/reset-password", () => {
    // test for invalid or expired token
    test("Should return error if token is invalid or expired", async () => {
        const res = await request(app).post("/auth/reset-password").send({token: "invalid_token", newPassword: "new_password"});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Password reset token is invalid or has expired");
    });

    // test for successful password reset
    test("Should return success message if password is reset successfully", async () => {
        const res = await request(app).post("/auth/reset-password").send({token: "valid_token", newPassword: "new_password"});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Password has been reset");
    });
});