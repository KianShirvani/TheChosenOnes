// Dependencies
const request = require('supertest');
const express = require('express');
const { insertData } = require('../database/insertData');
const { Client } = require('pg');

// Setup for testing
const app = express();
app.get('/load-data', async (req, res) => {
    const result = await insertData();
    res.json(result);
});

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

// Mock insertData
jest.mock('../database/insertData', () => ({
    insertData: jest.fn(),
}));

beforeEach(() => {
    // Reset mocks before each test
    insertData.mockReset();

    // Setup mock implementation for pg client queries
    const mockClient = new (require('pg').Client)(); // Mock Client instance
    mockClient.query.mockReset(); // Reset before each query

    // Mock queries
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
                        userId: 1,
                        firstName: values[0],
                        lastName: values[1],
                        email: values[2],
                        phoneNum: values[3],
                        country: values[4],
                        displayName: values[5]
                    },
                ],
            });
        }
        return Promise.resolve({ rows: [] });
    });
});

// Tests
describe('GET /load-data', () => {
    it('should return success when data is inserted successfully', async () => {
        // Mock insertData to return success
        insertData.mockResolvedValue({ success: true });

        // Make the GET request
        const res = await request(app).get('/load-data');

        // Assert success response
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should return error when insertData fails', async () => {
        // Mock insertData to simulate an error
        insertData.mockResolvedValue({ success: false, error: 'Database error' });

        // Make the GET request
        const res = await request(app).get('/load-data');

        // Assert error response
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Database error');
    });

    it('should not insert Arnold and Bob if they already exist', async () => {
        // Mock database query for already existing users
        const mockClient = new (require('pg').Client)();
        mockClient.query
            .mockResolvedValueOnce({ rows: [{ user_id: 1 }] }) // Arnold exists
            .mockResolvedValueOnce({ rows: [{ user_id: 2 }] }); // Bob exists

        // Mock insertData to succeed
        insertData.mockResolvedValue({ success: true });

        // Make the GET request
        const res = await request(app).get('/load-data');

        // Ensure no insertions are attempted
        expect(mockClient.query).not.toHaveBeenCalledWith(
            'INSERT INTO users (first_name, last_name, email, phone_num, country, display_name, password, confirm_password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            ['Arnold', 'Arnold', 'arnold@example.com', '250-500-5000', 'Canada', 'arnold', 'Password123', 'Password123']
        );
        expect(mockClient.query).not.toHaveBeenCalledWith(
            'INSERT INTO users (first_name, last_name, email, phone_num, country, display_name, password, confirm_password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            ['Bob', 'Bob', 'bob@example.com', '250-500-5001', 'Canada', 'bob', 'Password123', 'Password123']
        );

        // Assert success response
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
