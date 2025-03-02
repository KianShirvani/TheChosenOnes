const request = require('supertest');
const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const { Client } = require('pg');

// Mock pg client (not using real database in tests)
jest.mock('pg', () => {
    const mockClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
    };
    return { Client: jest.fn(() => mockClient) };
});

const app = express();
app.use(express.json());
app.get('/admin/stats', getAdminStats);

describe('GET /admin/stats', () => {
    let client;

    beforeAll(() => {
        client = new Client();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test case: Admin stats should be returned correctly when on Admin Dashboard
    test('should return admin stats successfully', async () => {
        client.query
            .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // toDoQuery
            .mockResolvedValueOnce({ rows: [{ count: '3' }] }) // inProgressQuery
            .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // doneQuery
            .mockResolvedValueOnce({ rows: [{ count: '4' }] }) // upcomingDueQuery
            .mockResolvedValueOnce({ rows: [{ due_date: '2023-12-01' }] }); // upcomingDueDateQuery

        const res = await request(app).get('/admin/stats');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            todo: 5,
            inProgress: 3,
            done: 2,
            completionRate: '20.00',
            upcomingDue: 4,
            upcomingDueDate: '2023-12-01',
        });
    });

    // Test case: The errors should be gracefully handled
    test('should handle errors gracefully', async () => {
        client.query.mockRejectedValueOnce(new Error('Database error'));

        const res = await request(app).get('/admin/stats');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing your request. Please try again later.',
        });
    });

    // Test case: If no data is present, then it should return zeros
    test('should return zero stats when no data is available', async () => {
        client.query
            .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // toDoQuery
            .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // inProgressQuery
            .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // doneQuery
            .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // upcomingDueQuery
            .mockResolvedValueOnce({ rows: [] }); // upcomingDueDateQuery

        const res = await request(app).get('/admin/stats');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            todo: 0,
            inProgress: 0,
            done: 0,
            completionRate: 0,
            upcomingDue: 0,
            upcomingDueDate: null,
        });
    });

    // Test case: Not all data is available for each task. Should handle it gracefully
    test('should handle partial data gracefully', async () => {
        client.query
            .mockResolvedValueOnce({ rows: [{ count: '5' }] }) // toDoQuery
            .mockResolvedValueOnce({ rows: [{ count: '3' }] }) // inProgressQuery
            .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // doneQuery
            .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // upcomingDueQuery
            .mockResolvedValueOnce({ rows: [] }); // upcomingDueDateQuery

        const res = await request(app).get('/admin/stats');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            todo: 5,
            inProgress: 3,
            done: 2,
            completionRate: '20.00',
            upcomingDue: 0,
            upcomingDueDate: null,
        });
    });
});