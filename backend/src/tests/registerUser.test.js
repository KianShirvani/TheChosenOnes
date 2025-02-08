// Dependencies
const request = require('supertest');
const express = require('express');
const { registerUser } = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateRegistration');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Setup for testing
const app = express();
app.use(express.json());
app.post('/register', validateRegistration, registerUser);

// Mock pg and bcrypt
jest.mock('pg', () => {  
    const mockClient = {
        query: jest.fn(),
        connect: jest.fn(),
        end: jest.fn(),
    };

    return {
        Client: jest.fn(() => mockClient),
    };
});

jest.mock('bcryptjs', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
}));

beforeEach(() => {
    // Setup mock implementation for pg client queries
    const mockClient = new (require('pg').Client)(); // Mock Client instance
    mockClient.query.mockReset(); // Reset before each query

    // Mock database query to check if email already exists
    mockClient.query.mockImplementation((query, values) => {
        if (query.includes('SELECT * FROM users WHERE email')) {
            if (values[0] === 'existing@email.com') {
                return Promise.resolve({
                    rows: [{ email: 'existing@email.com' }],
                });
            } else {
                return Promise.resolve({ rows: [] }); // No existing user
            }
        }
        if (query.includes('INSERT INTO users')) {
            return Promise.resolve({
                rows: [
                    {
                        user_id: 1,
                        first_name: values[0],
                        last_name: values[1],
                        email: values[2],
                        phone_num: values[3],
                        country: values[4],
                        display_name: values[5],
                        created_at: '2025-02-07T14:10:45Z',
                    },
                ],
            });
        }
        return Promise.resolve({ rows: [] });
    });

    // Mock bcrypt methods for password hashing
    bcrypt.genSalt.mockImplementation(() => Promise.resolve('salt'));
    bcrypt.hash.mockImplementation(() => Promise.resolve('hashed_password'));
});

// Tests
describe('POST /register', () => {
    // Test for missing fields
    test('Should return error for missing fields', async () => {
        const res = await request(app)
            .post('/register')
            .send({ email: 'valid@email.com', password: 'password123' });

        expect(res.statusCode).toBe(400);
    });

    // Test for existing email in the database
    test('Should return error for existing email', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                first_name: 'John',
                last_name: 'Doe',
                email: 'existing@email.com',
                phone_num: '1234567890',
                country: 'USA',
                display_name: 'john_doe',
                password: 'password123',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Email already in use');
    });

    // Test for successful registration
    test('Should return success for successful registration', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'new@email.com',
                phone_num: '0987654321',
                country: 'USA',
                display_name: 'jane_doe',
                password: 'password123',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(res.body.user).toEqual({
            id: 1,
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'new@email.com',
            phone_num: '0987654321',
            country: 'USA',
            display_name: 'jane_doe',
            created_at: '2025-02-07T14:10:45Z',
        });
    });

    // Test for internal server error (database error)
    test('Should return error for internal server error', async () => {
        const mockClient = new (require('pg').Client)();
        mockClient.query.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app)
            .post('/register')
            .send({
                first_name: 'Error',
                last_name: 'User',
                email: 'error@email.com',
                phone_num: '123123123',
                country: 'USA',
                display_name: 'error_user',
                password: 'password123',
            });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'Internal Server Error');
    });
});