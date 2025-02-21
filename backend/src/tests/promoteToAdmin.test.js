const request = require('supertest');
const express = require('express');
const { promoteToAdmin } = require('../controllers/adminController');
const { validateAdmin } = require('../middlewares/validateAdmin');

// Dependencies
require('dotenv').config();

// Setup for testing
const app = express();
app.use(express.json());
app.post('/promote', validateAdmin, promoteToAdmin);

// Mock pg
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

let mockClient;

beforeEach(() => {
    // Setup mock implementation for pg client queries
    mockClient = new (require('pg').Client)(); // Mock Client instance
    mockClient.query.mockReset(); // Reset before each query

    // Mock database query to check if user exists
    mockClient.query.mockImplementation((query, values) => {
        if (query.includes('SELECT * FROM users WHERE user_id')) {
            if (values[0] === 'existingUser') {
                return Promise.resolve({ rows: [{ user_id: 'existingUser' }] });
            } else {
                return Promise.resolve({ rows: [] });
            }
        }
        if (query.includes('SELECT * FROM admins WHERE admin_id')) {
            if (values[0] === 'existingAdmin') {
                return Promise.resolve({ rows: [{ admin_id: 'existingAdmin' }] });
            } else {
                return Promise.resolve({ rows: [] });
            }
        }
        if (query.includes('INSERT INTO admins')) {
            return Promise.resolve({ rows: [{ admin_id: values[0] }] });
        }
        return Promise.resolve({ rows: [] });
    });
});

// Mock validateAdmin middleware
jest.mock('../middlewares/validateAdmin', () => {
    return {
        validateAdmin: (req, res, next) => {
            // Simulate that the user performing the promotion is an admin
            return next();
        }
    };
});

// Tests
describe('POST /promote', () => {
    // Test case: Promotion should fail if user does not exist
    test('Should return error when user does not exist', async () => {
        const res = await request(app)
            .post('/promote')
            .send({ userId: 'nonExistingUser' });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('User not found');
    });

    // Test case: Promotion should fail if user is already an admin
    test('Should return error if user is already an admin', async () => {
        mockClient.query.mockImplementationOnce((query, values) => {
            if (query.includes('SELECT * FROM users WHERE user_id')) {
                return Promise.resolve({ rows: [{ user_id: 'existingAdmin' }] });
            }
            if (query.includes('SELECT * FROM admins WHERE admin_id')) {
                return Promise.resolve({ rows: [{ admin_id: 'existingAdmin' }] });
            }
            return Promise.resolve({ rows: [] });
        });

        const res = await request(app)
            .post('/promote')
            .send({ userId: 'existingAdmin' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('User is already an admin');
    });

    // Test case: Promotion should succeed if user exists and is not already an admin
    test('Should promote user to admin successfully', async () => {
        mockClient.query.mockImplementationOnce((query, values) => {
            if (query.includes('SELECT * FROM users WHERE user_id')) {
                return Promise.resolve({ rows: [{ user_id: 'existingUser' }] });
            }
            if (query.includes('SELECT * FROM admins WHERE admin_id')) {
                return Promise.resolve({ rows: [] });
            }
            if (query.includes('INSERT INTO admins')) {
                return Promise.resolve({ rows: [{ admin_id: 'existingUser' }] });
            }
            return Promise.resolve({ rows: [] });
        });

        const res = await request(app)
            .post('/promote')
            .send({ userId: 'existingUser' });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User promoted to admin successfully');
        expect(res.body.admin.id).toBe('existingUser');
    });
});